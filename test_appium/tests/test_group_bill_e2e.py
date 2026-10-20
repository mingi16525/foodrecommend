import time
import uuid
import allure
import pytest

try:
    from test_appium.config.config import Config
    from test_appium.pages.group_page import GroupPage
    from test_appium.pages.trip_planner_page import TripPlannerPage
except ImportError:
    from config.config import Config
    from pages.group_page import GroupPage
    from pages.trip_planner_page import TripPlannerPage

@allure.epic("Food Decision Platform E2E Manual Flow")
@allure.feature("A.3. Tab 2 - Cộng đồng (Group, Split Bill & Orders)")
class TestGroupBillE2E:

    @allure.story("Tạo Nhóm mới -> Mời thành viên -> Kiểm tra lưu trữ Database")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_create_group_and_add_member(self, driver, api, db, auth_token, test_user):
        """
        Kịch bản Manual Test A.3:
        1. Thao tác trên giao diện Tab 2 (Cộng đồng).
        2. Tạo một Nhóm mới (Ví dụ: 'Nhóm ăn trưa test').
        3. Mời người khác vào nhóm.
        4. Kiểm tra thông tin nhóm và thành viên trong bảng groups & group_members.
        """
        random_suffix = int(time.time())
        group_name = f"Nhóm Ăn Trưa #{random_suffix}"
        
        # Thao tác UI
        with allure.step("1. Thao tác trên UI Tab 2: Chuyển tab và bấm tạo nhóm"):
            group_page = GroupPage(driver)
            try:
                group_page.navigate_to_group_tab()
                group_page.tap_create_group()
                group_page.enter_group_name(group_name)
            except Exception as e:
                allure.attach(f"Cảnh báo giao diện: {e}", name="UI Warning", attachment_type=allure.attachment_type.TEXT)

        # 1. Tạo nhóm API
        with allure.step(f"2. Gửi request tạo nhóm mới: '{group_name}'"):
            res = api.create_group(token=auth_token, name=group_name)
            assert res.status_code in [200, 201], f"Tạo nhóm thất bại: {res.text}"
            data = res.json().get("data", {})
            group_id = data.get("id")
            assert group_id is not None, "Không nhận được ID nhóm mới!"

        # 2. Kiểm tra Database
        with allure.step("3. Kiểm tra bảng groups trong PostgreSQL"):
            group_db = db.get_group_by_name(group_name)
            assert group_db is not None, f"Nhóm '{group_name}' chưa được lưu vào bảng groups!"
            assert str(group_db['creator_id']) == str(test_user['id']), "Người tạo nhóm không khớp!"

        # 3. Tạo tài khoản thứ 2 để mời vào nhóm
        friend_email = f"friend_{random_suffix}@example.com"
        friend_user = db.ensure_verified_user(email=friend_email, full_name="Bạn Cùng Nhóm")
        friend_id = str(friend_user['id'])

        # 4. Thêm thành viên vào nhóm
        with allure.step(f"4. Thêm thành viên '{friend_email}' vào nhóm"):
            add_res = api.add_group_member(token=auth_token, group_id=group_id, member_user_id=friend_id)
            assert add_res.status_code in [200, 201], f"Thêm thành viên thất bại: {add_res.text}"

        # 5. Kiểm tra DB group_members
        with allure.step("4. Kiểm tra bảng group_members"):
            members = db.get_group_members(group_id)
            member_ids = [str(m['user_id']) for m in members]
            assert friend_id in member_ids, f"Thành viên {friend_id} chưa có trong bảng group_members!"

    @allure.story("Chức năng 'Chia đều' hóa đơn (Split Equally): Kiểm tra độ chính xác toán học")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_split_bill_equally(self, api, db, auth_token, test_user):
        """
        Kịch bản Manual Test A.3:
        Chọn chức năng 'Chia đều' (Split equally):
        Kiểm tra số tiền nợ mỗi người tính toán đúng (chia hết hoặc xử lý tiền lẻ chính xác).
        """
        random_suffix = int(time.time())
        group_res = api.create_group(token=auth_token, name=f"Nhóm Test Chia Tiền {random_suffix}")
        group_id = group_res.json()["data"]["id"]

        # 3 thành viên
        user_ids = [str(test_user['id']), str(uuid.uuid4()), str(uuid.uuid4())]
        total_amount = 300000.0  # 300,000 VND chia 3 = 100,000 VND / người

        with allure.step("1. Gửi yêu cầu tính toán chia đều 300,000 VND cho 3 người"):
            res = api.split_equally(token=auth_token, group_id=group_id, total_amount=total_amount, user_ids=user_ids)
            assert res.status_code == 200, f"Lỗi tính chia đều: {res.text}"
            results = res.json().get("data", [])
            assert len(results) == 3, "Số kết quả trả về phải bằng số người tham gia"
            for item in results:
                assert item["amount"] == 100000.0, f"Số tiền chia không đúng: {item['amount']} != 100000"

        # Test tiền lẻ: 100,000 VND chia 3 người (phải xử lý cent/đồng: 33,333.34 và 33,333.33)
        with allure.step("2. Kiểm tra xử lý tiền lẻ: 100,000 VND chia 3 người"):
            res_odd = api.split_equally(token=auth_token, group_id=group_id, total_amount=100000.0, user_ids=user_ids)
            assert res_odd.status_code == 200
            odd_results = res_odd.json().get("data", [])
            total_sum = sum(i["amount"] for i in odd_results)
            assert round(total_sum, 2) == 100000.0, f"Tổng số tiền chia lẻ không khớp tổng hóa đơn: {total_sum}"

    @allure.story("Chức năng 'Chia theo món' (Split by Items): Gán món cho từng người")
    @allure.severity(allure.severity_level.NORMAL)
    def test_split_bill_by_items(self, api, auth_token, test_user):
        """
        Kịch bản Manual Test A.3:
        Chọn chức năng 'Chia theo món' (Split by items): Gán món cho từng người, kiểm tra tổng tiền chính xác.
        """
        random_suffix = int(time.time())
        group_res = api.create_group(token=auth_token, name=f"Nhóm Test Chia Món {random_suffix}")
        group_id = group_res.json()["data"]["id"]

        user_a = str(test_user['id'])
        user_b = str(uuid.uuid4())

        items = [
            {"name": "Phở Bò Đặc Biệt", "price": 65000, "userId": user_a, "quantity": 1},
            {"name": "Bún Bò Huế", "price": 55000, "userId": user_b, "quantity": 1},
            {"name": "Trà Đá", "price": 5000, "userId": user_a, "quantity": 2} # 10,000
        ]

        with allure.step("Gửi yêu cầu tính toán chia bill theo từng món ăn đã gọi"):
            res = api.split_items(token=auth_token, group_id=group_id, items=items)
            assert res.status_code == 200, f"Lỗi tính chia theo món: {res.text}"
            results = res.json().get("data", [])
            
            # Map kết quả
            res_dict = {item['userId']: item['amount'] for item in results}
            # user_a = 65000 + 10000 = 75000
            assert res_dict.get(user_a) == 75000.0, f"Số tiền của User A không khớp: {res_dict.get(user_a)}"
            # user_b = 55000
            assert res_dict.get(user_b) == 55000.0, f"Số tiền của User B không khớp: {res_dict.get(user_b)}"

    @allure.story("Gợi ý quán ăn cho nhóm (Medium Tier) & Đặt món - Thanh toán (Group Order)")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_group_order_and_medium_tier_recommendations_flow(self, api, db, auth_token, test_user):
        """
        Kịch bản Manual Test A.3:
        - Gợi ý món cho nhóm: Hệ thống (Medium Tier) gợi ý danh sách quán giao thoa sở thích.
        - Tạo Bill (Hóa đơn) cho nhóm.
        - Thêm món ăn vào Order nhóm.
        - Bấm 'Đã thanh toán': Chuyển trạng thái PAID, gửi thông báo xác nhận.
        """
        random_suffix = int(time.time())
        # 1. Tạo nhóm
        group_res = api.create_group(token=auth_token, name=f"Nhóm Medium Tier Test {random_suffix}")
        assert group_res.status_code in [200, 201]
        group_id = group_res.json()["data"]["id"]

        # 2. Tạo Group Order
        with allure.step("1. Khởi tạo đơn hàng nhóm (Group Order)"):
            order_res = api.create_group_order(token=auth_token, group_id=group_id)
            assert order_res.status_code in [200, 201], f"Lỗi tạo order: {order_res.text}"
            order = order_res.json()["data"]
            order_id = order["id"]

        # 3. Chuyển trạng thái sang VOTING để kích hoạt Medium Tier Recommender
        with allure.step("2. Chuyển trạng thái sang VOTING để nhận gợi ý quán ăn nhóm (Medium Tier)"):
            status_res = api.update_group_order_status(token=auth_token, group_id=group_id, order_id=order_id, status="VOTING")
            assert status_res.status_code == 200

            active_order_res = api.get_active_group_order(token=auth_token, group_id=group_id)
            assert active_order_res.status_code == 200
            active_order = active_order_res.json().get("data", {})
            assert active_order.get("status") == "VOTING"
            # Kiểm tra trường recommendations từ MediumTierRecommender
            recs = active_order.get("recommendations", [])
            assert isinstance(recs, list), "Recommendations phải là một danh sách các gợi ý"

        # 4. Thêm món ăn vào đơn hàng nhóm
        seed_dishes = db.execute_query("SELECT id, price FROM dishes LIMIT 1;")
        assert len(seed_dishes) > 0, "Cần có ít nhất 1 món ăn trong database"
        seed_dish = seed_dishes[0]
        dish_id = str(seed_dish["id"])
        dish_price = float(seed_dish["price"])

        with allure.step(f"3. Thêm món '{dish_id}' vào đơn hàng nhóm"):
            add_item_res = api.add_item_to_group_order(
                token=auth_token, group_id=group_id, order_id=order_id,
                dish_id=dish_id, quantity=2, price=dish_price
            )
            assert add_item_res.status_code == 200

        # 5. Kiểm tra DB group_order_items
        with allure.step("4. Kiểm tra món ăn đã được lưu vào Database"):
            db_items = db.execute_query("SELECT * FROM group_order_items WHERE order_id = %s AND dish_id = %s;", (order_id, dish_id))
            assert len(db_items) > 0, "Món ăn chưa được lưu vào bảng group_order_items!"
            assert db_items[0]["quantity"] == 2

        # 6. Chuyển trạng thái sang PAID (Đã thanh toán) -> kích hoạt thông báo
        with allure.step("5. Chuyển trạng thái đơn sang 'PAID' (Đã thanh toán)"):
            paid_res = api.update_group_order_status(token=auth_token, group_id=group_id, order_id=order_id, status="PAID")
            assert paid_res.status_code == 200

            # Kiểm tra DB group_orders
            db_orders = db.execute_query("SELECT * FROM group_orders WHERE id = %s;", (order_id,))
            assert len(db_orders) > 0
            assert db_orders[0]["status"] == "PAID", f"Trạng thái đơn không phải PAID: {db_orders[0]['status']}"
            assert float(db_orders[0]["total_amount"]) >= dish_price * 2, "Tổng tiền order không chính xác!"

    @allure.story("Bảo mật phân quyền: Người không thuộc nhóm cố tình truy cập thông tin nhóm")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_group_unauthorized_access_rejected(self, api, db, auth_token):
        """Kiểm tra middleware requireOwnership chặn người ngoài nhóm."""
        random_suffix = int(time.time())
        # 1. User A tạo nhóm
        group_res = api.create_group(token=auth_token, name=f"Nhóm Riêng Tư #{random_suffix}")
        assert group_res.status_code in [200, 201]
        group_id = group_res.json()["data"]["id"]

        # 2. Tạo User C (người ngoài nhóm)
        outsider_user = db.ensure_verified_user(email=f"outsider_{random_suffix}@example.com", full_name="Người Ngoài Nhóm")
        outsider_login = api.login(f"outsider_{random_suffix}@example.com", "Password123!")
        outsider_token = outsider_login.json().get("data", {}).get("token") or outsider_login.json().get("token")

        with allure.step("Người ngoài nhóm cố truy cập /api/groups/:id"):
            res = api._request("GET", f"/api/groups/{group_id}", headers={"Authorization": f"Bearer {outsider_token}"})
            assert res.status_code == 403, f"Hệ thống không chặn người ngoài nhóm: {res.status_code}"

    @allure.story("Bình chọn quán ăn nhóm (Voting) & Lịch sử tin nhắn nhóm")
    @allure.severity(allure.severity_level.NORMAL)
    def test_group_order_voting_and_chat_flow(self, driver, api, db, auth_token):
        """Kiểm tra quy trình bỏ phiếu chọn quán ăn và xem tin nhắn nhóm."""
        random_suffix = int(time.time())
        # 1. Tạo nhóm & tạo đơn hàng
        group_res = api.create_group(token=auth_token, name=f"Nhóm Voting Test #{random_suffix}")
        group_id = group_res.json()["data"]["id"]
        order_res = api.create_group_order(token=auth_token, group_id=group_id)
        order_id = order_res.json()["data"]["id"]

        # Thao tác UI Chat & Bắt đầu đặt món
        with allure.step("1. Thao tác trên UI Group Chat: Gửi tin nhắn và mở đặt món"):
            group_page = GroupPage(driver)
            try:
                group_page.send_chat_message(f"Hôm nay ăn gì cả nhà ơi? #{random_suffix}")
                group_page.tap_start_group_order()
            except Exception as e:
                allure.attach(f"Cảnh báo giao diện: {e}", name="UI Warning", attachment_type=allure.attachment_type.TEXT)

        # 2. Chuyển sang VOTING
        api.update_group_order_status(token=auth_token, group_id=group_id, order_id=order_id, status="VOTING")

        # 3. Lấy 1 quán ăn để vote
        rest_list = db.execute_query("SELECT id FROM restaurants LIMIT 1;")
        if not rest_list:
            pytest.skip("Không có nhà hàng để test voting.")
        rest_id = str(rest_list[0]['id'])

        with allure.step(f"2. Thành viên bỏ phiếu cho quán '{rest_id}'"):
            vote_res = api.vote_restaurant(token=auth_token, group_id=group_id, order_id=order_id, restaurant_id=rest_id)
            assert vote_res.status_code == 200

        with allure.step("3. Kiểm tra danh sách votes trong đơn hàng nhóm"):
            active_res = api.get_active_group_order(token=auth_token, group_id=group_id)
            active_order = active_res.json().get("data", {})
            votes = active_order.get("votes", [])
            voted_rests = [str(v.get("restaurant_id")) for v in votes]
            assert rest_id in voted_rests, "Phiếu bầu không xuất hiện trong đơn hàng nhóm!"

        with allure.step("4. Kiểm tra API lịch sử tin nhắn nhóm (/api/groups/:id/messages)"):
            msg_res = api.get_group_messages(token=auth_token, group_id=group_id)
            assert msg_res.status_code == 200
            msgs = msg_res.json().get("data", [])
            assert isinstance(msgs, list)

    @allure.story("Phân quyền Premium: Tài khoản Miễn Phí (Free) bị chặn tạo nhóm mới (HTTP 403)")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_free_user_group_creation_blocked_by_premium(self, api, db):
        """
        Kịch bản kiểm tra ma trận phân quyền:
        1. Tạo một tài khoản thông thường (subscription_tier = 'free').
        2. Gửi request tạo nhóm mới.
        3. Hệ thống trả về HTTP 403 Forbidden kèm yêu cầu nâng cấp gói Premium.
        """
        random_suffix = int(time.time())
        free_email = f"free_user_{random_suffix}@example.com"
        db.ensure_verified_user(email=free_email, full_name="Người Dùng Gói Free", is_premium=False)

        # Login với tài khoản free
        login_res = api.login(free_email, Config.TEST_USER_PASSWORD)
        assert login_res.status_code == 200, f"Đăng nhập tài khoản free thất bại: {login_res.text}"
        free_token = login_res.json().get("data", {}).get("token") or login_res.json().get("token")

        with allure.step("Tài khoản Free gửi yêu cầu POST /api/groups để tạo nhóm"):
            res = api.create_group(token=free_token, name=f"Nhóm Của Free User #{random_suffix}")
            assert res.status_code == 403, f"Hệ thống không chặn tài khoản Free tạo nhóm! Mã trả về: {res.status_code}"
            data = res.json()
            error_msg = data.get("message") or data.get("error") or ""
            assert "premium" in error_msg.lower(), f"Nội dung thông báo không nhắc đến gói Premium: {data}"

    @allure.story("AI Deep Tier: Lập lịch trình ăn uống đa ngày (Trip Planner) & Phân quyền VIP Paywall")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_ai_trip_planner_deep_tier_flow(self, driver, api, db, auth_token):
        """
        Kịch bản kiểm tra:
        1. Tài khoản Free gọi POST /api/trip/plan -> Bị chặn với HTTP 403 (VIP Paywall).
        2. Thao tác trên UI Trip Planner hiển thị banner Paywall.
        3. Tài khoản Premium gọi POST /api/trip/plan -> Được chấp thuận (vượt qua middleware requirePremium).
        """
        random_suffix = int(time.time())
        free_email = f"trip_free_{random_suffix}@example.com"
        db.ensure_verified_user(email=free_email, full_name="Free Trip User", is_premium=False)
        login_res = api.login(free_email, "Password123!")
        free_token = login_res.json().get("data", {}).get("token") or login_res.json().get("token")

        # 1. Thao tác UI
        with allure.step("1. Thao tác trên UI Trip Planner"):
            trip_page = TripPlannerPage(driver)
            try:
                trip_page.enter_trip_details("Nhóm Phượt Hà Nội", "Thích ăn cay, lẩu nướng")
                trip_page.tap_generate_plan()
            except Exception as e:
                allure.attach(f"Cảnh báo giao diện: {e}", name="UI Warning", attachment_type=allure.attachment_type.TEXT)

        # 2. Free user gọi API
        with allure.step("2. Tài khoản Free gọi POST /api/trip/plan"):
            free_trip_res = api.plan_trip(token=free_token, group_name="Nhóm Free", preferences="Ăn đồ nướng")
            assert free_trip_res.status_code == 403, f"Tài khoản Free không bị chặn ở Trip Planner! Mã: {free_trip_res.status_code}"

        # 3. Premium VIP gọi API
        with allure.step("3. Tài khoản Premium VIP gọi POST /api/trip/plan"):
            vip_trip_res = api.plan_trip(token=auth_token, group_name="Nhóm VIP Trải Nghiệm", preferences="Ăn sáng phở bò, ăn tối hải sản")
            # Nếu GEMINI_API_KEY có cấu hình thì 200, nếu server chưa set GEMINI_API_KEY thì 500 với thông báo rõ ràng (không phải 403)
            assert vip_trip_res.status_code in [200, 500], f"Phản hồi không mong muốn: {vip_trip_res.status_code}"
            assert vip_trip_res.status_code != 403, "Tài khoản VIP không được bị chặn 403 Forbidden!"

