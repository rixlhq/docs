---
trigger: always_on
description: How to prepare, check and write a commit.
---

# Commits

A commit records claims: the message and the code. Only commit what has been checked.

## Order

1. Finish one logical change.
2. Run the checks for what you touched: `vp check`, and `vp run build` when content, routes or plugins changed (the build validates every internal link).
3. Run the `code-simplifier` skill on the changed code, then rerun the checks.
4. Commit. Then move on to the next change.

## Hooks

Lefthook runs them (`lefthook.yml`, installed by `prepare`, using the version pinned in `package.json`):

- **pre-commit:** `vp check --fix` on staged code, JSON, Markdown, YAML and CSS. Fixes are re-staged.
- **pre-push:** `vp build`, which also checks internal content links (`plugins/vite-plugin-link-check.ts`).

Never skip a hook (`--no-verify`, `-n`, `LEFTHOOK=0`, `core.hooksPath`). If a hook fails, fix the cause. For Claude Code this is enforced: `.agents/hooks/no-skip-git-hooks.mjs` blocks those commands.

## Messages

- Conventional commits (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`, `build`, `perf`, `style`).
- One logical change per commit. Commit only what the current step changed.
- Body says why, not what. State only claims you checked: "reduces" when you measured a reduction, not "fixes".

## `main`

Nothing in GitHub blocks these; the team holds them.

- Never merge or push to `main` while CI is red.
- Push directly to `main` only when a human asks for a hotfix. Everything else goes through a pull request. The one automated exception is `generate.yml`, which commits the new `.openapi-spec-sha` when the API spec changes.
