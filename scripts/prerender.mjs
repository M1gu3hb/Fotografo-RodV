import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { render } from '../.render/entry-server.js';
import { getPageData, serializePage } from './page-data.mjs';

const base = 'https://the-best-moment.vercel.app';
const template = readFileSync('dist/index.html', 'utf8');
const site = JSON.parse(readFileSync('src/data/site.json', 'utf8'));
const routes = ['/'];
for (const c of [{ slug: 'todas', total: site.total }, ...site.collections]) {
  const path = c.slug === 'todas' ? '/portafolio' : `/colecciones/${c.slug}`;
  routes.push(path);
  for (let page = 2; page <= Math.ceil(c.total / 24); page++) routes.push(`${path}/pagina/${page}`);
}
for (const path of routes) {
  const data = getPageData(path);
  const collection = site.collections.find(c => c.slug === data.category);
  const title = path === '/' ? 'The Best Moment | Fotografía por Rodrigo Vargas' : `${collection?.title || 'Portafolio'}${data.offset ? ` · Página ${data.offset / 24 + 1}` : ''} | The Best Moment`;
  const description = collection?.description || 'Fotografía por Rodrigo Vargas. Explora bodas, XV años y retratos, y descubre una forma personal de conservar tus historias.';
  const canonical = base + (path === '/' ? '/' : path);
  const head = `<link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" /><meta property="og:locale" content="es_MX" />
    <meta property="og:site_name" content="The Best Moment" /><meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" /><meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${base}/brand/social.jpg" /><meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="The Best Moment. Fotografía por Rodrigo Vargas." />
    <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" /><meta name="twitter:image" content="${base}/brand/social.jpg" />
    <script type="application/ld+json">${JSON.stringify({ '@context':'https://schema.org', '@type':'WebSite', name:'The Best Moment', url:base, inLanguage:'es', creator:{'@type':'Person',name:'Rodrigo Vargas'} })}</script>`;
  let html = template.replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`)
    .replace('</head>', head + '</head>')
    .replace('<div id="root"></div>', `<div id="root">${render(data)}</div><script id="page-data" type="application/json">${serializePage(data)}</script>`);
  const filename = path === '/' ? 'dist/index.html' : `dist${path}/index.html`;
  mkdirSync(dirname(filename), { recursive:true }); writeFileSync(filename,html);
}
writeFileSync('dist/robots.txt',`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${base}/sitemap.xml\n`);
writeFileSync('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(path=>`<url><loc>${base}${path}</loc></url>`).join('')}</urlset>`);
writeFileSync('dist/404.html','<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>Página no encontrada | The Best Moment</title><body style="font-family:Georgia,serif;padding:10vh 8vw;background:#fff;color:#111"><p>THE BEST MOMENT</p><h1>Esta página no está en el archivo.</h1><p><a href="/">Volver al inicio</a> · <a href="/portafolio">Explorar fotografías</a></p></body></html>');
console.log(`Prerendered ${routes.length} routes with indexable photos and individual metadata.`);
