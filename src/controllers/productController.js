/**
 * Controlador de Productos
 * @module controllers/productController
 */
const Product = require('../models/Product');

function respond(message, statusCode, data) {
  return { message, statusCode, data };
}

/** Crear producto */
async function createProduct(req, res, next) {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json(respond('Producto creado', 201, { product }));
  } catch (err) {
    next(err);
  }
}

/** Listar productos con paginación y filtros */
async function getProducts(req, res, next) {
  try {
    const { page = 1, limit = 10, category, search, active } = req.query;
    const query = {};
    if (category) query.category = category;
    if (active !== undefined) query.isActive = active === 'true';
    if (search) query.name = { $regex: search, $options: 'i' };
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(query)
    ]);
    return res.json(
      respond('Listado de productos', 200, {
        items,
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      })
    );
  } catch (err) {
    next(err);
  }
}

/** Obtener producto por ID */
async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next({ statusCode: 404, message: 'Producto no encontrado' });
    return res.json(respond('Producto obtenido', 200, { product }));
  } catch (err) {
    next(err);
  }
}

/** Actualizar producto */
async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return next({ statusCode: 404, message: 'Producto no encontrado' });
    return res.json(respond('Producto actualizado', 200, { product }));
  } catch (err) {
    next(err);
  }
}

/** Eliminar (soft deactivate) producto */
async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next({ statusCode: 404, message: 'Producto no encontrado' });
    product.isActive = false;
    await product.save();
    return res.json(respond('Producto desactivado', 200, { product }));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
