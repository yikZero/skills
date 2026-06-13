# Skill Recommendation

Recommend skills as part of project initialization only when they match the
project type or near-term work. Avoid installing a large bundle just because it
exists.

## Local Catalog Defaults

Use this repository's installer for known-good personal skills. The generated
project should document these in `AGENTS.md`, but do not install all of them
unless the current project needs them.

```bash
npx yskill --preset default -a codex -y
npx yskill --preset frontend -a codex -y
npx yskill --skill <skill-name> -a codex -y
```

Default/core skills are useful for most coding projects:

- `find-docs`: current framework, SDK, API, and CLI docs.
- `remove-ai-slop`: clean generated-looking diffs before commit/review.
- `learn-to-agents`: write durable project discoveries to scoped `AGENTS.md`.

Frontend projects often benefit from:

- `design`
- `web-ui-audit`
- `react-performance`
- `react-composition`
- `shadcn-ui`
- `tailwind-design-system`

New projects initialized by this skill usually already include repo-local
helper skills under `.agents/skills/`. Treat those as project-specific workflows,
not replacements for globally installed reusable skills.

## Search External Skills

Use targeted searches:

```bash
npx skills find "nextjs setup"
npx skills find "fastapi"
npx skills find "deploy vercel"
npx skills find "project bootstrap"
npx skills find "agents md"
```

Inspect candidates with `npx skills use <owner/repo@skill>` before recommending
or installing. Check for:

- hard-coded personal workflow
- vendor lock-in
- stale commands
- unexpected scripts
- unclear license or attribution requirements
- overlap with local catalog skills

## When No Suitable Skill Exists

Do not force a weak external skill. Instead:

1. Summarize the needed workflow in `AGENTS.md`.
2. Add exact docs lookup commands or official-doc links when useful.
3. Suggest creating a future reusable skill only if the workflow will repeat.
