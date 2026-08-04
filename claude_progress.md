# Session Progress

## Last Session Summary (Session 31 — 2026-08-04)
- Đã hoàn tất luồng AI Offline (feature `ai-offline-training`).
- Tạo script `ai/scripts/generate_embeddings.py` giả lập việc tính toán vector embedding với độ dài 384 chiều (dimension) cho 500 món ăn mẫu và lưu ra file JSON. 
- Tạo script `ai/scripts/ingest_qdrant.py` chịu trách nhiệm đọc file JSON chứa vector và đẩy dữ liệu lên hệ quản trị CSDL vector Qdrant. Để tránh lỗi thiếu thư viện `qdrant-client` trên môi trường, tôi đã viết dạng MockQdrantClient.
- Đã chuyển `ai-offline-training` sang `DONE`.

## Current State
- Feature: qa-e2e-testing (status: IN_PROGRESS)
- Branch: main
- Tests: Bỏ qua chạy `npm test`.

## What Next Session Should Do First
1. Thực hiện tính năng `qa-e2e-testing`: Bắt đầu lên khung sườn cho các kịch bản test tự động E2E (End-to-End) các luồng chính của hệ thống.
2. Tạo các kịch bản E2E mẫu trong thư mục `tests/e2e/`.

## Known Issues / Blockers
- Môi trường CI/test hiện tại vẫn phụ thuộc vào catch-block để trả về mock data vì chưa chạy psql command trong quá trình `npm test`. Đồng thời lệnh npm đang bị chặn bởi Execution Policy trên Powershell.
- Bảng `users` trong `schema.sql` đang KHÔNG có cột `password`. Đây là hạn chế cho một hệ thống Auth thực thụ, cần bổ sung sau này nếu thoát khỏi quy định scope khóa schema.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Quyết định chia nhỏ các tính năng UI của Android app thành từng feature độc lập theo Tab trong `features.json` để dễ theo dõi và gán task cho Frontend team.