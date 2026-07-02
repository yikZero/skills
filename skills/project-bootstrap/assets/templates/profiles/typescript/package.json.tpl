{
  "name": "{{SLUG}}",
  "private": true,
  "type": "module",
  "scripts": {
    "format": "biome check --write .",
    "format:check": "biome check .",
    "lint": "biome lint .",
    "fix:unsafe": "biome check --write --unsafe .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "diff:check": "if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then git diff --check; else echo \"Skipping git diff --check outside git repo\"; fi",
    "validate": "biome check . && tsc --noEmit && vitest run && if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then git diff --check; else echo \"Skipping git diff --check outside git repo\"; fi"
  },
  "devDependencies": {
    "@biomejs/biome": "latest",
    "typescript": "latest",
    "vitest": "latest"
  }
}
