import React, { useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import {
  BookOpen,
  UserCheck,
  FileText,
  Gavel,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function EtudiantAide() {
  const [openSection, setOpenSection] = useState('proposer-theme');

  const sections = [
    {
      id: 'proposer-theme',
      icon: FileText,
      title: 'Proposer un thème de mémoire',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-blue-900 font-medium">📌 C'est la première étape de votre parcours de mémoire</p>
          </div>

          <h4 className="font-semibold text-gray-900">Étapes à suivre :</h4>
          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            <li>
              <strong>Allez dans "Proposer un thème"</strong>
              <p className="ml-6 mt-1 text-sm">Cliquez sur le menu de gauche</p>
            </li>
            <li>
              <strong>Remplissez le formulaire</strong>
              <ul className="ml-6 mt-2 space-y-1 text-sm list-disc list-inside">
                <li><strong>Titre :</strong> Donnez un titre clair et précis (ex: "Développement d'une application mobile de gestion scolaire")</li>
                <li><strong>Description :</strong> Expliquez en détail votre projet (objectifs, problématique, solution proposée)</li>
                <li><strong>Domaine :</strong> Précisez le domaine (Informatique, Génie Logiciel, Réseaux, etc.)</li>
              </ul>
            </li>
            <li>
              <strong>Soumettez votre thème</strong>
              <p className="ml-6 mt-1 text-sm">Cliquez sur "Soumettre le thème"</p>
            </li>
          </ol>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Après soumission</p>
                <p className="text-sm text-green-800 mt-1">
                  Votre thème sera visible avec le statut "En attente". Vous devez maintenant choisir un encadreur qui validera votre thème.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Important</p>
                <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                  <li>• Soyez clair et précis dans votre description</li>
                  <li>• Assurez-vous que le thème correspond à votre filière</li>
                  <li>• Vous pouvez modifier le thème avant qu'il soit validé</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'choisir-encadreur',
      icon: UserCheck,
      title: 'Choisir un encadreur',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-blue-900 font-medium">📌 Après avoir proposé votre thème, vous devez choisir un enseignant qui vous encadrera</p>
          </div>

          <h4 className="font-semibold text-gray-900">Comment choisir un encadreur :</h4>
          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            <li>
              <strong>Consultez la liste des enseignants</strong>
              <p className="ml-6 mt-1 text-sm">Allez dans "Choisir encadreur" pour voir tous les enseignants disponibles</p>
            </li>
            <li>
              <strong>Vérifiez les informations</strong>
              <ul className="ml-6 mt-2 space-y-1 text-sm list-disc list-inside">
                <li><strong>Grade :</strong> Professeur, Maître de conférences, etc.</li>
                <li><strong>Spécialité :</strong> Doit correspondre à votre thème</li>
                <li><strong>Disponibilité :</strong> Nombre d'étudiants déjà encadrés / quota maximum</li>
              </ul>
            </li>
            <li>
              <strong>Envoyez votre demande</strong>
              <p className="ml-6 mt-1 text-sm">Cliquez sur "Choisir cet encadreur" pour l'enseignant souhaité</p>
            </li>
          </ol>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
            <h5 className="font-medium text-purple-900 mb-2">💡 Conseils pour choisir</h5>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Choisissez un enseignant spécialisé dans le domaine de votre thème</li>
              <li>• Vérifiez sa disponibilité (évitez ceux qui ont atteint leur quota)</li>
              <li>• Vous pouvez demander conseil à vos camarades ou à d'autres enseignants</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Statuts possibles</p>
                <ul className="text-sm text-green-800 mt-2 space-y-2">
                  <li><strong>⏳ Demande envoyée :</strong> L'enseignant n'a pas encore répondu</li>
                  <li><strong>✅ Acceptée par l'enseignant :</strong> En attente de validation du chef de département</li>
                  <li><strong>✅ Validé :</strong> Votre encadrement est confirmé !</li>
                  <li><strong>❌ Refusée :</strong> Vous devez choisir un autre encadreur</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'jury',
      icon: Gavel,
      title: 'Consulter mon jury',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-blue-900 font-medium">📌 Une fois votre thème validé et votre travail avancé, le chef de département créera votre jury</p>
          </div>

          <h4 className="font-semibold text-gray-900">Informations sur le jury :</h4>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3">Composition du jury</h5>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start gap-2">
                <span className="font-medium min-w-[100px]">Président :</span>
                <span>Enseignant de grade élevé qui préside la soutenance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium min-w-[100px]">Rapporteur :</span>
                <span>Évalue en profondeur votre travail et rédige un rapport</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium min-w-[100px]">Examinateur :</span>
                <span>Pose des questions et évalue votre soutenance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium min-w-[100px]">Encadreur :</span>
                <span>Votre enseignant encadreur (membre de droit)</span>
              </li>
            </ul>
          </div>

          <h4 className="font-semibold text-gray-900 mt-4">Informations que vous verrez :</h4>
          <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
            <li><strong>Date et heure de soutenance :</strong> Notez-les bien !</li>
            <li><strong>Salle :</strong> Lieu de votre soutenance</li>
            <li><strong>Membres du jury :</strong> Noms et rôles</li>
            <li><strong>Note finale :</strong> Apparaît après la soutenance</li>
            <li><strong>Mention :</strong> Très bien, Bien, Assez bien, Passable</li>
          </ul>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Préparation de la soutenance</p>
                <ul className="text-sm text-yellow-800 mt-2 space-y-1">
                  <li>• Préparez une présentation claire (PowerPoint conseillé)</li>
                  <li>• Relisez votre mémoire en entier</li>
                  <li>• Anticipez les questions possibles</li>
                  <li>• Arrivez 15 minutes avant l'heure prévue</li>
                  <li>• Habillez-vous de manière professionnelle</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      icon: BookOpen,
      title: 'Tableau de bord',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-blue-900 font-medium">📌 Votre tableau de bord vous donne une vue d'ensemble de votre progression</p>
          </div>

          <h4 className="font-semibold text-gray-900">Ce que vous voyez :</h4>

          <div className="space-y-3">
            <div className="border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">📊 Statistiques rapides</h5>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>Statut :</strong> Votre statut actuel (Inscription, Thème proposé, etc.)</li>
                <li>• <strong>Thème :</strong> État de validation de votre thème</li>
                <li>• <strong>Encadrement :</strong> Si votre encadrement est validé</li>
                <li>• <strong>Jury :</strong> Si votre jury est créé</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">📄 Votre thème</h5>
              <p className="text-sm text-gray-700">
                Affiche le titre, la description et le statut de votre thème proposé.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">👨‍🏫 Votre encadreur</h5>
              <p className="text-sm text-gray-700">
                Informations sur votre enseignant encadreur une fois l'encadrement validé.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">⚖️ Votre jury</h5>
              <p className="text-sm text-gray-700">
                Détails de votre jury de soutenance (date, membres, salle).
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <h5 className="font-medium text-green-900 mb-2">✅ Progression typique</h5>
            <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
              <li>Inscription → Proposer un thème</li>
              <li>Thème proposé → Choisir un encadreur</li>
              <li>Demande envoyée → Attendre acceptation</li>
              <li>Encadrement validé → Travailler sur le mémoire</li>
              <li>Jury créé → Préparer la soutenance</li>
              <li>Soutenance → Obtenir la note finale</li>
            </ol>
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
          <h1 className="text-3xl font-bold text-gray-900">Guide Étudiant</h1>
          <p className="text-gray-600 mt-2">
            Bienvenue dans le guide d'utilisation pour les étudiants. Cliquez sur chaque section pour en savoir plus.
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">🎓 Votre parcours de mémoire</h2>
          <p className="text-blue-800">
            Ce guide vous accompagne à chaque étape de votre mémoire, de la proposition du thème jusqu'à la soutenance finale.
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
          <h3 className="font-semibold text-gray-900 mb-3">❓ Besoin d'aide supplémentaire ?</h3>
          <p className="text-sm text-gray-700 mb-2">
            Si vous rencontrez des difficultés ou avez des questions :
          </p>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Contactez votre enseignant encadreur</li>
            <li>Adressez-vous au chef de département de votre filière</li>
            <li>Consultez le secrétariat de l'ENS</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
