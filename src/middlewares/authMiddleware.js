const { verifyToken } = require('../utils/jwtHelper');
const { UnauthorizedError } = require('../utils/errorHelper');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token manquant. Veuillez vous connecter.');
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedError(error.message));
  }
}

module.exports = authMiddleware;