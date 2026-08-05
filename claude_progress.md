# Session Progress

## Last Session Summary
- Hoàn thành `load-real-hanoi-data`: Sửa lỗi hiển thị Feed (Tab 1) và Khoảng cách AI (Tab 3) bằng cách tạo 20 nhà hàng thực tế tại Hà Nội, tự động gán `dish_id` cho posts và tích hợp logic tính khoảng cách Haversine.

## Current State
- Backend: Cấu trúc cơ sở dữ liệu hoàn thiện, Schema chuẩn xác, Data Hà Nội thật.
- Frontend: TẤT CẢ các lỗi đã được sửa xong. Dữ liệu nạp đầy đủ.
- Tests (Jest): `npm test` PASS TOÀN BỘ (34 tests).

### Current Session
- Phân tích và phát hiện lỗi do thiếu data `posts` trong quá trình sinh seed data và Backend API thiếu truy xuất tọa độ.
- Chỉnh sửa `schema.sql` thêm khóa ngoại `dish_id` vào `posts`.
- Viết lại toàn bộ hàm sinh dữ liệu `scripts/generate_seed.js` sử dụng 20 nhà hàng Hà Nội (Ví dụ: Phở Bát Đàn, Bún Chả Hương Liên...) và tọa độ GPS thực tế. Sinh 200 món ăn và 40 Video Post tương ứng.
- Cập nhật hàm `getFeed()` của `socialService` để join `posts`, `users`, `dishes`, `restaurants` và xử lý khoảng cách (Haversine).
- Cập nhật `recommendation.routes.ts` để bóc tách `lat`, `lng` từ Query Parameters phục vụ `FastTierRecommender`.

### What Next Session Should Do First
- TẤT CẢ CÁC TÍNH NĂNG VÀ DATA ISSUE ĐÃ ĐƯỢC GIẢI QUYẾT. 
- Ứng dụng đã sẵn sàng chạy thử (Hot Restart app Flutter) để thấy dữ liệu thật và xem Recommendation distance thay đổi.
- Chuẩn bị bước Deploy/Review để bàn giao cho user.

## Known Issues / Blockers
- Tính năng AI của Trip Planner và Recommendation vẫn yêu cầu phải cài đặt biến môi trường `GEMINI_API_KEY` ở backend.

## Architectural Decisions This Session
- Quyết định tính khoảng cách Haversine ngay trên Database Postgres đối với Feed bằng SQL Query để tối ưu tốc độ cho Client, và truyền `lat`, `lng` vào Node.js để AI Routing phân bổ logic gợi ý chuẩn.