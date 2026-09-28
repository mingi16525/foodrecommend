# MASTER PLAN: Lộ Trình Hoàn Thiện Dự Án (Final Polish)

Dựa trên Báo Cáo Kiểm Thử (Test Report) mới nhất, sản phẩm đã hoàn thiện 90% (MVP) với toàn bộ luồng cơ bản hoạt động (Unit Tests & E2E tests đạt 100%).

Dưới đây là kế hoạch DUY NHẤT hiện hành để giải quyết 10% còn lại, giúp hệ thống đạt chuẩn **Production-Ready** trước khi phát hành phiên bản Beta.

## Phase 1: Vá Lỗi Dữ Liệu (Critical Fixes) - THỰC HIỆN NGAY
**1. Fix Data Desync Cache (Luồng Hồ Sơ - Tab 4):**
- **Vấn đề:** Khi người dùng đổi sở thích (Allergies, Flavors), PostgreSQL được cập nhật nhưng Redis Cache (`user:features:${userId}`) lại không được nạp lại/vô hiệu hóa, dẫn đến AI gợi ý sai trong thời gian chờ Cache tự hết hạn.
- **Giải pháp:** Cập nhật file `src/user/service.ts`, sau khi `UPDATE` thành công vào PostgreSQL, gọi `featureStore.updateUserFeatures()` hoặc xóa cache Redis của người dùng đó.

**2. Tối Ưu N+1 Query (Luồng Social Feed - Tab 1):**
- **Vấn đề:** Hàm lấy Feed (`socialService.getFeed`) sử dụng SQL Subquery để đếm số Like/Comment cho từng Post. Với dữ liệu lớn, Feed sẽ bị nghẽn (Bottleneck).
- **Giải pháp:** Thêm 2 cột `likes_count` và `comments_count` vào bảng `posts`. Tự động tăng/giảm giá trị này mỗi khi có hành động Like/Comment (Denormalization).

## Phase 2: Nạp Dữ Liệu Thật (Data Scraping & Seeding)
- **Công cụ cào dữ liệu (Crawler):** Hoàn thiện `tools/tool_get_food/index.js`. Tích hợp Puppeteer (ShopeeFood) hoặc Google Maps API để cào khoảng 200 nhà hàng tại Hà Nội/TP.HCM (Bao gồm cả Combo và Món lẻ).
- **Công cụ giả lập người dùng (User Simulator):** Hoàn thiện `tools/tool_user/index.js` để tự động tạo Swipe Events (Kafka) giả lập sở thích cho hàng ngàn Users. Dữ liệu này sẽ làm giàu Qdrant Vector DB, giúp hệ thống AI học hỏi.

## Phase 3: Triển khai & Kiểm thử các tính năng mới Tab 1 (User & Business Post)
Do phát sinh yêu cầu mới tại Tab 1, luồng công việc sẽ được chia làm 4 bước nhỏ để các module không bị block (chặn) lẫn nhau:
- **Bước 3.1 (Core Tab 1):** Hoàn thiện và test dứt điểm hệ thống tương tác cho Người xem (Viewer): Like, Save, Comment, Video Player.
- **Bước 3.2 (User Post & Auto-create):** Phát triển luồng Người dùng đăng bài. Trọng tâm: Tải media, Tag món/quán, tự động tạo "Địa điểm chưa xác thực" (Auto-create) qua GPS/Search hoặc người dùng có thể đặt tên quán(Quán bún Bà Tám ngõ XX Đường XX...).
- **Bước 3.3 (Quản lý & Claim Business):** Luồng đăng ký chủ quán. Tính năng Claim (Nhận quyền sở hữu) để Merge data cũ hoặc tạo mới. Admin duyệt giấy phép cấp Tích xanh.
- **Bước 3.4 (Business Post & Swipe-to-change):** Công cụ cho quán ăn đăng bài. Đính kèm động Món/Combo vào ảnh/video. Cập nhật UI thông tin món theo thao tác vuốt (Swipe).

## Phase 4: Đóng Gói (Release & CI/CD)
- Tích hợp GitHub Actions để chạy `npm test` và `flutter test` mỗi khi có Pull Request.
- Đóng gói Docker Images cho Backend và Deploy lên hệ thống Staging (Dựa theo `docker-compose.prod.yml`).
- Biên dịch ứng dụng Flutter (APK cho Android và TestFlight cho iOS) gửi cho nhóm Beta Tester.

---
*Ghi chú: Kế hoạch này là bản thiết kế chuẩn xác kết hợp tính năng MVP ban đầu và các yêu cầu bổ sung mới nhất, phục vụ việc ra mắt bản Beta hoàn thiện.*
