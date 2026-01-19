import React from 'react';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';

export const ProposerTheme = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Proposer un thème de mémoire
        </h2>
        <p className="text-gray-600 leading-relaxed">
          La proposition de thème est la première étape de votre parcours de mémoire. Voici comment procéder.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 md:p-6">
        <p className="text-blue-900 font-medium">
          📌 C'est la première étape cruciale de votre parcours de mémoire
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary-600" />
          Étapes à suivre
        </h3>

        <ol className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Accédez au formulaire</h4>
              <p className="text-sm text-gray-600 mt-1">
                Dans le menu de gauche, cliquez sur "Proposer un thème" ou depuis votre tableau de bord.
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Remplissez les informations</h4>
              <div className="mt-2 space-y-2">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-900 text-sm">Titre du thème</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Donnez un titre clair et précis (ex: "Développement d'une application mobile de gestion scolaire")
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-900 text-sm">Description détaillée</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Expliquez en détail: problématique, objectifs, méthodologie envisagée, résultats attendus
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-900 text-sm">Domaine de recherche</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Précisez le domaine (ex: Génie Logiciel, Intelligence Artificielle, Réseaux, etc.)
                  </p>
                </div>
              </div>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Soumettez votre thème</h4>
              <p className="text-sm text-gray-600 mt-1">
                Vérifiez bien toutes les informations avant de cliquer sur "Soumettre le thème".
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-green-900 mb-2">Après la soumission</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Votre thème apparaît avec le statut "En attente"</li>
              <li>• Vous devez maintenant choisir un encadreur</li>
              <li>• L'encadreur validera ou demandera des modifications</li>
              <li>• Vous pouvez modifier le thème tant qu'il n'est pas validé</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-900 mb-2">Conseils importants</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>✓ Soyez clair et précis dans votre description</li>
              <li>✓ Assurez-vous que le thème correspond à votre filière</li>
              <li>✓ Évitez les sujets trop vastes ou trop complexes</li>
              <li>✓ Consultez les anciens mémoires pour vous inspirer</li>
              <li>✓ Demandez conseil à vos enseignants si besoin</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <h4 className="font-semibold text-purple-900 mb-3">💡 Exemples de bons titres</h4>
        <div className="space-y-2 text-sm">
          <div className="bg-white p-3 rounded-lg border border-purple-200">
            <p className="font-medium text-gray-900">"Conception et développement d'une plateforme de e-learning pour l'ENS"</p>
            <p className="text-xs text-gray-600 mt-1">✓ Clair, précis, réalisable</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-purple-200">
            <p className="font-medium text-gray-900">"Système de détection de fraude bancaire par machine learning"</p>
            <p className="text-xs text-gray-600 mt-1">✓ Domaine défini, technologie claire</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-purple-200">
            <p className="font-medium text-gray-900">"Optimisation des performances d'un réseau Wi-Fi universitaire"</p>
            <p className="text-xs text-gray-600 mt-1">✓ Problème concret, contexte précis</p>
          </div>
        </div>
      </div>
    </div>
  );
};
