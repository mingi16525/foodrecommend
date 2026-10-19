# Script sync Cloudflare Tunnel URL từ Docker container sang project & mobile config
$ErrorActionPreference = "SilentlyContinue"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   FOOD RECOMMEND - CLOUDFLARE TUNNEL AUTO SYNC      " -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

# 1. Đảm bảo docker compose services đang chạy
Write-Host "[1/3] Đang khởi động các dịch vụ Docker (Backend, DB, Cloudflare)..." -ForegroundColor Green
docker compose up -d

# 2. Đợi và lấy URL từ logs của cloudflared
Write-Host "[2/3] Đang lấy Public Tunnel URL từ Cloudflare..." -ForegroundColor Green
$tunnelUrl = ""
for ($i = 0; $i -lt 15; $i++) {
    $logs = docker compose logs cloudflared 2>&1
    if ($logs -match "https://([a-zA-Z0-9\-]+)\.trycloudflare\.com") {
        $tunnelUrl = $matches[0]
        break
    }
    Start-Sleep -Seconds 1
}

if (-not $tunnelUrl) {
    Write-Host "[CẢNH BÁO] Chưa lấy được URL tự động từ container cloudflared." -ForegroundColor Yellow
    Write-Host "Đang thử đọc URL cũ..." -ForegroundColor Yellow
    if (Test-Path "ACTIVE_TUNNEL_URL.txt") {
        $tunnelUrl = (Get-Content "ACTIVE_TUNNEL_URL.txt" -Raw).Trim()
    }
}

if ($tunnelUrl) {
    Write-Host "[3/3] Đã phát hiện Public URL: $tunnelUrl" -ForegroundColor Green
    
    # Lưu vào ACTIVE_TUNNEL_URL.txt
    $tunnelUrl | Out-File -FilePath "ACTIVE_TUNNEL_URL.txt" -Encoding utf8 -NoNewline
    
    # Cập nhật vào frontend/lib/config/api_config.dart
    $apiConfigFile = "frontend/lib/config/api_config.dart"
    if (Test-Path $apiConfigFile) {
        $content = Get-Content $apiConfigFile -Raw
        $content = $content -replace "static const String defaultTunnelUrl = '.*?';", "static const String defaultTunnelUrl = '$tunnelUrl';"
        $content = $content -replace "static String baseUrl = .*?;", "static String baseUrl = defaultTunnelUrl;"
        $content | Out-File -FilePath $apiConfigFile -Encoding utf8 -NoNewline
        Write-Host " -> Đã đồng bộ vào: $apiConfigFile" -ForegroundColor Gray
    }

    Write-Host "`n======================================================" -ForegroundColor Cyan
    Write-Host " ✅ TẤT CẢ DỊCH VỤ ĐÃ SẴN SÀNG!" -ForegroundColor Green
    Write-Host " 🌐 PUBLIC CLOUDFLARE URL:" -ForegroundColor Yellow
    Write-Host "    $tunnelUrl" -ForegroundColor White -BackgroundColor DarkBlue
    Write-Host " 🏥 HEALTHCHECK ENDPOINT:" -ForegroundColor Yellow
    Write-Host "    $tunnelUrl/api/health" -ForegroundColor Cyan
    Write-Host " 📶 MẠNG NỘI BỘ (WI-FI LAN):" -ForegroundColor Yellow
    Write-Host "    http://192.168.1.89:3000" -ForegroundColor Cyan
    Write-Host "======================================================`n" -ForegroundColor Cyan
} else {
    Write-Host "❌ Không thể khởi động Cloudflare Tunnel. Vui lòng kiểm tra Docker Desktop." -ForegroundColor Red
}
