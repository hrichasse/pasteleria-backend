# Pastelería Backend API

Backend en **Node.js + Express + MongoDB (Atlas)** para la gestión de una pastelería: usuarios, productos y órdenes con autenticación JWT y control de roles.

## Tecnologías
- Node.js / Express
- MongoDB Atlas / Mongoose
- JWT (jsonwebtoken) + bcryptjs
- Joi para validación
- Helmet, CORS, Rate Limiting, Morgan

## Requisitos Previos
- Node.js >= 18
- Acceso a Internet (MongoDB Atlas)

## Instalación
```bash
npm install
```

## Archivo `.env`
Ejemplo:
```env
PORT=3001
MONGODB_URI=mongodb+srv://hrichasse:catolica17@pasteleriacluster.hxqyhdh.mongodb.net/pasteleria_db
JWT_SECRET=pasteleria-mil-sabores-super-secret-key-2024-secure
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5174
NODE_ENV=development
```

## Scripts
```bash
npm run dev    # nodemon
npm start      # producción
```

## Estructura del Proyecto
```
src/
  config/
    env.js
    database.js
  models/
    User.js
    Product.js
    Order.js
  controllers/
    authController.js
    productController.js
    orderController.js
  routes/
    auth.routes.js
    product.routes.js
    order.routes.js
  middlewares/
    authMiddleware.js
    errorHandler.js
  utils/
    jwt.js
    validators.js
  server.js
```

## Enumeraciones
### Categorías de Productos
`['tortas-cuadradas','tortas-circulares','postres-individuales','sin-azucar','tradicional','sin-gluten','vegana','especiales']`

### Estados de Órdenes
`['pending','confirmed','preparing','ready','delivered','cancelled']`

## Formato de Respuesta Exitosa
```json
{
  "message": "Texto descriptivo",
  "statusCode": 200,
  "data": { "...": "..." }
}
```

## Formato de Error
```json
{
  "message": "Descripción del error",
  "statusCode": 400,
  "details": ["Opcional"],
  "stack": "Solo en desarrollo"
}
```

## Endpoints

### Health
`GET /health`
```bash
curl -s http://localhost:3001/health
```

### Auth
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/auth/register | Registro |
| POST | /api/auth/login | Login |
| GET | /api/auth/profile | Perfil usuario autenticado |
| PUT | /api/auth/profile | Actualiza perfil |

#### Registro
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan","email":"juan@example.com","password":"secreto123"}'
```

#### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@example.com","password":"secreto123"}'
```

#### Perfil
```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3001/api/auth/profile
```

### Productos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/products | Lista (paginación y filtros) |
| GET | /api/products/:id | Obtener uno |
| POST | /api/products | Crear (admin) |
| PUT | /api/products/:id | Actualizar (admin) |
| DELETE | /api/products/:id | Desactivar (admin) |

Parámetros de consulta: `page`, `limit`, `category`, `search`, `active`

Ejemplo listar:
```bash
curl "http://localhost:3001/api/products?page=1&limit=5&category=tradicional"
```

Crear (admin):
```bash
curl -X POST http://localhost:3001/api/products \
 -H "Authorization: Bearer <ADMIN_TOKEN>" \
 -H "Content-Type: application/json" \
 -d '{"name":"Torta Vainilla","price":25,"category":"tradicional","stock":10}'
```

### Órdenes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/orders | Crear orden |
| GET | /api/orders | Listar (admin todas / cliente propias) |
| PUT | /api/orders/:id/status | Cambiar estado (admin) |

Crear orden:
```bash
curl -X POST http://localhost:3001/api/orders \
 -H "Authorization: Bearer <TOKEN>" \
 -H "Content-Type: application/json" \
 -d '{"items":[{"productId":"<PRODUCT_ID>","quantity":2}],"paymentMethod":"efectivo"}'
```

Actualizar estado (admin):
```bash
curl -X PUT http://localhost:3001/api/orders/<ORDER_ID>/status \
 -H "Authorization: Bearer <ADMIN_TOKEN>" \
 -H "Content-Type: application/json" \
 -d '{"status":"confirmed"}'
```

### Códigos de Estado Comunes
| Código | Significado |
|--------|-------------|
| 200 | OK |
| 201 | Creado |
| 400 | Validación / Petición inválida |
| 401 | No autenticado / Token inválido |
| 403 | Prohibido / Rol insuficiente |
| 404 | No encontrado |
| 409 | Conflicto (duplicado) |
| 500 | Error interno |

## Postman / Pruebas Manuales
1. Registrar usuario cliente.
2. Login y guardar token.
3. Crear usuario admin manualmente (o ajustar role en DB) y login.
4. Crear productos con token admin.
5. Listar productos públicamente.
6. Crear orden con token cliente.
7. Listar órdenes (cliente ve las suyas, admin ve todas).
8. Cambiar estado con token admin.

## Seguridad
- `helmet` protege cabeceras.
- `rate-limit` evita abuso (100 req/15min).
- JWT expira según `JWT_EXPIRES_IN`.
- Passwords hasheadas con bcrypt (salt 10).
- Validación estricta con Joi + sanitización `stripUnknown`.

## Desarrollo
```bash
npm run dev
```
La API escuchará en `http://localhost:3001`.

## Licencia
MIT
