#!/usr/bin/env bash
# Runs the full test suite N times, wiping auth state before each run.
# Usage:
#   bash run-stress-test.sh              # 10 headless runs
#   bash run-stress-test.sh --headed     # 10 headed runs
#   bash run-stress-test.sh --both       # 10 headless + 10 headed (separate reports)

RUNS=10
AUTH_FILE=".auth/user.json"

# ── Parse flags ──────────────────────────────────────────────────────────────
HEADED=false
BOTH=false
for arg in "$@"; do
  case "$arg" in
    --headed) HEADED=true ;;
    --both)   BOTH=true ;;
  esac
done

# --both: run headless then headed, each with a fresh invocation
if [ "$BOTH" = true ]; then
  echo "▶  Running headless pass..."
  bash "$0"
  HEADLESS_EXIT=$?

  echo ""
  echo "▶  Running headed pass..."
  bash "$0" --headed
  HEADED_EXIT=$?

  echo ""
  echo "================================================"
  echo "  Full stress run complete"
  echo "  Headless: $([ $HEADLESS_EXIT -eq 0 ] && echo 'ALL PASSED' || echo 'FAILURES — see stress-report-headless.md')"
  echo "  Headed:   $([ $HEADED_EXIT -eq 0 ] && echo 'ALL PASSED' || echo 'FAILURES — see stress-report-headed.md')"
  echo "================================================"
  exit $(( HEADLESS_EXIT | HEADED_EXIT ))
fi

HEADED_FLAG=""
MODE="headless"
if [ "$HEADED" = true ]; then
  HEADED_FLAG="--headed"
  MODE="headed"
fi

REPORT="stress-report-${MODE}.md"
PASS=0
FAIL=0
FAILED_RUNS=()

{
  echo "# Stress Test Report"
  echo ""
  echo "**Date:** $(date '+%Y-%m-%d %H:%M:%S')"
  echo "**Runs:** $RUNS"
  echo "**Mode:** $MODE"
  echo "**Branch:** $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
  echo "**Commit:** $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
  echo ""
  echo "---"
  echo ""
} > "$REPORT"

for i in $(seq 1 $RUNS); do
  echo ""
  echo "▶  Run $i / $RUNS [$MODE] — wiping auth state..."
  rm -f "$AUTH_FILE"

  START=$(date +%s)
  OUTPUT=$(npx playwright test $HEADED_FLAG 2>&1)
  EXIT_CODE=$?
  END=$(date +%s)
  DURATION=$((END - START))

  SUMMARY=$(echo "$OUTPUT" | grep -E "^\s+[0-9]+ (passed|failed)" | tr '\n' ' ' | sed 's/^[[:space:]]*//')

  if [ $EXIT_CODE -eq 0 ]; then
    STATUS="PASS"
    PASS=$((PASS + 1))
    echo "   ✅ PASS — ${SUMMARY} (${DURATION}s)"
  else
    STATUS="FAIL"
    FAIL=$((FAIL + 1))
    FAILED_RUNS+=("$i")
    echo "   ❌ FAIL — ${SUMMARY} (${DURATION}s)"
    echo ""
    echo "--- FAILURE OUTPUT (Run $i) ---"
    echo "$OUTPUT"
    echo "--- END FAILURE OUTPUT ---"
  fi

  {
    if [ "$STATUS" = "PASS" ]; then
      echo "## Run $i [$MODE] — ✅ PASS"
    else
      echo "## Run $i [$MODE] — ❌ FAIL"
    fi
    echo ""
    echo "| | |"
    echo "|---|---|"
    echo "| Time | $(date '+%H:%M:%S') |"
    echo "| Duration | ${DURATION}s |"
    echo "| Mode | $MODE |"
    echo "| Result | ${SUMMARY:-no summary} |"
    echo ""
  } >> "$REPORT"

  if [ "$STATUS" = "FAIL" ]; then
    {
      echo "### Failure Output"
      echo ""
      echo '```'
      echo "$OUTPUT"
      echo '```'
      echo ""
    } >> "$REPORT"
  fi

  echo "---" >> "$REPORT"
  echo "" >> "$REPORT"
done

{
  echo "## Summary"
  echo ""
  echo "| Metric | Value |"
  echo "|--------|-------|"
  echo "| Total runs | $RUNS |"
  echo "| Mode | $MODE |"
  echo "| ✅ Passed | $PASS |"
  echo "| ❌ Failed | $FAIL |"
  if [ ${#FAILED_RUNS[@]} -gt 0 ]; then
    echo "| Failed on runs | ${FAILED_RUNS[*]} |"
  fi
} >> "$REPORT"

echo ""
echo "================================================"
echo "  Stress test complete [$MODE]: $PASS / $RUNS passed"
if [ ${#FAILED_RUNS[@]} -gt 0 ]; then
  echo "  Failed on runs: ${FAILED_RUNS[*]}"
  echo "  Full failure output above and in: $REPORT"
fi
echo "  Report: $REPORT"
echo "================================================"
