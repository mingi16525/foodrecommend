# AI Food Decision Platform (FoodRecommend)

## 📌 Tổng quan dự án (Project Overview)
Nền tảng **AI Food Decision Platform** giúp người dùng quyết định "Ăn gì, ở đâu, đặt như thế nào?" bằng cách gợi ý món ăn/quán ăn theo sở thích cá nhân, học hỏi từ lịch sử tương tác (swipe like/skip), cá nhân hóa theo ngữ cảnh và điều hướng liền mạch sang các nền tảng giao đồ ăn hiện có (ShopeeFood, GrabFood, BeFood, v.v.).

## 🚀 Trạng thái dự án hiện tại (Current Status)
Dự án đã **HOÀN THÀNH GIAI ĐOẠN 1: MVP SKELETON & MOCK-DRIVEN DEVELOPMENT**.
Toàn bộ hệ thống Microservices, Data Pipelines, AI Vectors, UI/UX Foundation đã được khởi tạo base code. Hiện tại, ứng dụng có thể vượt qua 100% các bộ Test tự động nhờ cơ chế Fallback (Mock Data) nhằm đảm bảo flow logic chạy mượt mà trước khi kết nối hạ tầng thật.

Vui lòng xem chi tiết tại: **[Module_Progress.md](./Module_Progress.md)**.

## 🧩 Các thành phần (Modules) & Tiến độ
### 1. 👤 User, Auth & Profile Module (Đã dựng MVP - Mock JWT)
- Quản lý hồ sơ, UI Onboarding thiết lập khẩu vị (Flutter). API đã sẵn sàng (đang mock Auth).

### 2. 🍔 Restaurant & Data Module (Đã dựng MVP - Seed Data)
- Cơ sở dữ liệu Postgres đã có Schema chuẩn và Seed data. Card món ăn hiển thị mượt mà.

### 3. 🧠 AI Recommendation & Multi-tier Routing
- UI vuốt thẻ (Tinder-style) và Video Feed (TikTok-style) đã hoàn thiện.
- Kiến trúc AI định tuyến đa tầng (Decision Estimator -> Fast, Medium, Deep AI) đã được quy hoạch rõ.
- Tích hợp hệ thống Event-driven (Kafka) và Redis Caching để tối ưu tốc độ (<100ms) và tránh lạm dụng LLM.

### 4. 👥 Group, Trip Order & Split Bill Module (Đã dựng MVP - In-memory)
- Thuật toán Split Bill hiệu năng cao. API quản lý Nhóm và Trip Planner UI đã hình thành. (Chưa có AI Group Voting).

### 5. 📸 Social & Review Module (Đã dựng MVP)
- Quản lý bài đăng dạng Feed dọc. (Chưa có phân trang và hệ thống Verified Reviewer).

## 🛠 Tech Stack Khởi Tạo
- **Backend**: Node.js, Express, TypeScript (Modular Architecture).
- **Database (Docker)**: PostgreSQL (Main), Redis (Cache), Qdrant (Vector DB), Kafka (Message Queue).
- **AI Scripts**: Python (HuggingFace Embeddings).
- **Frontend**: Flutter (App đa nền tảng).
- **Testing**: Jest, Supertest, K6 (Load Testing).
- **CI/CD**: GitHub Actions / Agent-review Shell Scripts.
