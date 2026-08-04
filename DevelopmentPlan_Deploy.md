# Kế Hoạch Triển Khai & Kiểm Thử Thực Tế (Development Plan: Deploy & Beta Testing)

Tài liệu này vạch ra lộ trình để chuyển đổi dự án từ giai đoạn **MVP (Mock-Driven)** sang **Bản Build Thực Tế (Beta & Production Ready)**. Quá trình này tập trung vào việc dỡ bỏ mã giả lập (mock), kết nối hạ tầng thật, cấu hình CI/CD và chuẩn bị phân phối ứng dụng di động.

---

## 1. Phase 1: Chuẩn Bị Hạ Tầng (Infrastructure Readiness)
Mục tiêu: Đưa các công nghệ lõi lên môi trường staging hoặc managed cloud, loại bỏ sự phụ thuộc vào local in-memory.

- [ ] **PostgreSQL**: Thuê Managed Database (ví dụ: AWS RDS, Supabase) hoặc tự host trên VPS. Chạy lại `schema.sql` và `seed.sql`.
- [ ] **Redis**: Thiết lập Redis server thật (ví dụ: ElastiCache hoặc Redis Labs) để xử lý cache feed và session.
- [ ] **Vector Database (Qdrant)**: Deploy Qdrant Cluster thật, cung cấp REST/gRPC endpoint cho backend và AI scripts.
- [ ] **Message Queue (Kafka)**: Thiết lập cluster Kafka (hoặc Confluent Cloud) để xử lý lượng lớn log "vuốt thẻ" (Swipe Events).

---

## 2. Phase 2: Dỡ Bỏ Mã Giả Lập & Tích Hợp API Thật (Unmocking & Integration)
Mục tiêu: Đảm bảo luồng dữ liệu Backend chạy mượt mà trên môi trường thật.

- [ ] **Core/Auth Module**: Thêm trường `password` (hashed với bcrypt) vào bảng `users`. Loại bỏ Mock Auth, áp dụng xác thực JWT 100% bằng dữ liệu database.
- [ ] **AI/Recommendation Engine**: 
  - Xóa class `MockQdrantClient`.
  - Kết nối service Backend tới Qdrant để thực hiện **Vector Similarity Search** thay vì trả list tĩnh.
  - Xóa mock in-memory Kafka Producer/Consumer.
- [ ] **Bản Đồ & Giao Hàng**: Tích hợp Google Maps API Key vào `maps_service.dart`. Đảm bảo các logic tính khoảng cách (Geohashing) hoạt động trên vị trí thực tế của thiết bị.

---

## 3. Phase 3: Hoàn Thiện Frontend & Build Ứng Dụng (Mobile App Distribution)
Mục tiêu: Xây dựng file thực thi (APK/AAB/IPA) để tester có thể cài đặt trên điện thoại thật.

- [ ] **Flutter Config**: Cập nhật `.env` cho Frontend, trỏ API URL về domain staging (ví dụ: `api.foodrecommend.dev`).
- [ ] **Cấp quyền thiết bị**: Đảm bảo khai báo đúng `AndroidManifest.xml` và `Info.plist` (Location, Camera, Internet).
- [ ] **Android Build**: Khởi tạo Keystore, cấu hình signing, build bản `release` APK và AAB.
- [ ] **iOS Build**: Tạo chứng chỉ (Certificates), Provisioning Profiles trên Apple Developer, build IPA.
- [ ] **Phân phối nội bộ**: Đẩy bản build lên Firebase App Distribution hoặc TestFlight / Google Play Internal Testing.

---

## 4. Phase 4: Kiểm Thử Toàn Diện (Real E2E Testing)
Mục tiêu: Đảm bảo khi app chạy thực tế không có lỗi phát sinh do network hoặc device limitation.

- [ ] **Tháo Fallback trong Test Suite**: Cập nhật file `.env.test` để trỏ vào database Test thật. Đảm bảo Jest/Supertest không rơi vào Catch block trả về Mock data.
- [ ] **Kiểm thử phần cứng**: Test hiệu năng video player trên cuộn Feed (TikTok-style) bằng thiết bị Android/iOS cấu hình thấp.
- [ ] **Kiểm thử GPS**: Test tính năng gợi ý theo vị trí (Tab 3) bằng cách spoof location hoặc đi thực tế để xem ứng dụng có recommend quán trong bán kính 5km hay không.
- [ ] **Load Testing**: Chạy lại script k6 `k6-script.js` trên môi trường Staging với Database thật để đo ngưỡng chịu tải.

---

## 5. Phase 5: Tự Động Hóa CI/CD (Continuous Deployment)
- [ ] **Backend Pipeline**: GitHub Actions tự động chạy `npm test`. Nếu pass, build Docker Image -> Push lên Docker Hub/ECR -> Trigger server pull image mới.
- [ ] **Frontend Pipeline**: Tích hợp Fastlane hoặc GitHub Actions for Flutter để tự động build và upload APK/IPA mỗi khi có tag release mới trên repo.

---
*Ghi chú: Lộ trình này ưu tiên tính ổn định, cần triển khai theo thứ tự từ Phase 1 xuống Phase 5. Không deploy Frontend (Phase 3) khi Backend (Phase 2) vẫn đang trả về dữ liệu Mock.*
