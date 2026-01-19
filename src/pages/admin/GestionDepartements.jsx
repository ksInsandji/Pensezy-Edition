import React, { useEffect, useState, useRef } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Building, Users, UserCheck, Eye, X, Download, Upload, FileDown, FileText } from 'lucide-react';
import { downloadDepartementTemplate, exportDepartementsToExcel, importDepartementsFromExcel } from '../../utils/departementExportHelper';
import { exportDepartementsToPDF } from '../../utils/pdfExportHelper';

export default function GestionDepartements() {
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDepartement, setSelectedDepartement] = useState(null);
  const [anneeAcademique, setAnneeAcademique] = useState('2024-2025');
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    quotaParEncadreur: 5,
    anneeAcademique: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAnneeAcademique();
    fetchDepartements();
  }, []);

  const fetchAnneeAcademique = async () => {
    try {
      const response = await axios.get(ENDPOINTS.ANNEE_COURANTE);
      const annee = response.data.data.annee;
      setAnneeAcademique(annee);
      setFormData(prev => ({ ...prev, anneeAcademique: annee }));
    } catch (error) {
      console.error('Erreur chargement année académique:', error);
    }
  };

  const fetchDepartements = async () => {
    try {
      const response = await axios.get(ENDPOINTS.ADMIN_DEPARTEMENTS);
      console.log('📊 Réponse complète:', response.data);
      console.log('📋 Départements:', response.data.data);
      setDepartements(response.data.data || []);
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      toast.error('Erreur lors du chargement des départements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(ENDPOINTS.ADMIN_DEPARTEMENTS, {
        nom: formData.nom,
        code: formData.code,
        anneeAcademique: formData.anneeAcademique
      });
      toast.success('Département créé avec succès');
      setShowModal(false);
      setFormData({ nom: '', code: '', quotaParEncadreur: 5, anneeAcademique });
      fetchDepartements(); // Recharger la liste
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nom) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le département "${nom}" ?`)) {
      return;
    }

    try {
      await axios.delete(ENDPOINTS.DELETE_DEPARTEMENT(id));
      toast.success('Département supprimé avec succès');
      fetchDepartements();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  // ==================== VOIR DÉTAILS ====================

  const handleView = (departement) => {
    setSelectedDepartement(departement);
    setShowViewModal(true);
  };

  // ==================== MODIFIER ====================

  const handleEdit = (departement) => {
    setSelectedDepartement(departement);
    setFormData({
      nom: departement.Nom_Dep,
      code: departement.Code_Dep,
      quotaParEncadreur: departement.Quota_Par_Encadreur || 5,
      anneeAcademique: departement.Annee_Academique || anneeAcademique
    });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.put(ENDPOINTS.UPDATE_DEPARTEMENT(selectedDepartement.Id_Dep), {
        nom: formData.nom,
        code: formData.code,
        quotaParEncadreur: parseInt(formData.quotaParEncadreur),
        anneeAcademique: formData.anneeAcademique
      });
      toast.success('Département modifié avec succès');
      setShowEditModal(false);
      setSelectedDepartement(null);
      fetchDepartements();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== IMPORT/EXPORT ====================

  const handleDownloadTemplate = () => {
    try {
      downloadDepartementTemplate();
      toast.success('Modèle téléchargé avec succès');
    } catch (error) {
      toast.error('Erreur lors du téléchargement du modèle');
    }
  };

  const handleExportExcel = () => {
    try {
      exportDepartementsToExcel(departements);
      toast.success('Export Excel réussi');
    } catch (error) {
      toast.error('Erreur lors de l\'export Excel');
    }
  };

  const handleExportPDF = async () => {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║  🟢 [REACT] BOUTON PDF CLIQUÉ                            ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('📊 [REACT] Nombre de départements:', departements.length);
    console.log('📋 [REACT] Départements:', departements);
    console.log('🔍 [REACT] Structure premier département:', departements[0]);

    if (departements.length === 0) {
      console.warn('⚠️ [REACT] Aucun département à exporter !');
      toast.warning('Aucun département à exporter');
      return;
    }

    console.log('🚀 [REACT] Appel de exportDepartementsToPDF()...');

    try {
      await exportDepartementsToPDF(departements);
      console.log('✅ [REACT] Export PDF terminé avec succès');
      toast.success('Export PDF réussi');
    } catch (error) {
      console.log('╔═══════════════════════════════════════════════════════════╗');
      console.error('║  ❌ [REACT] ERREUR DANS handleExportPDF                 ║');
      console.log('╚═══════════════════════════════════════════════════════════╝');
      console.error('🔴 [REACT] Type d\'erreur:', error.constructor.name);
      console.error('🔴 [REACT] Message:', error.message);
      console.error('🔴 [REACT] Stack:', error.stack);
      console.log('═══════════════════════════════════════════════════════════');
      toast.error('Erreur lors de l\'export PDF: ' + error.message);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier l'extension
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Seuls les fichiers Excel (.xlsx, .xls) sont acceptés');
      return;
    }

    setImporting(true);

    try {
      const departementsData = await importDepartementsFromExcel(file);

      console.log('📥 Départements à importer:', departementsData);

      // Confirmer l'import
      const confirmed = window.confirm(
        `Vous êtes sur le point d'importer ${departementsData.length} département(s).\n\n` +
        `Cela créera de nouveaux départements dans la base de données.\n\n` +
        `Continuer ?`
      );

      if (!confirmed) {
        setImporting(false);
        return;
      }

      // Importer les départements un par un
      let successCount = 0;
      let errorCount = 0;

      for (const depData of departementsData) {
        try {
          await axios.post(ENDPOINTS.ADMIN_DEPARTEMENTS, depData);
          successCount++;
        } catch (error) {
          console.error('Erreur import département:', depData.nom, error);
          errorCount++;
        }
      }

      // Résultats
      if (successCount > 0) {
        toast.success(`${successCount} département(s) importé(s) avec succès`);
      }
      if (errorCount > 0) {
        toast.warning(`${errorCount} département(s) n'ont pas pu être importés`);
      }

      // Recharger la liste
      fetchDepartements();

    } catch (error) {
      console.error('Erreur import:', error);
      toast.error(error.message || 'Erreur lors de l\'import du fichier');
    } finally {
      setImporting(false);
      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
  
  // Debug: afficher l'état
  console.log('🔍 État actuel:', {
    loading,
    nbDepartements: departements.length,
    departements
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Gestion des départements</h1>

          <div className="flex flex-wrap gap-2">
            {/* Bouton Télécharger Modèle */}
            <Button
              variant="secondary"
              onClick={handleDownloadTemplate}
              title="Télécharger le modèle Excel pour importer des départements"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Modèle
            </Button>

            {/* Bouton Import */}
            <Button
              variant="secondary"
              onClick={handleImportClick}
              disabled={importing}
            >
              <Upload className="w-4 h-4 mr-2" />
              {importing ? 'Import...' : 'Importer'}
            </Button>

            {/* Bouton Export Excel */}
            <Button
              variant="secondary"
              onClick={handleExportExcel}
              disabled={departements.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>

            {/* Bouton Export PDF */}
            <Button
              variant="secondary"
              onClick={handleExportPDF}
              disabled={departements.length === 0}
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>

            {/* Bouton Nouveau */}
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau
            </Button>
          </div>
        </div>

        {/* Input file caché pour l'import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />



        {departements.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departements.map((dep) => (
            <Card key={dep.Id_Dep}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Building className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{dep.Nom_Dep}</h3>
                    <p className="text-sm text-gray-500">Code: {dep.Code_Dep}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    onClick={() => handleView(dep)}
                    title="Voir les détails"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                    onClick={() => handleEdit(dep)}
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    onClick={() => handleDelete(dep.Id_Dep, dep.Nom_Dep)}
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <UserCheck className="w-4 h-4" />
                    <span>Chef</span>
                  </div>
                  <span className="font-medium">
                    {dep.chef ? `${dep.chef.Prenom_Ens} ${dep.chef.Nom_Ens}` : 'Non assigné'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Filières</span>
                  </div>
                  <span className="font-medium">{dep._count?.filieres || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Quota/Encadreur</span>
                  <span className="font-medium">{dep.Quota_Par_Encadreur}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Année</span>
                  <span className="font-medium">{dep.Annee_Academique}</span>
                </div>
              </div>
            </Card>
            ))}
          </div>
        )}
        
        {departements.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <Building className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Aucun département créé</p>
              <Button className="mt-4" onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer le premier département
              </Button>
            </div>
          </Card>
        )}

        {/* Carte d'aide Import/Export */}
        <Card>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Guide d'import/export
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <FileDown className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900">Télécharger le modèle :</strong> Cliquez sur "Modèle" pour télécharger un fichier Excel avec le format requis pour l'importation.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Upload className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900">Importer :</strong> Remplissez le modèle Excel avec vos données et cliquez sur "Importer" pour ajouter plusieurs départements en une fois.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900">Exporter Excel :</strong> Téléchargez la liste complète des départements au format Excel pour consultation ou modification.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900">Exporter PDF :</strong> Générez un document PDF officiel avec en-tête ENS pour impression ou archivage.
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-xs text-gray-600">
                <strong>Note :</strong> Les fichiers Excel doivent contenir les colonnes : Nom du Département, Code, Quota par Encadreur, Année Académique.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal de création */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Nouveau département</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du département *
                </label>
                <Input
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Informatique et Technologies Éducatives"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code du département *
                </label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="INFO"
                  maxLength={10}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Code court unique (ex: INFO, MATH, PHY)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Année académique
                </label>
                <Input
                  value={formData.anneeAcademique}
                  onChange={(e) => setFormData({ ...formData, anneeAcademique: e.target.value })}
                  placeholder="2024-2025"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Le quota par encadreur sera géré par le chef de département après création.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ nom: '', code: '', quotaParEncadreur: 5, anneeAcademique });
                  }}
                  disabled={submitting}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de visualisation */}
      {showViewModal && selectedDepartement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold">Détails du département</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedDepartement(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">ID Département</label>
                  <p className="text-gray-900 font-medium">{selectedDepartement.Id_Dep}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Code</label>
                  <p className="text-gray-900 font-medium">{selectedDepartement.Code_Dep}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Nom du département</label>
                <p className="text-gray-900">{selectedDepartement.Nom_Dep}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Quota par encadreur</label>
                  <p className="text-gray-900">{selectedDepartement.Quota_Par_Encadreur || 'Non défini'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Année académique</label>
                  <p className="text-gray-900">{selectedDepartement.Annee_Academique}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Chef de département</label>
                <p className="text-gray-900">
                  {selectedDepartement.chef
                    ? `${selectedDepartement.chef.Prenom_Ens} ${selectedDepartement.chef.Nom_Ens} (${selectedDepartement.Id_Chef})`
                    : 'Non assigné'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Nombre de filières</label>
                <p className="text-gray-900">{selectedDepartement._count?.filieres || 0}</p>
              </div>

              {selectedDepartement.Date_Creation && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Date de création</label>
                  <p className="text-gray-900">
                    {new Date(selectedDepartement.Date_Creation).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedDepartement(null);
                }}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && selectedDepartement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Modifier le département</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedDepartement(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Département (non modifiable)
                </label>
                <Input
                  value={selectedDepartement.Id_Dep}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du département *
                </label>
                <Input
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Informatique et Technologies Éducatives"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code du département *
                </label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="INFO"
                  maxLength={10}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quota par encadreur *
                </label>
                <Input
                  type="number"
                  value={formData.quotaParEncadreur}
                  onChange={(e) => setFormData({ ...formData, quotaParEncadreur: parseInt(e.target.value) })}
                  min="1"
                  max="20"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Nombre maximum d'étudiants par encadreur</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Année académique *
                </label>
                <Input
                  value={formData.anneeAcademique}
                  onChange={(e) => setFormData({ ...formData, anneeAcademique: e.target.value })}
                  placeholder="2024-2025"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedDepartement(null);
                  }}
                  disabled={submitting}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Modification...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
