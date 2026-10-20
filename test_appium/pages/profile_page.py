import time
import allure
from appium.webdriver.common.appiumby import AppiumBy
from .base_page import BasePage

class ProfilePage(BasePage):
    # Locators
    BOTTOM_NAV_TAB5 = (AppiumBy.XPATH, "//*[@content-desc='Tài khoản'] | //*[@text='Tài khoản'] | (//android.widget.ImageView)[5]")
    USER_NAME_TEXT = (AppiumBy.XPATH, "//android.widget.TextView[1] | //*[contains(@content-desc, 'User')]")
    TIER_BADGE = (AppiumBy.XPATH, "//*[contains(@text, 'VIP')] | //*[contains(@content-desc, 'VIP')] | //*[contains(@text, 'Gói')]")
    POINTS_BADGE = (AppiumBy.XPATH, "//*[contains(@text, 'Điểm')] | //*[contains(@content-desc, 'điểm')]")
    
    # Stats Counters
    STATS_REVIEWS = (AppiumBy.XPATH, "//*[contains(@text, 'Đánh giá')] | //*[contains(@content-desc, 'Đánh giá')]")
    STATS_SAVED = (AppiumBy.XPATH, "//*[contains(@text, 'Đã lưu')] | //*[contains(@content-desc, 'Đã lưu')]")
    STATS_POSTS = (AppiumBy.XPATH, "//*[contains(@text, 'Bài viết')] | //*[contains(@content-desc, 'Bài viết')]")

    # Grid & Actions
    POST_GRID_ITEM = (AppiumBy.XPATH, "//android.widget.GridView//android.view.View | (//android.widget.ImageView)[last()]")
    UPGRADE_PREMIUM_BTN = (AppiumBy.XPATH, "//*[@content-desc='Nâng cấp PREMIUM (50k/tháng)'] | //android.widget.Button[contains(@text, 'Nâng cấp')]")

    def navigate_to_profile_tab(self):
        with allure.step("UI: Chuyển sang Tab 5 (Hồ sơ cá nhân & Tài khoản)"):
            self.click(*self.BOTTOM_NAV_TAB5, step_name="Bấm Tab Tài khoản")
            time.sleep(1)
            self.take_screenshot("Man_Hinh_Ho_So_Ca_Nhan")

    def tap_saved_posts_stat(self):
        with allure.step("UI: Bấm vào mục 'Đã lưu' để xem danh sách bài viết đã bookmark"):
            self.click(*self.STATS_SAVED, step_name="Bấm vào số lượng Đã lưu")
            time.sleep(1)
            self.take_screenshot("Danh_Sach_Bai_Viet_Da_Luu")

    def tap_post_grid_item(self):
        with allure.step("UI: Chạm vào một bài viết trên lưới 9:16 để mở lại chi tiết"):
            self.click(*self.POST_GRID_ITEM, step_name="Chạm ô bài viết trên Grid")
            time.sleep(1)
            self.take_screenshot("Chi_Tiet_Bai_Viet_Mo_Lai")

    def tap_upgrade_premium(self):
        with allure.step("UI: Bấm nút 'Nâng cấp PREMIUM (50k/tháng)'"):
            self.click(*self.UPGRADE_PREMIUM_BTN, step_name="Bấm Nâng cấp Premium")
            time.sleep(1)
            self.take_screenshot("Hop_Thoai_Thanh_Toan_MoMo")
