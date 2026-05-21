# Project Patterns

Use this for the user's recurring bot repos and architecture reviews.

## Role Split

- Chat SDK: user-facing chat platform surface, normalized messages, threads,
  cards, files, webhooks, and platform state.
- Pi SDK / agent SDK: model session, tools, resource loading, memory, and agent
  loop.
- Workflow SDK: durable orchestration, approvals, scheduled jobs, background
  sync, retries, and long-running processes.

Do not replace one layer with another unless the repo already proves that layer
owns the responsibility.

## Fries / fries-slack

Default review stance:

- Check Chat SDK and adapter-native APIs first.
- Avoid custom Slack glue, raw Block Kit, custom polling, or hand-written
  platform state when SDK APIs cover the need.
- Preserve the repo's Pi SDK lifecycle and memory/session behavior. Chat SDK is
  not a drop-in replacement for the agent loop.
- Verify live Slack behavior and logs when the user asks whether the bot works
  in production.

Useful Chat SDK surfaces for Slack work:

- `thread.post(...)`
- structured stream chunks / streaming plan types when installed
- `thread.startTyping(...)`
- assistant thread started/context changed events
- App Home events
- slash commands
- native markdown/card support
- thread state

## coding-agent / GitHub Bot

- Prefer `bot.webhooks.github(...)` as the route entrypoint.
- Use webhooks for PR comments and mentions.
- Keep polling only for explicit fallback gaps such as lifecycle maintenance or
  behind-base checks.
- Before deleting custom polling, prove the GitHub adapter covers the exact
  event and history needs.

## Code/agents

- Treat this repo as a multi-agent monorepo, not a single-purpose bot app.
- Keep agent-specific chat UI inside the preferred shared `3000` service unless
  the user explicitly asks for a separate UI.
- Email agent defaults are read-only unless the user explicitly asks for send,
  draft, or mutation actions.
- Keep Gmail/Outlook details behind provider adapters; prompts and tools should
  not depend on provider-specific IDs.

## Migration Reviews

When asked whether to migrate to Chat SDK:

1. Classify the current product surface: Slack, Telegram, GitHub, web UI, or
   multi-platform.
2. Inventory current platform semantics: reactions, typing/status, streaming,
   files, attachments, inline media, thread subscriptions, commands, modals,
   webhooks, and state.
3. Compare installed Chat SDK adapter support against those semantics.
4. Identify real gaps before recommending migration.
5. If migration is risky, recommend wrapping the platform boundary first rather
   than rewriting the agent/session core.
