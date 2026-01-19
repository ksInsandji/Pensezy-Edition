import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  ArrowLeft,
  CheckCircle,
  BarChart3
} from 'lucide-react';

export const Exports = () => {
  const navigate = useNavigate();

  // États
  const [loading, setLoading] = useState(false);
  const [filieres, setFilieres] = useState([]);
  const [filters, setFilters] = useState({
    anneeAcademique: '',
    idFil: '',
    statut: ''
  });

  // Charger l'année académique et les filières
  useEffect(() => {
    fetchAnneeAcademique();
    chargerFilieres();
  }, []);

  const fetchAnneeAcademique = async () => {
    try {
      const response = await axios.get(ENDPOINTS.ANNEE_COURANTE);
      const annee = response.data.data.annee;
      setFilters(prev => ({ ...prev, anneeAcademique: annee }));
    } catch (error) {
      console.error('Erreur chargement année académique:', error);
    }
  };

  const chargerFilieres = async () => {
    try {
      const response = await axios.get(ENDPOINTS.CHEF_FILIERES);
      setFilieres(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement filières:', error);
    }
  };

  const buildQueryString = (additionalParams = {}) => {
    const params = new URLSearchParams();

    if (filters.anneeAcademique) {
      params.append('anneeAcademique', filters.anneeAcademique);
    }

    if (filters.idFil) {
      params.append('idFil', filters.idFil);
    }

    if (filters.statut) {
      params.append('statut', filters.statut);
    }

    Object.entries(additionalParams).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    return params.toString();
  };

  const telechargerChoixExcel = async () => {
    try {
      setLoading(true);
      const queryString = buildQueryString();

      const response = await axios.get(`${ENDPOINTS.EXPORT_CHOIX_EXCEL}?${queryString}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const filename = `choix_encadrements_${filters.anneeAcademique.replace('/', '-')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.setAttribute('download', filename);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('Export Excel réussi !');
    } catch (error) {
      console.error('Erreur export Excel:', error);
      const message = error.response?.data?.message || error.message || 'Erreur lors de l\'export Excel';
      alert(`Erreur: ${message}\n\nVérifiez:\n- Que vous êtes bien connecté\n- Que le backend est démarré\n- Les logs dans la console`);
    } finally {
      setLoading(false);
    }
  };

  const telechargerListePDF = async () => {
    try {
      setLoading(true);
      const queryString = buildQueryString();

      const response = await axios.get(`${ENDPOINTS.EXPORT_LISTE_PDF}?${queryString}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const filename = `liste_officielle_${filters.anneeAcademique.replace('/', '-')}_${new Date().toISOString().split('T')[0]}.pdf`;
      link.setAttribute('download', filename);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('Export PDF réussi !');
    } catch (error) {
      console.error('Erreur export PDF:', error);
      const message = error.response?.data?.message || error.message || 'Erreur lors de l\'export PDF';
      alert(`Erreur: ${message}\n\nVérifiez:\n- Que vous êtes bien connecté\n- Que le backend est démarré\n- Les logs dans la console`);
    } finally {
      setLoading(false);
    }
  };

  const telechargerStatistiquesExcel = async () => {
    try {
      setLoading(true);
      const queryString = buildQueryString();

      const response = await axios.get(`${ENDPOINTS.EXPORT_STATISTIQUES_EXCEL}?${queryString}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const filename = `statistiques_${filters.anneeAcademique.replace('/', '-')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.setAttribute('download', filename);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('Export statistiques réussi !');
    } catch (error) {
      console.error('Erreur export statistiques:', error);
      const message = error.response?.data?.message || error.message || 'Erreur lors de l\'export des statistiques';
      alert(`Erreur: ${message}\n\nVérifiez:\n- Que vous êtes bien connecté\n- Que le backend est démarré\n- Les logs dans la console`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
      {/* En-tête */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/chef/dashboard')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Exports</h1>
        <p className="text-gray-600 mt-2">
          Exportez les données des encadrements en Excel ou PDF
        </p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtres
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Année académique
            </label>
            <input
              type="text"
              value={filters.anneeAcademique}
              onChange={(e) => setFilters({ ...filters, anneeAcademique: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="2024-2025"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filière (optionnel)
            </label>
            <select
              value={filters.idFil}
              onChange={(e) => setFilters({ ...filters, idFil: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Toutes les filières</option>
              {filieres.map((fil) => (
                <option key={fil.Id_Fil} value={fil.Id_Fil}>
                  {fil.Nom_Fil} - {fil.Niveau === 'master_1' ? 'M1' : 'M2'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut (optionnel)
            </label>
            <select
              value={filters.statut}
              onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="valide">Validé</option>
              <option value="en_cours">En cours</option>
              <option value="refuse">Refusé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cartes d'export */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Export choix Excel */}
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
            <FileSpreadsheet className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-center mb-3">
            Tous les choix (Excel)
          </h3>
          <p className="text-gray-600 text-sm text-center mb-6">
            Export complet de tous les choix d'encadrements avec les 3 choix par étudiant, l'encadreur final et le thème
          </p>
          <div className="space-y-2 mb-6">
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>3 choix par étudiant</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Encadreur final affecté</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Titre du thème</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Statuts détaillés</span>
            </div>
          </div>
          <button
            onClick={telechargerChoixExcel}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Download className="w-5 h-5" />
            {loading ? 'Génération...' : 'Télécharger Excel'}
          </button>
        </div>

        {/* Export liste officielle PDF */}
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-center mb-3">
            Liste officielle (PDF)
          </h3>
          <p className="text-gray-600 text-sm text-center mb-6">
            Document PDF formel avec la liste officielle des encadrements validés, prêt pour impression et archivage
          </p>
          <div className="space-y-2 mb-6">
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <span>Format officiel</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <span>Groupé par filière</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <span>Encadrements validés uniquement</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <span>Prêt pour impression</span>
            </div>
          </div>
          <button
            onClick={telechargerListePDF}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Download className="w-5 h-5" />
            {loading ? 'Génération...' : 'Télécharger PDF'}
          </button>
        </div>

        {/* Export statistiques Excel */}
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-center mb-3">
            Statistiques (Excel)
          </h3>
          <p className="text-gray-600 text-sm text-center mb-6">
            Rapport statistique complet avec 2 feuilles : statistiques par filière et par enseignant
          </p>
          <div className="space-y-2 mb-6">
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Stats par filière</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Stats par enseignant</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Taux d'affectation</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Utilisation quotas</span>
            </div>
          </div>
          <button
            onClick={telechargerStatistiquesExcel}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Download className="w-5 h-5" />
            {loading ? 'Génération...' : 'Télécharger Excel'}
          </button>
        </div>
      </div>

      {/* Note d'information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-blue-800">
          <strong>Note :</strong> Les exports utilisent les filtres ci-dessus. Pour exporter toutes les données,
          laissez les filtres optionnels vides. Les fichiers sont générés en temps réel selon vos permissions.
        </p>
      </div>
      </div>
    </Layout>
  );
};
