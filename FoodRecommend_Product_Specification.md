# FoodRecommend-- Product Specification (MVP → Scale)

## 1. Vision

Xây dựng nền tảng **AI Food Decision Platform** giúp người dùng quyết
định *ăn gì, ở đâu, đặt như thế nào* thay vì chỉ tìm kiếm quán.

## 2. Giá trị cốt lõi

-   Gợi ý món/quán theo sở thích.
-   Học từ lịch sử, đánh giá, lượt thích/bỏ qua.
-   Cá nhân hóa theo thời gian, vị trí, ngân sách, thời tiết, nhóm.
-   Điều hướng sang Google Maps, GrabFood, ShopeeFood... thay vì cạnh
    tranh trực tiếp.

## 3. Chức năng MVP

### Người dùng

-   Đăng ký/đăng nhập.
-   Hồ sơ sở thích.
-   Vuốt Like / Skip món ăn, quán ăn.
-   Tìm kiếm.
-   Gợi ý theo AI.
-   Lưu yêu thích.
-   Đánh giá cá nhân.
-   Xem review, ảnh, video.
-   Chỉ đường (Google Maps).
-   Chuyển sang nền tảng đặt món.

### AI

-   User Profile.
-   Content-based recommendation.
-   Collaborative filtering.
-   Candidate Generation.
-   Ranking.
-   Re-ranking (đa dạng hóa).
-   Exploration (đề xuất món mới).
-   Feedback learning.
### Chức năng nên có trong app

- Các màn hình chính
- Tab số 1: Một giao diện lướt như tiktok, các bài viết hiển thị là các món ăn hoặc các bài review món ăn(nếu là bài review thì sẽ có hiển thị thêm popup món ăn ở một góc màn(có thể là đường dẫn đến bài giới thiệu món)), review quán ăn(có hiển thị thông tin quán(có thể là đường dẫn đến người dùng(quán ăn))), trang người dùng với người dùng được chia làm 2 loại là reviewer(Người dùng bình thường có tick reviewer thì sẽ là reviewer, nếu không thì là người dùng bình thường), Quán ăn với thông tin món ăn. Bài đăng reviewer,chia sẻ và bài đăng món ăn là hai loại bài đăng với tính chất khác nhau, được hiển thị ở trang người dùng khác nhau. Người dùng có thể thực hiện các thao tác bình luận, theo dõi, thích .... 
- Tab số 2 là tab nhóm người dùng. Trong tab này, người dùng có thể tạo nhóm, thêm các người dùng khác vào, trò chuyện, thêm thông tin các món ăn vào nhóm để chia sẻ, giới thiệu ...(tương tự như cộng đồng). Cũng có thể là nhóm để đặt đồ ăn(Một người dùng trong nhóm có thể tạo đặt đơn đồ ăn, những người tham gia có thể tham gia vào đơn đồ ăn. Sau khi xác nhận đủ người tham gia thì trong thread đơn sẽ có AI gợi ý một vài Quán ăn(với món ăn nổi bật(phù hợp với những người dùng trong nhóm) trước. Quán ăn này phải có trong ShoppeFood hoặc BeFood hoặc thông tin liên lạc để ship) cho người dùng và người dùng chọn, sau đó sẽ chọn ra một quán được chọn nhiều nhất. Sau khi chọn xong quán, người dùng chọn món ăn (AI sẽ hiển thị ra một số món cho người dùng), mỗi người dùng chọn xong, người dùng tạo đơn sẽ đóng đơn, Hệ thống sẽ dẫn người dùng sang thông tin liên hệ đặt đơn của quán. Nếu quán có thông tin App Giao đồ ăn thì dùng API để chuyển dữ liệu sang, hoặc sẽ gửi thông tin đơn đến liên hệ của quán qua App, Quán tiếp nhận làm đơn, gửi đơn ...). Hoặc có thể tạo hẹn ăn, gợi ý đến quán ăn, ăn những gì. Nhóm người dùng cũng có thể chỉ có 1 người để sử dụng AI gợi Ý. Người dùng có thể Tạo lịch gợi ý món ăn, thêm địa chỉ các điểm đến của mình trong các khoảng thời gian, AI sẽ tạo gợi ý phù hợp với di chuyển của người dùng(để lấy thông tin chuyến đi, có thể tạo một trang với Tên chuyến đi, Thêm các điểm dừng số 1, số 2, số 3 ..., chọn điểm dừng thì tích hợp thêm API chuyển sang Google Map, chọn điểm đến bằng cách tìm google map, lưu địa chỉ điểm dừng. AI sẽ gợi ý món dựa trên lịch di chuyển)
- Tab số 3 là Chọn món, Người dùng chọn Tìm món ăn, AI gợi ý sẽ chạy và hiển thị cho người dùng một số món ăn( có ăn, giá, quán, địa chỉ, Nếu có đặt đồ ăn qua App hiển thị thêm App đặt đồ ăn và có thể link sang đó, có thể chọn món xong chọn chỉ đường thì sẽ chuyển qua Google Maps dẫn qua đó). Hiển thị theo dạng từng món ăn ở mỗi lần hiển thị và lướt xuống hoặc lên. Số lượng và những món hiển thị do AI tính toán từ trước cho thời điểm đã setup theo thói quen ăn uống của người dùng hoặc là chọn cho AI tính lại đề xuất các món khác
- Tab số 4 là Tab Setup thông tin ăn uống của cá nhân Món yêu thích, món ghét, yêu thích hương vị như thế nào, ghét hương vị như thế nào, ăn cay, ăn mặn, ăn chay..., Thông tin dị ứng, Có muốn ăn kiêng gì không ...
- Tab số 5 là Tab thông tin khác về tài khoản, setup trang cá nhân, ....
## 4. Giai đoạn 2

-   Gợi ý cho nhóm.
-   Hẹn hò.
-   Planner theo thời gian.
-   Trip/Food Tour.
-   AI Summary cho review.
-   Reviewer xác thực.

## 5. Giai đoạn 3

-   Office ordering.
-   Meal planner.
-   Health recommendation.
-   AI Chat.
-   API Recommendation.
-   White-label SaaS.

## 6. Kiến trúc MVP

``` text
Mobile App
    │
API Gateway
    │
Recommendation Service
 ├─ User Service
 ├─ Restaurant Service
 ├─ Review Service
 └─ Recommendation Engine
        │
 PostgreSQL
 Redis
 Object Storage
```

## 7. Kiến trúc AI

``` text
User Actions
    │
Event Collector
    │
Feature Store
    │
User Profile
    │
Candidate Generation
    │
Ranking
    │
Re-ranking
    │
Recommendation API
```

## 8. Tối ưu chi phí AI

-   Offline pre-compute.
-   Online ranking.
-   Cache theo geohash.
-   Chỉ gọi LLM cho Planning.
-   CPU cho recommendation, GPU chỉ train định kỳ.

## 9. Mô hình doanh thu

-   Affiliate.
-   Premium.
-   Quảng bá có kiểm soát.
-   SaaS/API.
-   Dashboard cho nhà hàng.

## 10. Lộ trình

### MVP (3--6 tháng) - **ĐÃ HOÀN THÀNH (Local Beta)**

-   Recommendation cá nhân (Fast Tier, Qdrant).
-   Review & Feed TikTok style.
-   Điều hướng (Mô phỏng Deep link).
-   Kết nối hạ tầng Database & Message Queue thực tế (PostgreSQL, Redis, Kafka).

### Beta (6--12 tháng) - **ĐANG THỰC HIỆN**

-   Group recommendation (Pareto Aggregation).
-   Trip planner (Gemini LLM / GPT-4o-mini).
-   AI Summary.

### Scale (12--24 tháng)

-   AI Agent.
-   White-label.
-   Quốc tế.
