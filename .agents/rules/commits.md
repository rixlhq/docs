---
trigger: always_on
description: Commit workflow rules for incremental development.
---

# Commit Workflow Rules

- Make step-by-step commits as coding work progresses
- Keep each commit scoped to one logical change
- Use conventional commit messages for every commit
- Git hooks run through lefthook (`lefthook.yml`, installed by `prepare`): pre-commit runs `vp check --fix` (format, lint, typecheck) and `vp fmt` on staged files and re-stages the fixes; pre-push runs the link check (`vp run lint:links`) when MDX content changed
- Before committing run relevant tests for touched code
- Before commiting run code-simplifier skill
