# {{PROJECT_NAME}}

{{DESCRIPTION}}

## Status

This repository is initialized as a {{PROFILE_LABEL}} Codex-ready project baseline. It intentionally starts with control documents, validation, and a temporary init plan before product feature code.

## Commands

{{COMMANDS_MD}}

## Repository Layout

- `src/`: runtime code.
- `tests/`: tests that mirror runtime behavior.
- `assets/`: static assets and design inputs.
- `scripts/`: portable contributor utilities.
- `.agents/skills/`: repo-local agent workflows.
- `.codex/config.toml`: project-scoped Codex defaults.

## Control Documents

- `PRODUCT.md`: current product truth, workflows, limits, and non-goals.
- `ROADMAP.md`: planned direction and explicit non-priorities.
- `AGENTS.md`: coding-agent rules, validation, and skill guidance.
- `ARCHITECTURE.md`: intended system boundaries and dependencies.
- `CODESTYLE.md`: implementation style and review expectations.
- `DESIGN.md`: UI/UX principles and screenshot review expectations.
- `INIT.md`: temporary setup plan; delete it after the first setup slice is complete.

## Next Step

Start with `INIT.md`. Do not implement product behavior until the first target user, first useful workflow, best-practice discovery pass, and stack choice are recorded in `PRODUCT.md` and `INIT.md`. Delete `INIT.md` after the setup slice is complete and durable facts have moved into the control documents.
