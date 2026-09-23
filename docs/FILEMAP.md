# Mapa de archivos

```text
Fotografo-RodV/
├─ START_HERE.md                 Entrada para continuar el proyecto
├─ README.md                     Resumen, métricas y comandos principales
├─ docs/
│  ├─ PROJECT_HANDOFF.md         Contexto, decisiones y estado de aceptación
│  ├─ ARCHITECTURE.md            Capas, flujos, backend, rutas y SEO
│  ├─ FILEMAP.md                 Este mapa
│  ├─ BRAND_PRODUCTION.md        Marca y construcción de los GIF definitivos
│  ├─ OPERATIONS.md              Desarrollo, validación, despliegue y recuperación
│  └─ WORK_LOG.md                Evolución, decisiones y enfoques descartados
├─ brand/                        Entrega definitiva para Rodrigo
│  ├─ LEEME.txt
│  ├─ MANIFEST.sha256            Integridad de todos los archivos de entrega
│  ├─ The-Best-Moment-Brand-Def.zip
│  ├─ logos/                     Masters PNG/SVG, overview y dos GIF
│  └─ mockups/                   Cuatro escenas finales y colección
├─ api/
│  ├─ gallery.mjs                Galería paginada: Supabase + fallback JSON
│  └─ contact.mjs                Contacto público, sin almacenamiento de formularios
├─ data/
│  ├─ gallery.json               Catálogo reproducible de 807 fotografías
│  ├─ curation.json              Orden editorial
│  ├─ pdf-import-report.json     Resultado de la extracción del PDF
│  ├─ photo-report.json          Auditoría del catálogo
│  └─ verification.json          Resultado de verificación de derivados
├─ public/
│  ├─ brand/                     Recursos que usa actualmente el sitio
│  └─ photos/                    2.067 derivados WebP públicos
├─ source-material/
│  ├─ PDF THE BEST MOMENTS 2026.pdf  Fuente de paquetes y fotolibros
│  ├─ Ejemplo.mp4                Recorrido de referencia enviado por Rodrigo
│  └─ README.md                  Procedencia y uso de estas fuentes
├─ scripts/
│  ├─ page-data.mjs              Rutas y metadatos compartidos
│  ├─ prerender.mjs              SSR, HTML, sitemap, robots y 404
│  ├─ process-photos.py          Pipeline principal de fotografías
│  ├─ import-pdf-photos.py       Extracción sin rasterizado del PDF 2026
│  ├─ pdf-photo-plan.json        62 regiones de recorte revisadas
│  ├─ audit-photos.py            Auditoría de fuentes y derivados
│  ├─ verify-photos.py           Integridad, dimensiones y metadatos
│  ├─ generate-supabase-seed.mjs Generación de seed aislado
│  └─ ...                        Dedupe, placeholders, recortes e informes
├─ src/
│  ├─ App.tsx                    Shell, navegación, formulario y selectores
│  ├─ SitePages.tsx              Todas las páginas y piezas editoriales
│  ├─ Gallery.tsx                Archivo, carga progresiva y visor
│  ├─ Motion.tsx                 Animación y movimiento reducido
│  ├─ entry-server.tsx           Render SSR usado por prerender
│  ├─ main.tsx                   Entrada de navegador
│  ├─ styles.css                 Estilos globales y componentes
│  ├─ portfolio.css              Estilos específicos del archivo
│  ├─ fonts.css                  Tipografías
│  ├─ config/contact.json        WhatsApp y contacto público
│  └─ data/
│     ├─ packages.json           Seis paquetes 2026
│     └─ site.json               Contenido y fotografías destacadas
├─ supabase/migrations/
│  ├─ 20260916_rodrigo_portfolio_gallery.sql
│  └─ 20260916_rodrigo_portfolio_pdf_sources.sql
├─ tests/                        8 archivos de pruebas de producto e infraestructura
├─ vercel.json                   Configuración de producción
├─ package.json                  Scripts y dependencias
└─ vite.config.ts                Configuración Vite
```

## Componentes principales de `SitePages.tsx`

- `usePhotoCycle`: temporización de cambios fotográficos.
- `CycleVisual` y `ResponsiveCyclingPhoto`: transición responsiva blur/flash/foto.
- `MobileStoryReel`: recorrido móvil de la historia visual.
- `StoryRail`: secuencia editorial de imágenes.
- `PackageCard`, `PackageShowcase`, `PackageComparison`: descubrimiento y comparación de paquetes.
- `HeroIntro`: splash e introducción principal.
- `CollectionShowcase`: bodas, XV años y retratos.
- `HomePage`: composición de la portada.
- `EditorialHero`: cabecera de páginas internas.
- `PackagesPage`, `PackageDetailPage`, `ExperiencePage`, `PhotobooksPage`, `GalleryPage`: páginas completas.

## Archivos deliberadamente fuera de Git

- `.env*`, salvo `.env.example`.
- `.vercel/` y tokens locales.
- `node_modules/`, `dist/`, `.render/`.
- originales privados y material de trabajo.
- `tmp/`, `output/`, `private-audit/`, perfiles de navegador.
- seeds generados y archivos de revisión no públicos.
- la carpeta local histórica `brand 0` y todas las propuestas de rebranding descartadas.
