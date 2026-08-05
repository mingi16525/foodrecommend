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
- Backend: Local Beta hoàn thiện 100%. Đã bổ sung API middleware (`authenticateToken`). Postgres và Qdrant đã được load 100% data mock (50 nhà hàng, 500 món ăn, 21 user, 30 video bài viết). Tọa độ GPS đã được phân bố xoay quanh Hồ Hoàn Kiếm, Hà Nội.
- Frontend: Đã có đủ các trang và tab cơ bản. Setup Android có thể mở trên Android Studio thông qua lệnh `flutter create .`. Form login/register đã đầy đủ.
- Tests (Jest): `npm test` ĐÃ PASS TOÀN BỘ (34/34 tests).

### Current Session
- Identified major failures: Guest Mode GPS data sparse, Feed missing data, Swipe UI missing snackbars/AI feedback, Group & Trip Planner completely failed, Onboarding dislikes not saving.
- Re-initialized `features.json`: Mapped the failures into 4 new features.
- Completed feature `improve-hanoi-mock-data`: 
  - Đã thêm cột `location` vào `seed.sql` cho bảng `restaurants` (tọa độ tại Hà Nội).
  - Bổ sung data mẫu bảng `posts` (30 video) cho tab Feed.
  - Sửa lỗi script `seedTestUser.ts` (sai tên cột `author_id` -> `user_id`) và tìm test user bằng email thay vì ID cố định.
  - Xóa insert `user_swipes` do bảng này không tồn tại trong DB thật.

### What Next Session Should Do First
- Bắt đầu với feature `fix-feed-and-swipe` trong `features.json`.
- Sửa lỗi hiển thị UI ở Tab 1 (Feed) để load dữ liệu Video từ Backend/DB.
- Sửa lỗi Tab 3 (Khám phá): Bổ sung SnackBar cho sự kiện Vuốt trái/phải, đồng thời đảm bảo action này được gửi xuống Backend (AI/Kafka) và nhận gợi ý mới.

## Known Issues / Blockers
- Cần có `GEMINI_API_KEY` trong file `.env` để luồng Trip Planner hoạt động trơn tru.

## Architectural Decisions This Session
- Dùng `jest.mock` trong `tests/setup.ts` để bypass việc kết nối DB/Kafka thật trong quá trình chạy CI/CD (npm test). 
- Bổ sung `setupFilesAfterEnv` trong `jest.config.js`.
- Bổ sung Navigation cho 5 Tab trên Frontend trực tiếp thay vì thông qua Router để đồng nhất với UI hiện tại đang dùng `IndexedStack`.