#!/usr/bin/env bash
# Asks Sentry whether the new version hurt real users in the last
# SENTRY_WINDOW_MINUTES. Run by run.sh every minute of each soak; the decision
# itself is sentry-verdict.jq. SENTRY_ISSUES_ONLY=true (at 100%, where the old
# release no longer serves) skips the error-rate comparison.
#
# Counts error events and the sessions they spoil, not logs: a failed API
# call is the backend's failure and shows up on both versions alike. Each version is a
# Sentry release named after its commit; the 12-char version tag finds it.
#
# In: SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT, SENTRY_ENVIRONMENT,
#     SENTRY_URL, SENTRY_MIN_USERS, SENTRY_MAX_RATE_RATIO, TAG, OLD_TAG,
#     SENTRY_WINDOW_MINUTES, SENTRY_ISSUES_ONLY.
# Exit: 0 healthy, 1 roll back (reason on stdout), 2 Sentry could not answer.
set -euo pipefail
# Any failed query inside measure's $(...) must fail it, not yield half the numbers.
shopt -s inherit_errexit

PERIOD="${SENTRY_WINDOW_MINUTES}m"
API="${SENTRY_URL%/}/api/0"

sentry() {
  local path="$1"
  shift
  curl -sf --retry 3 --retry-all-errors --max-time 30 --get \
    -H "Authorization: Bearer ${SENTRY_AUTH_TOKEN}" "${API}${path}" "$@"
}

# The release a version tag (12-char commit sha) belongs to, or "".
release_for() {
  sentry "/organizations/${SENTRY_ORG}/releases/" \
    --data-urlencode "project=${PROJECT_ID}" --data-urlencode "query=$1" --data-urlencode "per_page=10" \
    | jq -r --arg tag "$1" '[.[].version | select(startswith($tag))] | first // empty'
}

# Errors-dataset query in the soak window: events <fields...> -- <search>
events() {
  local args=() field
  while [ "$1" != "--" ]; do
    field="$1"
    args+=(--data-urlencode "field=${field}")
    shift
  done
  sentry "/organizations/${SENTRY_ORG}/events/" "${args[@]}" \
    --data-urlencode "dataset=errors" --data-urlencode "project=${PROJECT_ID}" \
    --data-urlencode "environment=${SENTRY_ENVIRONMENT}" --data-urlencode "statsPeriod=${PERIOD}" \
    --data-urlencode "query=$2"
}

measure() {
  PROJECT_ID=$(sentry "/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/" | jq -r '.id')
  NEW_RELEASE=$(release_for "${TAG}")
  OLD_RELEASE=$(release_for "${OLD_TAG}")
  if [ -z "${NEW_RELEASE}" ]; then
    # No release: the new version has sent Sentry nothing, so no errors either.
    echo "no Sentry release for ${TAG} yet — it has sent no events" >&2
    NEW_RELEASE="${TAG}"
  fi
  OLD_RELEASE="${OLD_RELEASE:-${OLD_TAG}}"

  local issues issue_users=0
  issues=$(sentry "/organizations/${SENTRY_ORG}/issues/" \
    --data-urlencode "project=${PROJECT_ID}" --data-urlencode "environment=${SENTRY_ENVIRONMENT}" \
    --data-urlencode "statsPeriod=${PERIOD}" --data-urlencode "limit=100" \
    --data-urlencode "query=firstRelease:\"${NEW_RELEASE}\"" | jq -r '[.[].id] | join(",")')
  if [ -n "${issues}" ]; then
    issue_users=$(events "count_unique(user)" -- "issue.id:[${issues}] release:\"${NEW_RELEASE}\"" \
      | jq -r '.data[0]["count_unique(user)"] // 0')
  fi

  # Sessions per release and status: errored, unhandled and crashed ones hit
  # an error (abnormal is a hang, mobile only). 1m buckets: Sentry refuses
  # them past a 12h window, far beyond any soak.
  local sessions
  sessions=$(sentry "/organizations/${SENTRY_ORG}/sessions/" \
    --data-urlencode "project=${PROJECT_ID}" --data-urlencode "environment=${SENTRY_ENVIRONMENT}" \
    --data-urlencode "statsPeriod=${PERIOD}" --data-urlencode "interval=1m" \
    --data-urlencode "field=sum(session)" --data-urlencode "groupBy=release" --data-urlencode "groupBy=session.status" \
    --data-urlencode "query=release:\"${NEW_RELEASE}\" OR release:\"${OLD_RELEASE}\"" \
    | jq '[.groups[] | {release: .by.release, status: .by["session.status"], n: .totals["sum(session)"]}]
          | group_by(.release) | map({key: .[0].release, value: {
              sessions: (map(.n) | add),
              error_sessions: (map(select(.status | IN("errored", "unhandled", "crashed")) | .n) | add // 0)}})
          | from_entries')

  jq -n --arg new "${NEW_RELEASE}" --arg old "${OLD_RELEASE}" \
    --argjson issue_users "${issue_users}" --argjson sessions "${sessions}" \
    --argjson min "${SENTRY_MIN_USERS}" --argjson ratio "${SENTRY_MAX_RATE_RATIO}" \
    --argjson issues_only "${SENTRY_ISSUES_ONLY:-false}" \
    '{new: ({issue_users: $issue_users} + ($sessions[$new] // {sessions: 0, error_sessions: 0})),
      old: ($sessions[$old] // {sessions: 0, error_sessions: 0}),
      min_users: $min, max_rate_ratio: (if $issues_only then null else $ratio end)}'
}

trap 'echo "Sentry could not be queried"; exit 2' ERR
numbers=$(measure)
trap - ERR
echo "Sentry, last ${PERIOD}: $(jq -c . <<<"${numbers}")" >&2
verdict=$(jq -r -f "$(dirname "$0")/sentry-verdict.jq" <<<"${numbers}")
if [ -n "${verdict}" ]; then
  echo "${verdict}"
  exit 1
fi
