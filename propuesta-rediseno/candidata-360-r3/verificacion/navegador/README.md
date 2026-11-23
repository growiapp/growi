# Verificación en navegador (Invitaciones y desborde horizontal)

`invitaciones-estado.playwright.js` es una sola función `async (paginaInicial) => …`. No agrega dependencias y no se ejecuta con `node --test`
(las pruebas de `pruebas/` siguen siendo `node --test pruebas/*.test.mjs`). Esta carpeta no forma parte del release (`_release.py` solo copia `assets`, `demos` y `vendor`).
Abre siempre **una pestaña propia** y la cierra al terminar: no hereda ni deja rutas, init scripts ni listeners en la pestaña desde la que se lanza.

## Qué comprueba (66 verificaciones)
- **Invitaciones**, con clics y teclas reales: casamiento (el módulo real dentro del diálogo «Probar la invitación completa»: formulario, errores, borrador, WhatsApp como vista previa sin envío, corregir, reiniciar, cierre con Esc), cumpleaños y empresa.
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
4. Esperado: `66/66`. Cada fallo se lista como `FALLA <nombre> → <detalle>`.
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

## F8.7 · `f87-regresion.playwright.js` (+ `pruebas/f87.test.mjs`)
Reproduce y verifica en navegador real los hallazgos de la revisión en teléfono: **Invitaciones** (altura estable de la pantalla, Anterior/Siguiente siempre al alcance, selector «La enviás · La abren · Confirman · Te responden», mensaje de Lucía), **cumpleaños** (21:00 → 22:00 → 00:00 con pausa, manual y movimiento reducido), **empresa** («Ver la jornada completa» y «Confirmar asistencia» llevan a su destino con toques reales), **Home** (el hero se mueve también en móvil, imagen de Centro Ribera entera, leyenda «Demo»), **Combo** (demostración animada; una parte por vez en móvil), **vistas previas de Café Nogal y Estudio Bruma** (comparadas píxel a píxel con la pantalla que abre la app), **planes** (Start, Pro y Multi visibles en la página y en los cuatro rubros, precios sin cambios) y **GrowiFlow** (bot de WhatsApp disponible, sin mensajes contradictorios).
Uso: `browser_navigate` a `<sitio>/#antes` o `#despues` y `browser_run_code_unsafe` con `filename`. Esperado: todas OK. Dura ~5 min (el cliente MCP lo pasa a segundo plano). Los toques son **reales** (`touchscreen.tap`): un `click()` sintético no es una acción de la persona (`isTrusted`) y no mueve el foco ni la vista.

## F8.7C · `f87c-invitaciones-movil.playwright.js`
Invitaciones (casamiento) en móvil con la barra fija Anterior/Siguiente: foco por teclado (Tab) nunca tapado ni fuera de pantalla, «Preparar mi mensaje» no queda bajo la barra, la barra no invade «cumpleaños», nueve cambios seguidos de etapa sin saltos de más y, con el teclado móvil abierto (ventana corta emulada), el campo no queda tapado y la barra se oculta mientras se escribe y vuelve al salir del campo. 320×568, 390×667 y 390×844. Uso igual que `f87-regresion`. Esperado: `30/30`.

## F8.8 · `f88-hero-geometria.playwright.js` y contrato de componentes narrativos
`f88-hero-geometria` mide con `getBoundingClientRect()` el módulo, el tablero, los pasos, la leyenda, el marco del sitio, el marco del negocio y el contenido vecino de la demostración del hero, **en estados manuales y durante un ciclo completo de reproducción automática (muestras cada 100 ms, incluye las transiciones)**, en 320×568, 360×740, 390×667, 390×844, 768×1024, 1280×720 y 1440×900. Criterio: variación máxima de **1 px**. Además verifica: sin texto atenuado ni controles dentro de la escena, resultado final visible («Julián · 11:15 · Turno confirmado»), pausa/reanudación, salir y volver al viewport, cambio de tamaño de la ventana, toma de control manual y movimiento reducido. Sobre el hero de F8.7C falla (variaciones de 44 a 520 px, agenda atenuada, botón «Anotar turno»); sobre F8.8 pasa. Cambiar `BASE` por la URL servida.

### Contrato de calidad para componentes narrativos de Growi (Home, Combo, Invitaciones y los que se agreguen)
1. **Producto a la vista:** la primera etapa muestra el producto real o una captura completa y reconocible, no un recorte ni un esquema. Quien mira entiende qué se vende sin leer la leyenda.
2. **Continuidad:** lo que se ve en una etapa sigue presente (o es el origen visible) de la siguiente: mismo sitio, mismo negocio, mismos nombres y horarios. Nada aparece «de la nada».
3. **Resultado visible:** la última etapa muestra el resultado ya logrado (quién, cuándo, estado), no un botón que lo promete. Si lo hace una persona, se dice; no se simula una integración automática.
4. **Estabilidad geométrica:** los marcos principales tienen alto propio (no `min-height` que oculte diferencias) y no cambian entre etapas: variación ≤ 1 px, medida antes, durante y después de cada transición, en los siete tamaños. El contenido vecino no se mueve. Solo se animan `transform` y `opacity`.
5. **Jerarquía:** una cosa protagonista por escena (el sitio), lo demás la acompaña; sin paneles permanentemente atenuados ni elementos que parezcan deshabilitados; sin áreas vacías grandes.
6. **Movimiento accesible:** pausa visible, se detiene fuera de pantalla y con la pestaña oculta, respeta movimiento reducido (queda un estado final comprensible y navegable a mano), tocar un paso toma el control, y nada parece un control si no responde.
7. **Equivalencia móvil/escritorio:** misma historia y mismo resultado; la composición móvil se diseña para el espacio disponible (no es el escritorio comprimido).
8. **Revisión visual obligatoria:** capturas de cada etapa en escritorio y móvil, revisadas por una persona antes de cerrar; una prueba DOM de presencia o visibilidad no alcanza.
Los puntos 3, 4, 5 y 6 están cubiertos por `f88-hero-geometria` y por `pruebas/f83b.test.mjs`; los puntos 1, 2, 7 y 8 se verifican con la revisión de capturas.

## F8.9B · demostraciones integradas (Home A e Invitaciones A)
La Home y la página de Invitaciones usan ahora las demostraciones aprobadas en F8.9A (`assets/home-demo.*`, `assets/invitaciones/pelicula.*`, motor `assets/narrar.js`).
Los scripts `f83b-experiencias`, `f84r-regresion`, `f87-regresion`, `f87c-invitaciones-movil` y `f88-hero-geometria` describían el hero anterior y el recorrido por actos, que ya no existen, y se retiraron.
Su cobertura se reparte así: la animación y la geometría de las demostraciones, y el diálogo con el módulo real, se verifican con `f89b-home.playwright.js` y `f89b-invitaciones.playwright.js` (seis viewports);
el sitio completo (desborde, menús, enlaces de WhatsApp sin envío automático, consola) con `f89b-regresion-sitio.playwright.js`; la lógica estática, con `pruebas/f89b.test.mjs`.
No se conserva una verificación de navegador específica de Café Nogal y de los planes (la parte de estas pruebas que no dependía del hero): sus pruebas de Node (`f87.test.mjs`) siguen vigentes.

### Cobertura vigente tras el cierre de F8.9B
- `f89b-comercial.playwright.js` (97 verificaciones): cumpleaños (La noche), empresa, Combo, vistas previas de Café Nogal y Bruma (igualdad pixel a pixel con la app), los tres planes de GrowiApp (página y rubros), GrowiFlow y menú/navegación. Armado con las secciones vigentes de los scripts retirados.
- `f89b-dinamico.playwright.js` (22 verificaciones): las demostraciones nuevas ante cambios de tamaño, movimiento reducido en caliente y salida/vuelta a la vista (lo que cubría F8.4R para el hero anterior).
- Los CTA de WhatsApp y los menús de todas las páginas, en seis viewports, los cubre `f89b-regresion-sitio.playwright.js`.
- La muestra de Invitaciones solo prepara el mensaje: `pruebas/f89b.test.mjs` y `invitaciones-estado.playwright.js` verifican que ningún texto promete abrir ni enviar WhatsApp y que no sale ningún pedido a WhatsApp.

**Salidas de los scripts:** ninguno escribe archivos por defecto. `f89b-comercial` acepta una carpeta de capturas en la constante `CAP` (vacía por defecto); si se usa, debe ser una carpeta propia de la corrida y **nunca** la de otra fase. La base por defecto de todos es `http://127.0.0.1:8840/` (ajustar `BASE`).
