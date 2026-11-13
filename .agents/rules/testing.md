---
trigger: when writing tests or reviewing test coverage
description: Testing tools, where tests live and what each kind proves for the docs site.
---

# Testing

Test projects are in the `test` block of `vite.config.ts`. Each one sets `extends: false`, so tests load only the plugins they list (Paraglide, and Tailwind for the browser project), never TanStack Start, MDX or Sentry.

## Tools

| Tool                | Purpose                                                                          | Command                                      |
| ------------------- | -------------------------------------------------------------------------------- | -------------------------------------------- |
| Vitest (`unit`)     | `src/lib`, the API page helpers, the build plugins and scripts, in Node          | `vp test --project unit`                     |
| fast-check          | Property tests for pure functions with wide inputs                               | inside the unit tests, titled `[property] …` |
| Vitest Browser Mode | MDX components rendered in real Chromium with the site CSS                       | `vp test --project browser`                  |
| axe-core            | WCAG 2.2 AA checks on those components, in the light and dark theme              | `axeViolations()` from `test/a11y.ts`        |
| Bash tests          | The Cloudflare rollout and Sentry gate scripts, with wrangler and Sentry stubbed | `vp run test:actions`                        |

Tests import Vitest APIs from `vite-plus/test`. Install Chromium once per machine with `vpx playwright install chromium`.

## When to use each

- **Unit** — Logic in `src/lib/`, `src/components/mdx/api-page/` helpers, `plugins/` and `scripts/lib/`. Build plugins run against a temporary `content/` folder made with `fs.mkdtemp`, never the real one. Mock the OpenAPI loader (`src/lib/openapi.server.ts`); tests never fetch the spec or call the API.
- **fast-check** — Pure functions over URLs, paths, schemas and status codes. Assert an invariant across generated inputs. Property tests widen the inputs; they don't prove the assertions are strong enough.
- **Browser and axe** — Every component in `src/components/mdx/` that `src/components/mdx-components.tsx` gives to pages gets a test asserting `expect(await axeViolations(container)).toEqual([])` in both themes (`setTheme`). Wrap components that render TanStack `<Link>` in a router. axe finds about a third of accessibility issues: it can't judge whether a label or alt text is meaningful. Components from `@rixl/media-react` (Video, Image, Feed) are tested in mediasdk, not here.
- **Bash tests** — Any change to `.github/actions/cloudflare/scripts/` adds or updates a scenario in `.github/actions/cloudflare/test/`.

## Test location

- Co-located in `__tests__/` next to the source.
- Unit: `__tests__/<name>.test.ts` or `.test.tsx`
- Browser: `__tests__/<name>.ct.tsx`
- Shared browser helpers and setup: `test/`

## Quality gates

- Deterministic: no network, no real clock, no shared state between tests.
- Before trusting a new test, break the code it covers and watch it fail, then restore the code.
- A test that only restates the implementation is slop. Assert behaviour a reader of the docs or the build would notice.
