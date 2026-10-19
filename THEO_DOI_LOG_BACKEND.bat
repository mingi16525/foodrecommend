@echo off
chcp 65001 > nul
title FoodRecommend - Theo Dõi Log Backend Real-time

echo ======================================================
echo    CỬA SỔ THEO DÕI LOG BACKEND THEO THỜI GIAN THỰC
echo ======================================================
echo Mọi thao tác trên App (Gọi API, Đăng nhập, Mã OTP, Lỗi)
echo sẽ xuất hiện trực tiếp ngay dưới đây:
echo ------------------------------------------------------
echo (Nhấn Ctrl + C nếu muốn dừng xem log)
echo.

docker logs -f --tail 30 foodrecommend-backend-1
pause
