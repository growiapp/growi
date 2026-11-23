// Growi 360 · F8.7 · regresión de los hallazgos de la revisión en teléfono real (Invitaciones, cumpleaños, empresa, Home, Combo, Café Nogal, planes), con interacciones reales.
// Uso: navegar a «<sitio>/#antes» o «<sitio>/#despues» (el fragmento solo etiqueta las capturas) y ejecutar con browser_run_code_unsafe (filename).
// Las capturas van a CAP (fuera del repositorio). Sin dependencias. Dura ~4-5 min (el cliente MCP lo pasa a segundo plano).
async (paginaInicial) => {
  const m0 = /^(https?:\/\/[^/?#]+)\//.exec(paginaInicial.url()); if (!m0) throw new Error('Navegar primero a <sitio>/#antes|#despues');
  const TAG = (/#(\w+)/.exec(paginaInicial.url()) || [, 'x'])[1], U = m0[1], br = paginaInicial.context().browser(), res = [];
  const CAP = 'D:/Documentos/respaldos-growi/f8-7/capturas/';
  const T = (n, ok, d) => res.push([n, !!ok, d === undefined ? '' : String(d)]);
  const abrir = async (w, h, o, ruta) => {
    const ctx = await br.newContext(Object.assign({ viewport: { width: w, height: h }, hasTouch: true, isMobile: w < 768 }, o || {}));
    const p = await ctx.newPage(); p._errs = []; p._ctx = ctx; p.on('pageerror', e => p._errs.push('PE ' + e.message)); p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text()); });
    await p.route(/plausible\.io/, r => r.fulfill({ status: 200, body: '' })); await p.goto(U + ruta, { waitUntil: 'load' }); await p.waitForTimeout(450); return p;
  };
  const ev = (p, f, a) => p.evaluate(f, a);
  const centro = (p, sel) => ev(p, s => { const r = document.querySelector(s).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, r.top, r.bottom]; }, sel);
  const tocar = async (p, sel, verCon) => { const c = await centro(p, sel); const ih = await ev(p, () => innerHeight); if (c[3] > ih + 0.5 || c[2] < -0.5) return false; await p.touchscreen.tap(c[0], c[1]); await p.waitForTimeout(verCon || 1100); return true; };
  const sinDesborde = p => ev(p, () => document.documentElement.scrollWidth <= innerWidth);

  // ================================================================ INVITACIONES · casamiento (A tamaños, B navegación, C perspectiva)
  const medir = p => ev(p, () => {
    const r = e => { const b = e.getBoundingClientRect(); return { t: +b.top.toFixed(1), b: +b.bottom.toFixed(1) }; };
    const cab = r(document.querySelector('header.top')), sel = document.querySelector('.ix-steps'), s = r(sel), pos = getComputedStyle(sel).position, pn = document.querySelector('.ix-pn'), pr = r(pn);
    const tab = r(document.querySelector('.ix-steps [aria-current]')), tit = r(document.querySelector('.ix-act.on .ix-act-b')), ih = innerHeight;
    const selV = s.t >= cab.b - 0.5 && s.b <= ih + 0.5, tabV = tab.t >= cab.b - 0.5 && tab.b <= ih + 0.5, titV = tit.t >= (pos === 'sticky' ? s.b : cab.b) - 0.5 && tit.b <= ih + 0.5;
    const pnV = getComputedStyle(pn).visibility === 'visible' && pr.t >= cab.b - 0.5 && pr.b <= ih + 0.5;
    return { cab, s, pr, tab, tit, pos, ih, selV, tabV, titV, pnV, ok: selV && tabV && titV && pnV, act: document.querySelector('[data-ix-story]').dataset.act, texto: document.querySelector('.ix-steps [aria-current]').textContent.trim() };
  });
  const resumen = m => 'cabecera ..' + m.cab.b + ' · selector ' + m.s.t + '..' + m.s.b + ' (' + m.pos + ') · pestaña «' + m.texto + '» ' + m.tab.t + '..' + m.tab.b + ' · título ' + m.tit.t + '..' + m.tit.b + ' · botones ' + m.pr.t + '..' + m.pr.b + ' · ventana ' + m.ih + ' → ' + (m.ok ? 'todo visible' : 'FALTA: ' + [!m.selV && 'selector', !m.tabV && 'pestaña', !m.titV && 'título', !m.pnV && 'Anterior/Siguiente'].filter(Boolean).join(', '));
  for (const [w, h] of [[320, 568], [390, 667], [390, 844]]) {
    const k = w + 'x' + h; const p = await abrir(w, h, {}, '/invitaciones/');
    // C · perspectiva narrativa
    const lab = await ev(p, () => [...document.querySelectorAll('.ix-steps button')].map(b => b.textContent.trim() + (b.scrollWidth > b.clientWidth + 1 ? '!' : '')));
    T('INV ' + k + ': selector «La enviás · La abren · Confirman · Te responden», sin desborde de las pestañas', lab.join('|') === 'La enviás|La abren|Confirman|Te responden', lab.join('|'));
    const chatTxt = await ev(p, () => document.querySelector('.ix-ch-m p').textContent.trim());
    T('INV ' + k + ': el mensaje de Lucía a sus invitados es el aprobado', chatTxt === '¡Hola! Les compartimos la invitación a nuestro casamiento. Ahí están todos los detalles y cómo confirmar asistencia. ¡Los esperamos!', chatTxt);
    const nota = await ev(p, () => [...document.querySelectorAll('.ix-note')].map(e => e.textContent).join(' '));
    T('INV ' + k + ': la narrativa conserva que el mensaje de WhatsApp no se envía solo', /No se env[ií]a solo/.test(nota) && /Todav[ií]a no se envi[oó]|Lo revis[aá]s y lo envi[aá]s vos/.test(await ev(p, () => document.querySelector('[data-ly=mensaje]').textContent)), nota);
    // barra de navegación oculta antes de llegar al selector
    T('INV ' + k + ': la barra Anterior/Siguiente aparece cuando el selector entra en la pantalla (no antes)', await ev(p, () => getComputedStyle(document.querySelector('.ix-pn')).visibility === (document.querySelector('.ix-steps').getBoundingClientRect().top < innerHeight ? 'visible' : 'hidden')));
    await ev(p, () => { const e = document.querySelector('.ix-steps'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 90); }); await p.waitForTimeout(900);
    // A · alturas de la pantalla en las cuatro etapas
    const alt = [], recort = []; for (const n of [1, 2, 3, 4]) { await ev(p, n => document.querySelector('.ix-steps [data-ix-acto="' + n + '"]').click(), n); await p.waitForTimeout(800); const r = await ev(p, () => { const s = document.querySelector('.ix-scr[data-inv=cas]'), l = [...s.querySelectorAll(':scope > [data-ly]')].filter(x => !x.hidden && x.classList.contains('on'))[0]; return [Math.round(s.getBoundingClientRect().height), l ? l.scrollHeight - l.clientHeight : 0]; }); alt.push(r[0]); recort.push(r[1]); }
    const rango = Math.max.apply(null, alt) - Math.min.apply(null, alt);
    T('INV ' + k + ': la pantalla mantiene su altura entre etapas (' + alt.join(' / ') + ' px; variación ' + rango + ' px)', rango <= (w <= 340 ? 60 : 12), alt.join(','));
    T('INV ' + k + ': ninguna etapa recorta contenido', recort.every(x => x <= 1), recort.join(','));
    // B · navegación
    await ev(p, () => { const e = document.querySelector('.ix-steps'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 90); }); await p.waitForTimeout(900);
    await ev(p, () => document.querySelector('.ix-steps [data-ix-acto="4"]').click()); await p.waitForTimeout(900);
    let ok = await tocar(p, '[data-ix-pn="-1"]'); let m = await medir(p); await p.screenshot({ path: CAP + TAG + '-f87-inv-' + k + '-4a3.png' });
    T('INV ' + k + ': 4 → Anterior → 3: botón tocable y selector, pestaña, título y botones visibles', ok && m.ok && m.act === '3', (ok ? '' : 'botón fuera de pantalla · ') + resumen(m));
    ok = await tocar(p, '[data-ix-pn="-1"]'); m = await medir(p); await p.screenshot({ path: CAP + TAG + '-f87-inv-' + k + '-3a2.png' });
    T('INV ' + k + ': 3 → Anterior → 2: todo visible', ok && m.ok && m.act === '2', (ok ? '' : 'botón fuera de pantalla · ') + resumen(m));
    await ev(p, () => document.querySelector('.ix-steps [data-ix-acto="1"]').click()); await p.waitForTimeout(900);
    ok = await tocar(p, '[data-ix-pn="1"]'); m = await medir(p); await p.screenshot({ path: CAP + TAG + '-f87-inv-' + k + '-1s2.png' });
    T('INV ' + k + ': 1 → Siguiente → 2: todo visible', ok && m.ok && m.act === '2', (ok ? '' : 'botón fuera de pantalla · ') + resumen(m));
    let todo = true, det = []; for (const [sel, esp] of [['[data-ix-pn="1"]', '3'], ['[data-ix-pn="1"]', '4'], ['[data-ix-pn="-1"]', '3'], ['[data-ix-pn="-1"]', '2'], ['[data-ix-pn="-1"]', '1']]) { const t = await tocar(p, sel); m = await medir(p); const bien = t && m.ok && m.act === esp; todo = todo && bien; det.push(m.act + ':' + (bien ? 'ok' : 'FALLA')); }
    T('INV ' + k + ': recorrido completo con Siguiente y Anterior sin perder la navegación (' + det.join(' ') + ')', todo, det.join(' '));
    todo = true; det = []; for (const n of [4, 2, 3, 1, 4]) { const t = await tocar(p, '.ix-steps [data-ix-acto="' + n + '"]'); m = await medir(p); const bien = t && m.ok && m.act === String(n); todo = todo && bien; det.push(n + ':' + (bien ? 'ok' : 'FALLA')); }
    T('INV ' + k + ': selección directa de pestañas (' + det.join(' ') + ')', todo, det.join(' '));
    await ev(p, () => document.querySelector('[data-ix-pn="-1"]').focus()); await p.keyboard.press('Enter'); await p.waitForTimeout(1100); m = await medir(p);
    T('INV ' + k + ': teclado — Anterior con Enter: todo visible', m.ok && m.act === '3', resumen(m));
    await ev(p, () => document.querySelector('[data-ix-pn="1"]').focus()); await p.keyboard.press('Space'); await p.waitForTimeout(1100); m = await medir(p);
    T('INV ' + k + ': teclado — Siguiente con Espacio: todo visible', m.ok && m.act === '4', resumen(m));
    await tocar(p, '.ix-steps [data-ix-acto="3"]'); await ev(p, () => document.querySelector('#ix-cas-nombre').focus({ preventScroll: true })); await p.keyboard.type('Camila'); await p.waitForTimeout(900);
    const y0 = await ev(p, () => scrollY); await ev(p, () => window.GrowiInvUI.cas.aVista({ tipo: 'ir' })); await p.waitForTimeout(600);
    T('INV ' + k + ': con el foco en un campo de texto no se desplaza la página (' + y0 + ' → ' + await ev(p, () => scrollY) + ')', y0 === await ev(p, () => scrollY));
    T('INV ' + k + ': sin errores de consola ni desborde', p._errs.length === 0 && await sinDesborde(p), p._errs.join('|'));
    await p._ctx.close();
  }

  // ================================================================ CUMPLEAÑOS · 21:00 → 22:00 → 00:00
  const noche = p => ev(p, () => ({ clock: document.querySelector('[data-clock]').textContent, nt: document.querySelector('[data-nt]').textContent, t: document.querySelector('.ix-cum').dataset.t, pp: (() => { const b = document.querySelector('[data-ix-pp]'); return b.hidden ? 'oculto' : (b.classList.contains('is-paused') ? 'pausado' : 'visible'); })(), reinicio: document.querySelector('[data-ix-reiniciar-ev=cum]').hasAttribute('data-off') ? 'oculto' : 'visible' }));
  const aNoche = async p => { await ev(p, () => document.querySelector('#cumple').scrollIntoView({ block: 'start' })); await p.waitForTimeout(900); await ev(p, () => document.querySelector('#ix-cum-portada [data-go=noche]').click()); await p.waitForTimeout(500); };
  let p = await abrir(390, 844, {}, '/invitaciones/'); await aNoche(p);
  let n0 = await noche(p); await p.screenshot({ path: CAP + TAG + '-f87-cumple-2100.png' });
  T('CUM la noche empieza a las 21:00 · Brindis, con el cielo de la tarde y el control de pausa visible', n0.clock === '21:00' && n0.nt === 'Brindis' && n0.t === '0' && n0.pp === 'visible', JSON.stringify(n0));
  await p.waitForTimeout(6200); let n1 = await noche(p); T('CUM avanza sola a las 22:00 · Cena', n1.clock === '22:00' && n1.nt === 'Cena' && n1.t === '1', JSON.stringify(n1));
  await p.waitForTimeout(5900); let n2 = await noche(p); await p.screenshot({ path: CAP + TAG + '-f87-cumple-0000.png' });
  T('CUM continúa a las 00:00 · Torta y baile', n2.clock === '00:00' && n2.nt === 'Torta y baile' && n2.t === '2', JSON.stringify(n2));
  await p.waitForTimeout(6500); let n3 = await noche(p);
  T('CUM en las 00:00 termina: no vuelve a cambiar, se oculta la pausa y no aparece «Empezar de nuevo» por el avance automático', n3.clock === '00:00' && n3.pp === 'oculto' && n3.reinicio === 'oculto', JSON.stringify(n3));
  await p._ctx.close();
  p = await abrir(390, 844, {}, '/invitaciones/'); await aNoche(p); await ev(p, () => document.querySelector('[data-ix-pp]').click()); await p.waitForTimeout(7000); n1 = await noche(p);
  T('CUM con pausa: se queda en 21:00 (control «Reanudar»)', n1.clock === '21:00' && n1.pp === 'pausado', JSON.stringify(n1));
  await ev(p, () => document.querySelector('[data-ix-pp]').click()); await p.waitForTimeout(6300); n1 = await noche(p); T('CUM al reanudar vuelve a avanzar (22:00)', n1.clock === '22:00', JSON.stringify(n1));
  await p._ctx.close();
  p = await abrir(390, 844, {}, '/invitaciones/'); await aNoche(p); await ev(p, () => document.querySelector('.ix-stop[data-idx="2"]').click()); await p.waitForTimeout(500); n1 = await noche(p);
  T('CUM si la persona elige una hora, toma el control: el control de pausa desaparece', n1.clock === '00:00' && n1.pp === 'oculto', JSON.stringify(n1));
  await ev(p, () => document.querySelector('.ix-stop[data-idx="0"]').click()); await p.waitForTimeout(7200); n1 = await noche(p);
  T('CUM tras elegir 21:00 no avanza sola (sin transiciones inesperadas)', n1.clock === '21:00', JSON.stringify(n1));
  await ev(p, () => document.querySelector('[data-ix-reiniciar-ev=cum]').click()); await p.waitForTimeout(600); n1 = await noche(p);
  T('CUM «Empezar de nuevo» vuelve a la portada y la noche a las 21:00', n1.clock === '21:00' && await ev(p, () => document.querySelector('#cumple .ix-ly.on').dataset.ly) === 'portada', JSON.stringify(n1));
  await p._ctx.close();
  p = await abrir(390, 844, { reducedMotion: 'reduce' }, '/invitaciones/'); await aNoche(p); await p.waitForTimeout(7000); n1 = await noche(p);
  T('CUM con movimiento reducido: se queda en 21:00 y no hay control de pausa', n1.clock === '21:00' && n1.pp === 'oculto', JSON.stringify(n1));
  await p._ctx.close();

  // ================================================================ EMPRESA · «Ver la jornada completa»
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    p = await abrir(w, h, {}, '/invitaciones/'); await ev(p, () => document.querySelector('#empresa').scrollIntoView({ block: 'start' })); await p.waitForTimeout(900);
    const dest = () => ev(p, () => { const j = document.querySelector('#ix-emp-jornada').getBoundingClientRect(), c = document.querySelector('header.top').getBoundingClientRect().bottom; return { t: Math.round(j.top), c: Math.round(c), ih: innerHeight, foco: document.activeElement && document.activeElement.id }; });
    const BJ = '#empresa .ix-eact .ix-lk', BC = '#empresa .ix-eact .ix-ebtn', centrar = sel => ev(p, s => document.querySelector(s).scrollIntoView({ block: 'center' }), sel);
    await centrar(BJ); await p.waitForTimeout(900); await tocar(p, BJ, 1300); let d = await dest();
    await p.screenshot({ path: CAP + TAG + '-f87-empresa-' + w + '.png' });
    T('EMP ' + w + ': «Ver la jornada completa» lleva a la jornada (queda bajo la cabecera y a la vista) y mueve el foco a su título', d.t >= d.c - 2 && d.t < d.ih * 0.75 && d.foco === 'ix-emp-hj', JSON.stringify(d));
    await ev(p, () => document.querySelector('#empresa').scrollIntoView({ block: 'start' })); await p.waitForTimeout(900);
    await centrar(BJ); await p.waitForTimeout(900); await tocar(p, BJ, 1300); d = await dest();
    T('EMP ' + w + ': el enlace sigue funcionando la segunda vez', d.t >= d.c - 2 && d.t < d.ih * 0.75, JSON.stringify(d));
    await ev(p, () => document.querySelector('#empresa').scrollIntoView({ block: 'start' })); await p.waitForTimeout(900);
    await centrar(BC); await p.waitForTimeout(900); await tocar(p, BC, 1300);
    const cf = await ev(p, () => { const f = document.querySelector('#ix-emp-confirmar').getBoundingClientRect(); return { t: Math.round(f.top), ih: innerHeight, c: Math.round(document.querySelector('header.top').getBoundingClientRect().bottom) }; });
    T('EMP ' + w + ': «Confirmar asistencia» lleva al formulario', cf.t >= cf.c - 2 && cf.t < cf.ih * 0.75, JSON.stringify(cf));
    await p._ctx.close();
  }

  // ================================================================ HOME · hero en movimiento también en móvil, sin recorte, sin leyendas
  const sello = p => ev(p, () => { const r = document.querySelector('[data-hs]'); const s = document.querySelector('[data-hs-s][aria-current]'); return (s ? s.getAttribute('data-hs-s') : '?') + (document.querySelector('[data-hs-slot]').classList.contains('ok') ? 'b' : '') + (r.classList.contains('hs-press') ? 'p' : ''); });
  const observar = async (p, ms) => { const c = []; let ult = await sello(p), t0 = Date.now(); while (Date.now() - t0 < ms) { await p.waitForTimeout(100); const s = await sello(p); if (s !== ult) { c.push(ult + '→' + s); ult = s; } } return c; };
  const verEscena = p => ev(p, () => document.querySelector('[data-hs]').scrollIntoView({ block: 'center' }));
  const pausa = p => ev(p, () => { const b = document.querySelector('[data-hs-pp]'); return b.hidden || getComputedStyle(b).display === 'none' ? 'oculto' : 'visible'; });
  for (const [w, h] of [[390, 844], [320, 568]]) {
    p = await abrir(w, h, {}, '/'); await verEscena(p); await p.waitForTimeout(500);
    const c = await observar(p, 8000);
    T('HOME ' + w + ': el hero se mueve solo en móvil (' + c.length + ' cambios en 8 s) y muestra el control de pausa', c.length >= 2 && await pausa(p) === 'visible', c.join(' '));
    await p.screenshot({ path: CAP + TAG + '-f87-home-hero-' + w + '.png' });
    await ev(p, () => window.GrowiHeroStory.go(1, false)); await p.waitForTimeout(300);
    const im = await ev(p, () => { const i = [...document.querySelectorAll('.hs-im')].find(x => x.offsetWidth); const b = i.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height), nat: i.naturalWidth + 'x' + i.naturalHeight, nw: i.naturalWidth, nh: i.naturalHeight, tag: document.querySelector('.hs-tag').textContent.trim(), txt: document.querySelector('[data-hs]').innerText }; });
    T('HOME ' + w + ': la captura del sitio de Centro Ribera carga y conserva su proporción (' + (im.h / im.w).toFixed(3) + '), sin deformarse', im.nw > 0 && Math.abs(im.h / im.w - im.nh / im.nw) < 0.01, JSON.stringify(im));
    T('HOME ' + w + ': la leyenda es «Demo» y no hay «Ejemplo ilustrativo» ni «Datos ficticios» en la escena', im.tag === 'Demo' && !/ejemplo ilustrativo|datos ficticios/i.test(im.txt), im.tag);
    await ev(p, () => document.querySelector('[data-hs-pp]').click()); const cp = await observar(p, 4500);
    T('HOME ' + w + ': con pausa del usuario no avanza', cp.length === 0, cp.join(' '));
    await p._ctx.close();
  }
  p = await abrir(1440, 900, {}, '/'); await verEscena(p); await p.waitForTimeout(500); await observar(p, 1500); await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(700); await verEscena(p);
  const cr = await observar(p, 6500); T('HOME 1440 → 390 sin recargar: la reproducción continúa', cr.length >= 1 && await pausa(p) === 'visible', cr.join(' ')); await p._ctx.close();
  p = await abrir(390, 844, { reducedMotion: 'reduce' }, '/'); await verEscena(p); const cm = await observar(p, 4500);
  T('HOME 390 con movimiento reducido: no avanza y no hay control de pausa (los pasos siguen disponibles)', cm.length === 0 && await pausa(p) === 'oculto', cm.join(' ')); await p._ctx.close();
  p = await abrir(390, 844, {}, '/'); await verEscena(p); await p.waitForTimeout(400); await ev(p, () => document.querySelector('[data-hs-s="2"]').click()); const cman = await observar(p, 5000);
  T('HOME 390: al tocar un paso la persona toma el control (no avanza sola)', cman.length === 0 && await pausa(p) === 'oculto', cman.join(' ')); await p._ctx.close();

  // ================================================================ COMBO · demostración animada, una cosa a la vez en móvil
  const cdSt = p => ev(p, () => { const r = document.querySelector('.cd[data-cd]'); const vis = ['.cd-site', '.cd-chat', '.cd-gest'].filter(s => getComputedStyle(r.querySelector(s)).display !== 'none').length; const b = r.querySelector('[data-cd-pp]'); return { s: r.getAttribute('data-cd-s'), vis, pp: b.hidden ? 'oculto' : (b.classList.contains('is-paused') ? 'pausado' : 'visible'), cur: (r.querySelector('[aria-current]') || {}).textContent ? r.querySelector('[aria-current]').getAttribute('data-cd-n') : null }; });
  for (const [w, h] of [[390, 844], [320, 568], [1440, 900]]) {
    p = await abrir(w, h, {}, '/combo/'); await ev(p, () => document.querySelector('.cd').scrollIntoView({ block: 'center' })); await p.waitForTimeout(600);
    const vistos = [], paneles = []; const t0 = Date.now(); while (Date.now() - t0 < 16500) { const s = await cdSt(p); if (vistos[vistos.length - 1] !== s.s) vistos.push(s.s); paneles.push(s.vis); await p.waitForTimeout(250); }
    T('COMBO ' + w + ': la demostración avanza sola por los cuatro pasos en orden (' + vistos.join('→') + ')', ['1', '2', '3', '4'].every(x => vistos.includes(x)) && vistos.indexOf('2') > vistos.indexOf('1') && vistos.indexOf('4') > vistos.indexOf('3'), vistos.join(','));
    if (w < 768) T('COMBO ' + w + ': en móvil se muestra una sola parte por vez', paneles.every(x => x === 1), paneles.join('').slice(0, 40)); else T('COMBO ' + w + ': en escritorio se ven las tres partes a la vez', paneles.every(x => x === 3));
    const tx = await ev(p, () => document.querySelector('.cd').textContent);
    T('COMBO ' + w + ': sin leyendas «Ejemplo ilustrativo» ni «datos ficticios»; identificación «Demo»', !/ejemplo ilustrativo|datos ficticios/i.test(tx) && /Demo/.test(tx));
    await p.screenshot({ path: CAP + TAG + '-f87-combo-' + w + '.png' });
    const antes = await cdSt(p); await ev(p, () => document.querySelector('[data-cd-pp]').click()); await p.waitForTimeout(5200); const desp = await cdSt(p);
    T('COMBO ' + w + ': con pausa no avanza', antes.s === desp.s && desp.pp === 'pausado', antes.s + ' → ' + desp.s);
    await ev(p, () => document.querySelector('[data-cd-n="3"]').click()); await p.waitForTimeout(5200); const man = await cdSt(p);
    T('COMBO ' + w + ': al elegir un paso la persona toma el control (queda en el paso 3, sin control de pausa)', man.s === '3' && man.pp === 'oculto', JSON.stringify(man));
    T('COMBO ' + w + ': sin desborde ni errores', await sinDesborde(p) && p._errs.length === 0, p._errs.join('|'));
    await p._ctx.close();
  }
  p = await abrir(390, 844, { reducedMotion: 'reduce' }, '/combo/'); await ev(p, () => document.querySelector('.cd').scrollIntoView({ block: 'center' })); await p.waitForTimeout(500); const ra = await cdSt(p); await p.waitForTimeout(5000); const rb = await cdSt(p);
  T('COMBO 390 con movimiento reducido: no avanza y se puede recorrer a mano', ra.s === rb.s && rb.pp === 'oculto'); await ev(p, () => document.querySelector('[data-cd-n="4"]').click()); await p.waitForTimeout(400); T('COMBO 390 con movimiento reducido: elegir el paso 4 muestra la agenda', (await cdSt(p)).s === '4'); await p._ctx.close();
  p = await abrir(1440, 900, {}, '/'); T('HOME: la fila de Combo usa la misma demostración (sin leyendas redundantes)', await ev(p, () => { const c = document.querySelector('#n-combo .cd'); return !!c && !/ejemplo ilustrativo|datos ficticios/i.test(c.innerText); })); await p._ctx.close();

  // ================================================================ GROWIAPP · vista previa de Café Nogal / Estudio Bruma igual a la app que se abre
  for (const [ruta, dest, id, alto] of [['/app/cafeterias/', '/demos/sandbox/cafeteria/', 'cafe-nogal', 972], ['/app/peluquerias/', '/demos/sandbox/peluqueria/', 'bruma', 1190]]) {
    p = await abrir(390, 844, {}, ruta); await ev(p, () => document.querySelector('.cn-ph').scrollIntoView({ block: 'center' })); await p.waitForTimeout(900);
    const g = await ev(p, () => { const i = document.querySelector('.cn-ph img'), b = i.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height), nat: i.naturalWidth + 'x' + i.naturalHeight, fade: getComputedStyle(document.querySelector('.cn-ph'), '::after').content }; });
    await p.screenshot({ path: CAP + TAG + '-f87-' + id + '-vista-previa.png' });
    T('APP ' + id + ': la vista previa móvil se ve completa, sin recorte ni degradé (' + g.nat + ', alto/ancho ' + (g.h / g.w).toFixed(3) + ')', g.nat === '780x' + alto && Math.abs(g.h / g.w - alto / 780) < 0.02 && (g.fade === 'none' || g.fade === 'normal'), JSON.stringify(g));
    const ctx2 = await br.newContext({ viewport: { width: 390, height: 790 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' }); const q = await ctx2.newPage(); await q.route(/plausible\.io/, r => r.fulfill({ status: 200, body: '' }));
    await q.goto(U + dest, { waitUntil: 'load' }); await q.addStyleTag({ content: '*{scrollbar-width:none!important}::-webkit-scrollbar{display:none!important}' }); await q.waitForTimeout(1800); const buf = (await q.screenshot()).toString('base64'); await ctx2.close();
    const dif = await ev(p, async a => {
      const cargar = src => new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; });
      const A = await cargar(document.querySelector('.cn-ph img').currentSrc), B = await cargar('data:image/png;base64,' + a.buf);
      const c1 = document.createElement('canvas'), c2 = document.createElement('canvas'); c1.width = c2.width = 780; c1.height = c2.height = a.alto;
      c1.getContext('2d').drawImage(A, 0, 0); c2.getContext('2d').drawImage(B, 0, 108, 780, a.alto, 0, 0, 780, a.alto);
      const d1 = c1.getContext('2d').getImageData(0, 0, 780, a.alto).data, d2 = c2.getContext('2d').getImageData(0, 0, 780, a.alto).data; let s = 0, n = 0; for (let k = 0; k < d1.length; k += 4) { s += Math.abs(d1[k] - d2[k]) + Math.abs(d1[k + 1] - d2[k + 1]) + Math.abs(d1[k + 2] - d2[k + 2]); n += 3; } return s / n;
    }, { buf, alto });
    T('APP ' + id + ': la vista previa coincide con la pantalla que abre la app (diferencia media ' + dif.toFixed(2) + ' / 255)', dif < 2.5, dif.toFixed(2));
    await p._ctx.close();
  }

  // ================================================================ GROWIAPP · los tres planes visibles y comparables (página y rubros)
  const PRECIOS = { start: ['15', '49'], pro: ['29', '149'], multi: ['49', '249'] };
  for (const ruta of ['/app/', '/app/cafeterias/', '/app/peluquerias/', '/app/talleres/', '/app/retail/']) {
    p = await abrir(390, 844, {}, ruta);
    const r = await ev(p, () => { const sec = document.querySelector('#precios,#precio'), tk = [...sec.querySelectorAll('.ticket')]; return { n: tk.length, titulos: tk.map(t => t.querySelector('.t-title').textContent.trim()), precios: tk.map(t => [...t.querySelectorAll('[data-price]')].map(s => s.getAttribute('data-price'))), res: [...sec.querySelectorAll('.pl-res a')].map(a => a.getAttribute('href')), resV: sec.querySelector('.pl-res') && getComputedStyle(sec.querySelector('.pl-res')).display !== 'none', scroll: getComputedStyle(sec.querySelector('.tickets')).overflowX, txt: sec.innerText, vis: tk.map(t => { const b = t.getBoundingClientRect(); return t.offsetParent !== null && b.width > 280 && b.right <= innerWidth + 1; }) }; });
    const pr = (a, b) => r.precios.some(x => x.includes(a)) && r.precios.some(x => x.includes(b));
    T('PLANES ' + ruta + ': aparecen Start, Pro y Multi sin pedir una acción (' + r.titulos.join(' · ') + ')', r.n === 3 && /Start/.test(r.titulos[0]) && /Pro/.test(r.titulos[1]) && /Multi/.test(r.titulos[2]) && r.vis.every(Boolean), JSON.stringify(r.titulos));
    T('PLANES ' + ruta + ': mismos precios aprobados (15/49 · 29/149 · 49/249 USD)', r.precios[0].includes('15') && r.precios[0].includes('49') && r.precios[1].includes('29') && r.precios[1].includes('149') && r.precios[2].includes('49') && r.precios[2].includes('249'), JSON.stringify(r.precios));
    T('PLANES ' + ruta + ': resumen de los tres planes con enlaces a cada uno, sin «Ver todos los planes» ni carrusel', r.res.join(',') === '#plan-start,#plan-pro,#plan-multi' && r.resV && !/Ver todos los planes/.test(r.txt) && r.scroll === 'visible', r.res.join(','));
    if (ruta === '/app/' || ruta === '/app/cafeterias/') {
      await p.screenshot({ path: CAP + TAG + '-f87-planes' + ruta.replace(/\//g, '-') + '.png' });
      await ev(p, () => document.querySelector('#precios .pl-res, #precio .pl-res').scrollIntoView({ block: 'center' })); await p.waitForTimeout(700);
      const c = await centro(p, '.pl-res a[href="#plan-multi"]'); await p.touchscreen.tap(c[0], c[1]); await p.waitForTimeout(1200);
      T('PLANES ' + ruta + ': tocar «Multi» en el resumen lleva a ese plan', await ev(p, () => { const t = document.querySelector('#plan-multi').getBoundingClientRect(); return t.top >= 60 && t.top < 220; }));
    }
    await p._ctx.close();
  }
  p = await abrir(1440, 900, {}, '/app/cafeterias/'); const esc = await ev(p, () => { const tk = [...document.querySelectorAll('#precio .ticket')].map(t => Math.round(t.getBoundingClientRect().top)); return { tk, res: getComputedStyle(document.querySelector('#precio .pl-res')).display }; });
  T('PLANES escritorio: los tres planes lado a lado (' + esc.tk.join(',') + ') y sin el resumen móvil', esc.tk.length === 3 && Math.max.apply(null, esc.tk) - Math.min.apply(null, esc.tk) <= 3 && esc.res === 'none', JSON.stringify(esc)); await p._ctx.close();

  // ================================================================ GROWIFLOW · el bot de WhatsApp está disponible, sin mensajes contradictorios
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    p = await abrir(w, h, {}, '/flow/'); await ev(p, () => document.querySelector('#bot').scrollIntoView({ block: 'center' })); await p.waitForTimeout(700);
    const fl = await ev(p, () => { const tk = document.querySelector('#bot'), av = [...tk.querySelectorAll('li.av')]; return { n: av.length, soon: tk.querySelectorAll('li.soon').length, sr: av.map(l => l.querySelector('.sr-only').textContent.trim()), marca: av.map(l => l.querySelector('.v').firstChild.textContent), precios: [...tk.querySelectorAll('[data-price]')].map(s => s.getAttribute('data-price')), pagina: document.body.textContent, ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent).join(' '), faq: [...document.querySelectorAll('#preguntas summary')].map(s => s.textContent).join('|') }; });
    await p.screenshot({ path: CAP + TAG + '-f87-flow-bot-' + w + '.png' });
    T('FLOW ' + w + ': las dos líneas del bot son «Disponible» (✓ y texto accesible), ya no «pronto»', fl.n === 2 && fl.soon === 0 && fl.sr.every(x => x === 'Disponible') && fl.marca.every(x => x === '✓'), JSON.stringify({ n: fl.n, soon: fl.soon, sr: fl.sr }));
    T('FLOW ' + w + ': no quedan mensajes contradictorios de disponibilidad (texto visible, JSON-LD y preguntas)', !/pronto|pr[oó]ximamente|aprobaci[oó]n de Meta|sin fecha|todav[ií]a no (est[aá]|hay)|a[uú]n no est[aá] disponible|no tiene garant[ií]a definida|figura como/i.test(fl.pagina + ' ' + fl.ld + ' ' + fl.faq), fl.faq.slice(0, 120));
    T('FLOW ' + w + ': la frase aprobada del JSON-LD («solo se reciben consultas, sin contrataciones ni pagos») y los precios del bot siguen intactos', fl.ld.includes('Actualmente solo se reciben consultas, sin contrataciones ni pagos.') && fl.precios.includes('149') && fl.precios.includes('25'), fl.precios.join(','));
    T('FLOW ' + w + ': sin desborde ni errores', await sinDesborde(p) && p._errs.length === 0, p._errs.join('|'));
    await p._ctx.close();
  }

  const f = res.filter(r => !r[1]);
  return (f.length ? f.map(r => 'FALLA ' + r[0] + '\n      → ' + r[2]).join('\n') + '\n' : '') + res.filter(r => r[1]).length + '/' + res.length + ' verificaciones OK (etiqueta ' + TAG + ')';
}
