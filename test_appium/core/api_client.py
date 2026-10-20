import time
import requests
import allure

try:
    from test_appium.config.config import Config
    from test_appium.core.allure_helper import AllureHelper
except ImportError:
    from config.config import Config
    from core.allure_helper import AllureHelper

class ApiClient:
    def __init__(self, base_url: str = None):
        self.base_url = (base_url or Config.API_BASE_URL).rstrip("/")
        self.session = requests.Session()

    def _request(self, method: str, endpoint: str, headers: dict = None, json_data: dict = None, params: dict = None):
        url = f"{self.base_url}{endpoint}"
        req_headers = headers or {}
        
        with allure.step(f"API {method.upper()} {endpoint}"):
            try:
                response = self.session.request(
                    method=method,
                    url=url,
                    headers=req_headers,
                    json=json_data,
                    params=params,
                    timeout=15
                )
                
                try:
                    res_body = response.json()
                except Exception:
                    res_body = response.text

                # Log everything into Allure
                AllureHelper.attach_http_call(
                    method=method,
                    url=url,
                    headers=req_headers,
                    request_body=json_data or params,
                    status_code=response.status_code,
                    response_body=res_body
                )
                return response
            except Exception as e:
                AllureHelper.attach_text(f"API Error: {method.upper()} {endpoint}", str(e))
                raise

    # --- 1. Healthcheck & Auth ---
    def health_check(self):
        with allure.step("API: Kiểm tra Healthcheck Backend"):
            return self._request("GET", "/api/health")

    def register(self, email: str, password: str, full_name: str):
        with allure.step(f"API: Đăng ký tài khoản mới '{email}'"):
            payload = {"email": email, "password": password, "fullName": full_name}
            return self._request("POST", "/api/auth/register", json_data=payload)

    def verify_otp(self, email: str, otp: str):
        with allure.step(f"API: Xác thực OTP cho '{email}' với mã '{otp}'"):
            payload = {"email": email, "otp": otp}
            return self._request("POST", "/api/auth/verify-otp", json_data=payload)

    def login(self, email: str = None, password: str = None):
        email = email or Config.TEST_USER_EMAIL
        password = password or Config.TEST_USER_PASSWORD
        with allure.step(f"API: Đăng nhập user '{email}'"):
            payload = {"email": email, "password": password}
            return self._request("POST", "/api/auth/login", json_data=payload)

    # --- 2. Tab 1: Social Feed ---
    def get_feed(self, token: str = None, guest: bool = False, lat: float = None, lng: float = None):
        headers = {}
        params = {}
        if guest:
            params["guest"] = "true"
        elif token:
            headers["Authorization"] = f"Bearer {token}"
            
        if lat is not None and lng is not None:
            params["lat"] = str(lat)
            params["lng"] = str(lng)

        with allure.step("API: Lấy danh sách Social Feed"):
            return self._request("GET", "/api/social/feed", headers=headers, params=params)

    def like_post(self, token: str, post_id: str):
        headers = {"Authorization": f"Bearer {token}"}
        with allure.step(f"API: Thả tim bài đăng '{post_id}'"):
            return self._request("POST", f"/api/social/posts/{post_id}/like", headers=headers)

    def unlike_post(self, token: str, post_id: str):
        headers = {"Authorization": f"Bearer {token}"}
        with allure.step(f"API: Bỏ thích bài đăng '{post_id}'"):
            return self._request("DELETE", f"/api/social/posts/{post_id}/like", headers=headers)

    def save_post(self, token: str, post_id: str):
        headers = {"Authorization": f"Bearer {token}"}
        with allure.step(f"API: Lưu (Bookmark) bài đăng '{post_id}'"):
            return self._request("POST", f"/api/social/posts/{post_id}/save", headers=headers)

    def unsave_post(self, token: str, post_id: str):
        headers = {"Authorization": f"Bearer {token}"}
        with allure.step(f"API: Bỏ lưu bài đăng '{post_id}'"):
            return self._request("DELETE", f"/api/social/posts/{post_id}/save", headers=headers)

    def get_saved_posts(self, token: str):
        headers = {"Authorization": f"Bearer {token}"}
        with allure.step("API: Lấy danh sách bài đăng đã lưu"):
            return self._request("GET", "/api/social/feed/saved", headers=headers)

    def comment_post(self, token: str, post_id: str, content: str):
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"commentText": content}
        with allure.step(f"API: Gửi bình luận vào bài đăng '{post_id}'"):
            return self._request("POST", f"/api/social/posts/{post_id}/comments", headers=headers, json_data=payload)

    def create_post(self, token: str, post_type: str, content: str, restaurant_name: str = None, restaurant_address: str = None, dish_ids: list = None, restaurant_id: str = None):
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "type": post_type,
            "content": content,
        }
        if restaurant_id:
            payload["restaurantId"] = restaurant_id
        if restaurant_name:
            payload["restaurantName"] = restaurant_name
        if restaurant_address:
            payload["restaurantAddress"] = restaurant_address
        if dish_ids:
            payload["dishIds"] = dish_ids

        with allure.step(f"API: Đăng bài viết mới: '{content[:30]}...'"):
            return self._request("POST", "/api/social/posts", headers=headers, json_data=payload)

    # --- 3. Tab 2: Group & Split Bill ---
    def create_group(self, token: str, name: str):
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"name": name}
        with allure.step(f"API: Tạo nhóm mới '{name}'"):
            return self._request("POST", "/api/groups", headers=headers, json_data=payload)

    def add_group_member(self, token: str, group_id: str, member_user_id: str):
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"userId": member_user_id}
        with allure.step(f"API: Thêm thành viên '{member_user_id}' vào nhóm '{group_id}'"):
            return self._request("POST", f"/api/groups/{group_id}/members", headers=headers, json_data=payload)

    def split_equally(self, token: str, group_id: str, total_amount: float, user_ids: list):
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"totalAmount": total_amount, "userIds": user_ids}
        with allure.step(f"API: Tính chia đều bill {total_amount:,.0f} VND cho {len(user_ids)} người"):
            return self._request("POST", f"/api/groups/{group_id}/split-equally", headers=headers, json_data=payload)

    def split_items(self, token: str, group_id: str, items: list):
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"items": items}
        with allure.step(f"API: Tính chia bill theo món ({len(items)} món)"):
            return self._request("POST", f"/api/groups/{group_id}/split-items", headers=headers, json_data=payload)

    def create_group_order(self, token: str, group_id: str):
        headers = {"Authorization": f"Bearer {token}"}
        with allure.step(f"API: Tạo đơn hàng nhóm (Group Order) cho nhóm '{group_id}'"):
            return self._request("POST", f"/api/groups/{group_id}/orders", headers=headers)

    def get_active_group_order(self, token: str, group_id: str):
        headers = {"Authorization": f"Bearer {token}"}
        with allure.step(f"API: Lấy đơn hàng nhóm đang hoạt động cho nhóm '{group_id}'"):
            return self._request("GET", f"/api/groups/{group_id}/orders/active", headers=headers)

    def update_group_order_status(self, token: str, group_id: str, order_id: str, status: str, restaurant_id: str = None):
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"status": status}
        if restaurant_id:
            payload["restaurantId"] = restaurant_id
        with allure.step(f"API: Cập nhật trạng thái đơn nhóm '{order_id}' thành '{status}'"):
            return self._request("POST", f"/api/groups/{group_id}/orders/{order_id}/status", headers=headers, json_data=payload)

    def add_item_to_group_order(self, token: str, group_id: str, order_id: str, dish_id: str, quantity: int, price: float):
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"dishId": dish_id, "quantity": quantity, "price": price}
        with allure.step(f"API: Thêm món '{dish_id}' vào đơn nhóm '{order_id}'"):
            return self._request("POST", f"/api/groups/{group_id}/orders/{order_id}/items", headers=headers, json_data=payload)

    # --- 4. Tab 3: Recommendation & Swipe ---
    def get_recommendation_feed(self, token: str, lat: float = 21.0319, lng: float = 105.8465):
        headers = {"Authorization": f"Bearer {token}"}
        params = {"lat": lat, "lng": lng}
        with allure.step(f"API: Lấy danh sách món ăn gợi ý (Recommendation Feed) tại ({lat}, {lng})"):
            return self._request("GET", "/api/recommendation", headers=headers, params=params)

    def swipe_dish(self, token: str, dish_id: str, action: str = "like"):
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"dishId": dish_id, "action": action}
        with allure.step(f"API: Quẹt món ăn '{dish_id}' (hành động: {action})"):
            return self._request("POST", "/api/recommendation/swipe", headers=headers, json_data=payload)

    # --- 5. Tab 4 & 5: Profile, Preferences & Subscription ---
    def get_profile(self, token: str):
        headers = {"Authorization": f"Bearer {token}"}
        with allure.step("API: Lấy thông tin cá nhân (Profile)"):
            return self._request("GET", "/api/users/me", headers=headers)

    def update_preferences(self, token: str, preferences: dict):
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"preferences": preferences}
        with allure.step("API: Cập nhật sở thích và dị ứng ăn uống"):
            return self._request("PUT", "/api/users/me/preferences", headers=headers, json_data=payload)

    def upgrade_subscription(self, token: str, payment_method: str = "momo"):
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"paymentMethod": payment_method}
        with allure.step(f"API: Yêu cầu nâng cấp gói Premium qua {payment_method.upper()}"):
            return self._request("POST", "/api/subscription/upgrade", headers=headers, json_data=payload)

    def simulate_subscription_ipn(self, user_id: str):
        with allure.step(f"API: Giả lập Webhook MoMo IPN kích hoạt Premium cho user '{user_id}'"):
            payload = {"orderId": f"premium_{user_id}_{int(time.time())}"}
            return self._request("POST", "/api/subscription/ipn", json_data=payload)

    # --- 6. Business Owner & Admin ---
    def create_restaurant(self, token: str, name: str, address: str, geohash: str = "w4rpn0"):
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"name": name, "address": address, "geohash": geohash}
        with allure.step(f"API: Tạo nhà hàng mới '{name}'"):
            return self._request("POST", "/api/restaurants", headers=headers, json_data=payload)

    def add_dish_to_restaurant(self, token: str, restaurant_id: str, name: str, price: float, description: str = ""):
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"name": name, "price": price, "description": description}
        with allure.step(f"API: Thêm món '{name}' vào nhà hàng '{restaurant_id}'"):
            return self._request("POST", f"/api/restaurants/{restaurant_id}/dishes", headers=headers, json_data=payload)

    def claim_restaurant(self, token: str, restaurant_id: str):
        headers = {"Authorization": f"Bearer {token}"}
        with allure.step(f"API: Gửi yêu cầu Claim quyền sở hữu quán '{restaurant_id}'"):
            return self._request("POST", f"/api/restaurants/{restaurant_id}/claim", headers=headers)

    def admin_approve_claim(self, token: str, restaurant_id: str):
        headers = {"Authorization": f"Bearer {token}"}
        with allure.step(f"API: Admin phê duyệt Claim nhà hàng '{restaurant_id}'"):
            return self._request("PUT", f"/api/admin/restaurants/claim/{restaurant_id}", headers=headers)

    def search_restaurants(self, query: str):
        with allure.step(f"API: Tìm kiếm nhà hàng với từ khóa '{query}'"):
            return self._request("GET", "/api/restaurants/search", params={"q": query})

    def get_restaurant_dishes(self, restaurant_id: str):
        with allure.step(f"API: Lấy thực đơn của nhà hàng '{restaurant_id}'"):
            return self._request("GET", f"/api/restaurants/{restaurant_id}/dishes")

    # --- 7. Group Order Voting & Chat ---
    def vote_restaurant(self, token: str, group_id: str, order_id: str, restaurant_id: str):
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"restaurantId": restaurant_id}
        with allure.step(f"API: Thành viên vote cho nhà hàng '{restaurant_id}' trong đơn '{order_id}'"):
            return self._request("POST", f"/api/groups/{group_id}/orders/{order_id}/vote", headers=headers, json_data=payload)

    def remove_vote(self, token: str, group_id: str, order_id: str, restaurant_id: str):
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"restaurantId": restaurant_id}
        with allure.step(f"API: Thành viên rút vote cho nhà hàng '{restaurant_id}' trong đơn '{order_id}'"):
            return self._request("DELETE", f"/api/groups/{group_id}/orders/{order_id}/vote", headers=headers, json_data=payload)

    def get_group_messages(self, token: str, group_id: str):
        headers = {"Authorization": f"Bearer {token}"}
        with allure.step(f"API: Lấy lịch sử tin nhắn của nhóm '{group_id}'"):
            return self._request("GET", f"/api/groups/{group_id}/messages", headers=headers)

    # --- 8. Feed Variants & Comments ---
    def get_liked_feed(self, token: str):
        headers = {"Authorization": f"Bearer {token}"}
        with allure.step("API: Lấy danh sách bài viết người dùng đã Thích (/api/social/feed/liked)"):
            return self._request("GET", "/api/social/feed/liked", headers=headers)

    def get_my_posts(self, token: str):
        headers = {"Authorization": f"Bearer {token}"}
        with allure.step("API: Lấy danh sách bài viết do chính người dùng đăng (/api/social/feed/my-posts)"):
            return self._request("GET", "/api/social/feed/my-posts", headers=headers)

    def get_post_comments(self, post_id: str):
        with allure.step(f"API: Lấy danh sách bình luận của bài viết '{post_id}'"):
            return self._request("GET", f"/api/social/posts/{post_id}/comments")

    # --- 9. Notifications & Loyalty ---
    def save_device_token(self, token: str, device_token: str):
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"token": device_token}
        with allure.step(f"API: Lưu FCM Device Token '{device_token[:15]}...' cho người dùng"):
            return self._request("POST", "/api/notifications/device-token", headers=headers, json_data=payload)

    def get_loyalty_info(self, token: str):
        headers = {"Authorization": f"Bearer {token}"}
        with allure.step("API: Lấy thông tin điểm thưởng và hạng thành viên (/api/loyalty/info)"):
            return self._request("GET", "/api/loyalty/info", headers=headers)

    # --- 10. AI Trip Planner & Delivery Links ---
    def plan_trip(self, token: str, group_name: str = None, preferences: str = None):
        headers = {"Authorization": f"Bearer {token}"}
        payload = {}
        if group_name:
            payload["groupName"] = group_name
        if preferences:
            payload["preferences"] = preferences
        with allure.step(f"API: Yêu cầu AI Deep Tier Lập lịch trình ăn uống (/api/trip/plan)"):
            return self._request("POST", "/api/trip/plan", headers=headers, json_data=payload)
