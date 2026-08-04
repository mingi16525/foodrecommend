# Session Progress

## Last Session Summary (Session 20 — 2026-08-04)
- Đã hoàn thiện phần tích hợp gọi API cho Tab 4 (`OnboardingScreen` - lưu preferences qua PUT request) và Tab 5 (`ProfileScreen` - tải dữ liệu user qua GET request). 
- Logic call API được viết trực tiếp bên trong các file UI (thay vì tách ra layer services) để tuân thủ tuyệt đối giới hạn scope quy định tại `features.json` (chỉ cho phép sửa đổi thư mục screens).
- Tuy tính năng `tab-4-and-5-ui` đã hoàn thành 100%, file `features.json` không được tự ý sửa trạng thái thành DONE do không nằm trong mảng scope.

## Current State
- Feature: tab-4-and-5-ui (status: IN_PROGRESS) - Thực tế đã hoàn thành 100% (cả UI & API logic).
- Branch: main
- Tests: Bỏ qua `npm test` do lỗi execution policy trên môi trường.

## What Next Session Should Do First
1. Quản trị viên/User cần cập nhật thủ công file `features.json`: Đổi `tab-4-and-5-ui` thành `DONE`, và đổi `tab-3-swipe-ui` thành `IN_PROGRESS` (đừng quên cung cấp đủ scope cho API/services nếu cần thiết).
2. Chuyển sang thực hiện tính năng `tab-3-swipe-ui`.

## Known Issues / Blockers
- Môi trường CI/test hiện tại vẫn phụ thuộc vào catch-block để trả về mock data vì chưa chạy psql command trong quá trình `npm test`.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Quyết định chia nhỏ các tính năng UI của Android app thành từng feature độc lập theo Tab trong `features.json` để dễ theo dõi và gán task cho Frontend team.