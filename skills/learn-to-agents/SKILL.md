---
name: learn-to-agents
description: Extract durable, non-obvious project learnings from a session and write them to the nearest appropriate AGENTS.md file. Use when the user asks to remember repository conventions, document discoveries, update agent instructions, capture debugging lessons, or run a learn/reflection step after implementation.
argument-hint: "[scope or summary]"
user-invocable: true
---

# Learn To AGENTS.md

Capture reusable project knowledge in `AGENTS.md` files so future coding agents avoid rediscovering it. Treat `AGENTS.md` as cross-agent operational guidance: concise, scoped, and actionable.

## What Belongs

Add learnings that are durable and non-obvious:

- Commands that must run from a specific directory or with non-obvious flags.
- File relationships, generated assets, or modules that must change together.
- API, SDK, CLI, or platform quirks verified during the session.
- Debugging breakthroughs where the visible error was misleading.
- Architectural constraints, import boundaries, data ownership rules, or release/deploy gotchas.
- Project-specific test, build, lint, i18n, or CI behavior not already documented.

Do not add:

- Generic framework or language advice.
- Facts already obvious from README, package scripts, or existing docs.
- Personal preferences better suited to user memory.
- Temporary branch names, timestamps, one-off temp paths, or session-only decisions.
- Secrets, private tokens, credentials, or sensitive customer/project data.
- Unverified guesses or conclusions that did not survive the session.

## Scope Placement

Choose the narrowest useful `AGENTS.md`:

- Repo-wide convention: root `AGENTS.md`.
- Package/module convention: nearest package or module `AGENTS.md`.
- Feature-specific invariant: feature directory `AGENTS.md`.
- Personal or global workflow: only update a home/global instruction file if the user explicitly asks.

If a nearer `AGENTS.md` already covers the topic, update it instead of duplicating root-level guidance. If the repo also has `CLAUDE.md`, `.github/copilot-instructions.md`, or other agent files, prefer `AGENTS.md` for cross-agent learnings unless the user asks to update those too.

## Process

1. Inspect the relevant context: user request, outcome, changed files, commands run, and existing guidance files.
2. Identify only reusable learnings. If none exist, do not edit.
3. Locate candidate `AGENTS.md` files from the relevant path up to the repo root.
4. Read before editing. Avoid duplicate, stale, or contradictory instructions.
5. Add concise bullets, usually one to three lines each.
6. Prefer specific commands, paths, env vars, package names, and ownership rules over broad principles.
7. Preserve existing structure and language unless a small cleanup prevents confusion.
8. Review the diff to ensure the new guidance is scoped and not bloated.

## Writing Style

- Use direct, operational wording: "When changing X, also update Y."
- State verified constraints, not narratives about the session.
- Include the command or file path that future agents should use.
- Pair negative rules with the positive alternative when possible.
- Keep entries short enough to be loaded repeatedly by agents.

## Output

Report:

- Which `AGENTS.md` files were created or updated.
- Number of learnings added per file.
- Any plausible learning intentionally skipped because it was generic, temporary, duplicated, or uncertain.

