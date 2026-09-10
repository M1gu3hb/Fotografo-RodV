import gallery from '../api/gallery.mjs';
import contact from '../api/contact.mjs';
export function localApi(req, res, next) {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (!['/api/gallery', '/api/contact'].includes(path)) return next();
  res.status = code => { res.statusCode = code; return res; };
  res.json = data => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); };
  return (path === '/api/gallery' ? gallery : contact)(req, res);
}
