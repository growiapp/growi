# Auditoría del workflow «Actualizar tipo de cambio»

Estado al 2026-11-24: **deshabilitado** (`disabled_manually`). No se reactivó. Este documento es la propuesta.

## Qué hace
`.github/workflows/tipo-de-cambio.yml` corre los lunes 12:00 UTC (y a mano). Ejecuta `.github/scripts/actualizar-cambio.mjs`:
1. Consulta `dolarapi.com/v1/dolares/oficial` (venta). Reintenta 3 veces. Si falla, el job falla y abre un issue (uno solo).
2. Si la variación contra `shared.fx.js` es ≤ 3 %, no cambia nada. Si es > 40 % se detiene (hace falta `--force`).
3. Si hay cambio, reescribe **21 archivos**: `shared.fx.js` y `candidata-360-r3/vendor/shared.fx.js`, el texto ARS de las 9 páginas con `data-price` de la raíz y las mismas 9 de `candidata-360-r3/`, y `lastmod` de `sitemap.xml`.
4. Hace `git commit` y `git push` **directo a `main`** (con `GITHUB_TOKEN`, que no dispara otros workflows).
5. Solo despacha `static.yml` si la variable de repositorio `GROWI_AUTO_FX_DEPLOY` vale `true`. Hoy no existe.

## ¿La versión publicada depende del cron?
No para seguir publicada. Sí para los números: el release se arma con `_construir.py`, que lee la cotización **de `shared.fx.js` de la raíz** (hoy 1590, 2026-11-20) y calcula los precios en pesos. El cron es solo la forma de mantener ese número al día.
Cotización oficial de venta el 2026-11-24: 1600 (+0,6 %): bajo el umbral, el cron no habría cambiado nada.

## Simulación (copia local descartable, sin red ni push)
Con `--venta=1700 --fecha=2026-11-24 --force` sobre `main@7229f1c`:
- Escribe los 21 archivos previstos, sin errores.
- **Regenerar con los generadores después del cron da 0 diferencias**: lo que escribe el cron es idéntico a lo que producen los generadores.
- `_construir.py --release` y `--validate` pasan (182 archivos) y los precios salen bien (por ejemplo USD 15 → `$25.500`).
- `invitaciones/` no tiene precios y no se toca.

## Riesgos de sobrescritura
1. **Publicación del estado completo de `main`.** Con `GROWI_AUTO_FX_DEPLOY=true`, el cron despacha `static.yml` y se publica *todo* lo que haya en `main` en ese momento, no solo los precios. Si `main` tuviera algo sin revisar, saldría a producción sin pasar por una persona.
2. **Push directo a `main`.** Sin PR ni revisión; si `main` avanzó entre el checkout y el push, el push falla (el job abre el issue).
3. **21 archivos de HTML.** Cualquier rama abierta que regenere esas páginas entra en conflicto con el commit del cron.
4. **Precios ≠ producto aprobado.** El cron no valida el sitio completo antes de commitear (la validación corre recién en `static.yml`).

## Propuesta (para decidir; nada de esto está aplicado)
Mantener el cron **deshabilitado** hasta aplicar, en un PR aparte limitado a `tipo-de-cambio.yml`:
1. En lugar de `git push` a `main`: crear una rama `cambio-AAAA-MM-DD` y abrir un PR (requiere `pull-requests: write`). Se revisa y se integra con merge commit.
2. Antes del commit, correr en el job `python -B propuesta-rediseno/candidata-360-r3/_construir.py` y exigir 0 diferencias adicionales, y `--release` + `--validate` sobre un directorio temporal.
3. **No** definir `GROWI_AUTO_FX_DEPLOY`. La publicación sigue siendo manual (`static.yml`, fuente `release`) después de integrar el PR.
4. Reactivar el workflow recién cuando el punto 1 esté probado con un `workflow_dispatch` y `--force` en una rama de prueba.

Alternativa descartada: que el cron toque solo `shared.fx.js` y el HTML se regenere al publicar. Obliga a dejar de versionar el HTML generado y a cambiar la prueba «regenerar = 0 cambios»: es un cambio de arquitectura y requiere decisión aparte.

## Mientras siga deshabilitado
Los precios en pesos quedan en 1590. Revisar la cotización cada tanto: si se separa más de ~3 %, correr a mano `node .github/scripts/actualizar-cambio.mjs` en una rama, regenerar, abrir PR y publicar manualmente.
