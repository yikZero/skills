## TypeScript

- Use {{PACKAGE_MANAGER}} for dependency installation and package scripts.
- Use Biome for formatting, import organization, and lightweight lint feedback.
- Treat Biome `useSortedClasses` warnings as Tailwind/shadcn class ordering feedback; run the unsafe-fix command deliberately when class sorting is desired.
- Keep `strict` TypeScript enabled.
- Prefer explicit module boundaries over broad utility folders.
- Use Vitest for the baseline test loop until a framework-specific runner replaces it.
- Do not hard-code values only to satisfy tests.
