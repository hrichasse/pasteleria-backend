/**
 * Script para poblar la base de datos con productos reales de la pastelería
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const { config } = require('./src/config/env');

const products = [
  // Tortas Cuadradas
  {
    name: 'Torta Cuadrada de Chocolate',
    description: 'Deliciosa torta cuadrada con intenso sabor a chocolate',
    price: 45.00,
    category: 'tortas-cuadradas',
    stock: 100,
    isActive: true
  },
  {
    name: 'Torta Cuadrada de Frutas',
    description: 'Torta cuadrada decorada con frutas frescas de temporada',
    price: 50.00,
    category: 'tortas-cuadradas',
    stock: 100,
    isActive: true
  },
  
  // Tortas Circulares
  {
    name: 'Torta Circular de Vainilla',
    description: 'Clásica torta circular con suave sabor a vainilla',
    price: 40.00,
    category: 'tortas-circulares',
    stock: 80,
    isActive: true
  },
  {
    name: 'Torta Circular de Manjar',
    description: 'Torta circular rellena con delicioso manjar',
    price: 42.00,
    category: 'tortas-circulares',
    stock: 80,
    isActive: true
  },
  
  // Postres Individuales
  {
    name: 'Mousse de Chocolate',
    description: 'Cremoso mousse de chocolate en presentación individual',
    price: 5.00,
    category: 'postres-individuales',
    stock: 200,
    isActive: true
  },
  {
    name: 'Tiramisú Clásico',
    description: 'Tradicional tiramisú italiano con café y mascarpone',
    price: 5.50,
    category: 'postres-individuales',
    stock: 180,
    isActive: true
  },
  
  // Sin Azúcar
  {
    name: 'Torta Sin Azúcar de Naranja',
    description: 'Torta con sabor a naranja endulzada naturalmente',
    price: 48.00,
    category: 'sin-azucar',
    stock: 50,
    isActive: true
  },
  {
    name: 'Cheesecake Sin Azúcar',
    description: 'Suave cheesecake sin azúcar añadida',
    price: 47.00,
    category: 'sin-azucar',
    stock: 50,
    isActive: true
  },
  
  // Tradicional
  {
    name: 'Empanada de Manzana',
    description: 'Crujiente empanada rellena de manzana caramelizada',
    price: 3.00,
    category: 'tradicional',
    stock: 300,
    isActive: true
  },
  {
    name: 'Tarta de Santiago',
    description: 'Tradicional tarta española de almendras',
    price: 6.00,
    category: 'tradicional',
    stock: 150,
    isActive: true
  },
  
  // Sin Gluten
  {
    name: 'Brownie Sin Gluten',
    description: 'Rico brownie de chocolate apto para celíacos',
    price: 4.00,
    category: 'sin-gluten',
    stock: 250,
    isActive: true
  },
  {
    name: 'Pan Sin Gluten',
    description: 'Pan fresco elaborado sin gluten',
    price: 3.50,
    category: 'sin-gluten',
    stock: 180,
    isActive: true
  },
  
  // Vegana
  {
    name: 'Torta Vegana de Chocolate',
    description: 'Torta de chocolate 100% vegetal sin productos animales',
    price: 50.00,
    category: 'vegana',
    stock: 60,
    isActive: true
  },
  {
    name: 'Galletas Veganas de Avena',
    description: 'Crujientes galletas veganas con avena integral',
    price: 4.50,
    category: 'vegana',
    stock: 400,
    isActive: true
  },
  
  // Especiales
  {
    name: 'Torta Especial de Cumpleaños',
    description: 'Torta personalizada para celebraciones de cumpleaños',
    price: 55.00,
    category: 'especiales',
    stock: 40,
    isActive: true
  },
  {
    name: 'Torta Especial de Boda',
    description: 'Elegante torta diseñada especialmente para bodas',
    price: 60.00,
    category: 'especiales',
    stock: 25,
    isActive: true
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Conectado a MongoDB');

    // Verificar productos existentes
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      console.log(`\n⚠️  Ya existen ${existingCount} productos en la base de datos`);
      console.log('Opciones:');
      console.log('  1. Se agregarán los nuevos productos SIN eliminar los existentes');
      console.log('  2. Para reemplazar todos, elimina manualmente en MongoDB Atlas\n');
    }

    // Insertar productos
    const inserted = await Product.insertMany(products);
    console.log(`✅ ${inserted.length} productos insertados correctamente\n`);

    // Mostrar resumen por categoría
    console.log('📊 Resumen por categoría:');
    const categories = await Product.aggregate([
      { $group: { 
          _id: '$category', 
          count: { $sum: 1 }, 
          totalStock: { $sum: '$stock' },
          avgPrice: { $avg: '$price' }
        } 
      },
      { $sort: { _id: 1 } }
    ]);
    
    categories.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} productos | ${cat.totalStock} unidades | Precio promedio: $${cat.avgPrice.toFixed(2)}`);
    });

    const totalProducts = await Product.countDocuments();
    const stats = await Product.aggregate([
      { $group: { 
          _id: null, 
          totalStock: { $sum: '$stock' },
          totalValue: { $sum: { $multiply: ['$stock', '$price'] } }
        } 
      }
    ]);

    console.log(`\n📦 Total general:`);
    console.log(`   Productos: ${totalProducts}`);
    console.log(`   Unidades en stock: ${stats[0]?.totalStock || 0}`);
    console.log(`   Valor de inventario: $${(stats[0]?.totalValue || 0).toFixed(2)}`);
    console.log('\n✅ Base de datos poblada exitosamente');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 11000) {
      console.error('⚠️  Algunos productos ya existen (nombre duplicado)');
    }
    process.exit(1);
  }
}

seedProducts();
