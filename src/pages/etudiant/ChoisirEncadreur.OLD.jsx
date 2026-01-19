import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';
import { User, Mail, Phone, GraduationCap, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

export default function ChoisirEncadreur() {
  const navigate = useNavigate();
  const [enseignants, setEnseignants] = useState([]);
  const [encadrementEnCours, setEncadrementEnCours] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEncadreur, setSelectedEncadreur] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [enseignantsRes, dashboardRes] = await Promise.all([
        axios.get(ENDPOINTS.ETUDIANT_ENSEIGNANTS),
        axios.get(ENDPOINTS.ETUDIANT_DASHBOARD)
      ]);

      setEnseignants(enseignantsRes.data.data);

      // Vérifier s'il y a un encadrement en cours (pas refusé, pas clôturé)
      const encadrement = dashboardRes.data.data?.encadrement;
      if (encadrement && encadrement.Statut_Encadrement !== 'Refuse' && !encadrement.Date_Cloture) {
        setEncadrementEnCours(encadrement);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChoix = async () => {
    if (!selectedEncadreur) {
      toast.warning('Veuillez sélectionner un encadreur');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(ENDPOINTS.ETUDIANT_ENCADREMENT, {
        matriculeEnseignant: selectedEncadreur
      });
      toast.success('Demande d\'encadrement envoyée avec succès');
      navigate('/etudiant/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de l\'envoi de la demande';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnnuler = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette demande d\'encadrement ?')) {
      return;
    }

    try {
      setSubmitting(true);
      // Annuler = supprimer l'encadrement
      await axios.delete(`${ENDPOINTS.ETUDIANT_ENCADREMENT}/${encadrementEnCours.Id_Encadrement}`);
      toast.success('Demande annulée avec succès');
      // Recharger les données
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation');
    } finally {
      setSubmitting(false);
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
  
  // Si une demande est en cours, afficher son état
  if (encadrementEnCours) {
    const statut = encadrementEnCours.Statut_Encadrement;
    const enseignant = encadrementEnCours.enseignant;

    return (
      <Layout>
        <div className="space-y-6">
          <Card title="Votre encadrement">
            <div className={`p-6 rounded-lg border-2 ${
              statut === 'Demande_Envoyee' ? 'bg-yellow-50 border-yellow-300' :
              statut === 'Accepte_Encadreur' ? 'bg-blue-50 border-blue-300' :
              statut === 'Valide' ? 'bg-green-50 border-green-300' :
              'bg-gray-50 border-gray-300'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  statut === 'Demande_Envoyee' ? 'bg-yellow-100' :
                  statut === 'Accepte_Encadreur' ? 'bg-blue-100' :
                  statut === 'Valide' ? 'bg-green-100' :
                  'bg-gray-100'
                }`}>
                  {statut === 'Demande_Envoyee' ? <Clock className="w-8 h-8 text-yellow-600" /> :
                   statut === 'Accepte_Encadreur' ? <CheckCircle className="w-8 h-8 text-blue-600" /> :
                   statut === 'Valide' ? <CheckCircle className="w-8 h-8 text-green-600" /> :
                   <User className="w-8 h-8 text-gray-600" />}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {enseignant.Prenom_Ens} {enseignant.Nom_Ens}
                  </h3>
                  <p className="text-gray-700 mb-4">{enseignant.Grade_Ens}</p>

                  <div className="space-y-2 mb-4">
                    {enseignant.Specialite && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <GraduationCap className="w-4 h-4" />
                        <span>{enseignant.Specialite}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{enseignant.Email_Ens}</span>
                    </div>
                    {enseignant.Telephone_Ens && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{enseignant.Telephone_Ens}</span>
                      </div>
                    )}
                  </div>

                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    statut === 'Demande_Envoyee' ? 'bg-yellow-100 text-yellow-800' :
                    statut === 'Accepte_Encadreur' ? 'bg-blue-100 text-blue-800' :
                    statut === 'Valide' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {statut === 'Demande_Envoyee' ? '⏳ En attente de réponse de l\'enseignant' :
                     statut === 'Accepte_Encadreur' ? '✅ Accepté par l\'enseignant - En attente validation chef' :
                     statut === 'Valide' ? '🎉 Encadrement validé par le chef de département' :
                     statut}
                  </div>

                  <p className="text-sm text-gray-500 mt-3">
                    Demande envoyée le {new Date(encadrementEnCours.Date_Demande).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              {statut === 'Demande_Envoyee' && (
                <div className="mt-6 pt-6 border-t border-gray-300">
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-700">
                        <p className="font-medium mb-1">Votre demande est en cours de traitement</p>
                        <p>L'enseignant va examiner votre thème et répondre dans les 48-72 heures. Vous pouvez annuler votre demande si vous souhaitez choisir un autre encadreur.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      onClick={handleAnnuler}
                      loading={submitting}
                      className="w-full sm:w-auto text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Annuler la demande
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/etudiant/dashboard')} className="w-full sm:w-auto">
                      Retour au dashboard
                    </Button>
                  </div>
                </div>
              )}

              {statut === 'Accepte_Encadreur' && (
                <div className="mt-6 pt-6 border-t border-blue-300">
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-700">
                        <p className="font-medium mb-1">Félicitations ! L'enseignant a accepté de vous encadrer</p>
                        <p>Le chef de département doit maintenant valider officiellement cet encadrement. Vous serez notifié une fois la validation effectuée.</p>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" onClick={() => navigate('/etudiant/dashboard')} className="w-full sm:w-auto">
                    Retour au dashboard
                  </Button>
                </div>
              )}

              {statut === 'Valide' && (
                <div className="mt-6 pt-6 border-t border-green-300">
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-700">
                        <p className="font-medium mb-1 text-green-900">🎉 Excellent ! Votre encadrement est validé</p>
                        <p className="mb-3">L'enseignant et le chef de département ont tous deux validé votre encadrement. Vous pouvez maintenant travailler sur votre mémoire avec votre encadreur.</p>

                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                          <p className="font-medium text-green-900 mb-2">📋 Prochaines étapes :</p>
                          <ul className="space-y-1 text-sm text-green-800">
                            <li>✅ Contactez régulièrement votre encadreur pour des séances de travail</li>
                            <li>✅ Soumettez votre thème pour validation si ce n'est pas encore fait</li>
                            <li>✅ Commencez la recherche bibliographique</li>
                            <li>✅ Élaborez un calendrier de travail avec votre encadreur</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {encadrementEnCours.Date_Validation && (
                    <p className="text-sm text-gray-500 mb-4">
                      Validé le {new Date(encadrementEnCours.Date_Validation).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  )}

                  <Button variant="outline" onClick={() => navigate('/etudiant/dashboard')} className="w-full sm:w-auto">
                    Retour au dashboard
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  // Sinon, afficher la liste des enseignants disponibles
  return (
    <Layout>
      <div className="space-y-6">
        <Card title="Choisir un encadreur">
          <p className="text-gray-600 mb-6">
            Sélectionnez un enseignant pour encadrer votre mémoire. Assurez-vous que sa spécialité
            correspond à votre thème de recherche.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enseignants.map((ens) => (
              <div
                key={ens.Matricule_Ens}
                onClick={() => setSelectedEncadreur(ens.Matricule_Ens)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedEncadreur === ens.Matricule_Ens
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {ens.Prenom_Ens} {ens.Nom_Ens}
                      </h3>
                      <p className="text-sm text-gray-500">{ens.Grade_Ens}</p>
                    </div>
                  </div>
                  {selectedEncadreur === ens.Matricule_Ens && (
                    <CheckCircle className="w-6 h-6 text-primary-600" />
                  )}
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  {ens.Specialite && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      <span>{ens.Specialite}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{ens.Email_Ens}</span>
                  </div>
                  {ens.Telephone_Ens && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{ens.Telephone_Ens}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Places disponibles: {ens.Quota_Max - (ens._count?.encadrements || 0)} / {ens.Quota_Max}
                </div>
              </div>
            ))}
          </div>

          {enseignants.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun enseignant disponible pour le moment.
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button onClick={handleChoix} loading={submitting} disabled={!selectedEncadreur} className="w-full sm:w-auto">
              Envoyer la demande
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)} className="w-full sm:w-auto">
              Retour
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
