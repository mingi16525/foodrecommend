# Session Progress

## Last Session Summary
- Hoàn thiện UI và Backend API cho Tab 2 (Đơn nhóm/Group Order).
- Tích hợp Socket.io để xử lý real-time chat cho nhóm.
- Tạo và kết nối DB schema mới cho chat và orders (`group_messages`, `group_orders`, v.v.).
- Chạy npm test PASS toàn bộ backend API.

## Current State
- Tab 2 đã có API thực tế với Socket.io và DB lưu trữ thay vì mock data.
- Người dùng có thể nhắn tin real-time.
- Chủ nhóm (Creator) có thể quản lý các bước tạo đơn nhóm: Tập hợp -> Bình chọn quán -> Đặt món cá nhân -> Chốt đơn.
- Các API endpoints cho Group Order hoạt động trơn tru với PostgreSQL.

### What Next Session Should Do First
- Chuyển sang xử lý Tab 3 và Tab 5 (thay thế mock data bằng API kết nối dữ liệu thực tế).
- Đọc `features.json` để kiểm tra task `implement-tab3-and-tab5-real-data` (đang ở trạng thái TODO).

## Known Issues / Blockers
- Cần có `GEMINI_API_KEY` cho tính năng Trip Planner (Tab 5).

## Architectural Decisions This Session
- Sử dụng Socket.io để truyền/nhận chat thay vì API HTTP polling giúp tiết kiệm resource.
- Dùng Borda Count để tính toán gợi ý của AI ở bước Bình chọn quán chung.
- Schema được thiết kế chuẩn xác để lưu lịch sử đơn hàng nhóm sau khi chốt.