# Session Progress

## Last Session Summary (Session 30 — 2026-08-03)
- Đã thêm tính năng `frontend-integration-social-feed` vào `features.json`.
- Cập nhật `feedStore.ts` để gọi API `/social/feed` thông qua `apiClient`.
- Thay đổi `SocialFeed.tsx` để hiển thị trạng thái Loading, gọi hàm `fetchFeed()` khi load trang (on mount) và xử lý lỗi khi fetch dữ liệu.
- Map dữ liệu từ backend sang cấu trúc UI (tạm thời mock những thông tin UI cần mà bảng `posts` chưa có như `likes`, `comments`, `shares`).

## Current State
- Feature: frontend-integration-social-feed (status: DONE, 100% complete)
- Branch: main
- Tests: 24 passing / 24 total (Backend)
- Frontend build (TypeScript/Vite): OK.
- Social Feed tab đã hiển thị dữ liệu trực tiếp từ database PostgreSQL.

## What Next Session Should Do First
1. Tiếp tục tích hợp API thực tế cho `Tab 3 - Explore Map` hoặc `Tab 4 - Group Split`.
2. Gợi ý: Làm API backend integration cho `Tab 3 - Explore Map` để load danh sách restaurants xung quanh.

## Known Issues / Blockers
- Hiện tại bảng `posts` ở Database không lưu `likes`, `comments`, và `shares`. Các trường này đang được random trên Frontend cho mục đích demo UI. Cần mở rộng thiết kế schema cho tương tác (interaction) về sau.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.
- Tính năng AI Swipe chưa lấy danh sách recommended dishes từ Python/Go Engine mà đang hardcode mock data.

## Architectural Decisions This Session
- Chấp nhận việc random thông tin `likes`/`comments` cho Social Feed ngay trên Frontend ở hàm map dữ liệu để đảm bảo layout không bị vỡ hoặc trống.