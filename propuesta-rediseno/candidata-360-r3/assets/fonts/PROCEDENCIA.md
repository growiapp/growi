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
- **Ubicaciones (una por cada copia distribuida del binario):** `fonts/` (raíz; lo usan las páginas L1 con `/fonts/…`), `propuesta-rediseno/candidata-360-r3/assets/fonts/` (páginas y sandboxes de la candidata) y `propuesta-rediseno/candidata-360-r3/vendor/fonts/` (`vendor/shared.css`). Las tres copias de cada binario son idénticas.

## Resto de las familias (trazabilidad disponible)
| Familia | Archivos | Aviso embebido | Licencia incluida | Observaciones |
|---|---|---|---|---|
| Fraunces | `fraunces-ix.woff2`, `fraunces-italic-ix.woff2` | ninguno (tabla `name` sin copyright ni licencia) | `OFL-Fraunces.txt` (© 2018 The Fraunces Project Authors, github.com/undercasetype/Fraunces) | Instancias derivadas de la variable (nombre interno «Fraunces-9ptBlack», eje wght 100–900, 225 glifos). Procedencia de la instancia no registrada en el repositorio. Sin «Reserved Font Name». |
| Schibsted Grotesk | `schibsted-grotesk-ix.woff2` | ninguno | `OFL-SchibstedGrotesk.txt` (© 2023 The Schibsted-Grotesk Project Authors) | Instancia derivada (v1.100, wght 400–800, 249 glifos). Procedencia de la instancia no registrada. Sin «Reserved Font Name». |
| Instrument Serif | `instrument-serif-latin.woff2`, `instrument-serif-italic-latin.woff2` | © 2022 The Instrument Serif Project Authors | `OFL-InstrumentSerif.txt` | Sin «Reserved Font Name». |
| IBM Plex Mono | `IBMPlexMono-Regular-latin.woff2`, `IBMPlexMono-SemiBold-latin.woff2` | © 2017 IBM Corp. (sin licencia embebida) | `OFL-IBMPlexMono.txt` | **Declara «Reserved Font Name "Plex"».** Los archivos son subconjuntos Latin (`-latin`) que conservan el nombre «IBM Plex Mono». Pendiente de revisión humana si un subconjunto cuenta como versión modificada que no puede usar el nombre reservado. |
| Familjen Grotesk, Hanken Grotesk | `demos/web/centro-ribera/assets/fonts/` | © 2021 de cada proyecto | `OFL-FamiljenGrotesk.txt`, `OFL-HankenGrotesk.txt` | Sin «Reserved Font Name». |

## Limitaciones
- Los binarios `-ix` y `-latin` son subconjuntos o instancias derivadas; no se ha podido reconstruir de qué versión upstream salió cada uno.
- Los textos de las licencias de Fraunces, Instrument Serif, Schibsted, IBM Plex, Familjen y Hanken no se recotejaron en esta fase contra sus repositorios; solo se verificó su presencia y su primera línea.
- Corrección a un registro previo: «ninguna licencia declara Reserved Font Name» era incorrecto para IBM Plex Mono.
