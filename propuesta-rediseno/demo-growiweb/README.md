# Demo GrowiWeb: Centro Ribera (negocio ficticio)

Prototipo local, `noindex`, sin cambios en producción. Parte del commit `67cb3a9` y suma el refinamiento artístico y de movimiento.

## Cómo abrirla
Desde la raíz del repo: `python -m http.server 8801` y abrir
`http://localhost:8801/propuesta-rediseno/demo-growiweb/centro-ribera/index.html` (también `servicios.html` y `turnos.html`).

**Movimiento:** si tu sistema tiene «reducir animaciones» activado, la página lo respeta y muestra todo en su estado final. El botón «Activar animaciones» de la franja superior lo habilita (se guarda en el navegador).

## Qué cambió
- **Hero con fotografía editorial (variante B, elegida):** imagen generada con IA (sin personas, ver `centro-ribera/assets/img/ORIGEN.md`) convertida a AVIF/WebP. Sobre la foto, un arco coral sale del goniómetro fotografiado y mide un ángulo (0° a 55°). Tres marcadores rotulados (evaluación, readaptación, traumatología) abren el servicio de cada lugar.
- **Movimiento con propósito (tres intervenciones):**
  1. *Medir:* en el hero y en cada figura del selector el miembro recorre su rango mientras arco y número crecen. Botón «Repetir el movimiento». En Servicios, cada zona mide al entrar en pantalla.
  2. *Narrar el proceso:* en «Así es la primera consulta», «Medimos» mide el arco y «Armamos el plan» suma la meta acordada (línea punteada).
  3. *Feedback del turnero:* entrada de cada paso, resaltado del dato que cambió en el resumen y figura de la zona elegida midiendo.
- **Textos:** instrucción del selector corporal, mensajes y confirmación revisados con `natural-writing` (modo auditoría).
- **Correcciones de las críticas independientes:** contraste de la bajada sobre la foto, aro de foco de los marcadores, tarjeta sobre el marcador en móvil, `localStorage` bloqueado, versión sin JavaScript, barra fija móvil, estado de «flash» del resumen, nombre accesible de la marca.

## Decisión A contra B
Capturas en `centro-ribera/evidencia/variantes/`. B gana en escritorio por lugar, credibilidad e identidad (el arco nace de un objeto real de la foto). En móvil la foto dejó de ser una franja chica (más alta) y la tarjeta del marcador pasó a mostrarse debajo de la imagen. La crítica visual independiente señaló que la foto sola sigue siendo genérica y que el pictograma de las figuras desentona con ella: ver «Defectos que persisten».

## Verificado (2026-11-18)
- Lighthouse (home escritorio y móvil; servicios y turnos en móvil): Accesibilidad 100, Buenas prácticas 100. SEO 66 por el `noindex` intencional (único fallo).
- Rendimiento móvil emulado (CPU 4x, 4G rápida), home con la foto: LCP 624 ms, CLS 0,00. Foto servida en AVIF (56 KB en escritorio, 22 KB en móvil). El primer byte es de localhost.
- Contraste del texto sobre la foto, peor caso muestreado en seis anchos: titular 5,4:1 o más; bajada 5,2:1 o más.
- Marcadores a 0 px de diferencia de los objetos que señalan en 1440, 1200, 1024 y 390; teclado (Tab, Enter, Espacio, Escape) y `aria-expanded` correctos.
- Movimiento: estados 0, 0,5 y 1 coherentes en hero y figuras (sin restos de `transform`); 10 cambios rápidos de zona sin estados rotos; modo reducido sin animaciones; sin errores ni advertencias de consola en tres páginas y cuatro modos.
- Recorrido de turnos completo por teclado y casos de borde (incluido `?zona=__proto__`).
- Dos críticas independientes (visual por imágenes y funcional en navegador) más la de la iteración anterior. Evidencia: `centro-ribera/evidencia/` (antes/después, fotogramas de movimiento, variantes A y B, capturas de estados).

## Defectos que persisten
- **Fluidez real sin medir:** los navegadores automatizados limitan `requestAnimationFrame` a 1 cuadro por segundo. El movimiento se verificó por estados deterministas y fotogramas (`evidencia/movimiento*.png`), no por fps.
- **Foto genérica:** sala vacía, sin personas ni gesto de atención. No transmite trato humano.
- **Figuras:** pictogramas rígidos de otro lenguaje que la foto. La cadera solo anima arco y número (la sentadilla no se mueve).
- **Marcadores de la foto:** se leen mejor rotulados, pero siguen siendo superpuestos y no hacen parte de la imagen.
- **Móvil:** los marcadores no tienen rótulo (se ven solo al abrir la tarjeta) y el arco es pequeño.
- Sin prueba en teléfono real, Safari, Firefox ni lector de pantalla.

## Recurso externo que subiría el techo
Una serie de seis imágenes de la misma sala (una por zona: hombro, espalda, cadera, rodilla, tobillo y codo) con una persona realizando el movimiento y el goniómetro a la vista, sobre fondo claro, para apoyar encima el arco coral y reemplazar los pictogramas. Alternativa: seis siluetas ilustradas con volumen real, de un mismo ilustrador. No se generó porque las herramientas de imagen no están disponibles dentro de Claude Code.

## Pendiente de invocación manual
`find-animation-opportunities`, `animate` y `review-animations` son de invocación manual y no se ejecutaron. Comandos (el prefijo se verificó solo en las dos skills ya usadas; si alguno no responde, usá el nombre que muestra el menú de `/`):
`/anthropic-skills:find-animation-opportunities`, `/anthropic-skills:animate`, `/anthropic-skills:review-animations`.
