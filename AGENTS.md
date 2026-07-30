# AGENTS.md — Project Harness

## Project Overview
[Điền 1-2 câu mô tả về sản phẩm bạn đang phát triển tại đây]

## Architecture
[Liệt kê Stack công nghệ, các thư mục chính, và cách các component liên kết với nhau]

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