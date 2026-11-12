#!/usr/bin/env bash
# The version serving the most traffic now becomes the primary. A brand-new
# Worker has no deployment yet; then the rollout is just putting the new
# version at 100% (safe — no users to split away from).
#
# In: WORKER. Out (GITHUB_ENV): OLD_VERSION_ID (empty on a first deploy) and
# OLD_TAG, its commit tag (the Sentry gate compares the two releases).
set -euo pipefail

CURRENT=$(wrangler deployments status --name "${WORKER}" --json 2>/dev/null || true)
OLD_VERSION_ID=$(jq -r '.versions | max_by(.percentage) | .version_id // empty' <<<"${CURRENT:-{}}" 2>/dev/null || true)
OLD_TAG=""
if [ -n "${OLD_VERSION_ID}" ]; then
  OLD_TAG=$(wrangler versions list --name "${WORKER}" --json \
    | jq -r --arg id "${OLD_VERSION_ID}" '.[] | select(.id == $id) | .annotations["workers/tag"] // empty')
fi
echo "OLD_VERSION_ID=${OLD_VERSION_ID}" >> "${GITHUB_ENV}"
echo "OLD_TAG=${OLD_TAG}" >> "${GITHUB_ENV}"
if [ -n "${OLD_VERSION_ID}" ]; then
  echo "Current serving version: ${OLD_VERSION_ID} (tag ${OLD_TAG:-none})"
else
  echo "No current deployment — this will be the first deploy."
fi
