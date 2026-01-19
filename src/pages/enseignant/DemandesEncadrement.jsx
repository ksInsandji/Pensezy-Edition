import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';
import { User, Mail, GraduationCap, Calendar, FileText, AlertCircle } from 'lucide-react';

export default function DemandesEncadrement() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    try {
      const response = await axios.get(ENDPOINTS.CHOIX_ENSEIGNANT_DEMANDES);
      // Le service retourne { demandes: [...], par_priorite: {...}, statistiques: {...} }
      setDemandes(response.data.data?.demandes || []);
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
      toast.error('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  // Note: Les enseignants ne peuvent pas accepter/refuser directement
  // C'est le chef de département qui fait l'affectation
  // Cette page sert uniquement à consulter les demandes reçues

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
        <Card title="Demandes d'encadrement">
          <div className="mb-6">
            <p className="text-gray-600">
              Vous avez <span className="font-semibold text-primary-600">{demandes.length}</span> demande(s) d'encadrement en attente de votre réponse.
            </p>
          </div>

          {demandes.length > 0 ? (
            <div className="space-y-6">
              {demandes.map((demande) => (
                <div key={demande.Id_Choix} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-primary-300 transition-all">
                  {/* En-tête avec info étudiant */}
                  <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {demande.etudiant.Prenom_Etud} {demande.etudiant.Nom_Etud}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Matricule:</span> {demande.etudiant.Matricule_Etud}
                          </p>
                          {demande.etudiant.Email_Etud && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4" />
                              <span>{demande.etudiant.Email_Etud}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        En attente
                      </span>
                    </div>
                  </div>

                  {/* Corps avec détails */}
                  <div className="p-6 space-y-4">
                    {/* Informations académiques */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
                      {demande.etudiant.filiere && (
                        <div className="flex items-center gap-3">
                          <GraduationCap className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Filière</p>
                            <p className="font-medium">{demande.etudiant.filiere.Nom_Fil}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Choix soumis le</p>
                          <p className="font-medium">
                            {new Date(demande.Date_Soumission).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Ordre de priorité */}
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                            {demande.Ordre_Priorite}
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Ordre de priorité</p>
                            <p className="font-semibold text-gray-900">
                              Choix n°{demande.Ordre_Priorite}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-xs text-gray-600">Statut</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              demande.Statut === 'affecte' ? 'bg-green-100 text-green-800' :
                              demande.Statut === 'rejete' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {demande.Statut === 'affecte' ? '✓ Affecté' :
                               demande.Statut === 'rejete' ? '✗ Rejeté' :
                               '⏳ En attente'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Zone d'information */}
                    <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-900">
                        <p className="font-medium mb-1">Information</p>
                        <p>
                          {demande.Statut === 'en_attente'
                            ? "Cette demande est en attente d'affectation par le chef de département."
                            : demande.Statut === 'affecte'
                            ? "Vous avez été officiellement affecté à cet étudiant par le chef de département."
                            : "Cette demande a été rejetée lors de l'affectation."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Aucune demande d'encadrement en attente</p>
              <p className="text-gray-400 text-sm mt-2">Les nouvelles demandes apparaîtront ici</p>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
