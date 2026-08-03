# AI Food Decision Platform

## 📌 Tổng quan dự án (Project Overview)
Nền tảng **AI Food Decision Platform** giúp người dùng quyết định "Ăn gì, ở đâu, đặt như thế nào?" bằng cách gợi ý món ăn/quán ăn theo sở thích cá nhân, học hỏi từ lịch sử tương tác (swipe like/skip), cá nhân hóa theo ngữ cảnh và điều hướng liền mạch sang các nền tảng giao đồ ăn hiện có (ShopeeFood, GrabFood, BeFood, v.v.).

## 🚀 Hướng phát triển hiện tại (Current Development Direction)
Hiện tại, dự án đang ở giai đoạn xây dựng **Core Architecture & MVP Backend**, bao gồm:
- **Modular Monolith**: Khung cấu trúc backend được chia thành các module độc lập (`user`, `restaurant`, `recommendation`, `social`, `group`) nhằm dễ dàng tách thành Microservices trong tương lai.
- **Swipe-to-Recommend Engine**: Hệ thống AI gợi ý món ăn dựa trên thao tác quẹt (Swipe). Đã tích hợp API endpoints để thu thập hành vi người dùng, lưu vào **PostgreSQL** và tiến hành query embedding từ **Qdrant (Vector DB)**.
- **CI/CD & DevOps Pipeline**: Thiết lập chuẩn hóa với TypeScript, ESLint, Jest, GitHub Actions, cùng Docker Compose để chạy database cục bộ.

## 🧩 Các thành phần (Modules) & Tiến độ

### 1. 👤 User & Profile Module (Đã dựng MVP)
- **Hiện tại:** Quản lý hồ sơ cơ bản và sở thích người dùng.
- **Tương lai:** Tích hợp xác thực (Auth - JWT/OAuth2), quản lý chế độ ăn (Dietary restrictions) chi tiết.

### 2. 🍔 Restaurant & Menu Module (Đã dựng MVP)
- **Hiện tại:** Quản lý danh sách nhà hàng cơ bản.
- **Tương lai:** Tích hợp định vị địa lý (Geohashing/PostGIS), liên kết sâu (Deep links) tới GrabFood, ShopeeFood.

### 3. 🧠 AI Recommendation & Context Engine (Đã dựng nền tảng Swipe)
- **Hiện tại:** Mockup logic xử lý `Swipe Event` (Right/Left) chuẩn bị cho Vector DB.
- **Tương lai:** Triển khai model sinh vector embedding, gợi ý theo ngữ cảnh (thời gian, thời tiết, tâm trạng).

### 4. 👥 Group, Trip Order & Split Bill Module (Đã dựng MVP)
- **Hiện tại:** Quản lý nhóm (thêm thành viên), logic tách hóa đơn (chia đều, chia theo món) xử lý in-memory hiệu năng cao.
- **Tương lai:** Tích hợp WebSocket/Realtime để bỏ phiếu (Voting) chọn quán ăn chung theo nhóm.

### 5. 📸 Social & Review Module (Đã dựng MVP)
- **Hiện tại:** Quản lý bài đăng dạng Feed cơ bản (liên kết tác giả).
- **Tương lai:** Phân trang (Pagination) lượng dữ liệu lớn, lọc theo follower, Feed dạng video ngắn (Reels).

## 🌍 Tương lai tổng thể & CI/CD
- **Hệ thống Front-end:** Dự kiến sử dụng **Flutter** để build Mobile App đa nền tảng (iOS/Android), cung cấp trải nghiệm vuốt (Tinder-like) mượt mà.
- **Data Pipeline:** Triển khai CI/CD pipeline tự động deploy lên Cloud (AWS/GCP), tích hợp pipeline train model AI (Offline training trên GPU) và cập nhật Vector Database định kỳ.

## 🛠 Tech Stack
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Main), Redis (Cache), Qdrant (Vector DB)
- **Frontend** *(Tương lai)*: Flutter / React Native
- **Testing**: Jest, Supertest
