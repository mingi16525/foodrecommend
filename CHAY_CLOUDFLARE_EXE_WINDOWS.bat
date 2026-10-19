@echo off
chcp 65001 > nul
title FoodRecommend - Cloudflare Tunnel Exe Windows

echo ======================================================
echo    CHẠY CLOUDFLARE TUNNEL TRỰC TIẾP (WINDOWS BINARY)
echo ======================================================
echo Đang trỏ Tunnel vào Backend local (http://localhost:3000)...
echo.

set CLOUDFLARED="C:\Users\giang\AppData\Local\Programs\Antigravity IDE\bin\cloudflared.exe"

if exist %CLOUDFLARED% (
    %CLOUDFLARED% tunnel --url http://localhost:3000
) else (
    echo [LỖI] Không tìm thấy cloudflared.exe tại: %CLOUDFLARED%
    echo Vui lòng dùng file CHAY_HE_THONG_VA_CLOUDFLARE.bat để chạy qua Docker.
    pause
)
