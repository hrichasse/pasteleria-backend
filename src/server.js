/**
 * Servidor principal Express para Pastelería.
 */
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { config } = require('./config/env');
const { connectDB } = require('./config/database');
const { errorHandler } = require('./middlewares/errorHandler');

// Rutas
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();

// Seguridad y utilidades --------------------------------------------------
app.use(helmet());
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check ------------------------------------------------------------
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servicio operativo', timestamp: new Date().toISOString() });
});

// Montaje de rutas --------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// 404 ---------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ message: 'Recurso no encontrado', statusCode: 404 });
});

// Manejo de errores -------------------------------------------------------
app.use(errorHandler);

// Inicio ------------------------------------------------------------------
connectDB()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`[Servidor] Escuchando en puerto ${config.port}`);
    });
  })
  .catch((err) => {
    console.error('[Servidor] No se pudo iniciar:', err.message);
    process.exit(1);
  });

module.exports = app;
