import React, { useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';
import { User, Lock, Mail, Phone, Save } from 'lucide-react';

export default function EtudiantSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    nom: user?.Nom_Etud || '',
    prenom: user?.Prenom_Etud || '',
    email: user?.Email_Etud || '',
    telephone: user?.Telephone_Etud || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(ENDPOINTS.UPDATE_PROFILE, profileData);
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);
    try {
      await axios.put(ENDPOINTS.UPDATE_PASSWORD, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Mot de passe mis à jour avec succès');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres du compte</h1>

        {/* Onglets */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Profil
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'password'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Lock className="w-4 h-4 inline mr-2" />
            Mot de passe
          </button>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'profile' && (
          <Card title="Informations personnelles">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Informations non modifiables */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-gray-900 mb-3">Informations académiques (non modifiables)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Matricule</label>
                    <p className="text-gray-900">{user?.Matricule_Etud}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                    <p className="text-gray-900">{user?.Niveau}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filière</label>
                    <p className="text-gray-900">{user?.filiere?.Nom_Fil || 'Non définie'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <p className="text-gray-900">{user?.Statut_Etudiant}</p>
                  </div>
                </div>
              </div>

              {/* Informations modifiables */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Informations personnelles</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nom"
                    value={profileData.nom}
                    onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                    required
                  />
                  <Input
                    label="Prénom"
                    value={profileData.prenom}
                    onChange={(e) => setProfileData({ ...profileData, prenom: e.target.value })}
                    required
                  />
                </div>

                <Input
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  icon={Mail}
                  required
                />

                <Input
                  label="Téléphone"
                  type="tel"
                  value={profileData.telephone}
                  onChange={(e) => setProfileData({ ...profileData, telephone: e.target.value })}
                  icon={Phone}
                  placeholder="+237 6XX XX XX XX"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" loading={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </Card>
        )}

        {activeTab === 'password' && (
          <Card title="Changer le mot de passe">
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  Pour des raisons de sécurité, assurez-vous que votre nouveau mot de passe contient
                  au moins 8 caractères, incluant des lettres majuscules, minuscules, des chiffres et
                  des caractères spéciaux.
                </p>
              </div>

              <Input
                label="Mot de passe actuel"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
              />

              <Input
                label="Nouveau mot de passe"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
              />

              <Input
                label="Confirmer le nouveau mot de passe"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
              />

              {passwordData.newPassword && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Force du mot de passe :</p>
                  <div className="space-y-1">
                    <div className={`text-xs ${passwordData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                      ✓ Au moins 8 caractères
                    </div>
                    <div className={`text-xs ${/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                      ✓ Au moins une majuscule
                    </div>
                    <div className={`text-xs ${/[a-z]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                      ✓ Au moins une minuscule
                    </div>
                    <div className={`text-xs ${/[0-9]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                      ✓ Au moins un chiffre
                    </div>
                    <div className={`text-xs ${/[^A-Za-z0-9]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                      ✓ Au moins un caractère spécial
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" loading={loading}>
                  <Lock className="w-4 h-4 mr-2" />
                  Changer le mot de passe
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </Layout>
  );
}
