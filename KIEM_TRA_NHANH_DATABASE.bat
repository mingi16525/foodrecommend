@echo off
chcp 65001 > nul
title FoodRecommend - Kiểm Tra Nhanh Dữ Liệu Database

:menu
cls
echo ======================================================
echo    MENU KIỂM TRA NHANH DỮ LIỆU ĐỒNG BỘ TRONG DATABASE
echo ======================================================
echo [1] Kịch bản 1: Xem User mới đăng ký & Trạng thái OTP (is_verified)
echo [2] Kịch bản 2: Xem Hồ sơ sở thích ăn uống & Dị ứng (user_preferences)
echo [3] Kịch bản 3: Xem Lịch sử quẹt món ăn (user_swipes)
echo [4] Kịch bản 4: Xem Bài review & Quán ăn tự tạo (restaurants, posts)
echo [5] Kịch bản 5: Xem Quán đã claim & Thực đơn món ăn (dishes)
echo [6] Kịch bản 6: Xem Nhóm ăn & Đơn hàng chia tiền (groups, group_orders)
echo [7] Tự gõ lệnh SQL tuỳ ý (Mở terminal psql)
echo [0] Thoát
echo ======================================================
set /p opt="Chọn số kịch bản cần kiểm tra [0-7]: "

if "%opt%"=="1" goto kb1
if "%opt%"=="2" goto kb2
if "%opt%"=="3" goto kb3
if "%opt%"=="4" goto kb4
if "%opt%"=="5" goto kb5
if "%opt%"=="6" goto kb6
if "%opt%"=="7" goto kb7
if "%opt%"=="0" exit
goto menu

:kb1
cls
echo ======================================================
echo  [KỊCH BẢN 1] 5 USER MỚI NHẤT & TRẠNG THÁI XÁC THỰC OTP
echo ======================================================
docker exec foodrecommend-postgres-1 psql -U fooduser -d foodrecommend -c "SELECT id, email, full_name, is_verified, created_at FROM users ORDER BY created_at DESC LIMIT 5;"
echo.
pause
goto menu

:kb2
cls
echo ======================================================
echo  [KỊCH BẢN 2] HỒ SƠ SỞ THÍCH ĂN UỐNG & DỊ ỨNG MỚI NHẤT
echo ======================================================
docker exec foodrecommend-postgres-1 psql -U fooduser -d foodrecommend -c "SELECT u.email, p.favorite_flavors, p.allergies, p.dietary_restrictions, p.hated_dishes FROM user_preferences p JOIN users u ON p.user_id = u.id ORDER BY u.created_at DESC LIMIT 5;"
echo.
pause
goto menu

:kb3
cls
echo ======================================================
echo  [KỊCH BẢN 3] 10 LƯỢT QUẸT MÓN MỚI NHẤT (USER_SWIPES)
echo ======================================================
docker exec foodrecommend-postgres-1 psql -U fooduser -d foodrecommend -c "SELECT s.id, u.email, d.name AS mon_an, s.action, s.created_at FROM user_swipes s JOIN users u ON s.user_id = u.id JOIN dishes d ON s.dish_id = d.id ORDER BY s.created_at DESC LIMIT 10;"
echo.
pause
goto menu

:kb4
cls
echo ======================================================
echo  [KỊCH BẢN 4] 5 BÀI REVIEW VÀ QUÁN ĂN LIÊN KẾT
echo ======================================================
docker exec foodrecommend-postgres-1 psql -U fooduser -d foodrecommend -c "SELECT p.id, u.email, r.name AS quan_an, r.is_verified, p.content, p.created_at FROM posts p JOIN users u ON p.user_id = u.id LEFT JOIN restaurants r ON p.restaurant_id = r.id ORDER BY p.created_at DESC LIMIT 5;"
echo.
pause
goto menu

:kb5
cls
echo ======================================================
echo  [KỊCH BẢN 5] QUÁN ĂN ĐÃ CLAIM & 5 MÓN ĂN MỚI THÊM
echo ======================================================
docker exec foodrecommend-postgres-1 psql -U fooduser -d foodrecommend -c "SELECT id, name, claimed_by, is_verified FROM restaurants WHERE claimed_by IS NOT NULL LIMIT 5;"
docker exec foodrecommend-postgres-1 psql -U fooduser -d foodrecommend -c "SELECT id, name, price, restaurant_id FROM dishes ORDER BY name ASC LIMIT 5;"
echo.
pause
goto menu

:kb6
cls
echo ======================================================
echo  [KỊCH BẢN 6] DANH SÁCH NHÓM & ĐƠN HÀNG CHIA TIỀN
echo ======================================================
docker exec foodrecommend-postgres-1 psql -U fooduser -d foodrecommend -c "SELECT id, name, created_by, created_at FROM groups ORDER BY created_at DESC LIMIT 5;"
docker exec foodrecommend-postgres-1 psql -U fooduser -d foodrecommend -c "SELECT id, group_id, status, total_amount, created_at FROM group_orders ORDER BY created_at DESC LIMIT 5;"
echo.
pause
goto menu

:kb7
call "%~dp0MO_POSTGRES_SQL.bat"
goto menu
