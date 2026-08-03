# AI Food Decision Platform

## 📌 Tổng quan dự án (Project Overview)
Nền tảng **AI Food Decision Platform** giúp người dùng quyết định "Ăn gì, ở đâu, đặt như thế nào?" bằng cách gợi ý món ăn/quán ăn theo sở thích cá nhân, học hỏi từ lịch sử tương tác (swipe like/skip), cá nhân hóa theo ngữ cảnh và điều hướng liền mạch sang các nền tảng giao đồ ăn hiện có (ShopeeFood, GrabFood, BeFood, v.v.).

## 🚀 Hướng phát triển hiện tại (Current Development Direction)
Hiện tại, dự án đang ở giai đoạn xây dựng **Core Architecture & MVP Backend**, bao gồm:
- **Modular Monolith**: Khung cấu trúc backend được chia thành các module độc lập (`user`, `restaurant`, `recommendation`, `social`, `group`) nhằm dễ dàng tách thành Microservices trong tương lai.
- **Swipe-to-Recommend Engine**: Hệ thống AI gợi ý món ăn dựa trên thao tác quẹt (Swipe). Đã tích hợp API endpoints để thu thập hành vi người dùng, lưu vào **PostgreSQL** và tiến hành query embedding từ **Qdrant (Vector DB)**.
- **CI/CD & DevOps Pipeline**: Thiết lập chuẩn hóa với TypeScript, ESLint, Jest, GitHub Actions, cùng Docker Compose để chạy database cục bộ.

## 🧩 Các thành phần trong tương lai (Future Components)

### 1. 👤 User & Profile Module
- Quản lý hồ sơ người dùng, sở thích, dị ứng, chế độ ăn (Dietary restrictions).
- Hệ thống Authentication/Authorization.

### 2. 🍔 Restaurant & Menu Module
- Quản lý danh sách nhà hàng, định vị địa lý (Geohashing, PostGIS).
- Liên kết (Deep links) trực tiếp đến các nền tảng đặt đồ ăn (Grab, ShopeeFood, Baemin).

### 3. 🧠 AI Recommendation & Context Engine
- Triển khai mô hình Machine Learning thực tế để sinh vector embeddings cho món ăn và người dùng.
- Gợi ý món theo ngữ cảnh (thời tiết, thời gian trong ngày, tâm trạng).

### 4. 👥 Group & Trip Order Module
- Tạo nhóm đi ăn chung.
- Bỏ phiếu (Voting) chọn quán hoặc ghép đơn (Group order).

### 5. 📸 Social & Review Module
- Cấu trúc "Food Feed" (tương tự TikTok/Instagram Reels) với video ngắn review đồ ăn.
- Hệ thống xác thực Reviewer (Người dùng uy tín).

## 🛠 Tech Stack
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Main), Redis (Cache), Qdrant (Vector DB)
- **Frontend** *(Tương lai)*: Flutter / React Native
- **Testing**: Jest, Supertest
