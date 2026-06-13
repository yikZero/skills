#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

const SOURCE = 'yikZero/skills';
const VERSION = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
const INIT_SKILLS = ['init-project'];
const CORE_SKILLS = ['find-docs', 'remove-ai-slop', 'learn-to-agents'];
const FRONTEND_SKILLS = [
  ...CORE_SKILLS,
  'design',
  'web-ui-audit',
  'react-performance',
  'react-composition',
  'shadcn-ui',
  'tailwind-design-system',
];

const PRESETS = new Map([
  ['init', INIT_SKILLS],
  ['default', CORE_SKILLS],
  ['core', CORE_SKILLS],
  ['frontend', FRONTEND_SKILLS],
]);

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

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
  const child = spawn(npm, buildArgs(args), { stdio: 'inherit' });

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
        console.error('Missing value for --preset. Use one of: init, default, core, frontend');
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
    console.error(`Unknown preset "${preset}". Use one of: ${[...PRESETS.keys()].join(', ')}`);
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

function printHelp() {
  console.log(`yskill ${VERSION}

Usage:
  npx yskill
  npx yskill --preset <init|default|core|frontend> [skills options]
  npx yskill --skill <name> [skills options]
  npx yskill --all [skills options]
  npx yskill --list

Presets:
  init           ${INIT_SKILLS.join(', ')}
  default, core  ${CORE_SKILLS.join(', ')}
  frontend       ${FRONTEND_SKILLS.join(', ')}

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
  console.error(`yskill needs an explicit selection in non-interactive shells.

Use one of:
  npx yskill --preset init
  npx yskill --preset default
  npx yskill --preset frontend
  npx yskill --skill find-docs -a codex -y
  npx yskill --all
  npx yskill --list`);
}

async function chooseInstallMode() {
  const { select } = await import('@inquirer/prompts');

  return select({
    message: 'What do you want to install?',
    choices: [
      {
        name: 'Project init',
        value: 'init',
        description: INIT_SKILLS.join(', '),
      },
      {
        name: 'Core recommended',
        value: 'core',
        description: CORE_SKILLS.join(', '),
      },
      {
        name: 'Frontend bundle',
        value: 'frontend',
        description: FRONTEND_SKILLS.join(', '),
      },
      {
        name: 'Pick individual skills',
        value: 'individual',
        description: 'Use the skills CLI picker.',
      },
      {
        name: 'Install all',
        value: 'all',
        description: 'Install every skill from yikZero/skills.',
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

    if (mode === 'init') {
      spawnSkills(withSkills(parsed.args, INIT_SKILLS));
      return;
    }

    if (mode === 'core') {
      spawnSkills(withSkills(parsed.args, CORE_SKILLS));
      return;
    }

    if (mode === 'frontend') {
      spawnSkills(withSkills(parsed.args, FRONTEND_SKILLS));
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
