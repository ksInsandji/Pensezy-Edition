import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { useLocation } from 'react-router-dom';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';
import { Gavel, User, Calendar, Clock, MapPin, FileText, Users, Award } from 'lucide-react';

export default function EnseignantJurys() {
  const location = useLocation();
  const [jurys, setJurys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJurys();
  }, [location.pathname]); // Se rafraîchit quand l'URL change

  const fetchJurys = async () => {
    try {
      const response = await axios.get(ENDPOINTS.ENSEIGNANT_JURYS);
      console.log('Response jurys enseignant:', response.data);

      // Dédupliquer les jurys par Id_Jury pour éviter d'afficher le même jury plusieurs fois
      const jurysData = response.data.data || [];
      const uniqueJurys = [];
      const seenJuryIds = new Set();

      jurysData.forEach(membreJury => {
        if (membreJury.jury && !seenJuryIds.has(membreJury.jury.Id_Jury)) {
          seenJuryIds.add(membreJury.jury.Id_Jury);
          uniqueJurys.push(membreJury);
        }
      });

      console.log(`Jurys uniques: ${uniqueJurys.length} sur ${jurysData.length} enregistrements`);
      setJurys(uniqueJurys);
    } catch (error) {
      toast.error('Erreur lors du chargement des jurys');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
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

  // Séparer les jurys passés et à venir
  const today = new Date().toISOString().slice(0, 10);
  const jurysAVenir = jurys.filter(j => j.jury?.Date_Soutenance >= today);
  const jurysPasses = jurys.filter(j => j.jury?.Date_Soutenance < today);

  const getRoleBadge = (role) => {
    const roles = {
      'President': { label: '👔 Président', color: 'bg-purple-100 text-purple-800' },
      'Rapporteur': { label: '📋 Rapporteur', color: 'bg-blue-100 text-blue-800' },
      'Examinateur': { label: '❓ Examinateur', color: 'bg-green-100 text-green-800' },
      'Encadreur': { label: '👨‍🏫 Encadreur', color: 'bg-orange-100 text-orange-800' }
    };
    return roles[role] || { label: role, color: 'bg-gray-100 text-gray-800' };
  };

  const renderJuryCard = (membreJury) => {
    const jury = membreJury.jury;
    if (!jury) return null;

    const roleBadge = getRoleBadge(membreJury.Role);
    const dateSoutenance = new Date(jury.Date_Soutenance);
    const isPast = jury.Date_Soutenance < today;

    return (
      <div key={membreJury.Id_Membre_Jury} className="border rounded-lg p-5 hover:shadow-md transition-shadow">
        {/* En-tête */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Gavel className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {jury.etudiant?.Prenom_Etud} {jury.etudiant?.Nom_Etud}
              </h3>
              <p className="text-sm text-gray-500">{jury.etudiant?.Matricule_Etud}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleBadge.color}`}>
            {roleBadge.label}
          </span>
        </div>

        {/* Informations de la soutenance */}
        <div className="space-y-2 text-sm mb-4">
          {jury.etudiant?.filiere && (
            <div className="flex items-center gap-2 text-gray-600">
              <FileText className="w-4 h-4" />
              <span>{jury.etudiant.filiere.Nom_Fil}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {dateSoutenance.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>

          {jury.Heure_Soutenance && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{jury.Heure_Soutenance}</span>
            </div>
          )}

          {jury.Salle && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>Salle {jury.Salle}</span>
            </div>
          )}
        </div>

        {/* Composition du jury */}
        {jury.membres && jury.membres.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">Composition du jury</span>
            </div>
            <div className="space-y-1">
              {jury.membres.map((membre) => {
                const role = getRoleBadge(membre.Role);
                return (
                  <div key={membre.Id_Membre_Jury} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">
                      {membre.enseignant?.Prenom_Ens} {membre.enseignant?.Nom_Ens}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${role.color}`}>
                      {role.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Note finale */}
        {jury.Note_Finale && (
          <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-green-700" />
                <span className="text-sm font-semibold text-green-800">Jury terminé</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-800">{jury.Note_Finale}/20</p>
                {jury.Mention && (
                  <p className="text-xs text-green-700 font-medium mt-1">{jury.Mention}</p>
                )}
              </div>
            </div>
            {jury.Observations && (
              <div className="mt-2 pt-2 border-t border-green-200">
                <p className="text-xs text-gray-700">
                  <span className="font-medium">Observations :</span> {jury.Observations}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Statut */}
        {isPast && !jury.Note_Finale && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-center">
            <p className="text-xs text-green-800 font-medium">✅ Soutenance effectuée</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes participations aux jurys</h1>
          <p className="text-gray-500 mt-1">
            {jurys.length} jury{jurys.length > 1 ? 's' : ''} au total
          </p>
        </div>

        {/* Jurys à venir */}
        {jurysAVenir.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Jurys à venir ({jurysAVenir.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jurysAVenir.map(renderJuryCard)}
            </div>
          </div>
        )}

        {/* Jurys passés */}
        {jurysPasses.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Gavel className="w-5 h-5 text-gray-600" />
              Jurys passés ({jurysPasses.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jurysPasses.map(renderJuryCard)}
            </div>
          </div>
        )}

        {/* État vide */}
        {jurys.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <Gavel className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Aucun jury pour le moment</p>
              <p className="text-sm text-gray-400 mt-1">
                Les jurys seront créés par le chef de département en juin
              </p>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
