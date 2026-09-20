import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';


test('contact uses designed listboxes and supports a custom event type', () => {
  const app = readFileSync('src/App.tsx', 'utf8');
  assert.match(app, /function DesignedSelect/);
  assert.match(app, /role="listbox"/);
  assert.match(app, /Otro tipo de evento/);
  assert.match(app, /name="eventOther"/);
  assert.doesNotMatch(app, /<select name="event"/);
  assert.doesNotMatch(app, /<select name="package"/);
});


test('home package explorer links every option directly and reveals as one stable component', () => {
  const pages = readFileSync('src/SitePages.tsx', 'utf8');
  const motion = readFileSync('src/Motion.tsx', 'utf8');
  assert.match(pages, /className={`package-showcase__option/);
  assert.match(pages, /href={`\/paquetes\/\$\{item\.slug\}`}/);
  assert.match(pages, /El estilo fotográfico se mantiene/);
  assert.doesNotMatch(motion, /package-showcase__selector button/);
});


test('hero states the service and emotional benefit clearly', () => {
  const pages = readFileSync('src/SitePages.tsx', 'utf8');
  assert.match(pages, /Vuelve a sentirlo, toda la vida\./);
  assert.match(pages, /Bodas · XV años · Retratos/);
});


test('package index uses a compact three-column desktop grid without staggered cards', () => {
  const css = readFileSync('src/portfolio.css', 'utf8');
  assert.match(css, /\.package-grid--editorial\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.doesNotMatch(css, /\.package-grid--editorial \.package-card:nth-child\(even\)\{margin-top:/);
});


test('XV collection starts with the curated portrait and celebration sequence in static and API pages', async () => {
  const curation = JSON.parse(readFileSync('data/curation.json', 'utf8'));
  const gallery = JSON.parse(readFileSync('data/gallery.json', 'utf8'));
  assert.equal(curation['xv-anos'].length, 24);
  assert.deepEqual(curation['xv-anos'].slice(0, 4), [
    'xv-anos-035-00-a30dd2e397',
    'xv-anos-034-00-12eddcc4fa',
    'xv-anos-004-00-6cc4eb5a7b',
    'xv-anos-033-00-22aa370b0b',
  ]);
  assert.equal(new Set(curation['xv-anos']).size, 24);
  const { getPage } = await import('../api/gallery.mjs');
  const apiPage = getPage(gallery, new URLSearchParams('category=xv-anos&offset=0&limit=24'));
  assert.deepEqual(apiPage.items.map((photo) => photo.id), curation['xv-anos']);
  const { getPageData } = await import('../scripts/page-data.mjs');
  assert.deepEqual(getPageData('/colecciones/xv-anos').items.map((photo) => photo.id), curation['xv-anos']);
});
