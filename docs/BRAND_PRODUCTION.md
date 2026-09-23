# Producción de la marca definitiva

## Identidad canónica

La única marca vigente es la contenida en `brand/`. Su símbolo tiene cuatro esquinas abiertas de enfoque, líneas centrales en cruz y un rombo inclinado. El lockup horizontal coloca el símbolo a la izquierda, `THE BEST` arriba y `Moment` como palabra dominante. Hay versiones negras, blancas, horizontales, apiladas y separadas.

Los SVG son los masters escalables. Los PNG sirven para entrega rápida y aplicaciones raster. Los GIF son piezas de presentación; no sustituyen los masters.

## GIF 1: símbolo

Archivo: `brand/logos/the-best-moment-symbol-animated.gif`

- Lienzo: 800 × 800 px.
- Fondo: transparente.
- Duración total: 3.000 ms.
- Fotogramas: 69.
- Repetición: infinita.
- Estado final: coincide con el símbolo estático.

Secuencia:

1. Las cuatro esquinas de enfoque aparecen y se extienden desde sus extremos.
2. Las líneas centrales se aproximan al centro.
3. La forma central se arma inicialmente como un cuadrado.
4. El cuadrado gira 45 grados y termina como el rombo inclinado del logo definitivo.
5. El logo permanece completo el tiempo suficiente para reconocerlo antes de reiniciar.

La corrección decisiva respecto al borrador anterior fue el giro final del elemento central. El último fotograma debe conservar siempre el rombo, no un cuadrado recto.

## GIF 2: símbolo y wordmark

Archivo: `brand/logos/the-best-moment-lockup-animated.gif`

- Lienzo: 1.600 × 700 px.
- Fondo: transparente.
- Duración total: 4.400 ms.
- Fotogramas: 114.
- Repetición: infinita.
- Estado final: lockup horizontal completo.

Secuencia:

1. Se forma el símbolo con la misma lógica del GIF individual.
2. `THE BEST` entra con un desplazamiento corto y se asienta sobre la palabra principal.
3. `Moment` se construye de forma progresiva, letra por letra, manteniendo la métrica del lockup final.
4. Todo el conjunto permanece quieto antes del reinicio.

## Método de producción

Los dos GIF se construyeron de forma programática a partir de geometría y recursos finales de marca, usando un lienzo RGBA transparente. Cada elemento se animó con interpolación suavizada para mantener coordenadas exactas entre fotogramas. El centro, las esquinas y la tipografía comparten posiciones finales con las versiones estáticas. Después se cuantizaron los fotogramas a una paleta con transparencia y se exportaron con duraciones controladas y loop infinito.

Este método se eligió para evitar el movimiento involuntario típico de una secuencia de imágenes generadas independientemente. Si se actualiza un GIF, debe mantenerse un sistema único de coordenadas y comprobarse que el último fotograma se superponga con el PNG/SVG final.

## Comprobaciones recomendadas

1. Abrir el GIF en navegador y en un visor que respete transparencia.
2. Confirmar que no haya salto lateral entre fotogramas.
3. Verificar que el último fotograma del símbolo termine en rombo inclinado.
4. Comparar el último fotograma del lockup con `the-best-moment-horizontal-black.png`.
5. Revisar al menos dos ciclos completos para detectar parpadeos al reiniciar.
6. Conservar los GIF en color sólido; no introducir bordes borrosos ni artefactos de compresión.

## Mockups finales

- `00-mockup-collection.jpg`: lámina conjunta de presentación.
- `01-photobook-and-box.jpg`: fotolibros y caja de entrega.
- `02-stationery-and-delivery.jpg`: tarjetas, sobre y empaque digital.
- `03-camera-strap-and-case.jpg`: equipo y accesorios del fotógrafo.
- `04-studio-signage.jpg`: aplicación ambiental de estudio.

Los mockups fueron generados como escenas completas con la marca integrada en los materiales, iluminación y perspectiva. No son una capa plana colocada encima de una fotografía. Sirven para presentación conceptual; los SVG deben usarse al fabricar o imprimir piezas reales.

## Paquete de entrega

`brand/The-Best-Moment-Brand-Def.zip` contiene una copia portable de la marca definitiva. Cuando se modifique cualquier master, GIF o mockup, regenerar el ZIP para que coincida con el contenido visible de `brand/` y actualizar `brand/LEEME.txt`.
