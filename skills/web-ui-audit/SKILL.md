---
name: web-ui-audit
description: "Use for terse file:line audits of web UI implementation quality. Checks accessibility, focus states, forms, animation, typography, content handling, images, performance, navigation state, touch interaction, safe areas, theming, i18n, hydration safety, hover states, copy, and common anti-patterns using Vercel Web Interface Guidelines."
argument-hint: "[files or patterns]"
user-invocable: true
license: "MIT. Adapted from vercel-labs web-interface-guidelines and web-design-guidelines skill. See NOTICE.md."
---

Implementation-level web UI audit based on Vercel Web Interface Guidelines.

This is a terse code review skill. It is narrower than `design`: use `design` for visual direction and product UX critique; use this skill for concrete implementation compliance checks with `file:line` output.

## Use

Use this skill for:

- UI implementation reviews before PR or release.
- Accessibility, forms, focus, animation, typography, content overflow, images, performance, navigation state, touch, theming, i18n, hydration, hover states, and copy checks.
- Finding small but real frontend issues in React, Next.js, HTML, CSS, and Tailwind code.

Do not use it for backend-only work or broad aesthetic redesign.

## Process

1. Inspect the target files and get line numbers with `nl -ba <file>` or editor-aware equivalents.
2. Read `references/web-interface-guidelines.md`.
3. Check only rules that apply to the files in scope.
4. Report concrete issues with exact `file:line`. Skip low-confidence guesses.
5. Do not fix issues unless the user asks for fixes after the audit.

If the user explicitly asks for the latest upstream Vercel guideline text, fetch the current source first from `https://github.com/vercel-labs/web-interface-guidelines`.

## Output

No preamble. Group by file:

```text
## src/Button.tsx

src/Button.tsx:42 - icon button missing aria-label
src/Button.tsx:67 - transition: all; list exact properties

## src/Card.tsx

pass
```

State issue and location. Add explanation only when the fix is non-obvious.
