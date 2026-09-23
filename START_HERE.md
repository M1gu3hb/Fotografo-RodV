# Continuación directa del proyecto — The Best Moment

Este archivo es el punto de entrada para continuar el proyecto en otro chat o equipo. El estado de `main` es la fuente de verdad. Lee también `docs/PROJECT_HANDOFF.md`, `docs/ARCHITECTURE.md`, `docs/FILEMAP.md`, `docs/BRAND_PRODUCTION.md` y `docs/OPERATIONS.md` antes de modificar producción.

## Estado actual

- Producción: https://the-best-moment.vercel.app
- GitHub: https://github.com/M1gu3hb/Fotografo-RodV
- Vercel: proyecto `the-best-moment`.
- Supabase: proyecto compartido **Mis proyectos**, referencia `vuzyhbiwnnngeohysxcw`.
- Backend aislado del fotógrafo: tabla `public.rodrigo_portfolio_photos`.
- Identidad actual: los PNG aprobados de `brand/logos/` y ocho propuestas GIF (cuatro horizontales y cuatro apiladas); la horizontal es la principal. Los mockups antiguos requieren revisión con la nueva wordmark.
- El material de rebranding descartado y la antigua carpeta local `brand 0` no forman parte del repositorio ni deben recuperarse como propuesta vigente.

## Decisiones que deben conservarse

1. La experiencia móvil fue revisada y aprobada expresamente. No rehacerla de forma general; cualquier cambio debe ser puntual y verificarse en teléfono real.
2. El splash de entrada fue aprobado y debe conservarse.
3. La dirección visual es editorial, profesional y sobria: marfil, negro y acentos cálidos; movimiento con intención, sin efectos extravagantes.
4. Las fotografías son el producto. No degradar su calidad, no ampliarlas artificialmente y no mostrar pliegos de fotolibro con varias fotos como una sola imagen. Los recortes individuales ya están incorporados.
5. El revelado fotográfico usa blur, flash radial desde el centro y aparición nítida. En escritorio el blur se sostiene aproximadamente 0,7 s.
6. Los paquetes son seis y provienen del catálogo 2026. La navegación entre paquetes tiene límites; `Élite 2` no debe enlazar circularmente a `Básico` como “siguiente”.
7. El formulario de contacto prepara un mensaje y abre WhatsApp al número de Rodrigo. No guarda datos personales.
8. Supabase es un proyecto compartido. No tocar tablas, funciones, políticas o datos ajenos a `rodrigo_portfolio_photos`.
9. Vercel aloja el sitio, las funciones y las imágenes. Supabase almacena únicamente metadatos públicos de la galería; no se usa Supabase Storage.
10. La marca definitiva es el símbolo de cuatro esquinas de enfoque, cruz central y rombo inclinado, acompañado por `THE BEST` y `Moment`. Las propuestas alternativas anteriores quedaron descartadas.

## Primeros pasos en una nueva sesión

```powershell
git clone https://github.com/M1gu3hb/Fotografo-RodV.git
cd Fotografo-RodV
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Para trabajo local con Supabase, crear `.env.local` sin subirlo a Git y definir las variables documentadas en `.env.example`. El sitio funciona sin ellas mediante `data/gallery.json`, aunque producción debe mantenerlas en Vercel.

## Prioridad al retomar

No hay una corrección funcional pendiente registrada al momento de este traspaso. El código actual de `main` representa el último estado del sitio. Antes de iniciar una nueva mejora, abrir producción en escritorio y teléfono, comparar con el diseño actual y mantener las decisiones anteriores. La siguiente fase probable es integrar la identidad definitiva de `brand/` en el sitio sólo cuando el usuario lo solicite.
