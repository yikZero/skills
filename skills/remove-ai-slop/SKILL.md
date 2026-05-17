---
name: remove-ai-slop
description: Clean AI-generated slop from code diffs before review or commit. Use when the user asks to polish a diff, remove AI traces, clean up generated-looking code, prepare for review, or check for unnecessary comments, over-defensive code, broad try/catch, type bypasses, single-use abstractions, stale API guesses, or style drift.
argument-hint: "[review|fix] [files or scope]"
user-invocable: true
---

# Remove AI Slop

Clean the current code diff so it looks intentionally maintained, not generated. Default to the current working tree diff unless the user gives files or scope.

## Mode

- **Review-only**: If the user asks to review, inspect, or identify slop, do not edit. Report findings only.
- **Fix**: If the user asks to clean, polish, remove, or prepare for commit, make tightly scoped edits.
- **Ambiguous**: State the assumed mode briefly and proceed with the safer interpretation. For commit-prep wording, assume fix mode.

## Process

1. Inspect the change set first:
   - Run `git status --short`.
   - Use `git diff --stat`, `git diff --name-only`, and relevant `git diff` hunks.
   - If changes are staged, inspect `git diff --cached` too.
2. Read nearby code before editing. Preserve local style, naming, error handling, and test conventions over generic cleanup preferences.
3. Keep commits reviewable. Do not combine unrelated cleanup with the user's feature or bug fix.
4. Remove only changes that are clearly unnecessary, misleading, stale, or inconsistent with surrounding code.
5. Run the narrowest practical validation after edits. If validation is not practical, say why.

## What To Remove

- Obvious comments that narrate the code rather than explain an invariant, platform quirk, security constraint, or business rule.
- Commented-out code, dead debug output, temporary logs, TODOs invented during the session, and decorative output.
- Broad `try/catch` blocks that swallow errors, duplicate existing handling, or add no recovery behavior.
- Defensive checks for states that are impossible because inputs were already validated or typed.
- `any`, `@ts-ignore`, non-null assertions, unchecked casts, or type widening used to bypass a real type problem.
- Single-use helpers, wrappers, constants, or abstractions that make the code harder to read.
- Backward-compatibility paths without persisted data, shipped behavior, external consumers, or an explicit requirement.
- Hallucinated or stale API calls that do not match the installed package or local SDK surface.
- Formatting churn, import churn, or file moves unrelated to the requested change.

## What To Keep

- Comments documenting non-obvious invariants, edge cases, security constraints, generated-file boundaries, or domain rules.
- Explicit error handling that changes user-visible behavior or protects data integrity.
- Small duplication when the local codebase clearly favors directness over abstraction.
- Existing user or other-agent changes that are unrelated to the cleanup.
- Tests that cover the real behavior, even if they are longer than the implementation.

## Review Output

For review-only mode, lead with high-confidence findings:

- File and line or hunk reference.
- Why it looks generated or risky.
- The smallest safe fix.

Skip low-confidence nits. If no meaningful slop is present, say so and mention any residual risk.

## Fix Output

End with a compact summary:

- What slop was removed or simplified.
- Files changed.
- Validation run, or why validation was not run.

