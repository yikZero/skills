---
name: skill-authoring
description: Create, update, and validate portable Agent Skills for this repository or another skills catalog. Use when adding a new SKILL.md, editing skill metadata or descriptions, organizing references/scripts/assets, testing trigger behavior, or preparing skills for installation with the skills CLI across Claude Code and Codex.
---

# Skill Authoring

Use this skill to create or improve Agent Skills that work across Claude Code, Codex, and the `skills` CLI.

## Workflow

1. Clarify the reusable capability the skill should capture.
2. Choose a narrow lowercase kebab-case name and create `skills/<name>/SKILL.md`.
3. Put the trigger surface in the `description`: what the skill does, when to use it, and concrete task phrases that should activate it.
4. Keep the `SKILL.md` body short and procedural. Move long material into `references/`, repeatable code into `scripts/`, and reusable output files into `assets/`.
5. Avoid agent-specific frontmatter by default. Add `compatibility` only when the skill needs a specific environment or product.
6. Validate the skill and test discovery with the `skills` CLI.

## Standards

Read `references/standards.md` before making structural decisions about frontmatter fields, directory layout, or install behavior, and before designing a skill body — it also covers design patterns: single-responsibility declarations with sibling routing, prompt-injection defense for repo-sweeping skills, required negative output for finders and auditors, anti-example output formats, value-precision rules, operating posture, effort tiers, and explicit-only invocation.

## Validation

For this repository, run:

```bash
npm run validate
npx skills@latest add . --list
```

For install testing from this local checkout:

```bash
tmpdir=$(mktemp -d)
cd "$tmpdir"
mkdir -p .claude
npx skills@latest add /path/to/skills --skill skill-authoring -a claude-code -a codex -y
```
