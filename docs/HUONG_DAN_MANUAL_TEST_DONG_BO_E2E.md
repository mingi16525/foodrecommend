# 📋 BỘ TÀI LIỆU KIỂM THỬ THỦ CÔNG TOÀN DIỆN (MANUAL TEST E2E)
## ĐỒNG BỘ 3 LỚP: FRONTEND (FE) ↔ BACKEND (BE) ↔ DATABASE (DB)

Tài liệu này được thiết kế để phục vụ việc kiểm thử thực tế trên thiết bị di động (Android / iOS / Emulator), giúp kiểm tra tính nhất quán và toàn vẹn dữ liệu xuyên suốt 3 tầng: **Giao diện App**, **Xử lý API / Event Bus**, và **Cơ sở dữ liệu PostgreSQL**.

---

## 🌐 0. THÔNG TIN MÔI TRƯỜNG TEST
* **API Public Tunnel (Cloudflare)**: `https://doctor-screenshot-apparently-editing.trycloudflare.com` (Khuyên dùng khi test qua mạng di động 4G/LTE hoặc ngoài quán cà phê)
* **Wi-Fi LAN IP (PC của bạn)**: `http://192.168.1.89:3000` (Khuyên dùng khi điện thoại và máy tính kết nối chung mạng Wi-Fi, tốc độ phản hồi < 5ms)
* **Android Emulator URL**: `http://10.0.2.2:3000` (Khuyên dùng khi chạy app trên máy ảo Android ngay trên PC)
* **Localhost Backend**: `http://localhost:3000`
* **PostgreSQL Database**: `postgresql://fooduser:foodpassword@localhost:5432/foodrecommend`
* **Redis Cache**: `redis://localhost:6379`
* **Qdrant Vector DB**: `http://localhost:6333`
* **Kafka Event Bus**: `localhost:9092` (Topic chính: `swipe-events`)

> [!TIP]
> **TÍNH NĂNG ĐỔI SERVER NHANH TRÊN MÀN HÌNH ĐĂNG NHẬP:**
> Tại màn hình Đăng nhập của App, nhấn vào biểu tượng **Mạng/Server** (nằm ở góc trên bên phải AppBar) để:
> 1. Xem địa chỉ Server hiện tại.
> 2. Bấm nhanh để chuyển giữa: **Tự động tải từ GitHub**, **Cloudflare Tunnel**, **Wi-Fi LAN PC (192.168.1.89)** hoặc **Android Emulator (10.0.2.2)**.
> 3. Bấm nút **"Kiểm tra Ping"** để xem ngay phản hồi từ máy chủ (trả về xanh `✅ Kết nối thành công!` trước khi đăng nhập).
> 4. Bấm **"Lưu & Dùng"** để áp dụng ngay mà không cần cài lại app.

---

## 🖥️ BẮT ĐẦU TEST: NHẬP LỆNH Ở ĐÂU, QUAN SÁT NHƯ THẾ NÀO?

Để kiểm tra đồng bộ cả 3 lớp một cách trực quan và dễ dàng nhất, bạn hãy mở **song song 3 cửa sổ** trên máy tính:

```text
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│     CỬA SỔ 1 (FE)       │  │     CỬA SỔ 2 (BE)       │  │     CỬA SỔ 3 (DB)       │
│   Điện thoại di động    │  │   Nhấp đúp chuột file   │  │   Nhấp đúp chuột file   │
│  (hoặc Android Emulator)│  │ THEO_DOI_LOG_BACKEND.bat│  │KIEM_TRA_NHANH_DATABASE.bat│
│                         │  │                         │  │                         │
│  Thao tác: Bấm nút,     │  │  Quan sát: Thấy API gọi │  │  Bấm các số [1], [2]... │
│  nhập form, quẹt thẻ... │  │  và mã OTP in ra tức thì│  │  để xem dữ liệu lưu DB  │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

### 1. Chuẩn bị Cửa sổ 2: Theo dõi Backend (BE) & Lấy mã OTP
* Bạn vào thư mục dự án `D:\FoodRecommend`, nhấp đúp chuột vào file:
  👉 **`THEO_DOI_LOG_BACKEND.bat`**
* **Cách quan sát**: Cửa sổ màu đen hiện ra và liên tục cập nhật:
  * Khi bạn bấm nút trên điện thoại, cửa sổ này sẽ in ra: `POST /api/auth/register`, `GET /api/recommendation`...
  * Khi đăng ký tài khoản mới, mã OTP 6 số sẽ xuất hiện ngay tại đây dạng: `[MOCK OTP] Sent OTP 123456 to email ...`. Bạn chỉ việc lấy số này nhập vào điện thoại.

### 2. Chuẩn bị Cửa sổ 3: Kiểm tra Database (DB)
Bạn có 2 lựa chọn cực kỳ đơn giản:
* **Cách 1 (Khuyên dùng - Không cần gõ SQL)**:
  * Nhấp đúp chuột vào file: 👉 **`KIEM_TRA_NHANH_DATABASE.bat`**
  * Script hiện menu từ `[1]` đến `[6]`.
  * Bạn vừa test Kịch bản nào trên điện thoại thì bấm số tương ứng (ví dụ: vừa đăng ký xong thì bấm phím `1` rồi `Enter`), bảng dữ liệu từ PostgreSQL sẽ in ra màn hình ngay lập tức!
* **Cách 2 (Dành cho ai thích tự gõ lệnh SQL tuỳ ý)**:
  * Nhấp đúp chuột vào file: 👉 **`MO_POSTGRES_SQL.bat`**
  * Bạn sẽ vào giao diện dòng lệnh `foodrecommend=#`.
  * Chỉ việc copy bất kỳ câu lệnh SQL nào trong tài liệu dưới đây (ví dụ: `SELECT id, email, is_verified FROM users;`), dán vào và nhấn `Enter`.

---

## 📌 KỊCH BẢN 1: ĐĂNG KÝ, GỬI OTP & XÁC THỰC TÀI KHOẢN (AUTH FLOW)

### 1.1 Thao tác trên Frontend (FE)
1. Mở App, tại màn hình Login nhấn **"Đăng ký tài khoản"**.
2. Nhập Email (ví dụ: `tester_vip@gmail.com`), Mật khẩu: `123456`, Tên: `Tester VIP`.
3. Bấm **"Đăng ký"** → App tự động chuyển sang màn hình **Nhập mã OTP**.
4. Kiểm tra terminal Backend để lấy mã OTP 6 số (hoặc xem log `[MOCK OTP] Sent OTP XXXXXX`).
5. Nhập mã OTP 6 chữ số và bấm **"Xác thực"** → Chuyển hướng thành công vào **Trang chủ (Tab 1 Feed)**.

### 1.2 Kiểm tra Backend (BE)
* **API Gọi**:
  * `POST /api/auth/register` → Trả về `201 Created` kèm thông tin User (`is_verified: false`).
  * `POST /api/auth/send-otp` → Trả về `200 OK`. Terminal in log:
    ```text
    [MOCK OTP] Sent OTP 123456 to email tester_vip@gmail.com (Expires in 5m)
    ```
  * `POST /api/auth/verify-otp` (body: `{ "email": "tester_vip@gmail.com", "otp": "123456" }`) → Trả về `200 OK` kèm JWT Token.

### 1.3 Kiểm tra Database (DB)
Chạy câu lệnh SQL kiểm tra người dùng đã được kích hoạt trạng thái xác thực:
```sql
SELECT id, email, full_name, is_verified, subscription_tier, created_at 
FROM users 
WHERE email = 'tester_vip@gmail.com';
```
👉 **Kỳ vọng DB**: Cột `is_verified` chuyển từ `false` sang `true`. `subscription_tier` mặc định là `'free'`.

---

## 📌 KỊCH BẢN 2: THIẾT LẬP HỒ SƠ ĂN UỐNG & CÁ NHÂN HÓA (TAB 4 ONBOARDING)

### 2.1 Thao tác trên Frontend (FE)
1. Vào Tab 4 (hoặc Onboarding):
   * Chọn sở thích hương vị: **Cay (Spicy)**, **Chua (Sour)**.
   * Chọn danh mục yêu thích: **Món nước (Noodles)**, **Đặc sản (Specialty)**.
   * Chọn món dị ứng: **Đậu phộng (Peanuts)**.
2. Bấm **"Lưu hồ sơ"** → Thông báo *"Cập nhật sở thích thành công!"*.

### 2.2 Kiểm tra Backend (BE)
* **API Gọi**: `PUT /api/user/me/preferences` (Header: `Bearer <token>`).
* **Payload**:
  ```json
  {
    "preferredFlavors": ["spicy", "sour"],
    "preferredCategories": ["noodles", "specialty"],
    "allergies": ["peanuts"]
  }
  ```
* **Status**: `200 OK`. Cache Redis của User bị xóa để buộc Recommendation Engine tính toán lại theo sở thích mới.

### 2.3 Kiểm tra Database (DB)
```sql
SELECT u.email, p.favorite_flavors, p.allergies, p.dietary_restrictions, p.hated_dishes 
FROM user_preferences p
JOIN users u ON p.user_id = u.id
WHERE u.email = 'tester_vip@gmail.com';
```
👉 **Kỳ vọng DB**: Cột `allergies` lưu `["peanuts"]`, `favorite_flavors` lưu `["spicy", "sour"]`.

---

## 📌 KỊCH BẢN 3: VUỐT GỢI Ý MÓN ĂN & ĐIỀU HƯỚNG BẢN ĐỒ/ĐẶT MÓN (TAB 3 RECOMMENDATION)

### 3.1 Thao tác trên Frontend (FE)
1. Mở **Tab 3 ("Khám phá")**, cấp quyền vị trí khi app yêu cầu:
   * Quan sát thanh tiêu đề hiển thị toạ độ thực: **"GPS: 21.0285, 105.8542 (Quán gần bạn)"**.
   * Thẻ món ăn hiển thị tên quán thật, địa chỉ chi tiết (ví dụ: *49 Bát Đàn, Hoàn Kiếm, Hà Nội*) và khoảng cách tính bằng mét/km.
2. **Kiểm tra Điều Hướng Bản Đồ**:
   * Nhấn nút **Bản đồ (Màu xanh dương)** → Ứng dụng tự động kích hoạt **Google Maps** dẫn đường thẳng đến quán.
3. **Kiểm tra Đặt Món Đa Nền Tảng**:
   * Nhấn nút **Giao hàng (Màu cam)** → Modal BottomSheet hiện 3 tùy chọn: **ShopeeFood**, **Be Food**, **GrabFood**.
   * Nhấn vào một nền tảng → Tự động mở Deep Link hoặc Web đặt món của quán đó.
4. **Kiểm tra Tương Tác Vuốt**:
   * Vuốt sang phải (hoặc bấm Tim xanh) → Báo *"Đã thích món ăn!"*.
   * Thẻ tiếp theo vuốt sang trái (hoặc bấm X đỏ) → Báo *"Đã bỏ qua món ăn!"*.

### 3.2 Kiểm tra Backend (BE)
* **API Gọi**:
  * `GET /api/recommendation?lat=21.0285&lng=105.8542` (Header: `Bearer <token>`).
  * Backend lọc 2 lớp: Loại trừ món chứa đậu phộng (`peanuts`), tính khoảng cách Haversine.
  * Trả về danh sách món kèm `lat`, `lng`, `restaurant_address`, `delivery_links`.
  * `POST /api/recommendation/swipe` (body: `{ "dishId": "...", "action": "like" }`).
* **Kafka Event Log**:
  ```text
  [EventCollector] Pushed event to Kafka: like by <user_id>
  ```

### 3.3 Kiểm tra Database (DB)
```sql
SELECT s.action, d.name as dish_name, r.name as restaurant_name, s.created_at
FROM user_swipes s
JOIN dishes d ON s.dish_id = d.id
JOIN restaurants r ON d.restaurant_id = r.id
JOIN users u ON s.user_id = u.id
WHERE u.email = 'tester_vip@gmail.com'
ORDER BY s.created_at DESC;
```
👉 **Kỳ vọng DB**: Bản ghi mới với `action = 'like'` và `action = 'skip'` được lưu chính xác trong bảng `user_swipes`.

---

## 📌 KỊCH BẢN 4: ĐĂNG BÀI REVIEW VÀ TỰ ĐỘNG TẠO NHÀ HÀNG (TAB 1 SOCIAL)

### 4.1 Thao tác trên Frontend (FE)
1. Tại Tab 1 (Feed), nhấn nút **(+) "Đăng bài"**:
   * Nhập nội dung: *"Phở Bò Tái Nạm Cầu Giấy ngon tuyệt vời!"*.
   * Nhập Tên quán: *"Phở Bò Cầu Giấy 123"*.
   * Nhập Địa chỉ: *"123 Cầu Giấy, Hà Nội"*.
2. Nhấn **"Đăng bài"** → Bài viết xuất hiện ngay trên dòng thời gian Feed.

### 4.2 Kiểm tra Backend (BE)
* **API Gọi**: `POST /api/social/posts`
  * Body: `{ "content": "...", "restaurantName": "Phở Bò Cầu Giấy 123", "restaurantAddress": "123 Cầu Giấy, Hà Nội" }`
* Backend phát hiện quán chưa tồn tại → Tự động gọi `restaurantService.createRestaurant` để tạo mới quán ăn với cờ `is_verified = false`.

### 4.3 Kiểm tra Database (DB)
Kiểm tra quán ăn tự động được tạo:
```sql
SELECT id, name, address, is_verified, created_at 
FROM restaurants 
WHERE name = 'Phở Bò Cầu Giấy 123';
```
Kiểm tra bài viết được tạo:
```sql
SELECT p.id, p.content, p.likes_count, r.name as restaurant_name, p.created_at
FROM posts p
JOIN restaurants r ON p.restaurant_id = r.id
WHERE p.content LIKE '%Phở Bò Tái Nạm%';
```
👉 **Kỳ vọng DB**: Cả 2 bảng `restaurants` và `posts` đều có bản ghi mới liên kết khoá ngoại với nhau.

---

## 📌 KỊCH BẢN 5: CHỦ QUÁN CLAIM QUÁN & THÊM MÓN VÀO MENU (TAB 5 BUSINESS)

### 5.1 Thao tác trên Frontend (FE)
1. Vào Tab 5 (Profile) → Chọn **"Quản lý quán ăn"**.
2. Chọn **"Nhận quyền sở hữu (Claim)"** → Gõ tìm quán *"Phở Bò Cầu Giấy 123"* → Bấm **"Yêu cầu quyền sở hữu"**.
3. Quay lại màn hình Quản lý Menu → Nhấn **"Thêm món mới"**:
   * Tên món: *"Phở Đặc Biệt Thập Cẩm"*.
   * Giá tiền: `75000`.
   * Danh mục: `Phở / Món nước`.
   * Bấm **"Lưu món ăn"**.

### 5.2 Kiểm tra Backend (BE)
* **API Gọi**:
  * `POST /api/restaurants/<id>/claim` → Đăng ký user làm chủ quán (`claimed_by = user_id`).
  * `POST /api/restaurants/<id>/dishes` (body: `{ "name": "Phở Đặc Biệt Thập Cẩm", "price": 75000, "category": "noodles" }`) → Trả về `201 Created`.

### 5.3 Kiểm tra Database (DB)
```sql
-- 1. Kiểm tra trạng thái Claim của nhà hàng:
SELECT id, name, claimed_by, is_verified 
FROM restaurants 
WHERE name = 'Phở Bò Cầu Giấy 123';

-- 2. Kiểm tra món ăn mới được thêm vào menu:
SELECT id, name, price, item_type, category 
FROM dishes 
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Phở Bò Cầu Giấy 123');
```
👉 **Kỳ vọng DB**: `claimed_by` chứa UUID của Tester. Món *"Phở Đặc Biệt Thập Cẩm"* có giá `75000` nằm trong bảng `dishes`.

---

## 📌 KỊCH BẢN 6: TẠO NHÓM, CHAT & CHIA TIỀN ĐƠN HÀNG (TAB 2 GROUPS & SPLIT BILL)

### 6.1 Thao tác trên Frontend (FE)
1. Vào Tab 2 ("Cộng đồng") → Bấm **(+) Tạo nhóm mới**:
   * Đặt tên: *"Hội Ăn Trưa Cầu Giấy"*.
2. Vào phòng Chat nhóm, gửi tin nhắn: *"Hôm nay ăn phở nhé cả nhà!"* → Tin nhắn hiện ngay trong khung chat.
3. Bấm **"Tạo đơn đặt món nhóm"**:
   * Chọn quán ăn.
   * Thêm các món: 2 tô Phở Bò (mỗi tô 50,000 VND), 1 đĩa Quẩy (10,000 VND) → Tổng tiền: **110,000 VND**.
4. Chọn **"Chia tiền đều (Split Equally)"** cho 2 thành viên → Mỗi người: **55,000 VND**.
5. Bấm **"Xác nhận thanh toán"** → App thông báo thành công.

### 6.2 Kiểm tra Backend (BE)
* **API Gọi**:
  * `POST /api/group` → Trả về `201 Created` tạo nhóm.
  * `POST /api/group/<id>/messages` → Gửi tin nhắn chat.
  * `POST /api/group/<id>/orders` → Tạo đơn hàng với status `'VOTING'`.
  * `POST /api/group/<id>/split-equally` → Tính toán chia bill.
  * `PUT /api/group/<id>/orders/<order_id>/status` (body: `{ "status": "PAID" }`) → Hệ thống tự động kích hoạt `notificationService.sendPushNotification` tới thành viên.

### 6.3 Kiểm tra Database (DB)
```sql
-- 1. Kiểm tra nhóm và đơn hàng
SELECT g.name as group_name, o.id as order_id, o.status, o.total_amount
FROM orders o
JOIN groups g ON o.group_id = g.id
WHERE g.name = 'Hội Ăn Trưa Cầu Giấy';

-- 2. Kiểm tra chi tiết chia tiền
SELECT b.user_id, u.full_name, b.amount, b.is_paid
FROM split_bills b
JOIN users u ON b.user_id = u.id
WHERE b.order_id = (
  SELECT o.id FROM orders o 
  JOIN groups g ON o.group_id = g.id 
  WHERE g.name = 'Hội Ăn Trưa Cầu Giấy' 
  LIMIT 1
);
```
👉 **Kỳ vọng DB**: `orders.status = 'PAID'`, `orders.total_amount = 110000`, mỗi bản ghi `split_bills.amount = 55000`.

---

## 📌 KỊCH BẢN 7: LẬP KẾ HOẠCH LỊCH TRÌNH BẰNG AI (TRIP PLANNER)

### 7.1 Thao tác trên Frontend (FE)
1. Tại Tab 2, chọn mục **"AI Trip Planner"**.
2. Nhập vào thanh chat dưới đáy: *"Lên lịch trình ăn uống cuối tuần 2 ngày ở Hà Nội, ngân sách 500k, thích món truyền thống phố cổ"*.
3. Bấm gửi → AI xử lý và trả về lịch trình chi tiết (Ngày 1: Sáng Phở Bát Đàn, Trưa Bún Chả Hương Liên, Tối Bánh Cuốn; Ngày 2: Xôi Yến, v.v.).

### 7.2 Kiểm tra Backend (BE)
* **API Gọi**: `POST /api/trip/plan`
* **Xử lý**:
  * AI Controller phân tích intent.
  * Thuật toán kết hợp Qdrant Embedding Vector để map tên món AI sinh ra với ID món ăn thật trong cơ sở dữ liệu.
  * Trả về JSON cấu trúc lịch trình.

---

## 🛠 DANH MỤC LỆNH HỖ TRỢ TESTER
| Thao tác | Câu lệnh Terminal |
| :--- | :--- |
| **Xem log Backend trực tiếp** | `npm run dev` |
| **Kiểm tra trạng thái DB & Redis** | `curl http://localhost:3000/api/health` |
| **Xem Public URL Cloudflare** | `Get-Content ACTIVE_TUNNEL_URL.txt` |
| **Chạy toàn bộ Test tự động** | `npm test` & `node scripts/run-flutter-tests.js` |
