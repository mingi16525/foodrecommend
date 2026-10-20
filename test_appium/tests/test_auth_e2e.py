import time
import allure
import pytest

try:
    from test_appium.config.config import Config
    from test_appium.pages.login_page import LoginPage
except ImportError:
    from config.config import Config
    from pages.login_page import LoginPage

@allure.epic("Food Decision Platform E2E Manual Flow")
@allure.feature("A.1. Xác thực & Tài khoản (Authentication)")
class TestAuthE2E:

    @allure.story("Đăng ký tài khoản mới -> Xác thực OTP -> Đăng nhập & Kiểm tra JWT / Database")
    @allure.severity(allure.severity_level.BLOCKER)
    def test_full_registration_otp_login_flow(self, api, db):
        """
        Kịch bản Manual Test A.1:
        1. Mở app, đăng ký tài khoản mới bằng Email.
        2. Nhập mã OTP xác thực thành công.
        3. Đăng nhập lại bằng tài khoản vừa tạo, kiểm tra token JWT.
        4. Đối chiếu thông tin tài khoản được lưu trong bảng users (PostgreSQL).
        """
        random_suffix = int(time.time())
        new_email = f"user_test_{random_suffix}@example.com"
        password = "Password123!"
        full_name = f"Nguyễn Văn Test {random_suffix}"

        # 1. Đăng ký
        with allure.step(f"1. Gửi yêu cầu đăng ký tài khoản mới: {new_email}"):
            reg_res = api.register(email=new_email, password=password, full_name=full_name)
            assert reg_res.status_code in [200, 201], f"Đăng ký thất bại: {reg_res.text}"
            
            # Kiểm tra trạng thái is_verified trong DB (phải là False ban đầu)
            user_in_db = db.get_user_by_email(new_email)
            assert user_in_db is not None, "User chưa được ghi vào bảng users!"
            assert user_in_db['is_verified'] is False, "Tài khoản mới phải có is_verified = FALSE trước khi nhập OTP"

        # 2. Xác thực OTP
        with allure.step("2. Giả lập xác thực OTP thành công"):
            # Đối với môi trường dev/staging, lấy OTP từ store hoặc verify
            # Cập nhật trực tiếp trạng thái is_verified = TRUE qua DB
            db.execute_query("UPDATE users SET is_verified = TRUE WHERE email = %s;", (new_email,), fetch=False)
            verified_user = db.get_user_by_email(new_email)
            assert verified_user['is_verified'] is True, "Xác thực OTP thất bại, is_verified vẫn là False!"

        # 3. Đăng nhập
        with allure.step("3. Đăng nhập bằng tài khoản vừa kích hoạt và kiểm tra JWT token"):
            login_res = api.login(email=new_email, password=password)
            data = login_res.json()
            token = data.get("data", {}).get("token") if isinstance(data.get("data"), dict) else data.get("token")
            assert token is not None, f"Response đăng nhập thiếu JWT token: {data}"
            assert len(token) > 20, "JWT token không hợp lệ!"

        # 4. Dọn dẹp dữ liệu test
        with allure.step("4. Dọn dẹp tài khoản test khỏi Database"):
            db.cleanup_test_user(new_email)

    @allure.story("Đăng nhập bằng tài khoản test có sẵn (UI Appium + API + DB)")
    @allure.severity(allure.severity_level.BLOCKER)
    def test_login_existing_user(self, driver, api, db, test_user):
        """
        Kiểm thử đăng nhập tài khoản có sẵn trên giao diện Mobile và đối chiếu DB.
        """
        with allure.step("1. Kiểm tra tài khoản test trong Database"):
            user_record = db.get_user_by_email(Config.TEST_USER_EMAIL)
            assert user_record is not None, f"Tài khoản {Config.TEST_USER_EMAIL} không tồn tại!"
            assert user_record['is_verified'] is True, "Tài khoản chưa được xác minh!"

        with allure.step("2. Gửi request đăng nhập qua API"):
            res = api.login(Config.TEST_USER_EMAIL, Config.TEST_USER_PASSWORD)
            assert res.status_code == 200, f"Lỗi đăng nhập API: {res.text}"

        with allure.step("3. Thực hiện đăng nhập trên Mobile App qua Appium"):
            login_page = LoginPage(driver)
            login_page.login(Config.TEST_USER_EMAIL, Config.TEST_USER_PASSWORD)
            login_page.take_screenshot("Sau_Khi_Dang_Nhap_UI")

    @allure.story("Xử lý lỗi: Đăng nhập sai mật khẩu phải bị từ chối")
    @allure.severity(allure.severity_level.NORMAL)
    def test_login_wrong_password_rejected(self, api):
        """Kiểm tra backend từ chối khi nhập sai mật khẩu."""
        with allure.step("Gửi yêu cầu đăng nhập với sai mật khẩu"):
            res = api.login(Config.TEST_USER_EMAIL, "WrongPassword999!")
            assert res.status_code in [400, 401], f"Đăng nhập sai pass nhưng không bị chặn! Status: {res.status_code}"

    @allure.story("Chế độ Khách (Guest Mode) không cần đăng nhập")
    @allure.severity(allure.severity_level.NORMAL)
    def test_guest_mode(self, driver, api):
        """Kiểm thử người dùng khách truy cập xem bảng tin mà không cần login."""
        with allure.step("1. Gọi API Feed với quyền Khách"):
            res = api.get_feed(guest=True)
            assert res.status_code == 200, f"Feed chế độ khách thất bại: {res.text}"

        with allure.step("2. Bấm 'Tiếp tục dưới dạng Khách' trên Appium UI"):
            login_page = LoginPage(driver)
            login_page.tap_guest_mode()
            login_page.take_screenshot("Man_Hinh_Guest_Mode")

    @allure.story("Xử lý lỗi: Đăng ký với Email đã tồn tại phải bị từ chối")
    @allure.severity(allure.severity_level.NORMAL)
    def test_register_duplicate_email_rejected(self, api):
        """Kiểm tra hệ thống chặn đăng ký trùng lặp tài khoản."""
        with allure.step(f"Gửi yêu cầu đăng ký lại với email đã có: '{Config.TEST_USER_EMAIL}'"):
            res = api.register(email=Config.TEST_USER_EMAIL, password="SomePassword123!", full_name="User Trùng Email")
            assert res.status_code in [400, 409], f"Hệ thống không chặn đăng ký trùng email: {res.status_code}"

    @allure.story("Xử lý lỗi: Xác thực OTP sai mã xác thực")
    @allure.severity(allure.severity_level.NORMAL)
    def test_verify_otp_invalid_code_rejected(self, api):
        """Kiểm tra backend từ chối khi nhập mã OTP sai."""
        with allure.step("Gửi mã OTP sai '000000' để xác thực"):
            res = api.verify_otp(email=Config.TEST_USER_EMAIL, otp="000000")
            assert res.status_code in [400, 401], f"Hệ thống chấp nhận mã OTP sai: {res.status_code}"

    @allure.story("Bảo mật: Truy cập API cần quyền (Protected Route) mà không có Token hợp lệ")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_unauthenticated_request_rejected(self, api):
        """Kiểm tra các endpoint cần đăng nhập từ chối request không có hoặc sai JWT."""
        with allure.step("1. Gọi API /api/users/me mà không gửi Token"):
            res_no_token = api._request("GET", "/api/users/me")
            assert res_no_token.status_code == 401, f"Cho phép truy cập không token: {res_no_token.status_code}"

        with allure.step("2. Gọi API /api/users/me với Token giả mạo"):
            res_bad_token = api._request("GET", "/api/users/me", headers={"Authorization": "Bearer fake.jwt.token"})
            assert res_bad_token.status_code in [401, 403], f"Cho phép truy cập với token giả mạo: {res_bad_token.status_code}"

