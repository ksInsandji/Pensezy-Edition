import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Lock, User, Eye, EyeOff, Mail } from 'lucide-react';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Ce champ est obligatoire'),
  password: z.string().min(1, 'Le mot de passe est obligatoire')
});

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  // Détecter si l'utilisateur tape un email ou un matricule
  const identifierValue = watch('identifier', '');
  const isEmail = identifierValue.includes('@');

  const onSubmit = async (data) => {
    // Empêcher les soumissions multiples
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      const user = await login(data.identifier, data.password);

      // Rediriger selon le rôle
      if (user.role === 'etudiant') {
        navigate('/etudiant/dashboard');
      } else if (user.role === 'enseignant') {
        navigate('/enseignant/dashboard');
      } else if (user.role === 'chef') {
        navigate('/chef/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      }
    } catch (error) {
      // L'erreur est déjà gérée par le contexte
      setLoading(false); // Réactiver le bouton en cas d'erreur
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Encadrements</h1>
            <p className="text-gray-600 mt-2">École Normale Supérieure de Yaoundé</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              {isEmail ? (
                <Mail className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
              ) : (
                <User className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
              )}
              <Input
                {...register('identifier')}
                label={isEmail ? "Email" : "Matricule ou Email"}
                placeholder={isEmail ? "exemple@ens.cm" : "Matricule étudiant ou email"}
                className="pl-10"
                error={errors.identifier?.message}
              />
              <p className="text-xs text-gray-500 mt-1">
                {isEmail ? (
                  <>
                    <span className="font-medium">Enseignant/Chef/Admin</span> : Utilisez votre email
                  </>
                ) : (
                  <>
                    <span className="font-medium">Étudiant</span> : Matricule (ex: 21A001ENS) •{' '}
                    <span className="font-medium">Autres</span> : Email
                  </>
                )}
              </p>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Mot de passe"
                placeholder="Entrez votre mot de passe"
                className="pl-10 pr-10"
                error={errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Se connecter
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Info supplémentaire */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>ℹ️ Connexion :</strong>
            </p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1">
              <li>• <strong>Étudiants</strong> : Connectez-vous avec votre matricule</li>
              <li>• <strong>Enseignants/Chefs/Admin</strong> : Connectez-vous avec votre email</li>
            </ul>
          </div>
        </div>

        <p className="text-center text-white mt-6 text-sm">
          © 2025 ENS Yaoundé - Tous droits réservés
        </p>
      </div>
    </div>
  );
}
