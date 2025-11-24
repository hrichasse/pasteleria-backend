/**
 * Validadores Joi y middleware de validación.
 * @module utils/validators
 */
const Joi = require('joi');
const { PRODUCT_CATEGORIES } = require('../models/Product');
const { ORDER_STATUS, PAYMENT_METHODS } = require('../models/Order');

// Schemas ---------------------------------------------------------------
const registerValidator = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({ 'any.only': 'Las contraseñas no coinciden' }),
  phone: Joi.string().optional(),
  address: Joi.object({
    street: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    zipCode: Joi.string().optional(),
    country: Joi.string().optional()
  }).optional()
});

const loginValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const createProductValidator = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  price: Joi.number().min(0).required(),
  category: Joi.string().valid(...PRODUCT_CATEGORIES).required(),
  image: Joi.string().uri().allow('').optional(),
  stock: Joi.number().min(0).optional(),
  isActive: Joi.boolean().optional()
});

const updateProductValidator = createProductValidator.fork(
  ['name', 'price', 'category'],
  (schema) => schema.optional()
);

const createOrderValidator = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        name: Joi.string().optional(), // Ignorado, se recalcula
        quantity: Joi.number().min(1).required(),
        price: Joi.number().min(0).optional() // Ignorado, se recalcula
      })
    )
    .min(1)
    .required(),
  paymentMethod: Joi.string().valid(...PAYMENT_METHODS).optional(),
  deliveryAddress: Joi.object({
    street: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    zipCode: Joi.string().optional(),
    phone: Joi.string().optional()
  }).optional(),
  notes: Joi.string().max(500).optional(),
  status: Joi.string().valid(...ORDER_STATUS).optional() // sólo admin en actualización
});

const updateOrderStatusValidator = Joi.object({
  status: Joi.string().valid(...ORDER_STATUS).required()
});

/**
 * Middleware genérico para validar req.body contra un schema Joi.
 * @param {Joi.Schema} schema - Schema de validación.
 * @returns {Function} Middleware Express.
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return next({
        name: 'ValidationError',
        message: 'Datos de entrada inválidos',
        details: error.details.map((d) => ({ message: d.message, path: d.path })),
        statusCode: 400
      });
    }
    req.body = value;
    next();
  };
}

module.exports = {
  registerValidator,
  loginValidator,
  createProductValidator,
  updateProductValidator,
  createOrderValidator,
  updateOrderStatusValidator,
  validate
};
