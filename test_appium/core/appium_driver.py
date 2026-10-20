import urllib.request
import allure
from appium import webdriver

try:
    from test_appium.config.config import Config
    from test_appium.config.capabilities import get_android_capabilities
    from test_appium.core.allure_helper import AllureHelper
except ImportError:
    from config.config import Config
    from config.capabilities import get_android_capabilities
    from core.allure_helper import AllureHelper

class AppiumDriverManager:
    _driver = None

    @classmethod
    def is_server_available(cls) -> bool:
        """
        Fast non-blocking check to see if Appium server is responsive.
        """
        try:
            req = urllib.request.Request(f"{Config.APPIUM_SERVER_URL}/status")
            with urllib.request.urlopen(req, timeout=0.8) as resp:
                return resp.status in (200, 404)
        except Exception:
            return False

    @classmethod
    def get_driver(cls):
        """
        Initializes and returns a singleton Appium WebDriver session.
        """
        if cls._driver is None:
            if not cls.is_server_available():
                raise RuntimeError(
                    f"Không thể kết nối tới Appium Server tại {Config.APPIUM_SERVER_URL}.\n"
                    f"Hãy chắc chắn rằng Appium Server đã được bật bằng lệnh: `appium`."
                )

            with allure.step(f"Appium: Khởi tạo kết nối tới Appium Server ({Config.APPIUM_SERVER_URL})"):
                options = get_android_capabilities()
                try:
                    cls._driver = webdriver.Remote(
                        command_executor=Config.APPIUM_SERVER_URL,
                        options=options
                    )
                    cls._driver.implicitly_wait(10)
                    AllureHelper.attach_text("Appium Session Created", f"Session ID: {cls._driver.session_id}")
                except Exception as e:
                    AllureHelper.attach_text("Appium Connection Failed", str(e))
                    raise RuntimeError(f"Lỗi khởi động Appium session: {e}") from e
        return cls._driver

    @classmethod
    def quit_driver(cls):
        """
        Safely terminates the Appium session.
        """
        if cls._driver is not None:
            try:
                with allure.step("Appium: Đóng phiên kiểm thử và giải phóng thiết bị"):
                    cls._driver.quit()
            except Exception as e:
                print(f"[AppiumDriverManager] Error quitting driver: {e}")
            finally:
                cls._driver = None
