import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { Building, Users, UserCheck, Settings, Plus, UserPlus } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anneeAcademique, setAnneeAcademique] = useState('');

  useEffect(() => {
    fetchAnneeAcademique();
    fetchStats();
  }, []);

  const fetchAnneeAcademique = async () => {
    try {
      const response = await axios.get(ENDPOINTS.ANNEE_COURANTE);
      setAnneeAcademique(response.data.data.annee);
    } catch (error) {
      console.error('Erreur chargement année académique:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(ENDPOINTS.ADMIN_STATS);
      setStats(response.data.data);
    } catch (error) {
      console.error('Erreur:', error);
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
  
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card onClick={() => navigate('/admin/departements')} hoverable>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-blue-100 rounded-full flex-shrink-0">
                <Building className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-500 truncate">Départements</p>
                <p className="text-xl md:text-2xl font-bold">{stats?.totalDepartements || 0}</p>
              </div>
            </div>
          </Card>

          <Card onClick={() => navigate('/admin/enseignants')} hoverable>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-green-100 rounded-full flex-shrink-0">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-500 truncate">Étudiants</p>
                <p className="text-xl md:text-2xl font-bold">{stats?.totalEtudiants || 0}</p>
              </div>
            </div>
          </Card>

          <Card onClick={() => navigate('/admin/enseignants')} hoverable>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-purple-100 rounded-full flex-shrink-0">
                <UserCheck className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-500 truncate">Enseignants</p>
                <p className="text-xl md:text-2xl font-bold">{stats?.totalEnseignants || 0}</p>
              </div>
            </div>
          </Card>

          <Card onClick={() => navigate('/admin/annee-academique')} hoverable>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-yellow-100 rounded-full flex-shrink-0">
                <Settings className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-500 truncate">Année</p>
                <p className="text-lg md:text-xl font-bold">{stats?.anneeAcademique || anneeAcademique}</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Actions rapides">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <button
                onClick={() => navigate('/admin/departements')}
                className="p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0"
              >
                <Building className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 sm:mb-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm sm:text-base">Départements</p>
                  <p className="text-xs sm:text-sm text-gray-500">Gérer les départements</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/admin/chefs')}
                className="p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0"
              >
                <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 sm:mb-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm sm:text-base">Chefs de département</p>
                  <p className="text-xs sm:text-sm text-gray-500">Créer et assigner</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/admin/enseignants')}
                className="p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0"
              >
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 sm:mb-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm sm:text-base">Enseignants</p>
                  <p className="text-xs sm:text-sm text-gray-500">Voir tous les enseignants</p>
                </div>
              </button>
            </div>
          </Card>
          
          <Card title="Statistiques globales">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Soutenances cette année</span>
                <span className="font-bold">{stats?.soutenances || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Taux d'encadrement</span>
                <span className="font-bold">{stats?.tauxEncadrement || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Moyenne générale</span>
                <span className="font-bold">{stats?.moyenneGenerale || '-'}/20</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
