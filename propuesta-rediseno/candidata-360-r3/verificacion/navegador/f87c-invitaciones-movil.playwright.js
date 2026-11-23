// Growi 360 · F8.7C · Invitaciones (casamiento) en móvil: la barra fija Anterior/Siguiente no debe ocultar controles, ni foco, ni provocar saltos.
// Uso: navegar a «<sitio>/#antes» o «#despues» y ejecutar con browser_run_code_unsafe (filename). Capturas a CAP (fuera del repositorio). Sin dependencias.
async (paginaInicial) => {
  const m0 = /^(https?:\/\/[^/?#]+)\//.exec(paginaInicial.url()); if (!m0) throw new Error('Navegar primero a <sitio>/#antes|#despues');
  const TAG = (/#(\w+)/.exec(paginaInicial.url()) || [, 'x'])[1], U = m0[1], br = paginaInicial.context().browser(), res = [];
  const CAP = 'D:/Documentos/respaldos-growi/f8-7c/capturas/';
  const T = (n, ok, d) => res.push([n, !!ok, d === undefined ? '' : String(d)]);
  const abrir = async (w, h, o) => {
    const ctx = await br.newContext(Object.assign({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true }, o || {}));
    const p = await ctx.newPage(); p._errs = []; p._ctx = ctx; p.on('pageerror', e => p._errs.push('PE ' + e.message)); p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text()); });
    await p.route(/plausible\.io/, r => r.fulfill({ status: 200, body: '' })); await p.goto(U + '/invitaciones/', { waitUntil: 'load' }); await p.waitForTimeout(450); return p;
  };
  const ev = (p, f, a) => p.evaluate(f, a);
  const alSelector = async p => { await ev(p, () => { const e = document.querySelector('.ix-steps'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 90); }); await p.waitForTimeout(900); };
  const tocar = async (p, sel, ms) => { const c = await ev(p, s => { const r = document.querySelector(s).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, r.top, r.bottom, innerHeight]; }, sel); if (c[3] > c[4] + 0.5 || c[2] < -0.5) return false; await p.touchscreen.tap(c[0], c[1]); await p.waitForTimeout(ms || 1000); return true; };
  // ¿el elemento enfocado queda a la vista, bajo la cabecera y NO tapado por la barra fija?
  const libre = p => ev(p, () => {
    const a = document.activeElement; if (!a || a === document.body) return { ok: false, d: 'sin foco' };
    const r = a.getBoundingClientRect(), pn = document.querySelector('.ix-pn'), pb = pn.getBoundingClientRect(), vis = getComputedStyle(pn).visibility === 'visible';
    const cab = document.querySelector('header.top').getBoundingClientRect().bottom, cx = r.left + r.width / 2, cy = Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1);
    const top = document.elementFromPoint(cx, cy), tapado = vis && !!top && !!top.closest('.ix-pn') && !a.closest('.ix-pn');
    const dentro = r.top >= cab - 1 && r.bottom <= innerHeight + 1;
    return { ok: dentro && !tapado, d: (a.id || a.getAttribute('data-ix-pn') || a.getAttribute('name') || a.tagName) + ' ' + Math.round(r.top) + '..' + Math.round(r.bottom) + ' · barra ' + Math.round(pb.top) + '..' + Math.round(pb.bottom) + (tapado ? ' TAPADO' : '') + (dentro ? '' : ' FUERA') };
  });
  for (const [w, h] of [[320, 568], [390, 667], [390, 844]]) {
    const k = w + 'x' + h; let p = await abrir(w, h);
    // 1 · foco por teclado dentro del formulario (etapa 3) y de los controles de cada etapa: nunca tapado por la barra
    await alSelector(p); await ev(p, () => document.querySelector('.ix-steps [data-ix-acto="3"]').click()); await p.waitForTimeout(900);
    await ev(p, () => document.querySelector('#ix-cas-nombre').focus({ preventScroll: true })); await p.waitForTimeout(500);
    const seg = []; let ok = true;
    for (let i = 0; i < 9; i++) { await p.keyboard.press('Tab'); await p.waitForTimeout(350); const l = await libre(p); seg.push(l.d); ok = ok && l.ok; const a = await ev(p, () => document.activeElement.closest('.ix-pn') ? 'pn' : ''); if (a) break; }
    T('INV ' + k + ': recorrido con Tab por el formulario y hasta la barra: el foco nunca queda tapado ni fuera de la pantalla', ok, seg.join(' | '));
    await p.screenshot({ path: CAP + TAG + '-inv-foco-' + k + '.png' });
    // 2 · enviar vacío y llegar al mensaje: botones de acción alcanzables con toque real
    await ev(p, () => document.querySelector('#ix-cas-confirmar [type=submit]').scrollIntoView({ block: 'center' })); await p.waitForTimeout(800);
    const tapadoBoton = await ev(p, () => { const b = document.querySelector('#ix-cas-confirmar [type=submit]').getBoundingClientRect(), t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return !!t && !!t.closest('.ix-pn'); });
    T('INV ' + k + ': «Preparar mi mensaje» centrado en pantalla no queda bajo la barra', !tapadoBoton);
    // 3 · pie de la sección: al llegar al final del recorrido la barra no tapa la pantalla ni invade lo que sigue
    await ev(p, () => document.querySelector('#otros').scrollIntoView({ block: 'start' })); await p.waitForTimeout(900);
    const pie = await ev(p, () => { const pn = document.querySelector('.ix-pn').getBoundingClientRect(), sc = document.querySelector('.ixs').getBoundingClientRect(), vis = getComputedStyle(document.querySelector('.ix-pn')).visibility === 'visible'; return { pnBottom: Math.round(pn.bottom), storyBottom: Math.round(sc.bottom), ih: innerHeight, vis }; });
    T('INV ' + k + ': al llegar a «cumpleaños» la barra ya no está sobre la pantalla del casamiento (queda dentro de su sección)', pie.pnBottom <= pie.storyBottom + 1 || pie.storyBottom <= 0, JSON.stringify(pie));
    await ev(p, () => { const d = document.querySelector('.ixs .ix-dev').getBoundingClientRect(), pn = document.querySelector('.ix-pn').getBoundingClientRect(); window.__sol = d.bottom <= pn.top + 1 || d.bottom <= 0; });
    // 4 · cambios consecutivos rápidos: sin saltos de más y siempre en la etapa esperada
    await alSelector(p); await ev(p, () => document.querySelector('.ix-steps [data-ix-acto="1"]').click()); await p.waitForTimeout(900);
    const ys = [], etapas = []; const plan = ['[data-ix-pn="1"]', '[data-ix-pn="1"]', '[data-ix-pn="1"]', '[data-ix-pn="-1"]', '[data-ix-pn="-1"]', '[data-ix-pn="1"]', '[data-ix-pn="-1"]', '[data-ix-pn="-1"]', '[data-ix-pn="-1"]'];
    let esp = 1, fallos = 0; for (const s of plan) { const y0 = await ev(p, () => scrollY); await tocar(p, s, 450); esp = Math.min(4, Math.max(1, esp + (s.includes('-1') ? -1 : 1))); const r = await ev(p, () => [document.querySelector('[data-ix-story]').dataset.act, scrollY]); etapas.push(r[0]); ys.push(Math.abs(r[1] - y0)); if (r[0] !== String(esp)) fallos++; }
    T('INV ' + k + ': nueve cambios seguidos de etapa (toques de 450 ms): siempre la etapa esperada (' + etapas.join('') + ')', fallos === 0, etapas.join(','));
    T('INV ' + k + ': esos cambios no mueven la página más de 80 px cada uno (saltos ' + ys.join(',') + ')', ys.every(y => y <= 80), ys.join(','));
    T('INV ' + k + ': sin errores de consola ni desborde horizontal', p._errs.length === 0 && await ev(p, () => document.documentElement.scrollWidth <= innerWidth), p._errs.join('|'));
    await p._ctx.close();
  }
  // 5 · teclado móvil abierto (ventana reducida): el campo enfocado no queda bajo la cabecera, el selector ni la barra
  for (const [w, h, hk] of [[390, 844, 440], [390, 667, 360], [320, 568, 330]]) {
    const p = await abrir(w, h); await alSelector(p); await ev(p, () => document.querySelector('.ix-steps [data-ix-acto="3"]').click()); await p.waitForTimeout(900);
    await ev(p, () => document.querySelector('#ix-cas-nombre').scrollIntoView({ block: 'center' })); await p.waitForTimeout(700); await tocar(p, '#ix-cas-nombre', 400); await p.setViewportSize({ width: w, height: hk }); await p.waitForTimeout(600);
    await ev(p, () => document.activeElement.scrollIntoView({ block: 'nearest' })); await p.waitForTimeout(700);   // lo que hace el navegador al abrir el teclado: lo mínimo para ver el campo
    const r = await ev(p, () => { const f = document.querySelector('#ix-cas-nombre').getBoundingClientRect(), s = document.querySelector('.ix-steps'), pn = document.querySelector('.ix-pn'), pv = getComputedStyle(pn).visibility === 'visible', pb = pn.getBoundingClientRect(), cab = document.querySelector('header.top').getBoundingClientRect().bottom, sb = getComputedStyle(s).position === 'sticky' ? s.getBoundingClientRect().bottom : 0; const t = document.elementFromPoint(f.left + f.width / 2, f.top + f.height / 2); return { top: Math.round(f.top), bottom: Math.round(f.bottom), bajo: Math.round(Math.max(cab, sb)), barra: pv ? Math.round(pb.top) : innerHeight, tapado: !!t && !!t.closest('.ix-pn') && pv, ih: innerHeight, foco: document.activeElement.id }; });
    await p.screenshot({ path: CAP + TAG + '-inv-teclado-' + w + 'x' + hk + '.png' });
    T('INV teclado móvil (' + w + '×' + h + ' → ventana de ' + hk + ' px): el campo del nombre queda visible, bajo la cabecera/selector y sin tapar por la barra', r.top >= r.bajo - 1 && r.bottom <= r.barra + 1 && !r.tapado && r.foco === 'ix-cas-nombre', JSON.stringify(r));
    const libreAlto = await ev(p, () => { const pn = document.querySelector('.ix-pn'), v = getComputedStyle(pn).visibility === 'visible', cab = document.querySelector('header.top').getBoundingClientRect().bottom; return { barra: v ? 'visible' : 'oculta', libre: Math.round((v ? pn.getBoundingClientRect().top : innerHeight) - cab), ih: innerHeight }; });
    T('INV teclado móvil (' + w + '×' + h + ' → ' + hk + ' px): mientras se escribe la barra se oculta y deja libre todo el alto bajo la cabecera (' + libreAlto.libre + ' de ' + libreAlto.ih + ' px)', libreAlto.barra === 'oculta', JSON.stringify(libreAlto));
    await p.keyboard.type('Camila'); await p.waitForTimeout(500);
    const y0 = await ev(p, () => scrollY); await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(700);
    T('INV teclado móvil (' + w + '×' + h + '): lo escrito se conserva al cerrar el teclado y sigue la etapa 3', await ev(p, () => document.querySelector('#ix-cas-nombre').value === 'Camila' && document.querySelector('[data-ix-story]').dataset.act === '3'));
    await ev(p, () => document.activeElement.blur()); await p.waitForTimeout(300);
    T('INV teclado móvil (' + w + '×' + h + '): al salir del campo la barra vuelve a aparecer', await ev(p, () => getComputedStyle(document.querySelector('.ix-pn')).visibility === 'visible'));
    await p._ctx.close();
  }
  const f = res.filter(r => !r[1]);
  return (f.length ? f.map(r => 'FALLA ' + r[0] + '\n      → ' + r[2]).join('\n') + '\n' : '') + res.filter(r => r[1]).length + '/' + res.length + ' verificaciones OK (etiqueta ' + TAG + ')';
}
