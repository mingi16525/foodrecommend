# Session Progress

## Last Session Summary (Implement API Security Auth - 2026-08-05)
- Triển khai tính năng `api-security-auth` (HOÀN THÀNH).
- Cài đặt `bcrypt` và `jsonwebtoken`.
- Cập nhật `schema.sql` để thêm cột `password_hash` vào bảng `users`.
- Tạo `src/auth/authService.ts`: Triển khai hàm `register` (mã hóa mật khẩu) và `login` (so khớp mật khẩu, cấp phát JWT).
- Tạo `src/auth/authMiddleware.ts`: Viết middleware `authenticateToken` chặn các Request không chứa Bearer Token hợp lệ.
- Thêm `authRouter` vào `src/index.ts` (`/api/auth`) và bảo vệ các routes quan trọng như `/api/recommendations` bằng middleware xác thực.

## Current State
- Backend giờ đã được bảo vệ đúng tiêu chuẩn thực tế. Ứng dụng đã có luồng Đăng ký/Đăng nhập và cấp Token.
- Tính năng `api-security-auth` trong `features.json` đã được đánh dấu là "DONE".
- Mã nguồn chạy mượt, không lỗi (0 errors, 0 warnings cho TSC & ESLint).
- Branch: main

## What Next Session Should Do First
Không còn tính năng Backend hay Frontend nào trong `features.json` ở trạng thái TODO (Tất cả đều DONE). Quá trình phát triển ứng dụng (Development) đã chính thức khép lại. Nên chuyển sang phase User Testing hoặc Deploy!

## Known Issues / Blockers
- Toàn bộ Backend và Frontend đã hoàn tất.

## Architectural Decisions This Session
- Dùng `bcrypt` với Salt Rounds = 10 để bảo đảm an toàn mà không làm chậm server.
- Thiết lập thời gian sống của JWT là 7 ngày (`7d`) để giảm thiểu số lần User phải đăng nhập lại trên App Mobile.