# Initialization Routes

Choose the route that best matches the user's intent while preserving the
baseline defaults: Codex-first durable control docs, explicit validation, and a
small selected tooling profile.

All routes require a best-practice discovery pass first. Use official docs,
targeted web search, and `npx skills find` to check current setup practice,
then record accepted and rejected decisions in `INIT.md`.

## Baseline Route

This is the default route.

Use it when the user wants a new project and has not explicitly asked to start
from an external framework or GitHub template. Also use it when the app type is
outside the supported presets and forcing a framework template would be a guess.
It creates a project baseline:

- rich root control documents
- `.codex/config.toml`
- TypeScript, Python, or generic tooling baseline
- selected package-manager commands
- `.agents/skills/` repo-local helper workflows
- explicit planning discipline
- a temporary `INIT.md`
- a repo meant to grow beyond a throwaway prototype

Command:

```bash
bun <this-skill>/scripts/bootstrap-project.ts --path <target> --name "<Project Name>" --description "<one sentence>" --profile <typescript|python|generic> --package-manager <auto|bun|pnpm|npm|uv|none>
```

Common examples:

```bash
bun <this-skill>/scripts/bootstrap-project.ts --path ./my-app --name "My App" --profile typescript
bun <this-skill>/scripts/bootstrap-project.ts --path ./my-api --name "My API" --profile python
bun <this-skill>/scripts/bootstrap-project.ts --path ./my-app --name "My App" --profile typescript --package-manager pnpm
```

Template contents are maintained under `assets/templates/`; the script should
remain a typed renderer and profile registry.

## External Template Route

Use this only when the user explicitly wants a standalone template repository or
to base the project directly on an existing public template.

Process:

1. Confirm the user wants a separate template-based start.
2. Clone or copy the template into the target project directory.
3. Remove upstream `.git` history if this is a new project.
4. Read the template's own `AGENTS.md` and `project-bootstrap` skill.
5. Replace template placeholders with project-specific truth.
6. Replace package-manager assumptions with the selected profile default unless
   the stack makes that default a poor fit.
7. Do not publish a GitHub template repo without explicit user confirmation.

## Framework Route

Use this when the framework choice is already clear and the official generator
should own the initial file layout. This includes Next.js/Vite/FastAPI-style
starts and platform-specific starts such as mini programs when the correct
official setup flow is known.

Process:

1. Verify current official generator, lint, test, and build guidance.
2. Run the generator into the target path.
3. Remove demo code that conflicts with the user's product brief.
4. Add or merge AI-first control docs.
5. Add a temporary `INIT.md` if the setup slice is not finished.
6. Document canonical commands and run the generator's health checks.

## Flexible Route

Use this when the description points to a project type outside the known
templates, such as a mini program, browser extension, native/mobile shell,
hardware tool, or platform automation.

Process:

1. Treat the user's app type as product truth; do not force it into Next.js,
   Python, or generic docs only because those profiles exist.
2. Verify current official docs, current generator options, and best-practice
   examples for the platform.
3. Use `generic` when runtime/tooling is still unclear, or the nearest runtime
   profile only for commands and validation.
4. Keep `.codex/config.toml`, `PRODUCT.md`, `AGENTS.md`, `ARCHITECTURE.md`,
   `ROADMAP.md`, `CODESTYLE.md`, `DESIGN.md`, repo-local skills, and temporary
   `INIT.md` as the stable project overlay.
5. Record platform-specific commands in `README.md` and `AGENTS.md`, then run
   them before finishing.

## Route Selection Heuristics

- New product with unclear stack: baseline route.
- New product with strong AI/process needs: baseline route.
- User says "make a reusable template repo": external template route, then ask
  before creating/publishing a GitHub repository.
- Next.js, Vite, FastAPI, Rust CLI, or similar already chosen: framework route.
- Mini program or other platform-specific app: flexible route unless the exact
  official generator is already clear, then framework route plus project overlay.
- User says "just set up context/docs": baseline route, optionally skip
  framework tooling.
- User says "make it robust for agents from day one": baseline route.
