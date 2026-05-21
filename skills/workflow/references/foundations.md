# Workflow SDK Foundations

Use this for correctness rules when writing or reviewing Workflow SDK code.
Fetch the official docs or installed `node_modules/workflow/docs/` for exact
current signatures.

## Workflow And Step Functions

Workflow functions:

- Start with `"use workflow"`.
- Orchestrate steps with conditionals, loops, `try/catch`, `Promise.all`, and
  other deterministic language primitives.
- Run in a sandboxed workflow context without full Node.js access.
- Persist step results to the event log and replay from that log after
  suspension or failure.
- Must remain deterministic. Workflow SDK stabilizes values such as
  `Math.random()` and `Date` constructors across replays, but external IO still
  belongs in steps.

Step functions:

- Start with `"use step"`.
- Do the actual work: database calls, external APIs, payments, email, files,
  model/tool calls, and other full-runtime work.
- Have full Node.js/npm access.
- Retry thrown errors by default.
- Persist results for workflow replay.

Calling a step outside a workflow, or from another step, runs it like a normal
function. In that mode it has no workflow retry semantics, no workflow
observability, and workflow-only APIs such as `getStepMetadata()` can throw.

## Suspension And Resumption

Workflows suspend without consuming compute while waiting on:

- a step function,
- `sleep(...)`,
- a hook or webhook,
- stream or run state managed by the active World.

Enable Fluid compute before Vercel production deployments when the official
guide recommends it. Without Fluid compute, each resume can incur a separate
function cold start.

## Starting Workflows

Use `start` from `workflow/api` in API routes, server actions, or server-side
code:

```ts
import { start } from "workflow/api";
import { processOrder } from "@/workflows/order";

export async function POST(request: Request) {
  const { orderId } = await request.json();
  const run = await start(processOrder, [orderId]);

  return Response.json({
    message: "Workflow started",
    runId: run.runId,
  });
}
```

`start()` returns after enqueuing; it does not wait for completion unless the
caller awaits run properties.

Important run properties:

- `runId`: stable run identifier.
- `status`: async status such as running, completed, or failed.
- `returnValue`: async workflow return value; awaiting it can block until the
  workflow completes.
- `readable` or `getReadable(...)`: workflow output stream.

Common route patterns:

- Fire and forget: return `runId` immediately.
- Wait for completion: await `run.returnValue` only for short workflows.
- Stream updates: return `run.readable` or `run.getReadable(...)`.
- Check later: use `getRun(runId)` from `workflow/api`.

## Errors And Retrying

Default step retries:

- Ordinary thrown errors in steps are retryable.
- The default is `maxRetries = 3`, meaning up to 4 total attempts.
- Set `stepFn.maxRetries = 0` to run once without retry.
- Set a larger `maxRetries` for transient providers when that is safe.

Use `FatalError` for intentional terminal errors that should not retry:

```ts
import { FatalError } from "workflow";

async function validateEmail(email: string) {
  "use step";
  if (!email.includes("@")) {
    throw new FatalError("Invalid email");
  }
}
```

Use `RetryableError` for explicit retry timing:

```ts
import { RetryableError, getStepMetadata } from "workflow";

async function callApi(endpoint: string) {
  "use step";

  const { attempt } = getStepMetadata();
  const response = await fetch(endpoint);

  if (response.status === 429) {
    throw new RetryableError("Rate limited", {
      retryAfter: attempt < 3 ? "5s" : "1m",
    });
  }

  return response.json();
}

callApi.maxRetries = 5;
```

For saga-style workflows, record compensating rollback steps only after the
forward step succeeds. Run rollbacks in reverse order, and make rollback steps
idempotent because they can retry.

## Idempotency

Any step that performs non-idempotent external side effects must use an
idempotency key where the provider supports one. Prefer `stepId` from
`getStepMetadata()` because it is stable across retries and unique per step.

```ts
import { getStepMetadata } from "workflow";

async function chargeUser(userId: string, amount: number) {
  "use step";

  const { stepId } = getStepMetadata();

  await stripe.charges.create(
    { amount, currency: "usd", customer: userId },
    { idempotencyKey: stepId },
  );
}
```

Do not include timestamps or retry attempt counters in idempotency keys.

## Hooks And Webhooks

Use hooks when the workflow waits for typed serializable data from your own
route, server action, or integration handler.

```ts
import { createHook } from "workflow";

export async function approvalWorkflow(documentId: string) {
  "use workflow";

  using hook = createHook<{ approved: boolean; comment?: string }>({
    token: `approval:${documentId}`,
  });

  const approval = await hook;
  return approval;
}
```

Resume hooks from runtime code with `resumeHook`:

```ts
import { resumeHook } from "workflow/api";

export async function POST(request: Request) {
  const { token, approved, comment } = await request.json();
  await resumeHook(token, { approved, comment });
  return Response.json({ ok: true });
}
```

Hook rules:

- Use deterministic, namespaced custom tokens when an external system must
  reconstruct the token.
- Hooks accept serializable payloads.
- Hooks can be reused as `AsyncIterable` with `for await...of` for multiple
  events.
- Use `using` or explicit disposal to release hook tokens early.
- Use `defineHook()` with a schema when workflow and route code live in
  separate modules and need type/runtime validation.

Use webhooks when receiving direct HTTP requests from external services and you
want an automatic URL:

```ts
import { createWebhook } from "workflow";

export async function webhookWorkflow() {
  "use workflow";

  using webhook = createWebhook();
  const request = await webhook;
  const body = await request.json();

  return body;
}
```

Webhook rules:

- `createWebhook()` exposes a public `webhook.url` under the generated workflow
  route; the token in that URL is the built-in authorization.
- For stronger authorization, prefer your own route plus `resumeHook()`.
- Webhooks always use random tokens.
- Use static `respondWith` for simple acknowledgments.
- Use `respondWith: "manual"` for dynamic responses; call
  `request.respondWith(...)` from inside a step.
- Webhooks also support `for await...of` for multiple HTTP events.

## Streaming

Use `getWritable()` to emit progress, logs, UI message chunks, or generated
content from a workflow run. Return `run.readable` or `run.getReadable(...)` to
the client.

Stream operations must happen in step functions. It is fine for a workflow to
obtain or pass stream handles, but reading from or writing to streams directly in
workflow context breaks determinism.

```ts
import { getWritable } from "workflow";

async function writeProgress(message: string) {
  "use step";

  const writable = getWritable<string>();
  const writer = writable.getWriter();
  try {
    await writer.write(message);
  } finally {
    writer.releaseLock();
  }
}

export async function progressWorkflow() {
  "use workflow";
  await writeProgress("started");
  await writeProgress("done");
}
```

Streaming rules:

- Release writer locks in `finally`.
- Close streams explicitly when early completion matters.
- Use typed streams for safer UI/progress protocols.
- Use `run.getReadable({ startIndex })` to resume from a known chunk index.
- Negative `startIndex` reads relative to the current end.
- Use namespaces with `getWritable({ namespace })` and
  `run.getReadable({ namespace })` for separate logs, metrics, or data streams.
- Streams can be passed between workflows and steps and between steps.
- If a step returns a stream, the step is considered successful once it returns;
  later stream errors do not retry the producer. Handle stream errors in the
  consumer and fail intentionally if needed.

## Serialization

Workflow and step arguments and return values must be serializable. Keep
boundaries data-oriented.

Important supported types include JSON values plus common Web/API types such as
`Date`, `Map`, `Set`, `URL`, typed arrays, `Request`, `Response`,
`ReadableStream`, and `WritableStream`.

Pass-by-value semantics:

- Objects and arrays are copied across workflow/step boundaries.
- Mutating an object in a step does not mutate the workflow's local variable.
- Return modified data from the step and reassign it in the workflow.

```ts
export async function updateUserWorkflow(userId: string) {
  "use workflow";

  let user = { id: userId, email: "old@example.com" };
  user = await updateUserStep(user);

  return user;
}

async function updateUserStep(user: { id: string; email: string }) {
  "use step";
  return { ...user, email: "new@example.com" };
}
```

Use `fetch` from `workflow` when an HTTP request belongs in workflow code; it is
implemented as a step wrapper around `globalThis.fetch`, so response consumption
can be cached for replay.

For custom classes, consult the official serialization docs. Classes need
`WORKFLOW_SERIALIZE` and `WORKFLOW_DESERIALIZE` static methods from
`@workflow/serde`, and any method that performs IO should be marked
`"use step"`.

## Versioning

Workflow runs are pinned to the deployment that starts them. New deployments do
not change the code for already-running workflows by default.

Use this model when changing long-running workflows:

- Keep workflow inputs, step names, serialized state, and return shapes backward
  compatible where possible.
- For broken in-flight runs, deploy the fix, inspect affected runs, cancel old
  runs, and rerun them on the latest deployment when the World supports it.
- On Vercel, `start(workflowFn, args, { deploymentId: "latest" })` can opt into
  latest-deployment execution for a new run.
- For very long-lived loops, model continuation explicitly: current run finishes
  a bounded unit, starts the next run on the latest deployment from a step, and
  passes serializable state forward.
- Streams can be passed forward as serializable handles when continuation runs
  should keep writing to the same client stream.
