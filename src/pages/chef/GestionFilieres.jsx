import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, BookOpen, Users } from 'lucide-react';

export default function GestionFilieres() {
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedFiliere, setSelectedFiliere] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    code: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFilieres();
  }, []);

  const fetchFilieres = async () => {
    try {
      // Charger les filières et les étudiants en parallèle
      const [filieresRes, etudiantsRes] = await Promise.all([
        axios.get(ENDPOINTS.CHEF_FILIERES),
        axios.get(ENDPOINTS.CHEF_ETUDIANTS)
      ]);

      const filieresData = filieresRes.data.data || [];
      const etudiantsData = etudiantsRes.data.data || [];

      // Compter le nombre d'étudiants par filière
      const filieresAvecComptage = filieresData.map(filiere => {
        const nbEtudiants = etudiantsData.filter(
          etud => etud.Id_Fil === filiere.Id_Fil
        ).length;
        return { ...filiere, nbEtudiants };
      });

      setFilieres(filieresAvecComptage);
    } catch (error) {
      toast.error('Erreur lors du chargement des filières');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditMode(false);
    setSelectedFiliere(null);
    setFormData({ nom: '', code: '' });
    setShowModal(true);
  };

  const handleEditClick = (filiere) => {
    setEditMode(true);
    setSelectedFiliere(filiere);
    setFormData({
      nom: filiere.Nom_Fil,
      code: filiere.Code_Fil || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editMode) {
        await axios.put(ENDPOINTS.CHEF_UPDATE_FILIERE(selectedFiliere.Id_Fil), formData);
        toast.success('Filière modifiée avec succès');
      } else {
        await axios.post(ENDPOINTS.CHEF_CREATE_FILIERE, formData);
        toast.success('Filière créée avec succès');
      }
      setShowModal(false);
      fetchFilieres();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (filiere) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la filière "${filiere.Nom_Fil}" ?`)) {
      return;
    }

    try {
      await axios.delete(ENDPOINTS.CHEF_DELETE_FILIERE(filiere.Id_Fil));
      toast.success('Filière supprimée avec succès');
      fetchFilieres();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Filières</h1>
            <p className="text-gray-500 mt-1">
              Gérez les filières de votre département
            </p>
          </div>
          <Button onClick={handleCreateClick}>
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle filière
          </Button>
        </div>

        {/* Alert si aucune filière */}
        {filieres.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-900">Aucune filière trouvée</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Votre département n'a pas encore de filière. Créez au moins une filière pour pouvoir ajouter des étudiants.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Liste des filières */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filieres.map((filiere) => (
            <Card key={filiere.Id_Fil} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {filiere.Nom_Fil}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                      <span className="font-medium">Code:</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold">
                        {filiere.Code_Fil}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="font-medium">{filiere.nbEtudiants || 0}</span>
                      <span className="text-gray-500">étudiant{(filiere.nbEtudiants || 0) !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <BookOpen className="w-8 h-8 text-primary-500" />
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEditClick(filiere)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(filiere)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Modal de création/édition */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">
                {editMode ? 'Modifier la filière' : 'Nouvelle filière'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la filière *
                  </label>
                  <Input
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Ex: Informatique, Mathématiques, Physique..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code de la filière
                  </label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: INFO, MATH, PHYS (laissez vide pour génération auto)"
                    maxLength={20}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Si non renseigné, un code sera généré automatiquement à partir du nom
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
                    {submitting ? 'Enregistrement...' : (editMode ? 'Modifier' : 'Créer')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
