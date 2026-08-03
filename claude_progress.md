# Session Progress

## Last Session Summary (Session 13 — 2026-08-03)
- Đã thêm feature mới `module-split-bill` vào `features.json`.
- Implement `SplitBillService` xử lý logic chia sẻ hóa đơn (chia đều hoặc chia theo từng món cụ thể dựa trên danh sách người dùng).
- Hoàn thiện `group.routes.ts` với các API endpoint bổ sung: `POST /api/groups/:id/split-equally` và `POST /api/groups/:id/split-items`.
- Bổ sung Integration tests cho module split bill trong `tests/splitBill.test.ts`.
- Các bước kiểm tra (tests, linter, tsc) đều pass 100%. Linter lỗi `any` type đã được sửa thành type implicit cho function find.

## Current State
- Feature: module-split-bill (status: DONE, 100% complete)
- Branch: main
- Tests: 24 passing / 24 total

## What Next Session Should Do First
1. Chọn feature tiếp theo trong `features.json` (ví dụ: phát triển Setup Pipeline CI/CD thực tế cho GitHub/GitLab).
2. Tích hợp front-end (nếu có repository) hoặc mock up Frontend integration API.

## Known Issues / Blockers
- None.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Xây dựng Split Bill Service như một utility service độc lập nằm trong module Group, không phụ thuộc cứng vào schema DB hiện tại nhằm đáp ứng logic xử lý nhanh ở memory, dễ mở rộng sau này.