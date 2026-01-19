import React from 'react';
import { Gavel, Users, Calendar, AlertCircle } from 'lucide-react';

export const Jury = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Mon jury de soutenance
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Le jury de soutenance est composé d'enseignants qui évalueront votre travail et votre présentation orale.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 md:p-6">
        <p className="text-blue-900 font-medium">
          📌 Le jury est créé par le chef de département une fois votre mémoire terminé
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-primary-600" />
          Composition du jury
        </h3>

        <div className="space-y-4">
          <div className="border-l-4 border-indigo-500 bg-indigo-50 p-4">
            <h4 className="font-semibold text-indigo-900">Président du jury</h4>
            <p className="text-sm text-indigo-800 mt-1">
              Enseignant de grade élevé qui préside la soutenance et coordonne le jury
            </p>
          </div>

          <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
            <h4 className="font-semibold text-blue-900">Rapporteur</h4>
            <p className="text-sm text-blue-800 mt-1">
              Lit votre mémoire en profondeur, rédige un rapport et pose des questions détaillées
            </p>
          </div>

          <div className="border-l-4 border-green-500 bg-green-50 p-4">
            <h4 className="font-semibold text-green-900">Examinateur</h4>
            <p className="text-sm text-green-800 mt-1">
              Pose des questions sur votre travail et évalue votre soutenance
            </p>
          </div>

          <div className="border-l-4 border-purple-500 bg-purple-50 p-4">
            <h4 className="font-semibold text-purple-900">Encadreur (membre de droit)</h4>
            <p className="text-sm text-purple-800 mt-1">
              Votre enseignant encadreur fait automatiquement partie du jury
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary-600" />
          Informations visibles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">📅 Date et heure</h4>
            <p className="text-sm text-gray-600">
              Date exacte de votre soutenance avec l'heure de début
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">📍 Salle</h4>
            <p className="text-sm text-gray-600">
              Lieu où se déroulera votre soutenance
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">👥 Membres du jury</h4>
            <p className="text-sm text-gray-600">
              Noms, grades et rôles de chaque membre
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">📊 Note finale</h4>
            <p className="text-sm text-gray-600">
              Affichée après la délibération du jury
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-900 mb-3">Préparation de la soutenance</h4>
            <ul className="text-sm text-yellow-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>Préparez une présentation PowerPoint (20-25 slides maximum, 20 minutes de présentation)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>Relisez votre mémoire en entier plusieurs fois</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>Anticipez les questions possibles sur votre méthodologie et vos résultats</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>Répétez votre présentation plusieurs fois (devant des amis si possible)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>Arrivez 15 minutes avant l'heure prévue</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>Habillez-vous de manière professionnelle</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h4 className="font-semibold text-green-900 mb-3">✅ Déroulement de la soutenance</h4>
        <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
          <li><strong>Accueil</strong> - Le président présente le jury et l'étudiant</li>
          <li><strong>Présentation</strong> - Vous présentez votre travail (20 min)</li>
          <li><strong>Questions du rapporteur</strong> - Questions détaillées sur le mémoire</li>
          <li><strong>Questions des autres membres</strong> - Questions complémentaires</li>
          <li><strong>Délibération</strong> - Le jury délibère en votre absence</li>
          <li><strong>Proclamation</strong> - Annonce de la note et de la mention</li>
        </ol>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <h4 className="font-semibold text-purple-900 mb-3">🎓 Mentions possibles</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
            <span className="font-medium">Très Bien</span>
            <span className="text-purple-600">16 - 20 / 20</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
            <span className="font-medium">Bien</span>
            <span className="text-purple-600">14 - 15.99 / 20</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
            <span className="font-medium">Assez Bien</span>
            <span className="text-purple-600">12 - 13.99 / 20</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
            <span className="font-medium">Passable</span>
            <span className="text-purple-600">10 - 11.99 / 20</span>
          </div>
        </div>
      </div>
    </div>
  );
};
