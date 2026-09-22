#!/bin/bash

# =========================================================================
# FOODRECOMMEND - AUTOMATED BACKUP SCRIPT
# Run this via Cronjob (e.g. `0 */12 * * * /path/to/backup.sh`)
# =========================================================================

set -e

BACKUP_DIR="/var/backups/foodrecommend"
DATE=$(date +%Y%m%d_%H%M%S)

# Tải cấu hình từ .env
source ../.env

echo "🚀 Bắt đầu quá trình sao lưu - $DATE"
mkdir -p "$BACKUP_DIR"

# 1. Backup PostgreSQL
echo "📦 Đang sao lưu PostgreSQL..."
PG_BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"
# Lệnh dump (Chạy thông qua docker exec để tận dụng container pg)
docker exec -t foodrecommend-db-1 pg_dump -U fooduser -d foodrecommend > "$PG_BACKUP_FILE"
echo "✅ Đã lưu PostgreSQL vào $PG_BACKUP_FILE"

# 2. Backup Qdrant (Vector DB)
# Qdrant hỗ trợ tính năng Snapshot qua API
echo "📦 Đang tạo Snapshot Qdrant..."
curl -X POST "$QDRANT_URL/collections/food_dishes/snapshots"
echo "✅ Đã yêu cầu Qdrant tạo Snapshot"

# 3. Dọn dẹp (Xóa các file backup cũ hơn 7 ngày)
find "$BACKUP_DIR" -type f -name "*.sql" -mtime +7 -delete
echo "🧹 Đã dọn dẹp các bản sao lưu cũ."

echo "🎉 Quá trình sao lưu hoàn tất!"
