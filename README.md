# AI Food Decision Platform (FoodRecommend)

## 📌 Tổng Quan
**FoodRecommend** là nền tảng ra quyết định ẩm thực dựa trên AI, giúp người dùng trả lời câu hỏi *"Hôm nay ăn gì, ở đâu?"* thông qua trải nghiệm vuốt (Tinder-style) và lên lịch trình nhóm (Trip/Group Planner).
Hệ thống sử dụng **PostgreSQL, Redis, Qdrant (Vector DB), Kafka** kết hợp với **Google Gemini LLM** để đưa ra gợi ý siêu cá nhân hóa.

## 📖 Tài Liệu Dự Án (Documentation)
Toàn bộ tài liệu hệ thống đã được tái cấu trúc để tinh gọn và dễ tiếp cận:

- [1. Tổng Quan Sản Phẩm (Product Overview)](./docs/01_Product_Overview.md) - Tính năng, UI/UX, Luồng người dùng.
- [2. Kiến Trúc Kỹ Thuật (Technical Architecture)](./docs/02_Technical_Architecture.md) - Cấu trúc Backend, Database Schema, Kafka Events, AI (RAG & LLM).
- [3. Hướng Dẫn Triển Khai (Deployment Guide)](./docs/03_Deployment_Guide.md) - Chạy Local, Testing, CI/CD, Production.

## 🚀 Kế Hoạch Hiện Tại (Current Roadmap)
Để xem các công việc đang tiến hành để đưa dự án tới phiên bản hoàn thiện nhất, vui lòng xem [MASTER_PLAN.md](./MASTER_PLAN.md).

## 🛠 Tech Stack
- **Frontend:** Flutter (Mobile App)
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL (Primary), Redis (Cache), Qdrant (Vector DB)
- **Message Broker:** Kafka
- **AI/LLM:** Google Gemini 1.5 Flash (Trip Planner), Fast-Tier Engine (Local Embedding)
