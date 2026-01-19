import React from 'react';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

export const Demandes = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Gérer les demandes d'encadrement
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Les étudiants vous envoient des demandes d'encadrement avec leur thème. Vous devez accepter ou refuser chaque demande.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 md:p-6">
        <p className="text-blue-900 font-medium">
          📌 Consultez régulièrement vos demandes dans "Mes encadrements"
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary-600" />
          Comment procéder
        </h3>

        <ol className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Accédez aux demandes</h4>
              <p className="text-sm text-gray-600 mt-1">
                Cliquez sur "Mes encadrements" dans le menu, puis sur l'onglet "Demandes en attente"
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Examinez la demande</h4>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p>• Nom et matricule de l'étudiant</p>
                <p>• Titre et description du thème</p>
                <p>• Filière et niveau de l'étudiant</p>
                <p>• Date de la demande</p>
              </div>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Prenez votre décision</h4>
              <p className="text-sm text-gray-600 mt-1">
                Cliquez sur "Accepter" ou "Refuser" selon votre évaluation
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-3">Accepter une demande</h4>
              <ul className="text-sm text-green-800 space-y-2">
                <li>✓ Le thème correspond à votre spécialité</li>
                <li>✓ Vous avez la disponibilité nécessaire</li>
                <li>✓ Le projet vous semble réalisable</li>
                <li>✓ Vous n'avez pas atteint votre quota</li>
              </ul>
              <p className="text-xs text-green-700 mt-3 italic">
                Après acceptation, la demande est envoyée au chef de département pour validation finale
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-3">Refuser une demande</h4>
              <p className="text-sm text-red-800 mb-2">
                Indiquez toujours un motif clair :
              </p>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Quota d'encadrement atteint</li>
                <li>• Thème hors de votre spécialité</li>
                <li>• Projet trop vague ou peu réaliste</li>
                <li>• Indisponibilité temporaire</li>
              </ul>
              <p className="text-xs text-red-700 mt-3 italic">
                L'étudiant pourra voir votre motif et choisir un autre encadreur
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-900 mb-3">Délai de réponse</h4>
            <p className="text-sm text-yellow-800">
              Essayez de répondre dans les <strong>48-72 heures</strong> pour ne pas faire attendre l'étudiant.
              Un délai raisonnable permet à l'étudiant de s'organiser et éventuellement de chercher un autre encadreur si nécessaire.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <h4 className="font-semibold text-purple-900 mb-3">💡 Bonnes pratiques</h4>
        <ul className="text-sm text-purple-800 space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <span>Lisez attentivement le thème proposé avant de décider</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <span>Vérifiez votre charge d'encadrement actuelle</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <span>Soyez constructif dans vos motifs de refus</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <span>N'hésitez pas à demander des modifications du thème</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
