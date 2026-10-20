import os
from .config import Config

def get_android_capabilities():
    """
    Returns Appium UiAutomator2Options for Android automation.
    """
    try:
        from appium.options.android import UiAutomator2Options
        options = UiAutomator2Options()
        options.platform_name = Config.PLATFORM_NAME
        options.automation_name = Config.AUTOMATION_NAME
        options.device_name = Config.DEVICE_NAME
        options.new_command_timeout = Config.COMMAND_TIMEOUT
        options.no_reset = Config.NO_RESET
        
        # If APK exists, use it
        if os.path.exists(Config.APK_PATH):
            options.app = Config.APK_PATH
        else:
            options.app_package = Config.APP_PACKAGE
            options.app_activity = Config.APP_ACTIVITY
            
        options.auto_grant_permissions = True
        return options
    except ImportError:
        # Fallback to dictionary
        caps = {
            "platformName": Config.PLATFORM_NAME,
            "automationName": Config.AUTOMATION_NAME,
            "deviceName": Config.DEVICE_NAME,
            "newCommandTimeout": Config.COMMAND_TIMEOUT,
            "noReset": Config.NO_RESET,
            "autoGrantPermissions": True,
        }
        if os.path.exists(Config.APK_PATH):
            caps["app"] = Config.APK_PATH
        else:
            caps["appPackage"] = Config.APP_PACKAGE
            caps["appActivity"] = Config.APP_ACTIVITY
        return caps
