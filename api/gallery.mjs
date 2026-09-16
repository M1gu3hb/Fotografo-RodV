import { readFileSync } from 'node:fs';

export function getPage(photos, params) {
  const category = params.get('category') || 'todas';
  const offset = Number(params.get('offset') || 0);
  const requestedLimit = Number(params.get('limit') || 24);
  if (!['todas', 'bodas', 'xv-anos', 'retratos'].includes(category) ||
      !Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(requestedLimit) || requestedLimit < 1) {
    throw new Error('Parámetros de colección inválidos.');
  }
  const limit = Math.min(48, requestedLimit);
  const filtered = category === 'todas' ? photos : photos.filter(photo => photo.category === category);
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
  const response = await fetch(buildSupabaseRequest(url, params), {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact' },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Supabase respondió ${response.status}`);
  const rows = await response.json();
  const range = response.headers.get('content-range') || '0-0/0';
  const total = Number(range.split('/')[1]) || 0;
  const { offset } = parseRequest(params);
  const items = rows.map(({ source_ref, ...photo }) => ({ ...photo, sourceRef: source_ref }));
  return { items, total, nextOffset: offset + items.length < total ? offset + items.length : null };
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
