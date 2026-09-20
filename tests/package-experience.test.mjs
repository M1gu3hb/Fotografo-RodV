import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';


test('package navigation stops at the first and last proposal', () => {
  const pages = readFileSync('src/SitePages.tsx', 'utf8');
  assert.match(pages, /const previous = index > 0/);
  assert.match(pages, /const next = index < packages\.length - 1/);
  assert.doesNotMatch(pages, /const previous = packages\[\(index - 1 \+ packages\.length\) % packages\.length\]/);
});


test('the packages experience is photographic and explains the real differences', () => {
  const pages = readFileSync('src/SitePages.tsx', 'utf8');
  const data = JSON.parse(readFileSync('src/data/packages.json', 'utf8'));
  assert.match(pages, /function PackageShowcase/);
  assert.match(pages, /package-showcase__visual/);
  assert.match(pages, /package-comparison/);
  assert.ok(data.every((item) => item.focus && item.bestFor));
  assert.ok(data.every((item) => item.comparison?.coverage && item.comparison?.video && item.comparison?.print && item.comparison?.experience));
});


test('navigation includes Home and contact prepares a WhatsApp enquiry', () => {
  const app = readFileSync('src/App.tsx', 'utf8');
  assert.match(app, /\{ label: "Inicio", href: "\/" \}/);
  assert.match(app, /<form[^>]+contact-form/);
  assert.match(app, /encodeURIComponent/);
  assert.match(app, /wa\.me\/\$\{contact\.whatsapp\}\?text=/);
  for (const field of ['name="name"', 'name="date"', 'name="event"', 'name="package"']) {
    assert.ok(app.includes(field), `Missing contact field ${field}`);
  }
});


test('new motion remains accessible and does not require horizontal mobile gestures', () => {
  const css = readFileSync('src/portfolio.css', 'utf8');
  assert.match(css, /\.scroll-progress/);
  assert.match(css, /\[data-reveal="clip"\]/);
  assert.match(css, /\.package-showcase/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  const mobile = css.slice(css.indexOf('@media(max-width:720px)', css.indexOf('package-showcase')));
  assert.doesNotMatch(mobile, /overflow-x:\s*auto/);
});
