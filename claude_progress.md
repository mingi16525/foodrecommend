# Session Progress

## Last Session Summary (Session 21 — 2026-08-03)
- Đã thêm feature mới `api-gateway-nginx` vào `features.json`.
- Cấu hình API Gateway bằng Nginx (`nginx/nginx.conf`) để định tuyến các requests bắt đầu bằng `/api/` tới Backend services.
- Container hóa Backend Application bằng cách tạo `Dockerfile` cơ bản cho Node.js app, tự động build mã nguồn TypeScript (`npm run build`).
- Tích hợp Nginx và Backend app trực tiếp vào `docker-compose.yml`, giúp toàn bộ hệ thống khởi chạy chỉ bằng một lệnh `docker-compose up -d --build`.
- Kiểm tra thành công API Gateway qua cổng 80 (`curl http://localhost/api/users/...`) và endpoint health check (`/health`), request đã được proxy chuẩn xác đến Node.js server ở bên trong.

## Current State
- Feature: api-gateway-nginx (status: DONE, 100% complete)
- Branch: main
- Tests: 24 passing / 24 total (Từ Github Actions CI)

## What Next Session Should Do First
1. Hệ thống Backend (DB + Cache + VectorDB + App Server + API Gateway) đã hoàn chỉnh và chạy trơn tru trong containerized environment (Docker Compose). Giai đoạn backend platform được coi là đã hoàn tất.
2. Bắt tay vào xây dựng giao diện người dùng (Frontend - Mobile/Web) với các framework hiện đại (Ví dụ: Flutter/React/Next.js) dựa theo mô tả có sẵn trong `UI.txt`. Môi trường cần thiết lập.

## Known Issues / Blockers
- Cần cài đặt `flutter` CLI hoặc môi trường React Native/React nếu tiến tới bắt đầu dự án Frontend. 

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Chuyển từ việc chạy baremetal bằng `node dist/index.js` sang mô hình hoàn toàn dựa trên Docker Compose (Containerized Architecture).
- Sử dụng Nginx làm reverse proxy (API Gateway) tiêu chuẩn, giúp tập trung hóa cấu hình CORS, Caching, SSL Termination sau này nếu cần và làm điểm trung gian định tuyến.