# Session Progress

## Last Session Summary (Session 14 — 2026-08-03)
- Đã thêm feature mới `update-readme-future-vision` vào `features.json`.
- Cập nhật tài liệu `README.md` bao quát toàn bộ tầm nhìn dự án.
- Liệt kê tình trạng hiện tại của 5 modules (User, Restaurant, Recommendation, Group & Split Bill, Social).
- Xác định hướng đi tương lai (Frontend Flutter, AWS/GCP pipeline, WebSocket realtime, Vector DB indexing).
- Các bước kiểm tra dự án (tests, linter, tsc) đều pass 100%.

## Current State
- Feature: update-readme-future-vision (status: DONE, 100% complete)
- Branch: main
- Tests: 24 passing / 24 total

## What Next Session Should Do First
1. Xây dựng Docker container hoàn chỉnh hoặc test API thực tế (tạo seed data cho Postgres, Redis).
2. Hoặc khởi tạo Frontend Repository với Flutter.

## Known Issues / Blockers
- Môi trường CI/test hiện tại phụ thuộc vào catch-block để trả về mock data do database chưa có dữ liệu thật (Seed).

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- README.md giờ đóng vai trò là "Bản đồ sản phẩm" (Product Roadmap), chỉ rõ ranh giới giữa những gì đã thực hiện (MVP API) và những gì dành cho phase phát triển sau (Microservices, AI model thực, Flutter Frontend).