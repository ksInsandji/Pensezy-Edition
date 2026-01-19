import React, { useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import {
  Building,
  UserCheck,
  Users,
  Home,
  ChevronDown,
  ChevronRight,
  Shield
} from 'lucide-react';

export default function AdminAide() {
  const [openSection, setOpenSection] = useState('role');

  const sections = [
    {
      id: 'role',
      icon: Shield,
      title: 'Votre rôle d\'administrateur',
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-900 font-medium">🔐 Vous avez les droits d'administration les plus élevés</p>
          </div>

          <p className="text-gray-700">En tant qu'administrateur, vous gérez :</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
            <li><strong>Les départements :</strong> Créer, modifier, supprimer les départements de l'ENS</li>
            <li><strong>Les chefs de département :</strong> Nommer ou remplacer les chefs</li>
            <li><strong>Les enseignants :</strong> Vue globale sur tous les enseignants</li>
            <li><strong>Les statistiques :</strong> Vue d'ensemble de toute l'institution</li>
          </ul>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <h5 className="font-medium text-yellow-900 mb-2">⚠️ Responsabilités</h5>
            <p className="text-sm text-yellow-800">
              Vos actions affectent l'ensemble de l'institution. Soyez prudent lors des suppressions et modifications.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'departements',
      icon: Building,
      title: 'Gestion des départements',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Actions disponibles :</h4>

          <div className="space-y-3">
            <div className="border border-blue-200 bg-blue-50 p-3 rounded">
              <h5 className="font-medium text-blue-900 text-sm">➕ Créer un département</h5>
              <ul className="text-xs text-blue-800 mt-2 space-y-1 list-disc list-inside">
                <li>Nom du département (ex: "Informatique")</li>
                <li>Code (ex: "INFO")</li>
                <li>Description</li>
                <li>Quota par encadreur (nombre max d'étudiants)</li>
              </ul>
            </div>

            <div className="border border-green-200 bg-green-50 p-3 rounded">
              <h5 className="font-medium text-green-900 text-sm">✏️ Modifier</h5>
              <p className="text-xs text-green-800 mt-1">
                Mettre à jour les informations d'un département existant
              </p>
            </div>

            <div className="border border-red-200 bg-red-50 p-3 rounded">
              <h5 className="font-medium text-red-900 text-sm">🗑️ Supprimer</h5>
              <p className="text-xs text-red-800 mt-1">
                Attention : impossible si le département a des étudiants, enseignants ou filières
              </p>
            </div>
          </div>

          <h4 className="font-semibold text-gray-900 mt-4">Informations affichées :</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
            <li>Nombre d'étudiants</li>
            <li>Nombre d'enseignants</li>
            <li>Nombre de filières</li>
            <li>Chef de département actuel</li>
            <li>Quota par encadreur</li>
          </ul>
        </div>
      )
    },
    {
      id: 'chefs',
      icon: UserCheck,
      title: 'Gestion des chefs de département',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Nommer un chef :</h4>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
            <li><strong>Sélectionnez le département :</strong> Celui qui a besoin d'un chef</li>
            <li><strong>Choisissez l'enseignant :</strong> Parmi les enseignants du département</li>
            <li><strong>Validez :</strong> L'enseignant devient automatiquement chef</li>
          </ol>

          <h4 className="font-semibold text-gray-900 mt-4">Remplacer un chef :</h4>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
            <li>Allez dans le département concerné</li>
            <li>Cliquez sur "Remplacer le chef"</li>
            <li>Sélectionnez le nouvel enseignant</li>
            <li>L'ancien chef redevient enseignant normal</li>
          </ol>

          <h4 className="font-semibold text-gray-900 mt-4">Retirer un chef :</h4>
          <p className="text-sm text-gray-700">
            Transforme le chef en enseignant normal. Le département n'aura temporairement pas de chef.
          </p>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
            <h5 className="font-medium text-purple-900 mb-2">💡 Critères de sélection</h5>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Grade élevé (Professeur, Maître de conférences)</li>
              <li>• Ancienneté dans le département</li>
              <li>• Capacités de gestion</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'enseignants',
      icon: Users,
      title: 'Vue globale des enseignants',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Consultez la liste de tous les enseignants de l'institution.
          </p>

          <h4 className="font-semibold text-gray-900">Informations affichées :</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
            <li>Nom, prénom, matricule</li>
            <li>Email</li>
            <li>Département</li>
            <li>Grade</li>
            <li>Statut (Chef ou Enseignant)</li>
            <li>Nombre d'étudiants encadrés</li>
            <li>Quota maximum</li>
          </ul>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h5 className="font-medium text-blue-900 mb-2">📊 Utilité</h5>
            <p className="text-sm text-blue-800">
              Cette vue vous permet d'avoir une vision d'ensemble de la charge de travail et de la répartition des enseignants.
            </p>
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
          <h4 className="font-semibold text-gray-900">Statistiques globales :</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-900 text-sm">Départements</h5>
              <p className="text-xs text-gray-600 mt-1">
                Nombre total de départements
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-900 text-sm">Enseignants</h5>
              <p className="text-xs text-gray-600 mt-1">
                Total enseignants, dont chefs de département
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-900 text-sm">Étudiants</h5>
              <p className="text-xs text-gray-600 mt-1">
                Total tous départements confondus
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-900 text-sm">Encadrements</h5>
              <p className="text-xs text-gray-600 mt-1">
                Encadrements actifs et soutenances
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <h5 className="font-medium text-green-900 mb-2">✅ Graphiques et comparaisons</h5>
            <p className="text-sm text-green-800">
              Le dashboard affiche des graphiques comparatifs entre départements pour faciliter le pilotage global.
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
          <h1 className="text-3xl font-bold text-gray-900">Guide Administrateur</h1>
          <p className="text-gray-600 mt-2">
            Guide complet pour administrer l'ensemble de l'institution.
          </p>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-2">🔐 Administration Système</h2>
          <p className="text-red-800">
            Vous gérez la structure de l'institution : départements, chefs, et vue d'ensemble.
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
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Icon className="w-6 h-6 text-red-600" />
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
          <h3 className="font-semibold text-gray-900 mb-3">🔒 Sécurité</h3>
          <p className="text-sm text-gray-700 mb-2">
            En tant qu'administrateur, vous avez un accès privilégié :
          </p>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Protégez vos identifiants de connexion</li>
            <li>Ne partagez jamais votre mot de passe</li>
            <li>Déconnectez-vous après chaque session</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
