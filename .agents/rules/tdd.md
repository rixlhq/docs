---
trigger: when writing or modifying production code
description: Red/green/refactor for code changes in src, plugins, scripts and the Cloudflare action.
---

# TDD

Applies to code in `src/`, `plugins/`, `scripts/` and `.github/actions/cloudflare/scripts/`. Pages under `content/` are checked by the build (link check, icon validation), not by tests.

## Cycle

1. **Red** — Write a failing test that describes the expected behaviour.
2. **Green** — Write the least code that makes it pass.
3. **Refactor** — Clean up with the tests green.

## Rules

- No production code without a failing test first. A bug fix starts with a test that reproduces the bug.
- Tests describe behaviour ("a link to a missing heading fails the build"), not implementation ("reads every file once").
- One assertion per test unless the assertions check the same behaviour.
- Run `vp test` after every green and refactor step.
- After the unit cycle, add `[property]` tests with fast-check for pure functions.
- Mutation testing runs weekly in CI (`.github/workflows/mutation.yml`), not per change. When the `mutation-report` issue lists surviving mutants in code you own, kill them with assertions, or delete the code they show nobody needs.
- A new or changed MDX component gets an axe browser test (`*.ct.tsx`) once its unit tests pass.

## Commits

- Commit after each completed cycle (`.agents/rules/commits.md`).
- Never commit a failing test to `main`.
