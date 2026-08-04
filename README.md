# AI Food Decision Platform

## 📌 Tổng quan dự án (Project Overview)
Nền tảng **AI Food Decision Platform** giúp người dùng quyết định "Ăn gì, ở đâu, đặt như thế nào?" bằng cách gợi ý món ăn/quán ăn theo sở thích cá nhân, học hỏi từ lịch sử tương tác, cá nhân hóa theo ngữ cảnh và điều hướng liền mạch sang các nền tảng giao đồ ăn hiện có.

## 🚀 Tính năng nổi bật & Tiến độ (Features & Status)
Tất cả các tính năng cốt lõi MVP đã được hoàn thiện 100% bao gồm cả Frontend (React/TypeScript) và Backend (Node.js/Express):

### 1. 👤 User & Profile Module (Hoàn thiện)
- Quản lý hồ sơ cơ bản và sở thích người dùng.
- **Verified Reviewer**: Hệ thống cấp "Tích xanh" cho người đánh giá uy tín, hiển thị huy hiệu trên các bài post đánh giá.

### 2. 🍔 Restaurant & Menu Module (Hoàn thiện)
- Quản lý danh sách nhà hàng.
- **AI Review Summary**: Tích hợp AI (LLM) để tự động tóm tắt các đánh giá từ nhiều nguồn, giúp người dùng nắm bắt nhanh ưu/nhược điểm của quán.

### 3. 🧠 AI Recommendation & Context Engine (Hoàn thiện)
- Hệ thống xử lý `Swipe Event` (Right/Left) thu thập dữ liệu hành vi.
- **Office Ordering Health**: Gợi ý món ăn văn phòng theo khung giờ trưa cố định dựa trên chỉ số dinh dưỡng (Calories limit, Protein target).
- **Conversational AI Agent**: Chatbot thông minh đóng vai trò trợ lý tư vấn món ăn trực tiếp dựa trên ngữ cảnh người dùng.

### 4. 👥 Group & Trip Planner Module (Hoàn thiện)
- Tính năng chia hóa đơn (Split Bill) nhóm.
- Tích hợp WebSocket cho tính năng Voting chọn quán realtime.
- **AI Trip Planner**: Tính năng lên lịch trình ẩm thực dọc tuyến đường (Food Tour) kết hợp Google Maps và LLM để tự động đề xuất điểm dừng và món ăn.

### 5. 📸 Social & Review Module (Hoàn thiện)
- Quản lý bài đăng dạng Feed cơ bản (liên kết tác giả).
- UI/UX mượt mà, phân trang cơ bản.

### 6. 💼 B2B Merchant Dashboard (Hoàn thiện)
- Cổng quản trị dành riêng cho chủ nhà hàng (Merchant).
- Dashboard thống kê Analytics (lượt view, lượt thích, lượt click).
- Quản lý Menu và chạy chiến dịch quảng cáo (Promoted Listings) trực tiếp từ giao diện.

## 🛠 Tech Stack
- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React, Zustand, Framer Motion, TypeScript
- **Database**: PostgreSQL (Main), Redis (Cache), Qdrant (Vector DB)
- **Testing**: Jest, Supertest

## 🌍 CI/CD & Vận hành
- Thiết lập chuẩn hóa với TypeScript, ESLint, và Jest.
- CI/CD tự động check lint và test.
- Hệ thống được thiết kế theo kiến trúc Modular Monolith dễ dàng scale lên Microservices.
