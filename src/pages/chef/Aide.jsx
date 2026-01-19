import React, { useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import {
  Users,
  BookOpen,
  UserCheck,
  Gavel,
  BarChart3,
  FileText,
  Home,
  ChevronDown,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export default function ChefAide() {
  const [openSection, setOpenSection] = useState('role');

  const sections = [
    {
      id: 'role',
      icon: Home,
      title: 'Votre double rôle : Chef & Enseignant',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-blue-900 font-medium">📌 En tant que chef de département, vous avez un double rôle</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-primary-300 rounded-lg p-4 bg-primary-50">
              <h4 className="font-semibold text-primary-900 mb-3">👨‍🏫 Rôle Enseignant</h4>
              <ul className="text-sm text-primary-800 space-y-1 list-disc list-inside">
                <li>Recevoir et gérer vos demandes d'encadrement</li>
                <li>Encadrer vos propres étudiants</li>
                <li>Valider leurs thèmes</li>
                <li>Participer à des jurys</li>
              </ul>
              <p className="text-xs text-primary-700 mt-3 italic">
                ℹ️ Vos propres encadrements sont validés automatiquement
              </p>
            </div>

            <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
              <h4 className="font-semibold text-green-900 mb-3">👔 Rôle Chef</h4>
              <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                <li>Gérer les comptes (étudiants, enseignants)</li>
                <li>Gérer les filières du département</li>
                <li>Valider les encadrements des autres enseignants</li>
                <li>Créer et gérer les jurys</li>
                <li>Consulter les statistiques</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h5 className="font-medium text-yellow-900 mb-2">⚠️ Important</h5>
            <p className="text-sm text-yellow-800">
              Dans "Encadrements dept.", vous ne verrez PAS vos propres encadrements.
              Gérez vos étudiants via "Mes étudiants" (comme un enseignant normal).
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'comptes',
      icon: Users,
      title: 'Gestion des comptes',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Étudiants :</h4>
          <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
            <li><strong>Créer :</strong> Ajouter un nouvel étudiant avec matricule, nom, prénom, email, filière</li>
            <li><strong>Modifier :</strong> Mettre à jour les informations d'un étudiant</li>
            <li><strong>Supprimer :</strong> Retirer un étudiant (attention : action irréversible)</li>
            <li><strong>Importer/Exporter :</strong> Gérer en masse via Excel</li>
          </ul>

          <h4 className="font-semibold text-gray-900 mt-4">Enseignants :</h4>
          <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
            <li><strong>Créer :</strong> Ajouter un enseignant avec ses informations</li>
            <li><strong>Définir quota :</strong> Nombre maximum d'étudiants qu'il peut encadrer</li>
            <li><strong>Modifier/Supprimer :</strong> Gérer les enseignants existants</li>
          </ul>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h5 className="font-medium text-blue-900 mb-2">💡 Astuce Excel</h5>
            <p className="text-sm text-blue-800">
              Téléchargez le modèle Excel, remplissez-le avec vos données, puis importez-le pour gagner du temps.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'filieres',
      icon: BookOpen,
      title: 'Gestion des filières',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">Gérez les filières de votre département :</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
            <li><strong>Créer une filière :</strong> Nom, code, description</li>
            <li><strong>Modifier :</strong> Mettre à jour les informations</li>
            <li><strong>Supprimer :</strong> Retirer une filière (vérifiez qu'aucun étudiant n'y est inscrit)</li>
          </ul>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Attention</p>
                <p className="text-sm text-yellow-800">
                  Vous ne pouvez pas supprimer une filière qui a des étudiants inscrits.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'encadrements',
      icon: UserCheck,
      title: 'Validation des encadrements',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-blue-900 font-medium">📌 Vous validez les encadrements acceptés par les enseignants</p>
          </div>

          <h4 className="font-semibold text-gray-900">Workflow :</h4>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
            <li>Étudiant choisit un enseignant</li>
            <li>Enseignant accepte la demande → Statut "En attente chef"</li>
            <li><strong>Vous validez</strong> → Statut "Validé"</li>
          </ol>

          <h4 className="font-semibold text-gray-900 mt-4">Actions disponibles :</h4>
          <div className="space-y-3">
            <div className="border border-green-200 bg-green-50 p-3 rounded">
              <h5 className="font-medium text-green-900 text-sm">✅ Valider</h5>
              <p className="text-xs text-green-800 mt-1">
                Confirme l'encadrement. L'étudiant peut commencer son travail.
              </p>
            </div>

            <div className="border border-orange-200 bg-orange-50 p-3 rounded">
              <h5 className="font-medium text-orange-900 text-sm">🔄 Réaffecter</h5>
              <p className="text-xs text-orange-800 mt-1">
                Changer l'enseignant encadreur (ex: quota atteint, spécialité non adaptée).
                Indiquez le motif et choisissez un nouvel enseignant.
              </p>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
            <h5 className="font-medium text-purple-900 mb-2">💡 Critères de validation</h5>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• L'enseignant a-t-il la spécialité adaptée ?</li>
              <li>• Son quota n'est-il pas dépassé ?</li>
              <li>• La charge est-elle équilibrée entre enseignants ?</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'jurys',
      icon: Gavel,
      title: 'Gestion des jurys',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-blue-900 font-medium">📌 Créez et gérez les jurys de soutenance</p>
          </div>

          <h4 className="font-semibold text-gray-900">Créer un jury :</h4>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
            <li><strong>Sélectionnez l'étudiant</strong> (doit avoir un encadrement validé)</li>
            <li><strong>Date et heure :</strong> Programmez la soutenance</li>
            <li><strong>Salle :</strong> Choisissez le lieu</li>
            <li><strong>Composez le jury :</strong>
              <ul className="ml-6 mt-2 space-y-1 list-disc list-inside">
                <li>Président (obligatoire)</li>
                <li>Rapporteur (obligatoire)</li>
                <li>Examinateurs (optionnels)</li>
                <li>Encadreur (automatique)</li>
              </ul>
            </li>
          </ol>

          <h4 className="font-semibold text-gray-900 mt-4">Après la soutenance :</h4>
          <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
            <li><strong>Saisir la note finale :</strong> Note sur 20</li>
            <li><strong>Attribuer la mention :</strong> Très bien, Bien, Assez bien, Passable</li>
            <li><strong>Modifier/Supprimer :</strong> Gérer les jurys existants</li>
          </ul>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <h5 className="font-medium text-yellow-900 mb-2">⚠️ Contraintes</h5>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Minimum 3 membres (Président + Rapporteur + Encadreur)</li>
              <li>• Le Président doit avoir un grade élevé</li>
              <li>• Évitez les conflits d'horaire entre jurys</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'statistiques',
      icon: BarChart3,
      title: 'Statistiques du département',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">Consultez les statistiques globales :</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-900 text-sm">Étudiants</h5>
              <p className="text-xs text-gray-600 mt-1">
                Total, par niveau, par filière, par statut
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-900 text-sm">Encadrements</h5>
              <p className="text-xs text-gray-600 mt-1">
                En attente, validés, charge par enseignant
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-900 text-sm">Thèmes</h5>
              <p className="text-xs text-gray-600 mt-1">
                Proposés, validés, par domaine
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-900 text-sm">Soutenances</h5>
              <p className="text-xs text-gray-600 mt-1">
                À venir, réalisées, notes moyennes
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-900">
              💡 Ces statistiques vous aident à piloter le département et prendre des décisions éclairées.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'enseignant',
      icon: FileText,
      title: 'Fonctions enseignant',
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <p className="text-green-900 font-medium">📌 Vous avez aussi accès aux fonctions enseignant</p>
          </div>

          <p className="text-gray-700">En tant qu'enseignant, vous pouvez :</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
            <li><strong>Demandes encadrement :</strong> Recevoir et gérer les demandes d'étudiants</li>
            <li><strong>Mes étudiants :</strong> Suivre vos propres étudiants encadrés</li>
            <li><strong>Jurys :</strong> Voir les jurys auxquels vous participez</li>
          </ul>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
            <h5 className="font-medium text-purple-900 mb-2">✅ Auto-validation</h5>
            <p className="text-sm text-purple-800">
              Quand vous acceptez un étudiant, votre encadrement est validé automatiquement
              (pas besoin d'une validation supplémentaire puisque vous êtes le chef).
            </p>
          </div>

          <p className="text-sm text-gray-600 mt-4 italic">
            📖 Consultez le guide enseignant pour plus de détails sur ces fonctions.
          </p>
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
          <h1 className="text-3xl font-bold text-gray-900">Guide Chef de Département</h1>
          <p className="text-gray-600 mt-2">
            Guide complet pour gérer votre département et encadrer vos étudiants.
          </p>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-indigo-900 mb-2">👔 Chef & Enseignant</h2>
          <p className="text-indigo-800">
            Vous gérez à la fois le département (validation, jurys, statistiques) et vos propres encadrements.
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
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Icon className="w-6 h-6 text-indigo-600" />
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
            Pour les questions administratives, contactez le secrétariat ou l'administrateur système.
          </p>
        </div>
      </div>
    </Layout>
  );
}
