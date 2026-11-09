#!/usr/bin/env bash
# shellcheck disable=SC2016 # gate bodies expand inside the stub, not here
# Tests scripts/rollout/run.sh's decisions with wrangler, sleep and the Sentry
# gate stubbed: what rejects at 0%, what rolls back and when, what only
# reports. Run: mise run test
set -euo pipefail

SRC="$(cd "$(dirname "$0")/../scripts/rollout" && pwd)"
failures=0

# scenario <name> <want> <acceptance fails at> <sentry gate body>
#   want: "<exit> | <last deployment message> | <minutes soaked>", a glob
#   gate body: shell run by the stubbed sentry-gate.sh, which sees
#   SENTRY_WINDOW_MINUTES and SENTRY_ISSUES_ONLY as the real one does
scenario() {
  local name="$1" want="$2" fail_at="$3" gate="$4"
  local dir status=0 got
  dir=$(mktemp -d)
  cp "${SRC}/run.sh" "${dir}/"
  printf '#!/usr/bin/env bash\necho "a release hurt users"\n%s\n' "${gate}" > "${dir}/sentry-gate.sh"
  mkdir "${dir}/bin"
  printf '#!/usr/bin/env bash\nprintf "%%s\\n" "$*" >> "%s/wrangler.log"\n' "${dir}" > "${dir}/bin/wrangler"
  printf '#!/usr/bin/env bash\necho >> "%s/sleep.log"\n' "${dir}" > "${dir}/bin/sleep"
  touch "${dir}/sleep.log"
  chmod +x "${dir}/bin/"*
  PATH="${dir}/bin:${PATH}" WORKER=app TAG=newtag OLD_TAG=oldtag NEW_VERSION_ID=NEW OLD_VERSION_ID=OLD \
    RAMP="10,50,100" WATCH_MINUTES=10 FINAL_WATCH_MINUTES=30 SMOKE_URLS="" \
    ACCEPTANCE_RESULTS_PATH="${dir}/results" ACCEPTANCE_COMMAND="[ \"\${E2E_STAGE}\" != \"${fail_at}\" ]" \
    SENTRY_PROJECT="${SENTRY_PROJECT_UNDER_TEST-dashboard}" \
    bash "${dir}/run.sh" > "${dir}/out.log" 2>&1 || status=$?
  got="${status} | $(tail -1 "${dir}/wrangler.log" | sed -E 's/.*--message (.*)$/\1/') | $(wc -l < "${dir}/sleep.log" | tr -d ' ')m"
  # shellcheck disable=SC2053 # want is a glob on purpose
  if [[ "${got}" == ${want} ]]; then
    echo "ok   ${name}"
  else
    echo "FAIL ${name}: want '${want}', got '${got}'"
    sed 's/^/     /' "${dir}/out.log"
    failures=$((failures + 1))
  fi
  rm -rf "${dir}"
}

scenario "checks fail at 0%: rejected before any user" \
  "1 | rejected newtag: checks failed at 0% | 0m" "0%" "exit 0"
scenario "checks fail at 10%, Sentry quiet: reported, ramp completes" \
  "0 | rollout newtag: 100% | 50m" "10%" "exit 0"
scenario "Sentry quiet: every minute of every soak watched" \
  "0 | rollout newtag: 100% | 50m" "none" "exit 0"
scenario "errors from minute 2 at 10%: rolled back then, not at the soak's end" \
  "1 | rollback newtag: Sentry at 10% after 2m: a release hurt users | 2m" "none" \
  '[ "${SENTRY_WINDOW_MINUTES}" = 2 ] && exit 1; exit 0'
# Also proves the rate rule is off only at 100%: issues-only during the ramp
# would roll back at 10%, not here.
scenario "new issues 5 minutes after 100%: rolled back in the final watch" \
  "1 | rollback newtag: Sentry at 100% after 5m: * | 25m" "none" \
  '[ "${SENTRY_ISSUES_ONLY}" = true ] && [ "${SENTRY_WINDOW_MINUTES}" = 5 ] && exit 1; exit 0'
scenario "Sentry unreachable: warns, ramp completes" \
  "0 | rollout newtag: 100% | 50m" "none" "exit 2"
SENTRY_PROJECT_UNDER_TEST="" scenario "no sentry-project: no gate, ramp completes" \
  "0 | rollout newtag: 100% | 50m" "50%" "exit 1"

[ "${failures}" -eq 0 ] || { echo "${failures} failed"; exit 1; }
