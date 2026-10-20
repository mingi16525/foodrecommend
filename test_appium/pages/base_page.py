import time
import allure
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from appium.webdriver.common.appiumby import AppiumBy

try:
    from test_appium.core.allure_helper import AllureHelper
except ImportError:
    from core.allure_helper import AllureHelper

class BasePage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(self.driver, 15) if self.driver else None

    def find_element(self, by: By, locator: str, timeout: int = 15):
        """Finds an element with explicit wait."""
        if not self.driver or not self.wait:
            return None
        try:
            return WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, locator))
            )
        except Exception as e:
            AllureHelper.attach_screenshot(self.driver, f"Find_Failed_{locator}")
            raise e

    def wait_for_element_visible(self, by: By, locator: str, timeout: int = 15):
        """Waits for element to be visible on screen."""
        if not self.driver or not self.wait:
            return None
        try:
            return WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located((by, locator))
            )
        except Exception as e:
            AllureHelper.attach_screenshot(self.driver, f"Not_Visible_{locator}")
            raise e

    def click(self, by: By, locator: str, step_name: str = None):
        """Clicks an element with Allure step logging."""
        desc = step_name or f"Click element: {locator}"
        if not self.driver or not self.wait:
            with allure.step(f"UI (Bỏ qua - Appium chưa bật): {desc}"):
                return
        with allure.step(f"UI: {desc}"):
            element = self.wait.until(EC.element_to_be_clickable((by, locator)))
            element.click()

    def type_text(self, by: By, locator: str, text: str, step_name: str = None, clear: bool = True):
        """Inputs text into an element with Allure step logging."""
        desc = step_name or f"Nhập '{text}' vào {locator}"
        if not self.driver or not self.wait:
            with allure.step(f"UI (Bỏ qua - Appium chưa bật): {desc}"):
                return
        with allure.step(f"UI: {desc}"):
            element = self.wait_for_element_visible(by, locator)
            if clear and element:
                element.clear()
            if element:
                element.send_keys(text)

    def get_text(self, by: By, locator: str) -> str:
        """Gets visible text from an element."""
        if not self.driver:
            return ""
        element = self.find_element(by, locator)
        return element.text if element else ""

    def is_displayed(self, by: By, locator: str, timeout: int = 5) -> bool:
        """Checks if an element is currently displayed."""
        if not self.driver:
            return True
        try:
            return WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located((by, locator))
            ).is_displayed()
        except Exception:
            return False

    def take_screenshot(self, name: str = "UI Screenshot"):
        """Captures and attaches current UI screen to Allure."""
        if self.driver:
            AllureHelper.attach_screenshot(self.driver, name)

    def swipe(self, start_x: float, start_y: float, end_x: float, end_y: float, duration: int = 800):
        """Performs a touch swipe gesture."""
        if not self.driver:
            return
        size = self.driver.get_window_size()
        width = size['width']
        height = size['height']

        start_px_x = int(start_x * width)
        start_px_y = int(start_y * height)
        end_px_x = int(end_x * width)
        end_px_y = int(end_y * height)

        self.driver.swipe(start_px_x, start_px_y, end_px_x, end_px_y, duration)
        time.sleep(1)

    def swipe_up(self, step_name: str = "Cuộn lên xem video/bài tiếp theo"):
        """Swipes up (scrolls down feed)."""
        if not self.driver:
            with allure.step(f"UI (Bỏ qua - Appium chưa bật): {step_name}"):
                return
        with allure.step(f"UI: {step_name}"):
            self.swipe(0.5, 0.8, 0.5, 0.2)

    def swipe_down(self, step_name: str = "Cuộn xuống xem video trước đó"):
        """Swipes down."""
        if not self.driver:
            with allure.step(f"UI (Bỏ qua - Appium chưa bật): {step_name}"):
                return
        with allure.step(f"UI: {step_name}"):
            self.swipe(0.5, 0.2, 0.5, 0.8)

    def swipe_card_right(self, step_name: str = "Vuốt thẻ sang phải (Thích / Like)"):
        """Swipes card right (Tinder Like)."""
        if not self.driver:
            with allure.step(f"UI (Bỏ qua - Appium chưa bật): {step_name}"):
                return
        with allure.step(f"UI: {step_name}"):
            self.swipe(0.2, 0.5, 0.85, 0.5)

    def swipe_card_left(self, step_name: str = "Vuốt thẻ sang trái (Bỏ qua / Skip)"):
        """Swipes card left (Tinder Skip)."""
        if not self.driver:
            with allure.step(f"UI (Bỏ qua - Appium chưa bật): {step_name}"):
                return
        with allure.step(f"UI: {step_name}"):
            self.swipe(0.85, 0.5, 0.15, 0.5)
