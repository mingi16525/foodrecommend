import sys
from pathlib import Path

# Add test_appium and root directory to sys.path
TEST_APPIUM_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = TEST_APPIUM_DIR.parent
for p in [str(TEST_APPIUM_DIR), str(ROOT_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

import pytest
import allure

try:
    from test_appium.config.config import Config
    from test_appium.core.db_client import DatabaseClient
    from test_appium.core.api_client import ApiClient
    from test_appium.core.appium_driver import AppiumDriverManager
    from test_appium.core.allure_helper import AllureHelper
except ImportError:
    from config.config import Config
    from core.db_client import DatabaseClient
    from core.api_client import ApiClient
    from core.appium_driver import AppiumDriverManager
    from core.allure_helper import AllureHelper

@pytest.fixture(scope="session")
def db():
    """Session-level PostgreSQL client fixture."""
    client = DatabaseClient()
    try:
        client.connect()
    except Exception as e:
        AllureHelper.attach_text("DB Connection Error", str(e))
    yield client
    client.close()

@pytest.fixture(scope="session")
def api():
    """Session-level Backend API client fixture."""
    return ApiClient()

@pytest.fixture(scope="function")
def driver(request):
    """
    Function-level Appium driver fixture.
    Initializes Appium session for UI tests if Appium Server is available.
    If Appium Server is not running, yields None to allow API & DB validations to proceed.
    """
    appium_driver = None
    if AppiumDriverManager.is_server_available():
        try:
            appium_driver = AppiumDriverManager.get_driver()
        except Exception as e:
            AllureHelper.attach_text("Appium Status", f"Lỗi khởi động Appium driver: {e}")
    else:
        AllureHelper.attach_text("Appium Status", f"Appium Server ({Config.APPIUM_SERVER_URL}) chưa bật. Bỏ qua các bước UI, tiếp tục xác thực API & Database.")

    yield appium_driver

    if appium_driver is not None:
        AppiumDriverManager.quit_driver()

@pytest.fixture(scope="session")
def test_user(db):
    """Ensures test user exists in Postgres database with verified state."""
    try:
        user = db.ensure_verified_user(
            email=Config.TEST_USER_EMAIL,
            full_name=Config.TEST_USER_NAME
        )
        return user
    except Exception as e:
        AllureHelper.attach_text("DB Setup Error", str(e))
        return {"id": "00000000-0000-0000-0000-000000000000", "email": Config.TEST_USER_EMAIL}

@pytest.fixture(scope="session")
def auth_token(api, test_user):
    """Obtains valid JWT auth token from backend API for authenticated tests."""
    try:
        res = api.login(Config.TEST_USER_EMAIL, Config.TEST_USER_PASSWORD)
        if res.status_code == 200:
            data = res.json()
            token = data.get("data", {}).get("token") if isinstance(data.get("data"), dict) else data.get("token")
            return token or data.get("token")
    except Exception as e:
        AllureHelper.attach_text("Auth Token Error", str(e))
    return None

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """
    Pytest hook: Chụp ảnh màn hình thiết bị và tự động đính kèm vào Allure Report khi test case bị FAIL/CRASH.
    """
    outcome = yield
    rep = outcome.get_result()

    if rep.when == "call" and rep.failed:
        try:
            driver = AppiumDriverManager._driver
            if driver:
                AllureHelper.attach_screenshot(driver, name="Crash_Or_Failure_Screenshot")
        except Exception as e:
            print(f"[conftest] Không thể chụp ảnh crash màn hình: {e}")
