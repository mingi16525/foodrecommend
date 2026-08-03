# Session Progress

## Last Session Summary (Session 11 — 2026-08-03)
- Đã thêm feature mới `module-group` vào `features.json`.
- Implement `GroupService` (kết nối PostgreSQL bằng `pg.Pool` cho các tính năng: tạo nhóm tự động thêm creator vào nhóm, lấy thông tin nhóm kèm danh sách thành viên, thêm thành viên mới `ON CONFLICT DO NOTHING`).
- Hoàn thiện `group.routes.ts` với các API endpoint `POST /`, `GET /:id`, và `POST /:id/members`.
- Bổ sung Integration tests cho module group trong `tests/group.test.ts`.
- Các bước kiểm tra (tests, linter, tsc) đều pass 100%.

## Current State
- Feature: module-group (status: DONE, 100% complete)
- Branch: main
- Tests: 18 passing / 18 total

## What Next Session Should Do First
1. Chọn feature tiếp theo trong `features.json` (ví dụ: phát triển module Social).
2. Xây dựng Data Models, controllers và tests cho feature mới.

## Known Issues / Blockers
- None.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.
- Cần phát triển thêm logic tách hóa đơn (split bill) sau này.

## Architectural Decisions This Session
- Tiếp tục tuân thủ kiến trúc Modular Monolith cho module group, đảm bảo khả năng tái sử dụng DB connections qua fallback pattern trong môi trường CI.