import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('Vercel upload excludes local build copies and private working files', () => {
  const ignored = readFileSync('.vercelignore', 'utf8');
  for (const path of ['dist/', '.render/', 'node_modules/', 'output/', 'private-audit/', 'supabase/seed/', 'tmp/']) {
    assert.ok(ignored.includes(path), `Missing ${path} from .vercelignore`);
  }
});
