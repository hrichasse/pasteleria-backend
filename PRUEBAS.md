# Guía de Pruebas - Pastelería Backend

## Estado Actual ✅
- ✅ Servidor corriendo en `http://localhost:3001`
- ✅ Conectado a MongoDB Atlas
- ✅ Todas las rutas configuradas

## Próximos Pasos para Probar

### 1. Health Check (CMD/PowerShell)
```powershell
# En una nueva terminal PowerShell:
Invoke-RestMethod -Uri 'http://localhost:3001/health' -Method Get
```

### 2. Registro de Usuario
```powershell
$body = @{
    name = "Juan Pérez"
    email = "juan@example.com"
    password = "secreto123"
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/register' -Method Post -Body $body -ContentType 'application/json'
```

### 3. Login
```powershell
$loginBody = @{
    email = "juan@example.com"
    password = "secreto123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method Post -Body $loginBody -ContentType 'application/json'
$token = $response.data.token
Write-Host "Token guardado: $token"
```

### 4. Ver Perfil
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/profile' -Method Get -Headers $headers
```

### 5. Listar Productos (público)
```powershell
Invoke-RestMethod -Uri 'http://localhost:3001/api/products' -Method Get
```

### 6. Crear Usuario Admin (MongoDB)

**Opción A: Modificar usuario existente en MongoDB Atlas**
1. Ir a https://cloud.mongodb.com
2. Buscar tu cluster `pasteleriacluster`
3. Browse Collections → `pasteleria_db` → `users`
4. Editar el usuario creado y cambiar `role: "cliente"` a `role: "admin"`

**Opción B: Crear directamente con script**
```javascript
// En MongoDB Atlas Web Shell o Compass:
db.users.updateOne(
  { email: "juan@example.com" },
  { $set: { role: "admin" } }
)
```

### 7. Login como Admin y Crear Producto
```powershell
# Login admin
$adminLogin = @{
    email = "juan@example.com"
    password = "secreto123"
} | ConvertTo-Json

$adminResponse = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method Post -Body $adminLogin -ContentType 'application/json'
$adminToken = $adminResponse.data.token

# Crear producto
$productBody = @{
    name = "Torta de Chocolate"
    description = "Deliciosa torta con ganache de chocolate"
    price = 35.50
    category = "tradicional"
    stock = 15
    image = "https://example.com/torta-chocolate.jpg"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $adminToken"
}

Invoke-RestMethod -Uri 'http://localhost:3001/api/products' -Method Post -Body $productBody -ContentType 'application/json' -Headers $headers
```

### 8. Crear Orden
```powershell
# Primero obtener ID de un producto
$products = Invoke-RestMethod -Uri 'http://localhost:3001/api/products' -Method Get
$productId = $products.data.items[0]._id

# Crear orden con token de cliente
$orderBody = @{
    items = @(
        @{
            productId = $productId
            quantity = 2
        }
    )
    paymentMethod = "efectivo"
    deliveryAddress = @{
        street = "Av. Principal 123"
        city = "Lima"
        state = "Lima"
        zipCode = "15001"
        phone = "999888777"
    }
    notes = "Entregar entre 3-5pm"
} | ConvertTo-Json -Depth 5

$clientHeaders = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri 'http://localhost:3001/api/orders' -Method Post -Body $orderBody -ContentType 'application/json' -Headers $clientHeaders
```

### 9. Ver Órdenes
```powershell
# Cliente ve solo sus órdenes
Invoke-RestMethod -Uri 'http://localhost:3001/api/orders' -Method Get -Headers $clientHeaders

# Admin ve todas las órdenes
Invoke-RestMethod -Uri 'http://localhost:3001/api/orders' -Method Get -Headers $headers
```

### 10. Actualizar Estado de Orden (Admin)
```powershell
$orderId = "<ORDER_ID_AQUI>"
$statusBody = @{
    status = "confirmed"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/orders/$orderId/status" -Method Put -Body $statusBody -ContentType 'application/json' -Headers $headers
```

## Usando Postman/Insomnia (RECOMENDADO)

### Setup Inicial
1. Importar las siguientes variables de entorno:
   - `BASE_URL`: `http://localhost:3001`
   - `TOKEN`: (se actualiza después de login)

### Colección de Requests

#### 1. Health Check
- **GET** `{{BASE_URL}}/health`

#### 2. Registro
- **POST** `{{BASE_URL}}/api/auth/register`
- Body (JSON):
```json
{
  "name": "María García",
  "email": "maria@example.com",
  "password": "password123",
  "phone": "987654321",
  "address": {
    "street": "Calle Los Olivos 456",
    "city": "Lima",
    "zipCode": "15002"
  }
}
```

#### 3. Login
- **POST** `{{BASE_URL}}/api/auth/login`
- Body:
```json
{
  "email": "maria@example.com",
  "password": "password123"
}
```
- **Guardar el token de la respuesta**

#### 4. Ver Perfil
- **GET** `{{BASE_URL}}/api/auth/profile`
- Headers: `Authorization: Bearer {{TOKEN}}`

#### 5. Crear Productos (como Admin)
- **POST** `{{BASE_URL}}/api/products`
- Headers: `Authorization: Bearer {{ADMIN_TOKEN}}`
- Body:
```json
{
  "name": "Cheesecake de Fresa",
  "description": "Suave cheesecake con coulis de fresa",
  "price": 28.00,
  "category": "postres-individuales",
  "stock": 20
}
```

Otros productos de ejemplo:
```json
{
  "name": "Torta Tres Leches",
  "price": 32.00,
  "category": "tradicional",
  "stock": 12
}
```

```json
{
  "name": "Brownie Sin Gluten",
  "price": 8.50,
  "category": "sin-gluten",
  "stock": 30
}
```

```json
{
  "name": "Mousse de Chocolate Vegano",
  "price": 12.00,
  "category": "vegana",
  "stock": 25
}
```

#### 6. Listar Productos
- **GET** `{{BASE_URL}}/api/products?page=1&limit=10`
- **GET** `{{BASE_URL}}/api/products?category=tradicional`
- **GET** `{{BASE_URL}}/api/products?search=chocolate`

#### 7. Crear Orden
- **POST** `{{BASE_URL}}/api/orders`
- Headers: `Authorization: Bearer {{TOKEN}}`
- Body:
```json
{
  "items": [
    {
      "productId": "673bXXXXXXXXXXXXXXXX",
      "quantity": 2
    },
    {
      "productId": "673bYYYYYYYYYYYYYYYY",
      "quantity": 1
    }
  ],
  "paymentMethod": "tarjeta",
  "deliveryAddress": {
    "street": "Av. Arequipa 2850",
    "city": "Lima",
    "state": "Lima",
    "zipCode": "15047",
    "phone": "945123456"
  },
  "notes": "Por favor incluir velas"
}
```

#### 8. Ver Órdenes
- **GET** `{{BASE_URL}}/api/orders`
- Headers: `Authorization: Bearer {{TOKEN}}`
- Query params: `?page=1&limit=10&status=pending`

#### 9. Actualizar Estado de Orden (Admin)
- **PUT** `{{BASE_URL}}/api/orders/:orderId/status`
- Headers: `Authorization: Bearer {{ADMIN_TOKEN}}`
- Body:
```json
{
  "status": "preparing"
}
```

Estados disponibles:
- `pending` → `confirmed` → `preparing` → `ready` → `delivered`
- En cualquier momento: `cancelled`

## Verificaciones de Seguridad

### ✅ Validaciones que Funcionan
1. **Registro con email duplicado** → 409 Conflict
2. **Login con credenciales inválidas** → 401 Unauthorized
3. **Acceso sin token** → 401 Unauthorized
4. **Cliente intenta crear producto** → 403 Forbidden
5. **Cliente intenta cambiar estado de orden** → 403 Forbidden
6. **Crear orden sin stock** → 400 Bad Request
7. **Validación Joi** → 400 con detalles de errores

### 🔒 Rate Limiting
- Máximo 100 requests cada 15 minutos por IP
- Si se excede → 429 Too Many Requests

## Categorías de Productos Válidas
- `tortas-cuadradas`
- `tortas-circulares`
- `postres-individuales`
- `sin-azucar`
- `tradicional`
- `sin-gluten`
- `vegana`
- `especiales`

## Estados de Orden Válidos
- `pending` (default)
- `confirmed`
- `preparing`
- `ready`
- `delivered`
- `cancelled`

## Métodos de Pago Válidos
- `efectivo`
- `tarjeta`
- `transferencia`

## Troubleshooting

### Error: "Token inválido"
- Verificar que el header sea: `Authorization: Bearer <token>`
- El token expira en 7 días

### Error: "Usuario inactivo"
- Verificar que `isActive: true` en MongoDB

### Error: "Stock insuficiente"
- Verificar el stock actual del producto antes de crear la orden

### Servidor no responde
- Verificar que el proceso esté corriendo: `Get-Process -Name node`
- Revisar logs en la terminal donde corre `npm run dev`

## Logs en Desarrollo
El servidor muestra:
- Requests HTTP (morgan)
- Conexión MongoDB
- Errores con stack trace completo

¡Disfruta probando tu API! 🍰
