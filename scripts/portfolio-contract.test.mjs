// Public portfolio contract: promotion follows the verified public projection.

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

async function readSpotlightSource() {
  return readFile(`${ROOT}/src/data/spotlight-products.ts`, 'utf8');
}

async function readHomepageSource() {
  return readFile(`${ROOT}/src/pages/index.astro`, 'utf8');
}

async function readSiteSource() {
  return readFile(`${ROOT}/src/data/site.ts`, 'utf8');
}

async function readHeadSource() {
  return readFile(`${ROOT}/src/components/astro/Head.astro`, 'utf8');
}

test('spotlight follows only shareable primary work and the directory entry', async () => {
  const source = await readSpotlightSource();
  const catalog = JSON.parse(
    await readFile(`${ROOT}/src/data/fleet-public.json`, 'utf8')
  );
  assert.equal(
    catalog.directory.every((project) => project.shareable === true),
    true
  );
  assert.equal(
    catalog.directory.some((project) =>
      ['chess', 'journal'].includes(project.id)
    ),
    false
  );
  assert.deepEqual(
    catalog.products
      .filter((project) => project.spotlight)
      .map((project) => project.id),
    ['codevetter', 'posttrainllm']
  );
  assert.equal(
    catalog.products
      .filter((project) => project.spotlight)
      .every((project) => project.lifecycle === 'primary'),
    true
  );
  assert.match(source, /project.spotlight \|\| project.id === 'saas-maker'/);
});

test('homepage renders the spotlight set with a distinct directory CTA for SaaS Maker', async () => {
  const home = await readHomepageSource();
  const spotlightImport = await readSpotlightSource();
  // Homepage must import and render the spotlight data — not a parallel list.
  assert.match(
    home,
    new RegExp("from '@/data/spotlight-products'"),
    'homepage must consume spotlight-products data'
  );
  assert.match(
    home,
    /spotlightProducts\.map/,
    'homepage must render the spotlight collection'
  );
  // SaaS Maker must keep its distinct directory CTA copy so it is not
  // presented as a peer product.
  assert.match(
    home,
    /open the directory/,
    'SaaS Maker must keep its distinct directory CTA copy'
  );
  assert.match(spotlightImport, /publicCatalog.products/);
});

test('homepage declares one meaningful CTA in the hero', async () => {
  const home = await readHomepageSource();
  // Hero CTA: "See what I'm building" → #focus. This is the activation
  // surface on a static site (outbound click; no server-side event).
  assert.match(home, /See what I/, 'hero must declare the primary CTA');
  assert.match(
    home,
    /href="#focus"/,
    'hero CTA must anchor to the focus section'
  );
});

test('site publishes one canonical, externally corroborated person identity', async () => {
  const siteSource = await readSiteSource();
  const headSource = await readHeadSource();

  assert.match(
    siteSource,
    /personId: 'https:\/\/sarthakagrawal\.dev\/#person'/
  );
  assert.match(
    siteSource,
    /alternateNames: \['sarthakagrawal927', 'sarthakagrawal\.dev'\]/
  );
  assert.match(siteSource, /avatars\.githubusercontent\.com\/u\/43884471/);
  assert.match(siteSource, /linkedin\.com\/in\/sarthakagrawal927/);
  assert.match(siteSource, /github\.com\/sarthakagrawal927/);
  assert.match(siteSource, /x\.com\/sarthakcodes/);
  assert.match(headSource, /'@type': 'ProfilePage'/);
  assert.match(headSource, /const personNode = \{/);
  assert.match(headSource, /'@type': 'Person'/);
  assert.match(headSource, /'@id': site\.personId/);
  assert.match(headSource, /alternateName: site\.alternateNames/);
  assert.match(headSource, /sameAs: Object\.values\(site\.profiles\)/);
  assert.match(headSource, /if \(isHome\)/);
});
