# Kế Hoạch Triển Khai & Kiểm Thử Bản Beta Trên Máy Cá Nhân (Local Beta Deployment Plan)

Tài liệu này vạch ra lộ trình để chuyển đổi dự án từ giai đoạn **MVP (Mock-Driven)** sang **Bản Build Beta Chạy Thực Tế Trên Máy Cá Nhân (Localhost)**. Quá trình này đảm bảo mọi thuật toán AI, luồng dữ liệu, và giao diện hoạt động chính xác theo đặc tả trong `ProductDesignDocument.md` và `FoodRecommend_Product_Specification.md` trước khi tốn chi phí lên Cloud.

---

## 1. Phase 1: Chuẩn Bị Hạ Tầng Local (Local Infrastructure Readiness)
Mục tiêu: Đảm bảo toàn bộ backend, database và message queue chạy trơn tru trên Docker của máy cá nhân.

- [ ] **Khởi động Local Docker Compose**: Chạy toàn bộ PostgreSQL, Redis, Qdrant (Vector DB) và Kafka bằng Docker trên máy cá nhân (`docker-compose up -d`).
- [ ] **Kiểm tra kết nối DB**: Xác nhận Backend Node.js kết nối thành công tới tất cả các services ở `localhost` (Bỏ qua cơ chế fallback Mock Data).
- [ ] **Cấu hình môi trường**: Cập nhật file `.env` trỏ toàn bộ URL về `localhost` (ví dụ: `DB_HOST=localhost`, `QDRANT_URL=http://localhost:6333`).

---

## 2. Phase 2: Chuẩn Bị Dữ Liệu Thực Tế (Data Preparation)
Mục tiêu: Xóa bỏ dữ liệu Seed sơ sài, nạp bộ dữ liệu Beta đủ lớn và sát với thực tế để thuật toán AI có thể học và phân tích.

- [ ] **Nạp Database PostgreSQL**: 
  - Sinh ít nhất 50 Quán ăn (Restaurants) thực tế (kèm tọa độ địa lý, Geohash).
  - Sinh ít nhất 500 Món ăn (Dishes) phân loại theo các tags: Cay, Không cay, Chay, Mặn, Hải sản.
  - Tạo 20 User giả lập có các `user_preferences` (Khẩu vị, Dị ứng) phong phú khác nhau.
- [ ] **Nạp Dữ liệu Vector (Qdrant)**:
  - Chạy script Python để sinh Vector Embeddings cho 500 món ăn bằng model `all-MiniLM-L6-v2` (HuggingFace) dựa trên Tên món, Thành phần, Tags.
  - Đẩy 500 vectors này vào collection `dishes` trên Qdrant local.

---

## 3. Phase 3: Triển Khai Thuật Toán AI Thực Tế (AI Pipeline Implementation)
Mục tiêu: Viết code thực thi logic kiến trúc AI đa tầng (Multi-tier AI Routing) như trong Mô tả thuật toán thay thế cho API Mock hiện tại.

- [ ] **AI Decision Routing (Bộ định tuyến)**:
  - Viết module Decision Complexity Estimator để phân loại request.
- [ ] **Fast Tier AI (Gợi ý siêu tốc)**:
  - Code API Node.js gọi Qdrant Vector Search kết hợp Context Engine, lọc Geohash, FAISS Ranking và Optimizer để trả về gợi ý quẹt thẻ Swipe nhanh nhất (<100ms).
- [ ] **Medium Tier AI (Quyết định Nhóm)**: 
  - Triển khai logic tổng hợp (Pareto Aggregation) và ràng buộc cứng (ngân sách, dị ứng) để gợi ý danh sách món ăn/quán ăn thỏa mãn cả nhóm.
- [ ] **Deep Tier AI (Trip Planner AI)**: 
  - Code luồng kết nối Google Maps API để tính lộ trình.
  - Viết module LLM Orchestrator (Gemini/OpenAI) kết hợp RAG để gợi ý các quán dọc tuyến đường.
- [ ] **AI Infrastructure (Sự kiện & Cache)**:
  - Tích hợp Kafka để hứng event (Swipe, Like) từ Frontend và cập nhật Feature Store (Redis) realtime.

---

## 4. Phase 4: Tích Hợp API Bên Thứ Ba (Third-party APIs)
- [ ] **Google Maps SDK**: Thêm API Key thực tế để hiển thị bản đồ và tính toán khoảng cách quán ăn.
- [ ] **Giao hàng (Deep-linking)**: Thêm các URL Scheme mở app thật (ShopeeFood, Grab) truyền tham số tên quán.
- [ ] **Bảo mật Auth**: Code JWT thực tế, kết nối Database kiểm tra Hash Password thay vì bỏ qua bước check.

---

## 5. Phase 5: Build và Chạy Thử App Trên Máy Cá Nhân (App Build & Test)
Mục tiêu: Đưa Frontend kết nối với Backend Local để người dùng có thể lướt, vuốt thẻ, xem phản hồi AI ngay trên điện thoại hoặc Emulator.

- [ ] **Mobile App Config**: Cập nhật endpoint của app Flutter trỏ về IP của máy cá nhân (ví dụ: `192.168.1.x:3000`).
- [ ] **Chạy trên Máy Thật/Emulator**: Build ứng dụng (Debug Mode) trực tiếp qua cáp USB vào điện thoại (Android/iOS) hoặc chạy trên Android Studio Emulator.
- [ ] **Manual E2E Testing**:
  - Test vuốt thẻ ở Tab 3, theo dõi log console để xem AI có tính lại (recalculate) danh sách gợi ý đúng hay không.
  - Test tạo nhóm ở Tab 2, nạp 2 user có sở thích trái ngược, xem AI gợi ý nhóm xử lý thế nào.
  - Test Feed ở Tab 1.

---
*Ghi chú: Lộ trình này dành riêng cho việc test trên Local. Khi hệ thống Local Beta (Backend + AI + App) đã hoàn chỉnh và chính xác, dự án mới tiến tới việc đóng gói (Dockerize) đẩy lên Cloud và phân phối Beta TestFlight/APK cho người dùng ngoài.*
