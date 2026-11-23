// Growi 360 · F8.4R · regresión de los hallazgos independientes de Codex (F8.4), reproducidos en navegador real:
//   P2 Home: la reproducción debe responder a cambios de tamaño SIN recargar (1440 → 390 → 1440, etc.), pausa, interacción y movimiento reducido.
//   P2 Invitaciones: tras Anterior/Siguiente/pestañas en pantallas bajas, el selector COMPLETO y el título deben quedar bajo la cabecera real.
// Uso: navegar a «<sitio>/#antes» o «<sitio>/#despues» (el fragmento solo etiqueta las capturas) y ejecutar con browser_run_code_unsafe (filename).
// Las capturas van a CAP (fuera del repositorio). No agrega dependencias.
async (paginaInicial) => {
  const m0 = /^(https?:\/\/[^/?#]+)\//.exec(paginaInicial.url()); if (!m0) throw new Error('Navegar primero a <sitio>/#antes|#despues');
  const TAG = (/#(\w+)/.exec(paginaInicial.url()) || [, 'x'])[1], U = m0[1], br = paginaInicial.context().browser(), res = [];
  const CAP = 'D:/Documentos/respaldos-growi/f8-4r/capturas/';
  const T = (n, ok, d) => res.push([n, !!ok, d === undefined ? '' : String(d)]);
  const abrir = async (w, h, o, ruta) => {
    const ctx = await br.newContext(Object.assign({ viewport: { width: w, height: h }, hasTouch: w < 768, isMobile: w < 768 }, o || {}));
    const p = await ctx.newPage(); p._errs = []; p._ctx = ctx; p.on('pageerror', e => p._errs.push('PE ' + e.message)); p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text()); });
    await p.route(/plausible\.io/, r => r.fulfill({ status: 200, body: '' })); await p.goto(U + ruta, { waitUntil: 'load' }); await p.waitForTimeout(350); return p;
  };
  const ev = (p, f, a) => p.evaluate(f, a);
  // ============================================================== HOME · cambios de tamaño sin recargar
  const sello = p => ev(p, () => { const r = document.querySelector('[data-hs]'); const s = document.querySelector('[data-hs-s][aria-current]'); return (s ? s.getAttribute('data-hs-s') : '?') + (document.querySelector('[data-hs-slot]').classList.contains('ok') ? 'b' : '') + (r.classList.contains('hs-press') ? 'p' : ''); });
  const panel = p => ev(p, () => { const pp = document.querySelector('[data-hs-pp]'); const b = document.querySelector('.hs-board'); return { pp: pp.hidden || getComputedStyle(pp).display === 'none' ? 'oculto' : 'visible', ppEtiqueta: pp.getAttribute('aria-label'), cols: getComputedStyle(b).gridTemplateColumns.split(' ').length, live: document.querySelector('[data-hs-cap]').getAttribute('aria-live'), ancho: Math.round(document.querySelector('[data-hs]').getBoundingClientRect().width), est: window.GrowiHeroStory && window.GrowiHeroStory.estado ? window.GrowiHeroStory.estado() : null }; });
  // cuántos cambios de estado se ven en `ms` milisegundos (muestreo cada 100 ms) y la duración de cada estado
  const observar = async (p, ms) => { const cambios = []; let ult = await sello(p), t0 = Date.now(), tu = t0; while (Date.now() - t0 < ms) { await p.waitForTimeout(100); const s = await sello(p); if (s !== ult) { cambios.push(ult + '→' + s + '@' + (Date.now() - tu)); ult = s; tu = Date.now(); } } return cambios; };
  const verEscena = p => ev(p, () => document.querySelector('[data-hs]').scrollIntoView({ block: 'center' }));   // la escena a la vista: una pausa no puede deberse al observador de visibilidad

  let p = await abrir(1440, 900, {}, '/'); await p.waitForTimeout(500);
  let c0 = await observar(p, 3200); let pn = await panel(p);
  T('HOME 1440: carga con reproducción automática y control de pausa visible (' + c0.length + ' cambios en 3,2 s)', c0.length >= 1 && pn.pp === 'visible' && pn.cols === 1, JSON.stringify(pn));   // F8.8: el tablero es de una columna (sitio arriba, negocio abajo) en todos los anchos
  await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(700); await verEscena(p); await p.waitForTimeout(300); await p.screenshot({ path: CAP + TAG + '-home-1440a390.png' });
  const e0 = await sello(p); let c1 = await observar(p, 6500); pn = await panel(p);
  T('HOME 1440 → 390 sin recargar: la reproducción continúa (F8.7: también en móvil; ' + c1.length + ' cambios en 6,5 s desde «' + e0 + '»)', c1.length >= 1, c1.join(' ') + ' ' + JSON.stringify(pn));
  T('HOME 1440 → 390: el control de pausa sigue visible y la leyenda no anuncia cada cambio', pn.pp === 'visible' && pn.live === 'off', JSON.stringify(pn));
  T('HOME 1440 → 390: queda un único temporizador (reproducción continua, sin duplicados)', pn.est === null ? false : pn.est.temporizador === true && pn.est.auto === true, JSON.stringify(pn.est));
  await p.setViewportSize({ width: 1440, height: 900 }); await p.waitForTimeout(700); await verEscena(p); const c2 = await observar(p, 6500); pn = await panel(p);
  T('HOME 390 → 1440 sin interacción previa: la reproducción vuelve (control visible, avanza)', c2.length >= 1 && pn.pp === 'visible', c2.join(' ') + ' ' + JSON.stringify(pn));
  // varios cambios seguidos: sin reinicios aceleros ni listeners duplicados (cada estado dura lo que debe)
  for (let i = 0; i < 4; i++) { await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(250); await p.setViewportSize({ width: 1440, height: 900 }); await p.waitForTimeout(250); }
  await p.waitForTimeout(800); const rit = await observar(p, 9000); const dur = rit.map(x => +x.split('@')[1]).slice(1);
  T('HOME 4 vaivenes 1440⇄390: el ritmo no se acelera (estados ≥ 800 ms: ' + dur.join(',') + ')', dur.length >= 2 && dur.every(d => d >= 800), rit.join(' '));
  await p._ctx.close();

  // criterio único CSS/JS en varios anchos: hay reproducción si y solo si la disposición es de escritorio
  for (const [w1, w2] of [[1280, 320], [1200, 390], [1024, 320], [900, 1440], [768, 1440]]) {
    p = await abrir(w1, 900, {}, '/'); await p.waitForTimeout(400); await verEscena(p); const a = await observar(p, 3300), pa = await panel(p);
    const okInicio = a.length >= 1 && pa.pp === 'visible';
    await p.setViewportSize({ width: w2, height: 800 }); await p.waitForTimeout(700); await verEscena(p); await p.waitForTimeout(300); const b = await observar(p, 3300), pb = await panel(p);
    const okFin = b.length >= 1 && pb.pp === 'visible';
    T('HOME ' + w1 + ' → ' + w2 + ' px sin recargar: la reproducción sigue en cualquier disposición (F8.7; inicio ' + pa.cols + ' col., fin ' + pb.cols + ' col.)', okInicio && okFin, 'inicio ' + a.length + ' cambios ' + JSON.stringify(pa) + ' · fin ' + b.length + ' cambios ' + JSON.stringify(pb));
    await p._ctx.close();
  }
  // pausa del usuario: se respeta al volver a escritorio
  p = await abrir(1440, 900, {}, '/'); await p.waitForTimeout(600); await p.click('[data-hs-pp]'); const pausa0 = await sello(p);
  await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(500); await p.setViewportSize({ width: 1440, height: 900 }); await p.waitForTimeout(600); await verEscena(p);
  const cp = await observar(p, 4500); pn = await panel(p);
  T('HOME pausada por el usuario → 390 → 1440: sigue en pausa (control visible «Reproducir», sin avances)', cp.length === 0 && pn.pp === 'visible' && pn.ppEtiqueta === 'Reproducir animación', cp.join(' ') + ' ' + JSON.stringify(pn));
  await p.click('[data-hs-pp]'); const cr = await observar(p, 3500);
  T('HOME tras reanudar con el control, vuelve a avanzar', cr.length >= 1, cr.join(' ')); await p._ctx.close();
  // pausa del usuario y cambio a móvil sin volver: no avanza
  p = await abrir(1440, 900, {}, '/'); await p.waitForTimeout(600); await p.click('[data-hs-pp]'); await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(500); await verEscena(p);
  T('HOME pausada → 390: sigue en pausa (control visible «Reproducir», sin avances)', (await observar(p, 4500)).length === 0 && (await panel(p)).pp === 'visible'); await p._ctx.close();
  // interacción manual: se respeta al volver a escritorio
  p = await abrir(1440, 900, {}, '/'); await p.waitForTimeout(500); await p.click('[data-hs-s="2"]'); await p.waitForTimeout(300);
  await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(500); await p.setViewportSize({ width: 1440, height: 900 }); await p.waitForTimeout(600); await verEscena(p);
  const cm = await observar(p, 4500); pn = await panel(p);
  T('HOME tras interactuar (paso 2) → 390 → 1440: sigue manual (sin avances, sin control de pausa) y en el paso elegido', cm.length === 0 && pn.pp === 'oculto' && (await paso2(p)) === '2', cm.join(' ') + ' ' + JSON.stringify(pn));
  async function paso2(q) { return ev(q, () => document.querySelector('[data-hs-s][aria-current]').getAttribute('data-hs-s')); }
  await p._ctx.close();
  // interacción manual posterior al cambio a móvil: no se pierde el foco ni avanza solo
  p = await abrir(1440, 900, { hasTouch: true }, '/'); await p.waitForTimeout(2500); await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(500);
  await ev(p, () => document.querySelector('[data-hs]').scrollIntoView({ block: 'center' })); await p.waitForTimeout(900);   // scroll-behavior:smooth debe terminar antes de medir y tocar
  const cx = async sel => { const c = await ev(p, s => { const r = document.querySelector(s).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel); await p.touchscreen.tap(c[0], c[1]); };
  await cx('[data-hs-s="3"]'); await p.waitForTimeout(300);
  const ya = await sello(p); const cq = await observar(p, 4500);
  T('HOME 1440 → 390 y luego toques: elegir el paso 3 muestra el turno confirmado y el estado queda fijo (sin avances posteriores)', ya === '3b' && cq.length === 0 && await ev(p, () => document.activeElement === document.querySelector('[data-hs-s="3"]')), ya + ' ' + cq.join(' '));
  await p._ctx.close();
  // movimiento reducido dinámico
  p = await abrir(1440, 900, {}, '/'); await p.waitForTimeout(500); await p.emulateMedia({ reducedMotion: 'reduce' }); await p.waitForTimeout(600);
  const cd = await observar(p, 4500); pn = await panel(p);
  T('HOME movimiento reducido activado en caliente: la reproducción se detiene y se oculta el control', cd.length === 0 && pn.pp === 'oculto', cd.join(' ') + ' ' + JSON.stringify(pn));
  await p.emulateMedia({ reducedMotion: 'no-preference' }); await p.waitForTimeout(700); const cd2 = await observar(p, 4500);
  T('HOME movimiento reducido desactivado en caliente: vuelve a reproducirse', cd2.length >= 1 && (await panel(p)).pp === 'visible', cd2.join(' ')); await p._ctx.close();
  p = await abrir(1440, 900, { reducedMotion: 'reduce' }, '/'); await p.waitForTimeout(400); await p.setViewportSize({ width: 390, height: 844 }); await p.setViewportSize({ width: 1440, height: 900 }); await p.waitForTimeout(500);
  T('HOME con movimiento reducido de origen: cambiar de tamaño nunca inicia reproducción', (await observar(p, 4000)).length === 0 && (await panel(p)).pp === 'oculto'); await p._ctx.close();

  // ============================================================== INVITACIONES · selector y título visibles
  const medir = async (p, etiqueta) => ev(p, () => {
    const r = e => { const b = e.getBoundingClientRect(); return { t: +b.top.toFixed(1), b: +b.bottom.toFixed(1), l: +b.left.toFixed(1), r: +b.right.toFixed(1) }; };
    const cab = r(document.querySelector('header.top')), sel = document.querySelector('.ix-steps'), s = r(sel), pos = getComputedStyle(sel).position;
    const tab = r(document.querySelector('.ix-steps [aria-current]')), tit = r(document.querySelector('.ix-act.on .ix-act-b')), ih = innerHeight;
    const selVisible = s.t >= cab.b - 0.5 && s.b <= ih + 0.5, tabVisible = tab.t >= cab.b - 0.5 && tab.b <= ih + 0.5 && tab.t >= s.t - 0.5 && tab.b <= s.b + 0.5;
    const titVisible = tit.t >= cab.b - 0.5 && tit.b <= ih + 0.5 && tit.t >= (pos === 'sticky' ? s.b - 0.5 : cab.b - 0.5);
    return { cab, s, tab, tit, pos, ih, selVisible, tabVisible, titVisible, ok: selVisible && tabVisible && titVisible, act: document.querySelector('[data-ix-story]').dataset.act, texto: document.querySelector('.ix-steps [aria-current]').textContent.trim() };
  });
  const resumen = m => 'cabecera ' + m.cab.t + '..' + m.cab.b + ' · selector ' + m.s.t + '..' + m.s.b + ' (' + m.pos + ') · pestaña «' + m.texto + '» ' + m.tab.t + '..' + m.tab.b + ' · título ' + m.tit.t + '..' + m.tit.b + ' · ventana ' + m.ih + ' → selector ' + (m.selVisible ? 'visible' : 'TAPADO') + ', pestaña ' + (m.tabVisible ? 'visible' : 'TAPADA') + ', título ' + (m.titVisible ? 'visible' : 'NO visible');
  const toqueSel = async (p, sel) => { await ev(p, s => document.querySelector(s).scrollIntoView({ block: 'center' }), sel); await p.waitForTimeout(150); const c = await ev(p, s => { const r = document.querySelector(s).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel); await p.touchscreen.tap(c[0], c[1]); await p.waitForTimeout(1100); };
  for (const [w, h] of [[320, 568], [390, 667], [390, 844]]) {
    p = await abrir(w, h, {}, '/invitaciones/'); const k = w + 'x' + h;
    const aSel = async () => ev(p, () => { const e = document.querySelector('.ix-steps'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 90); });
    await aSel(); await p.waitForTimeout(200);
    // 4 → Anterior → 3
    await toqueSel(p, '.ix-steps [data-ix-acto="4"]'); await toqueSel(p, '[data-ix-pn="-1"]'); let m = await medir(p); await p.screenshot({ path: CAP + TAG + '-inv-' + k + '-4a3.png' });
    T('INV ' + k + ': capítulo 4 → Anterior → 3: cabecera, selector completo, pestaña activa y título visibles', m.ok && m.act === '3', resumen(m));
    // 3 → Anterior → 2
    await toqueSel(p, '[data-ix-pn="-1"]'); m = await medir(p); await p.screenshot({ path: CAP + TAG + '-inv-' + k + '-3a2.png' });
    T('INV ' + k + ': capítulo 3 → Anterior → 2: todo visible', m.ok && m.act === '2', resumen(m));
    // 1 → Siguiente → 2
    await toqueSel(p, '.ix-steps [data-ix-acto="1"]'); await toqueSel(p, '[data-ix-pn="1"]'); m = await medir(p); await p.screenshot({ path: CAP + TAG + '-inv-' + k + '-1s2.png' });
    T('INV ' + k + ': capítulo 1 → Siguiente → 2: todo visible', m.ok && m.act === '2', resumen(m));
    // Siguiente repetido y Anterior repetido
    let todo = true, det = []; for (const [sel, esp] of [['[data-ix-pn="1"]', '3'], ['[data-ix-pn="1"]', '4'], ['[data-ix-pn="-1"]', '3'], ['[data-ix-pn="-1"]', '2'], ['[data-ix-pn="-1"]', '1']]) { await toqueSel(p, sel); m = await medir(p); todo = todo && m.ok && m.act === esp; det.push(m.act + ':' + (m.ok ? 'ok' : 'FALLA')); }
    T('INV ' + k + ': recorrido completo con Siguiente y Anterior (' + det.join(' ') + ')', todo, det.join(' '));
    // selección directa de pestañas
    todo = true; det = []; for (const n of [4, 2, 3, 1, 4]) { await toqueSel(p, '.ix-steps [data-ix-acto="' + n + '"]'); m = await medir(p); todo = todo && m.ok && m.act === String(n); det.push(n + ':' + (m.ok ? 'ok' : 'FALLA')); if (!m.ok) await p.screenshot({ path: CAP + TAG + '-inv-' + k + '-tab' + n + '.png' }); }
    T('INV ' + k + ': selección directa de pestañas (' + det.join(' ') + ')', todo, det.join(' '));
    // teclado: foco en la pestaña + Enter; luego Siguiente/Anterior con teclado
    await toqueSel(p, '.ix-steps [data-ix-acto="4"]'); await ev(p, () => document.querySelector('[data-ix-pn="-1"]').focus()); await p.keyboard.press('Enter'); await p.waitForTimeout(1100); m = await medir(p);
    T('INV ' + k + ': teclado — Anterior con Enter deja todo visible y el foco en el título del capítulo', m.ok && m.act === '3' && await ev(p, () => document.activeElement.getAttribute('tabindex') === '-1' && !!document.activeElement.closest('.ix-ly')), resumen(m));
    await ev(p, () => document.querySelector('.ix-steps [data-ix-acto="2"]').focus()); await p.keyboard.press('Enter'); await p.waitForTimeout(1100); m = await medir(p);
    T('INV ' + k + ': teclado — pestaña «La abren» con Enter: todo visible y el foco sigue en la pestaña', m.ok && m.act === '2' && await ev(p, () => document.activeElement.getAttribute('data-ix-acto') === '2'), resumen(m));
    await ev(p, () => document.querySelector('[data-ix-pn="1"]').focus()); await p.keyboard.press('Space'); await p.waitForTimeout(1100); m = await medir(p);
    T('INV ' + k + ': teclado — Siguiente con Espacio: todo visible', m.ok && m.act === '3', resumen(m));
    // no se desplaza mientras se escribe
    await toqueSel(p, '.ix-steps [data-ix-acto="3"]'); await ev(p, () => document.querySelector('#ix-cas-nombre').focus({ preventScroll: true })); await p.keyboard.type('Camila'); await p.waitForTimeout(900);   // deja terminar el centrado del campo que ya hace el focusin (teclado virtual)
    const y0 = await ev(p, () => scrollY); await ev(p, () => window.GrowiInvUI.cas.aVista({ tipo: 'ir' })); await p.waitForTimeout(600); const y1 = await ev(p, () => scrollY);
    T('INV ' + k + ': con el foco en un campo de texto la corrección de vista NO desplaza la página (' + y0 + ' → ' + y1 + ')', y0 === y1);
    T('INV ' + k + ': sin errores de consola ni desborde', p._errs.length === 0 && await ev(p, () => document.documentElement.scrollWidth <= innerWidth), p._errs.join('|'));
    await p._ctx.close();
  }
  // sin saltos innecesarios: si todo ya está a la vista, cambiar de pestaña no mueve la página (390×844, selector sticky)
  p = await abrir(390, 844, {}, '/invitaciones/'); await ev(p, () => window.scrollTo(0, document.querySelector('.ix-steps').getBoundingClientRect().top + scrollY - 90)); await p.waitForTimeout(250);
  let saltos = []; for (const n of [2, 3, 4, 3, 2, 1]) { const y = await ev(p, () => scrollY); const c = await ev(p, n => { const r = document.querySelector('.ix-steps [data-ix-acto="' + n + '"]').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, n); await p.touchscreen.tap(c[0], c[1]); await p.waitForTimeout(1000); saltos.push(Math.abs((await ev(p, () => scrollY)) - y)); }
  T('INV 390×844: tocar pestañas con todo a la vista no mueve la página (saltos ' + saltos.join(',') + ' px)', saltos.every(x => x <= 2), saltos.join(',')); await p._ctx.close();

  const f = res.filter(r => !r[1]);
  return (f.length ? f.map(r => 'FALLA ' + r[0] + '\n      → ' + r[2]).join('\n') + '\n' : '') + res.filter(r => r[1]).length + '/' + res.length + ' verificaciones OK (etiqueta ' + TAG + ')';
}
