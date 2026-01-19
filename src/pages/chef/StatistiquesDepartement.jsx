import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import {
  Users,
  TrendingUp,
  Award,
  Target,
  BarChart3,
  PieChart,
  ArrowLeft,
  Download,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const StatistiquesDepartement = () => {
  const navigate = useNavigate();

  // États
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [anneeAcademique, setAnneeAcademique] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [activeTab, setActiveTab] = useState('filieres'); // 'filieres' ou 'enseignants'

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
      const response = await axios.get(ENDPOINTS.ANNEE_COURANTE);
      setAnneeAcademique(response.data.data.annee);
    } catch (error) {
      console.error('Erreur chargement année académique:', error);
    }
  };

  const chargerStatistiques = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${ENDPOINTS.STATS_DEPARTEMENT}?anneeAcademique=${anneeAcademique}`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
      alert('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data, key) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      return sortConfig.direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-primary-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-primary-600" />
    );
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

  const { vueEnsemble, parFiliere, parEnseignant, parGrade, evolution, topEnseignants } = stats;

  return (
    <Layout>
      <div className="space-y-6">
      {/* En-tête */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/chef/dashboard')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Statistiques du Département</h1>
            <p className="text-gray-600 mt-2">
              Vue complète des encadrements et affectations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={anneeAcademique}
              onChange={(e) => setAnneeAcademique(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2022-2023">2022-2023</option>
            </select>
            <button
              onClick={() => navigate('/chef/exports')}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Étudiants */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800">{vueEnsemble.Nb_Etudiants_Total}</p>
              <p className="text-sm text-gray-500">Étudiants</p>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Avec choix:</span>
              <span className="font-medium text-green-600">{vueEnsemble.Nb_Etudiants_Avec_Choix}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Affectés:</span>
              <span className="font-medium text-blue-600">{vueEnsemble.Nb_Etudiants_Affectes}</span>
            </div>
          </div>
        </div>

        {/* Taux affectation */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800">{vueEnsemble.tauxAffectation}%</p>
              <p className="text-sm text-gray-500">Taux affectation</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-green-600"
              style={{ width: `${vueEnsemble.tauxAffectation}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {vueEnsemble.Nb_Etudiants_Affectes} / {vueEnsemble.Nb_Etudiants_Total} étudiants
          </p>
        </div>

        {/* Enseignants */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800">{vueEnsemble.Nb_Enseignants_Total}</p>
              <p className="text-sm text-gray-500">Enseignants</p>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Actifs:</span>
              <span className="font-medium text-purple-600">{vueEnsemble.Nb_Enseignants_Actifs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Encadrements:</span>
              <span className="font-medium">{vueEnsemble.Nb_Encadrements_Total}</span>
            </div>
          </div>
        </div>

        {/* Satisfaction choix 1 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800">{vueEnsemble.tauxSatisfactionChoix1}%</p>
              <p className="text-sm text-gray-500">Choix 1 obtenus</p>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Choix 2:</span>
              <span className="font-medium">{vueEnsemble.Nb_Choix2_Retenus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Choix 3:</span>
              <span className="font-medium">{vueEnsemble.Nb_Choix3_Retenus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Évolution historique */}
        {evolution && evolution.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Évolution historique
            </h2>
            <div className="flex items-end justify-around h-48 border-b border-gray-200">
              {evolution.map((e, index) => {
                const maxValue = Math.max(...evolution.map(i => parseInt(i.Nb_Encadrements)));
                const height = (parseInt(e.Nb_Encadrements) / maxValue) * 100;

                return (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div className="text-sm font-medium text-gray-800">{e.Nb_Encadrements}</div>
                    <div
                      className="w-12 bg-primary-600 rounded-t transition-all hover:bg-primary-700"
                      style={{ height: `${height}%`, minHeight: '20px' }}
                    ></div>
                    <div className="text-xs text-gray-500 text-center">{e.Annee_Academique}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Répartition par grade */}
        {parGrade && parGrade.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Répartition par grade
            </h2>
            <div className="space-y-3">
              {parGrade.map((grade, index) => {
                const totalEnseignants = parGrade.reduce((sum, g) => sum + parseInt(g.Nb_Enseignants), 0);
                const percentage = ((parseInt(grade.Nb_Enseignants) / totalEnseignants) * 100).toFixed(1);

                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{grade.Grade_Ens}</span>
                      <span className="text-gray-600">{grade.Nb_Enseignants} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-primary-600"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{grade.Nb_Encadrements} encadrements</span>
                      <span>Quota moy: {grade.Quota_Moyen ? parseFloat(grade.Quota_Moyen).toFixed(1) : 'N/A'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Top enseignants */}
      {topEnseignants && topEnseignants.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Top 10 Enseignants (par nombre d'encadrements)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topEnseignants.map((ens, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  index === 0 ? 'bg-yellow-100 text-yellow-600' :
                  index === 1 ? 'bg-gray-100 text-gray-600' :
                  index === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-blue-100 text-blue-600'
                } font-bold`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{ens.Nom_Ens} {ens.Prenom_Ens}</p>
                  <p className="text-sm text-gray-500">{ens.Grade_Ens}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary-600">{ens.Nb_Encadrements}</p>
                  <p className="text-xs text-gray-500">encadrements</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('filieres')}
              className={`py-4 px-4 font-medium transition-colors ${
                activeTab === 'filieres'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Statistiques par Filière ({parFiliere.length})
            </button>
            <button
              onClick={() => setActiveTab('enseignants')}
              className={`py-4 px-4 font-medium transition-colors ${
                activeTab === 'enseignants'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Statistiques par Enseignant ({parEnseignant.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Tableau par filière */}
          {activeTab === 'filieres' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('Nom_Fil')}>
                        <div className="flex items-center gap-1">
                        Filière
                        <SortIcon columnKey="Nom_Fil" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Niveau</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('Nb_Etudiants')}>
                      <div className="flex items-center gap-1">
                        Étudiants
                        <SortIcon columnKey="Nb_Etudiants" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('Nb_Affectes')}>
                      <div className="flex items-center gap-1">
                        Affectés
                        <SortIcon columnKey="Nb_Affectes" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('tauxAffectation')}>
                      <div className="flex items-center gap-1">
                        Taux %
                        <SortIcon columnKey="tauxAffectation" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Choix 1</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Choix 2</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Choix 3</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hors choix</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getSortedData(parFiliere, sortConfig.key).map((fil) => (
                    <tr key={fil.Id_Fil} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{fil.Nom_Fil}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {fil.Niveau === 'master_1' ? 'M1' : fil.Niveau === 'master_2' ? 'M2' : fil.Niveau}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{fil.Nb_Etudiants}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{fil.Nb_Affectes}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{fil.tauxAffectation}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-green-600"
                              style={{ width: `${fil.tauxAffectation}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">{fil.Nb_Choix1}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">{fil.Nb_Choix2}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">{fil.Nb_Choix3}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">{fil.Nb_Hors_Choix}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tableau par enseignant */}
          {activeTab === 'enseignants' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('Nom_Ens')}>
                      <div className="flex items-center gap-1">
                        Enseignant
                        <SortIcon columnKey="Nom_Ens" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('Quota')}>
                      <div className="flex items-center gap-1">
                        Quota
                        <SortIcon columnKey="Quota" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('Nb_Encadrements')}>
                      <div className="flex items-center gap-1">
                        Encadrements
                        <SortIcon columnKey="Nb_Encadrements" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('tauxRemplissage')}>
                      <div className="flex items-center gap-1">
                        Taux %
                        <SortIcon columnKey="tauxRemplissage" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('totalDemandes')}>
                      <div className="flex items-center gap-1">
                        Demandes
                        <SortIcon columnKey="totalDemandes" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Choix 1</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Choix 2</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Choix 3</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dispo</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getSortedData(parEnseignant, sortConfig.key).map((ens) => (
                    <tr key={ens.Matricule_Ens} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{ens.Nom_Ens} {ens.Prenom_Ens}</p>
                          <p className="text-xs text-gray-500">{ens.Matricule_Ens}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ens.Grade_Ens}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{ens.Quota || 'Illimité'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{ens.Nb_Encadrements}</td>
                      <td className="px-4 py-3">
                        {ens.tauxRemplissage ? (
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${
                              parseFloat(ens.tauxRemplissage) >= 100 ? 'text-red-600' :
                              parseFloat(ens.tauxRemplissage) >= 80 ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {ens.tauxRemplissage}%
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  parseFloat(ens.tauxRemplissage) >= 100 ? 'bg-red-600' :
                                  parseFloat(ens.tauxRemplissage) >= 80 ? 'bg-yellow-600' :
                                  'bg-green-600'
                                }`}
                                style={{ width: `${Math.min(parseFloat(ens.tauxRemplissage), 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{ens.totalDemandes}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">{ens.Nb_Demandes_Choix1}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">{ens.Nb_Demandes_Choix2}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">{ens.Nb_Demandes_Choix3}</td>
                      <td className="px-4 py-3">
                        {ens.Disponible_Encadrement ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Oui
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            Non
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default StatistiquesDepartement;
