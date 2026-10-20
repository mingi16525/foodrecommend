# FoodRecommend - Bộ Kiểm Thử Tự Động Appium + Allure Report

Thư mục `test_appium` triển khai theo **Phương án 2: Kiểm thử luồng dữ liệu toàn diện (E2E Data Flow Testing)** kết hợp giữa:
1. **UI Automation**: Tự động hóa thao tác trên ứng dụng di động qua **Appium (UiAutomator2)**.
2. **API Backend**: Gửi và kiểm tra mã phản hồi (HTTP Status), payload JSON từ **Backend REST API**.
3. **Database Integrity**: Truy vấn trực tiếp **PostgreSQL** để xác minh tính nhất quán của dữ liệu.
4. **Allure Report**: Báo cáo trực quan từng bước (`@allure.step`), log chi tiết request/response API, bảng kết quả truy vấn SQL và tự động chụp ảnh màn hình (Screenshot) khi gặp lỗi hoặc crash.

---

## 1. Cấu Trúc Thư Mục `test_appium`

```
test_appium/
├── config/
│   ├── config.py           # Đọc file .env, cấu hình API, Database, APK path, thiết bị
│   └── capabilities.py     # Cấu hình Appium Desired Capabilities (UiAutomator2, Android)
├── core/
│   ├── allure_helper.py    # Helper đính kèm Text, JSON, bảng SQL, và ảnh chụp vào Allure
│   ├── db_client.py        # Client PostgreSQL tự động log câu lệnh SQL & kết quả vào Allure
│   ├── api_client.py       # Client Backend API tự động log Request/Response vào Allure
│   └── appium_driver.py    # Quản lý vòng đời phiên kiểm thử Appium (WebDriver Remote)
├── pages/                  # Mô hình Page Object Model (POM)
│   ├── base_page.py        # Các thao tác cơ bản: click, nhập liệu, vuốt màn hình (swipe)
│   ├── login_page.py       # Màn hình Đăng nhập & Chế độ khách (Guest)
│   ├── feed_page.py        # Tab 1: Bảng tin video, Thả tim (Like), Bình luận (Comment)
│   └── recommend_page.py   # Tab 3: Khám phá AI, Quẹt thẻ Tinder (Swipe Like/Skip)
├── tests/
│   ├── conftest.py         # Pytest fixtures (driver, api, db, auth_token, hook chụp ảnh crash)
│   ├── test_auth_e2e.py    # Kiểm thử luồng Đăng nhập & Guest mode
│   ├── test_feed_e2e.py    # Kiểm thử luồng Like bài viết & Gửi bình luận
│   └── test_recommend_e2e.py # Kiểm thử luồng Quẹt Tinder đề xuất món ăn
├── pytest.ini              # Cấu hình Pytest và cờ xuất kết quả Allure
├── requirements.txt        # Danh sách thư viện Python cần thiết
├── run_tests.bat           # File chạy kiểm thử 1-click trên Windows
├── view_report.bat         # File mở báo cáo Allure Report trên trình duyệt
└── README.md               # Hướng dẫn chi tiết này
```

---

## 2. Chuẩn Bị Môi Trường

### Bước 1: Cài đặt thư viện Python
Trong thư mục `test_appium`, chạy lệnh:
```bash
pip install -r requirements.txt
```

### Bước 2: Cài đặt Appium & Driver Android (UiAutomator2)
Nếu máy bạn chưa có Appium, chạy các lệnh sau qua Node.js (npm):
```bash
# Cài đặt Appium 2
npm install -g appium

# Cài đặt driver UiAutomator2 cho Android
appium driver install uiautomator2
```

### Bước 3: Cài đặt Allure CLI (Dùng để xem báo cáo trực quan)
Cài đặt Allure CLI qua một trong các cách sau:
- **Qua npm**:
  ```bash
  npm install -g allure-commandline --save-dev
  ```
- **Hoặc qua Scoop**:
  ```bash
  scoop install allure
  ```

---

## 3. Hướng Dẫn Thực Thi Kiểm Thử

### Cách 1: Chạy nhanh bằng file Batch (Khuyên dùng trên Windows)
Bấm đúp hoặc chạy trong terminal:
```cmd
test_appium\run_tests.bat
```
File này sẽ tự động chạy toàn bộ các test case, lưu kết quả vào `allure-results` và hỏi bạn có muốn mở Allure Report ngay không.

### Cách 2: Chạy qua lệnh Pytest CLI
```bash
# Chạy toàn bộ test cases và thu thập kết quả cho Allure
pytest test_appium/tests --alluredir=test_appium/allure-results

# Chạy riêng 1 module test (ví dụ kiểm thử Đăng nhập)
pytest test_appium/tests/test_auth_e2e.py -v
```

---

## 4. Xem Báo Cáo Allure Report

Sau khi chạy xong test, để khởi chạy web server hiển thị báo cáo:

### Cách 1: Chạy file batch
```cmd
test_appium\view_report.bat
```

### Cách 2: Chạy trực tiếp lệnh Allure
```bash
allure serve test_appium/allure-results
```
Trình duyệt sẽ tự động mở trang báo cáo dashboard với:
- **Biểu đồ tỷ lệ Passed / Failed / Broken**.
- **Cây lịch trình từng bước (`@allure.step`)**: Chi tiết từng thao tác click, gõ chữ, vuốt màn hình.
- **Log Request/Response API**: Toàn bộ payload gửi đi và phản hồi từ Backend.
- **Log Database Query**: Chi tiết câu lệnh SQL, tham số và bảng kết quả truy vấn đối chiếu.
- **Ảnh chụp màn hình (Screenshot)**: Tự động ghi lại ảnh giao diện thực tế của ứng dụng, đặc biệt là ảnh chụp ngay thời điểm xảy ra crash hoặc lỗi (nếu có).
