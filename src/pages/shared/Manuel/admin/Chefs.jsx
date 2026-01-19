import React from 'react';
import { UserCheck, Plus, Mail } from 'lucide-react';

export const Chefs = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Gérer les chefs de département
        </h2>
        <p className="text-gray-600 leading-relaxed">
          En tant qu'administrateur, vous pouvez créer et assigner des chefs de département.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 md:p-6">
        <p className="text-blue-900 font-medium">
          📌 Chaque département doit avoir un chef pour fonctionner correctement
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="w-6 h-6 text-primary-600" />
          Créer un chef de département
        </h3>

        <ol className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                Allez dans "Gestion des chefs" puis cliquez sur "Nouveau chef"
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 mb-2">
                Remplissez le formulaire avec les informations du chef:
              </p>
              <ul className="text-xs text-gray-600 space-y-1 ml-4">
                <li>• Nom et prénom</li>
                <li>• Email professionnel (servira d'identifiant)</li>
                <li>• Téléphone (optionnel)</li>
                <li>• Département à gérer</li>
                <li>• Mot de passe (généré automatiquement ou saisi manuellement)</li>
              </ul>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                Validez la création. Le chef recevra un email avec ses identifiants.
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Mail className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-green-900 mb-2">Email automatique</h4>
            <p className="text-sm text-green-800">
              Lors de la création, un email est automatiquement envoyé au chef avec:
            </p>
            <ul className="text-sm text-green-800 space-y-1 mt-2 ml-4">
              <li>• Ses identifiants de connexion</li>
              <li>• Le lien vers la plateforme</li>
              <li>• Son rôle et responsabilités</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <h4 className="font-semibold text-purple-900 mb-3">🔄 Changer de chef</h4>
        <p className="text-sm text-purple-800 mb-2">
          Pour remplacer un chef de département:
        </p>
        <ol className="text-sm text-purple-800 space-y-1 list-decimal list-inside">
          <li>Créez un nouveau chef et assignez-le au département</li>
          <li>L'ancien chef perd automatiquement ses droits sur ce département</li>
          <li>Vous pouvez ensuite supprimer l'ancien compte si nécessaire</li>
        </ol>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h4 className="font-semibold text-yellow-900 mb-3">💡 Bonnes pratiques</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Utilisez toujours l'email professionnel de l'enseignant</li>
          <li>• Vérifiez que le département n'a pas déjà un chef</li>
          <li>• Informez le chef de ses responsabilités avant la création</li>
          <li>• Conservez une trace des changements de chefs</li>
        </ul>
      </div>
    </div>
  );
};
