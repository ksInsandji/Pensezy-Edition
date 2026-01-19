const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Augmenté de 5 à 10 tentatives pour être moins restrictif
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Utiliser l'IP + l'identifiant pour un tracking plus précis
  keyGenerator: (req) => {
    // Si l'utilisateur fournit un identifiant, on combine IP + identifiant
    // Sinon, on utilise uniquement l'IP
    const identifier = req.body?.identifier || '';
    return `${req.ip}-${identifier}`;
  },
  // Skip le rate limiting en développement pour faciliter les tests
  skip: (req) => {
    return process.env.NODE_ENV === 'development' && req.ip === '::1'; // localhost IPv6
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requêtes par 15 minutes (~33/min, suffisant pour usage normal)
  message: {
    success: false,
    message: 'Trop de requêtes. Veuillez patienter.'
  },
  standardHeaders: true, // Renvoie les headers RateLimit-*
  legacyHeaders: false,
  // Skip rate limiting pour certaines IP en développement
  skip: (req) => {
    // En développement, on peut être plus permissif
    if (process.env.NODE_ENV === 'development') {
      return false; // On applique quand même mais avec limite élevée
    }
    return false;
  }
});

module.exports = { loginLimiter, apiLimiter };