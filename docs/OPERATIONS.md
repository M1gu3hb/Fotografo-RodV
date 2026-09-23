# Operación, validación y despliegue

## Requisitos

- Node.js compatible con las dependencias fijadas en `package-lock.json`.
- Python para el pipeline fotográfico.
- Vercel CLI para despliegue manual.
- Acceso al proyecto Vercel y, cuando se actualicen metadatos, al proyecto compartido de Supabase.

## Desarrollo local

```powershell
npm ci
npm run dev
```

El fallback `data/gallery.json` permite trabajar sin credenciales de Supabase. Para probar el backend real, copiar `.env.example` a `.env.local` y completar valores locales. Nunca confirmar ese archivo.

## Variables

| Variable | Dónde | Uso |
| --- | --- | --- |
| `SUPABASE_URL` | Vercel y local opcional | Endpoint del proyecto compartido |
| `SUPABASE_PUBLISHABLE_KEY` | Vercel y local opcional | Lectura pública protegida por RLS |

No documentar ni copiar valores secretos al repositorio. Los tokens locales de Vercel se regeneran mediante autenticación y tampoco deben subirse.

## Verificación antes de publicar

```powershell
npm run lint
npm run typecheck
npm test
npm run build
python scripts/verify-photos.py
```

Después del build, comprobar al menos:

- portada en escritorio y teléfono;
- splash y hero;
- filtros persistentes de portafolio en móvil;
- selector táctil de paquetes;
- enlaces a las seis páginas de paquete;
- límites anterior/siguiente en Básico y Élite 2;
- formulario, opción “otro evento” y URL de WhatsApp;
- carga blur/flash/foto y movimiento reducido;
- sitemap, robots, canónicos y datos estructurados.

## Publicación

La rama `main` está conectada a producción. Un push puede disparar el despliegue automático. Para un despliegue manual:

```powershell
vercel deploy --prod --yes --scope mh-astral-systems
```

Vercel usa `npm run build`, publica `dist` y despliega las funciones de `api/`. Las fotografías bajo `/photos` reciben caché inmutable de un año.

## Cambios en fotografías

1. Mantener originales fuera de `public`.
2. Ejecutar auditoría y/o importación correspondiente.
3. Revisar recortes visualmente.
4. Regenerar manifiesto y placeholders.
5. Ejecutar `python scripts/verify-photos.py`.
6. Generar el seed de Supabase.
7. Aplicar únicamente cambios sobre `public.rodrigo_portfolio_photos`.
8. Verificar conteos y órdenes antes de publicar.

Comandos disponibles:

```powershell
npm run audit:photos
npm run generate:gallery
npm run verify:photos
npm run seed:supabase
```

## Supabase compartido

El proyecto **Mis proyectos** contiene otros productos. Antes de cualquier migración:

- inspeccionar el SQL;
- confirmar que todos los objetos tienen el prefijo/nombre `rodrigo_portfolio_photos`;
- no usar `DROP`, `TRUNCATE` ni políticas generales;
- no alterar roles o extensiones globales;
- comprobar RLS después del cambio;
- usar la clave pública sólo para lectura desde producción.

Las migraciones versionadas están en `supabase/migrations/`. El seed generado permanece fuera de Git porque puede ser voluminoso y se puede reproducir desde el manifiesto.

## Contacto

Los datos visibles se editan en `src/config/contact.json`. El número vigente es `+525635230049`. Si cambia, actualizar el JSON, ejecutar pruebas y verificar el enlace codificado de WhatsApp. No implementar almacenamiento de formularios sin una decisión explícita sobre privacidad y destino de los datos.

## Dominio y SEO

El dominio canónico actual es `https://the-best-moment.vercel.app`. Al conectar un dominio propio, actualizar la constante `base` de `scripts/prerender.mjs`, las referencias públicas que dependan de ella y volver a ejecutar el build. Después validar sitemap, canónicos, Open Graph y redirecciones.

## Recuperación

- Código: restaurar desde GitHub y `main`.
- Catálogo: `data/gallery.json` permite reconstruir la experiencia aunque Supabase esté temporalmente fuera de servicio.
- Metadatos: regenerar el seed desde el catálogo y aplicarlo sólo a la tabla del fotógrafo.
- Marca: restaurar desde `brand/` o el ZIP definitivo incluido.
- Producción: volver a desplegar el último commit validado en Vercel.
