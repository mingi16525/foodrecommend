# Session Progress

## Last Session Summary (Session Build UI Bottom Navigation Bar - 2026-08-04)
- Theo yêu cầu của user, ứng dụng Android hiện tại chỉ hiển thị `PlaceholderScreen` cho Tab 3, thiếu điều hướng chính.
- Đã tạo `frontend/lib/screens/main_screen.dart` chứa một `StatefulWidget` với `Scaffold` và `BottomNavigationBar`.
- Sử dụng `IndexedStack` để lồng 3 tab: `FeedScreen`, `GroupListScreen`, và `RecommendationScreen`. `IndexedStack` giúp giữ nguyên state của từng tab (tránh việc video bị load lại mỗi khi đổi tab).
- Cập nhật `frontend/lib/routes/app_routes.dart` để route gốc `/` trỏ vào `MainScreen`.

## Current State
- UI đã có thanh điều hướng dưới cùng với 3 tab chính: Dành cho bạn (Feed), Cộng đồng (Group), và Khám phá (Recommendation).
- App hiện tại mở lên sẽ vào thẳng Tab đầu tiên (Feed - Index 0).
- Branch: main

## What Next Session Should Do First
Push các thay đổi lên GitHub để xác nhận CI chạy build thành công. User có thể cài đặt APK mới để test thử cảm giác chuyển đổi giữa các Tab. Sau đó bắt tay vào task `ai-pipeline-ranking`.

## Known Issues / Blockers
- Máy local hiện không có Flutter nên không thể test nóng (Hot Reload), cần đợi CI build APK.

## Observations (Not Fixed — Outside Current Scope)
- Các file logic (Swipe, Video) trong các màn hình con vẫn đang dùng Mock Data nếu API gọi thất bại.

## Architectural Decisions This Session
- Dùng `IndexedStack` trong `MainScreen` thay vì `GoRouter` nested navigation (`ShellRoute`) cho các tab chính vì `IndexedStack` đơn giản, dễ đọc và cực kỳ tối ưu để giữ state cho các màn hình nặng (như Feed chứa video).