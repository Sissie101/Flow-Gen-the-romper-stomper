#!/bin/sh
# Health monitor for FlowGen Docker services.
# Polls the app's /api/health endpoint and alerts on failures.
# Sends alerts to a webhook (Discord/Slack/Teams) if ALERT_WEBHOOK_URL is set.

APP_URL="${APP_URL:-http://app:3000/api/health}"
INTERVAL="${CHECK_INTERVAL:-30}"
FAIL_THRESHOLD="${FAIL_THRESHOLD:-3}"
WEBHOOK_URL="${ALERT_WEBHOOK_URL:-}"

fail_count=0
last_alert_time=0
ALERT_COOLDOWN=300  # Don't re-alert within 5 minutes

send_alert() {
  msg="$1"
  echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] ALERT: $msg"
  if [ -n "$WEBHOOK_URL" ]; then
    curl -sf -X POST "$WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "{\"content\":\"🚨 FlowGen Alert: $msg\"}" \
      > /dev/null 2>&1 && echo "  -> Webhook notification sent." \
      || echo "  -> Webhook delivery failed (will retry next alert)."
  fi
}

echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] Health monitor started — polling $APP_URL every ${INTERVAL}s, threshold=$FAIL_THRESHOLD"

while true; do
  if curl -sf --max-time 10 "$APP_URL" > /dev/null 2>&1; then
    if [ "$fail_count" -gt 0 ]; then
      echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] Service recovered after $fail_count failure(s)."
      fail_count=0
    fi
  else
    fail_count=$((fail_count + 1))
    echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] Health check failed ($fail_count/$FAIL_THRESHOLD)"
    if [ "$fail_count" -ge "$FAIL_THRESHOLD" ]; then
      now=$(date +%s)
      if [ $((now - last_alert_time)) -ge "$ALERT_COOLDOWN" ]; then
        send_alert "Service unreachable at $APP_URL (failed $fail_count consecutive checks)"
        last_alert_time=$now
      fi
    fi
  fi
  sleep "$INTERVAL"
done
