# Evidencia R3.5

## Contenido
- `video/`: grabaciones reales del navegador (MP4, 25 fps, cuadros continuos; no son GIF armados con capturas). Escritorio 1440×900: `app`, `web` (44 s, ambos sitios), `flow` (incluye cambio de ejemplo), `combo`, `invitaciones` (portadas, apertura, cambio de evento y perfiles). Móvil 390×844: `app`, `web`, `flow`, `combo`, `invitaciones`, `home`. Cada uno tiene entre 150 y 1100 cuadros y casi todos distintos.
- `capturas/`: `inicio-<página>-<1440|390>.png` (primer pantallazo) y `final-<página>-<1440|390>.png` (demo en su estado final) de home, app, web, flow, combo e inv. `estado-app-2-*` muestra el momento en que cambian las cifras del Resumen.
- `comparacion-r34-r35-escritorio.png` y `comparacion-r34-r35-movil.png`: R3.4 arriba/izquierda, R3.5 abajo/derecha.

## Qué cambió (sustantivo)
1. **Home**: en 390×844 se ve producto (sitio y panel sobre foto) antes de terminar el primer pantallazo, con el aviso de «solo consultas» arriba del producto. Colo Café pasó a una franja oscura justo después del hero, con logo, qué se armó, la cita textual y su atribución; sin resultados ni métricas.
2. **GrowiApp**: el hero muestra la interfaz real (Café Central) y, al costado, el hilo venta → Resumen/caja → stock → cierre. Las cifras del Resumen cambian dentro de la interfaz real y se rotulan «Interfaz real · cifras simuladas»; el stock es un ejemplo (la demo no tiene pantalla de stock). Aritmética: 2×$3.900 + 1×$1.700 = $9.500; ventas $184.500→$194.000, transacciones 47→48, caja estimada $147.600→$157.100.
3. **GrowiFlow**: tema claro, pasos futuros legibles, progresión visual tarea manual (borde punteado) → disparo → ejecución → resultado → beneficio. Un ejemplo protagonista; los otros dos como «Ver otro ejemplo». Resultado a los ~7 s.
4. **Combo**: un plano protagonista por vez (teléfono + una tarjeta grande), con el actor rotulado (Visitante, Persona del centro, Herramienta) y una barra de cinco pasos. Aclaración visible de que es una demostración conceptual y que no se muestra conexión automática.
5. **GrowiWeb**: ventana de navegador con el sitio a escala ~0,8, recorrido por secciones (se desliza y se queda leyendo cada una; titulares enteros en la pausa), rótulo de sección también en móvil, imágenes del sitio precargadas.
6. **Invitaciones**: portada rediseñada (halo, anillos finos, dunas, ramas de olivo, marco fino; sigue los colores de cada tipo de evento); la portada se ve 4 s antes de abrirse sola; sección de personalización sobre la fotografía, titular y bajada en dos columnas, perfiles que se recorren solos y botones simples.
7. Corrección: la ruta de fondos fotográficos que daba 404 al mostrar GrowiWeb en la home.

## Verificación (Playwright, servidor local)
- 10 páginas × 390, 739, 1024 y 1440 px: 0 desbordes, 0 textos menores a 12 px, 0 errores de consola, 0 respuestas 4xx/5xx, aviso L1 presente.
- Movimiento reducido: App, Flow y Combo muestran el estado final completo y la lista de pasos; los controles se ocultan; GrowiWeb queda estático.
- Interacción: pausa y seguir, salto con puntos (las cifras de la interfaz real vuelven y avanzan), activación por teclado, otro ejemplo de Flow, plano 4 de Combo, cambio de sitio y «Recorrerlo vos mismo» en GrowiWeb, tarjetas de Invitaciones, perfiles automáticos.
- Preguntas de revisión: producto reconocible en la home móvil, sí; demos comprensibles sin tocar, sí; estado vacío/roto, ninguno persistente (el marco de GrowiApp muestra un póster mientras carga la interfaz); resultado legible en móvil, sí (un paso por vez en Flow, Combo y GrowiApp).

## Skills y capacidades usadas
- `anthropic-skills:animate` y `improve-animations` (ya aplicadas antes): hover limitado a punteros finos, mediciones del recorrido en caché.
- Playwright (MCP): navegación, capturas, grabación de video con `page.screencast`, barrido técnico. `ffmpeg` local para convertir a MP4 y contar cuadros. PIL para las comparaciones.
- No se generaron imágenes nuevas ni se usó ningún servicio de pago. No se invocaron skills manuales de motion ni Codex.

## Pendientes
- **Media**: la demo real de GrowiApp es una maqueta; el efecto venta → resumen/stock es simulación rotulada. Para presentarlo como función hay que construirlo.
- **Media**: sin probar en teléfono físico, Safari/iOS ni lector de pantalla.
- **Baja**: Flow y Combo en móvil dejan espacio libre bajo la tarjeta (altura mínima para evitar saltos).
- **Baja**: en GrowiWeb escritorio el sitio queda cerca de la pausa con el siguiente titular asomando por abajo, y las imágenes del sitio de muestra podrían tardar en conexiones lentas.
- **Baja**: `revision/index.html` no se regeneró.
