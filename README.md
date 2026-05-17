# yikzero skills

Personal Agent Skills catalog for Claude Code and Codex.

This repository is designed to work with the `skills` CLI:

```bash
npx skills add yikzero/skills --list
npx skills add yikzero/skills --skill skill-authoring -a claude-code -a codex
```

For local development before publishing:

```bash
npx skills add /path/to/skills --list
npx skills add /path/to/skills --skill skill-authoring -a claude-code -a codex
```

## Layout

```text
skills/
  <skill-name>/
    SKILL.md
    references/
    scripts/
    assets/
docs/
  ADDING_SKILLS.md
templates/
  skill/
scripts/
  validate-skills.mjs
```

`skills/` is the only installable catalog. Put drafts in `skills/.experimental/` only when they are valid but intentionally hidden from normal installs by `metadata.internal: true`.

## Included Skills

- `skill-authoring`: create, update, and validate portable Agent Skills.
- `pi-coding-agent-sdk`: source-backed workflows and recipes for `@earendil-works/pi-coding-agent` SDK development.

## Installed Paths

Project installs:

- Claude Code: `.claude/skills/<skill-name>/`
- Codex: `.agents/skills/<skill-name>/`

Global installs:

- Claude Code: `~/.claude/skills/<skill-name>/`
- Codex: `~/.codex/skills/<skill-name>/`

The default `skills` CLI install mode uses a canonical copy plus symlinks where supported, which keeps multi-agent installs easier to update. In project installs, `.agents/skills/` is the canonical location; Claude Code gets a `.claude/skills/<skill-name>` symlink when the target project already has a `.claude/` directory. Use `--copy` only when symlinks are not appropriate.

## Common Commands

```bash
npm run validate
npx skills@latest add . --list
npx skills@latest add . --skill skill-authoring -a claude-code -a codex
npx skills@latest update skill-authoring -p -y
```

## Adding Skills

Use [docs/ADDING_SKILLS.md](docs/ADDING_SKILLS.md) as the process checklist. Keep `AGENTS.md` as the source of truth for agent behavior in this repository.
