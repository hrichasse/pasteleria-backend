# Script para probar creación de orden

Write-Host "`n=== TEST: Crear Orden ===" -ForegroundColor Cyan

# 1. Primero hacer login para obtener token
Write-Host "`n1. Login para obtener token..." -ForegroundColor Yellow

$loginBody = @{
    email = "hernanrichasse@gmail.com"
    password = "123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "✅ Login exitoso. Token obtenido." -ForegroundColor Green
    Write-Host "Usuario: $($loginResponse.data.user.name)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error en login" -ForegroundColor Red
    $_.Exception.Message
    exit
}

# 2. Obtener un producto disponible
Write-Host "`n2. Obteniendo productos disponibles..." -ForegroundColor Yellow

try {
    $productsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/products?active=true&limit=1" -Method Get
    $product = $productsResponse.data.items[0]
    Write-Host "✅ Producto encontrado: $($product.name)" -ForegroundColor Green
    Write-Host "   Precio: $($product.price) | Stock: $($product.stock)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error obteniendo productos" -ForegroundColor Red
    exit
}

# 3. Crear orden con el producto
Write-Host "`n3. Creando orden..." -ForegroundColor Yellow

$orderBody = @{
    items = @(
        @{
            productId = $product._id
            quantity = 1
        }
    )
    paymentMethod = "tarjeta"
    deliveryAddress = @{
        street = "Av. Test 123"
        city = "Buenos Aires"
        state = "CABA"
        zipCode = "1000"
        phone = "1234567890"
    }
    notes = "Orden de prueba"
} | ConvertTo-Json -Depth 5

Write-Host "`nPayload enviado:" -ForegroundColor Gray
Write-Host $orderBody -ForegroundColor DarkGray

try {
    $orderResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/orders" -Method Post -Body $orderBody -ContentType "application/json" -Headers @{
        "Authorization" = "Bearer $token"
    }
    
    Write-Host "`n✅ ORDEN CREADA EXITOSAMENTE" -ForegroundColor Green
    Write-Host "`nDetalles de la orden:" -ForegroundColor Yellow
    $orderResponse.data.order | ConvertTo-Json -Depth 3
    
} catch {
    Write-Host "`n❌ ERROR AL CREAR ORDEN" -ForegroundColor Red
    Write-Host "`nStatus Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "`nRespuesta del servidor:" -ForegroundColor Yellow
        $errorBody
    }
}

Write-Host "`n=== FIN DEL TEST ===" -ForegroundColor Cyan
