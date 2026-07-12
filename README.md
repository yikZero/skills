# yikzero skills

Personal Agent Skills catalog for Claude Code and Codex.

This repository is designed to work with the `skills` CLI:

```bash
npx yskill
npx yskill --list
npx yskill --preset init
npx yskill --preset frontend
npx yskill --skill design
```

`yskill` is a small npm shortcut around:

```bash
npx skills add yikZero/skills --list
npx skills add yikZero/skills --skill design
```

With no arguments, `npx yskill` opens a menu:

```text
What do you want to install?
> Project init
  Core recommended
  Frontend bundle
  Pick individual skills
  Install all
```

In non-interactive shells, pass a selection explicitly so it cannot accidentally install everything:

```bash
npx yskill --preset init
npx yskill --preset default
npx yskill --preset frontend
npx yskill --skill find-docs
npx yskill --all
```

Add agent flags only when you want to target a specific app, for example
`-a codex`, `-a claude-code`, or both. Add `-y` only for non-interactive
installs.

For local development before publishing:

```bash
npx skills add /path/to/skills --list
npx skills add /path/to/skills --skill design
```

## Layout

```text
skills/
  <skill-name>/
    README.md
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

`skills/` is the only installable catalog. Each skill has a short `README.md` for GitHub browsing and install commands; `SKILL.md` remains the agent entrypoint. Put drafts in `skills/.experimental/` only when they are valid but intentionally hidden from normal installs by `metadata.internal: true`.

## Included Skills

- `design`: focused frontend UI review and refinement workflow adapted from `pbakaus/impeccable`, exposed as `audit`, `critique`, `polish`, `harden`, `layout`, `typeset`, `colorize`, `clarify`, and `distill`.
- `chat-sdk`: build and review Vercel Chat SDK bots across Slack, GitHub, Discord, Teams, and other chat platforms using SDK-native adapters, events, streaming, state, cards, and webhooks.
- `find-docs`: Context7 CLI workflow for fetching current library, framework, SDK, API, and CLI documentation.
- `project-bootstrap`: turn a new product, app, automation, or library idea into a ready-to-build project baseline with current-docs discovery, runtime or framework selection, control docs, repo-local helper skills, validation, and a first-workflow handoff.
- `postgres-best-practices`: design, query, migrate, and operate PostgreSQL with production-proven rules for schema and data types, indexing, query tuning, zero-downtime migrations, and scaling, synthesized from OpenAI's scaling playbook, the PostgreSQL wiki, and strong_migrations.
- `karpathy-guidelines`: behavioral guardrails inspired by Andrej Karpathy's observations for reducing overcomplication, broad edits, hidden assumptions, and unverifiable coding work.
- `react-composition`: review and refactor React component APIs, state ownership, and composition patterns.
- `react-performance`: review and improve React or Next.js performance using Vercel-style rules.
- `shadcn-ui`: add, customize, and review shadcn/ui components with CLI-backed workflows.
- `skill-authoring`: create, update, and validate portable Agent Skills.
- `tailwind-design-system`: build and audit Tailwind CSS design systems, tokens, variants, and component patterns.
- `web-ui-audit`: run terse file:line audits against web UI implementation guidelines.
- `workflow`: install, configure, build, debug, and self-host Workflow SDK workflows, prioritizing TanStack Start, Next.js, and Vite while still linking to broader docs and examples.
- `pi-coding-agent-sdk`: source-backed workflows and recipes for embedding Pi Coding Agent SDK sessions, runtime flows, custom tools, custom skills, resource loading, streaming events, and test harnesses in TypeScript host apps.

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
npm run test:cli
npx skills@latest add . --list
npx skills@latest add . --skill design
npx skills@latest update design -p -y
```

`npx skills add yikZero/skills --list` temporarily clones the remote repository to inspect skills; it should not write `.agents/`, `.claude/`, or `skills-lock.json` into this source repository.

Run real remote installs from a consuming project, not this source repository:

```bash
npx yskill
npx yskill --preset init
npx yskill --preset default
npx yskill --preset frontend
npx yskill --skill design
npx skills@latest add yikZero/skills@design
```

See [docs/SKILLS_CLI_NOTES.md](docs/SKILLS_CLI_NOTES.md) for source formats, lock behavior, update rules, and safe local testing.

## Adding Skills

Use [docs/ADDING_SKILLS.md](docs/ADDING_SKILLS.md) as the process checklist. Keep `AGENTS.md` as the source of truth for agent behavior in this repository.

That doc also includes copy-paste prompts for asking an AI agent to add a new skill or migrate an existing skill safely.
