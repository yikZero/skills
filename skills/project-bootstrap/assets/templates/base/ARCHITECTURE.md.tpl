# Architecture: {{PROJECT_NAME}}

{{DESCRIPTION}}

## System Overview

The product architecture is not finalized yet. The first implementation should stay simple enough that a new agent can understand it from this file, `PRODUCT.md`, and `INIT.md` while it exists.

## Intended Layout

- `src/`: runtime code.
- `tests/`: tests.
- `assets/`: static assets and visual references.
- `scripts/`: portable contributor utilities.
- `.agents/skills/`: repo-local workflows.

## Boundaries

- Open question: where should product/domain logic live?
- Open question: what should own side effects such as network calls, filesystem writes, and database access?
- Open question: what external services, databases, or APIs will the first workflow depend on?
- Open question: does the app type need platform-specific layout or tooling outside this baseline?

## Runtime and Tooling

{{PROFILE_ARCHITECTURE}}
- Codex defaults: `.codex/config.toml`.

## Extension Points

Record extension points only after the first useful workflow needs them.
