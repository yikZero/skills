#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

const SOURCE = 'yikZero/skills';
const VERSION = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;

// Single source of truth for presets: flags, menu entry, and skill list.
// The PRESETS map, menu choices, help text, and dispatch all derive from it.
const PRESET_DEFS = [
  {
    flags: ['init'],
    menu: 'Project init',
    skills: ['project-bootstrap'],
  },
  {
    flags: ['default', 'core'],
    menu: 'Improve a codebase',
    skills: ['plan-handoff'],
  },
  {
    flags: ['frontend'],
    menu: 'Frontend bundle',
    skills: [
      'design',
      'web-ui-audit',
      'react-performance',
      'react-composition',
      'shadcn-ui',
      'tailwind-design-system',
    ],
  },
  {
    flags: ['writing'],
    menu: 'Writing bundle',
    skills: ['humanize-zh', 'humanize-en'],
  },
];

const PRESETS = new Map(PRESET_DEFS.flatMap((def) => def.flags.map((flag) => [flag, def.skills])));
const PRESET_NAMES = [...PRESETS.keys()].join(', ');

function buildArgs(args) {
  return [
    'exec',
    '--yes',
    '--package',
    'skills@latest',
    '--',
    'skills',
    'add',
    SOURCE,
    ...args,
  ];
}

function spawnSkills(args) {
  // Node >=18.20/20.12 refuses to spawn .cmd shims on Windows without a shell.
  const child = spawn('npm', buildArgs(args), {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 1);
  });

  child.on('error', (error) => {
    console.error(`yskill failed to launch npm: ${error.message}`);
    process.exit(1);
  });
}

function withSkills(args, skills) {
  return [...args, ...skills.flatMap((skill) => ['--skill', skill])];
}

function parsePreset(args) {
  const nextArgs = [];
  let preset;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--preset') {
      preset = args[index + 1];
      if (!preset || preset.startsWith('-')) {
        console.error(`Missing value for --preset. Use one of: ${PRESET_NAMES}`);
        process.exit(1);
      }
      index += 1;
      continue;
    }

    if (arg.startsWith('--preset=')) {
      preset = arg.slice('--preset='.length);
      continue;
    }

    nextArgs.push(arg);
  }

  if (preset === undefined) return { args: nextArgs };

  const skills = PRESETS.get(preset);
  if (!skills) {
    console.error(`Unknown preset "${preset}". Use one of: ${PRESET_NAMES}`);
    process.exit(1);
  }

  return { args: withSkills(nextArgs, skills), preset };
}

function hasExplicitSelection(args) {
  return args.some(
    (arg) =>
      arg === '--skill' ||
      arg === '-s' ||
      arg.startsWith('--skill=') ||
      arg === '--list' ||
      arg === '-l' ||
      arg === '--all' ||
      arg === '--preset' ||
      arg.startsWith('--preset='),
  );
}

function hasHelp(args) {
  return args.includes('--help') || args.includes('-h');
}

function hasVersion(args) {
  return args.includes('--version') || args.includes('-v');
}

function presetHelpLines() {
  const labels = PRESET_DEFS.map((def) => def.flags.join(', '));
  const width = Math.max(...labels.map((label) => label.length));
  return PRESET_DEFS.map((def, index) => `  ${labels[index].padEnd(width)}  ${def.skills.join(', ')}`).join('\n');
}

function printHelp() {
  console.log(`yskill ${VERSION}

Usage:
  npx yskill
  npx yskill --preset <${[...PRESETS.keys()].join('|')}> [skills options]
  npx yskill --skill <name> [skills options]
  npx yskill --all [skills options]
  npx yskill --list

Presets:
${presetHelpLines()}

Options:
  --preset <name>   Install a bundled skill set.
  --skill <name>    Install one skill. Repeatable.
  --all             Install every skill from ${SOURCE}.
  --list            List available skills.
  -a, --agent       Target agent option forwarded to the skills CLI.
  -y, --yes         Skip confirmation, forwarded to the skills CLI.
  -h, --help        Show this help.
  -v, --version     Show the yskill version.

In non-interactive shells, pass --preset, --skill, --all, or --list explicitly.`);
}

function printNonInteractiveUsage() {
  const presetLines = PRESET_DEFS.map((def) => `  npx yskill --preset ${def.flags[0]}`).join('\n');
  console.error(`yskill needs an explicit selection in non-interactive shells.

Use one of:
${presetLines}
  npx yskill --skill plan-handoff -a codex -y
  npx yskill --all
  npx yskill --list`);
}

async function chooseInstallMode() {
  const { select } = await import('@inquirer/prompts');

  return select({
    message: 'What do you want to install?',
    choices: [
      ...PRESET_DEFS.map((def) => ({
        name: def.menu,
        value: def.flags[0],
        description: def.skills.join(', '),
      })),
      {
        name: 'Pick individual skills',
        value: 'individual',
        description: 'Use the skills CLI picker.',
      },
      {
        name: 'Install all',
        value: 'all',
        description: `Install every skill from ${SOURCE}.`,
      },
    ],
  });
}

async function main() {
  const rawArgs = process.argv.slice(2);

  if (hasHelp(rawArgs)) {
    printHelp();
    return;
  }

  if (hasVersion(rawArgs)) {
    console.log(VERSION);
    return;
  }

  const parsed = parsePreset(rawArgs);
  const hasSelection = parsed.preset || hasExplicitSelection(rawArgs);
  const isInteractive = process.stdin.isTTY && process.stdout.isTTY;

  if (hasSelection) {
    spawnSkills(parsed.args);
    return;
  }

  if (!isInteractive) {
    printNonInteractiveUsage();
    process.exit(1);
  }

  try {
    const mode = await chooseInstallMode();
    const presetSkills = PRESETS.get(mode);

    if (presetSkills) {
      spawnSkills(withSkills(parsed.args, presetSkills));
      return;
    }

    if (mode === 'all') {
      spawnSkills(withSkills(parsed.args, ['*']));
      return;
    }

    spawnSkills(parsed.args);
  } catch (error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      process.exit(0);
    }

    throw error;
  }
}

await main();
