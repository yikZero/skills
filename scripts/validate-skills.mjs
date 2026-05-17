import { readdir, readFile, stat } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const skillsDir = join(root, 'skills');
const errors = [];

const namePattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const catalogDirs = new Set(['.curated', '.experimental', '.system']);
const forbiddenRootEntries = ['skills-lock.json', '.skill-lock.json', '.agents', '.claude', 'node_modules'];

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
  return { fields, raw };
}

function hasInternalMetadata(raw) {
  if (/^metadata:\s*\{[^}]*internal:\s*true\b[^}]*\}\s*$/m.test(raw)) {
    return true;
  }

  const lines = raw.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    if (!/^metadata:\s*$/.test(lines[index])) continue;

    for (let child = index + 1; child < lines.length; child += 1) {
      const line = lines[child];
      if (!line.trim()) continue;
      if (!/^\s+/.test(line)) break;
      if (/^\s+internal:\s*true\s*$/.test(line)) {
        return true;
      }
    }
  }

  return false;
}

async function validateSkill(skillPath, options = {}) {
  const skillName = basename(skillPath);
  const skillFile = join(skillPath, 'SKILL.md');
  if (!(await exists(skillFile))) {
    errors.push(`${skillPath}: missing SKILL.md`);
    return;
  }

  const content = await readFile(skillFile, 'utf8');
  const frontmatter = parseFrontmatter(content, skillFile);
  if (!frontmatter) return;

  const { fields, raw } = frontmatter;

  if (!fields.name) {
    errors.push(`${skillFile}: missing name`);
  } else {
    if (fields.name !== skillName) {
      errors.push(`${skillFile}: name "${fields.name}" does not match directory "${skillName}"`);
    }
    if (!namePattern.test(fields.name)) {
      errors.push(`${skillFile}: name must be lowercase kebab-case and start with a letter`);
    }
    if (fields.name.length > 64) {
      errors.push(`${skillFile}: name must be at most 64 characters`);
    }
  }

  if (!fields.description) {
    errors.push(`${skillFile}: missing description`);
  } else if (/^(true|false|\d+)$/i.test(fields.description)) {
    errors.push(`${skillFile}: description must be descriptive text`);
  } else if (fields.description.length > 1024) {
    errors.push(`${skillFile}: description must be at most 1024 characters`);
  }

  if (options.requireInternal && !hasInternalMetadata(raw)) {
    errors.push(`${skillFile}: skills under .experimental must set metadata.internal: true`);
  }

  const lines = content.split('\n').length;
  if (lines > 500) {
    errors.push(`${skillFile}: keep SKILL.md under 500 lines; move details to references/`);
  }
}

for (const entryName of forbiddenRootEntries) {
  if (await exists(join(root, entryName))) {
    errors.push(`${entryName}: generated install output must not live in the source repository`);
  }
}

async function validateCatalogDirectory(dir, options = {}) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    await validateSkill(join(dir, entry.name), options);
  }
}

const entries = await readdir(skillsDir, { withFileTypes: true });
for (const entry of entries) {
  if (!entry.isDirectory()) continue;

  const entryPath = join(skillsDir, entry.name);
  if (entry.name.startsWith('.')) {
    if (catalogDirs.has(entry.name)) {
      await validateCatalogDirectory(entryPath, { requireInternal: entry.name === '.experimental' });
    }
    continue;
  }

  await validateSkill(entryPath);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Validated skills successfully.');
