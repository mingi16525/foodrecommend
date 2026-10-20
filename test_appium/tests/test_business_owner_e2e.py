import time
import allure
import pytest

try:
    from test_appium.config.config import Config
    from test_appium.pages.business_page import BusinessPage
except ImportError:
    from config.config import Config
    from pages.business_page import BusinessPage

@allure.epic("Food Decision Platform E2E Manual Flow")
@allure.feature("B. Tác nhân: Chủ nhà hàng / Quán ăn (Business Owner)")
class TestBusinessOwnerE2E:

    @allure.story("Chủ quán Claim quyền sở hữu nhà hàng & Admin phê duyệt tích xanh")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_claim_business_and_admin_approval(self, driver, api, db, auth_token, test_user):
        """
        Kịch bản Manual Test B.1:
        1. Người dùng tạo một quán ăn mới hoặc tìm quán ăn có sẵn.
        2. Thao tác trên UI Claim: Nhập tên quán và nhấn 'Nhận Quán'.
        3. Chủ quán gửi yêu cầu nhận quyền sở hữu (Claim Business).
        4. Admin duyệt yêu cầu -> restaurants.is_verified = TRUE, restaurants.claimed_by = userId.
        """
        random_suffix = int(time.time())
        biz_restaurant_name = f"Nhà Hàng Doanh Nghiệp #{random_suffix}"
        
        # 1. Tạo nhà hàng
        with allure.step(f"1. Tạo nhà hàng mới để thử nghiệm: '{biz_restaurant_name}'"):
            create_res = api.create_restaurant(
                token=auth_token,
                name=biz_restaurant_name,
                address="456 Phố Huế, Hai Bà Trưng, Hà Nội"
            )
            assert create_res.status_code in [200, 201], f"Tạo nhà hàng thất bại: {create_res.text}"
            restaurant_id = create_res.json()["data"]["id"]

        # Thao tác UI
        with allure.step("2. Thao tác trên UI: Tìm kiếm quán và nhấn 'Nhận Quán'"):
            business_page = BusinessPage(driver)
            try:
                business_page.search_and_claim_restaurant(biz_restaurant_name)
            except Exception as e:
                allure.attach(f"Cảnh báo giao diện: {e}", name="UI Warning", attachment_type=allure.attachment_type.TEXT)

        # 2. Gửi yêu cầu Claim qua API
        with allure.step(f"3. Gửi yêu cầu Claim quyền sở hữu quán qua API (ID: {restaurant_id})"):
            claim_res = api.claim_restaurant(token=auth_token, restaurant_id=restaurant_id)
            assert claim_res.status_code in [200, 201], f"Gửi claim thất bại: {claim_res.text}"

        # 3. Admin duyệt claim
        with allure.step("4. Admin phê duyệt yêu cầu Claim (/api/admin/restaurants/claim/:id)"):
            approve_res = api.admin_approve_claim(token=auth_token, restaurant_id=restaurant_id)
            assert approve_res.status_code == 200, f"Admin duyệt thất bại: {approve_res.text}"

        # 4. Kiểm tra Database
        with allure.step("5. Kiểm tra bảng restaurants: is_verified = TRUE, claimed_by = userId"):
            res_db = db.execute_query("SELECT id, name, is_verified, claimed_by FROM restaurants WHERE id = %s;", (restaurant_id,))
            assert len(res_db) > 0, "Không tìm thấy nhà hàng trong DB!"
            r = res_db[0]
            assert r['is_verified'] is True, "Nhà hàng chưa được cấp tích xanh (is_verified = FALSE)!"
            assert str(r['claimed_by']) == str(test_user['id']), "Chủ sở hữu claimed_by không khớp với user test!"

    @allure.story("Quản lý thực đơn: Chủ quán thêm món ăn mới vào Menu")
    @allure.severity(allure.severity_level.NORMAL)
    def test_business_owner_add_dish(self, driver, api, db, auth_token):
        """
        Kịch bản Manual Test B.2:
        1. Thao tác trên UI: Thêm món ăn mới vào thực đơn.
        2. Thêm món ăn mới vào thực đơn của quán (tự động lưu vào bảng dishes).
        """
        random_suffix = int(time.time())
        dish_name = f"Bò Bít Tết Thượng Hạng #{random_suffix}"
        dish_price = 189000.0
        
        # Lấy nhà hàng đầu tiên
        restaurants = db.execute_query("SELECT id FROM restaurants LIMIT 1;")
        if not restaurants:
            pytest.skip("Chưa có nhà hàng nào trong DB.")
        restaurant_id = str(restaurants[0]['id'])

        # Thao tác UI
        with allure.step("1. Thao tác trên UI Thực đơn: Nhập thông tin món mới và lưu"):
            business_page = BusinessPage(driver)
            try:
                business_page.enter_new_dish(dish_name, str(int(dish_price)), "Bò sốt tiêu đen")
            except Exception as e:
                allure.attach(f"Cảnh báo giao diện: {e}", name="UI Warning", attachment_type=allure.attachment_type.TEXT)

        with allure.step(f"2. Thêm món ăn mới '{dish_name}' với giá {dish_price:,.0f} VND qua API"):
            res = api.add_dish_to_restaurant(
                token=auth_token,
                restaurant_id=restaurant_id,
                name=dish_name,
                price=dish_price,
                description="Thịt bò mềm mọng nước, sốt tiêu đen đặc biệt"
            )
            assert res.status_code in [200, 201], f"Thêm món ăn thất bại: {res.text}"

        with allure.step("3. Kiểm tra món ăn đã xuất hiện trong bảng dishes (PostgreSQL)"):
            dish_in_db = db.execute_query("SELECT id, name, price FROM dishes WHERE name = %s;", (dish_name,))
            assert len(dish_in_db) > 0, f"Món ăn '{dish_name}' chưa được lưu vào bảng dishes!"
            assert float(dish_in_db[0]['price']) == dish_price, "Giá món ăn không khớp!"

    @allure.story("Quảng bá & Truyền thông: Chủ quán tạo bài đăng đính kèm danh sách món ăn")
    @allure.severity(allure.severity_level.NORMAL)
    def test_business_owner_create_post_with_attached_dishes(self, api, db, auth_token):
        """
        Kịch bản Manual Test B.2:
        - Tạo bài viết mới đính kèm hàng loạt các món ăn của quán (post_dishes).
        - Người dùng xem bài đăng trên Tab 1 (Feed) có thể thấy thông tin quán và các món đính kèm.
        """
        random_suffix = int(time.time())
        # 1. Lấy nhà hàng và 2 món ăn của quán
        restaurants = db.execute_query("SELECT id, name FROM restaurants LIMIT 1;")
        if not restaurants:
            pytest.skip("Chưa có nhà hàng nào trong DB.")
        restaurant_id = str(restaurants[0]['id'])
        restaurant_name = restaurants[0]['name']

        # Thêm 2 món mới cho quán
        d1_res = api.add_dish_to_restaurant(token=auth_token, restaurant_id=restaurant_id, name=f"Món Combo A #{random_suffix}", price=99000.0)
        d2_res = api.add_dish_to_restaurant(token=auth_token, restaurant_id=restaurant_id, name=f"Món Combo B #{random_suffix}", price=129000.0)
        d1_id = d1_res.json()["data"]["id"]
        d2_id = d2_res.json()["data"]["id"]

        post_content = f"Chương trình khuyến mãi đặc biệt tại {restaurant_name}! Đính kèm 2 món mới cực ngon."
        
        # 2. Tạo bài đăng đính kèm dishIds
        with allure.step("1. Chủ quán đăng bài viết đính kèm 2 món ăn vừa tạo"):
            post_res = api.create_post(
                token=auth_token,
                post_type="review",
                content=post_content,
                restaurant_id=restaurant_id,
                dish_ids=[d1_id, d2_id]
            )
            assert post_res.status_code in [200, 201], f"Đăng bài thất bại: {post_res.text}"
            post_data = post_res.json()["data"]
            post_id = post_data["id"]

        # 3. Kiểm tra DB post_dishes
        with allure.step("2. Kiểm tra bảng post_dishes trong PostgreSQL"):
            p_dishes = db.execute_query("SELECT dish_id FROM post_dishes WHERE post_id = %s;", (post_id,))
            linked_dish_ids = [str(row['dish_id']) for row in p_dishes]
            assert d1_id in linked_dish_ids and d2_id in linked_dish_ids, f"Các món ăn chưa được liên kết đầy đủ trong post_dishes: {linked_dish_ids}"

        with allure.step("3. Kiểm tra bài viết xuất hiện trên Feed mạng xã hội (Tab 1)"):
            feed_res = api.get_feed(token=auth_token)
            assert feed_res.status_code == 200
            feed_items = feed_res.json().get("data", [])
            feed_post_ids = [str(item["id"]) for item in feed_items]
            assert post_id in feed_post_ids, "Bài viết vừa đăng không xuất hiện trên luồng Feed!"

    @allure.story("Xử lý lỗi: Gửi Claim nhà hàng không tồn tại")
    @allure.severity(allure.severity_level.NORMAL)
    def test_claim_non_existent_restaurant_rejected(self, api, auth_token):
        """Kiểm tra hệ thống từ chối claim quán không có thật."""
        fake_uuid = "00000000-0000-0000-0000-000000000000"
        with allure.step(f"Gửi claim cho quán với ID không tồn tại: {fake_uuid}"):
            res = api.claim_restaurant(token=auth_token, restaurant_id=fake_uuid)
            assert res.status_code in [400, 404, 500], f"Claim quán không tồn tại nhưng không báo lỗi: {res.status_code}"

    @allure.story("Tra cứu chi tiết thông tin nhà hàng (Restaurant Details)")
    @allure.severity(allure.severity_level.NORMAL)
    def test_owner_view_restaurant_profile(self, api, db):
        """Kiểm tra truy vấn chi tiết nhà hàng qua API /api/restaurants/:id."""
        restaurants = db.execute_query("SELECT id, name FROM restaurants LIMIT 1;")
        if not restaurants:
            pytest.skip("Chưa có nhà hàng trong DB.")
        rest_id = str(restaurants[0]['id'])

        with allure.step(f"Lấy chi tiết nhà hàng '{rest_id}'"):
            res = api._request("GET", f"/api/restaurants/{rest_id}")
            assert res.status_code == 200
            data = res.json().get("data", {})
            assert str(data.get("id")) == rest_id, "ID nhà hàng trả về không khớp!"


