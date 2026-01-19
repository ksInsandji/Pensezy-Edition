import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Search,
  Award,
  Users,
  ChevronRight,
  Edit2,
  Trophy,
  Target,
  RefreshCw,
  Info
} from 'lucide-react';

export default function ChoixEncadreur() {
  const navigate = useNavigate();
  const [enseignants, setEnseignants] = useState([]);
  const [mesChoix, setMesChoix] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterSpecialite, setFilterSpecialite] = useState('');

  // États pour la sélection des choix
  const [selectedChoix, setSelectedChoix] = useState({
    choix1: null,
    choix2: null,
    choix3: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [enseignantsRes, choixRes] = await Promise.all([
        axios.get(ENDPOINTS.ETUDIANT_ENSEIGNANTS),
        axios.get(ENDPOINTS.ETUDIANT_MES_CHOIX).catch(() => ({ data: { data: null } }))
      ]);

      setEnseignants(enseignantsRes.data.data || []);

      const choixData = choixRes.data.data;
      if (choixData) {
        setMesChoix(choixData);
        // Si des choix existent, les charger
        if (!choixData.affectation_finale) {
          setSelectedChoix({
            choix1: choixData.choix1?.Matricule_Ens || null,
            choix2: choixData.choix2?.Matricule_Ens || null,
            choix3: choixData.choix3?.Matricule_Ens || null
          });
        } 
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Filtrage des enseignants
  const filteredEnseignants = enseignants.filter((ens) => {
    const matchesSearch =
      ens.Nom_Ens?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ens.Prenom_Ens?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = !filterGrade || ens.Grade_Ens === filterGrade;
    const matchesSpecialite = !filterSpecialite || ens.Specialite === filterSpecialite;
    return matchesSearch && matchesGrade && matchesSpecialite;
  });

  // Extraire les valeurs uniques pour les filtres
  const grades = [...new Set(enseignants.map((e) => e.Grade_Ens).filter(Boolean))];
  const specialites = [...new Set(enseignants.map((e) => e.Specialite).filter(Boolean))];

  // Vérifier si un enseignant est déjà sélectionné
  const isSelected = (matricule) => {
    return Object.values(selectedChoix).includes(matricule);
  };

  // Sélectionner un choix
  const handleSelectChoix = (matricule, niveau) => {
    // Vérifier si déjà sélectionné ailleurs
    const currentlySelected = Object.entries(selectedChoix).find(
      ([key, value]) => value === matricule
    );

    if (currentlySelected) {
      toast.warning('Cet enseignant est déjà sélectionné comme ' +
        (currentlySelected[0] === 'choix1' ? 'Choix 1' :
         currentlySelected[0] === 'choix2' ? 'Choix 2' : 'Choix 3'));
      return;
    }

    setSelectedChoix((prev) => ({
      ...prev,
      [niveau]: matricule
    }));
  };

  // Retirer un choix
  const handleRemoveChoix = (niveau) => {
    setSelectedChoix((prev) => ({
      ...prev,
      [niveau]: null
    }));
  };

  // Réorganiser les choix (swap)
  const handleSwapChoix = (niveau1, niveau2) => {
    setSelectedChoix((prev) => ({
      ...prev,
      [niveau1]: prev[niveau2],
      [niveau2]: prev[niveau1]
    }));
  };

  // Soumettre les choix
  const handleSubmit = async () => {
    // Validation
    if (!selectedChoix.choix1) {
      toast.warning('Vous devez sélectionner au moins votre premier choix');
      return;
    }

    // Confirmation
    const nbChoix = Object.values(selectedChoix).filter(Boolean).length;
    const message = `Vous êtes sur le point de soumettre ${nbChoix} choix d'encadreur(s). Confirmez-vous ?`;

    if (!window.confirm(message)) {
      return;
    }

    try {
      setSubmitting(true);

      // Construire le tableau de choix au format attendu par le backend
      const choixArray = [];

      if (selectedChoix.choix1) {
        choixArray.push({
          matricule_ens: selectedChoix.choix1,
          ordre_priorite: 1
        });
      }

      if (selectedChoix.choix2) {
        choixArray.push({
          matricule_ens: selectedChoix.choix2,
          ordre_priorite: 2
        });
      }

      if (selectedChoix.choix3) {
        choixArray.push({
          matricule_ens: selectedChoix.choix3,
          ordre_priorite: 3
        });
      }

      const payload = {
        choix: choixArray
      };

      // Vérifier si des choix existent déjà (pas seulement si mesChoix existe)
      const hasExistingChoix = mesChoix && (mesChoix.choix1 || mesChoix.choix2 || mesChoix.choix3);

      if (hasExistingChoix && !mesChoix.affectation_finale) {
        // Modification
        await axios.put(ENDPOINTS.ETUDIANT_MODIFIER_CHOIX, payload);
        toast.success('Vos choix ont été modifiés avec succès');
      } else {
        // Soumission initiale
        await axios.post(ENDPOINTS.ETUDIANT_SOUMETTRE_CHOIX, payload);
        toast.success('Vos choix ont été soumis avec succès');
      }

      navigate('/etudiant/dashboard');
    } catch (error) {
      console.error('Erreur détaillée:', error.response?.data);
      const message = error.response?.data?.message || 'Erreur lors de la soumission';

      // Afficher les erreurs de validation s'il y en a
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errors.forEach(err => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Obtenir les détails d'un enseignant
  const getEnseignantDetails = (matricule) => {
    return enseignants.find((e) => e.Matricule_Ens === matricule);
  };

  // Calculer la disponibilité
  const getDisponibilite = (ens) => {
    const quota = ens.quota_max || ens.Quota_Max;
    const encadres = ens.nb_encadrements_actuels || ens._count?.encadrements || 0;
    const disponible = quota - encadres;

    if (quota === 0 || quota === null || quota === undefined) {
      return { text: 'Illimité', color: 'green', pourcentage: 100 };
    }

    const pourcentage = (disponible / quota) * 100;

    if (pourcentage > 50) {
      return { text: `${disponible}/${quota}`, color: 'green', pourcentage };
    } else if (pourcentage > 20) {
      return { text: `${disponible}/${quota}`, color: 'orange', pourcentage };
    } else {
      return { text: `${disponible}/${quota}`, color: 'red', pourcentage };
    }
  };

  // Obtenir le statut d'un choix
  const getChoixStatus = (choixData) => {
    if (!choixData) return null;

    const statut = choixData.statut;
    if (statut === 'affecte') {
      return { text: 'Affecté', icon: CheckCircle, color: 'green' };
    } else if (statut === 'rejete') {
      return { text: 'Rejeté', icon: XCircle, color: 'red' };
    } else {
      return { text: 'En attente', icon: Clock, color: 'yellow' };
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

  // Affichage si affectation finale déjà faite
  if (mesChoix && mesChoix.affectation_finale) {
    const encadreur = mesChoix.affectation_finale.enseignant;
    const choixRetenu = mesChoix.affectation_finale.choix_retenu;

    return (
      <Layout>
        <div className="space-y-6">
          <Card>
            <div className="p-6 rounded-lg border-2 bg-green-50 border-green-300">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-green-600" />
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-900 mb-2">
                    Encadreur affecté
                  </h3>

                  <div className="bg-white p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-lg text-gray-900 mb-2">
                      {encadreur.Prenom_Ens} {encadreur.Nom_Ens}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Award className="w-4 h-4" />
                        <span>{encadreur.Grade_Ens}</span>
                      </div>
                      {encadreur.Specialite && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <GraduationCap className="w-4 h-4" />
                          <span>{encadreur.Specialite}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${encadreur.Email_Ens}`} className="text-primary-600 hover:underline">
                          {encadreur.Email_Ens}
                        </a>
                      </div>
                      {encadreur.Telephone_Ens && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{encadreur.Telephone_Ens}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {choixRetenu === 1 ? 'Votre 1er choix' :
                     choixRetenu === 2 ? 'Votre 2e choix' :
                     choixRetenu === 3 ? 'Votre 3e choix' :
                     'Affectation hors choix'}
                  </div>

                  <p className="text-sm text-gray-600 mt-4">
                    Contactez régulièrement votre encadreur pour le suivi de votre mémoire.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button onClick={() => navigate('/etudiant/dashboard')}>
                Retour au dashboard
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  // Affichage si choix déjà soumis mais modifiable
  if (mesChoix && !mesChoix.modifiable) {
    const status1 = mesChoix.choix1 ? getChoixStatus(mesChoix.choix1) : null;
    const status2 = mesChoix.choix2 ? getChoixStatus(mesChoix.choix2) : null;
    const status3 = mesChoix.choix3 ? getChoixStatus(mesChoix.choix3) : null;

    return (
      <Layout>
        <div className="space-y-6">
          <Card title="Vos choix d'encadreurs">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800">
                    Vos choix ont été soumis et sont en cours de traitement.
                    Vous ne pouvez plus les modifier pour le moment.
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    Date de soumission : {new Date(mesChoix.date_soumission).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Choix 1 */}
              {mesChoix.choix1 && (
                <div className="border-2 border-primary-300 rounded-lg p-4 bg-primary-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary-600" />
                      <span className="font-bold text-primary-900">Choix 1 - Préféré</span>
                    </div>
                    {status1 && (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${status1.color}-100 text-${status1.color}-800`}>
                        <status1.icon className="w-4 h-4" />
                        {status1.text}
                      </span>
                    )}
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900">
                      {mesChoix.choix1.enseignant.Prenom_Ens} {mesChoix.choix1.enseignant.Nom_Ens}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{mesChoix.choix1.enseignant.Grade_Ens}</p>
                    {mesChoix.choix1.enseignant.Specialite && (
                      <p className="text-sm text-gray-500 mt-1">{mesChoix.choix1.enseignant.Specialite}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Choix 2 */}
              {mesChoix.choix2 && (
                <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-blue-900">Choix 2 - Alternatif</span>
                    </div>
                    {status2 && (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${status2.color}-100 text-${status2.color}-800`}>
                        <status2.icon className="w-4 h-4" />
                        {status2.text}
                      </span>
                    )}
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900">
                      {mesChoix.choix2.enseignant.Prenom_Ens} {mesChoix.choix2.enseignant.Nom_Ens}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{mesChoix.choix2.enseignant.Grade_Ens}</p>
                    {mesChoix.choix2.enseignant.Specialite && (
                      <p className="text-sm text-gray-500 mt-1">{mesChoix.choix2.enseignant.Specialite}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Choix 3 */}
              {mesChoix.choix3 && (
                <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-600" />
                      <span className="font-bold text-gray-900">Choix 3 - Dernier recours</span>
                    </div>
                    {status3 && (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${status3.color}-100 text-${status3.color}-800`}>
                        <status3.icon className="w-4 h-4" />
                        {status3.text}
                      </span>
                    )}
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900">
                      {mesChoix.choix3.enseignant.Prenom_Ens} {mesChoix.choix3.enseignant.Nom_Ens}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{mesChoix.choix3.enseignant.Grade_Ens}</p>
                    {mesChoix.choix3.enseignant.Specialite && (
                      <p className="text-sm text-gray-500 mt-1">{mesChoix.choix3.enseignant.Specialite}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <Button onClick={() => navigate('/etudiant/dashboard')}>
                Retour au dashboard
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  // Interface de sélection des choix
  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête et instructions */}
        <Card>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  {mesChoix && mesChoix.modifiable ? 'Modifier vos choix d\'encadreurs' : 'Choisissez vos encadreurs'}
                </h3>
                <p className="text-sm text-blue-800 mb-2">
                  Sélectionnez jusqu'à 3 enseignants par ordre de préférence pour encadrer votre mémoire.
                </p>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Le choix 1 est obligatoire (votre encadreur préféré)</li>
                  <li>Les choix 2 et 3 sont optionnels mais recommandés</li>
                  <li>Vous ne pouvez pas sélectionner le même enseignant plusieurs fois</li>
                  <li>Vérifiez la disponibilité et la spécialité de chaque enseignant</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Panneau de sélection actuelle */}
        <Card title="Vos sélections">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Slot Choix 1 */}
            <div className="border-2 border-primary-300 rounded-lg p-4 bg-primary-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary-600" />
                  <span className="font-bold text-primary-900">Choix 1</span>
                </div>
                {selectedChoix.choix1 && (
                  <button
                    onClick={() => handleRemoveChoix('choix1')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
              {selectedChoix.choix1 ? (
                <div className="bg-white rounded-lg p-3">
                  {(() => {
                    const ens = getEnseignantDetails(selectedChoix.choix1);
                    return ens ? (
                      <>
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {ens.Prenom_Ens} {ens.Nom_Ens}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">{ens.Grade_Ens}</p>
                        <div className="mt-2 flex gap-1">
                          {selectedChoix.choix2 && (
                            <button
                              onClick={() => handleSwapChoix('choix1', 'choix2')}
                              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Swap 2
                            </button>
                          )}
                          {selectedChoix.choix3 && (
                            <button
                              onClick={() => handleSwapChoix('choix1', 'choix3')}
                              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Swap 3
                            </button>
                          )}
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-gray-500">
                  Cliquez sur "Choix 1" sur un enseignant
                </div>
              )}
            </div>

            {/* Slot Choix 2 */}
            <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-blue-900">Choix 2</span>
                </div>
                {selectedChoix.choix2 && (
                  <button
                    onClick={() => handleRemoveChoix('choix2')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
              {selectedChoix.choix2 ? (
                <div className="bg-white rounded-lg p-3">
                  {(() => {
                    const ens = getEnseignantDetails(selectedChoix.choix2);
                    return ens ? (
                      <>
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {ens.Prenom_Ens} {ens.Nom_Ens}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">{ens.Grade_Ens}</p>
                        <div className="mt-2 flex gap-1">
                          {selectedChoix.choix3 && (
                            <button
                              onClick={() => handleSwapChoix('choix2', 'choix3')}
                              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Swap 3
                            </button>
                          )}
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-gray-500">
                  Optionnel
                </div>
              )}
            </div>

            {/* Slot Choix 3 */}
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="font-bold text-gray-900">Choix 3</span>
                </div>
                {selectedChoix.choix3 && (
                  <button
                    onClick={() => handleRemoveChoix('choix3')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
              {selectedChoix.choix3 ? (
                <div className="bg-white rounded-lg p-3">
                  {(() => {
                    const ens = getEnseignantDetails(selectedChoix.choix3);
                    return ens ? (
                      <>
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {ens.Prenom_Ens} {ens.Nom_Ens}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">{ens.Grade_Ens}</p>
                      </>
                    ) : null;
                  })()}
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-gray-500">
                  Optionnel
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSubmit}
              loading={submitting}
              disabled={!selectedChoix.choix1 || submitting}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {mesChoix && mesChoix.modifiable ? 'Enregistrer les modifications' : 'Soumettre mes choix'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/etudiant/dashboard')}>
              Annuler
            </Button>
          </div>
        </Card>

        {/* Filtres de recherche */}
        <Card title="Filtrer les enseignants">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nom ou prénom..."
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade
              </label>
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tous les grades</option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spécialité
              </label>
              <select
                value={filterSpecialite}
                onChange={(e) => setFilterSpecialite(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Toutes les spécialités</option>
                {specialites.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Liste des enseignants */}
        <Card title={`Enseignants disponibles (${filteredEnseignants.length})`}>
          {filteredEnseignants.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Aucun enseignant ne correspond à vos critères de recherche</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEnseignants.map((ens) => {
                const dispo = getDisponibilite(ens);
                const selected = isSelected(ens.Matricule_Ens);

                return (
                  <div
                    key={ens.Matricule_Ens}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      selected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {ens.Prenom_Ens} {ens.Nom_Ens}
                        </h3>
                        <p className="text-sm text-gray-600">{ens.Grade_Ens}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      {ens.Specialite && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <GraduationCap className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{ens.Specialite}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{ens.Email_Ens}</span>
                      </div>
                      {ens.Telephone_Ens && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span>{ens.Telephone_Ens}</span>
                        </div>
                      )}
                    </div>

                    {/* Indicateur de disponibilité */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Disponibilité</span>
                        <span className={`font-medium text-${dispo.color}-600`}>
                          {dispo.text}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all bg-${dispo.color}-500`}
                          style={{ width: `${dispo.pourcentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Boutons de sélection */}
                    {selected ? (
                      <div className="flex items-center justify-center gap-2 text-sm text-primary-700 font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Sélectionné
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {!selectedChoix.choix1 && (
                          <button
                            onClick={() => handleSelectChoix(ens.Matricule_Ens, 'choix1')}
                            className="w-full px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <Trophy className="w-4 h-4" />
                            Choix 1
                          </button>
                        )}
                        {selectedChoix.choix1 && !selectedChoix.choix2 && (
                          <button
                            onClick={() => handleSelectChoix(ens.Matricule_Ens, 'choix2')}
                            className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <Target className="w-4 h-4" />
                            Choix 2
                          </button>
                        )}
                        {selectedChoix.choix1 && selectedChoix.choix2 && !selectedChoix.choix3 && (
                          <button
                            onClick={() => handleSelectChoix(ens.Matricule_Ens, 'choix3')}
                            className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <Users className="w-4 h-4" />
                            Choix 3
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
