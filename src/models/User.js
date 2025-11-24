/**
 * Modelo de Usuario
 * @module models/User
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ADDRESS_SCHEMA = {
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  zipCode: { type: String, trim: true },
  country: { type: String, trim: true }
};

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /.+@.+\..+/
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['admin', 'cliente'],
      default: 'cliente'
    },
    phone: { type: String, trim: true },
    address: ADDRESS_SCHEMA,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

/**
 * Pre-save para hashear password si fue modificado.
 */
UserSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Compara un password candidato con el hash almacenado.
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * toJSON para ocultar el password en las respuestas.
 */
UserSchema.methods.toJSON = function () {
  const obj = this.toObject({ versionKey: false });
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
