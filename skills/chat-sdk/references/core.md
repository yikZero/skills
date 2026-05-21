# Chat SDK Core Checklist

Use this for implementation and review after the package is installed.

## Local Docs To Read First

- `node_modules/chat/docs/usage.mdx`
- `node_modules/chat/docs/handling-events.mdx`
- `node_modules/chat/docs/threads-messages-channels.mdx`
- `node_modules/chat/docs/posting-messages.mdx`
- `node_modules/chat/docs/streaming.mdx`
- `node_modules/chat/docs/cards.mdx`
- `node_modules/chat/docs/actions.mdx`
- `node_modules/chat/docs/modals.mdx`
- `node_modules/chat/docs/slash-commands.mdx`
- `node_modules/chat/docs/direct-messages.mdx`
- `node_modules/chat/docs/files.mdx`
- `node_modules/chat/docs/state.mdx`
- `node_modules/chat/docs/api/chat.mdx`
- `node_modules/chat/docs/api/thread.mdx`
- `node_modules/chat/docs/api/message.mdx`

If a docs file is absent, inspect `node_modules/chat/dist/index.d.ts` and the
installed adapter types.

## Event Surface

Prefer SDK handlers over manual webhook branching:

- `onNewMention`
- `onDirectMessage`
- `onSubscribedMessage`
- `onNewMessage(...)`
- `onReaction(...)`
- `onAction(...)`
- `onModalSubmit(...)`
- `onModalClose(...)`
- `onSlashCommand(...)`
- `onAssistantThreadStarted`
- `onAssistantContextChanged`
- `onAppHomeOpened`
- member/channel lifecycle handlers when supported by the adapter

When reviewing a bot, map each feature to one of these handlers before deciding
custom routing is necessary.

## Threads, Messages, And State

- Call `thread.subscribe()` when future replies should be handled as part of the
  same conversation.
- Use `thread.setState(...)` / `thread.getState(...)` for conversation state
  that belongs to Chat SDK.
- Keep message parsing on normalized `message.text`, formatted content,
  attachments, author metadata, and SDK-provided raw payloads only where needed.
- Do not store duplicate subscription, lock, or dedupe state outside the state
  adapter.

## Posting And Streaming

- Use `thread.post(...)` for normal replies.
- Use SDK streaming support for `AsyncIterable<string>` or structured stream
  chunks when available.
- Prefer AI SDK full-stream style outputs when the app needs thinking/tool/task
  boundaries preserved.
- Configure streaming cadence with `streamingUpdateIntervalMs` and fallback
  placeholder settings when user-visible update frequency matters.
- For Slack assistant UX, separate status/typing indicators from final streamed
  content.

## Cards, Actions, And Modals

- Use Chat SDK JSX components for cards and modals before writing platform JSON
  directly.
- Set the project's JSX runtime/import source as required by installed docs.
- Use `onAction` for buttons/selects and `onModalSubmit` / `onModalClose` for
  modal flows.
- If the app uses Workflow SDK approvals, prefer SDK callback URLs or action
  handlers that resume hooks/webhooks rather than ad hoc polling.

## Files

- Use the installed adapter's file upload and attachment APIs.
- Check platform-specific gaps. For example, migration from a custom Telegram
  bot may need to preserve inline photo/video behavior if the adapter exposes a
  different outbound file abstraction.

## Verification

- Run the repo's typecheck.
- Trigger the relevant webhook route with a real platform event or fixture.
- Confirm the state adapter records subscriptions and dedupe entries.
- For streaming changes, verify first update latency and final message shape in
  the actual platform when credentials are available.
