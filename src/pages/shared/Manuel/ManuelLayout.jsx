import React, { useState } from 'react';
import { Layout } from '../../../components/layout/Layout';
import { Card } from '../../../components/common/Card';
import { useAuth } from '../../../contexts/AuthContext';
import { NavLink, Outlet } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Users,
  UserCheck,
  Gavel,
  Settings,
  Search,
  ChevronRight,
  Home
} from 'lucide-react';

export const ManuelLayout = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const getSections = () => {
    const role = user?.role;

    const commonSections = [
      {
        title: 'Vue d\'ensemble',
        path: '/manuel/overview',
        icon: Home,
        description: 'Introduction au système MemoRIS'
      }
    ];

    if (role === 'etudiant') {
      return [
        ...commonSections,
        {
          title: 'Proposer un thème',
          path: '/manuel/etudiant/proposer-theme',
          icon: FileText,
          description: 'Comment proposer votre thème de mémoire'
        },
        {
          title: 'Choisir un encadreur',
          path: '/manuel/etudiant/choisir-encadreur',
          icon: UserCheck,
          description: 'Sélectionner et contacter votre encadreur'
        },
        {
          title: 'Mon jury de soutenance',
          path: '/manuel/etudiant/jury',
          icon: Gavel,
          description: 'Comprendre le jury et la soutenance'
        },
        {
          title: 'Communiquer avec l\'encadreur',
          path: '/manuel/etudiant/communication',
          icon: Users,
          description: 'Utiliser la messagerie intégrée'
        }
      ];
    }

    if (role === 'enseignant' || role === 'chef') {
      return [
        ...commonSections,
        {
          title: 'Gérer les demandes',
          path: '/manuel/enseignant/demandes',
          icon: FileText,
          description: 'Accepter ou refuser les demandes d\'encadrement'
        },
        {
          title: 'Encadrer les étudiants',
          path: '/manuel/enseignant/encadrement',
          icon: Users,
          description: 'Suivre vos étudiants et valider leurs thèmes'
        },
        {
          title: 'Participer aux jurys',
          path: '/manuel/enseignant/jurys',
          icon: Gavel,
          description: 'Rôles dans les jurys et évaluation'
        }
      ];
    }

    if (role === 'admin') {
      return [
        ...commonSections,
        {
          title: 'Gérer les départements',
          path: '/manuel/admin/departements',
          icon: Settings,
          description: 'Créer et administrer les départements'
        },
        {
          title: 'Gérer les chefs',
          path: '/manuel/admin/chefs',
          icon: UserCheck,
          description: 'Nommer et remplacer les chefs de département'
        }
      ];
    }

    return commonSections;
  };

  const sections = getSections();
  const filteredSections = searchQuery
    ? sections.filter(section =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sections;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 md:p-8 text-white">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-8 h-8 md:w-10 md:h-10" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Manuel d'emploi MemoRIS</h1>
              <p className="text-primary-100 mt-1 text-sm md:text-base">
                Guide complet pour utiliser l'application
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar de navigation */}
          <div className="lg:col-span-1">
            <Card>
              {/* Barre de recherche */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher dans le manuel..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {filteredSections.map((section) => (
                  <NavLink
                    key={section.path}
                    to={section.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`
                    }
                  >
                    <section.icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{section.title}</p>
                      <p className="text-xs text-gray-500 truncate">{section.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  </NavLink>
                ))}
              </nav>

              {/* Info */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Astuce:</strong> Utilisez Ctrl+F pour rechercher rapidement dans le manuel.
                </p>
              </div>
            </Card>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-2">
            <Card>
              <Outlet />
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};
