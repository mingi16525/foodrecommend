# Session Progress

## Last Session Summary (Session 23 — 2026-08-03)
- Đã thêm feature mới `frontend-setup-and-layout` vào `features.json`.
- Thiết lập thành công các thư viện cốt lõi cho Frontend: `react-router-dom`, `zustand`, `lucide-react`, `axios`. (Đã loại bỏ TailwindCSS để tuân thủ kiến trúc Vanilla CSS ưu tiên sự kiểm soát thiết kế cao cấp).
- Tạo cấu trúc thư mục tiêu chuẩn: `components`, `pages`, `services`, `store` trong `frontend/src`.
- Khởi tạo file `index.css` với các Token thiết kế (CSS Variables) chuẩn mực cho Glassmorphism, Dark mode, và Ambient glow background như yêu cầu trong `UI.txt`.
- Khởi tạo Base Layout thành công với thanh `BottomNavigation` chuẩn app di động mượt mà.

## Current State
- Feature: frontend-setup-and-layout (status: DONE, 100% complete)
- Branch: main
- Tests: 24 passing / 24 total (Backend)
- Frontend build (TypeScript/Vite): OK.

## What Next Session Should Do First
1. Tiến hành thiết kế trang cụ thể đầu tiên: "Tab 1: SOCIAL FEED" (Khám phá món ăn) hoặc "Tab 2: AI SWIPE" (Quẹt thẻ Tinder-style).
2. Tích hợp `zustand` để lấy dữ liệu tĩnh tạm thời (Mock state) vào các màn hình, nhằm hoàn thiện cấu trúc giao diện và trải nghiệm (UI/UX).
3. Đảm bảo tuân thủ chặt chẽ các yêu cầu về animations (mượt mà, quẹt thẻ) như đã chỉ định trong `UI.txt`.

## Known Issues / Blockers
- Thiết kế Animations phức tạp như Tinder Swipe trong React có thể đòi hỏi thư viện bổ sung như `framer-motion` hoặc `react-tinder-card`. Xem xét kỹ khi bước vào Tab 2.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Quyết định sử dụng Vanilla CSS kết hợp CSS Variables toàn cục (`index.css`) thay cho TailwindCSS để đảm bảo khả năng tinh chỉnh tối đa (Pixel-perfect) cho triết lý thiết kế Premium Glassmorphism.
- Thiết lập kiến trúc Layout cơ bản gồm `App-container` (kích thước chuẩn Mobile) bọc các thẻ con và thanh điều hướng cố định dưới đáy.