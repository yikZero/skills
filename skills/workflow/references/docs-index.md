# Workflow SDK Docs Index

Use this as the official-docs navigation map. For exact syntax, fetch the
current public page or the installed versioned docs under
`node_modules/workflow/docs/`.

## Getting Started

Fetch exactly one getting-started guide for the target framework:

| Framework | URL |
| --- | --- |
| TanStack Start | `https://workflow-sdk.dev/docs/getting-started/tanstack-start` |
| Next.js | `https://workflow-sdk.dev/docs/getting-started/next` |
| Vite | `https://workflow-sdk.dev/docs/getting-started/vite` |
| Astro | `https://workflow-sdk.dev/docs/getting-started/astro` |
| Express | `https://workflow-sdk.dev/docs/getting-started/express` |
| Fastify | `https://workflow-sdk.dev/docs/getting-started/fastify` |
| Hono | `https://workflow-sdk.dev/docs/getting-started/hono` |
| Nitro | `https://workflow-sdk.dev/docs/getting-started/nitro` |
| Nuxt | `https://workflow-sdk.dev/docs/getting-started/nuxt` |
| SvelteKit | `https://workflow-sdk.dev/docs/getting-started/sveltekit` |
| Python Beta | `https://workflow-sdk.dev/docs/getting-started/python` |

## Foundations

Use these pages when explaining model, reliability, and runtime behavior:

- Workflows and Steps: core orchestrator and durable step model.
- Starting Workflows: route/server-side start patterns and run handles.
- Errors & Retrying: retryable step errors, `FatalError`, and explicit retry
  behavior.
- Hooks & Webhooks: typed hooks, callback URLs, and external resumption.
- Streaming: workflow streams and `getWritable()`.
- Serialization: what can cross workflow and step boundaries.
- Idempotency: duplicate-safe external effects and event handling.
- Versioning: changing workflow code while runs may still exist.

Read `foundations.md` for a compressed implementation checklist covering these
pages before editing non-trivial workflow code.

## How It Works

Use these pages for architecture and deep debugging:

- Understanding Directives: what `"use workflow"` and `"use step"` mean.
- How the Directives Work: transform/build behavior and common invalid workflow
  function errors.
- Framework Integrations: how Next.js, Vite, Nitro, and other integrations wire
  transforms and generated routes.
- Event Sourcing: workflow history and replay model.
- Encryption: data protection model and deployment considerations.
- Observability: logs, Web UI, CLI inspect, metadata, and run visibility.

## AI Agents

Use these docs when the workflow owns an agent loop:

- Building Durable AI Agents: `DurableAgent` and workflow-owned tool loops.
- Streaming Updates from Tools: progress/tool output events through writable
  streams.
- Resumable Streams: reconnecting to a workflow stream by run context.
- Sleep, Suspense, and Scheduling: workflow-level waits inside agent tools.
- Human-in-the-Loop: approvals and external decisions with hooks/webhooks.
- Patterns for Defining Tools: tool functions that use steps, hooks, or sleep.
- Chat Session Modeling: one run per session, follow-up message hooks, and
  run IDs.

## API Reference: `workflow`

Use the API reference for exact signatures. Common symbols:

- `createHook`: create and await a one-off typed hook in workflow code, often
  with an explicit token for external resumption.
- `defineHook`: define a reusable typed hook, then create instances with tokens
  or metadata inside a workflow.
- `createWebhook`: create a random callback URL and await the incoming
  `Request`.
- `fetch`: Workflow SDK durable fetch for HTTP calls and AI SDK integrations.
- `getStepMetadata`: read step context such as attempt metadata.
- `getWorkflowMetadata`: read workflow run context such as run ID and start
  time.
- `getWritable`: obtain the workflow output stream for UI chunks or progress
  events.
- `sleep`: suspend a workflow until a duration or date without consuming
  runtime resources.

## API Reference: Errors

- `FatalError`: terminal failure that should not be retried.
- `RetryableError`: explicit retryable failure, including custom retry timing
  when supported by the installed version.
