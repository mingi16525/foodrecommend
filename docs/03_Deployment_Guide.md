# 3. Hướng Dẫn Triển Khai (Deployment Guide)

## 1. Yêu Cầu Hệ Thống (Prerequisites)
- Node.js >= 18.x
- Docker & Docker Compose
- Môi trường phát triển Flutter (nếu cần chạy App)
- Google Gemini API Key

## 2. Thiết Lập Môi Trường (Environment Variables)
Tạo file `.env` ở thư mục gốc (từ file `.env.example`):
```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/food_recommend_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key
KAFKA_BROKER=localhost:9092
GEMINI_API_KEY=your_gemini_api_key
```

## 3. Khởi Chạy Local (Local Development)

### Bước 1: Chạy Hạ Tầng Bằng Docker
Hệ thống cần PostgreSQL, Redis, Qdrant và Kafka để hoạt động đầy đủ.
```bash
docker-compose up -d
```

### Bước 2: Chuẩn Bị Dữ Liệu (Schema & Seeding)
```bash
# Thiết lập CSDL
cat schema.sql | psql $DATABASE_URL
cat seed.sql | psql $DATABASE_URL
```
*(Trong tương lai, chúng ta sẽ chuyển sang ORM migrations chuẩn).*

### Bước 3: Cài đặt và Chạy Backend
```bash
npm install
npm run dev
```
Backend sẽ khởi chạy ở `http://localhost:3000`.

### Bước 4: Chạy Kiểm Thử (Testing)
Dự án sử dụng Jest để test backend.
```bash
# Chạy Unit & Integration tests
npm test

# Chạy kiểm tra tĩnh
npx tsc --noEmit
npm run lint
```

## 4. Môi Trường Production (Kubernetes & Docker)
Trong thư mục `k8s/` và file `docker-compose.prod.yml` chứa cấu hình để triển khai hệ thống lên cụm Kubernetes.
- `deployment.yaml`: Chạy Node.js backend.
- `service.yaml`: Gateway service.
- `hpa.yaml`: Auto-scaling khi lượng request (Traffic) tăng cao.
