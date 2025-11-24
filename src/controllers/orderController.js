/**
 * Controlador de Órdenes
 * @module controllers/orderController
 */
const Order = require('../models/Order');
const Product = require('../models/Product');

function respond(message, statusCode, data) {
  return { message, statusCode, data };
}

/** Crear orden: reduce stock y calcula total */
async function createOrder(req, res, next) {
  try {
    const { items, paymentMethod, deliveryAddress, notes } = req.body;
    const userId = req.user._id;
    let total = 0;
    const processedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return next({ statusCode: 400, message: `Producto inválido o inactivo (${item.productId})` });
      }
      if (product.stock < item.quantity) {
        return next({ statusCode: 400, message: `Stock insuficiente para ${product.name}` });
      }
      product.stock -= item.quantity;
      await product.save();
      const lineTotal = product.price * item.quantity;
      total += lineTotal;
      processedItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price
      });
    }
    const order = await Order.create({
      userId,
      items: processedItems,
      total,
      paymentMethod,
      deliveryAddress,
      notes
    });
    await order.populate('userId');
    return res.status(201).json(respond('Orden creada', 201, { order }));
  } catch (err) {
    next(err);
  }
}

/** Obtener órdenes (admin ve todas, cliente solo las suyas) */
async function getOrders(req, res, next) {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = {};
    if (status) query.status = status;
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('userId'),
      Order.countDocuments(query)
    ]);
    return res.json(
      respond('Listado de órdenes', 200, {
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

/** Actualizar status de orden (solo admin) */
async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return next({ statusCode: 404, message: 'Orden no encontrada' });
    order.status = status;
    await order.save();
    await order.populate('userId');
    return res.json(respond('Estado de orden actualizado', 200, { order }));
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, getOrders, updateStatus };
