import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';
import { Check, X, RefreshCw, Search, Filter, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function GestionEncadrements() {
  const { user } = useAuth();
  const [encadrements, setEncadrements] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous'); // tous, en_attente, valides
  const [showReaffectModal, setShowReaffectModal] = useState(false);
  const [selectedEncadrement, setSelectedEncadrement] = useState(null);
  const [reaffectData, setReaffectData] = useState({
    nouveauMatriculeEns: '',
    motif: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [encRes, ensRes] = await Promise.all([
        axios.get(ENDPOINTS.CHEF_ENCADREMENTS),
        axios.get(ENDPOINTS.CHEF_ENSEIGNANTS)
      ]);
      const encadrementsData = encRes.data.data || [];
      setEncadrements(encadrementsData);
      setEnseignants(ensRes.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleValider = async (idEncadrement) => {
    if (!window.confirm('Êtes-vous sûr de vouloir valider cet encadrement ?')) {
      return;
    }

    try {
      await axios.post(ENDPOINTS.VALIDER_ENCADREMENT(idEncadrement));
      toast.success('Encadrement validé avec succès');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la validation');
    }
  };

  const openReaffectModal = (encadrement) => {
    setSelectedEncadrement(encadrement);
    setReaffectData({
      nouveauMatriculeEns: '',
      motif: ''
    });
    setShowReaffectModal(true);
  };

  const handleReaffecter = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(ENDPOINTS.REAFFECTER_ENCADREMENT(selectedEncadrement.Id_Encadrement), reaffectData);
      toast.success('Encadrement réaffecté avec succès');
      setShowReaffectModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la réaffectation');
    } finally {
      setSubmitting(false);
    }
  };

  // Afficher tous les encadrements (y compris ceux du chef)
  const encadrementsAGerer = encadrements;

  // Calculer les statistiques (uniquement pour les encadrements à gérer)
  const stats = {
    total: encadrementsAGerer.length,
    enAttente: encadrementsAGerer.filter(e => e.Statut_Encadrement === 'Accepte_Encadreur').length,
    valides: encadrementsAGerer.filter(e => e.Statut_Encadrement === 'Valide').length,
    rejetes: encadrementsAGerer.filter(e => e.Statut_Encadrement === 'Refuse' || e.Statut_Encadrement === 'Reassigne').length
  };

  // Filtrer les encadrements avec recherche et statut
  let filteredEncadrements = encadrementsAGerer.filter(enc => {
    const matchSearch = searchTerm === '' ||
      `${enc.etudiant?.Nom_Etud} ${enc.etudiant?.Prenom_Etud} ${enc.enseignant?.Nom_Ens} ${enc.enseignant?.Prenom_Ens} ${enc.theme?.Titre}`.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      filterStatus === 'tous' ||
      (filterStatus === 'en_attente' && enc.Statut_Encadrement === 'Accepte_Encadreur') ||
      (filterStatus === 'valides' && enc.Statut_Encadrement === 'Valide') ||
      (filterStatus === 'rejetes' && (enc.Statut_Encadrement === 'Refuse' || enc.Statut_Encadrement === 'Reassigne'));

    return matchSearch && matchStatus;
  });

  // Calculer la charge des enseignants
  const getEnseignantCharge = (matriculeEns) => {
    return encadrements.filter(e => e.Matricule_Ens === matriculeEns && e.Statut_Encadrement === 'Valide').length;
  };

  // Enseignants disponibles pour réaffectation (exclure l'encadreur actuel)
  const enseignantsDisponibles = selectedEncadrement
    ? enseignants.filter(e => e.Matricule_Ens !== selectedEncadrement.Matricule_Ens)
    : enseignants;

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
          <h1 className="text-2xl font-bold">MemoRIS</h1>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
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
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Validés</p>
                <p className="text-2xl font-bold">{stats.valides}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Rejetés</p>
                <p className="text-2xl font-bold">{stats.rejetes}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Filter className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un étudiant, enseignant ou thème..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('tous')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                  filterStatus === 'tous'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous ({stats.total})
              </button>
              <button
                onClick={() => setFilterStatus('en_attente')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                  filterStatus === 'en_attente'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                En attente ({stats.enAttente})
              </button>
              <button
                onClick={() => setFilterStatus('valides')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                  filterStatus === 'valides'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Validés ({stats.valides})
              </button>
            </div>
          </div>
        </Card>

        {/* Liste des encadrements */}
        <Card>
          {filteredEncadrements.length > 0 ? (
            <div className="space-y-4">
              {filteredEncadrements.map((enc) => {
                const charge = getEnseignantCharge(enc.Matricule_Ens);
                const quotaMax = enc.enseignant?.Quota_Max || 5;
                const isComplet = charge >= quotaMax;

                return (
                  <div key={enc.Id_Encadrement} className="border rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-3 md:gap-4">
                      <div className="flex-1 w-full">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="font-semibold text-base md:text-lg">
                            {enc.etudiant?.Prenom_Etud} {enc.etudiant?.Nom_Etud}
                          </h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            enc.Statut_Encadrement === 'Valide' ? 'bg-green-100 text-green-800' :
                            enc.Statut_Encadrement === 'Refuse' ? 'bg-red-100 text-red-800' :
                            enc.Statut_Encadrement === 'Reassigne' ? 'bg-yellow-100 text-yellow-800' :
                            enc.Statut_Encadrement === 'Accepte_Encadreur' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {enc.Statut_Encadrement === 'Valide' ? 'Validé' :
                             enc.Statut_Encadrement === 'Refuse' ? 'Refusé' :
                             enc.Statut_Encadrement === 'Reassigne' ? 'Réaffecté' :
                             enc.Statut_Encadrement === 'Accepte_Encadreur' ? 'En attente de validation' :
                             enc.Statut_Encadrement === 'Demande_Envoyee' ? 'Demande envoyée' :
                             enc.Statut_Encadrement}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Matricule:</span> {enc.etudiant?.Matricule_Etud}
                          </p>
                          <p className="flex flex-wrap items-center gap-2">
                            <span><span className="font-medium">Encadreur:</span> {enc.enseignant?.Prenom_Ens} {enc.enseignant?.Nom_Ens}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              isComplet ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {charge}/{quotaMax}
                            </span>
                          </p>
                          <p>
                            <span className="font-medium">Grade:</span> {enc.enseignant?.Grade_Ens}
                          </p>
                          <p className="line-clamp-2">
                            <span className="font-medium">Thème:</span> {enc.theme?.Titre || 'Non défini'}
                          </p>
                          {enc.Commentaire_Refus && (
                            <p className="text-red-600 line-clamp-2">
                              <span className="font-medium">Motif:</span> {enc.Commentaire_Refus}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto">
                        {/* Afficher le statut actuel pour debug */}
                        <div className="text-xs text-gray-500">
                          Statut: {enc.Statut_Encadrement || 'Non défini'}
                        </div>

                        {/* Boutons d'action selon le statut */}
                        {enc.Statut_Encadrement === 'Accepte_Encadreur' && (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleValider(enc.Id_Encadrement)}
                              disabled={isComplet}
                              title={isComplet ? 'Encadreur complet - Veuillez réaffecter' : 'Valider l\'encadrement'}
                              className="w-full sm:w-auto"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Valider
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openReaffectModal(enc)}
                              className="w-full sm:w-auto"
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Réaffecter
                            </Button>
                          </div>
                        )}

                        {enc.Statut_Encadrement === 'Demande_Envoyee' && (
                          <div className="text-sm text-gray-600 italic">
                            En attente de réponse de l'enseignant
                          </div>
                        )}

                        {enc.Statut_Encadrement === 'Valide' && (
                          <div className="text-sm text-green-600">
                            ✓ Encadrement validé
                          </div>
                        )}

                        {(enc.Statut_Encadrement === 'Refuse' || enc.Statut_Encadrement === 'Reassigne') && (
                          <div className="text-sm text-red-600">
                            ✗ Encadrement clôturé
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun encadrement trouvé</p>
            </div>
          )}
        </Card>
      </div>

      {/* Modal de réaffectation */}
      {showReaffectModal && selectedEncadrement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">Réaffecter l'encadrement</h2>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Étudiant</p>
              <p className="text-lg">{selectedEncadrement.etudiant?.Prenom_Etud} {selectedEncadrement.etudiant?.Nom_Etud}</p>
              <p className="text-sm text-gray-500 mt-1">
                Encadreur actuel: {selectedEncadrement.enseignant?.Prenom_Ens} {selectedEncadrement.enseignant?.Nom_Ens}
              </p>
            </div>

            <form onSubmit={handleReaffecter} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouvel encadreur *
                </label>
                <select
                  value={reaffectData.nouveauMatriculeEns}
                  onChange={(e) => setReaffectData({ ...reaffectData, nouveauMatriculeEns: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Sélectionner un enseignant</option>
                  {enseignantsDisponibles.map(ens => {
                    const charge = getEnseignantCharge(ens.Matricule_Ens);
                    const quota = ens.Quota_Max || 5;
                    const disponible = charge < quota;

                    return (
                      <option key={ens.Matricule_Ens} value={ens.Matricule_Ens} disabled={!disponible}>
                        {ens.Prenom_Ens} {ens.Nom_Ens} - {ens.Grade_Ens} ({charge}/{quota}) {!disponible ? '- COMPLET' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motif de la réaffectation *
                </label>
                <textarea
                  value={reaffectData.motif}
                  onChange={(e) => setReaffectData({ ...reaffectData, motif: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Ex: Encadreur complet, spécialité inadaptée, etc."
                  required
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Une notification sera envoyée à l'étudiant et aux deux enseignants concernés.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowReaffectModal(false)}
                  disabled={submitting}
                  className="flex-1 w-full sm:w-auto"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 w-full sm:w-auto"
                >
                  {submitting ? 'Réaffectation...' : 'Réaffecter'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
