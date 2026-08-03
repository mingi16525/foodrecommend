# Session Progress

## Last Session Summary (Session 26 — 2026-08-03)
- Đã thêm feature mới `frontend-tab3-explore-map` vào `features.json`.
- Cài đặt thành công thư viện `leaflet`, `react-leaflet` để hiển thị bản đồ ảo (OpenStreetMap) nhằm tiết kiệm chi phí/key của Google Maps trong giai đoạn MVP.
- Triển khai thành công giao diện "Explore Map" (Tab 3) ở route `/explore` với bản đồ tương tác và custom markers.
- Tạo một "Bottom Sheet" vuốt mượt mà sử dụng `framer-motion` (spring physics), có khả năng chuyển đổi giữa danh sách "Quán ăn gần đây (Trending Nearby)" và "Chi tiết Quán ăn" khi người dùng nhấn vào Marker trên bản đồ.
- Tạo `mapStore.ts` bằng `zustand` quản lý danh sách địa điểm (mock data) và trạng thái địa điểm đang được chọn, tích hợp tính năng tự động FlyTo (zoom mượt) đến địa điểm được chọn.

## Current State
- Feature: frontend-tab3-explore-map (status: DONE, 100% complete)
- Branch: main
- Tests: 24 passing / 24 total (Backend)
- Frontend build (TypeScript/Vite): OK.

## What Next Session Should Do First
1. Tiến hành thiết kế trang "Tab 4: GROUP & SPLIT BILL" (Nhóm & Chia tiền) hoặc "Tab 5: USER PROFILE" (Cá nhân hóa).
2. Tích hợp UI cho Group (Tạo nhóm mới, Thêm thành viên, Danh sách Bill) với phong cách thiết kế Glassmorphism.

## Known Issues / Blockers
- None at the moment. UI components đang được tái sử dụng rất tốt qua các biến CSS toàn cục.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Lựa chọn OpenStreetMap (OSM) kết hợp tile CARTO (Dark theme) để bản đồ phù hợp hoàn hảo với Dark Mode Premium Aesthetic của ứng dụng mà không cần tốn phí thiết lập API Google Maps.
- Kết hợp Leaflet cho bản đồ và Framer-motion cho Bottom Sheet mang lại trải nghiệm Native App (Native-like) xuất sắc trên nền Web.