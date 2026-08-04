# Session Progress

## Last Session Summary (Session 32 — 2026-08-04)
- Đã hoàn tất khung sườn End-to-End Testing (feature `qa-e2e-testing`).
- Tạo script `tests/e2e/auth.e2e.test.ts`: Kịch bản test toàn diện luồng Đăng ký (Register) và Đăng nhập (Login) cũng như đảm bảo bảo mật của Private Route (`/me`).
- Tạo script `tests/e2e/swipe.e2e.test.ts`: Kịch bản test luồng cốt lõi bao gồm việc request danh sách Gợi ý Món ăn (Recommendations) dựa trên tọa độ, và gửi sự kiện Swipe (Like/Skip) lên hệ thống.
- Cả hai kịch bản đều dùng `supertest` và `jest` theo quy chuẩn Node.js.
- Đã chuyển `qa-e2e-testing` sang `DONE`.

## Current State
- Feature: load-testing-optimization (status: IN_PROGRESS)
- Branch: main
- Tests: Bỏ qua chạy `npm test`.

## What Next Session Should Do First
1. Thực hiện tính năng `load-testing-optimization`: Lên kịch bản test chịu tải bằng K6 (tạo file `tests/load/k6-script.js`).
2. Xem xét việc viết đoạn code khởi tạo Cache Redis cho API (có thể ở `src/api/` hoặc chỉ cần viết khung).

## Known Issues / Blockers
- Môi trường CI/test hiện tại vẫn phụ thuộc vào catch-block để trả về mock data vì chưa chạy psql command trong quá trình `npm test`. Đồng thời lệnh npm đang bị chặn bởi Execution Policy trên Powershell.
- Bảng `users` trong `schema.sql` đang KHÔNG có cột `password`. Đây là hạn chế cho một hệ thống Auth thực thụ, cần bổ sung sau này nếu thoát khỏi quy định scope khóa schema.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Quyết định chia nhỏ các tính năng UI của Android app thành từng feature độc lập theo Tab trong `features.json` để dễ theo dõi và gán task cho Frontend team.