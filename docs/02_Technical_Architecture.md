# 2. Kiến Trúc Kỹ Thuật (Technical Architecture)

## Sơ Đồ Kiến Trúc (Architecture Diagram)

```mermaid
graph TD
    App[Mobile App - Flutter] --> API(API Gateway / Node.js Express)
    
    API --> User[User Service]
    API --> Social[Social & Feed Service]
    API --> Group[Group & Trip Planner Service]
    API --> Rec[Recommendation Engine]
    
    User --> Postgres[(PostgreSQL - Primary DB)]
    User --> Redis[(Redis - Caching)]
    
    Social --> Postgres
    
    Group --> Postgres
    Group --> Gemini((Google Gemini API))
    
    Rec --> Qdrant[(Qdrant - Vector DB)]
    Rec --> Fast[Fast Tier - Local FAISS/Embeddings]
    Rec --> Postgres
    
    App -- Swipe Actions --> API
    API -- Kafka Producer --> Kafka[Kafka Event Bus]
    Kafka -- Consumer --> FeatureStore[Feature Store Updater]
    FeatureStore --> Redis
```

## Luồng Dữ Liệu AI (AI Data Flow)

### 1. Luồng Thu Thập Dữ Liệu (Event Streaming)
Khi người dùng tương tác (Vuốt Like/Skip món ăn), hành động này không ghi trực tiếp vào Database chính mà được:
- Đẩy vào **Kafka (Topic: `swipe-events`)**.
- Consumer ngầm xử lý event và gọi `FeatureStore`.
- `FeatureStore` cập nhật lại trọng số sở thích của người dùng và lưu vào **Redis** (để truy xuất nhanh khi gọi Recommendation).

### 2. Luồng Gợi Ý (Recommendation Routing)
- **Fast Tier (Sử dụng hàng ngày):** Khi lướt (Swipe) ở Tab 3, hệ thống sử dụng thuật toán nội bộ (Vector Similarity trên Qdrant) kết hợp với Rule Engine (Loại bỏ món gây dị ứng) để trả kết quả dưới 200ms. Dữ liệu mồi được nạp qua caching của Redis.
- **Deep Tier (Trip Planner / Lịch Trình Nhóm):** Gom dữ liệu các thành viên nhóm bằng thuật toán *Pareto Aggregation* (để cân bằng sở thích), sau đó tạo Prompt và gọi tới **Google Gemini 1.5 Flash**. LLM trả về kết quả JSON, sau đó backend map lại các text này với món ăn thật trong hệ thống thông qua Embedding Search.

### 3. Luồng Định Vị GPS & Chuyển Tiếp Đặt Món (Navigation & Delivery Integration)
- **Định vị & Khoảng cách Haversine:** Thiết bị gửi `lat`, `lng` thực tế lên `/api/recommendation`. Backend tính khoảng cách theo công thức Haversine chính xác từng mét hoặc km tới vị trí quán ăn.
- **Deep Linking Đặt Món:** Tích hợp `MapsService` (mở Google Maps Native Navigation) và `DeliveryLinkService` (điều hướng sang ShopeeFood, Be Food, GrabFood qua Custom URL Schemes hoặc Web fallback).
- **Tool Crawler Dữ Liệu Thực Tế:** `tools/tool_get_food/crawl_real_data.js` kết nối OpenStreetMap Nominatim Geocoding API để tra cứu địa chỉ thực tế và toạ độ chuẩn cho từng nhà hàng tại Việt Nam.

## Cấu Trúc Cơ Sở Dữ Liệu (Database Schema)
Hệ thống sử dụng PostgreSQL, quản lý schema thông qua các file SQL: `schema.sql`, `seed.sql`.
- `users`: Quản lý người dùng, hỗ trợ phân hạng Free vs Premium (`subscription_tier`).
- `user_preferences`: Lưu trữ sở thích cá nhân, dị ứng và hương vị.
- `dishes`: Món ăn (có trường `item_type` để phân loại combo/đơn lẻ).
- `restaurants`: Cửa hàng, tọa độ (`location` JSONB: `lat`, `lng`), địa chỉ thật và `delivery_links` (ShopeeFood, Be, Grab).
- `posts`, `post_likes`, `post_comments`, `saved_posts`: Mạng xã hội ẩm thực.
- `groups`, `group_members`, `orders`: Tính năng nhóm và chia tiền (Split Bill).
- `user_swipes`: Bảng lưu vết lịch sử tương tác vuốt Like / Skip.
