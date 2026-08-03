-- seed.sql: Data mẫu cho FoodRecommend DB

-- Xóa dữ liệu cũ (tuân thủ foreign keys)
TRUNCATE TABLE groups, posts, dishes, restaurants, user_preferences, users CASCADE;

-- Insert Users
INSERT INTO users (id, email, full_name, is_reviewer) VALUES
('11111111-1111-1111-1111-111111111111', 'user1@example.com', 'Alice Nguyen', false),
('22222222-2222-2222-2222-222222222222', 'user2@example.com', 'Bob Tran', true),
('33333333-3333-3333-3333-333333333333', 'user3@example.com', 'Charlie Le', false);

-- Insert User Preferences
INSERT INTO user_preferences (user_id, favorite_flavors, allergies) VALUES
('11111111-1111-1111-1111-111111111111', '["spicy", "sweet"]', '["peanuts"]'),
('22222222-2222-2222-2222-222222222222', '["savory"]', '[]');

-- Insert Restaurants
INSERT INTO restaurants (id, name, address, delivery_links) VALUES
('aaaaa111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Phở Bát Đàn', '49 Bát Đàn, Hà Nội', '{"shopeefood": "link1", "grabfood": "link2"}'),
('bbbbb222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bún Chả Hương Liên', '24 Lê Văn Hưu, Hà Nội', '{"grabfood": "link3"}');

-- Insert Dishes
INSERT INTO dishes (restaurant_id, name, price, ingredients) VALUES
('aaaaa111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Phở Bò Tái Nạm', 60000, '["beef", "noodles", "broth"]'),
('aaaaa111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Phở Gà', 50000, '["chicken", "noodles", "broth"]'),
('bbbbb222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bún Chả Obama', 80000, '["pork", "noodles", "fish sauce"]');

-- Insert Posts
INSERT INTO posts (user_id, post_type, content, video_url) VALUES
('22222222-2222-2222-2222-222222222222', 'review', 'Quán phở Bát Đàn ngon tuyệt vời!', 'https://example.com/video1.mp4'),
('11111111-1111-1111-1111-111111111111', 'checkin', 'Lần đầu thử bún chả Hương Liên', NULL);

-- Insert Groups
INSERT INTO groups (id, name, creator_id) VALUES
('99999999-9999-9999-9999-999999999999', 'Hội Ăn Đêm', '11111111-1111-1111-1111-111111111111');
