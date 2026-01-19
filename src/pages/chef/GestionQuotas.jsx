import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import {
  Save, AlertCircle, CheckCircle, Award, Hash, Infinity, ChevronRight
} from 'lucide-react';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';

/**
 * Page de gestion des quotas d'encadrement par le Chef de département
 * 3 modes disponibles : Par Grade, Fixe, Illimité
 */
const GestionQuotas = () => {
  const [modeSelectionne, setModeSelectionne] = useState(null); // 'grade', 'fixe', 'illimite'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [anneeAcademique, setAnneeAcademique] = useState('');

  // Configuration pour mode "Par Grade"
  const [quotasGrade, setQuotasGrade] = useState({
    'Professeur': '',
    'Maître de Conférences': '',
    'Chargé de Cours': '',
    'Assistant': '',
    'Maître Assistant': ''
  });

  // Configuration pour mode "Fixe"
  const [quotaFixe, setQuotaFixe] = useState('');

  // Grades disponibles
  const gradesDisponibles = [
    { key: 'Professeur', label: 'Professeur', icon: '👨‍🏫' },
    { key: 'Maître de Conférences', label: 'Maître de Conférences', icon: '🎓' },
    { key: 'Chargé de Cours', label: 'Chargé de Cours', icon: '📚' },
    { key: 'Assistant', label: 'Assistant', icon: '📝' },
    { key: 'Maître Assistant', label: 'Maître Assistant', icon: '🔬' }
  ];

  useEffect(() => {
    fetchAnneeAcademique();
  }, []);

  useEffect(() => {
    if (anneeAcademique) {
      chargerConfiguration();
    }
  }, [anneeAcademique]);

  const fetchAnneeAcademique = async () => {
    try {
      const response = await axios.get(ENDPOINTS.ANNEE_COURANTE);
      setAnneeAcademique(response.data.data.annee);
    } catch (error) {
      console.error('Erreur chargement année académique:', error);
    }
  };

  const chargerConfiguration = async () => {
    try {
      setLoading(true);

      // Charger la configuration actuelle des quotas
      const response = await axios.get(`${ENDPOINTS.CHOIX_CHEF_QUOTAS}?annee=${anneeAcademique}`);
      const data = response.data.data;

      // Déterminer le mode actuel en fonction des données
      if (data?.quotas_grade && data.quotas_grade.length > 0) {
        setModeSelectionne('grade');
        const quotasMap = {};
        data.quotas_grade.forEach(q => {
          quotasMap[q.grade_ens] = q.quota_max;
        });
        setQuotasGrade(prev => ({ ...prev, ...quotasMap }));
      } else if (data?.quota_fixe !== undefined && data.quota_fixe !== null) {
        setModeSelectionne('fixe');
        setQuotaFixe(data.quota_fixe);
      } else {
        // Mode illimité par défaut
        setModeSelectionne('illimite');
      }

    } catch (error) {
      console.error('Erreur chargement configuration:', error);
      afficherMessage('error', 'Erreur lors du chargement de la configuration');
      // Par défaut, mode illimité
      setModeSelectionne('illimite');
    } finally {
      setLoading(false);
    }
  };

  const afficherMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const sauvegarderConfiguration = async () => {
    try {
      setSaving(true);

      let configData = {
        annee_academique: anneeAcademique,
        mode: modeSelectionne
      };

      if (modeSelectionne === 'grade') {
        // Valider que tous les grades ont une valeur
        const quotasArray = [];
        for (const [grade, quota] of Object.entries(quotasGrade)) {
          if (quota !== '' && quota !== null && !isNaN(quota)) {
            quotasArray.push({
              grade_ens: grade,
              quota_max: parseInt(quota)
            });
          }
        }

        if (quotasArray.length === 0) {
          afficherMessage('error', 'Veuillez définir au moins un quota pour un grade');
          return;
        }

        configData.quotas_grade = quotasArray;

      } else if (modeSelectionne === 'fixe') {
        if (!quotaFixe || quotaFixe === '' || isNaN(quotaFixe)) {
          afficherMessage('error', 'Veuillez définir un quota fixe valide');
          return;
        }
        configData.quota_fixe = parseInt(quotaFixe);

      } else if (modeSelectionne === 'illimite') {
        configData.illimite = true;
      }

      // Envoyer la configuration au backend
      await axios.post(ENDPOINTS.CHOIX_CHEF_QUOTAS_SAVE_CONFIG || `${ENDPOINTS.CHOIX_CHEF_QUOTAS}/config`, configData);

      afficherMessage('success', 'Configuration des quotas enregistrée avec succès');

    } catch (error) {
      console.error('Erreur sauvegarde configuration:', error);
      afficherMessage('error', error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const changerMode = (nouveauMode) => {
    if (nouveauMode !== modeSelectionne) {
      // Réinitialiser les valeurs
      if (nouveauMode === 'grade') {
        setQuotasGrade({
          'Professeur': '',
          'Maître de Conférences': '',
          'Chargé de Cours': '',
          'Assistant': '',
          'Maître Assistant': ''
        });
      } else if (nouveauMode === 'fixe') {
        setQuotaFixe('');
      }
      setModeSelectionne(nouveauMode);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des Quotas d'Encadrement
          </h1>
          <p className="text-gray-600">
            Choisissez le mode de gestion des quotas pour l'année académique
          </p>
        </div>

        {/* Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* Année académique courante */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Configuration des quotas pour l'année académique
              </p>
              <p className="text-2xl font-bold text-blue-700">
                {anneeAcademique || 'Chargement...'}
              </p>
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-xs text-gray-500">
                Les quotas sont configurés pour l'année en cours
              </p>
            </div>
          </div>
        </div>

        {/* Sélection du mode - 3 cartes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Mode Par Grade */}
          <button
            onClick={() => changerMode('grade')}
            className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
              modeSelectionne === 'grade'
                ? 'border-blue-600 bg-blue-50 shadow-lg transform scale-105'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`p-4 rounded-full ${
                modeSelectionne === 'grade' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Award className={`w-8 h-8 ${
                  modeSelectionne === 'grade' ? 'text-blue-600' : 'text-gray-600'
                }`} />
              </div>
              <div>
                <h3 className={`text-lg font-bold mb-2 ${
                  modeSelectionne === 'grade' ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  Par Grade
                </h3>
                <p className="text-sm text-gray-600">
                  Définir un quota différent pour chaque grade d'enseignant
                </p>
              </div>
              {modeSelectionne === 'grade' && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              )}
            </div>
          </button>

          {/* Mode Fixe */}
          <button
            onClick={() => changerMode('fixe')}
            className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
              modeSelectionne === 'fixe'
                ? 'border-green-600 bg-green-50 shadow-lg transform scale-105'
                : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`p-4 rounded-full ${
                modeSelectionne === 'fixe' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <Hash className={`w-8 h-8 ${
                  modeSelectionne === 'fixe' ? 'text-green-600' : 'text-gray-600'
                }`} />
              </div>
              <div>
                <h3 className={`text-lg font-bold mb-2 ${
                  modeSelectionne === 'fixe' ? 'text-green-900' : 'text-gray-900'
                }`}>
                  Fixe
                </h3>
                <p className="text-sm text-gray-600">
                  Un même quota maximum pour tous les enseignants
                </p>
              </div>
              {modeSelectionne === 'fixe' && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              )}
            </div>
          </button>

          {/* Mode Illimité */}
          <button
            onClick={() => changerMode('illimite')}
            className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
              modeSelectionne === 'illimite'
                ? 'border-purple-600 bg-purple-50 shadow-lg transform scale-105'
                : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`p-4 rounded-full ${
                modeSelectionne === 'illimite' ? 'bg-purple-100' : 'bg-gray-100'
              }`}>
                <Infinity className={`w-8 h-8 ${
                  modeSelectionne === 'illimite' ? 'text-purple-600' : 'text-gray-600'
                }`} />
              </div>
              <div>
                <h3 className={`text-lg font-bold mb-2 ${
                  modeSelectionne === 'illimite' ? 'text-purple-900' : 'text-gray-900'
                }`}>
                  Illimité
                </h3>
                <p className="text-sm text-gray-600">
                  Aucune limitation sur le nombre d'encadrements
                </p>
              </div>
              {modeSelectionne === 'illimite' && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Panneau de configuration selon le mode */}
        {modeSelectionne && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Configuration Par Grade */}
            {modeSelectionne === 'grade' && (
              <div>
                <div className="flex items-center mb-6">
                  <Award className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Configuration des quotas par grade
                  </h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Définissez le nombre maximum d'étudiants que chaque grade peut encadrer.
                  Laissez vide si vous ne souhaitez pas limiter un grade particulier.
                </p>

                <div className="space-y-4">
                  {gradesDisponibles.map((grade) => (
                    <div key={grade.key} className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-2xl mr-4">{grade.icon}</span>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          {grade.label}
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="number"
                          min="0"
                          value={quotasGrade[grade.key]}
                          onChange={(e) => setQuotasGrade({ ...quotasGrade, [grade.key]: e.target.value })}
                          placeholder="Ex: 10"
                          className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="ml-3 text-gray-500 text-sm">étudiants max</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Configuration Fixe */}
            {modeSelectionne === 'fixe' && (
              <div>
                <div className="flex items-center mb-6">
                  <Hash className="w-6 h-6 text-green-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Configuration du quota fixe
                  </h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Tous les enseignants, quel que soit leur grade, pourront encadrer le même nombre maximum d'étudiants.
                </p>

                <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Nombre maximum d'étudiants par enseignant
                    </label>
                    <div className="flex items-center justify-center space-x-3">
                      <input
                        type="number"
                        min="1"
                        value={quotaFixe}
                        onChange={(e) => setQuotaFixe(e.target.value)}
                        placeholder="Ex: 8"
                        className="w-40 px-6 py-3 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <span className="text-lg text-gray-600">étudiants</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Configuration Illimité */}
            {modeSelectionne === 'illimite' && (
              <div>
                <div className="flex items-center mb-6">
                  <Infinity className="w-6 h-6 text-purple-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Mode illimité
                  </h2>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <Infinity className="w-8 h-8 text-purple-600 mr-4 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-purple-900 mb-2">
                        Aucune limitation d'encadrement
                      </h3>
                      <p className="text-purple-800 mb-4">
                        En sélectionnant ce mode, les enseignants pourront encadrer autant d'étudiants qu'ils le souhaitent,
                        sans aucune restriction de quota.
                      </p>
                      <ul className="space-y-2 text-sm text-purple-700">
                        <li className="flex items-center">
                          <ChevronRight className="w-4 h-4 mr-2" />
                          Aucune limite de nombre d'étudiants
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="w-4 h-4 mr-2" />
                          Flexibilité maximale pour les enseignants
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="w-4 h-4 mr-2" />
                          Idéal pour les périodes de transition ou petits effectifs
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bouton Sauvegarder */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={sauvegarderConfiguration}
                disabled={saving}
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Enregistrer la configuration
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Message d'information si aucun mode sélectionné */}
        {!modeSelectionne && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Sélectionnez un mode de gestion des quotas
            </h3>
            <p className="text-blue-700">
              Veuillez choisir l'un des trois modes ci-dessus pour configurer les quotas d'encadrement.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GestionQuotas;
