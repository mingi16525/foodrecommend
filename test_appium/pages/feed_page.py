import time
import allure
from appium.webdriver.common.appiumby import AppiumBy
from .base_page import BasePage

class FeedPage(BasePage):
    # Locators
    FEED_CONTAINER = (AppiumBy.XPATH, "//android.widget.ScrollView | //android.view.View[contains(@content-desc, 'Feed')]")
    LIKE_BUTTON = (AppiumBy.XPATH, "//*[@content-desc='Like'] | //android.widget.Button[contains(@content-desc, 'thích')] | (//android.widget.ImageView)[1]")
    SAVE_BUTTON = (AppiumBy.XPATH, "//*[@content-desc='Save'] | //android.widget.Button[contains(@content-desc, 'lưu')]")
    COMMENT_BUTTON = (AppiumBy.XPATH, "//*[@content-desc='Comment'] | //android.widget.Button[contains(@content-desc, 'bình luận')]")
    
    # BottomSheet Comment
    COMMENT_INPUT = (AppiumBy.XPATH, "//android.widget.EditText | //*[contains(@hint, 'Viết bình luận')]")
    SEND_COMMENT_BTN = (AppiumBy.XPATH, "//*[@content-desc='Gửi'] | //android.widget.Button[contains(@content-desc, 'Gửi')]")

    # Header Tabs
    TAB_FOR_YOU = (AppiumBy.XPATH, "//*[@text='Dành cho bạn'] | //*[@content-desc='Dành cho bạn']")
    TAB_FOLLOWING = (AppiumBy.XPATH, "//*[@text='Đang theo dõi'] | //*[@content-desc='Đang theo dõi']")

    def tap_like(self):
        with allure.step("UI: Thả tim (Like) bài viết trên Feed"):
            self.take_screenshot("Truoc_Khi_Like")
            self.click(*self.LIKE_BUTTON, step_name="Bấm nút Thả tim")
            time.sleep(1)
            self.take_screenshot("Sau_Khi_Like")

    def tap_save(self):
        with allure.step("UI: Lưu bài viết (Bookmark)"):
            self.click(*self.SAVE_BUTTON, step_name="Bấm nút Lưu bài viết")
            time.sleep(1)
            self.take_screenshot("Sau_Khi_Luu")

    def open_comments(self):
        with allure.step("UI: Mở khung bình luận (Comments BottomSheet)"):
            self.click(*self.COMMENT_BUTTON, step_name="Bấm icon Bình luận")
            time.sleep(1)
            self.take_screenshot("Khung_Binh_Luan_Mo")

    def send_comment(self, comment_text: str):
        with allure.step(f"UI: Nhập và gửi bình luận: '{comment_text}'"):
            self.type_text(*self.COMMENT_INPUT, text=comment_text, step_name=f"Nhập nội dung '{comment_text}'")
            self.click(*self.SEND_COMMENT_BTN, step_name="Nhấn nút Gửi bình luận")
            time.sleep(1)
            self.take_screenshot("Sau_Khi_Gui_Binh_Luan")

    def scroll_to_next_post(self):
        with allure.step("UI: Lướt sang bài viết/video tiếp theo"):
            self.swipe_up()
            time.sleep(1)
            self.take_screenshot("Bai_Viet_Tiep_Theo")
