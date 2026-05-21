# Chat SDK Adapters

Use this when a task depends on a specific platform or state backend.

## Adapter Inventory

Chat SDK targets multiple platforms through `@chat-adapter/*` packages,
including Slack, Microsoft Teams, Google Chat, Discord, Telegram, GitHub,
Linear, and WhatsApp. Check the current list at:

`https://chat-sdk.dev/adapters`

For exact factory names and configuration, inspect the installed adapter:

```text
node_modules/@chat-adapter/<name>/dist/index.d.ts
```

## Slack

Review these surfaces before writing Slack-specific code:

- `@chat-adapter/slack` factory/config types
- `bot.webhooks.slack`
- mention and subscribed-thread handlers
- direct messages
- reactions
- slash commands
- App Home
- Slack assistant thread events
- `thread.startTyping(...)` and assistant status support
- cards/actions/modals via Chat SDK JSX
- file upload support

Prefer Chat SDK cards and assistant/status APIs over hand-written Block Kit and
raw Web API calls unless the SDK lacks the needed capability.

## GitHub

Use the GitHub adapter for webhook-first bot behavior:

- wire `bot.webhooks.github(...)` into the framework route
- route comments/mentions through SDK handlers
- use SDK thread/message APIs for replies
- inspect `fetchMessages()` and `listThreads()` only when a feature needs
  historical context

Polling is a fallback for lifecycle or behind-base maintenance gaps, not the
default control plane when webhooks cover the interaction.

## Discord, Teams, Google Chat, Telegram, Linear, WhatsApp

Do not assume Slack features map 1:1. Check the adapter docs/types for:

- webhook or gateway transport shape
- supported events
- file upload behavior
- rich-message/card support
- streaming behavior
- state requirements
- platform verification and auth environment variables

Keep platform-specific fallback code behind a small adapter boundary.

## State Adapters

State is not optional for production bots. It backs subscription tracking,
locking, dedupe, and thread state.

Common choices:

- Redis for serverless and simple distributed state.
- Postgres when the app already has relational persistence and wants SQL-owned
  bot state.
- In-memory only for tests or local prototypes.

Review `node_modules/chat/docs/state.mdx` and the selected state adapter's
types before changing lock or dedupe behavior.

## Custom Adapters

Only build a custom adapter after confirming no official adapter fits.

Read:

- `node_modules/chat/docs/contributing/building.mdx`
- `node_modules/chat/docs/contributing/testing.mdx`
- `node_modules/chat/docs/contributing/publishing.mdx`
- `node_modules/chat/dist/index.d.ts`
- `node_modules/@chat-adapter/shared/dist/index.d.ts`

A custom adapter needs request verification, event normalization, message,
thread and channel operations, ID encoding/decoding, formatting conversion, and
tests against realistic platform payloads.
