import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { MessagingBox } from '../../components/messaging/MessagingBox';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import {
  User,
  FileText,
  Mail,
  Phone,
  BookOpen,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Calendar,
  Award,
  MessageSquare,
  AlertCircle,
  Edit3,
  RotateCcw,
  Target,
  TrendingUp
} from 'lucide-react';

export default function DetailEtudiant() {
  const { matricule } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [etudiant, setEtudiant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [commentaire, setCommentaire] = useState('');
  const [validerAvecReserves, setValiderAvecReserves] = useState(false);

  useEffect(() => {
    fetchEtudiant();
  }, [matricule]);

  const fetchEtudiant = async () => {
    try {
      const response = await axios.get(ENDPOINTS.ENSEIGNANT_ETUDIANTS);
      const etudiants = response.data.data || [];
      const found = etudiants.find(e => e.etudiant?.Matricule_Etud === matricule);

      if (!found) {
        toast.error('Étudiant non trouvé');
        navigate('/enseignant/etudiants');
        return;
      }

      setEtudiant(found);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const openThemeModal = (action) => {
    setActionType(action);
    setCommentaire(etudiant.theme?.Commentaire_Encadreur || '');
    setValiderAvecReserves(false);
    setShowThemeModal(true);
  };

  const handleThemeAction = async (e) => {
    e.preventDefault();

    if (!etudiant.theme) {
      toast.error('Aucun thème à traiter');
      return;
    }

    try {
      setSubmitting(true);
      const themeId = etudiant.theme.Id_Theme;

      if (actionType === 'valider') {
        await axios.post(`${ENDPOINTS.VALIDER_THEME(themeId)}/valider`, {
          commentaire,
          validerAvecReserves
        });
        toast.success(validerAvecReserves ? 'Thème validé avec réserves' : 'Thème validé avec succès');
      } else if (actionType === 'refuser') {
        if (!commentaire.trim()) {
          toast.warning('Veuillez indiquer un commentaire de refus');
          return;
        }
        await axios.post(`${ENDPOINTS.VALIDER_THEME(themeId)}/refuser`, { commentaire });
        toast.success('Thème refusé');
      } else if (actionType === 'modifier-avis') {
        await axios.post(ENDPOINTS.MODIFIER_AVIS_THEME(themeId), { commentaire });
        toast.success('Avis modifié avec succès');
      } else if (actionType === 'rouvrir') {
        if (!commentaire.trim()) {
          toast.warning('Veuillez indiquer un motif de réouverture');
          return;
        }
        await axios.post(ENDPOINTS.ROUVRIR_THEME(themeId), { motif: commentaire });
        toast.success('Thème réouvert avec succès');
      }

      setShowThemeModal(false);
      fetchEtudiant();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
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

  if (!etudiant) {
    return (
      <Layout>
        <Card>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <p className="text-gray-500">Étudiant non trouvé</p>
            <Button onClick={() => navigate('/enseignant/etudiants')} className="mt-4">
              Retour à la liste
            </Button>
          </div>
        </Card>
      </Layout>
    );
  }

  const student = etudiant.etudiant;
  const theme = etudiant.theme;

  // Déterminer les actions disponibles selon le statut
  const getActionsDisponibles = () => {
    if (!theme) return [];

    switch (theme.Statut_Theme) {
      case 'Propose':
        return ['valider', 'refuser'];
      case 'Valide':
      case 'Valide_Avec_Reserves':
        return ['modifier-avis', 'rouvrir'];
      case 'Refuse':
        return ['modifier-avis'];
      default:
        return [];
    }
  };

  const actionsDisponibles = getActionsDisponibles();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header avec bouton retour */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/enseignant/etudiants')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Détails de l'étudiant</h1>
        </div>

        {/* Informations de l'étudiant */}
        <Card title="Informations personnelles">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-12 h-12 text-primary-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {student.Prenom_Etud} {student.Nom_Etud}
              </h2>
              <p className="text-gray-600 mb-4">Matricule: {student.Matricule_Etud}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {student.filiere && (
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Filière</p>
                      <p className="font-medium">{student.filiere.Nom_Fil}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{student.Email_Etud}</p>
                  </div>
                </div>

                {student.Telephone_Etud && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Téléphone</p>
                      <p className="font-medium">{student.Telephone_Etud}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Statut encadrement</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      etudiant.Statut_Encadrement === 'Valide'
                        ? 'bg-green-100 text-green-800'
                        : etudiant.Statut_Encadrement === 'Accepte_Encadreur'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {etudiant.Statut_Encadrement === 'Valide' ? 'Validé' :
                       etudiant.Statut_Encadrement === 'Accepte_Encadreur' ? 'En attente validation chef' :
                       etudiant.Statut_Encadrement}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Thème proposé */}
        <Card title="Thème de mémoire">
          {theme ? (
            <div className="space-y-6">
              {/* Statut et actions */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-500">Statut du thème</p>
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium mt-1 ${
                      theme.Statut_Theme === 'Valide'
                        ? 'bg-green-100 text-green-800'
                        : theme.Statut_Theme === 'Valide_Avec_Reserves'
                        ? 'bg-blue-100 text-blue-800'
                        : theme.Statut_Theme === 'Propose'
                        ? 'bg-yellow-100 text-yellow-800'
                        : theme.Statut_Theme === 'Refuse'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {theme.Statut_Theme === 'Valide' ? '✅ Validé' :
                       theme.Statut_Theme === 'Valide_Avec_Reserves' ? '🔵 Validé avec réserves' :
                       theme.Statut_Theme === 'Propose' ? '⏳ En attente de validation' :
                       theme.Statut_Theme === 'Refuse' ? '❌ Refusé' :
                       theme.Statut_Theme}
                    </span>
                  </div>
                </div>

                {/* Actions selon le statut */}
                <div className="flex gap-3">
                  {actionsDisponibles.includes('valider') && (
                    <Button
                      onClick={() => openThemeModal('valider')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Valider
                    </Button>
                  )}

                  {actionsDisponibles.includes('refuser') && (
                    <Button
                      onClick={() => openThemeModal('refuser')}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Refuser
                    </Button>
                  )}

                  {actionsDisponibles.includes('modifier-avis') && (
                    <Button
                      onClick={() => openThemeModal('modifier-avis')}
                      variant="outline"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Modifier l'avis
                    </Button>
                  )}

                  {actionsDisponibles.includes('rouvrir') && (
                    <Button
                      onClick={() => openThemeModal('rouvrir')}
                      variant="outline"
                      className="border-orange-300 text-orange-600 hover:bg-orange-50"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Réouvrir
                    </Button>
                  )}
                </div>
              </div>

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre du thème</label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">{theme.Titre}</h3>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description et problématique</label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{theme.Description}</p>
                </div>
              </div>

              {/* Métadonnées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-600">Date de proposition</p>
                    <p className="text-sm font-medium text-blue-900">
                      {new Date(theme.Date_Proposition).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                {theme.Date_Modification && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-blue-600">Dernière modification</p>
                      <p className="text-sm font-medium text-blue-900">
                        {new Date(theme.Date_Modification).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Commentaire de l'encadreur */}
              {theme.Commentaire_Encadreur && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-900 mb-2">Votre commentaire</p>
                      <p className="text-sm text-amber-800 whitespace-pre-wrap">{theme.Commentaire_Encadreur}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Aucun thème proposé</p>
              <p className="text-sm text-gray-400 mt-2">
                L'étudiant n'a pas encore soumis de thème de mémoire
              </p>
            </div>
          )}
        </Card>

        {/* Plan de travail (Rétro-planning) */}
        {etudiant?.Statut_Encadrement === 'Valide' && etudiant?.Id_Encadrement && (
          <Card title="Plan de travail">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Suivi des jalons du mémoire</h3>
                  <p className="text-sm text-gray-600">
                    Gérez les étapes, les échéances et validez les livrables de l'étudiant
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate(`/enseignant/retro-planning/${etudiant.Id_Encadrement}`)}
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Accéder au plan
              </Button>
            </div>
          </Card>
        )}

        {/* Messagerie avec l'étudiant */}
        {etudiant?.Statut_Encadrement === 'Valide' && etudiant?.Id_Encadrement && (
          <MessagingBox
            idEncadrement={etudiant.Id_Encadrement}
            currentUser={{
              id: user?.Matricule_Ens,
              role: user?.role || 'enseignant'
            }}
          />
        )}
      </div>

      {/* Modal universel pour toutes les actions */}
      {showThemeModal && theme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              {actionType === 'valider' ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Valider le thème
                </>
              ) : actionType === 'refuser' ? (
                <>
                  <XCircle className="w-6 h-6 text-red-600" />
                  Refuser le thème
                </>
              ) : actionType === 'modifier-avis' ? (
                <>
                  <Edit3 className="w-6 h-6 text-blue-600" />
                  Modifier votre avis
                </>
              ) : (
                <>
                  <RotateCcw className="w-6 h-6 text-orange-600" />
                  Réouvrir le thème
                </>
              )}
            </h3>

            <div className={`mb-6 p-4 rounded-lg border ${
              actionType === 'valider' ? 'bg-green-50 border-green-200' :
              actionType === 'refuser' ? 'bg-red-50 border-red-200' :
              actionType === 'rouvrir' ? 'bg-orange-50 border-orange-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <h4 className="font-semibold text-gray-900 mb-2">{theme.Titre}</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{theme.Description}</p>
            </div>

            <form onSubmit={handleThemeAction}>
              {actionType === 'valider' && (
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      type="checkbox"
                      checked={validerAvecReserves}
                      onChange={(e) => setValiderAvecReserves(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-sm text-blue-900 font-medium">
                      🔵 Valider avec réserves (demander des améliorations mineures)
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-2 ml-6">
                    Si coché, le thème sera validé mais l'étudiant devra apporter des améliorations selon votre commentaire
                  </p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {actionType === 'valider' ? 'Commentaire / Avis' :
                   actionType === 'refuser' ? 'Raison du refus' :
                   actionType === 'rouvrir' ? 'Motif de réouverture' :
                   'Nouveau commentaire'}
                  {(actionType === 'refuser' || actionType === 'rouvrir') && <span className="text-red-500"> *</span>}
                </label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder={
                    actionType === 'valider'
                      ? "Ajoutez un commentaire (optionnel):\n- Félicitations\n- Suggestions d'amélioration\n- Points à développer\n- Axes de recherche recommandés"
                      : actionType === 'refuser'
                      ? "Expliquez la raison du refus:\n- Problèmes identifiés\n- Suggestions de correction\n- Pistes alternatives"
                      : actionType === 'rouvrir'
                      ? "Pourquoi réouvrir ce thème?\n- Changements requis\n- Nouvelles orientations\n- Corrections nécessaires"
                      : "Modifiez ou complétez votre avis"
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                  rows="8"
                  required={actionType === 'refuser' || actionType === 'rouvrir'}
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Ce {actionType === 'rouvrir' ? 'motif' : 'commentaire'} sera visible par l'étudiant et l'aidera dans son travail
                </p>
              </div>

              {actionType === 'valider' && !validerAvecReserves && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Note :</strong> En validant ce thème, vous confirmez que:
                  </p>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                    <li>Le sujet est pertinent et réalisable</li>
                    <li>Il correspond au niveau Master</li>
                    <li>Les ressources nécessaires sont accessibles</li>
                    <li>L'étudiant peut commencer la rédaction</li>
                  </ul>
                </div>
              )}

              {actionType === 'rouvrir' && (
                <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-900">
                    <strong>⚠️ Attention :</strong> Réouvrir ce thème va le remettre en statut "Proposé".
                    L'étudiant pourra le modifier et le resoumettre. Cette action est irréversible.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  loading={submitting}
                  className={`flex-1 ${
                    actionType === 'valider'
                      ? 'bg-green-600 hover:bg-green-700'
                      : actionType === 'refuser'
                      ? 'bg-red-600 hover:bg-red-700'
                      : actionType === 'rouvrir'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {actionType === 'valider' ? 'Confirmer la validation' :
                   actionType === 'refuser' ? 'Confirmer le refus' :
                   actionType === 'rouvrir' ? 'Confirmer la réouverture' :
                   'Enregistrer le nouvel avis'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowThemeModal(false)}
                  disabled={submitting}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
