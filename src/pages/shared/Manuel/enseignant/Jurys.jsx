import React from 'react';
import { Gavel, Users, Award } from 'lucide-react';

export const Jurys = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Participer aux jurys
        </h2>
        <p className="text-gray-600 leading-relaxed">
          En tant qu'enseignant, vous pouvez être désigné comme membre d'un jury de soutenance dans différents rôles.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 md:p-6">
        <p className="text-blue-900 font-medium">
          📌 Les jurys sont créés par le chef de département
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-primary-600" />
          Les différents rôles
        </h3>

        <div className="space-y-4">
          <div className="border-l-4 border-indigo-500 bg-indigo-50 p-4">
            <h4 className="font-semibold text-indigo-900 mb-2">👑 Président</h4>
            <p className="text-sm text-indigo-800">
              Préside la soutenance, coordonne le jury, gère le temps et annonce la note finale.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
            <h4 className="font-semibold text-blue-900 mb-2">📝 Rapporteur</h4>
            <p className="text-sm text-blue-800">
              Lit le mémoire en profondeur, rédige un rapport écrit et pose des questions détaillées.
            </p>
          </div>

          <div className="border-l-4 border-green-500 bg-green-50 p-4">
            <h4 className="font-semibold text-green-900 mb-2">🔍 Examinateur</h4>
            <p className="text-sm text-green-800">
              Lit le mémoire, pose des questions complémentaires et participe à l'évaluation.
            </p>
          </div>

          <div className="border-l-4 border-purple-500 bg-purple-50 p-4">
            <h4 className="font-semibold text-purple-900 mb-2">👨‍🏫 Encadreur</h4>
            <p className="text-sm text-purple-800">
              Membre de droit du jury, présente le travail et défend l'étudiant si besoin.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h4 className="font-semibold text-yellow-900 mb-3">📋 Responsabilités selon le rôle</h4>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-yellow-900 mb-1">Si vous êtes Rapporteur:</p>
            <ul className="text-yellow-800 space-y-1 ml-4">
              <li>• Lire le mémoire en entier attentivement</li>
              <li>• Rédiger un rapport écrit (2-3 pages)</li>
              <li>• Préparer des questions précises</li>
              <li>• Présenter vos observations au jury</li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-yellow-900 mb-1">Si vous êtes Président:</p>
            <ul className="text-yellow-800 space-y-1 ml-4">
              <li>• Ouvrir et clôturer la soutenance</li>
              <li>• Donner la parole à chaque membre</li>
              <li>• Gérer le temps de présentation</li>
              <li>• Diriger la délibération</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Award className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-green-900 mb-3">Critères d'évaluation</h4>
            <ul className="text-sm text-green-800 space-y-2">
              <li>• <strong>Qualité du travail écrit</strong> (40%): Clarté, rigueur méthodologique, résultats</li>
              <li>• <strong>Présentation orale</strong> (30%): Clarté de l'exposé, maîtrise du temps</li>
              <li>• <strong>Réponses aux questions</strong> (20%): Pertinence et maîtrise du sujet</li>
              <li>• <strong>Originalité et apport</strong> (10%): Innovation et contribution</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <h4 className="font-semibold text-purple-900 mb-3">💡 Conseils pour les membres du jury</h4>
        <ul className="text-sm text-purple-800 space-y-2">
          <li>✓ Préparez vos questions à l'avance</li>
          <li>✓ Soyez bienveillant mais exigeant</li>
          <li>✓ Posez des questions ouvertes qui permettent à l'étudiant de s'exprimer</li>
          <li>✓ Écoutez attentivement les réponses</li>
          <li>✓ Soyez objectif dans votre évaluation</li>
        </ul>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-3">📅 Consulter vos jurys</h4>
        <p className="text-sm text-gray-600">
          Vous pouvez voir tous vos jurys à venir dans la section "Mes jurys" du menu.
          Chaque jury affiche la date, l'heure, la salle, l'étudiant concerné et votre rôle dans le jury.
        </p>
      </div>
    </div>
  );
};
