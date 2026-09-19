# Growi — growi.ar

Sitio web y assets de marca de Growi.

## Estructura del repositorio

```
index.html          Home
app/index.html      GrowiApp (sistema de gestión)
app/<rubro>/        Landings por rubro: cafeterias, peluquerias, talleres, retail
combo/              Combo sitio web + sistema
web/index.html      GrowiWeb (desarrollo web)
flow/index.html     GrowiFlow (automatizaciones e IA)
privacidad/         Política de privacidad
terminos/           Términos
shared.css          Estilos compartidos por todas las páginas
shared.js           Comportamiento compartido (nav, menú, toggle de moneda, reveal, tracking)
shared.fx.js        Tipo de cambio (dólar oficial venta). Lo actualiza un GitHub Action; no editar a mano
manifest.json       PWA manifest
CNAME               Dominio personalizado (growi.ar)
favicon/ png/        Íconos (generados desde png/isotipo_growi_320.png) e imágenes OG
```

## Precios

La fuente de verdad es USD: cada precio vive en el HTML como `data-price="15"`. El valor en ARS se deriva
del tipo de cambio de `shared.fx.js` (redondeado al millar desde $100.000 y a la centena por debajo).
`.github/workflows/tipo-de-cambio.yml` corre los lunes, consulta dolarapi.com y solo commitea si la variación
supera 3%. Si la API falla, el sitio sigue con el último valor y se abre un issue. Para cambiar un precio,
se edita el número en USD y se corre `node .github/scripts/actualizar-cambio.mjs --force`.

## Deploy

GitHub Pages en `growi.ar`. Cada push a `main` publica automáticamente.

## Marca

- Negro: `#0C0C0C` · Verde: `#1A6B47` · Off-white: `#F6F6F4`
- Logo / wordmark: Syne 800 (ExtraBold)
- UI y textos: Epilogue

## Contacto

hola@growi.ar
