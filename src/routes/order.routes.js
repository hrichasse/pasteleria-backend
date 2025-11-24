const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateStatus } = require('../controllers/orderController');
const { validate, createOrderValidator, updateOrderStatusValidator } = require('../utils/validators');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

// Crear orden (cliente o admin)
router.post('/', authenticate(), validate(createOrderValidator), createOrder);
// Listar órdenes (admin todas, cliente propias)
router.get('/', authenticate(), getOrders);
// Actualizar estado (admin)
router.put('/:id/status', authenticate(), requireRole('admin'), validate(updateOrderStatusValidator), updateStatus);

module.exports = router;
