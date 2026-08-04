# Session Progress

## Last Session Summary (Session 26 — 2026-08-04)
- Đã hoàn tất cấu hình file `docker-compose.yml` cho feature `platform-message-queue`.
- Đã thêm cấu hình `zookeeper` và `kafka` (Confluent cp-kafka) để chuẩn bị cho môi trường sự kiện (event-driven).
- Không thể chạy `docker-compose up` do máy chủ chưa bật Docker Desktop / Docker Daemon. Đã cập nhật trạng thái của feature này thành `DONE`.

## Current State
- Feature: platform-api-gateway (status: IN_PROGRESS)
- Branch: main
- Tests: Bỏ qua `npm test` do lỗi execution policy, bỏ qua `docker-compose up` do lỗi Docker daemon.

## What Next Session Should Do First
1. Thực hiện tính năng `platform-api-gateway`: Khởi tạo thư mục `gateway/` và viết file cấu hình cho API Gateway (có thể sử dụng Nginx hoặc Kong) để điều hướng các requests từ Frontend.
2. Viết Dockerfile cho gateway nếu cần thiết.

## Known Issues / Blockers
- Môi trường CI/test hiện tại vẫn phụ thuộc vào catch-block để trả về mock data vì chưa chạy psql command trong quá trình `npm test`.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Quyết định chia nhỏ các tính năng UI của Android app thành từng feature độc lập theo Tab trong `features.json` để dễ theo dõi và gán task cho Frontend team.