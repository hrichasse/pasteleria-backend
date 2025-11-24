/**
 * Script de prueba de la API
 */
const http = require('http');

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path,
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {}
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testAPI() {
  console.log('\n=== PRUEBAS DE API ===\n');
  
  try {
    // 1. Health check
    console.log('1. Health Check');
    const health = await request('GET', '/health');
    console.log('   Status:', health.status);
    console.log('   Response:', JSON.stringify(health.data, null, 2));
    
    // 2. Registro de usuario
    console.log('\n2. Registro de Usuario');
    const registerData = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'secreto123'
    };
    const register = await request('POST', '/api/auth/register', registerData);
    console.log('   Status:', register.status);
    console.log('   Message:', register.data.message);
    const userToken = register.data.data?.token;
    console.log('   Token:', userToken?.substring(0, 20) + '...');
    
    // 3. Login
    console.log('\n3. Login');
    const loginData = { email: 'juan@example.com', password: 'secreto123' };
    const login = await request('POST', '/api/auth/login', loginData);
    console.log('   Status:', login.status);
    console.log('   Message:', login.data.message);
    
    // 4. Crear producto (sin token - debe fallar)
    console.log('\n4. Crear Producto sin autenticación (debe fallar)');
    const productData = {
      name: 'Torta de Chocolate',
      price: 35.50,
      category: 'tradicional',
      stock: 10
    };
    const noAuthProduct = await request('POST', '/api/products', productData);
    console.log('   Status:', noAuthProduct.status);
    console.log('   Message:', noAuthProduct.data.message);
    
    // 5. Listar productos
    console.log('\n5. Listar Productos');
    const products = await request('GET', '/api/products');
    console.log('   Status:', products.status);
    console.log('   Message:', products.data.message);
    console.log('   Total:', products.data.data?.total || 0);
    
    console.log('\n✅ Todas las pruebas completadas\n');
    console.log('PRÓXIMOS PASOS:');
    console.log('1. Crear un usuario admin manualmente en MongoDB');
    console.log('2. Usar Postman/Insomnia para probar endpoints protegidos');
    console.log('3. Crear productos con token de admin');
    console.log('4. Crear órdenes con token de cliente');
    console.log('5. Gestionar órdenes con token de admin\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
