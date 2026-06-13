# AGENTS.md

This file is the canonical guide for coding agents working on {{PROJECT_NAME}}.

## Defaults

- 默认用中文回复，除非用户明确要求英文。
- Prefer direct inspection of files, commands, logs, and runtime state before drawing conclusions.
- Use the recorded project toolchain: {{TOOL_SUMMARY}}.
- Keep changes scoped to the active request and `INIT.md` while it exists.
- Do not commit secrets. Put variable names only in `.env.example`.

## Before Coding

- Read `PRODUCT.md`, `ARCHITECTURE.md`, and `INIT.md` while it exists.
- If the request is underspecified and materially changes setup, use `.agents/skills/ask-questions-if-underspecified`.
- Do not invent product behavior that is not recorded in `PRODUCT.md` or `INIT.md` while it exists.
- During initialization, run both web search and current docs lookup before locking the stack, route, package manager, validation, or project structure. Record sources and decisions in `INIT.md`.
- For project types outside the recorded defaults, such as mini programs, browser extensions, native/mobile shells, hardware tools, or platform automations, verify official setup docs and record the chosen platform-specific commands before generating product code.
- For version-sensitive framework, SDK, API, CLI, or cloud-service details, verify current official docs or use the installed docs skill.

## Commands

{{COMMANDS_MD}}

Add stack-specific browser screenshot, CI, deployment smoke, or pre-commit commands when the stack needs them.

## Repo-Local Skills

- `.agents/skills/project-bootstrap`: use when turning this baseline into the first real stack and workflow.
- `.agents/skills/ask-questions-if-underspecified`: use when missing decisions would cause churn.
- `.agents/skills/review-ui-screenshots`: use for frontend visual review after UI changes.

## Recommended Global Skills

Install reusable skills deliberately instead of copying their instructions into this repo.

- `find-docs`: current framework, SDK, API, and CLI documentation.
- `remove-ai-slop`: clean generated-looking diffs before commit or review.
- `learn-to-agents`: save durable project discoveries to scoped agent docs.
- `diagnose`: reproduce, minimize, instrument, and fix hard bugs.
- `tdd`: use a red-green-refactor loop for risky product behavior.

Frontend projects often also use `design`, `web-ui-audit`, `react-performance`, `react-composition`, `shadcn-ui`, and `tailwind-design-system`.

## Documentation Updates

- Update `PRODUCT.md` when user-visible behavior changes.
- Update `ARCHITECTURE.md` when durable structure, boundaries, dependencies, or data flow changes.
- Update `README.md` and this file when commands change.
- Update `DESIGN.md` when visual language or UI review expectations change.
- Keep `ROADMAP.md` separate from current product truth.
- Delete `INIT.md` after the initial setup slice is complete and its remaining truth has moved into durable docs.
