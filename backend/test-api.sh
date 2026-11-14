#!/usr/bin/env bash
# End-to-end API checks for Vanish. Run with the backend already on :8080.
set -u
BASE="http://localhost:8080/api/secrets"
pass=0
fail=0

check() {
  local name="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    printf '  ok    %-42s %s\n' "$name" "$actual"
    pass=$((pass + 1))
  else
    printf '  FAIL  %-42s expected %s, got %s\n' "$name" "$expected" "$actual"
    fail=$((fail + 1))
  fi
}

echo "Create + read"
ID=$(curl -s -X POST "$BASE" -H 'Content-Type: application/json' \
  -d '{"message":"This is my secret"}' | sed -E 's/.*"id":"([^"]+)".*/\1/')
check "POST returns a UUID" "yes" "$(echo "$ID" | grep -Eq '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' && echo yes || echo no)"

BODY=$(curl -s -w '\n%{http_code}' "$BASE/$ID")
check "GET first time status" "200" "$(echo "$BODY" | tail -1)"
check "GET first time message" '{"message":"This is my secret"}' "$(echo "$BODY" | head -1)"

BODY=$(curl -s -w '\n%{http_code}' "$BASE/$ID")
check "GET second time status" "404" "$(echo "$BODY" | tail -1)"
check "GET second time error" '{"error":"This secret has vanished."}' "$(echo "$BODY" | head -1)"

check "GET unknown id status" "404" \
  "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/7d6f4c2e-0000-0000-0000-000000000000")"
check "GET malformed id status" "404" \
  "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/not-a-uuid")"

echo "Validation"
check "POST empty message" "400" \
  "$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE" -H 'Content-Type: application/json' -d '{"message":""}')"
check "POST whitespace only" "400" \
  "$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE" -H 'Content-Type: application/json' -d '{"message":"   "}')"
check "POST missing field" "400" \
  "$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE" -H 'Content-Type: application/json' -d '{}')"

FIVE_THOUSAND=$(printf 'a%.0s' $(seq 1 5000))
check "POST exactly 5000 chars" "200" \
  "$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE" -H 'Content-Type: application/json' -d "{\"message\":\"$FIVE_THOUSAND\"}")"

FIVE_THOUSAND_ONE=$(printf 'a%.0s' $(seq 1 5001))
check "POST 5001 chars" "400" \
  "$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE" -H 'Content-Type: application/json' -d "{\"message\":\"$FIVE_THOUSAND_ONE\"}")"

echo "Concurrent reads"
CONCURRENT_ID=$(curl -s -X POST "$BASE" -H 'Content-Type: application/json' \
  -d '{"message":"only one may win"}' | sed -E 's/.*"id":"([^"]+)".*/\1/')
CODES=$(seq 1 20 | xargs -P 20 -I {} curl -s -o /dev/null -w '%{http_code}\n' "$BASE/$CONCURRENT_ID")
check "20 parallel GETs: exactly one 200" "1" "$(echo "$CODES" | grep -c '^200$')"
check "20 parallel GETs: remaining 404" "19" "$(echo "$CODES" | grep -c '^404$')"

echo
echo "passed=$pass failed=$fail"
[ "$fail" -eq 0 ]
