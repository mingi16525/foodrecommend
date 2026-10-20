@echo off
chcp 65001 > nul
title FoodRecommend - Khởi Chạy Báo Cáo Allure Report

cd /d "%~dp0"

echo ======================================================
echo           XUẤT BÁO CÁO TRỰC QUAN ALLURE REPORT
echo ======================================================
echo.

set "RESULTS_DIR=allure-results"
if not exist "%RESULTS_DIR%" (
    if exist "..\allure-results" (
        set "RESULTS_DIR=..\allure-results"
    )
)

if not exist "%RESULTS_DIR%" (
    echo [LỖI] Không tìm thấy thư mục kết quả: %RESULTS_DIR%
    echo Vui lòng chạy kiểm thử trước bằng file run_tests.bat
    echo.
    pause
    exit /b 1
)

:: Kiểm tra nếu có sẵn lệnh allure CLI trong hệ điều hành
where allure >nul 2>&1
if not errorlevel 1 goto :use_allure_cli

:: Nếu không có, kiểm tra lệnh npx của Node.js
where npx >nul 2>&1
if not errorlevel 1 goto :use_npx_allure

echo [THÔNG BÁO] Chưa tìm thấy công cụ Allure CLI hoặc Node.js npx.
echo.
echo Bạn có thể cài đặt Allure CLI bằng lệnh:
echo   npm install -g allure-commandline --save-dev
echo.
pause
exit /b 1

:use_allure_cli
echo [OK] Đang khởi chạy Allure Server qua Allure CLI...
echo Trình duyệt web sẽ tự động mở xem báo cáo kiểm thử.
echo Nhấn Ctrl+C để dừng Allure Server khi xem xong.
echo.
allure serve "%RESULTS_DIR%"
goto :end

:use_npx_allure
echo [OK] Tìm thấy Node.js npx. Đang khởi chạy Allure qua npx allure-commandline...
echo Trình duyệt web sẽ tự động mở xem báo cáo kiểm thử.
echo Nhấn Ctrl+C để dừng Allure Server khi xem xong.
echo.
call npx --yes allure-commandline serve "%RESULTS_DIR%"
goto :end

:end


