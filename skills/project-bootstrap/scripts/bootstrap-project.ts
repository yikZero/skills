#!/usr/bin/env bun

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type Args = {
  codexModel?: string;
  description?: string;
  force?: boolean;
  help?: boolean;
  name?: string;
  packageManager?: string;
  path?: string;
  profile?: string;
  slug?: string;
};

type CommandSet = {
  fixUnsafe?: string;
  format?: string;
  formatCheck?: string;
  install?: string;
  lint?: string;
  test?: string;
  typecheck?: string;
  validate: string;
};

type PackageManager = "auto" | "bun" | "pnpm" | "npm" | "uv" | "none";
type ResolvedPackageManager = Exclude<PackageManager, "auto">;
type ProfileName = "typescript" | "python" | "generic";
type TemplatePair = readonly [source: string, destination: string];
type RawFile = readonly [destination: string, content: string];
type RenderedFile = { destination: string; content: string };
type FileEntry = TemplatePair | RenderedFile;
type Replacements = Record<string, string>;

type Profile = {
  allowedPackageManagers: Set<ResolvedPackageManager>;
  commands: (packageManager: ResolvedPackageManager) => CommandSet;
  defaultPackageManager: ResolvedPackageManager;
  gitignore: string[];
  label: string;
  rawFiles: RawFile[];
  snippets: {
    architecture: string;
    codestyle: string;
  };
  templates: TemplatePair[];
  toolSummary: (packageManager: ResolvedPackageManager) => string;
};

type RenderContext = {
  commands: CommandSet;
  files: FileEntry[];
  profile: Profile;
  profileName: ProfileName;
  replacements: Replacements;
  target: string;
};

const SKILL_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATE_ROOT = join(SKILL_ROOT, "assets/templates");
const DEFAULT_CODEX_MODEL = "gpt-5.5";

const PROFILE_ALIASES: Record<string, ProfileName> = {
  docs: "generic",
  js: "typescript",
  node: "typescript",
  py: "python",
  ts: "typescript",
};

const NODE_PACKAGE_MANAGERS = new Set<ResolvedPackageManager>(["bun", "pnpm", "npm"]);
const ALL_PACKAGE_MANAGERS = new Set<PackageManager>(["auto", "bun", "pnpm", "npm", "uv", "none"]);

const BASE_TEMPLATES: TemplatePair[] = [
  ["base/.codex/config.toml.tpl", ".codex/config.toml"],
  ["base/.env.example.tpl", ".env.example"],
  ["base/.gitignore.tpl", ".gitignore"],
  ["base/AGENTS.md.tpl", "AGENTS.md"],
  ["base/ARCHITECTURE.md.tpl", "ARCHITECTURE.md"],
  ["base/CODESTYLE.md.tpl", "CODESTYLE.md"],
  ["base/DESIGN.md.tpl", "DESIGN.md"],
  ["base/INIT.md.tpl", "INIT.md"],
  ["base/PRODUCT.md.tpl", "PRODUCT.md"],
  ["base/README.md.tpl", "README.md"],
  ["base/ROADMAP.md.tpl", "ROADMAP.md"],
  ["base/agents/ask-questions-if-underspecified/SKILL.md.tpl", ".agents/skills/ask-questions-if-underspecified/SKILL.md"],
  ["base/agents/project-bootstrap/SKILL.md.tpl", ".agents/skills/project-bootstrap/SKILL.md"],
  ["base/agents/review-ui-screenshots/SKILL.md.tpl", ".agents/skills/review-ui-screenshots/SKILL.md"],
];

const PROFILES: Record<ProfileName, Profile> = {
  typescript: {
    label: "TypeScript",
    defaultPackageManager: "bun",
    allowedPackageManagers: NODE_PACKAGE_MANAGERS,
    commands: nodeCommands,
    gitignore: ["node_modules/", "dist/", "build/", "coverage/", ".turbo/", ".next/", ".vite/"],
    rawFiles: [
      ["assets/.gitkeep", ""],
      ["scripts/.gitkeep", ""],
      ["src/.gitkeep", ""],
    ],
    snippets: {
      architecture: "profiles/typescript/architecture.md.tpl",
      codestyle: "profiles/typescript/codestyle.md.tpl",
    },
    templates: [
      ["profiles/typescript/biome.json.tpl", "biome.json"],
      ["profiles/typescript/package.json.tpl", "package.json"],
      ["profiles/typescript/tests/smoke.test.ts.tpl", "tests/smoke.test.ts"],
      ["profiles/typescript/tsconfig.json.tpl", "tsconfig.json"],
    ],
    toolSummary: (packageManager) =>
      `${packageManager} for JavaScript/TypeScript dependencies, Biome for format/lint/imports, TypeScript, and Vitest`,
  },
  python: {
    label: "Python",
    defaultPackageManager: "uv",
    allowedPackageManagers: new Set<ResolvedPackageManager>(["uv"]),
    commands: pythonCommands,
    gitignore: [
      ".venv/",
      "__pycache__/",
      "*.py[cod]",
      ".pytest_cache/",
      ".ruff_cache/",
      "dist/",
      "build/",
      "*.egg-info/",
    ],
    rawFiles: [
      ["assets/.gitkeep", ""],
      ["scripts/.gitkeep", ""],
    ],
    snippets: {
      architecture: "profiles/python/architecture.md.tpl",
      codestyle: "profiles/python/codestyle.md.tpl",
    },
    templates: [
      ["profiles/python/Makefile.tpl", "Makefile"],
      ["profiles/python/pyproject.toml.tpl", "pyproject.toml"],
      ["profiles/python/src/__init__.py.tpl", "src/{{PYTHON_PACKAGE}}/__init__.py"],
      ["profiles/python/tests/test_smoke.py.tpl", "tests/test_smoke.py"],
    ],
    toolSummary: () => "uv for Python dependencies, Ruff, and pytest",
  },
  generic: {
    label: "Generic Docs/Context",
    defaultPackageManager: "none",
    allowedPackageManagers: new Set<ResolvedPackageManager>(["none"]),
    commands: genericCommands,
    gitignore: ["dist/", "build/", "coverage/"],
    rawFiles: [
      ["assets/.gitkeep", ""],
      ["scripts/.gitkeep", ""],
      ["src/.gitkeep", ""],
      ["tests/.gitkeep", ""],
    ],
    snippets: {
      architecture: "profiles/generic/architecture.md.tpl",
      codestyle: "profiles/generic/codestyle.md.tpl",
    },
    templates: [],
    toolSummary: () => "no runtime selected yet",
  },
};

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (!args.path || !args.name) {
    printHelp();
    process.exit(1);
  }

  const context = await createContext(args);
  await writeProject(context, args.force);

  console.log(`Created ${context.profile.label} AI-ready project baseline at ${context.target}`);
  console.log(nextStepMessage(context));
}

async function createContext(rawArgs: Args): Promise<RenderContext> {
  const profileName = normalizeProfile(rawArgs.profile || "typescript");
  const profile = PROFILES[profileName];
  const packageManager = normalizePackageManager(rawArgs.packageManager || "auto", profileName);

  const projectName = rawArgs.name?.trim();
  if (!projectName) {
    throw new Error("Project name is required.");
  }

  const slug = rawArgs.slug || slugify(projectName);
  const pythonPackage = pythonPackageName(slug);
  const description = rawArgs.description || `${projectName} is a new AI-ready project.`;
  const commands = profile.commands(packageManager);
  const replacements: Replacements = {
    CODEX_MODEL: rawArgs.codexModel || DEFAULT_CODEX_MODEL,
    COMMANDS_MD: commandBullets(commands),
    DESCRIPTION: description,
    DESCRIPTION_JSON: JSON.stringify(description),
    DESCRIPTION_TOML: escapeTomlString(description),
    GITIGNORE_PROFILE: profile.gitignore.join("\n"),
    PACKAGE_MANAGER: packageManager,
    PROFILE_LABEL: profile.label,
    PROJECT_NAME: projectName,
    PYTHON_PACKAGE: pythonPackage,
    SLUG: slug,
    TOOL_SUMMARY: profile.toolSummary(packageManager),
    VALIDATE_COMMAND: commands.validate,
    VALIDATION_COMMANDS: validationCommands(commands),
  };
  replacements.PROFILE_ARCHITECTURE = await loadTemplate(profile.snippets.architecture, replacements);
  replacements.PROFILE_CODESTYLE = await loadTemplate(profile.snippets.codestyle, replacements);

  return {
    commands,
    files: [
      ...BASE_TEMPLATES,
      ...profile.templates,
      ...profile.rawFiles.map(([destination, content]) => ({ destination, content })),
    ],
    profile,
    profileName,
    replacements,
    target: resolve(rawArgs.path ?? "."),
  };
}

async function writeProject(context: RenderContext, force = false): Promise<void> {
  await mkdir(context.target, { recursive: true });

  const existing = await readdir(context.target);
  if (existing.length && !force) {
    throw new Error(
      `${context.target} is not empty. Re-run with --force only after confirming overwrite/merge is intended.`,
    );
  }

  for (const entry of context.files) {
    const destinationTemplate = isTemplatePair(entry) ? entry[1] : entry.destination;
    const outputPath = join(context.target, renderPath(destinationTemplate, context.replacements));
    const content = isTemplatePair(entry)
      ? await loadTemplate(entry[0], context.replacements)
      : render(entry.content, context.replacements);

    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, content, force ? undefined : { flag: "wx" });
  }
}

function normalizeProfile(value: string): ProfileName {
  const normalized = value.toLowerCase();
  const profile = PROFILE_ALIASES[normalized] || normalized;
  if (!isProfileName(profile)) {
    throw new Error(`Unsupported profile: ${value}. Use typescript, python, or generic.`);
  }
  return profile;
}

function normalizePackageManager(value: string, profileName: ProfileName): ResolvedPackageManager {
  const normalized = value.toLowerCase();
  if (!isPackageManager(normalized)) {
    throw new Error(`Unsupported package manager: ${value}. Use auto, bun, pnpm, npm, uv, or none.`);
  }

  const profile = PROFILES[profileName];
  const packageManager = normalized === "auto" ? profile.defaultPackageManager : normalized;
  if (!profile.allowedPackageManagers.has(packageManager)) {
    throw new Error(
      `Package manager ${packageManager} is not supported for ${profileName}. Use one of: ${[
        ...profile.allowedPackageManagers,
      ].join(", ")}.`,
    );
  }
  return packageManager;
}

function isProfileName(value: string): value is ProfileName {
  return value === "typescript" || value === "python" || value === "generic";
}

function isPackageManager(value: string): value is PackageManager {
  return ALL_PACKAGE_MANAGERS.has(value as PackageManager);
}

function isTemplatePair(entry: FileEntry): entry is TemplatePair {
  return Array.isArray(entry);
}

function parseArgs(argv: string[]): Args {
  const parsed: Args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") parsed.help = true;
    else if (arg === "--force") parsed.force = true;
    else if (arg === "--path") parsed.path = readValue(argv, ++index, arg);
    else if (arg.startsWith("--path=")) parsed.path = arg.slice("--path=".length);
    else if (arg === "--name") parsed.name = readValue(argv, ++index, arg);
    else if (arg.startsWith("--name=")) parsed.name = arg.slice("--name=".length);
    else if (arg === "--slug") parsed.slug = readValue(argv, ++index, arg);
    else if (arg.startsWith("--slug=")) parsed.slug = arg.slice("--slug=".length);
    else if (arg === "--description") parsed.description = readValue(argv, ++index, arg);
    else if (arg.startsWith("--description=")) parsed.description = arg.slice("--description=".length);
    else if (arg === "--profile" || arg === "--language") parsed.profile = readValue(argv, ++index, arg);
    else if (arg.startsWith("--profile=")) parsed.profile = arg.slice("--profile=".length);
    else if (arg.startsWith("--language=")) parsed.profile = arg.slice("--language=".length);
    else if (arg === "--package-manager") parsed.packageManager = readValue(argv, ++index, arg);
    else if (arg.startsWith("--package-manager=")) {
      parsed.packageManager = arg.slice("--package-manager=".length);
    } else if (arg === "--package-manager-version" || arg === "--bun-version") {
      throw new Error("Version flags are intentionally unsupported. Let the package manager and lockfile resolve versions.");
    } else if (arg.startsWith("--package-manager-version=") || arg.startsWith("--bun-version=")) {
      throw new Error("Version flags are intentionally unsupported. Let the package manager and lockfile resolve versions.");
    } else if (arg === "--codex-model") parsed.codexModel = readValue(argv, ++index, arg);
    else if (arg.startsWith("--codex-model=")) parsed.codexModel = arg.slice("--codex-model=".length);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function readValue(argv: string[], index: number, flag: string): string {
  const value = argv[index];
  if (!value) {
    throw new Error(`Missing value for ${flag}`);
  }
  return value;
}

function printHelp(): void {
  console.log(`Usage:
  bun scripts/bootstrap-project.ts --path <target-dir> --name "<Project Name>" [options]

Options:
  --description "<text>"     One-sentence product description.
  --slug <package-name>      package/project slug. Defaults to a slugified project name.
  --profile <name>           typescript, python, or generic. Defaults to typescript.
  --package-manager <name>   auto, bun, pnpm, npm, uv, or none. Defaults by profile.
  --codex-model <model>      .codex/config.toml model. Defaults to ${DEFAULT_CODEX_MODEL}.
  --force                    Write into a non-empty directory.

Default package managers:
  typescript -> bun
  python     -> uv
  generic    -> none`);
}

function nodeCommands(packageManager: ResolvedPackageManager): CommandSet {
  return {
    install: `${packageManager} install`,
    fixUnsafe: scriptCommand(packageManager, "fix:unsafe"),
    format: scriptCommand(packageManager, "format"),
    formatCheck: scriptCommand(packageManager, "format:check"),
    lint: scriptCommand(packageManager, "lint"),
    typecheck: scriptCommand(packageManager, "typecheck"),
    test: scriptCommand(packageManager, "test"),
    validate: scriptCommand(packageManager, "validate"),
  };
}

function pythonCommands(): CommandSet {
  return {
    install: "uv sync",
    format: "uv run ruff format .",
    formatCheck: "uv run ruff format --check .",
    lint: "uv run ruff check .",
    test: "uv run pytest",
    validate: "make validate",
  };
}

function genericCommands(): CommandSet {
  return {
    validate: "git diff --check",
  };
}

function scriptCommand(packageManager: ResolvedPackageManager, scriptName: string): string {
  if (packageManager === "npm") return scriptName === "test" ? "npm test" : `npm run ${scriptName}`;
  if (packageManager === "pnpm") return `pnpm ${scriptName}`;
  return `bun run ${scriptName}`;
}

async function loadTemplate(relativePath: string, replacements: Replacements): Promise<string> {
  const content = await readFile(join(TEMPLATE_ROOT, relativePath), "utf8");
  return render(content, replacements);
}

function render(content: string, replacements: Replacements): string {
  return content.replace(/\{\{([A-Z0-9_]+)\}\}/g, (match, key) => {
    if (!(key in replacements)) {
      throw new Error(`Missing template replacement: ${key}`);
    }
    return replacements[key] ?? match;
  });
}

function renderPath(path: string, replacements: Replacements): string {
  return render(path, replacements);
}

function commandBullets(commands: CommandSet): string {
  const entries: Array<[keyof CommandSet, string]> = [
    ["install", "Install"],
    ["format", "Format"],
    ["formatCheck", "Format check"],
    ["lint", "Lint"],
    ["fixUnsafe", "Unsafe fixes"],
    ["typecheck", "Typecheck"],
    ["test", "Test"],
    ["validate", "Validate"],
  ];

  return entries
    .filter(([key]) => commands[key])
    .map(([key, label]) => `- ${label}: \`${commands[key]}\``)
    .join("\n");
}

function validationCommands(commands: CommandSet): string {
  return [commands.install, commands.validate].filter((command): command is string => Boolean(command)).join("\n");
}

function nextStepMessage(context: RenderContext): string {
  if (context.commands.install) {
    return `Next: cd into the project, run \`${context.commands.install}\`, then \`${context.commands.validate}\`.`;
  }
  return `Next: cd into the project, then run \`${context.commands.validate}\` after initializing git.`;
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "new-project";
}

function pythonPackageName(slug: string): string {
  const name = slug.replace(/-/g, "_").replace(/[^a-z0-9_]/g, "");
  return /^[a-z_]/.test(name) ? name : `project_${name || "app"}`;
}

function escapeTomlString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

await main();
