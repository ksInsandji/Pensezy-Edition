import React from 'react';
import { MessageCircle, Send, CheckCircle, AlertCircle } from 'lucide-react';

export const Communication = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Communiquer avec l'encadreur
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Une fois votre encadrement validé, une messagerie intégrée vous permet de communiquer directement avec votre encadreur.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 md:p-6">
        <p className="text-blue-900 font-medium">
          📌 La messagerie est disponible dès que votre encadrement est validé par le chef de département
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary-600" />
          Où trouver la messagerie
        </h3>

        <div className="space-y-3 text-gray-700">
          <p>La messagerie apparaît automatiquement sur votre tableau de bord une fois l'encadrement validé.</p>
          <p>Vous la trouverez dans une carte intitulée <strong>"💬 Messagerie avec mon encadreur"</strong></p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
          <Send className="w-6 h-6 text-green-600" />
          Comment envoyer un message
        </h3>

        <ol className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">
              1
            </div>
            <div className="flex-1">
              <p className="text-sm text-green-800">
                Tapez votre message dans la zone de texte au bas de la messagerie
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">
              2
            </div>
            <div className="flex-1">
              <p className="text-sm text-green-800">
                Cliquez sur le bouton "Envoyer" ou appuyez sur Entrée
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">
              3
            </div>
            <div className="flex-1">
              <p className="text-sm text-green-800">
                Votre message apparaît immédiatement dans la conversation
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-purple-900 mb-3">Bonnes pratiques de communication</h4>
            <ul className="text-sm text-purple-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-bold">✓</span>
                <span>Soyez clair et précis dans vos demandes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">✓</span>
                <span>Utilisez un langage formel et respectueux</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">✓</span>
                <span>Envoyez vos questions par groupes logiques plutôt qu'une par une</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">✓</span>
                <span>Relisez vos messages avant de les envoyer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">✓</span>
                <span>Respectez les délais de réponse (24-48h en général)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-900 mb-3">À éviter</h4>
            <ul className="text-sm text-yellow-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-bold">✗</span>
                <span>Envoyer des messages trop tôt le matin ou tard le soir</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">✗</span>
                <span>Utiliser un langage familier ou des abréviations SMS</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">✗</span>
                <span>Harceler l'encadreur avec des messages répétés</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">✗</span>
                <span>Demander de relire tout votre travail à la dernière minute</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-3">💡 Exemples de bons messages</h4>
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-800 italic">
              "Bonjour Professeur, j'ai terminé le chapitre 2 de mon mémoire. Pourriez-vous me donner votre avis sur l'approche méthodologique que j'ai adoptée ? Je reste disponible pour toute discussion. Cordialement."
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-800 italic">
              "Bonjour Docteur, j'ai quelques questions concernant l'implémentation de l'algorithme. Serait-il possible de planifier un rendez-vous cette semaine ? Merci d'avance."
            </p>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
        <h4 className="font-semibold text-indigo-900 mb-3">📞 Autres moyens de communication</h4>
        <p className="text-sm text-indigo-800 mb-2">
          En complément de la messagerie intégrée, vous pouvez aussi :
        </p>
        <ul className="text-sm text-indigo-800 space-y-1">
          <li>• Envoyer un email (l'adresse est visible sur la fiche de l'encadreur)</li>
          <li>• Prendre rendez-vous pour une rencontre physique</li>
          <li>• Appeler si vous avez son numéro de téléphone</li>
        </ul>
      </div>
    </div>
  );
};
