/**
 * Middleware: Contrôle d'accès Alumni
 *
 * Protège les endpoints contre les modifications par des étudiants
 * en mode alumni (lecture seule uniquement)
 */

const anneeAcademiqueService = require('../services/anneeAcademiqueService');

/**
 * Middleware de vérification accès alumni
 *
 * @param {Array<string>} allowedActions - Actions autorisées ['read', 'write']
 * @returns {Function} Middleware Express
 *
 * Usage:
 * router.post('/theme', authMiddleware, checkAlumniAccess(['write']), controller)
 * router.get('/theme', authMiddleware, checkAlumniAccess(['read']), controller)
 */
const checkAlumniAccess = (allowedActions = ['read']) => {
  return async (req, res, next) => {
    try {
      // Vérifier uniquement pour les étudiants
      if (req.user && req.user.role === 'etudiant') {
        const matriculeEtud = req.user.id; // Matricule étudiant depuis JWT

        // Vérifier le statut alumni
        const acces = await anneeAcademiqueService.verifierAccesAlumni(matriculeEtud);

        // Si étudiant en mode alumni
        if (acces.modeAlumni) {
          // Si l'action requiert 'write' mais alumni ne peut pas modifier
          if (allowedActions.includes('write') && !acces.canModify) {
            return res.status(403).json({
              success: false,
              message: 'Accès refusé: Votre compte est en mode alumni (lecture seule)',
              error: 'ALUMNI_READ_ONLY',
              details: {
                mode: 'alumni',
                anneeGraduation: acces.anneeGraduation,
                canModify: false,
                canView: true
              }
            });
          }

          // Ajouter flag alumni dans la requête pour usage ultérieur
          req.alumniMode = true;
          req.anneeGraduation = acces.anneeGraduation;
        } else {
          req.alumniMode = false;
        }
      }

      // Continuer vers le prochain middleware/controller
      next();
    } catch (error) {
      console.error('❌ Erreur checkAlumniAccess:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification du statut alumni',
        error: error.message
      });
    }
  };
};

/**
 * Middleware strict: bloque TOUTE tentative de modification par un alumni
 * À utiliser sur les routes critiques (POST, PUT, DELETE)
 */
const blockAlumniWrite = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'etudiant') {
      const matriculeEtud = req.user.id;
      const acces = await anneeAcademiqueService.verifierAccesAlumni(matriculeEtud);

      if (acces.modeAlumni) {
        return res.status(403).json({
          success: false,
          message: 'Action interdite: Les alumni ne peuvent pas effectuer de modifications',
          error: 'ALUMNI_WRITE_FORBIDDEN',
          details: {
            mode: 'alumni',
            anneeGraduation: acces.anneeGraduation
          }
        });
      }
    }

    next();
  } catch (error) {
    console.error('❌ Erreur blockAlumniWrite:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du statut alumni',
      error: error.message
    });
  }
};

/**
 * Middleware pour enrichir req avec les infos alumni (sans bloquer)
 * Utile pour la lecture où on veut juste afficher un badge "Alumni"
 */
const enrichAlumniInfo = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'etudiant') {
      const matriculeEtud = req.user.id;
      const acces = await anneeAcademiqueService.verifierAccesAlumni(matriculeEtud);

      req.alumniMode = acces.modeAlumni;
      req.alumniInfo = {
        modeAlumni: acces.modeAlumni,
        anneeGraduation: acces.anneeGraduation,
        canModify: acces.canModify,
        canView: acces.canView
      };
    } else {
      req.alumniMode = false;
      req.alumniInfo = null;
    }

    next();
  } catch (error) {
    console.error('⚠️  Erreur enrichAlumniInfo (non bloquant):', error);
    // Ne pas bloquer la requête, juste logger l'erreur
    req.alumniMode = false;
    req.alumniInfo = null;
    next();
  }
};

module.exports = {
  checkAlumniAccess,
  blockAlumniWrite,
  enrichAlumniInfo
};
