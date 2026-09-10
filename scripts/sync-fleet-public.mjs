import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath } from 'node:url';
const defaultSource = new URL(
  '../../saas-maker/catalog/generated/public.json',
  import.meta.url
);
const target = new URL('../src/data/fleet-public.json', import.meta.url);
const sourceArgument = process.argv.find((argument) =>
  argument.startsWith('--source=')
);
const source = sourceArgument?.slice('--source='.length);
let text;
if (source) {
  const url = new URL(source);
  if (url.protocol !== 'https:' || url.username || url.password)
    throw new Error('Hosted catalog requires a public HTTPS URL');
  const response = await fetch(url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok)
    throw new Error(`Catalog refresh failed: HTTP ${response.status}`);
  text = await response.text();
  if (text.length > 5_000_000)
    throw new Error('Public catalog exceeds size limit');
} else {
  text = await readFile(defaultSource, 'utf8');
}
const catalog = JSON.parse(text);
if (
  catalog.schemaVersion !== 5 ||
  !Array.isArray(catalog.directory) ||
  catalog.directory.length === 0 ||
  !Array.isArray(catalog.products) ||
  !Array.isArray(catalog.pastProjects) ||
  !catalog.directory.every((project) => project.shareable === true) ||
  new Set(catalog.directory.map((project) => project.id)).size !==
    catalog.directory.length
) {
  throw new Error('Only a verified public projection may be synchronized');
}
const ids = new Set(catalog.directory.map((project) => project.id));
const derived = [...catalog.products, ...catalog.pastProjects];
if (
  derived.length !== ids.size ||
  new Set(derived.map((project) => project.id)).size !== ids.size
)
  throw new Error('Derived public lists do not match the directory');
for (const project of [...catalog.directory, ...derived]) {
  if (
    project.shareable !== true ||
    !ids.has(project.id) ||
    !project.name ||
    !project.description
  )
    throw new Error('Invalid public project');
  for (const value of [project.url, project.repositoryUrl].filter(Boolean)) {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password)
      throw new Error('Public project URLs must use HTTPS without credentials');
  }
}
if (process.argv.includes('--check')) {
  if (!isDeepStrictEqual(JSON.parse(await readFile(target, 'utf8')), catalog))
    throw new Error('Public projection is stale');
} else {
  await writeFile(target, text);
  execFileSync(
    fileURLToPath(new URL('../node_modules/.bin/biome', import.meta.url)),
    [
      'format',
      '--write',
      '--json-formatter-enabled=true',
      fileURLToPath(target),
    ],
    {
      cwd: fileURLToPath(new URL('..', import.meta.url)),
      stdio: 'inherit',
    }
  );
}
console.log(`Public projection: ${catalog.directory.length} shareable entries`);
