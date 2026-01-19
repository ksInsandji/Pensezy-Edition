import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { PasswordGenerator } from '../../components/common/PasswordGenerator';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';
import { Plus, Search, Edit, Trash2, User, Users, Download, Upload, FileSpreadsheet, FileText, Eye, X } from 'lucide-react';

// IMPORT DU HELPER DE GÉNÉRATION PDF
import { exportEtudiantsPDF, exportEnseignantsPDF } from '../../utils/gestionPdfHelper';

export default function GestionComptes() {
  const [activeTab, setActiveTab] = useState('etudiants');
  const [etudiants, setEtudiants] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [modalType, setModalType] = useState('etudiant'); // 'etudiant' ou 'enseignant'
  const [formData, setFormData] = useState({
    // Commun
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    // Étudiant
    matricule: '',
    sexe: 'M',
    niveau: 5,
    filiereId: '',
    // Enseignant
    grade: 'Maitre de Conferences',
    specialite: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // États pour import/export Excel
  const [uploading, setUploading] = useState(false);
  const [showImportResults, setShowImportResults] = useState(false);
  const [importResults, setImportResults] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [etudRes, ensRes, filRes] = await Promise.all([
        axios.get(ENDPOINTS.CHEF_ETUDIANTS),
        axios.get(ENDPOINTS.CHEF_ENSEIGNANTS),
        axios.get(ENDPOINTS.CHEF_FILIERES)
      ]);
      setEtudiants(etudRes.data.data || []);
      setEnseignants(ensRes.data.data || []);
      setFilieres(filRes.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  
  const handleCreateClick = () => {
    setModalType(activeTab === 'etudiants' ? 'etudiant' : 'enseignant');
    // Réinitialiser le formData
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      password: '',
      matricule: '',
      sexe: 'M',
      niveau: 5,
      filiereId: filieres.length > 0 ? filieres[0].Id_Fil : '',
      grade: 'Maitre de Conferences',
      specialite: ''
    });
    setShowModal(true);
  };

  const handleSubmitEtudiant = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(ENDPOINTS.CHEF_CREATE_ETUDIANT, {
        matricule: formData.matricule,
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        sexe: formData.sexe,
        niveau: parseInt(formData.niveau),
        filiereId: parseInt(formData.filiereId),
        password: formData.password || 'etud123'
      });
      toast.success('Étudiant créé avec succès');
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEnseignant = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(ENDPOINTS.CHEF_CREATE_ENSEIGNANT, {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        grade: formData.grade,
        specialite: formData.specialite,
        password: formData.password || 'ens123'
      });
      toast.success('Enseignant créé avec succès');
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEtudiant = async (matricule, nom) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'étudiant "${nom}" ?`)) {
      return;
    }

    try {
      await axios.delete(ENDPOINTS.CHEF_DELETE_ETUDIANT(matricule));
      toast.success('Étudiant supprimé avec succès');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleDeleteEnseignant = async (matricule, nom) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'enseignant "${nom}" ?`)) {
      return;
    }

    try {
      await axios.delete(ENDPOINTS.CHEF_DELETE_ENSEIGNANT(matricule));
      toast.success('Enseignant supprimé avec succès');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  // ==================== VOIR DÉTAILS ====================

  const handleViewEtudiant = (etudiant) => {
    setSelectedPerson(etudiant);
    setModalType('etudiant');
    setShowViewModal(true);
  };

  const handleViewEnseignant = (enseignant) => {
    setSelectedPerson(enseignant);
    setModalType('enseignant');
    setShowViewModal(true);
  };

  // ==================== MODIFIER ====================

  const handleEditEtudiant = (etudiant) => {
    setSelectedPerson(etudiant);
    setModalType('etudiant');
    setFormData({
      nom: etudiant.Nom_Etud,
      prenom: etudiant.Prenom_Etud,
      email: etudiant.Email_Etud,
      telephone: etudiant.Telephone_Etud || '',
      matricule: etudiant.Matricule_Etud,
      sexe: etudiant.Sexe || 'M',
      niveau: etudiant.Niveau || 5,
      filiereId: etudiant.Id_Fil || '',
      password: ''
    });
    setShowEditModal(true);
  };

  const handleEditEnseignant = (enseignant) => {
    setSelectedPerson(enseignant);
    setModalType('enseignant');
    setFormData({
      nom: enseignant.Nom_Ens,
      prenom: enseignant.Prenom_Ens,
      email: enseignant.Email_Ens,
      telephone: enseignant.Telephone_Ens || '',
      grade: enseignant.Grade_Ens,
      specialite: enseignant.Specialite || '',
      password: ''
    });
    setShowEditModal(true);
  };

  const handleSubmitEditEtudiant = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const updateData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        sexe: formData.sexe,
        niveau: parseInt(formData.niveau),
        filiereId: parseInt(formData.filiereId)
      };

      // N'inclure le mot de passe que s'il est fourni
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password;
      }

      await axios.put(ENDPOINTS.CHEF_UPDATE_ETUDIANT(selectedPerson.Matricule_Etud), updateData);
      toast.success('Étudiant modifié avec succès');
      setShowEditModal(false);
      setSelectedPerson(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEditEnseignant = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const updateData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        grade: formData.grade,
        specialite: formData.specialite
      };

      // N'inclure le mot de passe que s'il est fourni
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password;
      }

      await axios.put(ENDPOINTS.CHEF_UPDATE_ENSEIGNANT(selectedPerson.Matricule_Ens), updateData);
      toast.success('Enseignant modifié avec succès');
      setShowEditModal(false);
      setSelectedPerson(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== NOUVELLE FONCTION EXPORT PDF (CLIENT-SIDE) ====================
  const handleExportPDF = async () => {
    try {
      if (activeTab === 'etudiants') {
        if (etudiants.length === 0) return toast.warning("Aucun étudiant à exporter");
        toast.info('Génération du PDF Étudiants...');
        await exportEtudiantsPDF(etudiants, filieres);
      } else {
        if (enseignants.length === 0) return toast.warning("Aucun enseignant à exporter");
        toast.info('Génération du PDF Enseignants...');
        await exportEnseignantsPDF(enseignants);
      }
      toast.success('PDF généré avec succès');
    } catch (error) {
      console.error('Erreur PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  // ==================== IMPORT/EXPORT EXCEL ====================

  const handleExport = async () => {
    try {
      const endpoint = activeTab === 'etudiants'
        ? ENDPOINTS.CHEF_EXPORT_ETUDIANTS
        : ENDPOINTS.CHEF_EXPORT_ENSEIGNANTS;

      const response = await axios.get(endpoint, {
        responseType: 'blob'
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', activeTab === 'etudiants'
        ? `Etudiants_${date}.xlsx`
        : `Enseignants_${date}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Fichier exporté avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const endpoint = activeTab === 'etudiants'
        ? ENDPOINTS.CHEF_TEMPLATE_ETUDIANTS
        : ENDPOINTS.CHEF_TEMPLATE_ENSEIGNANTS;

      const response = await axios.get(endpoint, {
        responseType: 'blob'
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', activeTab === 'etudiants'
        ? 'Template_Etudiants.xlsx'
        : 'Template_Enseignants.xlsx'
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Modèle téléchargé avec succès');
    } catch (error) {
      toast.error('Erreur lors du téléchargement du modèle');
    }
  };

  // const url = window.URL.createObjectURL(new Blob([response.data]));
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Réinitialiser l'input pour permettre de sélectionner le même fichier
    e.target.value = '';

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = activeTab === 'etudiants'
        ? ENDPOINTS.CHEF_IMPORT_ETUDIANTS
        : ENDPOINTS.CHEF_IMPORT_ENSEIGNANTS;

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setImportResults(response.data.data);
      setShowImportResults(true);

      if (response.data.data.successCount > 0) {
        fetchData(); // Rafraîchir les données
      }

    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'importation');
    } finally {
      setUploading(false);
    }
  };

  const filteredEtudiants = etudiants.filter(e =>
    `${e.Nom_Etud} ${e.Prenom_Etud} ${e.Matricule_Etud}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEnseignants = enseignants.filter(e =>
    `${e.Nom_Ens} ${e.Prenom_Ens} ${e.Matricule_Ens}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-2xl font-bold">Gestion des comptes</h1>
          <div className="flex flex-col items-end gap-1 w-full sm:w-auto">
            <Button
              onClick={handleCreateClick}
              disabled={activeTab === 'etudiants' && filieres.length === 0}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau {activeTab === 'etudiants' ? 'étudiant' : 'enseignant'}
            </Button>
            {activeTab === 'etudiants' && filieres.length === 0 && (
              <p className="text-xs text-red-600">
                Créez d'abord une filière pour pouvoir ajouter des étudiants
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-4 border-b">
          <button
            onClick={() => setActiveTab('etudiants')}
            className={`pb-4 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'etudiants'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4" />
            Étudiants ({etudiants.length})
          </button>
          <button
            onClick={() => setActiveTab('enseignants')}
            className={`pb-4 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'enseignants'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Enseignants ({enseignants.length})
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Barre d'actions Import/Export */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <Button
            onClick={handleExport}
            variant="secondary"
            disabled={
              (activeTab === 'etudiants' && etudiants.length === 0) ||
              (activeTab === 'enseignants' && enseignants.length === 0)
            }
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter vers Excel
          </Button>

          <Button
            onClick={handleDownloadTemplate}
            variant="secondary"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Télécharger le modèle
          </Button>
          
          {/* BOUTON PDF AJOUTÉ ICI */}
          <Button 
            onClick={handleExportPDF} 
            variant="secondary"
            className="border-red-200 text-red-700 hover:bg-red-50"
            disabled={(activeTab === 'etudiants' && etudiants.length === 0) || (activeTab === 'enseignants' && enseignants.length === 0)}
          >
            <FileText className="w-4 h-4 mr-2 text-red-600" />
            Exporter en PDF
          </Button>

          <label
            htmlFor="excel-upload"
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer ${
              activeTab === 'etudiants' && filieres.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Upload className="w-4 h-4 mr-2" />
            Importer depuis Excel
          </label>
          <input
            id="excel-upload"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
            disabled={activeTab === 'etudiants' && filieres.length === 0}
          />

        </div>

        <Card>
          {activeTab === 'etudiants' ? (
            <>
              {/* Desktop: Table */}
              <div className="hidden md:block overflow-x-auto -mx-6 px-6">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 whitespace-nowrap">Matricule</th>
                      <th className="text-left py-3 px-4 whitespace-nowrap">Nom complet</th>
                      <th className="text-left py-3 px-4 whitespace-nowrap">Email</th>
                      <th className="text-left py-3 px-4 whitespace-nowrap">Statut</th>
                      <th className="text-left py-3 px-4 whitespace-nowrap sticky right-0 bg-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEtudiants.length > 0 ? (
                      filteredEtudiants.map((etud) => (
                        <tr key={etud.Matricule_Etud} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{etud.Matricule_Etud}</td>
                          <td className="py-3 px-4">{etud.Prenom_Etud} {etud.Nom_Etud}</td>
                          <td className="py-3 px-4">{etud.Email_Etud}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              etud.Statut_Etudiant === 'Inscrit' ? 'bg-blue-100 text-blue-800' :
                              etud.Statut_Etudiant === 'Encadrement_Valide' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {etud.Statut_Etudiant}
                            </span>
                          </td>
                          <td className="py-3 px-4 sticky right-0 bg-white">
                            <div className="flex gap-2 justify-center min-w-[120px]">
                              <button
                                onClick={() => handleViewEtudiant(etud)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Voir les détails"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditEtudiant(etud)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEtudiant(etud.Matricule_Etud, `${etud.Prenom_Etud} ${etud.Nom_Etud}`)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">
                          Aucun étudiant trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Cards */}
              <div className="md:hidden space-y-3">
                {filteredEtudiants.length > 0 ? (
                  filteredEtudiants.map((etud) => (
                    <div key={etud.Matricule_Etud} className="border rounded-lg p-4 bg-white hover:bg-gray-50">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{etud.Prenom_Etud} {etud.Nom_Etud}</p>
                            <p className="text-sm text-gray-500">{etud.Matricule_Etud}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            etud.Statut_Etudiant === 'Inscrit' ? 'bg-blue-100 text-blue-800' :
                            etud.Statut_Etudiant === 'Encadrement_Valide' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {etud.Statut_Etudiant}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{etud.Email_Etud}</p>
                        <div className="flex justify-end gap-2 pt-2 border-t">
                          <button
                            onClick={() => handleViewEtudiant(etud)}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Eye className="w-4 h-4" />
                            Voir
                          </button>
                          <button
                            onClick={() => handleEditEtudiant(etud)}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded"
                          >
                            <Edit className="w-4 h-4" />
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteEtudiant(etud.Matricule_Etud, `${etud.Prenom_Etud} ${etud.Nom_Etud}`)}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Aucun étudiant trouvé
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Desktop: Table */}
              <div className="hidden md:block overflow-x-auto -mx-6 px-6">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 whitespace-nowrap">Matricule</th>
                      <th className="text-left py-3 px-4 whitespace-nowrap">Nom complet</th>
                      <th className="text-left py-3 px-4 whitespace-nowrap">Grade</th>
                      <th className="text-left py-3 px-4 whitespace-nowrap">Spécialité</th>
                      <th className="text-left py-3 px-4 whitespace-nowrap">Statut</th>
                      <th className="text-left py-3 px-4 whitespace-nowrap sticky right-0 bg-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEnseignants.length > 0 ? (
                      filteredEnseignants.map((ens) => (
                        <tr key={ens.Matricule_Ens} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{ens.Matricule_Ens}</td>
                          <td className="py-3 px-4 flex items-center gap-2">
                            {ens.Prenom_Ens} {ens.Nom_Ens}
                            {ens.Est_Chef_Dep && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded font-medium">
                                Chef
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">{ens.Grade_Ens}</td>
                          <td className="py-3 px-4">{ens.Specialite || '-'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              ens.Est_Chef_Dep ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {ens.Est_Chef_Dep ? 'Chef de département' : 'Enseignant'}
                            </span>
                          </td>
                          <td className="py-3 px-4 sticky right-0 bg-white">
                            <div className="flex gap-2 justify-center min-w-[140px]">
                              <button
                                onClick={() => handleViewEnseignant(ens)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Voir les détails"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {!ens.Est_Chef_Dep && (
                                <>
                                  <button
                                    onClick={() => handleEditEnseignant(ens)}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                    title="Modifier"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEnseignant(ens.Matricule_Ens, `${ens.Prenom_Ens} ${ens.Nom_Ens}`)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {ens.Est_Chef_Dep && (
                                <span className="text-xs text-gray-500 italic whitespace-nowrap">Chef</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          Aucun enseignant trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Cards */}
              <div className="md:hidden space-y-3">
                {filteredEnseignants.length > 0 ? (
                  filteredEnseignants.map((ens) => (
                    <div key={ens.Matricule_Ens} className="border rounded-lg p-4 bg-white hover:bg-gray-50">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{ens.Prenom_Ens} {ens.Nom_Ens}</p>
                              {ens.Est_Chef_Dep && (
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded font-medium">
                                  Chef
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{ens.Matricule_Ens}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            ens.Est_Chef_Dep ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {ens.Est_Chef_Dep ? 'Chef' : 'Enseignant'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">{ens.Grade_Ens}</p>
                          <p className="text-sm text-gray-600 truncate">{ens.Specialite || '-'}</p>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t">
                          <button
                            onClick={() => handleViewEnseignant(ens)}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Eye className="w-4 h-4" />
                            Voir
                          </button>
                          {!ens.Est_Chef_Dep ? (
                            <>
                              <button
                                onClick={() => handleEditEnseignant(ens)}
                                className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded"
                              >
                                <Edit className="w-4 h-4" />
                                Modifier
                              </button>
                              <button
                                onClick={() => handleDeleteEnseignant(ens.Matricule_Ens, `${ens.Prenom_Ens} ${ens.Nom_Ens}`)}
                                className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                                Supprimer
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-500 italic">Non modifiable</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Aucun enseignant trouvé
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Modal de création d'enseignant */}
      {showModal && modalType === 'enseignant' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Nouvel enseignant</h2>

            <form onSubmit={handleSubmitEnseignant} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="enseignant@ens.cm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <Input
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="WANDJI"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <Input
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    placeholder="Paul"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <Input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="+237690000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade *
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="Professeur">Professeur</option>
                    <option value="Maitre de Conferences">Maître de Conférences</option>
                    <option value="Charge de Cours">Chargé de Cours</option>
                    <option value="Assistant">Assistant</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spécialité *
                  </label>
                  <Input
                    value={formData.specialite}
                    onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                    placeholder="Ex: Intelligence Artificielle, Didactique des Mathématiques..."
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <PasswordGenerator
                    value={formData.password || 'ens123'}
                    onChange={(password) => setFormData({ ...formData, password })}
                    label="Mot de passe"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>📧 Important:</strong> Un email avec les identifiants de connexion sera automatiquement envoyé à l'enseignant.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      matricule: '',
                      nom: '',
                      prenom: '',
                      email: '',
                      telephone: '',
                      grade: 'Maitre de Conferences',
                      specialite: '',
                      password: 'ens123'
                    });
                  }}
                  disabled={submitting}
                  className="flex-1 w-full sm:w-auto"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 w-full sm:w-auto"
                >
                  {submitting ? 'Création...' : 'Créer l\'enseignant'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de création d'étudiant */}
      {showModal && modalType === 'etudiant' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Nouvel étudiant</h2>

            <form onSubmit={handleSubmitEtudiant} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Matricule *
                  </label>
                  <Input
                    value={formData.matricule}
                    onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                    placeholder="19A387FS"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="etudiant@ens.cm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <Input
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="DJONGBE"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <Input
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    placeholder="WANGMENE"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <Input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="+237690000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sexe *
                  </label>
                  <select
                    value={formData.sexe}
                    onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Niveau *
                  </label>
                  <select
                    value={formData.niveau}
                    onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="3">Niveau 3 (Licence)</option>
                    <option value="5">Niveau 5 (Master)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filière *
                  </label>
                  <select
                    value={formData.filiereId}
                    onChange={(e) => setFormData({ ...formData, filiereId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    {filieres.length === 0 ? (
                      <option value="">Aucune filière disponible</option>
                    ) : (
                      filieres.map((filiere) => (
                        <option key={filiere.Id_Fil} value={filiere.Id_Fil}>
                          {filiere.Nom_Fil} ({filiere.Code_Fil})
                        </option>
                      ))
                    )}
                  </select>
                  {filieres.length === 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      Vous devez d'abord créer au moins une filière
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <PasswordGenerator
                    value={formData.password || 'etud123'}
                    onChange={(password) => setFormData({ ...formData, password })}
                    label="Mot de passe"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>📧 Important:</strong> Un email avec les identifiants de connexion sera automatiquement envoyé à l'étudiant.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="flex-1 w-full sm:w-auto"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 w-full sm:w-auto"
                >
                  {submitting ? 'Création...' : 'Créer l\'étudiant'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overlay de chargement pendant upload */}
      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <div>
                <div className="font-medium">Importation en cours...</div>
                <div className="text-sm text-gray-600">
                  Veuillez patienter pendant le traitement du fichier
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal résultats import */}
      {showImportResults && importResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Résultats de l'importation
            </h2>

            {/* Statistiques */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-600">Total</div>
                <div className="text-2xl font-bold text-blue-800">
                  {importResults.totalRows}
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-600">Réussites</div>
                <div className="text-2xl font-bold text-green-800">
                  {importResults.successCount}
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm text-red-600">Erreurs</div>
                <div className="text-2xl font-bold text-red-800">
                  {importResults.errorCount}
                </div>
              </div>
            </div>

            {/* Liste des erreurs */}
            {importResults.errors.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-red-800 mb-3">
                  Erreurs détectées:
                </h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {importResults.errors.map((error, idx) => (
                    <div key={idx} className="mb-2 text-sm">
                      <span className="font-medium">Ligne {error.row}:</span>{' '}
                      <span className="text-red-700">{error.message}</span>
                      {error.field && (
                        <span className="text-gray-600"> (Champ: {error.field})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Liste des succès */}
            {importResults.successes.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-green-800 mb-3">
                  {importResults.successCount} {activeTab === 'etudiants' ? 'étudiant(s)' : 'enseignant(s)'} importé(s) avec succès
                </h3>
                <details className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <summary className="cursor-pointer font-medium text-green-700">
                    Voir les détails
                  </summary>
                  <div className="mt-3 max-h-64 overflow-y-auto text-sm">
                    {importResults.successes.map((success, idx) => (
                      <div key={idx} className="mb-1">
                        Ligne {success.row}: {success.prenom} {success.nom}
                        {success.matricule && ` (${success.matricule})`}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}

            {/* Boutons */}
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setShowImportResults(false);
                  setImportResults(null);
                }}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de visualisation des détails */}
      {showViewModal && selectedPerson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold">
                Détails {modalType === 'etudiant' ? "de l'étudiant" : "de l'enseignant"}
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPerson(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {modalType === 'etudiant' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Matricule</label>
                    <p className="text-gray-900 font-medium">{selectedPerson.Matricule_Etud}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Statut</label>
                    <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                      selectedPerson.Statut_Etudiant === 'Inscrit' ? 'bg-blue-100 text-blue-800' :
                      selectedPerson.Statut_Etudiant === 'Encadrement_Valide' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedPerson.Statut_Etudiant}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Nom</label>
                    <p className="text-gray-900">{selectedPerson.Nom_Etud}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Prénom</label>
                    <p className="text-gray-900">{selectedPerson.Prenom_Etud}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-gray-900">{selectedPerson.Email_Etud}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Téléphone</label>
                    <p className="text-gray-900">{selectedPerson.Telephone_Etud || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Sexe</label>
                    <p className="text-gray-900">{selectedPerson.Sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Niveau</label>
                    <p className="text-gray-900">
                      {selectedPerson.Niveau === 3 ? 'Niveau 3 (Licence)' : 'Niveau 5 (Master)'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Filière</label>
                    <p className="text-gray-900">
                      {filieres.find(f => f.Id_Fil === selectedPerson.Id_Fil)?.Nom_Fil || '-'}
                    </p>
                  </div>
                </div>

                {selectedPerson.Date_Creation && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Date de création</label>
                    <p className="text-gray-900">
                      {new Date(selectedPerson.Date_Creation).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Matricule</label>
                    <p className="text-gray-900 font-medium">{selectedPerson.Matricule_Ens}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Rôle</label>
                    <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                      selectedPerson.Est_Chef_Dep ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedPerson.Est_Chef_Dep ? 'Chef de département' : 'Enseignant'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Nom</label>
                    <p className="text-gray-900">{selectedPerson.Nom_Ens}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Prénom</label>
                    <p className="text-gray-900">{selectedPerson.Prenom_Ens}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-gray-900">{selectedPerson.Email_Ens}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Téléphone</label>
                    <p className="text-gray-900">{selectedPerson.Telephone_Ens || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Grade</label>
                    <p className="text-gray-900">{selectedPerson.Grade_Ens}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Spécialité</label>
                  <p className="text-gray-900">{selectedPerson.Specialite || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Disponibilité pour encadrement</label>
                  <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                    selectedPerson.Disponible_Encadrement ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedPerson.Disponible_Encadrement ? 'Disponible' : 'Indisponible'}
                  </span>
                </div>

                {selectedPerson.Date_Creation && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Date de création</label>
                    <p className="text-gray-900">
                      {new Date(selectedPerson.Date_Creation).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end mt-6 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPerson(null);
                }}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && selectedPerson && modalType === 'etudiant' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Modifier l'étudiant</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedPerson(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitEditEtudiant} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Matricule (non modifiable)
                  </label>
                  <Input
                    value={selectedPerson.Matricule_Etud}
                    disabled
                    className="bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <Input
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <Input
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <Input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sexe *
                  </label>
                  <select
                    value={formData.sexe}
                    onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Niveau *
                  </label>
                  <select
                    value={formData.niveau}
                    onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="3">Niveau 3 (Licence)</option>
                    <option value="5">Niveau 5 (Master)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filière *
                  </label>
                  <select
                    value={formData.filiereId}
                    onChange={(e) => setFormData({ ...formData, filiereId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    {filieres.map((filiere) => (
                      <option key={filiere.Id_Fil} value={filiere.Id_Fil}>
                        {filiere.Nom_Fil} ({filiere.Code_Fil})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau mot de passe (laisser vide pour ne pas changer)
                  </label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Laisser vide pour conserver l'ancien"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPerson(null);
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
                  {submitting ? 'Modification...' : 'Enregistrer les modifications'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de modification enseignant */}
      {showEditModal && selectedPerson && modalType === 'enseignant' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Modifier l'enseignant</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedPerson(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitEditEnseignant} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Matricule (non modifiable)
                  </label>
                  <Input
                    value={selectedPerson.Matricule_Ens}
                    disabled
                    className="bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <Input
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <Input
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <Input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade *
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="Professeur">Professeur</option>
                    <option value="Maitre de Conferences">Maître de Conférences</option>
                    <option value="Charge de Cours">Chargé de Cours</option>
                    <option value="Assistant">Assistant</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spécialité *
                  </label>
                  <Input
                    value={formData.specialite}
                    onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau mot de passe (laisser vide pour ne pas changer)
                  </label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Laisser vide pour conserver l'ancien"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPerson(null);
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
                  {submitting ? 'Modification...' : 'Enregistrer les modifications'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
