@echo off
title FoodRecommend - Theo Doi Log Backend Real-time
echo ======================================================
echo    DANG THEO DOI LOG BACKEND THEO THOI GIAN THUC...
echo    (Nhan Ctrl + C de thoat xem log)
echo ======================================================
echo.
docker logs -f --tail 30 foodrecommend-backend-1
