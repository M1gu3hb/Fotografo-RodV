import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';


test('the complete site exposes the six real 2026 packages', async () => {
  assert.ok(existsSync('src/data/packages.json'), 'Missing structured package data');
  const packages = JSON.parse(readFileSync('src/data/packages.json', 'utf8'));
  assert.deepEqual(packages.map((item) => item.slug), [
    'basico', 'bronce', 'plata', 'oro', 'elite-1', 'elite-2',
  ]);
  assert.deepEqual(packages.map((item) => item.price), [11500, 13500, 16500, 18500, 22000, 26000]);
  assert.ok(packages.find((item) => item.slug === 'elite-2').features.includes('Getting Ready'));
  assert.ok(packages.find((item) => item.slug === 'elite-2').features.includes('First Look'));

  const { getPageData } = await import('../scripts/page-data.mjs');
  for (const route of [
    '/', '/paquetes', '/paquetes/basico', '/paquetes/bronce', '/paquetes/plata',
    '/paquetes/oro', '/paquetes/elite-1', '/paquetes/elite-2', '/experiencia', '/fotolibros',
  ]) {
    assert.doesNotThrow(() => getPageData(route), `Missing route ${route}`);
  }
  assert.equal(getPageData('/paquetes/oro').packageSlug, 'oro');
  assert.throws(() => getPageData('/paquetes/inventado'));
});


test('desktop photo reveal holds the blur, expands a central flash and respects reduced motion', () => {
  const css = readFileSync('src/portfolio.css', 'utf8');
  assert.match(css, /--photo-hold:\s*\.7s/);
  assert.match(css, /radial-gradient\(circle at center/);
  assert.match(css, /@keyframes photo-flash/);
  assert.match(css, /@keyframes photo-reveal/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});


test('the mobile story is a vertical scroll sequence with no hidden horizontal gesture', () => {
  const css = readFileSync('src/portfolio.css', 'utf8');
  const mobile = css.slice(css.indexOf('@media(max-width:720px)'));
  assert.match(mobile, /\.story-rail__track\{[^}]*display:grid/);
  assert.doesNotMatch(mobile, /\.story-rail__track\{[^}]*overflow-x:auto/);
  assert.doesNotMatch(mobile, /scroll-snap-type:x/);
});


test('PDF photographs have a reproducible crop plan and importer', () => {
  assert.ok(existsSync('scripts/pdf-photo-plan.json'), 'Missing reviewed PDF crop plan');
  assert.ok(existsSync('scripts/import-pdf-photos.py'), 'Missing PDF photo importer');
  const plan = JSON.parse(readFileSync('scripts/pdf-photo-plan.json', 'utf8'));
  assert.ok(plan.length >= 45, `Expected at least 45 individual crops, found ${plan.length}`);
  assert.ok(plan.every((item) => item.page && item.box?.length === 4 && item.alt));
});


test('the sitemap and metadata generator include every editorial page', () => {
  const prerender = readFileSync('scripts/prerender.mjs', 'utf8');
  for (const route of ['/paquetes', '/experiencia', '/fotolibros']) {
    assert.ok(prerender.includes(route), `Missing SEO route ${route}`);
  }
  assert.match(prerender, /BreadcrumbList/);
  assert.match(prerender, /ProfessionalService/);
});
