#!/usr/bin/env bash
# Fails before any traffic moves when the Sentry gate could not judge the
# release: a missing token or project would let every release through.
#
# In: SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT, SENTRY_URL, WATCH_MINUTES.
set -euo pipefail

if [ -z "${SENTRY_AUTH_TOKEN:-}" ]; then
  echo "::error::sentry-project is set but the SENTRY_AUTH_TOKEN secret is empty"
  exit 1
fi
if [ "${WATCH_MINUTES}" -le 0 ]; then
  echo "::error::the Sentry gate needs watch-minutes > 0: it judges each soak"
  exit 1
fi
if ! curl -sf --retry 3 --retry-all-errors --max-time 30 -o /dev/null \
  -H "Authorization: Bearer ${SENTRY_AUTH_TOKEN}" \
  "${SENTRY_URL%/}/api/0/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/"; then
  echo "::error::cannot read Sentry project ${SENTRY_ORG}/${SENTRY_PROJECT} at ${SENTRY_URL} — check the token's scopes"
  exit 1
fi
echo "Sentry gate: ${SENTRY_ORG}/${SENTRY_PROJECT} readable"
