# Session Progress

## Last Session Summary (Session 24 — 2026-08-03)
- Đã thêm feature mới `frontend-tab1-social-feed` vào `features.json`.
- Triển khai thành công giao diện "Social Feed" (Tab 1) tương tự TikTok/Reels sử dụng CSS Scroll Snapping (cuộn thẻ mượt mà 100vh).
- Tạo `feedStore.ts` bằng `zustand` quản lý danh sách FeedPost, trạng thái Like (thả tim) và Save (lưu bài) của các post sử dụng Mock Data tạm thời.
- Thiết kế lớp Overlay gradients để làm nổi bật thông tin (Tên Reviewer, Caption, Tên quán ăn) trên nền media.
- Tích hợp hiệu ứng trái tim bay (Heart micro-animation) ngay giữa màn hình khi người dùng thực hiện hành động double-tap.

## Current State
- Feature: frontend-tab1-social-feed (status: DONE, 100% complete)
- Branch: main
- Tests: 24 passing / 24 total (Backend)
- Frontend build (TypeScript/Vite): OK.

## What Next Session Should Do First
1. Tiến hành thiết kế trang cụ thể tiếp theo: "Tab 2: AI SWIPE" (Quẹt thẻ Tinder-style) ở route `/swipe`.
2. Tạo component Swipe Card hỗ trợ vuốt trái/phải thông qua CSS Transitions hoặc framer-motion.
3. Liên kết với store mock data để thực hiện logic vuốt (lưu vào danh sách thích/không thích).

## Known Issues / Blockers
- Logic swipe (vuốt thẻ) rất nhạy cảm về cảm ứng trên web mobile, cân nhắc việc sử dụng thư viện chuyên biệt như `react-tinder-card` để tiết kiệm thời gian và tăng độ mượt, hoặc tự code bằng `onTouchStart/Move/End`.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Lựa chọn thuần CSS Scroll Snapping (`scroll-snap-type: y mandatory`) để mô phỏng cơ chế cuộn của TikTok thay vì dùng thư viện js bên thứ 3 nhằm đạt được hiệu suất (performance) tối đa và nguyên bản với trình duyệt.
- Sử dụng Hook tùy chỉnh `useRef` và `setTimeout` để xác định sự kiện Double-Tap thuần React mà không cần gói hỗ trợ Gestures cồng kềnh.