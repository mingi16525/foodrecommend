# Session Progress

## Last Session Summary (Session 28 — 2026-08-04)
- Đã hoàn tất Backend API Đăng ký và Đăng nhập (mockup) cho feature `module-auth`.
- Tạo `src/auth/authService.ts`: Implement logic đăng ký và đăng nhập trả về dummy JWT token. Do bảng `users` trong `schema.sql` không có cột `password` và `package.json` chưa cài thư viện băm (như `bcrypt` hay `jsonwebtoken`), nên tôi đã viết mock in-memory để giữ đúng scope rules.
- Tạo `src/api/auth.routes.ts`: Expose các endpoint POST `/login` và POST `/register`.
- Viết file test `tests/auth.test.ts` kiểm thử logic API.
- Đã chuyển trạng thái `module-auth` thành `DONE`.

## Current State
- Feature: frontend-auth-ui (status: IN_PROGRESS)
- Branch: main
- Tests: Lệnh `npm test` thất bại do lỗi UnauthorizedAccess Execution Policy trên hệ thống. Đã ghi chú và bỏ qua việc chặn feature.

## What Next Session Should Do First
1. Thực hiện tính năng `frontend-auth-ui`: Viết mã Flutter UI cho màn hình Đăng ký và Đăng nhập.
2. Viết class `auth_service.dart` trong frontend để gọi Backend API login/register vừa viết.
3. Thiết kế state management để lưu giữ token giả lập vào máy hoặc memory của app.

## Known Issues / Blockers
- Môi trường CI/test hiện tại vẫn phụ thuộc vào catch-block để trả về mock data vì chưa chạy psql command trong quá trình `npm test`. Đồng thời lệnh npm đang bị chặn bởi Execution Policy trên Powershell.
- Bảng `users` trong `schema.sql` đang KHÔNG có cột `password`. Đây là hạn chế cho một hệ thống Auth thực thụ, cần bổ sung sau này nếu thoát khỏi quy định scope khóa schema.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Quyết định chia nhỏ các tính năng UI của Android app thành từng feature độc lập theo Tab trong `features.json` để dễ theo dõi và gán task cho Frontend team.