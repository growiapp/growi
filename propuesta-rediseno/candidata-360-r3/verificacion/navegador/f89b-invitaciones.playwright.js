// Growi 360 · F8.9B · Invitaciones: película (Invitaciones A) y diálogo con el módulo real. Ciclo completo muestreado cada 100 ms en seis viewports (320×568, 360×740, 390×844, 428×926, 768×1024, 1440×900):
// geometría estable (0 px), orden cronológico, animación, manual, pausa/reanudación, movimiento reducido, scroll de página y consola.
// Cambiar la constante BASE al servidor que se use (candidata o release).
// Uso: servir la candidata o el release y ejecutar con browser_run_code_unsafe (filename). Sin dependencias. Dura varios minutos.
async (page) => {
  const br = page.context().browser(); const BASE = 'http://127.0.0.1:8840/'; const out = []; const T = (n, ok, d) => out.push((ok ? 'OK   ' : 'FALLA') + ' ' + n + (d ? ' · ' + d : ''));
  const nuevo = async (w, h, o) => { const ctx = await br.newContext(Object.assign({ viewport: { width: w, height: h }, isMobile: w < 768, hasTouch: w < 768 }, o || {})); const p = await ctx.newPage(); p._e = []; p._c = ctx; p.on('pageerror', e => p._e.push(e.message)); p.on('console', m => { if (m.type() === 'error') p._e.push('console: ' + m.text()); }); p.on('requestfailed', r => p._e.push('RF ' + r.url())); return p; };
  const ir = async (p, sel) => { await p.goto(BASE + 'invitaciones/index.html', { waitUntil: 'load' }); await p.waitForFunction(() => window.GrowiNar && window.GrowiNar.inv, null, { timeout: 8000 }); await p.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'center' }), sel); await p.waitForTimeout(800); };
  const MSGR = 'Hola, Lucía y Tomás. Soy Camila Ríos y confirmamos que vamos a su casamiento del sábado 20 de marzo. Somos 2. Gracias por invitarnos.';
  for (const [w, h] of [[320, 568], [360, 740], [390, 844], [428, 926], [768, 1024], [1440, 900]]) {
    const tag = w + 'x' + h; const N = w >= 900 ? '[data-stp]' : '[data-ip] [data-nav]';
    let p = await nuevo(w, h); await ir(p, '[data-ip]');
    const snap = () => p.evaluate(() => { const R = e => e.getBoundingClientRect(), scr = R(document.querySelector('.ip-scr')), ch = document.querySelector('.ip-ch'), inc = ch.querySelector('.ip-m:not(.ip-out)'), rp = ch.querySelector('.ip-rp'), st = document.querySelector('[data-stg]'), r = R(st), vis = e => getComputedStyle(e).display !== 'none', v = document.querySelector('.ip-v.on'), nm = document.querySelector('.ip-v[data-v=confirmar] [name=nombre]'); const chv = getComputedStyle(ch).visibility === 'visible' && +getComputedStyle(ch).opacity > .9;
      const bi = R(inc), br2 = vis(rp) ? R(rp) : null, inb = R(ch.querySelector('.ip-in'));
      return { t: performance.now(), a: document.querySelector('[data-ip] [data-nav] [aria-current]').dataset.i, chatVis: chv, head: ch.querySelector('header').textContent.trim(), inTxt: inc.querySelector('p').textContent, inIzq: (bi.left - scr.left) < (scr.right - bi.right), rpVis: !!br2, rpDer: br2 ? (br2.left - scr.left) > (scr.right - br2.right) : null, rpTxt: br2 ? rp.querySelector('p').textContent : '', snd: +st.dataset.snd, rpAnim: br2 ? rp.getAnimations().some(x => x.playState === 'running') : false, bdAnim: false, rpDentro: br2 ? (br2.bottom <= inb.top + 1 && br2.top >= scr.top) : null, rpEnBd: br2 ? (br2.top >= R(ch.querySelector('.ip-bd')).top - 0.5 && br2.bottom <= R(ch.querySelector('.ip-bd')).bottom + 0.5) : null, hdOk: ch.querySelector('header').offsetTop + ch.querySelector('header').offsetHeight <= ch.querySelector('.ip-bd').offsetTop && getComputedStyle(ch.querySelector('.ip-bd')).overflowY === 'hidden', stp: ch.querySelector('.ip-bd').scrollTop, rem: (() => { const bd = ch.querySelector('.ip-bd'), p = ch.querySelector('.ip-m:not(.ip-out) p'), lh = parseFloat(getComputedStyle(p).lineHeight), y = p.offsetTop - bd.offsetTop, r = (((bd.scrollTop - y) % lh) + lh) % lh; return bd.scrollTop <= y ? 0 : Math.min(r, lh - r); })(), hdTop: ch.querySelector('header').offsetTop, hdH: ch.querySelector('header').offsetHeight,  v: v.dataset.v, nombre: nm.value, si: document.querySelector('.ip-v[data-v=confirmar] [value=si]').checked, cant: document.querySelector('.ip-v[data-v=confirmar] [data-cant]').textContent, btn: document.querySelector('.ip-v[data-v=confirmar] [type=submit]').textContent, scrTxt: document.querySelector('.ip-scr').innerText, sc: v.getAnimations({ subtree: true }).length > 0 || v.scrollHeight <= v.clientHeight + 1, sy: scrollY, ov: document.documentElement.scrollWidth - innerWidth, ph: [r.width, r.height, r.left + scrollX, r.top + scrollY] }; });
    const ini = await snap(); T('INV ' + tag + ': estado inicial correcto: «La enviás», chat «Lucía y Tomás» con la invitación como mensaje ENTRANTE (a la izquierda), sin mensaje saliente', ini.a === '0' && ini.chatVis && ini.head === 'LLucía y Tomás'.slice(1) + '' || (ini.a === '0' && ini.chatVis && /Lucía y Tomás/.test(ini.head) && ini.inIzq && !ini.rpVis), ini.head);
    const m = []; const t0 = Date.now(); while (Date.now() - t0 < 23000) { m.push(await snap()); await p.waitForTimeout(100); }
    const vistas = []; m.forEach(x => { const k = x.chatVis ? 'chat' : x.v; if (vistas[vistas.length - 1] !== k) vistas.push(k); });
    T('INV ' + tag + ': recorrido chat→portada→programa→lugar→confirmar→chat (' + vistas.join('→') + ')', vistas.slice(0, 6).join() === 'chat,portada,programa,lugar,confirmar,chat');
    const orden = []; m.forEach(x => { if (orden[orden.length - 1] !== x.a) orden.push(x.a); }); T('INV ' + tag + ': etapas 0→1→2→3 (' + orden.join('→') + ')', orden.slice(0, 4).join('') === '0123');
    const fin = m.filter(x => x.a === '3' && x.chatVis && x.rpVis); T('INV ' + tag + ': el paso 4 vuelve al MISMO chat (mismo encabezado y mismo mensaje entrante) y la respuesta es saliente (derecha)', fin.length > 5 && fin.every(x => x.head === ini.head && x.inTxt === ini.inTxt && x.inIzq && x.rpDer));
    T('INV ' + tag + ': la respuesta lleva los datos del invitado y es la que arma la invitación (' + (fin[0] && fin[0].rpTxt.slice(0, 40)) + '…)', fin.length > 5 && fin.every(x => x.rpTxt === MSGR));
    const snds = []; m.forEach(x => { if (snds[snds.length - 1] !== x.snd) snds.push(x.snd); }); T('INV ' + tag + ': el envío se anima: pendiente→enviado→entregado→leído (' + snds.join('→') + ')', snds.join('').startsWith('01234'));
    const est = fin.filter(x => !x.rpAnim), ent = fin.filter(x => x.rpAnim);
    T('INV ' + tag + ': estado inicial: sin respuesta saliente y chat en su posición (scroll 0)', !ini.rpVis && ini.stp === 0);
    T('INV ' + tag + ': animación de entrada: la respuesta nace sobre la barra de escritura y nunca sube por encima del encabezado (' + ent.length + ' muestras)', ent.every(x => x.rpDer && x.hdOk));
    T('INV ' + tag + ': estado final estable: respuesta completa dentro del área de mensajes, sobre la barra y a la derecha (' + est.length + ' muestras)', est.length > 5 && est.every(x => x.rpDentro && x.rpEnBd && x.rpDer));
    T('INV ' + tag + ': estado final estable: el mensaje anterior no queda con ninguna línea cortada a la mitad (el corte cae entre líneas)', est.length > 5 && est.every(x => x.rem < 1.0), 'resto máx ' + Math.max(...est.map(x => x.rem)).toFixed(2) + ' px');
    T('INV ' + tag + ': el encabezado queda fijo y ningún mensaje lo invade (área de mensajes recortada bajo él) en todo el ciclo', m.every(x => x.hdOk) && new Set(m.map(x => x.hdTop + '/' + x.hdH)).size === 1);
    const sp = fin.map(x => x.stp); T('INV ' + tag + ': el desplazamiento interno es progresivo y monótono, sin retrocesos ni saltos (' + sp.filter((v, i) => i === 0 || v !== sp[i - 1]).join('→') + ')', sp.every((v, i) => i === 0 || v >= sp[i - 1]));
    T('INV ' + tag + ': sin desborde horizontal y sin saltos de scroll de la página durante todo el ciclo (salto máx ' + Math.max(...m.map(x => Math.abs(x.sy - m[0].sy))) + ' px)', m.every(x => x.ov <= 0) && m.every(x => Math.abs(x.sy - m[0].sy) <= 1));
    T('INV ' + tag + ': proporción del teléfono 9:19,5 (' + (m[0].ph[0] / m[0].ph[1]).toFixed(4) + ')', Math.abs(m[0].ph[0] / m[0].ph[1] - 9 / 19.5) < 0.006);
    const antes = m.filter(x => !(x.a === '3' && x.chatVis)); T('INV ' + tag + ': nunca aparece «Borrador», «mensaje preparado» ni «lista para enviar» en la película', !m.some(x => /borrador|mensaje preparado|lista para enviar|Todavía no se envió/i.test(x.scrTxt)));
    const f = m.filter(x => x.v === 'confirmar' && !x.chatVis); T('INV ' + tag + ': el formulario se completa progresivamente y no desaparece (' + f.length + ' muestras)', f.length >= 20 && f.every((x, i) => i === 0 || x.nombre.length >= f[i - 1].nombre.length) && f[f.length - 1].nombre === 'Camila Ríos' && f.some(x => x.si) && f.some(x => x.cant === '2'));
    T('INV ' + tag + ': el botón dice «Continuar en WhatsApp»', m[0].btn === 'Continuar en WhatsApp');
    T('INV ' + tag + ': vistas sin recortes y sin desplazamiento interno', m.filter(x => !x.chatVis && x.v !== 'portada').every(x => x.sc));
    const rng = i => Math.max(...m.map(x => x.ph[i])) - Math.min(...m.map(x => x.ph[i])); T('INV ' + tag + ': teléfono estable durante todo el ciclo (var ' + [0, 1, 2, 3].map(i => rng(i).toFixed(2)) + ')', [0, 1, 2, 3].every(i => rng(i) <= 1));
    T('INV ' + tag + ': sin errores de consola ni recursos', p._e.length === 0, p._e.join('|')); await p._c.close();
    // manual: repetir 3 y 4 da siempre lo mismo; pausa y reanudación
    p = await nuevo(w, h); await ir(p, '[data-ip]');
    const ir2 = async i => { await p.evaluate(([N, i]) => document.querySelector(N + ' [data-i="' + i + '"]').click(), [N, i]); };
    const sn = () => p.evaluate(() => ({ v: document.querySelector('.ip-v.on').dataset.v, ch: getComputedStyle(document.querySelector('.ip-ch')).visibility, snd: document.querySelector('[data-stg]').dataset.snd, rp: getComputedStyle(document.querySelector('.ip-rp')).display, a: document.querySelector('[data-ip] [data-nav] [aria-current]').dataset.i }));
    const e4 = []; for (let k = 0; k < 2; k++) { await ir2(3); await p.waitForTimeout(1200); const a = await sn(); await p.waitForTimeout(8500); const b = await sn(); e4.push(JSON.stringify([a, b])); }
    const b4 = JSON.parse(e4[0])[1]; T('INV ' + tag + ': etapa «Confirman» a mano: formulario y luego el chat con la respuesta enviada; repetirla da lo mismo', e4[0] === e4[1] && JSON.parse(e4[0])[0].v === 'confirmar' && b4.ch === 'visible' && b4.snd === '4' && b4.rp !== 'none');
    const e3 = []; for (let k = 0; k < 2; k++) { await ir2(2); await p.waitForTimeout(600); const a = await sn(); await p.waitForTimeout(3300); const b = await sn(); e3.push(JSON.stringify([a.v, b.v])); } T('INV ' + tag + ': etapa «Exploran» a mano repetida: programa→lugar siempre', e3[0] === e3[1] && e3[0] === '["programa","lugar"]');
    await ir2(0); await p.waitForTimeout(700); const s1 = await sn(); T('INV ' + tag + ': volver a «La enviás» limpia la respuesta (chat sin mensaje saliente)', s1.a === '0' && s1.ch === 'visible' && s1.rp === 'none');
    T('INV ' + tag + ': sin errores en navegación manual', p._e.length === 0, p._e.join('|')); await p._c.close();
    // pausa y reanudación
    p = await nuevo(w, h); await ir(p, '[data-ip]'); await p.evaluate(() => document.querySelector('[data-ip] [data-nav]').scrollIntoView({ block: 'center' })); await p.waitForTimeout(500);
    const cur = () => p.evaluate(() => document.querySelector('[data-ip] [data-nav] [aria-current]').dataset.i); await p.waitForTimeout(4500); await p.evaluate(() => document.querySelector('[data-ip] [data-pp]').click()); const c1 = await cur(); await p.waitForTimeout(4000); const c2 = await cur();
    await p.evaluate(() => document.querySelector('[data-ip] [data-pp]').click()); const vv = new Set(); for (let i = 0; i < 40; i++) { vv.add(await cur()); await p.waitForTimeout(400); } T('INV ' + tag + ': pausa congela y reanudar continúa', c1 === c2 && vv.size >= 2);
    await p._c.close();
    // movimiento reducido
    p = await nuevo(w, h, { reducedMotion: 'reduce' }); await ir(p, '[data-ip]'); const r0 = await cur(); await p.waitForTimeout(3500); const r1 = await cur();
    await ir2(3); await p.waitForTimeout(700); const rv = await sn(); const sc = await p.evaluate(() => ({ txt: document.querySelector('.ip-scr').innerText, anim: [...document.querySelectorAll('.ip-stg *')].every(e => getComputedStyle(e).animationName === 'none') }));
    T('INV ' + tag + ': movimiento reducido: no avanza solo; etapa 4 = chat con la respuesta enviada y sin animaciones', r0 === '0' && r1 === '0' && rv.ch === 'visible' && rv.snd === '4' && rv.rp !== 'none' && /Camila Ríos/.test(sc.txt) && sc.anim);
    T('INV ' + tag + ': sin errores', p._e.length === 0, p._e.join('|')); await p._c.close();
    // «Probar la invitación completa»: el módulo REAL en un diálogo, solo por acción de la persona; sin envíos ni cambios de página
    p = await nuevo(w, h); await ir(p, '[data-ip-abrir]');
    await p.addInitScript(() => { window.__wa = []; window.open = u => { window.__wa.push(String(u)); return null; }; }); await p.reload({ waitUntil: 'load' }); await p.waitForFunction(() => window.GrowiNar && window.GrowiNar.inv && window.GrowiInvUI);
    const urlAntes = p.url(); await p.evaluate(() => document.querySelector('[data-ip-abrir]').scrollIntoView({ block: 'center' })); await p.waitForTimeout(300);
    const cerrado = await p.evaluate(() => document.querySelector('[data-ip-o]').hidden && getComputedStyle(document.querySelector('[data-ip-o]')).display === 'none');
    T('INV ' + tag + ': la invitación completa no se abre sola (diálogo cerrado al cargar y durante la película)', cerrado);
    await p.click('[data-ip-abrir]'); await p.waitForTimeout(700);
    const ab = await p.evaluate(() => { const o = document.querySelector('[data-ip-o]'), r = o.querySelector('.ip-o-sh').getBoundingClientRect(); return { vis: !o.hidden, foco: document.activeElement.hasAttribute('data-ip-cerrar'), lock: document.documentElement.classList.contains('ip-lock'), inerte: document.querySelector('main').inert, dentro: r.left >= -0.5 && r.right <= innerWidth + 0.5 && r.top >= -0.5 && r.bottom <= innerHeight + 0.5, ov: document.documentElement.scrollWidth - innerWidth }; });
    T('INV ' + tag + ': el diálogo abre dentro de la ventana, con foco en «Cerrar», fondo inerte y sin scroll de página', ab.vis && ab.foco && ab.lock && ab.inerte && ab.dentro && ab.ov <= 0, JSON.stringify(ab));
    await p.click('.ip-o [data-ly=portada] [data-go=confirmar]'); await p.waitForTimeout(900);
    await p.click('.ip-o [type=submit]'); await p.waitForTimeout(400);
    const er = await p.evaluate(() => [...document.querySelectorAll('.ip-o [data-err]')].filter(e => !e.hidden).map(e => e.textContent));
    T('INV ' + tag + ': la validación del RSVP real sigue igual (nombre y respuesta obligatorios)', er.join('|') === 'Escribí tu nombre para armar el mensaje.|Elegí si podés ir o no.', er.join('|'));
    await p.fill('.ip-o [name=nombre]', 'Ana Gómez'); await p.click('.ip-o .ix-opt >> nth=0'); await p.click('.ip-o [data-act=mas]'); await p.click('.ip-o [type=submit]'); await p.waitForTimeout(800);
    const msg = await p.evaluate(() => document.querySelector('.ip-o [data-ly=mensaje] [data-msg]').textContent);
    T('INV ' + tag + ': el mensaje se arma con lo que escribió la persona (el de la invitación real)', msg === 'Hola, Lucía y Tomás. Soy Ana Gómez y confirmamos que vamos a su casamiento del sábado 20 de marzo. Somos 2. Gracias por invitarnos.', msg);
    T('INV ' + tag + ': el borrador dice que todavía no se envió', await p.evaluate(() => /Todavía no se envió\./.test(document.querySelector('.ip-o [data-ly=mensaje] .ix-drs').textContent)));
    await p.click('.ip-o [data-act=wa]'); await p.waitForTimeout(700);
    const wa = await p.evaluate(() => ({ sy: document.querySelector('.ip-o .ix-sys').textContent, off: document.querySelector('.ip-o .ix-send').disabled, abiertos: window.__wa.length, url: location.href }));
    T('INV ' + tag + ': WhatsApp es una vista previa con envío inhabilitado: no se abre ni se navega a nada', /no se envía nada/.test(wa.sy) && wa.off && wa.abiertos === 0 && wa.url === urlAntes, JSON.stringify(wa));
    await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    const e1 = await p.evaluate(() => ({ dlg: !document.querySelector('[data-ip-o]').hidden, wa: !!document.querySelector('.ip-o [data-ly=wa]:not([hidden])') }));
    T('INV ' + tag + ': primer Esc cierra solo la vista previa de WhatsApp', e1.dlg && !e1.wa);
    await p.click('.ip-o [data-ix-reiniciar]'); await p.waitForTimeout(700);   // el botón se oculta y el foco cae al documento
    await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    const e2 = await p.evaluate(() => ({ oculto: document.querySelector('[data-ip-o]').hidden, foco: document.activeElement.hasAttribute('data-ip-abrir'), lock: document.documentElement.classList.contains('ip-lock'), inertes: [...document.body.children].filter(e => e.inert).length }));
    T('INV ' + tag + ': Esc cierra el diálogo aunque el foco esté en el documento, libera la página y devuelve el foco al botón', e2.oculto && e2.foco && !e2.lock && e2.inertes === 0, JSON.stringify(e2));
    T('INV ' + tag + ': sin errores en el diálogo', p._e.length === 0, p._e.join('|')); await p._c.close();
  }
  return out.join('\n') + '\n' + out.filter(x => x.startsWith('OK')).length + '/' + out.length;
}
