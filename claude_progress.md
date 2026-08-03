# Session Progress

## Last Session Summary (Session 16 — 2026-08-03)
- Đã thêm feature mới `frontend-ui-prompt` vào `features.json`.
- Tạo file `UI.txt` cung cấp bản tóm tắt cực kỳ chi tiết về kiến trúc giao diện, phong cách thẩm mỹ (Aesthetics) theo xu hướng hiện đại (Glassmorphism, Dark mode, Vibrant gradients).
- Định hướng chi tiết giao diện và hoạt ảnh (micro-animations) cho 5 tab cốt lõi: Social Feed, AI Swipe, Restaurants Map, Group/Split Bill, User Profile.
- Các bước kiểm tra dự án (tests, linter, tsc) đều pass 100%.

## Current State
- Feature: frontend-ui-prompt (status: DONE, 100% complete)
- Branch: main
- Tests: 24 passing / 24 total

## What Next Session Should Do First
1. Chọn feature tiếp theo trong `features.json` hoặc khởi tạo Frontend Repository với Flutter dựa trên prompt file `UI.txt`.
2. Có thể cấu hình Docker và thực thi chạy thử container Database + script seed để kiểm tra API bằng Postman/Insomnia trước khi tích hợp Frontend.

## Known Issues / Blockers
- Môi trường CI/test hiện tại vẫn phụ thuộc vào catch-block để trả về mock data vì chưa chạy psql command thực tế trong quá trình `npm test`.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- File `UI.txt` đóng vai trò là "chất xúc tác" để trao đổi với Designer (hoặc AI tạo mã UI), bám chặt vào triết lý thẩm mỹ cao cấp (WOW factor) theo đúng yêu cầu dự án.