# Adding Skills

This is the standard process for adding or updating a skill in this repository.

## 1. Decide the Skill Boundary

Create a skill when the workflow is reusable and specific enough to improve future agent behavior. Good skills usually capture one of these:

- A repeated workflow with clear steps.
- Domain knowledge that should load only when relevant.
- Tool usage that needs exact commands, examples, or references.
- A deterministic helper script that agents keep rewriting.

Do not create a skill for one-off project facts. Put those in the target project's `AGENTS.md` instead.

## Asking an AI to Add Skills

For a new skill, use this prompt:

```text
In /Users/yikzero/Code/skills, add a new <topic> skill. Follow AGENTS.md and docs/ADDING_SKILLS.md. Keep it portable for Claude Code and Codex. Finish by running npm run validate, npx skills@latest add . --list, and git status --short --ignored.
```

For migrating an existing skill, use this prompt:

```text
Copy the skill from <source path or repo> into /Users/yikzero/Code/skills. Copy only the clean skills/<name>/ package. Do not copy .agents, .claude, skills-lock.json, .skill-lock.json, node_modules, or .git. Validate with npm run validate and npx skills@latest add . --list.
```

The agent should report:

- Which skill directories changed.
- Which validation commands were run.
- Whether any install artifacts or lock files were detected.

## 2. Create the Folder

Use lowercase kebab-case and make the folder name match frontmatter `name`:

```bash
mkdir -p skills/my-skill
cp templates/skill/SKILL.md skills/my-skill/SKILL.md
```

Edit the frontmatter:

```yaml
---
name: my-skill
description: Explain what this skill does and when to use it. Include concrete trigger words and realistic task contexts.
---
```

## 3. Write for Progressive Disclosure

Keep `SKILL.md` concise:

- Put the trigger logic in `description`, not buried in the body.
- Put core workflow steps in the body.
- Put long details in `references/`.
- Put repeatable deterministic code in `scripts/`.
- Put templates and static resources in `assets/`.

Reference extra files directly from `SKILL.md`, for example:

```md
Read `references/api-contract.md` when the task touches API schemas.
Run `scripts/normalize.py <input> <output>` for deterministic normalization.
```

## 4. Keep It Cross-Agent

The default target is both Claude Code and Codex, installed with:

```bash
npx skills add yikZero/skills --skill my-skill -a claude-code -a codex
```

Avoid agent-specific frontmatter unless the skill deliberately targets one agent. Prefer the portable fields:

- `name`
- `description`
- `license`
- `compatibility`
- `metadata`
- `allowed-tools` only when you accept that support varies by agent.

If you need Claude-specific behavior such as manual-only invocation, state the compatibility clearly and test it in Claude Code. If you need Codex UI metadata, add `agents/openai.yaml` inside the skill and keep the core `SKILL.md` portable.

## 5. Validate

Run:

```bash
npm run validate
npx skills@latest add . --list
```

For install validation, use a temporary project so the repository does not install into itself:

```bash
tmpdir=$(mktemp -d)
cd "$tmpdir"
mkdir -p .claude
npx skills@latest add /path/to/skills --skill my-skill -a claude-code -a codex -y
find . -maxdepth 4 -type f -name SKILL.md -print
```

Confirm `.agents/skills/my-skill/SKILL.md` exists. If `.claude/` existed before installation, confirm `.claude/skills/my-skill` is a symlink to the canonical `.agents/skills/my-skill` directory.

After publishing the change, verify the remote source and shorthand selector:

```bash
npx skills@latest add yikZero/skills --list
tmpdir=$(mktemp -d)
cd "$tmpdir"
npx skills@latest add yikZero/skills@my-skill -a codex -y
```

## 6. Update Existing Installs

After changing a published skill:

```bash
npx skills update my-skill -p -y
```

For global installs:

```bash
npx skills update my-skill -g -y
```

If symlink mode was used from a local path, updating the canonical source may be enough. Still run `npm run validate` and `npx skills@latest add . --list` before relying on it.

## 7. Review Before Sharing

Before pushing or distributing:

- Verify no secrets, tokens, or private paths are in the skill.
- Review every script under `scripts/`.
- Ensure descriptions are specific enough to trigger, but narrow enough to avoid unrelated tasks.
- Prefer examples that match real prompts the user would type.

Final local sanity check:

```bash
npm run validate
npx skills@latest add . --list
git status --short --ignored
```

If `git status --short --ignored` shows generated install output such as `.agents/`, `.claude/`, `skills-lock.json`, `.skill-lock.json`, or `node_modules/`, remove that output before committing.
