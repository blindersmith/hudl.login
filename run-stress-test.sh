#!/usr/bin/env bash
# Runs the full test suite N times, wiping auth state before each run.
# Usage: bash run-stress-test.sh [--headed]
# Failures are captured with full output. Results written to stress-report.md.

RUNS=10
AUTH_FILE=".auth/user.json"
PASS=0
FAIL=0
FAILED_RUNS=()

# Parse optional --headed flag
HEADED=false
HEADED_FLAG=""
MODE="headless"
for arg in "$@"; do
  if [ "$arg" = "--headed" ]; then
    HEADED=true
    HEADED_FLAG="--headed"
    MODE="headed"
  fi
done

REPORT="stress-report-${MODE}.md"

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
fi
echo "  Report: $REPORT"
echo "================================================"
