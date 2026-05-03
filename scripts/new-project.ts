#!/usr/bin/env -S node --experimental-strip-types
/**
 * Scaffolds a new project entry under `src/content/projects/<slug>/`.
 *
 * Usage:
 *   pnpm new:project <slug>
 *
 * The slug must be lowercase, digits, and hyphens only. After running, fill in
 * the placeholders in `index.mdx`, drop a `cover.jpg`/`cover.png` next to it,
 * and add screenshots into `screens/` (the folder is pre-created).
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(msg: string): never {
  process.stderr.write(`\n✗ ${msg}\n\n`);
  process.exit(1);
}

const slug = process.argv[2]?.trim();
if (!slug) {
  fail('Usage: pnpm new:project <slug>\nExample: pnpm new:project my-cool-project');
}
if (!SLUG_RE.test(slug)) {
  fail(`Invalid slug "${slug}": use lowercase letters, digits, and hyphens (e.g. "my-project").`);
}

const projectsRoot = join(process.cwd(), 'src', 'content', 'projects');
const projectDir = join(projectsRoot, slug);
const screensDir = join(projectDir, 'screens');
const indexPath = join(projectDir, 'index.mdx');

if (existsSync(projectDir)) {
  fail(`Project "${slug}" already exists at ${projectDir}.`);
}

mkdirSync(screensDir, { recursive: true });
writeFileSync(join(screensDir, '.gitkeep'), '', 'utf8');

const year = new Date().getFullYear();

const template = `---
# REQUIRED — fill these in:
title: 'TODO: project title'
slug: ${slug}
summary: 'TODO: one-paragraph hook (40–200 chars). What it is, why it mattered.'
cover: ./cover.jpg # drop a 1200×630 jpg/png/webp next to this file
screenshots: [] # ./screens/01.png, ./screens/02.png, ...
tech: [php, laravel] # 1–12 tags, lowercase
complexity: 3 # 1–5
duration: '3 месяца'
year: ${year}
status: completed # completed | in_progress | archived

# OPTIONAL — uncomment as needed:
# client: 'Client name'
# liveUrl: 'https://example.com'
# repoUrl: 'https://github.com/flathead/...'

# FRONT PAGE CONTROL:
featured: false # set true to surface on homepage
order: 0 # lower numbers come first

# QUEST LOG (optional, but recommended for storytelling):
# questLog:
#   problem: |
#     What was broken. 20+ chars.
#   stack:
#     - php-8.3
#     - laravel-11
#   outcome: |
#     What you delivered. 20+ chars.
#   learned: |
#     What you took away. 10+ chars.
---

Open with one or two short paragraphs hooking the reader.

## Контекст

Set the scene. What did the client come with? What constraints existed?

## Что сделал

Architecture, decisions, gotchas. Use \`code\` and **bold** for emphasis.
You can drop MDX components here:

{/* <Screenshot src={import('./screens/01.png')} alt="..." caption="..." /> */}
{/* <Callout type="warning">Heads up about a non-obvious gotcha.</Callout> */}

## Результат

Numbers, outcomes, what changed for the client. Be specific.
`;

writeFileSync(indexPath, template, 'utf8');

process.stdout.write(`
✓ Created ${indexPath}
✓ Created ${screensDir}/

Next steps:
  1. Drop a cover image at  src/content/projects/${slug}/cover.jpg
     (or .png/.webp — update the frontmatter field accordingly).
  2. Fill in the TODO fields in the frontmatter.
  3. Run  pnpm check  to validate the schema.
  4. Run  ASTRO_IMAGES=passthrough pnpm dev  and open  /projects/${slug}/.
  5. Open  /dev/project-preview/  to see how the card renders for every status.

`);
