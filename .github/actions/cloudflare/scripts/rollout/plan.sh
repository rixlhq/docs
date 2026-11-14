#!/usr/bin/env bash
# Prints every traffic step the rollout will take. Changes nothing.
#
# In: WORKER, TAG, NEW_VERSION_ID, OLD_VERSION_ID, RAMP, WATCH_MINUTES,
#     FINAL_WATCH_MINUTES, SMOKE_URLS, DRY_RUN, SENTRY_PROJECT.
set -euo pipefail

GATE="checks report only"
[ -n "${SENTRY_PROJECT:-}" ] && GATE="checks report, Sentry ${SENTRY_PROJECT} asked every minute"

echo "::group::Rollout plan for ${WORKER}"
echo "new version : ${NEW_VERSION_ID} (tag ${TAG})"
echo "old version : ${OLD_VERSION_ID:-none}"
if [ -n "${OLD_VERSION_ID}" ]; then
  echo "steps       : ${OLD_VERSION_ID}@100 + ${NEW_VERSION_ID}@0 → checks (a failure rejects it)"
  for p in ${RAMP//,/ }; do
    if [ "${p}" = "100" ]; then
      echo "            → ${NEW_VERSION_ID}@100, watch ${FINAL_WATCH_MINUTES:-0}m, ${GATE}"
    else
      echo "            → ${NEW_VERSION_ID}@${p} + ${OLD_VERSION_ID}@$((100 - p)), watch ${WATCH_MINUTES}m, ${GATE}"
    fi
  done
else
  echo "steps       : ${NEW_VERSION_ID}@100 (first deploy)"
fi
echo "smoke urls  : ${SMOKE_URLS:-none}"
echo "dry run     : ${DRY_RUN}"
echo "::endgroup::"
if [ "${DRY_RUN}" = "true" ]; then
  echo "Dry run — no traffic changes."
fi
