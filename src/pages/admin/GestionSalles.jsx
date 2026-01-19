import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import axios from '../../api/axios';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Search, MapPin, Users, Building } from 'lucide-react';

export default function GestionSalles() {
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    idSalle: null,
    nomSalle: '',
    capacite: '',
    typeSalle: 'Salle'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSalles();
  }, []);

  const fetchSalles = async () => {
    try {
      const response = await axios.get('/salles');
      setSalles(response.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des salles');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setFormData({
      idSalle: null,
      nomSalle: '',
      capacite: '',
      typeSalle: 'Salle'
    });
    setEditMode(false);
    setShowModal(true);
  };

  const handleEditClick = (salle) => {
    setFormData({
      idSalle: salle.Id_Salle,
      nomSalle: salle.Nom_Salle,
      capacite: salle.Capacite || '',
      typeSalle: salle.Type_Salle
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editMode) {
        await axios.put(`/salles/${formData.idSalle}`, {
          nomSalle: formData.nomSalle,
          capacite: formData.capacite ? parseInt(formData.capacite) : null,
          typeSalle: formData.typeSalle
        });
        toast.success('Salle modifiée avec succès');
      } else {
        await axios.post('/salles', {
          nomSalle: formData.nomSalle,
          capacite: formData.capacite ? parseInt(formData.capacite) : null,
          typeSalle: formData.typeSalle
        });
        toast.success('Salle créée avec succès');
      }

      setShowModal(false);
      fetchSalles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (idSalle, nomSalle) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la salle "${nomSalle}" ?`)) {
      return;
    }

    try {
      await axios.delete(`/salles/${idSalle}`);
      toast.success('Salle supprimée avec succès');
      fetchSalles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleToggleDisponibilite = async (idSalle) => {
    try {
      await axios.patch(`/salles/${idSalle}/toggle`);
      toast.success('Disponibilité modifiée');
      fetchSalles();
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  // Filtrage
  const filteredSalles = salles.filter(salle =>
    searchTerm === '' ||
    salle.Nom_Salle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salle.Type_Salle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistiques
  const stats = {
    total: salles.length,
    disponibles: salles.filter(s => s.Disponible).length,
    amphitheatres: salles.filter(s => s.Type_Salle === 'Amphi').length,
    sallesStandard: salles.filter(s => s.Type_Salle === 'Salle').length
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestion des salles</h1>
          <Button onClick={handleCreateClick}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une salle
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <ToggleRight className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Disponibles</p>
                <p className="text-2xl font-bold">{stats.disponibles}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Amphithéâtres</p>
                <p className="text-2xl font-bold">{stats.amphitheatres}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Salles standard</p>
                <p className="text-2xl font-bold">{stats.sallesStandard}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Barre de recherche */}
        <Card>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une salle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </Card>

        {/* Liste des salles */}
        <Card>
          {filteredSalles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSalles.map((salle) => (
                    <tr key={salle.Id_Salle} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">{salle.Nom_Salle}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          salle.Type_Salle === 'Amphi'
                            ? 'bg-purple-100 text-purple-800'
                            : salle.Type_Salle === 'Labo'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {salle.Type_Salle}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {salle.Capacite ? `${salle.Capacite} places` : 'Non définie'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          salle.Disponible
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {salle.Disponible ? 'Disponible' : 'Indisponible'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleToggleDisponibilite(salle.Id_Salle)}
                            className="text-blue-600 hover:text-blue-900"
                            title={salle.Disponible ? 'Désactiver' : 'Activer'}
                          >
                            {salle.Disponible ? (
                              <ToggleRight className="w-5 h-5" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditClick(salle)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Modifier"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(salle.Id_Salle, salle.Nom_Salle)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucune salle trouvée</p>
            </div>
          )}
        </Card>
      </div>

      {/* Modal création/modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {editMode ? 'Modifier la salle' : 'Ajouter une salle'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la salle *
                </label>
                <Input
                  type="text"
                  value={formData.nomSalle}
                  onChange={(e) => setFormData({ ...formData, nomSalle: e.target.value })}
                  placeholder="Ex: Amphi 400, Salle TD4"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de salle *
                </label>
                <select
                  value={formData.typeSalle}
                  onChange={(e) => setFormData({ ...formData, typeSalle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="Salle">Salle</option>
                  <option value="Amphi">Amphithéâtre</option>
                  <option value="Labo">Laboratoire</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacité (optionnel)
                </label>
                <Input
                  type="number"
                  value={formData.capacite}
                  onChange={(e) => setFormData({ ...formData, capacite: e.target.value })}
                  placeholder="Nombre de places"
                  min="1"
                />
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
                  {submitting ? 'Enregistrement...' : (editMode ? 'Modifier' : 'Créer')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
