---
name: react-performance
description: "Use when writing, reviewing, refactoring, or optimizing React and Next.js code for performance. Covers Vercel-style best practices for async waterfalls, bundle size, server components and RSC serialization, client data fetching, re-renders, hydration, Suspense, dynamic imports, React.cache, JavaScript hot paths, and performance audits."
argument-hint: "[audit|fix|review] [files or scope]"
user-invocable: true
license: "MIT. Adapted from vercel-labs/agent-skills react-best-practices. See NOTICE.md."
---

React and Next.js performance review and implementation guidance.

This skill keeps the high-signal workflow in `SKILL.md` and stores the detailed Vercel rule set in `references/rules/`.

## Use

Use this skill for:

- React or Next.js performance reviews.
- Fixes involving rerenders, Suspense, hydration, server/client boundaries, async waterfalls, bundle size, or hot JavaScript paths.
- PR review comments that mention performance, React Server Components, serialization, caching, client data fetching, dynamic imports, or memoization.

Do not use it for generic React syntax questions unless the task has a performance angle. For current API details or version-specific behavior, pair this with the docs workflow required by the project, then apply the local rules.

## Process

1. Identify the framework and versions from `package.json`, lockfiles, and config files.
2. Inspect the target files and any callers. Performance fixes often require seeing the data flow and render boundary.
3. Pick the matching rules from `references/rules/`:
   - `async-*` for waterfalls, parallelization, route handlers, and Suspense placement.
   - `bundle-*` for imports, third-party code, dynamic imports, preloading, and analyzable paths.
   - `server-*` for RSC, caching, serialization, server actions, and shared state.
   - `client-*` for browser data, storage, event listeners, and SWR deduping.
   - `rerender-*` for memoization, derived state, inline components, transitions, refs, and dependency churn.
   - `rendering-*` for hydration, resource hints, SVG, scripts, content visibility, and loading states.
   - `js-*` for hot-path JavaScript optimizations.
   - `advanced-*` only when hooks, refs, or once-only initialization are the actual issue.
4. Prefer measurable fixes over aesthetic rewrites. Look for existing tests, profiler evidence, bundle output, traces, or obvious asymptotic wins.
5. Keep changes local to the performance issue unless a small API adjustment clearly removes the root cause.

Use `rg -n "<topic>|<api>|<symptom>" .agents/skills/react-performance/references/rules` after install to find relevant rules quickly. If the skill is installed somewhere else, resolve the path relative to this `SKILL.md`.

## Review Output

For reviews, lead with findings:

```text
findings:
- file:line - issue, why it hurts performance, and the concrete fix.
```

Group findings by impact. Avoid speculative advice if the current code does not show the problem.

## Fix Output

For implementation, finish with:

- Files changed.
- Which performance rules were applied.
- Validation run, or the reason validation was not run.
