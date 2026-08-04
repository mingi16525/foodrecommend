# Session Progress

## Last Session Summary (Session 18 — 2026-08-04)
- Đã hoàn thành feature `frontend-foundation`: Khởi tạo cấu trúc thư mục Flutter thủ công (do môi trường chưa có Flutter CLI), thiết lập `pubspec.yaml`, `main.dart`, cấu hình Theme cơ bản, Routing (`go_router`) và State Management (`Provider`).
- Bỏ qua việc sửa đổi `.github/workflows/ci.yml` do vi phạm Scope Rules (file này không nằm trong scope của `frontend-foundation`).

## Current State
- Feature: tab-4-and-5-ui (status: IN_PROGRESS)
- Branch: main
- Tests: 24 passing / 24 total

## What Next Session Should Do First
1. Thực hiện feature `tab-4-and-5-ui`: Dựng UI màn hình Onboarding (chọn món thích/ghét), Tab Tài khoản (Tab 5).
2. Tích hợp gọi API Profile & Preferences từ Backend.

## Known Issues / Blockers
- Môi trường CI/test hiện tại vẫn phụ thuộc vào catch-block để trả về mock data vì chưa chạy psql command trong quá trình `npm test`.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Quyết định chia nhỏ các tính năng UI của Android app thành từng feature độc lập theo Tab trong `features.json` để dễ theo dõi và gán task cho Frontend team.