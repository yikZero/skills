#!/usr/bin/env node

import { spawn } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const args = [
  'exec',
  '--yes',
  '--package',
  'skills@latest',
  '--',
  'skills',
  'add',
  'yikZero/skills',
  ...process.argv.slice(2),
];

const child = spawn(npm, args, { stdio: 'inherit' });

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
