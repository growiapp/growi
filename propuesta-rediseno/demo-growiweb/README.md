# Demo GrowiWeb: Centro Ribera (negocio ficticio)

Prototipo local, `noindex`, sin cambios en producción. Candidata «Design quality upgrade» sobre el commit `0fc3a35`. La aprobación artística final es de la dueña.

## Cómo abrirla
Desde la raíz del repo: `python -m http.server 8801` y abrir
`http://localhost:8801/propuesta-rediseno/demo-growiweb/centro-ribera/index.html` (también `servicios.html` y `turnos.html`).
Regenerar las páginas: `python _construir.py` (en esta carpeta).

**Movimiento:** si tu sistema tiene «reducir animaciones» activado, la página lo respeta y muestra todo en su estado final. El botón «Activar animaciones» de la franja superior lo habilita (se guarda en el navegador).

## Qué cambió respecto de `0fc3a35`
- **Selector corporal:** una sola pieza. La silueta gris y los seis botones se reemplazaron por una ilustración humana con volumen (Codex ImageGen) con las seis zonas rotuladas sobre el cuerpo. Los rótulos son los controles (radio buttons reales: teclado con flechas, foco visible). Al elegir, un aro con marcas de goniómetro se desliza hasta la zona y el panel muestra motivos de consulta y un pedido de turno por esa zona. En escritorio la figura queda fija mientras se lee el panel; en móvil el panel se lleva a la vista y los rótulos se acortan.
- **Fuera los muñecos articulados y los grados de ejemplo.** El motion que queda explica algo: orientación (aro entre zonas), un arco anclado al goniómetro real de la foto y el relato de la primera consulta.
- **Primera consulta:** tres escenas ilustradas (charlamos, medimos, armamos el plan) con numeración y «Te llevás». En escritorio entran en secuencia en cascada; en móvil son un carrusel horizontal con indicador.
- **Ritmo de la home:** hero con selector, banda con foto, bloque petróleo, servicios asimétricos con una tarjeta coral, equipo, «Antes de venir» (cobertura y preguntas juntas) y cierre coral. Titulares más grandes.
- **Servicios y turnos:** los recortes de zona usan la misma ilustración (el aro marca la zona) en lugar de las figuras mecánicas. El turnero no cambió su lógica.

## Verificado
- Lighthouse (home escritorio y móvil, servicios y turnos en móvil): Accesibilidad 100, Buenas prácticas 100. SEO 66 por el `noindex` intencional.
- Móvil emulado (CPU 4x, 4G rápida), home: LCP 328 ms, CLS 0,00. Sin desborde horizontal ni rótulos superpuestos en 320, 360, 390, 768, 1024 y 1440 px.
- Teclado (flechas entre zonas), modo reducido (estado final, sin transiciones), versión sin JavaScript (paneles visibles), turnero completo, sin errores de consola.
- Una crítica visual independiente sobre capturas. Se corrigieron: escenas de la primera consulta que cargaban tarde, recortes de zona, rótulo tapado por el aro, contraste de matrículas y de la banda de la foto en móvil, tarjeta de servicios en móvil.
- Evidencia: `centro-ribera/evidencia/v2/` (antes/después, estados del selector, `movimiento-aro.png/.gif` y `movimiento-primera-consulta.png` con tiempos reales en ms).

## Dirección artística (candidata actual)
- **Ilustraciones rehechas** (Codex ImageGen, una sola corrida de 4 piezas): personajes fijos con rostros expresivos, estilo acuarela editorial, y las escenas de «Primera consulta» ocurren en la misma sala de la foto (camilla azul, espaldera, planta, bandas). Reemplazan a las anteriores sin rasgos faciales. Procedencia en `centro-ribera/assets/img/ORIGEN.md`; originales en `assets/img/generadas/v2/`.
- **Indicador del selector:** el círculo con marcas se reemplazó por un punto y un arco parcial de goniómetro que mira hacia el rótulo. No tapa la ilustración. Mismo componente en Servicios y Turnos.
- **Coherencia:** el color del panel del selector coincide con el fondo de la figura; la foto de la sala lleva un grano de papel sutil; las escenas comparten luz, paleta y escenario con la foto.
- **Móvil:** en «Primera consulta» la imagen ocupa el borde superior de la tarjeta y el número flota como etiqueta; rótulos del selector cortos y sin solapes de 320 a 1440 px.
- Evidencia: `centro-ribera/evidencia/v4/` (capturas, estados del selector, antes/después, `demo-selector.gif`, `demo-primera-consulta.gif`).

## Cierre de motion (tras `review-animations`)
- Con teclado (flechas) no se anima ni el aro ni el panel de zona.
- El aro se mueve con `translate` (técnica FLIP: se mide dónde está, se coloca en destino y se anima la diferencia), en 300 ms y retomando desde donde está si se lo interrumpe. Ya no anima `left/top`. Sin giro.
- Hover con movimiento solo con `(hover:hover) and (pointer:fine)`. Resaltado del resumen 0,5 s. Cascada de la primera consulta con 150 ms entre escenas y 0,5 a 0,6 s por escena.
- No se hicieron: cierre animado de las preguntas frecuentes (sería animación nueva) ni cambio del ancho de los puntos del carrusel. En modo reducido sigue sin movimiento.
- Material para evaluar: `centro-ribera/evidencia/v3/` (capturas completas de escritorio y móvil, selector, primera consulta, `demo-selector.gif`, `demo-primera-consulta.gif`).

## Defectos que persisten
- **Rostros sin rasgos** en todas las ilustraciones: se leen como estilo genérico de IA, no como estilo propio. La piel durazno uniforme desentona con la foto de luz natural.
- **Foto y vector conviven a medias:** el puente es el arco coral sobre el goniómetro; no hay una pieza que unifique ambos lenguajes.
- **Equipo sin identidad visual:** monogramas, sin retratos.
- **Estructura:** varias secciones siguen siendo «título más caja». En móvil, fuera del hero y del carrusel, es escritorio reorganizado.
- **Escenas de la primera consulta:** las ilustraciones tienen fondo claro dentro de un bloque petróleo y se leen como tarjetas pegadas.
- **Fluidez real sin medir:** los navegadores automatizados limitan `requestAnimationFrame`; el movimiento se verificó con fotogramas con tiempo, no con fps. Sin prueba en teléfono real, Safari, Firefox ni lector de pantalla.
- **Recortes por zona** (Servicios y Turnos): son zoom de una sola ilustración, no encuadres pensados.

## Recurso externo que subiría el techo
Retratos o escenas de un mismo ilustrador (o una serie con rasgos faciales y piel variada, coherente con la foto), y seis encuadres dibujados de las zonas. Con IA, requiere iterar con la dueña sobre rostros y tono de piel.

## Pendiente de invocación manual
`find-animation-opportunities`, `animate` y `review-animations` son de invocación manual y no se ejecutaron. Comandos (el prefijo se verificó solo en dos skills ya usadas; si alguno no responde, usá el nombre que muestra el menú de `/`):
`/anthropic-skills:find-animation-opportunities`, `/anthropic-skills:animate`, `/anthropic-skills:review-animations`.
