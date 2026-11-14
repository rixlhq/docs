---
trigger: always_on
description: TypeScript, component, styling and i18n rules for the Rixl documentation site.
---

# Code style

Lint and complexity caps live in the `lint` block of `vite.config.ts`. `vp check` enforces them; this file doesn't repeat them.

## TypeScript

- Keep strict typing. Don't weaken `tsconfig.json` to make code compile.
- No `any`. A lint suppression states its reason on the same line: `// oxlint-disable-next-line <rule> -- <reason>`.
- `as` only with a comment on the line above saying why the compiler can't know.
- Generics only when they make the types more correct.
- Import `src/*` as `@/*`.

## Structure and components

- Co-locate a feature's components, helpers and types.
- One exported component per file. Exported functions and components use `function` declarations.
- Keep components small and props minimal. Prefer composition over large components.
- MDX components live in `src/components/mdx/` and are registered in `src/components/mdx-components.tsx`.
- Never edit generated files: `src/generated/`, `src/paraglide/`, `src/routeTree.gen.ts`.

## Data

- Components render; they don't fetch. Content and API data load in `src/lib/` (`source.server.ts`, `openapi.server.ts`) and in route loaders.

## Styling

- Tailwind utilities, with the Fumadocs theme tokens (`bg-fd-primary`, `text-fd-muted-foreground`). Inline `style` only for values computed at runtime.
- Merge classes with `import {cn} from "cn"`. Don't use `tailwind-merge` or a local `cn` helper.
- Reuse the primitives in `src/components/ui/` before building a new one.

## i18n

- No hardcoded user-facing strings in components. Use `m.<key>()` from `@/paraglide/messages` (`m.search()`), with the key in `messages/en.json`.
- Page text belongs in MDX under `content/en/`, not in components.
