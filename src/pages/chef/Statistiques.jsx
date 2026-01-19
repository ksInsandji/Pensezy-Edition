import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { Users, FileText, UserCheck, Gavel, Building, Download, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ChefStatistiques() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    fetchStats();
  }, [selectedPeriod]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(ENDPOINTS.CHEF_STATS);
      setStats(response.data.data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    toast.info('Fonctionnalité d\'export PDF en développement');
  };

  const handleExportExcel = () => {
    toast.info('Fonctionnalité d\'export Excel en développement');
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

  const mainStats = [
    {
      label: 'Étudiants',
      value: stats?.totalEtudiants || 0,
      icon: Users,
      color: 'blue',
      description: 'Total des étudiants actifs'
    },
    {
      label: 'Enseignants',
      value: stats?.totalEnseignants || 0,
      icon: UserCheck,
      color: 'green',
      description: 'Enseignants du département'
    },
    {
      label: 'Thèmes en attente',
      value: stats?.themesEnAttente || 0,
      icon: FileText,
      color: 'yellow',
      description: 'Thèmes proposés non validés'
    },
    {
      label: 'Encadrements actifs',
      value: stats?.encadrementsActifs || 0,
      icon: Building,
      color: 'purple',
      description: 'Encadrements en cours'
    },
    {
      label: 'Jurys créés',
      value: stats?.jurysCrees || 0,
      icon: Gavel,
      color: 'indigo',
      description: 'Jurys de soutenance créés'
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  };

  const bgColorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    purple: 'bg-purple-50 border-purple-200',
    indigo: 'bg-indigo-50 border-indigo-200',
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Statistiques et Rapports</h1>
            <p className="text-gray-500 mt-1">Vue d'ensemble détaillée du département</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Période de filtrage */}
        <Card>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Période:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Toute la période</option>
              <option value="current_year">Année académique en cours</option>
              <option value="last_month">Dernier mois</option>
              <option value="last_3_months">3 derniers mois</option>
            </select>
          </div>
        </Card>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {mainStats.map((stat) => (
            <Card key={stat.label} className={`border-2 ${bgColorClasses[stat.color]}`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-full ${colorClasses[stat.color]}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Détails par catégorie */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Répartition des étudiants */}
          <Card title="Répartition des étudiants">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Niveau 3 (Licence)</span>
                <span className="text-lg font-bold text-primary-600">{stats?.etudiantsNiveau3 || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Niveau 5 (Master)</span>
                <span className="text-lg font-bold text-primary-600">{stats?.etudiantsNiveau5 || 0}</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">{stats?.totalEtudiants || 0}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Taux d'encadrement */}
          <Card title="Taux d'encadrement">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Étudiants encadrés</span>
                <span className="text-lg font-bold text-green-600">{stats?.encadrementsActifs || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Étudiants sans encadrement</span>
                <span className="text-lg font-bold text-yellow-600">
                  {(stats?.totalEtudiants || 0) - (stats?.encadrementsActifs || 0)}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">Taux d'encadrement</span>
                  <span className="text-xl font-bold text-primary-600">
                    {stats?.totalEtudiants > 0
                      ? Math.round((stats?.encadrementsActifs / stats?.totalEtudiants) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* État des thèmes */}
          <Card title="État des thèmes">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Thèmes en attente</span>
                <span className="text-lg font-bold text-yellow-600">{stats?.themesEnAttente || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Thèmes validés</span>
                <span className="text-lg font-bold text-green-600">{stats?.themesValides || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Thèmes rejetés</span>
                <span className="text-lg font-bold text-red-600">{stats?.themesRefuses || 0}</span>
              </div>
            </div>
          </Card>

          {/* Soutenances */}
          <Card title="Soutenances">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Jurys créés</span>
                <span className="text-lg font-bold text-indigo-600">{stats?.jurysCrees || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Soutenances planifiées</span>
                <span className="text-lg font-bold text-blue-600">{stats?.soutenancesPlanifiees || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Soutenances effectuées</span>
                <span className="text-lg font-bold text-green-600">{stats?.soutenancesEffectuees || 0}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions rapides */}
        <Card title="Actions rapides">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/chef/comptes" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
              <Users className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="font-medium text-sm">Gérer les comptes</p>
            </a>
            <a href="/chef/encadrements" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
              <UserCheck className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="font-medium text-sm">Valider encadrements</p>
            </a>
            <a href="/chef/jurys" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
              <Gavel className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="font-medium text-sm">Gérer les jurys</p>
            </a>
            <a href="/chef/dashboard" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
              <TrendingUp className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="font-medium text-sm">Tableau de bord</p>
            </a>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
