// Coherencia entre las escenas comerciales y la sandbox: las cifras de la escena de GrowiApp salen de la sandbox de Café Nogal, no de otro escenario.
// Se lee la página generada (app/index.html) y se la compara con el estado real que produce la lógica de F1 tras la venta guía.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import core from '../assets/sandbox/core.js';
import cafe from '../assets/sandbox/cafeteria.js';

const leer = (r) => fs.readFileSync(new URL('../' + r, import.meta.url), 'utf8');
const S = cafe.sel;

function ventaGuia() {
  const st = cafe.crear(), antes = st.getState();
  for (const [p, c] of [['FW', 2], ['ML', 1]]) assert.equal(st.dispatch('agregarProducto', { producto: p, cantidad: c }).ok, true);
  assert.equal(st.dispatch('cobrar', { medio: 'efectivo', recibido: 10000 }).ok, true);
  return { antes, ahora: st.getState() };
}
const pct = core.porcentaje;

test('GrowiApp: las cifras de la escena del hero son las de Café Nogal antes y después de la venta guía', () => {
  const { antes, ahora } = ventaGuia(), html = leer('app/index.html');
  const num = [...html.matchAll(/data-num="([^"]+)"/g)].map((m) => m[1].split('|'));
  const pares = num.map((a) => [+a[0], +a[1]]);
  const r0 = S.resumen(antes), r1 = S.resumen(ahora);
  assert.deepEqual(pares[0], [r0.efectivoEsperado, r1.efectivoEsperado]);                    // efectivo esperado en caja 74.700 → 84.200
  assert.deepEqual(pares[1], [r0.ventas, r1.ventas]);                                         // ventas del turno 142.400 → 151.900
  const ml = (s) => S.catalogo(s).find((p) => p.id === 'ML').stock;
  assert.deepEqual(pares[2], [ml(antes), ml(ahora)]);                                         // medialunas 13 → 12
  assert.equal(num.length, 3, 'no debe haber otras cifras animadas sin respaldo en la sandbox');
  assert.equal(r1.efectivoEsperado - r0.efectivoEsperado, 9500);
  assert.match(html, /\+ \$9\.500/); assert.match(html, /Total<\/span><b>\$9\.500/);
});
test('GrowiApp: desglose por medio de pago, stock restante y barras salen del mismo estado', () => {
  const { ahora } = ventaGuia(), html = leer('app/index.html'), r = S.resumen(ahora), pm = r.porMedio, $ = core.pesos;
  assert.ok(html.includes('Efectivo ' + $(pm.efectivo) + ' · Transferencia ' + $(pm.transferencia) + ' · Mercado Pago ' + $(pm.mercadopago)));
  for (const k of ['efectivo', 'transferencia', 'mercadopago']) assert.ok(html.includes('flex:' + pm[k] + ';'), 'segmento ' + k);
  const aper = ahora.config.stockApertura, cat = S.catalogo(ahora), stock = (id) => cat.find((p) => p.id === id).stock;
  assert.equal(stock('TO'), 9); assert.ok(html.includes('<b>' + stock('TO') + ' u.</b>'));
  assert.ok(html.includes('--w1:' + pct(13, aper.ML) + '%;--w2:' + pct(stock('ML'), aper.ML) + '%'));     // 42 % → 39 %
  assert.ok(html.includes('--w1:' + pct(stock('TO'), aper.TO) + '%;--w2:' + pct(stock('TO'), aper.TO) + '%'));
  assert.equal(html.includes('Leche'), false); assert.equal(html.includes('194.000'), false); assert.equal(html.includes('157.100'), false);   // cifras anteriores, sin respaldo
});
test('Invitaciones: no quedan las etiquetas vacías rechazadas y cada experiencia muestra su programa real', () => {   // F4.1: las escenas de estilos se reemplazaron por tres experiencias con programa propio
  const html = leer('invitaciones/index.html') + leer('index.html');
  for (const t of ['Cálido y elegante', 'Color y energía', 'Sobrio y claro']) assert.equal(html.includes(t), false, t);
  const inv = leer('invitaciones/index.html');
  for (const t of ['Ceremonia', 'Cóctel', 'Cena', 'Baile', 'Brindis', 'Torta y baile', 'Acreditación', 'Mesas de trabajo', 'Cierre y brindis']) assert.ok(inv.includes('>' + t + '<') || inv.includes('<b>' + t + '</b>') || inv.includes(t), t);
});
test('Talleres: la escena cuenta un solo estado (presupuesto enviado, esperando aprobación, entrega sin fecha firme)', () => {
  const html = leer('app/talleres/index.html');
  assert.ok(html.includes('Presupuesto enviado al cliente')); assert.ok(html.includes('Esperando aprobación'));
  assert.equal(html.includes('En reparación'), false); assert.equal(html.includes('Entrega prometida'), false);
  assert.ok(html.includes('La fecha de entrega se confirma cuando se apruebe el presupuesto.'));
});
test('Combo y Home: la escena ya no usa el tablero genérico y conserva el paso humano', () => {
  for (const r of ['combo/index.html', 'index.html']) {
    const html = leer(r);
    assert.equal(html.includes('combo-app-m'), false, r); assert.ok(html.includes('Agenda de Centro Ribera'), r);
    assert.ok(html.includes('Una persona del centro responde y lo carga'), r); assert.ok(html.includes('Registro administrativo'), r);
  }
});
test('Ninguna página comercial enlaza la demo genérica retirada ni promete «probarla»', () => {
  for (const r of ['index.html', 'app/index.html', 'app/cafeterias/index.html', 'app/peluquerias/index.html', 'app/talleres/index.html', 'app/retail/index.html', 'combo/index.html', 'flow/index.html', 'invitaciones/index.html', 'web/index.html']) {
    const html = leer(r);
    assert.equal(/demos\/app\.html/.test(html), false, r + ' enlaza demos/app.html');
    assert.equal(/Probarla vos mismo|demo completa|Demo interactiva/i.test(html), false, r);
  }
});
test('Modelo comercial: los planes se presentan como referencia con alcance a medida y no como «precio cerrado»', () => {
  const app = leer('app/index.html'), home = leer('index.html');
  assert.ok(app.includes('Un punto de partida para tu negocio.')); assert.ok(app.includes('presupuesto por escrito antes de empezar'));
  assert.ok(leer('combo/index.html').includes('Los planes son un punto de partida'));
  assert.equal(/Cada plan tiene un precio cerrado/.test(home + app + leer('combo/index.html')), false);
});
test('F3.3: ninguna línea promete «precio cerrado», uso sin conexión ni Excel sin condicionarlo al presupuesto', () => {
  const rutas = ['index.html', 'app/index.html', 'app/cafeterias/index.html', 'app/peluquerias/index.html', 'app/talleres/index.html', 'app/retail/index.html', 'web/index.html', 'flow/index.html', 'combo/index.html', 'invitaciones/index.html'];
  for (const r of rutas) {
    const h = leer(r);
    assert.equal(/precio cerrado|precio fijo|Lo que te decimos es lo que pagás|Se acabaron los turnos duplicados|se sincronizan solos|Tus datos te los llevás en Excel/.test(h), false, r);
  }
  const app = leer('app/index.html');
  assert.ok(app.includes('según el alcance de tu proyecto')); assert.ok(app.includes('la exportación a Excel se acuerda en el presupuesto'));
  assert.ok(leer('flow/index.html').includes('parte de un precio de referencia')); assert.ok(leer('web/index.html').includes('un punto de partida'));
  assert.equal(leer('invitaciones/index.html').includes('Lista de invitados, control de acompañantes'), false);
});

// F3.4: cada pregunta visible y de FAQPage JSON-LD conserva SU respuesta, la de su <details> en el sitio L1; sin cruces entre secciones.
const dec = (t) => t.replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim().replace(/ ([,.])/g, '$1');
const parseSrc = (h) => [...h.matchAll(/<details[^>]*>\s*<summary>((?:(?!<\/summary>).)*?)<i[^>]*>(?:(?!<\/summary>).)*<\/summary>\s*<div class="faq-body">((?:(?!<\/details>).)*?)<\/div>\s*<\/details>/gs)].map((m) => [dec(m[1]), dec(m[2])]);
const CAMBIOS_F33 = ['se acuerda en el presupuesto de tu proyecto', 'según el alcance de tu proyecto', 'coordinamos una charla de 20 minutos'];
for (const [ruta, l1, extras] of [['app', 'app', 0], ['web', 'web', 0], ['flow', 'flow', 1], ['combo', 'combo', 0], ['invitaciones', 'invitaciones', 0],
  ['app/cafeterias', 'app/cafeterias', 0], ['app/peluquerias', 'app/peluquerias', 0], ['app/talleres', 'app/talleres', 0], ['app/retail', 'app/retail', 0]]) {
  test(`F3.4: FAQ de /${ruta}/ sin cruces y con JSON-LD idéntico al visible`, () => {
    const pag = leer(ruta + '/index.html'), fuente = new Map(parseSrc(fs.readFileSync(new URL('../../../' + l1 + '/index.html', import.meta.url), 'utf8')));
    const vis = [...pag.match(/<div class="faq">(.*?)<\/div>\s*<\/div><\/section>/s)[1].matchAll(/<details><summary>(.*?)<\/summary><p>(.*?)<\/p><\/details>/gs)].map((m) => [dec(m[1]), dec(m[2])]);
    const ld = JSON.parse(pag.match(/<script type="application\/ld\+json">(\{"@context": "https:\/\/schema.org", "@type": "FAQPage".*?)<\/script>/s)[1]).mainEntity.map((e) => [e.name, e.acceptedAnswer.text]);
    assert.ok(vis.length >= 4);
    assert.deepEqual(ld, vis, 'JSON-LD distinto del HTML visible');
    let sinFuente = 0;
    for (const [q, a] of vis) {
      assert.ok(!/^Compar/i.test(q), 'pregunta de la tabla de planes: ' + q);
      if (!fuente.has(q)) { sinFuente++; continue; }
      assert.ok(fuente.get(q) === a || CAMBIOS_F33.some((c) => a.includes(c)), `respuesta cruzada en «${q}»`);
    }
    assert.ok(sinFuente <= extras, 'preguntas sin origen en el sitio L1: ' + sinFuente);
  });
}

// F3.4 cierre: el CTA de 20 minutos es una charla con una persona, no una demo preparada, y el mensaje de WhatsApp coincide.
test('GrowiApp: «Coordinar una charla de 20 minutos» y su mensaje de WhatsApp son coherentes y no quedan restos de la demo de 20 minutos', () => {
  const h = leer('app/index.html');
  assert.equal(/demo de 20 minutos|Solicitar una demo|armada con tu rubro/i.test(h), false);
  assert.equal((h.match(/>Coordinar una charla de 20 minutos</g) || []).length, 2);
  const msg = 'Hola Growi, quiero coordinar una charla de 20 minutos para contarles sobre mi negocio y conocer qué podemos hacer con GrowiApp. ¿Qué disponibilidad tienen?';
  const hrefs = [...h.matchAll(/href="(https:\/\/wa\.me\/(\d+)\?text=[^"]+)"[^>]*data-track="app-(?:hero|final)-demo-whatsapp"/g)];
  assert.equal(hrefs.length, 2);
  for (const m of hrefs) { const q = new URL(m[1].replace(/&amp;/g, '&')); assert.equal(m[2], '5491170593877'); assert.equal(q.searchParams.get('text'), msg); }
});
