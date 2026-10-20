import json
import allure
from allure_commons.types import AttachmentType
from tabulate import tabulate

class AllureHelper:
    @staticmethod
    def attach_text(name: str, content: str):
        """Attach plain text to Allure report."""
        try:
            allure.attach(
                str(content),
                name=name,
                attachment_type=AttachmentType.TEXT
            )
        except Exception as e:
            print(f"[AllureHelper] Failed to attach text: {e}")

    @staticmethod
    def attach_json(name: str, data):
        """Attach JSON data formatted nicely to Allure report."""
        try:
            if isinstance(data, (dict, list)):
                formatted = json.dumps(data, indent=2, ensure_ascii=False)
            elif isinstance(data, str):
                try:
                    parsed = json.loads(data)
                    formatted = json.dumps(parsed, indent=2, ensure_ascii=False)
                except Exception:
                    formatted = data
            else:
                formatted = str(data)

            allure.attach(
                formatted,
                name=name,
                attachment_type=AttachmentType.JSON
            )
        except Exception as e:
            print(f"[AllureHelper] Failed to attach JSON: {e}")

    @staticmethod
    def attach_sql(query: str, params=None, rows=None, headers=None):
        """Attach SQL query and tabular result set to Allure report."""
        try:
            content = f"--- SQL QUERY ---\n{query.strip()}\n"
            if params:
                content += f"\n--- PARAMETERS ---\n{json.dumps(params, default=str, indent=2)}\n"
            
            if rows is not None:
                content += "\n--- RESULT SET ---\n"
                if len(rows) > 0:
                    table_str = tabulate(rows, headers=headers or [], tablefmt="github")
                    content += f"{table_str}\n(Total rows: {len(rows)})"
                else:
                    content += "Empty set (0 rows returned)"

            allure.attach(
                content,
                name="PostgreSQL Query & Result",
                attachment_type=AttachmentType.TEXT
            )
        except Exception as e:
            print(f"[AllureHelper] Failed to attach SQL: {e}")

    @staticmethod
    def attach_http_call(method: str, url: str, headers: dict, request_body, status_code: int, response_body):
        """Attach complete HTTP request & response info to Allure report."""
        try:
            # Request block
            req_info = {
                "Method": method.upper(),
                "URL": url,
                "Headers": {k: v for k, v in headers.items() if k.lower() != 'authorization'} if headers else {},
                "Body": request_body if request_body is not None else "<empty>"
            }
            AllureHelper.attach_json(f"HTTP Request: {method.upper()} {url}", req_info)

            # Response block
            AllureHelper.attach_json(f"HTTP Response [{status_code}]: {url}", {
                "StatusCode": status_code,
                "Body": response_body
            })
        except Exception as e:
            print(f"[AllureHelper] Failed to attach HTTP call: {e}")

    @staticmethod
    def attach_screenshot(driver, name: str = "Screenshot"):
        """Attach Appium UI screenshot to Allure report."""
        try:
            if driver:
                screenshot_bytes = driver.get_screenshot_as_png()
                allure.attach(
                    screenshot_bytes,
                    name=name,
                    attachment_type=AttachmentType.PNG
                )
        except Exception as e:
            print(f"[AllureHelper] Failed to take screenshot: {e}")
