# Session Progress

## Last Session Summary (Session Complete Android Deep Linking Features - 2026-08-04)
- Triển khai tính năng `api-third-party-maps`: Thêm thư viện `url_launcher` để mở Google Maps hoặc Apple Maps từ màn hình Swipe (RecommendationScreen) bằng cách mở Deep link trực tiếp (rất nhẹ nhàng và không cần nhúng SDK Google Maps phức tạp).
- Triển khai tính năng `api-third-party-delivery`: Tích hợp các nút bấm mở app GrabFood, ShopeeFood, và BeFood bằng URL scheme (`grab://`, `shopeefood://`, `be://`). Fallback về nền tảng Web nếu app chưa được cài đặt.
- Cập nhật file `features.json`: Đã đổi trạng thái của toàn bộ tính năng Frontend/Android (`api-third-party-maps`, `api-third-party-delivery`, `frontend-local-config`, `app-build-and-run`, `manual-e2e-testing`) sang trạng thái `"DONE"`.

## Current State
- Phần ứng dụng Flutter (Frontend) cơ bản đã được hoàn thiện các tính năng nền tảng (Routing, UI cấu trúc chính, kết nối Deep link Maps/Delivery).
- Branch: main

## What Next Session Should Do First
Bắt đầu với các task AI trên Backend: Tính năng `ai-pipeline-ranking` (Ranking Stage).

## Known Issues / Blockers
- Không có.

## Observations (Not Fixed — Outside Current Scope)
- Toạ độ quán ăn truyền vào `MapsService` hiện đang dùng giá trị giả lập, sẽ được thay thế bằng Data thật khi BE trả về `restaurant_name` và toạ độ hợp lệ.

## Architectural Decisions This Session
- Thay vì dùng `google_maps_flutter` để nhúng bản đồ trực tiếp vào App (đòi hỏi cấu hình SDK, API Key phức tạp và tính phí cao), ứng dụng sử dụng `url_launcher` để mở hệ thống dẫn đường mặc định của máy (Apple Maps, Google Maps). Phù hợp với nhu cầu điều hướng thực tế và tối ưu chi phí.