# Session Progress

## Last Session Summary (Session 12 — 2026-08-03)
- Đã thêm feature mới `module-social` vào `features.json`.
- Implement `SocialService` (kết nối PostgreSQL bằng `pg.Pool` cho các tính năng: tạo bài đăng mới và lấy danh sách news feed kết hợp thông tin tác giả).
- Hoàn thiện `social.routes.ts` với các API endpoint `POST /posts` và `GET /feed`.
- Bổ sung Integration tests cho module social trong `tests/social.test.ts`.
- Các bước kiểm tra (tests, linter, tsc) đều pass 100%.

## Current State
- Feature: module-social (status: DONE, 100% complete)
- Branch: main
- Tests: 21 passing / 21 total

## What Next Session Should Do First
1. Chọn feature tiếp theo trong `features.json` (ví dụ: phát triển Setup Pipeline CI/CD thực tế cho GitHub/GitLab).
2. Tích hợp hoặc deploy các module đã hoàn thiện.

## Known Issues / Blockers
- None.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.
- Cần phát triển thêm logic tách hóa đơn (split bill) sau này.

## Architectural Decisions This Session
- Tiếp tục tuân thủ kiến trúc Modular Monolith cho module social. Hiện tất cả các backend modules chính đã có Data layer và REST API được dựng khung thành công, sẵn sàng cho việc migrate sang microservices sau khi MVP ổn định.