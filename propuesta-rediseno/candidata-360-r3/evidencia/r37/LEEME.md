# Evidencia R3.7 (parte de 20f5dad / R3.6)

Rama `propuesta-rediseno-v3`. Sin push, merge ni deploy. Los workflows de publicación y de tipo de cambio no se tocaron. Los importes USD no cambiaron.

## Qué se corrigió (por prioridad)

**P0 · Estados pobres**
- **GrowiFlow**: los cuatro pasos (tarea manual → disparador → automatización → resultado) están siempre a la vista. Los que todavía no ocurrieron son huecos punteados que dicen qué va a pasar en ellos y se llenan al llegar su turno; no hay instantes con una sola tarjeta. En móvil es una línea de tiempo vertical con conectores que se dibujan. Los tres ejemplos siguen rotando.
- **Combo**: un teléfono grande donde se suceden las pantallas (el sitio con «Pedir turno» → chat de WhatsApp → respuesta de una persona → panel de GrowiApp con agenda y caja) y, al lado (escritorio) o debajo (móvil), los cuatro pasos siempre visibles con el actual destacado. El paso 3 lleva la etiqueta «Paso humano»; no hay conexión automática sitio↔app.
- **GrowiApp** (mismo criterio): el tablero (caja, ventas, stock) está visible desde el primer instante y es la venta la que lo mueve; antes las tarjetas aparecían de a una y dejaban la mitad de la escena vacía en móvil.

**P1 · Producción audiovisual**
- **GrowiWeb**: la cámara recorre el sitio por capítulos con un movimiento dirigido (entrada → cómo trabajan → servicios → cierre) en escritorio y celular a la vez, con el capítulo actual rotulado. Reemplaza el desplazamiento continuo de una captura. Mismas capturas de página completa regeneradas (`assets/img/ex-*.webp`); acceso al sitio completo como enlace secundario.
- **Invitaciones**: escena propia (ya no es el mismo teléfono con textos distintos). Tres mundos con tipografía, color y composición propios: casamiento (serif, arco y paisaje al atardecer sobre foto de mesa), cumpleaños (color pleno, número gigante, confeti) y empresa (azul noche, tipografía Syne, retícula y dorado). Cada uno recorre portada → programa y mapa → confirmación por WhatsApp; el cambio de estilo es una apertura circular que también cambia el fondo de toda la escena. La galería interactiva anterior quedó como sección secundaria «Probalas vos mismo».
- **Home**: en móvil el hero muestra un elemento por vez (consulta o caja) y una leyenda única, en lugar de tres superpuestos; teléfono más grande.
- **GrowiWeb móvil**: el teléfono pasó a ~250 px de ancho y la leyenda quedó fuera de él.

**P2 · Refinamiento**: bot con precio marcado «de referencia, a confirmar», desborde de 3 px a 360 px corregido.

## Decisiones de diseño
- Que ningún instante dependa de una interacción: todo avanza solo, se pausa fuera de pantalla y tiene un único botón de pausa.
- Un paso narrativo = un cambio visible (caja que sube, tarjeta que se llena, cámara que se mueve). Sin efectos decorativos permanentes.
- Cada línea tiene una gramática distinta: tablero que reacciona (App), pipeline que se llena (Flow), teléfono + pasos (Combo), cámara por capítulos (Web), mundos de evento con apertura circular (Invitaciones).
- La apertura circular y el recorrido de Invitaciones son recursos de la escena, no una promesa del producto: «apertura animada con tus fotos» sigue en «Se evalúa por proyecto». El contenido mostrado de la invitación se limita a lo que el alcance vigente incluye (portada, programa y horarios, ubicación con mapa, confirmar por WhatsApp).

## Herramientas realmente usadas
HTML/CSS/JS propio (container queries, `clip-path`, transiciones de `transform` y `opacity`), el motor de escenas de R3.6, Playwright (capturas, grabaciones, pruebas), ffmpeg y Pillow (MP4, tiras de cuadros, comparativas). No se invocaron skills en esta ronda; se aplicaron los criterios de movimiento y de estructura ya consultados. No se generaron imágenes ni videos nuevos con IA, no se usó HyperFrames ni Codex, no se agregaron dependencias ni servicios. Importante: las grabaciones son registros de Playwright del sitio funcionando, **no** piezas de video producidas para el sitio; ninguna escena depende de un video.

## Verificación técnica
| Prueba | Resultado |
|---|---|
| 11 páginas × 360, 390, 739, 820, 1024, 1440, 1920 px, en servidor de desarrollo y en staging (154 cargas) | 0 desbordes de página; 1 escena a 360 px con 3 px de recorte, corregido y reverificado en 0; 0 errores de consola; 0 respuestas 4xx |
| Staging con el mecanismo de release (`--release` + `--validate`) | paquete válido, 136 archivos |
| Movimiento reducido (6 páginas) | todas las escenas en estado final estático, 0 animaciones infinitas, botón de pausa oculto |
| Pausa/reanudación y teclado | Enter y Espacio pausan y reanudan GrowiFlow; el botón recibe foco; se llega con Tab en Combo |
| Ciclos completos en video (390 y 1440) | revisados cuadro por cuadro en tiras: Flow (3 ejemplos), Combo, Web, Invitaciones (3 estilos), home y App; sin estados vacíos. Un cuadro con el teléfono de Invitaciones en negro durante el cambio de estilo se detectó y corrigió antes de re-grabar |
| Red limitada (~200 KB/s, 150 ms) | home ≈ 980 KB, carga en ≈ 9 s y escena visible; las demás páginas cargan en 7–9 s (el conteo de bytes de esas otras páginas no es confiable) |

## Defectos y límites pendientes
- No se probó Safari/iOS ni teléfonos físicos ni lector de pantalla; no hay auditoría formal de contraste ni Lighthouse. `color-mix()` y las container queries requieren navegadores recientes.
- Flow en móvil es una escena alta (≈ 850 px, más que la pantalla): todo es legible, pero hay que desplazarse para ver los cuatro pasos juntos.
- El caso de Combo muestra el panel de GrowiApp como imagen (captura existente), no una interfaz viva.
- Las capturas de GrowiWeb son imágenes de página completa de las demos: si se cambian las demos, hay que regenerarlas.
- La evaluación de «calidad premium» requiere ojo humano: las cifras de cuadros y de fps son indicadores técnicos.

## Comercial
- **Bot de WhatsApp**: USD 149 de puesta en marcha + 25/mes proviene de L1 y no hay fuente comercial vigente más reciente. En la página ahora dice «Precio de referencia, a confirmar al consultar», sin promesa de fecha.
- **Garantías**: «7 días de ajustes sin cargo» (GrowiWeb/home) y «devolución del 100 % del pago del sitio» (Combo) son condiciones distintas, no necesariamente contradictorias; no se unificaron y siguen pendientes de confirmar cómo se comunican juntas.
- **GrowiFlow**: la existencia de las automatizaciones está confirmada por el propietario y no se cuestiona; los ejemplos de las escenas siguen rotulados como «Ejemplo ilustrativo».

## Archivos
`capturas/` (cuadros por línea en escritorio y móvil), `video/*.mp4` (ciclos completos, incluida `inv-390.mp4`), `antes-despues-movil.png` y `antes-despues-escritorio.png` (R3.6 → R3.7).
