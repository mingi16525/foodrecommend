import time
import allure
from appium.webdriver.common.appiumby import AppiumBy
from .base_page import BasePage

class TripPlannerPage(BasePage):
    # Locators
    PLANNER_CONTAINER = (AppiumBy.XPATH, "//android.widget.ScrollView | //*[@content-desc='Lập lịch trình']")
    GROUP_NAME_FIELD = (AppiumBy.XPATH, "//android.widget.EditText[contains(@hint, 'Tên nhóm')] | (//android.widget.EditText)[1]")
    PREFERENCES_FIELD = (AppiumBy.XPATH, "//android.widget.EditText[contains(@hint, 'Sở thích')] | (//android.widget.EditText)[2]")
    GENERATE_BTN = (AppiumBy.XPATH, "//*[@content-desc='Lập lịch trình ngay'] | //android.widget.Button[contains(@text, 'Lập lịch trình')]")
    
    # VIP Paywall
    VIP_PAYWALL_BANNER = (AppiumBy.XPATH, "//*[contains(@text, 'VIP')] | //*[contains(@content-desc, 'Nâng cấp Premium')]")
    UPGRADE_MOMO_BTN = (AppiumBy.XPATH, "//*[@content-desc='Nâng cấp qua MoMo'] | //android.widget.Button[contains(@text, 'MoMo')]")

    def enter_trip_details(self, group_name: str, preferences: str):
        with allure.step(f"UI: Nhập thông tin lịch trình (Nhóm: '{group_name}', Sở thích: '{preferences}')"):
            self.type_text(*self.GROUP_NAME_FIELD, text=group_name, step_name=f"Nhập tên nhóm '{group_name}'")
            self.type_text(*self.PREFERENCES_FIELD, text=preferences, step_name=f"Nhập sở thích '{preferences}'")

    def tap_generate_plan(self):
        with allure.step("UI: Bấm nút 'Lập lịch trình ngay'"):
            self.click(*self.GENERATE_BTN, step_name="Nhấn nút Lập lịch trình AI")
            time.sleep(2)
            self.take_screenshot("Ket_Qua_Lich_Trinh_AI")

    def is_vip_paywall_displayed(self) -> bool:
        return self.is_displayed(*self.VIP_PAYWALL_BANNER, timeout=3)
