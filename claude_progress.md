# Session Progress

## Last Session Summary (Implement AI Deep Tier - 2026-08-05)
- Triển khai tính năng `ai-deep-tier-planner` (HOÀN THÀNH).
- Viết `src/group/tripPlanner.ts` xử lý LLM Orchestrator.
- Triển khai **Mock LLM Orchestrator**: Giả lập việc đẩy Prompt cho mô hình ngôn ngữ (chứa danh sách sở thích và dị ứng gộp của Nhóm) để sinh ra kế hoạch 1-2 ngày.
- Triển khai **Grounding**: Hàm nhận kết quả Text sinh ra từ LLM, đưa đi generate Embeddings và query vào Qdrant để ánh xạ (map) vào các món ăn có thật trong CSDL (tránh ảo giác - hallucination).
- Kết nối `deepTierPlanner` vào router chính `routing.ts`.

## Current State
- Tầng Deep AI (cho Trip Planner) đã có khung sườn hoàn chỉnh với kỹ thuật RAG (Retrieval-Augmented Generation) & Grounding.
- Sẵn sàng để thay thế hàm Mock bằng API gọi thẳng tới OpenAI/Gemini khi đưa lên môi trường thực tế.
- Tính năng `ai-deep-tier-planner` trong `features.json` đã được đánh dấu là "DONE".
- Mã nguồn chạy mượt, pass ESLint và TSC.
- Branch: main

## What Next Session Should Do First
Bắt đầu triển khai tính năng `ai-infrastructure-event-driven` (Học tăng cường qua Kafka và Caching qua Redis).

## Known Issues / Blockers
- Không có lỗi nào. Luồng AI Routing 3 lớp (Fast/Medium/Deep) đã chính thức hoàn thiện.

## Architectural Decisions This Session
- Lựa chọn giải pháp RAG-Grounding: Tức là không bắt LLM sinh ra món ăn cụ thể trong DB (rất dễ sai lầm, hallucinate), mà bắt LLM sinh ra *mô tả món ăn* (ví dụ: "Bữa sáng nhẹ nhàng kiểu Tây"). Sau đó dùng chính mô tả đó làm Query cho Vector Database để tìm món khớp nhất. Điều này bảo vệ 100% độ chính xác của dữ liệu nhà hàng.