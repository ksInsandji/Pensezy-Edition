import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import {
  Users,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Calendar,
  Mail,
  BookOpen,
  Target
} from 'lucide-react';

export const Statistiques = () => {
  const navigate = useNavigate();

  // États
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [anneeAcademique, setAnneeAcademique] = useState('');

  // Charger l'année académique et les statistiques
  useEffect(() => {
    fetchAnneeAcademique();
  }, []);

  useEffect(() => {
    if (anneeAcademique) {
      chargerStatistiques();
    }
  }, [anneeAcademique]);

  const fetchAnneeAcademique = async () => {
    try {
      const response = await api.get(ENDPOINTS.ANNEE_COURANTE);
      setAnneeAcademique(response.data.data.annee);
    } catch (error) {
      console.error('Erreur chargement année académique:', error);
    }
  };

  const chargerStatistiques = async () => {
    try {
      setLoading(true);
      const response = await api.get(`${ENDPOINTS.STATS_ENSEIGNANT}?anneeAcademique=${anneeAcademique}`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
      alert('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
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

  if (!stats) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Aucune statistique disponible</p>
        </div>
      </Layout>
    );
  }

  const { info, encadrements, demandes, stats: statsData, historique } = stats;

  // Calculer les demandes par priorité
  const demandesChoix1 = demandes.filter(d => d.Ordre_Priorite === 1);
  const demandesChoix2 = demandes.filter(d => d.Ordre_Priorite === 2);
  const demandesChoix3 = demandes.filter(d => d.Ordre_Priorite === 3);

  const getStatutBadge = (statut) => {
    const badges = {
      valide: { color: 'green', label: 'Validé', icon: CheckCircle },
      en_cours: { color: 'blue', label: 'En cours', icon: Clock },
      en_attente: { color: 'yellow', label: 'En attente', icon: AlertCircle },
      refuse: { color: 'red', label: 'Refusé', icon: XCircle }
    };

    const badge = badges[statut] || badges.en_attente;
    const Icon = badge.icon;

    return (
      <span className={`px-2 py-1 bg-${badge.color}-100 text-${badge.color}-800 text-xs rounded-full flex items-center gap-1 w-fit`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mes Statistiques</h1>
            <p className="text-gray-600 mt-2">
              Vue d'ensemble de vos encadrements et demandes reçues
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Année :</label>
            <select
              value={anneeAcademique}
              onChange={(e) => setAnneeAcademique(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2022-2023">2022-2023</option>
            </select>
          </div>
        </div>

        {/* Informations enseignant */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-primary-100 text-sm">Enseignant</p>
              <p className="text-xl font-bold">{info.Nom_Ens} {info.Prenom_Ens}</p>
            </div>
            <div>
              <p className="text-primary-100 text-sm">Grade</p>
              <p className="text-xl font-bold">{info.Grade_Ens}</p>
            </div>
            <div>
              <p className="text-primary-100 text-sm">Département</p>
              <p className="text-xl font-bold">{info.Departement}</p>
            </div>
            <div>
              <p className="text-primary-100 text-sm">Quota</p>
              <p className="text-xl font-bold">{info.Quota || 'Illimité'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Encadrements totaux */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800">{statsData.nbTotal}</p>
              <p className="text-sm text-gray-500">Encadrements</p>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Validés:</span>
              <span className="font-medium text-green-600">{statsData.Nb_Encadrements_Valides}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">En cours:</span>
              <span className="font-medium text-blue-600">{statsData.Nb_Encadrements_EnCours}</span>
            </div>
          </div>
        </div>

        {/* Taux de remplissage */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800">
                {statsData.tauxRemplissage ? `${statsData.tauxRemplissage}%` : 'N/A'}
              </p>
              <p className="text-sm text-gray-500">Taux remplissage</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                parseFloat(statsData.tauxRemplissage) >= 100
                  ? 'bg-red-600'
                  : parseFloat(statsData.tauxRemplissage) >= 80
                  ? 'bg-yellow-600'
                  : 'bg-green-600'
              }`}
              style={{ width: `${Math.min(parseFloat(statsData.tauxRemplissage) || 0, 100)}%` }}
            ></div>
          </div>
          {info.Quota && (
            <p className="text-xs text-gray-500 mt-2">
              {statsData.Nb_Encadrements_Valides} / {info.Quota} quota
            </p>
          )}
        </div>

        {/* Demandes reçues */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800">{statsData.totalDemandes}</p>
              <p className="text-sm text-gray-500">Demandes reçues</p>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Choix 1:</span>
              <span className="font-medium text-yellow-600">{statsData.Nb_Demandes_Choix1}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Choix 2:</span>
              <span className="font-medium text-blue-600">{statsData.Nb_Demandes_Choix2}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Choix 3:</span>
              <span className="font-medium text-gray-600">{statsData.Nb_Demandes_Choix3}</span>
            </div>
          </div>
        </div>

        {/* Choix retenus */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800">{statsData.Nb_Choix1_Retenus}</p>
              <p className="text-sm text-gray-500">Choix 1 retenus</p>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Choix 2:</span>
              <span className="font-medium">{statsData.Nb_Choix2_Retenus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Choix 3:</span>
              <span className="font-medium">{statsData.Nb_Choix3_Retenus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hors choix:</span>
              <span className="font-medium">{statsData.Nb_HorsChoix}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique historique */}
      {historique && historique.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Historique des encadrements
          </h2>
          <div className="flex items-end justify-around h-48 border-b border-gray-200">
            {historique.map((h, index) => {
              const maxValue = Math.max(...historique.map(i => parseInt(i.Nb_Encadrements)));
              const height = (parseInt(h.Nb_Encadrements) / maxValue) * 100;

              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="text-sm font-medium text-gray-800">{h.Nb_Encadrements}</div>
                  <div
                    className="w-16 bg-primary-600 rounded-t transition-all hover:bg-primary-700"
                    style={{ height: `${height}%`, minHeight: '20px' }}
                  ></div>
                  <div className="text-xs text-gray-500">{h.Annee_Academique}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Encadrements actuels */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Mes encadrements actuels ({encadrements.length})
          </h2>
        </div>
        <div className="p-6">
          {encadrements.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun encadrement pour cette année</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Étudiant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filière</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thème</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Choix</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {encadrements.map((enc) => (
                    <tr key={enc.Id_Encadrement} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{enc.Nom_Etud} {enc.Prenom_Etud}</p>
                          <p className="text-sm text-gray-500">{enc.Matricule_Etud}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-gray-900">{enc.Nom_Fil}</p>
                          <p className="text-xs text-gray-500">
                            {enc.Niveau === 'master_1' ? 'M1' : enc.Niveau === 'master_2' ? 'M2' : enc.Niveau}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900 max-w-xs truncate" title={enc.Titre_Theme}>
                          {enc.Titre_Theme || '-'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {enc.Choix_Retenu ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Choix {enc.Choix_Retenu}
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                            Hors choix
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {getStatutBadge(enc.Statut_Encadrement)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {enc.Date_Affectation ? new Date(enc.Date_Affectation).toLocaleDateString('fr-FR') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Demandes reçues */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Demandes reçues ({demandes.length})
          </h2>
        </div>
        <div className="p-6">
          {demandes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune demande reçue pour cette année</p>
          ) : (
            <div className="space-y-4">
              {/* Choix 1 */}
              {demandesChoix1.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Choix 1
                    </span>
                    ({demandesChoix1.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {demandesChoix1.map((dem) => (
                      <div key={dem.Id_Choix} className="border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-yellow-50">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{dem.Nom_Etud} {dem.Prenom_Etud}</p>
                            <p className="text-sm text-gray-500">{dem.Matricule_Etud}</p>
                          </div>
                          {dem.Statut === 'affecte' && <CheckCircle className="w-5 h-5 text-green-600" />}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{dem.Nom_Fil} - {dem.Niveau === 'master_1' ? 'M1' : 'M2'}</p>
                        {dem.Titre_Theme && (
                          <p className="text-xs text-gray-600 truncate" title={dem.Titre_Theme}>
                            <BookOpen className="w-3 h-3 inline mr-1" />
                            {dem.Titre_Theme}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Choix 2 */}
              {demandesChoix2.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Choix 2
                    </span>
                    ({demandesChoix2.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {demandesChoix2.map((dem) => (
                      <div key={dem.Id_Choix} className="border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-blue-50">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{dem.Nom_Etud} {dem.Prenom_Etud}</p>
                            <p className="text-sm text-gray-500">{dem.Matricule_Etud}</p>
                          </div>
                          {dem.Statut === 'affecte' && <CheckCircle className="w-5 h-5 text-green-600" />}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{dem.Nom_Fil} - {dem.Niveau === 'master_1' ? 'M1' : 'M2'}</p>
                        {dem.Titre_Theme && (
                          <p className="text-xs text-gray-600 truncate" title={dem.Titre_Theme}>
                            <BookOpen className="w-3 h-3 inline mr-1" />
                            {dem.Titre_Theme}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Choix 3 */}
              {demandesChoix3.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      Choix 3
                    </span>
                    ({demandesChoix3.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {demandesChoix3.map((dem) => (
                      <div key={dem.Id_Choix} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{dem.Nom_Etud} {dem.Prenom_Etud}</p>
                            <p className="text-sm text-gray-500">{dem.Matricule_Etud}</p>
                          </div>
                          {dem.Statut === 'affecte' && <CheckCircle className="w-5 h-5 text-green-600" />}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{dem.Nom_Fil} - {dem.Niveau === 'master_1' ? 'M1' : 'M2'}</p>
                        {dem.Titre_Theme && (
                          <p className="text-xs text-gray-600 truncate" title={dem.Titre_Theme}>
                            <BookOpen className="w-3 h-3 inline mr-1" />
                            {dem.Titre_Theme}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default Statistiques;
