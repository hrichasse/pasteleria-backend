/**
 * Modelo de Producto
 * @module models/Product
 */
const mongoose = require('mongoose');

const PRODUCT_CATEGORIES = [
  'tortas-cuadradas',
  'tortas-circulares',
  'postres-individuales',
  'sin-azucar',
  'tradicional',
  'sin-gluten',
  'vegana',
  'especiales'
];

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, enum: PRODUCT_CATEGORIES },
    image: { type: String, trim: true },
    stock: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

ProductSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Product', ProductSchema);
module.exports.PRODUCT_CATEGORIES = PRODUCT_CATEGORIES;
