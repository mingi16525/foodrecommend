# Session Progress

## Last Session Summary (Session 15 — 2026-08-03)
- Đã thêm feature mới `module-db-seeding` vào `features.json`.
- Tạo file `seed.sql` với dữ liệu mẫu (users, preferences, restaurants, dishes, posts, groups) bám sát theo schema của `schema.sql`.
- Đã cập nhật `package.json` với script `"db:init"` và `"seed"` để thiết lập schema và load seed data nhanh chóng bằng lệnh psql.
- Các bước kiểm tra dự án (tests, linter, tsc) đều pass 100%.

## Current State
- Feature: module-db-seeding (status: DONE, 100% complete)
- Branch: main
- Tests: 24 passing / 24 total

## What Next Session Should Do First
1. Chọn feature tiếp theo trong `features.json` hoặc khởi tạo Frontend Repository với Flutter.
2. Hoặc thực thi chạy thử container Database + script seed để kiểm tra API bằng Postman/Insomnia (xóa mock fallback data).

## Known Issues / Blockers
- Môi trường CI/test hiện tại vẫn phụ thuộc vào catch-block để trả về mock data vì chưa chạy psql command trong quá trình `npm test`.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Cung cấp data seed đơn giản trực tiếp bằng raw SQL query (với raw UUIDs cố định) để đảm bảo việc migrate và test cực kỳ nhẹ nhàng mà không cần thư viện seeding cồng kềnh.