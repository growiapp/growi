# Fuentes tipográficas de la demo

Descargadas el 2026-11-17 solo para este prototipo, desde el repositorio oficial de Google Fonts, sin costo. Alojadas dentro de `assets/fonts/`. No se instaló ninguna tipografía en el sistema.

| Familia | Origen | Licencia | Archivo original | Archivo usado |
|---|---|---|---|---|
| Familjen Grotesk (variable, peso 400 a 700) | https://github.com/google/fonts/tree/main/ofl/familjengrotesk (proyecto: https://github.com/Familjen-Sthlm/Familjen-Grotesk) | SIL Open Font License 1.1 (copyright 2021 The Familjen Grotesk Project Authors) | `FamiljenGrotesk[wght].ttf`, 90 KB | `assets/fonts/FamiljenGrotesk-latin.woff2`, 17 KB |
| Hanken Grotesk (variable, peso 100 a 900) | https://github.com/google/fonts/tree/main/ofl/hankengrotesk (proyecto: https://github.com/marcologous/hanken-grotesk) | SIL Open Font License 1.1 (copyright 2021 The Hanken Grotesk Project Authors) | `HankenGrotesk[wght].ttf`, 133 KB | `assets/fonts/HankenGrotesk-latin.woff2`, 34 KB |

Los textos de licencia están en `assets/fonts/OFL-FamiljenGrotesk.txt` y `assets/fonts/OFL-HankenGrotesk.txt`.

Tratamiento local: subconjunto latino (U+0020-007E, U+00A0-00FF, puntuación general y flechas) con `fontTools` y `brotli`, conservando el eje de peso variable. Se verificó que están todos los glifos del español (ñ, vocales con tilde, ü, ¿, ¡, °).
