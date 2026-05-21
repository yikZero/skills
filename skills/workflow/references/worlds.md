# Workflow SDK Worlds

Worlds make Workflow SDK runtime, queues, and persistence swappable so workflows
can run locally, on Vercel, or in self-hosted infrastructure.

## When To Use Each World

- Local world: zero-config development and sidecar-style local testing. It is
  bundled with Workflow SDK and should not be treated as production durable
  storage.
- Vercel world: default production path when deploying Workflow SDK apps on
  Vercel. Check Fluid compute guidance before production deployment.
- Postgres world: production self-hosted world using PostgreSQL for durable
  storage and graphile-worker for job processing.
- Embedded or custom world: advanced runtime/adapter work when the app needs to
  run workflows inside a non-standard host.

## Postgres World

Use `@workflow/world-postgres` when the user wants self-hosting, direct control
over data, or non-Vercel production infrastructure.

The common environment entry is:

```bash
export WORKFLOW_POSTGRES_URL="postgres://user:password@host:5432/database"
```

Inspect runs through the Postgres backend:

```bash
npx workflow inspect runs --backend @workflow/world-postgres
```

Open the Web UI against Postgres:

```bash
npx workflow web --backend @workflow/world-postgres
```

When configuring programmatically, use `createWorld` from
`@workflow/world-postgres` and keep connection strings in environment variables:

```ts
import { createWorld } from "@workflow/world-postgres";

const world = createWorld({
  connectionString: process.env.WORKFLOW_POSTGRES_URL,
  jobPrefix: "myapp_",
  queueConcurrency: 50,
});
```

For Next.js self-hosting, the docs show starting the world from
`instrumentation.ts` so the worker runs on server start:

```ts
export async function register() {
  if (process.env.NEXT_RUNTIME !== "edge") {
    const { getWorld } = await import("workflow/runtime");
    const world = await getWorld();
    await world.start?.();
  }
}
```

## Design Checks

Before choosing or changing a World, confirm:

- where workflow run state must live,
- who owns Postgres migrations and backups,
- queue concurrency and pool-size needs,
- whether workers run in the same process as the web app or as sidecars,
- what observability path the team will use: Web UI, CLI inspect, logs, or app
  telemetry,
- whether secrets and connection strings are already managed by the deployment
  platform.
