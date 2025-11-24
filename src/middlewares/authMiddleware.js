/**
 * Middlewares de autenticación y autorización.
 * @module middlewares/authMiddleware
 */
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Autentica al usuario usando el header Authorization: Bearer <token>.
 * @returns {Function} Middleware Express.
 */
function authenticate() {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || '';
      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return next({ statusCode: 401, message: 'Token de autenticación faltante o mal formado' });
      }
      const token = parts[1];
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId);
      if (!user) {
        return next({ statusCode: 401, message: 'Usuario no encontrado' });
      }
      if (!user.isActive) {
        return next({ statusCode: 403, message: 'Usuario inactivo' });
      }
      req.user = user; // attach
      next();
    } catch (err) {
      return next(err);
    }
  };
}

/**
 * Requiere que el rol del usuario esté incluido en los roles permitidos.
 * @param {...string} roles - Roles permitidos.
 * @returns {Function} Middleware Express.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next({ statusCode: 401, message: 'No autenticado' });
    }
    if (!roles.includes(req.user.role)) {
      return next({ statusCode: 403, message: 'Permisos insuficientes' });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
