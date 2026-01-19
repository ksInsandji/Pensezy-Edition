import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Layout } from '../../components/layout/Layout';
import {
  Search, UserCheck, AlertCircle, CheckCircle, XCircle,
  Filter, Users, TrendingUp, Award, ChevronDown, ChevronUp,
  Download, FileSpreadsheet, FileText, Upload
} from 'lucide-react';
import axios from '../../api/axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '../../api/endpoints';
import { exportAffectationsEtudiantsPDF, exportStatsEncadreursPDF } from '../../utils/gestionPdfHelper';

/**
 * Page d'affectation des encadrements par le Chef de département
 * Permet de voir tous les choix des étudiants et d'affecter manuellement les encadrements
 */
const AffectationEncadrements = () => {
  const [etudiants, setEtudiants] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [selectedEtudiant, setSelectedEtudiant] = useState(null);
  const [enseignantSelectionne, setEnseignantSelectionne] = useState('');
  const [searchEnseignant, setSearchEnseignant] = useState('');
  const [showEnseignantDropdown, setShowEnseignantDropdown] = useState(false);
  const [affectationEnCours, setAffectationEnCours] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [importing, setImporting] = useState(false);

  // Ref pour le dropdown enseignant et file input
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // Charger les données au montage
  useEffect(() => {
    chargerDonnees();
  }, []);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowEnseignantDropdown(false);
      }
    };

    if (showEnseignantDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEnseignantDropdown]);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const [etudiantsRes, enseignantsRes] = await Promise.all([
        axios.get('/choix-encadrement/chef/tous-choix'),
        axios.get('/choix-encadrement/enseignants-disponibles')
      ]);

      // L'API retourne { data: { etudiants: [...], statistiques: {...} } }
      const listeEtudiants = etudiantsRes.data.data?.etudiants || [];
      const listeEnseignants = enseignantsRes.data.data || [];

      setEtudiants(listeEtudiants);
      setEnseignants(listeEnseignants);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      afficherMessage('error', 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les étudiants selon recherche et statut
  const etudiantsFiltres = useMemo(() => {
    const filtres = etudiants.filter(etudiant => {
      // Vérifier que les propriétés existent (support des deux formats de casse)
      const nom = etudiant?.nom_etud || etudiant?.Nom_Etud || '';
      const prenom = etudiant?.prenom_etud || etudiant?.Prenom_Etud || '';
      const matricule = etudiant?.matricule_etud || etudiant?.Matricule_Etud || '';

      const matchRecherche = searchTerm === '' ||
        nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        matricule.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatut = filterStatut === 'tous' ||
        (filterStatut === 'affecte' && etudiant.affectation) ||
        (filterStatut === 'non_affecte' && !etudiant.affectation) ||
        (filterStatut === 'sans_choix' && (!etudiant.choix || etudiant.choix.length === 0));

      return matchRecherche && matchStatut;
    });

    // Trier par ordre alphabétique (nom puis prénom)
    return filtres.sort((a, b) => {
      const nomA = a?.nom_etud || a?.Nom_Etud || '';
      const nomB = b?.nom_etud || b?.Nom_Etud || '';
      const prenomA = a?.prenom_etud || a?.Prenom_Etud || '';
      const prenomB = b?.prenom_etud || b?.Prenom_Etud || '';

      const compareNom = nomA.localeCompare(nomB);
      if (compareNom !== 0) return compareNom;
      return prenomA.localeCompare(prenomB);
    });
  }, [etudiants, searchTerm, filterStatut]);

  // Filtrer les enseignants pour l'auto-complétion
  const enseignantsFiltres = useMemo(() => {
    // Toujours retourner tous les enseignants si pas de recherche (pour afficher la liste au clic)
    if (!searchEnseignant || searchEnseignant.trim() === '') return enseignants;

    return enseignants.filter(ens => {
      // Support des deux formats de casse (snake_case et PascalCase)
      const nom = ens?.nom_ens || ens?.Nom_Ens || '';
      const prenom = ens?.prenom_ens || ens?.Prenom_Ens || '';
      const matricule = ens?.matricule_ens || ens?.Matricule_Ens || '';

      const searchLower = searchEnseignant.toLowerCase();
      return nom.toLowerCase().includes(searchLower) ||
             prenom.toLowerCase().includes(searchLower) ||
             matricule.toLowerCase().includes(searchLower);
    });
  }, [enseignants, searchEnseignant]);

  const afficherMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const toggleExpandRow = (matricule) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(matricule)) {
      newExpanded.delete(matricule);
    } else {
      newExpanded.add(matricule);
    }
    setExpandedRows(newExpanded);
  };

  const ouvrirModalAffectation = (etudiant) => {
    setSelectedEtudiant(etudiant);
    setEnseignantSelectionne('');
    setSearchEnseignant('');
  };

  const fermerModalAffectation = () => {
    setSelectedEtudiant(null);
    setEnseignantSelectionne('');
    setSearchEnseignant('');
    setShowEnseignantDropdown(false);
  };

  const selectionnerEnseignant = (enseignant) => {
    // Support des deux formats de casse
    const matricule = enseignant.matricule_ens || enseignant.Matricule_Ens || '';
    const nom = enseignant.nom_ens || enseignant.Nom_Ens || '';
    const prenom = enseignant.prenom_ens || enseignant.Prenom_Ens || '';
    const grade = enseignant.grade_ens || enseignant.Grade_Ens || '';

    setEnseignantSelectionne(matricule);
    setSearchEnseignant(`${prenom} ${nom} (${grade})`);
    setShowEnseignantDropdown(false);
  };

  const affecterEncadrement = async () => {
    if (!enseignantSelectionne || !selectedEtudiant) return;

    try {
      setAffectationEnCours(true);

      // Vérifier si c'est un des choix de l'étudiant
      const choixIndex = selectedEtudiant.choix?.findIndex(
        c => c.matricule_ens === enseignantSelectionne
      );
      const choixRetenu = choixIndex !== -1 ? choixIndex + 1 : null;

      await axios.post('/choix-encadrement/chef/affecter', {
        matricule_etud: selectedEtudiant?.matricule_etud || selectedEtudiant?.Matricule_Etud,
        matricule_ens: enseignantSelectionne,
        choix_retenu: choixRetenu
      });

      toast.success('Affectation réalisée avec succès');
      await chargerDonnees();
      fermerModalAffectation();
    } catch (error) {
      console.error('Erreur affectation:', error);
      afficherMessage('error', error.response?.data?.message || 'Erreur lors de l\'affectation');
    } finally {
      setAffectationEnCours(false);
    }
  };

  // Handlers d'export
  const handleExportExcel = async () => {
    try {
      const response = await axios.get(ENDPOINTS.CHEF_EXPORT_ENCADREMENTS, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `Encadrements_${date}.xlsx`);
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

  const handleExportPDFEtudiants = async () => {
    try {
      const response = await axios.get(ENDPOINTS.CHEF_EXPORT_PDF_ETUDIANTS, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `Encadrements_Etudiants_${date}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('PDF exporté avec succès');
    } catch (error) {
      console.error('Erreur export PDF étudiants:', error);
      toast.error('Erreur lors de l\'export PDF');
    }
  };

  const handleExportPDFEncadreurs = async () => {
    try {
      const response = await axios.get(ENDPOINTS.CHEF_EXPORT_PDF_ENCADREURS, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `Statistiques_Encadreurs_${date}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('PDF exporté avec succès');
    } catch (error) {
      console.error('Erreur export PDF encadreurs:', error);
      toast.error('Erreur lors de l\'export PDF');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get(ENDPOINTS.CHEF_TEMPLATE_IMPORT, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Template_Import_Encadrements.xlsx');
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

  const handleImportExcel = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setImportResults(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(ENDPOINTS.CHEF_IMPORT_ENCADREMENTS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const results = response.data.data;
      setImportResults(results);
      setImportModalOpen(true);

      // Recharger les données si des encadrements ont été créés
      if (results.successCount > 0) {
        await chargerDonnees();
        toast.success(`${results.successCount} encadrement(s) importé(s) avec succès`);
      }
    } catch (error) {
      console.error('Erreur import Excel:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'import Excel');
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const closeImportModal = () => {
    setImportModalOpen(false);
    setImportResults(null);
  };

  const getStatutBadge = (etudiant) => {
    if (etudiant.affectation) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Affecté
        </span>
      );
    }
    if (!etudiant.choix || etudiant.choix.length === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Sans choix
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <AlertCircle className="w-3 h-3 mr-1" />
        En attente
      </span>
    );
  };

  const getQuotaColor = (enseignant) => {
    if (!enseignant.quota_effectif) return 'text-green-600';
    const ratio = enseignant.nb_encadrements_actifs / enseignant.quota_effectif;
    if (ratio >= 1) return 'text-red-600';
    if (ratio >= 0.8) return 'text-orange-600';
    return 'text-green-600';
  };

  const statistiques = useMemo(() => {
    const total = etudiants.length;
    const affectes = etudiants.filter(e => e.affectation).length;
    const enAttente = etudiants.filter(e => !e.affectation && e.choix?.length > 0).length;
    const sansChoix = etudiants.filter(e => !e.choix || e.choix.length === 0).length;

    return { total, affectes, enAttente, sansChoix };
  }, [etudiants]);

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
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Affectation des Encadrements
        </h1>
        <p className="text-gray-600">
          Gérez les affectations d'encadrement pour votre département
        </p>
      </div>

      {/* Messages */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{statistiques.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Affectés</p>
              <p className="text-2xl font-bold text-green-600">{statistiques.affectes}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{statistiques.enAttente}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sans choix</p>
              <p className="text-2xl font-bold text-red-600">{statistiques.sansChoix}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Boutons d'export et import */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestion des données</h3>
        <div className="space-y-4">
          {/* Section Export */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Exporter</h4>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportExcel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                Excel - Encadrements
              </button>

              <button
                onClick={handleExportPDFEtudiants}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FileText className="w-4 h-4 mr-2 text-red-600" />
                PDF - Liste Étudiants
              </button>

              <button
                onClick={handleExportPDFEncadreurs}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                PDF - Statistiques Encadreurs
              </button>
            </div>
          </div>

          {/* Section Import */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Importer des encadrements</h4>
            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={handleDownloadTemplate}
                className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-lg shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger le template
              </button>

              <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                {importing ? 'Import en cours...' : 'Importer fichier Excel'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportExcel}
                  disabled={importing}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Téléchargez d'abord le template, remplissez-le avec vos données, puis importez-le.
            </p>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un étudiant (nom, prénom, matricule)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="tous">Tous les statuts</option>
              <option value="affecte">Affectés</option>
              <option value="non_affecte">Non affectés</option>
              <option value="sans_choix">Sans choix</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table des étudiants */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-3"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Étudiant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nb Choix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Affectation
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {etudiantsFiltres.map((etudiant) => {
                const matricule = etudiant?.matricule_etud || etudiant?.Matricule_Etud || '';
                return (
                <React.Fragment key={matricule}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleExpandRow(matricule)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedRows.has(matricule) ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {etudiant?.prenom_etud || etudiant?.Prenom_Etud || ''} {etudiant?.nom_etud || etudiant?.Nom_Etud || ''}
                          </div>
                          <div className="text-sm text-gray-500">
                            {etudiant?.matricule_etud || etudiant?.Matricule_Etud || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatutBadge(etudiant)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {etudiant.choix?.length || 0} / 3
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {etudiant.affectation ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {etudiant.affectation.prenom_ens} {etudiant.affectation.nom_ens}
                          </div>
                          {etudiant.affectation.choix_retenu && (
                            <div className="text-gray-500">
                              Choix {etudiant.affectation.choix_retenu}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Non affecté</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => ouvrirModalAffectation(etudiant)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        {etudiant.affectation ? 'Modifier' : 'Affecter'}
                      </button>
                    </td>
                  </tr>

                  {/* Ligne expandable avec détails des choix */}
                  {expandedRows.has(matricule) && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 bg-gray-50">
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900 mb-2">Choix de l'étudiant :</h4>
                          {etudiant.choix && etudiant.choix.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {etudiant.choix.map((choix, index) => (
                                <div
                                  key={index}
                                  className="bg-white border border-gray-200 rounded-lg p-3"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      Choix {index + 1}
                                    </span>
                                    {choix.statut === 'affecte' && (
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    )}
                                  </div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {choix.prenom_ens} {choix.nom_ens}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {choix.grade_ens}
                                  </div>
                                  {choix.quota_info && (
                                    <div className="mt-2 text-xs">
                                      <span className={getQuotaColor(choix.quota_info)}>
                                        {choix.quota_info.nb_encadrements_actifs} / {choix.quota_info.quota_effectif || '∞'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">
                              Aucun choix soumis par l'étudiant
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
                );
              })}

              {etudiantsFiltres.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Aucun étudiant trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'affectation */}
      {selectedEtudiant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Affecter un encadrement
              </h2>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Étudiant</p>
                <p className="text-lg font-medium text-gray-900">
                  {selectedEtudiant?.prenom_etud || selectedEtudiant?.Prenom_Etud || ''} {selectedEtudiant?.nom_etud || selectedEtudiant?.Nom_Etud || ''}
                </p>
                <p className="text-sm text-gray-500">{selectedEtudiant?.matricule_etud || selectedEtudiant?.Matricule_Etud || ''}</p>
              </div>

              {/* Choix existants */}
              {selectedEtudiant.choix && selectedEtudiant.choix.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Choix de l'étudiant :</h3>
                  <div className="space-y-2">
                    {selectedEtudiant.choix.map((choix, index) => (
                      <button
                        key={index}
                        onClick={() => selectionnerEnseignant(choix)}
                        className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-medium text-blue-600 mr-2">
                              Choix {index + 1}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {choix.prenom_ens} {choix.nom_ens}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">
                              ({choix.grade_ens})
                            </span>
                          </div>
                          {choix.quota_info && (
                            <span className={`text-sm ${getQuotaColor(choix.quota_info)}`}>
                              {choix.quota_info.nb_encadrements_actifs} / {choix.quota_info.quota_effectif || '∞'}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recherche enseignant */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ou choisir un autre enseignant :
                </label>
                <div className="relative" ref={dropdownRef}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un enseignant..."
                    value={searchEnseignant}
                    onChange={(e) => {
                      setSearchEnseignant(e.target.value);
                      setShowEnseignantDropdown(true);
                    }}
                    onFocus={() => setShowEnseignantDropdown(true)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  {/* Dropdown auto-complétion */}
                  {showEnseignantDropdown && enseignantsFiltres.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {enseignantsFiltres.slice(0, 10).map((ens) => {
                        // Support des deux formats de casse
                        const matricule = ens.matricule_ens || ens.Matricule_Ens || '';
                        const nom = ens.nom_ens || ens.Nom_Ens || '';
                        const prenom = ens.prenom_ens || ens.Prenom_Ens || '';
                        const grade = ens.grade_ens || ens.Grade_Ens || '';
                        const nbEncadrements = ens.nb_encadrements_actifs || ens.Nb_Encadrements_Actifs || 0;
                        const quota = ens.quota_effectif || ens.Quota_Effectif || null;

                        return (
                        <button
                          key={matricule}
                          onClick={() => selectionnerEnseignant(ens)}
                          className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {prenom} {nom}
                              </div>
                              <div className="text-xs text-gray-500">
                                {grade} • {matricule}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-medium ${getQuotaColor(ens)}`}>
                                {nbEncadrements} / {quota || '∞'}
                              </div>
                              {ens.quota_atteint && (
                                <span className="text-xs text-red-600">Quota atteint</span>
                              )}
                            </div>
                          </div>
                        </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3">
                <button
                  onClick={fermerModalAffectation}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={affecterEncadrement}
                  disabled={!enseignantSelectionne || affectationEnCours}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {affectationEnCours ? 'Affectation...' : 'Confirmer l\'affectation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal résultats import */}
      {importModalOpen && importResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Résultats de l'import
              </h2>

              {/* Résumé */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-green-600 mb-1">Succès</div>
                  <div className="text-2xl font-bold text-green-700">
                    {importResults.successCount}
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-sm text-yellow-600 mb-1">Avertissements</div>
                  <div className="text-2xl font-bold text-yellow-700">
                    {importResults.warningCount}
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-sm text-red-600 mb-1">Erreurs</div>
                  <div className="text-2xl font-bold text-red-700">
                    {importResults.errorCount}
                  </div>
                </div>
              </div>

              {/* Détails */}
              <div className="space-y-4">
                {/* Succès */}
                {importResults.success && importResults.success.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">
                      ✓ Encadrements créés ({importResults.success.length})
                    </h3>
                    <div className="max-h-40 overflow-y-auto">
                      {importResults.success.slice(0, 10).map((item, i) => (
                        <div key={i} className="text-sm text-green-700 py-1">
                          Ligne {item.line}: {item.matriculeEtud} → {item.matriculeEns}
                        </div>
                      ))}
                      {importResults.success.length > 10 && (
                        <div className="text-sm text-green-600 italic mt-2">
                          ... et {importResults.success.length - 10} autre(s)
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Avertissements */}
                {importResults.warnings && importResults.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">
                      ⚠ Avertissements ({importResults.warnings.length})
                    </h3>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {importResults.warnings.map((item, i) => (
                        <div key={i} className="text-sm text-yellow-700">
                          Ligne {item.line}: {item.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Erreurs */}
                {importResults.errors && importResults.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-800 mb-2">
                      ✗ Erreurs ({importResults.errors.length})
                    </h3>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {importResults.errors.map((item, i) => (
                        <div key={i} className="text-sm text-red-700">
                          Ligne {item.line}: {item.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bouton fermer */}
              <div className="mt-6">
                <button
                  onClick={closeImportModal}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default AffectationEncadrements;
