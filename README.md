# The Best Moment — Rodrigo Vargas

Portafolio editorial en React, TypeScript y Vite. Producción: https://the-best-moment.vercel.app. Repositorio existente: M1gu3hb/Fotografo-RodV. Node.js 24.

## Ejecutar y verificar

```powershell
npm ci
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run preview -- --host 127.0.0.1
```

El build prerenderiza la portada, colecciones y todas sus páginas. El servidor local reproduce las dos API de Vercel para probar la paginación. No requiere base de datos, almacenamiento contratado ni servicios externos.

## Estructura

- `src/App.tsx`: portada, marca, servicios, paquetes y contacto.
- `src/Gallery.tsx`: galería de 24 fotos por página y visor accesible.
- `src/config/contact.json`: correo, teléfono, WhatsApp, Instagram y ubicación. Los valores nulos ocultan los canales; no existe un envío simulado. Completar destinos reales y reconstruir. WhatsApp debe ser un enlace HTTPS de wa.me.
- `src/data/site.json`: selección de portada y resúmenes generados.
- `data/gallery.json`: catálogo completo utilizado por prerender y la función de Vercel.
- `api/gallery.mjs`: paginación y filtros, máximo 48 resultados por petición.
- `api/contact.mjs`: configuración pública; POST devuelve 503 y sent:false mientras no exista un servicio real de recepción.
- `public/photos`: únicamente derivados WebP revisados; nombres con hash del original y del recorte.
- `public/brand`: identidad, texturas de interfaz e imagen social.
- `scripts`: auditoría, recorte, deduplicación, exportación y prerender.
- `private-audit`: inventario nominal, coordenadas, pruebas y hojas de contacto locales. Está excluido de Git y Vercel.
- `output/playwright`: evidencia visual local, excluida de Git.

Los originales permanecen en la carpeta superior local `D:\MIS PROYECTOS\Rodrigo VF`, fuera de los recursos públicos. El script de auditoría omite el subdirectorio `site`. No añadir originales, videos, archivos .env ni inventarios privados al repositorio.

## Regenerar las fotografías existentes

Requiere Python y las dependencias de `scripts/requirements.txt`:

```powershell
python -m pip install -r scripts/requirements.txt
python scripts/audit-photos.py "D:\MIS PROYECTOS\Rodrigo VF"
python scripts/process-photos.py "D:\MIS PROYECTOS\Rodrigo VF"
python scripts/social-image.py
python scripts/report-inventory.py
python scripts/verify-photos.py
npm run build
```

El plan revisado `scripts/crop-plan.json` guarda nombre relativo, categoría, tipo y rectángulos normalizados `[izquierda, arriba, derecha, abajo]`. Se corrige EXIF, se convierte ICC a sRGB y se extraen las regiones; las versiones tienen lado largo máximo 480, 1200 y 2400 px, calidad WebP 88/92/94. Nunca se aumenta la resolución nativa. Se quitan EXIF/XMP/GPS y se aplica nitidez moderada únicamente al reducir. No se reconstruye detalle ni se usa relleno generativo.

`--resume` reutiliza candidatos locales; usar exclusivamente si no cambiaron originales, categorías ni coordenadas. Los archivos ya exportados se reutilizan por hash de contenido y recorte. La generación elimina solo derivados WebP propios que dejaron de estar referenciados. Cambiar la política de calidad exige incrementar `quality-v1` en el script para invalidar la caché.

## Añadir material

1. Copiar nuevos originales a una carpeta local fuera de `public` y ejecutar la auditoría. Conserva los ID existentes del plan: el orden del inventario puede cambiar al añadir archivos; conciliar por nombre y SHA256, asignando ID nuevos sin reutilizar los anteriores.
2. Revisar visualmente cada archivo. `detect-crops.py` genera propuestas en `private-audit`; no son aprobaciones automáticas. Incorporar al plan únicamente rectángulos limpios, categoría real y `reviewed:true`. Marcar lo ambiguo sin recortes. Nunca publicar una página compuesta completa como foto.
3. Generar con `--review-only`, revisar candidatos y duplicados; `deduplicate-photos.py` propone coincidencias geométricas. Revisar sus pares antes de aceptar `visual-duplicates.json`. `manual-duplicates.json` y `photo-exclusions.json` documentan decisiones adicionales. No ejecutar los scripts históricos `review-crops.py` y `refine-crops.py` sobre material nuevo: registran ajustes concretos de esta entrega.
4. Generar sin `--resume`, revisar hojas de contacto finales, verificar fotos y reconstruir. El inventario final JSON/CSV enlaza originales con recortes y duplicados; permanece privado.
5. Para una categoría nueva, actualizar la selección/definición de colecciones en `process-photos.py` y la lista de categorías permitidas en `api/gallery.mjs`; el prerender crea sus rutas a partir del manifiesto. Añadir cobertura de pruebas para el filtro.

## Contenido pendiente

Los paquetes Esencia, Historia y Legado están en `experiences` dentro de `src/App.tsx`. Son propuestas configurables: completar precios, cobertura, entregables y condiciones solo con datos aprobados por Rodrigo. Contacto aún pendiente: correo, teléfono, WhatsApp, Instagram y ubicación/área de servicio. No se ha confirmado dominio propio; el canónico usa el dominio existente de Vercel. Si cambia, actualizar `base` en `scripts/prerender.mjs`.

Confirmar derechos y consentimientos de publicación, especialmente de menores. No se muestran nombres de personas fotografiadas. Las muestras comerciales de cajas permanecen excluidas hasta aclarar procedencia. Ver `data/photo-report.json` y el inventario privado para los ID.

## Publicar en el proyecto existente

```powershell
npm ci
npm run lint
npm run typecheck
npm test
npm run build
vercel link --yes --project the-best-moment --scope mh-astral-systems
vercel deploy --prod --yes --scope mh-astral-systems
```

Integrar primero la rama verificada en `main` y subir al repositorio existente. Las funciones Node y los recursos estáticos se alojan en Vercel. No se usa Blob, base de datos externa ni backend fuera de Vercel. Los ~585 MB de derivados se mantienen en Git como pidió el cliente; la descarga inicial selecciona solo los tamaños necesarios, no el archivo completo. Evitar reexportaciones innecesarias que aumenten el historial Git.

## Entrega fotográfica

324 archivos encontrados; 195 imágenes reales, 3 videos y 126 auxiliares de sistema. 750 fotos publicadas: 405 bodas, 332 XV años y 13 retratos. De ellas 704 proceden de montajes y 46 son fotos sueltas. 5 archivos de imagen duplicados exactos y 154 regiones duplicadas (son métricas distintas, no sumarlas). Se descartó una región por resolución insuficiente y tres propuestas de recorte redundantes. Cero imágenes reales dañadas. Cero montajes publicados, incluso como producto.

28 fuentes tienen notas de revisión: 17 muestras comerciales, 8 portadas/texturas con texto y 3 páginas con fondos fusionados; de estas últimas se conservaron únicamente las fotografías con límites limpios. Originales de imagen: 1.620.439.720 bytes. Todos los archivos fuente: 2.763.493.769 bytes. Derivados de galería: 585.453.904 bytes. `data/verification.json` registra cantidad, peso y errores de la comprobación integral.

## Verificaciones de la entrega

- Instalación limpia, lint, TypeScript y tres pruebas automatizadas de API/portafolio.
- Build de cliente (67,09 kB gzip de JavaScript) y prerender de 65 rutas.
- Comprobación completa de 750 fotografías y 1.959 derivados: sin referencias ausentes, sin duplicados binarios públicos, sin EXIF/XMP y sin ampliación artificial.
- Rastreo HTTP local de 65 rutas y 1.963 recursos: cero errores. Repetible con `node scripts/verify-http.mjs [URL]`; resultados privados en `output`.
- Navegador a 320, 390, 768, 1440 y 1920 px: sin desbordamiento horizontal; menú móvil, Escape, flechas del visor, restauración de foco, paginación, últimas páginas y contacto verificados. Fotografías cargadas en móvil/tablet/escritorio sin fallos. Sin errores de JavaScript en estas pruebas.
- Las advertencias de duración de plugins de Vite corresponden a copiar los derivados al directorio de salida; no son errores del sitio.

Las versiones grandes conservan como máximo 2400 px en su lado largo. Algunos recortes de páginas impresas tienen menos resolución nativa: se conserva esa resolución, sin inventar detalles. Obtener archivos individuales originales permitiría mejorar esos casos en una futura actualización.

El plan `scripts/crop-plan.json` contiene nombres originales y se conserva localmente, excluido de Git para no identificar personas a través del repositorio público. Al trasladar el flujo de procesamiento a otra máquina, copiar ese plan junto con los originales por un canal privado. El sitio y su build funcionan desde el repositorio sin los originales ni ese plan; solo la regeneración fotográfica los requiere.
