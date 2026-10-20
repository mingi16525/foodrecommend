import time
import allure
from appium.webdriver.common.appiumby import AppiumBy
from .base_page import BasePage

class GroupPage(BasePage):
    # Locators
    BOTTOM_NAV_TAB2 = (AppiumBy.XPATH, "//*[@content-desc='Cộng đồng'] | //*[@text='Cộng đồng'] | (//android.widget.ImageView)[2]")
    CREATE_GROUP_BTN = (AppiumBy.XPATH, "//*[@content-desc='Tạo nhóm mới'] | //android.widget.Button[contains(@content-desc, 'Tạo nhóm')] | //*[@content-desc='add']")
    GROUP_NAME_INPUT = (AppiumBy.XPATH, "//android.widget.EditText[contains(@hint, 'Tên nhóm')] | //android.widget.EditText")
    SUBMIT_CREATE_BTN = (AppiumBy.XPATH, "//*[@text='Tạo'] | //*[@content-desc='Tạo'] | //android.widget.Button[contains(@text, 'Tạo')]")
    GROUP_ITEM = (AppiumBy.XPATH, "//android.widget.ListView//android.view.View | //android.widget.ScrollView//android.view.View[contains(@content-desc, 'Nhóm')]")

    # Group Chat
    CHAT_INPUT = (AppiumBy.XPATH, "//android.widget.EditText[contains(@hint, 'Nhập tin nhắn')] | //android.widget.EditText")
    SEND_MSG_BTN = (AppiumBy.XPATH, "//*[@content-desc='Gửi tin nhắn'] | //android.widget.Button[contains(@content-desc, 'Gửi')]")
    START_ORDER_BTN = (AppiumBy.XPATH, "//*[@content-desc='Đặt món chung'] | //android.widget.Button[contains(@text, 'Đặt món')]")
    TRIP_PLANNER_SHORTCUT = (AppiumBy.XPATH, "//*[@content-desc='Lập lịch trình AI'] | //android.widget.Button[contains(@text, 'Lịch trình')]")

    # Group Order & Split Bill
    VOTE_BUTTON = (AppiumBy.XPATH, "//*[@content-desc='Bình chọn'] | //android.widget.Button[contains(@text, 'Vote')]")
    SPLIT_BILL_BTN = (AppiumBy.XPATH, "//*[@content-desc='Chia hóa đơn'] | //android.widget.Button[contains(@text, 'Chia bill')]")
    SPLIT_EQUALLY_OPTION = (AppiumBy.XPATH, "//*[@text='Chia đều'] | //*[@content-desc='Chia đều']")
    SPLIT_ITEMS_OPTION = (AppiumBy.XPATH, "//*[@text='Chia theo món'] | //*[@content-desc='Chia theo món']")

    def navigate_to_group_tab(self):
        with allure.step("UI: Chuyển sang Tab 2 (Cộng đồng & Nhóm bạn)"):
            self.click(*self.BOTTOM_NAV_TAB2, step_name="Bấm Tab Cộng đồng")
            time.sleep(1)
            self.take_screenshot("Man_Hinh_Danh_Sach_Nhom")

    def tap_create_group(self):
        with allure.step("UI: Nhấn nút Tạo nhóm mới"):
            self.click(*self.CREATE_GROUP_BTN, step_name="Bấm nút '+' Tạo nhóm")
            time.sleep(1)
            self.take_screenshot("Modal_Tao_Nhom")

    def enter_group_name(self, name: str):
        with allure.step(f"UI: Nhập tên nhóm '{name}'"):
            self.type_text(*self.GROUP_NAME_INPUT, text=name, step_name=f"Nhập '{name}'")

    def submit_create_group(self):
        with allure.step("UI: Xác nhận tạo nhóm"):
            self.click(*self.SUBMIT_CREATE_BTN, step_name="Bấm nút Tạo")
            time.sleep(1)
            self.take_screenshot("Sau_Khi_Tao_Nhom")

    def send_chat_message(self, message: str):
        with allure.step(f"UI: Gửi tin nhắn vào nhóm: '{message}'"):
            self.type_text(*self.CHAT_INPUT, text=message, step_name=f"Nhập tin nhắn '{message}'")
            self.click(*self.SEND_MSG_BTN, step_name="Bấm nút Gửi tin nhắn")
            time.sleep(1)
            self.take_screenshot("Tin_Nhan_Da_Gui")

    def tap_start_group_order(self):
        with allure.step("UI: Mở phòng Đặt Món Chung"):
            self.click(*self.START_ORDER_BTN, step_name="Bấm 'Đặt món chung'")
            time.sleep(1)
            self.take_screenshot("Phong_Dat_Mon_Chung")

    def tap_trip_planner(self):
        with allure.step("UI: Mở tính năng Lập lịch trình AI (Trip Planner)"):
            self.click(*self.TRIP_PLANNER_SHORTCUT, step_name="Bấm 'Lập lịch trình AI'")
            time.sleep(1)
            self.take_screenshot("Man_Hinh_Trip_Planner")
