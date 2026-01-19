import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { Users, FileText, CheckCircle, Clock, AlertCircle, Gavel, User, Mail, Phone, Calendar } from 'lucide-react';

export default function EnseignantDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [location.pathname]); // Se rafraîchit quand l'URL change

  const fetchData = async () => {
    try {
      const [statsRes, demandesRes] = await Promise.all([
        axios.get(ENDPOINTS.ENSEIGNANT_STATS),
        axios.get(ENDPOINTS.ENSEIGNANT_DEMANDES)
      ]);
      // La réponse contient { enseignant, stats }, on extrait les deux
      setDashboard(statsRes.data.data);
      setDemandes(demandesRes.data.data || []);
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

  const stats = dashboard?.stats || {};
  const enseignant = dashboard?.enseignant || {};
  const quota = enseignant.quota || 5;
  const nbEncadres = stats.etudiantsEncadres || 0;
  const quotaPercentage = Math.round((nbEncadres / quota) * 100);

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête avec informations de l'enseignant */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  Bienvenue, {enseignant.Prenom_Ens} {enseignant.Nom_Ens}
                </h1>
                <p className="text-primary-100 mt-1">
                  {enseignant.Grade_Ens} • {enseignant.Specialite}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-primary-100">
                  {enseignant.Email_Ens && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{enseignant.Email_Ens}</span>
                    </div>
                  )}
                  {enseignant.Telephone_Ens && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{enseignant.Telephone_Ens}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de quota */}
        <Card>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                📊 Votre charge d'encadrement
              </h3>
              <span className="text-sm text-gray-500">
                Quota: {nbEncadres}/{quota} ({quotaPercentage}%)
              </span>
            </div>

            <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                  quotaPercentage >= 100 ? 'bg-red-500' :
                  quotaPercentage >= 80 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-700">
                {nbEncadres === 0 ? 'Aucun étudiant encadré' :
                 nbEncadres === quota ? '✅ Quota atteint' :
                 `${quota - nbEncadres} place${quota - nbEncadres > 1 ? 's' : ''} disponible${quota - nbEncadres > 1 ? 's' : ''}`}
              </div>
            </div>

            {quotaPercentage >= 100 && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Quota maximum atteint</p>
                  <p className="text-red-600 mt-1">
                    Vous n'apparaissez plus dans la liste des encadreurs disponibles.
                    Contactez le chef de département si vous souhaitez augmenter votre quota.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card onClick={() => navigate('/enseignant/etudiants')} hoverable>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-blue-100 rounded-full flex-shrink-0">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-500 truncate">Étudiants encadrés</p>
                <p className="text-xl md:text-2xl font-bold">{stats.etudiantsEncadres || 0}</p>
              </div>
            </div>
          </Card>

          <Card onClick={() => navigate('/enseignant/demandes')} hoverable>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-yellow-100 rounded-full flex-shrink-0">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-500 truncate">Demandes en attente</p>
                <p className="text-xl md:text-2xl font-bold">{stats.demandesEnAttente || 0}</p>
              </div>
            </div>
          </Card>

          <Card onClick={() => navigate('/enseignant/etudiants')} hoverable>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-green-100 rounded-full flex-shrink-0">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-500 truncate">Thèmes validés</p>
                <p className="text-xl md:text-2xl font-bold">{stats.themesValides || 0}</p>
              </div>
            </div>
          </Card>

          <Card onClick={() => navigate('/enseignant/jurys')} hoverable>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-indigo-100 rounded-full flex-shrink-0">
                <Gavel className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-500 truncate">Jurys à venir</p>
                <p className="text-xl md:text-2xl font-bold">{stats.jurysAVenir || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Demandes d'encadrement récentes */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              📥 Demandes d'encadrement récentes
            </h3>
            {demandes.length > 0 && (
              <button
                onClick={() => navigate('/enseignant/demandes')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Voir toutes →
              </button>
            )}
          </div>

          {demandes.length > 0 ? (
            <div className="space-y-3">
              {demandes.slice(0, 5).map((demande) => (
                <div
                  key={demande.Id_Encadrement}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate('/enseignant/demandes')}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {demande.etudiant?.Prenom_Etud} {demande.etudiant?.Nom_Etud}
                      </p>
                      <p className="text-sm text-gray-500 truncate" title={demande.theme?.Titre}>
                        {demande.theme?.Titre || 'Thème non spécifié'}
                      </p>
                      {demande.Date_Demande && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(demande.Date_Demande).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-4 ${
                    demande.Statut_Encadrement === 'Demande_Envoyee'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {demande.Statut_Encadrement === 'Demande_Envoyee' ? 'En attente' : 'Validé'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Aucune demande d'encadrement</p>
              <p className="text-sm text-gray-400 mt-1">
                Les étudiants peuvent vous choisir comme encadreur lorsqu'ils proposent leurs thèmes
              </p>
            </div>
          )}
        </Card>

        {/* Actions rapides */}
        <Card title="⚡ Actions rapides">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/enseignant/demandes')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="font-medium text-sm">Demandes</p>
              {stats.demandesEnAttente > 0 && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  {stats.demandesEnAttente} nouvelle{stats.demandesEnAttente > 1 ? 's' : ''}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate('/enseignant/etudiants')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium text-sm">Mes étudiants</p>
              <p className="text-xs text-gray-500 mt-1">{stats.etudiantsEncadres || 0} étudiant{stats.etudiantsEncadres > 1 ? 's' : ''}</p>
            </button>

            <button
              onClick={() => navigate('/enseignant/jurys')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <Gavel className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="font-medium text-sm">Jurys</p>
              {stats.jurysAVenir > 0 && (
                <p className="text-xs text-gray-500 mt-1">{stats.jurysAVenir} à venir</p>
              )}
            </button>
          </div>
        </Card>

        {/* Conseils */}
        {nbEncadres === 0 && stats.demandesEnAttente === 0 && (
          <Card>
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">💡 Conseils en attendant les demandes</p>
                <ul className="space-y-1 text-blue-700 list-disc list-inside">
                  <li>Consultez les anciens mémoires pour vous inspirer</li>
                  <li>Préparez des sujets de recherche intéressants dans votre domaine</li>
                  <li>Soyez disponible pour conseiller les étudiants</li>
                  <li>Les demandes arrivent généralement en novembre-décembre</li>
                </ul>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
