# Verificación en navegador (Invitaciones y desborde horizontal)

`invitaciones-estado.playwright.js` es una sola función `async (page) => …`. No agrega dependencias y no se ejecuta con `node --test`
(las pruebas de `pruebas/` siguen siendo `node --test pruebas/*.test.mjs`). Esta carpeta no forma parte del release (`_release.py` solo copia `assets`, `demos` y `vendor`).

## Qué comprueba (75 verificaciones)
- **Invitaciones**, con clics y teclas reales: casamiento (recorrido por actos, formulario, errores, borrador, WhatsApp como diálogo sin envío, corregir, reiniciar), cumpleaños y empresa.
  Controla `data-paso`, capa activa, ausencia de clases de transición, `inert`, opacidad, foco y texto de los mensajes.
- **Privacidad del RSVP:** sin almacenamiento ni cookies nuevas; ninguna respuesta (nombre ni mensaje) viaja en ningún pedido, ni por URL ni por cuerpo; sin POST (salvo el evento de analítica de Plausible) ni envío a WhatsApp;
  el único tercero admitido es `plausible.io`. **No afirma que la página no haga solicitudes a terceros:** el sitio publicado carga analítica Plausible (solo en el release; ver `_lib.py`). Los eventos de Plausible no llevan datos del RSVP.
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
4. Esperado: `75/75`. Cada fallo se lista como `FALLA <nombre> → <detalle>`.
Contra el sitio publicado no escribe nada: la experiencia es una muestra sin envío.

## Controles negativos (la prueba debe fallar cuando el defecto existe)
Se ejecutan envolviendo el script (en una carpeta ignorada por Git, por ejemplo `.playwright-mcp/`):
- **Desborde de 320 px:** antes de llamar a la función, `page.route('**/inv-base.css*', …)` responde el CSS sin la regla `@media (max-width:359px){…}`. Deben fallar exactamente `desborde · Home a 320 px` (334/320 px) y `el teaser usa una columna`.
- **Fuga de RSVP:** `page.route('https://**', r => r.abort())` y un `addInitScript` que, tras la carga, hace `fetch` POST a `plausible.io/api/event` con un nombre de prueba en el cuerpo y a un tercero con el nombre en la URL. Deben fallar las tres comprobaciones de privacidad (los pedidos se abortan antes de salir de la máquina; el error de consola que dejan es esperable).
