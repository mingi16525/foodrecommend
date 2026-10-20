import time
import allure
from appium.webdriver.common.appiumby import AppiumBy
from .base_page import BasePage

class BusinessPage(BasePage):
    # Locators
    CLAIM_SEARCH_INPUT = (AppiumBy.XPATH, "//android.widget.EditText[contains(@hint, 'Tìm quán')] | //android.widget.EditText[1]")
    CLAIM_BUTTON = (AppiumBy.XPATH, "//*[@content-desc='Nhận Quán'] | //android.widget.Button[contains(@text, 'Nhận')]")
    
    # Add Dish
    DISH_NAME_INPUT = (AppiumBy.XPATH, "//android.widget.EditText[contains(@hint, 'Tên món')] | (//android.widget.EditText)[1]")
    DISH_PRICE_INPUT = (AppiumBy.XPATH, "//android.widget.EditText[contains(@hint, 'Giá')] | (//android.widget.EditText)[2]")
    DISH_DESC_INPUT = (AppiumBy.XPATH, "//android.widget.EditText[contains(@hint, 'Mô tả')] | (//android.widget.EditText)[3]")
    SAVE_DISH_BTN = (AppiumBy.XPATH, "//*[@content-desc='Lưu món'] | //android.widget.Button[contains(@text, 'Lưu')]")

    def search_and_claim_restaurant(self, restaurant_name: str):
        with allure.step(f"UI: Tìm kiếm quán '{restaurant_name}' và nhấn 'Nhận Quán'"):
            self.type_text(*self.CLAIM_SEARCH_INPUT, text=restaurant_name, step_name=f"Tìm kiếm '{restaurant_name}'")
            time.sleep(1)
            self.click(*self.CLAIM_BUTTON, step_name="Bấm nút 'Nhận Quán'")
            time.sleep(1)
            self.take_screenshot("Sau_Khi_Gui_Yeu_Cau_Claim")

    def enter_new_dish(self, name: str, price: str, desc: str = ""):
        with allure.step(f"UI: Thêm món ăn mới: '{name}' - {price} VND"):
            self.type_text(*self.DISH_NAME_INPUT, text=name, step_name=f"Nhập tên món '{name}'")
            self.type_text(*self.DISH_PRICE_INPUT, text=price, step_name=f"Nhập giá '{price}'")
            if desc:
                self.type_text(*self.DISH_DESC_INPUT, text=desc, step_name="Nhập mô tả món")
            self.click(*self.SAVE_DISH_BTN, step_name="Bấm 'Lưu món'")
            time.sleep(1)
            self.take_screenshot("Sau_Khi_Them_Mon")
