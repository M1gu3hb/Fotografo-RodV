# Producción de la marca definitiva

## Identidad canónica

La única marca vigente es la contenida en `brand/`. Su símbolo tiene cuatro esquinas abiertas de enfoque, líneas centrales en cruz y un rombo inclinado. El lockup horizontal coloca el símbolo a la izquierda, `THE BEST` arriba y `Moment` como palabra dominante. Hay versiones negras, blancas, horizontales, apiladas y separadas.

Los PNG aprobados de septiembre de 2026 son la referencia visual vigente. El SVG del símbolo sigue vigente; los tres SVG con la antigua tipografía se retiraron hasta poder preparar trazados fieles al PNG aprobado. Los GIF son piezas de presentación y no sustituyen los originales estáticos.

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

## Archivo histórico: animación anterior del lockup

El GIF antiguo `the-best-moment-lockup-animated.gif` se retiró tras aprobarse la nueva wordmark.

Las cuatro propuestas actuales se entregan en formatos horizontal y apilado en `brand/logos/`, enumeradas del 01 al 04. La horizontal es el logo principal. La 03 horizontal se reproduce al interactuar con la marca en el encabezado, y la 01 horizontal aparece en el splash. Aún falta elegir cuál de las cuatro animaciones será la definitiva de la marca.

Secuencia:

1. Se forma el símbolo usando los fotogramas del GIF individual.
2. La wordmark se anima de cuatro maneras: revelado editorial, letras en secuencia, enfoque fotográfico y encuentro tipográfico.
3. Todas terminan en el PNG aprobado de su respectivo lockup antes de salir.

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

`brand/The-Best-Moment-Brand-Def.zip` reúne los PNG aprobados, el símbolo vectorial y animado, las ocho propuestas GIF y esta guía. Los mockups conceptuales anteriores se conservan en el repositorio pero se excluyen de la entrega mientras se revisan con la nueva wordmark.
