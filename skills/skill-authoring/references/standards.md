# Skill Authoring Standards

Use these rules when creating or updating skills.

## AGENTS.md

`AGENTS.md` is the repository-level instruction file for coding agents. Use it for project overview, validation commands, style rules, and repository-specific workflow. It is standard Markdown and can use any headings that help agents work effectively.

Keep long project policy in `AGENTS.md`; keep installable reusable capability in `skills/<name>/SKILL.md`.

## Agent Skills Format

Each skill is a directory containing at least `SKILL.md`:

```text
skill-name/
  SKILL.md
  references/
  scripts/
  assets/
```

Required frontmatter:

```yaml
---
name: skill-name
description: What the skill does and when to use it.
---
```

Rules:

- `name` must be lowercase kebab-case, 1-64 characters, and match the parent directory.
- `description` must be non-empty, under 1024 characters, and include concrete trigger contexts.
- `license`, `compatibility`, `metadata`, and `allowed-tools` are optional.
- `allowed-tools` support varies by agent; use it only when you accept that portability tradeoff.
- Keep `SKILL.md` under 500 lines where possible.
- Keep file references one level deep from `SKILL.md`.
- Add `agents/openai.yaml` for skills that should look good in Codex skill lists. Keep it human-facing and aligned with `SKILL.md`.

## Migrating External Skills

When importing a skill from another repository, copy only the clean skill package into `skills/<name>/`. Do not copy generated install directories, lock files, dependency folders, or repository metadata.

Checklist:

- Identify the real installable skill source. Prefer a rendered agent-neutral skill over a template source directory.
- Search for unresolved template placeholders such as `{{scripts_path}}`, `{{command_prefix}}`, `{{model}}`, and `{{config_file}}`.
- Replace hard-coded Claude slash commands or Codex `$` commands with portable wording when the skill is meant to support both.
- If renaming the skill, update the frontmatter `name`, directory name, script paths, pin/shortcut helpers, and user-facing examples together.
- Review every script before copying it. Keep only scripts that are needed by the selected workflow.
- Remove references for commands or modes that are not exposed by the new skill.
- Preserve license and attribution files such as `NOTICE.md` when required by the upstream license.
- After migration, search for stale old names, missing files, and broken Markdown links.

## skills CLI Compatibility

This repository should stay installable by source:

```bash
npx skills add yikZero/skills --list
npx skills add yikZero/skills --skill <skill-name> -a claude-code -a codex
npx skills add yikZero/skills@<skill-name> -a claude-code -a codex
```

The CLI searches common skill locations, including `skills/`, `.agents/skills/`, and `.claude/skills/`. This repository keeps canonical source under `skills/` to avoid generated install directories becoming source.

Default install mode uses a canonical copy plus symlinks when supported. Use `--copy` only when symlinks are not suitable. `--list` may show "Cloning repository" for remote sources, but it should not write install output into the current working tree.

Project installs write `skills-lock.json` in the consuming project. This source repository should not commit `skills-lock.json`, `.skill-lock.json`, `.agents/`, `.claude/`, or `node_modules/`.

## Quality Bar

- One skill should do one job.
- Prefer concise imperative instructions.
- Explain why non-obvious constraints matter.
- Bundle scripts only when they remove repeated deterministic work.
- Never include secrets, private tokens, or surprising executable behavior.
- Validate with real discovery/install commands before treating a skill as ready.

## Validation Checklist

For this source repository:

```bash
npm run validate
npx skills@latest add . --list
git status --short --ignored
```

For a real local install test:

```bash
tmpdir=$(mktemp -d)
cd "$tmpdir"
mkdir -p .claude
npx skills@latest add /path/to/skills --skill <skill-name> -a claude-code -a codex -y
find . -maxdepth 5 -type f -o -type l
```

Confirm:

- `.agents/skills/<skill-name>/SKILL.md` exists.
- `.claude/skills/<skill-name>` is a symlink when `.claude/` existed before install.
- `skills-lock.json` exists in the consuming test project, not this source repository.
- No `.agents/`, `.claude/`, `skills-lock.json`, `.skill-lock.json`, or `node_modules/` files were created in this source repository.
