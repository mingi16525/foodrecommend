# Session Progress

## Last Session Summary (Session 25 — 2026-08-03)
- Đã thêm feature mới `frontend-tab2-ai-swipe` vào `features.json`.
- Cài đặt thành công thư viện `framer-motion` để xử lý các animation vật lý (drag, spring) phức tạp cho ứng dụng web.
- Triển khai thành công giao diện "AI Swipe" (Tab 2) ở route `/swipe` với hiệu ứng quẹt thẻ Tinder-style mượt mà.
- Tạo `swipeStore.ts` bằng `zustand` quản lý danh sách thẻ, trạng thái vuốt (Thích/Bỏ qua) và trạng thái "hết thẻ" (Empty State).
- Tích hợp lớp Overlay hiển thị nhãn "LIKE" (Xanh) và "NOPE" (Đỏ) với độ mờ (opacity) thay đổi tuyến tính dựa trên quãng đường vuốt thông qua `useTransform` của framer-motion.
- Tích hợp các nút điều khiển thủ công (Manual control buttons) bên dưới để hỗ trợ người dùng bấm thay vì vuốt.

## Current State
- Feature: frontend-tab2-ai-swipe (status: DONE, 100% complete)
- Branch: main
- Tests: 24 passing / 24 total (Backend)
- Frontend build (TypeScript/Vite): OK.

## What Next Session Should Do First
1. Tiến hành thiết kế trang "Tab 3: EXPLORE MAP" (Khám phá bản đồ) hoặc "Tab 4: GROUP & SPLIT BILL".
2. Tích hợp UI cho Map (sử dụng thư viện hiển thị bản đồ ảo hoặc placeholder tĩnh trước) với giao diện danh sách quán ăn theo phong cách bottom-sheet.
3. Liên kết với store mock data để thực hiện logic hiển thị danh sách quán ăn gần đây.

## Known Issues / Blockers
- Component Map (Tab 3) sẽ yêu cầu key của Google Maps API nếu sử dụng bản đồ thật. Để tiến triển nhanh, nên sử dụng thư viện leaflet/react-leaflet miễn phí hoặc placeholder UI map trước.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Lựa chọn `framer-motion` làm thư viện hoạt ảnh cốt lõi cho React vì khả năng tính toán vật lý kéo/thả siêu việt, dễ dàng thực hiện hiệu ứng Tinder-swipe mà không cần viết các event listeners thủ công (onTouchStart/Move/End) phức tạp dễ gây lỗi hiệu năng.