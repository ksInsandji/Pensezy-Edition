import React from 'react';
import { Building, Plus, Edit, Trash } from 'lucide-react';

export const Departements = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Gérer les départements
        </h2>
        <p className="text-gray-600 leading-relaxed">
          En tant qu'administrateur, vous pouvez créer, modifier et gérer tous les départements de l'ENS.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 md:p-6">
        <p className="text-blue-900 font-medium">
          📌 Les départements sont la base de l'organisation académique
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="w-6 h-6 text-primary-600" />
          Créer un département
        </h3>

        <ol className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                Allez dans "Gestion des départements" puis cliquez sur "Nouveau département"
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                Remplissez le formulaire: nom du département et code (ex: "INFO" pour Informatique)
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                Validez la création. Le département est maintenant disponible.
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Edit className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-purple-900 mb-2">Modifier un département</h4>
              <p className="text-sm text-purple-800">
                Cliquez sur l'icône d'édition pour modifier le nom ou le code du département
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Trash className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-2">Supprimer un département</h4>
              <p className="text-sm text-red-800">
                ⚠️ Impossible si le département a des étudiants, enseignants ou chefs assignés
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h4 className="font-semibold text-yellow-900 mb-3">💡 Bonnes pratiques</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Utilisez des codes courts et clairs (3-5 lettres max)</li>
          <li>• Assurez-vous que chaque département a un chef assigné</li>
          <li>• Vérifiez régulièrement la cohérence des données</li>
        </ul>
      </div>
    </div>
  );
};
