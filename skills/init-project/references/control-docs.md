# Control Documents

Control documents are durable project truth. This personal template creates a
full control-document set by default, following the same broad idea as
`xklob/codex-repo-template` but with yikzero's profile-aware tooling
preferences.

## Minimum Set

### `.codex/config.toml`

Owns project-scoped Codex defaults. The generated file mirrors the shape of the
xklob template:

- model defaults
- reasoning effort defaults
- pragmatic personality
- approval and sandbox defaults
- live web search
- workspace write network access

Do not add MCP servers here unless the project repeatedly benefits from them.
Prefer skills or local commands for docs lookup.

### `README.md`

Owns human onboarding:

- what the project is
- how to install dependencies
- how to run it
- how to validate changes
- where code, tests, assets, and scripts live
- selected profile and command contract

### `PRODUCT.md`

Owns current user-visible truth:

- target users and jobs to be done
- current workflows
- current capabilities
- important constraints and known limits
- explicit non-goals

Do not put aspirational roadmap items here unless they already exist.

### `AGENTS.md`

Owns coding-agent behavior:

- repository-specific rules
- canonical commands
- validation expectations
- what skills to use and when
- files or boundaries agents should not cross casually
- how to update control docs when behavior changes
- selected package manager/runtime and when to override it

Keep reusable workflows in skills; keep repo-specific facts in `AGENTS.md`.

### `ARCHITECTURE.md`

Owns the intended system map:

- application shape and entry points
- major layers or packages
- ownership boundaries
- data and side-effect boundaries
- important dependencies and extension points

For a new project, this can be intended architecture. Mark open questions
clearly.

### `INIT.md`

Owns only the initial setup slice:

- best-practice discovery sources and decisions
- the first implementation slice
- concrete files to edit
- validation and acceptance criteria
- open decisions

Delete `INIT.md` after the setup slice is complete and its durable facts
have been moved into `README.md`, `PRODUCT.md`, `AGENTS.md`,
`ARCHITECTURE.md`, `CODESTYLE.md`, `DESIGN.md`, or `ROADMAP.md`.

## Default Personal Set

- `ROADMAP.md`: future direction, priorities, non-priorities.
- `CODESTYLE.md`: language conventions, lint/format policy, comments, file size.
- `DESIGN.md`: visual language, UI/UX review expectations, screenshots.
- `.env.example`: variable names only; no secrets.
- TypeScript profile: `package.json`, `biome.json`, `tsconfig.json`, Biome,
  TypeScript, Vitest, and one passing `tests/smoke.test.ts`.
- Python profile: `pyproject.toml`, `Makefile`, Ruff, pytest, and one passing
  `tests/test_smoke.py`.
- Generic profile: control docs only, with runtime/tooling left explicit as an
  open decision.
- `.agents/skills/project-bootstrap/SKILL.md`: repo-local first customization
  workflow.
- `.agents/skills/find-docs/SKILL.md`: project-local current docs lookup
  workflow, installed from the catalog during initialization.
- `.agents/skills/ask-questions-if-underspecified/SKILL.md`: local clarification
  workflow.
- `.agents/skills/review-ui-screenshots/SKILL.md`: local screenshot review
  workflow.

## Quality Bar

- Replace generic placeholders before finishing.
- If the user defers a decision, write it as an explicit open question.
- Keep documents consistent with each other.
- Update docs in the same change that changes product behavior, commands,
  architecture, or agent workflow.

## Template Maintenance

- Generated file contents live in `assets/templates/base/` and
  `assets/templates/profiles/<profile>/`.
- Keep `scripts/bootstrap-project.ts` focused on rendering, profile selection,
  command mapping, and placeholder wiring.
- Do not maintain exact external tool or dependency versions in templates. Use
  unpinned dependencies where practical and let the generated project's lockfile
  record resolved versions.
- To add a new language/tooling profile, add profile templates first, then add a
  small profile registry entry in the script and smoke-test generation.
