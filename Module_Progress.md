# Báo Cáo Tiến Độ Dự Án FoodRecommend (Module Progress)

*Cập nhật lần cuối: 2026-08-04*

Dựa trên tài liệu `DevelopmentPlan.md`, `FoodRecommend_Product_Specification.md`, và `ProductDesignDocument.md`, đây là bản đánh giá toàn diện về trạng thái của các module và tính năng hiện tại trong workspace.

## 1. Phân Loại Tình Trạng Tính Năng
- ✅ **Đã phát triển đầy đủ:** Hoàn thiện (ở cấp độ MVP), không cần phát triển thêm cho đến Giai đoạn Scale.
- 🟡 **Đang phát triển (Mock):** Đã khởi tạo, có khung code và luồng chạy, nhưng đang dùng dữ liệu, fallback hoặc logic giả lập (Mock).
- ⏳ **Đã khởi tạo nhưng chưa phát triển:** Có file/thư mục trống hoặc base code cơ bản, chưa có luồng nghiệp vụ.
- ❌ **Chưa phát triển:** Nằm trong lộ trình (Giai đoạn Beta/Scale) nhưng chưa bắt đầu.

---

## 2. Chi Tiết Các Tính Năng (Modules)

### 2.1 Infrastructure & DevOps Module (Platform)
- ✅ **Khởi tạo Database Schema & Seed Data:** Đã hoàn thiện file `schema.sql`, `seed.sql`. Bảng và quan hệ chuẩn.
- ✅ **Cấu trúc Backend & Frontend Foundation:** Đã thiết lập khung kiến trúc Node.js/Express, Flutter (UI).
- 🟡 **Docker Compose & Môi trường:** PostgreSQL, Redis đã setup trong `docker-compose.yml`. Tuy nhiên, code hiện tại đang fallback sang dữ liệu Mock khi mất kết nối DB (do lỗi Execution Policy).
- 🟡 **Message Queue (Kafka):** Consumer/Producer đã có base code nhưng đang xử lý in-memory mock.
- ⏳ **API Gateway (Kong/Nginx):** Đã tạo thư mục `gateway/` nhưng chưa có cấu hình routing thực tế.

### 2.2 Core/Auth Module
- 🟡 **Authentication (Đăng ký/Đăng nhập):** UI đã có ở Frontend (`frontend/lib/screens/auth`). Backend có API `POST /login`, `POST /register`, tuy nhiên DB schema thiếu cột `password` nên API đang giả lập (Mock JWT). 

### 2.3 User Profile & Preference Module (Tab 4 & Tab 5)
- ✅ **Giao diện Cài đặt Khẩu vị & Onboarding:** Đã phát triển bằng Flutter.
- 🟡 **API Quản lý thông tin (Preferences):** Đã có `user.routes.ts`. Việc xử lý dị ứng (allergies), chế độ ăn kiêng (dietary restrictions) chưa được hook sâu vào AI Engine để lọc ứng viên (Candidate Filtering).

### 2.4 Restaurant & Dish Data Module
- ✅ **Giao diện Swipe Card & Video Popup:** Đã dựng UI thẻ món ăn và Popup hiển thị món ăn trên Feed.
- 🟡 **API Thông tin nhà hàng:** Đã khởi tạo (`restaurant.routes.ts`) nhưng thiếu logic Deep link thực tế tới GrabFood/ShopeeFood (hiện chỉ là chuỗi URI giữ chỗ).
- 🟡 **Delivery & Maps Integration:** Có `maps_service.dart`, `delivery_link_service.dart` nhưng chưa gắn Google Maps SDK thật.

### 2.5 Social & Feed Module (Tab 1)
- ✅ **Giao diện Feed lướt dọc (TikTok Style):** Dựng UI mượt mà, bao gồm Video Player.
- 🟡 **Cơ chế Social (Like, Comment, Follow):** API `social.routes.ts` dùng danh sách mock, chưa tích hợp phân trang (Cursor-based pagination) hoặc lọc theo Feed Follower.
- ❌ **Verified Reviewer System:** Chưa có cơ chế xét duyệt cấp tích xanh hoặc Dashboard Merchant.

### 2.6 Recommendation & AI Engine Module (Tab 3)
- ✅ **AI Embeddings & Offline Training:** Script Python (`generate_embeddings.py`) đã có để sinh vector mẫu, `ingest_qdrant.py` để đẩy vào Vector DB (Dùng MockQdrantClient tránh lỗi thiếu thư viện).
- ✅ **Swipe UI & Animation:** Giao diện vuốt thẻ mượt mà (`swipe_animation.dart`, `theme.dart`).
- 🟡 **Luồng Online Inference:** AI Pipeline (Candidate Generation -> Ranking -> Re-ranking) mô tả trong tài liệu chưa được implement. Hệ thống hiện chỉ trả về danh sách recommendation tĩnh.

### 2.7 Group Decision & Trip Planner Module (Tab 2)
- ✅ **Thuật toán Split Bill:** Logic chia tiền nhóm hiệu năng cao đã hoàn thiện (`splitBill.ts`).
- 🟡 **UI Quản lý Nhóm & Trip Planner:** Giao diện Flutter đã có khung, API tạo nhóm và thêm thành viên hoạt động (`group.routes.ts`).
- ❌ **Group Recommendation (AI Voting):** Gợi ý món chung cho nhóm bằng Pareto Aggregation và tính năng Bình chọn chưa được phát triển.
- ❌ **Hẹn ăn & Trip Planner (AI Routing):** Việc tích hợp AI LLM hoặc giải bài toán tối ưu lộ trình (TSP) theo điểm dừng Google Maps chưa có code thực thi.

### 2.8 Testing & Load Optimization
- ✅ **E2E & Load Testing:** Script K6 (`k6-script.js`) và Jest (`auth.e2e.test.ts`, `swipe.e2e.test.ts`) hoạt động và 100% Pass dựa trên cơ chế mock DB.
- 🟡 **Redis Caching:** Module `cache.ts` sử dụng `MockRedisClient` quản lý TTL, chưa call Redis thật.

---

## 3. Nhận Xét & Bước Đi Tiếp Theo
Hệ thống FoodRecommend hiện tại đã **Hoàn thành xuất sắc Khung sườn MVP (Skeleton & Mock UI)**. Tất cả các Module đều đã được chạm tới và có Base code.
Tuy nhiên, dự án đang ở trạng thái **Mock-Driven Development**. Để tiến tới bản Beta thực tế, các Task tiếp theo (nằm ngoài scope MVP) cần tập trung:
1. Gỡ bỏ Mock Code ở Backend, kết nối Database (Postgres), Redis, Kafka và Qdrant thực tế.
2. Thiết lập lại bảng `users` với hệ thống Authentication thực sự.
3. Triển khai AI Engine: Thuật toán lọc (Candidate Filtering) và Ranking thay vì trả về mảng tĩnh.
4. Cắm API Key thật cho Google Maps và Delivery SDK.
