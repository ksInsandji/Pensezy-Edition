import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { TransitionValidationModal } from '../../components/admin/TransitionValidationModal';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';
import {
  Calendar,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Clock,
  Archive,
  TrendingUp,
  Info
} from 'lucide-react';

/**
 * Page de gestion de l'année académique et des transitions
 * Accessible uniquement aux administrateurs
 */
export default function GestionAnneeAcademique() {
  const [loading, setLoading] = useState(true);
  const [parametres, setParametres] = useState(null);
  const [transitions, setTransitions] = useState([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showProposerModal, setShowProposerModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedTransition, setSelectedTransition] = useState(null);
  const [configForm, setConfigForm] = useState({
    dateLimite: '',
    transitionAutoDetection: true,
    archivageAuto: false,
    nbChoixMax: 3
  });
  const [nouvelleAnnee, setNouvelleAnnee] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paramsRes, transRes] = await Promise.all([
        axios.get(ENDPOINTS.ANNEE_PARAMETRES),
        axios.get(ENDPOINTS.ANNEE_TRANSITIONS)
      ]);

      setParametres(paramsRes.data.data);
      setTransitions(transRes.data.data || []);

      // Pré-remplir le formulaire de config
      if (paramsRes.data.data) {
        setConfigForm({
          dateLimite: paramsRes.data.data.dateLimiteTransition || '',
          transitionAutoDetection: paramsRes.data.data.transitionAutoDetection !== false,
          archivageAuto: paramsRes.data.data.archivageAuto || false,
          nbChoixMax: paramsRes.data.data.nbChoixMax || 3
        });
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.put(ENDPOINTS.ANNEE_PARAMETRES_UPDATE, configForm);
      toast.success('Configuration mise à jour avec succès');
      setShowConfigModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProposerTransition = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(ENDPOINTS.ANNEE_TRANSITION_PROPOSER, {
        anneeNouvelle: nouvelleAnnee
      });
      toast.success('Transition proposée avec succès');
      setShowProposerModal(false);
      setNouvelleAnnee('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la proposition');
    } finally {
      setSubmitting(false);
    }
  };

  const handleValiderTransition = (transition) => {
    setSelectedTransition(transition);
    setShowValidationModal(true);
  };

  const handleValidationSuccess = () => {
    setShowValidationModal(false);
    setSelectedTransition(null);
    fetchData();
  };

  const handleRejeterTransition = async (idTransition) => {
    const raison = window.prompt('Raison du rejet (optionnel) :');
    if (raison === null) return; // Annulé

    try {
      await axios.post(ENDPOINTS.ANNEE_TRANSITION_REJETER(idTransition), { raison });
      toast.success('Transition rejetée');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du rejet');
    }
  };

  const getStatutBadge = (statut) => {
    const config = {
      proposee: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'En attente' },
      validee: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Validée' },
      rejetee: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejetée' },
      en_cours: { color: 'bg-purple-100 text-purple-800', icon: RefreshCw, label: 'En cours' },
      terminee: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Terminée' }
    };

    const { color, icon: Icon, label } = config[statut] || config.proposee;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  const transitionEnAttente = transitions.find(t => t.Statut_Transition === 'proposee');
  const historiqueTransitions = transitions.filter(t => t.Statut_Transition !== 'proposee');

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <span>Gestion Année Académique</span>
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Configuration de l'année académique courante et gestion des transitions
          </p>
        </div>

        {/* Année courante */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Année Académique Courante</h2>
              <p className="text-2xl sm:text-4xl font-bold text-blue-600">
                {parametres?.anneeAcademiqueCourante || 'Non configurée'}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                {parametres?.anneeDebut && parametres?.anneeFin && (
                  <>Du {new Date(parametres.anneeDebut).toLocaleDateString('fr-FR')} au {new Date(parametres.anneeFin).toLocaleDateString('fr-FR')}</>
                )}
              </p>
            </div>
            <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
              <Button
                onClick={() => setShowConfigModal(true)}
                variant="secondary"
                className="flex-1 sm:flex-none text-sm"
              >
                <Settings className="w-4 h-4" />
                <span className="ml-1">Configurer</span>
              </Button>
              <Button
                onClick={() => {
                  // Pré-remplir avec l'année actuelle et l'année suivante
                  const anneeActuelle = new Date().getFullYear();
                  setNouvelleAnnee(`${anneeActuelle}-${anneeActuelle + 1}`);
                  setShowProposerModal(true);
                }}
                className="flex-1 sm:flex-none text-sm"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="ml-1 hidden xs:inline">Proposer</span> Transition
              </Button>
            </div>
          </div>
        </Card>

        {/* Paramètres actuels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Date limite transition</p>
                <p className="text-lg font-bold">
                  {parametres?.dateLimiteTransition
                    ? new Date(parametres.dateLimiteTransition).toLocaleDateString('fr-FR')
                    : 'Non définie'}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <RefreshCw className={`w-8 h-8 ${parametres?.transitionAutoDetection ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <p className="text-sm text-gray-600">Détection automatique</p>
                <p className="text-lg font-bold">
                  {parametres?.transitionAutoDetection ? 'Activée' : 'Désactivée'}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <Archive className={`w-8 h-8 ${parametres?.archivageAuto ? 'text-blue-600' : 'text-gray-400'}`} />
              <div>
                <p className="text-sm text-gray-600">Archivage auto</p>
                <p className="text-lg font-bold">
                  {parametres?.archivageAuto ? 'Activé' : 'Désactivé'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Transition en attente */}
        {transitionEnAttente && (
          <Card className="mb-6 border-yellow-300 bg-yellow-50">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-900 mb-2">
                  Transition en attente de validation
                </h3>
                <p className="text-yellow-800 mb-4">
                  Année : <span className="font-bold">{transitionEnAttente.Annee_Precedente}</span> → <span className="font-bold">{transitionEnAttente.Annee_Nouvelle}</span>
                </p>
                <p className="text-sm text-yellow-700 mb-4">
                  {transitionEnAttente.Auto_Detectee
                    ? '🤖 Détectée automatiquement par le système'
                    : '👤 Proposée manuellement'}
                  {' • Proposée le '}
                  {new Date(transitionEnAttente.Date_Detection).toLocaleDateString('fr-FR')}
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleValiderTransition(transitionEnAttente)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Valider et Exécuter
                  </Button>
                  <Button
                    onClick={() => handleRejeterTransition(transitionEnAttente.Id_Transition)}
                    variant="secondary"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Rejeter
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Historique transitions */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Historique des Transitions</h2>
          {historiqueTransitions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucune transition enregistrée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Année</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validé par</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {historiqueTransitions.map((transition) => (
                    <tr key={transition.Id_Transition} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium">{transition.Annee_Precedente}</span>
                        {' → '}
                        <span className="font-medium">{transition.Annee_Nouvelle}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(transition.Date_Detection).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        {getStatutBadge(transition.Statut_Transition)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {transition.Valide_Par || transition.Rejete_Par || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {transition.Auto_Detectee ? (
                          <span className="text-purple-600">🤖 Auto</span>
                        ) : (
                          <span className="text-blue-600">👤 Manuel</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Modal Configuration */}
        {showConfigModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Configuration Système</h2>
              <form onSubmit={handleUpdateConfig}>
                <div className="space-y-4">
                  <Input
                    label="Date limite transition"
                    type="date"
                    value={configForm.dateLimite}
                    onChange={(e) => setConfigForm({ ...configForm, dateLimite: e.target.value })}
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="autoDetection"
                      checked={configForm.transitionAutoDetection}
                      onChange={(e) => setConfigForm({ ...configForm, transitionAutoDetection: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="autoDetection" className="text-sm font-medium text-gray-700">
                      Activer la détection automatique
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="archivageAuto"
                      checked={configForm.archivageAuto}
                      onChange={(e) => setConfigForm({ ...configForm, archivageAuto: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="archivageAuto" className="text-sm font-medium text-gray-700">
                      Activer l'archivage automatique
                    </label>
                  </div>

                  <Input
                    label="Nombre maximum de choix d'encadreurs"
                    type="number"
                    min="1"
                    max="5"
                    value={configForm.nbChoixMax}
                    onChange={(e) => setConfigForm({ ...configForm, nbChoixMax: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <Button type="button" variant="secondary" onClick={() => setShowConfigModal(false)} className="flex-1">
                    Annuler
                  </Button>
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Proposer Transition */}
        {showProposerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Proposer une Transition</h2>
              <form onSubmit={handleProposerTransition}>
                <Input
                  label="Nouvelle année académique"
                  type="text"
                  placeholder={`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`}
                  value={nouvelleAnnee}
                  onChange={(e) => setNouvelleAnnee(e.target.value)}
                  required
                  pattern="\d{4}-\d{4}"
                />
                <p className="text-xs text-gray-500 mt-1">Format : YYYY-YYYY (ex: {new Date().getFullYear()}-{new Date().getFullYear() + 1})</p>

                <div className="flex gap-3 mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowProposerModal(false);
                      setNouvelleAnnee('');
                    }}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? 'Proposition...' : 'Proposer'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de validation de transition */}
        {showValidationModal && selectedTransition && (
          <TransitionValidationModal
            transition={selectedTransition}
            onClose={() => {
              setShowValidationModal(false);
              setSelectedTransition(null);
            }}
            onSuccess={handleValidationSuccess}
          />
        )}
      </div>
    </Layout>
  );
}
