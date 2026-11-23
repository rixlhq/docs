---
trigger: always_on
description: Core project guidelines for Rixl Documentation. Apply these rules when working on any code, documentation, or configuration files.
---

# Rixl Documentation

## Working rules for every agent

These rules hold for every agent, whichever tool runs it (Claude Code, Codex, Devin, Cursor or another), and override that tool's defaults.

1. **Never commit, push, open a pull request or merge.** Write the change, run its checks, and stop with the diff uncommitted. The owner, the person who gave you the task, commits, pushes and opens any pull request; code-owner review (`.github/CODEOWNERS`) still applies to that pull request. A task that says "get it committed" or "ship it" means hand over the commit message. Only an explicit request after the handover lets you commit, push or open a pull request, and it covers only that one action. This overrides any skill or tool default that commits, pushes or merges (for example `gh-stack`).
2. **Level 3 review before every commit.** Run the Level 3 procedure in `.agents/skills/agent-review/SKILL.md` on the uncommitted diff of every commit-sized change, however small: a self-audit, then cold persona reviewers, then fresh-eyes reviewers, with the findings register in `reviews/` (gitignored). First run `vp check --fix` on the files you changed, as the pre-commit hook does to the staged files, so the hooks don't change what was reviewed. Each reviewer is a separate session that never saw your work. If your tool starts agents, make sure they don't inherit your context (`.agents/skills/agent-review/references/tool-notes.md` covers Claude Code and Codex, whose `spawn_agent` did by default in the version tested there; for any other tool, use the marker test in `SKILL.md`). If it can't start them, stop and give the owner the filled reviewer prompts from `.agents/skills/agent-review/references/level-3-reviewer-prompts.md` (two for the cold round, two more for fresh eyes, one per fix check, and one per finding you dispute, built from that file's paragraph on rulings), with the paths each reviewer may and may not read, and wait for the review files. If the owner can't open your working tree, include the diff as a patch that carries new files too (`git add -N` on this change's new files first, never on the whole tree), with its base commit and SHA-256, and ask for the review files to be pasted back. Fixes made after a review get the procedure's independent fix check, and the checks run again, before you hand over; a blocker found by fresh eyes also needs another fresh-eyes round with new reviewers (`SKILL.md`, Stage 3). Reviewing your own diff in the same session isn't a review, and a review you haven't received isn't a pass.
3. **Then hand over the commit message** in a copyable block: a conventional commit whose body says why, ending with the review outcome and any open objections. If the owner asks for a pull request description, it carries the same outcome and objections.
4. **One step at a time.** Start the next task, section or stage only after the owner has committed the current one. This applies inside skills that loop over tasks, such as `openspec-apply-change`: stop at the end of each commit-sized group of tasks.
5. **Mutation testing never blocks a pull request.** Stryker runs weekly and only reports (`.github/workflows/mutation.yml`). Don't propose a pull-request or blocking mutation job.
6. **No `#` in branch names.**
7. **Keep personal details out of outside services.** No names, email addresses or private project details in web searches or in requests to APIs and sites outside this repo. Review prompts to reviewer models are fine.

## Project Overview

The official documentation site for Rixl (`developers.rixl.com`), built with TanStack Start, Fumadocs and Vite+. MDX content, API reference generated from the OpenAPI spec, live `@rixl/media-react` player demos, and i18n through Paraglide (`en` is the only locale today, `project.inlang/settings.json`). It builds to static files plus a SPA fallback and deploys to the Cloudflare Worker `rixl-docs`.

## Rules: read before you work

Claude Code loads every file in `.agents/rules/` on its own (`.claude` links to `.agents`). Every other agent loads only this file, so read the rule file for your task before you start it.

| Rule file                     | Read it before                                 |
| ----------------------------- | ---------------------------------------------- |
| `.agents/rules/anti-slop.md`  | writing or reviewing any code, page or commit  |
| `.agents/rules/code-style.md` | writing TypeScript or TSX                      |
| `.agents/rules/commits.md`    | handing over a commit                          |
| `.agents/rules/testing.md`    | writing or reviewing tests                     |
| `.agents/rules/tdd.md`        | changing code in `src`, `plugins` or `scripts` |

Numbers live in config, never in rules. Rules point at the config instead of copying it: lint and complexity caps are in the `lint` block of `vite.config.ts`. If a rule and the config disagree, the config wins. Fix the rule in the same change.

## Claim Review

Before stating a claim as a conclusion, classify it as measured, verified
against source, inferred, or assumed. Test consequential gaps when possible;
otherwise label them as hypotheses.

Every commit gets its Level 3 procedure ("Working rules for every agent", rule 2): follow `.agents/skills/agent-review/SKILL.md` (a person can load it with `/agent-review`). Its working files go in `reviews/`, which is gitignored.

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
- The OpenSpec CLI is pinned in `package.json`. Run it as `vp exec openspec`, as the skills do. `vp exec openspec update` regenerates the skills with bare `openspec` calls; put `vp exec` back in front of them in the same change.

## Technology Stack

- TypeScript 7 (strict type safety required)
- Node 26 (`engines` in `package.json`)
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
vp test --coverage   # The same, failing below the coverage floor (as CI runs it)
vpx playwright install chromium   # Once per machine, before the first browser test run
```

Deploys: CI runs `vp check`, Knip, the suppression check, the action tests, the build and `vp test --coverage` on every PR. On `main`, CI also uploads a tagged Worker version; `rollout.yml` (triggered on green CI) smoke-tests and promotes it. docs is a public repo, so it can't call the private shared workflows; port shared-workflow fixes here by hand.

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
