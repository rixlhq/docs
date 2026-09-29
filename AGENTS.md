---
trigger: always_on
description: Core project guidelines for Rixl Documentation. Apply these rules when working on any code, documentation, or configuration files.
---

# Rixl Documentation

## Project Overview

The official documentation site for Rixl (`docs.rixl.com`), built with TanStack Start, Fumadocs and Vite+. MDX content, API reference generated from the OpenAPI spec, live `@rixl/media-react` player demos, and i18n (`en`, `de`). It builds to static files plus a SPA fallback and deploys to the Cloudflare Worker `rixl-docs`.

## Repository Structure

- `src/routes/` - TanStack Router file routes
  - `$lang/` - localized doc pages
  - `api/` - search and OG image routes
  - `sitemap[.]xml.ts`, `robots[.]txt.ts` - SEO
- `src/components/` - layout, `mdx/` (MDX components, incl. the API page), `ui/`
- `src/lib/` - Fumadocs source adapter, OpenAPI pages, i18n, OG generation
- `src/generated/`, `src/paraglide/`, `src/routeTree.gen.ts` - generated; never edit
- `content/<locale>/` - MDX documentation (`en` is the source, `de` is translated)
- `plugins/vite-plugin-extract-icons.ts` - generates the icon subset used by content
- `scripts/lint.ts` - internal link checker (`vp run lint:links`)
- `source.config.ts` - Fumadocs collections and frontmatter schemas
- `wrangler.jsonc` - Cloudflare Worker config (`rixl-docs`, `docs.rixl.com`, previews)

## Technology Stack

- TypeScript 7 (strict type safety required)
- Vite+ (`vp`): Vite, Rolldown, Oxlint, Oxfmt; Node 24 (`.node-version`)
- TanStack Start + TanStack Router (static prerender)
- React 19
- Fumadocs 16 (`fumadocs-core`, `fumadocs-ui`, `fumadocs-mdx`)
  - `fumadocs-openapi` pinned to v11: v12 breaks `api-page.server.tsx` and `get-llm-text`
- Tailwind CSS 4, Radix UI primitives
- Shiki (syntax highlighting), Orama (search)
- Paraglide JS / inlang (i18n)
- `@rixl/media-react` (player demos)

## Available Commands

Use `vp` for everything; don't call `bun`, `npm` or `npx` directly. Vite+ runs tools on Node and drives the package manager declared in `package.json`.

```bash
vp install           # Install dependencies (postinstall generates MDX sources, icons, Paraglide)
vp dev               # Dev server (http://localhost:3000)
vp run build         # Clean + lint + production build (the Cloudflare gate is `ci:build` = this)
vp preview           # Preview the production build
vp run lint          # Oxlint (max-warnings=0) + fumadocs-mdx
vp run lint:fix      # Auto-fix Oxlint issues
vp run lint:links    # Check internal links in content
vp fmt               # Format with Oxfmt
```

Deploys: merging to `main` uploads a tagged Worker version (`cf:upload`) and the vendored `rollout.yml` smoke-tests and promotes it. docs is a public repo, so it can't call the private shared workflows; port shared-workflow fixes here by hand.

## Documentation Content (MDX)

### Writing documentation

- Place MDX files in `content/en/` (the `de` locale is translated from it)
- Use frontmatter for metadata (title, description, etc.)
- Follow Fumadocs conventions for file organization
- Use MDX components from `src/components/mdx/` for rich content
- Include code examples with proper syntax highlighting

### MDX rules

- Keep pages focused on a single topic
- Use clear, concise language
- Include practical code examples
- Link to related documentation
- Keep code examples up-to-date with the SDK

## TypeScript Requirements

- Never use `any` types – Always use proper TypeScript types
- Prefer explicit interfaces and type definitions
- Use generics when appropriate for reusable components
- Leverage type inference where it improves readability

## Class Name Utilities

Use `cn` for merging Tailwind CSS classes. Do not use `tailwind-merge` or a local `lib/cn` helper.

```tsx
import {cn} from "cn";

<div className={cn("base-class", props.className, condition && "conditional-class")} />;
```
