# Pi Coding Agent SDK

Build embedded coding-agent sessions, tools, skills, resources, and events in
TypeScript host apps.

This skill is for product teams embedding the Pi coding agent inside their own
application instead of only driving it through a standalone CLI. It keeps the
integration grounded in current package types, because the SDK surface moves
quickly and examples can lag behind.

## Install

```bash
npx yskill --skill pi-coding-agent-sdk
```

Add agent flags only when you want an explicit target, for example
`-a codex` or `-a claude-code`. Add `-y` only for non-interactive installs.

## Use It For

- Embedding coding-agent sessions in a TypeScript app.
- Choosing between direct SDK, runtime SDK, services, extension, or RPC mode.
- Building custom tools, custom skills, virtual prompt templates, resource
  loading, streaming events, prompt queues, and in-memory test harnesses.
- Handling auth, model settings, session persistence, cleanup, and TypeScript
  API mismatches against `@earendil-works/pi-coding-agent`.

## What It Covers

- Session creation and runtime session replacement flows.
- Read-only and tool-enabled agent runs.
- Custom tool allowlists.
- SDK-injected skills and filtered skill loading.
- Resource loaders, prompt templates, context files, and extensions.
- API-key/OAuth storage, settings managers, session managers, and event handling.
- Compile-oriented recipes that should be rechecked against the installed
  package version before shipping.

## Example Prompt

```text
Use Pi Coding Agent SDK to add an embedded coding-agent session to this TypeScript app.
Inspect the installed package types, choose the right interface, wire streaming events,
and leave a minimal compile-checked example with cleanup.
```

## Not For

- General TypeScript cleanup unrelated to the Pi SDK.
- CSS/UI work, translation, or broad React review.
- Guessing SDK API syntax from memory without checking docs or local package types.

## Skill Entry

- [SKILL.md](./SKILL.md)

## References

- [SDK development guide](./references/sdk-development-guide.md)
- [Verified recipes](./references/verified-recipes.md)
- [Version notes and mismatches](./references/version-notes.md)
- [Evidence index](./references/evidence-index.md)
