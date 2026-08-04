# Session Progress

## Last Session Summary (Session 25 — 2026-08-04)
- Đã quét file `DevelopmentPlan.md` và tìm ra các hạng mục chưa được triển khai (chưa có trong `features.json`).
- Đã thêm 9 feature mới vào `features.json` theo đúng thứ tự ưu tiên (Phase 1 -> Phase 5):
  1. `platform-message-queue` (Phase 1.2: Kafka/RabbitMQ)
  2. `platform-api-gateway` (Phase 1.3: Kong/Nginx)
  3. `module-auth` (Phase 2.1: Backend Auth)
  4. `frontend-auth-ui` (Phase 2.1: Frontend UI Auth)
  5. `data-pipeline-kafka` (Phase 3.1: Recommendation logs)
  6. `ai-offline-training` (Phase 3.2: Python embeddings)
  7. `qa-e2e-testing` (Phase 5.1)
  8. `load-testing-optimization` (Phase 5.2)
  9. `ui-ux-polish` (Phase 5.3)

## Current State
- Feature: platform-message-queue (status: IN_PROGRESS)
- Branch: main
- Tests: Bỏ qua `npm test` do lỗi execution policy trên hệ thống.

## What Next Session Should Do First
1. Thực hiện tính năng `platform-message-queue`: Cấu hình Kafka (Zookeeper, Kafka broker) vào file `docker-compose.yml` để chuẩn bị cho môi trường luồng sự kiện (Event-driven).
2. Kiểm tra log của container để đảm bảo Kafka hoạt động ổn định.

## Known Issues / Blockers
- Môi trường CI/test hiện tại vẫn phụ thuộc vào catch-block để trả về mock data vì chưa chạy psql command trong quá trình `npm test`.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Quyết định chia nhỏ các tính năng UI của Android app thành từng feature độc lập theo Tab trong `features.json` để dễ theo dõi và gán task cho Frontend team.