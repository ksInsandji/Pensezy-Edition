import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  RetroPlanningProgress,
  RetroPlanningTimeline,
  JalonModal,
  JalonValidationModal,
  JalonDetailModal,
  LivrableUploader,
  PropositionModal,
  PropositionsManagerModal,
  PropositionsBadge
} from '../../components/retroplanning';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';
import {
  Calendar,
  ArrowLeft,
  Settings,
  RefreshCw,
  User,
  BookOpen,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

export default function RetroPlanningPage() {
  const { idEncadrement } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [retroPlanning, setRetroPlanning] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [encadrementInfo, setEncadrementInfo] = useState(null);

  // États des modals
  const [showJalonModal, setShowJalonModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showLivrableModal, setShowLivrableModal] = useState(false);
  const [showPropositionModal, setShowPropositionModal] = useState(false);
  const [showPropositionsManager, setShowPropositionsManager] = useState(false);
  const [selectedJalon, setSelectedJalon] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [propositionsEnAttente, setPropositionsEnAttente] = useState([]);

  const isEncadreur = user?.role === 'enseignant' || user?.role === 'chef';

  useEffect(() => {
    if (idEncadrement) {
      fetchData();
    }
  }, [idEncadrement]);

  // Charger les propositions en attente pour l'encadreur
  useEffect(() => {
    if (isEncadreur) {
      fetchPropositionsEnAttente();
    }
  }, [isEncadreur]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [planningRes, templatesRes] = await Promise.all([
        axios.get(ENDPOINTS.RETRO_PLANNING_BY_ENCADREMENT(idEncadrement)),
        axios.get(ENDPOINTS.RETRO_PLANNING_TEMPLATES)
      ]);

      setRetroPlanning(planningRes.data.data);
      setTemplates(templatesRes.data.data || []);

      // Extraire les infos de l'encadrement si disponibles
      if (planningRes.data.data?.encadrement) {
        setEncadrementInfo(planningRes.data.data.encadrement);
      }
    } catch (error) {
      console.error('Erreur chargement rétro-planning:', error);
      if (error.response?.status === 403) {
        toast.error('Vous n\'avez pas accès à ce rétro-planning');
        navigate(-1);
      } else if (error.response?.status === 404 || !error.response?.data?.data) {
        // Pas encore de rétro-planning, on peut le créer
        setRetroPlanning(null);
      } else {
        toast.error('Erreur lors du chargement');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPropositionsEnAttente = async () => {
    try {
      const response = await axios.get(ENDPOINTS.RETRO_PLANNING_PROPOSITIONS_EN_ATTENTE);
      setPropositionsEnAttente(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement propositions:', error);
    }
  };

  const handleCreateRetroPlanning = async (avecTemplates = true) => {
    setActionLoading(true);
    try {
      const response = await axios.post(ENDPOINTS.RETRO_PLANNING_CREATE(idEncadrement), {
        avecTemplates
      });
      setRetroPlanning(response.data.data);
      toast.success('Plan de travail créé avec succès');
    } catch (error) {
      console.error('Erreur création rétro-planning:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setActionLoading(false);
    }
  };

  // ============ HANDLERS JALONS ============

  const handleCreateJalon = async (jalonData) => {
    setActionLoading(true);
    try {
      await axios.post(
        ENDPOINTS.RETRO_PLANNING_CREATE_JALON(retroPlanning.Id_RetroPlanning),
        jalonData
      );
      toast.success('Jalon créé avec succès');
      setShowJalonModal(false);
      fetchData();
    } catch (error) {
      console.error('Erreur création jalon:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création du jalon');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateJalon = async (jalonData) => {
    setActionLoading(true);
    try {
      await axios.put(
        ENDPOINTS.RETRO_PLANNING_UPDATE_JALON(selectedJalon.Id_Jalon),
        jalonData
      );
      toast.success('Jalon modifié avec succès');
      setShowJalonModal(false);
      setSelectedJalon(null);
      fetchData();
    } catch (error) {
      console.error('Erreur modification jalon:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteJalon = async (jalon) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le jalon "${jalon.Titre}" ?`)) {
      return;
    }

    try {
      await axios.delete(ENDPOINTS.RETRO_PLANNING_DELETE_JALON(jalon.Id_Jalon));
      toast.success('Jalon supprimé');
      fetchData();
    } catch (error) {
      console.error('Erreur suppression jalon:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleValidateJalon = async (validationData) => {
    setActionLoading(true);
    try {
      await axios.post(
        ENDPOINTS.RETRO_PLANNING_VALIDER_JALON(selectedJalon.Id_Jalon),
        validationData
      );
      toast.success(validationData.valider ? 'Jalon validé' : 'Jalon rouvert');
      setShowValidationModal(false);
      setSelectedJalon(null);
      fetchData();
    } catch (error) {
      console.error('Erreur validation jalon:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la validation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProgression = async (jalon, progression) => {
    try {
      await axios.patch(
        ENDPOINTS.RETRO_PLANNING_UPDATE_PROGRESSION(jalon.Id_Jalon),
        { progression }
      );
      toast.success(`Progression mise à jour: ${progression}%`);
      fetchData();
    } catch (error) {
      console.error('Erreur mise à jour progression:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleMarkAsComplete = async (jalon) => {
    try {
      await axios.put(
        ENDPOINTS.RETRO_PLANNING_UPDATE_JALON(jalon.Id_Jalon),
        { statut: 'Termine', progression: 100 }
      );
      toast.success('Jalon marqué comme terminé - En attente de validation');
      fetchData();
    } catch (error) {
      console.error('Erreur marquage terminé:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  // ============ HANDLERS LIVRABLES ============

  const handleUploadLivrable = async (file, description) => {
    setActionLoading(true);
    const formData = new FormData();
    formData.append('fichier', file);
    if (description) {
      formData.append('description', description);
    }

    try {
      await axios.post(
        ENDPOINTS.RETRO_PLANNING_UPLOAD_LIVRABLE(selectedJalon.Id_Jalon),
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      toast.success('Fichier téléversé');
      // Rafraîchir les livrables du jalon
      const response = await axios.get(
        ENDPOINTS.RETRO_PLANNING_LIVRABLES(selectedJalon.Id_Jalon)
      );
      setSelectedJalon(prev => ({
        ...prev,
        livrables: response.data.data
      }));
      fetchData();
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du téléversement');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLivrable = async (livrable) => {
    if (!confirm(`Supprimer le fichier "${livrable.Nom_Fichier}" ?`)) {
      return;
    }

    try {
      await axios.delete(ENDPOINTS.RETRO_PLANNING_DELETE_LIVRABLE(livrable.Id_Livrable));
      toast.success('Fichier supprimé');
      // Rafraîchir
      const response = await axios.get(
        ENDPOINTS.RETRO_PLANNING_LIVRABLES(selectedJalon.Id_Jalon)
      );
      setSelectedJalon(prev => ({
        ...prev,
        livrables: response.data.data
      }));
      fetchData();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDownloadLivrable = (livrable) => {
    window.open(
      `${axios.defaults.baseURL}${ENDPOINTS.RETRO_PLANNING_DOWNLOAD_LIVRABLE(livrable.Id_Livrable)}`,
      '_blank'
    );
  };

  // ============ HANDLERS PROPOSITIONS ============

  const handleCreateProposition = async (propositionData) => {
    setActionLoading(true);
    try {
      await axios.post(
        ENDPOINTS.RETRO_PLANNING_CREATE_PROPOSITION(selectedJalon.Id_Jalon),
        propositionData
      );
      toast.success('Proposition envoyée à votre encadreur');
      setShowPropositionModal(false);
      setSelectedJalon(null);
    } catch (error) {
      console.error('Erreur envoi proposition:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccepterProposition = async (idProposition, commentaire) => {
    setActionLoading(true);
    try {
      await axios.post(
        ENDPOINTS.RETRO_PLANNING_REPONDRE_PROPOSITION(idProposition),
        { accepter: true, commentaire }
      );
      toast.success('Proposition acceptée - Modifications appliquées');
      fetchPropositionsEnAttente();
      fetchData();
    } catch (error) {
      console.error('Erreur acceptation proposition:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'acceptation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefuserProposition = async (idProposition, commentaire) => {
    setActionLoading(true);
    try {
      await axios.post(
        ENDPOINTS.RETRO_PLANNING_REPONDRE_PROPOSITION(idProposition),
        { accepter: false, commentaire }
      );
      toast.success('Proposition refusée');
      fetchPropositionsEnAttente();
    } catch (error) {
      console.error('Erreur refus proposition:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du refus');
    } finally {
      setActionLoading(false);
    }
  };

  // ============ RENDER ============

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  // Si pas encore de rétro-planning
  if (!retroPlanning) {
    return (
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Plan de travail</h1>
              <p className="text-gray-500">Suivi des étapes du mémoire</p>
            </div>
          </div>

          {/* Message de création */}
          <Card className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun plan de travail défini
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Créez un plan de travail pour suivre les différentes étapes de votre mémoire
              avec des jalons, des échéances et des rappels automatiques.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => handleCreateRetroPlanning(true)}
                loading={actionLoading}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Créer avec modèles suggérés
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCreateRetroPlanning(false)}
                loading={actionLoading}
              >
                Créer un plan vide
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {retroPlanning.Titre || 'Plan de travail'}
              </h1>
              {encadrementInfo && (
                <p className="text-gray-500 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {isEncadreur
                    ? `${encadrementInfo.etudiant?.Nom_Etud} ${encadrementInfo.etudiant?.Prenom_Etud}`
                    : `Encadreur: ${encadrementInfo.enseignant?.Nom_Ens} ${encadrementInfo.enseignant?.Prenom_Ens}`
                  }
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Badge propositions en attente (pour l'encadreur) */}
            {isEncadreur && propositionsEnAttente.length > 0 && (
              <PropositionsBadge
                count={propositionsEnAttente.length}
                onClick={() => setShowPropositionsManager(true)}
              />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Barre de progression */}
        <RetroPlanningProgress jalons={retroPlanning.jalons || []} />

        {/* Timeline des jalons */}
        <Card title="Jalons du plan de travail">
          <RetroPlanningTimeline
            jalons={retroPlanning.jalons || []}
            isEncadreur={isEncadreur}
            onAddJalon={() => {
              setSelectedJalon(null);
              setShowJalonModal(true);
            }}
            onEdit={(jalon) => {
              setSelectedJalon(jalon);
              setShowJalonModal(true);
            }}
            onDelete={handleDeleteJalon}
            onValidate={(jalon) => {
              setSelectedJalon(jalon);
              setShowValidationModal(true);
            }}
            onUpload={(jalon) => {
              setSelectedJalon(jalon);
              setShowLivrableModal(true);
            }}
            onViewDetails={(jalon) => {
              setSelectedJalon(jalon);
              setShowDetailModal(true);
            }}
            onUpdateProgression={handleUpdateProgression}
            onMarkAsComplete={handleMarkAsComplete}
            onPropose={(jalon) => {
              setSelectedJalon(jalon);
              setShowPropositionModal(true);
            }}
          />
        </Card>
      </div>

      {/* Modals */}
      <JalonModal
        isOpen={showJalonModal}
        onClose={() => {
          setShowJalonModal(false);
          setSelectedJalon(null);
        }}
        onSubmit={selectedJalon ? handleUpdateJalon : handleCreateJalon}
        jalon={selectedJalon}
        templates={templates}
        loading={actionLoading}
      />

      <JalonValidationModal
        isOpen={showValidationModal}
        onClose={() => {
          setShowValidationModal(false);
          setSelectedJalon(null);
        }}
        onValidate={handleValidateJalon}
        jalon={selectedJalon}
        loading={actionLoading}
      />

      <JalonDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedJalon(null);
        }}
        jalon={selectedJalon}
        isEncadreur={isEncadreur}
        onEdit={(jalon) => {
          setShowDetailModal(false);
          setSelectedJalon(jalon);
          setShowJalonModal(true);
        }}
        onUpload={(jalon) => {
          setShowDetailModal(false);
          setSelectedJalon(jalon);
          setShowLivrableModal(true);
        }}
        onValidate={(jalon) => {
          setShowDetailModal(false);
          setSelectedJalon(jalon);
          setShowValidationModal(true);
        }}
        onDownloadLivrable={handleDownloadLivrable}
      />

      <LivrableUploader
        isOpen={showLivrableModal}
        onClose={() => {
          setShowLivrableModal(false);
          setSelectedJalon(null);
        }}
        onUpload={handleUploadLivrable}
        onDelete={handleDeleteLivrable}
        onDownload={handleDownloadLivrable}
        jalon={selectedJalon}
        livrables={selectedJalon?.livrables || []}
        loading={actionLoading}
      />

      {/* Modal pour proposer une modification (étudiant) */}
      <PropositionModal
        isOpen={showPropositionModal}
        onClose={() => {
          setShowPropositionModal(false);
          setSelectedJalon(null);
        }}
        onSubmit={handleCreateProposition}
        jalon={selectedJalon}
        loading={actionLoading}
      />

      {/* Modal pour gérer les propositions (encadreur) */}
      <PropositionsManagerModal
        isOpen={showPropositionsManager}
        onClose={() => setShowPropositionsManager(false)}
        propositions={propositionsEnAttente}
        onAccepter={handleAccepterProposition}
        onRefuser={handleRefuserProposition}
        loading={actionLoading}
      />
    </Layout>
  );
}
