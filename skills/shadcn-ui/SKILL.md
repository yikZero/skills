---
name: shadcn-ui
description: "Use when adding, updating, customizing, or reviewing shadcn/ui components. Covers shadcn CLI workflows, registry docs and search, dry-run and diff checks, component composition, forms, icons, styling, base-vs-radix choices, customization, and optional shadcn MCP setup."
argument-hint: "[add|docs|search|review|customize] [component or task]"
user-invocable: true
license: "MIT. Adapted from shadcn-ui/ui shadcn skill. See NOTICE.md."
---

shadcn/ui component workflow for Claude Code and Codex.

This version is portable: it does not use dynamic shell injection. Run CLI commands explicitly when needed.

## Use

Use this skill when the task touches shadcn/ui components, registries, component installation, component customization, forms, Radix-based primitives, icons, or shadcn MCP setup.

Do not use it for unrelated Tailwind styling unless shadcn components or registry code are involved.

## Process

1. Detect project context:
   - Check for `components.json`, `package.json`, lockfiles, and existing `components/ui/*`.
   - Prefer the project's package manager style.
   - If shadcn is installed or relevant, run `npx shadcn@latest info --json` when runtime context matters.
2. Before adding a component, inspect existing local components and conventions.
3. Use the CLI as the source of truth for registry content:
   - Search: `npx shadcn@latest search <query>`.
   - Docs: `npx shadcn@latest docs <component-or-url>`.
   - Preview installation impact: `npx shadcn@latest add <component> --dry-run`.
   - Inspect diffs before applying: `npx shadcn@latest add <component> --diff`.
4. Do not overwrite local component customizations blindly. If a local file differs from registry output, preserve project changes or explain the conflict.
5. After installing or editing components, run the project's focused typecheck, lint, or component tests when available.

## Updating Components

When refreshing an existing shadcn component:

1. Inspect the local file first and note project customizations.
2. Run `npx shadcn@latest add <component> --dry-run` to see affected files.
3. Run `npx shadcn@latest add <component> --diff` or a component-specific diff to compare registry output.
4. Apply only the needed changes. Preserve local API, styling, and behavior unless the user explicitly wants a full registry reset.
5. If a preset or registry command would overwrite customized components, ask before applying it.

## References

Read these only when the task needs them:

- `references/cli.md`: exact CLI commands and registry workflows.
- `references/customization.md`: customization strategy and file ownership.
- `references/mcp.md`: optional shadcn MCP setup.
- `references/rules/forms.md`: form composition and field structure.
- `references/rules/icons.md`: icon usage.
- `references/rules/styling.md`: Tailwind and token styling.
- `references/rules/composition.md`: component composition rules.
- `references/rules/base-vs-radix.md`: choosing Base UI or Radix-oriented primitives.

## Guardrails

- Prefer existing design-system components and tokens over one-off markup.
- Keep generated shadcn files editable and local; do not treat them as an external package boundary.
- Use `--dry-run` or `--diff` before applying registry changes in a mature project.
- If a command would install or overwrite many files, explain the change set before proceeding.
- Never put secrets or private registry credentials in prompts, docs queries, or committed files.

## Output

For reviews, report `file:line` findings and the shadcn rule or CLI check that supports them.

For implementation, summarize installed or edited components, local customizations preserved, and validation run.
