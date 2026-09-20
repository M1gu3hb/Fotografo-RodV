import { readFileSync } from 'node:fs';
export function getPageData(pathname) {
  const site = JSON.parse(readFileSync('src/data/site.json', 'utf8'));
  const photos = JSON.parse(readFileSync('data/gallery.json', 'utf8'));
  const packages = JSON.parse(readFileSync('src/data/packages.json', 'utf8'));
  const segments = pathname.split('/').filter(Boolean);
  let kind = 'home';
  let category = 'inicio';
  let packageSlug = null;
  if (segments[0] === 'colecciones') {
    kind = 'gallery'; category = segments[1];
  } else if (segments[0] === 'portafolio') {
    kind = 'gallery'; category = 'todas';
  } else if (segments[0] === 'paquetes') {
    kind = segments[1] ? 'package' : 'packages'; packageSlug = segments[1] || null;
  } else if (segments[0] === 'experiencia' && segments.length === 1) {
    kind = 'experience';
  } else if (segments[0] === 'fotolibros' && segments.length === 1) {
    kind = 'photobooks';
  } else if (segments.length) {
    throw new Error('Not found');
  }
  if (kind === 'gallery' && !['todas', ...site.collections.map(c => c.slug)].includes(category)) throw new Error('Not found');
  if (kind === 'package' && !packages.some(item => item.slug === packageSlug)) throw new Error('Not found');
  const pageIndex = segments.indexOf('pagina');
  const number = pageIndex >= 0 ? Number(segments[pageIndex + 1]) : 1;
  const filtered = category === 'todas' ? photos : kind === 'gallery' ? photos.filter(p => p.category === category) : [];
  const offset = (number - 1) * 24;
  if (!Number.isSafeInteger(number) || number < 1 || (kind === 'gallery' && offset >= filtered.length)) throw new Error('Not found');
  const needsEditorialPhotos = ['home', 'packages', 'package', 'experience', 'photobooks'].includes(kind);
  const compactSite = { ...site, initial: needsEditorialPhotos ? site.initial.slice(0,12) : [], collections: site.collections.map(c => ({ ...c, initial: [] })) };
  return { site: compactSite, kind, category, packageSlug, items: filtered.slice(offset, offset + 24), total: filtered.length, offset };
}
export function serializePage(page) { return JSON.stringify(page).replaceAll('<', '\\u003c'); }
