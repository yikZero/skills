# Plan Template

Every plan written by `plan-handoff` follows this structure. The executor may be a less capable model with zero context and zero judgment of its own — the plan must contain everything, exactly. No references to "the audit above" or "the approach we discussed". Never approximate a value that the audit established — copy it.

```markdown
# NNN — <Short imperative title>

- **Status**: TODO
- **Commit**: <output of `git rev-parse --short HEAD` when this plan was written>
- **Severity**: HIGH | MEDIUM | LOW
- **Category**: <audit category>
- **Estimated scope**: <n files, rough size>

## Problem

What is wrong, where, and why it matters. Cite every location as
`path/to/file.ts:123` and include the current code verbatim:

​```ts
// src/api/client.ts:41 — current
const data = await fetch(url).then((r) => r.json());
​```

## Target

The exact end state. Every value, command, and identifier spelled out — never
"handle errors properly" or "use a sensible timeout":

​```ts
// target
const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
if (!res.ok) throw new ApiError(res.status, await res.text());
const data = await res.json();
​```

## Repo conventions to follow

How this codebase already does it, with one exemplar the executor should
imitate (naming, file placement, error types, token names):

- Errors are thrown as `ApiError` from `src/api/errors.ts`; do not add a new error class.
- <exemplar file:line that already does this correctly>

## Steps

1. <One concrete edit per step: file, what changes, resulting code.>
2. …

## Boundaries

- Do NOT touch <files/components out of scope>.
- Do NOT add new dependencies (unless a step explicitly says otherwise).
- Do NOT refactor, rename, or "improve" anything a step does not name.
- If a step doesn't match the code you find (drift since the commit stamp), STOP and report instead of improvising.

## Verification

- **Mechanical**: <exact commands — typecheck, lint, tests, build — with expected outcome>.
- **Behavioral**: <how to observe the fix working: run the app or script, trigger the path, what to look for or measure>.
- **Done when**: <checkable completion criteria>.
```

## Notes for the plan author

- One plan per finding. Two findings may merge into one plan only when they share every file and the same fix pattern (e.g. the same swap applied across components).
- Pull every value from the bar established during recon — never approximate from memory. If the audit cited a rule, the plan inlines that rule's exact wording or value.
- The behavioral check is not optional. Code can pass typecheck and still not fix the problem; give the executor (or the human reviewing the executor's diff) something observable to confirm.
- After writing plans, create or update `plans/README.md` with: a table of plans (number, title, severity, status), the recommended execution order, and any dependencies between plans.
