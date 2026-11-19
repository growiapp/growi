# Evidencia R3.4

- `final-<pagina>-1440.png` y `final-<pagina>-390.png`: primer pantallazo de home, app, web, flow, combo e inv.
- `estado-<demo>-<ancho>-<n>.png`: estados intermedios y finales de GrowiApp (simulación), GrowiFlow y Combo; `estado-web-390-2.png`.
- `app-1440-hero-b1/b4/b5.png`, `app-1440-interfaz.png`: simulación de causa y efecto e interfaz real con la fotografía de cafetería.
- `web-1440-ceramica.png`, `inv-1440-hero.png`, `inv-1440-perfiles.png`: escaparate con la fotografía de cerámica y galería de Invitaciones con la mesa.
- `motion-app.gif`, `motion-flow.gif`, `motion-combo.gif`: secuencias completas a 1440 px (12 cuadros, 1,25 s cada uno).
- `antes-R33/`: la misma vista en R3.3 para comparar.
- `imagenes.md`: imágenes usadas y descartadas.

## Verificación (servidor local, Playwright)
10 páginas × 320, 390, 739, 1024 y 1440 px: 0 desbordes, 0 textos menores a 12 px, 0 errores de consola, 0 respuestas 4xx/5xx, aviso L1 presente, columna de texto del hero ≥ 60 % del ancho en móvil y tableta.
Movimiento reducido: estado final completo y lista de pasos en Flow, Combo y GrowiApp; recorrido de la interfaz con puntos manuales.
Interacción: pausa y seguir, salto con puntos, explorar la interfaz real con teclado, cambio de escenario, rubro, cerámica, galería de Invitaciones.
Aritmética de la simulación: 2 × $3.900 + 1 × $1.700 = $9.500; ingresos $184.500 → $194.000; saldo $147.600 → $157.100; operaciones 47 → 48.

## Pendientes reales
- La relación venta → stock y caja es una simulación rotulada; la demo real no la implementa.
- No se produjo pieza de video: el movimiento HTML/CSS/JS sobre las interfaces reales demuestra mejor el producto, pesa menos y respeta el movimiento reducido.
- Sin probar: teléfono físico, Safari/iOS y lector de pantalla.
- `revision/index.html` sin regenerar.
