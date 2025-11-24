/**
 * Script para crear o actualizar un usuario a rol admin
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const { config } = require('./src/config/env');

async function createAdmin() {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Conectado a MongoDB');

    // Actualizar usuario existente a admin
    const email = 'juan@example.com';
    const user = await User.findOneAndUpdate(
      { email },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log(`✅ Usuario ${email} actualizado a ADMIN`);
      console.log('Usuario:', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      console.log(`❌ Usuario ${email} no encontrado`);
    }

    await mongoose.connection.close();
    console.log('✅ Conexión cerrada');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
