# Demo GrowiWeb: Centro Ribera (negocio ficticio)

Prototipo local para mostrar el nivel de GrowiWeb «Institucional con turnos». No está publicado, es `noindex` y no toca producción.

## Cómo abrirla
Desde la raíz del repo: `python -m http.server 8801` y abrir
`http://localhost:8801/propuesta-rediseno/demo-growiweb/centro-ribera/index.html`
(también `servicios.html` y `turnos.html`). Funciona con rutas relativas, sin dependencias y sin pedidos externos.

## Qué incluye
- **Home:** selector de la zona que te molesta (mapa corporal + botones), figura con arco medido, motivos de consulta frecuentes con enlace al turno, primera consulta en tres pasos, servicios, equipo ficticio, cobertura, preguntas y cierre.
- **Servicios:** cinco servicios (para quién y duración) y qué se mide en cada zona.
- **Turnos (simulado):** motivo, profesional, día y horario (mañana y tarde), datos con validación, mensaje de WhatsApp de ejemplo. No se reserva ni se envía nada.
- **Identidad «Movimiento medido»:** arco de goniómetro como marca, ilustraciones y guía visual. Tipografías propias alojadas (ver `centro-ribera/FUENTES.md`). Un acento (coral) y un sistema de radios.

## Archivos
`centro-ribera/` (sitio), `_ilus.py` (genera las seis ilustraciones por cinemática), `_construir.py` (genera las tres páginas), `referencias/` (capturas y notas), `centro-ribera/evidencia/` (capturas renderizadas y de pruebas).

## Verificado (2026-11-17)
- Lighthouse móvil (3 páginas): Accesibilidad 100, Buenas prácticas 100. SEO 63 por el `noindex` intencional (único fallo: «página bloqueada para indexación»).
- Rendimiento móvil emulado (CPU 4x, 4G rápida), home: LCP 459 ms, CLS 0,00. TTFB de localhost: en hosting real será mayor.
- Peso por página: HTML 19 a 25 KB, CSS 18 KB, JS 11 KB, fuentes 51 KB. Cero pedidos externos.
- Contraste medido sobre el render: 0 fallas (pares de 4,90 a 14,11). Sin desborde horizontal en 390, 768 y 1440. Sin áreas táctiles menores a 44 px fuera de enlaces dentro de texto.
- Recorrido de turnos probado con éxito y con casos de borde (vacíos, teléfono corto y largo, HTML en campos, parámetros inválidos incluido `__proto__`). Sin errores de consola.
- Crítica independiente (dos evaluaciones aisladas, protocolo de `impeccable critique`): corregidos los defectos objetivos encontrados.

## Límites declarados
- Sin prueba en teléfono real ni con lector de pantalla.
- El detector de Impeccable corrió en modo degradado (sin hallazgos; es un piso, no una garantía).
- Las ilustraciones son diagramas técnicos coherentes, no ilustración artística. Un juego de seis piezas hechas por un ilustrador subiría el techo visual (no bloquea la demo).
- Pendiente de invocación manual (no se ejecutaron): `find-animation-opportunities`, `animate`, `review-animations`. El movimiento es mínimo y está justificado (retroalimentación y cambio de estado), con `prefers-reduced-motion` respetado.
- Tema solo claro. El tema oscuro no se implementó.
