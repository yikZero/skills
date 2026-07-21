This skill generalizes the audit-then-plan workflow of `improve-animations`
from the MIT-licensed repository `emilkowalski/skills`, which itself credits
`shadcn/improve` for the pattern: use the most capable model where judgment
compounds (auditing, prioritizing, plan-writing) and hand execution to any
agent, including cheaper models, via fully self-contained plans.

Sources:

- https://github.com/emilkowalski/skills (MIT)
- https://github.com/shadcn/improve

The animation-specific rule catalog was removed; the hard rules, phased
workflow, plan template, and invocation verbs were rewritten to be
focus-area-agnostic for this portable skills catalog, with the audit bar
established at recon time from repo conventions, installed skills, or model
knowledge.
