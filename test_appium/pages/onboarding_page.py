import time
import allure
from appium.webdriver.common.appiumby import AppiumBy
from .base_page import BasePage

class OnboardingPage(BasePage):
    # Locators
    BOTTOM_NAV_TAB4 = (AppiumBy.XPATH, "//*[@content-desc='Khẩu vị'] | //*[@text='Khẩu vị'] | (//android.widget.ImageView)[4]")
    SPICY_SLIDER = (AppiumBy.XPATH, "//android.widget.SeekBar[1] | //*[contains(@content-desc, 'Cay')]")
    SALTY_SLIDER = (AppiumBy.XPATH, "//android.widget.SeekBar[2] | //*[contains(@content-desc, 'Mặn')]")
    SWEET_SLIDER = (AppiumBy.XPATH, "//android.widget.SeekBar[3] | //*[contains(@content-desc, 'Ngọt')]")
    
    # Allergies & Dietary
    ALLERGY_SEAFOOD_CHIP = (AppiumBy.XPATH, "//*[@text='Hải sản'] | //*[contains(@content-desc, 'Hải sản')]")
    ALLERGY_PEANUTS_CHIP = (AppiumBy.XPATH, "//*[@text='Đậu phộng'] | //*[contains(@content-desc, 'Đậu phộng')]")
    DIET_KETO_CHIP = (AppiumBy.XPATH, "//*[@text='Keto'] | //*[contains(@content-desc, 'Keto')]")
    SAVE_PREFERENCES_BTN = (AppiumBy.XPATH, "//*[@content-desc='Lưu khẩu vị'] | //android.widget.Button[contains(@text, 'Lưu')]")

    def navigate_to_onboarding_tab(self):
        with allure.step("UI: Chuyển sang Tab 4 (Thiết lập khẩu vị & Sức khỏe)"):
            self.click(*self.BOTTOM_NAV_TAB4, step_name="Bấm Tab Khẩu vị")
            time.sleep(1)
            self.take_screenshot("Man_Hinh_Thiet_Lap_Khau_Vi")

    def select_allergy(self, allergy_name: str):
        with allure.step(f"UI: Chọn chất gây dị ứng: '{allergy_name}'"):
            locator = (AppiumBy.XPATH, f"//*[@text='{allergy_name}'] | //*[contains(@content-desc, '{allergy_name}')]")
            self.click(*locator, step_name=f"Tích chọn '{allergy_name}'")
            time.sleep(0.5)

    def tap_save_preferences(self):
        with allure.step("UI: Bấm nút 'Lưu khẩu vị'"):
            self.click(*self.SAVE_PREFERENCES_BTN, step_name="Nhấn Lưu khẩu vị")
            time.sleep(1)
            self.take_screenshot("Sau_Khi_Luu_Khau_Vi")
