// F8.8 · demostración del hero de la Home: geometría estable entre pasos, sin paneles atenuados, sin controles falsos, resultado final visible.
// Se ejecuta con la herramienta «browser_run_code» de Playwright (cuerpo de función async (page)), contra una copia servida en BASE.
// Es el control que faltaba en F8.7/F8.7C: falla sobre un hero cuyo alto o cuyos marcos cambian de un paso a otro (criterio: variación máxima de 1 px).
async (page) => {
  const BASE = 'http://127.0.0.1:8812/'; const TOL = 1;
  const br = page.context().browser(); const res = []; const T = (n, ok, d) => res.push((ok ? 'OK   ' : 'FALLA') + ' ' + n + (d ? ' · ' + d : ''));
  const SIZES = [[320, 568], [360, 740], [390, 667], [390, 844], [768, 1024], [1280, 720], [1440, 900]];
  // medición en la página: posiciones absolutas (con scroll) de los marcos principales y del contenido vecino
  const medir = () => {
    const q = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [b.left + scrollX, b.top + scrollY, b.width, b.height]; };
    const mod = document.querySelector('[data-hs]').getBoundingClientRect(); const next = document.querySelector('#necesidad');
    return { modulo: q('[data-hs]'), tablero: q('.hs-board'), pasos: q('.hs-steps'), leyenda: q('[data-hs-cap]'),
      sitio: q('.hs-a') || q('.hs-dev'), negocio: q('.hs-b') || q('.hs-agp'), vecino: next ? [0, next.getBoundingClientRect().top + scrollY, 0, 0] : null, y: mod.top + scrollY };
  };
  const variacion = (muestras) => { const o = {}; for (const k of ['modulo', 'tablero', 'pasos', 'leyenda', 'sitio', 'negocio', 'vecino']) { const v = muestras.map(m => m[k]).filter(Boolean); if (!v.length) continue; o[k] = [0, 1, 2, 3].map(i => Math.max(...v.map(x => x[i])) - Math.min(...v.map(x => x[i]))); } return o; };
  const peor = (o) => Math.max(...Object.values(o).flat());
  const abrir = async (w, h, rm) => { const ctx = await br.newContext({ viewport: { width: w, height: h }, isMobile: w < 768, hasTouch: w < 768, reducedMotion: rm ? 'reduce' : 'no-preference' }); const p = await ctx.newPage(); await p.route(/plausible\.io/, r => r.fulfill({ status: 200, body: '' })); await p.goto(BASE, { waitUntil: 'load' }); await p.waitForTimeout(500); await p.evaluate(() => document.querySelector('[data-hs]').scrollIntoView({ block: 'center' })); await p.waitForTimeout(600); return [ctx, p]; };

  // 1 · pasos manuales (estado estable de cada paso) en los 7 tamaños
  for (const [w, h] of SIZES) {
    const [ctx, p] = await abrir(w, h, true); const m = [];
    for (const [n, d] of [[1, 0], [2, 0], [3, 0], [3, 1], [1, 0]]) { await p.evaluate(a => window.GrowiHeroStory.go(a[0], !!a[1]), [n, d]); await p.waitForTimeout(1000); m.push(await p.evaluate(medir)); }
    const v = variacion(m); T('estados manuales ' + w + '×' + h + ': marcos y vecino estables (≤ ' + TOL + ' px)', peor(v) <= TOL, JSON.stringify(Object.fromEntries(Object.entries(v).filter(([, a]) => Math.max(...a) > TOL))));
    await ctx.close();
  }
  // 2 · reproducción automática completa, muestreada cada 100 ms (incluye las transiciones), en paralelo
  const auto = await Promise.all(SIZES.map(async ([w, h]) => {
    const [ctx, p] = await abrir(w, h, false); const m = []; const pasos = new Set(); let ult = null; const t0 = Date.now();
    while (Date.now() - t0 < 14000) { const r = await p.evaluate((f) => ({ m: (0, eval)('(' + f + ')')(), s: (document.querySelector('[data-hs-s][aria-current]') || {}).textContent, ok: !!document.querySelector('[data-hs-slot].ok') }), medir.toString()); m.push(r.m); pasos.add(r.s + (r.ok ? '+ok' : '')); await p.waitForTimeout(100); }
    const v = variacion(m); await ctx.close(); return [w, h, peor(v), [...pasos].length, JSON.stringify(Object.fromEntries(Object.entries(v).filter(([, a]) => Math.max(...a) > TOL)))];
  }));
  for (const [w, h, pe, np, det] of auto) T('reproducción automática ' + w + '×' + h + ': estable durante todo el ciclo (≤ ' + TOL + ' px) y recorre los tres pasos y el turno confirmado', pe <= TOL && np >= 4, 'variación máx ' + pe + ' px, estados ' + np + (pe > TOL ? ' ' + det : ''));

  // 3 · sin paneles atenuados ni controles falsos; resultado final visible (escritorio y móvil)
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    const [ctx, p] = await abrir(w, h, true);
    for (const [n, d] of [[1, 0], [2, 0], [3, 0], [3, 1]]) {
      await p.evaluate(a => window.GrowiHeroStory.go(a[0], !!a[1]), [n, d]); await p.waitForTimeout(1000);
      const r = await p.evaluate(() => { const bd = document.querySelector('.hs-board'); const baja = []; bd.querySelectorAll('*').forEach(e => { const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none' || !e.getBoundingClientRect().width) return; let o = 1; for (let a = e; a && a !== bd.parentNode; a = a.parentElement) o *= +getComputedStyle(a).opacity; if (o < 0.95 && /\S/.test(e.childNodes.length && [...e.childNodes].some(c => c.nodeType === 3 && /\S/.test(c.textContent)) ? 'x' : '')) baja.push(e.className || e.tagName); });
        const ctl = bd.querySelectorAll('button,a,input,select,textarea,[tabindex]:not([tabindex="-1"]),[role=button]').length; return { baja: baja.slice(0, 3), ctl }; });
      T(w + ' paso ' + n + (d ? ' (final)' : '') + ': sin texto atenuado ni controles dentro de la escena', r.baja.length === 0 && r.ctl === 0, JSON.stringify(r));
    }
    const fin = await p.evaluate(() => { const l = document.querySelector('.hs-ly.on') || document.querySelector('.hs-board'), s = document.querySelector('[data-hs-slot]') || l; const vis = e => { const b = e.getBoundingClientRect(), c = (document.querySelector('.hs-b') || document.querySelector('.hs-board')).getBoundingClientRect(); return b.width > 0 && b.top >= c.top - 1 && b.bottom <= c.bottom + 1; }; return { txt: l.innerText.replace(/\s+/g, ' '), visible: vis(s) && [...s.querySelectorAll('b,.tc')].every(vis) }; });
    T(w + ': el resultado final dice «Julián · 11:15 · Turno confirmado» y está entero a la vista', /11:15/.test(fin.txt) && /Julián/.test(fin.txt) && /Turno confirmado/.test(fin.txt) && fin.visible, fin.txt);
    await ctx.close();
  }
  // 4 · pausa y reanudación, salir y volver al viewport, cambio de tamaño, movimiento reducido
  { const [ctx, p] = await abrir(1440, 900, false); const est = () => p.evaluate(() => ((document.querySelector('[data-hs-s][aria-current]') || {}).textContent || '') + (document.querySelector('[data-hs-slot].ok') ? '+ok' : ''));
    await p.click('[data-hs-pp]'); const a = await est(); await p.waitForTimeout(3500); T('pausa congela la secuencia', a === await est());
    await p.click('[data-hs-pp]'); await p.waitForTimeout(3600); const vistos = new Set(); for (let i = 0; i < 30; i++) { vistos.add(await est()); await p.waitForTimeout(450); } T('reanudar continúa la secuencia', vistos.size >= 3, [...vistos].join(','));
    await p.evaluate(() => scrollTo(0, 99999)); await p.waitForTimeout(500); const b = await est(); await p.waitForTimeout(3500); T('fuera de pantalla la secuencia se detiene', b === await est());
    await p.evaluate(() => document.querySelector('[data-hs]').scrollIntoView({ block: 'center' })); await p.waitForTimeout(500); const c = await est(); await p.waitForTimeout(4200); T('al volver a la vista se reanuda', c !== await est());
    const m0 = await p.evaluate(medir); await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(800); await p.setViewportSize({ width: 1440, height: 900 }); await p.waitForTimeout(800); await p.evaluate(() => document.querySelector('[data-hs]').scrollIntoView({ block: 'center' })); await p.waitForTimeout(400);
    const m1 = await p.evaluate(medir); T('cambiar el tamaño de la ventana y volver deja el módulo con el mismo alto', Math.abs(m1.modulo[3] - m0.modulo[3]) <= TOL, m0.modulo[3] + ' → ' + m1.modulo[3]);
    await p.click('[data-hs-s="2"]'); await p.waitForTimeout(300); const man = await est(); await p.waitForTimeout(4000); T('tocar un paso toma el control: no vuelve a avanzar solo', man === await est() && !(await p.evaluate(() => !document.querySelector('[data-hs-pp]').hidden)));
    await ctx.close(); }
  { const [ctx, p] = await abrir(390, 844, true); const s0 = await p.evaluate(() => document.querySelector('[data-hs-s][aria-current]').textContent); await p.waitForTimeout(3500); T('movimiento reducido: no avanza solo, sin botón de pausa y sin animaciones', s0 === await p.evaluate(() => document.querySelector('[data-hs-s][aria-current]').textContent) && await p.evaluate(() => document.querySelector('[data-hs-pp]').hidden && [...document.querySelectorAll('[data-hs] *')].every(e => getComputedStyle(e).animationName === 'none')));
    await p.click('[data-hs-s="3"]'); await p.waitForTimeout(300); T('movimiento reducido: elegir el paso 3 muestra el turno confirmado sin más interacción', await p.evaluate(() => /Turno confirmado/.test((document.querySelector('.hs-ly.on') || document.querySelector('.hs-board')).innerText)));
    await ctx.close(); }
  return res.join('\n') + '\n' + (res.some(r => r.startsWith('FALLA')) ? 'RESULTADO: HAY FALLAS' : 'RESULTADO: ' + res.length + '/' + res.length + ' OK');
}
