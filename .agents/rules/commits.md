---
trigger: always_on
description: Commit workflow rules for incremental development.
---

# Commit Workflow Rules

- Make step-by-step commits as coding work progresses
- Keep each commit scoped to one logical change
- Use conventional commit messages for every commit
- Git hooks run through lefthook (`lefthook.yml`, installed by `prepare`): pre-commit runs `vp check --fix` (format, lint, typecheck) and `vp fmt` on staged files and re-stages the fixes; internal content links are validated at build time by `plugins/vite-plugin-link-check.ts`
- Before committing run relevant tests for touched code
- Before commiting run code-simplifier skill
