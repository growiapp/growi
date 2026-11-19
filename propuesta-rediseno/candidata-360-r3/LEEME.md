# Growi 360° · candidata R3 · paquete de revisión

Local y no publicada. Nada de esto está en producción. Growi sigue en modalidad L1: solo recibe consultas, sin contratación ni pagos.

## Cómo abrirla

Necesita un servidor local (los marcos con las demos no cargan con doble clic en todos los navegadores).

- Windows: doble clic en `servir.bat` y se abre http://localhost:8800/
- O desde esta carpeta: `python -m http.server 8800` y abrir http://localhost:8800/

## Recorrido

- `index.html`: home. «¿Qué necesitás resolver?» (selector por necesidad con demos), caso Colo Café, banda de Invitaciones, armador de consulta.
- `app/` (GrowiApp) y `app/cafeterias/`, `app/peluquerias/`, `app/talleres/`, `app/retail/`.
- `web/` (GrowiWeb), `flow/` (GrowiFlow), `combo/`, `invitaciones/`.
- `revision/index.html`: qué cambió en R3.1, antes y después, pruebas, skills, crítica independiente y dictamen.
- `revision/pricing.html`: recomendación de pricing (no aplicada), con supuestos y escenarios de margen.

## Qué contiene

- `assets/` (estilos, script, tipografías e imágenes), `vendor/` (compartidos del sitio y recursos de las demos), `demos/` (GrowiApp, Centro Ribera, taller de cerámica e Invitaciones). Todo está dentro de esta carpeta.
- Los enlaces a términos y privacidad apuntan al sitio publicado (https://growi.ar). Todo lo demás es local.
- Los botones de WhatsApp abren wa.me con el mensaje armado. No se envía nada solo.

## Regenerar

- `python _construir.py` regenera todas las páginas y la demo de Invitaciones (Python 3, sin dependencias).
- `python -B _construir.py --release CARPETA_NUEVA` ensambla y valida un paquete público R3/L1 completo en una carpeta nueva. No reescribe la candidata ni publica nada. Falla si faltan recursos o si la carpeta ya contiene archivos.
- `python -B _construir.py --validate CARPETA` vuelve a verificar un paquete existente. Serví **esa carpeta** con `python -B -m http.server` para la prueba de navegador.
- El paquete incluye solo las diez páginas R3, demos y recursos necesarios, las páginas L1 complementarias y legales, recursos compartidos, sitemap, robots y CNAME. Excluye `revision/`, evidencias, generadores, prototipos, respaldos y ZIP. `.github/workflows/static.yml` está preparado para publicar únicamente `_site` mediante una ejecución manual futura.
- La cotización fuente es `shared.fx.js` en la raíz del repositorio. `vendor/shared.fx.js` es una copia de vista previa local; no entra al paquete y el actualizador semanal la sincroniza junto con los HTML de la candidata actual.
