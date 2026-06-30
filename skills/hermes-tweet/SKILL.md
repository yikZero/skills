---
name: hermes-tweet
description: >-
  Use when connecting Hermes Agent to X/Twitter research, monitoring, or
  carefully gated posting through the Hermes Tweet plugin. Trigger on Hermes
  Agent social workflows, X/Twitter trend research, tweet reading, public
  account monitoring, or approval-gated tweet actions. Do not use for private
  account scraping, bypassing platform policy, TweetClaw-only setups, or
  ungated write automation.
---

# Hermes Tweet

Use Hermes Tweet when a Hermes Agent workflow needs public X/Twitter context or
explicitly approved tweet actions without building a custom social integration.

## Workflow

1. Confirm the task is a Hermes Agent task and that X/Twitter is the right
   public source for the user goal.
2. Prefer read-only actions first: search, explore, profile context, thread
   reading, launch monitoring, competitor review, and public trend research.
3. Require an `XQUIK_API_KEY` in the local runtime before any read tool that
   needs live X/Twitter access.
4. Treat posting, liking, replying, reposting, following, or deleting as write
   actions. Require an explicit user approval for the exact action and keep
   `HERMES_TWEET_ENABLE_ACTIONS=true` as the runtime gate.
5. Keep outputs evidence-led. Link or summarize public tweets and accounts, but
   never expose private data, secrets, cookies, tokens, or session material.

## Use Cases

- Build a Hermes Agent that monitors public launch reactions on X/Twitter.
- Gather recent public posts about a product, company, topic, or competitor.
- Draft a response plan from public social signals before a human approves any
  post.
- Add a guarded X/Twitter tool layer to an existing Hermes Agent plugin stack.

## Boundaries

- Do not use this skill for TweetClaw-only repositories or integrations.
- Do not claim whole-platform coverage. Say the result is best-effort and based
  on the queried public surfaces.
- Do not automate writes silently. The human must approve the exact final action.
- Do not store or print API keys, credentials, cookies, or raw session artifacts.

## Install Hint

Use the Hermes Tweet repository and its official Hermes Agent plugin metadata as
the source of truth:

```bash
git clone https://github.com/Xquik-dev/hermes-tweet
```
