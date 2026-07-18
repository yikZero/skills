---
name: humanize-en
description: "Strip AI flavor from English prose. Use when editing, rewriting, polishing, or reviewing drafts that read machine-generated — articles, blog posts, essays, newsletters, docs, marketing copy, README prose; or when the user says humanize, de-AI, remove AI slop, kill the AI tells, sounds like ChatGPT, too AI-flavored, make it sound human. Rewrites preserve meaning and tone; existing drafts only, no ghostwriting. For Chinese drafts use humanize-zh."
---

# Humanize (English)

Make a draft read like a specific person wrote it: a viewpoint, real details, uneven rhythm. AI flavor is the statistically safest average text — inflated significance, dodged judgment, tidy structure, throat-clearing everywhere. This skill edits existing drafts; it does not ghostwrite.

Two references: `references/patterns.md` is what to remove (words, structures, style, voice, content), `references/voice.md` is what to put back in (viewpoint, specificity, rhythm). Read both before rewriting; review mode needs only patterns.

## Workflow

**Rewrite (default — the user handed you a draft)**

1. Read the whole draft. Diagnose content first: is there a claim? Are there specifics? A hollow draft can't be saved by surface swaps — say so and ask for material instead of polishing emptiness.
2. Read `patterns.md` and mark hits paragraph by paragraph.
3. Rewrite sentence by sentence: keep the meaning and tone, kill the patterns, inject specifics per `voice.md`. Leave clean sentences alone.
4. Run the pre-delivery checks and scoring; below the bar, revise before delivering.
5. Deliver the rewrite. Change notes optional — five bullets max, major changes only.

**Review (the user wants findings, not edits)**

Don't touch the draft. List hits: quoted sentence + pattern name + suggested fix, ordered by severity, with the scoring table at the end.

## Core Rules

1. **Have a viewpoint.** React to facts and commit to judgments instead of neutrally listing pros and cons.
2. **Specific beats abstract.** Names, numbers, dates, scenes; cut empty announcements like "the implications are significant."
3. **A person acts in every sentence.** Active voice; no abstractions doing human verbs ("the decision drove change" → who decided, what changed).
4. **Mess up the rhythm.** Mix sentence lengths; break one of any three same-length sentences in a row; vary paragraph endings.
5. **Two beats three.** The forced triad is the most recognizable structural fingerprint.
6. **State, don't stage.** Cut throat-clearing ("It's worth noting"), hedging ("in some sense"), and wrap-up voice ("In conclusion").
7. **"Is" is fine.** Don't replace plain copulas with "serves as," "stands as," "marks."
8. **One thing, one name.** No synonym cycling; the protagonist stays the protagonist.
9. **Cut the quotables.** If a line sounds like a pull-quote built for a screenshot, rewrite it plainer.
10. **Trust the reader.** Don't explain metaphors, repeat points, or close paragraphs with "what this means is."

## Honesty Lines

De-flavoring is not impersonating a human. Any of these is worse than AI flavor:

- Never invent first-person anecdotes. "I tried this last week" goes in only if the user actually provided that experience.
- Never fabricate numbers, quotes, names, or cases. A sourceless "47% faster" reads faker than an honest "about twice as fast."
- Never perform hesitation or mistakes to seem authentic.
- If the user wants an AI-writing disclosure, keep it intact.

When a rewrite needs specificity, there are exactly three moves: use the user's material, use a verifiable public fact, or ask. The reverse also holds: **cut words, never facts** — the draft's existing numbers, dates, names, and examples are its most valuable parts; don't sand them off as clutter.

## Don't Overcorrect

Deliberate "humanness" is its own AI flavor:

- Don't pile on casual fillers. "Honestly" once is voice; five times is performance.
- A natural three-item list is innocent; only the mechanical triad is the crime. Don't split genuinely parallel information to dodge the rule.
- Em dashes, adverbs, connectives: human frequency, not zero. Keep ones carrying information; cut pure emphasis.
- Keep the author's fingerprints: pet phrases, odd metaphors, regionalisms are identity, not defects.
- When rules conflict, the tie-breaker is the read-aloud test: if it sounds like a person talking, it's right.

## Pre-Delivery Checks

- Can you restate the draft's claim in one sentence?
- How many "not X, but Y" constructions remain? (one max, and only where a real misconception needs correcting)
- Grep the draft against the `patterns.md` word list — any residue?
- Three consecutive same-length sentences? Every paragraph ending on a punchy one-liner?
- Does it open with "In today's..." or close with "Exciting times ahead"?
- Are the draft's original details still there? Does every added detail have a real source?
- Read it aloud (silently is fine): wherever you stumble or hear a news anchor, edit.

## Scoring

Self-score after rewriting, 1-10 per dimension:

| Dimension | Ask yourself |
| --- | --- |
| Directness | Statements, or announcements? |
| Rhythm | Varied, or metronomic? |
| Trust | Explaining anything that needs no explaining? |
| Authenticity | A specific person, or a press release? |
| Density | Any sentence still cuttable? |

Below 35/50, don't deliver — revise.
