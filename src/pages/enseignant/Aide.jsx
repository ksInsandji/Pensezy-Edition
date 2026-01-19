import React, { useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import {
  FileText,
  Users,
  Gavel,
  Home,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

export default function EnseignantAide() {
  const [openSection, setOpenSection] = useState('demandes');

  const sections = [
    {
      id: 'demandes',
      icon: FileText,
      title: 'Gérer les demandes d\'encadrement',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-blue-900 font-medium">📌 Les étudiants vous envoient des demandes d'encadrement que vous devez accepter ou refuser</p>
          </div>

          <h4 className="font-semibold text-gray-900">Comment gérer une demande :</h4>
          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            <li>
              <strong>Consultez les demandes</strong>
              <p className="ml-6 mt-1 text-sm">Allez dans "Demandes encadrement" pour voir toutes les demandes en attente</p>
            </li>
            <li>
              <strong>Examinez chaque demande</strong>
              <ul className="ml-6 mt-2 space-y-1 text-sm list-disc list-inside">
                <li><strong>Étudiant :</strong> Nom, prénom, matricule, filière</li>
                <li><strong>Thème proposé :</strong> Titre et description détaillée</li>
                <li><strong>Date de demande :</strong> Quand la demande a été envoyée</li>
              </ul>
            </li>
            <li>
              <strong>Prenez une décision</strong>
              <div className="ml-6 mt-2 space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900 text-sm">Accepter</p>
                    <p className="text-sm text-gray-700">
                      Cliquez sur "Accepter cette demande". Si vous n'êtes PAS chef de département, le chef devra encore valider.
                      Si vous ÊTES chef, l'encadrement est validé automatiquement.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900 text-sm">Refuser</p>
                    <p className="text-sm text-gray-700">
                      Cliquez sur "Refuser" et indiquez obligatoirement un motif. L'étudiant verra votre message.
                    </p>
                  </div>
                </div>
              </div>
            </li>
          </ol>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Quota d'encadrement</p>
                <p className="text-sm text-yellow-800 mt-1">
                  Vous ne pouvez pas dépasser votre quota maximum d'étudiants. Si vous atteignez la limite,
                  vous ne pourrez plus accepter de nouvelles demandes. Contactez le chef de département si besoin.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h5 className="font-medium text-purple-900 mb-2">💡 Conseils</h5>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Vérifiez que le thème correspond à votre spécialité</li>
              <li>• Assurez-vous d'avoir le temps nécessaire pour encadrer</li>
              <li>• Si vous refusez, soyez constructif dans votre motif</li>
              <li>• Répondez rapidement aux demandes (les étudiants attendent)</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'etudiants',
      icon: Users,
      title: 'Mes étudiants encadrés',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-blue-900 font-medium">📌 Suivez tous vos étudiants encadrés et gérez leurs thèmes</p>
          </div>

          <h4 className="font-semibold text-gray-900">Que voyez-vous :</h4>
          <div className="space-y-3">
            <div className="border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Informations sur chaque étudiant</h5>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>Nom, prénom, matricule</li>
                <li>Filière et niveau</li>
                <li>Statut de l'encadrement (Validé, En attente du chef)</li>
                <li>Statut du thème (Proposé, Validé, Refusé)</li>
                <li>Date de soutenance (si jury créé)</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Actions disponibles</h5>
              <p className="text-sm text-gray-700 mb-2">Cliquez sur un étudiant pour :</p>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li><strong>Consulter le thème complet :</strong> Titre, description, statut</li>
                <li><strong>Valider le thème :</strong> Si vous approuvez le sujet</li>
                <li><strong>Refuser le thème :</strong> Si des modifications sont nécessaires (avec commentaire)</li>
                <li><strong>Modifier votre avis :</strong> Changer votre commentaire</li>
                <li><strong>Rouvrir un thème :</strong> Permettre à l'étudiant de modifier un thème refusé</li>
              </ul>
            </div>
          </div>

          <h4 className="font-semibold text-gray-900 mt-4">Validation d'un thème :</h4>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
              <li>Cliquez sur l'étudiant concerné</li>
              <li>Lisez attentivement le thème proposé</li>
              <li>Vérifiez la faisabilité et la pertinence</li>
              <li>Cliquez sur "Valider le thème" ou "Refuser le thème"</li>
              <li>Ajoutez un commentaire (conseils, suggestions, réserves)</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Important</p>
                <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                  <li>• La validation du thème est définitive (sauf si vous rouvrez)</li>
                  <li>• Soyez précis dans vos commentaires</li>
                  <li>• Un thème refusé peut être modifié puis reproposé</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'jurys',
      icon: Gavel,
      title: 'Participation aux jurys',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-blue-900 font-medium">📌 Consultez tous les jurys auxquels vous participez</p>
          </div>

          <h4 className="font-semibold text-gray-900">Rôles possibles dans un jury :</h4>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 bg-blue-50 p-3">
              <h5 className="font-medium text-blue-900">Président du jury</h5>
              <p className="text-sm text-blue-800 mt-1">
                Vous présidez la soutenance, gérez le déroulement et annoncez la décision finale.
              </p>
            </div>

            <div className="border-l-4 border-green-500 bg-green-50 p-3">
              <h5 className="font-medium text-green-900">Rapporteur</h5>
              <p className="text-sm text-green-800 mt-1">
                Vous avez lu le mémoire en profondeur et présentez un rapport détaillé avant les questions.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 bg-purple-50 p-3">
              <h5 className="font-medium text-purple-900">Examinateur</h5>
              <p className="text-sm text-purple-800 mt-1">
                Vous posez des questions à l'étudiant et participez à l'évaluation.
              </p>
            </div>

            <div className="border-l-4 border-orange-500 bg-orange-50 p-3">
              <h5 className="font-medium text-orange-900">Encadreur</h5>
              <p className="text-sm text-orange-800 mt-1">
                En tant qu'encadreur de l'étudiant, vous êtes membre de droit du jury.
              </p>
            </div>
          </div>

          <h4 className="font-semibold text-gray-900 mt-4">Informations disponibles :</h4>
          <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
            <li><strong>Étudiant :</strong> Nom, filière, thème du mémoire</li>
            <li><strong>Date et heure :</strong> Moment de la soutenance</li>
            <li><strong>Salle :</strong> Lieu de la soutenance</li>
            <li><strong>Composition du jury :</strong> Tous les membres avec leurs rôles</li>
            <li><strong>Note finale :</strong> Après délibération (visible par tous les membres)</li>
          </ul>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Préparation</p>
                <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                  <li>• Lisez le mémoire au moins une semaine à l'avance</li>
                  <li>• Préparez vos questions</li>
                  <li>• Arrivez 15 minutes avant l'heure prévue</li>
                  <li>• Respectez le temps imparti (environ 1h par soutenance)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      icon: Home,
      title: 'Tableau de bord',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-blue-900 font-medium">📌 Vue d'ensemble de votre activité d'encadrement</p>
          </div>

          <h4 className="font-semibold text-gray-900">Statistiques affichées :</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-900 text-sm">Demandes en attente</h5>
              <p className="text-xs text-gray-600 mt-1">
                Nombre de demandes d'encadrement que vous devez traiter
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-900 text-sm">Étudiants encadrés</h5>
              <p className="text-xs text-gray-600 mt-1">
                Nombre total d'étudiants sous votre encadrement
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-900 text-sm">Thèmes à valider</h5>
              <p className="text-xs text-gray-600 mt-1">
                Thèmes proposés par vos étudiants en attente de votre validation
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-900 text-sm">Jurys prévus</h5>
              <p className="text-xs text-gray-600 mt-1">
                Nombre de jurys auxquels vous participez
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <h5 className="font-medium text-green-900 mb-2">✅ Actions rapides</h5>
            <p className="text-sm text-green-800">
              Le tableau de bord vous permet d'accéder rapidement aux sections nécessitant votre attention (demandes, thèmes, etc.)
            </p>
          </div>
        </div>
      )
    }
  ];

  const toggleSection = (id) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guide Enseignant</h1>
          <p className="text-gray-600 mt-2">
            Guide complet pour gérer vos encadrements et participer aux jurys.
          </p>
        </div>

        <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-primary-900 mb-2">👨‍🏫 Votre rôle d'encadreur</h2>
          <p className="text-primary-800">
            En tant qu'enseignant, vous guidez les étudiants dans leur travail de mémoire et participez à l'évaluation via les jurys.
          </p>
        </div>

        <div className="space-y-3">
          {sections.map((section) => {
            const Icon = section.icon;
            const isOpen = openSection === section.id;

            return (
              <Card key={section.id} className="overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="pt-4">
                      {section.content}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">❓ Besoin d'aide ?</h3>
          <p className="text-sm text-gray-700">
            Pour toute question administrative, contactez le chef de département ou le secrétariat.
          </p>
        </div>
      </div>
    </Layout>
  );
}
