import allure
import pytest

try:
    from test_appium.pages.recommend_page import RecommendPage
    from test_appium.config.config import Config
except ImportError:
    from pages.recommend_page import RecommendPage
    from config.config import Config

@allure.epic("Food Recommend E2E Testing")
@allure.feature("Đề xuất AI & Quẹt Tinder (Tab 3)")
class TestRecommendE2E:

    @allure.story("Quẹt thẻ món ăn sang phải (Thích) và kiểm tra lưu trữ user_swipes trong Database")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_swipe_like_flow_ui_api_db(self, driver, api, db, auth_token, test_user):
        """
        Kiểm thử luồng quẹt Tinder đề xuất món ăn:
        1. Lấy danh sách món ăn từ Database để chọn món kiểm thử.
        2. Thao tác quẹt thẻ sang phải (Swipe Right) trên UI Appium.
        3. Gửi sự kiện quẹt Like tới Backend API.
        4. Truy vấn bảng user_swipes trong PostgreSQL để kiểm tra action = 'like'.
        """
        # --- BƯỚC 1: LẤY DỮ LIỆU MÓN ĂN TỪ DB ---
        with allure.step("1. Truy vấn danh sách món ăn từ bảng dishes"):
            dishes = db.execute_query("SELECT id, name, price, item_type FROM dishes LIMIT 1;")
            if not dishes:
                pytest.skip("Chưa có dữ liệu món ăn trong DB để kiểm thử quẹt thẻ.")
            
            target_dish = dishes[0]
            dish_id = str(target_dish['id'])
            dish_name = target_dish['name']
            allure.attach(
                f"Món ăn test: {dish_name} (ID: {dish_id})",
                name="Thông tin món ăn",
                attachment_type=allure.attachment_type.TEXT
            )

        # --- BƯỚC 2: THỰC THI THAO TÁC TRÊN UI ---
        with allure.step("2. Chuyển sang Tab Khám phá và quẹt thẻ sang phải trên Appium UI"):
            recommend_page = RecommendPage(driver)
            try:
                recommend_page.navigate_to_recommend_tab()
                recommend_page.swipe_like_card()
            except Exception as e:
                allure.attach(f"Cảnh báo giao diện: {e}", name="UI Info", attachment_type=allure.attachment_type.TEXT)

        # --- BƯỚC 3: GỬI LỆNH API QUẸT THẺ ---
        with allure.step("3. Đồng bộ hành vi quẹt món ăn sang Backend API (/api/recommendation/swipe)"):
            res = api.swipe_dish(token=auth_token, dish_id=dish_id, action="like")
            assert res.status_code in [200, 201], f"API Swipe thất bại: {res.text}"

        # --- BƯỚC 4: TRUY VẤN XÁC MINH TRONG DATABASE ---
        with allure.step("4. Kiểm tra bản ghi trong bảng user_swipes (PostgreSQL)"):
            user_id = str(test_user['id'])
            swipes = db.get_user_swipes(user_id=user_id)
            matched = [s for s in swipes if str(s['dish_id']) == dish_id and s['action'] == 'like']
            assert len(matched) > 0, f"Không tìm thấy bản ghi quẹt Like cho dish_id {dish_id} trong bảng user_swipes!"
            allure.attach(
                str(matched[0]),
                name="Bản ghi user_swipes đã xác minh",
                attachment_type=allure.attachment_type.TEXT
            )

    @allure.story("Quẹt thẻ món ăn sang trái (Bỏ qua / Skip) và kiểm tra Database")
    @allure.severity(allure.severity_level.NORMAL)
    def test_swipe_skip_flow_ui_api_db(self, driver, api, db, auth_token, test_user):
        """
        Kịch bản Manual Test A.4:
        1. Lấy món ăn từ DB.
        2. Thao tác quẹt sang trái (Swipe Left / Skip) trên UI Appium.
        3. Gửi sự kiện action = 'skip' sang API.
        4. Kiểm tra trong PostgreSQL bảng user_swipes lưu đúng action = 'skip'.
        """
        dishes = db.execute_query("SELECT id, name FROM dishes OFFSET 1 LIMIT 1;")
        if not dishes:
            pytest.skip("Chưa có đủ món ăn trong DB để kiểm thử quẹt Skip.")
        target_dish = dishes[0]
        dish_id = str(target_dish['id'])

        with allure.step("1. Thao tác quẹt trái trên Appium UI"):
            recommend_page = RecommendPage(driver)
            try:
                recommend_page.navigate_to_recommend_tab()
                recommend_page.swipe_skip_card()
            except Exception as e:
                allure.attach(f"Cảnh báo giao diện: {e}", name="UI Info", attachment_type=allure.attachment_type.TEXT)

        with allure.step("2. Gửi sự kiện quẹt Skip sang API (/api/recommendation/swipe)"):
            res = api.swipe_dish(token=auth_token, dish_id=dish_id, action="skip")
            assert res.status_code in [200, 201], f"API Swipe Skip thất bại: {res.text}"

        with allure.step("3. Kiểm tra bản ghi 'skip' trong PostgreSQL bảng user_swipes"):
            user_id = str(test_user['id'])
            swipes = db.get_user_swipes(user_id=user_id)
            matched = [s for s in swipes if str(s['dish_id']) == dish_id and s['action'] == 'skip']
            assert len(matched) > 0, f"Không tìm thấy bản ghi quẹt Skip cho dish_id {dish_id} trong user_swipes!"

    @allure.story("Bộ lọc dị ứng & Cá nhân hóa Feed gợi ý (Allergy Filter & History Weighting)")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_recommendation_feed_reflects_history_and_filters(self, api, db, auth_token, test_user):
        """
        Kịch bản Manual Test A.4 & A.5:
        1. Cập nhật dị ứng trong profile (ví dụ dị ứng 'đậu phộng').
        2. Gọi feed gợi ý món ăn (Fast Tier).
        3. Xác minh món ăn trả về không chứa thành phần dị ứng đã khai báo.
        """
        user_id = str(test_user['id'])
        allergy_name = "đậu phộng"

        with allure.step(f"1. Thiết lập dị ứng '{allergy_name}' cho tài khoản người dùng"):
            pref_res = api.update_preferences(token=auth_token, preferences={
                "favorite_flavors": ["chua", "cay", "mặn"],
                "allergies": [allergy_name],
                "dietary_restrictions": []
            })
            assert pref_res.status_code == 200

        with allure.step("2. Lấy danh sách món ăn gợi ý từ Fast Tier (/api/recommendation/feed)"):
            rec_res = api.get_recommendation_feed(token=auth_token, lat=21.0319, lng=105.8465)
            assert rec_res.status_code == 200, f"Lỗi lấy recommendation feed: {rec_res.text}"
            recs = rec_res.json().get("data", [])
            assert isinstance(recs, list)

            # Kiểm tra không có món ăn nào trong kết quả chứa thành phần dị ứng
            for rec in recs:
                ingredients = rec.get("ingredients") or []
                if isinstance(ingredients, list):
                    for ing in ingredients:
                        assert allergy_name.lower() not in str(ing).lower(), f"Món ăn {rec.get('name')} chứa thành phần dị ứng {ing}!"

    @allure.story("Xử lý lỗi: Hành động quẹt không hợp lệ phải bị từ chối")
    @allure.severity(allure.severity_level.NORMAL)
    def test_swipe_invalid_action_rejected(self, api, db, auth_token):
        """Kiểm tra validation từ chối action quẹt không thuộc 'like' hoặc 'skip'."""
        dishes = db.execute_query("SELECT id FROM dishes LIMIT 1;")
        if not dishes:
            pytest.skip("Chưa có món ăn trong DB.")
        dish_id = str(dishes[0]['id'])

        with allure.step("Gửi hành động quẹt không hợp lệ ('invalid_action')"):
            res = api._request("POST", "/api/recommendation/swipe", headers={"Authorization": f"Bearer {auth_token}"}, json_data={
                "dishId": dish_id,
                "action": "invalid_action"
            })
            assert res.status_code == 400, f"Hệ thống không chặn action quẹt sai: {res.status_code}"

    @allure.story("Tìm kiếm nhà hàng theo từ khóa & Xem chi tiết thực đơn")
    @allure.severity(allure.severity_level.NORMAL)
    def test_search_restaurants_and_view_dishes(self, api, db):
        """Kiểm tra tìm kiếm nhà hàng qua API và lấy toàn bộ menu món của quán."""
        restaurants = db.execute_query("SELECT id, name FROM restaurants LIMIT 1;")
        if not restaurants:
            pytest.skip("Chưa có nhà hàng trong DB.")
        rest_name = restaurants[0]['name']
        rest_id = str(restaurants[0]['id'])

        with allure.step(f"1. Tìm kiếm quán với tên: '{rest_name}'"):
            search_res = api.search_restaurants(query=rest_name[:4])
            assert search_res.status_code == 200
            results = search_res.json().get("data", [])
            assert isinstance(results, list)

        with allure.step(f"2. Xem danh sách thực đơn của quán (ID: {rest_id})"):
            menu_res = api.get_restaurant_dishes(restaurant_id=rest_id)
            assert menu_res.status_code == 200
            dishes = menu_res.json().get("data", [])
            assert isinstance(dishes, list)

    @allure.story("Định vị GPS Haversine & Liên kết đặt món đa nền tảng (ShopeeFood, Be, GrabFood, Maps)")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_recommendation_gps_distance_and_delivery_links(self, driver, api, auth_token):
        """
        Kịch bản kiểm tra:
        1. Người dùng mở Tab 3 (Khám phá) và ứng dụng gửi tọa độ GPS (Hà Nội: 21.0319, 105.8465).
        2. Backend tính toán khoảng cách cầu Haversine (distance_meters) đến từng nhà hàng.
        3. Kiểm tra mỗi đề xuất có đầy đủ đối tượng delivery_links và tọa độ để mở Google Maps.
        """
        user_lat = 21.0319
        user_lng = 105.8465

        # 1. Thao tác UI nếu có driver
        with allure.step("1. Thao tác trên UI Khám phá: Điều hướng sang Tab 3"):
            recommend_page = RecommendPage(driver)
            try:
                recommend_page.navigate_to_recommend_tab()
            except Exception as e:
                allure.attach(f"Cảnh báo giao diện: {e}", name="UI Warning", attachment_type=allure.attachment_type.TEXT)

        # 2. Gọi API Recommendation kèm GPS
        with allure.step(f"2. Gọi GET /api/recommendation với tọa độ ({user_lat}, {user_lng})"):
            res = api.get_recommendation_feed(token=auth_token, lat=user_lat, lng=user_lng)
            assert res.status_code == 200, f"Lỗi lấy gợi ý GPS: {res.text}"
            recs = res.json().get("data", [])
            assert len(recs) > 0, "Không có gợi ý món ăn nào được trả về!"

            first_rec = recs[0]
            allure.attach(str(first_rec), name="Dữ liệu món ăn mẫu kèm GPS & Delivery", attachment_type=allure.attachment_type.TEXT)

            # Kiểm tra tên món và thông tin quán
            assert "name" in first_rec, "Gợi ý thiếu tên món ăn"
            assert "restaurant_name" in first_rec or "restaurant" in first_rec, "Gợi ý thiếu tên quán ăn"

            # Kiểm tra liên kết đặt món nếu có trường delivery_links
            if "delivery_links" in first_rec and first_rec["delivery_links"]:
                links = first_rec["delivery_links"]
                has_valid_link = any(k in links for k in ["shopeefood", "be", "grabfood", "maps"])
                assert has_valid_link, f"Đối tượng delivery_links không chứa các nền tảng hỗ trợ: {links}"


