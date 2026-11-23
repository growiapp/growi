// Growi 360 · F8.9B · comportamiento dinámico de las demostraciones (Home e Invitaciones): cambiar el tamaño mientras reproducen, activar o quitar «movimiento reducido» en caliente
// y salir/volver a la vista. Cubre lo que verificaban las regresiones retiradas de F8.4R para el hero anterior, ahora sobre el motor narrativo (narrar.js).
// Uso: servir la candidata o el release, ajustar BASE y ejecutar con browser_run_code_unsafe (filename). Sin dependencias.
async (page) => {
  const BASE = 'http://127.0.0.1:8840/', br = page.context().browser(), res = [];
  const T = (n, ok, d) => res.push([n, !!ok, d === undefined ? '' : String(d)]);
  const DEMOS = [['HOME', 'index.html', '[data-ha]', { 0: [1], 1: [2], 2: [0] }], ['INV', 'invitaciones/index.html', '[data-ip]', { 0: [1], 1: [2], 2: [3], 3: [0] }]];
  for (const [tag, ruta, sel, siguiente] of DEMOS) {
    const nuevo = async (w, h) => { const ctx = await br.newContext({ viewport: { width: w, height: h }, isMobile: w < 768, hasTouch: w < 768 }); const p = await ctx.newPage(); p._e = []; p._c = ctx; p.on('pageerror', e => p._e.push(e.message)); p.on('console', m => { if (m.type() === 'error') p._e.push(m.text()); }); await p.goto(BASE + ruta, { waitUntil: 'load' }); await p.waitForFunction(() => window.GrowiNar && (window.GrowiNar.home || window.GrowiNar.inv)); await p.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'center' }), sel); await p.waitForTimeout(500); return p; };
    const paso = p => p.evaluate(s => +document.querySelector(s + ' [data-nav] [aria-current]').dataset.i, sel);
    const pp = p => p.evaluate(s => { const b = document.querySelector(s + ' [data-pp]'); return b.hidden ? 'oculto' : (b.classList.contains('is-p') ? 'pausado' : 'visible'); }, sel);
    const tiempos = []; const secuencia = async (p, ms) => { const q = []; tiempos.length = 0; const t0 = Date.now(); while (Date.now() - t0 < ms) { const a = await paso(p); if (q[q.length - 1] !== a) { q.push(a); tiempos.push(Date.now()); } await p.waitForTimeout(150); } return q; };
    const dwellMin = () => { const t = tiempos.slice(1); return t.length < 3 ? 99999 : Math.min(...t.slice(1).map((x, k) => x - t[k])); };   // solo pasos completos: entre dos cambios observados (tiempos[0] es el primer muestreo, a mitad de un paso)
    const validaTransiciones = q => q.every((a, i) => i === 0 || (siguiente[q[i - 1]] || []).includes(a));   // ningún salto fuera de orden: un temporizador duplicado los produciría
    // ---- A · cambio de tamaño en caliente (1440 → 390 y cuatro vaivenes)
    let p = await nuevo(1440, 900); await p.waitForTimeout(2500);
    await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(500); await p.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'center' }), sel);
    const q1 = await secuencia(p, 14000);
    T(tag + ' 1440 → 390 sin recargar: la reproducción continúa (' + q1.join('→') + ')', q1.length >= 2 && validaTransiciones(q1));
    const prop = await p.evaluate(s => { const e = document.querySelector(s + ' .ha-ph, ' + s + ' .ip-stg').getBoundingClientRect(); return e.width / e.height; }, sel);   // el teléfono (marco incluido), no la pantalla interior
    T(tag + ' tras el cambio de tamaño el teléfono conserva 9:19,5 (' + prop.toFixed(4) + ')', Math.abs(prop - 9 / 19.5) < 0.006);
    for (let i = 0; i < 4; i++) { await p.setViewportSize({ width: 1440, height: 900 }); await p.waitForTimeout(700); await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(700); }
    await p.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'center' }), sel);
    const q2 = await secuencia(p, 26000);
    T(tag + ' tras 4 vaivenes 1440⇄390 el ritmo no se acelera ni se desordena (' + q2.join('→') + ')', q2.length >= 2 && validaTransiciones(q2) && dwellMin() >= 1800, 'paso más corto ' + dwellMin() + ' ms');
    T(tag + ' sin errores de consola durante los cambios de tamaño', p._e.length === 0, p._e.join('|')); await p._c.close();
    // ---- B · «movimiento reducido» en caliente
    p = await nuevo(1440, 900); await p.waitForTimeout(1500);
    T(tag + ' con movimiento permitido: hay control de pausa visible', await pp(p) === 'visible');
    await p.emulateMedia({ reducedMotion: 'reduce' }); await p.waitForTimeout(700);
    const a0 = await paso(p), c0 = await pp(p); await p.waitForTimeout(6000); const a1 = await paso(p);
    T(tag + ' reducir movimiento en caliente: la reproducción se detiene y se oculta el control', a0 === a1 && c0 === 'oculto', a0 + '→' + a1 + ' ' + c0);
    await p.emulateMedia({ reducedMotion: 'no-preference' }); await p.waitForTimeout(700);
    const c1 = await pp(p), q3 = await secuencia(p, 14000);
    T(tag + ' quitar el movimiento reducido en caliente: vuelve a reproducirse y reaparece el control (' + q3.join('→') + ')', c1 === 'visible' && q3.length >= 2 && validaTransiciones(q3));
    T(tag + ' sin errores de consola', p._e.length === 0, p._e.join('|')); await p._c.close();
    // ---- C · con movimiento reducido de origen, cambiar de tamaño nunca inicia la reproducción
    const ctx = await br.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); const r = await ctx.newPage(); await r.goto(BASE + ruta, { waitUntil: 'load' }); await r.waitForFunction(() => window.GrowiNar && (window.GrowiNar.home || window.GrowiNar.inv));
    await r.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'center' }), sel); await r.setViewportSize({ width: 390, height: 844 }); await r.waitForTimeout(500); await r.setViewportSize({ width: 1440, height: 900 });
    const b0 = await paso(r); await r.waitForTimeout(6000);
    T(tag + ' con movimiento reducido de origen, cambiar de tamaño nunca inicia la reproducción', b0 === await paso(r) && await pp(r) === 'oculto'); await ctx.close();
    // ---- D · fuera de la vista se detiene y al volver continúa
    p = await nuevo(390, 844); await p.waitForTimeout(1500);
    await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(800); const f0 = await paso(p); await p.waitForTimeout(7000); const f1 = await paso(p);
    T(tag + ' fuera de la vista (al pie de la página) la reproducción se detiene', f0 === f1 && await p.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return b.bottom < 0 || b.top > innerHeight; }, sel), f0 + '→' + f1);
    await p.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'center' }), sel); const q4 = await secuencia(p, 14000);
    T(tag + ' al volver a la vista continúa (' + q4.join('→') + ')', q4.length >= 2 && validaTransiciones(q4)); await p._c.close();
  }
  const f = res.filter(r => !r[1]);
  return (f.length ? f.map(r => 'FALLA ' + r[0] + ' → ' + r[2]).join('\n') + '\n' : '') + res.filter(r => r[1]).length + '/' + res.length;
}
