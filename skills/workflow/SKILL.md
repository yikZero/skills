---
name: workflow
description: >-
  Install, configure, build, debug, and deploy apps with the Workflow SDK
  workflow package and Python beta docs. Use when the user asks to install
  workflow, set up durable workflows, configure Workflow SDK, write workflows
  or steps, use createHook, createWebhook, defineHook, fetch, getWritable,
  metadata APIs, durable AI agents, streaming, retries, batching, sleep,
  webhooks, start route handlers, Worlds, self-hosting, Postgres world,
  cookbook patterns, or examples from workflow-sdk.dev and
  vercel/workflow-examples.
---

# Workflow SDK

Use this skill for Workflow SDK setup and ongoing development.

Primary target frameworks for this catalog are TanStack Start, Next.js, and
Vite. When the user does not name a framework and detection is ambiguous, steer
setup and examples toward those three before considering other supported
frameworks.

## Workflow

1. Read `package.json`, `pyproject.toml`, or equivalent project metadata and
   detect the app framework and package manager.
2. If `workflow` is missing, load `references/setup.md`, prefer TanStack Start,
   Next.js, or Vite when appropriate, fetch exactly one getting-started guide
   for the detected framework, and follow it.
3. If `workflow` is installed, prefer versioned local docs from
   `node_modules/workflow/docs/` when present.
4. Inspect existing route handlers, workflows, hooks, framework config, and
   deployment/runtime config before editing.
5. Load `references/docs-index.md` when the user asks about official docs
   sections, Foundations, How it works, API symbols, directives, serialization,
   idempotency, versioning, observability, or AI Agents docs.
6. Load `references/foundations.md` before implementing non-trivial workflow
   control flow, retries, hooks/webhooks, streaming, serialization-sensitive
   code, idempotent side effects, or long-running versioned runs.
7. Load `references/patterns.md` when the user asks for examples, cookbook
   guidance, AI agents, hooks, retries, streaming, batching, or design advice.
8. Load `references/worlds.md` when the user asks about Worlds, local runtime,
   self-hosting, queues, persistence, Postgres, graphile-worker, or non-Vercel
   deployment.
9. Implement with the project's existing file layout. Keep workflow functions,
   route handlers, hooks, and UI streaming code in the local style.
10. Verify by starting the dev server, triggering the route that calls
   `start(...)`, and inspecting logs or runs with `npx workflow web` or
   `npx workflow inspect runs` when available.

## Current Docs

For current public docs, use:

- `https://workflow-sdk.dev/docs/foundations/workflows-and-steps`
- `https://workflow-sdk.dev/docs/api-reference/workflow`
- `https://workflow-sdk.dev/docs/ai`
- `https://workflow-sdk.dev/cookbook`
- `https://workflow-sdk.dev/docs/deploying/world/postgres-world`
- `https://github.com/vercel/workflow-examples`

Still prefer `node_modules/workflow/docs/` for installed projects because it is
versioned to the package in the user's app.

## Core Rules

- Put `"use workflow"` at the top of exported workflow functions.
- Put `"use step"` at the top of durable step functions that perform IO,
  side effects, tool calls, API calls, or retryable work.
- Start workflows from framework routes with `start` from `workflow/api`.
- Use `sleep(...)`, hooks, and webhooks from workflow-level code. Workflow code
  may obtain or pass stream handles, but stream reads/writes belong in steps.
- Treat ordinary thrown errors in steps as retryable; use `FatalError` for
  validation or terminal failures that should not retry.
- Use `RetryableError` when the retry delay or retry metadata should be
  explicit.
- Use `Promise.all` for independent step work, and choose batch boundaries
  based on desired retry granularity.
- Keep workflow inputs, step inputs, and returned values serializable. Do not
  pass clients, connections, file handles, or functions across workflow/step
  boundaries.
- Make side-effecting steps idempotent where possible, or key external writes
  by workflow/run metadata.
- For AI SDK calls inside workflows, use Workflow SDK's durable fetch pattern
  from the installed docs or examples before calling AI SDK helpers.
- For production on Vercel, check Fluid compute guidance before deployment.
- For self-hosting, choose a World explicitly; use Local only for development
  and Postgres world for production self-hosting unless the project has a
  stronger local convention.
