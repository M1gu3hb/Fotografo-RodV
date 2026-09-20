# The Best Moment — Rodrigo Vargas

Sitio editorial multipágina en React, TypeScript y Vite. Producción: https://the-best-moment.vercel.app. Repositorio: `M1gu3hb/Fotografo-RodV`.

## Ejecutar y verificar

```powershell
npm ci
npm run lint
npm run typecheck
npm test
npm run build
python scripts/verify-photos.py
npm run preview -- --host 127.0.0.1
```

El build prerenderiza la portada, el índice de paquetes, las seis páginas de paquete, la experiencia, fotolibros, colecciones y toda su paginación. En producción, la función de galería de Vercel consulta una tabla aislada de Supabase; el manifiesto JSON es el respaldo local.

## Estructura

- `src/App.tsx`: navegación, menú móvil, formulario que prepara la consulta de WhatsApp y estructura global.
- `src/SitePages.tsx`: portada, selector fotográfico, comparación de paquetes, experiencia, fotolibros y archivo.
- `src/Motion.tsx`: revelados de texto y parallax acotado, con movimiento reducido.
- `src/Gallery.tsx`: galería paginada, carga progresiva y visor accesible.
- `src/data/packages.json`: contenido de los seis paquetes 2026.
- `src/config/contact.json`: teléfono y WhatsApp proporcionados en el catálogo.
- `data/gallery.json`: catálogo completo para prerender y función de Vercel.
- `data/curation.json`: orden editorial revisado de las fotografías destacadas por colección.
- `api/gallery.mjs`: paginación y filtros, máximo 48 resultados por petición.
- `public/photos`: derivados WebP sin metadatos ni ampliación artificial.
- `scripts/prerender.mjs`: rutas, metadatos, sitemap y datos estructurados.
- `supabase/migrations`: tabla exclusiva `rodrigo_portfolio_photos`, RLS y permisos de sólo lectura.

Los originales, videos y archivos de trabajo permanecen en la carpeta superior local `D:\MIS PROYECTOS\Rodrigo VF`, fuera de los recursos públicos. `tmp`, `private-audit`, `output`, archivos `.env` y lotes de carga están excluidos de Git o Vercel.

## Fotografías

La galería contiene 807 fotos: 462 bodas, 332 XV años y 13 retratos. Hay 2.067 derivados que pesan 597.577.692 bytes. La verificación integral confirma que no hay archivos ausentes, duplicados binarios públicos, EXIF/XMP ni imágenes ampliadas por código.

Las versiones existentes tienen lados largos máximos de 480, 1200 y 2400 px. Los recortes del PDF conservan su tamaño nativo y sólo generan anchos menores o iguales al original. Los placeholders WebP de hasta 24 px evitan el pintado visible; en escritorio permanecen 0,7 s, después un flash radial parte del centro y finalmente aparece la fotografía.

## Importar fotografías del PDF 2026

`scripts/import-pdf-photos.py` abre directamente los JPEG incrustados en el PDF. Aplica los 62 rectángulos revisados de `scripts/pdf-photo-plan.json`, elimina los separadores impresos y compara cada recorte contra el archivo existente con hashes perceptuales y SIFT. Nunca rasteriza la página ni aumenta resolución.

```powershell
python scripts/import-pdf-photos.py --dry-run --skip-dedupe
python scripts/import-pdf-photos.py
python scripts/verify-photos.py
```

Cinco coincidencias se descartaron y 57 fotos nuevas se publicaron. `data/pdf-import-report.json` documenta la operación.

## Backend aislado en Supabase

La tabla `public.rodrigo_portfolio_photos` vive en el proyecto compartido **Mis proyectos** (`vuzyhbiwnnngeohysxcw`). Contiene sólo metadatos públicos y rutas a imágenes servidas por Vercel. RLS permite leer filas con `published = true`; `anon` y `authenticated` tienen únicamente `SELECT`.

Estado verificado: 807 filas, 57 fuentes `pdf-*`, órdenes únicos de 0 a 806. No se modifican tablas, funciones ni políticas ajenas.

## Publicación

```powershell
npm run lint
npm run typecheck
npm test
npm run build
vercel deploy --prod --yes --scope mh-astral-systems
```

Vercel aloja el frontend, funciones y recursos estáticos. Supabase aporta el catálogo de metadatos con RLS. No se usa Supabase Storage.

## Verificación de esta entrega

- 23 pruebas automatizadas de rutas, paquetes, navegación, formulario de WhatsApp, SEO, API, movimiento, portafolio, curaduría y RLS.
- Build de cliente de 74,54 kB gzip de JavaScript y prerender de 79 rutas.
- Revisión en teléfono y escritorio: navegación, secuencia vertical, páginas internas, paquetes, fotolibros, carga progresiva y movimiento reducido.
- Metadatos únicos, canónicos, Open Graph, sitemap, `ProfessionalService`, `BreadcrumbList` y `Service` para paquetes.
- 807 filas verificadas en Supabase, con permisos públicos de sólo lectura.

El dominio canónico actual es `the-best-moment.vercel.app`. Si se conecta un dominio propio, actualizar `base` en `scripts/prerender.mjs`.
