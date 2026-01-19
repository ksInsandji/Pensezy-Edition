import React from 'react';
import { UserCheck, CheckCircle, AlertCircle, Award } from 'lucide-react';

export const ChoisirEncadreur = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Choisir un encadreur
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Après avoir proposé votre thème, vous devez choisir un enseignant qui vous encadrera tout au long de la rédaction de votre mémoire.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 md:p-6">
        <p className="text-blue-900 font-medium">
          📌 Le choix de l'encadreur est crucial pour la réussite de votre mémoire
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-primary-600" />
          Comment procéder
        </h3>

        <ol className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Consultez la liste des enseignants</h4>
              <p className="text-sm text-gray-600 mt-1">
                Allez dans "Choisir encadreur" pour voir tous les enseignants disponibles de votre département.
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Vérifiez les informations</h4>
              <div className="mt-2 space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <Award className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Grade :</span> Professeur, Maître de conférences, Chargé de cours, Assistant
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Award className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Spécialité :</span> Doit correspondre au domaine de votre thème
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Award className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Disponibilité :</span> Nombre d'étudiants déjà encadrés / quota maximum
                  </div>
                </div>
              </div>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Envoyez votre demande</h4>
              <p className="text-sm text-gray-600 mt-1">
                Cliquez sur "Choisir cet encadreur" pour l'enseignant souhaité. Votre demande lui sera envoyée avec votre thème.
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <h4 className="font-semibold text-purple-900 mb-3">💡 Critères de choix</h4>
        <ul className="text-sm text-purple-800 space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <span><strong>Spécialité :</strong> Choisissez un enseignant spécialisé dans le domaine de votre thème</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <span><strong>Disponibilité :</strong> Vérifiez qu'il n'a pas atteint son quota d'encadrements</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <span><strong>Expérience :</strong> Un enseignant de grade élevé peut être plus expérimenté</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <span><strong>Accessibilité :</strong> Privilégiez un encadreur disponible et accessible</span>
          </li>
        </ul>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h4 className="font-semibold text-green-900 mb-3">📊 Statuts de la demande</h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium whitespace-nowrap">
              ⏳ Demande envoyée
            </span>
            <p className="text-green-800">L'enseignant n'a pas encore répondu. Patience (48-72h normal)</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium whitespace-nowrap">
              ✅ Acceptée
            </span>
            <p className="text-green-800">L'enseignant a accepté, en attente de validation du chef de département</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium whitespace-nowrap">
              ✅ Validé
            </span>
            <p className="text-green-800">Votre encadrement est confirmé ! Vous pouvez commencer à travailler</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium whitespace-nowrap">
              ❌ Refusée
            </span>
            <p className="text-green-800">Vous devez choisir un autre encadreur. Consultez le motif du refus</p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-900 mb-2">Que faire en cas de refus ?</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>1. Lisez attentivement le motif du refus</li>
              <li>2. Si nécessaire, modifiez votre thème</li>
              <li>3. Choisissez un autre encadreur plus adapté</li>
              <li>4. Ne vous découragez pas, c'est normal !</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
