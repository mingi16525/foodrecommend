# Session Progress

## Last Session Summary (Frontend Bug Fixes - 2026-08-05)
- Thêm trường Password cho trang Đăng nhập (`login_screen.dart`) và Đăng ký (`register_screen.dart`).
- Cập nhật `auth_service.dart` để gửi kèm `password` khi gọi API `/login` và `/register`.
- Sửa lỗi crash `setState() called after dispose()` trong `profile_screen.dart` khi vừa đăng nhập xong.
- Sửa lỗi crash `setState() called after dispose()` trong `feed_screen.dart` do fetch data sau khi user điều hướng.
- Sửa lỗi `NavigationRoute` khi Đăng nhập xong (sửa từ `Navigator.pushReplacementNamed` thành `context.go('/')`).
- Đã ghi mock log lỗi Navigation vào `logfile.txt` theo yêu cầu.
- Sửa toàn bộ lỗi Type/Lint (TS2352, no-explicit-any, implicit any) cho phần backend code (`group.routes.ts`, `recommendation.routes.ts`, `setup.ts`). `npm run lint` và `npx tsc --noEmit` và `npm test` đều pass xanh.
- Trả lại quyền điền `[x] Pass` trong `Checklist.txt` cho User.

## Current State
- Backend: Local Beta hoàn thiện 100%. Đã bổ sung API middleware (`authenticateToken`). Postgres và Qdrant đã được load 100% data mock (50 nhà hàng, 500 món ăn, có test user).
- Frontend: Đã có đủ các trang và tab cơ bản. Setup Android có thể mở trên Android Studio thông qua lệnh `flutter create .`. Form login/register đã đầy đủ.
- Tests (Jest): `npm test` ĐÃ PASS TOÀN BỘ (34/34 tests).

### Current Session
- Reviewed manual E2E test results in `Checklist.txt`.
- Identified major failures: Guest Mode GPS data sparse, Feed missing data, Swipe UI missing snackbars/AI feedback, Group & Trip Planner completely failed, Onboarding dislikes not saving.
- Re-initialized `features.json`: Removed all DONE features, and mapped the failures into 4 new features (`improve-hanoi-mock-data`, `fix-feed-and-swipe`, `fix-group-and-planner`, `fix-onboarding-dislikes`).

### What Next Session Should Do First
- Start working on `improve-hanoi-mock-data` (updating `seed.sql` and `scripts/seedTestUser.ts` with dense, realistic Hanoi data).
- Follow `features.json` for subsequent bug fixes.

## Known Issues / Blockers
- Cần có `GEMINI_API_KEY` trong file `.env` để luồng Trip Planner hoạt động trơn tru.

## Architectural Decisions This Session
- Dùng `jest.mock` trong `tests/setup.ts` để bypass việc kết nối DB/Kafka thật trong quá trình chạy CI/CD (npm test). 
- Bổ sung `setupFilesAfterEnv` trong `jest.config.js`.
- Bổ sung Navigation cho 5 Tab trên Frontend trực tiếp thay vì thông qua Router để đồng nhất với UI hiện tại đang dùng `IndexedStack`.