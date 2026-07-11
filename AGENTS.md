---
trigger: always_on
description: Core project guidelines for Rixl Documentation. Apply these rules when working on any code, documentation, or configuration files.
---

# Rixl Documentation

## Project Overview

The official documentation site for Rixl, built with Next.js and Fumadocs. Features MDX-based content, API documentation generation, internationalization support, and static site export. Provides comprehensive guides for the Rixl platform, Video SDK, and API reference.

## Repository Structure

- app/ - Next.js App Router
  - [lang]/ - Internationalized routes
  - api/ - API routes (search, OG image generation)
- components/
  - layout/ - Page layout components
  - mdx/ - MDX rendering components
  - ui/ - Reusable UI primitives
- content/
  - docs/ - MDX documentation content
- lib/ - Utility functions
  - source adapter, translations, OG generation
- public/ - Static assets
- scripts/ - Build and utility scripts
  - lint.ts - Custom linting
  - generate-api.ts - API docs generation

## Technology Stack

- TypeScript 5.9 (strict type safety required)
- Bun (package manager and runtime)
- Next.js 16 with App Router
- React 19
- Fumadocs (documentation framework)
  - fumadocs-core, fumadocs-ui, fumadocs-mdx
  - fumadocs-openapi (API documentation)
- TailwindCSS 4 (styling)
- Radix UI (accessible UI primitives)
- MDX (documentation content)
- Shiki (syntax highlighting)
- Orama (search functionality)
- next-themes (dark mode support)

## Available Commands

```bash
bun dev       # Start Next.js development server
bun run build     # Lint + Next.js production build
bun serve     # Serve static build output
bun lint      # Run Oxlint + fumadocs-mdx + custom lint
bun lint:fix  # Auto-fix Oxlint issues
bun format    # Format code with Oxfmt
```

## Documentation Content (MDX)

### Writing documentation

- Place MDX files in `content/docs/`
- Use frontmatter for metadata (title, description, etc.)
- Follow Fumadocs conventions for file organization
- Use MDX components from `components/mdx/` for rich content
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

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
