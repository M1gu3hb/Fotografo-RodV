# Registro completo del proyecto

## Objetivo

**The Best Moment** es el sitio profesional del fotógrafo Rodrigo Vargas. Debe comunicar confianza, sensibilidad editorial y calidad fotográfica, mostrar bodas, XV años, retratos y otros eventos, explicar los paquetes 2026 y convertir visitas en consultas por WhatsApp.

El proyecto comenzó como una landing y evolucionó a un sitio multipágina completo con portada, portafolio filtrable, seis páginas de paquete, experiencia, fotolibros, SEO, backend de metadatos en Supabase y despliegue integral en Vercel.

## Resultado vigente

- Portada editorial con splash de marca, hero fotográfico, secuencias visuales, colecciones, selector de paquetes y llamada a la acción.
- Portafolio completo con filtros para todas, bodas, XV años y retratos; paginación, carga progresiva y visor accesible.
- Seis paquetes: Básico, Bronce, Plata, Oro, Élite 1 y Élite 2.
- Página individual para cada paquete y comparación clara de cobertura, video, impresos y sesiones.
- Página de experiencia con las etapas de una cobertura.
- Página de fotolibros.
- Formulario breve con selectores diseñados, opción de otro evento y envío del mensaje preparado a WhatsApp.
- SEO prerenderizado para todas las rutas, incluyendo canónicos, Open Graph, Twitter Cards, datos estructurados, sitemap y robots.
- Galería respaldada por Supabase con fallback local para resiliencia y compilación reproducible.

## Criterios visuales y de experiencia

- Estética editorial limpia, elegante y fotográfica.
- Tipografía estable en todos los dispositivos: Cormorant Garamond para títulos y Manrope para interfaz y texto funcional.
- Movimiento suave y legible: revelados, desplazamientos, cambios de fotografía y pequeños gestos de navegación.
- Respeto de `prefers-reduced-motion`.
- En teléfono se diseñó una experiencia propia, no una reducción mecánica del escritorio: hero completo, reel vertical, controles táctiles de paquetes, filtros persistentes en portafolio y secuencia de experiencia apilada.
- Las tarjetas de colecciones rotan sus fotos de manera secuencial para que el flash no ocurra en las tres al mismo tiempo.
- En escritorio los elementos fotográficos responden al hover sin alterar el recorrido móvil.

## Fotografía y calidad

El catálogo público contiene 807 fotografías: 462 bodas, 332 XV años y 13 retratos. Sus 2.067 derivados WebP ocupan 597.577.692 bytes. Las versiones se generan respetando el tamaño nativo, sin interpolar hacia arriba, sin EXIF/XMP y con variantes para carga responsiva.

Las fotografías que originalmente eran pliegos de fotolibro se extrajeron y recortaron de manera individual. El importador del PDF 2026 usa los JPEG incrustados, no rasteriza páginas, aplica 62 rectángulos revisados, descarta separadores y compara duplicados con hashes perceptuales y SIFT. Se publicaron 57 recortes nuevos y se descartaron 5 coincidencias. El informe reproducible está en `data/pdf-import-report.json`.

Los placeholders de hasta 24 px permiten una transición controlada. La fotografía entra borrosa, recibe un flash radial desde el centro y queda nítida. La implementación evita el pintado visible de arriba hacia abajo.

## Paquetes y contenido comercial

Los datos reales están en `src/data/packages.json` y proceden de `PDF THE BEST MOMENTS 2026.pdf`. No inventar beneficios, precios o entregables fuera de esa fuente. El selector de portada destaca diferencias sin presentar los paquetes iniciales como opciones inferiores. Cada paquete enlaza directamente a su página de detalle.

La navegación anterior/siguiente respeta los extremos de la lista. El CTA principal no depende de que el visitante lea todas las secciones: construye una consulta con nombre, tipo de evento, paquete, fecha y mensaje, y abre WhatsApp.

## Backend y límites de seguridad

Supabase se comparte con otros proyectos. Este sitio sólo usa `public.rodrigo_portfolio_photos`. Las migraciones habilitan RLS y otorgan a `anon` y `authenticated` lectura de filas `published = true`. No hay escritura pública ni almacenamiento de formularios.

`api/gallery.mjs` acepta únicamente `GET`, valida categoría, limita a 48 elementos por petición y consulta Supabase si existen credenciales. Si Supabase no responde, utiliza `data/gallery.json`. `api/contact.mjs` publica la configuración de contacto mediante `GET`; `POST` devuelve 503 deliberadamente porque el flujo ocurre en el cliente hacia WhatsApp.

No subir `.env.local`, tokens, claves de Supabase, credenciales de Vercel, originales privados, perfiles de navegador ni material de trabajo local.

## Marca definitiva

La identidad aprobada para entrega está en `brand/`. El símbolo se compone de cuatro esquinas de enfoque, una cruz central y un rombo inclinado a 45 grados. El wordmark combina `THE BEST` en altas con `Moment` en serif.

Hay dos GIF definitivos:

- `brand/logos/the-best-moment-symbol-animated.gif`: animación del símbolo; el cuadrado central termina girando hasta convertirse en el rombo definitivo.
- `brand/logos/the-best-moment-lockup-animated.gif`: formación del símbolo seguida por la aparición de `THE BEST` y construcción de `Moment`.

Los archivos SVG y PNG negros/blancos son los masters de uso. Los cuatro mockups finales muestran la marca integrada en fotolibro y caja, papelería y entrega, correa y estuche de cámara, y señalización de estudio. `brand/The-Best-Moment-Brand-Def.zip` reúne la entrega portable.

Las propuestas alternativas anteriores, sus GIF y los mockups antiguos se consideran descartados. No deben presentarse a Rodrigo como opciones vigentes.

## Estado de aceptación

La experiencia móvil fue aprobada como terminada y el splash fue aprobado explícitamente. El último ajuste del sitio refinó la presentación de escritorio. La rama `main` es el estado canónico para cualquier trabajo posterior. Antes de alterar una interacción existente, verificar la versión publicada y conservar la experiencia aceptada.

## Infraestructura conocida

- Repositorio: `M1gu3hb/Fotografo-RodV`.
- Rama de producción: `main`.
- URL: `https://the-best-moment.vercel.app`.
- Vercel project ID: `prj_Eq3W3EfbXAVK0hvM5eMtzv1SfSTf`.
- Vercel org ID: `team_pSE0TmK8p4NCa4co6nf8XTGq`.
- Supabase project ref: `vuzyhbiwnnngeohysxcw`.
- WhatsApp de Rodrigo: `+52 56 3523 0049`.

Los identificadores anteriores permiten localizar los recursos, pero no son secretos ni sustituyen las credenciales del propietario.

## Fuentes de referencia incluidas

`source-material/PDF THE BEST MOMENTS 2026.pdf` es la fuente entregada por Rodrigo para paquetes, prestaciones y fotolibros. `source-material/Ejemplo.mp4` es el recorrido del sitio anterior que se usó como referencia de ritmo y animaciones, sin copiar su plantilla. Ambos quedan en GitHub para que una sesión remota conserve el contexto que antes sólo existía en la computadora local. Están excluidos del despliegue de Vercel.
