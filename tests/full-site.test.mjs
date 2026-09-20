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


test('the mobile story presents an automatic side-to-side photographic reel', () => {
  const pages = readFileSync('src/SitePages.tsx', 'utf8');
  const css = readFileSync('src/portfolio.css', 'utf8');
  assert.match(pages, /function MobileStoryReel/);
  assert.match(pages, /Archivo en movimiento/);
  assert.match(css, /\.story-rail__track\{display:none/);
  assert.match(css, /\.story-reel__track\{[^}]*animation:story-reel-drift/);
  assert.doesNotMatch(css, /scroll-snap-type:x/);
});


test('mobile pages expose touch controls, sticky portfolio filters and optional package details', () => {
  const pages = readFileSync('src/SitePages.tsx', 'utf8');
  const css = readFileSync('src/portfolio.css', 'utf8');
  assert.match(pages, /aria-label={`Ver paquete \$\{item\.name\}`}/);
  assert.match(pages, /aria-pressed={mobileCycle\.index === index}/);
  assert.match(pages, /Muévete entre paquetes/);
  assert.match(pages, /function SequencedPhoto/);
  assert.match(pages, /Abrir comparación detallada/);
  assert.match(css, /\.collection-page \.filters\{position:sticky/);
  assert.match(css, /\.package-comparison__rows:not\(\.is-open\)\{display:none/);
  assert.match(css, /\.scroll-chapter,\.scroll-chapter:nth-child\(even\)\{position:sticky/);
  assert.match(css, /@keyframes package-name-pop/);
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
