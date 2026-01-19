import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../../components/layout/Layout';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import {
  DollarSign,
  Clock,
  Users,
  FileText,
  Award,
  Eye,
  Download,
  Calendar,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const CalculCharges = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [anneeAcademique, setAnneeAcademique] = useState('');
  const [chargesDepartement, setChargesDepartement] = useState([]);
  const [enseignantSelectionne, setEnseignantSelectionne] = useState(null);
  const [chargesDetail, setChargesDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    fetchAnneeAcademique();
  }, []);

  useEffect(() => {
    if (anneeAcademique) {
      chargerChargesDepartement();
    }
  }, [anneeAcademique]);

  const fetchAnneeAcademique = async () => {
    try {
      const response = await axios.get(ENDPOINTS.ANNEE_COURANTE);
      setAnneeAcademique(response.data.data.annee);
    } catch (error) {
      console.error('Erreur chargement année académique:', error);
    }
  };

  const chargerChargesDepartement = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${ENDPOINTS.REMUNERATION_CHARGES_DEPARTEMENT}?anneeAcademique=${anneeAcademique}`
      );
      setChargesDepartement(response.data.data);
    } catch (error) {
      console.error('Erreur chargement charges département:', error);
      alert('Erreur lors du chargement des charges');
    } finally {
      setLoading(false);
    }
  };

  const chargerChargesEnseignant = async (matricule) => {
    try {
      setLoadingDetail(true);
      const response = await axios.get(
        `${ENDPOINTS.REMUNERATION_CHARGES_ENSEIGNANT(matricule)}?anneeAcademique=${anneeAcademique}`
      );
      setChargesDetail(response.data.data);
      setEnseignantSelectionne(matricule);
    } catch (error) {
      console.error('Erreur chargement charges enseignant:', error);
      alert('Erreur lors du chargement des détails');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    if (!sortConfig.key) return chargesDepartement;

    return [...chargesDepartement].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      return sortConfig.direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant);
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-primary-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-primary-600" />
    );
  };

  // Calculer les totaux du département
  const totauxDepartement = chargesDepartement.reduce(
    (acc, ens) => ({
      totalHeures: acc.totalHeures + (parseFloat(ens.totalHeures) || 0),
      totalRemuneration: acc.totalRemuneration + (parseFloat(ens.totalRemuneration) || 0),
      totalEncadrements: acc.totalEncadrements + (parseInt(ens.nbEncadrements) || 0),
      totalJurys: acc.totalJurys + (parseInt(ens.nbJurys) || 0)
    }),
    { totalHeures: 0, totalRemuneration: 0, totalEncadrements: 0, totalJurys: 0 }
  );

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
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Calcul des Charges d'Encadrement
            </h1>
            <p className="text-primary-100">
              Département: {user?.departement || 'Tous'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Sélecteur d'année */}
            <div className="bg-white rounded-lg px-4 py-2">
              <label className="block text-xs text-gray-600 mb-1">Année académique</label>
              <select
                value={anneeAcademique}
                onChange={(e) => setAnneeAcademique(e.target.value)}
                className="text-gray-900 font-medium focus:outline-none"
              >
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2022-2023">2022-2023</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Cartes KPI Département */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Heures</p>
              <p className="text-2xl font-bold text-gray-900">
                {totauxDepartement.totalHeures.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">heures éq. TD</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Rémunération</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatMontant(totauxDepartement.totalRemuneration)}
              </p>
              <p className="text-xs text-gray-500 mt-1">FCFA</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Encadrements</p>
              <p className="text-2xl font-bold text-gray-900">
                {totauxDepartement.totalEncadrements}
              </p>
              <p className="text-xs text-gray-500 mt-1">mémoires</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Participations Jury</p>
              <p className="text-2xl font-bold text-gray-900">
                {totauxDepartement.totalJurys}
              </p>
              <p className="text-xs text-gray-500 mt-1">soutenances</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des charges par enseignant */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Charges par Enseignant
          </h2>
          <div className="text-sm text-gray-600">
            {chargesDepartement.length} enseignant(s)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enseignant
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('grade')}
                >
                  <div className="flex items-center gap-1">
                    Grade
                    <SortIcon columnKey="grade" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('nbEncadrements')}
                >
                  <div className="flex items-center gap-1">
                    Encadr.
                    <SortIcon columnKey="nbEncadrements" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('nbJurys')}
                >
                  <div className="flex items-center gap-1">
                    Jurys
                    <SortIcon columnKey="nbJurys" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalHeures')}
                >
                  <div className="flex items-center gap-1">
                    Total Heures
                    <SortIcon columnKey="totalHeures" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalRemuneration')}
                >
                  <div className="flex items-center gap-1">
                    Rémunération
                    <SortIcon columnKey="totalRemuneration" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getSortedData().map((ens) => (
                <tr
                  key={ens.matricule}
                  className={`hover:bg-gray-50 ${
                    enseignantSelectionne === ens.matricule ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {ens.nom} {ens.prenom}
                    </div>
                    <div className="text-xs text-gray-500">{ens.matricule}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{ens.grade}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {ens.nbEncadrements}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {ens.nbJurys}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {parseFloat(ens.totalHeures).toFixed(2)} h
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">
                      {formatMontant(ens.totalRemuneration)} FCFA
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => chargerChargesEnseignant(ens.matricule)}
                      className="text-primary-600 hover:text-primary-900 font-medium flex items-center gap-1 ml-auto"
                    >
                      <Eye className="w-4 h-4" />
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de détails enseignant */}
      {enseignantSelectionne && chargesDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {loadingDetail ? (
              <div className="p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <>
                {/* En-tête modal */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">
                        {chargesDetail.enseignant.nom} {chargesDetail.enseignant.prenom}
                      </h3>
                      <p className="text-primary-100 text-sm mt-1">
                        {chargesDetail.enseignant.grade} • {chargesDetail.anneeAcademique}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEnseignantSelectionne(null);
                        setChargesDetail(null);
                      }}
                      className="text-white hover:bg-primary-700 rounded-full p-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Résumé */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Total Heures</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {chargesDetail.totaux.totalHeures} h
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Rémunération</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {formatMontant(chargesDetail.totaux.totalRemuneration)} FCFA
                      </p>
                    </div>
                  </div>

                  {/* Encadrements */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      Encadrements ({chargesDetail.encadrements.nbM1 + chargesDetail.encadrements.nbM2})
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Master 1:</span>
                          <span className="font-medium ml-2">{chargesDetail.encadrements.nbM1}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Master 2:</span>
                          <span className="font-medium ml-2">{chargesDetail.encadrements.nbM2}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total heures:</span>
                          <span className="font-medium ml-2">{chargesDetail.encadrements.heures.toFixed(2)} h</span>
                        </div>
                      </div>
                    </div>

                    {chargesDetail.encadrements.details.length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {chargesDetail.encadrements.details.map((enc, idx) => (
                          <div key={idx} className="bg-white border border-gray-200 rounded p-3 text-sm">
                            <div className="font-medium text-gray-900">
                              {enc.Nom_Etud} {enc.Prenom_Etud}
                            </div>
                            <div className="text-gray-600 text-xs mt-1">
                              {enc.Nom_Fil} - {enc.Niveau} • {enc.Theme_Memoire || 'Thème non défini'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Jurys */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-orange-600" />
                      Participations Jury
                    </h4>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Président</p>
                        <p className="text-lg font-bold text-yellow-700">{chargesDetail.jurys.president.nb}</p>
                        <p className="text-xs text-gray-500">{chargesDetail.jurys.president.heures.toFixed(2)} h</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Rapporteur</p>
                        <p className="text-lg font-bold text-blue-700">{chargesDetail.jurys.rapporteur.nb}</p>
                        <p className="text-xs text-gray-500">{chargesDetail.jurys.rapporteur.heures.toFixed(2)} h</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Examinateur</p>
                        <p className="text-lg font-bold text-gray-700">{chargesDetail.jurys.examinateur.nb}</p>
                        <p className="text-xs text-gray-500">{chargesDetail.jurys.examinateur.heures.toFixed(2)} h</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default CalculCharges;
