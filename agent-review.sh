#!/bin/bash
# agent-review.sh — Run after each agent session to verify session output
set -e
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
jq -r --arg f "$FEATURE" \
  '.features[] | select(.name==$f) | .scope[]' features.json | sed 's/^/  /'

# 3. Run test suite
echo ""
echo "── Test Suite ──────────────────────────"
npm test
echo "Exit code: $?"

# 4. Progress file freshness
echo ""
echo "── Progress File ───────────────────────"
echo "Last modified: $(git log -1 --format="%ar" -- claude-progress.md)"

# 5. Open observations
echo ""
echo "── Agent Observations ──────────────────"
awk '/## Observations/,/^## [^O]/' claude-progress.md | head -20
echo ""
echo "Review complete."