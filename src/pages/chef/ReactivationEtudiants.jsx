import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';
import {
  RefreshCw,
  UserPlus,
  FileText,
  UserCheck,
  AlertCircle,
  Search,
  CheckSquare,
  X,
  Info
} from 'lucide-react';

/**
 * Page de réactivation des étudiants redoublants
 * Permet au chef de département de réactiver les étudiants de l'année précédente
 * avec option de conservation du thème et de l'encadreur
 */
export default function ReactivationEtudiants() {
  const [loading, setLoading] = useState(true);
  const [etudiants, setEtudiants] = useState([]);
  const [filteredEtudiants, setFilteredEtudiants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [filterAvaitTheme, setFilterAvaitTheme] = useState('tous');
  const [filterAvaitEncadreur, setFilterAvaitEncadreur] = useState('tous');
  const [selectedEtudiants, setSelectedEtudiants] = useState([]);
  const [showReactivationModal, setShowReactivationModal] = useState(false);
  const [currentEtudiant, setCurrentEtudiant] = useState(null);
  const [reactivationConfig, setReactivationConfig] = useState({
    conserverTheme: false,
    conserverEncadreur: false,
    commentaire: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [anneePrecedente, setAnneePrecedente] = useState('');

  useEffect(() => {
    fetchEtudiantsReactivables();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterStatut, filterAvaitTheme, filterAvaitEncadreur, etudiants]);

  const fetchEtudiantsReactivables = async () => {
    try {
      setLoading(true);
      const response = await axios.get(ENDPOINTS.ANNEE_REACTIVABLES);
      setEtudiants(response.data.data || []);
      setAnneePrecedente(response.data.anneePrecedente || '');
    } catch (error) {
      console.error('Erreur chargement étudiants:', error);
      //toast.error('Erreur lors du chargement des étudiants réactivables');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...etudiants];

    // Recherche par nom/matricule
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(etud =>
        etud.Nom_Etud?.toLowerCase().includes(term) ||
        etud.Prenom_Etud?.toLowerCase().includes(term) ||
        etud.Matricule_Etud?.toLowerCase().includes(term)
      );
    }

    // Filtre par statut
    if (filterStatut !== 'tous') {
      filtered = filtered.filter(etud => etud.Statut_Etudiant === filterStatut);
    }

    // Filtre par thème
    if (filterAvaitTheme !== 'tous') {
      const avaitTheme = filterAvaitTheme === 'oui';
      filtered = filtered.filter(etud => !!etud.Titre_Theme === avaitTheme);
    }

    // Filtre par encadreur
    if (filterAvaitEncadreur !== 'tous') {
      const avaitEncadreur = filterAvaitEncadreur === 'oui';
      filtered = filtered.filter(etud => !!etud.Matricule_Ens === avaitEncadreur);
    }

    setFilteredEtudiants(filtered);
  };

  const handleSelectEtudiant = (matricule) => {
    setSelectedEtudiants(prev =>
      prev.includes(matricule)
        ? prev.filter(m => m !== matricule)
        : [...prev, matricule]
    );
  };

  const handleSelectAll = () => {
    if (selectedEtudiants.length === filteredEtudiants.length) {
      setSelectedEtudiants([]);
    } else {
      setSelectedEtudiants(filteredEtudiants.map(e => e.Matricule_Etud));
    }
  };

  const handleOpenReactivationModal = (etudiant) => {
    setCurrentEtudiant(etudiant);
    setReactivationConfig({
      conserverTheme: !!etudiant.Titre_Theme,
      conserverEncadreur: !!etudiant.Matricule_Ens && etudiant.encadreurDisponible,
      commentaire: ''
    });
    setShowReactivationModal(true);
  };

  const handleReactiverEtudiant = async () => {
    if (!currentEtudiant) return;

    try {
      setSubmitting(true);
      await axios.post(ENDPOINTS.ANNEE_REACTIVER, {
        matriculeEtud: currentEtudiant.Matricule_Etud,
        conserverTheme: reactivationConfig.conserverTheme,
        conserverEncadreur: reactivationConfig.conserverEncadreur,
        commentaire: reactivationConfig.commentaire
      });

      toast.success(`Étudiant ${currentEtudiant.Prenom_Etud} ${currentEtudiant.Nom_Etud} réactivé avec succès`);
      setShowReactivationModal(false);
      setCurrentEtudiant(null);
      fetchEtudiantsReactivables();
    } catch (error) {
      console.error('Erreur réactivation:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la réactivation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReactiverSelection = async () => {
    if (selectedEtudiants.length === 0) {
      toast.warning('Veuillez sélectionner au moins un étudiant');
      return;
    }

    if (!window.confirm(`Réactiver ${selectedEtudiants.length} étudiant(s) sélectionné(s) ?`)) {
      return;
    }

    try {
      setSubmitting(true);
      const promises = selectedEtudiants.map(matricule =>
        axios.post(ENDPOINTS.ANNEE_REACTIVER, {
          matriculeEtud: matricule,
          conserverTheme: false,
          conserverEncadreur: false,
          commentaire: 'Réactivation en masse'
        })
      );

      await Promise.all(promises);
      toast.success(`${selectedEtudiants.length} étudiant(s) réactivé(s) avec succès`);
      setSelectedEtudiants([]);
      fetchEtudiantsReactivables();
    } catch (error) {
      console.error('Erreur réactivation multiple:', error);
      toast.error('Erreur lors de la réactivation multiple');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatutBadge = (statut) => {
    const config = {
      'Inscrit': { color: 'bg-gray-100 text-gray-800', label: 'Inscrit' },
      'Theme_Propose': { color: 'bg-blue-100 text-blue-800', label: 'Thème proposé' },
      'Encadrement_Valide': { color: 'bg-green-100 text-green-800', label: 'Encadrement validé' },
      'Pret_Soutenance': { color: 'bg-purple-100 text-purple-800', label: 'Prêt soutenance' },
      'Abandonne': { color: 'bg-red-100 text-red-800', label: 'Abandonné' }
    };

    const { color, label } = config[statut] || { color: 'bg-gray-100 text-gray-800', label: statut };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <RefreshCw className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Réactivation des Étudiants</h1>
          </div>
          <p className="text-gray-600">
            Réactiver les étudiants de l'année précédente ({anneePrecedente}) qui n'ont pas soutenu
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total réactivables</p>
                <p className="text-2xl font-bold text-gray-900">{etudiants.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avec thème</p>
                <p className="text-2xl font-bold text-gray-900">
                  {etudiants.filter(e => e.Titre_Theme).length}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avec encadreur</p>
                <p className="text-2xl font-bold text-gray-900">
                  {etudiants.filter(e => e.Matricule_Ens).length}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <CheckSquare className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sélectionnés</p>
                <p className="text-2xl font-bold text-gray-900">{selectedEtudiants.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou matricule..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="tous">Tous les statuts</option>
              <option value="Inscrit">Inscrit</option>
              <option value="Theme_Propose">Thème proposé</option>
              <option value="Encadrement_Valide">Encadrement validé</option>
              <option value="Pret_Soutenance">Prêt soutenance</option>
              <option value="Abandonne">Abandonné</option>
            </select>

            <select
              value={filterAvaitTheme}
              onChange={(e) => setFilterAvaitTheme(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="tous">Thème (tous)</option>
              <option value="oui">Avec thème</option>
              <option value="non">Sans thème</option>
            </select>

            <select
              value={filterAvaitEncadreur}
              onChange={(e) => setFilterAvaitEncadreur(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="tous">Encadreur (tous)</option>
              <option value="oui">Avec encadreur</option>
              <option value="non">Sans encadreur</option>
            </select>
          </div>

          {selectedEtudiants.length > 0 && (
            <div className="mt-4 flex items-center justify-between p-3 bg-primary-50 rounded-lg">
              <p className="text-sm font-medium text-primary-900">
                {selectedEtudiants.length} étudiant(s) sélectionné(s)
              </p>
              <Button
                onClick={handleReactiverSelection}
                disabled={submitting}
                className="bg-primary-600 hover:bg-primary-700"
              >
                <UserPlus className="w-4 h-4" />
                Réactiver la sélection
              </Button>
            </div>
          )}
        </Card>

        {/* Liste des étudiants */}
        {filteredEtudiants.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                {etudiants.length === 0
                  ? 'Aucun étudiant réactivable pour le moment'
                  : 'Aucun étudiant ne correspond aux filtres'}
              </p>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedEtudiants.length === filteredEtudiants.length && filteredEtudiants.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Étudiant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thème proposé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Encadreur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEtudiants.map((etudiant) => (
                    <tr key={etudiant.Matricule_Etud} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedEtudiants.includes(etudiant.Matricule_Etud)}
                          onChange={() => handleSelectEtudiant(etudiant.Matricule_Etud)}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {etudiant.Prenom_Etud} {etudiant.Nom_Etud}
                          </p>
                          <p className="text-sm text-gray-500">{etudiant.Matricule_Etud}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatutBadge(etudiant.Statut_Etudiant)}
                      </td>
                      <td className="px-6 py-4">
                        {etudiant.Titre_Theme ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm truncate max-w-xs" title={etudiant.Titre_Theme}>
                              {etudiant.Titre_Theme}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Aucun</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {etudiant.Matricule_Ens ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {etudiant.Nom_Ens} {etudiant.Prenom_Ens}
                            </p>
                            {!etudiant.encadreurDisponible && (
                              <p className="text-xs text-orange-600">Quota atteint</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Aucun</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          onClick={() => handleOpenReactivationModal(etudiant)}
                          variant="primary"
                          className="text-sm"
                        >
                          <UserPlus className="w-4 h-4" />
                          Réactiver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Modal de réactivation */}
        {showReactivationModal && currentEtudiant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold">
                  Réactiver {currentEtudiant.Prenom_Etud} {currentEtudiant.Nom_Etud}
                </h2>
                <button
                  onClick={() => setShowReactivationModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Info étudiant */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900">Informations étudiant</p>
                      <p className="text-sm text-blue-800 mt-1">
                        Matricule : {currentEtudiant.Matricule_Etud} • Statut : {currentEtudiant.Statut_Etudiant}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Options de réactivation */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={reactivationConfig.conserverTheme}
                      onChange={(e) => setReactivationConfig({
                        ...reactivationConfig,
                        conserverTheme: e.target.checked
                      })}
                      disabled={!currentEtudiant.Titre_Theme}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-semibold">Conserver le thème proposé l'année précédente ?</p>
                      {currentEtudiant.Titre_Theme ? (
                        <p className="text-sm text-gray-600 mt-1">
                          Thème : {currentEtudiant.Titre_Theme}
                        </p>
                      ) : (
                        <p className="text-sm text-orange-600 mt-1">
                          Aucun thème proposé l'année dernière
                        </p>
                      )}
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={reactivationConfig.conserverEncadreur}
                      onChange={(e) => setReactivationConfig({
                        ...reactivationConfig,
                        conserverEncadreur: e.target.checked
                      })}
                      disabled={!currentEtudiant.Matricule_Ens || !currentEtudiant.encadreurDisponible}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-semibold">Réaffecter automatiquement l'ancien encadreur ?</p>
                      {currentEtudiant.Matricule_Ens ? (
                        currentEtudiant.encadreurDisponible ? (
                          <p className="text-sm text-gray-600 mt-1">
                            Encadreur : {currentEtudiant.Nom_Ens} {currentEtudiant.Prenom_Ens}
                          </p>
                        ) : (
                          <p className="text-sm text-orange-600 mt-1">
                            Encadreur non disponible (quota atteint)
                          </p>
                        )
                      ) : (
                        <p className="text-sm text-orange-600 mt-1">
                          Aucun encadreur affecté l'année dernière
                        </p>
                      )}
                    </div>
                  </label>
                </div>

                {/* Commentaire */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaire (optionnel)
                  </label>
                  <textarea
                    value={reactivationConfig.commentaire}
                    onChange={(e) => setReactivationConfig({
                      ...reactivationConfig,
                      commentaire: e.target.value
                    })}
                    rows={3}
                    placeholder="Ajouter un commentaire sur la réactivation..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t">
                <Button
                  onClick={() => setShowReactivationModal(false)}
                  variant="secondary"
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleReactiverEtudiant}
                  disabled={submitting}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  {submitting ? 'Réactivation...' : 'Confirmer la réactivation'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
