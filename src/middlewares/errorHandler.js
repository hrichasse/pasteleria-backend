/**
 * Middleware centralizado de manejo de errores.
 * @module middlewares/errorHandler
 */
const { config } = require('../config/env');

/**
 * Mapea errores conocidos a status codes y mensajes.
 * @param {Error|Object} err
 * @returns {{statusCode:number,message:string,details?:any}}
 */
function mapError(err) {
  // Si ya tiene statusCode (errores custom) respetarlo.
  if (err.statusCode) {
    return { statusCode: err.statusCode, message: err.message || 'Error' , details: err.details};
  }
  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    return { statusCode: 400, message: err.message || 'Error de validación', details: err.errors ? Object.values(err.errors).map(e => e.message) : err.details };
  }
  // Mongoose CastError
  if (err.name === 'CastError') {
    return { statusCode: 400, message: 'ID inválido', details: { path: err.path, value: err.value } };
  }
  // Duplicate key (Mongo)
  if (err.code === 11000) {
    return { statusCode: 409, message: 'Registro duplicado', details: err.keyValue };
  }
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return { statusCode: 401, message: 'Token inválido' };
  }
  if (err.name === 'TokenExpiredError') {
    return { statusCode: 401, message: 'Token expirado' };
  }
  return { statusCode: 500, message: 'Error interno del servidor' };
}

/**
 * Middleware Express para manejar errores.
 * Formato: {message, statusCode, details?, stack?}
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const mapped = mapError(err);
  const response = {
    message: mapped.message,
    statusCode: mapped.statusCode
  };
  if (mapped.details) response.details = mapped.details;
  if (config.nodeEnv === 'development' && err.stack) response.stack = err.stack;
  res.status(mapped.statusCode).json(response);
}

module.exports = { errorHandler };
