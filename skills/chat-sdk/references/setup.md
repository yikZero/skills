# Chat SDK Setup

Use this when `chat` is not installed or the user asks to set up a bot.

## Package Selection

Core package:

```bash
npm install chat
```

Install the adapter and state backend used by the app. Common packages include:

- `@chat-adapter/slack`
- `@chat-adapter/github`
- `@chat-adapter/discord`
- `@chat-adapter/teams`
- `@chat-adapter/google-chat`
- `@chat-adapter/telegram`
- `@chat-adapter/linear`
- `@chat-adapter/state-redis`
- `@chat-adapter/state-postgres`

Check `https://chat-sdk.dev/adapters` or installed package metadata before
assuming an exact package name.

## Minimal Shape

```ts
import { Chat } from "chat";
import { createSlackAdapter } from "@chat-adapter/slack";
import { createRedisState } from "@chat-adapter/state-redis";

export const bot = new Chat({
  userName: "mybot",
  adapters: {
    slack: createSlackAdapter(),
  },
  state: createRedisState(),
});

bot.onNewMention(async (thread) => {
  await thread.subscribe();
  await thread.post("Hello. I am listening to this thread.");
});
```

Webhook routes should delegate to the adapter webhook handler, for example:

```ts
export const POST = bot.webhooks.slack;
```

Use the route style already present in the app: Next.js Route Handler, Hono,
Nitro, Express, or another framework.

## Official Guides

Choose one matching guide, not every guide:

- Slack + Next.js + Redis:
  `packages/chat/resources/guides/how-to-build-a-slack-bot-with-next-js-and-redis.md`
- Slack AI agent + AI SDK:
  `packages/chat/resources/guides/how-to-build-an-ai-agent-for-slack-with-chat-sdk-and-ai-sdk.md`
- Slack deploy bot + Workflow:
  `packages/chat/resources/guides/run-and-track-deploys-from-slack.md`
- Hono form triage:
  `packages/chat/resources/guides/triage-form-submissions-with-chat-sdk.md`
- GitHub code review bot + Hono + Redis:
  `packages/chat/resources/guides/ship-a-github-code-review-bot-with-hono-and-redis.md`
- Discord support bot + Nuxt + Redis:
  `packages/chat/resources/guides/create-a-discord-support-bot-with-nuxt-and-redis.md`

If the guide is bundled under `node_modules/chat/resources/guides/`, use that
version. Otherwise fetch the current GitHub source.

## Setup Checks

- Confirm environment variable names expected by the adapter.
- Confirm webhook route paths match the platform app configuration.
- Confirm the state adapter works in the target runtime.
- Confirm concurrency, dedupe TTL, and streaming cadence are explicit when
  production behavior depends on them.
- Confirm the app can receive a real platform webhook or a checked-in fixture.
