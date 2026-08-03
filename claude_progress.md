# Session Progress

## Last Session Summary (Session 3 — 2026-08-03)
- Đã tạo `docker-compose.yml` để thiết lập PostgreSQL, Redis, Qdrant.
- Đã tạo `schema.sql` cho cấu trúc cơ sở dữ liệu cơ bản.
- Đã thiết lập cấu trúc thư mục source code backend `src/` và `tests/`.
- Đã skip việc setup Github Actions/Gitlab CI vì nằm ngoài scope của features.json.

## Current State
- Feature: core-architecture-db-setup (status: IN_PROGRESS, ~50% complete)
- Branch: main
- Tests: Failed (Execution policy error trên Windows khi chạy npm test; package.json chưa được thêm vào scope nên chưa được tạo)

## What Next Session Should Do First
1. Thêm package.json, tsconfig.json vào scope trong features.json và thiết lập chúng.
2. Thêm Github Actions/Gitlab CI vào scope nếu muốn thiết lập CI/CD.
3. Sửa lỗi PSSecurityException để có thể chạy được npm test.
4. Cài đặt các thư viện cần thiết (express, pg, redis, v.v.)

## Known Issues / Blockers
- Thiếu package.json để chạy npm test.
- Lỗi execution policy (UnauthorizedAccess) khi chạy npm test trên powershell.
- Các file CI/CD và cấu hình TypeScript bị hạn chế bởi scope rule.

## Observations (Not Fixed — Outside Current Scope)
- Github Actions/Gitlab CI chưa được thiết lập do ngoài scope.
- Chưa có package.json và các thư viện cần thiết.

## Architectural Decisions This Session
- Sử dụng postgres:15-alpine và tạm thời dùng JSONB cho trường location, embedding trong schema.sql để khởi tạo nhanh cho MVP.