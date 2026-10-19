@echo off
chcp 65001 > nul
title FoodRecommend - Kiểm Tra Nhanh Dữ Liệu Database
node "%~dp0scripts\check_db.js"
