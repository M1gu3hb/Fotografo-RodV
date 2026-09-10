import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

test('portfolio replaces concept placeholders and simulated inquiries', () => {
  const source=readFileSync('src/App.tsx','utf8');
  assert.ok(!source.includes('concept-banner'), 'Concept banner still visible');
  assert.ok(!source.includes('setSubmitted'), 'Simulated contact submission still present');
  assert.ok(existsSync('src/Gallery.tsx'), 'Progressive gallery is missing');
});
