import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';
import { FileText, Send, Lightbulb, AlertTriangle, CheckCircle2, Info, Edit, Trash2 } from 'lucide-react';

const themeSchema = z.object({
  titre: z.string()
    .min(10, 'Le titre doit contenir au moins 10 caractères')
    .max(300, 'Le titre ne peut pas dépasser 300 caractères'),
  description: z.string()
    .min(200, 'La description doit contenir au moins 200 caractères')
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
});

export default function ProposerTheme() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingTheme, setExistingTheme] = useState(null);
  const [hasEncadrement, setHasEncadrement] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [charCounts, setCharCounts] = useState({ titre: 0, description: 0 });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(themeSchema)
  });

  // Surveiller les changements pour compter les caractères
  const titre = watch('titre', '');
  const description = watch('description', '');

  React.useEffect(() => {
    setCharCounts({
      titre: titre?.length || 0,
      description: description?.length || 0
    });
  }, [titre, description]);

  useEffect(() => {
    checkExistingTheme();
  }, []);

  const checkExistingTheme = async () => {
    try {
      const response = await axios.get(ENDPOINTS.ETUDIANT_DASHBOARD);
      const theme = response.data.data?.theme;
      const encadrement = response.data.data?.encadrement;

      if (theme) {
        setExistingTheme(theme);
        setValue('titre', theme.Titre);
        setValue('description', theme.Description);
      }

      // Vérifier si un encadrement existe
      if (encadrement) {
        setHasEncadrement(true);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du thème:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);

      if (existingTheme && editMode) {
        // Mise à jour du thème existant
        await axios.put(`${ENDPOINTS.ETUDIANT_THEME}/${existingTheme.Id_Theme}`, data);
        toast.success('Thème modifié avec succès !');
      } else {
        // Création d'un nouveau thème
        await axios.post(ENDPOINTS.ETUDIANT_THEME, data);
        toast.success('Thème proposé avec succès ! Vous pouvez maintenant choisir un encadreur.');
      }

      navigate('/etudiant/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la proposition du thème';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce thème ?')) {
      return;
    }

    try {
      setSubmitting(true);
      await axios.delete(`${ENDPOINTS.ETUDIANT_THEME}/${existingTheme.Id_Theme}`);
      toast.success('Thème supprimé avec succès');
      navigate('/etudiant/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setSubmitting(false);
    }
  };

  const getTitreStatus = () => {
    const count = charCounts.titre;
    if (count === 0) return { color: 'gray', message: '0/300 caractères' };
    if (count < 10) return { color: 'red', message: `${count}/300 - Minimum 10 caractères requis` };
    if (count > 300) return { color: 'red', message: `${count}/300 - Maximum dépassé !` };
    return { color: 'green', message: `${count}/300 caractères` };
  };

  const getDescriptionStatus = () => {
    const count = charCounts.description;
    if (count === 0) return { color: 'gray', message: '0/2000 caractères' };
    if (count < 200) return { color: 'red', message: `${count}/2000 - Minimum 200 caractères requis` };
    if (count > 2000) return { color: 'red', message: `${count}/2000 - Maximum dépassé !` };
    return { color: 'green', message: `${count}/2000 caractères` };
  };

  const titreStatus = getTitreStatus();
  const descriptionStatus = getDescriptionStatus();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  // Mode consultation : Thème existant non en mode édition
  if (existingTheme && !editMode) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Bannière d'information */}
          <Card>
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 mb-2">Thème déjà proposé</h3>
                <p className="text-sm text-green-800">
                  Vous avez déjà proposé un thème. Vous pouvez le consulter ci-dessous et le modifier si nécessaire.
                </p>
              </div>
            </div>
          </Card>

          {/* Informations du thème */}
          <Card title="Votre thème proposé">
            <div className="space-y-4 md:space-y-6">
              {/* Statut */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium mt-1 ${
                    existingTheme.Statut_Theme === 'Valide'
                      ? 'bg-green-100 text-green-800'
                      : existingTheme.Statut_Theme === 'Valide_Avec_Reserves'
                      ? 'bg-blue-100 text-blue-800'
                      : existingTheme.Statut_Theme === 'Refuse'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {existingTheme.Statut_Theme === 'Valide' ? '✅ Validé' :
                     existingTheme.Statut_Theme === 'Valide_Avec_Reserves' ? '🔵 Validé avec réserves' :
                     existingTheme.Statut_Theme === 'Refuse' ? '❌ Refusé' :
                     '⏳ En attente de validation'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Date de proposition</p>
                  <p className="font-medium">
                    {new Date(existingTheme.Date_Proposition).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre du thème</label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{existingTheme.Titre}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description et problématique</label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{existingTheme.Description}</p>
                </div>
              </div>

              {/* Avis de l'encadreur */}
              {existingTheme.Commentaire_Encadreur && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💬 Avis de l'encadreur
                  </label>
                  <div className={`p-4 rounded-lg border-2 ${
                    existingTheme.Statut_Theme === 'Valide'
                      ? 'bg-green-50 border-green-200'
                      : existingTheme.Statut_Theme === 'Valide_Avec_Reserves'
                      ? 'bg-blue-50 border-blue-200'
                      : existingTheme.Statut_Theme === 'Refuse'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        existingTheme.Statut_Theme === 'Valide'
                          ? 'bg-green-100'
                          : existingTheme.Statut_Theme === 'Valide_Avec_Reserves'
                          ? 'bg-blue-100'
                          : existingTheme.Statut_Theme === 'Refuse'
                          ? 'bg-red-100'
                          : 'bg-yellow-100'
                      }`}>
                        <Info className={`w-5 h-5 ${
                          existingTheme.Statut_Theme === 'Valide'
                            ? 'text-green-600'
                            : existingTheme.Statut_Theme === 'Valide_Avec_Reserves'
                            ? 'text-blue-600'
                            : existingTheme.Statut_Theme === 'Refuse'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium mb-2 ${
                          existingTheme.Statut_Theme === 'Valide'
                            ? 'text-green-900'
                            : existingTheme.Statut_Theme === 'Valide_Avec_Reserves'
                            ? 'text-blue-900'
                            : existingTheme.Statut_Theme === 'Refuse'
                            ? 'text-red-900'
                            : 'text-yellow-900'
                        }`}>
                          {existingTheme.Statut_Theme === 'Valide'
                            ? 'Commentaire de validation'
                            : existingTheme.Statut_Theme === 'Valide_Avec_Reserves'
                            ? 'Points à améliorer (Validé avec réserves)'
                            : existingTheme.Statut_Theme === 'Refuse'
                            ? 'Motif du refus'
                            : 'Suggestion de modification'}
                        </p>
                        <p className={`text-sm whitespace-pre-wrap ${
                          existingTheme.Statut_Theme === 'Valide'
                            ? 'text-green-800'
                            : existingTheme.Statut_Theme === 'Valide_Avec_Reserves'
                            ? 'text-blue-800'
                            : existingTheme.Statut_Theme === 'Refuse'
                            ? 'text-red-800'
                            : 'text-yellow-800'
                        }`}>
                          {existingTheme.Commentaire_Encadreur}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                {hasEncadrement && ['Propose', 'Valide_Avec_Reserves'].includes(existingTheme.Statut_Theme) && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      ℹ️ Un encadrement existe pour ce thème. Vous pouvez le modifier mais pas le supprimer.
                    </p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {['Propose', 'Valide_Avec_Reserves'].includes(existingTheme.Statut_Theme) && (
                    <>
                      <Button onClick={() => setEditMode(true)} className="w-full sm:w-auto">
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier le thème
                      </Button>
                      {!hasEncadrement && existingTheme.Statut_Theme === 'Propose' && (
                        <Button variant="outline" onClick={handleDelete} disabled={submitting} className="w-full sm:w-auto">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </Button>
                      )}
                    </>
                  )}
                  <Button variant="outline" onClick={() => navigate('/etudiant/dashboard')} className="w-full sm:w-auto">
                    Retour au tableau de bord
                  </Button>
                </div>
              </div>

              {/* Avertissement si validé avec réserves */}
              {existingTheme.Statut_Theme === 'Valide_Avec_Reserves' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">🔵 Thème validé avec réserves</h4>
                        <p className="text-sm text-blue-800 mb-3">
                          Votre thème est accepté ! Vous pouvez commencer la rédaction de votre mémoire.
                          Cependant, votre encadreur a noté quelques points à améliorer (voir commentaires ci-dessus).
                        </p>
                        <p className="text-sm text-blue-800 font-medium">
                          💡 Vous pouvez modifier votre thème pour intégrer ces améliorations, ou continuer avec le thème actuel
                          en tenant compte de ces remarques pendant la rédaction.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Avertissement si validé - Étapes suivantes */}
              {existingTheme.Statut_Theme === 'Valide' && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-green-900 mb-2">🎉 Félicitations ! Votre thème est validé</h4>
                        <p className="text-sm text-green-800">
                          Votre thème a été validé par votre encadreur. Vous pouvez maintenant passer aux étapes suivantes de votre mémoire.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Étapes d'amélioration */}
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                    <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      📝 Prochaines étapes - Phase de rédaction
                    </h4>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          1
                        </div>
                        <div>
                          <h5 className="font-semibold text-blue-900">Élaborer le plan détaillé</h5>
                          <p className="text-sm text-blue-800 mt-1">
                            Structurez votre mémoire : Introduction, Revue de littérature, Méthodologie, Résultats, Discussion, Conclusion.
                            Soumettez ce plan à votre encadreur pour validation.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          2
                        </div>
                        <div>
                          <h5 className="font-semibold text-blue-900">Effectuer la recherche bibliographique</h5>
                          <p className="text-sm text-blue-800 mt-1">
                            Rassemblez les articles scientifiques, livres et ressources pertinents.
                            Utilisez Google Scholar, IEEE, ResearchGate et la bibliothèque de l'ENS.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          3
                        </div>
                        <div>
                          <h5 className="font-semibold text-blue-900">Développer/Réaliser le projet</h5>
                          <p className="text-sm text-blue-800 mt-1">
                            Implémentez votre solution, collectez vos données ou menez votre expérimentation.
                            Documentez toutes vos étapes et résultats.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          4
                        </div>
                        <div>
                          <h5 className="font-semibold text-blue-900">Rédiger progressivement</h5>
                          <p className="text-sm text-blue-800 mt-1">
                            Écrivez chapitre par chapitre. Partagez régulièrement vos ébauches avec votre encadreur
                            pour obtenir des retours et corrections.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          5
                        </div>
                        <div>
                          <h5 className="font-semibold text-blue-900">Préparer la soutenance</h5>
                          <p className="text-sm text-blue-800 mt-1">
                            Une fois le mémoire finalisé et déposé, préparez votre présentation orale.
                            Le jury sera constitué en juin pour une soutenance fin juin ou début juillet.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conseils pour la rédaction */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-amber-900 mb-2">💡 Conseils pour réussir votre mémoire</h4>
                        <ul className="text-sm text-amber-800 space-y-1">
                          <li>✅ Maintenez une communication régulière avec votre encadreur (au moins une fois par mois)</li>
                          <li>✅ Respectez les normes de rédaction académique de l'ENS Yaoundé</li>
                          <li>✅ Citez correctement toutes vos sources pour éviter le plagiat</li>
                          <li>✅ Gardez des copies de sauvegarde de votre travail (Google Drive, GitHub, etc.)</li>
                          <li>✅ Commencez tôt - ne laissez pas tout pour la dernière minute</li>
                          <li>✅ Demandez des relectures à vos pairs et professeurs</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Note importante */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>📌 Note importante :</strong> Votre thème est maintenant verrouillé. Si vous avez besoin de modifications mineures,
                      contactez directement votre encadreur. Pour des changements majeurs, une nouvelle validation sera nécessaire.
                    </p>
                  </div>
                </div>
              )}

              {existingTheme.Statut_Theme === 'Refuse' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Attention :</strong> Votre thème a été refusé. Vous pouvez le modifier et le soumettre à nouveau,
                    ou proposer un nouveau thème.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  // Mode formulaire : Nouveau thème ou modification
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Bannière d'information */}
        <Card>
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                {editMode ? 'Modifier votre thème' : 'À propos de la proposition de thème'}
              </h3>
              <p className="text-sm text-blue-800">
                {editMode
                  ? 'Vous pouvez modifier les informations de votre thème ci-dessous. Les modifications seront soumises pour validation.'
                  : 'Le thème est le sujet de votre mémoire de fin d\'études. Il définit ce que vous allez rechercher, développer ou analyser pendant votre année. Prenez le temps de bien le formuler car votre encadreur pourra le valider, le modifier ou demander des révisions.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Formulaire principal */}
        <Card title={editMode ? 'Modifier le thème' : 'Proposer un thème de mémoire'}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
            {/* Titre du thème */}
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                Titre du thème <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('titre')}
                placeholder="Ex: Développement d'une application web de gestion des mémoires avec React et MySQL"
                error={errors.titre?.message}
              />
              <div className="flex items-center justify-between mt-2">
                <p className={`text-xs ${
                  titreStatus.color === 'green' ? 'text-green-600' :
                  titreStatus.color === 'red' ? 'text-red-600' :
                  'text-gray-500'
                }`}>
                  {titreStatus.message}
                </p>
              </div>
            </div>

            {/* Description détaillée */}
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                Description et problématique <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('description')}
                rows={8}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Décrivez en détail :&#10;• Le contexte et la problématique&#10;• Les objectifs de votre mémoire&#10;• La méthodologie envisagée&#10;• Les technologies ou approches que vous comptez utiliser&#10;• L'intérêt et l'originalité de votre projet"
              />
              <div className="flex items-center justify-between mt-2">
                <p className={`text-xs ${
                  descriptionStatus.color === 'green' ? 'text-green-600' :
                  descriptionStatus.color === 'red' ? 'text-red-600' :
                  'text-gray-500'
                }`}>
                  {descriptionStatus.message}
                </p>
              </div>
              {errors.description && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Conseils */}
            {!editMode && (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-2">💡 Conseils pour un bon thème</h4>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span><strong>Soyez précis :</strong> Évitez les titres trop vagues comme "Étude sur l'informatique"</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span><strong>Soyez réaliste :</strong> Choisissez un sujet réalisable en une année académique</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span><strong>Mentionnez les technologies :</strong> Précisez les outils que vous comptez utiliser</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span><strong>Justifiez l'intérêt :</strong> Expliquez pourquoi ce sujet est important</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span><strong>Alignez avec votre filière :</strong> Le thème doit correspondre à votre spécialité</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Exemples de thèmes */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2">📚 Exemples de bons thèmes</h4>
                      <div className="text-sm text-purple-800 space-y-3">
                        <div className="pl-4 border-l-2 border-purple-300">
                          <p className="font-medium">Informatique - TIC :</p>
                          <p className="italic">"Développement d'une application mobile de gestion des stocks avec React Native et Firebase pour les PME camerounaises"</p>
                        </div>
                        <div className="pl-4 border-l-2 border-purple-300">
                          <p className="font-medium">Informatique - IF :</p>
                          <p className="italic">"Conception d'un algorithme d'optimisation génétique pour la résolution du problème de tournées de véhicules avec contraintes temporelles"</p>
                        </div>
                        <div className="pl-4 border-l-2 border-purple-300">
                          <p className="font-medium">Génie Logiciel :</p>
                          <p className="italic">"Système de détection automatique de plagiat dans les mémoires académiques utilisant le traitement du langage naturel (NLP)"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <Button type="submit" loading={submitting} disabled={submitting} className="w-full sm:w-auto">
                <Send className="w-4 h-4 mr-2" />
                {editMode ? 'Enregistrer les modifications' : 'Soumettre le thème'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => editMode ? setEditMode(false) : navigate('/etudiant/dashboard')}
                className="w-full sm:w-auto"
              >
                Annuler
              </Button>
            </div>
          </form>
        </Card>

        {/* Que se passe-t-il après ? */}
        {!editMode && (
          <Card>
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 mb-2">Que se passe-t-il après la proposition ?</h3>
                <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
                  <li>Votre thème sera enregistré dans le système</li>
                  <li>Vous pourrez ensuite choisir un encadreur</li>
                  <li>L'encadreur examinera votre thème et pourra :
                    <ul className="ml-6 mt-1 space-y-1 list-disc">
                      <li>✅ L'accepter tel quel</li>
                      <li>✏️ Suggérer des modifications</li>
                      <li>❌ Le refuser (vous devrez alors rechoisir un autre encadreur)</li>
                    </ul>
                  </li>
                  <li>Si accepté, le chef de département validera l'encadrement</li>
                  <li>Une fois validé, vous pourrez commencer la rédaction de votre mémoire</li>
                </ol>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
