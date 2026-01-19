import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';
import { Plus, Calendar, Users, MapPin, Search, AlertTriangle, CheckCircle2, Clock, Edit, Trash2, Download, FileSpreadsheet, FileText, Upload, X, Wand2, Info } from 'lucide-react';
import { exportJurysPDF } from '../../utils/gestionPdfHelper';

export default function GestionJurys() {
  const [jurys, setJurys] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [encadrements, setEncadrements] = useState([]);
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    matriculeEtud: '',
    dateSoutenance: '',
    heureSoutenance: '08:00',
    salle: '',
    membres: [
      { matriculeEns: '', role: 'President' },
      { matriculeEns: '', role: 'Rapporteur' },
      { matriculeEns: '', role: 'Examinateur' }
    ]
  });
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedJury, setSelectedJury] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteData, setNoteData] = useState({
    noteFinal: '',
    mention: '',
    observations: ''
  });
  const [showImportResultsModal, setShowImportResultsModal] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [importing, setImporting] = useState(false);
  const [showAutoCreateModal, setShowAutoCreateModal] = useState(false);
  const [autoCreateConfig, setAutoCreateConfig] = useState({
    dateDebut: '',
    heureDebut: '08:00',
    dureeSoutenance: 60, // minutes
    pauseEntreSoutenances: 15, // minutes
    salles: [],
    jurysParJour: 6
  });
  const [autoCreating, setAutoCreating] = useState(false);
  const [autoCreatePreview, setAutoCreatePreview] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Export handlers
  const handleExportJurysExcel = async () => {
    try {
      const response = await axios.get(ENDPOINTS.CHEF_EXPORT_JURYS, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `Jurys_${date}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Fichier Excel exporté avec succès');
    } catch (error) {
      console.error('Erreur export Excel:', error);
      toast.error('Erreur lors de l\'export Excel');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get(ENDPOINTS.CHEF_JURYS_TEMPLATE, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Template_Import_Jurys.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Template téléchargé avec succès');
    } catch (error) {
      console.error('Erreur téléchargement template:', error);
      toast.error('Erreur lors du téléchargement du template');
    }
  };

  const handleExportJurysPDF = async () => {
      try {
        //toast.info('Génération du PDF local...');
        // On utilise directement la variable 'jurys' du state
        await exportJurysPDF(jurys);
        toast.success('PDF exporté avec succès (Client-Side)');
      } catch (error) {
        console.error('Erreur export PDF:', error);
        toast.error('Erreur lors de la génération du PDF');
      }
    };

  const handleImportJurys = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(ENDPOINTS.CHEF_IMPORT_JURYS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setImportResults(response.data.data);
      setShowImportResultsModal(true);

      if (response.data.data.successCount > 0) {
        toast.success(`${response.data.data.successCount} jurys importés avec succès`);
        fetchData(); // Recharger les données
      }

      if (response.data.data.errorCount > 0) {
        toast.warning(`${response.data.data.errorCount} erreurs détectées`);
      }

    } catch (error) {
      console.error('Erreur import:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'import');
    } finally {
      setImporting(false);
      event.target.value = ''; // Reset input
    }
  };

  const fetchData = async () => {
    try {
      const [jurysRes, etudRes, ensRes, encRes, sallesRes] = await Promise.all([
        axios.get(ENDPOINTS.CHEF_JURYS),
        axios.get(ENDPOINTS.CHEF_ETUDIANTS),
        axios.get(ENDPOINTS.CHEF_ENSEIGNANTS),
        axios.get(ENDPOINTS.CHEF_ENCADREMENTS),
        axios.get('/salles?disponible=true')
      ]);

      console.log('Jurys reçus:', jurysRes.data.data);
      if (jurysRes.data.data && jurysRes.data.data.length > 0) {
        console.log('Premier jury structure:', jurysRes.data.data[0]);
        console.log('Membres du premier jury:', jurysRes.data.data[0].membres);
        console.log('Etudiant du premier jury:', jurysRes.data.data[0].etudiant);
      }

      setJurys(jurysRes.data.data || []);
      setEtudiants(etudRes.data.data || []);
      setEnseignants(ensRes.data.data || []);
      setEncadrements(encRes.data.data || []);
      setSalles(sallesRes.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
      console.error('Erreur fetchData:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setViewMode(false);
    setSelectedJury(null);
    setFormData({
      matriculeEtud: '',
      dateSoutenance: '',
      heureSoutenance: '08:00',
      salle: '',
      membres: [
        { matriculeEns: '', role: 'President' },
        { matriculeEns: '', role: 'Rapporteur' },
        { matriculeEns: '', role: 'Examinateur' }
      ]
    });
    setShowModal(true);
  };

  const handleViewJury = (jury) => {
    setSelectedJury(jury);
    setViewMode(true);
    setEditMode(false);
    setShowModal(true);
  };

  const handleEditJury = () => {
    // Passer du mode consultation au mode édition
    setEditMode(true);
    setViewMode(false);

    // Pré-remplir le formulaire avec les données du jury sélectionné
    setFormData({
      matriculeEtud: selectedJury.Matricule_Etud,
      dateSoutenance: selectedJury.Date_Soutenance,
      heureSoutenance: selectedJury.Heure_Soutenance,
      salle: selectedJury.Salle,
      membres: selectedJury.membres?.map(m => ({
        matriculeEns: m.Matricule_Ens,
        role: m.Role
      })) || []
    });
  };

  const handleDeleteJury = async (idJury) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce jury ?')) {
      return;
    }

    try {
      await axios.delete(`${ENDPOINTS.CHEF_JURYS}/${idJury}`);
      toast.success('Jury supprimé avec succès');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression du jury');
    }
  };

  const handleNoterJury = (jury) => {
    setSelectedJury(jury);
    setNoteData({
      noteFinal: jury.Note_Finale || '',
      mention: jury.Mention || '',
      observations: jury.Observations || ''
    });
    setShowNoteModal(true);
  };

  const handleSubmitNote = async (e) => {
    e.preventDefault();

    try {
      await axios.put(ENDPOINTS.CHEF_NOTER_JURY(selectedJury.Id_Jury), noteData);
      toast.success('Note enregistrée avec succès. Statut de l\'étudiant mis à jour.');
      setShowNoteModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement de la note');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Vérifier qu'on n'a pas de doublons dans les membres
      const enseignantsIds = formData.membres.map(m => m.matriculeEns);
      if (new Set(enseignantsIds).size !== enseignantsIds.length) {
        toast.error('Un enseignant ne peut pas avoir plusieurs rôles dans le même jury');
        setSubmitting(false);
        return;
      }

      if (editMode) {
        // Mode édition - mise à jour du jury existant
        await axios.put(ENDPOINTS.CHEF_UPDATE_JURY(selectedJury.Id_Jury), {
          dateSoutenance: formData.dateSoutenance,
          heureSoutenance: formData.heureSoutenance,
          salle: formData.salle,
          membres: formData.membres
        });

        toast.success('Jury mis à jour avec succès');
      } else {
        // Mode création - créer un nouveau jury
        // Récupérer l'encadreur de l'étudiant
        const encadrement = encadrements.find(e =>
          e.Matricule_Etud === formData.matriculeEtud &&
          e.Valide_Par_Chef
        );

        if (!encadrement) {
          toast.error('Cet étudiant n\'a pas d\'encadrement validé');
          setSubmitting(false);
          return;
        }

        // Envoyer uniquement les 3 membres du jury
        await axios.post(ENDPOINTS.CHEF_JURYS, {
          ...formData,
          membres: formData.membres
        });

        toast.success('Jury créé avec succès');
      }

      setShowModal(false);
      setEditMode(false);
      setViewMode(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || `Erreur lors de ${editMode ? 'la mise à jour' : 'la création'} du jury`);
    } finally {
      setSubmitting(false);
    }
  };

  const updateMembre = (index, field, value) => {
    const newMembres = [...formData.membres];
    newMembres[index][field] = value;
    setFormData({ ...formData, membres: newMembres });
  };

  // Étudiants éligibles (avec encadrement validé, thème validé, mais sans jury)
  const etudiantsEligibles = etudiants.filter(etud => {
    const encadrement = encadrements.find(enc =>
      enc.Matricule_Etud === etud.Matricule_Etud &&
      enc.Valide_Par_Chef
    );
    // Vérifier si l'étudiant a un thème validé
    const hasValidTheme = etud.theme && ['Valide', 'Valide_Avec_Reserves'].includes(etud.theme.Statut_Theme);
    const hasJury = jurys.some(j => j.Matricule_Etud === etud.Matricule_Etud);
    return encadrement && hasValidTheme && !hasJury;
  });

  // Fonction pour obtenir l'encadreur d'un étudiant
  const getEncadreur = (matriculeEtud) => {
    const encadrement = encadrements.find(enc =>
      enc.Matricule_Etud === matriculeEtud &&
      enc.Valide_Par_Chef
    );
    return encadrement ? encadrement.Matricule_Ens : null;
  };

  // Fonction de création automatique des jurys
  const handleAutoCreateJurys = async () => {
    if (etudiantsEligibles.length === 0) {
      toast.error('Aucun étudiant éligible pour la création de jury');
      return;
    }

    if (!autoCreateConfig.dateDebut || autoCreateConfig.salles.length === 0) {
      toast.error('Veuillez configurer la date de début et sélectionner au moins une salle');
      return;
    }

    setAutoCreating(true);

    try {
      // Appeler le backend pour la création automatique
      const response = await axios.post(ENDPOINTS.CHEF_JURYS_AUTO_CREATE, {
        ...autoCreateConfig,
        etudiantsEligibles: etudiantsEligibles.map(e => e.Matricule_Etud)
      });

      if (response.data.success) {
        toast.success(`${response.data.data.created} jurys créés avec succès`);
        if (response.data.data.errors && response.data.data.errors.length > 0) {
          toast.warning(`${response.data.data.errors.length} erreurs lors de la création`);
        }
        setShowAutoCreateModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Erreur création automatique:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création automatique des jurys');
    } finally {
      setAutoCreating(false);
    }
  };

  // Générer un aperçu de la création automatique
  const generateAutoCreatePreview = () => {
    if (!autoCreateConfig.dateDebut || autoCreateConfig.salles.length === 0) {
      setAutoCreatePreview(null);
      return;
    }

    const enseignantsDisponibles = enseignants.filter(ens => {
      // Filtrer les encadreurs pour ne pas les mettre comme président
      return true; // Tous disponibles, le filtrage se fait lors de l'assignation
    });

    // Compteur de participation pour équilibrer la répartition
    const participationCount = {};
    enseignants.forEach(ens => {
      participationCount[ens.Matricule_Ens] = 0;
    });

    // Compter les participations existantes
    jurys.forEach(jury => {
      jury.membres?.forEach(membre => {
        if (participationCount[membre.Matricule_Ens] !== undefined) {
          participationCount[membre.Matricule_Ens]++;
        }
      });
    });

    const preview = [];
    let currentDate = new Date(autoCreateConfig.dateDebut);
    let currentHeure = autoCreateConfig.heureDebut;
    let salleIndex = 0;
    let jurysToday = 0;

    etudiantsEligibles.forEach((etud, index) => {
      const encadreurMatricule = getEncadreur(etud.Matricule_Etud);

      // Trouver les enseignants disponibles (pas l'encadreur pour président)
      const presidentCandidates = enseignants
        .filter(ens =>
          ens.Matricule_Ens !== encadreurMatricule &&
          (ens.Grade_Ens === 'Professeur' || ens.Grade_Ens === 'Maitre de Conferences')
        )
        .sort((a, b) => participationCount[a.Matricule_Ens] - participationCount[b.Matricule_Ens]);

      const rapporteurCandidates = enseignants
        .filter(ens =>
          ens.Matricule_Ens !== encadreurMatricule &&
          ens.Matricule_Ens !== presidentCandidates[0]?.Matricule_Ens
        )
        .sort((a, b) => participationCount[a.Matricule_Ens] - participationCount[b.Matricule_Ens]);

      const president = presidentCandidates[0];
      const rapporteur = rapporteurCandidates[0];
      const examinateur = enseignants.find(ens => ens.Matricule_Ens === encadreurMatricule);

      if (president && rapporteur && examinateur) {
        participationCount[president.Matricule_Ens]++;
        participationCount[rapporteur.Matricule_Ens]++;
        participationCount[examinateur.Matricule_Ens]++;

        preview.push({
          etudiant: etud,
          date: currentDate.toISOString().split('T')[0],
          heure: currentHeure,
          salle: autoCreateConfig.salles[salleIndex],
          president,
          rapporteur,
          examinateur
        });

        // Avancer à la prochaine heure/salle
        jurysToday++;
        salleIndex = (salleIndex + 1) % autoCreateConfig.salles.length;

        if (salleIndex === 0) {
          // Toutes les salles ont été utilisées, avancer l'heure
          const [heures, minutes] = currentHeure.split(':').map(Number);
          const totalMinutes = heures * 60 + minutes + autoCreateConfig.dureeSoutenance + autoCreateConfig.pauseEntreSoutenances;
          const newHeures = Math.floor(totalMinutes / 60);
          const newMinutes = totalMinutes % 60;

          if (newHeures >= 18 || jurysToday >= autoCreateConfig.jurysParJour) {
            // Passer au jour suivant
            currentDate.setDate(currentDate.getDate() + 1);
            // Sauter les week-ends
            while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
              currentDate.setDate(currentDate.getDate() + 1);
            }
            currentHeure = autoCreateConfig.heureDebut;
            jurysToday = 0;
          } else {
            currentHeure = `${String(newHeures).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
          }
        }
      }
    });

    setAutoCreatePreview(preview);
  };

  // Statistiques
  const stats = {
    total: jurys.length,
    crees: jurys.filter(j => j.Statut_Jury === 'Cree').length,
    termines: jurys.filter(j => j.Statut_Jury === 'Termine').length,
    enAttente: etudiantsEligibles.length
  };

  // Filtrage
  const filteredJurys = jurys.filter(jury =>
    searchTerm === '' ||
    `${jury.etudiant?.Nom_Etud} ${jury.etudiant?.Prenom_Etud} ${jury.Salle}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Vérifier les conflits horaires
  const hasConflict = (date, heure, salle) => {
    return jurys.some(j =>
      j.Date_Soutenance === date &&
      j.Heure_Soutenance === heure &&
      j.Salle === salle
    );
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestion des jurys</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAutoCreateModal(true)}
              disabled={etudiantsEligibles.length === 0}
              className="border-purple-600 text-purple-700 hover:bg-purple-50"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Création automatique
            </Button>
            <Button onClick={handleCreateClick} disabled={etudiantsEligibles.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un jury
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">En attente</p>
                <p className="text-2xl font-bold">{stats.enAttente}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Créés</p>
                <p className="text-2xl font-bold">{stats.crees}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Terminés</p>
                <p className="text-2xl font-bold">{stats.termines}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Boutons d'export/import */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Importer / Exporter les jurys</h3>
          <div className="flex flex-wrap gap-3">
            <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 border-2 border-purple-600 text-purple-700 rounded-lg font-medium transition-colors ${importing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-50'}`}>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportJurys}
                className="hidden"
                disabled={importing}
              />
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-700" />
                  Import en cours...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Importer Jurys Excel
                </>
              )}
            </label>

            <Button
              onClick={handleExportJurysExcel}
              variant="outline"
              className="flex items-center gap-2 border-green-600 text-green-700 hover:bg-green-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel - Jurys
            </Button>

            <Button
              onClick={handleExportJurysPDF}
              variant="outline"
              className="flex items-center gap-2 border-red-600 text-red-700 hover:bg-red-50"
            >
              <FileText className="w-4 h-4" />
              PDF - Liste Jurys
            </Button>

            <Button
              onClick={handleDownloadTemplate}
              variant="outline"
              className="flex items-center gap-2 border-blue-600 text-blue-700 hover:bg-blue-50"
            >
              <Download className="w-4 h-4" />
              Template Import Excel
            </Button>
          </div>
        </Card>

        {/* Alerte pour étudiants sans jury */}
        {stats.enAttente > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-yellow-900">
                {stats.enAttente} étudiant(s) avec encadrement validé sans jury
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Ces étudiants sont prêts pour la création de leur jury de soutenance.
              </p>
            </div>
          </div>
        )}

        {/* Barre de recherche */}
        <Card>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un étudiant ou une salle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </Card>

        {/* Liste des jurys */}
        <Card>
          {filteredJurys.length > 0 ? (
            <div className="space-y-4">
              {filteredJurys.map((jury) => (
                <div key={jury.Id_Jury} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {jury.etudiant?.Prenom_Etud} {jury.etudiant?.Nom_Etud}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          jury.Statut_Jury === 'Termine' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {jury.Statut_Jury === 'Termine' ? 'Terminé' : 'Créé'}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        {jury.etudiant?.theme?.Titre || 'Thème non défini'}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(jury.Date_Soutenance).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {jury.Heure_Soutenance}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {jury.Salle}
                        </div>
                      </div>

                      {jury.membres && jury.membres.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 uppercase">Membres du jury:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {jury.membres.map((membre, idx) => (
                              <div key={idx} className="text-sm">
                                <span className="font-medium">{membre.Role}:</span>{' '}
                                <span className="text-gray-600">
                                  {membre.enseignant?.Prenom_Ens} {membre.enseignant?.Nom_Ens}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {jury.Note_Finale && (
                        <div className="mt-3 inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full">
                          <span className="text-sm font-medium">Note finale:</span>
                          <span className="text-lg font-bold">{jury.Note_Finale}/20</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewJury(jury)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Consulter
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleNoterJury(jury)}
                        className="text-green-600 hover:bg-green-50 border-green-300"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        {jury.Note_Finale ? 'Modifier note' : 'Noter'}
                      </Button>
                      {!jury.Note_Finale && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteJury(jury.Id_Jury)}
                          className="text-red-600 hover:bg-red-50 border-red-300"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Supprimer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun jury trouvé</p>
              {etudiantsEligibles.length > 0 && (
                <Button className="mt-4" onClick={handleCreateClick}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer le premier jury
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Modal de création/consultation */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {viewMode ? 'Détails du jury' : editMode ? 'Modifier le jury' : 'Créer un jury de soutenance'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {viewMode ? (
              // Mode consultation
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Étudiant</label>
                    <p className="mt-1">{selectedJury?.etudiant?.Prenom_Etud} {selectedJury?.etudiant?.Nom_Etud}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Thème</label>
                    <p className="mt-1">{selectedJury?.etudiant?.theme?.Titre || 'Non défini'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date</label>
                    <p className="mt-1">{new Date(selectedJury?.Date_Soutenance).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Heure</label>
                    <p className="mt-1">{selectedJury?.Heure_Soutenance}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Salle</label>
                    <p className="mt-1">{selectedJury?.Salle}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Membres du jury</label>
                  <div className="space-y-2">
                    {selectedJury?.membres?.map((membre, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>{membre.enseignant?.Prenom_Ens} {membre.enseignant?.Nom_Ens}</span>
                        <span className="text-sm text-gray-600">{membre.Role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                  >
                    Fermer
                  </Button>
                  <Button
                    onClick={handleEditJury}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                </div>
              </div>
            ) : (
              // Mode création/édition
              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sélection étudiant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Étudiant *
                </label>
                {editMode ? (
                  <p className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                    {selectedJury?.etudiant?.Prenom_Etud} {selectedJury?.etudiant?.Nom_Etud} ({selectedJury?.Matricule_Etud})
                  </p>
                ) : (
                  <>
                    <select
                      value={formData.matriculeEtud}
                      onChange={(e) => {
                        const matricule = e.target.value;
                        const encadreurMatricule = getEncadreur(matricule);
                        // Pré-remplir l'examinateur avec l'encadreur
                        const newMembres = [...formData.membres];
                        const examinateurIndex = newMembres.findIndex(m => m.role === 'Examinateur');
                        if (examinateurIndex !== -1 && encadreurMatricule) {
                          newMembres[examinateurIndex].matriculeEns = encadreurMatricule;
                        }
                        setFormData({
                          ...formData,
                          matriculeEtud: matricule,
                          membres: newMembres
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="">Sélectionner un étudiant</option>
                      {etudiantsEligibles.map(etud => (
                        <option key={etud.Matricule_Etud} value={etud.Matricule_Etud}>
                          {etud.Prenom_Etud} {etud.Nom_Etud} ({etud.Matricule_Etud})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {etudiantsEligibles.length} étudiant(s) éligible(s) (avec thème validé)
                    </p>
                  </>
                )}
              </div>

              {/* Affichage du thème et de l'encadreur */}
              {formData.matriculeEtud && !editMode && (() => {
                const etudiant = etudiantsEligibles.find(e => e.Matricule_Etud === formData.matriculeEtud);
                const encadreurMatricule = getEncadreur(formData.matriculeEtud);
                const encadreur = enseignants.find(e => e.Matricule_Ens === encadreurMatricule);
                return etudiant ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">Thème : {etudiant.theme?.Titre || 'Non défini'}</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Encadreur : {encadreur ? `${encadreur.Prenom_Ens} ${encadreur.Nom_Ens}` : 'Non trouvé'}
                          {encadreur && <span className="ml-1">(sera automatiquement Examinateur)</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Date et heure */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de soutenance *
                  </label>
                  <Input
                    type="date"
                    value={formData.dateSoutenance}
                    onChange={(e) => setFormData({ ...formData, dateSoutenance: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure *
                  </label>
                  <Input
                    type="time"
                    value={formData.heureSoutenance}
                    onChange={(e) => setFormData({ ...formData, heureSoutenance: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salle *
                  </label>
                  <select
                    value={formData.salle}
                    onChange={(e) => setFormData({ ...formData, salle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Sélectionner une salle</option>
                    {salles.map(salle => (
                      <option key={salle.Id_Salle} value={salle.Nom_Salle}>
                        {salle.Nom_Salle} {salle.Capacite ? `(${salle.Capacite} places)` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {salles.length} salle(s) disponible(s)
                  </p>
                </div>
              </div>

              {/* Vérification des conflits */}
              {formData.dateSoutenance && formData.heureSoutenance && formData.salle &&
               hasConflict(formData.dateSoutenance, formData.heureSoutenance, formData.salle) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Conflit détecté</p>
                    <p className="text-xs text-red-700">
                      Un autre jury est déjà prévu dans cette salle à cette date et heure.
                    </p>
                  </div>
                </div>
              )}

              {/* Membres du jury */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Composition du jury *</p>

                <div className="space-y-3">
                  {formData.membres.map((membre, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Rôle
                        </label>
                        <input
                          type="text"
                          value={membre.role}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Enseignant *
                        </label>
                        <select
                          value={membre.matriculeEns}
                          onChange={(e) => updateMembre(index, 'matriculeEns', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          required
                        >
                          <option value="">Sélectionner un enseignant</option>
                          {enseignants
                            .filter(ens => {
                              // Pour le président, filtrer seulement les professeurs et maîtres de conférences
                              if (membre.role === 'President') {
                                return ens.Grade_Ens === 'Professeur' || ens.Grade_Ens === 'Maitre de Conferences';
                              }
                              return true;
                            })
                            .map(ens => (
                              <option key={ens.Matricule_Ens} value={ens.Matricule_Ens}>
                                {ens.Prenom_Ens} {ens.Nom_Ens} - {ens.Grade_Ens}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                  ))}

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
                    <p className="text-xs text-blue-800">
                      <strong>Règles de composition du jury :</strong>
                    </p>
                    <ul className="text-xs text-blue-800 list-disc list-inside space-y-0.5">
                      <li>Le jury est composé de 3 membres : Président, Rapporteur et Examinateur</li>
                      <li>Le <strong>Président</strong> doit être au minimum Maître de Conférences</li>
                      <li>L'<strong>Examinateur</strong> doit être l'encadreur de l'étudiant (pré-rempli automatiquement)</li>
                      <li>Le <strong>Président</strong> ne peut pas être l'encadreur de l'étudiant</li>
                      <li>Tous les membres doivent être des personnes différentes</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || (formData.dateSoutenance && formData.heureSoutenance && formData.salle && hasConflict(formData.dateSoutenance, formData.heureSoutenance, formData.salle))}
                  className="flex-1"
                >
                  {submitting ? (editMode ? 'Mise à jour...' : 'Création...') : (editMode ? 'Mettre à jour' : 'Créer le jury')}
                </Button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      {/* Modal de notation */}
      {showNoteModal && selectedJury && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Noter la soutenance - {selectedJury.etudiant?.Prenom_Etud} {selectedJury.etudiant?.Nom_Etud}
              </h2>
              <button
                onClick={() => setShowNoteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNote} className="space-y-4">
              {/* Note finale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note finale (sur 20) *
                </label>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  step="0.25"
                  value={noteData.noteFinal}
                  onChange={(e) => setNoteData({ ...noteData, noteFinal: e.target.value })}
                  required
                  placeholder="Ex: 15.5"
                />
              </div>

              {/* Mention */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mention
                </label>
                <select
                  value={noteData.mention}
                  onChange={(e) => setNoteData({ ...noteData, mention: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Sélectionner une mention</option>
                  <option value="Très Honorable avec Félicitations">Très Honorable avec Félicitations</option>
                  <option value="Très Honorable">Très Honorable</option>
                  <option value="Honorable">Honorable</option>
                  <option value="Assez Bien">Assez Bien</option>
                  <option value="Passable">Passable</option>
                </select>
              </div>

              {/* Observations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observations
                </label>
                <textarea
                  value={noteData.observations}
                  onChange={(e) => setNoteData({ ...noteData, observations: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Commentaires du jury..."
                />
              </div>

              {/* Info */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  ℹ️ Après l'enregistrement de la note, le statut de l'étudiant sera automatiquement mis à jour à "Mémoire soutenu".
                </p>
              </div>

              {/* Boutons */}
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNoteModal(false)}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  Enregistrer la note
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal résultats import */}
      {showImportResultsModal && importResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Résultats de l'import</h2>
              <button
                onClick={() => setShowImportResultsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Statistiques globales */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Succès</p>
                    <p className="text-2xl font-bold text-green-900">{importResults.successCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm text-red-600 font-medium">Erreurs</p>
                    <p className="text-2xl font-bold text-red-900">{importResults.errorCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">Avertissements</p>
                    <p className="text-2xl font-bold text-yellow-900">{importResults.warningCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des erreurs */}
            {importResults.errors && importResults.errors.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Erreurs ({importResults.errors.length})
                </h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {importResults.errors.map((error, i) => (
                      <div key={i} className="text-sm">
                        <span className="font-medium text-red-700">Ligne {error.line}:</span>{' '}
                        <span className="text-red-900">{error.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Liste des avertissements */}
            {importResults.warnings && importResults.warnings.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Avertissements ({importResults.warnings.length})
                </h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {importResults.warnings.map((warning, i) => (
                      <div key={i} className="text-sm">
                        <span className="font-medium text-yellow-700">Ligne {warning.line}:</span>{' '}
                        <span className="text-yellow-900">{warning.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Liste des succès */}
            {importResults.success && importResults.success.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Jurys créés avec succès ({importResults.success.length})
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {importResults.success.map((success, i) => (
                      <span key={i} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {success.matricule}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bouton fermer */}
            <div className="flex justify-end">
              <Button onClick={() => setShowImportResultsModal(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création automatique */}
      {showAutoCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Wand2 className="w-6 h-6 text-purple-600" />
                  Création automatique des jurys
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {etudiantsEligibles.length} étudiant(s) éligible(s) pour la création de jury
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAutoCreateModal(false);
                  setAutoCreatePreview(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Configuration */}
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-3">Règles de création automatique</h3>
                <ul className="text-sm text-purple-800 list-disc list-inside space-y-1">
                  <li>L'encadreur de chaque étudiant sera automatiquement <strong>Examinateur</strong></li>
                  <li>Le <strong>Président</strong> sera choisi parmi les Professeurs/MC (jamais l'encadreur)</li>
                  <li>Le <strong>Rapporteur</strong> sera différent du Président et de l'Examinateur</li>
                  <li>La répartition est équilibrée pour ne pas surcharger certains enseignants</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de début des soutenances *
                  </label>
                  <Input
                    type="date"
                    value={autoCreateConfig.dateDebut}
                    onChange={(e) => setAutoCreateConfig({ ...autoCreateConfig, dateDebut: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure de début *
                  </label>
                  <Input
                    type="time"
                    value={autoCreateConfig.heureDebut}
                    onChange={(e) => setAutoCreateConfig({ ...autoCreateConfig, heureDebut: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durée par soutenance (minutes)
                  </label>
                  <Input
                    type="number"
                    value={autoCreateConfig.dureeSoutenance}
                    onChange={(e) => setAutoCreateConfig({ ...autoCreateConfig, dureeSoutenance: parseInt(e.target.value) })}
                    min={30}
                    max={180}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pause entre soutenances (minutes)
                  </label>
                  <Input
                    type="number"
                    value={autoCreateConfig.pauseEntreSoutenances}
                    onChange={(e) => setAutoCreateConfig({ ...autoCreateConfig, pauseEntreSoutenances: parseInt(e.target.value) })}
                    min={0}
                    max={60}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max jurys par jour
                  </label>
                  <Input
                    type="number"
                    value={autoCreateConfig.jurysParJour}
                    onChange={(e) => setAutoCreateConfig({ ...autoCreateConfig, jurysParJour: parseInt(e.target.value) })}
                    min={1}
                    max={20}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salles à utiliser *
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
                    {salles.map(salle => (
                      <label key={salle.Id_Salle} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={autoCreateConfig.salles.includes(salle.Nom_Salle)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAutoCreateConfig({
                                ...autoCreateConfig,
                                salles: [...autoCreateConfig.salles, salle.Nom_Salle]
                              });
                            } else {
                              setAutoCreateConfig({
                                ...autoCreateConfig,
                                salles: autoCreateConfig.salles.filter(s => s !== salle.Nom_Salle)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        {salle.Nom_Salle} {salle.Capacite ? `(${salle.Capacite} places)` : ''}
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {autoCreateConfig.salles.length} salle(s) sélectionnée(s)
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={generateAutoCreatePreview}
                  disabled={!autoCreateConfig.dateDebut || autoCreateConfig.salles.length === 0}
                  className="border-purple-600 text-purple-700 hover:bg-purple-50"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Générer l'aperçu
                </Button>
              </div>
            </div>

            {/* Aperçu */}
            {autoCreatePreview && autoCreatePreview.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Aperçu des jurys à créer ({autoCreatePreview.length})
                </h3>
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left">Étudiant</th>
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2 text-left">Heure</th>
                        <th className="px-3 py-2 text-left">Salle</th>
                        <th className="px-3 py-2 text-left">Président</th>
                        <th className="px-3 py-2 text-left">Rapporteur</th>
                        <th className="px-3 py-2 text-left">Examinateur</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {autoCreatePreview.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2">{item.etudiant.Prenom_Etud} {item.etudiant.Nom_Etud}</td>
                          <td className="px-3 py-2">{new Date(item.date).toLocaleDateString('fr-FR')}</td>
                          <td className="px-3 py-2">{item.heure}</td>
                          <td className="px-3 py-2">{item.salle}</td>
                          <td className="px-3 py-2 text-xs">{item.president?.Prenom_Ens} {item.president?.Nom_Ens}</td>
                          <td className="px-3 py-2 text-xs">{item.rapporteur?.Prenom_Ens} {item.rapporteur?.Nom_Ens}</td>
                          <td className="px-3 py-2 text-xs text-purple-700 font-medium">{item.examinateur?.Prenom_Ens} {item.examinateur?.Nom_Ens}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {autoCreatePreview && autoCreatePreview.length === 0 && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <p className="text-yellow-800">
                    Impossible de générer des jurys. Vérifiez que vous avez suffisamment d'enseignants disponibles.
                  </p>
                </div>
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAutoCreateModal(false);
                  setAutoCreatePreview(null);
                }}
                disabled={autoCreating}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleAutoCreateJurys}
                disabled={autoCreating || !autoCreatePreview || autoCreatePreview.length === 0}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {autoCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Créer {autoCreatePreview?.length || 0} jurys
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
