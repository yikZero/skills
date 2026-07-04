# Best-Practice Discovery

Run this pass for every initialization before locking the route or toolchain.
The goal is to catch current framework/platform practice and better defaults
without turning setup into open-ended research.

## Minimum Pass

Use a compact search set. Run both web search and docs lookup; do not skip web
search just because official docs are available.

```bash
web search: <app type> <platform-or-stack> project setup best practices current
project skill: .agents/skills/find-docs
npx ctx7@latest library <framework-or-tool> "<setup best practices generator lint test config>"
npx ctx7@latest docs <selected-doc-id> "<current init command project structure lint test config>"
npx skills find "<app-type-or-stack> setup"
```

If `.agents/skills/find-docs` is missing in an existing target project, install
it project-locally before the docs lookup, using the canonical install command
in `skill-recommendation.md`.

Run additional web searches when the app type, platform, repository hygiene,
security, or current ecosystem practice is not fully answered by the minimum
search.

Examples:

- `<app type> <platform> project setup best practices current`
- `<framework> official create app lint test TypeScript setup`
- `<platform> mini program TypeScript testing linting project structure`
- `<stack> deployment local development validation best practices`

## Source Preference

Prefer sources in this order:

1. Official framework/platform/package-manager docs.
2. Maintainer repositories, release notes, and examples.
3. Security/repository hygiene guidance from reputable primary sources such as
   GitHub Docs or OpenSSF.
4. Recent high-quality community guides only when primary sources are missing or
   ambiguous.

Avoid adopting advice from stale blogs, unmaintained templates, or generic SEO
guides without corroboration.

## What To Decide

Check whether the user's defaults should be kept or adjusted:

- route: baseline, official generator, external template, or flexible
  platform route
- package manager: Bun by default for TypeScript, but switch to pnpm/npm when
  official tooling or ecosystem friction makes that better
- formatter/linter: Biome by default for TypeScript; add or replace with
  framework-required tools only with a recorded reason
- validation: format, lint, typecheck, test, build, browser screenshots, CI,
  deployment smoke, security checks
- project structure: framework-native layout first when a generator owns it
- skills: install only relevant reusable skills; summarize workflows when no
  suitable skill exists

## Recording Rule

Write a short `Best-Practice Discovery` section in `INIT.md`:

- search/docs commands or URLs checked
- best-practice findings that affect setup
- better-than-default suggestions
- decisions accepted
- alternatives rejected and why

If `INIT.md` has not been generated yet, keep compact notes in the working
context and write them into `INIT.md` immediately after baseline creation.

Before deleting `INIT.md`, move durable decisions into `README.md`,
`PRODUCT.md`, `AGENTS.md`, `ARCHITECTURE.md`, `CODESTYLE.md`, `DESIGN.md`, or
`ROADMAP.md`. Do not keep long research notes in durable docs.
