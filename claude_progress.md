# Session Progress

## Last Session Summary (Session 28 — 2026-08-03)
- Đã thêm feature mới `frontend-tab5-user-profile` vào `features.json`.
- Triển khai thành công giao diện "User Profile" (Tab 5) ở route `/profile` (hay màn hình cuối).
- Xây dựng layout hiển thị Avatar với viền gradient nổi bật, cùng các chỉ số thống kê (Reviews, Followers, Following) nằm trong Glassmorphism panel.
- Tích hợp khu vực "Taste Preferences" (Sở thích ăn uống) bằng các tags và "Recent Visits" (Lịch sử ghé thăm nhà hàng).
- Tạo `profileStore.ts` bằng `zustand` quản lý dữ liệu cá nhân, danh sách sở thích và lịch sử các nhà hàng đã trải nghiệm với Mock Data.

## Current State
- Feature: frontend-tab5-user-profile (status: DONE, 100% complete)
- Branch: main
- Tests: 24 passing / 24 total (Backend)
- Frontend build (TypeScript/Vite): OK.
- TẤT CẢ 5 TABS GIAO DIỆN ĐÃ ĐƯỢC HOÀN THIỆN!

## What Next Session Should Do First
1. Hệ thống UI Frontend cơ bản đã hoàn tất. Bước tiếp theo là "Backend-Frontend Integration".
2. Bắt đầu thiết lập Axios/Fetch logic để thay thế Zustand Mock Data bằng dữ liệu thật từ Backend (API Gateway localhost:8000).
3. Đề xuất: Bắt đầu từ Tab 1 (Social Feed) hoặc Tab 5 (User Profile) để lấy dữ liệu.

## Known Issues / Blockers
- CORS errors có thể xảy ra khi Frontend (Vite port 5173) gọi Backend API (Kong port 8000). Cần thiết lập CORS ở API Gateway hoặc Backend Services.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Profile Avatar sử dụng kỹ thuật CSS `background-image` kết hợp `background-clip: content-box, border-box` để tạo viền gradient bo tròn hoàn hảo mà không cần thẻ div bọc ngoài phức tạp.