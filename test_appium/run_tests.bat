@echo off
chcp 65001 > nul
title FoodRecommend - Chạy Kiểm Thử Tự Động Appium + Allure

echo ======================================================
echo    CHẠY TOÀN BỘ KIỂM THỬ (UI APPIUM + API + DATABASE)
echo ======================================================
echo.

cd /d "%~dp0"

echo [1/3] Kiểm tra các thư viện Python cần thiết...
python -m pip install -r requirements.txt --quiet

echo.
echo [2/3] Tiến hành chạy Pytest và thu thập Allure Results...
python -m pytest tests --alluredir=allure-results --clean-alluredir %*

set TEST_EXIT_CODE=%ERRORLEVEL%

echo.
echo [3/3] Kết thúc đợt kiểm thử với mã: %TEST_EXIT_CODE%
echo.
echo Kết quả Allure đã được lưu tại thư mục: test_appium\allure-results
echo Bạn có thể mở báo cáo bằng cách chạy: view_report.bat
echo.

set /p OPEN_REPORT="Bạn có muốn mở Allure Report ngay bây giờ không? (Y/N): "
if /i "%OPEN_REPORT%"=="Y" (
    call view_report.bat
)

exit /b %TEST_EXIT_CODE%
