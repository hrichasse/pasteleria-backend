const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { validate, createProductValidator, updateProductValidator } = require('../utils/validators');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

// Listado público
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin
router.post('/', authenticate(), requireRole('admin'), validate(createProductValidator), createProduct);
router.put('/:id', authenticate(), requireRole('admin'), validate(updateProductValidator), updateProduct);
router.delete('/:id', authenticate(), requireRole('admin'), deleteProduct);

module.exports = router;
