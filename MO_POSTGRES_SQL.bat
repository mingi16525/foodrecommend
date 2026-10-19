@echo off
chcp 65001 > nul
title FoodRecommend - PostgreSQL Terminal (foodrecommend)

echo ======================================================
echo     CỬA SỔ TRUY VẤN DATABASE POSTGRESQL (PSQL)
echo ======================================================
echo Bạn đang kết nối vào database 'foodrecommend'.
echo Hãy copy và paste các câu lệnh SQL trong tài liệu vào đây:
echo Ví dụ: SELECT id, email, is_verified FROM users;
echo ------------------------------------------------------
echo Gõ \q rồi nhấn Enter để thoát khỏi psql.
echo.

docker exec -it foodrecommend-postgres-1 psql -U fooduser -d foodrecommend
