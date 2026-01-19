import React, { useEffect, useState, useRef } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';
import { Users, Search, Award, UserCheck, Eye, Edit, Trash2, X, Download, Upload, FileDown, FileText, Power, PowerOff, MoreVertical } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { downloadEnseignantTemplate, exportEnseignantsToExcel, importEnseignantsFromExcel } from '../../utils/enseignantExportHelper';
import { exportEnseignantsToPDF } from '../../utils/enseignantPdfHelper';

export default function GestionEnseignants() {
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEnseignant, setSelectedEnseignant] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    grade: '',
    specialite: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchEnseignants();
  }, []);

  const fetchEnseignants = async () => {
    try {
      const response = await axios.get(ENDPOINTS.ADMIN_ENSEIGNANTS);
      setEnseignants(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement enseignants:', error);
      toast.error('Erreur lors du chargement des enseignants');
    } finally {
      setLoading(false);
    }
  };

  // ==================== VOIR DÉTAILS ====================

  const handleView = (enseignant) => {
    setSelectedEnseignant(enseignant);
    setShowViewModal(true);
  };

  // ==================== MODIFIER ====================

  const handleEdit = (enseignant) => {
    setSelectedEnseignant(enseignant);
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

  const handleSubmitEdit = async (e) => {
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

      // Utiliser l'endpoint du département du chef pour la modification
      const chefDep = enseignants.find(e => e.Est_Chef_Dep && e.Id_Dep === selectedEnseignant.Id_Dep);
      await axios.put(ENDPOINTS.CHEF_UPDATE_ENSEIGNANT(selectedEnseignant.Matricule_Ens), updateData);

      toast.success('Enseignant modifié avec succès');
      setShowEditModal(false);
      setSelectedEnseignant(null);
      fetchEnseignants();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== SUPPRIMER ====================

  const handleDelete = async (matricule, nom) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'enseignant "${nom}" ?`)) {
      return;
    }

    try {
      await axios.delete(ENDPOINTS.CHEF_DELETE_ENSEIGNANT(matricule));
      toast.success('Enseignant supprimé avec succès');
      fetchEnseignants();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  // ==================== IMPORT/EXPORT ====================

  const handleDownloadTemplate = () => {
    try {
      downloadEnseignantTemplate();
      toast.success('Modèle téléchargé avec succès');
    } catch (error) {
      toast.error('Erreur lors du téléchargement du modèle');
    }
  };

  const handleExportExcel = () => {
    try {
      exportEnseignantsToExcel(enseignants);
      toast.success('Export Excel réussi');
    } catch (error) {
      toast.error('Erreur lors de l\'export Excel');
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportEnseignantsToPDF(enseignants);
      toast.success('Export PDF réussi');
    } catch (error) {
      console.error('Erreur export PDF:', error);
      toast.error('Erreur lors de l\'export PDF');
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
      const enseignantsData = await importEnseignantsFromExcel(file);

      console.log('📥 Enseignants à importer:', enseignantsData);

      // Confirmer l'import
      const confirmed = window.confirm(
        `Vous êtes sur le point d'importer ${enseignantsData.length} enseignant(s).\n\n` +
        `Cela créera de nouveaux comptes enseignants dans la base de données.\n\n` +
        `Continuer ?`
      );

      if (!confirmed) {
        setImporting(false);
        return;
      }

      // Importer les enseignants un par un
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const ensData of enseignantsData) {
        try {
          await axios.post(ENDPOINTS.CHEF_CREATE_ENSEIGNANT, ensData);
          successCount++;
        } catch (error) {
          console.error('Erreur import enseignant:', ensData.email, error);
          errorCount++;
          errors.push(`${ensData.prenom} ${ensData.nom}: ${error.response?.data?.message || 'Erreur inconnue'}`);
        }
      }

      // Résultats
      if (successCount > 0) {
        toast.success(`${successCount} enseignant(s) importé(s) avec succès`);
      }
      if (errorCount > 0) {
        toast.warning(`${errorCount} enseignant(s) n'ont pas pu être importés`);
        if (errors.length > 0 && errors.length <= 5) {
          console.error('Détails des erreurs:', errors);
        }
      }

      // Recharger la liste
      fetchEnseignants();

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

  const handleToggleActivation = async (matricule, nomComplet, isActive) => {
    const action = isActive ? 'désactiver' : 'activer';
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir ${action} le compte de "${nomComplet}" ?\n\n` +
      (isActive
        ? 'Un compte désactivé ne pourra plus se connecter à la plateforme.'
        : 'Un compte activé pourra se connecter à la plateforme.')
    );

    if (!confirmed) return;

    try {
      await axios.patch(ENDPOINTS.ADMIN_TOGGLE_ENSEIGNANT_ACTIVATION(matricule));
      toast.success(`Compte ${isActive ? 'désactivé' : 'activé'} avec succès`);
      fetchEnseignants();
    } catch (error) {
      toast.error(error.response?.data?.message || `Erreur lors de la ${action}ion du compte`);
    }
  };

  const filteredEnseignants = enseignants
    .filter(ens =>
      `${ens.Nom_Ens} ${ens.Prenom_Ens} ${ens.Email_Ens} ${ens.Matricule_Ens}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Tri alphabétique par nom, puis par prénom
      const nomCompare = a.Nom_Ens.localeCompare(b.Nom_Ens, 'fr', { sensitivity: 'base' });
      if (nomCompare !== 0) return nomCompare;
      return a.Prenom_Ens.localeCompare(b.Prenom_Ens, 'fr', { sensitivity: 'base' });
    });

  const totalEnseignants = enseignants.length;
  const chefs = enseignants.filter(e => e.Est_Chef_Dep).length;
  const enseignantsNormaux = enseignants.filter(e => !e.Est_Chef_Dep).length;

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Enseignants</h1>
            <p className="text-gray-600 mt-1">Vue d'ensemble de tous les enseignants de la plateforme</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Bouton Télécharger Modèle */}
            <Button
              variant="secondary"
              onClick={handleDownloadTemplate}
              title="Télécharger le modèle Excel pour importer des enseignants"
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
              disabled={enseignants.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>

            {/* Bouton Export PDF */}
            <Button
              variant="secondary"
              onClick={handleExportPDF}
              disabled={enseignants.length === 0}
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF
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

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total enseignants</p>
                <p className="text-2xl font-bold">{totalEnseignants}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Chefs de département</p>
                <p className="text-2xl font-bold">{chefs}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Enseignants normaux</p>
                <p className="text-2xl font-bold">{enseignantsNormaux}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Barre de recherche */}
        <Card>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, email ou matricule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </Card>

        {/* Liste des enseignants */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Liste des enseignants ({filteredEnseignants.length})
            </h2>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 md:px-4 whitespace-nowrap text-xs md:text-sm">Enseignant</th>
                  <th className="text-left py-3 px-2 md:px-4 whitespace-nowrap text-xs md:text-sm hidden md:table-cell">Grade</th>
                  <th className="text-left py-3 px-2 md:px-4 whitespace-nowrap text-xs md:text-sm hidden lg:table-cell">Département</th>
                  <th className="text-left py-3 px-2 md:px-4 whitespace-nowrap text-xs md:text-sm">Statut</th>
                  <th className="text-right py-3 px-2 md:px-4 whitespace-nowrap text-xs md:text-sm w-16">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnseignants.length > 0 ? (
                  filteredEnseignants.map((ens) => (
                    <tr key={ens.Matricule_Ens} className="border-b hover:bg-gray-50">
                      {/* Colonne Enseignant (combinée) */}
                      <td className="py-3 px-2 md:px-4">
                        <div className="min-w-0">
                          <p className="font-medium text-sm md:text-base truncate">
                            {ens.Nom_Ens} {ens.Prenom_Ens}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{ens.Email_Ens}</p>
                          <p className="text-xs text-gray-400 font-mono">{ens.Matricule_Ens}</p>
                          {/* Grade visible uniquement sur mobile */}
                          <p className="text-xs text-primary-600 md:hidden mt-1">
                            <Award className="w-3 h-3 inline mr-1" />
                            {ens.Grade_Ens}
                          </p>
                        </div>
                      </td>
                      {/* Grade (desktop) */}
                      <td className="py-3 px-2 md:px-4 hidden md:table-cell">
                        <div className="flex items-center gap-1 text-sm">
                          <Award className="w-4 h-4 text-primary-600" />
                          <span className="truncate max-w-[120px]">{ens.Grade_Ens}</span>
                        </div>
                        {ens.Specialite && (
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">{ens.Specialite}</p>
                        )}
                      </td>
                      {/* Département (desktop large) */}
                      <td className="py-3 px-2 md:px-4 hidden lg:table-cell">
                        {ens.departement ? (
                          <div className="text-sm">
                            <p className="font-medium truncate max-w-[150px]">{ens.departement.Nom_Dep}</p>
                            <p className="text-xs text-gray-500">{ens.departement.Code_Dep}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Non assigné</span>
                        )}
                      </td>
                      {/* Statut */}
                      <td className="py-3 px-2 md:px-4">
                        <div className="flex flex-col gap-1">
                          {ens.Est_Chef_Dep ? (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium inline-flex items-center gap-1 w-fit">
                              <UserCheck className="w-3 h-3" />
                              <span className="hidden sm:inline">Chef</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-medium w-fit">
                              Ens.
                            </span>
                          )}
                          {ens.Compte_Actif === false && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full font-medium inline-flex items-center gap-1 w-fit">
                              <PowerOff className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Actions (menu déroulant) */}
                      <td className="py-3 px-2 md:px-4 text-right">
                        <div className="relative inline-block" ref={openMenuId === ens.Matricule_Ens ? menuRef : null}>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === ens.Matricule_Ens ? null : ens.Matricule_Ens)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            title="Actions"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                          </button>
                          {openMenuId === ens.Matricule_Ens && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-50">
                              <div className="py-1">
                                <button
                                  onClick={() => { handleView(ens); setOpenMenuId(null); }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4 text-blue-600" />
                                  Voir les détails
                                </button>
                                {!ens.Est_Chef_Dep && (
                                  <>
                                    <button
                                      onClick={() => { handleEdit(ens); setOpenMenuId(null); }}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Edit className="w-4 h-4 text-green-600" />
                                      Modifier
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleToggleActivation(
                                          ens.Matricule_Ens,
                                          `${ens.Prenom_Ens} ${ens.Nom_Ens}`,
                                          ens.Compte_Actif !== false
                                        );
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      {ens.Compte_Actif === false ? (
                                        <>
                                          <Power className="w-4 h-4 text-green-600" />
                                          Activer le compte
                                        </>
                                      ) : (
                                        <>
                                          <PowerOff className="w-4 h-4 text-orange-600" />
                                          Désactiver le compte
                                        </>
                                      )}
                                    </button>
                                    <hr className="my-1" />
                                    <button
                                      onClick={() => {
                                        handleDelete(ens.Matricule_Ens, `${ens.Prenom_Ens} ${ens.Nom_Ens}`);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Supprimer
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Aucun enseignant trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Informations supplémentaires */}
        <Card className="bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Information</h3>
              <p className="text-sm text-blue-800 mt-1">
                Cette page affiche tous les enseignants de la plateforme. Les chefs de département sont marqués avec un badge spécial.
                Pour gérer les chefs, rendez-vous dans la section "Chefs de département".
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal de visualisation */}
      {showViewModal && selectedEnseignant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold">Détails de l'enseignant</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedEnseignant(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Matricule</label>
                  <p className="text-gray-900 font-medium">{selectedEnseignant.Matricule_Ens}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Statut</label>
                  <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                    selectedEnseignant.Est_Chef_Dep ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedEnseignant.Est_Chef_Dep ? 'Chef de département' : 'Enseignant'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Nom</label>
                  <p className="text-gray-900">{selectedEnseignant.Nom_Ens}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Prénom</label>
                  <p className="text-gray-900">{selectedEnseignant.Prenom_Ens}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-gray-900">{selectedEnseignant.Email_Ens}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Téléphone</label>
                  <p className="text-gray-900">{selectedEnseignant.Telephone_Ens || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Grade</label>
                  <p className="text-gray-900">{selectedEnseignant.Grade_Ens}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Spécialité</label>
                <p className="text-gray-900">{selectedEnseignant.Specialite || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Département</label>
                <p className="text-gray-900">
                  {selectedEnseignant.departement
                    ? `${selectedEnseignant.departement.Nom_Dep} (${selectedEnseignant.departement.Code_Dep})`
                    : 'Non assigné'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Disponibilité pour encadrement</label>
                <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                  selectedEnseignant.Disponible_Encadrement ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedEnseignant.Disponible_Encadrement ? 'Disponible' : 'Indisponible'}
                </span>
              </div>

              {selectedEnseignant.Date_Creation && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Date de création</label>
                  <p className="text-gray-900">
                    {new Date(selectedEnseignant.Date_Creation).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedEnseignant(null);
                }}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && selectedEnseignant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Modifier l'enseignant</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedEnseignant(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Matricule (non modifiable)
                  </label>
                  <Input
                    value={selectedEnseignant.Matricule_Ens}
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
                    setSelectedEnseignant(null);
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

      {/* Carte d'aide Import/Export */}
      <Card>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Guide d'import/export des enseignants
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <FileDown className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900">Télécharger le modèle :</strong> Obtenez un fichier Excel avec le format requis incluant des exemples de données.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Upload className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900">Importer :</strong> Créez plusieurs comptes enseignants en une fois. Le système valide automatiquement les emails et grades.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900">Exporter Excel :</strong> Téléchargez la liste complète avec toutes les informations (matricule, grades, départements, etc.).
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900">Exporter PDF :</strong> Générez un document officiel avec statistiques et tableau complet pour impression.
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-xs text-gray-600">
              <strong>Note :</strong> Les colonnes obligatoires sont : Nom, Prénom, Email, Grade.
              Grades valides : Professeur, Maitre de Conferences, Charge de Cours, Assistant.
            </p>
          </div>
        </div>
      </Card>
    </Layout>
  );
}
