import { readFileSync } from 'node:fs';

const curation = JSON.parse(readFileSync(new URL('../data/curation.json', import.meta.url), 'utf8'));

function curate(items, category) {
  const preferredIds = curation[category];
  if (!preferredIds) return items;
  const preferred = new Map(preferredIds.map((id, index) => [id, index]));
  return [...items].sort((a, b) => {
    const aRank = preferred.has(a.id) ? preferred.get(a.id) : Number.MAX_SAFE_INTEGER;
    const bRank = preferred.has(b.id) ? preferred.get(b.id) : Number.MAX_SAFE_INTEGER;
    return aRank - bRank;
  });
}

export function getPage(photos, params) {
  const category = params.get('category') || 'todas';
  const offset = Number(params.get('offset') || 0);
  const requestedLimit = Number(params.get('limit') || 24);
  if (!['todas', 'bodas', 'xv-anos', 'retratos'].includes(category) ||
      !Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(requestedLimit) || requestedLimit < 1) {
    throw new Error('Parámetros de colección inválidos.');
  }
  const limit = Math.min(48, requestedLimit);
  const filtered = curate(category === 'todas' ? photos : photos.filter(photo => photo.category === category), category);
  const items = filtered.slice(offset, offset + limit);
  return { items, total: filtered.length, nextOffset: offset + items.length < filtered.length ? offset + items.length : null };
}

function parseRequest(params) {
  const category = params.get('category') || 'todas';
  const offset = Number(params.get('offset') || 0);
  const requestedLimit = Number(params.get('limit') || 24);
  if (!['todas', 'bodas', 'xv-anos', 'retratos'].includes(category) ||
      !Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(requestedLimit) || requestedLimit < 1) {
    throw new Error('Parámetros de colección inválidos.');
  }
  return { category, offset, limit: Math.min(48, requestedLimit) };
}

export function buildSupabaseRequest(base, params) {
  const { category, offset, limit } = parseRequest(params);
  const url = new URL('/rest/v1/rodrigo_portfolio_photos', base);
  url.searchParams.set('select', 'id,category,alt,width,height,versions,placeholder,source_ref');
  url.searchParams.set('published', 'eq.true');
  if (category !== 'todas') url.searchParams.set('category', `eq.${category}`);
  url.searchParams.set('order', 'sort_order.asc');
  url.searchParams.set('offset', String(offset));
  url.searchParams.set('limit', String(limit));
  return url.toString();
}

async function getSupabasePage(params) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  const parsed = parseRequest(params);
  const request = async ({ ids, excludeIds, offset, limit }) => {
    const requestUrl = new URL('/rest/v1/rodrigo_portfolio_photos', url);
    requestUrl.searchParams.set('select', 'id,category,alt,width,height,versions,placeholder,source_ref');
    requestUrl.searchParams.set('published', 'eq.true');
    if (parsed.category !== 'todas') requestUrl.searchParams.set('category', `eq.${parsed.category}`);
    if (ids?.length) requestUrl.searchParams.set('id', `in.(${ids.join(',')})`);
    if (excludeIds?.length) requestUrl.searchParams.set('id', `not.in.(${excludeIds.join(',')})`);
    requestUrl.searchParams.set('order', 'sort_order.asc');
    requestUrl.searchParams.set('offset', String(offset));
    requestUrl.searchParams.set('limit', String(Math.max(1, limit)));
    const response = await fetch(requestUrl, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact' },
      signal: AbortSignal.timeout(8000),
    });
    const range = response.headers.get('content-range') || '0-0/0';
    const total = Number(range.split('/')[1]);
    if (response.status === 416 && Number.isSafeInteger(total) && total >= 0) return { rows: [], total };
    if (!response.ok) throw new Error(`Supabase respondió ${response.status}`);
    return { rows: await response.json(), total: Number.isSafeInteger(total) && total >= 0 ? total : 0 };
  };

  const preferredIds = curation[parsed.category];
  if (preferredIds) {
    const selectedIds = parsed.offset < preferredIds.length ? preferredIds.slice(parsed.offset, parsed.offset + parsed.limit) : [];
    const selected = selectedIds.length ? await request({ ids: selectedIds, offset: 0, limit: selectedIds.length }) : { rows: [], total: 0 };
    const selectedById = new Map(selected.rows.map((row) => [row.id, row]));
    const orderedSelected = selectedIds.map((id) => selectedById.get(id)).filter(Boolean);
    const remainingNeeded = Math.max(0, parsed.limit - orderedSelected.length);
    const remainingOffset = Math.max(0, parsed.offset - preferredIds.length);
    const remaining = await request({ excludeIds: preferredIds, offset: remainingOffset, limit: remainingNeeded });
    const rows = [...orderedSelected, ...(remainingNeeded ? remaining.rows.slice(0, remainingNeeded) : [])];
    const items = rows.map(({ source_ref, ...photo }) => ({ ...photo, sourceRef: source_ref }));
    const total = preferredIds.length + remaining.total;
    return { items, total, nextOffset: parsed.offset + items.length < total ? parsed.offset + items.length : null };
  }

  const response = await request({ offset: parsed.offset, limit: parsed.limit });
  const items = response.rows.map(({ source_ref, ...photo }) => ({ ...photo, sourceRef: source_ref }));
  return { items, total: response.total, nextOffset: parsed.offset + items.length < response.total ? parsed.offset + items.length : null };
}

let photos;
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  try {
    const params = new URL(req.url, 'https://the-best-moment.vercel.app').searchParams;
    const remote = await getSupabasePage(params);
    photos ??= remote ? null : JSON.parse(readFileSync(new URL('../data/gallery.json', import.meta.url), 'utf8'));
    const page = remote || getPage(photos, params);
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(page);
  } catch (error) {
    if (error.message === 'Parámetros de colección inválidos.') return res.status(400).json({ error: error.message });
    return res.status(500).json({ error: 'No se pudo cargar la colección.' });
  }
}
