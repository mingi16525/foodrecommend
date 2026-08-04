# Session Progress

## Last Session Summary (Session Deploy Beta - 2026-08-04)
- Đã hoàn tất triển khai môi trường beta cục bộ (Local Beta Deployment).
- Khởi chạy thành công Docker container cho Postgres, Redis, Qdrant, Kafka, Zookeeper.
- Hoàn thiện script sinh vector AI bằng model `Xenova/all-MiniLM-L6-v2` (`generate_embeddings.js`) và nạp thẳng vào Qdrant (`ingest_qdrant.js`).
- Seed dữ liệu test bao gồm 20 user, 50 nhà hàng, và 500 món ăn vào Postgres bằng `seed.sql`.
- Đã fix lỗi config database và cập nhật lại toàn bộ API test với mock service. Kết quả test: 34/34 tests passed, 0 failures.
- Đã hoàn tất verify và check mark tất cả các task trong `DevelopmentPlan_Deploy.md`.

## Current State
- Backend, Database và AI Recommendation Engine đang chạy ổn định trong môi trường cục bộ.
- Branch: main
- Tests: Passing (34/34 tests).

## What Next Session Should Do First
Bắt đầu quá trình build và chạy thử Frontend App (trên máy ảo Android/iOS) và cho kết nối với bộ API local vừa khởi tạo để đánh giá trực tiếp nghiệm UX/UI và độ chính xác của AI.

## Known Issues / Blockers
- Test suite yêu cầu mock các service để vượt qua trong môi trường CI cục bộ do thiếu đồng bộ UUID ngẫu nhiên giữa DB thực và Test environment.

## Observations (Not Fixed — Outside Current Scope)
- Qdrant chạy local không yêu cầu API key, nhưng khi đưa lên cloud có thể cần quản lý bí mật (Secrets).
- Mô hình Transformers.js tải trực tiếp trong runtime Node.js. Sẽ tối ưu hơn nếu cache model artifact cứng trên ổ đĩa cho lần chạy sau, mặc dù Xenova đã có cache mặc định.

## Architectural Decisions This Session
- Cấu hình tích hợp AI trực tiếp vào Node.js (via Transformers.js) với Local Postgres và Local Qdrant thay vì setup Python microservices để tiện việc chạy Local Beta test trên một máy duy nhất.