import psycopg2
from psycopg2.extras import RealDictCursor
import allure

try:
    from test_appium.config.config import Config
    from test_appium.core.allure_helper import AllureHelper
except ImportError:
    from config.config import Config
    from core.allure_helper import AllureHelper

class DatabaseClient:
    def __init__(self):
        self.conn = None

    def connect(self):
        if not self.conn or self.conn.closed:
            self.conn = psycopg2.connect(
                dbname=Config.DB_NAME,
                user=Config.DB_USER,
                password=Config.DB_PASSWORD,
                host=Config.DB_HOST,
                port=Config.DB_PORT
            )
            self.conn.autocommit = True
        return self.conn

    def close(self):
        if self.conn and not self.conn.closed:
            self.conn.close()

    def execute_query(self, query: str, params=None, fetch: bool = True):
        """
        Executes an arbitrary SQL query and logs the query + results to Allure.
        """
        step_title = f"Database Query: {query.strip().splitlines()[0][:60]}..."
        with allure.step(step_title):
            conn = self.connect()
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, params)
                rows = []
                headers = []
                if fetch and cur.description:
                    headers = [desc[0] for desc in cur.description]
                    records = cur.fetchall()
                    rows = [[rec[col] for col in headers] for rec in records]
                    
                    # Attach to Allure
                    AllureHelper.attach_sql(query, params, rows, headers)
                    return records
                else:
                    AllureHelper.attach_sql(query, params, rows=[[f"{cur.rowcount} rows affected"]], headers=["Status"])
                    return cur.rowcount

    # --- Domain Specific Test Queries ---
    def get_user_by_email(self, email: str):
        with allure.step(f"DB: Tìm kiếm user theo email '{email}'"):
            query = "SELECT id, email, full_name, is_verified, subscription_tier, created_at FROM users WHERE email = %s;"
            records = self.execute_query(query, (email,))
            return records[0] if records else None

    def get_first_post(self):
        with allure.step("DB: Lấy bài đăng mới nhất trong bảng posts"):
            query = "SELECT id, user_id, restaurant_id, dish_id, content, likes_count, comments_count, saves_count FROM posts ORDER BY created_at DESC LIMIT 1;"
            records = self.execute_query(query)
            return records[0] if records else None

    def get_post_likes(self, post_id: str, user_id: str = None):
        with allure.step(f"DB: Kiểm tra lượt thích bài đăng '{post_id}'"):
            if user_id:
                query = "SELECT * FROM post_likes WHERE post_id = %s AND user_id = %s;"
                return self.execute_query(query, (post_id, user_id))
            else:
                query = "SELECT * FROM post_likes WHERE post_id = %s;"
                return self.execute_query(query, (post_id,))

    def get_saved_posts(self, user_id: str, post_id: str = None):
        with allure.step(f"DB: Kiểm tra bài viết đã lưu của user '{user_id}'"):
            if post_id:
                query = "SELECT * FROM saved_posts WHERE user_id = %s AND post_id = %s;"
                return self.execute_query(query, (user_id, post_id))
            else:
                query = "SELECT * FROM saved_posts WHERE user_id = %s;"
                return self.execute_query(query, (user_id,))

    def get_post_comments(self, post_id: str):
        with allure.step(f"DB: Lấy danh sách bình luận của bài đăng '{post_id}'"):
            query = "SELECT id, post_id, user_id, content, created_at FROM post_comments WHERE post_id = %s ORDER BY created_at DESC;"
            return self.execute_query(query, (post_id,))

    def get_user_swipes(self, user_id: str):
        with allure.step(f"DB: Lấy lịch sử quẹt Tinder/Đề xuất của user '{user_id}'"):
            query = "SELECT id, user_id, dish_id, action, created_at FROM user_swipes WHERE user_id = %s ORDER BY created_at DESC;"
            return self.execute_query(query, (user_id,))

    def get_user_preferences(self, user_id: str):
        with allure.step(f"DB: Lấy thiết lập sở thích ăn uống của user '{user_id}'"):
            query = "SELECT * FROM user_preferences WHERE user_id = %s;"
            records = self.execute_query(query, (user_id,))
            return records[0] if records else None

    def get_group_by_name(self, name: str):
        with allure.step(f"DB: Lấy thông tin nhóm theo tên '{name}'"):
            query = "SELECT * FROM groups WHERE name = %s ORDER BY created_at DESC LIMIT 1;"
            records = self.execute_query(query, (name,))
            return records[0] if records else None

    def get_group_members(self, group_id: str):
        with allure.step(f"DB: Lấy danh sách thành viên của nhóm '{group_id}'"):
            query = "SELECT * FROM group_members WHERE group_id = %s;"
            return self.execute_query(query, (group_id,))

    def get_restaurant_by_name(self, name: str):
        with allure.step(f"DB: Lấy thông tin nhà hàng theo tên '{name}'"):
            query = "SELECT * FROM restaurants WHERE name = %s ORDER BY is_verified DESC LIMIT 1;"
            records = self.execute_query(query, (name,))
            return records[0] if records else None

    def get_dishes_by_restaurant(self, restaurant_id: str):
        with allure.step(f"DB: Lấy thực đơn của nhà hàng '{restaurant_id}'"):
            query = "SELECT * FROM dishes WHERE restaurant_id = %s;"
            return self.execute_query(query, (restaurant_id,))

    def ensure_verified_user(self, email: str, password_hash: str = None, full_name: str = "Test Automation User", is_premium: bool = True):
        with allure.step(f"DB: Đảm bảo user test '{email}' tồn tại, is_verified = TRUE"):
            default_hash = "$2b$10$5ZFECujxfquVqM4sRIAkMuMRUpYreEGhcsSJXATfGMf3XxyvF5CXG"
            pwd = password_hash or default_hash
            tier = "PREMIUM" if is_premium else "free"
            query = """
            INSERT INTO users (email, password_hash, full_name, is_verified, subscription_tier)
            VALUES (%s, %s, %s, TRUE, %s)
            ON CONFLICT (email) 
            DO UPDATE SET is_verified = TRUE, full_name = EXCLUDED.full_name, subscription_tier = EXCLUDED.subscription_tier
            RETURNING id, email, is_verified, subscription_tier;
            """
            res = self.execute_query(query, (email, pwd, full_name, tier))
            return res[0] if res else None

    def cleanup_test_user(self, email: str):
        with allure.step(f"DB: Dọn dẹp dữ liệu user test '{email}'"):
            query = "DELETE FROM users WHERE email = %s;"
            return self.execute_query(query, (email,), fetch=False)
