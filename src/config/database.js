/**
 * Configuración y conexión a MongoDB usando mongoose.
 * @module config/database
 */
const mongoose = require('mongoose');
const { config } = require('./env');

mongoose.set('strictQuery', true);

/**
 * Conecta a MongoDB.
 * @returns {Promise<mongoose.Connection>} Conexión de mongoose.
 */
async function connectDB() {
  try {
    if (!config.mongodbUri) {
      throw new Error('MONGODB_URI no definido en las variables de entorno');
    }
    await mongoose.connect(config.mongodbUri, {
      autoIndex: true,
      maxPoolSize: 10
    });
    console.log('\n[MongoDB] Conectado correctamente');
    return mongoose.connection;
  } catch (error) {
    console.error('[MongoDB] Error de conexión:', error.message);
    throw error;
  }
}

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Error de runtime:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Conexión desconectada');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('\n[MongoDB] Conexión cerrada por SIGINT');
  process.exit(0);
});

module.exports = { connectDB };
