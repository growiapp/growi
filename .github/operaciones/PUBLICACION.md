# Publicación manual, recuperación y verificación en producción

Sitio: https://growi.ar/ (GitHub Pages, fuente «GitHub Actions», dominio propio). **Un push o un merge a `main` no publica nada.** Solo publica un `workflow_dispatch` de `static.yml`.

## 1. Publicar
Antes: PR integrado en `main` con merge commit, revisión hecha y `main` en el SHA que se quiere publicar.
1. Actions → «Deploy static content to Pages» → *Run workflow* → rama `main`, fuente `release`.
2. El workflow tiene dos jobs: `build` (checkout con historial completo, `_construir.py --release _site`, `--validate _site`, Pages, subida del artefacto `github-pages`) y `deploy` (`needs: build`, entorno `github-pages`, `actions/deploy-pages`). Solo se despacha desde `main`: el entorno `github-pages` no admite otras ramas.
3. Esperar a que terminen los dos jobs. «Success» no alcanza: hay que verificar el sitio (sección 3).

Si `deploy` falla con *No artifacts named "github-pages" were found*: era la carrera descripta en `actions/deploy-pages#451` (subida y deploy en el mismo job); se corrigió separando los jobs (PR #6). **No usar «Re-run»** sobre un run que ya subió el artefacto (genera un segundo artefacto y falla con *Multiple artifacts*). Despachar un run nuevo; si vuelve a fallar con el mismo error, detenerse y documentar, no agregar esperas.

## 2. Recuperación
Producción no cambia hasta que `deploy` termina bien. Si el run falla antes, **no hay nada que revertir** y no hay que tocar los merges.

Si se publicó una versión defectuosa:
1. Identificar el merge a deshacer (por ejemplo `c4601e1` = PR #5, `3f184bc` = PR #4).
2. `git revert -m 1 <merge>` en una rama nueva desde `main`, PR, merge commit (no force push, no reescribir historial).
3. Despachar `static.yml` (`main`, `release`) y verificar (sección 3).

`respaldo-pre-r3` es un caso aparte: publica el sitio **anterior a R3** (commit `7a2130c…`, verificado contra `.github/recuperacion/pre-r3.sha256`). Usarlo solo si el estado a recuperar es ese. Antes de la publicación de F8 el sitio vivo era R3 (run #47, `main@4fc28ce`), de modo que para volver a ese estado corresponde revertir los merges, no `respaldo-pre-r3`.

Estado de referencia anterior a F8: `evidencia` en `D:\Documentos\respaldos-growi\f8-9c\publicacion\` (`prod-*-ANTES.*`, `SHA256-prod-antes.txt`).

## 3. Verificación en producción
Hacerla siempre, también tras una recuperación. No declarar «publicado» hasta cumplirla.
1. **Es la versión nueva:** `curl -sI https://growi.ar/` → `Last-Modified` posterior al run. Comparar los archivos con el release de ese SHA (`_construir.py --release <dir>` y comparar byte a byte; el release local en Windows puede diferir solo en saltos de línea).
2. **Home:** demo de Centro Ribera con sus 3 etapas en orden, CTA y menú; sin recursos fallidos.
3. **Invitaciones (`/invitaciones/`):** 4 etapas; «Probar la invitación completa» abre el módulo real; validación del formulario; el RSVP de muestra arma el mensaje con «no se envía nada»; Esc y «Cerrar» cierran y devuelven el foco al botón. Sin pedidos de red con datos del RSVP ni aperturas de WhatsApp.
4. **Resto:** menú móvil, planes, páginas comerciales, `/combo/`, fuentes, imágenes, enlaces.
5. **SEO:** `robots.txt` (`Allow: /` + sitemap), `sitemap.xml` (12 URL, todas 200), `canonical` `https://growi.ar/…` en cada página, `index, follow` en las comerciales y `noindex` solo en las demos. Sin referencias a `localhost`/`127.0.0.1`.
6. **Navegador:** consola sin errores ni advertencias; sin desborde horizontal a 320, 390, 768 y 1440 px.
7. **Lighthouse** (móvil y escritorio) en Home, Invitaciones y Combo.
Baterías automatizadas: `propuesta-rediseno/candidata-360-r3/verificacion/navegador/` (ver su `README.md`) y `node --test propuesta-rediseno/candidata-360-r3/pruebas/*.test.mjs` (la prueba `validador-jsonld` necesita historial completo de git).

## 4. Datos útiles
- Pipeline de generación: `propuesta-rediseno/candidata-360-r3/_construir.py` (`--release DIR`, `--validate DIR`). Clonar con `core.autocrlf=false`.
- Tipo de cambio: ver `TIPO-DE-CAMBIO.md` (workflow deshabilitado).
- Cambios de la cotización o de workflows: siempre por PR; no tocar `static.yml` salvo decisión explícita.
