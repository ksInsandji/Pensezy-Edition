import React, { useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { User, Mail, Phone, Award, Building, Hash, Lock, Edit, Save, X } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    nom: user?.Nom_Etud || user?.Nom_Ens || user?.Nom || '',
    prenom: user?.Prenom_Etud || user?.Prenom_Ens || user?.Prenom || '',
    email: user?.Email_Etud || user?.Email_Ens || user?.Email || '',
    telephone: user?.Telephone_Etud || user?.Telephone_Ens || user?.Telephone || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleEditToggle = () => {
    if (isEditing) {
      // Annuler les modifications
      setFormData({
        nom: user?.Nom_Etud || user?.Nom_Ens || user?.Nom || '',
        prenom: user?.Prenom_Etud || user?.Prenom_Ens || user?.Prenom || '',
        email: user?.Email_Etud || user?.Email_Ens || user?.Email || '',
        telephone: user?.Telephone_Etud || user?.Telephone_Ens || user?.Telephone || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      // TODO: Implémenter la mise à jour du profil via API
      toast.info('Fonctionnalité de mise à jour du profil à implémenter');
      setIsEditing(false);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      await axios.post(ENDPOINTS.CHANGE_PASSWORD, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Mot de passe modifié avec succès');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Mon Profil</h1>
          <Button
            onClick={handleEditToggle}
            variant={isEditing ? 'secondary' : 'primary'}
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Annuler
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </>
            )}
          </Button>
        </div>

        {/* Informations personnelles */}
        <Card title="Informations personnelles">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Avatar */}
            <div className="md:col-span-2 flex items-center gap-4">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
                {(formData.nom || 'U')[0]}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{formData.prenom} {formData.nom}</h3>
                <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                Nom
              </label>
              <Input
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
              />
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                Prénom
              </label>
              <Input
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                Téléphone
              </label>
              <Input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
              />
            </div>

            {/* Informations spécifiques au rôle */}
            {user?.role === 'etudiant' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Hash className="w-4 h-4 inline mr-1" />
                  Matricule
                </label>
                <Input value={user?.Matricule_Etud} disabled className="bg-gray-50" />
              </div>
            )}

            {(user?.role === 'enseignant' || user?.role === 'chef') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Hash className="w-4 h-4 inline mr-1" />
                    Matricule
                  </label>
                  <Input value={user?.Matricule_Ens} disabled className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Award className="w-4 h-4 inline mr-1" />
                    Grade
                  </label>
                  <Input value={user?.Grade_Ens} disabled className="bg-gray-50" />
                </div>
                {user?.Specialite && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Building className="w-4 h-4 inline mr-1" />
                      Spécialité
                    </label>
                    <Input value={user?.Specialite} disabled className="bg-gray-50" />
                  </div>
                )}
              </>
            )}

            {isEditing && (
              <div className="md:col-span-2 flex gap-3 justify-end">
                <Button variant="secondary" onClick={handleEditToggle}>
                  Annuler
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Sécurité */}
        <Card title="Sécurité">
          {!isChangingPassword ? (
            <div>
              <p className="text-gray-600 mb-4">
                Modifiez votre mot de passe pour sécuriser votre compte
              </p>
              <Button onClick={() => setIsChangingPassword(true)}>
                <Lock className="w-4 h-4 mr-2" />
                Changer le mot de passe
              </Button>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe actuel *
                </label>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe * (min. 6 caractères)
                </label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le nouveau mot de passe *
                </label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  <Lock className="w-4 h-4 mr-2" />
                  Modifier le mot de passe
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Informations système */}
        <Card title="Informations système">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Type de compte :</span>
              <span className="font-medium capitalize">{user?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dernière connexion :</span>
              <span className="font-medium">Aujourd'hui</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Statut du compte :</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                Actif
              </span>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
