import React from 'react';
import { AlertCircle, ArrowRight, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TransitionNotificationBanner = ({ transition }) => {
  const navigate = useNavigate();

  if (!transition) return null;

  // Calculer le nombre de jours depuis la proposition
  const joursDepuisProposition = Math.floor(
    (new Date() - new Date(transition.Date_Detection)) / (1000 * 60 * 60 * 24)
  );

  const isUrgent = joursDepuisProposition > 7;

  return (
    <div
      className={`${
        isUrgent ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'
      } border-l-4 p-4 mb-6 rounded-r-lg shadow-sm`}
    >
      <div className="flex items-start gap-4">
        {/* Icône */}
        <div className={`flex-shrink-0 ${isUrgent ? 'text-red-600' : 'text-yellow-600'}`}>
          <AlertCircle className="w-6 h-6" />
        </div>

        {/* Contenu principal */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold ${isUrgent ? 'text-red-900' : 'text-yellow-900'}`}>
              {isUrgent ? '🚨 Action urgente requise' : '⚠️ Transition d\'année académique en attente'}
            </h3>
            {isUrgent && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-red-200 text-red-800 rounded-full">
                URGENT
              </span>
            )}
          </div>

          <div className="space-y-2">
            {/* Info transition */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className={isUrgent ? 'text-red-800' : 'text-yellow-800'}>
                  <strong>{transition.Annee_Precedente}</strong> → <strong>{transition.Annee_Nouvelle}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className={isUrgent ? 'text-red-700' : 'text-yellow-700'}>
                  Proposée le {new Date(transition.Date_Detection).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>

              {joursDepuisProposition > 0 && (
                <span className={`text-xs font-medium ${isUrgent ? 'text-red-800' : 'text-yellow-800'}`}>
                  ({joursDepuisProposition} jour{joursDepuisProposition > 1 ? 's' : ''} en attente)
                </span>
              )}
            </div>

            {/* Message détaillé */}
            <p className={`text-sm ${isUrgent ? 'text-red-800' : 'text-yellow-800'}`}>
              {isUrgent ? (
                <>
                  Cette transition est en attente depuis plus de 7 jours.
                  Une action immédiate est nécessaire pour valider ou rejeter cette transition.
                </>
              ) : (
                <>
                  Une nouvelle année académique a été détectée.
                  Veuillez valider ou rejeter cette transition pour mettre à jour le système.
                </>
              )}
            </p>

            {/* Type de détection */}
            {transition.Auto_Detectee && (
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  isUrgent
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  🤖 Détection automatique
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bouton d'action */}
        <div className="flex-shrink-0">
          <button
            onClick={() => navigate('/admin/annee-academique')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isUrgent
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-yellow-600 text-white hover:bg-yellow-700'
            }`}
          >
            Gérer la transition
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Barre de progression visuelle (optionnel - pour montrer l'urgence) */}
      {isUrgent && (
        <div className="mt-3 w-full bg-red-200 rounded-full h-1.5">
          <div
            className="bg-red-600 h-1.5 rounded-full animate-pulse"
            style={{ width: `${Math.min((joursDepuisProposition / 30) * 100, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};
