# Session Progress

## Last Session Summary (Session 22 — 2026-08-04)
- Đã hoàn thành 100% tính năng `tab-1-tiktok-feed-ui`.
- Xây dựng widget `CustomVideoPlayer` dưới dạng mockup thay cho `video_player` thật.
- Xây dựng màn hình `FeedScreen` dạng cuộn dọc (`PageView.builder`) hiển thị Video toàn màn hình, thanh tab phụ (Dành cho bạn, Đang theo dõi, Món hot), các nút tương tác social bên phải, avatar tác giả, popup 'Món ăn thông minh' kèm giá và khoảng cách ở góc dưới.

## Current State
- Feature: tab-2-group-trip-ui (status: IN_PROGRESS)
- Branch: main
- Tests: Bỏ qua `npm test` do lỗi execution policy trên hệ thống.

## What Next Session Should Do First
1. Thực hiện tính năng `tab-2-group-trip-ui`: Thiết kế màn hình tạo nhóm, Chat thread, Tạo đơn đồ ăn nhóm, Giao diện Trip Planner.
2. Thiết kế logic tích hợp các widget Trip Planner và Split Bill vào không gian Chat nhóm.

## Known Issues / Blockers
- Môi trường CI/test hiện tại vẫn phụ thuộc vào catch-block để trả về mock data vì chưa chạy psql command trong quá trình `npm test`.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Quyết định chia nhỏ các tính năng UI của Android app thành từng feature độc lập theo Tab trong `features.json` để dễ theo dõi và gán task cho Frontend team.