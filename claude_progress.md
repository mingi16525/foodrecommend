# Session Progress

## Last Session Summary (Session 19 — 2026-08-04)
- Đã hoàn thành phần giao diện (UI) cho feature `tab-4-and-5-ui` bao gồm `OnboardingScreen` (Thiết lập khẩu vị) và `ProfileScreen` (Tài khoản người dùng) theo chuẩn được mô tả trong `UI.txt`.
- Tính năng ghép API Profile chưa thực hiện vì lớp service (ví dụ `frontend/lib/services/`) không nằm trong mảng scope hiện tại của feature này. Giao diện hiện đang sử dụng mock data.
- Do rule scope, file `features.json` không được cập nhật để đổi trạng thái sang DONE. (Cần điều chỉnh scope nếu muốn update trực tiếp hoặc ủy quyền qua script).

## Current State
- Feature: tab-4-and-5-ui (status: IN_PROGRESS) - UI đã xong, API pending/blocked by scope.
- Branch: main
- Tests: To be updated after `npm test`.

## What Next Session Should Do First
1. Nếu muốn tích hợp API cho Tab 4 & 5, cần mở rộng scope trong `features.json` để bao gồm các thư mục HTTP service/API client.
2. Hoặc chuyển sang làm feature UI tiếp theo: `tab-3-swipe-ui` (Vuốt chọn món AI).

## Known Issues / Blockers
- Môi trường CI/test hiện tại vẫn phụ thuộc vào catch-block để trả về mock data vì chưa chạy psql command trong quá trình `npm test`.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Quyết định chia nhỏ các tính năng UI của Android app thành từng feature độc lập theo Tab trong `features.json` để dễ theo dõi và gán task cho Frontend team.