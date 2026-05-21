---
name: chat-sdk
description: >-
  Build, review, debug, and migrate multi-platform bots with Vercel Chat SDK
  (`chat` npm package) and @chat-adapter packages. Use when the user asks about
  Chat SDK, Slack bots, GitHub bots, Teams, Discord, Google Chat, Telegram,
  Linear, WhatsApp, mentions, subscribed threads, direct messages, reactions,
  slash commands, App Home, assistant threads, cards, modals, file uploads,
  webhook routes, state adapters, streaming AI responses, StreamChunk,
  StreamingPlan, custom adapters, or replacing hand-written chat-platform glue
  with SDK-native APIs.
---

# Chat SDK

Use this skill for Vercel Chat SDK bot work and SDK-native reviews.

This means the `chat` npm package and `@chat-adapter/*` packages, not the
separate Vercel AI Chat SDK template/docs. If using Context7, resolve to
`/vercel/chat`.

## Workflow

1. Inspect `package.json` and installed packages. Identify the framework,
   package manager, adapters, and state backend.
2. If `chat` is installed, prefer versioned local sources:
   - `node_modules/chat/docs/`
   - `node_modules/chat/dist/index.d.ts`
   - `node_modules/chat/dist/jsx-runtime.d.ts`
   - installed adapter `dist/index.d.ts` files
   - `node_modules/chat/resources/guides/`
3. If `chat` is missing, load `references/setup.md`, then follow one official
   guide or template matching the platform/framework.
4. For implementation and review, inspect current bot construction, webhook
   routes, event handlers, thread state, streaming code, card/modal code, and
   adapter config before editing.
5. Load `references/core.md` for events, threads, state, streaming, cards,
   files, slash commands, and API-surface checks.
6. Load `references/adapters.md` for platform-specific behavior, especially
   Slack, GitHub, custom adapters, webhook verification, and state adapters.
7. Load `references/project-patterns.md` when the task touches this user's
   Fries, `fries-slack`, `coding-agent`, or `agents` repos, or when comparing
   Chat SDK with Pi SDK and Workflow SDK.
8. Implement with existing local structure and route style. Prefer SDK-native
   entrypoints over custom platform glue unless the installed SDK lacks the
   required capability.
9. Verify with typecheck plus a real webhook/local route smoke test when the
   repo has runnable credentials or mockable event fixtures.

## Current Sources

Use these sources for current public docs and examples:

- `https://chat-sdk.dev/docs`
- `https://chat-sdk.dev/adapters`
- `https://github.com/vercel/chat/tree/main/skills/chat`
- `https://github.com/vercel/chat/tree/main/packages/chat/resources/guides`
- `https://github.com/vercel/chat/blob/main/packages/chat/README.md`

For installed projects, local `node_modules` wins because it matches the
project's package version.

## Core Rules

- Build around `new Chat({ adapters, state, userName })`.
- Wire HTTP routes to `bot.webhooks.<adapterName>` when the adapter provides
  one.
- Use event handlers such as mentions, subscribed messages, direct messages,
  reactions, actions, modals, slash commands, assistant thread events, and App
  Home events instead of manual platform payload branching.
- Store subscriptions, locks, dedupe, and thread state through a state adapter;
  do not create a parallel persistence layer for SDK-owned state.
- Use `thread.post(...)` / SDK streaming APIs for responses. For Slack status
  UX, use `thread.startTyping(...)` or assistant status APIs when supported.
- Use SDK JSX cards and modals before hand-writing Slack Block Kit JSON.
- Keep adapter-specific IDs and raw payloads at the adapter boundary. Bot
  logic should use normalized `Thread`, `Message`, `Channel`, and state APIs.
- For GitHub bots, prefer webhook-first handling with a narrow polling fallback
  only for lifecycle gaps the SDK does not cover.
- For AI bot work, keep Chat SDK as the chat surface. Use Pi SDK or another
  agent loop for tool execution, and Workflow SDK for durable orchestration or
  long-running background jobs.
