# Growi 360° · candidata r2 (cierre de dirección) · paquete de revisión

Local y no publicada. Nada de esto está en producción.

## Cómo abrirla

Necesita un servidor local (los marcos con las demos no cargan con doble clic en todos los navegadores).

- Windows: doble clic en `servir.bat` y abrir http://localhost:8800/
- O desde esta carpeta: `python -m http.server 8800` y abrir http://localhost:8800/

Recorrido: `index.html` (home con el explorador de producto), `app/`, `web/` y `revision/index.html` (comparativa, verificación y matriz económica).

## Qué contiene y de qué depende

- `assets/`, `vendor/` (compartidos y tipografías del sitio), `demos/` (demo real de GrowiApp, Centro Ribera y taller de cerámica) y `evidencia/` están dentro de esta carpeta. No hace falta el resto del repositorio.
- Los enlaces a GrowiFlow, Combo, Invitaciones, términos y privacidad apuntan al sitio publicado (https://growi.ar). Sin conexión no abren; el recorrido no depende de ellos.
- Los botones de WhatsApp abren wa.me con el mensaje armado. No se envía nada solo.
- Se quitó la analítica de las demos incluidas.

## Regenerar

`python _construir.py` regenera `index.html`, `app/index.html` y `web/index.html`. `python revision/_docs_r2.py && python revision/_docs_r2b.py` regenera la documentación (Python 3, sin dependencias).
