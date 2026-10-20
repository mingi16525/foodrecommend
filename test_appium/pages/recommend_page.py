import time
import allure
from appium.webdriver.common.appiumby import AppiumBy
from .base_page import BasePage

class RecommendPage(BasePage):
    # Locators
    TINDER_CARD = (AppiumBy.XPATH, "//android.widget.CardView | //android.view.View[contains(@content-desc, 'Combo') or contains(@content-desc, 'Món')]")
    LIKE_BTN = (AppiumBy.XPATH, "//*[@content-desc='Thích'] | //android.widget.Button[contains(@content-desc, 'Thích')]")
    SKIP_BTN = (AppiumBy.XPATH, "//*[@content-desc='Bỏ qua'] | //android.widget.Button[contains(@content-desc, 'Bỏ qua')]")
    BOTTOM_NAV_TAB3 = (AppiumBy.XPATH, "//*[@content-desc='Khám phá'] | (//android.widget.ImageView)[3]")

    def navigate_to_recommend_tab(self):
        with allure.step("UI: Chuyển sang Tab 3 (Khám phá & Đề xuất AI)"):
            self.click(*self.BOTTOM_NAV_TAB3, step_name="Bấm Tab Khám phá trên thanh điều hướng")
            time.sleep(1)
            self.take_screenshot("Man_Hinh_Kham_Pha_Tinder")

    def swipe_like_card(self):
        with allure.step("UI: Vuốt thẻ đề xuất sang phải (Thích / Like)"):
            self.take_screenshot("Truoc_Khi_Quet_Like")
            self.swipe_card_right()
            time.sleep(1)
            self.take_screenshot("Sau_Khi_Quet_Like")

    def swipe_skip_card(self):
        with allure.step("UI: Vuốt thẻ đề xuất sang trái (Bỏ qua / Skip)"):
            self.take_screenshot("Truoc_Khi_Quet_Skip")
            self.swipe_card_left()
            time.sleep(1)
            self.take_screenshot("Sau_Khi_Quet_Skip")
