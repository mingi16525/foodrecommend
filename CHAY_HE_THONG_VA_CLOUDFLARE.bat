@echo off
chcp 65001 > nul
title FoodRecommend - Khởi Động Toàn Bộ Hệ Thống ^& Cloudflare Tunnel

echo ======================================================
echo    KHỞI CHẠY HỆ THỐNG BACKEND, DB VÀ CLOUDFLARE TUNNEL
echo ======================================================

node "%~dp0scripts\sync_tunnel.js"

echo.
echo Nhấn phím bất kỳ để đóng cửa sổ này (Các dịch vụ vẫn chạy ngầm trong Docker)...
pause > nul
