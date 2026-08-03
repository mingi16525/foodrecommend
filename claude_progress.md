# Session Progress

## Last Session Summary (Session 22 — 2026-08-03)
- Đã thêm feature mới `frontend-init` vào `features.json`.
- Chuyển hướng phát triển Frontend sang React + Vite + TypeScript thay vì Flutter do rào cản môi trường, phù hợp với kiến trúc Web App theo chuẩn hiện đại.
- Khởi tạo thành công dự án Vite thông qua lệnh `npx -y create-vite@latest frontend --template react-ts`.
- Cài đặt thành công các phụ thuộc ban đầu qua `npm install`.
- Khởi chạy thành công Development Server của Frontend, host tại `http://localhost:5173/`.

## Current State
- Feature: frontend-init (status: DONE, 100% complete)
- Branch: main
- Tests: 24 passing / 24 total (Backend)

## What Next Session Should Do First
1. Setup các thư viện cần thiết cho React Frontend như: `tailwindcss`, `react-router-dom`, `axios` (hoặc cấu hình `fetch` API base), Zustand/Redux để quản lý State theo như bản tóm tắt kiến trúc tại `UI.txt`.
2. Tạo cấu trúc thư mục (components, pages, services, store) bên trong thư mục `frontend/src`.
3. Bắt tay thiết kế Tab đầu tiên (Ví dụ Social Feed hoặc UI Base layout có Bottom Navigation).

## Known Issues / Blockers
- Cần tuân thủ đúng Design Aesthetic đã ghi trong `UI.txt` (Tránh các màu cơ bản nhàm chán, sử dụng dark mode mặc định, glassmorphism, micro-animations). 

## Observations (Not Fixed — Outside Current Scope)
- Tính năng chia sẻ (Social Feed) hiện tại lấy toàn bộ bài mới nhất, cần phân trang (pagination) và lọc theo follower trong tương lai.
- Tính năng nhóm chưa tích hợp websocket/realtime cho việc tạo bill/bỏ phiếu (Voting) chọn quán ăn chung.

## Architectural Decisions This Session
- Lựa chọn React + Vite thay vì Flutter để loại bỏ sự phụ thuộc quá lớn vào mobile SDK trong môi trường phát triển hiện tại, cho phép team đi vào thực tế ngay lập tức với Web-first approach nhưng vẫn giữ nguyên định hướng thiết kế Premium trong `UI.txt`.