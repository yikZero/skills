---
name: project-bootstrap
description: Turn this AI-ready baseline into the first real project slice. Use when selecting the initial stack, replacing placeholders in control docs, adding first framework/tooling, handling unsupported app types such as mini programs, or completing the temporary INIT.md.
---

# Project Bootstrap

Use this repo-local skill before writing product code in a newly initialized project.

## Workflow

1. Read `PRODUCT.md`, `ROADMAP.md`, `ARCHITECTURE.md`, `AGENTS.md`, and `INIT.md` while it exists.
2. Confirm the first target user, first useful workflow, app type, stack, deployment target, data/auth needs, and validation expectations.
3. Run both web search and current docs lookup for the app type, likely stack, validation, project structure, and available setup skills.
4. Preserve the selected package manager unless current best practice or official tooling makes another choice better.
5. Verify current generator and setup commands against official docs before running them.
6. For unsupported-by-template app types, use platform docs and the smallest stack that can implement the first workflow instead of forcing this baseline into a mismatched framework.
7. Replace open questions in control docs with real project truth.
8. Add or update validation commands in the manifest, `README.md`, and `AGENTS.md`.
9. Delete `INIT.md` after its remaining decisions have moved into durable docs.
10. Run validation and report remaining decisions.

## Guardrails

- Do not add product behavior that is not in `PRODUCT.md` or `INIT.md` while it exists.
- Do not install large frameworks, service SDKs, or deployment tooling without a recorded reason.
- Do not write secrets. Keep only variable names in `.env.example`.
