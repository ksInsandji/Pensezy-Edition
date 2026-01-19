import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { MessagingBox } from '../../components/messaging/MessagingBox';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { FileText, UserCheck, Gavel, CheckCircle, Clock, AlertCircle, Calendar, Edit, Trash2, Mail, Phone, Award, TrendingUp, Info, Target, BookOpen } from 'lucide-react';
import { toast } from 'react-toastify';

export default function EtudiantDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [location]); // Recharger quand on navigue vers cette page

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(ENDPOINTS.ETUDIANT_DASHBOARD);
      setDashboard(response.data.data);
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  const getStatusStep = () => {
    const status = dashboard?.Statut_Etudiant;
    const encadrement = dashboard?.encadrement;

    // Étape 5: Soutenu (si statut est Soutenu OU si le jury a une note finale)
    if (status === 'Soutenu' || dashboard?.jury?.Note_Finale) return 5;

    // Étape 4: Prêt pour soutenance (jury créé)
    if (status === 'Pret_Soutenance' || dashboard?.jury) return 4;

    // Étape 3: Encadrement validé
    if (status === 'Encadrement_Valide' || encadrement?.Statut_Encadrement === 'Valide') return 3;

    // Étape 2: Thème proposé
    if (status === 'Theme_Propose' || dashboard?.theme) return 2;

    // Étape 1: Compte créé
    return 1;
  };

  const currentStep = getStatusStep();

  const steps = [
    { id: 1, name: 'Compte créé', icon: CheckCircle, description: 'Votre compte a été créé' },
    { id: 2, name: 'Thème proposé', icon: FileText, description: 'Proposer un thème de mémoire' },
    { id: 3, name: 'Encadrement validé', icon: UserCheck, description: 'Choisir et valider un encadreur' },
    { id: 4, name: 'Jury créé', icon: Gavel, description: 'Jury de soutenance constitué' },
    { id: 5, name: 'Soutenu', icon: CheckCircle, description: 'Mémoire soutenu' },
  ];

  const getNextAction = () => {
    const status = dashboard?.Statut_Etudiant;

    if (status === 'Inscrit') {
      return {
        title: 'Prochaine étape : Proposer un thème',
        description: 'Le thème est le sujet de votre mémoire de fin d\'études. Il doit être en rapport avec votre filière.',
        action: 'Proposer un thème maintenant',
        onClick: () => navigate('/etudiant/proposer-theme'),
        icon: FileText,
        color: 'blue',
        deadline: 'Date limite : 30 novembre 2025'
      };
    }

    if (status === 'Theme_Propose' && !dashboard?.encadrement) {
      return {
        title: 'Prochaine étape : Choisir un encadreur',
        description: 'L\'encadreur vous guidera tout au long de la rédaction de votre mémoire. Choisissez-le en fonction de sa spécialité et de sa disponibilité.',
        action: 'Choisir un encadreur',
        onClick: () => navigate('/etudiant/choisir-encadreur'),
        icon: UserCheck,
        color: 'green',
        deadline: 'Date limite : 15 décembre 2025'
      };
    }

    if (dashboard?.encadrement && dashboard.encadrement.Statut_Encadrement !== 'Valide') {
      const encStatus = dashboard.encadrement.Statut_Encadrement;
      if (encStatus === 'Demande_Envoyee') {
        return {
          title: 'En attente : Réponse de l\'encadreur',
          description: 'Votre demande a été envoyée. L\'encadreur va examiner votre thème et décider s\'il peut vous encadrer.',
          action: null,
          icon: Clock,
          color: 'yellow',
          deadline: 'Patience requise (48-72h normal)'
        };
      }
      if (encStatus === 'Accepte_Encadreur') {
        return {
          title: 'En attente : Validation du chef',
          description: 'Votre encadreur a accepté ! Le chef de département doit maintenant valider officiellement l\'encadrement.',
          action: null,
          icon: Clock,
          color: 'yellow',
          deadline: 'Validation dans les 72h'
        };
      }
      if (encStatus === 'Refuse') {
        return {
          title: 'Action requise : Encadrement refusé',
          description: 'Votre demande a été refusée. Vous devez choisir un autre encadreur ou modifier votre thème.',
          action: 'Choisir un autre encadreur',
          onClick: () => navigate('/etudiant/choisir-encadreur'),
          icon: AlertCircle,
          color: 'red',
          deadline: 'Urgent : À faire rapidement'
        };
      }
    }

    if (status === 'Encadrement_Valide') {
      return {
        title: 'En cours : Rédaction du mémoire',
        description: 'Votre encadrement est validé ! Accédez au plan de travail pour suivre vos jalons et échéances avec votre encadreur.',
        action: 'Accéder au plan de travail',
        onClick: () => navigate(`/etudiant/retro-planning/${dashboard.encadrement.Id_Encadrement}`),
        icon: BookOpen,
        color: 'purple',
        deadline: 'Suivez votre progression'
      };
    }

    if (status === 'Pret_Soutenance') {
      return {
        title: 'Prochaine étape : Soutenance',
        description: 'Votre jury a été créé. Préparez votre présentation PowerPoint (20-25 slides max, 20 minutes de présentation).',
        action: 'Consulter mon jury',
        onClick: () => navigate('/etudiant/jury'),
        icon: Gavel,
        color: 'indigo',
        deadline: 'Soutenance en juillet 2026'
      };
    }

    if (status === 'Soutenu') {
      return {
        title: 'Félicitations ! 🎉',
        description: 'Vous avez soutenu votre mémoire avec succès. N\'oubliez pas de déposer la version numérique de votre mémoire (PDF et PowerPoint) pour aider les futurs étudiants.',
        action: dashboard?.jury ? 'Déposer les documents numériques' : null,
        onClick: dashboard?.jury ? () => navigate('/etudiant/jury') : null,
        icon: CheckCircle,
        color: 'green',
        deadline: null
      };
    }

    return null;
  };

  const nextAction = getNextAction();

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-600'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-600'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-800',
      icon: 'text-purple-600'
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-800',
      icon: 'text-indigo-600'
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Banner Alumni Mode */}
        {dashboard?.Mode_Alumni && (
          <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-lg flex items-start gap-4 shadow-lg">
            <Award className="w-10 h-10 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-2">🎓 Mode Alumni - Accès en Lecture Seule</h3>
              <p className="text-sm leading-relaxed mb-2">
                Félicitations pour votre réussite ! Vous avez terminé votre parcours académique avec succès.
                Vous pouvez consulter votre historique complet et télécharger vos documents,
                mais vous ne pouvez plus soumettre de nouvelles demandes ou modifier vos informations.
              </p>
              <div className="flex items-center gap-4 text-sm mt-3">
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  📅 Année de graduation : {dashboard.Annee_Graduation || 'Non définie'}
                </span>
                {dashboard.jury?.Note_Finale && (
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    ⭐ Note finale : {dashboard.jury.Note_Finale}/20
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* En-tête avec informations personnelles */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bienvenue, {user?.Prenom_Etud} {user?.Nom_Etud}
              </h1>
              <p className="text-gray-500 mt-1">Matricule : {user?.Matricule_Etud}</p>
              <p className="text-gray-500">
                Filière : {dashboard?.filiere?.Nom_Fil || user?.filiere?.Nom_Fil || 'Non définie'}
              </p>
              {dashboard?.filiere?.departement && (
                <>
                  <p className="text-gray-500">
                    Département : {dashboard.filiere.departement.Nom_Dep}
                  </p>
                  {dashboard.filiere.departement.chef && (
                    <p className="text-gray-500">
                      Chef de département : {dashboard.filiere.departement.chef.Prenom_Ens} {dashboard.filiere.departement.chef.Nom_Ens}
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Niveau</p>
              <p className="text-2xl font-bold text-primary-600">{user?.Niveau}</p>
            </div>
          </div>
        </Card>

        {/* Barre de progression */}
        <Card title="📊 Votre progression">
          <div className="relative py-8">
            {/* Ligne de connexion */}
            <div className="absolute top-[52px] left-0 right-0 h-1 bg-gray-200 z-0">
              <div
                className="h-full bg-primary-600 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>

            {/* Étapes */}
            <div className="relative z-10 flex justify-between">
              {steps.map((step) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;

                return (
                  <div key={step.id} className="flex flex-col items-center" style={{ width: `${100 / steps.length}%` }}>
                    <div
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? 'bg-primary-600 text-white'
                          : isCurrent
                          ? 'bg-primary-600 text-white ring-4 ring-primary-200'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 md:w-7 md:h-7" />
                      ) : (
                        <step.icon className="w-6 h-6 md:w-7 md:h-7" />
                      )}
                    </div>
                    <p className={`text-xs font-medium mt-2 md:mt-3 text-center px-1 truncate w-full ${
                      isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                    }`} title={step.name}>
                      {step.name}
                    </p>
                    <p className="hidden md:block text-xs text-gray-500 mt-1 text-center px-2 line-clamp-2" title={step.description}>
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Prochaine étape */}
        {nextAction && (
          <Card>
            <div className={`p-6 rounded-lg border-2 ${colorClasses[nextAction.color].bg} ${colorClasses[nextAction.color].border}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full bg-white ${colorClasses[nextAction.color].icon}`}>
                  <nextAction.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-2 ${colorClasses[nextAction.color].text}`}>
                    {nextAction.title}
                  </h3>
                  <p className="text-gray-700 mb-3">
                    {nextAction.description}
                  </p>
                  {nextAction.deadline && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>{nextAction.deadline}</span>
                    </div>
                  )}
                  {nextAction.action && nextAction.onClick && (
                    <Button
                      onClick={nextAction.onClick}
                      disabled={dashboard?.Mode_Alumni}
                      title={dashboard?.Mode_Alumni ? "Action non disponible en mode alumni" : ""}
                      className={dashboard?.Mode_Alumni ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      {nextAction.action}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Mon thème */}
        {dashboard?.theme && (
          <Card title="📝 Mon thème">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg text-gray-900 line-clamp-2">{dashboard.theme.Titre}</h4>
                <p className="text-gray-600 mt-2 leading-relaxed line-clamp-3">{dashboard.theme.Description}</p>
              </div>

              {/* Avis de l'encadreur */}
              {dashboard.theme.Commentaire_Encadreur && (
                <div className={`p-4 rounded-lg border-2 ${
                  dashboard.theme.Statut_Theme === 'Valide'
                    ? 'bg-green-50 border-green-200'
                    : dashboard.theme.Statut_Theme === 'Refuse'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <Info className={`w-5 h-5 mt-0.5 ${
                      dashboard.theme.Statut_Theme === 'Valide'
                        ? 'text-green-600'
                        : dashboard.theme.Statut_Theme === 'Refuse'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`} />
                    <div className="flex-1">
                      <p className={`text-sm font-semibold mb-1 ${
                        dashboard.theme.Statut_Theme === 'Valide'
                          ? 'text-green-900'
                          : dashboard.theme.Statut_Theme === 'Refuse'
                          ? 'text-red-900'
                          : 'text-yellow-900'
                      }`}>
                        💬 Avis de l'encadreur :
                      </p>
                      <p className={`text-sm line-clamp-3 ${
                        dashboard.theme.Statut_Theme === 'Valide'
                          ? 'text-green-800'
                          : dashboard.theme.Statut_Theme === 'Refuse'
                          ? 'text-red-800'
                          : 'text-yellow-800'
                      }`}>
                        {dashboard.theme.Commentaire_Encadreur}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    dashboard.theme.Statut_Theme === 'Valide'
                      ? 'bg-green-100 text-green-800'
                      : dashboard.theme.Statut_Theme === 'Refuse'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {dashboard.theme.Statut_Theme === 'Valide' ? '✅ Validé' :
                     dashboard.theme.Statut_Theme === 'Refuse' ? '❌ Refusé' :
                     '⏳ Proposé'}
                  </span>
                  <span className="text-sm text-gray-500">
                    Proposé le {new Date(dashboard.theme.Date_Proposition).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                {dashboard.theme.Statut_Theme === 'Propose' && !dashboard.encadrement && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/etudiant/proposer-theme')}
                      disabled={dashboard?.Mode_Alumni}
                      title={dashboard?.Mode_Alumni ? "Modification non disponible en mode alumni" : ""}
                      className={dashboard?.Mode_Alumni ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Mon encadrement */}
        {dashboard?.encadrement && (
          <Card title="🤝 Mon encadrement">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-8 h-8 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-gray-900">
                    {dashboard.encadrement.enseignant.Prenom_Ens} {dashboard.encadrement.enseignant.Nom_Ens}
                  </h4>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Award className="w-4 h-4" />
                      <span>{dashboard.encadrement.enseignant.Grade_Ens}</span>
                    </div>
                    {dashboard.encadrement.enseignant.Specialite && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Target className="w-4 h-4" />
                        <span>Spécialité : {dashboard.encadrement.enseignant.Specialite}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${dashboard.encadrement.enseignant.Email_Ens}`} className="text-primary-600 hover:underline">
                        {dashboard.encadrement.enseignant.Email_Ens}
                      </a>
                    </div>
                    {dashboard.encadrement.enseignant.Telephone_Ens && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{dashboard.encadrement.enseignant.Telephone_Ens}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    dashboard.encadrement.Statut_Encadrement === 'Valide'
                      ? 'bg-green-100 text-green-800'
                      : dashboard.encadrement.Statut_Encadrement === 'Refuse'
                      ? 'bg-red-100 text-red-800'
                      : dashboard.encadrement.Statut_Encadrement === 'Reassigne'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {dashboard.encadrement.Statut_Encadrement === 'Valide' ? '✅ Validé' :
                     dashboard.encadrement.Statut_Encadrement === 'Refuse' ? '❌ Refusé' :
                     dashboard.encadrement.Statut_Encadrement === 'Reassigne' ? '🔄 Réaffecté' :
                     dashboard.encadrement.Statut_Encadrement === 'Accepte_Encadreur' ? '⏳ En attente du chef' :
                     '⏳ En attente de l\'encadreur'}
                  </span>
                  <span className="text-sm text-gray-500">
                    Demandé le {new Date(dashboard.encadrement.Date_Demande).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                {dashboard.encadrement.Commentaire_Refus && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    dashboard.encadrement.Statut_Encadrement === 'Refuse'
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {dashboard.encadrement.Statut_Encadrement === 'Refuse' ? 'Motif du refus :' : 'Motif de la réaffectation :'}
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {dashboard.encadrement.Commentaire_Refus}
                    </p>
                    {dashboard.encadrement.Statut_Encadrement === 'Refuse' && (
                      <div className="mt-3">
                        <Button
                          size="sm"
                          onClick={() => navigate('/etudiant/choisir-encadreur')}
                          disabled={dashboard?.Mode_Alumni}
                          title={dashboard?.Mode_Alumni ? "Action non disponible en mode alumni" : ""}
                          className={dashboard?.Mode_Alumni ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          Choisir un autre encadreur
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Messagerie avec l'encadreur */}
        {dashboard?.encadrement && dashboard.encadrement.Statut_Encadrement === 'Valide' && (
          <MessagingBox
            idEncadrement={dashboard.encadrement.Id_Encadrement}
            currentUser={{
              id: user?.Matricule_Etud,
              role: 'etudiant'
            }}
          />
        )}

        {/* Mon jury (si existant) */}
        {dashboard?.jury && (
          <Card title="⚖️ Mon jury de soutenance">
            <div className="space-y-4">
              {/* Thème */}
              {dashboard.theme && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 mb-1">Thème de soutenance</p>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2">{dashboard.theme.Titre}</p>
                      {dashboard.theme.Description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{dashboard.theme.Description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Date de soutenance</p>
                    <p className="font-semibold">
                      {new Date(dashboard.jury.Date_Soutenance).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Heure</p>
                    <p className="font-semibold">{dashboard.jury.Heure_Soutenance || 'À définir'}</p>
                  </div>
                </div>
              </div>

              {/* Afficher la note si elle existe */}
              {dashboard.jury.Note_Finale && (
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium mb-1">🎉 Félicitations !</p>
                      <p className="text-2xl font-bold text-green-800">
                        Note finale : {dashboard.jury.Note_Finale}/20
                      </p>
                      {dashboard.jury.Mention && (
                        <p className="text-sm text-green-700 mt-1">
                          Mention : {dashboard.jury.Mention}
                        </p>
                      )}
                    </div>
                    <Award className="w-12 h-12 text-green-600" />
                  </div>
                  {dashboard.jury.Observations && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-sm text-green-700 line-clamp-2">
                        <strong>Observations :</strong> {dashboard.jury.Observations}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <Button onClick={() => navigate('/etudiant/jury')} className="w-full">
                Voir les détails du jury
              </Button>
            </div>
          </Card>
        )}

        {/* Conseils */}
        <Card>
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">💡 Conseils importants</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Respectez les délais pour éviter tout retard</li>
                <li>Rencontrez régulièrement votre encadreur (toutes les 2 semaines minimum)</li>
                <li>Gardez une copie de sauvegarde de votre travail</li>
                <li>Consultez les anciens mémoires de votre filière pour vous inspirer</li>
                <li>Préparez votre soutenance à l'avance (présentation PowerPoint de 20-25 slides)</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
