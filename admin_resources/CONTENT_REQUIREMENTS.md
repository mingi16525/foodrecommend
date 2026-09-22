# Yêu cầu Nội dung (Content Requirements) từ Admin

Để ứng dụng FoodRecommend có thể lên Store (App Store & Google Play) và chính thức đưa vào hoạt động (Production-Ready), Admin vui lòng chuẩn bị và cung cấp các nội dung sau:

## 1. Pháp lý & Chính sách
- [ ] **Điều khoản sử dụng (Terms of Service):** Quy định rõ ràng về quyền lợi, giới hạn của người dùng, đặc biệt đối với gói Premium và việc chia sẻ thông tin trong Group.
- [ ] **Chính sách bảo mật (Privacy Policy):** Cần nêu rõ cách ứng dụng thu thập và lưu trữ Dữ liệu định vị (Location), Lịch sử sở thích (Swipe history), và Dữ liệu dị ứng.
- [ ] **Chính sách hoàn tiền (Refund Policy):** (Tùy chọn) Đối với các giao dịch thanh toán Premium qua ZaloPay/Momo.

## 2. API Keys & Tài khoản Third-Party
- [ ] **Google Maps API Key:** Dùng để lấy dữ liệu địa điểm thật và gợi ý đường đi (yêu cầu cấu hình Billing trên Google Cloud).
- [ ] **Google Gemini API Key (Production):** Dành cho AI Orchestrator (có giới hạn quota cao hơn bản test).
- [ ] **Tài khoản Developer:** Tài khoản Apple Developer và Google Play Console để submit App.

## 3. Nội dung Trực quan (Media Assets)
- [ ] **App Icon:** Kích thước chuẩn 1024x1024.
- [ ] **Splash Screen Logo:** Hình nền và Logo lúc mở App.
- [ ] **Banner Quảng cáo (Carousel):** Nếu có chiến dịch nội bộ, cung cấp banner tỷ lệ 16:9.
- [ ] **Placeholder Images:** Các hình ảnh mặc định khi quán ăn chưa có hình (ví dụ: Logo mờ của FoodRecommend).

## 4. Danh mục Dữ liệu mồi (Seed Data)
Trong trường hợp chạy Tool crawl bị lỗi, Admin cần chuẩn bị sẵn một file Excel (.xlsx) / CSV danh sách **100-200 Quán ăn mồi** với các cột tối thiểu:
- Tên quán
- Địa chỉ
- Loại quán (Đồ nướng, Cơm, Bún/Phở, Trà sữa)
- 1 Hình ảnh đại diện (Link)

Vui lòng đặt các file tài liệu này vào thư mục `admin_resources/assets` (hoặc gửi qua email cho đội ngũ phát triển) để được tích hợp trực tiếp vào hệ thống.
