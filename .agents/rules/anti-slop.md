---
trigger: always_on
description: What counts as slop in code, docs pages and commit messages, and how to avoid it.
---

# Anti-slop rules

Slop is work that looks finished but isn't: it compiles, often passes checks and reads confidently, yet adds nothing or is wrong.

## Code

- No dead code. If nothing calls it, delete it.
- No commented-out code. Git keeps the history.
- No premature abstraction. Extract at three real call sites, not one.
- No "just in case" code: no handling for cases that can't happen, no fallbacks nobody asked for.
- No TODO or FIXME without a linked ticket (`// TODO(CU-<id>): …`). If it isn't worth a ticket, delete it.
- No magic numbers or strings. Name the constant.
- Functions do one thing. If the name needs "and", split it.
- Names say what the thing does. A reader shouldn't need the body to know.
- Comments explain why, never what.
- A change is as big as the problem. No drive-by refactors in a feature or fix.

## Documentation pages (`content/`)

The pages are what customers read and copy from, so a wrong page is a bug.

- Every code example runs against the current SDK and API. Check a name, prop or endpoint against the source (`@rixl/media-react`, the OpenAPI spec) before you write it.
- No invented behaviour, limits, prices or timings. If the source doesn't say it, don't.
- Link to the page that explains a term instead of explaining it again.
- No filler: "robust", "seamless", "comprehensive", "leverage", "it's worth noting", "in order to".

## Prose (PR descriptions, commit messages, UI copy)

- Every technical claim points at something real: a file, a command's output, a doc link.
- No invented metrics, timings or percentages.
- Say what changed and why. Don't narrate the steps you took.
