---
name: pi-coding-agent-sdk
description: Build, debug, and verify TypeScript integrations with the Pi Coding Agent SDK. Use when a host app needs embedded coding-agent sessions, runtime session management, custom tools, custom skills, resource loading, prompt queues, streaming events, auth/model/settings/session persistence, SDK-vs-RPC decisions, in-memory test harnesses, API-key/OAuth setup, or fixes for TypeScript mismatches against @earendil-works/pi-coding-agent. Do not use for unrelated translation, CSS/UI, React review, or general OAuth.
---

# Pi Coding Agent SDK

Use this skill to design, debug, or implement host-app integrations with
`@earendil-works/pi-coding-agent`: embedded coding-agent sessions, runtime
session flows, custom tools and skills, resource loading, streaming events, and
SDK type mismatches.

## Working Rule

Do not answer SDK API-shape questions from memory alone. The Pi SDK is moving quickly, and examples can lag behind package types.

When the task involves API syntax, setup, migration, or a package-specific bug:

1. Fetch current docs if needed.
2. Inspect the installed package types if a project or temporary check environment is available.
3. Prefer the installed package type surface over stale examples.
4. Compile any non-trivial TypeScript recipe before presenting it as working code.

## Source Of Truth

Use these sources in order:

1. Installed package types:
   - `node_modules/@earendil-works/pi-coding-agent/dist/index.d.ts`
   - `dist/core/sdk.d.ts`
   - `dist/core/agent-session.d.ts`
   - `dist/core/agent-session-runtime.d.ts`
   - `dist/core/resource-loader.d.ts`
   - `dist/core/skills.d.ts`
   - `dist/core/extensions/types.d.ts`
2. Pi repo docs and examples:
   - `packages/coding-agent/docs/sdk.md`
   - `packages/coding-agent/examples/sdk/`
   - `https://raw.githubusercontent.com/earendil-works/pi/refs/heads/main/packages/coding-agent/docs/sdk.md`
   - `https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/sdk`
3. This skill's reference files:
   - `references/sdk-development-guide.md` for design decisions and API map.
   - `references/verified-recipes.md` for copyable TypeScript recipes.
   - `references/version-notes.md` for verified package facts and known doc mismatches.
   - `references/evidence-index.md` for the docs, source files, examples, and commands used to verify the guidance.

## Which Reference To Read

Read `references/sdk-development-guide.md` for most SDK development tasks. It covers session creation, runtime sessions, resource loading, skills, prompt templates, tools, extensions, auth, models, settings, events, and persistence.

Read `references/verified-recipes.md` when the user wants code. Prefer these recipes as starting points because their fragile API shapes were refreshed against `@earendil-works/pi-coding-agent@0.75.4`; still re-check against the user's installed package before presenting code as final.

Read `references/version-notes.md` when examples or docs disagree with local TypeScript types, especially around `tools`, built-in tool exports, `Skill`, `PromptTemplate`, `DefaultResourceLoader`, or cleanup methods.

Read `references/evidence-index.md` when the user asks whether the guidance is verified, current, or source-backed.

## Interface Choice

Use `createAgentSession()` when the host app needs one active coding-agent session and will manage prompts/events directly.

Use `createAgentSessionRuntime()` and `AgentSessionRuntime` when the host app needs new session, resume, fork, import, switch-session, or cwd replacement flows.

Use SDK service primitives (`createAgentSessionServices()` and `createAgentSessionFromServices()`) when the app needs to recreate cwd-bound services before constructing a session.

Use CLI/RPC mode instead of the SDK when the caller is not Node/TypeScript, wants process isolation, or wants a language-neutral protocol boundary.

## Implementation Defaults

For examples, tests, and small host integrations:

- Use `SessionManager.inMemory()` until persistence is explicitly needed.
- Use `SettingsManager.inMemory()` for deterministic tests.
- Use `AuthStorage.inMemory()` or runtime API key overrides for examples.
- Never hardcode API keys.
- Subscribe to session events before `prompt()` if output needs to stream.
- Unsubscribe and call `session.dispose()` when done.
- Call `await runtime.dispose()` when using `AgentSessionRuntime`.
- Use `tools: ["read", "grep", "find", "ls"]` for read-only flows.
- Use `customTools` plus a `tools` allowlist that includes the custom tool name when an allowlist is present.

## Version-Sensitive Pitfalls

Check local types before relying on snippets from docs:

- `@earendil-works/pi-coding-agent@0.75.x` requires Node.js `>=22.19.0`.
- `CreateAgentSessionOptions.tools` can be `string[]`; use tool names such as `"read"` and `"bash"` rather than undocumented constants.
- Current packages may export `createReadTool()` and `createBashTool()` rather than `readTool` and `bashTool`.
- `Skill` can require `sourceInfo` and `disableModelInvocation`, not `source: "custom"`.
- `PromptTemplate` can require `sourceInfo` and `filePath`.
- `DefaultResourceLoader` can require explicit `cwd` and `agentDir`.
- `AgentSession` cleanup is `dispose()`. Runtime cleanup is `await runtime.dispose()`.
- `agent_end` session events include `willRetry`.
- `resizeImage`, `formatDimensionNote`, and `ResizedImage` are exported from the package root in current packages.

## Answer Shape

For SDK questions, answer in this order:

1. Recommended interface: direct SDK, runtime SDK, services, extension, or RPC.
2. Minimal code or patch.
3. Resource/session/auth/model/settings choices.
4. Event and cleanup behavior.
5. Version/type checks if the answer depends on current package shape.

Keep code examples compile-oriented. If a snippet is unverified, say so and point to what should be checked.
