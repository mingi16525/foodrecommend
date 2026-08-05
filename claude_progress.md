# Session Progress

## Last Session Summary
- Hoàn thành `improve-hanoi-mock-data`: Cập nhật DB tọa độ Hà Nội, thêm 30 video bài viết mẫu, sửa dữ liệu seed cho test user.

## Current State
- Backend: Local Beta hoàn thiện 100%, có data, mock DB đầy đủ.
- Frontend: `fix-feed-and-swipe` đã HOÀN THÀNH. `dart analyze` PASS xanh (No issues found).
- Tests (Jest): `npm test` PASS TOÀN BỘ.

### Current Session
- Hoàn thành feature `fix-feed-and-swipe`:
  - `feed_screen.dart`: Bổ sung xử lý null-safety bằng toán tử `??` cho các trường có thể bị null từ API (ví dụ: `video_url`, `author_avatar`, `likes`, `comments`). Đã fix lỗi null-pointer gây ra tình trạng crash UI và hiển thị mock-data.
  - `recommendation_screen.dart`: Thay thế Widget `Draggable` (lỗi nhận tọa độ tuyệt đối dx) bằng `Dismissible` chuyên dụng cho tương tác Swipe thẻ. Thêm sự kiện kích hoạt AI (API `/swipe`) và hiển thị SnackBar tương ứng (Trái/Phải). Đã cấu hình thêm tự động gọi lại `_fetchRecommendations` khi người dùng vuốt hết danh sách thẻ.

### What Next Session Should Do First
- Bắt đầu với feature `fix-group-and-planner` trong `features.json`.
- Sửa lỗi Tab 2 (Cộng đồng): Fix lỗi hiển thị danh sách nhóm, không tải được nội dung.
- Sửa lỗi tính năng thêm nhóm mới và đảm bảo nút kết nối UI Trip Planner hoạt động.

## Known Issues / Blockers
- Cần có `GEMINI_API_KEY` trong file `.env` để luồng Trip Planner hoạt động trơn tru.

## Architectural Decisions This Session
- Chuyển đổi Widget `Draggable` sang `Dismissible` để đảm bảo hành vi swipe trái/phải hoạt động mượt mà và bắt event đúng cách theo animation của card.
- Áp dụng Safe Null Coalescing (`??`) ở tầng Widget (View layer) để đảm bảo ứng dụng không bị Crash (Red Screen) khi payload trả về từ Backend (hoặc Vector DB) bị thiếu trường dữ liệu.