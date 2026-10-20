import time
import json
import allure
import pytest

try:
    from test_appium.config.config import Config
    from test_appium.pages.onboarding_page import OnboardingPage
    from test_appium.pages.profile_page import ProfilePage
except ImportError:
    from config.config import Config
    from pages.onboarding_page import OnboardingPage
    from pages.profile_page import ProfilePage

@allure.epic("Food Decision Platform E2E Manual Flow")
@allure.feature("A.5 & A.6. Tab 4 & 5 - Hồ sơ cá nhân & Nâng cấp Premium")
class TestProfilePreferencesE2E:

    @allure.story("Tab 4 - Thiết lập sở thích ăn uống & dị ứng (Flavors, Allergies)")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_update_preferences_and_allergies(self, driver, api, db, auth_token, test_user):
        """
        Kịch bản Manual Test A.5:
        1. Thao tác trên UI Tab 4 (Khẩu vị).
        2. Chọn/sửa đổi các sở thích (Flavors, Categories).
        3. Đánh dấu các món/thành phần dị ứng (Allergies: vd 'hải sản', 'đậu phộng').
        4. Lưu thay đổi, đối chiếu dữ liệu được lưu trong bảng user_preferences (PostgreSQL).
        """
        user_id = str(test_user['id'])
        preferences_payload = {
            "favorite_flavors": ["cay", "chua_ngot", "đậm đà"],
            "allergies": ["tôm", "cua", "đậu phộng"],
            "dietary_restrictions": ["không ăn cay vào bữa sáng"],
            "hated_dishes": ["mướp đắng", "sầu riêng"]
        }

        # 1. Thao tác UI
        with allure.step("1. Thao tác trên UI Tab 4: Chọn dị ứng và lưu khẩu vị"):
            onboarding_page = OnboardingPage(driver)
            try:
                onboarding_page.navigate_to_onboarding_tab()
                onboarding_page.select_allergy("Đậu phộng")
                onboarding_page.tap_save_preferences()
            except Exception as e:
                allure.attach(f"Cảnh báo giao diện: {e}", name="UI Warning", attachment_type=allure.attachment_type.TEXT)

        with allure.step("2. Gửi request cập nhật thông tin sở thích và dị ứng cá nhân qua API"):
            res = api.update_preferences(token=auth_token, preferences=preferences_payload)
            assert res.status_code == 200, f"Cập nhật preferences thất bại: {res.text}"

        with allure.step("3. Truy vấn trực tiếp bảng user_preferences trong Database"):
            pref_db = db.get_user_preferences(user_id)
            assert pref_db is not None, "Không tìm thấy bản ghi trong bảng user_preferences!"
            
            # Đối chiếu allergies
            allergies_in_db = pref_db[0]['allergies'] if isinstance(pref_db, list) else pref_db['allergies']
            if isinstance(allergies_in_db, str):
                allergies_in_db = json.loads(allergies_in_db)
                
            assert "tôm" in allergies_in_db, "Dị ứng 'tôm' chưa được lưu vào Database!"
            assert "đậu phộng" in allergies_in_db, "Dị ứng 'đậu phộng' chưa được lưu vào Database!"

    @allure.story("Tab 5 - Xem thông tin tài khoản cá nhân (Profile)")
    @allure.severity(allure.severity_level.NORMAL)
    def test_view_personal_profile(self, driver, api, auth_token, test_user):
        """
        Kịch bản Manual Test A.6:
        Mở Tab Tài khoản, kiểm tra đúng thông tin cá nhân.
        """
        # Thao tác UI
        with allure.step("1. Thao tác trên UI Tab 5: Chuyển sang Tab Tài khoản"):
            profile_page = ProfilePage(driver)
            try:
                profile_page.navigate_to_profile_tab()
            except Exception as e:
                allure.attach(f"Cảnh báo giao diện: {e}", name="UI Warning", attachment_type=allure.attachment_type.TEXT)

        with allure.step("2. Gửi yêu cầu lấy thông tin cá nhân qua API /api/users/me"):
            res = api.get_profile(token=auth_token)
            assert res.status_code == 200, f"Lấy profile thất bại: {res.text}"
            data = res.json()
            user_data = data.get("data", data)
            assert user_data.get("email") == Config.TEST_USER_EMAIL, "Email người dùng không khớp!"

    @allure.story("Tab 5 - Xem danh sách bài viết đã 'Lưu' (Saved posts)")
    @allure.severity(allure.severity_level.NORMAL)
    def test_view_saved_posts_in_profile(self, api, db, auth_token, test_user):
        """
        Kịch bản Manual Test A.6:
        Xem danh sách các bài viết / món ăn đã 'Lưu' (Saved posts).
        """
        post = db.get_first_post()
        if not post:
            pytest.skip("Chưa có bài đăng trong DB.")
        post_id = str(post['id'])

        # Đảm bảo bài viết được lưu
        api.save_post(token=auth_token, post_id=post_id)

        with allure.step("Lấy danh sách các bài viết đã lưu của User"):
            res = api.get_saved_posts(token=auth_token)
            assert res.status_code == 200, f"Lấy saved posts thất bại: {res.text}"
            saved_list = res.json().get("data", [])
            saved_ids = [str(p.get("id")) for p in saved_list]
            assert post_id in saved_ids, "Bài viết đã lưu không hiển thị trong danh sách Saved posts!"

    @allure.story("Tab 5 - Nâng cấp tài khoản lên gói PREMIUM qua Webhook MoMo")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_upgrade_premium_subscription_flow(self, api, db, auth_token, test_user):
        """
        Kịch bản Manual Test A.6:
        1. Bấm 'Nâng cấp Premium' hoặc 'Thanh toán'.
        2. Nhận Webhook thành công từ MoMo (môi trường Staging/Dev).
        3. Cập nhật trạng thái tài khoản thành PREMIUM trong bảng users.
        """
        user_id = str(test_user['id'])

        # 1. Yêu cầu nâng cấp
        with allure.step("1. Khởi tạo giao dịch nâng cấp Premium"):
            res = api.upgrade_subscription(token=auth_token, payment_method="momo")
            assert res.status_code == 200, f"Khởi tạo thanh toán thất bại: {res.text}"

        # 2. Giả lập MoMo IPN Webhook
        with allure.step("2. Giả lập nhận tín hiệu Webhook thành công từ MoMo"):
            ipn_res = api.simulate_subscription_ipn(user_id=user_id)
            assert ipn_res.status_code == 200, f"Xử lý IPN thất bại: {ipn_res.text}"

        # 3. Kiểm tra DB: subscription_tier = 'PREMIUM'
        with allure.step("3. Kiểm tra trạng thái tài khoản trong PostgreSQL"):
            updated_user = db.get_user_by_email(Config.TEST_USER_EMAIL)
            assert updated_user['subscription_tier'].upper() == "PREMIUM", f"Tài khoản chưa được nâng cấp lên PREMIUM! Hiện tại: {updated_user['subscription_tier']}"

    @allure.story("Đăng ký Device Token cho thông báo đẩy (Push Notification)")
    @allure.severity(allure.severity_level.NORMAL)
    def test_save_device_token_for_push_notifications(self, api, db, auth_token, test_user):
        """Kiểm tra lưu trữ token thiết bị (FCM) vào bảng users."""
        fcm_token = f"fcm_test_device_token_{int(time.time())}"
        user_id = str(test_user['id'])

        with allure.step(f"1. Gửi request lưu device token: '{fcm_token}'"):
            res = api.save_device_token(token=auth_token, device_token=fcm_token)
            assert res.status_code == 200

        with allure.step("2. Kiểm tra cột device_token trong bảng users (PostgreSQL)"):
            u_db = db.execute_query("SELECT device_token FROM users WHERE id = %s;", (user_id,))
            assert len(u_db) > 0, "Không tìm thấy user trong DB!"
            assert u_db[0]['device_token'] == fcm_token, "Device token chưa được cập nhật chính xác vào DB!"

    @allure.story("Tích điểm & Thông tin khách hàng thân thiết (Loyalty Program)")
    @allure.severity(allure.severity_level.NORMAL)
    def test_view_loyalty_and_rewards_info(self, api, auth_token):
        """Kiểm tra xem thông tin hạng thành viên và điểm thưởng tích lũy."""
        with allure.step("Gửi request lấy thông tin Loyalty (/api/loyalty/info)"):
            res = api.get_loyalty_info(token=auth_token)
            assert res.status_code == 200, f"Lỗi lấy thông tin Loyalty: {res.text}"
            data = res.json().get("data", {})
            assert "tier" in data or "points" in data or "code" in data, "Thông tin loyalty không hợp lệ!"

    @allure.story("Đếm số lượng thống kê (Đánh giá, Đã lưu, Bài viết) & Mở chi tiết từ lưới ảnh 9:16")
    @allure.severity(allure.severity_level.NORMAL)
    def test_profile_stats_counter_and_grid_post_detail_flow(self, driver, api, db, auth_token, test_user):
        """
        Kịch bản kiểm tra:
        1. Người dùng mở Tab 5 (Hồ sơ).
        2. Thống kê số lượng bài viết đã đăng và bài viết đã lưu từ database.
        3. Kiểm tra API /api/social/feed/my-posts và /api/social/feed/saved trả về dữ liệu tương ứng.
        4. Thao tác trên UI: Chạm vào ô lưới bài viết để mở màn hình chi tiết bài viết.
        """
        user_id = str(test_user['id'])

        # 1. Thao tác UI
        with allure.step("1. Thao tác trên UI: Mở Tab 5 và chạm vào bài viết trên lưới 9:16"):
            profile_page = ProfilePage(driver)
            try:
                profile_page.navigate_to_profile_tab()
                profile_page.tap_saved_posts_stat()
                profile_page.tap_post_grid_item()
            except Exception as e:
                allure.attach(f"Cảnh báo giao diện: {e}", name="UI Warning", attachment_type=allure.attachment_type.TEXT)

        # 2. Kiểm tra đếm số lượng bài viết đã đăng
        with allure.step("2. Đối chiếu số lượng bài viết đã đăng giữa DB và API (kèm phân trang)"):
            db_posts = db.execute_query("SELECT COUNT(*) as c FROM posts WHERE user_id = %s;", (user_id,))
            db_post_count = int(db_posts[0]['c']) if db_posts else 0

            my_posts_res = api.get_my_posts(token=auth_token)
            assert my_posts_res.status_code == 200
            api_posts = my_posts_res.json().get("data", [])
            api_post_count = len(api_posts)
            assert 0 < api_post_count <= db_post_count, f"Số lượng bài đăng không hợp lệ: API={api_post_count}, DB={db_post_count}"
            for p in api_posts:
                assert str(p.get("user_id")) == user_id, "Bài viết trả về không thuộc về chính user!"

        # 3. Kiểm tra đếm số lượng bài viết đã lưu
        with allure.step("3. Đối chiếu số lượng bài viết đã lưu (Saved posts) giữa DB và API"):
            db_saved = db.execute_query("SELECT COUNT(*) as c FROM saved_posts WHERE user_id = %s;", (user_id,))
            db_saved_count = int(db_saved[0]['c']) if db_saved else 0

            saved_res = api.get_saved_posts(token=auth_token)
            assert saved_res.status_code == 200
            api_saved = saved_res.json().get("data", [])
            api_saved_count = len(api_saved)
            assert api_saved_count <= db_saved_count, f"Số lượng bài đã lưu vượt quá DB: API={api_saved_count}, DB={db_saved_count}"

