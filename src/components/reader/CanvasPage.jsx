import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, XCircle, Loader, Archive, Users, RefreshCw, Database } from 'lucide-react';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';

export const TransitionValidationModal = ({ transition, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1-6: Résumé → Aperçu → Config → Confirmation → Progression → Rapport
  const [loading, setLoading] = useState(false);
  const [apercu, setApercu] = useState(null);
  const [config, setConfig] = useState({
    archiverAlumni: true,
    notifierUtilisateurs: true
  });
  const [confirmationText, setConfirmationText] = useState('');
  const [progression, setProgression] = useState({
    etape: '',
    pourcentage: 0,
    details: []
  });
  const [rapport, setRapport] = useState(null);

  useEffect(() => {
    if (step === 2) {
      fetchApercuActions();
    }
  }, [step]);

  const fetchApercuActions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(ENDPOINTS.ANNEE_TRANSITION_DETAILS(transition.Id_Transition));
      setApercu(response.data.data);
    } catch (error) {
      console.error('Erreur chargement aperçu:', error);
      toast.error('Erreur lors du chargement de l\'aperçu');
    } finally {
      setLoading(false);
    }
  };

  const handleValider = async () => {
    try {
      setLoading(true);
      setStep(5); // Progression

      // Simuler progression (en production, utiliser WebSocket ou polling)
      const progressInterval = setInterval(() => {
        setProgression(prev => ({
          ...prev,
          pourcentage: Math.min(prev.pourcentage + 10, 90)
        }));
      }, 500);

      const response = await axios.post(
        ENDPOINTS.ANNEE_TRANSITION_VALIDER(transition.Id_Transition),
        config
      );

      clearInterval(progressInterval);
      setProgression({ etape: 'Terminé', pourcentage: 100, details: [] });
      setRapport(response.data.data);
      setStep(6); // Rapport

      toast.success('Transition validée avec succès !');
    } catch (error) {
      console.error('Erreur validation transition:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la validation');
      setStep(4); // Retour à confirmation
    } finally {
      setLoading(false);
    }
  };

  const renderStep1Resume = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
        <div>
          <p className="text-sm text-gray-600">Transition d'année académique</p>
          <p className="text-2xl font-bold text-blue-900">
            {transition.Annee_Precedente} → {transition.Annee_Nouvelle}
          </p>
        </div>
        <RefreshCw className="w-12 h-12 text-blue-600" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-xs text-gray-500">Type de détection</p>
          <p className="font-semibold">
            {transition.Auto_Detectee ? 'Automatique' : 'Manuelle'}
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-xs text-gray-500">Date de proposition</p>
          <p className="font-semibold">
            {new Date(transition.Date_Detection).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-yellow-900">Attention - Action irréversible</p>
          <p className="text-sm text-yellow-800 mt-1">
            Cette opération va archiver toutes les données de l'année {transition.Annee_Precedente}
            et réinitialiser le système pour l'année {transition.Annee_Nouvelle}.
            Cette action ne peut pas être annulée.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Annuler
        </button>
        <button
          onClick={() => setStep(2)}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Suivant
        </button>
      </div>
    </div>
  );

  const renderStep2Apercu = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Aperçu des actions à effectuer</h3>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : apercu ? (
        <div className="space-y-3">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <Archive className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Archivage des encadrements</p>
              <p className="text-sm text-green-700">
                {apercu.nbEncadrements || 0} encadrement(s) seront archivés
              </p>
            </div>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-600" />
            <div>
              <p className="font-semibold text-purple-900">Création dossiers alumni</p>
              <p className="text-sm text-purple-700">
                {apercu.nbAlumni || 0} étudiant(s) en statut "Soutenu" passeront en mode alumni
              </p>
            </div>
          </div>

          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-3">
            <RefreshCw className="w-6 h-6 text-orange-600" />
            <div>
              <p className="font-semibold text-orange-900">Réinitialisation des quotas</p>
              <p className="text-sm text-orange-700">
                {apercu.nbQuotas || 0} quota(s) d'enseignants seront réinitialisés
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            <Database className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-900">Mise à jour paramètres système</p>
              <p className="text-sm text-blue-700">
                L'année académique courante sera mise à jour vers {transition.Annee_Nouvelle}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">Aucune donnée disponible</p>
      )}

      <div className="flex justify-between gap-3 mt-6">
        <button
          onClick={() => setStep(1)}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Précédent
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={loading}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  );

  const renderStep3Config = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Configuration de l'archivage</h3>

      <div className="space-y-3">
        <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
          <input
            type="checkbox"
            checked={config.archiverAlumni}
            onChange={(e) => setConfig({ ...config, archiverAlumni: e.target.checked })}
            className="mt-1"
          />
          <div>
            <p className="font-semibold">Archivage automatique des alumni</p>
            <p className="text-sm text-gray-600">
              Les étudiants ayant soutenu seront automatiquement marqués comme alumni
              et leur compte passera en mode lecture seule.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
          <input
            type="checkbox"
            checked={config.notifierUtilisateurs}
            onChange={(e) => setConfig({ ...config, notifierUtilisateurs: e.target.checked })}
            className="mt-1"
          />
          <div>
            <p className="font-semibold">Notification des utilisateurs</p>
            <p className="text-sm text-gray-600">
              Envoyer des notifications par email aux enseignants et étudiants concernés
              par la transition d'année.
            </p>
          </div>
        </label>
      </div>

      <div className="flex justify-between gap-3 mt-6">
        <button
          onClick={() => setStep(2)}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Précédent
        </button>
        <button
          onClick={() => setStep(4)}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Suivant
        </button>
      </div>
    </div>
  );

  const renderStep4Confirmation = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Confirmation finale</h3>

      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-900">⚠️ Dernier avertissement</p>
            <p className="text-sm text-red-800 mt-1">
              Vous êtes sur le point de valider la transition d'année académique.
              Cette action est <strong>irréversible</strong> et affectera l'ensemble du système.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">
          Pour confirmer, veuillez taper <span className="font-mono font-bold text-red-600">CONFIRMER</span> dans le champ ci-dessous :
        </p>
        <input
          type="text"
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
          placeholder="Tapez CONFIRMER"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex justify-between gap-3 mt-6">
        <button
          onClick={() => setStep(3)}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Précédent
        </button>
        <button
          onClick={handleValider}
          disabled={confirmationText !== 'CONFIRMER' || loading}
          className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Validation en cours...' : 'Valider la transition'}
        </button>
      </div>
    </div>
  );

  const renderStep5Progression = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Transition en cours...</h3>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
          <p className="font-medium">{progression.etape || 'Initialisation...'}</p>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progression.pourcentage}%` }}
          />
        </div>

        <p className="text-center text-sm text-gray-600">
          {progression.pourcentage}% complété
        </p>

        {progression.details.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
            <p className="text-xs font-semibold mb-2">Détails :</p>
            {progression.details.map((detail, idx) => (
              <p key={idx} className="text-xs text-gray-600">• {detail}</p>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          ⏳ Cette opération peut prendre plusieurs minutes. Ne fermez pas cette fenêtre.
        </p>
      </div>
    </div>
  );

  const renderStep6Rapport = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Rapport de transition</h3>

      {rapport ? (
        <div className="space-y-3">
          {rapport.success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">✅ Transition réussie</p>
                <p className="text-sm text-green-700 mt-1">
                  La transition vers l'année {transition.Annee_Nouvelle} a été effectuée avec succès.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="font-semibold">Actions effectuées :</p>
            <div className="space-y-1">
              {rapport.encadrementsArchives > 0 && (
                <p className="text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  {rapport.encadrementsArchives} encadrement(s) archivés
                </p>
              )}
              {rapport.alumniCrees > 0 && (
                <p className="text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  {rapport.alumniCrees} dossier(s) alumni créés
                </p>
              )}
              {rapport.quotasReinitialises > 0 && (
                <p className="text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  {rapport.quotasReinitialises} quota(s) réinitialisés
                </p>
              )}
              <p className="text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Paramètres système mis à jour
              </p>
            </div>
          </div>

          {rapport.erreurs && rapport.erreurs.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Erreurs rencontrées :</p>
                  <ul className="text-sm text-red-700 mt-1 space-y-1">
                    {rapport.erreurs.map((err, idx) => (
                      <li key={idx}>• {err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">Aucun rapport disponible</p>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => {
            onSuccess();
            onClose();
          }}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Fermer
        </button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderStep1Resume();
      case 2: return renderStep2Apercu();
      case 3: return renderStep3Config();
      case 4: return renderStep4Confirmation();
      case 5: return renderStep5Progression();
      case 6: return renderStep6Rapport();
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">Validation Transition d'Année</h2>
            <p className="text-sm text-gray-500 mt-1">
              Étape {step} sur 6
            </p>
          </div>
          {step !== 5 && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                  s < step
                    ? 'bg-green-500 text-white'
                    : s === step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${((step - 1) / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};
