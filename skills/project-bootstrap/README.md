# Project Bootstrap

Turn a new product, app, automation, or library idea into a ready-to-build
project baseline.

This skill is for the first hour of a serious project: capture the idea,
choose a practical setup route, check current docs before locking in tools, and
leave the repository with enough structure that humans and coding agents can
continue without guessing.

## Install

```bash
npx yskill --skill project-bootstrap
```

Add agent flags only when you want an explicit target, for example
`-a codex` or `-a claude-code`. Add `-y` only for non-interactive installs.

## Use It For

- Starting a new web app, API, CLI, library, automation, data tool, or docs-first project.
- Choosing between a built-in baseline, an official framework generator, a
  reusable template, or a flexible docs-only route.
- Creating durable project control docs such as `PRODUCT.md`, `AGENTS.md`,
  `ARCHITECTURE.md`, `ROADMAP.md`, `CODESTYLE.md`, and `DESIGN.md`.
- Setting up validation commands, repo-local helper skills, and a clear first
  workflow handoff.

## What It Produces

The baseline route can create:

- `.codex/config.toml`
- `README.md`
- `PRODUCT.md`
- `AGENTS.md`
- `ARCHITECTURE.md`
- `ROADMAP.md`
- `CODESTYLE.md`
- `DESIGN.md`
- `INIT.md`
- `.agents/skills/*`
- TypeScript/Bun, TypeScript/pnpm/npm, Python/uv, or generic validation scaffolding.

Framework and template routes reuse the official generator or chosen template
first, then add the same control-doc and agent-workflow layer on top.

## Example Prompt

```text
Use Project Bootstrap to initialize a new TypeScript web app for tracking weekly team goals.
Pick the setup route, check current docs, add durable project docs, install useful
repo-local skills, and leave validation commands in README and AGENTS.md.
```

## Not For

- Adding a feature to an existing app.
- Refactoring a mature codebase.
- Creating production services, secrets, GitHub repos, or deployments without explicit approval.

For an existing application, use this only when you explicitly want a
docs/context bootstrap.

## Skill Entry

- [SKILL.md](./SKILL.md)

## References

- [Best-practice discovery](./references/best-practice-discovery.md)
- [Initialization routes](./references/routes.md)
- [Control documents](./references/control-docs.md)
- [Skill recommendation](./references/skill-recommendation.md)
