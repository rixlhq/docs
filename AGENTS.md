---
trigger: always_on
description: Core project guidelines for Rixl Documentation. Apply these rules when working on any code, documentation, or configuration files.
---

# Rixl Documentation

## Project Overview

The official documentation site for Rixl (`developers.rixl.com`), built with TanStack Start, Fumadocs and Vite+. MDX content, API reference generated from the OpenAPI spec, live `@rixl/media-react` player demos, and i18n through Paraglide (`en` is the only locale today, `project.inlang/settings.json`). It builds to static files plus a SPA fallback and deploys to the Cloudflare Worker `rixl-docs`.

## Rules: read before you work

Claude Code loads every file in `.agents/rules/` on its own (`.claude` links to `.agents`). Every other agent loads only this file, so read the rule file for your task before you start it.

| Rule file                     | Read it before                                |
| ----------------------------- | --------------------------------------------- |
| `.agents/rules/anti-slop.md`  | writing or reviewing any code, page or commit |
| `.agents/rules/code-style.md` | writing TypeScript or TSX                     |
| `.agents/rules/commits.md`    | committing                                    |

Numbers live in config, never in rules. Rules point at the config instead of copying it: lint and complexity caps are in the `lint` block of `vite.config.ts`. If a rule and the config disagree, the config wins. Fix the rule in the same change.

## Claim Review

Before stating a claim as a conclusion, classify it as measured, verified
against source, inferred, or assumed. Test consequential gaps when possible;
otherwise label them as hypotheses. Use agent-review for the full procedure
when the stakes require it.

The full procedure is manual: run `/agent-review` (`.agents/skills/agent-review`). Its working files go in `reviews/`, which is gitignored.

## Repository Structure

- `src/routes/` - TanStack Router file routes
  - `$lang/` - localized doc pages
  - `api/` - search and OG image routes
  - `sitemap[.]xml.ts`, `robots[.]txt.ts` - SEO
- `src/components/` - layout, `mdx/` (MDX components, incl. the API page), `ui/`
- `src/lib/` - Fumadocs source adapter, OpenAPI pages, i18n, OG generation
- `src/generated/`, `src/paraglide/`, `src/routeTree.gen.ts` - generated; never edit
- `content/en/` - MDX documentation
- `plugins/` - build-time codegen: icon subset extraction, internal link validation
- `src/lib/docs.ts` - Fumadocs collections (macro) and frontmatter schemas
- `wrangler.jsonc` - Cloudflare Worker config (`rixl-docs`, `developers.rixl.com`, previews)
- `openspec/` - specs and in-flight changes

## Specs

`openspec/specs/` describes how the site behaves today. `openspec/changes/` holds the changes in flight. Artifact rules live in `openspec/config.yaml`, and OpenSpec gives them to the agent writing each artifact.

- Behaviour changes start as a change (`/opsx:propose`): routing, search, the API reference, `llms.txt` and the `.md` routes, i18n, the build plugins. Editing or adding pages under `content/`, refactors that keep behaviour, dependency bumps and typo fixes don't need one.
- The spec changes while the work happens. Anything learned while building or reviewing (an edge case, an API limit, a review finding) goes into the change's spec or `design.md` first, then into the code.
- Every choice a reviewer could question gets a decision entry in `design.md`: chosen, alternatives, dropped, evidence.
- Tick a task only with its evidence: the passing test, or the command and its output.
- Archive the change (`/opsx:archive`) in the PR that ships it, so the living specs stay true. Tasks still open at archive stay unticked with a reason.

## Technology Stack

- TypeScript 7 (strict type safety required)
- Node 24 (`.node-version`)
- TanStack Start + TanStack Router (static prerender)
- React 19
- Fumadocs 16 (`fumadocs-core`, `fumadocs-ui`, `fumadocs-mdx`, `fumadocs-openapi`)
- Tailwind CSS 4, Radix UI primitives
- Shiki (syntax highlighting), Orama (search)
- Paraglide JS / inlang (i18n)
- `@rixl/media-react` (player demos)

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Running Scripts

Run TypeScript and JavaScript files with `vpx <file>`, for example `vpx ./scripts/seed.ts --dry-run`. It handles enums, decorators, JSX, and tsconfig `paths`, so do not add `tsx` or `ts-node` to run scripts. `vpx --watch <file>` reruns the file when a file it uses changes, in place of `tsx watch`. `vp node <file>` runs plain Node.js.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

## Available Commands

Use `vp` for everything; don't call `bun`, `npm` or `npx` directly.

```bash
vp install           # Install dependencies (postinstall generates MDX sources, icons, Paraglide)
vp dev               # Dev server (http://localhost:3000)
vp run build         # Clean + production build (link check runs inside the build)
vp preview           # Preview the production build
vp check --fix       # Format, lint, type-check; auto-fix what can be fixed
vp run knip          # Unused files, exports and dependencies
vp test              # Unit tests (Node) and axe accessibility tests (*.ct.tsx, in Chromium)
vpx playwright install chromium   # Once per machine, before the first browser test run
```

Deploys: merging to `main` runs CI, which builds and uploads a tagged Worker version; `rollout.yml` (triggered on green CI) smoke-tests and promotes it. docs is a public repo, so it can't call the private shared workflows; port shared-workflow fixes here by hand.

## Documentation Content (MDX)

### Writing documentation

- Place MDX files in `content/en/`
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
