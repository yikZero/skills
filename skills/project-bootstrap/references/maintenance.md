# Skill Maintenance

This file is for maintainers changing the project-bootstrap skill itself. It
is never needed during a project bootstrap run.

## Ownership Split

- Generated file contents live in `assets/templates/base/` and
  `assets/templates/profiles/<profile>/`.
- `scripts/bootstrap-project.ts` stays a small typed renderer and profile
  registry: argument parsing, profile selection, command mapping, and
  placeholder wiring.
- When changing generated docs or manifests, edit templates first. Touch the
  script only when the change needs new arguments, profiles, or placeholders.

## Template Layout

```
assets/templates/
├── base/                 # files every generated project gets:
│   ├── *.md.tpl          #   control docs (README, PRODUCT, AGENTS, ...)
│   ├── .codex/           #   project-scoped Codex config
│   └── agents/           #   repo-local .agents/skills/* helper skills
└── profiles/
    ├── typescript/       # package.json, biome.json, tsconfig, Vitest smoke test
    ├── python/           # pyproject.toml, Makefile, Ruff, pytest smoke test
    └── generic/          # docs-only architecture/codestyle snippets
```

Placeholders use `{{UPPER_SNAKE}}` and are rendered by `createContext()` in
the script. The renderer throws on unknown keys, so adding a placeholder to a
template always means wiring its replacement in the script in the same change.

## Versioning Policy

Do not pin exact external tool or dependency versions in templates. Use
unpinned dependencies where practical: the selected package manager resolves
current versions and the generated project's lockfile records them. The script
intentionally rejects version flags such as `--bun-version` to keep this
policy enforceable.

## Adding a Profile

1. Add `assets/templates/profiles/<name>/` with at least the architecture and
   codestyle snippets, plus any manifests and one passing smoke test.
2. Register the profile in `PROFILES` in `scripts/bootstrap-project.ts`:
   commands, allowed package managers, gitignore entries, templates, raw
   files, and tool summary.
3. Smoke-test generation into a temporary directory and run the new profile's
   install and validate commands.

## Validating Changes

From the repository root:

```bash
npm run validate
npx skills@latest add . --list
```

Smoke-test generation for each affected profile:

```bash
bun skills/project-bootstrap/scripts/bootstrap-project.ts \
  --path "$(mktemp -d)/demo" --name "Demo" --profile typescript
```
