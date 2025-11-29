# Script para probar el registro de usuario
$body = @{
    name = "rosio catalica"
    email = "rosioametlleer@gmail.com"
    password = "123456"
    confirmPassword = "123456"
} | ConvertTo-Json

Write-Host "`nProbando registro en http://localhost:3001/api/auth/register`n" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ REGISTRO EXITOSO`n" -ForegroundColor Green
    Write-Host "Respuesta del servidor:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ ERROR EN REGISTRO`n" -ForegroundColor Red
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "Status Code: $statusCode" -ForegroundColor Yellow
    
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "`nRespuesta del servidor:" -ForegroundColor Yellow
        $errorBody | ConvertFrom-Json | ConvertTo-Json -Depth 5
    }
}
