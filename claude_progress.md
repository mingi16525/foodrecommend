# Session Progress

## Last Session Summary (Session Fix CI Android v1 Embedding - 2026-08-04)
- Báo lỗi từ GitHub Actions khi chạy lệnh `flutter build apk --release`: `Build failed due to use of deleted Android v1 embedding`.
- Điều tra cho thấy thư mục `frontend/android` hiện tại đang chứa cấu trúc của dự án Capacitor/Cordova cũ, không phải của Flutter. Flutter cố build trên framework android đó dẫn đến lỗi v1 embedding vì không tương thích.
- Đã khắc phục bằng cách xóa bỏ hoàn toàn thư mục `frontend/android` cũ khỏi Git tracking.
- Bổ sung lệnh `flutter create .` vào `.github/workflows/ci.yml` trước lệnh `flutter pub get` để GitHub Actions tự động sinh ra một shell Native Android mới nhất (v2 embedding) và chuẩn xác nhất cho Flutter trước khi tiến hành build APK.

## Current State
- `ci.yml` đã được thêm bước tự động generate thư mục `android`.
- Thư mục rác `android` Capacitor đã bị xóa.
- Mọi bài test backend pass (34/34).
- Branch: main

## What Next Session Should Do First
Push các thay đổi lên GitHub để kiểm chứng Action có thể tự `flutter create` và build APK thành công. Sau khi lấy được APK, có thể bắt đầu với `ai-pipeline-ranking`.

## Known Issues / Blockers
- Không có.

## Observations (Not Fixed — Outside Current Scope)
- Việc dùng `flutter create .` trên CI đảm bảo build luôn có shell native sạch sẽ và cập nhật (tương thích Gradle mới nhất của runner).

## Architectural Decisions This Session
- Không lưu trữ Native Shells (`android`, `ios`) trong source control nếu chúng ta chỉ code thuần bằng Dart (không có code native custom). Việc để CI tự generate giúp framework không bao giờ bị lỗi outdated embedding v1/v2 hay Gradle cũ.