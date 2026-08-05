# AI Food Decision Platform (FoodRecommend)

## 📌 Tổng quan dự án (Project Overview)
Nền tảng **AI Food Decision Platform** giúp người dùng quyết định "Ăn gì, ở đâu, đặt như thế nào?" bằng cách gợi ý món ăn/quán ăn theo sở thích cá nhân, học hỏi từ lịch sử tương tác (swipe like/skip), cá nhân hóa theo ngữ cảnh và điều hướng liền mạch sang các nền tảng giao đồ ăn hiện có (ShopeeFood, GrabFood, BeFood, v.v.).

## 🚀 Trạng thái dự án hiện tại (Current Status)
Dự án đã hoàn tất **GIAI ĐOẠN MVP** và bước sang **LOCAL BETA (PRODUCTION-READY BACKEND)**.
Toàn bộ hệ thống Backend, Microservices, AI Pipelines đã kết nối 100% với hạ tầng thực tế (PostgreSQL, Redis, Qdrant, Kafka, Gemini API). Cơ chế Mock Data đã được gỡ bỏ hoàn toàn. Ứng dụng sẵn sàng cho việc Deploy và Test E2E.

Vui lòng xem chi tiết tại: **[Module_Progress.md](./Module_Progress.md)**.

## 🧩 Các thành phần (Modules) & Tiến độ
### 1. 👤 User, Auth & Profile Module (Đã hoàn thiện)
- Quản lý hồ sơ, UI Onboarding thiết lập khẩu vị (Flutter). API đã kết nối DB PostgreSQL hoàn chỉnh.

### 2. 🍔 Restaurant & Data Module (Đã hoàn thiện)
- Cơ sở dữ liệu Postgres đã có Schema chuẩn và Seed data. Card món ăn hiển thị mượt mà.

### 3. 🧠 AI Recommendation & Multi-tier Routing (Đã hoàn thiện)
- UI vuốt thẻ (Tinder-style) và Video Feed (TikTok-style) đã hoàn thiện.
- Kiến trúc AI định tuyến đa tầng: Qdrant Vector Search (Fast), Pareto Aggregation (Medium), Gemini LLM (Deep) đã chạy thực tế.
- Tích hợp hệ thống Event-driven (Kafka) và Redis Caching.

### 4. 👥 Group, Trip Order & Split Bill Module (Đã hoàn thiện Backend)
- Thuật toán Split Bill hiệu năng cao. API quản lý Nhóm đã kết nối PostgreSQL. (Chưa làm UI AI Group Voting).

### 5. 📸 Social & Review Module (MVP)
- Quản lý bài đăng dạng Feed dọc. API nối thẳng DB. (Chưa có phân trang và hệ thống Verified Reviewer).

## 🛠 Tech Stack Khởi Tạo
- **Backend**: Node.js, Express, TypeScript (Modular Architecture).
- **Database (Docker)**: PostgreSQL (Main), Redis (Cache), Qdrant (Vector DB), Kafka (Message Queue).
- **AI Scripts**: Python (HuggingFace Embeddings).
- **Frontend**: Flutter (App đa nền tảng).
- **Testing**: Jest, Supertest, K6 (Load Testing).
- **CI/CD**: GitHub Actions / Agent-review Shell Scripts.
