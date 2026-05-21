# yikzero skills

Personal Agent Skills catalog for Claude Code and Codex.

This repository is designed to work with the `skills` CLI:

```bash
npx yskill
npx yskill --list
npx yskill --preset frontend
npx yskill --skill design -a claude-code -a codex
```

`yskill` is a small npm shortcut around:

```bash
npx skills add yikZero/skills --list
npx skills add yikZero/skills --skill design -a claude-code -a codex
```

With no arguments, `npx yskill` opens a menu:

```text
What do you want to install?
> Core recommended
  Frontend bundle
  Pick individual skills
  Install all
```

In non-interactive shells, pass a selection explicitly so it cannot accidentally install everything:

```bash
npx yskill --preset default
npx yskill --preset frontend
npx yskill --skill find-docs -a codex -y
npx yskill --all
```

For local development before publishing:

```bash
npx skills add /path/to/skills --list
npx skills add /path/to/skills --skill design -a claude-code -a codex
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

- `design`: focused frontend UI review and refinement workflow adapted from `pbakaus/impeccable`, exposed as `audit`, `critique`, `polish`, `harden`, `layout`, `typeset`, `colorize`, `clarify`, and `distill`.
- `chat-sdk`: build and review Vercel Chat SDK bots across Slack, GitHub, Discord, Teams, and other chat platforms using SDK-native adapters, events, streaming, state, cards, and webhooks.
- `find-docs`: Context7 CLI workflow for fetching current library, framework, SDK, API, and CLI documentation.
- `learn-to-agents`: capture durable project discoveries in the nearest scoped `AGENTS.md`.
- `remove-ai-slop`: clean generated-looking code from diffs before review or commit.
- `react-composition`: review and refactor React component APIs, state ownership, and composition patterns.
- `react-performance`: review and improve React or Next.js performance using Vercel-style rules.
- `shadcn-ui`: add, customize, and review shadcn/ui components with CLI-backed workflows.
- `skill-authoring`: create, update, and validate portable Agent Skills.
- `tailwind-design-system`: build and audit Tailwind CSS design systems, tokens, variants, and component patterns.
- `web-ui-audit`: run terse file:line audits against web UI implementation guidelines.
- `workflow`: install, configure, build, debug, and self-host Workflow SDK workflows, prioritizing TanStack Start, Next.js, and Vite while still linking to broader docs and examples.
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
npm run test:cli
npx skills@latest add . --list
npx skills@latest add . --skill design -a claude-code -a codex
npx skills@latest update design -p -y
```

`npx skills add yikZero/skills --list` temporarily clones the remote repository to inspect skills; it should not write `.agents/`, `.claude/`, or `skills-lock.json` into this source repository.

Run real remote installs from a consuming project, not this source repository:

```bash
npx yskill
npx yskill --preset default
npx yskill --preset frontend
npx yskill --skill design -a claude-code -a codex
npx skills@latest add yikZero/skills@design -a claude-code -a codex
```

See [docs/SKILLS_CLI_NOTES.md](docs/SKILLS_CLI_NOTES.md) for source formats, lock behavior, update rules, and safe local testing.

## Adding Skills

Use [docs/ADDING_SKILLS.md](docs/ADDING_SKILLS.md) as the process checklist. Keep `AGENTS.md` as the source of truth for agent behavior in this repository.

That doc also includes copy-paste prompts for asking an AI agent to add a new skill or migrate an existing skill safely.
