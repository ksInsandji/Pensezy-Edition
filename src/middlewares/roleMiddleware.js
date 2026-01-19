const { ForbiddenError, UnauthorizedError } = require('../utils/errorHelper');

function checkRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Non authentifié'));
    }

    // allowedRoles peut être un tableau ou un seul rôle
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Accès refusé. Privilèges insuffisants.'));
    }

    next();
  };
}

module.exports = checkRole;