---
name: project-bootstrap
description: Turn a new product, app, automation, or library idea into a ready-to-build project baseline. Use when the user wants to create, bootstrap, or initialize a fresh project with a compact brief, current docs/best-practice discovery, framework or runtime selection, repository structure, validation commands, control docs such as PRODUCT.md and AGENTS.md, repo-local helper skills, and a first-workflow handoff. Supports TypeScript/Bun/pnpm/npm, Python/uv, generic docs-only baselines, and framework-generator overlays. Not for adding features to an existing application unless the user explicitly asks for a docs/context bootstrap.
---

# Project Bootstrap

Turn a product or software idea into a repository baseline that humans and
coding agents can continue from: compact intake, current-docs discovery,
durable control docs, repo-local helper skills, validation commands, and a
temporary `INIT.md` for the setup slice.

Do not start by writing product feature code. The value of this skill is the
project operating surface it creates first: control documents, canonical
commands, validation, and a self-contained plan for the first useful workflow.

## Scope Guard

This is a greenfield workflow. If the current directory already contains a
real application, pause and explain that this skill is for new projects. Offer
to create a sibling project directory, or run only a docs/context bootstrap
after explicit user confirmation.

## Reference Map

Each reference owns one concern. Read it at the step that points to it.

- `references/best-practice-discovery.md` — search and docs-lookup passes, source preference, what to record in `INIT.md`.
- `references/routes.md` — full procedures for the four initialization routes.
- `references/control-docs.md` — the contract for each generated document and the default file set.
- `references/skill-recommendation.md` — which skills to install, the canonical install commands, and how to vet candidates.
- `references/maintenance.md` — how to change this skill's templates, script, and profiles. Maintainers only; never needed during a bootstrap run.

## Workflow

1. **Inspect the target location.**
   - Run `pwd`, `git status --short` when inside a repo, and `rg --files --hidden -g '!.git/**' | sed -n '1,120p'`.
   - Classify it: empty directory, template clone, generated scaffold, or existing application.
   - If it is not suitable for greenfield initialization, apply the scope guard and ask for a target path.

2. **Gather a compact project brief.**
   Ask only for missing decisions that materially change setup:
   - Project name and target path.
   - What the project should do, for whom, and the first useful workflow.
   - App type: web app, API, CLI, library, desktop app, mobile app, mini program, browser extension, automation, data pipeline, infrastructure, game, or mixed/other.
   - Current stage: exploration, prototype, internal tool, beta, or production replacement.
   - Preferred stack, deployment target, database, auth, AI provider, integrations, and UI needs. For web app defaults, bias toward the user's common stack: Next.js, Tailwind CSS, shadcn/ui, TanStack libraries, Base UI, and Biome.
   - Project profile: `typescript`, `python`, or `generic`. Default to `typescript` for JS/TS/web ideas, `python` for Python tools/APIs/data work, and `generic` only when no runtime should be selected yet.
   - Package manager only if the profile default is not suitable. Defaults: TypeScript -> Bun, Python -> uv, generic -> none. For TypeScript/Node projects, allow `bun`, `pnpm`, or `npm`.
   - Validation expectations: lint, format, typecheck, unit tests, browser screenshots, CI, or pre-commit hooks.
   - Route preference, if the user has one: built-in baseline, official framework generator, or a separate template repository.

3. **Run best-practice discovery.** Read `references/best-practice-discovery.md`.
   - Always run both a web search pass and a current docs lookup pass for the app type, likely stack, validation, project structure, and current generator commands.
   - Never guess version-sensitive commands for fast-moving tools: verify current generator, lint, test, package-manager, deployment, SDK, and CLI syntax against official docs or the `find-docs` workflow before using them.
   - Treat catalog defaults as defaults, not fixed law. If current best practice suggests a better route, package manager, validator, framework, or project structure, recommend it and record the reason.
   - Keep compact discovery notes in the working context, then write them into `INIT.md` immediately after the baseline exists.

4. **Choose a route.** Read `references/routes.md` before deciding.

   | Signal | Route |
   | ------ | ----- |
   | New product, unclear stack, or app type without a preset | Baseline (default) |
   | Framework already chosen (Next.js, Vite, FastAPI, ...) | Framework: official generator first, overlay after |
   | User explicitly wants a reusable template repository | External template |
   | Platform-specific app (mini program, extension, mobile shell, ...) | Flexible |

5. **Create the baseline.**
   - For the baseline route, run the canonical command:

         bun <this-skill>/scripts/bootstrap-project.ts --path <target> --name "<Project Name>" --description "<one sentence>" --profile <typescript|python|generic> --package-manager <auto|bun|pnpm|npm|uv|none>

     This writes `.codex/config.toml`, the control docs, `.agents/skills/*`, and the selected profile's tooling (`package.json`/`biome.json`/`tsconfig.json`/Vitest, or `pyproject.toml`/Makefile/Ruff/pytest).
   - For the framework, external template, and flexible routes, follow the procedures in `references/routes.md`: generator or template first, then the same control-doc overlay and a temporary `INIT.md` while setup work remains.
   - Install `find-docs` into the target project as a project-local skill by default (canonical command and rationale in `references/skill-recommendation.md`):

         cd <target> && npx skills@latest add yikZero/skills --skill find-docs -a codex -y

   - Immediately replace the `Best-Practice Discovery` placeholders in `INIT.md` with the sources checked, decisions, rejected alternatives, and better-than-default suggestions.
   - Keep secrets out of files. Write only variable names to `.env.example`.

6. **Personalize the control docs.** Read `references/control-docs.md`.
   At minimum personalize `README.md`, `PRODUCT.md`, `AGENTS.md`, `ARCHITECTURE.md`, and `INIT.md`. Default to keeping `ROADMAP.md`, `CODESTYLE.md`, and `DESIGN.md` too: this is a full project baseline, not a bare package scaffold. Delete `INIT.md` only after the setup slice is complete and its remaining truth has moved into the durable docs.

7. **Recommend skills and set up validation.** Read `references/skill-recommendation.md`.
   - Treat `find-docs` as the default required project-local skill unless the user explicitly opts out. Prefer this catalog's `yskill` presets for common needs; run `npx skills find "<query>"` for project-specific needs and inspect candidates before recommending them.
   - If no suitable skill exists, summarize the workflow in `AGENTS.md` instead of forcing a weak install.
   - Default validation commands by profile:

     | Profile | Install | Validate |
     | ------- | ------- | -------- |
     | TypeScript + Bun | `bun install` | `bun run validate` |
     | TypeScript + pnpm | `pnpm install` | `pnpm validate` |
     | TypeScript + npm | `npm install` | `npm run validate` |
     | Python + uv | `uv sync` | `make validate` |
     | Generic | — | `git diff --check` |

   - Add framework lint, typecheck, browser screenshots, CI, or deployment smoke checks when the chosen stack needs them. Document the canonical commands in `README.md` and `AGENTS.md`, then run them.

8. **Finish with a handoff.** Report:
   - project path
   - route chosen and why
   - best-practice sources checked and better-than-default suggestions
   - files created or changed
   - skills recommended or installed
   - validation commands and results
   - temporary `INIT.md` status
   - open decisions intentionally left for the user

## Stop Conditions

Stop and ask before:

- creating or overwriting a non-empty project directory
- installing a large framework or service SDK when the user has not confirmed the stack
- creating a GitHub repo, deploying, or making network-visible resources
- writing secrets, copied cookies, API keys, or production credentials

## Maintaining This Skill

To change generated file contents, the renderer script, or the profile
registry, read `references/maintenance.md` first. Template contents live under
`assets/templates/`; `scripts/bootstrap-project.ts` stays a small typed
renderer. Do not mix maintenance edits into a bootstrap run.
