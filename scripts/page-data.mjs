import { readFileSync } from 'node:fs';
export function getPageData(pathname) {
  const site = JSON.parse(readFileSync('src/data/site.json', 'utf8'));
  const photos = JSON.parse(readFileSync('data/gallery.json', 'utf8'));
  const segments = pathname.split('/').filter(Boolean);
  const category = segments[0] === 'colecciones' ? segments[1] : segments[0] === 'portafolio' ? 'todas' : 'inicio';
  if (!['inicio', 'todas', ...site.collections.map(c => c.slug)].includes(category)) throw new Error('Not found');
  const pageIndex = segments.indexOf('pagina');
  const number = pageIndex >= 0 ? Number(segments[pageIndex + 1]) : 1;
  const filtered = category === 'todas' ? photos : photos.filter(p => p.category === category);
  const offset = (number - 1) * 24;
  if (!Number.isSafeInteger(number) || number < 1 || (category !== 'inicio' && offset >= filtered.length)) throw new Error('Not found');
  const compactSite = { ...site, initial: [], collections: site.collections.map(c => ({ ...c, initial: [] })) };
  return { site: compactSite, category, items: filtered.slice(offset, offset + 24), total: filtered.length, offset };
}
export function serializePage(page) { return JSON.stringify(page).replaceAll('<', '\\u003c'); }
