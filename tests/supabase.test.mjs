import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

test('Supabase migration isolates the photography portfolio with read-only RLS', () => {
  const path = 'supabase/migrations/20260916_rodrigo_portfolio_gallery.sql';
  assert.ok(existsSync(path), 'Missing isolated Supabase migration');
  const sql = readFileSync(path, 'utf8').toLowerCase();
  assert.match(sql, /create table public\.rodrigo_portfolio_photos/);
  assert.match(sql, /enable row level security/);
  assert.match(sql, /revoke all on table public\.rodrigo_portfolio_photos from anon, authenticated/);
  assert.match(sql, /grant select on table public\.rodrigo_portfolio_photos to anon, authenticated/);
  assert.doesNotMatch(sql, /grant (insert|update|delete|all).* to anon/);
  assert.match(sql, /published is true/);
});
