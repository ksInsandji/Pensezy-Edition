import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../../components/layout/Layout';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import {
  Archive,
  Calendar,
  Database,
  AlertTriangle,
  CheckCircle,
  Eye,
  Trash2,
  RefreshCw,
  TrendingUp,
  Users,
  FileText,
  Award,
  BarChart3
} from 'lucide-react';

const Archivage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statistiques, setStatistiques] = useState([]);
  const [anneeSelectionnee, setAnneeSelectionnee] = useState(null);
  const [encadrementsArchives, setEncadrementsArchives] = useState([]);
  const [loadingArchivage, setLoadingArchivage] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionEnCours, setActionEnCours] = useState(null);

  useEffect(() => {
    chargerStatistiques();
  }, []);

  const chargerStatistiques = async () => {
    try {
      setLoading(true);
      const response = await axios.get(ENDPOINTS.ARCHIVAGE_STATISTIQUES);
      setStatistiques(response.data.data);
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
      alert('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const chargerEncadrementsArchives = async (annee) => {
    try {
      setLoadingArchivage(true);
      const response = await axios.get(ENDPOINTS.ARCHIVAGE_ENCADREMENTS(annee));
      setEncadrementsArchives(response.data.data);
      setAnneeSelectionnee(annee);
    } catch (error) {
      console.error('Erreur chargement encadrements archivés:', error);
      alert('Erreur lors du chargement des encadrements archivés');
    } finally {
      setLoadingArchivage(false);
    }
  };

  const archiverAnnee = async (annee, commentaire = '') => {
    try {
      setLoadingArchivage(true);
      const response = await axios.post(ENDPOINTS.ARCHIVAGE_ARCHIVER, {
        anneeAcademique: annee,
        commentaire
      });

      alert(response.data.message);
      setShowConfirmation(false);
      setActionEnCours(null);

      // Recharger les statistiques
      await chargerStatistiques();
    } catch (error) {
      console.error('Erreur archivage:', error);
      alert(error.response?.data?.message || 'Erreur lors de l\'archivage');
    } finally {
      setLoadingArchivage(false);
    }
  };

  const nettoyerAnnee = async (annee) => {
    if (!window.confirm(`⚠️ ATTENTION : Cette action supprimera définitivement tous les encadrements de l'année ${annee}.\n\nÊtes-vous absolument sûr de vouloir continuer ?`)) {
      return;
    }

    try {
      setLoadingArchivage(true);
      const response = await axios.post(ENDPOINTS.ARCHIVAGE_NETTOYER, {
        anneeAcademique: annee
      });

      alert(response.data.message);
    } catch (error) {
      console.error('Erreur nettoyage:', error);
      alert(error.response?.data?.message || 'Erreur lors du nettoyage');
    } finally {
      setLoadingArchivage(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Archivage des Encadrements
            </h1>
            <p className="text-primary-100">
              Département: {user?.departement || 'Tous'}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-3">
            <Archive className="w-5 h-5 text-primary-600" />
            <div>
              <div className="text-xs text-gray-600">Archives disponibles</div>
              <div className="text-xl font-bold text-gray-900">{statistiques.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Guide d'utilisation */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Processus d'archivage</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ol className="list-decimal list-inside space-y-1">
                <li>Vérifier que l'année académique est bien terminée</li>
                <li>Cliquer sur "Archiver" pour créer une copie des données</li>
                <li>Les données restent consultables dans les archives</li>
                <li>Optionnel: Nettoyer les données originales (libère l'espace)</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des statistiques par année */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Années Archivées</h2>
        </div>

        {statistiques.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune archive disponible</p>
            <p className="text-sm mt-2">Archivez une année académique pour commencer</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Année
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Encadrements
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Étudiants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enseignants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Soutenances
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Moyenne
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Archivage
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statistiques.map((stat) => (
                  <tr key={stat.Annee_Academique} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {stat.Annee_Academique}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {stat.Nb_Encadrements}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Users className="w-4 h-4 text-gray-400 mr-1" />
                        {stat.Nb_Etudiants}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Users className="w-4 h-4 text-gray-400 mr-1" />
                        {stat.Nb_Enseignants}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {stat.Nb_Soutenances || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {stat.Moyenne_Notes ? `${stat.Moyenne_Notes}/20` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(stat.Date_Dernier_Archivage)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => chargerEncadrementsArchives(stat.Annee_Academique)}
                        className="text-primary-600 hover:text-primary-900 inline-flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Voir
                      </button>
                      <button
                        onClick={() => nettoyerAnnee(stat.Annee_Academique)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                        disabled={loadingArchivage}
                      >
                        <Trash2 className="w-4 h-4" />
                        Nettoyer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bouton pour archiver nouvelle année */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Archiver une Nouvelle Année
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Année académique à archiver
            </label>
            <input
              type="text"
              placeholder="ex: 2023-2024"
              className="max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              id="annee-archivage"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaire (optionnel)
            </label>
            <textarea
              placeholder="Ajouter un commentaire sur cette année..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="3"
              id="commentaire-archivage"
            />
          </div>
          <button
            onClick={() => {
              const annee = document.getElementById('annee-archivage').value;
              const commentaire = document.getElementById('commentaire-archivage').value;
              if (!annee) {
                alert('Veuillez saisir une année académique');
                return;
              }
              setActionEnCours({ annee, commentaire });
              setShowConfirmation(true);
            }}
            disabled={loadingArchivage}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Archive className="w-5 h-5" />
            {loadingArchivage ? 'Archivage en cours...' : 'Archiver cette année'}
          </button>
        </div>
      </div>

      {/* Modal de confirmation */}
      {showConfirmation && actionEnCours && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmer l'archivage
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Vous êtes sur le point d'archiver l'année académique{' '}
              <span className="font-semibold">{actionEnCours.annee}</span>.
              <br /><br />
              Cette opération créera une copie permanente de tous les encadrements de cette année.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setActionEnCours(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={loadingArchivage}
              >
                Annuler
              </button>
              <button
                onClick={() => archiverAnnee(actionEnCours.annee, actionEnCours.commentaire)}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                disabled={loadingArchivage}
              >
                {loadingArchivage ? 'En cours...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal détails encadrements archivés */}
      {anneeSelectionnee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Archives - {anneeSelectionnee}</h3>
                  <p className="text-primary-100 text-sm mt-1">
                    {encadrementsArchives.length} encadrement(s) archivé(s)
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAnneeSelectionnee(null);
                    setEncadrementsArchives([]);
                  }}
                  className="text-white hover:bg-primary-700 rounded-full p-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {loadingArchivage ? (
              <div className="p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Étudiant
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Enseignant
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Filière
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Thème
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Statut
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Note
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {encadrementsArchives.map((enc, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-gray-900">
                              {enc.Nom_Etudiant} {enc.Prenom_Etudiant}
                            </div>
                            <div className="text-xs text-gray-500">{enc.Matricule_Etud}</div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-gray-900">
                              {enc.Nom_Enseignant} {enc.Prenom_Enseignant}
                            </div>
                            <div className="text-xs text-gray-500">{enc.Grade_Enseignant}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {enc.Filiere || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                            {enc.Titre_Theme || 'Non défini'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              enc.Statut_Final === 'soutenu' ? 'bg-green-100 text-green-800' :
                              enc.Statut_Final === 'valide' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {enc.Statut_Final}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {enc.Note_Finale ? (
                              <div>
                                <div className="font-medium text-gray-900">{enc.Note_Finale}/20</div>
                                {enc.Mention_Obtenue && (
                                  <div className="text-xs text-gray-500">{enc.Mention_Obtenue}</div>
                                )}
                              </div>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default Archivage;
