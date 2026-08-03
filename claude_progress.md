# Session Progress

## Last Session Summary (Session 33 — 2026-08-03)
- Đã thêm tính năng `frontend-integration-ai-swipe` vào `features.json`.
- Cập nhật `swipeStore.ts` ở Frontend để gọi API `/recommendations` và `/recommendations/swipe` thông qua `apiClient`.
- Thay đổi `AiSwipe.tsx` để hiển thị trạng thái Loading, gọi hàm `fetchRecommendations()` khi load trang (on mount) và xử lý lỗi khi fetch dữ liệu.
- Tích hợp logic Swipe Left/Right gọi API lưu action về Backend.
- Map dữ liệu trả về từ Recommendation Engine (mock Qdrant) sang UI Card Data với các hình ảnh/tag mock linh động vì dữ liệu engine trả về còn thiếu.

## Current State
- Feature: frontend-integration-ai-swipe (status: DONE, 100% complete)
- Branch: main
- Tests: 24 passing / 24 total (Backend)
- Frontend build (TypeScript/Vite): OK.
- Ai Swipe tab (Tab 2) đã được kết nối và hoạt động với Backend Recommendation Engine.
- TẤT CẢ 5 TAB CỦA ỨNG DỤNG ĐÃ ĐƯỢC KẾT NỐI VỚI BACKEND POSTGRES/EXPRESS THÀNH CÔNG.

## What Next Session Should Do First
1. Dự án đã hoàn thành giai đoạn kết nối MVP cơ bản giữa Frontend và Backend. Tiếp theo có thể thiết lập các tính năng nâng cao hơn (Realtime Chat/Voting, Map Location thực tế) hoặc tối ưu code.
2. Kiểm tra/Tổng hợp lại toàn bộ tính năng và bàn giao MVP.

## Known Issues / Blockers
- Engine trả về dữ liệu quá ít (chỉ có ID, Name, Score) nên frontend phải random image/price/distance để UI không bị vỡ. Cần enrich metadata từ DB ở tầng Recommendation Engine API.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.
- Việc tách bill (Split Bill) mới chỉ thực hiện dưới dạng API tính toán chứ chưa lưu persist vào Database.

## Architectural Decisions This Session
- Chấp nhận việc mock hình ảnh, price, và distance ở `swipeStore.ts` để UI không bị thay đổi thiết kế trong khi chờ backend hoàn thiện tính năng enrich data của Recommendation Engine.