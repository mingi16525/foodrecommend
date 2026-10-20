import allure
from appium.webdriver.common.appiumby import AppiumBy
from .base_page import BasePage

class LoginPage(BasePage):
    # Locators
    EMAIL_INPUT = (AppiumBy.XPATH, "//android.widget.EditText[1] | //*[@text='Email'] | //*[contains(@hint, 'Email')]")
    PASSWORD_INPUT = (AppiumBy.XPATH, "//android.widget.EditText[2] | //*[@text='Mật khẩu'] | //*[contains(@hint, 'Mật khẩu')]")
    LOGIN_BUTTON = (AppiumBy.XPATH, "//android.widget.Button[@content-desc='Đăng nhập'] | //*[@text='Đăng nhập'] | //android.widget.Button[contains(@text, 'Đăng nhập')]")
    GUEST_BUTTON = (AppiumBy.XPATH, "//*[@content-desc='Tiếp tục dưới dạng Khách'] | //*[@text='Tiếp tục dưới dạng Khách']")
    REGISTER_BUTTON = (AppiumBy.XPATH, "//*[contains(@text, 'Đăng ký ngay')] | //*[contains(@content-desc, 'Đăng ký ngay')]")
    SERVER_CONFIG_ICON = (AppiumBy.XPATH, "//*[@content-desc='Cấu hình Server API'] | //android.widget.Button[contains(@content-desc, 'Server')]")

    def enter_email(self, email: str):
        self.type_text(*self.EMAIL_INPUT, text=email, step_name=f"Nhập Email: '{email}'")

    def enter_password(self, password: str):
        self.type_text(*self.PASSWORD_INPUT, text=password, step_name="Nhập Mật khẩu: '******'")

    def tap_login(self):
        self.click(*self.LOGIN_BUTTON, step_name="Nhấn nút 'Đăng nhập'")

    def tap_guest_mode(self):
        self.click(*self.GUEST_BUTTON, step_name="Nhấn 'Tiếp tục dưới dạng Khách'")

    def login(self, email: str, password: str):
        """Full login flow with UI screenshot."""
        with allure.step(f"Thực hiện đăng nhập UI với tài khoản '{email}'"):
            self.take_screenshot("Truoc_Khi_Dang_Nhap")
            self.enter_email(email)
            self.enter_password(password)
            self.tap_login()
            self.take_screenshot("Sau_Khi_Nhan_Dang_Nhap")

    def is_login_screen_displayed(self) -> bool:
        return self.is_displayed(*self.LOGIN_BUTTON, timeout=5)
