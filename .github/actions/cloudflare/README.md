# Vendored rollout scripts

Copied from `rixlhq/github-actions` at `3c98445`:
`.github/actions/cloudflare/{action.yml,scripts/rollout/*,test/*}`.

docs is a public repository, and a public repository cannot use workflows or
actions from a private one, so it keeps its own copy. `rollout.yml` calls this
action as `./.github/actions/cloudflare`.

Keep it in sync by hand. Diff against upstream; the only intended difference is
the block marked `DOCS DIVERGENCE` in `scripts/rollout/run.sh`, which smoke-tests
the version's preview URL instead of sending the version-override header. Once
upstream accepts that as an input, delete the block and re-copy the files.

Tests: `bash test/rollout-run.test.sh && bash test/sentry-verdict.test.sh`.
