import React from 'react';
import { Users, CheckCircle, MessageCircle } from 'lucide-react';

export const Encadrement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Encadrer les étudiants
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Une fois la demande acceptée, vous devez guider l'étudiant tout au long de la rédaction de son mémoire.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 md:p-6">
        <p className="text-blue-900 font-medium">
          📌 L'encadrement commence dès la validation par le chef de département
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-primary-600" />
          Vos responsabilités
        </h3>

        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
            <h4 className="font-semibold text-blue-900">Valider le thème</h4>
            <p className="text-sm text-blue-800 mt-1">
              Approuvez le thème final ou demandez des modifications si nécessaire
            </p>
          </div>

          <div className="border-l-4 border-green-500 bg-green-50 p-4">
            <h4 className="font-semibold text-green-900">Suivre les progrès</h4>
            <p className="text-sm text-green-800 mt-1">
              Planifiez des rencontres régulières (toutes les 2 semaines minimum)
            </p>
          </div>

          <div className="border-l-4 border-purple-500 bg-purple-50 p-4">
            <h4 className="font-semibold text-purple-900">Orienter les recherches</h4>
            <p className="text-sm text-purple-800 mt-1">
              Guidez l'étudiant dans sa méthodologie et ses choix techniques
            </p>
          </div>

          <div className="border-l-4 border-indigo-500 bg-indigo-50 p-4">
            <h4 className="font-semibold text-indigo-900">Relire et corriger</h4>
            <p className="text-sm text-indigo-800 mt-1">
              Relisez les chapitres et donnez des retours constructifs
            </p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <MessageCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-green-900 mb-3">Communication avec l'étudiant</h4>
            <p className="text-sm text-green-800 mb-2">
              Une messagerie intégrée est disponible sur votre tableau de bord pour chaque étudiant encadré.
            </p>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Répondez dans les 24-48h aux messages</li>
              <li>• Soyez clair dans vos retours</li>
              <li>• Encouragez et motivez l'étudiant</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <h4 className="font-semibold text-purple-900 mb-3">💡 Bonnes pratiques</h4>
        <ul className="text-sm text-purple-800 space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <span>Fixez un calendrier de travail avec des jalons clairs</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <span>Demandez des livrables réguliers (plan, chapitres, etc.)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <span>Soyez disponible mais fixez des limites raisonnables</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <span>Encouragez l'autonomie de l'étudiant</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
