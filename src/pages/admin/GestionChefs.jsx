import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { PasswordGenerator } from '../../components/common/PasswordGenerator';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';
import { Plus, UserCheck, Building, Mail, Phone, Award, UserPlus, Eye, Edit, X } from 'lucide-react';

export default function GestionChefs() {
  const [departements, setDepartements] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedChef, setSelectedChef] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create' ou 'assign'
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    grade: 'Professeur',
    specialite: '',
    departementId: '',
    password: 'chef123'
  });
  const [selectedDepartement, setSelectedDepartement] = useState('');
  const [selectedEnseignant, setSelectedEnseignant] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [depsResponse, ensResponse] = await Promise.all([
        axios.get(ENDPOINTS.ADMIN_DEPARTEMENTS),
        axios.get(ENDPOINTS.ADMIN_ENSEIGNANTS)
      ]);
      setDepartements(depsResponse.data.data || []);
      setEnseignants(ensResponse.data.data || []);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setModalMode('create');
    setShowModal(true);
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      grade: 'Professeur',
      specialite: '',
      departementId: '',
      password: 'chef123'
    });
  };

  const handleAssignExisting = () => {
    setModalMode('assign');
    setShowModal(true);
    setSelectedDepartement('');
    setSelectedEnseignant('');
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(ENDPOINTS.CREATE_CHEF, {
        ...formData,
        departementId: parseInt(formData.departementId)
      });
      toast.success('Chef de département créé et assigné avec succès');
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création du chef');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAssign = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.put(ENDPOINTS.REPLACER_CHEF(parseInt(selectedDepartement)), {
        nouveauChefMatricule: selectedEnseignant
      });
      toast.success('Enseignant nommé chef avec succès');
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la nomination');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetirerChef = async (departementId, nomDep) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir retirer le chef du département "${nomDep}" ? Le département deviendra inactif.`)) {
      return;
    }

    try {
      await axios.delete(ENDPOINTS.RETIRER_CHEF(departementId));
      toast.success('Chef retiré avec succès');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du retrait du chef');
    }
  };

  // ==================== VOIR DÉTAILS ====================

  const handleView = (chef) => {
    setSelectedChef(chef);
    setShowViewModal(true);
  };

  // ==================== MODIFIER ====================

  const handleEdit = (chef) => {
    setSelectedChef(chef);
    setFormData({
      nom: chef.Nom_Ens,
      prenom: chef.Prenom_Ens,
      email: chef.Email_Ens,
      telephone: chef.Telephone_Ens || '',
      grade: chef.Grade_Ens,
      specialite: chef.Specialite || '',
      departementId: '',
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

      await axios.put(ENDPOINTS.CHEF_UPDATE_ENSEIGNANT(selectedChef.Matricule_Ens), updateData);
      toast.success('Chef de département modifié avec succès');
      setShowEditModal(false);
      setSelectedChef(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setSubmitting(false);
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

  const departementsActifs = departements.filter(d => d.Id_Chef);
  const departementsInactifs = departements.filter(d => !d.Id_Chef);

  // Enseignants disponibles pour être nommés chef (non-chefs actuellement)
  const enseignantsDisponibles = enseignants.filter(e => !e.Est_Chef_Dep);

  // Filtrer les enseignants du département sélectionné
  const enseignantsDuDepartement = selectedDepartement
    ? enseignantsDisponibles.filter(e => e.Id_Dep === parseInt(selectedDepartement))
    : [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Gestion des Chefs de Département</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Créer et assigner des chefs aux départements</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              onClick={handleAssignExisting}
              disabled={departementsInactifs.length === 0}
              variant="secondary"
              className="w-full sm:w-auto text-sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">Nommer un</span> enseignant
            </Button>
            <Button
              onClick={handleCreateNew}
              disabled={departementsInactifs.length === 0}
              className="w-full sm:w-auto text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">Créer un</span> nouveau chef
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Building className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Départements actifs</p>
                <p className="text-2xl font-bold">{departementsActifs.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <Building className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Départements sans chef</p>
                <p className="text-2xl font-bold">{departementsInactifs.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total départements</p>
                <p className="text-2xl font-bold">{departements.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Départements avec chef */}
        {departementsActifs.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Building className="w-5 h-5 text-green-600" />
              Départements actifs ({departementsActifs.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departementsActifs.map((dep) => (
                <Card key={dep.Id_Dep}>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{dep.Nom_Dep}</h3>
                        <p className="text-sm text-gray-500">Code: {dep.Code_Dep}</p>
                        <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded mt-2">
                          Actif
                        </span>
                      </div>
                    </div>

                    {dep.chef && (
                      <div className="border-t pt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <UserCheck className="w-4 h-4 text-primary-600" />
                          <span className="font-medium text-sm">Chef de département</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">{dep.chef.Prenom_Ens} {dep.chef.Nom_Ens}</p>
                          <p className="text-gray-600 flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {dep.chef.Grade_Ens}
                          </p>
                          <p className="text-gray-600">Matricule: {dep.Id_Chef}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t">
                      <button
                        onClick={() => handleView(dep.chef)}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                        Voir
                      </button>
                      <button
                        onClick={() => handleEdit(dep.chef)}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRetirerChef(dep.Id_Dep, dep.Nom_Dep)}
                        className="flex-1"
                      >
                        Retirer
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Départements sans chef */}
        {departementsInactifs.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Building className="w-5 h-5 text-red-600" />
              Départements sans chef ({departementsInactifs.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departementsInactifs.map((dep) => (
                <Card key={dep.Id_Dep}>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{dep.Nom_Dep}</h3>
                      <p className="text-sm text-gray-500">Code: {dep.Code_Dep}</p>
                      <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded mt-2">
                        Inactif - Pas de chef
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600">
                        Ce département nécessite un chef pour devenir actif.
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {departements.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <Building className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Aucun département trouvé</p>
              <p className="text-sm text-gray-400 mt-2">Créez d'abord des départements avant d'assigner des chefs</p>
            </div>
          </Card>
        )}
      </div>

      {/* Modal - Créer nouveau chef */}
      {showModal && modalMode === 'create' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Créer un nouveau chef de département</h2>

            <form onSubmit={handleSubmitCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Département *
                  </label>
                  <select
                    value={formData.departementId}
                    onChange={(e) => setFormData({ ...formData, departementId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Sélectionner un département</option>
                    {departementsInactifs.map(dep => (
                      <option key={dep.Id_Dep} value={dep.Id_Dep}>
                        {dep.Nom_Dep} ({dep.Code_Dep})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Seuls les départements sans chef sont listés</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nomo@ens.cm"
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
                    placeholder="NOMO"
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
                    placeholder="André"
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
                    placeholder="Informatique"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <PasswordGenerator
                    value={formData.password || 'chef123'}
                    onChange={(password) => setFormData({ ...formData, password })}
                    label="Mot de passe"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>📧 Important:</strong> Un email avec les identifiants de connexion sera automatiquement envoyé au chef de département.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
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
                  {submitting ? 'Création...' : 'Créer et assigner'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Nommer enseignant existant */}
      {showModal && modalMode === 'assign' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Nommer un enseignant existant comme chef</h2>

            <form onSubmit={handleSubmitAssign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Département *
                </label>
                <select
                  value={selectedDepartement}
                  onChange={(e) => {
                    setSelectedDepartement(e.target.value);
                    setSelectedEnseignant('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Sélectionner un département</option>
                  {departementsInactifs.map(dep => (
                    <option key={dep.Id_Dep} value={dep.Id_Dep}>
                      {dep.Nom_Dep} ({dep.Code_Dep})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Seuls les départements sans chef sont listés</p>
              </div>

              {selectedDepartement && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enseignant *
                  </label>
                  <select
                    value={selectedEnseignant}
                    onChange={(e) => setSelectedEnseignant(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Sélectionner un enseignant</option>
                    {enseignantsDuDepartement.map(ens => (
                      <option key={ens.Matricule_Ens} value={ens.Matricule_Ens}>
                        {ens.Prenom_Ens} {ens.Nom_Ens} - {ens.Grade_Ens} ({ens.Email_Ens})
                      </option>
                    ))}
                  </select>
                  {enseignantsDuDepartement.length === 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      Aucun enseignant disponible dans ce département. Créez d'abord des enseignants.
                    </p>
                  )}
                  {enseignantsDuDepartement.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {enseignantsDuDepartement.length} enseignant(s) disponible(s) dans ce département
                    </p>
                  )}
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> L'enseignant sélectionné doit appartenir au département choisi.
                  Seuls les enseignants non-chefs sont affichés.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !selectedEnseignant}
                  className="flex-1"
                >
                  {submitting ? 'Nomination...' : 'Nommer comme chef'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de visualisation */}
      {showViewModal && selectedChef && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold">Détails du chef de département</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedChef(null);
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
                  <p className="text-gray-900 font-medium">{selectedChef.Matricule_Ens}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Statut</label>
                  <span className="inline-block px-3 py-1 rounded text-sm font-medium bg-yellow-100 text-yellow-800">
                    Chef de département
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Nom</label>
                  <p className="text-gray-900">{selectedChef.Nom_Ens}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Prénom</label>
                  <p className="text-gray-900">{selectedChef.Prenom_Ens}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-gray-900">{selectedChef.Email_Ens}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Téléphone</label>
                  <p className="text-gray-900">{selectedChef.Telephone_Ens || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Grade</label>
                  <p className="text-gray-900">{selectedChef.Grade_Ens}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Spécialité</label>
                <p className="text-gray-900">{selectedChef.Specialite || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Département</label>
                <p className="text-gray-900">
                  {selectedChef.departement
                    ? `${selectedChef.departement.Nom_Dep} (${selectedChef.departement.Code_Dep})`
                    : '-'}
                </p>
              </div>

              {selectedChef.Date_Creation && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Date de création</label>
                  <p className="text-gray-900">
                    {new Date(selectedChef.Date_Creation).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedChef(null);
                }}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && selectedChef && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Modifier le chef de département</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedChef(null);
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
                    value={selectedChef.Matricule_Ens}
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
                    setSelectedChef(null);
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
