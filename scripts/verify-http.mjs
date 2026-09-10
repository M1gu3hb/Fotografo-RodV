import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { getPageData } from './page-data.mjs';

const base = process.argv[2] || 'http://127.0.0.1:4173';
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
const routes = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname);
const gallery = JSON.parse(readFileSync('data/gallery.json', 'utf8'));
const errors = []; const assets = new Set(gallery.flatMap(p => p.versions.map(v => v.src)));
async function pooled(items, run) {
  let index = 0;
  await Promise.all(Array.from({ length: 12 }, async () => {
    while (index < items.length) {
      const item = items[index++];
      try { await run(item); } catch (error) { errors.push(`${item}: ${error.message}`); }
    }
  }));
}
await pooled(routes, async path => {
  const response = await fetch(base + path); const html = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const match = html.match(/<script id="page-data" type="application\/json">(.*?)<\/script>/s);
  if (!match) throw new Error('Missing prerendered page data');
  const data = JSON.parse(match[1]); const expected = getPageData(path);
  if (data.category !== expected.category || data.offset !== expected.offset) throw new Error('Wrong prerendered route');
  if ((html.match(/<h1[ >]/g) || []).length !== 1) throw new Error('Invalid heading hierarchy');
  for (const match of html.matchAll(/(?:src|href)="(\/[^"#]*?)"/g)) {
    if (/\.[a-z0-9]+$/i.test(match[1])) assets.add(match[1]);
  }
});
await pooled([...assets], async path => {
  const response = await fetch(base + path, { method: 'HEAD', signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (path.endsWith('.webp') && !response.headers.get('content-type')?.includes('image/webp')) throw new Error('Wrong image MIME type');
});
for (const category of ['todas', 'bodas', 'xv-anos', 'retratos']) {
  const response = await fetch(`${base}/api/gallery?category=${category}&offset=24&limit=24`);
  const data = await response.json();
  if (!response.ok || data.total !== gallery.filter(p => category === 'todas' || p.category === category).length || data.items.length > 24) errors.push(`API ${category}`);
}
const invalid = await fetch(`${base}/api/gallery?category=invalid`);
if (invalid.status !== 400) errors.push('Invalid category accepted');
const contact = await fetch(`${base}/api/contact`, { method: 'POST' });
if (contact.status !== 503 || (await contact.json()).sent !== false) errors.push('Contact pretends to send');
const result = { base, routes: routes.length, assets: assets.size, errors };
mkdirSync('output', { recursive: true });
writeFileSync(`output/http-${base.includes('127.0.0.1') ? 'local' : 'production'}.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
process.exitCode = errors.length ? 1 : 0;
