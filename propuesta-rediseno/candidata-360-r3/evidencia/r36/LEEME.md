# Evidencia R3.6 (parte de 3ff9464)

Rama `propuesta-rediseno-v3`. Sin push, merge ni deploy. Los workflows de publicación y de tipo de cambio no se tocaron.

## Qué cambió
- **Motor de escenas** (`assets/growi36.js`, `assets/growi36.css`, `_r36.py`): cada demostración es una secuencia en bucle que arranca sola al entrar en pantalla, se pausa fuera de pantalla y tiene un único botón de pausa. Nada requiere clics para comunicar el valor. El responsive depende del ancho del contenedor (container queries), así que la misma escena sirve a ancho completo y en media columna.
- **Home**: el hero es una escena de producto (sitio en el celular recorriéndose, consulta por WhatsApp, caja del día que sube). El selector de pestañas pasó a ser un índice por anclas y las cuatro soluciones se leen de corrido, cada una con su escena. Colo Café pasó de chip en el hero + bloque oscuro de pantalla completa a una franja compacta con logo, cita textual y atribución, después de las soluciones.
- **GrowiApp**: una venta registrada (2 × Flat white + 1 × Medialuna = $9.500) y lo que mueve: caja $147.600 → $157.100, ventas $184.500 → $194.000, stock de leche y medialunas. La demo completa quedó como sección secundaria («Probala vos mismo») y se eliminó el selector de rubro, que solo cambiaba nombres e importes.
- **GrowiWeb**: exhibición de dos proyectos completos (Centro Ribera, Barro & Fuego) con el sitio recorriéndose de punta a punta en escritorio y en celular a partir de capturas de página completa (`assets/img/ex-*.webp`), sin iframes ni barras de desplazamiento. Enlace discreto a la demo completa. Se corrigió el desborde de 25 px de `turnos.html` a 390 px (la grilla `.tw` no pasaba a una columna) y otro de 142 px en `servicios.html` (la grilla `.svc` tampoco); 3 páginas de la demo × 5 anchos: 0 desbordes.
- **GrowiFlow**: tarea manual → disparador → automatización → resultado, con tres ejemplos que rotan solos (turnos, consultas, resumen). El bot de WhatsApp tiene vía de consulta («Consultar por un bot de WhatsApp», mensaje precompletado) sin afirmar disponibilidad.
- **Combo**: sitio → consulta por WhatsApp → una persona del centro la carga (rotulado como paso humano) → agenda y caja. No se muestra ninguna conexión automática entre el sitio y la agenda.
- **Invitaciones**: ya tenía presentación automática (portada, apertura, capítulos y rotación casamiento → cumpleaños → empresa); se limpió el copy y no se rediseñó. Ver pendientes.
- **Copy**: se retiraron «Hoy solo recibimos consultas…» (hero y precios), «precios previstos: hoy solo consultas» y las etiquetas «Simulación», «Datos ficticios» y «Negocio de ejemplo». Queda una sola aclaración por experiencia («Ejemplo ilustrativo»). El aviso L1 del pie y la salvedad de precios se mantienen.

## Verificación
| Prueba | Resultado |
|---|---|
| 10 páginas × 390, 739, 820, 1024, 1440, 1920 px (60 cargas) | 0 desbordes, 1 h1 por página, 0 imágenes sin alt, 0 errores de consola, 0 respuestas 4xx/5xx |
| Staging con el mecanismo de release (`--release` + `--validate`): 136 archivos, paquete válido | 14 páginas y demos × 390 y 1440 px: 0 fallas de red, 0 errores, 0 desbordes. `index, follow` y canonical en el staging |
| Reproducción sin interacción | 11 grabaciones MP4 reales (`video/`); en todas cambia entre el 53 % (Invitaciones) y el 98 % de los cuadros muestreados a 2 fps |
| Transición entre ejemplos de GrowiFlow | 260 muestras en un ciclo completo: ningún instante con el escenario vacío |
| Movimiento reducido | Todas las escenas en su estado final (cifras finales, pasos visibles), 0 animaciones infinitas, botón de pausa oculto |
| Pausa | Congela el avance y el botón pasa a «Seguir la animación» |
| Rendimiento (local, sin limitar red) | Home 917 KB, GrowiApp 493 KB, GrowiWeb 1.036 KB; ~100 fps y 0 cuadros lentos con las escenas corriendo |

## Matriz de precios y condiciones
Los importes USD no cambiaron: comparados con `3ff9464`, cada página conserva exactamente el mismo conjunto de `data-price`.

| Línea | USD (sin cambios) | Fuente |
|---|---|---|
| GrowiApp | 15 / 29 / 49 por mes; puesta en marcha 49 / 149 / 249 | L1 y documento comercial 19/09/2026 |
| GrowiWeb | landing 200 / 299 / 449; sitio 550 / 729; extras 69 / 59 / 39 / 29 | L1 y documento comercial |
| GrowiFlow | pedidos 79; reportes y recordatorios 89; a medida desde 190; ajuste 29 | L1 (no figura en el documento comercial) |
| Combo | 180 / 495 (-10 % sobre 200 / 550) + 15 por mes | L1 y documento comercial |
| Bot de WhatsApp | puesta en marcha 149 + 25 por mes, mensajes de Meta aparte | L1; consulta únicamente, sin fecha |
| Invitaciones | sin precio de lista, presupuesto por escrito | L1 |

- Importes en pesos: los calcula el builder con la cotización de `shared.fx.js` y el redondeo de `shared.js`; el workflow semanal los actualiza. Los `$` fijos que quedan (`$9.500`, `$147.600`, `$21.000`, etc.) son cifras de las escenas, no precios.
- La salvedad de precios compartida se acortó: se conservan que todavía no se aceptan contrataciones ni pagos, USD como moneda, pesos orientativos al dólar oficial venta, costos de terceros y dominio aparte, y que lo «desde» y lo a medida se confirman por escrito.
- Los precios «desde» se mantienen.

## Discrepancias detectadas
1. **Garantía** (heredada de L1): el Combo ofrece devolver el 100 % del pago del sitio; GrowiWeb suelto y la home dicen «7 días de ajustes sin cargo». Sin resolver (decisión 1).
2. **GrowiFlow, FAQ**: una respuesta remitía a una «pregunta sobre la IA» que no estaba en la página. Se incorporaron las preguntas de L1 sobre la IA, el bot y el costo de mensajes de Meta (el JSON-LD sigue el mismo texto visible).
3. **Servicios de Centro Ribera a 390 px**: `demos/web/centro-ribera/servicios.html` desbordaba 142 px (preexistente, distinto del de 25 px). Corregido en la causa (`.svc` en una columna en móvil).
4. Cifras de las escenas (`$21.000`, `$9.500`): fijas y ficticias; el workflow de tipo de cambio no las toca.

## Decisiones comerciales pendientes
1. Garantía: ¿devolución del 100 % solo en el combo, o el mismo criterio para GrowiWeb? Hoy conviven dos redacciones.
2. Bot de WhatsApp: la vía de consulta está habilitada con el precio de L1 (149 + 25 por mes). Confirmar si ese precio se puede mostrar junto al CTA o si se prefiere «a consultar».
3. Automatizaciones de GrowiFlow: el copy mantiene «a medida» y la salvedad de Meta. Si hay una demo técnica o un flujo exportable, conviene incorporarlo para reforzar el relato.

## Límites
- No se probó en Safari/iOS ni en teléfono físico, ni con lector de pantalla. No se midió Lighthouse ni red limitada.
- Contraste y teclado: pausa y enlaces son focuseables y con nombre accesible, pero no hubo auditoría formal de contraste.
- Las imágenes de ambientación son las ya existentes (generadas con IA, rotuladas). No se generaron imágenes nuevas ni se usó ningún servicio pago.
- En esta ronda no se invocaron skills nuevas: se aplicaron los criterios de movimiento (`animate`, `review-animations`) y de estructura (`ux-ui-strategy`, `landing-page-builder`) ya consultados antes. No se invocó Codex ni se usó HyperFrames.

## Archivos
`capturas/despues-*.png`, `antes-despues-escritorio.png`, `antes-despues-movil.png`, `video/*.mp4`.
