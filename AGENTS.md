# AGENTS.md — Project Harness

## Project Overview
Nền tảng AI Food Decision Platform giúp người dùng quyết định *ăn gì, ở đâu, đặt như thế nào* bằng cách gợi ý món/quán theo sở thích, học từ lịch sử, cá nhân hóa theo ngữ cảnh và điều hướng sang các nền tảng đặt món hiện có.

## Architecture
- **Frontend**: Mobile App (Flutter / React Native)
- **API Gateway**: Kong / Nginx
- **Backend Services**: Microservices (Node.js/Go/Python) for User, Restaurant, Social, Group, Recommendation.
- **Database**: PostgreSQL (Main DB), Redis (Cache & Feature Store), Elasticsearch/Qdrant (Vector DB).
- **Messaging**: Kafka / RabbitMQ (Event-Driven for user actions).
- **AI**: Online Inference (CPU) and Offline Model Training (GPU).

## Harness Files
- `features.json` — source of truth for what to build and in what order
- `claude-progress.md` — session handoff document (updated every session)
- `AGENTS.md` — this file; governance and protocols

## Scope Rules
Work on ONE feature at a time (highest-priority IN_PROGRESS in features.json).
Before modifying any file, verify it is in the current feature's scope array.
If a needed change is out-of-scope, log it in claude-progress.md and skip it.

## Verification Protocol
A feature is COMPLETE only when:
- [ ] npm test exits 0
- [ ] npx tsc --noEmit exits 0
- [ ] npm run lint exits 0
- [ ] All items in definition_of_done confirmed

## End-of-Session Protocol
1. git add -A && git commit -m "[descriptive message]"
2. npm test (record actual results in progress file)
3. Update claude-progress.md (summary, state, next action, observations)
4. git add claude-progress.md && git commit -m "Session progress update"
5. Verify: git status shows clean working tree