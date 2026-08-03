# Session Progress

## Last Session Summary (Session 32 — 2026-08-03)
- Đã thêm tính năng `frontend-integration-group-split` vào `features.json`.
- Cập nhật backend `group/service.ts` và `api/group.routes.ts` để bổ sung endpoint `GET /api/groups` phục vụ việc lấy danh sách tất cả các nhóm.
- Cập nhật `groupStore.ts` ở Frontend để gọi API `/groups` thông qua `apiClient`.
- Thay đổi `GroupSplit.tsx` để hiển thị trạng thái Loading, gọi hàm `fetchGroups()` khi load trang (on mount) và xử lý lỗi khi fetch dữ liệu.
- Map dữ liệu group từ backend sang cấu trúc UI (tạm thời mock `members` và `activeBills` vì endpoint `GET /groups` chưa trả về đầy đủ các thông tin này).

## Current State
- Feature: frontend-integration-group-split (status: DONE, 100% complete)
- Branch: main
- Tests: 24 passing / 24 total (Backend)
- Frontend build (TypeScript/Vite): OK.
- Group Split tab (Tab 4) đã hiển thị danh sách các nhóm được lấy từ database PostgreSQL.

## What Next Session Should Do First
1. Tiến hành tích hợp API cuối cùng cho `Tab 2 - AI Swipe`.
2. Gợi ý: Làm API backend integration cho `Tab 2 - AI Swipe` để gọi tới logic Recommendation Engine và lấy ra danh sách các món ăn gợi ý thay vì dùng mock data tĩnh.

## Known Issues / Blockers
- Hiện tại bảng `posts` không có thông tin tương tác, bảng `groups` không trả về `members`/`bills` ở API list, và trường `location` ở `restaurants` đang trống. Những dữ liệu này đang được mock linh hoạt tại tầng store để UI không bị trống hoặc lỗi.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.
- Việc tách bill (Split Bill) mới chỉ thực hiện dưới dạng API tính toán chứ chưa lưu persist vào Database.

## Architectural Decisions This Session
- Quyết định mock dữ liệu `members` và `activeBills` ngay tại `groupStore.ts` sau khi fetch danh sách groups thành công từ backend, do thiết kế của endpoint `/api/groups` hiện tại chưa hỗ trợ join quá nhiều bảng để giữ performance. Mở rộng API backend sau này khi làm feature chi tiết.