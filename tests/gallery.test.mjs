import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

test('gallery API exists and provides bounded pages, filters and errors', async () => {
  assert.ok(existsSync('api/gallery.mjs'), 'Missing Vercel gallery function');
  const { getPage } = await import('../api/gallery.mjs');
  const photos = Array.from({length:70}, (_,i) => ({id:String(i),category:i<40?'bodas':'xv-anos'}));
  assert.equal(getPage(photos,new URLSearchParams()).items.length,24);
  const page = getPage(photos,new URLSearchParams('category=bodas&offset=24&limit=24'));
  assert.equal(page.total,40); assert.equal(page.items.length,16); assert.equal(page.nextOffset,null);
  assert.equal(getPage(photos,new URLSearchParams('limit=1000')).items.length,48);
  assert.throws(()=>getPage(photos,new URLSearchParams('offset=-1')));
  assert.throws(()=>getPage(photos,new URLSearchParams('category=unknown')));
});

test('gallery API builds a read-only, paginated Supabase request', async () => {
  const { buildSupabaseRequest } = await import('../api/gallery.mjs');
  assert.equal(typeof buildSupabaseRequest, 'function');
  const request = buildSupabaseRequest(
    'https://example.supabase.co',
    new URLSearchParams('category=bodas&offset=24&limit=24'),
  );
  const url = new URL(request);
  assert.equal(url.pathname, '/rest/v1/rodrigo_portfolio_photos');
  assert.equal(url.searchParams.get('category'), 'eq.bodas');
  assert.equal(url.searchParams.get('published'), 'eq.true');
  assert.equal(url.searchParams.get('offset'), '24');
  assert.equal(url.searchParams.get('limit'), '24');
  assert.equal(url.searchParams.get('order'), 'sort_order.asc');
});

test('contact endpoint never accepts or pretends to send unconfigured inquiries', async () => {
  assert.ok(existsSync('api/contact.mjs'), 'Missing Vercel contact function');
  const {default:handler}=await import('../api/contact.mjs');
  let status; let body;
  const response={setHeader(){},status(n){status=n;return this},json(value){body=value;return this}};
  handler({method:'POST'},response);
  assert.equal(status,503); assert.equal(body.sent,false);
});
