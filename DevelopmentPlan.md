# Kế hoạch Triển khai Chi tiết cho Team Dev

Kế hoạch này vạch ra chi tiết các module cần xây dựng, phân chia công việc theo từng giai đoạn (Phase/Sprint) để xây dựng ứng dụng FoodRecommend, tập trung vào **Giai đoạn MVP (Tháng 1-6)** như đã định nghĩa trong tài liệu thiết kế (ProductDesignDocument.md).

---

## 1. Phân chia Module (Module Breakdown)

Hệ thống được chia thành 6 Core Modules để các team (Backend, Frontend, Data/AI) có thể phát triển song song:

### 1.1 Infrastructure & DevOps Module (Platform)
- Setup CI/CD pipeline (GitHub Actions / GitLab CI).
- Viết Docker Compose cho môi trường Development.
- Cấu hình API Gateway (Kong hoặc Nginx) cho routing và rate limiting.
- Setup Message Queue (Kafka/RabbitMQ) cho luồng Event-driven.
- Khởi tạo Database schema (PostgreSQL, Redis, Qdrant).

### 1.2 Core/Auth Module
- Đăng ký/Đăng nhập (sử dụng JWT hoặc OAuth2).
- Quản lý phiên đăng nhập và bảo mật.
- Xác thực và phân quyền (User vs Verified Reviewer vs Merchant).

### 1.3 User Profile & Preference Module (Tab 4 & Tab 5)
- Quản lý thông tin cá nhân.
- Quản lý thiết lập khẩu vị, dị ứng, chế độ ăn kiêng.
- Lưu trữ lịch sử tương tác cá nhân.

### 1.4 Restaurant & Dish Data Module
- CRUD cho thông tin Quán ăn, Thực đơn.
- Tích hợp Geocoding & lưu trữ tọa độ PostGIS.
- Tích hợp deep-link sang các nền tảng delivery (ShopeeFood, GrabFood, BeFood).

### 1.5 Social & Feed Module (Tab 1)
- Quản lý bài đăng (Post), Video ngắn kiểu TikTok.
- Tính năng tương tác: Like, Comment, Share, Bookmark.
- Xử lý UI Popup liên kết món ăn nổi lên trên video.

### 1.6 Recommendation & AI Engine Module (Tab 3)
- API thu thập Event theo thời gian thực (Vuốt trái/phải, Dwell time).
- Xây dựng luồng Offline Training (Cập nhật vector embeddings).
- Xây dựng luồng Online Inference (Lấy suggestions realtime).
- Xử lý Geohash filtering để lọc quán theo vị trí gần.

---

## 2. Các Giai đoạn Phát triển (Phases / Sprints)

*Giả định mỗi Sprint kéo dài 2 tuần.* Việc phân rã công việc (WBS) được chia nhỏ đến cấp độ tính năng để dễ dàng gán task.

### Phase 1: Foundation & Platform Setup (Sprint 1-2)
* **Phase 1.1: DevOps & Repository Setup**
  - [x] Khởi tạo Git repository, cấu hình `.gitignore`.
  - [x] Thiết lập Branching model (GitFlow / GitHub Flow).
  - [x] Cấu hình CI cơ bản (Linter, Formatter) qua GitHub Actions / GitLab CI.
* **Phase 1.2: Infrastructure Provisioning**
  - [x] Viết `docker-compose.yml` cho PostgreSQL và Redis.
  - [x] Tích hợp Qdrant/Milvus (Vector DB) vào Docker Compose.
  - [x] Setup Kafka/RabbitMQ container cho môi trường local.
* **Phase 1.3: Backend Base Setup**
  - [x] Khởi tạo base source code cho API Gateway.
  - [x] Khởi tạo base source code cho Backend Service (Node.js/Go).
  - [x] Cấu hình kết nối DB (Postgres) và Cache (Redis).
* **Phase 1.4: Database Schema Initialization**
  - [x] Viết script migration cho bảng `users`.
  - [x] Viết script migration cho bảng `restaurants`, `dishes`, `preferences`.
  - [x] Thực thi migration và kiểm tra tính toàn vẹn (Constraints, Foreign Keys).
* **Phase 1.5: Frontend Foundation**
  - [x] Khởi tạo project Mobile (Flutter/React Native).
  - [x] Setup Routing system và State Management (Redux/Riverpod/Zustand).
  - [x] Cấu hình thư mục assets (fonts, images) và UI/Theme colors.

### Phase 2: Auth, User Profile & Data Ingestion (Sprint 3-4)
* **Phase 2.1: Authentication Service**
  - [x] Backend: Viết API Đăng ký tài khoản (Register).
  - [x] Backend: Viết API Đăng nhập (Login) sinh JWT token.
  - [x] Frontend: Code UI màn hình Đăng ký / Đăng nhập.
  - [x] Frontend: Tích hợp gọi API Auth và lưu trữ token an toàn (Secure Storage).
* **Phase 2.2: User Profile API**
  - [x] Backend: Viết API lấy thông tin Profile (`GET /me`).
  - [x] Backend: Viết API cập nhật Preferences (Khẩu vị, Dị ứng lưu dạng JSONB).
* **Phase 2.3: User Profile UI (Tab 4 & Tab 5)**
  - [x] Frontend: Dựng UI màn hình Onboarding (chọn món thích/ghét ban đầu).
  - [x] Frontend: Dựng UI Tab Tài khoản (Tab 5).
  - [x] Frontend: Ghép API Profile và Preferences.
* **Phase 2.4: Seed Data & Restaurant CRUD**
  - [x] Data: Viết script cào dữ liệu (crawl) hoặc seed 100 quán ăn và 500 món ăn mẫu.
  - [x] Backend: Viết API CRUD cơ bản để query Quán ăn và Món ăn.

### Phase 3: Core AI Recommendation & Swipe Engine (Sprint 5-7)
* **Phase 3.1: Recommendation Data Pipeline**
  - [x] Backend: Cấu hình Kafka Producer phát event Swipe (Like/Skip/View).
  - [x] Backend: Xây dựng Kafka Consumer lưu trữ event vào `recommendation_logs`.
* **Phase 3.2: AI Offline Training & Embeddings**
  - [x] AI: Viết script Python tính toán Vector Embedding cho 500 món ăn mẫu dựa trên mô tả, thành phần.
  - [x] AI: Đẩy (Ingest) Embeddings vào Qdrant (Vector DB).
* **Phase 3.3: Online Inference API**
  - [x] Backend: Cấu hình API lấy danh sách Món ăn gợi ý bằng Vector Similarity Search.
  - [x] Backend: Tích hợp thuật toán lọc Geohash (lọc các quán ăn trong bán kính 5km).
* **Phase 3.4: Swipe UI & Interaction (Tab 3)**
  - [x] Frontend: Thiết kế UI Card món ăn (Ảnh to, Tag AI, Giá tiền).
  - [x] Frontend: Cài đặt logic vuốt thẻ (Tinder-style swipe animations).
  - [x] Frontend: Ghép API Recommendation để tải danh sách thẻ liên tục (Pagination).
  - [x] Frontend: Gửi event Kafka (thông qua Backend API) khi user vuốt thẻ.
* **Phase 3.5: Delivery & Maps Integration**
  - [x] Frontend: Xử lý Deep-link truyền tham số mở ShopeeFood / GrabFood.
  - [x] Frontend: Gắn schema Google Maps URL để mở bản đồ dẫn đường (Directions API).

### Phase 4: Social Feed & TikTok-style UI (Sprint 8-9)
* **Phase 4.1: Social Feed Backend**
  - [x] Backend: Thiết kế Schema cho `posts` và `comments`.
  - [x] Backend: Viết API Lấy danh sách Post (Sử dụng Cursor-based pagination cho luồng lướt).
  - [x] Backend: Viết API Like, Comment bài viết.
* **Phase 4.2: TikTok-style UI (Tab 1)**
  - [x] Frontend: Dựng UI Feed dọc toàn màn hình (Vertical Scroll View).
  - [x] Frontend: Tích hợp Video Player (Auto-play, Mute, Cache video offline).
* **Phase 4.3: Dish Floating Overlay**
  - [x] Frontend: Xây dựng UI Popup thông tin món ăn nổi lên phía dưới góc Video.
  - [x] Frontend: Xử lý sự kiện click nút "Thử ngay" trên Popup chuyển hướng sang màn hình Chi tiết Món ăn hoặc Bản đồ.

### Phase 5: MVP Polish, QA & Load Testing (Sprint 10)
* **Phase 5.1: End-to-End Testing**
  - [x] QA/Dev: Lên kịch bản test tự động luồng Đăng nhập -> Vuốt chọn món -> Mở App giao hàng.
  - [x] QA/Dev: Lên kịch bản test luồng Xem Feed -> Tương tác Popup món ăn.
* **Phase 5.2: Load Testing & Optimization**
  - [x] DevOps: Viết script k6/JMeter test tải vào API Recommendation và API Gateway.
  - [x] Backend: Phân tích slow queries và tối ưu PostgreSQL (Thêm index, explain analyze).
  - [x] Backend: Cấu hình Caching Redis cho API danh sách Post (Feed).
* **Phase 5.3: UI/UX Polish**
  - [x] Frontend: Tối ưu bộ nhớ (Lazy Load Image/Video tránh tràn RAM).
  - [x] Frontend: Tinh chỉnh animation, fix các bug giật lag (jank frames).
  - [x] Review: Duyệt app tổng thể, chuẩn bị bản build Beta nội bộ (TestFlight / APK).

---

## 3. Kế hoạch Kiểm thử & Bàn giao (Verification Protocol)

- **Unit/Integration Tests:** Mỗi module/tính năng phải vượt qua bộ test tự động (`npm test` hoặc tương đương).
- **Scope Verification:** Việc phát triển phải tuân thủ nghiêm ngặt quy trình đã ghi trong `AGENTS.md`. Bất kỳ thay đổi nào cũng cần nằm trong `scope` của `features.json`.
- **Code Review:** Tự động hóa quá trình review bằng script `agent-review.sh` trước khi merge vào nhánh chính.
- **Definition of Done (DoD):** Một task chỉ được tính là hoàn thành khi thỏa mãn tất cả các điều kiện DoD trong `features.json`.
