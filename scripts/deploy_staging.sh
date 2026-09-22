#!/bin/bash
# Deploy Script for FoodRecommend Staging/Prod

set -e

echo "🚀 Bắt đầu quá trình Deploy FoodRecommend Backend..."

# 1. Kéo code mới nhất
echo "📦 Đang pull code mới nhất từ git..."
git pull origin main

# 2. Build Docker Image
echo "🐳 Đang build Docker Image..."
docker compose -f docker-compose.prod.yml build

# 3. Khởi động lại các container
echo "🔄 Khởi động lại dịch vụ..."
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# 4. Kiểm tra trạng thái
echo "✅ Deploy hoàn tất! Đang kiểm tra trạng thái container:"
docker compose -f docker-compose.prod.yml ps

echo "🎉 Hoàn tất! Backend đã sẵn sàng trên cổng 3000."
