# Procedencia y licencias de las fuentes

Documento de trabajo del repositorio (no se publica: el release solo copia archivos `OFL-*.txt`, no `.md`). Registra qué se distribuye, con qué licencia y qué quedó sin verificar.
**No es un dictamen jurídico.** Los textos de licencia son los originales y no se editan.

## Epilogue y Syne — textos OFL incorporados (F6.3)
| Familia | Binario distribuido (SHA-256, 12 hex) | Aviso embebido en el binario | Texto OFL (SHA-256, 16 hex) | Fuente del texto |
|---|---|---|---|---|
| Epilogue | `epilogue-latin.woff2` `943ab208b058`, v2.112, variable wght 100–900 | © 2020 The Epilogue Project Authors (github.com/Etcetera-Type-Co/Epilogue), OFL | `95ebd6a2e4035b83` | `google/fonts` `ofl/epilogue/OFL.txt` (último cambio 2021-08-05) idéntico byte a byte al `OFL.txt` del repositorio upstream (rama master) |
| Syne | `syne-800-latin.woff2` `1a340e84b78c`, v2.200 ExtraBold estático | © 2019 The Syne Project Authors (gitlab.com/bonjour-monde/fonderie/syne-typeface), OFL | `cc43cdce6f91c579` | `google/fonts` `ofl/syne/OFL.txt` (último cambio 2022-03-03) idéntico byte a byte al `OFL.txt` del GitLab upstream (rama master) |

- **Discrepancia conocida (Syne):** el texto OFL oficial dice «Copyright 2017»; el binario y los metadatos de Google Fonts dicen 2019. Es una inconsistencia del propio upstream; el texto se conserva tal cual.
- Ninguna de las dos licencias declara «Reserved Font Name».
- Los textos oficiales tienen un espacio final en la línea 21 (igual que los de Fraunces, Instrument Serif y Schibsted). `.gitattributes` excluye `OFL-*.txt` de la regla de espacios finales de `git diff --check` para no alterarlos.
- **Finales de línea (F6.4):** los textos oficiales usan LF. En Windows con `core.autocrlf=true` un checkout los convertía en CRLF y el release los publicaba distintos de los oficiales. `.gitattributes` fija `OFL-*.txt text eol=lf` (y `*.sh`, `.github/recuperacion/*.sha256` en LF, `*.woff2` binario). `pruebas/licencias.test.mjs` distingue **equivalencia textual** (igual salvo fin de línea) de **identidad binaria** (bytes exactos, sin CRLF).
- **Ubicaciones (una por cada copia distribuida del binario):** `fonts/` (raíz; lo usan las páginas L1 con `/fonts/…`), `propuesta-rediseno/candidata-360-r3/assets/fonts/` (páginas y sandboxes de la candidata) y `propuesta-rediseno/candidata-360-r3/vendor/fonts/` (`vendor/shared.css`). Las tres copias de cada binario son idénticas.

## Resto de las familias (trazabilidad disponible)
| Familia | Archivos | Aviso embebido | Licencia incluida | Observaciones |
|---|---|---|---|---|
| Fraunces | `fraunces-ix.woff2`, `fraunces-italic-ix.woff2` | ninguno (tabla `name` sin copyright ni licencia) | `OFL-Fraunces.txt` (© 2018 The Fraunces Project Authors, github.com/undercasetype/Fraunces) | Instancias derivadas de la variable (nombre interno «Fraunces-9ptBlack», eje wght 100–900, 225 glifos). Procedencia de la instancia no registrada en el repositorio. Sin «Reserved Font Name». |
| Schibsted Grotesk | `schibsted-grotesk-ix.woff2` | ninguno | `OFL-SchibstedGrotesk.txt` (© 2023 The Schibsted-Grotesk Project Authors) | Instancia derivada (v1.100, wght 400–800, 249 glifos). Procedencia de la instancia no registrada. Sin «Reserved Font Name». |
| Instrument Serif | `instrument-serif-latin.woff2`, `instrument-serif-italic-latin.woff2` | © 2022 The Instrument Serif Project Authors | `OFL-InstrumentSerif.txt` | Sin «Reserved Font Name». |
| IBM Plex Mono | `IBMPlexMono-Regular-latin.woff2`, `IBMPlexMono-SemiBold-latin.woff2` | © 2017 IBM Corp. (sin licencia embebida) | `OFL-IBMPlexMono.txt` | **Declara «Reserved Font Name "Plex"».** Ver la sección siguiente: los binarios son una versión modificada (subconjunto Latin WOFF2) y desde F6.4 llevan el nombre «Growi Mono». |
| Familjen Grotesk, Hanken Grotesk | `demos/web/centro-ribera/assets/fonts/` | © 2021 de cada proyecto | `OFL-FamiljenGrotesk.txt`, `OFL-HankenGrotesk.txt` | Sin «Reserved Font Name». |

## IBM Plex Mono y el nombre reservado (F6.4)
- **Hallazgo:** los binarios distribuidos son la versión de fuente 2.3 (la misma que sirve Google Fonts) en subconjuntos `-latin` con 205 caracteres; no son idénticos byte a byte a los que sirve Google Fonts (`fonts.gstatic.com`, v23) ni al upstream actual de IBM (v2.005, que además dibuja 6 de esos caracteres de otra forma, entre ellos la «r»). Su recorrido exacto (quién los subconjuntó) no está registrado: **procedencia no verificable**.
- **Riesgo:** la OFL prohíbe que una versión modificada (subconjunto, cambio de formato) use el nombre reservado; el nombre interno del binario era «IBM Plex Mono».
- **Corrección aplicada (mínima, verificable, sin impacto visual):** se renombró la familia dentro de la tabla `name` (ids 1, 3, 4 y 6: «IBM Plex Mono» → «Growi Mono»; el aviso de copyright, id 0, se conserva) con `verificacion/fuentes/renombrar-ibm-plex-mono.py`, que además comprueba que las demás tablas (contornos, anchos, kerning y tablas OpenType: 16 en Regular, 17 en SemiBold) quedan idénticas byte a byte (salvo `head.checkSumAdjustment`, que depende del archivo entero).
  - SHA-256 (12 hex) antes → después: Regular `c4655d307726` → `ade1939bb06d`; SemiBold `80bf52b08901` → `fde8413141f4`.
  - La etiqueta CSS `font-family: "IBM Plex Mono"` no cambia: es un rótulo de la hoja de estilos, no el nombre del binario.
  - Verificado en navegador (contexto sin caché, 6 páginas × 1440/390 px): se cargan los binarios nuevos y el ancho/alto de los 6–98 elementos con esa tipografía por página es idéntico antes y después.
  - `pruebas/licencias.test.mjs` falla si algún nombre de esos binarios vuelve a contener «Plex».
- **Alternativa descartada:** reemplazar los subconjuntos por los WOFF2 originales de IBM (sin modificar, v2.005) cambiaría el dibujo de 6 caracteres y pesaría ~3,5 veces más.
- Lo que no se puede cerrar con evidencia: de dónde salió exactamente el subconjunto original.

## Limitaciones
- Los binarios `-ix` y `-latin` son subconjuntos o instancias derivadas; no se ha podido reconstruir de qué versión upstream salió cada uno.
- Los textos de las licencias de Fraunces, Instrument Serif, Schibsted, IBM Plex, Familjen y Hanken no se recotejaron en esta fase contra sus repositorios; solo se verificó su presencia y su primera línea.
- Corrección a un registro previo: «ninguna licencia declara Reserved Font Name» era incorrecto para IBM Plex Mono (ya tratado arriba).
