import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('typography and motion system are explicit, responsive and reduced-motion safe', () => {
  const app = readFileSync('src/App.tsx', 'utf8');
  const pages = readFileSync('src/SitePages.tsx', 'utf8');
  const gallery = readFileSync('src/Gallery.tsx', 'utf8');
  const css = readFileSync('src/portfolio.css', 'utf8');
  const baseCss = readFileSync('src/styles.css', 'utf8');

  assert.match(baseCss, /text-size-adjust:\s*100%/);
  assert.match(app, /useScrollReveals/);
  assert.match(pages, /MotionText/);
  assert.match(pages, /StoryRail/);
  assert.match(pages, /collection-showcase/);
  assert.match(gallery, /photo-frame__placeholder/);
  assert.match(gallery, /photo-frame__image/);
  assert.match(css, /\[data-reveal\]/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.hero h1 \.motion-word>span\{[^}]*font-size:1em/);
  assert.match(pages, /<MotionText as="h1" text=\{currentCollection/);
});

test('brand motion and collection layout stay semantic', () => {
  const app = readFileSync('src/App.tsx', 'utf8');
  const pages = readFileSync('src/SitePages.tsx', 'utf8');
  assert.match(app, /brand__motion/);
  assert.match(pages, /aria-label="Colecciones fotográficas"/);
  assert.ok(pages.includes('href={`/colecciones/${collection.slug}`}'));
});
