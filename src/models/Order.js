/**
 * Modelo de Orden
 * @module models/Order
 */
const mongoose = require('mongoose');

const ORDER_STATUS = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'delivered',
  'cancelled'
];

const PAYMENT_METHODS = ['efectivo', 'tarjeta', 'transferencia'];

const ItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const DeliveryAddressSchema = {
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  zipCode: { type: String, trim: true },
  phone: { type: String, trim: true }
};

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [ItemSchema], validate: [(val) => val.length > 0, 'La orden debe tener al menos 1 item'] },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUS, default: 'pending' },
    paymentMethod: { type: String, enum: PAYMENT_METHODS },
    deliveryAddress: DeliveryAddressSchema,
    notes: { type: String, maxlength: 500, trim: true }
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);
module.exports.ORDER_STATUS = ORDER_STATUS;
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;
