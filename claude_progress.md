# Session Progress

## Last Session Summary (Session 31 — 2026-08-03)
- Đã thêm tính năng `frontend-integration-explore-map` vào `features.json`.
- Cập nhật backend `restaurant/service.ts` và `api/restaurant.routes.ts` để bổ sung endpoint `GET /api/restaurants` phục vụ việc lấy danh sách tất cả nhà hàng.
- Cập nhật `mapStore.ts` ở Frontend để gọi API `/restaurants` thông qua `apiClient`.
- Thay đổi `ExploreMap.tsx` để hiển thị trạng thái Loading, gọi hàm `fetchLocations()` khi load trang (on mount) và xử lý lỗi khi fetch dữ liệu.
- Map dữ liệu nhà hàng từ backend sang cấu trúc UI (tạm thời mock tọa độ ngẫu nhiên gần trung tâm TPHCM nếu dữ liệu `location` không có sẵn trong DB).

## Current State
- Feature: frontend-integration-explore-map (status: DONE, 100% complete)
- Branch: main
- Tests: 24 passing / 24 total (Backend)
- Frontend build (TypeScript/Vite): OK.
- Explore Map tab (Tab 3) đã hiển thị các marker nhà hàng từ database PostgreSQL.

## What Next Session Should Do First
1. Tiếp tục tích hợp API thực tế cho `Tab 2 - AI Swipe` hoặc `Tab 4 - Group Split`.
2. Gợi ý: Làm API backend integration cho `Tab 4 - Group Split` để load danh sách các nhóm và hóa đơn từ DB.

## Known Issues / Blockers
- Hiện tại trường `location` (tọa độ JSON) ở DB đang null với dữ liệu seed, nên mapStore đang random tạo tọa độ để có thể hiển thị trên Leaflet. Cần cung cấp dữ liệu seed tọa độ chuẩn sau này.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.
- Tính năng AI Swipe chưa lấy danh sách recommended dishes từ Python/Go Engine mà đang hardcode mock data.

## Architectural Decisions This Session
- Chấp nhận việc tạo Random Lat/Lng trên UI dựa vào một center tĩnh (10.7769, 106.7009) nếu API trả về location trống, giúp tránh lỗi React Leaflet khi marker không có tọa độ.