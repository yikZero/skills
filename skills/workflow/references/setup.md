# Workflow SDK Setup

Use this when `workflow` is not installed yet, when the user asks to add
Workflow SDK to a framework project, or when the user asks for Python beta setup.

This catalog primarily targets TanStack Start, Next.js, and Vite projects. If
framework detection is ambiguous, ask the user to choose among those first.

## Framework Detection

If the user named a framework, use it directly. Otherwise inspect
`package.json`, Python project files, and config files. Use the first clear
match:

1. TanStack Start: `@tanstack/react-start` dependency or generated TanStack
   Start route tree/config
2. Next.js: `next` dependency or `next.config.*`
3. Vite: `vite` dependency, only if no full-stack framework above matched
4. Nuxt: `nuxt` dependency or `nuxt.config.*`
5. SvelteKit: `@sveltejs/kit` dependency or `svelte.config.*`
6. Astro: `astro` dependency or `astro.config.*`
7. NestJS: `@nestjs/core` dependency or `nest-cli.json`
8. Nitro: `nitro` dependency or `nitro.config.*`
9. Express: `express` dependency
10. Fastify: `fastify` dependency
11. Hono: `hono` dependency
12. Python Beta: `pyproject.toml`, `requirements.txt`, or a Python app entry
    point, only when no JavaScript framework matched or the user asked for
    Python.

If there is no clear match, ask the user which target should receive Workflow
SDK setup.

## Guide URLs

Fetch exactly one guide for the selected framework and follow it step by step.
Do not mix setup snippets from multiple framework guides.

| Framework | URL |
| --- | --- |
| TanStack Start | `https://workflow-sdk.dev/docs/getting-started/tanstack-start` |
| Next.js | `https://workflow-sdk.dev/docs/getting-started/next` |
| Vite | `https://workflow-sdk.dev/docs/getting-started/vite` |
| Express | `https://workflow-sdk.dev/docs/getting-started/express` |
| Hono | `https://workflow-sdk.dev/docs/getting-started/hono` |
| Fastify | `https://workflow-sdk.dev/docs/getting-started/fastify` |
| NestJS | `https://workflow-sdk.dev/docs/getting-started/nestjs` |
| Nitro | `https://workflow-sdk.dev/docs/getting-started/nitro` |
| Nuxt | `https://workflow-sdk.dev/docs/getting-started/nuxt` |
| Astro | `https://workflow-sdk.dev/docs/getting-started/astro` |
| SvelteKit | `https://workflow-sdk.dev/docs/getting-started/sveltekit` |
| Python Beta | `https://workflow-sdk.dev/docs/getting-started/python` |

Each guide covers the install command, framework config, first workflow, route
handler, dev command, curl verification, and run inspection.

## Setup Shape

For JavaScript and TypeScript apps, install the package with the project's
package manager:

```bash
npm i workflow
```

For Python Beta, fetch the Python guide and follow it exactly; do not translate
the TypeScript examples into Python from memory.

For Next.js, wrap the config:

```ts
import { withWorkflow } from "workflow/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // existing config
};

export default withWorkflow(nextConfig);
```

For TanStack Start, Vite, and other Vite-based integrations, fetch the selected
guide and follow its plugin order. TanStack Start's guide currently puts
`workflow()` first so the `"use workflow"` and `"use step"` transforms run
before other plugins process those files:

```ts
import { defineConfig } from "vite";
import { workflow } from "workflow/vite";

export default defineConfig({
  plugins: [
    workflow(),
    // existing tanstackStart(), nitro(), or other plugins
  ],
});
```

Create the first workflow in the framework's normal source location:

```ts
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

async function sendWelcomeEmail(user: { id: string; email: string }) {
  "use step";
  console.log(`Sending welcome email to ${user.id}`);
}

async function sendOnboardingEmail(user: { email: string }) {
  "use step";
  if (!user.email.includes("@")) {
    throw new FatalError("Invalid email");
  }
}
```

Start it from a route or server-side handler with `start`:

```ts
import { start } from "workflow/api";
import { handleUserSignup } from "@/workflows/user-signup";

export async function POST(request: Request) {
  const { email } = await request.json();
  const run = await start(handleUserSignup, [email]);

  return Response.json({
    message: "User signup workflow started",
    runId: run.runId,
  });
}
```

For TanStack Start, use the router server handler shape from its guide:

```ts
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { start } from "workflow/api";
import { handleUserSignup } from "../../workflows/user-signup";

export const Route = createFileRoute("/api/signup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { email } = await request.json();
        await start(handleUserSignup, [email]);
        return json({ message: "User signup workflow started" });
      },
    },
  },
});
```

## Verify

Start the dev server:

```bash
npm run dev
```

Trigger the example endpoint:

```bash
curl -X POST --json '{"email":"hello@example.com"}' http://localhost:3000/api/signup
```

Then check server logs and inspect runs:

```bash
npx workflow web
npx workflow inspect runs
```

## Common Setup Issues

- `start` received an invalid workflow function: confirm the function has
  `"use workflow"` and the framework transform is configured.
- Next.js setup: confirm `next.config.ts` is wrapped with `withWorkflow(...)`.
- TanStack Start setup: confirm `workflow()` is first in the plugin list.
- Vite setup: confirm `workflow/vite` is configured and ordered according to
  the selected Vite guide.
- Turborepo with Next.js: include generated `.well-known/workflow` routes in
  build cache outputs when the guide requires it.
