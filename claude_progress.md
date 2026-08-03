# Session Progress

## Last Session Summary (Session 27 — 2026-08-03)
- Đã thêm feature mới `frontend-tab4-group-split` vào `features.json`.
- Triển khai thành công giao diện "Group & Split Bill" (Tab 4) ở route `/group` với phong cách thiết kế Glassmorphism tuyệt đẹp.
- Xây dựng layout với Segmented Control mượt mà cho phép chuyển đổi giữa "Groups" (Danh sách nhóm) và "Bills" (Hóa đơn cần chia).
- Sử dụng `framer-motion` cho các hiệu ứng chuyển đổi tab mượt mà.
- Tạo `groupStore.ts` bằng `zustand` quản lý danh sách các FoodGroup và các hóa đơn tách tiền (SplitBill) với mock data phong phú.
- Trình bày thông tin chia tiền rõ ràng bằng UI thẻ (Bill Card), với các highlight cho số tiền cá nhân cần trả (Your Share) và trạng thái thanh toán.

## Current State
- Feature: frontend-tab4-group-split (status: DONE, 100% complete)
- Branch: main
- Tests: 24 passing / 24 total (Backend)
- Frontend build (TypeScript/Vite): OK.

## What Next Session Should Do First
1. Tiến hành thiết kế trang "Tab 5: USER PROFILE" (Cá nhân hóa).
2. Tích hợp UI cho Profile (Avatar, Sở thích ăn uống, Lịch sử nhà hàng) với phong cách thiết kế Glassmorphism.

## Known Issues / Blockers
- None at the moment. UI components đang được tái sử dụng rất tốt qua các biến CSS toàn cục.

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Giao diện chia tiền phức tạp được đơn giản hóa bằng mô hình Segmented Control thay vì dùng quá nhiều nested routes.
- Component Card được thiết kế tái sử dụng cao, nhấn mạnh vào các con số (total bill, my share) bằng typography lớn và gradient.