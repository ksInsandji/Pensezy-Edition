import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Eye,
  Trash2,
  FileText,
  Info
} from 'lucide-react';

export const ImportEncadrements = () => {
  const navigate = useNavigate();

  // États
  const [fichier, setFichier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [options, setOptions] = useState({
    creerSiInexistant: true,
    confirmerMaj: false,
    anneeAcademique: ''
  });
  const [historique, setHistorique] = useState([]);
  const [detailImport, setDetailImport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState('import'); // 'import' ou 'historique'

  // Charger l'année académique et l'historique au montage
  useEffect(() => {
    fetchAnneeAcademique();
    if (activeTab === 'historique') {
      chargerHistorique();
    }
  }, [activeTab]);

  const fetchAnneeAcademique = async () => {
    try {
      const response = await axios.get(ENDPOINTS.ANNEE_COURANTE);
      const annee = response.data.data.annee;
      setOptions(prev => ({ ...prev, anneeAcademique: annee }));
    } catch (error) {
      console.error('Erreur chargement année académique:', error);
    }
  };

  const chargerHistorique = async () => {
    try {
      setLoading(true);
      const response = await axios.get(ENDPOINTS.IMPORT_HISTORIQUE);
      setHistorique(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    } finally {
      setLoading(false);
    }
  };

  const telechargerTemplate = async () => {
    try {
      const response = await axios.get(ENDPOINTS.IMPORT_TEMPLATE, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'template_import_encadrements.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur téléchargement template:', error);
      alert('Erreur lors du téléchargement du template');
    }
  };

  const handleFichierChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('Format de fichier non supporté. Utilisez Excel (.xlsx, .xls) ou CSV (.csv)');
        return;
      }

      // Vérifier la taille (max 10 MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Le fichier est trop volumineux (max 10 MB)');
        return;
      }

      setFichier(file);
      setPreview(null);
    }
  };

  const previsualiser = async () => {
    if (!fichier) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('fichier', fichier);

      const response = await axios.post(ENDPOINTS.IMPORT_PREVIEW, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setPreview(response.data.data);
    } catch (error) {
      console.error('Erreur prévisualisation:', error);
      alert(error.response?.data?.message || 'Erreur lors de la prévisualisation du fichier');
    } finally {
      setLoading(false);
    }
  };

  const importerFichier = async () => {
    if (!fichier) {
      alert('Veuillez sélectionner un fichier');
      return;
    }

    if (!preview) {
      alert('Veuillez d\'abord prévisualiser le fichier');
      return;
    }

    // Demander confirmation
    const confirmMsg = `Vous allez importer ${preview.fichier.nbLignes} ligne(s).\n\n` +
      `Options :\n` +
      `- Créer étudiants/enseignants manquants : ${options.creerSiInexistant ? 'OUI' : 'NON'}\n` +
      `- Confirmer mise à jour encadrements existants : ${options.confirmerMaj ? 'OUI' : 'NON'}\n` +
      `- Année académique : ${options.anneeAcademique}\n\n` +
      `Continuer ?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('fichier', fichier);
      formData.append('creerSiInexistant', options.creerSiInexistant);
      formData.append('confirmerMaj', options.confirmerMaj);
      formData.append('anneeAcademique', options.anneeAcademique);

      const response = await axios.post(ENDPOINTS.IMPORT_ENCADREMENTS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const result = response.data.data;

      // Afficher le résultat
      const resultMsg = `Import terminé !\n\n` +
        `Total : ${result.resume.total} lignes\n` +
        `Réussies : ${result.resume.reussies}\n` +
        `Échouées : ${result.resume.echouees}\n\n` +
        `Détails :\n` +
        `- Étudiants créés : ${result.details.etudiantsCrees}\n` +
        `- Enseignants créés : ${result.details.enseignantsCrees}\n` +
        `- Encadrements créés : ${result.details.encadrementsCrees}\n` +
        `- Encadrements mis à jour : ${result.details.encadrementsMaj}\n` +
        `- Thèmes mis à jour : ${result.details.themesMaj}`;

      alert(resultMsg);

      // Réinitialiser
      setFichier(null);
      setPreview(null);

      // Basculer vers l'historique
      setActiveTab('historique');
      chargerHistorique();

    } catch (error) {
      console.error('Erreur import:', error);
      const errorMsg = error.response?.data?.message || 'Erreur lors de l\'importation';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const voirDetailImport = async (idImport) => {
    try {
      setLoading(true);
      const response = await axios.get(ENDPOINTS.IMPORT_DETAIL(idImport));
      setDetailImport(response.data.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Erreur chargement détail:', error);
      alert('Erreur lors du chargement du détail');
    } finally {
      setLoading(false);
    }
  };

  const getStatutBadge = (statut) => {
    switch (statut) {
      case 'termine':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Terminé
        </span>;
      case 'erreur':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center gap-1">
          <XCircle className="w-3 h-3" /> Erreur
        </span>;
      case 'en_cours':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" /> En cours
        </span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{statut}</span>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
      {/* En-tête */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/chef/encadrements')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux encadrements
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Import massif d'encadrements</h1>
        <p className="text-gray-600 mt-2">
          Importez plusieurs encadrements en une seule fois à partir d'un fichier Excel ou CSV
        </p>
      </div>

      {/* Onglets */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('import')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'import'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Importer
        </button>
        <button
          onClick={() => setActiveTab('historique')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'historique'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Historique
        </button>
      </div>

      {/* Contenu - Onglet Import */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>Téléchargez le template Excel ci-dessous</li>
                  <li>Remplissez-le avec vos données (un encadrement par ligne)</li>
                  <li>Importez le fichier et prévisualisez-le</li>
                  <li>Vérifiez les erreurs et corrigez si nécessaire</li>
                  <li>Lancez l'import final</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Télécharger template */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Download className="w-5 h-5" />
              1. Télécharger le template
            </h2>
            <p className="text-gray-600 mb-4">
              Commencez par télécharger le modèle Excel pré-formaté avec les colonnes requises.
            </p>
            <button
              onClick={telechargerTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Télécharger le template Excel
            </button>
          </div>

          {/* Options d'import */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">2. Options d'import</h2>
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="creerSiInexistant"
                  checked={options.creerSiInexistant}
                  onChange={(e) => setOptions({ ...options, creerSiInexistant: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="creerSiInexistant" className="text-gray-700">
                  Créer automatiquement les étudiants et enseignants manquants
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="confirmerMaj"
                  checked={options.confirmerMaj}
                  onChange={(e) => setOptions({ ...options, confirmerMaj: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="confirmerMaj" className="text-gray-700">
                  Mettre à jour les encadrements existants (si déjà présents)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <label htmlFor="anneeAcademique" className="text-gray-700 font-medium">
                  Année académique :
                </label>
                <input
                  type="text"
                  id="anneeAcademique"
                  value={options.anneeAcademique}
                  onChange={(e) => setOptions({ ...options, anneeAcademique: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="2024-2025"
                />
              </div>
            </div>
          </div>

          {/* Sélection fichier */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              3. Sélectionner le fichier
            </h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFichierChange}
                  className="hidden"
                  id="fichier-input"
                />
                <label htmlFor="fichier-input" className="cursor-pointer">
                  <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">
                    {fichier ? fichier.name : 'Cliquez pour sélectionner un fichier'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Formats acceptés : Excel (.xlsx, .xls) ou CSV (.csv) - Max 10 MB
                  </p>
                </label>
              </div>

              {fichier && (
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-800">{fichier.name}</p>
                      <p className="text-sm text-gray-500">
                        {(fichier.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFichier(null);
                      setPreview(null);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={previsualiser}
                  disabled={!fichier || loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  {loading ? 'Prévisualisation...' : 'Prévisualiser'}
                </button>

                <button
                  onClick={importerFichier}
                  disabled={!preview || loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {loading ? 'Import en cours...' : 'Lancer l\'import'}
                </button>
              </div>
            </div>
          </div>

          {/* Prévisualisation */}
          {preview && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                4. Prévisualisation
              </h2>

              {/* Résumé validation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-600 mb-1">Lignes totales</p>
                  <p className="text-2xl font-bold text-blue-900">{preview.fichier.nbLignes}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1">Lignes valides</p>
                  <p className="text-2xl font-bold text-green-900">{preview.validation.nbLignesValides}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600 mb-1">Lignes invalides</p>
                  <p className="text-2xl font-bold text-red-900">{preview.validation.nbLignesInvalides}</p>
                </div>
              </div>

              {/* Taux de validité */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Taux de validité</span>
                  <span className="text-sm font-bold text-gray-900">{preview.validation.tauxValidite}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      parseFloat(preview.validation.tauxValidite) >= 80
                        ? 'bg-green-600'
                        : parseFloat(preview.validation.tauxValidite) >= 50
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${preview.validation.tauxValidite}%` }}
                  ></div>
                </div>
              </div>

              {/* Erreurs */}
              {preview.apercu.lignesInvalides?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Erreurs détectées (10 premières)
                  </h3>
                  <div className="space-y-3">
                    {preview.apercu.lignesInvalides.map((item, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="font-medium text-red-900 mb-1">Ligne {item.ligne}</p>
                        <ul className="list-disc list-inside text-sm text-red-700">
                          {item.erreurs.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Aperçu lignes valides */}
              {preview.apercu.lignesValides?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Aperçu lignes valides (10 premières)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Ligne</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Étudiant</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Enseignant</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Thème</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {preview.apercu.lignesValides.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-sm text-gray-900">{item.ligne}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">
                              {item.donnees.matricule_etud} - {item.donnees.nom_etud} {item.donnees.prenom_etud}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900">
                              {item.donnees.matricule_ens} - {item.donnees.nom_ens} {item.donnees.prenom_ens}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-500 max-w-xs truncate">
                              {item.donnees.titre_theme || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Contenu - Onglet Historique */}
      {activeTab === 'historique' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Historique des imports</h2>

            {loading ? (
              <p className="text-gray-500 text-center py-8">Chargement...</p>
            ) : historique.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun import trouvé</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fichier</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Résultat</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durée</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historique.map((item) => (
                      <tr key={item.Id_Import} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          #{item.Id_Import}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(item.Date_Import).toLocaleString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.Fichier_Nom}
                        </td>
                        <td className="px-4 py-3">
                          {getStatutBadge(item.Statut)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex gap-2">
                            <span className="text-green-600">{item.Nb_Lignes_Reussies || 0} ✓</span>
                            <span className="text-red-600">{item.Nb_Lignes_Echouees || 0} ✗</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.Duree_Secondes ? `${item.Duree_Secondes}s` : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => voirDetailImport(item.Id_Import)}
                            className="text-primary-600 hover:text-primary-800 flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Détails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal détail import */}
      {showDetailModal && detailImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Détail de l'import #{detailImport.Id_Import}
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Informations générales */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">{new Date(detailImport.Date_Import).toLocaleString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fichier</p>
                  <p className="font-medium">{detailImport.Fichier_Nom}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Statut</p>
                  <p>{getStatutBadge(detailImport.Statut)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Année académique</p>
                  <p className="font-medium">{detailImport.Annee_Academique}</p>
                </div>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600">Lignes total</p>
                  <p className="text-xl font-bold text-blue-900">{detailImport.Nb_Lignes_Total || 0}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-600">Réussies</p>
                  <p className="text-xl font-bold text-green-900">{detailImport.Nb_Lignes_Reussies || 0}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-xs text-red-600">Échouées</p>
                  <p className="text-xl font-bold text-red-900">{detailImport.Nb_Lignes_Echouees || 0}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-purple-600">Durée</p>
                  <p className="text-xl font-bold text-purple-900">{detailImport.Duree_Secondes || 0}s</p>
                </div>
              </div>

              {/* Détails créations */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="border border-gray-200 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Étudiants créés</p>
                  <p className="text-lg font-semibold">{detailImport.Nb_Etudiants_Crees || 0}</p>
                </div>
                <div className="border border-gray-200 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Enseignants créés</p>
                  <p className="text-lg font-semibold">{detailImport.Nb_Enseignants_Crees || 0}</p>
                </div>
                <div className="border border-gray-200 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Encadrements créés</p>
                  <p className="text-lg font-semibold">{detailImport.Nb_Encadrements_Crees || 0}</p>
                </div>
              </div>

              {/* Erreurs */}
              {detailImport.Rapport_Erreurs && JSON.parse(detailImport.Rapport_Erreurs).length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-red-800 mb-3">Erreurs</h3>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {JSON.parse(detailImport.Rapport_Erreurs).map((err, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                        <p className="font-medium text-red-900">Ligne {err.ligne}</p>
                        <ul className="list-disc list-inside text-red-700">
                          {err.erreurs.map((e, i) => (
                            <li key={i}>{e}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Avertissements */}
              {detailImport.Rapport_Avertissements && JSON.parse(detailImport.Rapport_Avertissements).length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-yellow-800 mb-3">Avertissements</h3>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {JSON.parse(detailImport.Rapport_Avertissements).map((warn, index) => (
                      <div key={index} className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                        <p className="text-yellow-900">{warn.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Boutons */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default ImportEncadrements;
