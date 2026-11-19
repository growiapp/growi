# Cierre puntual de R3.5 (parte de f46b14d)

## 1. Combo en escritorio
Con la columna de contenido de 1000 px o más (1440 px incluido) el teléfono pasó de 250 a 320 px de ancho, el plano usa tipografía de portada y los cinco pasos se muestran como una columna propia a la derecha, cada uno con su actor (Visitante, Persona del centro, Herramienta). Se conserva la secuencia, los cinco pasos, el rótulo del plano y la aclaración de que es una demostración conceptual. El precio de la venta ahora ocupa su propia línea. Por debajo de 1000 px el diseño es el de antes (en 739 y 390 px no cambia).

## 2. Exactitud de GrowiApp
Qué es el material: `demos/app.html` es un panel de demostración («Dashboard mockup» en el código) con datos ilustrativos; la propia demo dice «Los datos son ilustrativos. La configuración real se adapta a tu negocio». No es el sistema de un cliente en producción, no registra ventas y no calcula caja ni stock. Las cifras del Resumen que cambian en el hero son una simulación.

| Antes | Ahora |
|---|---|
| «GrowiApp, interfaz real · Café Central» | «Demo de GrowiApp · negocio de ejemplo: Café Central» |
| Barra del marco: `growi.ar/dashboard` (parecía una URL real) | «Demo de GrowiApp · datos de ejemplo» |
| Paso 2: «Interfaz real · cifras simuladas» | «Demo · cifras simuladas» |
| Paso 3: «Ejemplo de stock» | «Ejemplo ficticio» |
| Nota: «Las cifras que cambian son de ejemplo. La demo real es una maqueta sin cálculo…» | «Los números que cambian son una simulación con datos de ejemplo. Esta demo no registra ventas ni calcula caja o stock; cómo se conectan se define al armar el sistema.» |
| Título del iframe: «Interfaz real de GrowiApp…» | «Demo de GrowiApp con datos de ejemplo» |
| Sección: «La interfaz real» / subnav «La interfaz» | «La demo de GrowiApp» / «La demo» |

Sin cambios: capacidades, precios, condiciones, promesas y aviso L1.

## Verificación
- Mismos estados y scroll (`.cj4` a 90 px del borde; pasos 1, 3 y 5 a 1440; 5 a 1024 y 739; 3 a 390), servidor local con f46b14d extraído para el «antes».
- 10 páginas × 390, 739, 1024 y 1440 px: 0 desbordes, 0 textos menores a 12 px, 0 respuestas fallidas, aviso L1 presente y ninguna aparición de «interfaz real», «maqueta» o `growi.ar/dashboard` en el texto visible. Un único error de consola transitorio (conexión rechazada) en una carga de la home a 390 px que no se reprodujo en tres recargas.
- Movimiento reducido (1440 y 390 px): Combo en 5/5 y GrowiApp en 4/4 con la lista de pasos visible y las cifras del Resumen en su estado final.
- Controles: salto por puntos y rail en Combo, sin regresiones.

## Archivos
- `combo-escritorio-antes-despues.png`, `combo-otros-anchos-antes-despues.png`
- `app-rotulos-antes-despues-1440.png`, `app-rotulos-antes-despues-390.png`
- `combo-escritorio.mp4`: grabación real del recorrido a 1440×900.
