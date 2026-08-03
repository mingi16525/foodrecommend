# Session Progress

## Last Session Summary (Session 29 — 2026-08-03)
- Đã thêm feature mới `frontend-integration-api-setup` vào `features.json`.
- Thiết lập thành công Cấu hình CORS (Cross-Origin Resource Sharing) trong `nginx/nginx.conf` cho API Gateway.
- Cài đặt thư viện `axios` vào frontend và tạo instance `apiClient` (`src/api/client.ts`) kết nối tới `http://localhost:8000/api`.
- Cập nhật `profileStore.ts` để sử dụng hàm `fetchProfile`, lấy dữ liệu user thật từ database thay vì mock data, cụ thể là từ endpoint `/users/:id`.
- Tích hợp trạng thái `isLoading` và `error` hiển thị trên giao diện `UserProfile.tsx`.

## Current State
- Feature: frontend-integration-api-setup (status: DONE, 100% complete)
- Branch: main
- Tests: 24 passing / 24 total (Backend)
- Frontend build (TypeScript/Vite): OK.
- Docker services (API Gateway, Backend, Postgres, Redis) đang chạy trơn tru.

## What Next Session Should Do First
1. Tiếp tục tích hợp API thực tế cho các Tab khác (Social Feed, AI Swipe, Explore Map, hoặc Group Split).
2. Xây dựng logic API gọi tới backend cho `Social Feed` để lấy danh sách bài đăng từ database.

## Known Issues / Blockers
- Hiện tại mock history trong Profile vẫn được giữ lại do database chưa có dữ liệu lịch sử hoàn thiện (cần bổ sung endpoint Backend sau này).

## Observations (Not Fixed — Outside Current Scope)
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Cấu hình Axios Interceptors sẵn trong `client.ts` để tiện cho việc đính kèm token xác thực và xử lý lỗi global (global error handling) trong tương lai.