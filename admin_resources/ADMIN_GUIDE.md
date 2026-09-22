# Hướng Dẫn Dành Cho Admin (FoodRecommend)

## 1. Giới thiệu chung
Chào mừng bạn đến với hệ thống Quản trị FoodRecommend. Tài liệu này cung cấp hướng dẫn để bạn có thể theo dõi hệ thống, quản lý dữ liệu, và chạy các công cụ (tools) tự động.

## 2. Quản lý Dữ liệu Quán ăn và AI
Hệ thống sử dụng **Google Gemini** để hỗ trợ AI và **Qdrant** làm Vector DB để gợi ý.
- **Để cập nhật dữ liệu quán ăn:** Bạn có thể chạy script crawl dữ liệu tại `tools/tool_get_food/index.js`. Script này tự động gọi API Google Maps và lưu trữ vào Database.
- **Để tạo dữ liệu mô phỏng (Demo Users):** Chạy script tại `tools/tool_user/index.js` để tạo ra các Premium Users và dữ liệu tương tác mẫu (Swipe, Review).

### Cách chạy Tools
Mở Terminal/Command Prompt tại thư mục dự án và gõ lệnh:
```bash
# Cài đặt thư viện cho tools
cd tools/tool_get_food
npm install
# Chạy tool lấy dữ liệu quán
npm start

cd ../tool_user
npm install
# Chạy tool tạo user
npm start
```

## 3. Xem Log & Giám sát Hệ thống (Observability)
Hệ thống Backend (Node.js) sử dụng `winston` để ghi log và xuất ra Prometheus.
- **Log lỗi (Error Logs):** Tự động ghi vào thư mục `logs/error.log`.
- **Chỉ số hệ thống (Metrics):** Bạn có thể truy cập `http://your-server-ip:3000/api/health/metrics` để theo dõi lượng request, CPU, RAM của máy chủ.

## 4. Quản lý Gói Cước (Premium)
Hiện tại, người dùng được chia thành 2 Tier: `FREE` và `PREMIUM`. 
Chỉ có user `PREMIUM` mới có quyền tạo Nhóm (Group) và sử dụng tính năng **Trip Planner** (Gợi ý theo lịch trình nhiều ngày).
Bạn có thể thay đổi Tier của một người dùng trong Database thông qua câu lệnh SQL cơ bản:
```sql
UPDATE users SET subscription_tier = 'PREMIUM' WHERE email = 'user@example.com';
```

## 5. Cần hỗ trợ?
Nếu gặp lỗi hệ thống (như 502 Bad Gateway), vui lòng kiểm tra trạng thái Docker Compose bằng lệnh:
```bash
docker-compose -f docker-compose.prod.yml ps
```
Hoặc liên hệ với bộ phận Kỹ thuật.
