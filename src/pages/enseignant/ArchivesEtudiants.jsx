import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';
import {
  Users,
  Award,
  TrendingUp,
  Star,
  Search,
  Download,
  Calendar,
  FileText,
  Eye,
  Filter
} from 'lucide-react';

/**
 * Page Archives Étudiants - Historique complet des anciens étudiants
 *
 * Permet aux enseignants de consulter l'historique de tous leurs anciens étudiants
 * encadrés, tous départements confondus, avec :
 * - Sélection par année académique
 * - Filtres avancés (nom, statut, mention)
 * - Statistiques par année
 * - Export Excel
 *
 * Accessible aux enseignants et chefs de département
 */
export default function ArchivesEtudiants() {
  const [loading, setLoading] = useState(true);
  const [annees, setAnnees] = useState([]);
  const [selectedAnnee, setSelectedAnnee] = useState('');
  const [etudiants, setEtudiants] = useState([]);
  const [filteredEtudiants, setFilteredEtudiants] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('Tous');
  const [filterMention, setFilterMention] = useState('Toutes');
  const [selectedEtudiant, setSelectedEtudiant] = useState(null);

  useEffect(() => {
    fetchAnnees();
  }, []);

  useEffect(() => {
    if (selectedAnnee) {
      fetchArchives();
    }
  }, [selectedAnnee]);

  useEffect(() => {
    applyFilters();
  }, [etudiants, searchTerm, filterStatut, filterMention]);

  const fetchAnnees = async () => {
    try {
      const response = await axios.get(ENDPOINTS.ANNEE_LISTE);
      const anneesData = response.data.data || [];
      setAnnees(anneesData);

      if (anneesData.length > 0) {
        // Sélectionner l'année la plus récente par défaut
        setSelectedAnnee(anneesData[0]);
      }
    } catch (error) {
      console.error('Erreur chargement années:', error);
      toast.error('Erreur lors du chargement des années');
    } finally {
      setLoading(false);
    }
  };

  const fetchArchives = async () => {
    setLoading(true);
    try {
      // Simuler l'appel API - À remplacer par l'endpoint réel
      // const response = await axios.get(`${ENDPOINTS.ENSEIGNANT_ARCHIVES}?annee=${selectedAnnee}`);

      // Données de démonstration
      const mockData = [
        {
          Matricule_Etud: 'ETU001',
          Nom_Etudiant: 'Benali',
          Prenom_Etudiant: 'Fatima',
          Titre_Theme: 'Intelligence Artificielle et Apprentissage Automatique',
          Statut_Final: 'Soutenu',
          Note_Finale: 16.5,
          Mention_Obtenue: 'Bien',
          Date_Soutenance: '2024-07-15',
          Annee_Academique: selectedAnnee
        },
        {
          Matricule_Etud: 'ETU002',
          Nom_Etudiant: 'Messaoudi',
          Prenom_Etudiant: 'Karim',
          Titre_Theme: 'Développement d\'une application mobile e-commerce',
          Statut_Final: 'Soutenu',
          Note_Finale: 18.0,
          Mention_Obtenue: 'Très Bien',
          Date_Soutenance: '2024-07-12',
          Annee_Academique: selectedAnnee
        },
        {
          Matricule_Etud: 'ETU003',
          Nom_Etudiant: 'Hamid',
          Prenom_Etudiant: 'Sara',
          Titre_Theme: 'Système de gestion de bibliothèque numérique',
          Statut_Final: 'Soutenu',
          Note_Finale: 14.0,
          Mention_Obtenue: 'Assez Bien',
          Date_Soutenance: '2024-07-18',
          Annee_Academique: selectedAnnee
        }
      ];

      setEtudiants(mockData);
      calculateStats(mockData);
    } catch (error) {
      console.error('Erreur chargement archives:', error);
      toast.error('Erreur lors du chargement des archives');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalEncadres = data.length;
    const soutenancesReussies = data.filter(e => e.Statut_Final === 'Soutenu').length;
    const tauxReussite = totalEncadres > 0 ? (soutenancesReussies / totalEncadres) * 100 : 0;
    const nbMentions = data.filter(e => e.Mention_Obtenue).length;
    const moyenneNotes = data.reduce((sum, e) => sum + (e.Note_Finale || 0), 0) / (totalEncadres || 1);

    setStats({
      totalEncadres,
      soutenancesReussies,
      tauxReussite,
      nbMentions,
      moyenneNotes
    });
  };

  const applyFilters = () => {
    let filtered = [...etudiants];

    // Filtre par recherche (nom/prénom)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        e =>
          e.Nom_Etudiant.toLowerCase().includes(term) ||
          e.Prenom_Etudiant.toLowerCase().includes(term) ||
          e.Matricule_Etud.toLowerCase().includes(term)
      );
    }

    // Filtre par statut
    if (filterStatut !== 'Tous') {
      filtered = filtered.filter(e => e.Statut_Final === filterStatut);
    }

    // Filtre par mention
    if (filterMention !== 'Toutes') {
      filtered = filtered.filter(e => e.Mention_Obtenue === filterMention);
    }

    setFilteredEtudiants(filtered);
  };

  const handleExportExcel = () => {
    toast.info('Export Excel en cours de développement');
    // TODO: Implémenter export Excel
  };

  const handleViewDetails = (etudiant) => {
    setSelectedEtudiant(etudiant);
  };

  const getMentionColor = (mention) => {
    switch (mention) {
      case 'Très Bien':
        return 'bg-green-100 text-green-800';
      case 'Bien':
        return 'bg-blue-100 text-blue-800';
      case 'Assez Bien':
        return 'bg-yellow-100 text-yellow-800';
      case 'Passable':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && annees.length === 0) {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Archives - Mes Anciens Étudiants</h1>
            <p className="text-gray-500 mt-1">
              Historique de tous vos étudiants encadrés
            </p>
          </div>
          {filteredEtudiants.length > 0 && (
            <Button onClick={handleExportExcel} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter en Excel
            </Button>
          )}
        </div>

        {/* Sélecteur d'année */}
        <Card>
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <label className="font-medium text-gray-700">Année académique :</label>
            <select
              value={selectedAnnee}
              onChange={(e) => setSelectedAnnee(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {annees.map((annee) => (
                <option key={annee} value={annee}>
                  {annee}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Statistiques Année */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Encadrés</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEncadres}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Soutenances Réussies</p>
                  <p className="text-2xl font-bold text-green-600">{stats.soutenancesReussies}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Taux de Réussite</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.tauxReussite.toFixed(1)}%
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Moyenne Générale</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.moyenneNotes.toFixed(2)}/20
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filtres */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Filtres</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Rechercher
              </label>
              <Input
                type="text"
                placeholder="Nom, prénom ou matricule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="Tous">Tous</option>
                <option value="Soutenu">Soutenu</option>
                <option value="Abandonné">Abandonné</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mention</label>
              <select
                value={filterMention}
                onChange={(e) => setFilterMention(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="Toutes">Toutes</option>
                <option value="Très Bien">Très Bien</option>
                <option value="Bien">Bien</option>
                <option value="Assez Bien">Assez Bien</option>
                <option value="Passable">Passable</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Liste des étudiants */}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredEtudiants.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun étudiant trouvé pour cette année</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEtudiants.map((etud) => (
              <Card
                key={etud.Matricule_Etud}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewDetails(etud)}
              >
                <div className="space-y-3">
                  {/* En-tête étudiant */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">
                        {etud.Prenom_Etudiant} {etud.Nom_Etudiant}
                      </h3>
                      <p className="text-xs text-gray-500">{etud.Matricule_Etud}</p>
                    </div>
                    {etud.Note_Finale && (
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary-600">
                          {etud.Note_Finale}
                        </span>
                        <span className="text-sm text-gray-500">/20</span>
                      </div>
                    )}
                  </div>

                  {/* Thème */}
                  <div>
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <p className="text-sm text-gray-700 line-clamp-2">{etud.Titre_Theme}</p>
                    </div>
                  </div>

                  {/* Statut et Mention */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        etud.Statut_Final === 'Soutenu'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {etud.Statut_Final}
                    </span>
                    {etud.Mention_Obtenue && (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getMentionColor(
                          etud.Mention_Obtenue
                        )}`}
                      >
                        {etud.Mention_Obtenue}
                      </span>
                    )}
                  </div>

                  {/* Date soutenance */}
                  {etud.Date_Soutenance && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      Soutenu le{' '}
                      {new Date(etud.Date_Soutenance).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Détails Étudiant */}
        {selectedEtudiant && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedEtudiant(null)}
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedEtudiant.Prenom_Etudiant} {selectedEtudiant.Nom_Etudiant}
                  </h2>
                  <button
                    onClick={() => setSelectedEtudiant(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Matricule</p>
                    <p className="font-medium">{selectedEtudiant.Matricule_Etud}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Thème</p>
                    <p className="font-medium">{selectedEtudiant.Titre_Theme}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Statut final</p>
                      <span
                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                          selectedEtudiant.Statut_Final === 'Soutenu'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {selectedEtudiant.Statut_Final}
                      </span>
                    </div>

                    {selectedEtudiant.Note_Finale && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Note finale</p>
                        <p className="text-2xl font-bold text-primary-600">
                          {selectedEtudiant.Note_Finale}/20
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedEtudiant.Mention_Obtenue && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Mention obtenue</p>
                      <span
                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getMentionColor(
                          selectedEtudiant.Mention_Obtenue
                        )}`}
                      >
                        {selectedEtudiant.Mention_Obtenue}
                      </span>
                    </div>
                  )}

                  {selectedEtudiant.Date_Soutenance && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Date de soutenance</p>
                      <p className="font-medium">
                        {new Date(selectedEtudiant.Date_Soutenance).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Année académique</p>
                    <p className="font-medium">{selectedEtudiant.Annee_Academique}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={() => setSelectedEtudiant(null)}>Fermer</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
