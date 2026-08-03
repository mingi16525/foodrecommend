# Session Progress

## Last Session Summary (Session 18 — 2026-08-03)
- Đã thêm feature mới `module-db-real-integration` vào `features.json`.
- Đã xóa toàn bộ fallback mock data bên trong các khối `try-catch` của tất cả các Services (User, Restaurant, Social, Group, Recommendation), giúp Backend fail fast đúng nghĩa khi DB gặp lỗi.
- Đã tạo Jest mock tiêu chuẩn cho module `pg` tại `__mocks__/pg.ts`, giúp tất cả 24 integration tests chạy độc lập, pass 100% mà không cần đến mock data cấp service hay DB container chạy ngầm.
- Các bước kiểm tra dự án (tests, linter, tsc) đều pass 100%.

## Current State
- Feature: module-db-real-integration (status: DONE, 100% complete)
- Branch: main
- Tests: 24 passing / 24 total

## What Next Session Should Do First
1. Chạy `docker-compose up -d` để khởi chạy PostgreSQL và Qdrant thực tế trên môi trường development.
2. Dùng REST client (Postman/Insomnia) hoặc `curl` gọi trực tiếp vào `http://localhost:3000` để kiểm chứng luồng kết nối DB và dữ liệu seed thực tế trả về.

## Known Issues / Blockers
- Môi trường CI tự động hiện tại an toàn (mock db test), nhưng khi chạy thật (run dev), developer cần đảm bảo Docker container đang chạy.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Quyết định loại bỏ fail-safe mock fallback trong production/service code (anti-pattern) và chuyển toàn bộ việc mock sang tệp tin `__mocks__/pg.ts` dành riêng cho môi trường Jest, đảm bảo application code sạch sẽ, rõ ràng (Fail Fast).