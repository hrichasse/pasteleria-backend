const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { validate, registerValidator, loginValidator } = require('../utils/validators');
const { authenticate } = require('../middlewares/authMiddleware');

// Registro
router.post('/register', validate(registerValidator), register);
// Login
router.post('/login', validate(loginValidator), login);
// Perfil
router.get('/profile', authenticate(), getProfile);
router.put('/profile', authenticate(), updateProfile);

module.exports = router;
