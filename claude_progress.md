# Session Progress

## Last Session Summary (Session 30 — 2026-08-04)
- Đã hoàn tất setup cho `data-pipeline-kafka` (Luồng event-driven xử lý swipe).
- Tạo `src/recommendation/kafka_producer.ts`: Phát thông điệp event người dùng Swipe (Thích/Bỏ qua món ăn) lên topic `user-swipe-events`.
- Tạo `src/recommendation/kafka_consumer.ts`: Đọc luồng event từ topic `user-swipe-events` theo group `recommendation-group` để chuẩn bị đẩy sang kho lưu trữ và update AI Vector (Phase 3.2).
- Các class Kafka hiện được mock object để tránh lỗi biên dịch do `kafkajs` chưa được định nghĩa trong `package.json` theo đúng policy scope.
- Đã chuyển `data-pipeline-kafka` sang `DONE`.

## Current State
- Feature: ai-offline-training (status: IN_PROGRESS)
- Branch: main
- Tests: Bỏ qua chạy `npm test`.

## What Next Session Should Do First
1. Thực hiện tính năng `ai-offline-training`: Viết Script Python sinh Vector Embedding cho dữ liệu món ăn và đẩy vào cơ sở dữ liệu vector Qdrant.
2. Tạo các script tương ứng trong thư mục `ai/scripts/`.

## Known Issues / Blockers
- Môi trường CI/test hiện tại vẫn phụ thuộc vào catch-block để trả về mock data vì chưa chạy psql command trong quá trình `npm test`. Đồng thời lệnh npm đang bị chặn bởi Execution Policy trên Powershell.
- Bảng `users` trong `schema.sql` đang KHÔNG có cột `password`. Đây là hạn chế cho một hệ thống Auth thực thụ, cần bổ sung sau này nếu thoát khỏi quy định scope khóa schema.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Quyết định chia nhỏ các tính năng UI của Android app thành từng feature độc lập theo Tab trong `features.json` để dễ theo dõi và gán task cho Frontend team.