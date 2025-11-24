# Prompt para Implementar Autenticación en Frontend

## Contexto
Tengo un backend REST API completo para una pastelería corriendo en `http://localhost:3001` con autenticación JWT. Necesito implementar el sistema de registro e inicio de sesión en el frontend React (corriendo en `http://localhost:5174`) para que los usuarios puedan:
1. **Registrarse** y crear una cuenta que se guarde en MongoDB
2. **Iniciar sesión** con las credenciales creadas
3. **Mantener la sesión** activa usando tokens JWT
4. **Proteger rutas** que requieren autenticación

---

## Especificaciones del Backend

### Base URL
```
http://localhost:3001/api
```

### Endpoints de Autenticación

#### 1. Registro de Usuario
**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "Hernan Richasse",
  "email": "hernanrichasse@gmail.com",
  "password": "123456",
  "confirmPassword": "123456",
  "phone": "opcional",
  "address": {
    "street": "opcional",
    "city": "opcional",
    "state": "opcional",
    "zipCode": "opcional",
    "country": "opcional"
  }
}
```

**Campos requeridos:** `name`, `email`, `password`, `confirmPassword`
- `password` debe tener mínimo 6 caracteres
- `confirmPassword` debe coincidir con `password`
- `email` debe ser un email válido
- `name` debe tener entre 2 y 50 caracteres

**Respuesta exitosa (201):**
```json
{
  "message": "Usuario registrado correctamente",
  "statusCode": 201,
  "data": {
    "user": {
      "_id": "673b3d7a42978b6a0a28f4ca",
      "name": "Hernan Richasse",
      "email": "hernanrichasse@gmail.com",
      "role": "cliente",
      "isActive": true,
      "createdAt": "2024-11-18T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errores posibles:**
- `409`: Email ya registrado → `"El email ya está registrado"`
- `400`: Validación fallida → `"Las contraseñas no coinciden"` o errores de campos
- `400`: Datos inválidos → detalles en `details` array

#### 2. Inicio de Sesión
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "hernanrichasse@gmail.com",
  "password": "123456"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Login exitoso",
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "673b3d7a42978b6a0a28f4ca",
      "name": "Hernan Richasse",
      "email": "hernanrichasse@gmail.com",
      "role": "cliente"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errores posibles:**
- `401`: Credenciales inválidas → `"Credenciales inválidas"`
- `403`: Usuario inactivo → `"Usuario inactivo"`

#### 3. Obtener Perfil (requiere autenticación)
**Endpoint:** `GET /auth/profile`

**Headers requeridos:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "message": "Perfil obtenido",
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "673b3d7a42978b6a0a28f4ca",
      "name": "Hernan Richasse",
      "email": "hernanrichasse@gmail.com",
      "role": "cliente"
    }
  }
}
```

---

## Requisitos de Implementación

### 1. Configuración de Axios
Crear un cliente axios configurado con:
- Base URL: `http://localhost:3001/api`
- Interceptor para agregar token automáticamente
- Manejo de errores centralizado

### 2. Context de Autenticación
Crear `AuthContext` que maneje:
- Estado del usuario autenticado
- Token JWT (guardar en localStorage)
- Funciones: `register()`, `login()`, `logout()`, `checkAuth()`
- Loading state durante operaciones

### 3. Componente de Registro
Formulario con:
- Campo: Nombre Completo (requerido, 2-50 caracteres)
- Campo: Email (requerido, formato email)
- Campo: Contraseña (requerido, mínimo 6 caracteres, tipo password)
- Campo: Confirmar Contraseña (requerido, debe coincidir, tipo password)
- Validación en tiempo real
- Mensajes de error específicos por campo
- Mostrar mensaje de éxito y redirigir al login o página principal

### 4. Componente de Login
Formulario con:
- Campo: Email
- Campo: Contraseña
- Validación básica
- Mostrar errores del servidor
- Redirigir tras login exitoso
- Link a página de registro

### 5. Manejo de Errores
Mapear correctamente los errores del backend:
```javascript
// Ejemplo de manejo:
if (error.response?.status === 409) {
  setError('El email ya está registrado');
} else if (error.response?.status === 401) {
  setError('Email o contraseña incorrectos');
} else if (error.response?.data?.details) {
  // Errores de validación Joi
  const messages = error.response.data.details.map(d => d.message).join(', ');
  setError(messages);
} else {
  setError(error.response?.data?.message || 'Error en el servidor');
}
```

### 6. Persistencia de Sesión
- Guardar token en `localStorage` al hacer login/register
- Recuperar token al cargar la app
- Validar token con `/auth/profile` al iniciar
- Limpiar token al hacer logout o si expira (401)

### 7. Rutas Protegidas
Crear componente `ProtectedRoute` que:
- Verifique si hay usuario autenticado
- Redirija a login si no hay sesión
- Permita acceso si hay token válido

### 8. Configuración CORS
El backend ya tiene CORS configurado para:
```
origin: http://localhost:5174
```

---

## Estructura Sugerida

```
src/
├── services/
│   └── api.js              # Cliente axios configurado
├── contexts/
│   └── AuthContext.jsx     # Context de autenticación
├── components/
│   ├── Auth/
│   │   ├── LoginForm.jsx   # Formulario de login
│   │   ├── RegisterForm.jsx # Formulario de registro
│   │   └── ProtectedRoute.jsx # HOC para rutas protegidas
│   └── Layout/
│       └── Navbar.jsx      # Mostrar usuario/logout
└── pages/
    ├── Login.jsx
    ├── Register.jsx
    └── Home.jsx
```

---

## Ejemplo de Uso del Token

Una vez autenticado, todas las peticiones protegidas deben incluir:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

El token expira en **7 días**. Si el backend responde con `401`, significa que expiró y debe pedir login nuevamente.

---

## Testing Manual

### Paso 1: Registrar usuario
1. Ir a `/register`
2. Llenar formulario con datos válidos
3. Verificar que se crea el usuario en MongoDB
4. Verificar que se guarda el token en localStorage
5. Verificar que redirige a página principal

### Paso 2: Cerrar sesión y volver a entrar
1. Hacer logout (limpiar localStorage)
2. Ir a `/login`
3. Ingresar email y contraseña del usuario creado
4. Verificar que permite acceso
5. Verificar que token se guarda nuevamente

### Paso 3: Rutas protegidas
1. Sin estar logueado, intentar acceder a ruta protegida
2. Verificar que redirige a login
3. Loguearse
4. Verificar que ahora permite acceso

### Paso 4: Persistencia
1. Con sesión activa, recargar la página (F5)
2. Verificar que la sesión se mantiene
3. Verificar que no pide login nuevamente

---

## Datos de Prueba

### Usuario Admin (ya existe en BD)
```
Email: admin@pasteleria.com
Password: admin123
Role: admin
```

### Crear nuevo cliente
Usar el formulario de registro con cualquier email nuevo.

---

## Notas Importantes

1. **NO modificar el backend** - está completo y funcionando
2. **El password nunca se devuelve** en las respuestas del backend (está oculto)
3. **Validar SIEMPRE que las contraseñas coincidan** antes de enviar
4. **Mostrar mensajes claros** al usuario (usar `response.data.message`)
5. **No mostrar contraseñas** en consola o alerts
6. **El campo `confirmPassword`** es obligatorio en registro pero NO se guarda en BD
7. **Token format:** `Bearer <token>` en header Authorization

---

## Objetivo Final

Que el usuario pueda:
✅ Registrarse desde el frontend con validación completa
✅ Ver confirmación de registro exitoso
✅ Usuario guardado en MongoDB con password hasheado
✅ Iniciar sesión con las credenciales creadas
✅ Mantener sesión activa (token en localStorage)
✅ Acceder a rutas protegidas solo estando autenticado
✅ Ver su nombre/email en navbar
✅ Cerrar sesión correctamente
✅ Sesión persiste al recargar página

---

## Checklist de Implementación

- [ ] Crear `api.js` con axios configurado
- [ ] Crear `AuthContext` con todas las funciones
- [ ] Crear formulario `RegisterForm` con validaciones
- [ ] Crear formulario `LoginForm`
- [ ] Implementar manejo de errores específicos
- [ ] Guardar/recuperar token de localStorage
- [ ] Crear `ProtectedRoute` component
- [ ] Agregar botón logout en navbar
- [ ] Mostrar datos del usuario en UI
- [ ] Probar flujo completo de registro → login → rutas protegidas
- [ ] Verificar que usuarios se guardan en MongoDB
