# Session Progress

## Last Session Summary (Session Fix CI Permission Denied - 2026-08-04)
- User báo lỗi GitHub CI khi chạy `npm run lint` bị `eslint: Permission denied`.
- Kiểm tra phát hiện thư mục `node_modules` vô tình bị track trên Git dẫn đến khi GitHub Actions checkout code, thư mục `.bin/eslint` bị mất cờ executable trên Ubuntu runner (do push từ Windows).
- Khắc phục bằng cách chạy `git rm -r --cached node_modules` để loại bỏ khỏi tracking, giúp npm install trên CI chạy đúng hành vi cấp quyền.

## Current State
- `node_modules` đã bị xóa khỏi git tracking và chỉ còn ở file `.gitignore`.
- Đã chạy verify lại `npm test` thành công (34/34 passing).
- `features.json` đang nhắm vào mục tiêu `app-build-and-run` và các luồng liên quan.
- Branch: main

## What Next Session Should Do First
Push các thay đổi lên GitHub để xác nhận pipeline GitHub Actions pass ở bước lint. Tiếp tục feature đầu tiên đang TODO trong features.json là `ai-pipeline-ranking`.

## Known Issues / Blockers
- None at this stage for CI. Local Flutter run still depends on SDK installation.

## Observations (Not Fixed — Outside Current Scope)
- Cần đảm bảo endpoint API cấu hình trong mã nguồn Flutter đang trỏ đúng. (Đã xử lý ở bước trước thông qua `api_config.dart`).

## Architectural Decisions This Session
- Nghiêm ngặt không track `node_modules` trong git repository để tránh lỗi file permission và làm rác repo. Mọi CI/CD runner phải tự cài package qua `npm ci` hoặc `npm install`.