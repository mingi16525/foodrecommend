# Session Progress

## Last Session Summary (Session 34 — 2026-08-03)
- Đã thêm tính năng `android-app-creation` vào `features.json`.
- Cài đặt cấu hình Capacitor để hỗ trợ tạo ra bản build Android native từ source code React/Vite web.
- Cập nhật `frontend/src/api/client.ts` để sử dụng host loopback alias của Android (`10.0.2.2`) khi ứng dụng được chạy trên Android Platform qua Capacitor. 
- Đồng bộ mã nguồn (`npx cap sync android`) để sẵn sàng build thành `.apk` trong Android Studio.

## Current State
- Feature: android-app-creation (status: DONE, 100% complete)
- Branch: main
- Tests: 24 passing / 24 total (Backend)
- Frontend build (TypeScript/Vite): OK.
- Đã tồn tại project Android hoàn chỉnh ở thư mục `frontend/android` để người dùng có thể test/deploy.

## What Next Session Should Do First
1. Dự án đã hoàn thành MVP Frontend, Backend và Native App Build (Android). 
2. Tiếp theo có thể thiết lập các tính năng nâng cao hơn (Realtime Chat/Voting, Map Location thực tế) hoặc tối ưu code.

## Known Issues / Blockers
- Engine trả về dữ liệu quá ít (chỉ có ID, Name, Score) nên frontend phải random image/price/distance để UI không bị vỡ. Cần enrich metadata từ DB ở tầng Recommendation Engine API.
- Để chạy app Android trên thiết bị thực qua LAN (thay vì Emulator), người dùng cần tự config IP LAN ở `client.ts` thay vì `10.0.2.2`.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.
- Việc tách bill (Split Bill) mới chỉ thực hiện dưới dạng API tính toán chứ chưa lưu persist vào Database.

## Architectural Decisions This Session
- Chấp nhận việc mock hình ảnh, price, và distance ở `swipeStore.ts` để UI không bị thay đổi thiết kế trong khi chờ backend hoàn thiện tính năng enrich data của Recommendation Engine.