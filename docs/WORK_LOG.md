# Registro de decisiones y evolución

Este registro resume las decisiones que dieron forma al estado actual. No es una lista de tareas pendientes: el código de `main` es el resultado vigente.

## Construcción inicial

- Se creó una dirección editorial profesional a partir del material fotográfico de Rodrigo y del sitio Wix mostrado en `source-material/Ejemplo.mp4`.
- Se definieron Cormorant Garamond y Manrope como familias tipográficas estables para evitar que el teléfono sustituyera la tipografía.
- Se organizó el sitio en portada, portafolio, paquetes, experiencia y fotolibros.
- El contacto se resolvió con un formulario breve que prepara una conversación de WhatsApp.

## Fotografía

- Se auditó un inventario amplio de bodas, XV años y retratos.
- Los pliegos con varias fotos dejaron de tratarse como una imagen final: se detectaron y recortaron sus fotografías internas.
- Se creó un pipeline WebP responsivo sin ampliación artificial y sin metadatos.
- Se sustituyó el pintado progresivo visible por placeholders, blur sostenido y flash radial central.
- El PDF 2026 se procesó mediante extracción de imágenes incrustadas y un plan de recorte reproducible.
- Se curaron mejores imágenes de XV años y se redujo la repetición visible en lugares destacados.

## Sitio completo y paquetes

- La landing inicial se convirtió en un sitio multipágina.
- Cada paquete recibió su página completa, imagen, propuesta, prestaciones y navegación.
- La navegación se corrigió para que los extremos no fueran circulares.
- La comparación visual destaca cobertura, video, impresos y sesiones.
- El selector de portada se hizo interactivo y directo: elegir un paquete permite abrir su detalle sin un segundo paso ambiguo.

## Interacción y teléfono

- Se rediseñó la portada móvil como experiencia vertical propia.
- El hero móvil usa fotografías completas y rotación con blur/flash.
- La historia visual se convirtió en un reel móvil y las colecciones rotan de forma secuencial.
- El selector de paquetes recibió controles táctiles, indicación de movimiento, etiqueta del paquete activo y precio más visible.
- Los filtros del portafolio se mantienen disponibles durante el recorrido en teléfono.
- La experiencia se presenta como una secuencia apilada y empalmada, sin convertir cada etapa en una tarjeta genérica.
- La versión móvil resultante fue aprobada expresamente y debe preservarse.

## Refinamiento de escritorio

- Se fortaleció la composición del hero sin alterar la versión móvil aprobada.
- La historia por fragmentos recibió respuesta al hover.
- Las colecciones de portada se compactaron para evitar un scroll excesivo.
- Se mantuvieron el ritmo editorial, los colores y el comportamiento profesional.

## Splash y marca

- Se incorporó un splash corto de entrada y fue aprobado.
- Después se exploraron varias propuestas de rebranding. Esas alternativas fueron descartadas.
- La decisión final fue conservar la identidad original de enfoque: cuatro esquinas, cruz central y rombo inclinado.
- Se corrigió el GIF del símbolo para que el centro termine inclinado.
- Se produjo un segundo GIF con el símbolo y la formación completa del wordmark.
- Se regeneraron mockups completos con la marca integrada en la escena, evitando superposiciones planas.

## Infraestructura

- Todo el frontend, funciones e imágenes quedó en Vercel.
- Supabase se usa como backend de metadatos dentro del proyecto compartido **Mis proyectos**.
- Se aisló la tabla `rodrigo_portfolio_photos`, se habilitó RLS y se limitó el acceso público a lectura de filas publicadas.
- Se añadieron prerender, sitemap, metadatos por ruta y datos estructurados.
- Se cubrieron con 25 pruebas los flujos críticos, la integridad del catálogo y los límites de seguridad de Supabase.

## Lo descartado

- Propuestas de logo alternativas numeradas y sus animaciones.
- Mockups antiguos con la marca colocada como capa plana.
- Navegación circular de paquetes.
- Pliegos multiphoto presentados como una sola fotografía.
- Selectores nativos sin diseño en el CTA.
- Experiencias móviles que dependían de hover o de un carrusel horizontal poco evidente.

No recuperar estos enfoques como si fueran trabajo pendiente. Sólo reconsiderarlos si el usuario lo pide de forma explícita.
