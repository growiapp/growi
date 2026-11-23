// Growi 360 · F8.9B · regresión del sitio completo en seis viewports (reemplaza a las regresiones de F8.3B/F8.4R/F8.7 que describían el hero y el recorrido por actos anteriores).
// Uso: navegar a «<sitio>/» y ejecutar con browser_run_code_unsafe (filename). Sin dependencias. No hace clic en ningún enlace de WhatsApp: los enlaces se comprueban por atributos
// y cualquier pedido a wa.me se aborta y se cuenta (debe ser 0).
async (paginaInicial) => {
  const U = /^(https?:\/\/[^/]+)\//.exec(paginaInicial.url())[1], br = paginaInicial.context().browser(), res = [];
  const T = (n, ok, d) => res.push([n, !!ok, d === undefined ? '' : String(d)]);
  const RUTAS = ['/', '/app/', '/web/', '/flow/', '/combo/', '/invitaciones/', '/app/cafeterias/', '/app/peluquerias/', '/app/retail/', '/app/talleres/'];
  const VP = [[320, 568], [360, 740], [390, 844], [428, 926], [768, 1024], [1440, 900]];
  await Promise.all(VP.map(async ([w, h]) => {
    const tag = w + 'x' + h, movil = w < 900;
    const ctx = await br.newContext({ viewport: { width: w, height: h }, isMobile: w < 768, hasTouch: w < 768 });
    const p = await ctx.newPage(); const errs = [], wa = []; p.on('pageerror', e => errs.push('PE ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('requestfailed', r => errs.push('RF ' + r.url()));
    await p.route(/plausible\.io/, r => r.fulfill({ status: 200, body: '' }));
    await p.route(/wa\.me|whatsapp\.com/, r => { wa.push(r.request().url()); return r.abort(); });
    for (const ruta of RUTAS) {
      await p.goto(U + ruta, { waitUntil: 'load' }); await p.waitForTimeout(350);
      const r = await p.evaluate(() => {
        const iw = innerWidth, cul = [];
        for (const e of document.querySelectorAll('body *')) { const b = e.getBoundingClientRect(); if (b.width && b.right > iw + 0.5) { let clip = false, a = e.parentElement; while (a && a !== document.body) { if (getComputedStyle(a).overflowX !== 'visible') { clip = true; break; } a = a.parentElement; } if (!clip) cul.push((typeof e.className === 'string' && e.className ? e.className.split(' ')[0] : e.tagName) + ' ' + Math.round(b.left) + '..' + Math.round(b.right)); } }
        const h1 = document.querySelector('h1'), hd = document.querySelector('header.top').getBoundingClientRect(), vis = e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
        const was = [...document.querySelectorAll('a[href*="wa.me"]')];
        return { sw: document.documentElement.scrollWidth, iw, cul: cul.slice(0, 3), h1: h1 && vis(h1) ? h1.textContent.trim().slice(0, 60) : null, hdTop: hd.top, hdH: hd.height,
          waMal: was.filter(a => a.target !== '_blank' || !/noopener/.test(a.rel) || !/\?text=/.test(a.href)).length, waN: was.length, enlacesRotos: [...document.querySelectorAll('a[href]')].filter(a => /^#$|^javascript:/.test(a.getAttribute('href'))).length };
      });
      T(tag + ' ' + ruta + ': sin desborde horizontal', r.sw <= r.iw && r.cul.length === 0, 'scrollWidth ' + r.sw + '/' + r.iw + ' ' + r.cul.join(','));
      T(tag + ' ' + ruta + ': título visible, encabezado fijo arriba y sin enlaces vacíos', !!r.h1 && r.hdTop >= -0.5 && r.hdTop < 2 && r.enlacesRotos === 0, r.h1);
      T(tag + ' ' + ruta + ': los enlaces de WhatsApp del sitio abren en pestaña nueva con noopener y mensaje armado (' + r.waN + ')', r.waMal === 0 && r.waN >= 1);
      // menú: móvil = botón Menú; escritorio = «Para tu negocio»
      const btn = movil ? '#menuBtn' : '#navNeg', panel = movil ? '#mobileMenu' : '#navNegPanel';
      await p.click(btn); await p.waitForTimeout(250);
      const ab = await p.evaluate(([b, q]) => ({ exp: document.querySelector(b).getAttribute('aria-expanded'), vis: !document.querySelector(q).hidden && getComputedStyle(document.querySelector(q)).display !== 'none' }), [btn, panel]);
      await p.click(btn); await p.waitForTimeout(250);
      const ce = await p.evaluate(([b, q]) => ({ exp: document.querySelector(b).getAttribute('aria-expanded'), vis: !document.querySelector(q).hidden && getComputedStyle(document.querySelector(q)).display !== 'none' }), [btn, panel]);
      T(tag + ' ' + ruta + ': el menú ' + (movil ? 'móvil' : 'de escritorio') + ' abre y cierra', ab.exp === 'true' && ab.vis && ce.exp === 'false' && !ce.vis, JSON.stringify([ab, ce]));
    }
    // Home: ofertas, escena y CTA
    await p.goto(U + '/', { waitUntil: 'load' }); await p.waitForTimeout(400);
    const hm = await p.evaluate(() => { const g = s => document.querySelector(s), y = s => g(s).getBoundingClientRect().top + scrollY;
      return { lineas: document.querySelectorAll('.hero-lines a').length, cta: !!g('[data-track=home-hero-whatsapp]'), orden: y('[data-track=home-hero-whatsapp]') < y('.hero-lines') && y('.hero-lines') < y('.ha-w') || innerWidth >= 900, escena: g('.ha-w').getBoundingClientRect().width, h1: g('h1').textContent.trim() }; });
    T(tag + ' Home: CTA principal, cinco ofertas y la demostración (' + Math.round(hm.escena) + ' px de ancho)', hm.lineas === 5 && hm.cta && hm.orden && hm.escena > 280, JSON.stringify(hm));
    // Combo: demostración con pausa
    await p.goto(U + '/combo/', { waitUntil: 'load' }); await p.waitForTimeout(400);
    const cb = await p.evaluate(() => ({ pasos: document.querySelectorAll('[data-cd-n]').length, pp: !!document.querySelector('[data-cd-pp]') }));
    T(tag + ' Combo: la demostración conserva sus cuatro pasos y el control de pausa', cb.pasos === 4 && cb.pp);
    T(tag + ': sin errores de consola ni recursos en las diez páginas', errs.length === 0, errs.slice(0, 3).join(' | '));
    T(tag + ': ningún pedido a WhatsApp salió solo (0)', wa.length === 0, wa.join(','));
    await ctx.close();
  }));
  const fallas = res.filter(r => !r[1]).map(r => 'FALLA ' + r[0] + ' → ' + r[2]);
  return fallas.join('\n') + '\n' + res.filter(r => r[1]).length + '/' + res.length;
}
