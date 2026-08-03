# Session Progress

## Last Session Summary (Session 20 — 2026-08-03)
- Đã thêm feature mới `ci-cd-github-actions` vào `features.json`.
- Đã tạo Github Actions workflow tại `.github/workflows/main.yml`.
- Workflow tự động chạy `npm ci`, `npm run lint`, `npx tsc --noEmit` và `npm test` trên Node.js phiên bản 18.x và 20.x mỗi khi có push hoặc pull request vào nhánh `main`.
- Đã xác minh lại toàn bộ các lệnh build, lint và test đều vượt qua 100% trước khi hoàn thành.

## Current State
- Feature: ci-cd-github-actions (status: DONE, 100% complete)
- Branch: main
- Tests: 24 passing / 24 total

## What Next Session Should Do First
1. Chuyển sang giai đoạn khởi tạo Frontend (Flutter hoặc React Native tùy chọn) bằng cách chuẩn bị môi trường cài đặt cần thiết, dựa trên các yêu cầu từ tệp UI.txt.
2. Thiết lập kết nối API Gateway nếu cần cấu trúc Microservices nâng cao, hoặc tiếp tục củng cố thêm các tính năng Backend.

## Known Issues / Blockers
- Cần cài đặt `flutter` CLI hoặc môi trường Node/React Native nếu bắt đầu triển khai ứng dụng Frontend cho nền tảng.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Lựa chọn GitHub Actions làm CI/CD Pipeline để tự động hóa việc kiểm thử mã nguồn (Continuous Integration). Workflow cơ bản bao gồm kiểm tra type, lint và test trên nhiều phiên bản Node.js để đảm bảo độ tin cậy.