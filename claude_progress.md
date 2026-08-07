# Session Progress

## Last Session Summary
- Xóa status `IN_PROGRESS` thành `DONE` đối với `fix-backend-502-restart` và `fix-tab4-save-logout` trong `features.json`.
- Fix lỗi crash 500/502 liên quan đến `sharp` và `node_modules` bằng cách sử dụng Docker anonymous volume cho thư mục `/app/node_modules`.

## Current State
- Backend: Chạy thành công qua Docker.
- Frontend: Đã khắc phục triệt để lỗi Tab 4. Ứng dụng giờ đây gọi `GET /api/users/me` trong `initState` của `onboarding_screen.dart` để tự động load lại dữ liệu (Mức độ Cay/Mặn/Ngọt, Dị ứng, Chế độ ăn, Món kỵ) thay vì reset về mặc định sau mỗi lần đăng nhập.
- Tests (Jest): `npm test` PASS TOÀN BỘ (34 tests).
- Các tính năng trong `features.json` hiện tại đều đã ở trạng thái `DONE`.

### Current Session
- Sửa lỗi không hiển thị dữ liệu Tab 4 (thiết lập khẩu vị) sau khi người dùng đăng nhập lại, bằng cách thêm state loader và fetch API để bind vào UI.

### What Next Session Should Do First
- Bổ sung các tính năng/todo mới vào `features.json` nếu có, vì hiện tại toàn bộ các tính năng đã đánh dấu DONE.
- Bắt đầu triển khai hoặc tích hợp `GEMINI_API_KEY` cho tính năng Trip Planner & Recommendation AI.

## Known Issues / Blockers
- Log `[kafkajs] The group coordinator is not available` vẫn tồn tại do chưa bật Kafka hoàn chỉnh trên local hoặc cần config thêm.
- Trip Planner & Recommendation AI vẫn cần `GEMINI_API_KEY`.

## Architectural Decisions This Session
- Xử lý việc parse JSONB trả về từ PostgreSQL ở phía Frontend thay vì format lại ở Backend để giữ nguyên schema đơn giản của Backend.