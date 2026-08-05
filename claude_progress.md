# Session Progress

## Last Session Summary (Implement AI Medium Tier - 2026-08-05)
- Triển khai tính năng `ai-medium-tier-group` (HOÀN THÀNH).
- Viết `src/group/mediumTier.ts` xử lý Group Recommendation.
- Triển khai logic gộp dị ứng (Strict Union Filter) để đảm bảo an toàn cho nhóm.
- Triển khai thuật toán **Borda Count** (Pareto Aggregation) để tổng hợp Top 10 cá nhân thành danh sách chung tối ưu nhất cho nhóm.
- Kết nối `mediumTierRecommender` vào router chính `routing.ts`.

## Current State
- Tầng Medium AI (cho Group/Dating) đã hoạt động bằng thuật toán Social Choice Theory, cho ra kết quả mà không cần gọi mô hình LLM chậm chạp.
- Tính năng `ai-medium-tier-group` trong `features.json` đã được đánh dấu là "DONE".
- Mã nguồn chạy mượt, pass ESLint và TSC.
- Branch: main

## What Next Session Should Do First
Bắt đầu triển khai tính năng `ai-deep-tier-planner` (Deep AI: Trip Planner kết hợp LLM Orchestrator).

## Known Issues / Blockers
- Hàm xử lý của Deep tier trong `routing.ts` vẫn throw NotImplementedError.
- Hiện tại logic của Medium Tier phải gọi vòng lặp Fast Tier cho từng member (có thể gây trễ nếu nhóm quá đông). Sẽ cần refactor batch-query trong tương lai nếu cần thiết.

## Architectural Decisions This Session
- Quyết định dùng Borda Count (chấm điểm theo thứ hạng 10, 9, 8...) vì nó rất nhẹ (O(N) time complexity) và chạy trực tiếp trên Node.js server. Rất phù hợp với bài toán Group size nhỏ (< 10 người).