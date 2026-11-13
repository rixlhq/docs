#!/usr/bin/env bash
# Tests scripts/rollout/sentry-verdict.jq: when Sentry's numbers roll a
# release back. Run: vp run test:actions
set -euo pipefail

JQ="$(dirname "$0")/../scripts/rollout/sentry-verdict.jq"
failures=0

# expect <name> <rolls back: yes|no> <new issue users> <new error sessions> <new sessions> <old error sessions> <old sessions> [ratio]
expect() {
  local name="$1" want="$2" got verdict
  verdict=$(jq -rn \
    --argjson ni "$3" --argjson ne "$4" --argjson nu "$5" --argjson oe "$6" --argjson ou "$7" \
    --argjson ratio "${8:-2}" \
    '{new: {issue_users: $ni, error_sessions: $ne, sessions: $nu}, old: {error_sessions: $oe, sessions: $ou},
      min_users: 3, max_rate_ratio: $ratio}' | jq -r -f "${JQ}")
  got=no
  [ -n "${verdict}" ] && got=yes
  if [ "${got}" = "${want}" ]; then
    echo "ok   ${name}${verdict:+ (${verdict})}"
  else
    echo "FAIL ${name}: want rollback=${want}, got '${verdict}'"
    failures=$((failures + 1))
  fi
}

expect "no errors" no 0 0 100 0 900
expect "a new issue reaching 3 users" yes 3 3 100 0 900
expect "a new issue reaching 2 users" no 2 2 100 0 900
expect "error rate above twice the old one" yes 0 10 100 18 900
expect "error rate at twice the old one" no 0 4 100 18 900
expect "same rate as the old one (backend outage hits both)" no 0 20 100 180 900
expect "errors on the new one only, in enough sessions" yes 0 3 100 0 900
expect "errors on the new one only, in too few sessions" no 0 2 100 0 900
expect "no sessions on the new one yet" no 0 3 0 0 900
expect "at 100%: a high rate alone does not count" no 0 30 900 0 0 null
expect "at 100%: a new issue reaching 3 users" yes 3 3 900 0 0 null

[ "${failures}" -eq 0 ] || { echo "${failures} failed"; exit 1; }
