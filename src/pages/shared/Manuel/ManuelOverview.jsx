import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { FileText, Users, UserCheck, Gavel, CheckCircle, Clock } from 'lucide-react';

export const ManuelOverview = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Bienvenue dans MemoRIS
        </h2>
        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
          MemoRIS est une application de gestion des mémoires de fin d'études pour l'ENS.
          Ce manuel vous guidera dans l'utilisation de toutes les fonctionnalités de l'application.
        </p>
      </div>

      {/* Workflow général */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg md:text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-6 h-6" />
          Le processus complet
        </h3>

        <div className="space-y-4">
          {user?.role === 'etudiant' && (
            <>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Proposer un thème</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Rédigez et soumettez votre proposition de thème de mémoire. Soyez précis et original.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Choisir un encadreur</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Sélectionnez un enseignant dont la spécialité correspond à votre thème.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Validation de l'encadrement</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Attendez l'acceptation de votre encadreur, puis la validation du chef de département.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Rédaction du mémoire</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Travaillez avec votre encadreur. Communiquez régulièrement et respectez les délais.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  5
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Soutenance</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Présentez votre travail devant le jury. Préparez une présentation de 20-25 slides.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  6
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Dépôt des documents</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Après la soutenance, déposez la version finale (PDF + PowerPoint) sur la plateforme.
                  </p>
                </div>
              </div>
            </>
          )}

          {(user?.role === 'enseignant' || user?.role === 'chef') && (
            <>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Recevoir des demandes</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Les étudiants vous envoient des demandes d'encadrement avec leur thème.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Accepter ou refuser</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Évaluez le thème et votre disponibilité. Acceptez si vous pouvez encadrer.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Encadrer l'étudiant</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Guidez l'étudiant, validez son thème, suivez ses progrès via la messagerie.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Participer au jury</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Évaluez le mémoire lors de la soutenance en tant que membre du jury.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Conseils importants */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 md:p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Conseils importants
        </h3>
        <ul className="space-y-2 text-sm text-yellow-800">
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-1">•</span>
            <span>Respectez toujours les délais indiqués dans l'application</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-1">•</span>
            <span>Consultez régulièrement vos notifications pour ne rien manquer</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-1">•</span>
            <span>N'hésitez pas à consulter la page "Aide" accessible dans le menu</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-1">•</span>
            <span>Gardez des copies de sauvegarde de tous vos documents importants</span>
          </li>
        </ul>
      </div>

      {/* Sections d'aide rapide */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📚 Ressources supplémentaires
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">📧 Support technique</h4>
            <p className="text-sm text-blue-800 mb-2">
              En cas de problème technique, contactez l'équipe de support.
            </p>
            <p className="text-sm text-blue-700 font-medium">
              Email: support@ens-yaounde.cm
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">📄 Documents officiels</h4>
            <p className="text-sm text-green-800">
              Consultez le règlement intérieur et les directives académiques de l'ENS pour plus d'informations.
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2">💬 Aide intégrée</h4>
            <p className="text-sm text-purple-800">
              Chaque page de l'application dispose d'une section "Aide" accessible via le menu.
            </p>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-orange-900 mb-2">🎯 Navigation intuitive</h4>
            <p className="text-sm text-orange-800">
              Utilisez le tableau de bord pour voir votre progression et les prochaines étapes à suivre.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ rapide */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ❓ Questions fréquentes
        </h3>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Comment réinitialiser mon mot de passe ?</h4>
            <p className="text-sm text-gray-600">
              Sur la page de connexion, cliquez sur "Mot de passe oublié ?". Vous recevrez un email avec un lien de réinitialisation.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Qui peut m'aider en cas de problème ?</h4>
            <p className="text-sm text-gray-600">
              {user?.role === 'etudiant' && "Contactez d'abord votre encadreur, puis le chef de département si nécessaire."}
              {user?.role === 'enseignant' && "Contactez le chef de votre département pour toute question administrative."}
              {user?.role === 'chef' && "Contactez l'administration centrale ou le support technique."}
              {user?.role === 'admin' && "Vous disposez de tous les droits. Contactez le support technique en cas de problème système."}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Comment savoir où j'en suis dans mon processus ?</h4>
            <p className="text-sm text-gray-600">
              Consultez votre tableau de bord principal qui affiche votre progression et les prochaines étapes à suivre.
            </p>
          </div>

          {user?.role === 'etudiant' && (
            <>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Comment proposer un thème ?</h4>
                <p className="text-sm text-gray-600">
                  Depuis votre tableau de bord, cliquez sur "Proposer un thème". Remplissez le formulaire avec le titre et la description de votre thème de mémoire.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Comment choisir un encadreur ?</h4>
                <p className="text-sm text-gray-600">
                  Une fois votre thème proposé, allez dans "Choisir un encadreur". Consultez la liste des enseignants disponibles et envoyez une demande à celui de votre choix.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Comment communiquer avec mon encadreur ?</h4>
                <p className="text-sm text-gray-600">
                  Une fois l'encadrement validé, une messagerie intégrée apparaît sur votre tableau de bord. Utilisez-la pour communiquer directement avec votre encadreur.
                </p>
              </div>
            </>
          )}

          {(user?.role === 'enseignant' || user?.role === 'chef') && (
            <>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Comment gérer les demandes d'encadrement ?</h4>
                <p className="text-sm text-gray-600">
                  Allez dans "Mes encadrements" pour voir toutes les demandes en attente. Vous pouvez accepter ou refuser chaque demande avec un commentaire.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Comment valider un thème d'étudiant ?</h4>
                <p className="text-sm text-gray-600">
                  Dans la fiche d'encadrement de l'étudiant, vous pouvez valider, refuser ou demander des modifications sur le thème proposé.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
