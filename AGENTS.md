# AGENTS.md

This repository is a personal Agent Skills catalog. Treat this file as the canonical guidance for agents working here; keep `README.md` focused on human-facing usage.

## Project Overview

- Skills are authored once under `skills/<skill-name>/`.
- Each skill must be installable with the Vercel `skills` CLI, for example:
  `npx skills add yikzero/skills --skill <skill-name> -a claude-code -a codex`
- Claude Code project installs target `.claude/skills/`.
- Codex project installs target `.agents/skills/`.
- Prefer portable Agent Skills format over Claude-only or Codex-only fields.

## Validation Commands

- List discoverable skills: `npx skills@latest add . --list`
- Validate repository skills: `npm run validate`
- Test a local install into both target agents from a temporary project:
  create a temp directory, create `.claude/` inside it, then run
  `npx skills@latest add /path/to/skills --skill skill-authoring -a claude-code -a codex -y`.

## Skill Authoring Rules

- Use `skills/<skill-name>/SKILL.md`; the directory name and frontmatter `name` must match.
- Keep names lowercase kebab-case: `code-review`, not `Code Review` or `code_review`.
- Every `SKILL.md` must have YAML frontmatter with `name` and `description`.
- Descriptions should say what the skill does and when to use it. Include concrete trigger words, but avoid broad catch-all wording.
- Keep `SKILL.md` lean. Move long details into `references/`, reusable code into `scripts/`, and reusable output files into `assets/`.
- Avoid vendor-specific frontmatter unless the skill is intentionally single-agent. If needed, document compatibility in `compatibility`.
- Treat scripts as executable supply-chain surface. Keep them small, deterministic, and argument-driven. Do not hardcode personal paths or secrets.
- Do not create installable template skills. Put templates under `templates/`, not under `skills/`.

## Repository Layout

- `skills/`: installable skills discovered by `npx skills`.
- `docs/ADDING_SKILLS.md`: step-by-step process for adding or updating skills.
- `docs/SKILLS_CLI_NOTES.md`: skills CLI source formats, lock files, and install/update behavior.
- `templates/`: non-installable starter files.
- `scripts/validate-skills.mjs`: local repository validation.

## Update Workflow

1. Edit the canonical skill under `skills/<skill-name>/`.
2. Run `npm run validate`.
3. Run `npx skills@latest add . --list` and confirm the expected skill appears.
4. If install behavior changed, test a local install into a temporary project. Create `.claude/` first when verifying the Claude Code symlink path.
5. Update `README.md` or `docs/ADDING_SKILLS.md` when the user-facing workflow changes.

## AI Handoff Patterns

When the user asks to add a new skill, follow this request shape:

```text
Add a new <topic> skill in this repository. Follow AGENTS.md and docs/ADDING_SKILLS.md. Keep it portable for Claude Code and Codex. Finish by running npm run validate, npx skills@latest add . --list, and git status --short --ignored.
```

When the user asks to migrate an existing skill, follow this request shape:

```text
Copy the skill from <source path or repo> into this catalog. Copy only the clean skills/<name>/ package. Do not copy .agents, .claude, skills-lock.json, .skill-lock.json, node_modules, or .git. Follow AGENTS.md, validate discovery, and report the source path copied.
```

Always finish skill changes with:

```bash
npm run validate
npx skills@latest add . --list
git status --short --ignored
```
