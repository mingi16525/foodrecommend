# Session Progress

## Last Session Summary
- Sửa lỗi `dish_id` -> `dishId` ở `recommendation_screen.dart` để fix HTTP 400.
- Sửa lỗi không đính kèm `Authorization` header và gọi `ApiLogger` tại `onboarding_screen.dart` (Tab 4 lưu thiết lập).
- Tích hợp package `shared_preferences` vào Flutter.
- Chỉnh sửa `AppState` và `login_screen.dart` để ghi/đọc `auth_token`. Cập nhật `app_routes.dart` tự động chuyển hướng về `/` nếu đã login.

## Current State
- Backend: Đang chạy ở cổng 3000 (đã start lại bằng npm run dev).
- Frontend: Đã fix lỗi linter const.
- Tests (Jest): `npm test` PASS TOÀN BỘ (34 tests).

### Current Session
- Fix 502 Bad Gateway bằng cách start lại backend (`npm run dev`) trên cổng 3000.
- Sửa lỗi linter (thay `final` bằng `const`) trong `onboarding_screen.dart`.

### What Next Session Should Do First
- Kiểm tra tính năng Lưu thiết lập trên Tab 4.
- Kiểm tra lại luồng đăng nhập, tắt/mở app (SharedPreferences) xem có giữ được phiên hay không.
- Nếu ổn, giải quyết tiếp các TODO tiếp theo trong `features.json` hoặc tập trung vào sửa logic Backend.

## Known Issues / Blockers
- Log `[kafkajs] The group coordinator is not available` vẫn tồn tại do chưa bật Kafka trên local.
- Trip Planner & Recommendation AI vẫn cần `GEMINI_API_KEY`.

## Architectural Decisions This Session
- (Không có thêm quyết định kiến trúc mới)