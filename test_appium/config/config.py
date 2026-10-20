import os
from pathlib import Path
from urllib.parse import urlparse
from dotenv import load_dotenv

# Base paths
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
TEST_DIR = Path(__file__).resolve().parent.parent

# Load .env
env_file = ROOT_DIR / ".env"
if env_file.exists():
    load_dotenv(dotenv_path=env_file)
else:
    load_dotenv()

class Config:
    # Backend API Configuration
    API_PORT = os.getenv("PORT", "3000")
    DEFAULT_LOCAL_URL = f"http://localhost:{API_PORT}"
    
    # Read active Cloudflare tunnel if available
    ACTIVE_TUNNEL_FILE = ROOT_DIR / "ACTIVE_TUNNEL_URL.txt"
    TUNNEL_URL = ""
    if ACTIVE_TUNNEL_FILE.exists():
        try:
            with open(ACTIVE_TUNNEL_FILE, "r", encoding="utf-8") as f:
                TUNNEL_URL = f.read().strip()
        except Exception:
            TUNNEL_URL = ""
            
    API_BASE_URL = os.getenv("API_BASE_URL", TUNNEL_URL or DEFAULT_LOCAL_URL).rstrip("/")

    # Database Configuration
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://fooduser:foodpassword@localhost:5432/foodrecommend")
    
    # Parse DB connection info
    _parsed_db = urlparse(DATABASE_URL)
    DB_USER = _parsed_db.username or os.getenv("DB_USER", "fooduser")
    DB_PASSWORD = _parsed_db.password or os.getenv("DB_PASSWORD", "foodpassword")
    DB_HOST = _parsed_db.hostname or os.getenv("DB_HOST", "localhost")
    DB_PORT = _parsed_db.port or int(os.getenv("DB_PORT", "5432"))
    DB_NAME = _parsed_db.path.lstrip("/") or os.getenv("DB_NAME", "foodrecommend")

    # Appium Server Configuration
    APPIUM_HOST = os.getenv("APPIUM_HOST", "127.0.0.1")
    APPIUM_PORT = int(os.getenv("APPIUM_PORT", "4723"))
    APPIUM_SERVER_URL = f"http://{APPIUM_HOST}:{APPIUM_PORT}"

    # Android / APK Configuration
    APK_PATH = os.getenv("APK_PATH", str(ROOT_DIR / "app-release-test.apk"))
    DEVICE_NAME = os.getenv("DEVICE_NAME", "Android Emulator")
    PLATFORM_NAME = "Android"
    AUTOMATION_NAME = "UiAutomator2"
    APP_PACKAGE = os.getenv("APP_PACKAGE", "com.example.foodrecommend")
    APP_ACTIVITY = os.getenv("APP_ACTIVITY", ".MainActivity")
    NO_RESET = os.getenv("NO_RESET", "false").lower() == "true"
    COMMAND_TIMEOUT = int(os.getenv("COMMAND_TIMEOUT", "300"))

    # Test User Credentials
    TEST_USER_EMAIL = os.getenv("TEST_USER_EMAIL", "test@example.com")
    TEST_USER_PASSWORD = os.getenv("TEST_USER_PASSWORD", "password123")
    TEST_USER_NAME = os.getenv("TEST_USER_NAME", "Test User Automation")
