import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const bin = join(root, 'bin/yskill.js');
const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
const errors = [];

function run(args, options = {}) {
  return spawnSync(process.execPath, [bin, ...args], {
    cwd: options.cwd ?? root,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

function expect(condition, message) {
  if (!condition) errors.push(message);
}

{
  const result = run(['--version']);
  expect(result.status === 0, '--version should exit 0');
  expect(result.stdout.trim() === version, '--version should print package version');
  expect(!result.stdout.includes('Installing'), '--version should not install skills');
}

{
  const result = run(['--help']);
  expect(result.status === 0, '--help should exit 0');
  expect(result.stdout.includes('Usage:'), '--help should print usage');
  expect(result.stdout.includes('init           project-bootstrap'), '--help should document init preset');
  expect(result.stdout.includes('writing        humanize-zh, humanize-en'), '--help should document writing preset');
  expect(!result.stdout.includes('Installing'), '--help should not install skills');
}

{
  const result = run(['--help']);
  const lines = result.stdout.split('\n');
  const start = lines.findIndex((line) => line.trim() === 'Presets:');
  expect(start !== -1, '--help should have a Presets section');

  const skills = new Set();
  for (let index = start + 1; index < lines.length && lines[index].trim() !== ''; index += 1) {
    const description = lines[index].trim().split(/\s{2,}/)[1];
    for (const skill of description?.split(', ') ?? []) skills.add(skill);
  }
  expect(skills.size > 0, 'preset skills should be parseable from --help');

  for (const skill of skills) {
    expect(
      existsSync(join(root, 'skills', skill, 'SKILL.md')),
      `preset references "${skill}" but skills/${skill}/SKILL.md does not exist`,
    );
  }
}

{
  const result = run(['--preset=unknown']);
  expect(result.status === 1, 'unknown preset should exit 1');
  expect(result.stderr.includes('init, default, core, frontend, writing'), 'unknown preset should list valid presets');
}

{
  const cwd = mkdtempSync(join(tmpdir(), 'yskill-nontty-'));
  const result = run([], { cwd });
  expect(result.status === 1, 'non-interactive no-arg run should exit 1');
  expect(result.stderr.includes('explicit selection'), 'non-interactive no-arg run should explain selection requirement');
  expect(!existsSync(join(cwd, '.agents')), 'non-interactive no-arg run should not create .agents');
  expect(!existsSync(join(cwd, 'skills-lock.json')), 'non-interactive no-arg run should not create skills-lock.json');
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('yskill CLI checks passed.');
