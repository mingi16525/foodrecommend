# Session Progress

## Last Session Summary
- Fix 502 Bad Gateway bằng cách start lại backend (`npm run dev`) trên cổng 3000.
- Sửa lỗi linter (thay `final` bằng `const`) trong `onboarding_screen.dart`.

## Current State
- Backend: Đã được thêm vào `docker-compose.yml` để khởi chạy cùng cơ sở hạ tầng (DB, Redis, Kafka).
- Frontend: Đã sửa lỗi lưu dữ liệu trên Tab 4 thất bại sau khi logout và login lại.
- Tests (Jest): `npm test` PASS TOÀN BỘ (34 tests).

### Current Session
- Sửa lỗi `ld-linux-x86-64.so.2` (lỗi 500/502 khi backend chạy native module của ONNX hoặc bcrypt) bằng cách đổi image backend trong `docker-compose.yml` từ `node:20-alpine` sang `node:20` (Debian-based có sẵn glibc).
- Khởi động lại backend bằng `docker-compose up -d` và xác nhận backend đã hoạt động ổn định trên cổng 3000 không còn lỗi.

### What Next Session Should Do First
- Xóa status `IN_PROGRESS` thành `DONE` đối với `fix-backend-502-restart` và `fix-tab4-save-logout` trong `features.json`.
- Kiểm tra lại toàn bộ luồng chức năng Tab 4 và quá trình khởi động ứng dụng để đảm bảo tính ổn định.

## Known Issues / Blockers
- Log `[kafkajs] The group coordinator is not available` vẫn tồn tại do chưa bật Kafka trên local.
- Trip Planner & Recommendation AI vẫn cần `GEMINI_API_KEY`.

## Architectural Decisions This Session
- Khởi chạy Backend NodeJS qua Docker Compose thay vì chạy thủ công với `npm run dev` ở ngoài để đảm bảo môi trường đồng bộ.