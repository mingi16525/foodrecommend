#!/bin/bash
# agent-review.sh — Run after each agent session to verify session output
set -e

# Khởi tạo thư mục log nếu chưa tồn tại
mkdir -p log

# Thiết lập tên file log theo định dạng thời gian thực tế
LOG_FILE="log/LOG_$(date +'%H:%M_%d-%m-%Y').txt"

# Đưa toàn bộ tiến trình vào một block và dùng tee để vừa in ra console, vừa ghi vào file
{
  echo "╔══════════════════════════════════════╗"
  echo "║       AGENT SESSION REVIEW           ║"
  echo "╚══════════════════════════════════════╝"

  # 1. What changed this session?
  echo ""
  echo "── Files Modified ──────────────────────"
  git diff --name-only HEAD~1 HEAD 2>/dev/null || git diff --name-only

  # 2. Scope check
  echo ""
  echo "── Scope Verification ──────────────────"
  FEATURE=$(jq -r '.features[] | select(.status=="IN_PROGRESS") | .name' features.json)
  if [ -z "$FEATURE" ]; then
    echo "No IN_PROGRESS feature found in features.json"
    exit 1
  fi
  echo "Current feature: $FEATURE"
  echo "Declared scope:"
  jq -r --arg f "$FEATURE"     '.features[] | select(.name==$f) | .scope[]' features.json | sed 's/^/  /'

  # 3. Run test suite
  echo ""
  echo "── Test Suite ──────────────────────────"
  npm test
  echo "Exit code: $?"

  # 4. Progress file freshness
  echo ""
  echo "── Progress File ───────────────────────"
  echo "Last modified: $(git log -1 --format="%ar" -- claude_progress.md)"

  # 5. Open observations
  echo ""
  echo "── Agent Observations ──────────────────"
  awk '/## Observations/,/^## [^O]/' claude_progress.md | head -20
  echo ""
  echo "Review complete. Log saved to $LOG_FILE"
} | tee "$LOG_FILE"