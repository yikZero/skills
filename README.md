# yikzero skills

Personal Agent Skills catalog for Claude Code and Codex.

This repository is designed to work with the `skills` CLI:

```bash
npx skills add yikZero/skills --list
npx skills add yikZero/skills --skill skill-authoring -a claude-code -a codex
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

`npx skills add yikZero/skills --list` temporarily clones the remote repository to inspect skills; it should not write `.agents/`, `.claude/`, or `skills-lock.json` into this source repository.

Run real remote installs from a consuming project, not this source repository:

```bash
npx skills@latest add yikZero/skills@pi-coding-agent-sdk -a claude-code -a codex
```

See [docs/SKILLS_CLI_NOTES.md](docs/SKILLS_CLI_NOTES.md) for source formats, lock behavior, update rules, and safe local testing.

## Adding Skills

Use [docs/ADDING_SKILLS.md](docs/ADDING_SKILLS.md) as the process checklist. Keep `AGENTS.md` as the source of truth for agent behavior in this repository.

That doc also includes copy-paste prompts for asking an AI agent to add a new skill or migrate an existing skill safely.
