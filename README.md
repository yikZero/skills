# yikzero skills

[![skills.sh](https://skills.sh/b/yikZero/skills)](https://skills.sh/yikZero/skills)

A personal Agent Skills catalog for Claude Code and Codex.

Agents are capable, but they come with no defaults of their own. Left alone they hand-roll a component a library already does better, write migrations that lock a hot table, ship prose that reads machine-written, and pad reviews with findings to look productive. Each skill here encodes a reviewed workflow — exact values, hard rules, required output formats, and what *not* to do — so an agent inherits working defaults instead of improvising them.

Most skills are distilled from strong public sources and adapted into one portable format that installs into both agents. Sources are credited in each skill's `README.md` or `NOTICE.md`.

## Install

```bash
npx yskill
```

With no arguments this opens a menu:

```text
What do you want to install?
> Project init
  Improve a codebase
  Frontend bundle
  Writing bundle
  Pick individual skills
  Install all
```

In non-interactive shells, pass a selection explicitly so it cannot accidentally install everything:

```bash
npx yskill --preset init
npx yskill --preset default
npx yskill --preset frontend
npx yskill --preset writing
npx yskill --skill plan-handoff
npx yskill --all
```

`yskill` is a thin shortcut around `npx skills add yikZero/skills`. Add agent flags only to target a specific app (`-a claude-code`, `-a codex`, or both), and `-y` only for non-interactive installs. Full source formats, lock behavior, and update rules: [docs/SKILLS_CLI_NOTES.md](docs/SKILLS_CLI_NOTES.md).

## Skills

**Plan & bootstrap**

- **[project-bootstrap](skills/project-bootstrap/)** — turn a product, app, automation, or library idea into a ready-to-build baseline: docs discovery, runtime selection, control docs, validation, first-workflow handoff.
- **[plan-handoff](skills/plan-handoff/)** — audit a codebase in one focus area, then write prioritized, self-contained plans into `plans/` that any executor agent, including cheaper models, can apply with zero extra context.

**Frontend**

- **[design](skills/design/)** — frontend UI design review and refinement in nine passes: `audit`, `critique`, `polish`, `harden`, `layout`, `typeset`, `colorize`, `clarify`, `distill`.
- **[web-ui-audit](skills/web-ui-audit/)** — terse `file:line` audits against Vercel's Web Interface Guidelines.
- **[react-composition](skills/react-composition/)** — review and refactor React component APIs, state ownership, and composition patterns.
- **[react-performance](skills/react-performance/)** — review and improve React or Next.js performance using Vercel-style rules.
- **[shadcn-ui](skills/shadcn-ui/)** — add, customize, and review shadcn/ui components with CLI-backed workflows.
- **[tailwind-design-system](skills/tailwind-design-system/)** — build and audit Tailwind CSS design systems, tokens, variants, and component patterns.

**Backend**

- **[postgres-best-practices](skills/postgres-best-practices/)** — production-proven PostgreSQL rules: schema and data types, indexing, query tuning, lock-safe migrations, scaling.

**Writing**

- **[humanize-zh](skills/humanize-zh/)** — 给中文稿件去 AI 味: six-layer pattern table, honesty rules against fabricated specificity, pre-delivery checklist.
- **[humanize-en](skills/humanize-en/)** — strip AI flavor from English prose with a 27-pattern table and the same honesty rules.

**Meta**

- **[skill-authoring](skills/skill-authoring/)** — create, update, and validate portable Agent Skills; carries the standards and design patterns this catalog follows.

### Plan handoff

Inspired by [shadcn/improve](https://github.com/shadcn/improve) and [emilkowalski/skills](https://github.com/emilkowalski/skills): use your most capable model where judgment compounds — auditing, prioritizing, writing the spec — and hand execution to any agent. `plan-handoff` surveys one focus area, presents a leverage-ordered findings table (plus what it considered and rejected), and writes commit-stamped, self-contained plans that a model with zero context can execute. It never touches source code outside `execute`.

```text
> audit the error handling in this codebase and write plans
> plan-handoff quick performance
> plan-handoff plan add request timeouts to every fetch call
> plan-handoff execute plans/001-add-request-timeouts.md
> plan-handoff reconcile
```

## Installed Paths

| Agent | Project install | Global install |
| --- | --- | --- |
| Claude Code | `.claude/skills/<skill-name>/` | `~/.claude/skills/<skill-name>/` |
| Codex | `.agents/skills/<skill-name>/` | `~/.codex/skills/<skill-name>/` |

The default install mode uses a canonical copy plus symlinks where supported. In project installs, `.agents/skills/` is the canonical location; Claude Code gets a `.claude/skills/<skill-name>` symlink when the project already has a `.claude/` directory. Use `--copy` only when symlinks are not appropriate.

## Development

```text
skills/            installable catalog (the only one)
docs/              process and skills CLI notes
templates/skill/   non-installable starter files
scripts/           validate-skills.mjs
```

```bash
npm run validate
npm run test:cli
npx skills@latest add . --list
npx skills add /path/to/skills --skill design   # local install test from a consuming project
```

`npx skills add yikZero/skills --list` temporarily clones the repository to inspect skills; it should not write `.agents/`, `.claude/`, or `skills-lock.json` into this source repository.

To add or migrate a skill, follow [docs/ADDING_SKILLS.md](docs/ADDING_SKILLS.md) — it includes copy-paste prompts for asking an AI agent to do it safely. `AGENTS.md` stays the source of truth for agent behavior in this repository; authoring standards live in [skills/skill-authoring](skills/skill-authoring/).
