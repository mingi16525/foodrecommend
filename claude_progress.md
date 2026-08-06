# Session Progress

## Last Session Summary
- Fix 502 Bad Gateway bằng cách start lại backend (`npm run dev`) trên cổng 3000.
- Sửa lỗi linter (thay `final` bằng `const`) trong `onboarding_screen.dart`.

## Current State
- Backend: Đã được thêm vào `docker-compose.yml` để khởi chạy cùng cơ sở hạ tầng (DB, Redis, Kafka).
- Frontend: Đã sửa lỗi lưu dữ liệu trên Tab 4 thất bại sau khi logout và login lại.
- Tests (Jest): `npm test` PASS TOÀN BỘ (34 tests).

### Current Session
- Xóa các tính năng đã hoàn thành khỏi `features.json` và thêm mới 2 features: `fix-tab4-save-logout`, `fix-backend-502-restart`.
- Sửa lỗi Tab 4 không lưu được sau khi đăng xuất/đăng nhập lại: API backend trả về token trong field `data` (`{ success: true, data: { token: ... } }`) nên `auth_service.dart` parse bị thiếu (lấy null), dẫn đến token gửi đi bị null. Đã thêm logic unwrap `data` field trong hàm `login` và `register` của `auth_service.dart`.
- Sửa lỗi 502 (Backend phải start thủ công): Đã thêm service `backend` vào `docker-compose.yml` để khi chạy docker-compose, backend NodeJS sẽ được chạy tự động cùng với DB, Redis, Kafka, ngăn chặn lỗi 502.

### What Next Session Should Do First
- Chạy lại dự án bằng `docker-compose up -d` và xác nhận backend khởi chạy bình thường.
- Kiểm tra tính năng Lưu thiết lập trên Tab 4 sau khi đăng nhập và đăng xuất lại trên app.
- Xóa status `IN_PROGRESS` thành `DONE` trong `features.json` nếu chạy ổn thỏa, và thực hiện feature/TODO tiếp theo.

## Known Issues / Blockers
- Log `[kafkajs] The group coordinator is not available` vẫn tồn tại do chưa bật Kafka trên local.
- Trip Planner & Recommendation AI vẫn cần `GEMINI_API_KEY`.

## Architectural Decisions This Session
- Khởi chạy Backend NodeJS qua Docker Compose thay vì chạy thủ công với `npm run dev` ở ngoài để đảm bảo môi trường đồng bộ.