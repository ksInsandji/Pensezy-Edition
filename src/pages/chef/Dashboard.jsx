import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { Users, FileText, UserCheck, Gavel, Building, TrendingUp, Award, Calendar, Clock, CheckCircle, AlertCircle, Bell } from 'lucide-react';

export default function ChefDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [annees, setAnnees] = useState([]);
  const [annee1, setAnnee1] = useState('');
  const [annee2, setAnnee2] = useState('');
  const [comparisonData, setComparisonData] = useState(null);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [activites, setActivites] = useState([]);
  const [loadingActivites, setLoadingActivites] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchAnnees();
    fetchActivites();
  }, []);

  useEffect(() => {
    if (annee1 && annee2) {
      fetchComparison();
    }
  }, [annee1, annee2]);
  
  const fetchStats = async () => {
    try {
      const response = await axios.get(ENDPOINTS.CHEF_STATS);
      setStats(response.data.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnees = async () => {
    try {
      const response = await axios.get(ENDPOINTS.ANNEE_LISTE);
      const anneesData = response.data.data || [];
      setAnnees(anneesData);

      if (anneesData.length >= 2) {
        setAnnee1(anneesData[0]);
        setAnnee2(anneesData[1]);
      }
    } catch (error) {
      console.error('Erreur chargement années:', error);
    }
  };

  const fetchComparison = async () => {
    if (!annee1 || !annee2) return;

    setLoadingComparison(true);
    try {
      const [res1, res2] = await Promise.all([
        axios.get(`${ENDPOINTS.STATS_DEPARTEMENT}?annee=${annee1}`),
        axios.get(`${ENDPOINTS.STATS_DEPARTEMENT}?annee=${annee2}`)
      ]);

      setComparisonData({
        annee1: {
          annee: annee1,
          stats: res1.data.data
        },
        annee2: {
          annee: annee2,
          stats: res2.data.data
        }
      });
    } catch (error) {
      console.error('Erreur chargement comparaison:', error);
    } finally {
      setLoadingComparison(false);
    }
  };

  const fetchActivites = async () => {
    setLoadingActivites(true);
    try {
      const response = await axios.get(ENDPOINTS.NOTIFICATIONS);
      // Prendre les 5 dernières notifications
      setActivites((response.data.data || []).slice(0, 5));
    } catch (error) {
      console.error('Erreur chargement activités:', error);
    } finally {
      setLoadingActivites(false);
    }
  };

  const getActiviteIcon = (type) => {
    switch (type) {
      case 'encadrement':
      case 'affectation':
        return <UserCheck className="w-4 h-4 text-green-600" />;
      case 'theme':
      case 'validation':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'jury':
      case 'soutenance':
        return <Gavel className="w-4 h-4 text-purple-600" />;
      case 'alerte':
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
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
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord - Chef de département</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card onClick={() => navigate('/chef/comptes')} hoverable>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-blue-100 rounded-full flex-shrink-0">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-500 truncate">Étudiants</p>
                <p className="text-xl md:text-2xl font-bold">{stats?.totalEtudiants || 0}</p>
              </div>
            </div>
          </Card>

          <Card onClick={() => navigate('/chef/comptes')} hoverable>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-green-100 rounded-full flex-shrink-0">
                <UserCheck className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-500 truncate">Enseignants</p>
                <p className="text-xl md:text-2xl font-bold">{stats?.totalEnseignants || 0}</p>
              </div>
            </div>
          </Card>

          <Card onClick={() => navigate('/chef/encadrements')} hoverable>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-yellow-100 rounded-full flex-shrink-0">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-500 truncate">Thèmes en attente</p>
                <p className="text-xl md:text-2xl font-bold">{stats?.themesEnAttente || 0}</p>
              </div>
            </div>
          </Card>

          <Card onClick={() => navigate('/chef/encadrements')} hoverable>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-purple-100 rounded-full flex-shrink-0">
                <Building className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-500 truncate">Encadrements actifs</p>
                <p className="text-xl md:text-2xl font-bold">{stats?.encadrementsActifs || 0}</p>
              </div>
            </div>
          </Card>

          <Card onClick={() => navigate('/chef/jurys')} hoverable>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-indigo-100 rounded-full flex-shrink-0">
                <Gavel className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-500 truncate">Jurys créés</p>
                <p className="text-xl md:text-2xl font-bold">{stats?.jurysCrees || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Comparaison Multi-Années */}
        {annees.length >= 2 && (
          <Card title="Comparaison Multi-Années">
            <div className="space-y-6">
              {/* Sélecteurs d'années */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Année 1:</label>
                  <select
                    value={annee1}
                    onChange={(e) => setAnnee1(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {annees.map(annee => (
                      <option key={annee} value={annee}>{annee}</option>
                    ))}
                  </select>
                </div>

                <span className="text-gray-400 font-bold">vs</span>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Année 2:</label>
                  <select
                    value={annee2}
                    onChange={(e) => setAnnee2(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {annees.map(annee => (
                      <option key={annee} value={annee}>{annee}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Statistiques comparatives */}
              {loadingComparison ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : comparisonData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Colonne Année 1 */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-5 h-5 text-primary-600" />
                      <h3 className="font-bold text-lg text-gray-900">{comparisonData.annee1.annee}</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Étudiants</span>
                          </div>
                          <span className="text-2xl font-bold text-blue-600">
                            {comparisonData.annee1.stats?.totalEtudiants || 0}
                          </span>
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">Encadrements</span>
                          </div>
                          <span className="text-2xl font-bold text-green-600">
                            {comparisonData.annee1.stats?.totalEncadrements || 0}
                          </span>
                        </div>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-purple-600" />
                            <span className="text-sm font-medium text-gray-700">Soutenances</span>
                          </div>
                          <span className="text-2xl font-bold text-purple-600">
                            {comparisonData.annee1.stats?.totalSoutenances || 0}
                          </span>
                        </div>
                      </div>

                      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                            <span className="text-sm font-medium text-gray-700">Taux réussite</span>
                          </div>
                          <span className="text-2xl font-bold text-indigo-600">
                            {comparisonData.annee1.stats?.tauxReussite
                              ? `${comparisonData.annee1.stats.tauxReussite.toFixed(1)}%`
                              : '0%'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Colonne Année 2 */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-5 h-5 text-primary-600" />
                      <h3 className="font-bold text-lg text-gray-900">{comparisonData.annee2.annee}</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Étudiants</span>
                          </div>
                          <span className="text-2xl font-bold text-blue-600">
                            {comparisonData.annee2.stats?.totalEtudiants || 0}
                          </span>
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">Encadrements</span>
                          </div>
                          <span className="text-2xl font-bold text-green-600">
                            {comparisonData.annee2.stats?.totalEncadrements || 0}
                          </span>
                        </div>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-purple-600" />
                            <span className="text-sm font-medium text-gray-700">Soutenances</span>
                          </div>
                          <span className="text-2xl font-bold text-purple-600">
                            {comparisonData.annee2.stats?.totalSoutenances || 0}
                          </span>
                        </div>
                      </div>

                      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                            <span className="text-sm font-medium text-gray-700">Taux réussite</span>
                          </div>
                          <span className="text-2xl font-bold text-indigo-600">
                            {comparisonData.annee2.stats?.tauxReussite
                              ? `${comparisonData.annee2.stats.tauxReussite.toFixed(1)}%`
                              : '0%'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Sélectionnez deux années pour voir la comparaison
                </div>
              )}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Actions rapides">
            <div className="grid grid-cols-2 gap-4">
              <a href="/chef/comptes" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <Users className="w-8 h-8 text-primary-600 mb-2" />
                <p className="font-medium">Gestion des comptes</p>
                <p className="text-sm text-gray-500">Étudiants et enseignants</p>
              </a>
              <a href="/chef/encadrements" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <UserCheck className="w-8 h-8 text-primary-600 mb-2" />
                <p className="font-medium">Encadrements</p>
                <p className="text-sm text-gray-500">Valider les affectations</p>
              </a>
              <a href="/chef/jurys" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <Gavel className="w-8 h-8 text-primary-600 mb-2" />
                <p className="font-medium">Jurys</p>
                <p className="text-sm text-gray-500">Créer et gérer</p>
              </a>
              <a href="/chef/statistiques" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <FileText className="w-8 h-8 text-primary-600 mb-2" />
                <p className="font-medium">Rapports</p>
                <p className="text-sm text-gray-500">Statistiques et exports</p>
              </a>
            </div>
          </Card>
          
          <Card title="Activité récente">
            <div className="space-y-3">
              {loadingActivites ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              ) : activites.length > 0 ? (
                activites.map((activite, index) => (
                  <div
                    key={activite.Id_Notif || index}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      activite.Lue ? 'bg-gray-50' : 'bg-blue-50 border border-blue-100'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getActiviteIcon(activite.Type_Notif)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${activite.Lue ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                        {activite.Message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(activite.Date_Creation)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Aucune activité récente</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
