import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';
import {
  UserPlus,
  FileText,
  Users,
  Calendar,
  Award,
  CheckCircle,
  Clock,
  Download,
  FileDown,
  TrendingUp,
  BookOpen,
  Gavel,
  Star
} from 'lucide-react';

import { exportHistoriquePDF } from '../../utils/etudiantPdfHelper';


/**
 * Page Mon Historique - Timeline complète du parcours académique
 *
 * Affiche l'historique complet d'un étudiant (alumni ou actif) :
 * - Timeline du parcours (inscription → thème → encadrement → jury → soutenance)
 * - Documents téléchargeables
 * - Note finale et mention (si applicable)
 * - Export PDF de l'historique
 *
 * Accessible aux étudiants (mode alumni ou mode actif)
 */
export default function MonHistorique() {
  const [historique, setHistorique] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistorique();
  }, []);

  const fetchHistorique = async () => {
    try {
      const response = await axios.get(ENDPOINTS.ETUDIANT_DASHBOARD);
      setHistorique(response.data.data);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      toast.error('Erreur lors du chargement de l\'historique');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!historique) {
      toast.error("Données d'historique non disponibles");
      return;
    }

    try {
      //toast.info('Génération du PDF en cours...');
      await exportHistoriquePDF(historique);
      toast.success('Historique exporté avec succès');
    } catch (error) {
      console.error('Erreur export PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };
  

  const handleDownloadDocument = (documentId) => {
    toast.info('Téléchargement en cours...');
    // TODO: Implémenter téléchargement document
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  // Construire les étapes de la timeline
  const timelineSteps = [];

  // 1. Inscription
  timelineSteps.push({
    icon: UserPlus,
    color: 'blue',
    title: 'Inscription',
    date: historique?.Date_Inscription || 'Date inconnue',
    description: `Inscrit en ${historique?.Niveau || 'Master 2'} - ${historique?.filiere?.Nom_Fil || 'Filière'}`,
    status: 'completed'
  });

  // 2. Thème proposé
  if (historique?.theme) {
    timelineSteps.push({
      icon: FileText,
      color: 'purple',
      title: 'Thème Proposé',
      date: historique.theme.Date_Proposition,
      description: historique.theme.Titre,
      details: historique.theme.Description,
      status: historique.theme.Statut_Theme === 'Valide' ? 'completed' : 'pending',
      statusLabel: historique.theme.Statut_Theme === 'Valide' ? 'Validé' : 'En attente',
      avis: historique.theme.Commentaire_Encadreur
    });
  }

  // 3. Encadrement validé
  if (historique?.encadrement) {
    const encadreur = historique.encadrement.enseignant;
    timelineSteps.push({
      icon: Users,
      color: 'green',
      title: 'Encadrement Validé',
      date: historique.encadrement.Date_Validation,
      description: encadreur
        ? `Encadreur : ${encadreur.Grade_Ens || ''} ${encadreur.Prenom_Ens || ''} ${encadreur.Nom_Ens || ''}`
        : 'Encadreur non défini',
      status: historique.encadrement.Statut_Encadrement === 'Valide' ? 'completed' : 'pending',
      statusLabel: historique.encadrement.Statut_Encadrement === 'Valide'
        ? 'Validé'
        : historique.encadrement.Statut_Encadrement
    });
  }

  // 4. Jury créé
  if (historique?.jury) {
    const president = historique.jury.president;
    timelineSteps.push({
      icon: Gavel,
      color: 'indigo',
      title: 'Jury de Soutenance',
      date: historique.jury.Date_Creation,
      description: president
        ? `Président : ${president.Grade_Ens || ''} ${president.Prenom_Ens || ''} ${president.Nom_Ens || ''}`
        : 'Jury créé',
      details: historique.jury.Date_Soutenance
        ? `Soutenance prévue le ${new Date(historique.jury.Date_Soutenance).toLocaleDateString('fr-FR')}`
        : null,
      status: historique.jury.Note_Finale ? 'completed' : 'current'
    });
  }

  // 5. Soutenance (si note finale)
  if (historique?.jury?.Note_Finale) {
    timelineSteps.push({
      icon: Award,
      color: 'yellow',
      title: 'Soutenance Réussie',
      date: historique.jury.Date_Soutenance || historique.jury.Date_Creation,
      description: `Note finale : ${historique.jury.Note_Finale}/20`,
      details: historique.jury.Mention ? `Mention : ${historique.jury.Mention}` : null,
      status: 'completed',
      highlighted: true
    });
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mon Historique Académique</h1>
            <p className="text-gray-500 mt-1">
              Parcours complet de votre formation
            </p>
          </div>
          <Button onClick={handleExportPDF} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter en PDF
          </Button>
        </div>

        {/* Statistiques récapitulatives (si alumni) */}
        {historique?.Mode_Alumni && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Année de graduation</p>
                  <p className="text-xl font-bold text-gray-900">
                    {historique.Annee_Graduation || historique.Annee_Academique}
                  </p>
                </div>
              </div>
            </Card>

            {historique.jury?.Note_Finale && (
              <Card>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Note finale</p>
                    <p className="text-xl font-bold text-green-600">
                      {historique.jury.Note_Finale}/20
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {historique.jury?.Mention && (
              <Card>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mention obtenue</p>
                    <p className="text-xl font-bold text-yellow-600">
                      {historique.jury.Mention}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Timeline du parcours */}
        <Card title="📅 Timeline de votre parcours">
          <div className="space-y-8 relative">
            {/* Ligne verticale */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {timelineSteps.map((step, index) => {
              const Icon = step.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600 border-blue-200',
                purple: 'bg-purple-100 text-purple-600 border-purple-200',
                green: 'bg-green-100 text-green-600 border-green-200',
                indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200',
                yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200'
              };

              return (
                <div key={index} className="relative flex gap-4 ml-2">
                  {/* Icône */}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                      colorClasses[step.color] || colorClasses.blue
                    } ${step.highlighted ? 'ring-4 ring-yellow-200' : ''}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 pb-8">
                    <div
                      className={`p-4 rounded-lg border ${
                        step.highlighted
                          ? 'bg-yellow-50 border-yellow-300'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{step.title}</h3>
                        {step.statusLabel && (
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              step.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : step.status === 'current'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {step.statusLabel}
                          </span>
                        )}
                      </div>

                      {step.date && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(step.date).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}

                      <p className="text-gray-700 font-medium mb-1">{step.description}</p>

                      {step.details && (
                        <p className="text-sm text-gray-600 mt-2">{step.details}</p>
                      )}

                      {step.avis && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs font-medium text-blue-700 mb-1">
                            Avis de l'encadreur
                          </p>
                          <p className="text-sm text-gray-700">{step.avis}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Documents */}
        {historique?.documents && historique.documents.length > 0 && (
          <Card title="📁 Mes Documents">
            <div className="space-y-3">
              {historique.documents.map((doc) => (
                <div
                  key={doc.Id_Document}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{doc.Nom_Document}</p>
                      <p className="text-xs text-gray-500">
                        {doc.Type_Document} •{' '}
                        {new Date(doc.Date_Upload).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadDocument(doc.Id_Document)}
                  >
                    <FileDown className="w-4 h-4 mr-1" />
                    Télécharger
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Informations complémentaires */}
        <Card title="ℹ️ Informations complémentaires">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Filière</p>
              <p className="font-medium text-gray-900">
                {historique?.filiere?.Nom_Fil || 'Non définie'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Département</p>
              <p className="font-medium text-gray-900">
                {historique?.filiere?.departement?.Nom_Dep || 'Non défini'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Année académique</p>
              <p className="font-medium text-gray-900">
                {historique?.Annee_Academique || 'Non définie'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Statut</p>
              <p className="font-medium text-gray-900">
                {historique?.Statut_Etudiant === 'Soutenu'
                  ? '✅ Diplômé'
                  : historique?.Statut_Etudiant === 'Pret_Soutenance'
                  ? '🎯 Prêt pour soutenance'
                  : historique?.Statut_Etudiant === 'Encadrement_Valide'
                  ? '📚 En cours de rédaction'
                  : historique?.Statut_Etudiant === 'Theme_Propose'
                  ? '📝 Thème proposé'
                  : '👤 Inscrit'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
