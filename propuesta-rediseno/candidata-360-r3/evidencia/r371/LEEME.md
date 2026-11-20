# Evidencia R3.7.1 (parte de a90fdef / R3.7)

Rama `propuesta-rediseno-v3`. Sin push, merge ni deploy. Precios, garantías y servicios no se tocaron. No se agregaron funciones ni dependencias.

## Cambios
1. **GrowiWeb (P0)**: las capturas de página completa de las escenas (`ex-ribera-d/m`, `ex-barro-d/m`) se regeneraron sin la franja de «contenido ficticio» ni el botón «Activar animaciones». También las dos capturas de Centro Ribera que reutilizan Combo y la home (`ribera-m`, `ribera-d`). Se recalcularon las posiciones de la cámara por capítulo. Las demos completas **no se modificaron** (conservan su aviso obligatorio). En las escenas queda una única aclaración, fuera de los dispositivos: «Ejemplo ilustrativo» y «Proyecto de muestra».
2. **Invitaciones, transiciones (P0)**:
   - Al cambiar de estilo, el mundo que sale ya no vuelve a su portada: conserva la pantalla de confirmación mientras el siguiente se abre encima (causa de la mezcla casamiento/empresa en 390).
   - Las leyendas de la derecha dejan de superponerse: la que sale se oculta en 0,12 s y la que entra espera (causa del texto solapado en 1440).
3. **Invitaciones, cumpleaños (P1)**: portada de póster pop con un «30» macizo y sombra dura, globos que flotan, trama de puntos, sticker «¡Venite!» y dos cintas. Programa con borde dentado, hora en rosa, líneas punteadas y mapa en amarillo. Confirmación con botón de sombra dura. Mantiene los tres estilos y la reproducción automática. Se hizo solo con HTML/CSS: no se usó ninguna herramienta de generación de imágenes (es un servicio pago y no aportaba más que lo dibujado).

## Pruebas (390 y 1440 px)
| Prueba | Resultado |
|---|---|
| Transiciones de Invitaciones a 12 cuadros/s (2 ciclos de 36 s, 390 y 1440): tiras en `capturas/tira-transiciones-*.png` | Sin mezcla de mundos y sin leyendas superpuestas en las tres transiciones y en el cierre del ciclo |
| 4 capítulos × 2 sitios en GrowiWeb, 390 y 1440 | Sin avisos ni botones dentro de los dispositivos |
| Desborde horizontal y consola (web, invitaciones, combo, home; 390 y 1440) | 0 desbordes, 0 recortes de escena, 0 errores y 0 respuestas 4xx |
| Movimiento reducido (invitaciones y web) | Estado final estático, 0 animaciones infinitas, sin botón de pausa |
| Pausa/reanudación con teclado (Enter y Espacio) | Funciona en Invitaciones y GrowiWeb (la pausa mantiene el cuadro) |
| Staging `--release` + `--validate` | Paquete válido, 136 archivos |

## Observación pendiente (no corregida, fuera de alcance)
En Invitaciones, unos 6 s después de cargar, el foco del teclado pasa al iframe de «Probalas vos mismo» (galería de R3.3, sin cambios). No identifiqué un `focus()` en el código; puede ser un efecto de la carga diferida del iframe en el navegador automatizado. No verificado en un Chrome común ni en otros navegadores.

## Límites
- No se probó Safari/iOS ni teléfonos físicos. Los videos son grabaciones de Playwright, no piezas producidas.
- En `antes-despues-movil.png` la fila de cumpleaños compara el momento del ciclo, no el mismo cuadro (el «antes» muestra el programa del casamiento).
- El juicio sobre la dirección de arte del cumpleaños requiere ojo humano.

## Archivos
`antes-despues-escritorio.png`, `antes-despues-movil.png`, `capturas/`, `video/` (`inv-1440`, `inv-390`, `web-1440`, `web-390`, en MP4).
