/**
 * Utilidades para manejo de JWT.
 * @module utils/jwt
 */
const jwt = require('jsonwebtoken');
const { config } = require('../config/env');

/**
 * Genera un token JWT.
 * @param {object} payload - Datos a incluir (ej: {userId, role}).
 * @param {string} [expiresIn=config.jwtExpiresIn] - Tiempo de expiración.
 * @returns {string} Token firmado.
 */
function generateToken(payload, expiresIn = config.jwtExpiresIn) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
}

/**
 * Verifica un token JWT devolviendo el payload decodificado.
 * @param {string} token - Token JWT.
 * @returns {object} Payload decodificado.
 * @throws {Error} Si el token es inválido o expiró.
 */
function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

module.exports = { generateToken, verifyToken };
