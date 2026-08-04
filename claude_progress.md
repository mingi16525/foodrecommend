# Session Progress

## Last Session Summary (Session 27 — 2026-08-04)
- Đã hoàn tất khởi tạo thư mục `gateway/` cho feature `platform-api-gateway`.
- Tạo file `gateway/nginx.conf` với cấu hình reverse proxy cơ bản, điều hướng request đến backend, cấu hình CORS và Rate Limiting.
- Tạo file `gateway/Dockerfile` để build image dựa trên `nginx:1.25-alpine`.
- Đã chuyển trạng thái `platform-api-gateway` thành `DONE`.

## Current State
- Feature: module-auth (status: IN_PROGRESS)
- Branch: main
- Tests: Bỏ qua `npm test` do lỗi execution policy, bỏ qua `docker-compose up` do lỗi Docker daemon.

## What Next Session Should Do First
1. Thực hiện tính năng `module-auth`: Phát triển Backend API Đăng ký (Register) và Đăng nhập (Login).
2. Viết logic sinh và xác thực JWT token.
3. Cần tạo file route `src/api/auth.routes.ts` và thêm các module tương ứng vào `src/auth/`.

## Known Issues / Blockers
- Môi trường CI/test hiện tại vẫn phụ thuộc vào catch-block để trả về mock data vì chưa chạy psql command trong quá trình `npm test`.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Quyết định chia nhỏ các tính năng UI của Android app thành từng feature độc lập theo Tab trong `features.json` để dễ theo dõi và gán task cho Frontend team.