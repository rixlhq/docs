#!/usr/bin/env bash
# Waits for the version cf:upload tagged with TAG. A red build uploads
# nothing, so a broken merge can never roll out. A dry run plans against the
# newest version instead of waiting.
#
# In: WORKER, TAG, WAIT_MINUTES, DRY_RUN. Out (GITHUB_ENV): NEW_VERSION_ID.
set -euo pipefail

deadline=$(( $(date +%s) + WAIT_MINUTES * 60 ))
NEW_VERSION_ID=""
while [ "$(date +%s)" -lt "${deadline}" ]; do
  NEW_VERSION_ID=$(wrangler versions list --name "${WORKER}" --json \
    | jq -r --arg t "${TAG}" '[.[] | select(.annotations["workers/tag"] == $t)] | last | .id // empty')
  [ -n "${NEW_VERSION_ID}" ] && break
  if [ "${DRY_RUN}" = "true" ]; then
    # A dry run should be runnable before cf:upload exists — plan
    # against the newest uploaded version instead of waiting.
    NEW_VERSION_ID=$(wrangler versions list --name "${WORKER}" --json \
      | jq -r 'last | .id // empty')
    if [ -n "${NEW_VERSION_ID}" ]; then
      echo "No version tagged ${TAG}; dry run will plan against the latest version (${NEW_VERSION_ID})."
    fi
    break
  fi
  echo "No version tagged ${TAG} yet; retrying in 30s"
  sleep 30
done
if [ -z "${NEW_VERSION_ID}" ]; then
  echo "::error::No ${WORKER} version tagged ${TAG} after ${WAIT_MINUTES}m — the Cloudflare build probably failed (a red ci:build uploads nothing)."
  exit 1
fi
echo "NEW_VERSION_ID=${NEW_VERSION_ID}" >> "${GITHUB_ENV}"
