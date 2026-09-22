# Hướng Dẫn Vận Hành (Operations Guide) - FoodRecommend

Tài liệu này cung cấp các hướng dẫn cơ bản để duy trì và vận hành hệ thống FoodRecommend trong môi trường Production/Staging.

---

## 1. Kiến Trúc Triển Khai
Hệ thống được đóng gói 100% bằng Docker và chạy qua `docker-compose.prod.yml`.
- **API Server:** Chạy Node.js ở cổng `3000`.
- **PostgreSQL (Database chính):** Chứa thông tin User, Posts, Swipes, Groups.
- **Redis (Feature Store / Cache):** Dùng cho caching và state management.
- **Kafka & Zookeeper (Event Bus):** Xử lý hàng đợi sự kiện (Ví dụ: Sự kiện quẹt trái/phải).
- **Qdrant (Vector DB):** Lưu trữ Embeddings của món ăn để AI truy vấn.

---

## 2. Các Lệnh Triển Khai Cơ Bản

### Deploy mới (hoặc Update)
Khi có code mới trên nhánh `main`, hãy chạy script Deploy tự động:
```bash
cd scripts
./deploy_staging.sh
```

### Khởi động lại hệ thống
```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

### Xem Log Hệ Thống
Để xem log của Backend API (khi có lỗi 500 hoặc server crash):
```bash
docker compose -f docker-compose.prod.yml logs -f api
```
*(Ấn Ctrl+C để thoát khỏi màn hình log)*

---

## 3. Sao Lưu (Backup) & Phục Hồi Dữ Liệu

### Sao Lưu Tự Động
Hệ thống cung cấp sẵn file `scripts/backup.sh`. Bạn cần thêm file này vào crontab (Linux) để chạy tự động mỗi 12 tiếng.
1. Cấp quyền chạy: `chmod +x scripts/backup.sh`
2. Mở Crontab: `crontab -e`
3. Thêm dòng sau:
```cron
0 */12 * * * /đường-dẫn-đến-dự-án/scripts/backup.sh
```

### Phục hồi Database (Restore)
Nếu Database bị mất dữ liệu, bạn có thể phục hồi từ file `.sql` đã backup:
```bash
cat /var/backups/foodrecommend/db_backup_xxxxx.sql | docker exec -i foodrecommend-db-1 psql -U fooduser -d foodrecommend
```

---

## 4. Kiểm Tra Sức Khỏe (Health Check) & Giám Sát
- **Health Check API:** Truy cập `http://your-server-ip:3000/api/health` để xác minh API và Database đang hoạt động (Trả về 200 OK).
- **Prometheus Metrics:** Truy cập `http://your-server-ip:3000/metrics` để xem chỉ số kỹ thuật (RAM, CPU, Request Rate) dành cho Grafana Dashboard.

## 5. Cảnh Báo An Ninh (Security)
- **Rate Limit:** Hệ thống tự động giới hạn 100 requests / 15 phút. Người dùng vượt quá giới hạn sẽ nhận mã 429 (Too Many Requests).
- **Tuyệt đối KHÔNG** lưu file `.env` lên Github. Nếu lộ JWT Secret hoặc DB Password, phải lập tức tạo mã mới và restart server.
