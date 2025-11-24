/**
 * Carga de variables de entorno y exportación centralizada
 * @module config/env
 */
require('dotenv').config();

/**
 * Objeto de configuración derivado de process.env
 */
const config = {
  port: process.env.PORT || 3001,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5174',
  nodeEnv: process.env.NODE_ENV || 'development'
};

module.exports = { config };
