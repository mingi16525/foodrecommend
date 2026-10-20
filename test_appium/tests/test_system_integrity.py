import allure
import pytest

@allure.epic("Food Decision Platform E2E Manual Flow")
@allure.feature("C. Tác nhân: Quản trị viên & Hệ thống (Admin & System)")
class TestSystemIntegrity:

    @allure.story("Kiểm tra sức khỏe tổng thể hệ thống (Backend, PostgreSQL, Redis)")
    @allure.severity(allure.severity_level.BLOCKER)
    def test_system_healthcheck(self, api):
        """
        Kịch bản Manual Test C.2:
        Kiểm tra trạng thái sẵn sàng của Backend và các kết nối hạ tầng cốt lõi (Database, Redis).
        """
        with allure.step("1. Gửi request Healthcheck tới Backend"):
            res = api.health_check()
            assert res.status_code == 200, f"Healthcheck trả về mã lỗi: {res.status_code}"
            data = res.json()
            assert data.get("status") == "ok", "Trạng thái hệ thống không phải OK!"

        with allure.step("2. Kiểm tra trạng thái Database & Redis trong Healthcheck response"):
            checks = data.get("checks", {})
            assert checks.get("database") == "ok", "Database connection check không đạt yêu cầu!"
            assert checks.get("redis") == "ok", "Redis cache check không đạt yêu cầu!"

    @allure.story("Kiểm tra tính toàn vẹn của dữ liệu mẫu (Seed Data) trong Database")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_database_seed_integrity(self, db):
        """
        Kịch bản Manual Test C.1:
        Đảm bảo các bảng chính (restaurants, dishes, posts, users) đã được khởi tạo dữ liệu đầy đủ.
        """
        with allure.step("1. Kiểm tra số lượng nhà hàng trong bảng restaurants"):
            restaurants = db.execute_query("SELECT COUNT(*) AS total FROM restaurants;")
            total_restaurants = int(restaurants[0]['total'])
            assert total_restaurants > 0, "Bảng restaurants không có dữ liệu!"
            allure.attach(f"Tổng số nhà hàng: {total_restaurants}", name="Restaurants Count", attachment_type=allure.attachment_type.TEXT)

        with allure.step("2. Kiểm tra số lượng món ăn trong bảng dishes"):
            dishes = db.execute_query("SELECT COUNT(*) AS total FROM dishes;")
            total_dishes = int(dishes[0]['total'])
            assert total_dishes > 0, "Bảng dishes không có dữ liệu!"
            allure.attach(f"Tổng số món ăn: {total_dishes}", name="Dishes Count", attachment_type=allure.attachment_type.TEXT)

        with allure.step("3. Kiểm tra số lượng bài đăng trong bảng posts"):
            posts = db.execute_query("SELECT COUNT(*) AS total FROM posts;")
            total_posts = int(posts[0]['total'])
            assert total_posts > 0, "Bảng posts không có dữ liệu!"
            allure.attach(f"Tổng số bài đăng: {total_posts}", name="Posts Count", attachment_type=allure.attachment_type.TEXT)

    @allure.story("Kiểm tra an ninh mạng & Bảo vệ quá tải (Security Headers & Payload Limits)")
    @allure.severity(allure.severity_level.NORMAL)
    def test_security_headers_and_payload_protection(self, api):
        """
        Kịch bản Manual Test C.2:
        - Kiểm tra các Header bảo mật (Helmet) được gắn trong phản hồi HTTP.
        - Kiểm tra bảo vệ chống quá tải: gửi request có payload vượt quá giới hạn 10KB bị chặn với HTTP 413.
        """
        with allure.step("1. Kiểm tra HTTP Security Headers do Helmet cung cấp"):
            res = api.health_check()
            assert res.status_code == 200
            headers = res.headers
            assert "x-content-type-options" in headers or "X-Content-Type-Options" in headers, "Thiếu header bảo mật X-Content-Type-Options"

        with allure.step("2. Kiểm tra giới hạn Payload bảo vệ máy chủ (chặn request > 10KB với HTTP 413 hoặc 500)"):
            large_content = "A" * 15000  # 15KB > 10KB limit
            spam_res = api._request("POST", "/api/auth/login", json_data={"email": "spam@test.com", "password": large_content})
            assert spam_res.status_code in [413, 500], f"Hệ thống không chặn payload lớn (>10KB): {spam_res.status_code}"

    @allure.story("Kiểm tra tính toàn vẹn khóa ngoại (Foreign Keys) trong Database")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_database_foreign_key_integrity(self, db):
        """Đảm bảo không có bản ghi mồ côi (orphan records) trong các bảng quan hệ."""
        with allure.step("1. Kiểm tra tất cả món ăn đều thuộc về nhà hàng hợp lệ"):
            orphan_dishes = db.execute_query("""
                SELECT COUNT(*) as total FROM dishes d
                LEFT JOIN restaurants r ON d.restaurant_id = r.id
                WHERE r.id IS NULL;
            """)
            assert int(orphan_dishes[0]['total']) == 0, "Phát hiện món ăn mồ côi không có nhà hàng!"

        with allure.step("2. Kiểm tra tất cả bài đăng đều thuộc về người dùng hợp lệ"):
            orphan_posts = db.execute_query("""
                SELECT COUNT(*) as total FROM posts p
                LEFT JOIN users u ON p.user_id = u.id
                WHERE u.id IS NULL;
            """)
            assert int(orphan_posts[0]['total']) == 0, "Phát hiện bài đăng mồ côi không có tác giả!"

    @allure.story("Khả dụng của tài liệu API Swagger / OpenAPI (/api/docs)")
    @allure.severity(allure.severity_level.NORMAL)
    def test_api_documentation_endpoint(self, api):
        """Đảm bảo trang tài liệu kỹ thuật Swagger UI luôn sẵn sàng cho lập trình viên."""
        with allure.step("Gửi GET request tới /api/docs/"):
            res = api._request("GET", "/api/docs/")
            assert res.status_code in [200, 301, 302], f"Tài liệu Swagger UI không khả dụng: {res.status_code}"


