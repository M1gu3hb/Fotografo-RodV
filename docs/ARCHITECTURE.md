# Arquitectura

## Vista general

```mermaid
flowchart LR
  U[Visitante] --> V[Vercel CDN]
  V --> S[Sitio React prerenderizado]
  S --> G[/api/gallery]
  G --> DB[(Supabase: rodrigo_portfolio_photos)]
  G --> F[data/gallery.json fallback]
  S --> P[public/photos WebP]
  S --> W[WhatsApp]
```

El frontend se construye con React, TypeScript y Vite. La compilación crea el cliente, un render SSR temporal y 79 páginas HTML prerenderizadas. Vercel distribuye HTML, JavaScript, funciones y fotografías. Supabase mantiene sólo el catálogo público de metadatos.

## Capas

### Interfaz

- `src/main.tsx` inicia la aplicación en navegador.
- `src/App.tsx` resuelve la ruta, monta la navegación global, el menú móvil y el formulario de contacto.
- `src/SitePages.tsx` contiene las páginas y componentes editoriales principales.
- `src/Gallery.tsx` implementa consulta, paginación, imágenes progresivas y lightbox.
- `src/Motion.tsx` centraliza revelados y movimiento con soporte de accesibilidad.
- `src/styles.css`, `src/portfolio.css` y `src/fonts.css` definen el sistema visual y sus breakpoints.

### Contenido

- `src/data/packages.json`: verdad comercial de los seis paquetes.
- `src/data/site.json`: selección y textos editoriales de portada.
- `src/config/contact.json`: datos públicos de contacto.
- `data/gallery.json`: manifiesto completo de fotografías.
- `data/curation.json`: orden editorial sobre el catálogo generado.

### Backend en Vercel

- `api/gallery.mjs`: lectura de galería, filtros, paginación, Supabase y fallback.
- `api/contact.mjs`: configuración pública; rechaza escritura.
- `vercel.json`: build, funciones, caché de fotografías y cabeceras de seguridad.

### Supabase

Tabla exclusiva `public.rodrigo_portfolio_photos`:

| Campo | Función |
| --- | --- |
| `id` | Identificador estable de la foto |
| `category` | `bodas`, `xv-anos` o `retratos` |
| `alt` | Texto alternativo |
| `width`, `height` | Dimensiones de referencia |
| `versions` | Rutas y medidas de variantes WebP |
| `placeholder` | Versión mínima para transición |
| `source_ref` | Origen reproducible, incluido PDF |
| `sort_order` | Orden editorial |
| `published` | Control de visibilidad pública |
| timestamps | Auditoría de creación/actualización |

RLS limita la lectura pública a `published = true`. No existe una ruta pública de escritura.

## Rutas

- `/`
- `/paquetes`
- `/paquetes/basico`
- `/paquetes/bronce`
- `/paquetes/plata`
- `/paquetes/oro`
- `/paquetes/elite-1`
- `/paquetes/elite-2`
- `/experiencia`
- `/fotolibros`
- `/portafolio`
- `/portafolio/pagina/:numero`
- `/colecciones/bodas`
- `/colecciones/xv-anos`
- `/colecciones/retratos`
- rutas paginadas para cada colección

`scripts/page-data.mjs` es la fuente compartida de rutas y metadatos. `scripts/prerender.mjs` renderiza cada ruta, genera SEO y crea `sitemap.xml`, `robots.txt` y la página 404.

## Ciclo de fotografía

1. Los originales se auditan fuera de `public`.
2. Los scripts de Python detectan pliegos, recortan, deduplican y generan WebP responsivos.
3. `data/gallery.json` registra medidas, variantes y placeholders.
4. `data/curation.json` fija el orden editorial.
5. El seed de Supabase replica metadatos, no binarios.
6. Vercel sirve `public/photos` con caché inmutable de un año.
7. La interfaz elige la variante adecuada y aplica blur, flash central y revelado.

## SEO

El prerender añade títulos y descripciones por ruta, URL canónica, Open Graph, Twitter Cards y JSON-LD. Se generan `WebSite`, `ProfessionalService`, `BreadcrumbList` y `Service` donde corresponde. El dominio canónico está definido en `scripts/prerender.mjs`; debe actualizarse al conectar un dominio propio.

## Resiliencia

- Si faltan variables de Supabase o la consulta falla, la galería usa el manifiesto local.
- El formulario no depende de un servicio de correo: abre WhatsApp con un mensaje codificado.
- Las rutas se prerenderizan para que contenido y SEO no dependan de JavaScript inicial.
- `prefers-reduced-motion` desactiva o reduce los efectos que podrían molestar.
