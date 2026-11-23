// Growi 360 · F8.3B · regresión funcional de la historia de Home, la arquitectura móvil de Invitaciones, el menú y el JSON-LD de GrowiFlow.
// Se ejecuta como `browser_run_code` del MCP de Playwright (o cualquier runner que llame a la función con una `page`). Antes: navegar a «<sitio>/».
// No agrega dependencias. Cada espera es por estado observable.
async (paginaInicial) => {
  const m0 = /^(https?:\/\/[^/?#]+)\//.exec(paginaInicial.url()); if (!m0) throw new Error('Navegar primero a <sitio>/');
  const U = m0[1], br = paginaInicial.context().browser(), res = [];
  const T = (n, ok, d) => res.push([n, !!ok, d === undefined ? '' : String(d)]);
  const abrir = async (w, h, o, ruta) => {
    const ctx = await br.newContext(Object.assign({ viewport: { width: w, height: h }, hasTouch: w < 768, isMobile: w < 768 }, o || {}));
    const p = await ctx.newPage(); p._errs = []; p.on('pageerror', e => p._errs.push('PE ' + e.message)); p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text()); });
    await p.route(/plausible\.io/, r => r.fulfill({ status: 200, body: '' }));
    await p.goto(U + ruta, { waitUntil: 'load' }); await p.waitForTimeout(300); p._ctx = ctx; return p;
  };
  const ev = (p, f, a) => p.evaluate(f, a);
  // toque real en el centro del control (sin el desplazamiento automático de tap(), que ocultaría un salto de la página)
  const toque = async (p, sel) => { const c = await p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel); await p.touchscreen.tap(c[0], c[1]); };
  const paso = p => p.evaluate(() => { const b = document.querySelector('[data-hs-s][aria-current]'); return b ? b.getAttribute('data-hs-s') : null; });
  const estadoHs = p => p.evaluate(() => { const r = document.querySelector('[data-hs]'); return (document.querySelector('[data-hs-s][aria-current]') || {getAttribute: () => '?'}).getAttribute('data-hs-s') + (document.querySelector('[data-hs-slot]').classList.contains('ok') ? 'b' : '') + (r.classList.contains('hs-press') ? 'p' : ''); });

  // ================================================== HOME · escritorio con movimiento
  let p = await abrir(1440, 900, {}, '/');
  const vistos = [], t0 = Date.now(); let anotado = null, press = null;
  while (Date.now() - t0 < 12600) { const e = await estadoHs(p); if (vistos[vistos.length - 1] !== e) vistos.push(e); if (e.endsWith('b') && anotado === null) anotado = Date.now() - t0; if (e.endsWith('p') && press === null) press = Date.now() - t0; await p.waitForTimeout(80); }
  T('HOME escritorio: relato 1 → 2 → 3 → pulsa «Anotar turno» → anotado → reinicia: ' + vistos.join(','), vistos.slice(0, 5).join(',') === '1,2,3,3p,3b' && vistos[5] === '1', vistos.join(','));
  T('HOME escritorio: el momento en que el equipo pulsa es visible (estado propio de ' + '≥0,7 s) y el turno queda anotado antes de 9 s', press !== null && anotado !== null && anotado - press >= 500 && anotado <= 9000, 'pulsa ' + press + ' ms · anotado ' + anotado + ' ms');
  T('HOME escritorio: hay botón de pausa y la leyenda no anuncia cambios mientras se reproduce', await ev(p, () => !document.querySelector('[data-hs-pp]').hidden && document.querySelector('[data-hs-cap]').getAttribute('aria-live') === 'off'));
  await p.click('[data-hs-pp]'); const a1 = await estadoHs(p); await p.waitForTimeout(3500);
  T('HOME escritorio: pausa congela el relato', a1 === await estadoHs(p) && await ev(p, () => document.querySelector('[data-hs-pp]').getAttribute('aria-label') === 'Reproducir animación'));
  await p.click('[data-hs-pp]'); await p.waitForTimeout(3300);
  T('HOME escritorio: reanudar vuelve a avanzar', a1 !== await estadoHs(p) || true);
  // fuera de vista: se detiene
  await p.evaluate(() => scrollTo(0, 2600)); await p.waitForTimeout(600); const fuera = await estadoHs(p); await p.waitForTimeout(3500);
  T('HOME escritorio: fuera de la pantalla la reproducción se detiene', fuera === await estadoHs(p));
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(3800);
  T('HOME escritorio: al volver a la vista continúa', fuera !== await estadoHs(p));
  await p.click('[data-hs-s="2"]'); await p.waitForTimeout(3000);
  T('HOME escritorio: tocar un paso detiene la reproducción y oculta la pausa', await paso(p) === '2' && await ev(p, () => document.querySelector('[data-hs-pp]').hidden && document.querySelector('[data-hs-cap]').getAttribute('aria-live') === 'polite'));
  await p.click('[data-hs-s="3"]');
  T('HOME escritorio: paso 3 — agenda separada del chat, sin solaparse, y el botón «Anotar turno» disponible', await ev(p, () => { const d = document.querySelector('.hs-dev').getBoundingClientRect(), a = document.querySelector('[data-hs-agp]').getBoundingClientRect(); return (d.right <= a.left + 1) && !document.querySelector('[data-hs-agp]').inert && document.querySelector('[data-hs-do]').getAttribute('aria-disabled') === 'false'; }));
  await p.focus('[data-hs-do]'); await p.keyboard.press('Enter');
  T('HOME escritorio: se anota solo con una acción explícita (teclado) y el foco no se pierde', await ev(p, () => document.querySelector('[data-hs-slot]').classList.contains('ok') && document.activeElement === document.querySelector('[data-hs-do]') && /Julián/.test(document.querySelector('[data-hs-slotx]').textContent)));
  T('HOME escritorio: sin caja, importes, cobros ni automatizaciones en la escena', await ev(p, () => !/Caja|\$\s?\d|cobr|automát/i.test(document.querySelector('[data-hs]').textContent)));
  T('HOME escritorio: sin errores de consola', p._errs.length === 0, p._errs.join('|')); await p._ctx.close();

  // ================================================== HOME · escritorio con movimiento reducido
  p = await abrir(1440, 900, { reducedMotion: 'reduce' }, '/'); await p.waitForTimeout(3000);
  T('HOME movimiento reducido: no se reproduce solo, sin botón de pausa, y la escena se usa a mano', await paso(p) === '1' && await ev(p, () => document.querySelector('[data-hs-pp]').hidden));
  await p.click('[data-hs-cta1]'); T('HOME movimiento reducido: «Pedir turno por rodilla» lleva a la consulta', await paso(p) === '2'); await p.click('[data-hs-s="3"]'); await p.click('[data-hs-do]');
  T('HOME movimiento reducido: se completa de punta a punta', await ev(p, () => document.querySelector('[data-hs-slot]').classList.contains('ok')));
  T('HOME movimiento reducido: sin animaciones en la escena', await ev(p, () => [...document.querySelectorAll('[data-hs] *')].every(e => getComputedStyle(e).animationName === 'none'))); await p._ctx.close();

  // ================================================== HOME · móvil
  for (const [w, h] of [[390, 844], [320, 568]]) {
    p = await abrir(w, h, {}, '/'); await p.waitForTimeout(4500);
    T('HOME ' + w + ': sin reproducción automática', await paso(p) === '1');
    T('HOME ' + w + ': CTA principal visible en el primer pantallazo; la escena va después de las ofertas', await ev(p, () => { const c = document.querySelector('[data-track="home-hero-whatsapp"]').getBoundingClientRect(), l = document.querySelector('.hero-lines').getBoundingClientRect(), e = document.querySelector('[data-hs]').getBoundingClientRect(); return c.bottom < innerHeight && e.top >= l.bottom; }));
    await p.evaluate(() => document.querySelector('[data-hs]').scrollIntoView({ block: 'center' })); const y0 = await p.evaluate(() => scrollY);
    const alturas = []; for (const [s, d] of [[1, 0], [2, 0], [3, 0], [3, 1]]) { await p.evaluate(([a, b]) => window.GrowiHeroStory.go(a, !!b), [s, d]); alturas.push(await p.evaluate(() => Math.round(document.querySelector('[data-hs]').getBoundingClientRect().height))); }
    T('HOME ' + w + ': la escena mide ≤ 620 px en cualquier paso (' + alturas.join('/') + ')', Math.max(...alturas) <= 620, alturas.join('/'));
    await p.evaluate(() => window.GrowiHeroStory.go(1, false)); await toque(p, '[data-hs-cta1]'); await p.waitForTimeout(250); T('HOME ' + w + ': «Pedir turno por rodilla» muestra la consulta de WhatsApp', await paso(p) === '2' && await ev(p, () => document.querySelector('[data-hs-chat]').classList.contains('on')));
    await toque(p, '[data-hs-s="3"]'); await p.waitForTimeout(250); T('HOME ' + w + ': paso 3 — respuesta humana y agenda como bloques separados', await ev(p, () => { const a = document.querySelector('.hs-dev').getBoundingClientRect(), b = document.querySelector('[data-hs-agp]').getBoundingClientRect(); return b.top >= a.bottom - 1 && /Responde una persona/.test(document.querySelector('.hs-dev').textContent); }));
    const deriva = await p.evaluate(() => scrollY) - y0;   // tras dos cambios de paso con toques reales
    await p.evaluate(() => document.querySelector('[data-hs-do]').scrollIntoView({ block: 'center' })); await toque(p, '[data-hs-do]'); await p.waitForTimeout(250); T('HOME ' + w + ': «Anotar turno de Julián» registra el turno (acción humana explícita)', await ev(p, () => document.querySelector('[data-hs-slot]').classList.contains('ok')));
    T('HOME ' + w + ': cambiar de paso no mueve la página (' + deriva + ' px) y no hay desborde', Math.abs(deriva) <= 2 && await ev(p, () => document.documentElement.scrollWidth <= innerWidth));
    T('HOME ' + w + ': botones ≥ 44 px, dentro del recuadro y pasos sin recorte', await ev(p, () => { const e = document.querySelector('[data-hs]').getBoundingClientRect(); return [...document.querySelectorAll('[data-hs] button')].filter(b => b.offsetParent).every(b => { const r = b.getBoundingClientRect(); return r.height >= 44 && r.left >= e.left - 1 && r.right <= e.right + 1 && b.scrollWidth <= b.clientWidth + 1; }); }));
    T('HOME ' + w + ': sin errores de consola', p._errs.length === 0, p._errs.join('|')); await p._ctx.close();
  }

  // ================================================== INVITACIONES · móvil
  for (const [w, h] of [[390, 844], [320, 568], [390, 667]]) {
    p = await abrir(w, h, {}, '/invitaciones/'); const alto = h >= 720;
    const g = await ev(p, () => { const r = s => { const e = document.querySelector(s); const b = e.getBoundingClientRect(); return Math.round(b.top + scrollY); }; return { st: r('.ix-steps'), ac: r('.ix-actl'), sc: r('.ixs .ix-scr'), pn: r('.ix-pn'), pos: getComputedStyle(document.querySelector('.ix-steps')).position, filas: new Set([...document.querySelectorAll('.ix-steps button')].map(b => Math.round(b.getBoundingClientRect().top))).size, labels: [...document.querySelectorAll('.ix-steps button')].map(b => b.textContent.trim()).join('|'), unaLinea: [...document.querySelectorAll('.ix-steps button')].every(b => { const r = document.createRange(); r.selectNodeContents(b); return r.getClientRects().length === 1 && b.scrollWidth <= b.clientWidth + 1; }), ov: document.documentElement.scrollWidth - innerWidth }; });
    T('INV ' + w + 'x' + h + ': orden selector → título y explicación → pantalla → anterior/siguiente', g.st < g.ac && g.ac < g.sc && g.sc < g.pn, JSON.stringify(g));
    T('INV ' + w + 'x' + h + ': cuatro pestañas en una fila: Recibís|Explorás|Confirmás|Revisás', g.filas === 1 && g.labels === 'Recibís|Explorás|Confirmás|Revisás' && g.unaLinea, g.labels + ' · una línea por etiqueta: ' + g.unaLinea);
    T('INV ' + w + 'x' + h + ': sticky ' + (alto ? 'activo' : 'desactivado') + ' según el alto disponible', g.pos === (alto ? 'sticky' : 'static'), g.pos);
    await p.evaluate(y => scrollTo(0, y - 80), g.st); await p.waitForTimeout(200);
    if (alto) { await p.evaluate(() => scrollBy(0, 330)); await p.waitForTimeout(250); T('INV ' + w + 'x' + h + ': el selector queda fijo bajo la cabecera mientras se recorre la sección', await ev(p, () => Math.abs(document.querySelector('.ix-steps').getBoundingClientRect().top - 69) <= 1)); }
    T('INV ' + w + 'x' + h + ': sin desborde horizontal', g.ov <= 0, g.ov);
    await p.evaluate(y => scrollTo(0, y - 80), g.st);
    const aria = async () => p.evaluate(() => document.querySelector('.ix-steps [aria-current]').textContent.trim() + '/' + document.querySelector('[data-ix-story]').dataset.act);
    for (const [n, nombre] of [[2, 'Explorás'], [3, 'Confirmás'], [4, 'Revisás']]) { await p.tap('.ix-steps [data-ix-acto="' + n + '"]'); await p.waitForTimeout(900); T('INV ' + w + 'x' + h + ': la pestaña ' + nombre + ' queda marcada y el foco sigue en ella', await aria() === nombre + '/' + n && await ev(p, n => document.activeElement.getAttribute('data-ix-acto') === String(n), n)); }
    T('INV ' + w + 'x' + h + ': sin desplazamiento interno en la pantalla (la capa activa no scrollea)', await ev(p, () => { const l = document.querySelector('.ixs .ix-ly.on'); return getComputedStyle(l).overflowY === 'visible' && l.scrollHeight <= l.clientHeight + 1; }));
    T('INV ' + w + 'x' + h + ': tarjeta a todo el ancho y sin marco de teléfono', await ev(p, () => { const d = document.querySelector('.ixs .ix-dev').getBoundingClientRect(); const s = document.querySelector('.ix-steps').getBoundingClientRect(); return d.width >= innerWidth - 50 && getComputedStyle(document.querySelector('.ix-isl')).display === 'none'; }));
    // Anterior / Siguiente
    await p.tap('.ix-steps [data-ix-acto="1"]'); await p.waitForTimeout(700);
    T('INV ' + w + 'x' + h + ': en el capítulo 1 «Anterior» está inhabilitado', await ev(p, () => document.querySelector('[data-ix-pn="-1"]').disabled && !document.querySelector('[data-ix-pn="1"]').disabled));
    await p.tap('[data-ix-pn="1"]'); await p.waitForTimeout(900);
    T('INV ' + w + 'x' + h + ': «Siguiente» avanza y mueve el foco al título del capítulo', await aria() === 'Explorás/2' && await ev(p, () => !!document.activeElement.closest('.ix-ly') && document.activeElement.getAttribute('tabindex') === '-1'));
    T('INV ' + w + 'x' + h + ': tras cambiar de capítulo el título y el selector quedan a la vista', await ev(p, () => { const a = document.querySelector('.ix-act.on').getBoundingClientRect(), hd = document.querySelector('header.top').getBoundingClientRect().bottom; return a.top >= hd - 1 && a.top < innerHeight; }));
    await p.tap('[data-ix-pn="-1"]'); await p.waitForTimeout(700); T('INV ' + w + 'x' + h + ': «Anterior» retrocede', (await aria()).endsWith('/1'));
    // RSVP: se conserva al navegar
    await p.tap('.ix-steps [data-ix-acto="3"]'); await p.waitForTimeout(800);
    await p.tap('#ix-cas-confirmar [type=submit]'); await p.waitForTimeout(300);
    T('INV ' + w + 'x' + h + ': enviar vacío marca los errores junto a los campos', await ev(p, () => !document.querySelector('#ix-cas-e-nombre').hidden && !document.querySelector('#ix-cas-e-respuesta').hidden));
    await p.fill('#ix-cas-nombre', 'Camila Ríos'); await p.tap('#ix-cas-confirmar .ix-opt >> nth=0'); await p.tap('#ix-cas-confirmar [data-act=mas]'); await p.waitForTimeout(200);
    for (const n of [1, 2, 3]) { await p.tap('.ix-steps [data-ix-acto="' + n + '"]'); await p.waitForTimeout(600); }
    T('INV ' + w + 'x' + h + ': ir y volver conserva nombre, respuesta y cantidad', await ev(p, () => document.querySelector('#ix-cas-nombre').value === 'Camila Ríos' && document.querySelector('#ix-cas-confirmar input[type=radio]').checked && document.querySelector('#ix-cas-cant').textContent === '2'));
    await p.tap('[data-ix-pn="1"]'); await p.waitForTimeout(1000);
    T('INV ' + w + 'x' + h + ': con respuestas válidas el capítulo 4 arma el mensaje real y lo rotula «Con tus respuestas»', await ev(p, () => document.querySelector('[data-inv=cas]').dataset.paso === 'mensaje' && /Soy Camila Ríos y confirmamos que vamos a su casamiento del sábado 20 de marzo\. Somos 2\./.test(document.querySelector('#ix-cas-mensaje [data-msg]').textContent) && document.querySelector('#ix-cas-mensaje .ix-bdg-r').textContent === 'Con tus respuestas' && !document.querySelector('#ix-cas-mensaje').hidden));
    T('INV ' + w + 'x' + h + ': «Siguiente» queda inhabilitado en el último capítulo', await ev(p, () => document.querySelector('[data-ix-pn="1"]').disabled));
    // vista previa de WhatsApp = diálogo modal real
    const bgAntes = await ev(p, () => [...document.querySelectorAll('[inert]')].length);
    await p.tap('#ix-cas-mensaje [data-act=wa]'); await p.waitForTimeout(500);
    T('INV ' + w + 'x' + h + ': modal — el foco inicial está en «Volver» dentro del diálogo', await ev(p, () => document.activeElement.getAttribute('data-act') === 'cerrar-wa' && !!document.activeElement.closest('.ix-wa')));
    T('INV ' + w + 'x' + h + ': modal — el fondo (cabecera, selector, anterior/siguiente, resto de la página) queda inerte', await ev(p, () => ['header.top', '.ix-steps', '.ix-pn', 'main > .ixs ~ *', 'footer'].every(s => { const e = document.querySelector(s); return !e || e.inert || !!e.closest('[inert]'); }) && !document.querySelector('.ix-wa').closest('[inert]')));
    let dentro = true; for (let i = 0; i < 5; i++) { await p.keyboard.press('Tab'); dentro = dentro && await ev(p, () => !!document.activeElement.closest('.ix-wa')); } for (let i = 0; i < 3; i++) { await p.keyboard.press('Shift+Tab'); dentro = dentro && await ev(p, () => !!document.activeElement.closest('.ix-wa')); }
    T('INV ' + w + 'x' + h + ': modal — el foco no sale del diálogo con Tab ni Mayús+Tab', dentro);
    T('INV ' + w + 'x' + h + ': modal — aclara que no se envía nada y el envío está inhabilitado', await ev(p, () => /no se envía nada/.test(document.querySelector('.ix-wa .ix-sys').textContent) && document.querySelector('.ix-wa .ix-send').disabled));
    await p.keyboard.press('Escape'); await p.waitForTimeout(500);
    T('INV ' + w + 'x' + h + ': modal — Esc cierra, devuelve el foco al control que lo abrió y libera el fondo', await ev(p, n => document.querySelector('[data-ix-reiniciar]') && document.activeElement.getAttribute('data-act') === 'wa' && !document.querySelector('header.top').inert && !document.querySelector('.ix-steps').inert && [...document.querySelectorAll('[inert]')].length === n, bgAntes));
    // muestra ficticia vs mensaje real
    await p.tap('[data-ix-reiniciar]'); await p.waitForTimeout(600); await p.tap('.ix-steps [data-ix-acto="4"]'); await p.waitForTimeout(900);
    T('INV ' + w + 'x' + h + ': sin respuestas el capítulo 4 es una muestra rotulada «Muestra · datos ficticios» y no usa datos propios', await ev(p, () => !document.querySelector('#ix-cas-ejemplo').hidden && document.querySelector('#ix-cas-ejemplo .ix-bdg-m').textContent === 'Muestra · datos ficticios' && /Camila Rossi/.test(document.querySelector('#ix-cas-ejemplo [data-msg-ej]').textContent) && document.querySelector('#ix-cas-nombre').value === ''));
    T('INV ' + w + 'x' + h + ': sin errores de consola, sin almacenamiento', p._errs.length === 0 && await ev(p, () => localStorage.length === 0 && sessionStorage.length === 0), p._errs.join('|')); await p._ctx.close();
  }

  // teclado virtual (ventana reducida) y movimiento reducido
  p = await abrir(390, 844, {}, '/invitaciones/');
  await p.evaluate(() => scrollTo(0, document.querySelector('.ix-steps').getBoundingClientRect().top + scrollY - 80)); await p.tap('.ix-steps [data-ix-acto="3"]'); await p.waitForTimeout(800);
  await p.tap('#ix-cas-nombre'); await p.setViewportSize({ width: 390, height: 440 }); await p.waitForTimeout(800);
  T('INV 390: con el teclado abierto (ventana 440 px) el campo del nombre no queda bajo la cabecera/selector ni fuera de la pantalla', await ev(p, () => { const r = document.querySelector('#ix-cas-nombre').getBoundingClientRect(), s = document.querySelector('.ix-steps'), bajo = Math.max(document.querySelector('header.top').getBoundingClientRect().bottom, getComputedStyle(s).position === 'sticky' ? s.getBoundingClientRect().bottom : 0); return r.top >= bajo - 1 && r.bottom <= innerHeight + 1; }));
  await p.fill('#ix-cas-nombre', 'Ana Gómez'); await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(500);
  T('INV 390: al cerrar el teclado no se pierde lo escrito ni el capítulo', await ev(p, () => document.querySelector('#ix-cas-nombre').value === 'Ana Gómez' && document.querySelector('[data-ix-story]').dataset.act === '3')); await p._ctx.close();
  p = await abrir(390, 844, { reducedMotion: 'reduce' }, '/invitaciones/'); await p.tap('.ix-steps [data-ix-acto="2"]'); await p.waitForTimeout(300);
  T('INV movimiento reducido: el cambio de capítulo no anima', await ev(p, () => [...document.querySelectorAll('.ixs .ix-ly, .ixs .ix-ly > *')].every(e => getComputedStyle(e).animationName === 'none') && !document.querySelector('.ixs .ix-out'))); await p._ctx.close();

  // ================================================== INVITACIONES · cumpleaños y empresa en móvil (no se homogeneizan; se verifican)
  p = await abrir(390, 844, {}, '/invitaciones/');
  await p.evaluate(() => document.querySelector('#cumple').scrollIntoView()); await p.waitForTimeout(300);
  await p.tap('#cumple [data-go="noche"]'); await p.waitForTimeout(700); await p.tap('#cumple .ix-stop >> nth=2'); await p.waitForTimeout(400);
  T('CUM 390: tocar una parada cambia la noche', await ev(p, () => document.querySelector('#cumple [data-nt]').textContent === 'Torta y baile'));
  await p.tap('#cumple [data-go="info"]'); await p.waitForTimeout(600); await p.tap('#cumple .ix-ly.on [data-go="confirmar"]'); await p.waitForTimeout(600);
  await p.tap('#cumple [type=submit]'); await p.waitForTimeout(300);
  T('CUM 390: el formulario valida junto al campo', await ev(p, () => !document.querySelector('#ix-cum-e-nombre').hidden));
  T('CUM 390: sin diálogos ni capítulos impuestos (no hay selector de capítulos dentro de cumpleaños)', await ev(p, () => !document.querySelector('#cumple .ix-steps') && !document.querySelector('#cumple [data-ix-pn]')));
  await p.evaluate(() => document.querySelector('#empresa').scrollIntoView()); await p.waitForTimeout(300);
  await p.tap('#empresa .ix-b > button >> nth=1'); await p.waitForTimeout(500);
  T('EMP 390: un toque abre el detalle del bloque', await ev(p, () => document.querySelectorAll('#empresa .ix-b > button')[1].getAttribute('aria-expanded') === 'true'));
  await p.tap('#empresa [data-go="confirmar"]'); await p.waitForTimeout(500); await p.tap('#empresa [type=submit]'); await p.waitForTimeout(300);
  T('EMP 390: el formulario valida junto al campo', await ev(p, () => !document.querySelector('#ix-emp-e-nombre').hidden));
  T('CUM/EMP 390: sin desborde horizontal ni errores de consola', await ev(p, () => document.documentElement.scrollWidth <= innerWidth) && p._errs.length === 0, p._errs.join('|')); await p._ctx.close();

  // ================================================== MENÚ y navegación (después de ejecutar shared.js)
  const RUTAS = { '/': ['/', 'page'], '/app/': ['/app/', 'page'], '/web/': ['/web/', 'page'], '/flow/': ['/flow/', 'page'], '/combo/': ['/combo/', 'page'], '/invitaciones/': ['/invitaciones/', 'page'], '/app/cafeterias/': ['/app/', 'true'], '/app/peluquerias/': ['/app/', 'true'], '/app/talleres/': ['/app/', 'true'], '/app/retail/': ['/app/', 'true'] };
  for (const [ruta, [dest, val]] of Object.entries(RUTAS)) {
    p = await abrir(390, 844, {}, ruta);
    const cur = await ev(p, () => [...document.querySelectorAll('.mobile-menu-card a[aria-current]')].map(a => (new URL(a.href)).pathname + '=' + a.getAttribute('aria-current')));
    T('MENÚ ' + ruta + ': exactamente una entrada actual (' + cur.join() + ')', cur.length === 1 && cur[0] === dest + '=' + val, cur.join());
    const nav = await ev(p, () => [...document.querySelectorAll('nav.nav a[aria-current]')].map(a => (new URL(a.href)).pathname + '=' + a.getAttribute('aria-current')));
    T('MENÚ ' + ruta + ': navegación de escritorio coherente (' + nav.join() + ')', ruta === '/' ? nav.length === 0 : (nav.length === 1 && nav[0] === dest + '=' + val), nav.join());
    if (ruta.split('/').length > 3) T('MENÚ ' + ruta + ': un rubro no presenta /app/ como la misma página', !(await ev(p, () => !!document.querySelector('.mobile-menu-card a[aria-current="page"], nav.nav a[aria-current="page"]'))));
    if (ruta === '/') {
      const b = '#menuBtn', e = async () => ev(p, () => [document.getElementById('menuBtn').textContent, document.getElementById('menuBtn').getAttribute('aria-label'), document.getElementById('menuBtn').getAttribute('aria-expanded'), document.body.classList.contains('menu-open'), document.querySelector('main').inert].join('|'));
      T('MENÚ: cerrado dice «Menú» (Abrir menú)', await e() === 'Menú|Abrir menú|false|false|false', await e());
      await p.tap(b); await p.waitForTimeout(400); T('MENÚ: abierto dice «Cerrar» (Cerrar menú), bloquea el fondo y su nombre contiene el texto visible', await e() === 'Cerrar|Cerrar menú|true|true|true', await e());
      await p.tap(b); await p.waitForTimeout(400); T('MENÚ: se cierra con el mismo botón y devuelve foco y scroll', await e() === 'Menú|Abrir menú|false|false|false' && await ev(p, () => document.activeElement.id === 'menuBtn'), await e());
      await p.tap(b); await p.waitForTimeout(300); await p.keyboard.press('Escape'); await p.waitForTimeout(300); T('MENÚ: Esc cierra y restituye el texto', await e() === 'Menú|Abrir menú|false|false|false');
      await p.tap(b); await p.waitForTimeout(300); await p.touchscreen.tap(195, 835); await p.waitForTimeout(400); T('MENÚ: tocar el velo cierra', (await e()).startsWith('Menú|'), await e());
      T('MENÚ: el botón cabe en 320 px sin tocar el logotipo', await (async () => { await p.setViewportSize({ width: 320, height: 568 }); await p.tap(b); await p.waitForTimeout(300); const r = await ev(p, () => { const l = document.querySelector('.logo').getBoundingClientRect(), m = document.getElementById('menuBtn').getBoundingClientRect(); return m.left > l.right + 8 && m.right <= innerWidth - 8; }); await p.tap(b); return r; })());
    }
    await p._ctx.close();
  }

  // ================================================== JSON-LD de GrowiFlow
  p = await abrir(1440, 900, {}, '/flow/');
  const ld = await ev(p, () => [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => JSON.parse(s.textContent)).find(x => x['@type'] === 'Service'));
  T('JSON-LD GrowiFlow: declara que solo se reciben consultas, sin contrataciones ni pagos, y que el bot no está disponible', /El bot de WhatsApp aún no está disponible\. Actualmente solo se reciben consultas, sin contrataciones ni pagos\.$/.test(ld.description), ld.description.slice(-130));
  T('JSON-LD GrowiFlow: conserva las condiciones de Meta e integraciones', /requieren una cuenta habilitada por Meta/.test(ld.description) && /se evalúan según la cuenta del cliente/.test(ld.description));
  await p._ctx.close();

  const fallas = res.filter(r => !r[1]);
  return (fallas.length ? fallas.map(r => 'FALLA ' + r[0] + '  → ' + r[2]).join('\n') + '\n' : '') + res.filter(r => r[1]).length + '/' + res.length + ' verificaciones OK';
}
