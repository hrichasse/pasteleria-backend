/**
 * Controlador de Autenticación
 * @module controllers/authController
 */
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

/** Formatea respuesta estándar */
function ok(message, statusCode, data) {
  return { message, statusCode, data };
}

/**
 * Registro de usuario.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function register(req, res, next) {
  try {
    const { email } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return next({ statusCode: 409, message: 'El email ya está registrado' });
    }
    // quitar confirmPassword antes de crear documento
    const { confirmPassword, ...cleanBody } = req.body;
    const user = await User.create(cleanBody);
    const token = generateToken({ userId: user._id, role: user.role });
    return res.status(201).json(ok('Usuario registrado correctamente', 201, { user, token }));
  } catch (err) {
    next(err);
  }
}

/**
 * Login de usuario.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next({ statusCode: 401, message: 'Credenciales inválidas' });
    if (!user.isActive) return next({ statusCode: 403, message: 'Usuario inactivo' });
    const match = await user.comparePassword(password);
    if (!match) return next({ statusCode: 401, message: 'Credenciales inválidas' });
    const token = generateToken({ userId: user._id, role: user.role });
    return res.json(ok('Login exitoso', 200, { user, token }));
  } catch (err) {
    next(err);
  }
}

/** Obtiene perfil del usuario autenticado. */
async function getProfile(req, res, next) {
  try {
    return res.json(ok('Perfil obtenido', 200, { user: req.user }));
  } catch (err) {
    next(err);
  }
}

/** Actualiza perfil (no password salvo que se envíe). */
async function updateProfile(req, res, next) {
  try {
    const updates = req.body;
    // Evitar cambiar role directamente si no es admin
    if (updates.role && req.user.role !== 'admin') delete updates.role;
    const user = await User.findById(req.user._id);
    if (!user) return next({ statusCode: 404, message: 'Usuario no encontrado' });
    Object.assign(user, updates);
    await user.save();
    return res.json(ok('Perfil actualizado', 200, { user }));
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getProfile, updateProfile };
