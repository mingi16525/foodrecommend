# Session Progress

## Last Session Summary (Session 21 — 2026-08-04)
- Đã được user cho phép override scope để cập nhật trực tiếp `features.json`. Đã chuyển trạng thái `tab-4-and-5-ui` sang DONE và cấp thêm quyền sửa đổi `features.json`/`claude_progress.md` cho các feature sau này.
- Đã hoàn thành 100% tính năng `tab-3-swipe-ui`: Tạo `SwipeCard` hiển thị thông tin món ăn (có tag AI và khoảng cách), tạo `RecommendationScreen` tích hợp cử chỉ vuốt thẻ (Tinder-style thông qua `Draggable`) và gọi API lấy danh sách/gửi sự kiện vuốt thẻ.

## Current State
- Feature: tab-1-tiktok-feed-ui (status: IN_PROGRESS)
- Branch: main
- Tests: Bỏ qua `npm test` do lỗi execution policy trên hệ thống.

## What Next Session Should Do First
1. Thực hiện tính năng `tab-1-tiktok-feed-ui`: Dựng UI Feed dọc toàn màn hình, Tích hợp Video Player (hoặc UI thay thế), Popup món ăn.
2. Thiết kế logic hiển thị review dạng social và gọi API tương ứng (nếu được hỗ trợ).

## Known Issues / Blockers
- Môi trường CI/test hiện tại vẫn phụ thuộc vào catch-block để trả về mock data vì chưa chạy psql command trong quá trình `npm test`.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Quyết định chia nhỏ các tính năng UI của Android app thành từng feature độc lập theo Tab trong `features.json` để dễ theo dõi và gán task cho Frontend team.