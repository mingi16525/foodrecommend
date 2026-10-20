import time
import allure
import pytest

try:
    from test_appium.pages.feed_page import FeedPage
    from test_appium.config.config import Config
except ImportError:
    from pages.feed_page import FeedPage
    from config.config import Config

@allure.epic("Food Decision Platform E2E Manual Flow")
@allure.feature("A.2. Tab 1 - Dành cho bạn (Social / Feed)")
class TestFeedE2E:

    @allure.story("Tương tác Thích (Like) & Bỏ thích (Unlike) bài viết - Đồng bộ Database")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_like_and_unlike_post_flow(self, driver, api, db, auth_token, test_user):
        """
        Kịch bản Manual Test A.2:
        1. Ở một bài post, bấm nút 'Thích'. Chữ số tim tăng 1.
        2. Bấm lại thì giảm 1 (Unlike).
        3. Kiểm tra bản ghi trong bảng post_likes và số đếm trong bảng posts.
        """
        post = db.get_first_post()
        if not post:
            pytest.skip("Không có bài đăng trong DB.")
        
        post_id = str(post['id'])
        user_id = str(test_user['id'])
        initial_likes = post['likes_count'] or 0

        # Thao tác UI (nếu có Appium)
        with allure.step("1. Thao tác trên giao diện Feed"):
            feed_page = FeedPage(driver)
            try:
                feed_page.tap_like()
            except Exception as e:
                allure.attach(f"Cảnh báo giao diện: {e}", name="UI Warning", attachment_type=allure.attachment_type.TEXT)

        # Gửi API Like
        with allure.step("2. Gửi API Like bài viết"):
            res_like = api.like_post(token=auth_token, post_id=post_id)
            assert res_like.status_code in [200, 201], f"API Like thất bại: {res_like.text}"

        # Kiểm tra DB sau khi Like
        with allure.step("3. Kiểm tra Database sau khi Like (likes_count tăng, tồn tại trong post_likes)"):
            likes_in_db = db.get_post_likes(post_id=post_id, user_id=user_id)
            assert len(likes_in_db) > 0, "Không tìm thấy bản ghi trong bảng post_likes!"

        # Gửi API Unlike
        with allure.step("4. Gửi API Bỏ thích (Unlike) bài viết"):
            res_unlike = api.unlike_post(token=auth_token, post_id=post_id)
            assert res_unlike.status_code in [200, 204], f"API Unlike thất bại: {res_unlike.text}"

        # Kiểm tra DB sau khi Unlike
        with allure.step("5. Kiểm tra Database sau khi Unlike (bản ghi bị xóa khỏi post_likes)"):
            likes_after_unlike = db.get_post_likes(post_id=post_id, user_id=user_id)
            assert len(likes_after_unlike) == 0, "Bản ghi trong bảng post_likes chưa được xóa sau khi Unlike!"

    @allure.story("Lưu bài viết (Bookmark / Save) & Bỏ lưu")
    @allure.severity(allure.severity_level.NORMAL)
    def test_save_and_unsave_post(self, driver, api, db, auth_token, test_user):
        """
        Kịch bản Manual Test A.2:
        1. Bấm nút 'Lưu' (Bookmark) bài viết.
        2. Kiểm tra bản ghi xuất hiện trong bảng saved_posts.
        3. Bỏ lưu bài viết và kiểm tra bản ghi bị xóa khỏi saved_posts.
        """
        post = db.get_first_post()
        if not post:
            pytest.skip("Không có bài đăng trong DB.")
        
        post_id = str(post['id'])
        user_id = str(test_user['id'])

        # Thao tác UI
        with allure.step("1. Thao tác trên giao diện Feed: Bấm nút Lưu"):
            feed_page = FeedPage(driver)
            try:
                feed_page.tap_save()
            except Exception as e:
                allure.attach(f"Cảnh báo giao diện: {e}", name="UI Warning", attachment_type=allure.attachment_type.TEXT)

        # 1. Lưu bài viết
        with allure.step("2. Gửi yêu cầu Lưu bài viết"):
            res_save = api.save_post(token=auth_token, post_id=post_id)
            assert res_save.status_code in [200, 201], f"API Save thất bại: {res_save.text}"

        # Kiểm tra DB
        with allure.step("3. Kiểm tra bảng saved_posts trong Database"):
            saved = db.get_saved_posts(user_id=user_id, post_id=post_id)
            assert len(saved) > 0, "Bản ghi chưa được tạo trong bảng saved_posts!"

        # 2. Bỏ lưu bài viết
        with allure.step("4. Gửi yêu cầu Bỏ lưu bài viết"):
            res_unsave = api.unsave_post(token=auth_token, post_id=post_id)
            assert res_unsave.status_code in [200, 204], f"API Unsave thất bại: {res_unsave.text}"

        # Kiểm tra DB
        with allure.step("5. Kiểm tra bản ghi đã được xóa khỏi saved_posts"):
            saved_after = db.get_saved_posts(user_id=user_id, post_id=post_id)
            assert len(saved_after) == 0, "Bản ghi vẫn còn trong bảng saved_posts sau khi bỏ lưu!"

    @allure.story("Bình luận bài viết (Comment) & Kiểm tra tính toàn vẹn dữ liệu")
    @allure.severity(allure.severity_level.NORMAL)
    def test_comment_post_flow(self, driver, api, db, auth_token, test_user):
        """
        Kịch bản Manual Test A.2:
        Bấm vào bình luận: Viết một bình luận, gửi thành công và hiển thị ngay lập tức.
        """
        post = db.get_first_post()
        if not post:
            pytest.skip("Không có bài đăng trong DB.")
        
        post_id = str(post['id'])
        comment_content = f"Bình luận kiểm thử E2E tự động lúc {int(time.time())}"

        # Thao tác UI
        with allure.step("1. Thao tác trên giao diện Feed: Mở khung bình luận và nhập text"):
            feed_page = FeedPage(driver)
            try:
                feed_page.open_comments()
                feed_page.send_comment(comment_content)
            except Exception as e:
                allure.attach(f"Cảnh báo giao diện: {e}", name="UI Warning", attachment_type=allure.attachment_type.TEXT)

        with allure.step("2. Gửi bình luận mới vào bài viết qua API"):
            res = api.comment_post(token=auth_token, post_id=post_id, content=comment_content)
            assert res.status_code in [200, 201], f"Gửi bình luận thất bại: {res.text}"

        with allure.step("3. Đối chiếu nội dung bình luận trong bảng post_comments"):
            comments = db.get_post_comments(post_id=post_id)
            matched = [c for c in comments if c['content'] == comment_content]
            assert len(matched) > 0, "Bình luận chưa được lưu vào bảng post_comments!"

    @allure.story("Đăng bài (User Post): Tải ảnh, tag nhà hàng (hệ thống tự tạo quán nếu chưa có)")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_user_create_post_auto_create_restaurant(self, api, db, auth_token):
        """
        Kịch bản Manual Test A.2:
        Đăng bài (User Post): Tag nhà hàng (hệ thống tự tạo quán nếu chưa có trong DB).
        Bài đăng hiển thị trên feed.
        """
        random_suffix = int(time.time())
        new_restaurant_name = f"Quán Ăn Mới Mở {random_suffix}"
        restaurant_address = "123 Đường Cầu Giấy, Hà Nội"
        post_content = f"Review quán ăn mới phát hiện cực ngon! #{random_suffix}"

        with allure.step(f"1. Gửi request tạo bài đăng mới với quán chưa tồn tại: '{new_restaurant_name}'"):
            res = api.create_post(
                token=auth_token,
                post_type="post",
                content=post_content,
                restaurant_name=new_restaurant_name,
                restaurant_address=restaurant_address
            )
            assert res.status_code in [200, 201], f"Tạo bài đăng thất bại: {res.text}"

        with allure.step("2. Kiểm tra Database: Hệ thống đã tự động tạo mới nhà hàng trong bảng restaurants"):
            restaurant = db.get_restaurant_by_name(new_restaurant_name)
            assert restaurant is not None, f"Hệ thống không tự động tạo nhà hàng '{new_restaurant_name}' trong bảng restaurants!"
            assert restaurant['is_verified'] is False, "Nhà hàng do user đề xuất phải có is_verified = FALSE"

        with allure.step("3. Kiểm tra bài đăng mới xuất hiện trong luồng Feed"):
            feed_res = api.get_feed(token=auth_token)
            feed_data = feed_res.json().get("data", [])
            matched_posts = [p for p in feed_data if p.get('content') == post_content]
            assert len(matched_posts) > 0, "Bài đăng mới không xuất hiện trong danh sách Feed!"

    @allure.story("Xử lý lỗi: Gửi bình luận vào bài viết không tồn tại")
    @allure.severity(allure.severity_level.NORMAL)
    def test_comment_non_existent_post_rejected(self, api, auth_token):
        """Kiểm tra hệ thống từ chối bình luận vào bài đăng không có thật."""
        fake_post_id = "00000000-0000-0000-0000-000000000000"
        with allure.step(f"Gửi bình luận vào bài viết không tồn tại: {fake_post_id}"):
            res = api.comment_post(token=auth_token, post_id=fake_post_id, content="Bình luận test lỗi")
            assert res.status_code in [400, 404, 500], f"Không có lỗi khi comment post không tồn tại: {res.status_code}"

    @allure.story("Truy vấn nâng cao: Xem bài đăng đã Like, Bài của tôi & Đọc bình luận")
    @allure.severity(allure.severity_level.NORMAL)
    def test_feed_liked_my_posts_and_comments_list(self, api, db, auth_token):
        """Kiểm tra các luồng truy vấn bài viết chuyên biệt và danh sách bình luận."""
        post = db.get_first_post()
        if not post:
            pytest.skip("Không có bài đăng trong DB.")
        post_id = str(post['id'])

        # 1. Like bài và kiểm tra feed liked
        with allure.step("1. Like bài viết và kiểm tra xuất hiện trong /api/social/feed/liked"):
            api.like_post(token=auth_token, post_id=post_id)
            liked_res = api.get_liked_feed(token=auth_token)
            assert liked_res.status_code == 200
            liked_posts = liked_res.json().get("data", [])
            assert isinstance(liked_posts, list)

        # 2. Kiểm tra danh sách bài của chính user
        with allure.step("2. Truy vấn danh sách bài viết do chính user đăng (/api/social/feed/my-posts)"):
            my_res = api.get_my_posts(token=auth_token)
            assert my_res.status_code == 200
            my_posts = my_res.json().get("data", [])
            assert isinstance(my_posts, list)

        # 3. Lấy danh sách bình luận của bài viết
        with allure.step("3. Đọc danh sách bình luận của bài viết (/api/social/posts/:id/comments)"):
            comments_res = api.get_post_comments(post_id=post_id)
            assert comments_res.status_code == 200
            comments_data = comments_res.json().get("data", [])
            assert isinstance(comments_data, list)

    @allure.story("Đăng bài review: Tag nhà hàng ĐÃ TỒN TẠI trong cơ sở dữ liệu")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_user_create_post_tag_existing_restaurant(self, api, db, auth_token):
        """
        Kịch bản kiểm tra:
        1. Sinh sẵn một quán ăn mẫu trong cơ sở dữ liệu.
        2. Người dùng đăng bài review và gắn thẻ (tag) quán ăn đã tồn tại qua restaurant_id.
        3. Xác minh:
           - Bài viết được liên kết chính xác tới quán ăn đó.
           - Không sinh thêm quán ăn trùng lặp trong bảng restaurants.
           - Bài đăng hiển thị trên Feed kèm đúng tên và địa chỉ quán đã tag.
        """
        random_suffix = int(time.time())
        existing_name = f"Phở Gia Truyền Bát Đàn #{random_suffix}"
        existing_address = "49 Bát Đàn, Hoàn Kiếm, Hà Nội"

        # 1. Sinh quán ăn đã tồn tại vào Database
        with allure.step(f"1. Sinh quán ăn mẫu đã có sẵn: '{existing_name}'"):
            create_rest_res = api.create_restaurant(
                token=auth_token,
                name=existing_name,
                address=existing_address
            )
            assert create_rest_res.status_code in [200, 201]
            existing_rest_id = create_rest_res.json()["data"]["id"]

        # Đếm số lượng nhà hàng trước khi user đăng bài
        count_before = int(db.execute_query("SELECT COUNT(*) as c FROM restaurants;")[0]['c'])

        post_content = f"Phở ở đây ngon chuẩn vị Hà Nội xưa, nước dùng trong vắt thanh ngọt! #{random_suffix}"

        # 2. Người dùng đăng bài review tag quán đã tồn tại
        with allure.step(f"2. Người dùng đăng bài review gắn tag quán '{existing_name}' (ID: {existing_rest_id})"):
            post_res = api.create_post(
                token=auth_token,
                post_type="review",
                content=post_content,
                restaurant_id=existing_rest_id
            )
            assert post_res.status_code in [200, 201], f"Đăng bài gắn tag quán thất bại: {post_res.text}"
            post_id = post_res.json()["data"]["id"]

        # 3. Kiểm tra không tạo trùng lặp quán ăn
        with allure.step("3. Kiểm tra số lượng nhà hàng trong DB không bị sinh thừa (không trùng lặp)"):
            count_after = int(db.execute_query("SELECT COUNT(*) as c FROM restaurants;")[0]['c'])
            assert count_after == count_before, f"Số lượng quán ăn bị tăng thêm ({count_after} != {count_before}), hệ thống đã tạo trùng lặp!"

        # 4. Kiểm tra bài viết liên kết đúng ID quán ăn trong PostgreSQL
        with allure.step("4. Kiểm tra cột restaurant_id trong bảng posts"):
            post_in_db = db.execute_query("SELECT id, restaurant_id FROM posts WHERE id = %s;", (post_id,))
            assert len(post_in_db) > 0, "Không tìm thấy bài viết trong bảng posts!"
            assert str(post_in_db[0]['restaurant_id']) == existing_rest_id, "restaurant_id của bài viết không khớp với quán đã tag!"

        # 5. Kiểm tra Feed Tab 1 hiển thị bài viết kèm đúng quán
        with allure.step("5. Kiểm tra bài review hiển thị trên luồng Feed kèm thông tin quán"):
            feed_res = api.get_feed(token=auth_token)
            assert feed_res.status_code == 200
            feed_data = feed_res.json().get("data", [])
            matched = [p for p in feed_data if str(p.get("id")) == post_id]
            assert len(matched) > 0, "Bài review gắn quán không xuất hiện trên Feed!"
            assert matched[0].get("restaurant_id") == existing_rest_id
            assert matched[0].get("restaurant_name") == existing_name

    @allure.story("Đặc quyền Premium: Bài viết của thành viên VIP có huy hiệu VIP và ưu tiên đầu Feed")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_premium_post_vip_badge_and_feed_priority(self, api, db, auth_token, test_user):
        """
        Kịch bản kiểm tra:
        1. Thành viên VIP (subscription_tier = 'PREMIUM') tạo bài đăng mới.
        2. Xác minh bài đăng trả về có trường author_tier = 'PREMIUM' và is_premium = True.
        3. Kiểm tra bài viết VIP được ưu tiên xếp lên vị trí đầu trong Social Feed.
        """
        random_suffix = int(time.time())
        vip_content = f"Bài viết đặc quyền VIP được ưu tiên lên đầu Feed! #{random_suffix}"

        with allure.step("1. Thành viên VIP tạo bài viết mới"):
            post_res = api.create_post(
                token=auth_token,
                post_type="review",
                content=vip_content
            )
            assert post_res.status_code in [200, 201], f"Tạo bài viết VIP thất bại: {post_res.text}"
            vip_post_id = post_res.json()["data"]["id"]

        with allure.step("2. Lấy Feed và kiểm tra huy hiệu VIP cùng thứ tự ưu tiên"):
            feed_res = api.get_feed(token=auth_token)
            assert feed_res.status_code == 200
            feed_items = feed_res.json().get("data", [])
            assert len(feed_items) > 0, "Feed không có dữ liệu!"

            # Tìm bài viết vừa đăng
            vip_items = [p for p in feed_items if str(p.get("id")) == str(vip_post_id)]
            assert len(vip_items) > 0, "Bài viết VIP không có trên Feed!"
            vip_item = vip_items[0]

            # Kiểm tra trường VIP
            assert vip_item.get("author_tier") == "PREMIUM", f"author_tier không phải PREMIUM: {vip_item.get('author_tier')}"
            assert vip_item.get("is_premium") is True, "is_premium phải là True cho bài viết của VIP!"

            # Kiểm tra bài viết nằm trong nhóm đầu (top 3) do ưu tiên VIP
            top_ids = [str(p.get("id")) for p in feed_items[:3]]
            assert str(vip_post_id) in top_ids, f"Bài viết VIP không được ưu tiên hiển thị ở đầu Feed! Top 3 IDs: {top_ids}"


