import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';
import { User, BookOpen, FileText, ChevronRight, Calendar, Award } from 'lucide-react';

export default function EtudiantsEncadres() {
  const navigate = useNavigate();
  const location = useLocation();
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEtudiants();
  }, [location.pathname]); // Se rafraîchit quand l'URL change

  const fetchEtudiants = async () => {
    try {
      const response = await axios.get(ENDPOINTS.ENSEIGNANT_ETUDIANTS);
      setEtudiants(response.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des étudiants');
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes étudiants encadrés</h1>
            <p className="text-gray-500 mt-1">
              {etudiants.length} étudiant{etudiants.length > 1 ? 's' : ''} sous votre encadrement
            </p>
          </div>
        </div>

        <Card>
          {etudiants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {etudiants.map((encadrement) => {
              const etudiant = encadrement.etudiant;
              if (!etudiant) return null;

              return (
                <div
                  key={encadrement.Id_Encadrement}
                  onClick={() => navigate(`/enseignant/etudiants/${etudiant.Matricule_Etud}`)}
                  className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary-500 hover:shadow-lg transition-all group"
                >
                  {/* En-tête avec avatar et nom */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {etudiant.Prenom_Etud} {etudiant.Nom_Etud}
                        </h3>
                        <p className="text-xs text-gray-500">{etudiant.Matricule_Etud}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  </div>

                  {/* Informations compactes */}
                  <div className="space-y-2">
                    {/* Filière */}
                    {etudiant.filiere && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{etudiant.filiere.Nom_Fil}</span>
                      </div>
                    )}

                    {/* Statut encadrement */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        encadrement.Statut_Encadrement === 'Valide'
                          ? 'bg-green-100 text-green-800'
                          : encadrement.Statut_Encadrement === 'Accepte_Encadreur'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {encadrement.Statut_Encadrement === 'Valide' ? '✅ Validé' :
                         encadrement.Statut_Encadrement === 'Accepte_Encadreur' ? '⏳ En attente chef' :
                         encadrement.Statut_Encadrement}
                      </span>
                    </div>

                    {/* Statut du thème */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                      <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      {encadrement.theme ? (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          encadrement.theme.Statut_Theme === 'Valide'
                            ? 'bg-green-100 text-green-800'
                            : encadrement.theme.Statut_Theme === 'Propose'
                            ? 'bg-yellow-100 text-yellow-800'
                            : encadrement.theme.Statut_Theme === 'Refuse'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {encadrement.theme.Statut_Theme === 'Valide' ? 'Thème validé' :
                           encadrement.theme.Statut_Theme === 'Propose' ? 'Thème à valider' :
                           encadrement.theme.Statut_Theme === 'Refuse' ? 'Thème refusé' :
                           encadrement.theme.Statut_Theme}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Aucun thème</span>
                      )}
                    </div>

                    {/* Date de soutenance si disponible */}
                    {encadrement.jury && (
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                        <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-xs text-blue-700 font-medium">
                          Soutenance: {new Date(encadrement.jury.Date_Soutenance).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}

                    {/* Statut Soutenu avec note */}
                    {etudiant.Statut_Etudiant === 'Soutenu' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-green-700 flex-shrink-0" />
                            <span className="text-xs font-semibold text-green-800">Mémoire soutenu</span>
                          </div>
                          {encadrement.jury?.Note_Finale && (
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-800">{encadrement.jury.Note_Finale}/20</p>
                              {encadrement.jury.Mention && (
                                <p className="text-xs text-green-700">{encadrement.jury.Mention}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Badge d'action si thème à valider */}
                  {encadrement.theme?.Statut_Theme === 'Propose' && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                        <span className="font-medium">⚡ Action requise</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          ) : (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Aucun étudiant encadré pour le moment</p>
              <p className="text-sm text-gray-400 mt-1">
                Les étudiants que vous acceptez apparaîtront ici
              </p>
            </div>
          )}
        </Card>

        {/* Note informative */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            💡 <strong>Astuce :</strong> Cliquez sur un étudiant pour voir tous les détails de son encadrement, consulter son thème complet et effectuer des actions (validation, commentaires, etc.)
          </p>
        </div>
      </div>
    </Layout>
  );
}
