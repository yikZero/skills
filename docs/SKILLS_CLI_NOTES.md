# Skills CLI Notes

These notes capture behavior from `vercel-labs/skills` that matters when maintaining this catalog.

## Source Formats

The CLI accepts several source forms:

```bash
npx skills add yikZero/skills
npx skills add https://github.com/yikZero/skills
npx skills add https://github.com/yikZero/skills/tree/main/skills/pi-coding-agent-sdk
npx skills add git@github.com:yikZero/skills.git
npx skills add ./local-skills-repo
```

This repository also publishes a thin npm shortcut:

```bash
npx yskill
npx yskill --list
npx yskill --preset frontend
npx yskill --skill find-docs -a codex
```

`yskill` forwards most arguments to `npx skills@latest add yikZero/skills`. With no selection arguments, it opens a first-level menu:

```text
What do you want to install?
> Core recommended
  Frontend bundle
  Pick individual skills
  Install all
```

`--preset default` expands to `find-docs`, `remove-ai-slop`, and `learn-to-agents`.
`--preset frontend` expands to the default set plus `design`, `web-ui-audit`, `react-performance`, `react-composition`, `shadcn-ui`, and `tailwind-design-system`.
In non-interactive shells, `yskill` requires an explicit selection such as `--preset`, `--skill`, `--all`, or `--list`; it must not fall through to the upstream CLI's default install behavior.

Useful shorthand:

```bash
# Install one skill by source-level selector.
npx skills add yikZero/skills@pi-coding-agent-sdk

# Pin a branch/tag/ref; optionally select a skill after @.
npx skills add yikZero/skills#main@pi-coding-agent-sdk

# Install all skills from a source.
npx skills add yikZero/skills --all

# Install all skills to one agent.
npx skills add yikZero/skills --skill '*' -a claude-code

# Install one skill to all detected/supported agents.
npx skills add yikZero/skills --agent '*' --skill pi-coding-agent-sdk
```

For multi-word skill names, quote the full value. This catalog uses kebab-case names, so quoting should rarely be needed.

## Discovery Rules

The CLI searches common locations first, including:

- `skills/`
- `skills/.curated/`
- `skills/.experimental/`
- `.agents/skills/`
- `.claude/skills/`
- several other agent-specific skill folders

This repository keeps canonical source under `skills/` only. Do not put generated installs under `.agents/skills/` or `.claude/skills/` here.

If a source points directly at a folder with `SKILL.md`, the CLI treats that folder as the skill and does not keep searching deeper unless `--full-depth` is used.

## Internal Skills

The CLI hides skills with this frontmatter by default:

```yaml
metadata:
  internal: true
```

Use that for work-in-progress skills under `skills/.experimental/`. Explicit install requests or `INSTALL_INTERNAL_SKILLS=1` can include them.

## Lock Files

Project installs write `skills-lock.json` in the consuming project. This file is meant to be committed by that project so `npx skills update -p -y` can update the same skills later.

Global installs use a global lock under `~/.agents/.skill-lock.json`.

This source repository should not commit either lock file unless it starts consuming other skills itself.

## `--list` Safety

`npx skills add yikZero/skills --list` clones the remote source to inspect available skills. That clone is temporary and should not create files in the current working tree.

If you are checking whether this source repo stayed clean after a command, run:

```bash
git status --short --ignored
find . -maxdepth 4 \( -name 'skills-lock.json' -o -name '.skill-lock.json' -o -name '.agents' -o -name '.claude' -o -name 'node_modules' \) -print
```

## Install Method

Symlink mode is the default and preferred mode. The CLI copies the skill to the canonical `.agents/skills/<skill-name>` location, then symlinks agent-specific directories when those agent roots exist.

Use `--copy` only when symlinks are not suitable:

```bash
npx skills add yikZero/skills --skill pi-coding-agent-sdk -a claude-code -a codex --copy
```

## Updating Installed Skills

```bash
npx skills update
npx skills update pi-coding-agent-sdk
npx skills update -p -y
npx skills update -g -y
```

Project updates use the consuming project's `skills-lock.json`; remote GitHub-backed updates compare skill folder hashes.
