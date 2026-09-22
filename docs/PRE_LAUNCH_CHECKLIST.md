# 🚀 PRE-LAUNCH CHECKLIST: FOODRECOMMEND MVP 1.0

Với tư cách là Product Manager, dù hệ thống hiện tại đã đạt trạng thái Production-Ready về mặt kỹ thuật và dữ liệu, chúng ta tuyệt đối không thể chủ quan. Để có một buổi **Go-Live (Phát hành chính thức)** hoàn hảo, tỷ lệ lỗi (crash rate) dưới 0.1%, và hệ thống chịu tải tốt, dưới đây là Khung Công Việc (Framework) bắt buộc phải hoàn thành, phân bổ cụ thể cho từng vị trí.

---

## 🧑‍💻 1. Backend & DevOps Engineer
*Nhiệm vụ: Đảm bảo hệ thống không sập khi có lượng người dùng truy cập đột biến và bảo mật tuyệt đối.*

- `[ ]` **Load Testing & Stress Testing:** Dùng [K6](https://k6.io/) hoặc JMeter bắn thử 1,000 requests/s vào các API chính (Feed, Recommend) để tìm điểm thắt cổ chai (Bottleneck).
- `[ ]` **Giám sát (Monitoring) & Báo Động:** Tích hợp Prometheus + Grafana để theo dõi RAM/CPU của Docker Containers; Cài đặt Sentry để bắt lỗi (Exception/Crash) tự động báo về Slack/Telegram.
- `[ ]` **Sao lưu Dữ Liệu (Backup Strategy):** Cấu hình tự động backup PostgreSQL (Cronjob dump ra file .sql) và snapshot Qdrant định kỳ mỗi 12 tiếng.
- `[ ]` **Rà soát Bảo mật (Security Audit):** 
  - Kiểm tra xem các file `.env` chứa mật khẩu có bị lộ trên Git không.
  - Review lại thời hạn sống (Expiration) của JWT Token.
  - Đảm bảo thiết lập Rate Limit chặt chẽ (chống Spam API).

---

## 📱 2. Frontend (Flutter) Developer
*Nhiệm vụ: Đảm bảo trải nghiệm mượt mà, không giật lag và qua được bài kiểm duyệt khắt khe của Apple/Google.*

- `[ ]` **UI/UX Polish (Chuốt lại giao diện):** Kiểm tra ứng dụng trên đa dạng màn hình (iPhone Mini, iPad, Android màn hình gập) đảm bảo không bị tràn chữ (Overflow) hay vỡ Layout.
- `[ ]` **Bắt Lỗi Ứng Dụng (Crash Reporting):** Tích hợp **Firebase Crashlytics** để theo dõi lỗi màn hình trắng (White screen) trên máy người dùng thực.
- `[ ]` **Tối ưu Hiệu năng (Performance Profiling):** Dùng Flutter DevTools chạy chế độ Profile, đảm bảo duy trì ứng dụng ở mức 60 FPS, đặc biệt là khi cuộn (scroll) danh sách nhà hàng.
- `[ ]` **Chuẩn bị Đẩy Store:** Kiểm tra lại tất cả các Permission (Quyền Vị trí, Quyền Camera) có giải thích lý do rõ ràng chưa (Bắt buộc với iOS); Viết sẵn file Privacy Policy.

---

## 🤖 3. Data Engineer & AI Specialist
*Nhiệm vụ: Đảm bảo AI gợi ý chuẩn xác, "càng dùng càng thông minh".*

- `[ ]` **Sanity Check Dữ thực:** Đảm bảo toàn bộ các món ăn thực tế đã được mã hóa thành Vector (Embeddings) chuẩn và nằm trong Qdrant.
- `[ ]` **Cơ Chế Khởi Động (Cold-start):** Đối với User mới tạo tài khoản, khi chưa có lịch sử quẹt trái/phải, đảm bảo thuật toán tự động đề xuất (Fallback) các món ăn Trending/Phổ biến nhất.
- `[ ]` **A/B Testing (Tương lai gần):** Lập bảng theo dõi tỷ lệ Like/Skip thực tế trên tập Beta Tester để tinh chỉnh độ chính xác (Weights) của mô hình.

---

## 🕵️ 4. QA / Automation Tester
*Nhiệm vụ: Trở thành "Kẻ phá hoại" để tìm ra mọi ngóc ngách có thể gây lỗi.*

- `[ ]` **Kiểm Thử Hồi Quy (Regression Testing):** Chạy lại toàn bộ bộ Unit Tests và test tay luồng Đặt món nhóm (Group Order) cực kỳ phức tạp để đảm bảo logic tính toán tổng tiền chia đều không sai 1 đồng.
- `[ ]` **Kiểm Thử Khả Năng Mạng Kém (Edge Cases):** Dùng tool bóp băng thông (Throttling) về 3G/Edge để xem App có bị văng (crash) khi Timeout API không. Nếu rớt mạng, App có hiển thị màn hình "No Internet Connection" thân thiện không?
- `[ ]` **Bảo chứng Chất lượng:** Xác nhận và ký duyệt (Sign-off) bản Build (APK/TestFlight) cuối cùng trước khi đưa cho người dùng Beta.

---

## 👔 5. Product Manager (PM) - Chính Là Bạn
*Nhiệm vụ: Nhạc trưởng điều phối, theo dõi phản hồi và quyết định Go/No-Go.*

- `[ ]` **Thiết lập Kênh Phản Hồi (Feedback Loop):** Mở form khảo sát in-app hoặc lập nhóm Zalo/Discord để Beta Testers vào báo lỗi/góp ý sản phẩm.
- `[ ]` **Chỉ số Thành Công (Launch Metrics):** Thống nhất với Team về mục tiêu Launch (Ví dụ: Trung bình 1 người dùng phải quẹt ít nhất 20 món ăn trong ngày đầu tải App).
- `[ ]` **Quyết định Đóng Băng Tính Năng (Feature Freeze):** Tuyệt đối KHÔNG code thêm tính năng mới từ giờ phút này.
- `[ ]` **Họp Tổng Kết (Go/No-Go Meeting):** Tổ chức họp rà soát Checklist này 1 ngày trước Launch. Mọi thứ phải xanh toàn bộ mới được phát hành!
