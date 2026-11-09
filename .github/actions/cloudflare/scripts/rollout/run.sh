#!/usr/bin/env bash
# Moves traffic to the new version in steps and checks it at each one.
#
#   1. add the new version at 0% (a version override only reaches a version
#      in the current deployment), then smoke and acceptance-check it. A
#      failure here rejects it: it leaves the deployment before any user got
#      it, and the run turns red.
#   2. for each RAMP step: deploy the split and soak WATCH_MINUTES
#      (FINAL_WATCH_MINUTES at 100%), asking Sentry every minute
#      (sentry-gate.sh), then run the same checks report-only. Only errors
#      real users hit on the new version roll it back: a check failing once
#      users are on it is more often the environment (API down, test data)
#      than the release, and the 0% stage already ran it on this version.
#
# In: WORKER, TAG, OLD_TAG, NEW_VERSION_ID, OLD_VERSION_ID, RAMP,
#     WATCH_MINUTES, FINAL_WATCH_MINUTES, SMOKE_URLS, ACCEPTANCE_COMMAND, ACCEPTANCE_RESULTS_PATH,
#     SENTRY_PROJECT (empty: no Sentry gate) and what sentry-gate.sh reads.
set -euo pipefail

rollback() {
  echo "::error::${1} — rolling ${WORKER} back to ${OLD_VERSION_ID} at 100%"
  wrangler versions deploy "${OLD_VERSION_ID}@100" \
    --name "${WORKER}" -y --message "rollback ${TAG}: ${1}" || true
  exit 1
}

# At 0% no user has the new version, so removing it is not a rollback.
reject() {
  echo "::error::${1} — ${TAG} never took traffic; ${WORKER} stays on ${OLD_VERSION_ID}"
  wrangler versions deploy "${OLD_VERSION_ID}@100" \
    --name "${WORKER}" -y --message "rejected ${TAG}: ${1}" || true
  exit 1
}

smoke() {
  local label="$1"
  local failed=""
  [ -n "${SMOKE_URLS}" ] || echo "no smoke urls configured, skipping the curl checks"
  for url in ${SMOKE_URLS//,/ }; do
    # DOCS DIVERGENCE (not upstream yet): with SMOKE_PREVIEW_SUBDOMAIN set,
    # smoke the new version's own preview URL (same path). On docs.rixl.com
    # the override header is not honoured for HTML, so the old version or
    # its cache answers. Upstream this as an input, then drop this block.
    if [ -n "${SMOKE_PREVIEW_SUBDOMAIN:-}" ]; then
      url="https://${NEW_VERSION_ID:0:8}-${WORKER}.${SMOKE_PREVIEW_SUBDOMAIN}$(echo "${url}" | sed -E 's|https?://[^/]+||')"
    fi
    echo "smoke ${label}: ${url}"
    body=$(curl -s -o /dev/null -w '%{http_code}' \
      -H "Cloudflare-Workers-Version-Overrides: ${WORKER}=\"${NEW_VERSION_ID}\"" "${url}") || failed=1
    if [ "${body}" != "200" ]; then
      echo "::error::${url} returned ${body}, not 200"
      failed=1
      continue
    fi
    # The page loads; now prove its main JS bundle does too — the
    # classic split-version breakage is new HTML referencing chunks
    # that don't exist on this version.
    host=$(echo "${url}" | sed -E 's|https?://([^/]+).*|\1|')
    scheme=$(echo "${url}" | sed -E 's|(https?)://.*|\1|')
    html=$(curl -sf -H "Cloudflare-Workers-Version-Overrides: ${WORKER}=\"${NEW_VERSION_ID}\"" "${url}") || failed=1
    js=$(grep -oE 'src="[^"]+\.js[^"]*"' <<<"${html:-}" | head -1 | cut -d'"' -f2 || true)
    if [ -z "${js}" ]; then
      echo "::error::no <script src> found on ${url} — page looks broken"
      failed=1
      continue
    fi
    case "${js}" in
      http*) js_url="${js}" ;;
      *)     js_url="${scheme}://${host}${js}" ;;
    esac
    js_code=$(curl -s -o /dev/null -w '%{http_code}' \
      -H "Cloudflare-Workers-Version-Overrides: ${WORKER}=\"${NEW_VERSION_ID}\"" "${js_url}") || failed=1
    if [ "${js_code}" != "200" ]; then
      echo "::error::${js_url} returned ${js_code}, not 200"
      failed=1
    fi
  done
  [ -z "${failed}" ] || return 1
  acceptance "${label}"
}

# Browser checks against the candidate. The old version is passed
# while it is still in the deployment, so the suite can drill a
# per-client rollback onto it; at 100% it has left, and the override
# would no longer reach it.
acceptance() {
  local label="$1"
  [ -n "${ACCEPTANCE_COMMAND}" ] || return 0
  local primary="${OLD_VERSION_ID}"
  [ "${label}" = "100%" ] && primary=""
  echo "::group::acceptance ${label}"
  local status=0
  E2E_WORKER="${WORKER}" \
  E2E_CANDIDATE_VERSION_ID="${NEW_VERSION_ID}" \
  E2E_PRIMARY_VERSION_ID="${primary}" \
  E2E_STAGE="${label}" \
  E2E_RESULTS_DIR="${ACCEPTANCE_RESULTS_PATH}/${label%\%}pct" \
    bash -euo pipefail -c "${ACCEPTANCE_COMMAND}" < /dev/null || status=$?
  echo "::endgroup::"
  if [ "${status}" -ne 0 ]; then
    echo "::error::acceptance checks failed at ${label} (exit ${status})"
    return 1
  fi
}

# Asks Sentry about the window since this step began. At 100% the old
# release no longer serves, so only new issues count, not the rate compared.
judge() {
  local label="$1" minutes="$2" issues_only=false verdict status=0
  [ "${label}" = "100%" ] && issues_only=true
  verdict=$(SENTRY_WINDOW_MINUTES="${minutes}" SENTRY_ISSUES_ONLY="${issues_only}" \
    bash "$(dirname "$0")/sentry-gate.sh") || status=$?
  case "${status}" in
    0) ;;
    1) rollback "Sentry at ${label} after ${minutes}m: ${verdict}" ;;
    *) echo "::warning::${verdict} at ${label} — carrying on without its verdict" ;;
  esac
}

# Holds a step for <minutes>, asking Sentry every minute so a release that
# hurts users is rolled back within about a minute, not at the soak's end.
soak() {
  local label="$1" minutes="$2" m
  [ "${minutes}" -gt 0 ] || return 0
  echo "Watching ${label} for ${minutes}m"
  for ((m = 1; m <= minutes; m++)); do
    sleep 60
    [ -z "${SENTRY_PROJECT}" ] || judge "${label}" "${m}"
  done
}

if [ -z "${OLD_VERSION_ID}" ]; then
  echo "First deploy — straight to 100%."
  wrangler versions deploy "${NEW_VERSION_ID}@100" \
    --name "${WORKER}" -y --message "first deploy ${TAG}"
  exit 0
fi

# Add the new version to the deployment at 0% so the override header
# can reach it without routing real users to it.
echo "Adding ${NEW_VERSION_ID} at 0%"
wrangler versions deploy "${OLD_VERSION_ID}@100" "${NEW_VERSION_ID}@0" \
  --name "${WORKER}" -y --message "rollout ${TAG}: add at 0%" \
  || rollback "deploy to 0% failed"

smoke "0%" || reject "checks failed at 0%"

# Once users are on it, checks only report; Sentry decides (soak).
for p in ${RAMP//,/ }; do
  if [ "${p}" = "100" ]; then
    echo "Moving to 100%"
    wrangler versions deploy "${NEW_VERSION_ID}@100" \
      --name "${WORKER}" -y --message "rollout ${TAG}: 100%" \
      || rollback "deploy to 100% failed"
    soak "100%" "${FINAL_WATCH_MINUTES}"
  else
    echo "Moving to ${p}%"
    wrangler versions deploy "${OLD_VERSION_ID}@$((100 - p))" "${NEW_VERSION_ID}@${p}" \
      --name "${WORKER}" -y --message "rollout ${TAG}: ${p}%" \
      || rollback "deploy to ${p}% failed"
    soak "${p}%" "${WATCH_MINUTES}"
  fi
  smoke "${p}%" || echo "::warning::checks failed at ${p}% — report only; Sentry decides rollbacks"
done

echo "Rollout of ${TAG} complete on ${WORKER}."
