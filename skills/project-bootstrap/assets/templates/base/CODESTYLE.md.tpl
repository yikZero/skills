# Code Style: {{PROJECT_NAME}}

## Principles

- Prefer small, direct modules over speculative abstractions.
- Keep product/domain decisions close to the code that owns them.
- Use structured parsers or APIs instead of ad hoc string manipulation when available.
- Add comments only when they explain non-obvious intent or constraints.

{{PROFILE_CODESTYLE}}## Formatting

- Run the documented format command after broad file edits.
- Run `{{VALIDATE_COMMAND}}` before handing off.
- Keep generated files and lockfiles intentional.

## Review Standard

- Lead with bugs, regressions, missing validation, and unclear ownership.
- Avoid broad refactors unless they directly reduce risk for the active change.
