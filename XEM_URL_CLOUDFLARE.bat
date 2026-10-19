@echo off
chcp 65001 > nul
title FoodRecommend - Xem URL Cloudflare Hiện Tại

echo ======================================================
echo       KIỂM TRA URL CLOUDFLARE TUNNEL HIỆN TẠI
echo ======================================================

set /p URL=<"%~dp0ACTIVE_TUNNEL_URL.txt"

echo.
echo 🌐 Public Tunnel URL: %URL%
echo 🏥 Healthcheck:      %URL%/api/health
echo 📶 LAN Wi-Fi PC:     http://192.168.1.89:3000
echo ======================================================
echo.
echo Bạn có muốn mở link Healthcheck trên trình duyệt để kiểm tra không? (Y/N)
set /p CHOICE="Lựa chọn (mặc định Y): "

if /i "%CHOICE%"=="N" goto end
start "" "%URL%/api/health"

:end
echo.
pause
