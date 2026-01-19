import React, { useState } from 'react';
import { Eye, EyeOff, RefreshCw, Copy, Check } from 'lucide-react';

/**
 * Composant pour générer ou saisir un mot de passe
 * @param {Object} props
 * @param {string} props.value - Valeur actuelle du mot de passe
 * @param {Function} props.onChange - Callback appelé lors du changement
 * @param {string} props.label - Label du champ
 * @param {boolean} props.required - Champ requis
 */
export const PasswordGenerator = ({ value, onChange, label = "Mot de passe", required = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  /**
   * Génère un mot de passe aléatoire simple
   */
  const generatePassword = () => {
    const words = [
      'Chat', 'Lion', 'Aigle', 'Ours', 'Loup', 'Tigre', 'Panda', 'Zebre',
      'Dauphin', 'Requin', 'Renard', 'Hibou', 'Faucon', 'Lynx', 'Phoque'
    ];

    const word1 = words[Math.floor(Math.random() * words.length)];
    const number = Math.floor(Math.random() * 90) + 10;
    const word2 = words[Math.floor(Math.random() * words.length)];

    const newPassword = `${word1}${number}${word2}`;
    onChange(newPassword);
  };

  /**
   * Copie le mot de passe dans le presse-papier
   */
  const copyToClipboard = async () => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur copie:', error);
    }
  };

  /**
   * Évalue la force du mot de passe
   */
  const getPasswordStrength = () => {
    if (!value) return { level: 0, label: '', color: '' };

    let score = 0;

    if (value.length >= 6) score++;
    if (value.length >= 8) score++;
    if (value.length >= 12) score++;
    if (/[a-z]/.test(value)) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;

    if (score <= 2) return { level: score, label: 'Faible', color: 'bg-red-500' };
    if (score <= 4) return { level: score, label: 'Moyen', color: 'bg-yellow-500' };
    return { level: score, label: 'Fort', color: 'bg-green-500' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="flex gap-2">
        {/* Input mot de passe */}
        <div className="flex-1 relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-20"
            placeholder="Entrez ou générez un mot de passe"
            required={required}
          />

          {/* Boutons dans l'input */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            {/* Toggle visibilité */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title={showPassword ? 'Masquer' : 'Afficher'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* Copier */}
            {value && (
              <button
                type="button"
                onClick={copyToClipboard}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Copier"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Bouton générer */}
        <button
          type="button"
          onClick={generatePassword}
          className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors flex items-center gap-2 font-medium"
          title="Générer un mot de passe"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Générer</span>
        </button>
      </div>

      {/* Indicateur de force */}
      {value && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < strength.level ? strength.color : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className={`text-xs font-medium ${
            strength.label === 'Faible' ? 'text-red-600' :
            strength.label === 'Moyen' ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            Force: {strength.label}
          </p>
        </div>
      )}

      {/* Aide */}
      <p className="text-xs text-gray-500">
        💡 Cliquez sur "Générer" pour créer un mot de passe mémorisable (ex: Chat42Lion)
      </p>
    </div>
  );
};
