import { readdir, readFile, stat } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const skillsDir = join(root, 'skills');
const errors = [];

const namePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function parseFrontmatter(content, file) {
  if (!content.startsWith('---\n')) {
    errors.push(`${file}: missing YAML frontmatter`);
    return null;
  }

  const end = content.indexOf('\n---', 4);
  if (end === -1) {
    errors.push(`${file}: unterminated YAML frontmatter`);
    return null;
  }

  const raw = content.slice(4, end).trim();
  const fields = {};
  for (const line of raw.split('\n')) {
    if (!line.trim() || line.startsWith('  ')) continue;
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    fields[match[1]] = match[2].replace(/^['"]|['"]$/g, '').trim();
  }
  return fields;
}

async function validateSkill(skillPath) {
  const skillName = basename(skillPath);
  const skillFile = join(skillPath, 'SKILL.md');
  if (!(await exists(skillFile))) {
    errors.push(`${skillPath}: missing SKILL.md`);
    return;
  }

  const content = await readFile(skillFile, 'utf8');
  const fields = parseFrontmatter(content, skillFile);
  if (!fields) return;

  if (!fields.name) {
    errors.push(`${skillFile}: missing name`);
  } else {
    if (fields.name !== skillName) {
      errors.push(`${skillFile}: name "${fields.name}" does not match directory "${skillName}"`);
    }
    if (!namePattern.test(fields.name)) {
      errors.push(`${skillFile}: name must be lowercase kebab-case`);
    }
    if (fields.name.length > 64) {
      errors.push(`${skillFile}: name must be at most 64 characters`);
    }
  }

  if (!fields.description) {
    errors.push(`${skillFile}: missing description`);
  } else if (fields.description.length > 1024) {
    errors.push(`${skillFile}: description must be at most 1024 characters`);
  }

  const lines = content.split('\n').length;
  if (lines > 500) {
    errors.push(`${skillFile}: keep SKILL.md under 500 lines; move details to references/`);
  }
}

const entries = await readdir(skillsDir, { withFileTypes: true });
for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  if (entry.name.startsWith('.')) continue;
  await validateSkill(join(skillsDir, entry.name));
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Validated skills successfully.');
