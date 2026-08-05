# Session Progress

## Last Session Summary
- Hoàn thành xử lý lỗi 403 API cho Tab 2, Tab 3, Tab 4 bằng cách map `mock.jwt.token` tới UUID thực tế.

## Current State
- Backend: Đang chạy ở cổng 3000.
- Frontend: Đã xử lý xong các feature: Tab 3 gửi thiếu dishId (400), Tab 4 không gọi API khi lưu (thiếu Auth token), và lưu Persist Token (SharedPreferences).
- Tests (Jest): `npm test` PASS TOÀN BỘ (34 tests). Linter và TSC checks pass.

### Current Session
- Sửa lỗi `dish_id` -> `dishId` ở `recommendation_screen.dart` để fix HTTP 400.
- Sửa lỗi không đính kèm `Authorization` header và gọi `ApiLogger` tại `onboarding_screen.dart` (Tab 4 lưu thiết lập).
- Tích hợp package `shared_preferences` vào Flutter.
- Chỉnh sửa `AppState` và `login_screen.dart` để ghi/đọc `auth_token`. Cập nhật `app_routes.dart` tự động chuyển hướng về `/` nếu đã login.
- Đánh dấu các features (`fix-tab3-400`, `fix-tab4-save-api`, `feat-persist-auth-token`) thành `DONE`.

### What Next Session Should Do First
- Kiểm tra tính năng Lưu thiết lập trên Tab 4.
- Kiểm tra lại luồng đăng nhập, tắt/mở app (SharedPreferences) xem có giữ được phiên hay không.
- Nếu ổn, giải quyết tiếp các TODO tiếp theo trong `features.json` hoặc tập trung vào sửa logic Backend.

## Known Issues / Blockers
- Log `[kafkajs] The group coordinator is not available` vẫn tồn tại do chưa bật Kafka trên local.
- Trip Planner & Recommendation AI vẫn cần `GEMINI_API_KEY`.

## Architectural Decisions This Session
- Lưu token người dùng trực tiếp vào bộ nhớ cục bộ bằng `shared_preferences` trên Frontend. Dùng `AppState` để quản lý state xác thực ở mức toàn cục.