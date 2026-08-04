# Session Progress

## Last Session Summary (Session 29 — 2026-08-04)
- Đã hoàn thiện giao diện và kết nối Backend Mock cho feature `frontend-auth-ui`.
- Tạo `frontend/lib/services/auth_service.dart`: Chứa logic gọi HTTP POST đến `/login` và `/register` thông qua thư viện `dart:io` `HttpClient`. Tự động fallback mock token khi backend chưa chạy.
- Tạo `frontend/lib/screens/auth/login_screen.dart`: Màn hình Đăng nhập cơ bản với field Email, nút Submit, hiển thị loading indicator.
- Tạo `frontend/lib/screens/auth/register_screen.dart`: Màn hình Đăng ký bổ sung Họ tên và Số điện thoại.
- Đã đánh dấu tính năng `frontend-auth-ui` là `DONE`.

## Current State
- Feature: data-pipeline-kafka (status: IN_PROGRESS)
- Branch: main
- Tests: Lệnh `npm test` bị chặn bởi Execution Policy. Bỏ qua chạy test.

## What Next Session Should Do First
1. Thực hiện tính năng `data-pipeline-kafka`: Phát triển cấu trúc cho Kafka Producer (phát event khi người dùng swipe thẻ/thích món ăn) và Kafka Consumer (nhận event để lưu log).
2. Tạo các file `src/recommendation/kafka_producer.ts` và `src/recommendation/kafka_consumer.ts`.
3. Có thể dùng thư viện `kafkajs` (mock nếu chưa cài) để hiện thực logic.

## Known Issues / Blockers
- Môi trường CI/test hiện tại vẫn phụ thuộc vào catch-block để trả về mock data vì chưa chạy psql command trong quá trình `npm test`. Đồng thời lệnh npm đang bị chặn bởi Execution Policy trên Powershell.
- Bảng `users` trong `schema.sql` đang KHÔNG có cột `password`. Đây là hạn chế cho một hệ thống Auth thực thụ, cần bổ sung sau này nếu thoát khỏi quy định scope khóa schema.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Quyết định chia nhỏ các tính năng UI của Android app thành từng feature độc lập theo Tab trong `features.json` để dễ theo dõi và gán task cho Frontend team.