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

let photos;
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  try {
    photos ??= JSON.parse(readFileSync(new URL('../data/gallery.json', import.meta.url), 'utf8'));
    const page = getPage(photos, new URL(req.url, 'https://the-best-moment.vercel.app').searchParams);
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(page);
  } catch (error) {
    if (error.message === 'Parámetros de colección inválidos.') return res.status(400).json({ error: error.message });
    return res.status(500).json({ error: 'No se pudo cargar la colección.' });
  }
}
