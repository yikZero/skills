# Version Notes And Mismatches

These notes capture verification passes used to keep this skill practical for SDK development.

## Verified Package Snapshot

Latest checked package snapshot, refreshed on 2026-05-21:

```text
@earendil-works/pi-coding-agent@0.75.4
@earendil-works/pi-ai@0.75.4
typebox@1.1.38
typescript@6.0.3
```

Package metadata showed:

```text
version = 0.75.4
engines.node = >=22.19.0
exports["."].types = ./dist/index.d.ts
exports["."].import = ./dist/index.js
exports["./hooks"].types = ./dist/core/hooks/index.d.ts
```

Validation used a temporary ESM TypeScript project with `module` and `moduleResolution` set to `NodeNext`.

The refresh host had Node `22.14.0`, below the `0.75.x` engine requirement. Type-surface checks passed, but full runtime smoke was not re-run on this host.

## Commands Used

```bash
npm view @earendil-works/pi-coding-agent version dist-tags exports types main module
npm install @earendil-works/pi-coding-agent@latest @earendil-works/pi-ai@latest typescript@latest typebox@latest @types/node@latest
npx tsc --noEmit
```

Earlier `0.74.0` validation also ran the runtime scripts far enough to create and dispose sessions without sending LLM prompts.

## Current Type Facts

From installed `.d.ts` files:

- `CreateAgentSessionOptions.tools?: string[]`
- `CreateAgentSessionOptions.customTools?: ToolDefinition[]`
- `CreateAgentSessionOptions.noTools?: "all" | "builtin"`
- `DefaultResourceLoaderOptions` requires `cwd` and `agentDir`.
- `Skill` has `name`, `description`, `filePath`, `baseDir`, `sourceInfo`, and `disableModelInvocation`.
- `PromptTemplate` has `name`, `description`, optional `argumentHint`, `content`, `sourceInfo`, and `filePath`.
- `AgentSession.subscribe()` returns an unsubscribe function.
- `AgentSession.dispose()` is the plain session cleanup method.
- `AgentSessionRuntime.dispose()` is async.
- `AgentSessionRuntime` replacement methods emit session shutdown/start events around replacement and then apply the new session/services.
- `AgentSessionEvent`'s `agent_end` variant includes `willRetry`.
- `AuthStorage` supports `create()`, `inMemory()`, `setRuntimeApiKey()`, `setFallbackResolver()`, `login()`, `logout()`, and `getApiKey()`.
- `ModelRegistry` supports `create()`, `inMemory()`, `getAll()`, `getAvailable()`, `find()`, `registerProvider()`, and provider auth helpers.
- Tool factories such as `createReadTool()`, `createBashTool()`, `createCodingTools()`, and `createReadOnlyTools()` are exported.
- `SettingsManager` loads and merges global and project settings, queues persistence writes, exposes `flush()`, and exposes `drainErrors()` for app-level reporting.
- `SettingsManager` includes image handling methods such as `getImageAutoResize()`, `setImageAutoResize()`, `getBlockImages()`, and `setBlockImages()`.
- `loadProjectContextFiles()` looks for `AGENTS.md`, `AGENTS.MD`, `CLAUDE.md`, and `CLAUDE.MD`.
- The package root exports `resizeImage`, `formatDimensionNote`, and `type ResizedImage`.

## Known Doc Or Example Mismatches

Some docs or generated documentation snippets may show:

```typescript
tools: [readTool, bashTool]
```

Current installed types prefer:

```typescript
tools: ["read", "bash"]
```

Some snippets may show:

```typescript
const customSkill = {
  name: "my-skill",
  description: "Custom instructions",
  filePath: "/path/to/SKILL.md",
  baseDir: "/path/to",
  source: "custom",
};
```

Current installed `Skill` type can require:

```typescript
const customSkill = {
  name: "my-skill",
  description: "Custom instructions",
  filePath: "/path/to/SKILL.md",
  baseDir: "/path/to",
  sourceInfo: createSyntheticSourceInfo("/path/to/SKILL.md", {
    source: "sdk",
    scope: "temporary",
    origin: "top-level",
    baseDir: "/path/to",
  }),
  disableModelInvocation: false,
};
```

Some snippets may imply `DefaultResourceLoader` can be created without options. Current installed types require at least:

```typescript
new DefaultResourceLoader({
  cwd: process.cwd(),
  agentDir: getAgentDir(),
});
```

Some generated docs may mention `session.shutdown()`. Current `AgentSession` exposes `dispose()`. `shutdown()` exists in extension contexts, not as the plain public cleanup method in the checked package.

Some snippets may use `AuthStorage.setApiKey()`. Current checked types use `setRuntimeApiKey()` for non-persisted runtime overrides or `set(provider, { type: "api_key", key })` for stored credentials.

Some snippets or older examples may construct image content with a nested `source` object. Current `ImageContent` from `@earendil-works/pi-ai` uses:

```typescript
{
  type: "image",
  data: "...",
  mimeType: "image/png",
}
```

## How To Handle Drift

When the user's local package disagrees with this skill:

1. Trust the user's installed `.d.ts` files first.
2. Update code to local types.
3. Mention the version difference explicitly.
4. Prefer a small compile-checked recipe over a broad answer.
5. Avoid copying examples from docs without reconciling them against installed types.
