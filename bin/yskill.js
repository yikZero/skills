#!/usr/bin/env node

import { spawn } from 'node:child_process';

const SOURCE = 'yikZero/skills';
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
        console.error('Missing value for --preset. Use one of: default, core, frontend');
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
      arg.startsWith('--preset=') ||
      arg === '--help' ||
      arg === '-h' ||
      arg === '--version' ||
      arg === '-v',
  );
}

async function chooseInstallMode() {
  const { select } = await import('@inquirer/prompts');

  return select({
    message: 'What do you want to install?',
    choices: [
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
  const parsed = parsePreset(rawArgs);

  if (parsed.preset || hasExplicitSelection(rawArgs) || !process.stdin.isTTY || !process.stdout.isTTY) {
    spawnSkills(parsed.args);
    return;
  }

  try {
    const mode = await chooseInstallMode();

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
