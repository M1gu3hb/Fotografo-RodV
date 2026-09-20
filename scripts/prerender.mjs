import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { render } from '../.render/entry-server.js';
import { getPageData, serializePage } from './page-data.mjs';

const base = 'https://the-best-moment.vercel.app';
const template = readFileSync('dist/index.html', 'utf8');
const site = JSON.parse(readFileSync('src/data/site.json', 'utf8'));
const packages = JSON.parse(readFileSync('src/data/packages.json', 'utf8'));
const routes = ['/', '/paquetes', ...packages.map(item => `/paquetes/${item.slug}`), '/experiencia', '/fotolibros'];
for (const collection of [{ slug: 'todas', total: site.total }, ...site.collections]) {
  const path = collection.slug === 'todas' ? '/portafolio' : `/colecciones/${collection.slug}`;
  routes.push(path);
  for (let page = 2; page <= Math.ceil(collection.total / 24); page++) routes.push(`${path}/pagina/${page}`);
}

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function metadata(path, data) {
  const collection = site.collections.find(item => item.slug === data.category);
  const selectedPackage = packages.find(item => item.slug === data.packageSlug);
  if (selectedPackage) return {
    title: `Paquete ${selectedPackage.name} 2026 | The Best Moment`,
    description: `${selectedPackage.summary} Precio: $${selectedPackage.price.toLocaleString('es-MX')}. Fotografía por Rodrigo Vargas.`,
    crumbs: [['Paquetes', '/paquetes'], [selectedPackage.name, path]],
    service: selectedPackage,
  };
  if (path === '/paquetes') return {
    title: 'Paquetes de fotografía y video 2026 | The Best Moment',
    description: 'Compara seis paquetes de fotografía, video, photobooks, ampliaciones y sesiones para bodas y celebraciones.',
    crumbs: [['Paquetes', path]],
  };
  if (path === '/experiencia') return {
    title: 'Fotografía de boda paso a paso | The Best Moment',
    description: 'Conoce la cobertura de Getting Ready, First Look, sesión de novios, ceremonia y fiesta de Rodrigo Vargas.',
    crumbs: [['Experiencia', path]],
  };
  if (path === '/fotolibros') return {
    title: 'Photobooks y ampliaciones para bodas | The Best Moment',
    description: 'Consulta tamaños de photobook, hojas, minibooks y ampliaciones incluidos en los paquetes 2026.',
    crumbs: [['Fotolibros', path]],
  };
  if (data.kind === 'gallery') return {
    title: `${collection?.title || 'Portafolio'}${data.offset ? ` · Página ${data.offset / 24 + 1}` : ''} | The Best Moment`,
    description: collection?.description || 'Explora el portafolio completo de bodas, XV años y retratos de Rodrigo Vargas.',
    crumbs: collection ? [['Portafolio', '/portafolio'], [collection.title, path]] : [['Portafolio', path]],
  };
  return {
    title: 'The Best Moment | Fotografía por Rodrigo Vargas',
    description: 'Fotografía de bodas, XV años y retratos por Rodrigo Vargas. Explora el portafolio y los paquetes 2026.',
    crumbs: [],
  };
}

function structuredData(path, info) {
  const canonical = base + (path === '/' ? '/' : path);
  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${base}/#website`,
      name: 'The Best Moment',
      url: base,
      inLanguage: 'es-MX',
    },
    {
      '@type': 'ProfessionalService',
      '@id': `${base}/#business`,
      name: 'The Best Moment',
      url: base,
      image: `${base}/brand/social.jpg`,
      telephone: '+52 56 3523 0049',
      founder: { '@type': 'Person', name: 'Rodrigo Vargas' },
    },
  ];
  if (info.crumbs.length) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${base}/` },
        ...info.crumbs.map(([name, item], index) => ({
          '@type': 'ListItem',
          position: index + 2,
          name,
          item: base + item,
        })),
      ],
    });
  }
  if (info.service) {
    graph.push({
      '@type': 'Service',
      name: `Paquete ${info.service.name}`,
      description: info.service.description,
      url: canonical,
      provider: { '@id': `${base}/#business` },
      offers: {
        '@type': 'Offer',
        price: info.service.price,
        priceCurrency: 'MXN',
        url: canonical,
      },
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

for (const path of routes) {
  const data = getPageData(path);
  const info = metadata(path, data);
  const canonical = base + (path === '/' ? '/' : path);
  const title = escapeHtml(info.title);
  const description = escapeHtml(info.description);
  const head = `<link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" /><meta property="og:locale" content="es_MX" />
    <meta property="og:site_name" content="The Best Moment" /><meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" /><meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${base}/brand/social.jpg" /><meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="The Best Moment. Fotografía por Rodrigo Vargas." />
    <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" /><meta name="twitter:image" content="${base}/brand/social.jpg" />
    <script type="application/ld+json">${JSON.stringify(structuredData(path, info))}</script>`;
  const html = template.replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`)
    .replace('</head>', head + '</head>')
    .replace('<div id="root"></div>', `<div id="root">${render(data)}</div><script id="page-data" type="application/json">${serializePage(data)}</script>`);
  const filename = path === '/' ? 'dist/index.html' : `dist${path}/index.html`;
  mkdirSync(dirname(filename), { recursive: true });
  writeFileSync(filename, html);
}

writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${base}/sitemap.xml\n`);
writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(path => `<url><loc>${base}${path}</loc></url>`).join('')}</urlset>`);
writeFileSync('dist/404.html', '<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>Página no encontrada | The Best Moment</title><body style="font-family:Georgia,serif;padding:10vh 8vw;background:#fff;color:#111"><p>THE BEST MOMENT</p><h1>Esta página no está en el archivo.</h1><p><a href="/">Volver al inicio</a> · <a href="/portafolio">Explorar fotografías</a></p></body></html>');
console.log(`Prerendered ${routes.length} routes with individual metadata and structured data.`);
