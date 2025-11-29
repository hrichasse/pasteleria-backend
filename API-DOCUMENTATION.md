# Documentación Completa de API - Backend Pastelería

## Autenticación y Configuración

### JWT y Headers
✅ **Todos los endpoints protegidos usan JWT en el header:**
```
Authorization: Bearer <token>
```

### Endpoints que Requieren Token:
- `GET /api/auth/profile` ✅
- `PUT /api/auth/profile` ✅
- `POST /api/orders` ✅
- `GET /api/orders` ✅
- `PUT /api/orders/:id/status` ✅ (solo admin)
- `POST /api/products` ✅ (solo admin)
- `PUT /api/products/:id` ✅ (solo admin)
- `DELETE /api/products/:id` ✅ (solo admin)

### Endpoints Públicos (NO requieren token):
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `GET /api/products/:id`

### Configuración
- **Prefijo de rutas:** `/api`
- **CORS permitidos:** `http://localhost:5173` y `http://localhost:5174`
- **Puerto del backend:** `3001`
- **Base URL completa:** `http://localhost:3001/api`

---

## 1. Catálogo de Productos

### GET /api/products

#### Autenticación
❌ **NO requiere token** (público)

#### Query Params Soportados
```javascript
{
  search: string,    // Búsqueda por nombre (case insensitive)
  category: string,  // Filtrar por categoría exacta
  active: string,    // "true" o "false" para filtrar por isActive
  page: number,      // Número de página (default: 1)
  limit: number      // Items por página (default: 10)
}
```

#### Categorías Válidas
```javascript
[
  'tortas-cuadradas',
  'tortas-circulares',
  'postres-individuales',
  'sin-azucar',
  'tradicional',
  'sin-gluten',
  'vegana',
  'especiales'
]
```

#### Estructura de Respuesta
```javascript
{
  message: "Listado de productos",
  statusCode: 200,
  data: {
    items: [
      {
        _id: "673b3d7a42978b6a0a28f4ca",
        name: "Torta de Chocolate",
        description: "Deliciosa torta de chocolate con cobertura de ganache",
        price: 2500,
        category: "tortas-circulares",
        image: "https://ejemplo.com/imagen.jpg",
        stock: 10,
        isActive: true,
        createdAt: "2024-11-18T12:00:00.000Z",
        updatedAt: "2024-11-18T12:00:00.000Z"
      }
    ],
    page: 1,
    limit: 10,
    total: 25,
    totalPages: 3
  }
}
```

#### Campos del Producto
```typescript
{
  _id: string,           // ObjectId de MongoDB
  name: string,          // Nombre del producto (requerido, trim)
  description: string,   // Descripción del producto (opcional, trim)
  price: number,         // Precio en pesos (requerido, mínimo 0)
  category: string,      // Categoría del producto (enum, requerido)
  image: string,         // URL de la imagen (opcional, trim)
  stock: number,         // Cantidad disponible (default 0, mínimo 0)
  isActive: boolean,     // Si está activo (default true)
  createdAt: string,     // Fecha de creación (ISO 8601)
  updatedAt: string      // Fecha de actualización (ISO 8601)
}
```

#### Ejemplo de Request Completo
```http
GET /api/products?category=tortas-circulares&active=true&page=1&limit=10 HTTP/1.1
Host: localhost:3001
Content-Type: application/json
```

#### Ejemplo de Response Exitosa (200)
```json
{
  "message": "Listado de productos",
  "statusCode": 200,
  "data": {
    "items": [
      {
        "_id": "673b3d7a42978b6a0a28f4ca",
        "name": "Torta de Chocolate Triple",
        "description": "Tres capas de bizcocho de chocolate con cobertura de ganache",
        "price": 3500,
        "category": "tortas-circulares",
        "image": "https://res.cloudinary.com/demo/image/upload/torta-chocolate.jpg",
        "stock": 5,
        "isActive": true,
        "createdAt": "2024-11-18T10:30:00.000Z",
        "updatedAt": "2024-11-18T10:30:00.000Z"
      },
      {
        "_id": "673b3d7a42978b6a0a28f4cb",
        "name": "Torta Red Velvet",
        "description": "Suave torta de terciopelo rojo con frosting de queso crema",
        "price": 4000,
        "category": "tortas-circulares",
        "image": "https://res.cloudinary.com/demo/image/upload/red-velvet.jpg",
        "stock": 3,
        "isActive": true,
        "createdAt": "2024-11-18T11:00:00.000Z",
        "updatedAt": "2024-11-18T11:00:00.000Z"
      }
    ],
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

#### Ejemplo de Error (500)
```json
{
  "message": "Error interno del servidor",
  "statusCode": 500
}
```

#### Código del Controlador
```javascript
// src/controllers/productController.js
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
```

---

### GET /api/products/:id

#### Autenticación
❌ **NO requiere token** (público)

#### Parámetros de Ruta
- `id` (string, requerido): ObjectId de MongoDB del producto

#### Estructura de Respuesta
```javascript
{
  message: "Producto obtenido",
  statusCode: 200,
  data: {
    product: {
      _id: "673b3d7a42978b6a0a28f4ca",
      name: "Torta de Chocolate",
      description: "Deliciosa torta de chocolate con cobertura de ganache",
      price: 2500,
      category: "tortas-circulares",
      image: "https://ejemplo.com/imagen.jpg",
      stock: 10,
      isActive: true,
      createdAt: "2024-11-18T12:00:00.000Z",
      updatedAt: "2024-11-18T12:00:00.000Z"
    }
  }
}
```

#### Ejemplo de Request Completo
```http
GET /api/products/673b3d7a42978b6a0a28f4ca HTTP/1.1
Host: localhost:3001
Content-Type: application/json
```

#### Ejemplo de Response Exitosa (200)
```json
{
  "message": "Producto obtenido",
  "statusCode": 200,
  "data": {
    "product": {
      "_id": "673b3d7a42978b6a0a28f4ca",
      "name": "Torta de Chocolate Triple",
      "description": "Tres capas de bizcocho de chocolate rellenas con mousse de chocolate belga y cubiertas con ganache oscuro. Decorada con rizos de chocolate.",
      "price": 3500,
      "category": "tortas-circulares",
      "image": "https://res.cloudinary.com/demo/image/upload/torta-chocolate.jpg",
      "stock": 5,
      "isActive": true,
      "createdAt": "2024-11-18T10:30:00.000Z",
      "updatedAt": "2024-11-18T10:30:00.000Z"
    }
  }
}
```

#### Ejemplo de Error (404)
```json
{
  "message": "Producto no encontrado",
  "statusCode": 404
}
```

#### Ejemplo de Error (400 - ID inválido)
```json
{
  "message": "Cast to ObjectId failed for value \"invalid-id\" (type string) at path \"_id\" for model \"Product\"",
  "statusCode": 400
}
```

#### Código del Controlador
```javascript
// src/controllers/productController.js
async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next({ statusCode: 404, message: 'Producto no encontrado' });
    return res.json(respond('Producto obtenido', 200, { product }));
  } catch (err) {
    next(err);
  }
}
```

---

## 2. Autenticación

### POST /api/auth/login

#### Autenticación
❌ **NO requiere token** (público)

#### Request Body
```javascript
{
  email: string,     // Email del usuario (requerido, formato email)
  password: string   // Contraseña (requerido, mínimo 6 caracteres)
}
```

#### Validaciones
- `email`: formato email válido, requerido
- `password`: string, requerido (sin validación de longitud en login)

#### Estructura de Respuesta
```javascript
{
  message: "Login exitoso",
  statusCode: 200,
  data: {
    user: {
      _id: "673b3d7a42978b6a0a28f4ca",
      name: "Hernan Richasse",
      email: "hernanrichasse@gmail.com",
      role: "cliente",
      phone: "1234567890",
      address: {
        street: "Av. Principal 123",
        city: "Buenos Aires",
        state: "CABA",
        zipCode: "1000",
        country: "Argentina"
      },
      isActive: true,
      createdAt: "2024-11-18T12:00:00.000Z",
      updatedAt: "2024-11-18T12:00:00.000Z"
    },
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzNiM2Q3YTQyOTc4YjZhMGEyOGY0Y2EiLCJyb2xlIjoiY2xpZW50ZSIsImlhdCI6MTczMjc5MjAwMCwiZXhwIjoxNzMzMzk2ODAwfQ.xxxxxxxxxxxxxxxxxxxxx"
  }
}
```

#### Campos del User
```typescript
{
  _id: string,           // ObjectId de MongoDB
  name: string,          // Nombre completo (2-50 caracteres)
  email: string,         // Email único (lowercase)
  role: string,          // "admin" o "cliente"
  phone: string,         // Teléfono (opcional)
  address: {             // Dirección (opcional)
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string
  },
  isActive: boolean,     // Si el usuario está activo
  createdAt: string,     // Fecha de creación
  updatedAt: string      // Fecha de actualización
  // password NO se devuelve (oculto por toJSON)
}
```

#### Ejemplo de Request Completo
```http
POST /api/auth/login HTTP/1.1
Host: localhost:3001
Content-Type: application/json

{
  "email": "hernanrichasse@gmail.com",
  "password": "123456"
}
```

#### Ejemplo de Response Exitosa (200)
```json
{
  "message": "Login exitoso",
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "673b3d7a42978b6a0a28f4ca",
      "name": "Hernan Richasse",
      "email": "hernanrichasse@gmail.com",
      "role": "cliente",
      "phone": "1156789012",
      "address": {
        "street": "Av. Corrientes 1234",
        "city": "Buenos Aires",
        "state": "CABA",
        "zipCode": "C1043AAZ",
        "country": "Argentina"
      },
      "isActive": true,
      "createdAt": "2024-11-15T08:30:00.000Z",
      "updatedAt": "2024-11-18T10:15:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzNiM2Q3YTQyOTc4YjZhMGEyOGY0Y2EiLCJyb2xlIjoiY2xpZW50ZSIsImlhdCI6MTczMjc5MjAwMCwiZXhwIjoxNzMzMzk2ODAwfQ.sampleTokenSignatureHere"
  }
}
```

#### Ejemplo de Error (401 - Credenciales inválidas)
```json
{
  "message": "Credenciales inválidas",
  "statusCode": 401
}
```

#### Ejemplo de Error (403 - Usuario inactivo)
```json
{
  "message": "Usuario inactivo",
  "statusCode": 403
}
```

#### Ejemplo de Error (400 - Validación)
```json
{
  "message": "Datos de entrada inválidos",
  "statusCode": 400,
  "details": [
    {
      "message": "\"email\" must be a valid email",
      "path": ["email"]
    }
  ]
}
```

#### Código del Controlador
```javascript
// src/controllers/authController.js
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next({ statusCode: 401, message: 'Credenciales inválidas' });
    if (!user.isActive) return next({ statusCode: 403, message: 'Usuario inactivo' });
    const match = await user.comparePassword(password);
    if (!match) return next({ statusCode: 401, message: 'Credenciales inválidas' });
    const token = generateToken({ userId: user._id, role: user.role });
    return res.json(ok('Login exitoso', 200, { user, token }));
  } catch (err) {
    next(err);
  }
}

// src/utils/jwt.js
function generateToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}
// Token expira en 7 días (configurado en .env)
```

---

## 3. Cuenta de Usuario

### GET /api/auth/profile

#### Autenticación
✅ **Requiere JWT** en header `Authorization: Bearer <token>`

#### Estructura de Respuesta
```javascript
{
  message: "Perfil obtenido",
  statusCode: 200,
  data: {
    user: {
      _id: "673b3d7a42978b6a0a28f4ca",
      name: "Hernan Richasse",
      email: "hernanrichasse@gmail.com",
      role: "cliente",
      phone: "1234567890",
      address: {
        street: "Av. Principal 123",
        city: "Buenos Aires",
        state: "CABA",
        zipCode: "1000",
        country: "Argentina"
      },
      isActive: true,
      createdAt: "2024-11-18T12:00:00.000Z",
      updatedAt: "2024-11-18T12:00:00.000Z"
    }
  }
}
```

#### Ejemplo de Request Completo
```http
GET /api/auth/profile HTTP/1.1
Host: localhost:3001
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzNiM2Q3YTQyOTc4YjZhMGEyOGY0Y2EiLCJyb2xlIjoiY2xpZW50ZSIsImlhdCI6MTczMjc5MjAwMCwiZXhwIjoxNzMzMzk2ODAwfQ.xxxxxxxxxxxxxxxxxxxxx
```

#### Ejemplo de Response Exitosa (200)
```json
{
  "message": "Perfil obtenido",
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "673b3d7a42978b6a0a28f4ca",
      "name": "Hernan Richasse",
      "email": "hernanrichasse@gmail.com",
      "role": "cliente",
      "phone": "1156789012",
      "address": {
        "street": "Av. Corrientes 1234",
        "city": "Buenos Aires",
        "state": "CABA",
        "zipCode": "C1043AAZ",
        "country": "Argentina"
      },
      "isActive": true,
      "createdAt": "2024-11-15T08:30:00.000Z",
      "updatedAt": "2024-11-18T10:15:00.000Z"
    }
  }
}
```

#### Ejemplo de Error (401 - Token no proporcionado)
```json
{
  "message": "Token no proporcionado",
  "statusCode": 401
}
```

#### Ejemplo de Error (401 - Token inválido/expirado)
```json
{
  "message": "Token inválido",
  "statusCode": 401
}
```

#### Código del Controlador
```javascript
// src/controllers/authController.js
async function getProfile(req, res, next) {
  try {
    // req.user viene del middleware authenticate()
    return res.json(ok('Perfil obtenido', 200, { user: req.user }));
  } catch (err) {
    next(err);
  }
}

// src/middlewares/authMiddleware.js
function authenticate() {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return next({ statusCode: 401, message: 'Token no proporcionado' });
      }
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId);
      if (!user) return next({ statusCode: 401, message: 'Usuario no encontrado' });
      req.user = user;
      next();
    } catch (err) {
      return next({ statusCode: 401, message: 'Token inválido' });
    }
  };
}
```

---

### GET /api/orders

#### Autenticación
✅ **Requiere JWT** en header `Authorization: Bearer <token>`

#### Filtrado por Usuario
✅ **SÍ, filtra automáticamente por userId desde el token**
- Si el usuario es **cliente**: solo ve sus propias órdenes
- Si el usuario es **admin**: ve todas las órdenes del sistema

#### Query Params Soportados
```javascript
{
  status: string,    // Filtrar por estado de orden
  page: number,      // Número de página (default: 1)
  limit: number      // Items por página (default: 10)
}
```

#### Estados de Orden Válidos
```javascript
[
  'pending',      // Pendiente
  'confirmed',    // Confirmada
  'preparing',    // En preparación
  'ready',        // Lista
  'delivered',    // Entregada
  'cancelled'     // Cancelada
]
```

#### Estructura de Respuesta
```javascript
{
  message: "Listado de órdenes",
  statusCode: 200,
  data: {
    items: [
      {
        _id: "673b3d7a42978b6a0a28f4cc",
        userId: {
          _id: "673b3d7a42978b6a0a28f4ca",
          name: "Hernan Richasse",
          email: "hernanrichasse@gmail.com",
          role: "cliente"
        },
        items: [
          {
            productId: "673b3d7a42978b6a0a28f4ca",
            name: "Torta de Chocolate",
            quantity: 2,
            price: 2500
          }
        ],
        total: 5000,
        status: "pending",
        paymentMethod: "tarjeta",
        deliveryAddress: {
          street: "Av. Principal 123",
          city: "Buenos Aires",
          state: "CABA",
          zipCode: "1000",
          phone: "1234567890"
        },
        notes: "Sin azúcar adicional",
        createdAt: "2024-11-18T12:00:00.000Z",
        updatedAt: "2024-11-18T12:00:00.000Z"
      }
    ],
    page: 1,
    limit: 10,
    total: 3,
    totalPages: 1
  }
}
```

#### Campos de Orden
```typescript
{
  _id: string,                 // ObjectId de la orden
  userId: {                    // Usuario que hizo la orden (populated)
    _id: string,
    name: string,
    email: string,
    role: string
  },
  items: [                     // Items de la orden
    {
      productId: string,       // ObjectId del producto
      name: string,            // Nombre del producto (guardado)
      quantity: number,        // Cantidad comprada
      price: number            // Precio al momento de la compra
    }
  ],
  total: number,               // Total calculado por backend (price × quantity)
  status: string,              // Estado de la orden (enum)
  paymentMethod: string,       // "efectivo", "tarjeta", "transferencia"
  deliveryAddress: {           // Dirección de entrega
    street: string,
    city: string,
    state: string,
    zipCode: string,
    phone: string
  },
  notes: string,               // Notas adicionales (máx 500 caracteres)
  createdAt: string,           // Fecha de creación
  updatedAt: string            // Fecha de actualización
}
```

#### Ejemplo de Request Completo
```http
GET /api/orders?status=pending&page=1&limit=10 HTTP/1.1
Host: localhost:3001
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzNiM2Q3YTQyOTc4YjZhMGEyOGY0Y2EiLCJyb2xlIjoiY2xpZW50ZSIsImlhdCI6MTczMjc5MjAwMCwiZXhwIjoxNzMzMzk2ODAwfQ.xxxxxxxxxxxxxxxxxxxxx
```

#### Ejemplo de Response Exitosa (200)
```json
{
  "message": "Listado de órdenes",
  "statusCode": 200,
  "data": {
    "items": [
      {
        "_id": "674a5e1b73982f1a2b39c8d1",
        "userId": {
          "_id": "673b3d7a42978b6a0a28f4ca",
          "name": "Hernan Richasse",
          "email": "hernanrichasse@gmail.com",
          "role": "cliente"
        },
        "items": [
          {
            "productId": "673b3d7a42978b6a0a28f4ca",
            "name": "Torta de Chocolate Triple",
            "quantity": 1,
            "price": 3500
          },
          {
            "productId": "673b3d7a42978b6a0a28f4cb",
            "name": "Torta Red Velvet",
            "quantity": 1,
            "price": 4000
          }
        ],
        "total": 7500,
        "status": "pending",
        "paymentMethod": "tarjeta",
        "deliveryAddress": {
          "street": "Av. Corrientes 1234",
          "city": "Buenos Aires",
          "state": "CABA",
          "zipCode": "C1043AAZ",
          "phone": "1156789012"
        },
        "notes": "Entregar antes de las 15hs",
        "createdAt": "2024-11-28T09:15:00.000Z",
        "updatedAt": "2024-11-28T09:15:00.000Z"
      }
    ],
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Ejemplo de Error (401 - No autenticado)
```json
{
  "message": "Token no proporcionado",
  "statusCode": 401
}
```

#### Código del Controlador
```javascript
// src/controllers/orderController.js
async function getOrders(req, res, next) {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = {};
    if (status) query.status = status;
    // Filtrar por usuario si no es admin
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
```

---

### PUT /api/auth/profile

#### Autenticación
✅ **Requiere JWT** en header `Authorization: Bearer <token>`

#### Request Body (campos permitidos)
```javascript
{
  name: string,        // Nombre completo (2-50 caracteres)
  phone: string,       // Teléfono
  address: {           // Dirección completa
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string
  },
  password: string     // Nueva contraseña (mínimo 6 caracteres, se hashea automáticamente)
  // role: NO se puede cambiar a menos que seas admin
}
```

#### Validaciones
- `name`: string, 2-50 caracteres, trim
- `phone`: string, trim
- `address`: objeto con campos string, todos opcionales
- `password`: si se envía, mínimo 6 caracteres (se hashea automáticamente por pre-save hook)
- `role`: solo admin puede cambiar su propio role o el de otros usuarios

#### Estructura de Respuesta
```javascript
{
  message: "Perfil actualizado",
  statusCode: 200,
  data: {
    user: {
      _id: "673b3d7a42978b6a0a28f4ca",
      name: "Hernan Richasse",
      email: "hernanrichasse@gmail.com",
      role: "cliente",
      phone: "1156789012",
      address: {
        street: "Av. Corrientes 1234",
        city: "Buenos Aires",
        state: "CABA",
        zipCode: "C1043AAZ",
        country: "Argentina"
      },
      isActive: true,
      createdAt: "2024-11-18T12:00:00.000Z",
      updatedAt: "2024-11-28T14:30:00.000Z"
    }
  }
}
```

#### Ejemplo de Request Completo
```http
PUT /api/auth/profile HTTP/1.1
Host: localhost:3001
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzNiM2Q3YTQyOTc4YjZhMGEyOGY0Y2EiLCJyb2xlIjoiY2xpZW50ZSIsImlhdCI6MTczMjc5MjAwMCwiZXhwIjoxNzMzMzk2ODAwfQ.xxxxxxxxxxxxxxxxxxxxx

{
  "phone": "1198765432",
  "address": {
    "street": "Calle Falsa 123",
    "city": "Rosario",
    "state": "Santa Fe",
    "zipCode": "S2000ABC",
    "country": "Argentina"
  }
}
```

#### Ejemplo de Response Exitosa (200)
```json
{
  "message": "Perfil actualizado",
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "673b3d7a42978b6a0a28f4ca",
      "name": "Hernan Richasse",
      "email": "hernanrichasse@gmail.com",
      "role": "cliente",
      "phone": "1198765432",
      "address": {
        "street": "Calle Falsa 123",
        "city": "Rosario",
        "state": "Santa Fe",
        "zipCode": "S2000ABC",
        "country": "Argentina"
      },
      "isActive": true,
      "createdAt": "2024-11-15T08:30:00.000Z",
      "updatedAt": "2024-11-28T15:45:00.000Z"
    }
  }
}
```

#### Ejemplo de Error (404 - Usuario no encontrado)
```json
{
  "message": "Usuario no encontrado",
  "statusCode": 404
}
```

#### Ejemplo de Error (400 - Validación de Mongoose)
```json
{
  "message": "El nombre debe tener entre 2 y 50 caracteres",
  "statusCode": 400
}
```

#### Ejemplo de Error (401 - Token inválido)
```json
{
  "message": "Token inválido",
  "statusCode": 401
}
```

#### Código del Controlador
```javascript
// src/controllers/authController.js
async function updateProfile(req, res, next) {
  try {
    const updates = req.body;
    // Evitar cambiar role directamente si no es admin
    if (updates.role && req.user.role !== 'admin') delete updates.role;
    const user = await User.findById(req.user._id);
    if (!user) return next({ statusCode: 404, message: 'Usuario no encontrado' });
    Object.assign(user, updates);
    await user.save(); // Trigger pre-save hook para hashear password si cambió
    return res.json(ok('Perfil actualizado', 200, { user }));
  } catch (err) {
    next(err);
  }
}

// src/models/User.js - Pre-save hook
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
```

---

## 4. Reglas de Negocio

### Estados de Orden y Transiciones

#### Estados Válidos (ORDER_STATUS)
```javascript
[
  'pending',      // Pendiente - Estado inicial al crear orden
  'confirmed',    // Confirmada - Admin confirma la orden
  'preparing',    // En preparación - Se está preparando
  'ready',        // Lista - Orden lista para entregar/retirar
  'delivered',    // Entregada - Orden entregada al cliente
  'cancelled'     // Cancelada - Orden cancelada
]
```

#### Quién Puede Cambiar Estados
- **Cliente**: Solo puede crear órdenes (quedan en `pending`)
- **Admin**: Puede cambiar el estado de cualquier orden usando `PUT /api/orders/:id/status`

#### Flujo Típico
```
pending → confirmed → preparing → ready → delivered
              ↓
          cancelled (en cualquier momento antes de delivered)
```

### Métodos de Pago

#### Métodos Válidos (PAYMENT_METHODS)
```javascript
[
  'efectivo',
  'tarjeta',
  'transferencia'
]
```

#### Envío en Request
Si no se especifica `paymentMethod` al crear orden, el campo queda `undefined` (opcional).

### Cálculo de Total de Orden

✅ **El total se calcula SIEMPRE en el backend**

#### Lógica:
1. Cliente envía solo `{ productId, quantity }` por cada item
2. Backend obtiene el **precio actual** del producto desde la BD
3. Backend calcula `lineTotal = producto.price * quantity`
4. Backend suma todos los `lineTotal` para obtener el `total` de la orden
5. Backend guarda el `price` de cada item al momento de la compra (para histórico)

#### ⚠️ Importante:
- **NO confiar** en el precio enviado por el cliente
- El precio guardado en la orden es el precio **al momento de la compra**
- Si el precio del producto cambia después, NO afecta órdenes anteriores

#### Código de Cálculo
```javascript
// src/controllers/orderController.js
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
      
      // Reducir stock automáticamente
      product.stock -= item.quantity;
      await product.save();
      
      // Calcular con precio actual del producto
      const lineTotal = product.price * item.quantity;
      total += lineTotal;
      
      processedItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price // Precio al momento de la compra
      });
    }
    
    const order = await Order.create({
      userId,
      items: processedItems,
      total, // Total calculado por backend
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
```

---

## 5. Ejemplos Reales Completos

### Ejemplo 1: Flujo Completo de Compra

#### Paso 1: Ver productos disponibles
```http
GET /api/products?active=true HTTP/1.1
Host: localhost:3001
```

**Response:**
```json
{
  "message": "Listado de productos",
  "statusCode": 200,
  "data": {
    "items": [
      {
        "_id": "673b3d7a42978b6a0a28f4ca",
        "name": "Torta de Chocolate Triple",
        "price": 3500,
        "stock": 5,
        "isActive": true
      }
    ]
  }
}
```

#### Paso 2: Login del usuario
```http
POST /api/auth/login HTTP/1.1
Host: localhost:3001
Content-Type: application/json

{
  "email": "hernanrichasse@gmail.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "message": "Login exitoso",
  "statusCode": 200,
  "data": {
    "user": { "_id": "673b3d7a42978b6a0a28f4ca", "name": "Hernan Richasse" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Paso 3: Crear orden
```http
POST /api/orders HTTP/1.1
Host: localhost:3001
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "items": [
    {
      "productId": "673b3d7a42978b6a0a28f4ca",
      "quantity": 2
    }
  ],
  "paymentMethod": "tarjeta",
  "deliveryAddress": {
    "street": "Av. Corrientes 1234",
    "city": "Buenos Aires",
    "state": "CABA",
    "zipCode": "C1043AAZ",
    "phone": "1156789012"
  },
  "notes": "Entregar antes de las 15hs"
}
```

**Response:**
```json
{
  "message": "Orden creada",
  "statusCode": 201,
  "data": {
    "order": {
      "_id": "674a5e1b73982f1a2b39c8d1",
      "userId": { "_id": "673b3d7a42978b6a0a28f4ca", "name": "Hernan Richasse" },
      "items": [
        {
          "productId": "673b3d7a42978b6a0a28f4ca",
          "name": "Torta de Chocolate Triple",
          "quantity": 2,
          "price": 3500
        }
      ],
      "total": 7000,
      "status": "pending",
      "paymentMethod": "tarjeta"
    }
  }
}
```

#### Paso 4: Ver mis órdenes
```http
GET /api/orders HTTP/1.1
Host: localhost:3001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "message": "Listado de órdenes",
  "statusCode": 200,
  "data": {
    "items": [
      {
        "_id": "674a5e1b73982f1a2b39c8d1",
        "total": 7000,
        "status": "pending"
      }
    ]
  }
}
```

---

### Ejemplo 2: Errores Comunes

#### Error: Token expirado
```http
GET /api/auth/profile HTTP/1.1
Authorization: Bearer <token_expirado>
```

**Response (401):**
```json
{
  "message": "Token inválido",
  "statusCode": 401
}
```

#### Error: Stock insuficiente
```http
POST /api/orders HTTP/1.1
Authorization: Bearer <token_valido>

{
  "items": [
    { "productId": "673b3d7a42978b6a0a28f4ca", "quantity": 100 }
  ]
}
```

**Response (400):**
```json
{
  "message": "Stock insuficiente para Torta de Chocolate Triple",
  "statusCode": 400
}
```

#### Error: Producto no encontrado
```http
GET /api/products/invalid-id-format HTTP/1.1
```

**Response (400):**
```json
{
  "message": "Cast to ObjectId failed for value \"invalid-id-format\"",
  "statusCode": 400
}
```

#### Error: Usuario inactivo
```http
POST /api/auth/login HTTP/1.1

{
  "email": "usuario.inactivo@example.com",
  "password": "123456"
}
```

**Response (403):**
```json
{
  "message": "Usuario inactivo",
  "statusCode": 403
}
```

---

## Resumen de Estructura de Respuestas

### Formato Estándar de Éxito
```javascript
{
  message: string,      // Mensaje descriptivo
  statusCode: number,   // Código HTTP
  data: {               // Datos de respuesta
    [key]: value
  }
}
```

### Formato Estándar de Error
```javascript
{
  message: string,      // Mensaje de error
  statusCode: number,   // Código HTTP de error
  details: [            // Opcional: detalles de validación
    {
      message: string,
      path: string[]
    }
  ]
}
```

---

## Códigos HTTP Usados

- **200**: Éxito (GET, PUT)
- **201**: Creado (POST)
- **400**: Error de validación o parámetros incorrectos
- **401**: No autenticado (token faltante o inválido)
- **403**: No autorizado (usuario inactivo o sin permisos)
- **404**: Recurso no encontrado
- **409**: Conflicto (email duplicado en registro)
- **500**: Error interno del servidor

---

## Notas Finales

1. **Password nunca se devuelve** en las respuestas (oculto por `toJSON()`)
2. **Token expira en 7 días** (configurable en `.env`)
3. **Stock se reduce automáticamente** al crear orden
4. **Total se calcula en backend** con precios actuales
5. **Filtrado automático de órdenes** por userId si no es admin
6. **Populate de userId** en órdenes incluye datos del usuario
7. **Categorías de productos** son enum fijos
8. **Estados de orden** son enum fijos
9. **Métodos de pago** son enum fijos
10. **Soft delete** en productos (isActive = false)
