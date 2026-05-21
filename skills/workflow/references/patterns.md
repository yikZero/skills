# Workflow SDK Patterns

This reference summarizes patterns from `workflow-sdk.dev` and
`vercel/workflow-examples`. Use it as a navigation map and example source, not
as a substitute for the installed versioned docs in `node_modules/workflow/docs/`.

## Example Map

- `kitchen-sink/`: best first reference for core patterns: steps, control flow,
  streams, AI, hooks, and batching.
- `ai-sdk-workflow-patterns/`: sequential, parallel, routing, orchestrator, and
  evaluator loops with AI SDK calls inside workflows.
- `birthday-card-generator/`: AI generation, RSVP webhooks, progress streaming,
  and sleeping until a future date before final delivery.
- `flight-booking-app/`: multi-turn durable chat agent, hooks for follow-up
  messages and approvals, run IDs, reconnection, and UI streaming.
- `rag-agent/`: DurableAgent with tools that write and query a vector-backed
  knowledge base.
- `ffmpeg-processing/`: long-running media processing with setup, processing,
  streaming output, and cleanup in `finally`.
- `custom-adapter/`: custom transform/plugin setup for runtimes that are not
  covered by a first-party integration.
- Framework folders: prefer `tanstack-start`, `nextjs`, and `vite` examples
  first for this catalog. Other supported examples include `hono`, `nitro`,
  `nuxt`, `astro`, and `sveltekit`.

## Minimal Route And Workflow

Use this shape when adding a first real workflow to an existing app:

```ts
// route handler
import { start } from "workflow/api";
import { handleUserSignup } from "@/workflows/user-signup";

export async function POST(request: Request) {
  const { email } = await request.json();
  const run = await start(handleUserSignup, [email]);

  return Response.json({ runId: run.runId });
}
```

```ts
// workflow
import { FatalError, sleep } from "workflow";

export async function handleUserSignup(email: string) {
  "use workflow";

  const user = await createUser(email);
  await sendWelcomeEmail(user);
  await sleep("5s");
  await sendOnboardingEmail(user);

  return { userId: user.id, status: "onboarded" };
}

async function createUser(email: string) {
  "use step";
  return { id: crypto.randomUUID(), email };
}

async function sendOnboardingEmail(user: { email: string }) {
  "use step";
  if (!user.email.includes("@")) {
    throw new FatalError("Invalid email");
  }
}
```

## Retry And Error Policy

Read `foundations.md` first for complete retry, idempotency, rollback, and
versioning constraints. This section is only the copy-paste pattern layer.

- Default step errors are retryable. Use that for transient network, provider,
  and database failures.
- Use `FatalError` for invalid user input, missing permissions, impossible
  states, or anything where retrying would repeat the same failure.
- Use `RetryableError` when the workflow should retry after a specific delay.
- Use `getStepMetadata()` when logic or logs need the current attempt number.

```ts
import { RetryableError, getStepMetadata } from "workflow";

async function pollProviderJob(jobId: string) {
  "use step";
  const { attempt } = getStepMetadata();
  const job = await getJob(jobId);

  if (job.status !== "done") {
    throw new RetryableError(`Job ${jobId} is not done`, {
      retryAfter: attempt < 3 ? "5s" : "1m",
    });
  }

  return job.result;
}
```

## Control Flow

Use normal TypeScript control flow inside a workflow:

- `Promise.all` for independent work that can run concurrently.
- `Promise.race` for first-success or timeout-like flows.
- `try/finally` for cleanup steps.
- loops for bounded evaluator/optimizer, polling, batching, or multi-turn
  sessions.

Batch boundary choice matters:

- Step per item: one item can retry or fail without repeating the whole batch.
- Step per batch: less overhead, but a failed batch repeats from the beginning.

```ts
export async function processInBatches(ids: string[]) {
  "use workflow";

  for (const batch of chunk(ids, 50)) {
    await Promise.all(batch.map(processOneItem));
  }
}

async function processOneItem(id: string) {
  "use step";
  await syncItem(id);
}
```

## Human-In-The-Loop Hooks

Use hooks when the workflow must pause until a user or external system resumes
it. Common cases: approval, follow-up chat message, webhook callback, async
provider completion.

Use `createHook` for one-off workflow-local hooks:

```ts
import { createHook } from "workflow";

export async function refundWorkflow(refundId: string) {
  "use workflow";

  using approval = createHook<{ approved: boolean }>({
    token: `refund:${refundId}:approval`,
  });

  const { approved } = await approval;
  return { refundId, approved };
}
```

Use `defineHook` when the hook shape is shared across route handlers or modules:

```ts
import { defineHook } from "workflow";
import { z } from "zod";

export const approvalHook = defineHook({
  schema: z.object({
    approved: z.boolean(),
    comment: z.string().optional(),
  }),
});
```

```ts
export async function publishAfterApproval(documentId: string) {
  "use workflow";

  const hook = approvalHook.create({ token: documentId });
  const decision = await hook;

  if (!decision.approved) {
    return { status: "rejected", comment: decision.comment };
  }

  return publishDocument(documentId);
}
```

For ad-hoc callback URLs, use `createWebhook()` and follow the birthday-card
pattern: create one webhook per recipient/callback, send the URL to the external
actor, then `await` all responses.

```ts
import { createWebhook } from "workflow";

export async function waitForProviderCallback(providerJobId: string) {
  "use workflow";

  using webhook = createWebhook();
  await registerCallbackUrl(providerJobId, webhook.url);

  const request = await webhook;
  return request.json();
}
```

## Durable AI Patterns

For AI SDK helper calls inside workflows, the examples use Workflow SDK's durable
`fetch` integration before invoking `generateText` or `generateObject`.

```ts
import { generateObject, generateText } from "ai";
import { fetch } from "workflow";
import { z } from "zod";

export async function reviewCopy(input: string) {
  "use workflow";

  globalThis.fetch = fetch;

  const { text: copy } = await generateText({
    model: "openai/o4-mini",
    prompt: `Write concise marketing copy for: ${input}`,
  });

  const { object: score } = await generateObject({
    model: "openai/o4-mini",
    schema: z.object({
      clarity: z.number().min(1).max(10),
      hasCallToAction: z.boolean(),
    }),
    prompt: `Score this copy: ${copy}`,
  });

  if (score.clarity < 7 || !score.hasCallToAction) {
    const { text: improved } = await generateText({
      model: "openai/o4-mini",
      prompt: `Improve this copy: ${copy}`,
    });
    return { copy: improved, score };
  }

  return { copy, score };
}
```

The example set covers these AI workflow shapes:

- Sequential: generate, evaluate, then conditionally regenerate.
- Parallel: run multiple model reviews concurrently, then summarize.
- Routing: classify a request, choose a model/system prompt, then answer.
- Orchestrator-workers: plan work, fan out specialized worker steps.
- Evaluator loop: generate, score, improve until threshold or max iterations.

## Durable Agents And Streaming

Use `DurableAgent` from `@workflow/ai/agent` when the workflow owns the agent
loop. Use `getWritable()` to stream UI message chunks or progress events back to
the caller.

```ts
import { convertToModelMessages, type UIMessageChunk } from "ai";
import { DurableAgent } from "@workflow/ai/agent";
import { getWritable } from "workflow";

export async function chat(messages: UIMessage[]) {
  "use workflow";

  const writable = getWritable<UIMessageChunk>();
  const agent = new DurableAgent({
    model: "openai/gpt-4o",
    tools,
  });

  await agent.stream({
    messages: await convertToModelMessages(messages),
    writable,
  });
}
```

For multi-turn chat, follow the flight-booking example:

- Start the workflow once and return `run.runId` to the client.
- Keep the workflow loop alive.
- Create a hook token based on the run ID.
- Inject follow-up user messages through that hook.
- Keep or resume the stream from the run ID.

## Long-Running Jobs

For media processing, sandbox work, or multi-step external jobs:

- create resources in a step,
- set up dependencies in a step,
- run the long operation in one or more steps,
- stream output or progress as needed,
- clean up in `finally`.

```ts
export async function processMedia(input: ReadableStream<Uint8Array>) {
  "use workflow";

  const sandboxId = await createSandbox();

  try {
    await setupTools(sandboxId);
    await transcode(input, sandboxId);
    await streamOutput(sandboxId);
  } finally {
    await stopSandbox(sandboxId);
  }
}
```

## Verification

After changes:

1. Start the dev server with the project's package manager.
2. Trigger the route that calls `start(...)`.
3. Confirm logs show workflow and step progress.
4. Inspect runs with `npx workflow web` or `npx workflow inspect runs` when the
   installed CLI supports it.
5. For streaming routes, confirm the response includes the workflow run ID and
   reconnect/follow-up paths still work.
