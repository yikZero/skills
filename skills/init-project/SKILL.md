---
name: init-project
description: Initialize a new personal greenfield project for AI-assisted development using yikzero's preferred profile-aware defaults. Use when the user wants to create, set up, bootstrap, or initialize a new project/repo with project name and feature intake, a required network best-practice discovery pass, TypeScript/Bun/pnpm/npm with Biome formatting/linting, Next.js/shadcn/TanStack/Base UI/Tailwind-friendly setup, Python/uv tooling, unsupported or unusual app-type routing such as mini programs, framework selection, recommended skills, lint/test/typecheck setup, .codex/config.toml, PRODUCT.md, AGENTS.md, architecture/context docs, repo-local helper skills, or a temporary INIT.md. Not for integrating into an existing non-empty application unless explicitly requested.
---

# Init Project

Use this skill to turn a product idea into a new personal repository baseline
that humans and coding agents can continue from. This is an opinionated
greenfield initialization workflow: profile-aware tooling, Codex-first durable
control docs, repo-local helper skills, validation commands, skill
recommendations, and a temporary `INIT.md` for the setup slice.

## Core Rule

Do not start by writing product feature code. First create the project operating
surface: control documents, commands, validation, and a self-contained plan for
the first useful workflow.

If the current directory already contains a real application, pause and explain
that this skill is for new projects. Offer to create a sibling project directory
or run only a docs/context bootstrap after explicit user confirmation.

## Workflow

1. Inspect the current location.
   - Run `pwd`, `git status --short` when inside a repo, and `rg --files --hidden -g '!.git/**' | sed -n '1,120p'`.
   - Classify it as empty directory, template clone, generated scaffold, or existing application.
   - If it is not suitable for greenfield initialization, ask for a target path.

2. Gather a compact project brief.
   Ask only for missing decisions that materially change setup:
   - Project name and target path.
   - What the project should do, for whom, and the first useful workflow.
   - App type: web app, API, CLI, library, desktop app, mobile app, mini program, browser extension, automation, data pipeline, infrastructure, game, or mixed/other.
   - Current stage: exploration, prototype, internal tool, beta, or production replacement.
   - Preferred stack, deployment target, database, auth, AI provider, integrations, and UI needs. For web app defaults, bias toward the user's common stack: Next.js, Tailwind CSS, shadcn/ui, TanStack libraries, Base UI, and Biome.
   - Project profile: `typescript`, `python`, or `generic`. Default to `typescript` for JS/TS/web ideas, `python` for Python tools/APIs/data work, and `generic` only when no runtime should be selected yet.
   - Package manager only if the profile default is not suitable. Defaults: TypeScript -> Bun, Python -> uv, generic -> none. For TypeScript/Node projects, allow `bun`, `pnpm`, or `npm`.
   - Validation expectations: lint, format, typecheck, unit tests, browser screenshots, CI, or pre-commit hooks.
   - Whether the user wants a separate template repository route, the built-in personal baseline, or official generator plus personal overlays.

3. Run best-practice discovery before choosing the final setup.
   Read `references/best-practice-discovery.md`.
   - Always run both a web search pass and a current docs lookup pass for the app type, likely stack, validation, project structure, and current generator commands.
   - Prefer official docs, primary sources, and current framework guidance for stack-specific setup. Use web search for project-type practices, repository hygiene, alternatives, and gaps not covered by official docs.
   - Treat personal defaults as defaults, not fixed law. If current best practice suggests a better route, package manager, validator, framework, or project structure, recommend it and record the reason.
   - If `INIT.md` does not exist yet, keep compact discovery notes in the working context, then write them into `INIT.md` immediately after creating the baseline.

4. Choose a route. Read `references/routes.md` before deciding.
   - Personal baseline route: default for unclear stacks, small tools, and unsupported-by-template app types. Run `scripts/bootstrap-project.ts` with Bun to create a profile-aware xklob-style project baseline with `.codex/config.toml`, root control docs, repo-local skills, package scripts or equivalent commands, and `INIT.md`.
   - External template route: use or create a separate template repository when the user explicitly wants a reusable GitHub template repo.
   - Framework route: run the official framework generator first when the stack choice is clear, then add this skill's control docs, agent instructions, validation expectations, and `INIT.md` semantics.
   - Flexible route: for app types outside the known profiles, verify the current official docs, keep only the stable personal control surface, and record stack-specific setup rather than forcing a mismatched template.

5. Verify current docs for version-sensitive commands.
   Use the local `find-docs`/Context7 workflow or official docs for current
   framework generator, lint, test, package-manager, deployment, SDK, or CLI
   syntax. Do not guess commands for fast-moving tools.

6. Create the baseline.
   - For the personal baseline route, run:

         bun <this-skill>/scripts/bootstrap-project.ts --path <target> --name "<Project Name>" --description "<one sentence>" --profile <typescript|python|generic> --package-manager <auto|bun|pnpm|npm|uv|none>

     This writes `.codex/config.toml`, `AGENTS.md`, `README.md`, `PRODUCT.md`, `ROADMAP.md`, `CODESTYLE.md`, `DESIGN.md`, `ARCHITECTURE.md`, `INIT.md`, and `.agents/skills/*`. Depending on the profile, it also writes `package.json`/`biome.json`/`tsconfig.json`/Vitest files or `pyproject.toml`/Makefile/Ruff/pytest files.
   - Immediately replace the `Best-Practice Discovery` placeholders in `INIT.md` with the sources checked, decisions, rejected alternatives, and better-than-default suggestions.
   - Template maintenance rule: generated file contents live under `assets/templates/`. Keep `scripts/bootstrap-project.ts` as a small typed renderer/profile registry. When changing generated docs or manifests, edit templates first; only edit the script for argument parsing, profile selection, or placeholder wiring.
   - Do not maintain exact external tool or dependency versions in this skill. Let the selected package manager resolve current versions and let the generated project lockfile record them.
   - For an external template route, clone/copy the chosen template, remove template Git history if creating a new repo, then run its own bootstrap instructions.
   - For framework route, run the official generator into the target path, then add/merge the control docs and create a temporary `INIT.md` only when setup work remains.
   - For flexible route, prefer the `generic` profile when no runtime should be chosen yet; otherwise choose the closest runtime profile only for commands and validation, not for product shape.
   - Keep secrets out of files. Write only variable names to `.env.example`.

7. Personalize durable control docs. Read `references/control-docs.md`.
   At minimum create or update:
   - `README.md` for project identity, setup, commands, and layout.
   - `PRODUCT.md` for current product truth, users, workflows, limits, and non-goals.
   - `AGENTS.md` for agent rules, validation commands, skill recommendations, and boundaries.
   - `ARCHITECTURE.md` for intended structure, boundaries, dependencies, and extension points.
   - `INIT.md` for the setup slice; delete it after completion once durable docs contain the remaining truth.
   Default to creating `ROADMAP.md`, `CODESTYLE.md`, and `DESIGN.md` too; this is a personal template, not a generic minimal scaffold.

8. Recommend and install skills deliberately. Read `references/skill-recommendation.md`.
   - Prefer this catalog's `yskill` presets for common needs.
   - Run `npx skills find "<query>"` for project-specific needs.
   - Inspect candidate skills before recommending them.
   - If no suitable skill exists, summarize the workflow in `AGENTS.md` and suggest a future skill only when it will be reused.

9. Set up validation.
   Default validation depends on the selected profile:
   - TypeScript + Bun: `bun install`, `bun run validate`.
   - TypeScript + pnpm: `pnpm install`, `pnpm validate`.
   - TypeScript + npm: `npm install`, `npm run validate`.
   - Python + uv: `uv sync`, `make validate`.
   - Generic: `git diff --check` until a runtime is selected.
   Add framework lint, typecheck, browser screenshots, CI, or deployment smoke
   checks when the chosen stack needs them. Document canonical commands in
   `README.md` and `AGENTS.md`, then run the commands.

10. Finish with a handoff.
   Report:
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
