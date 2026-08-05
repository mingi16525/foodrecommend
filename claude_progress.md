# Session Progress

## Last Session Summary (Frontend Bug Fixes - 2026-08-05)
- Thêm trường Password cho trang Đăng nhập (`login_screen.dart`) và Đăng ký (`register_screen.dart`).
- Cập nhật `auth_service.dart` để gửi kèm `password` khi gọi API `/login` và `/register`.
- Sửa toàn bộ lỗi Type/Lint (TS2352, no-explicit-any, implicit any) cho phần backend code (`group.routes.ts`, `recommendation.routes.ts`, `setup.ts`). `npm run lint` và `npx tsc --noEmit` và `npm test` đều pass xanh.
- Đã đánh dấu pass cho mục "Đăng nhập thành công" trong `Checklist.txt`.

## Current State
- Backend: Local Beta hoàn thiện 100%. Đã bổ sung API middleware (`authenticateToken`). Postgres và Qdrant đã được load 100% data mock (50 nhà hàng, 500 món ăn, có test user).
- Frontend: Đã có đủ các trang và tab cơ bản. Setup Android có thể mở trên Android Studio thông qua lệnh `flutter create .`. Form login/register đã đầy đủ.
- Tests (Jest): `npm test` ĐÃ PASS TOÀN BỘ (34/34 tests). Code passing lint & tsc.

## What Next Session Should Do First
- Tiếp tục Manual E2E Testing các tính năng còn lại trên Emulator / Máy thật dựa vào `Checklist.txt` (đặc biệt là Feed/Swipe/Group).
- Sửa bất kỳ lỗi UI / Logic nào phát sinh trong quá trình Manual Testing.
- Nếu Manual E2E pass, chuyển sang chuẩn bị mô hình model ML offline hoặc deploy production.
## Known Issues / Blockers
- Cần có `GEMINI_API_KEY` trong file `.env` để luồng Trip Planner hoạt động trơn tru.

## Architectural Decisions This Session
- Dùng `jest.mock` trong `tests/setup.ts` để bypass việc kết nối DB/Kafka thật trong quá trình chạy CI/CD (npm test). 
- Bổ sung `setupFilesAfterEnv` trong `jest.config.js`.
- Bổ sung Navigation cho 5 Tab trên Frontend trực tiếp thay vì thông qua Router để đồng nhất với UI hiện tại đang dùng `IndexedStack`.