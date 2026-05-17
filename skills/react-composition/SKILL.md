---
name: react-composition
description: "Use when designing, reviewing, or refactoring React component APIs and composition patterns. Covers Vercel-style guidance for avoiding boolean prop explosions, choosing explicit variants, compound components, children composition, render props, state ownership, provider interfaces, implementation decoupling, and React 19 ref patterns."
argument-hint: "[audit|fix|review] [components or scope]"
user-invocable: true
license: "MIT. Adapted from vercel-labs/agent-skills composition-patterns. See NOTICE.md."
---

React component composition and API design guidance.

This skill focuses on component structure, not visual styling. Use `design` or `web-ui-audit` for UI quality; use this when the component API itself is becoming hard to use or maintain.

## Use

Use this skill for:

- Component APIs with many boolean props or mutually exclusive prop combinations.
- Deciding between explicit variants, compound components, slots, children composition, and render props.
- Refactoring provider or context interfaces.
- Moving state to the right owner without leaking implementation details.
- Reviewing reusable component libraries and design-system primitives.

Do not use it to rewrite working local components just because an abstraction is possible. The goal is a simpler public interface and clearer ownership.

## Process

1. Inspect the component, its callers, and tests or stories if present.
2. Identify the real pain: boolean combinations, hidden state coupling, hard-coded layout, implicit variants, or repeated caller work.
3. Read only the matching rule files from `references/rules/`:
   - `architecture-avoid-boolean-props.md`
   - `architecture-compound-components.md`
   - `patterns-children-over-render-props.md`
   - `patterns-explicit-variants.md`
   - `state-context-interface.md`
   - `state-decouple-implementation.md`
   - `state-lift-state.md`
   - `react19-no-forwardref.md` only when the project is actually on React 19 or migrating there.
4. Prefer small API changes that preserve existing call sites when possible.
5. Update callers and tests together when the public component API changes.

Use `rg -n "<pattern>|<component>|<prop>" .agents/skills/react-composition/references/rules` after install to find the relevant rule quickly. If installed elsewhere, resolve the path relative to this `SKILL.md`.

## Review Output

For reviews:

```text
findings:
- file:line - component API problem, impact on callers, and recommended pattern.
```

Call out whether the issue is a real maintainability problem or only a possible future cleanup.

## Fix Output

For implementation, finish with:

- Public API changes.
- Caller updates.
- Validation run, or the reason validation was not run.
