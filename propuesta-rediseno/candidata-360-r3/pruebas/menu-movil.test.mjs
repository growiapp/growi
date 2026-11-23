// F8.1C + F8.3B · el menú móvil y la navegación principal: semántica de «página actual» correcta, indicador discreto, tarjeta que no tapa el botón de cierre
// y botón cuyo texto visible dice lo que hace.
//   aria-current="page"  → solo el enlace de la página exacta (Home marca «Inicio»; cada línea, su propia página).
//   aria-current="true"  → la sección actual cuando se está en una subpágina (los rubros de GrowiApp marcan GrowiApp, que NO es la misma página).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const R = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const leer = f => readFileSync(join(R, f), 'utf8');
const CSS = leer('assets/growi360.css') + leer('assets/growi81.css');
// ruta → [destino marcado, valor de aria-current]
const ESPERADO = {
  'index.html': ['/', 'page'], 'app/index.html': ['/app/', 'page'], 'web/index.html': ['/web/', 'page'], 'flow/index.html': ['/flow/', 'page'],
  'combo/index.html': ['/combo/', 'page'], 'invitaciones/index.html': ['/invitaciones/', 'page'],
  'app/cafeterias/index.html': ['/app/', 'true'], 'app/peluquerias/index.html': ['/app/', 'true'], 'app/talleres/index.html': ['/app/', 'true'], 'app/retail/index.html': ['/app/', 'true'],
};
const norm = h => h.replace(/^(\.\.\/)+|^\.\//, '/').replace(/^([^/])/, '/$1').replace(/^\/\/+/, '/');
const marcados = bloque => [...bloque.matchAll(/<a [^>]*href="([^"]*)"[^>]* aria-current="([^"]*)"/g)].map(x => [norm(x[1]), x[2]]);
for (const [ruta, [dest, valor]] of Object.entries(ESPERADO)) {
  test('F8.3B menú móvil · estado actual de ' + ruta, () => {
    const h = leer(ruta), m = /<div class="mobile-menu"[\s\S]*?<\/div><\/div>/.exec(h);
    assert.ok(m, 'sin menú móvil');
    const act = marcados(m[0]);
    assert.equal(act.length, 1, JSON.stringify(act));
    assert.equal(act[0][1], valor, ruta + ' → ' + JSON.stringify(act));
    if (dest === '/') assert.ok(/<a href="[^"]*" aria-current="page">Inicio/.test(m[0]), 'Home marca «Inicio»');
    else { assert.equal(/aria-current="[^"]*">Inicio/.test(m[0]), false); assert.ok(act[0][0].endsWith(dest) || act[0][0] === dest, JSON.stringify(act)); }
  });
  test('F8.3B navegación principal · estado actual de ' + ruta, () => {
    const h = leer(ruta), nav = /<nav class="nav" aria-label="Principal">[\s\S]*?<\/nav>/.exec(h);
    assert.ok(nav);
    const act = marcados(nav[0]);
    if (dest === '/') assert.deepEqual(act, []);   // el logotipo no es un enlace de navegación principal
    else { assert.equal(act.length, 1, JSON.stringify(act)); assert.equal(act[0][1], valor); }
  });
}
test('F8.3B · una subpágina nunca presenta la línea como «la misma página» y el script compartido no pisa el valor', () => {
  for (const r of ['app/cafeterias/index.html', 'app/peluquerias/index.html', 'app/talleres/index.html', 'app/retail/index.html']) assert.equal(/aria-current="page"/.test(leer(r).split('</header>')[0] + leer(r).match(/<div class="mobile-menu"[\s\S]*?<\/div><\/div>/)[0]), false, r);
  for (const f of ['../../shared.js', 'vendor/shared.js']) {
    const js = leer(f);
    assert.ok(/!a\.hasAttribute\('aria-current'\)/.test(js) && /'page' : 'true'/.test(js), f);   // exacta → page; prefijo → true; no pisa lo ya declarado
    assert.equal(/a\.setAttribute\('aria-current', 'page'\);/.test(js), false, f);
  }
  assert.equal(leer('../../shared.js'), leer('vendor/shared.js'));   // la copia de vendor/ no se aparta de la raíz
});
test('F8.3B menú móvil · el botón dice «Menú» cerrado y «Cerrar» abierto, y su nombre accesible contiene el texto visible', () => {
  const h = leer('index.html'), js = leer('../../shared.js');
  assert.ok(/<button class="menu-btn" id="menuBtn"[^>]*aria-label="Abrir menú"[^>]*>Menú<\/button>/.test(h));
  assert.ok(/menuBtn\.textContent = open \? 'Cerrar' : 'Menú'/.test(js));
  assert.ok(/open \? 'Cerrar menú' : 'Abrir menú'/.test(js));   // «Cerrar» ⊂ «Cerrar menú», «Menú» ⊂ «Abrir menú»
  assert.ok(/classList\.contains\('menu-btn'\)/.test(js));       // los botones de ícono de otras páginas no se tocan
});
test('F8.3B menú móvil · el indicador activo (página o sección) es una barra vertical, no una banda amarilla', () => {
  const regla = /\.mobile-menu-card a\[aria-current\]:not\(\[aria-current="false"\]\)\{([^}]*)\}/.exec(CSS);
  assert.ok(regla, 'falta la regla del activo');
  assert.equal(/gradient|marcador|#f4d03f|yellow/i.test(regla[1]), false);
  assert.ok(/inset 3px 0 0 var\(--verde\)/.test(regla[1]));
  assert.equal(/\[aria-current="page"\]/.test(CSS), false, 'ninguna regla puede depender solo de «page»');
});
test('F8.1C menú móvil · la tarjeta queda bajo la barra, no excede la ventana y la barra queda sobre el velo', () => {
  const card = /\.mobile-menu-card\{([^}]*)\}/.exec(CSS)[1], velo = /\.mobile-menu\{([^}]*)\}/.exec(CSS)[1], barra = /\.top\{([^}]*)\}/.exec(CSS)[1];
  assert.ok(/top:76px/.test(card) && /max-height:calc\(100dvh - 88px\)/.test(card) && /overflow-y:auto/.test(card));
  assert.ok(+/z-index:(\d+)/.exec(velo)[1] < +/z-index:(\d+)/.exec(barra)[1]);   // el botón «Cerrar menú» se puede tocar
});
