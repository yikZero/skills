# Init: {{PROJECT_NAME}}

Delete this file after the first setup slice is complete and the durable truth
has been moved into `README.md`, `PRODUCT.md`, `AGENTS.md`, `ARCHITECTURE.md`,
`CODESTYLE.md`, `DESIGN.md`, and `ROADMAP.md`.

## Purpose

Prepare {{PROJECT_NAME}} for its first useful workflow. {{DESCRIPTION}}

## Current Context

The repository has a {{PROFILE_LABEL}} AI-ready baseline. Product behavior, app
surface, framework/runtime, deployment target, and durable validation still need
to be selected.

## Decisions To Make First

- First target user.
- First useful workflow.
- App type and stack, including unsupported-by-template cases such as mini programs, mobile apps, browser extensions, hardware tools, or platform-specific automations.
- Deployment target.
- Data storage, authentication, and integration needs.
- UI expectations and screenshot review needs.

## Best-Practice Discovery

- Status: replace this section with the web search and docs lookup results before locking setup.
- Sources to check: official framework/platform docs, current generator docs, validation/tooling docs, relevant repository hygiene/security guidance, and `npx skills find` for reusable setup skills.
- Better-than-default suggestions: open question.
- Decisions accepted: open question.
- Alternatives rejected: open question.

## Plan of Work

1. Confirm the first target user and first useful workflow.
2. Install `.agents/skills/find-docs` project-locally from `yikZero/skills` unless it already exists.
3. Run both web search and docs lookup for best-practice discovery, then record sources, findings, and better-than-default suggestions here.
4. Select the smallest stack that can implement that workflow.
5. For known stacks, use the official generator or setup flow after verifying current docs.
6. For project types outside the preset routes, keep this baseline generic, record the stack-specific assumptions, and add only the tooling the first workflow requires.
7. Preserve the selected package manager unless current best practice or official tooling makes another choice better.
8. Add stack-specific lint, typecheck, build, browser, integration, or deployment validation.
9. Implement the first thin workflow slice.
10. Update durable control docs so they match the implemented behavior.
11. Delete `INIT.md` once the setup slice is complete and no longer contains unique truth.

## Validation

Current baseline:

```bash
{{VALIDATION_COMMANDS}}
```

Add stack-specific commands before product code is considered complete.

## Acceptance Criteria

- The first workflow is described in `PRODUCT.md`.
- The selected stack and boundaries are described in `ARCHITECTURE.md`.
- Canonical commands are listed in `README.md` and `AGENTS.md`.
- `.agents/skills/find-docs` is installed or the opt-out reason is recorded.
- `{{VALIDATE_COMMAND}}` passes.
- `INIT.md` is deleted after its remaining decisions have been captured in durable docs.
