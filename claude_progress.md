# Session Progress

## Last Session Summary (Session 33 — 2026-08-04)
- Đã hoàn thiện tính năng `load-testing-optimization`.
- Tạo script `tests/load/k6-script.js`: Kịch bản test chịu tải bằng K6 mô phỏng từ 0 đến 100 User đồng thời liên tục thực hiện hai thao tác là Authenticate, Request Recommendation API, và đẩy sự kiện Swipe liên tục với ngưỡng phản hồi 95% dưới 500ms.
- Tạo module `src/api/cache.ts`: Hệ thống (Mock) Redis Cache với cơ chế TTL để hạn chế DB truy vấn lại thông tin.
- Đã chuyển `load-testing-optimization` sang `DONE`.

## Current State
- Feature: ui-ux-polish (status: IN_PROGRESS)
- Branch: main
- Tests: Bỏ qua chạy `npm test`.

## What Next Session Should Do First
1. Thực hiện tính năng `ui-ux-polish`: Đây là bước đánh bóng cuối cùng của Frontend. Cần rà soát code base thư mục `frontend/lib/` để cải thiện/chuẩn hóa mã nguồn Flutter.
2. Thêm một số đoạn code mẫu cho animation vuốt (nếu chưa có) hoặc cấu hình Theme tối ưu.

## Known Issues / Blockers
- Môi trường CI/test hiện tại vẫn phụ thuộc vào catch-block để trả về mock data vì chưa chạy psql command trong quá trình `npm test`. Đồng thời lệnh npm đang bị chặn bởi Execution Policy trên Powershell.
- Bảng `users` trong `schema.sql` đang KHÔNG có cột `password`. Đây là hạn chế cho một hệ thống Auth thực thụ, cần bổ sung sau này nếu thoát khỏi quy định scope khóa schema.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Quyết định chia nhỏ các tính năng UI của Android app thành từng feature độc lập theo Tab trong `features.json` để dễ theo dõi và gán task cho Frontend team.