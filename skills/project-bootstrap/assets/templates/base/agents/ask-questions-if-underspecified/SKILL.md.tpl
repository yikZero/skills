---
name: ask-questions-if-underspecified
description: Ask focused clarification questions before implementation when missing product, stack, validation, or integration decisions would cause churn.
---

# Ask Questions If Underspecified

Use this repo-local skill when proceeding would force guesses that materially affect project shape.

## Workflow

1. Identify the smallest set of missing decisions.
2. Ask no more than three questions at a time.
3. Recommend a default when one is obvious from `PRODUCT.md`, `AGENTS.md`, or `INIT.md` while it exists.
4. Record answered decisions in the relevant control document before implementing.

## Ask About

- first target user and workflow
- app type and stack
- platform-specific constraints for mini programs, browser extensions, native/mobile shells, hardware tools, or automations
- package manager when the current profile default is unsuitable
- deployment target
- database, auth, AI provider, or external integrations
- validation expectations
