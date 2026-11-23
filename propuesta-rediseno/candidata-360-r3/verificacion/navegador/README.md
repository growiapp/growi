# Verificación en navegador (Invitaciones y desborde horizontal)

`invitaciones-estado.playwright.js` es una sola función `async (paginaInicial) => …`. No agrega dependencias y no se ejecuta con `node --test`
(las pruebas de `pruebas/` siguen siendo `node --test pruebas/*.test.mjs`). Esta carpeta no forma parte del release (`_release.py` solo copia `assets`, `demos` y `vendor`).
Abre siempre **una pestaña propia** y la cierra al terminar: no hereda ni deja rutas, init scripts ni listeners en la pestaña desde la que se lanza.

## Qué comprueba (76 verificaciones)
- **Invitaciones**, con clics y teclas reales: casamiento (recorrido por actos, formulario, errores, borrador, WhatsApp como diálogo sin envío, corregir, reiniciar), cumpleaños y empresa.
  Controla `data-paso`, capa activa, ausencia de clases de transición, `inert`, opacidad, foco y texto de los mensajes.
- **Privacidad del RSVP:** sin almacenamiento ni cookies nuevas; ninguna respuesta (nombre ni mensaje) viaja en ningún pedido, ni por URL ni por cuerpo; sin POST (salvo el evento de analítica de Plausible) ni envío a WhatsApp;
  el único tercero admitido es `plausible.io`. **No afirma que la página no haga solicitudes a terceros:** el sitio publicado carga analítica Plausible (solo en el release; ver `_lib.py`). Los eventos de Plausible no llevan datos del RSVP.
- **Interceptación:** un único manejador `page.route(() => true, …)` ve todos los pedidos, los cuenta y **aborta antes de que salgan de la máquina** los que llevan datos del RSVP, van a un tercero distinto de Plausible, son POST ajenos o van a WhatsApp.
  Una comprobación exige que haya inspeccionado pedidos (si la interceptación no se ejecutara, la prueba falla) y que todo lo interceptado haya sido abortado. El informe termina con `red: N pedidos inspeccionados, M abortados`.
- **Desborde horizontal real:** Home e Invitaciones a 320, 360 y 390 px (el documento no supera la ventana y ningún elemento sobresale sin un ancestro que lo recorte) y el teaser del Home en una columna por debajo de 360 px (regresión de F6.1: a 320 px medía 334 px).

## Cómo espera
No hay esperas fijas como condición de éxito. Cada espera es `waitForFunction` con tope de 5 s sobre el estado observable; un tope agotado se informa como fallo (`ninguna espera de estado agotó su tiempo`).
Entre dos saltos de scroll espera 3 cuadros: el recorrido usa `IntersectionObserver`, que muestrea una vez por cuadro, y dos saltos instantáneos dentro del mismo cuadro no se ven.
Es un límite de la prueba, no del producto (con la rueda del mouse el acto cambia).

## Cómo ejecutarlo (herramientas existentes: servidor estático de Python y MCP de Playwright)
1. Servir el sitio. Desde un clon limpio:
   - candidata: `cd propuesta-rediseno/candidata-360-r3 && python -B -m http.server 8840` (o `servir.bat`);
   - o el release, que es lo que se publica: `python -B _construir.py --release <carpeta-temporal>` y `python -B -m http.server 8840 -d <carpeta-temporal>`.
2. Con el MCP de Playwright, `browser_navigate` a `<sitio>/invitaciones/index.html` (por ejemplo `http://localhost:8840/invitaciones/index.html`; publicado: `https://growi.ar/invitaciones/`). **La URL se toma de la página actual.**
3. `browser_run_code_unsafe` con `filename` = la ruta de este script (debe estar bajo una raíz permitida del MCP) o con su contenido en `code`.
4. Esperado: `76/76`. Cada fallo se lista como `FALLA <nombre> → <detalle>`.
Contra el sitio publicado no escribe nada: la experiencia es una muestra sin envío.

## Controles negativos (la prueba debe fallar cuando el defecto existe)
Son la misma prueba con un defecto inyectado; se eligen con el fragmento de la URL de `browser_navigate` y el resultado empieza con un veredicto `CONTROL <nombre>: DETECTADO` o `NO DETECTADO`.
- `…/invitaciones/index.html#control=desborde`: sirve `inv-base.css` sin la regla `@media (max-width:359px){…}`. Deben fallar exactamente `desborde · Home a 320 px` (334/320 px) y `el teaser usa una columna`; todo lo demás, RSVP incluido, pasa (74/76).
- `…/invitaciones/index.html#control=fuga`: la página «filtra» datos de prueba: un POST a `plausible.io/api/event` con un nombre en el cuerpo y otro a un tercero con el nombre en la URL. Los pedidos se **abortan antes de salir** (error `ERR_BLOCKED_BY_CLIENT`, que explica la falla tolerada de consola).
  Deben fallar las tres comprobaciones de privacidad, con al menos 2 pedidos interceptados y abortados y **0 pedidos con datos de prueba completados**; el flujo RSVP sigue pasando (72/76).

## F8.3B · `f83b-experiencias.playwright.js`
Regresión funcional de la historia del hero de Home, la arquitectura móvil de Invitaciones (selector, anterior/siguiente, RSVP conservado, muestra vs. real, diálogo modal de WhatsApp, teclado virtual simulado), cumpleaños y empresa en móvil, el menú (texto «Menú»/«Cerrar» y `aria-current`) y el JSON-LD de GrowiFlow.
1. Servir la candidata (`python -B -m http.server 8840`) o el release.
2. `browser_navigate` a `<sitio>/` (la raíz) y `browser_run_code_unsafe` con `filename` = este script.
3. Esperado: `148/148 verificaciones OK`. Dura ~3 min (incluye el relato automático de escritorio, ≈12 s de ciclo).
Limitación: el teclado virtual se simula reduciendo la ventana; no reemplaza una prueba en dispositivo real.

## F8.4R · `f84r-regresion.playwright.js` (+ `pruebas/validador-jsonld.test.mjs`)
Reproduce en navegador real los tres hallazgos independientes de Codex:
- **Home:** la reproducción debe responder a cambios de tamaño SIN recargar (1440→390→1440, 1280→320, 1200→390, 1024→320, 900→1440, 768→1440), a la pausa y a la interacción del usuario, y al movimiento reducido en caliente (`emulateMedia`). Invariante: hay reproducción si y solo si la disposición de la escena es de escritorio (≥ 520 px, el umbral del `@container hs`).
- **Invitaciones:** tras Anterior/Siguiente/pestañas/teclado en 320×568, 390×667 y 390×844 se miden por separado la cabecera real, el selector completo, la pestaña activa y el título; y no se desplaza la página con el foco en un campo de texto.
Uso: `browser_navigate` a `<sitio>/#antes` o `#despues` (el fragmento solo etiqueta las capturas) y `browser_run_code_unsafe` con `filename`. Esperado: `50/50`. Dura ~4 min (el cliente MCP lo pasa a segundo plano).
`validador-jsonld.test.mjs` (Node) construye un release en una carpeta temporal y comprueba que `--validate` falla si la frase aprobada de GrowiFlow solo está en un comentario HTML o en el texto visible, con JSON inválido, sin el objeto Service (incluso dentro de `@graph`), y pasa con el JSON-LD correcto. Nunca toca la candidata.
