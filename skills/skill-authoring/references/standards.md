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

## Structuring Larger Skills

Small prompt-style skills need only `SKILL.md`. These rules apply when a skill
grows past that: multiple references, bundled scripts or templates, or risky
actions. They are conditional on purpose. Do not add empty sections to a skill
that does not meet the trigger, because unused scaffolding is its own kind of
noise.

- **Reference Map when references number three or more.** Add a short map near
  the top of `SKILL.md` listing each reference, the single concern it owns, and
  when to read it. Progressive disclosure only works if the agent knows which
  file answers which question without opening all of them. Give every reference
  one job so the map stays honest.
- **Separate maintainer content from the runtime workflow.** When a skill
  bundles `scripts/` or `assets/templates/`, guidance for changing those (file
  layout, placeholder wiring, how to add a variant, versioning policy) belongs
  in `references/maintenance.md`, not in the steps an agent follows to run the
  skill. Mixing the two makes every run pay to read instructions it will never
  use, and tempts maintenance edits into the wrong file.
- **One authoritative source per fact.** State each command, file list, or rule
  in exactly one place and point to it from everywhere else. Duplicated facts
  drift: the copy you forget to update becomes a quiet lie. A pointer that reads
  "use the canonical command in `skill-recommendation.md`" is longer to follow
  but never wrong.
- **Keep a Stop Conditions section for risky actions.** If a skill can
  overwrite files, install heavy dependencies, create remote resources, or
  handle secrets, list the moments it must pause and ask. Agents optimize for
  finishing the task; the explicit list is what makes them stop before an
  irreversible step.

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
