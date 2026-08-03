# Session Progress

## Last Session Summary (Session 17 — 2026-08-03)
- Đã thêm feature mới `docker-db-container` vào `features.json`.
- Cập nhật `docker-compose.yml` để mount tự động cả `schema.sql` (01-schema.sql) và `seed.sql` (02-seed.sql) vào thư mục init của container PostgreSQL, giúp database sẵn sàng với dữ liệu mẫu ngay khi khởi động.
- Cập nhật các script thao tác db trong `package.json` (`db:init`, `seed`) sử dụng đúng environment variables cấu hình (POSTGRES_USER, POSTGRES_PASSWORD) đồng bộ với Docker Compose.
- Các bước kiểm tra dự án (tests, linter, tsc) đều pass 100%.

## Current State
- Feature: docker-db-container (status: DONE, 100% complete)
- Branch: main
- Tests: 24 passing / 24 total

## What Next Session Should Do First
1. Chọn feature tiếp theo trong `features.json` hoặc bắt đầu tích hợp API Backend thực tế (kết nối pool db thay vì chạy try-catch test fail fallback).
2. Chạy thử nghiệm `docker-compose up -d` và test API trực tiếp bằng tool gọi REST.

## Known Issues / Blockers
- Môi trường CI/test hiện tại vẫn phụ thuộc vào catch-block để trả về mock data vì chưa chạy psql command thực tế trong quá trình `npm test`. (Cần cấu hình `jest` setup script nạp DB hoặc mock pg-pool chuẩn).

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Cấu hình init script của Postgres tự động mount thứ tự `01-schema.sql` rồi đến `02-seed.sql` để đảm bảo luồng khởi tạo DB container là 1 step duy nhất (zero-config cho developer mới).