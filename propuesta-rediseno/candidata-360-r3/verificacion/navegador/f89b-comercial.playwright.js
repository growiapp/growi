// Growi 360 · F8.9B · regresión de navegador de lo comercial que NO cambió con la integración: cumpleaños (La noche), empresa, Combo, vistas previas de Café Nogal y Bruma,
// planes de GrowiApp, GrowiFlow, y menú/navegación. Se armó con las secciones vigentes de los scripts de F8.3B y F8.7 (retirados por describir el hero y los actos anteriores).
// Uso: navegar a «<sitio>/#despues» y ejecutar con browser_run_code_unsafe (filename). Sin dependencias.
async (paginaInicial) => {
  const m0 = /^(https?:\/\/[^/?#]+)\//.exec(paginaInicial.url()); if (!m0) throw new Error('Navegar primero a <sitio>/#antes|#despues');
  const TAG = (/#(\w+)/.exec(paginaInicial.url()) || [, 'x'])[1], U = m0[1], br = paginaInicial.context().browser(), res = [];
  const CAP = '';   // carpeta de capturas (opcional): vacía = no se escribe ningún archivo. Si se usa, indicar una carpeta propia de la corrida: nunca la de otra fase.
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

  // ================================================================ CUMPLEAÑOS · 21:00 → 22:00 → 00:00
  const noche = p => ev(p, () => ({ clock: document.querySelector('[data-clock]').textContent, nt: document.querySelector('[data-nt]').textContent, t: document.querySelector('.ix-cum').dataset.t, pp: (() => { const b = document.querySelector('[data-ix-pp]'); return b.hidden ? 'oculto' : (b.classList.contains('is-paused') ? 'pausado' : 'visible'); })(), reinicio: document.querySelector('[data-ix-reiniciar-ev=cum]').hasAttribute('data-off') ? 'oculto' : 'visible' }));
  const aNoche = async p => { await ev(p, () => document.querySelector('#cumple').scrollIntoView({ block: 'start' })); await p.waitForTimeout(900); await ev(p, () => document.querySelector('#ix-cum-portada [data-go=noche]').click()); await p.waitForTimeout(500); };
  let p = await abrir(390, 844, {}, '/invitaciones/'); await aNoche(p);
  let n0 = await noche(p); if (CAP) await p.screenshot({ path: CAP + TAG + '-f87-cumple-2100.png' });
  T('CUM la noche empieza a las 21:00 · Brindis, con el cielo de la tarde y el control de pausa visible', n0.clock === '21:00' && n0.nt === 'Brindis' && n0.t === '0' && n0.pp === 'visible', JSON.stringify(n0));
  await p.waitForTimeout(6200); let n1 = await noche(p); T('CUM avanza sola a las 22:00 · Cena', n1.clock === '22:00' && n1.nt === 'Cena' && n1.t === '1', JSON.stringify(n1));
  await p.waitForTimeout(5900); let n2 = await noche(p); if (CAP) await p.screenshot({ path: CAP + TAG + '-f87-cumple-0000.png' });
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
    if (CAP) await p.screenshot({ path: CAP + TAG + '-f87-empresa-' + w + '.png' });
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

  // ================================================================ COMBO · demostración animada, una cosa a la vez en móvil
  const cdSt = p => ev(p, () => { const r = document.querySelector('.cd[data-cd]'); const vis = ['.cd-site', '.cd-chat', '.cd-gest'].filter(s => getComputedStyle(r.querySelector(s)).display !== 'none').length; const b = r.querySelector('[data-cd-pp]'); return { s: r.getAttribute('data-cd-s'), vis, pp: b.hidden ? 'oculto' : (b.classList.contains('is-paused') ? 'pausado' : 'visible'), cur: (r.querySelector('[aria-current]') || {}).textContent ? r.querySelector('[aria-current]').getAttribute('data-cd-n') : null }; });
  for (const [w, h] of [[390, 844], [320, 568], [1440, 900]]) {
    p = await abrir(w, h, {}, '/combo/'); await ev(p, () => document.querySelector('.cd').scrollIntoView({ block: 'center' })); await p.waitForTimeout(600);
    const vistos = [], paneles = []; const t0 = Date.now(); while (Date.now() - t0 < 16500) { const s = await cdSt(p); if (vistos[vistos.length - 1] !== s.s) vistos.push(s.s); paneles.push(s.vis); await p.waitForTimeout(250); }
    T('COMBO ' + w + ': la demostración avanza sola por los cuatro pasos en orden (' + vistos.join('→') + ')', ['1', '2', '3', '4'].every(x => vistos.includes(x)) && vistos.indexOf('2') > vistos.indexOf('1') && vistos.indexOf('4') > vistos.indexOf('3'), vistos.join(','));
    if (w < 768) T('COMBO ' + w + ': en móvil se muestra una sola parte por vez', paneles.every(x => x === 1), paneles.join('').slice(0, 40)); else T('COMBO ' + w + ': en escritorio se ven las tres partes a la vez', paneles.every(x => x === 3));
    const tx = await ev(p, () => document.querySelector('.cd').textContent);
    T('COMBO ' + w + ': sin leyendas «Ejemplo ilustrativo» ni «datos ficticios»; identificación «Demo»', !/ejemplo ilustrativo|datos ficticios/i.test(tx) && /Demo/.test(tx));
    if (CAP) await p.screenshot({ path: CAP + TAG + '-f87-combo-' + w + '.png' });
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
    if (CAP) await p.screenshot({ path: CAP + TAG + '-f87-' + id + '-vista-previa.png' });
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
      if (CAP) await p.screenshot({ path: CAP + TAG + '-f87-planes' + ruta.replace(/\//g, '-') + '.png' });
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
    if (CAP) await p.screenshot({ path: CAP + TAG + '-f87-flow-bot-' + w + '.png' });
    T('FLOW ' + w + ': las dos líneas del bot son «Disponible» (✓ y texto accesible), ya no «pronto»', fl.n === 2 && fl.soon === 0 && fl.sr.every(x => x === 'Disponible') && fl.marca.every(x => x === '✓'), JSON.stringify({ n: fl.n, soon: fl.soon, sr: fl.sr }));
    T('FLOW ' + w + ': no quedan mensajes contradictorios de disponibilidad (texto visible, JSON-LD y preguntas)', !/pronto|pr[oó]ximamente|aprobaci[oó]n de Meta|sin fecha|todav[ií]a no (est[aá]|hay)|a[uú]n no est[aá] disponible|no tiene garant[ií]a definida|figura como/i.test(fl.pagina + ' ' + fl.ld + ' ' + fl.faq), fl.faq.slice(0, 120));
    T('FLOW ' + w + ': la frase aprobada del JSON-LD («solo se reciben consultas, sin contrataciones ni pagos») y los precios del bot siguen intactos', fl.ld.includes('Actualmente solo se reciben consultas, sin contrataciones ni pagos.') && fl.precios.includes('149') && fl.precios.includes('25'), fl.precios.join(','));
    T('FLOW ' + w + ': sin desborde ni errores', await sinDesborde(p) && p._errs.length === 0, p._errs.join('|'));
    await p._ctx.close();
  }

  const f = res.filter(r => !r[1]);
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
  return (f.length ? f.map(r => 'FALLA ' + r[0] + '\n      → ' + r[2]).join('\n') + '\n' : '') + res.filter(r => r[1]).length + '/' + res.length + ' verificaciones OK (etiqueta ' + TAG + ')';
}
