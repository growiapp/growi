// Growi 360 · regresión funcional de Invitaciones y de desborde horizontal, basada en ESTADO observable (sin esperas fijas).
// Se ejecuta con Playwright (clics y teclas reales) desde la herramienta existente `browser_run_code` del MCP de Playwright, o con cualquier runner
// que invoque esta función con una `page`. Ver README.md. No agrega dependencias: es una sola función `async (paginaInicial) => …`.
// URL parametrizada: la toma de la página actual. Antes de ejecutar, navegar a «<sitio>/invitaciones/index.html» (local: http://localhost:8840/invitaciones/index.html · publicado: https://growi.ar/invitaciones/).
// Cada espera es waitForFunction con tope de 5 s sobre: data-paso, capa activa (.on), ausencia de ix-in/ix-out, inert/hidden, opacidad y mensaje final.
async (paginaInicial) => {
  const m0 = /^(https?:\/\/[^/?#]+(?:\/[^?#]*?)?)\/invitaciones(?:\/index\.html|\/)?(?:[?#].*)?$/.exec(paginaInicial.url());
  if (!m0) throw new Error('Navegar primero a <sitio>/invitaciones/index.html (la URL actual es «' + paginaInicial.url() + '»).');
  // Controles negativos: la misma prueba, con un defecto inyectado, debe FALLAR donde corresponde. Se eligen con el fragmento de la URL inicial:
  //   …/invitaciones/index.html#control=fuga      → la página «filtra» datos de prueba hacia plausible.io y hacia un tercero (los pedidos se abortan antes de salir)
  //   …/invitaciones/index.html#control=desborde  → se sirve inv-base.css sin la regla de menos de 360 px (defecto original de F6.1)
  const CONTROL = (/#control=(fuga|desborde)\b/.exec(paginaInicial.url()) || [])[1] || null;
  const page = await paginaInicial.context().newPage();   // pestaña propia: no hereda ni deja rutas, init scripts ni listeners
  try {
  const RAIZ = m0[1], ORIGEN = /^https?:\/\/[^/]+/.exec(RAIZ)[0];
  const BASE = RAIZ + '/invitaciones/' + (/index\.html/.test(paginaInicial.url()) ? 'index.html' : '');
  const res = []; const T = (n, ok, d) => res.push([n, !!ok, d === undefined ? '' : String(d)]);
  const tiempos = {}; const reqs = [], errs = [];

  // ---- red. El sitio publicado carga analítica Plausible (plausible.io, solo en el release). No se afirma que no haya solicitudes a terceros:
  // se comprueba que las respuestas del RSVP no salen de la página (ni por URL ni por cuerpo), que no hay envío a WhatsApp y que el único tercero admitido es Plausible.
  const DATOS = ['Ana Gómez', 'Camila Ríos', 'Diego Sosa', 'Lucía y Tomás. Soy'];
  const parte = r => { const [m, u, ...c] = r.split(' '); return { m, u, cuerpo: c.join(' ') }; };
  const fuga = r => { const { u, cuerpo } = parte(r); let d = u.replace(/\+/g, ' '); try { d = decodeURIComponent(d); } catch (e) {}
    const t = d + ' ' + cuerpo; return DATOS.some(d => t.includes(d) || t.includes(encodeURIComponent(d))); };
  const post = r => { const { m, u } = parte(r); return m === 'POST' && !/^https:\/\/plausible\.io\/api\/event/.test(u); };
  const wa = r => /wa\.me|api\.whatsapp|web\.whatsapp/.test(parte(r).u);
  const tercero = r => { const { u } = parte(r); return /^https?:/.test(u) && !u.startsWith(ORIGEN) && !/^https:\/\/plausible\.io\//.test(u); };
  const linea = q => q.method() + ' ' + q.url() + ' ' + (q.postData() || '');
  // Un único manejador ve TODOS los pedidos. Cuenta los que inspecciona y aborta (antes de que salgan de la máquina) los que llevan datos del RSVP,
  // los que van a un tercero distinto de Plausible, los POST ajenos y los de WhatsApp. Un pedido abortado igual queda en `reqs`, así que las comprobaciones lo detectan.
  const net = { vistos: 0, interceptados: 0, abortados: 0, fugasTerminadas: 0 };
  page.on('request', q => reqs.push(linea(q)));
  page.on('requestfinished', q => { if (fuga(linea(q))) net.fugasTerminadas++; });
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PE ' + e.message));
  await page.route(() => true, async r => {
    const q = r.request(), l = linea(q);
    net.vistos++;
    if (fuga(l) || tercero(l) || post(l) || wa(l)) { net.interceptados++; await r.abort('blockedbyclient'); net.abortados++; return; }
    if (CONTROL === 'desborde' && /\/inv-base\.css(\?|$)/.test(q.url())) {
      const resp = await r.fetch(); const css = (await resp.text()).replace(/@media \(max-width:359px\)\{[^\n]*\}\n?/, '');
      return r.fulfill({ response: resp, body: css });
    }
    if (q.url().startsWith(ORIGEN)) return r.continue({ headers: { ...q.headers(), 'cache-control': 'no-cache' } });
    return r.continue();
  });
  if (CONTROL === 'fuga') {
    await page.addInitScript(() => addEventListener('load', () => setTimeout(() => {
      fetch('https://plausible.io/api/event', { method: 'POST', body: JSON.stringify({ n: 'cta', p: { nombre: 'Camila Ríos' } }) }).catch(() => {});
      fetch('https://tracker.example.test/x?n=' + encodeURIComponent('Ana Gómez'), { method: 'POST' }).catch(() => {});
    }, 2500)));
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE + '?v=' + Date.now());

  // ---- estado observable (se ejecuta dentro de la página)
  const visFn = (sel) => { const e = document.querySelector(sel); if (!e || e.closest('[hidden],[inert]')) return false; for (let n = e; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.99) return false; } const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const estable = ({ ev, capa, paso }) => {   // la experiencia terminó de pasar a «capa»: un solo layer a la vista, activo, sin clases de transición, opaco; los demás inertes o fuera
    const r = document.querySelector('[data-inv=' + ev + ']'); if (!r) return false;
    if (paso && r.dataset.paso !== paso) return false;
    if (r.querySelector('.ix-in,.ix-out')) return false;
    const capas = [...r.querySelectorAll('[data-ly]')].filter(l => l.dataset.ly !== 'wa');
    const vistas = capas.filter(l => getComputedStyle(l).display !== 'none');
    if (vistas.length !== 1 || vistas[0].dataset.ly !== capa) return false;
    if (vistas[0].inert || vistas[0].hidden || !vistas[0].classList.contains('on') || parseFloat(getComputedStyle(vistas[0]).opacity) < 0.99) return false;
    return capas.filter(l => l !== vistas[0]).every(l => l.inert || getComputedStyle(l).display === 'none');
  };
  const E = async (nombre, fn, arg) => { const t0 = Date.now(); try { await page.waitForFunction(fn, arg, { timeout: 5000, polling: 50 }); tiempos[nombre] = Date.now() - t0; return true; } catch (e) { tiempos[nombre] = 'TIMEOUT'; return false; } };
  const enCapa = (ev, capa, paso, nombre) => E(nombre || (ev + ':' + capa), estable, { ev, capa, paso });
  const paso = ev => page.evaluate(ev => document.querySelector('[data-inv=' + ev + ']').getAttribute('data-paso'), ev);
  const foco = () => page.evaluate(() => { const a = document.activeElement; return a ? (a.id || a.getAttribute('name') || a.getAttribute('data-act') || a.tagName) : ''; });
  const txt = sel => page.evaluate(sel => { const e = document.querySelector(sel); return e ? e.textContent.trim() : null; }, sel);
  const vis = sel => page.evaluate(visFn, sel);
  const store = () => page.evaluate(() => JSON.stringify([Object.keys(localStorage), Object.keys(sessionStorage), document.cookie]));
  const aId = async id => { await page.evaluate(id => window.scrollTo({ top: document.getElementById(id).getBoundingClientRect().top + scrollY - 69, behavior: 'instant' }), id); };
  // El recorrido usa IntersectionObserver, que muestrea una vez por cuadro: un salto de scroll solo se ve si pasa al menos un cuadro entre salto y salto.
  const cuadros = n => page.evaluate(n => new Promise(r => { let i = 0; const f = () => ++i >= n ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }), n);
  const act = async (n, capa, p) => { await page.evaluate(n => { const s = document.querySelectorAll('.ix-sent')[n - 1]; const r = s.getBoundingClientRect(); window.scrollTo({ top: pageYOffset + r.top + r.height / 2 - innerHeight / 2, behavior: 'instant' }); }, n); await cuadros(3); await E('act' + n, ({ n }) => document.querySelector('[data-ix-story]').dataset.act === String(n), { n }); return enCapa('cas', capa, p, 'act' + n + '→' + capa); };
  const campos = () => page.evaluate(() => JSON.stringify([document.querySelector('#ix-cas-nombre').value, [...document.querySelectorAll('#ix-cas-confirmar input[type=radio]')].map(r => r.checked), document.querySelector('#ix-cas-cant').textContent, document.querySelector('#ix-cas-mensaje [data-msg]').textContent]));
  const vacio = JSON.stringify(['', [false, false], '1', '']);
  const s0 = await store();

  // ================================================ casamiento (el módulo real, dentro del diálogo «Probar la invitación completa»)
  T('cas: la invitación funcional no se ve hasta pedirla (diálogo cerrado)', !(await vis('[data-inv=cas]')) && await page.evaluate(() => document.querySelector('[data-ip-o]').hidden));
  await page.locator('[data-ip-abrir]').scrollIntoViewIfNeeded(); await page.locator('[data-ip-abrir]').click();
  await E('dialogo-abierto', () => !document.querySelector('[data-ip-o]').hidden, null); await enCapa('cas', 'portada', 'portada');
  T('cas: el diálogo abre en la portada, con el foco en «Cerrar», la página de fondo inerte y sin scroll', await paso('cas') === 'portada' && await page.evaluate(() => document.activeElement.hasAttribute('data-ip-cerrar') && document.documentElement.classList.contains('ip-lock') && document.querySelector('main').inert), await foco());
  await page.locator('#ix-cas-portada [data-go=programa]').click(); await enCapa('cas', 'programa', 'programa');
  T('cas: «Ver el programa» lleva al día', await paso('cas') === 'programa' && (await foco()) === 'ix-cas-hp', await foco());
  await page.locator('#ix-cas-programa .ix-tlb').nth(1).click();
  T('cas: el programa abre un momento a la vez', await page.evaluate(() => { const b = [...document.querySelectorAll('#ix-cas-programa .ix-tlb')]; return b[1].getAttribute('aria-expanded') === 'true' && b[0].getAttribute('aria-expanded') === 'false'; }));
  await page.locator('#ix-cas-programa [data-go=lugar]').click(); await enCapa('cas', 'lugar', 'lugar');
  T('cas: lugar', await paso('cas') === 'lugar' && await vis('#ix-cas-lugar .ix-mapa'));
  await page.locator('[data-act=mapa]').click();
  T('cas: «Cómo llegar» no abre nada y lo aclara', await vis('[data-mapa-nota]') && (await txt('[data-mapa-nota]')) === 'En esta muestra no se abre el mapa.');
  await page.locator('#ix-cas-lugar [data-go=confirmar]').click(); await enCapa('cas', 'confirmar', 'confirmar');
  T('cas: confirmar inicial (campos vacíos, sin cantidad)', await paso('cas') === 'confirmar' && !(await vis('#ix-cas-confirmar .ix-pers')));
  await page.locator('#ix-cas-confirmar [type=submit]').click(); await E('errores', () => !document.querySelector('#ix-cas-e-nombre').hidden && !document.querySelector('#ix-cas-e-respuesta').hidden, null);
  T('cas: error de validación junto a cada campo', (await txt('#ix-cas-e-nombre')) === 'Escribí tu nombre para armar el mensaje.' && (await txt('#ix-cas-e-respuesta')) === 'Elegí si podés ir o no.', await txt('#ix-cas-e-nombre'));
  T('cas: el foco pasa al primer campo con error', (await foco()) === 'ix-cas-nombre' && await page.evaluate(() => document.querySelector('#ix-cas-nombre').getAttribute('aria-invalid') === 'true'));
  await page.locator('#ix-cas-nombre').fill('Camila Ríos');
  T('cas: corregir un campo limpia su error', !(await vis('#ix-cas-e-nombre')));
  await page.locator('#ix-cas-confirmar .ix-opt').first().click();
  T('cas: «Sí» habilita la cantidad y limpia el error', await vis('#ix-cas-confirmar .ix-pers') && !(await vis('#ix-cas-e-respuesta')));
  for (let i = 0; i < 6; i++) await page.locator('#ix-cas-confirmar [data-act=mas]').click({ force: true });
  T('cas: la cantidad llega a 5 y no pasa', (await txt('#ix-cas-cant')) === '5' && await page.evaluate(() => document.querySelector('#ix-cas-confirmar [data-act=mas]').disabled));
  await page.locator('#ix-cas-confirmar [type=submit]').click(); await enCapa('cas', 'mensaje', 'mensaje');
  T('cas: borrador con el texto aprobado', await paso('cas') === 'mensaje' && (await txt('#ix-cas-mensaje [data-msg]')) === 'Hola, Lucía y Tomás. Soy Camila Ríos y confirmamos que vamos a su casamiento del sábado 20 de marzo. Somos 5. Gracias por invitarnos.', await txt('#ix-cas-mensaje [data-msg]'));
  T('cas: el borrador dice que no se envió y resume la respuesta', (await txt('#ix-cas-mensaje .ix-drs')) === 'Todavía no se envió.' && (await txt('#ix-cas-mensaje [data-resum]')) === 'Camila Ríos · Sí, voy · 5 personas', await txt('#ix-cas-mensaje [data-resum]'));
  T('cas: el foco va al título del borrador', (await foco()) === 'ix-cas-hm', await foco());
  await page.locator('#ix-cas-mensaje [data-act=wa]').click(); await E('wa', visFn, '[data-inv=cas] .ix-wa');
  T('cas: vista previa de WhatsApp: diálogo, envío inhabilitado, nada enviado', await vis('[data-inv=cas] .ix-wa') && await page.evaluate(() => document.querySelector('[data-inv=cas] .ix-send').disabled) && (await txt('[data-inv=cas] .ix-sys')) === 'Esto es una vista previa: no se envía nada ni se abre una conversación real.' && !(await page.evaluate(() => !!document.querySelector('[data-inv=cas] .ix-strip, [data-inv=cas] .ix-wnote'))));
  T('cas: el foco entra al diálogo', (await foco()) === 'cerrar-wa', await foco());
  await page.keyboard.press('Tab'); T('cas: Tab no sale del diálogo', await page.evaluate(() => !!document.activeElement.closest('[data-inv=cas] .ix-wa')));
  await page.keyboard.press('Escape'); await E('wa-cerrado', () => document.querySelector('[data-inv=cas] [data-ly=wa]').hidden, null);
  T('cas: Esc cierra la vista previa y devuelve el foco', !(await vis('[data-inv=cas] .ix-wa')) && (await foco()) === 'wa', await foco());
  await page.locator('#ix-cas-mensaje [data-act=editar]').click(); await enCapa('cas', 'confirmar', 'confirmar');
  T('cas: corregir vuelve al formulario con los datos', await paso('cas') === 'confirmar' && await page.evaluate(() => document.querySelector('#ix-cas-nombre').value === 'Camila Ríos'));
  await page.locator('#ix-cas-confirmar .ix-opt').nth(1).click();
  T('cas: «No» oculta la cantidad', !(await vis('#ix-cas-confirmar .ix-pers')));
  await page.locator('#ix-cas-confirmar [type=submit]').click(); await enCapa('cas', 'mensaje', 'mensaje');
  T('cas: mensaje de ausencia aprobado', (await txt('#ix-cas-mensaje [data-msg]')) === 'Hola, Lucía y Tomás. Soy Camila Ríos. Me hubiera encantado, pero no voy a poder ir a su casamiento del sábado 20 de marzo. Les mando un abrazo.');
  T('cas: aparece «Empezar de nuevo»', await vis('[data-ix-reiniciar]'));
  await page.locator('[data-ix-reiniciar]').click(); await enCapa('cas', 'portada', 'portada');
  T('cas: reiniciar vuelve a la portada y vacía los datos', await paso('cas') === 'portada' && await page.evaluate(() => document.querySelector('#ix-cas-nombre').value === '') && !(await vis('[data-ix-reiniciar]')));
  await page.keyboard.press('Escape'); await E('dialogo-cerrado', () => document.querySelector('[data-ip-o]').hidden, null);
  T('cas: Esc cierra el diálogo, libera la página (sin inert ni bloqueo) y devuelve el foco a «Probar la invitación completa»', await page.evaluate(() => document.querySelector('[data-ip-o]').hidden && !document.documentElement.classList.contains('ip-lock') && ![...document.body.children].some(e => e.inert) && document.activeElement.hasAttribute('data-ip-abrir')));

  // ================================================ cumpleaños
  await aId('cumple'); await enCapa('cum', 'portada', 'portada');
  T('cum: nace en la portada', await paso('cum') === 'portada');
  await page.locator('#ix-cum-portada [data-go=noche]').click(); await enCapa('cum', 'noche', 'noche');
  const t = () => page.evaluate(() => document.getElementById('cumple').getAttribute('data-t'));
  T('cum: «La noche» arranca en el brindis (21:00)', await paso('cum') === 'noche' && await t() === '0' && (await txt('[data-clock]')) === '21:00');   // F8.7: antes arrancaba en la cena (22:00)
  await page.locator('.ix-stop[data-idx="2"]').click(); await E('stop2', () => document.getElementById('cumple').dataset.t === '2' && document.querySelector('[data-nt]').textContent === 'Torta y baile', null);
  T('cum: tocar una parada cambia cielo, hora y detalle', await t() === '2' && (await txt('[data-clock]')) === '00:00' && (await txt('[data-nt]')) === 'Torta y baile');
  await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowLeft'); await E('stop0', () => document.getElementById('cumple').dataset.t === '0' && document.activeElement.dataset.idx === '0', null);
  T('cum: las flechas recorren las paradas y mueven el foco', await t() === '0' && (await txt('[data-clock]')) === '21:00' && await page.evaluate(() => document.activeElement.getAttribute('data-idx') === '0'));
  T('cum: grupo de radios (aria-checked, tabindex itinerante)', await page.evaluate(() => { const b = [...document.querySelectorAll('.ix-stop')]; return b.map(x => x.getAttribute('aria-checked')).join() === 'true,false,false' && b.map(x => x.tabIndex).join() === '0,-1,-1'; }));
  await page.locator('[data-inv=cum] #ix-cum-noche [data-go=info]').click(); await enCapa('cum', 'info', 'info');
  T('cum: información para invitados', await paso('cum') === 'info' && await vis('#ix-cum-info .ix-dl'));
  await page.locator('#ix-cum-info [data-go=confirmar]').click(); await enCapa('cum', 'confirmar', 'confirmar');
  await page.locator('#ix-cum-confirmar [type=submit]').click(); await E('cum-errores', () => !document.querySelector('#ix-cum-e-nombre').hidden && !document.querySelector('#ix-cum-e-respuesta').hidden, null);
  T('cum: error de validación', (await txt('#ix-cum-e-respuesta')) === 'Elegí si podés ir o no.' && (await txt('#ix-cum-e-nombre')) === 'Escribí tu nombre para armar el mensaje.');
  await page.locator('#ix-cum-nombre').fill('Camila Ríos'); await page.locator('#ix-cum-confirmar .ix-opt').first().click();
  T('cum: cantidad habilitada', await vis('#ix-cum-confirmar .ix-pers'));
  await page.locator('#ix-cum-confirmar [type=submit]').click(); await enCapa('cum', 'mensaje', 'mensaje');
  T('cum: borrador aprobado (1 persona)', (await txt('#ix-cum-mensaje [data-msg]')) === 'Hola, Mica. Soy Camila Ríos y confirmo que voy a tus 30 el sábado 14 de agosto. Gracias por invitarme.', await txt('#ix-cum-mensaje [data-msg]'));
  await page.locator('#ix-cum-mensaje [data-act=wa]').click(); await E('cum-wa', visFn, '[data-inv=cum] .ix-wa');
  T('cum: vista previa propia, sin envío', await vis('[data-inv=cum] .ix-wa') && await page.evaluate(() => document.querySelector('[data-inv=cum] .ix-send').disabled));
  await page.keyboard.press('Escape'); await E('cum-wa-cerrado', () => document.querySelector('[data-inv=cum] [data-ly=wa]').hidden, null);
  T('cum: Esc cierra', !(await vis('[data-inv=cum] .ix-wa')));
  await page.locator('#ix-cum-mensaje [data-act=editar]').click(); await enCapa('cum', 'confirmar', 'confirmar');
  T('cum: corregir conserva los datos', await paso('cum') === 'confirmar' && await page.evaluate(() => document.querySelector('#ix-cum-nombre').value === 'Camila Ríos'));

  // ================================================ empresa
  await aId('empresa');
  const ex = i => page.evaluate(i => document.querySelectorAll('.ix-b > button')[i].getAttribute('aria-expanded'), i);
  await page.locator('.ix-b > button').nth(2).click(); await E('emp-d2', visFn, '#ix-emp-d2');
  T('emp: la jornada abre el detalle en línea', await ex(2) === 'true' && await vis('#ix-emp-d2') && (await txt('#ix-emp-d2 .ix-bm')) === '10:30 a 12:30 · 2 h', await txt('#ix-emp-d2 .ix-bm'));
  await page.locator('.ix-b > button').nth(0).click(); await E('emp-d0', visFn, '#ix-emp-d0');
  T('emp: un solo bloque abierto a la vez', await ex(0) === 'true' && await ex(2) === 'false');
  await page.locator('.ix-b > button').nth(0).click(); await E('emp-cierra', () => document.querySelectorAll('.ix-b > button')[0].getAttribute('aria-expanded') === 'false', null);
  T('emp: tocar de nuevo lo cierra', await ex(0) === 'false');
  await page.locator('#ix-emp-portada [data-go=confirmar]').click(); await E('emp-form', () => document.querySelector('[data-inv=emp]').dataset.paso === 'confirmar' && document.activeElement.id === 'ix-emp-nombre', null);
  T('emp: «Confirmar asistencia» lleva al formulario y enfoca el nombre', (await foco()) === 'ix-emp-nombre', await foco());
  await page.locator('#ix-emp-confirmar [type=submit]').click(); await E('emp-errores', () => !document.querySelector('#ix-emp-e-nombre').hidden && !document.querySelector('#ix-emp-e-respuesta').hidden, null);
  T('emp: errores de validación', (await txt('#ix-emp-e-respuesta')) === 'Elegí si asistís o no.' && (await txt('#ix-emp-e-nombre')) === 'Escribí tu nombre para armar el mensaje.');
  T('emp: no hay cantidad de personas', !(await page.evaluate(() => !!document.querySelector('#ix-emp-cant'))));
  await page.locator('#ix-emp-nombre').fill('Diego Sosa'); await page.locator('#ix-emp-confirmar .ix-opt').first().click();
  await page.locator('#ix-emp-confirmar [type=submit]').click(); await E('emp-msg', () => document.querySelector('[data-inv=emp]').dataset.paso === 'mensaje' && document.querySelector('#ix-emp-confirmar').hidden && !document.querySelector('#ix-emp-mensaje').hidden && document.querySelector('#ix-emp-mensaje [data-msg]').textContent.length > 0, null);
  T('emp: borrador aprobado', await paso('emp') === 'mensaje' && (await txt('#ix-emp-mensaje [data-msg]')) === 'Hola, soy Diego Sosa. Confirmo que asisto al Encuentro anual 2027 del jueves 18 de marzo.', await txt('#ix-emp-mensaje [data-msg]'));
  T('emp: el formulario se reemplaza por el borrador', !(await vis('#ix-emp-confirmar')) && await vis('#ix-emp-mensaje') && (await txt('#ix-emp-mensaje .ix-drs')) === 'Todavía no se envió.');
  await page.locator('#ix-emp-mensaje [data-act=wa]').click(); await E('emp-wa', visFn, '#empresa .ix-wa');
  T('emp: vista previa modal sin envío', await vis('#empresa .ix-wa') && await page.evaluate(() => document.querySelector('#empresa .ix-send').disabled));
  const dentro = () => page.evaluate(() => !!document.activeElement.closest('#empresa .ix-wa'));
  let ok = true; for (let i = 0; i < 4; i++) { await page.keyboard.press('Tab'); ok = ok && await dentro(); } T('emp: el foco queda dentro del diálogo', ok);
  await page.keyboard.press('Escape'); await E('emp-wa-cerrado', () => document.querySelector('#empresa [data-ly=wa]').hidden && document.activeElement.dataset.act === 'wa', null);
  T('emp: Esc cierra y devuelve el foco', !(await vis('#empresa .ix-wa')) && (await foco()) === 'wa', await foco());
  await page.locator('#ix-emp-mensaje [data-act=editar]').click(); await E('emp-editar', () => document.querySelector('[data-inv=emp]').dataset.paso === 'confirmar' && !document.querySelector('#ix-emp-confirmar').hidden, null);
  T('emp: corregir vuelve al formulario con los datos', await paso('emp') === 'confirmar' && await page.evaluate(() => document.querySelector('#ix-emp-nombre').value === 'Diego Sosa'));
  await page.locator('[data-ix-reiniciar-ev=emp]').click(); await E('emp-reinicio', () => document.querySelector('[data-inv=emp]').dataset.paso === 'portada' && document.querySelector('#ix-emp-nombre').value === '', null);
  T('emp: reiniciar', await paso('emp') === 'portada' && await page.evaluate(() => document.querySelector('#ix-emp-nombre').value === ''));

  // ================================================ privacidad y red
  T('sin almacenamiento ni cookies nuevas', await store() === s0, await store());
  T('RSVP: ninguna respuesta (nombre ni mensaje) viaja en ningún pedido', !reqs.some(fuga), reqs.filter(fuga).map(r => r.slice(0, 120)).join(' | '));
  T('RSVP: sin POST a servicios propios o de terceros y sin envío a WhatsApp', !reqs.some(post) && !reqs.some(wa), reqs.filter(r => post(r) || wa(r)).map(r => r.slice(0, 120)).join(' | '));
  T('terceros: solo analítica Plausible', !reqs.some(tercero), reqs.filter(tercero).map(r => r.slice(0, 120)).join(' | '));
  T('interceptación activa: el manejador inspeccionó los pedidos' + (CONTROL ? ' (control ' + CONTROL + ')' : ''), net.vistos > 0 && net.interceptados === net.abortados, 'inspeccionados ' + net.vistos + ' · interceptados ' + net.interceptados + ' · abortados ' + net.abortados);
  T('sin errores de consola', errs.length === 0, errs.join(' | '));
  // ================================================ desborde horizontal real (regresión F6.1: Home a 320 px medía 334 px)
  // Un desborde es: scrollWidth del documento > ancho de la ventana, o un elemento visible que sobresale sin un ancestro que lo recorte.
  const medir = () => page.evaluate(() => {
    const iw = innerWidth, sw = document.documentElement.scrollWidth, cul = [];
    for (const e of document.querySelectorAll('body *')) { const b = e.getBoundingClientRect(); if (b.width && b.right > iw + 0.5) { let clip = false, a = e.parentElement; while (a && a !== document.body) { if (getComputedStyle(a).overflowX !== 'visible') { clip = true; break; } a = a.parentElement; } if (!clip) cul.push((typeof e.className === 'string' && e.className ? e.className.split(' ')[0] : e.tagName) + ' ' + Math.round(b.left) + '..' + Math.round(b.right)); } }
    const tz = document.querySelector('.ix-tz');
    return { iw, sw, culpables: cul.slice(0, 4), columnasTeaser: tz ? getComputedStyle(tz).gridTemplateColumns.split(' ').length : null };
  });
  for (const [ruta, nombre] of [[RAIZ + '/', 'Home'], [BASE, 'Invitaciones']]) {
    for (const w of [320, 360, 390]) {
      await page.setViewportSize({ width: w, height: 800 }); await page.goto(ruta + (ruta.includes('?') ? '&' : '?') + 'v=' + Date.now());
      await page.waitForFunction(() => document.readyState === 'complete' && document.fonts.status === 'loaded', null, { timeout: 5000 }).catch(() => {});
      const r = await medir();
      T('desborde · ' + nombre + ' a ' + w + ' px: el documento no supera la ventana', r.sw <= r.iw && r.culpables.length === 0, 'scrollWidth ' + r.sw + ' / ' + r.iw + (r.culpables.length ? ' · ' + r.culpables.join(', ') : ''));
      if (nombre === 'Home') T('desborde · Home a ' + w + ' px: el teaser usa ' + (w < 360 ? 'una columna' : 'dos columnas'), r.columnasTeaser === (w < 360 ? 1 : 2), 'columnas ' + r.columnasTeaser);
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  const timeouts = Object.entries(tiempos).filter(([, v]) => v === 'TIMEOUT').map(([k]) => k);
  T('ninguna espera de estado agotó su tiempo (5 s)', timeouts.length === 0, timeouts.join(', '));
  const lista = Object.values(tiempos).filter(v => typeof v === 'number');
  const informe = res.filter(r => !r[1] || /^CASO/.test(r[0])).map(r => (r[1] ? 'OK   ' : 'FALLA') + ' ' + r[0] + '  → ' + r[2]).join('\n') + '\n' + res.filter(r => r[1]).length + '/' + res.length + ' · esperas por estado: ' + lista.length + ', máx ' + Math.max(...lista) + ' ms, mediana ' + lista.sort((a, b) => a - b)[lista.length >> 1] + ' ms · red: ' + net.vistos + ' pedidos inspeccionados, ' + net.abortados + ' abortados';
  if (!CONTROL) return informe;
  // veredicto del control negativo: deben fallar exactamente las comprobaciones del defecto inyectado (y, en «fuga», el error de consola de los pedidos abortados); el resto, incluido el flujo RSVP, debe pasar
  const fallan = res.filter(r => !r[1]).map(r => r[0]);
  const esperadas = CONTROL === 'fuga'
    ? ['RSVP: ninguna respuesta (nombre ni mensaje) viaja en ningún pedido', 'RSVP: sin POST a servicios propios o de terceros y sin envío a WhatsApp', 'terceros: solo analítica Plausible']
    : ['desborde · Home a 320 px: el documento no supera la ventana', 'desborde · Home a 320 px: el teaser usa una columna'];
  const toleradas = CONTROL === 'fuga' ? ['sin errores de consola'] : [];
  const faltan = esperadas.filter(n => !fallan.includes(n)), sobran = fallan.filter(n => !esperadas.includes(n) && !toleradas.includes(n));
  const sale = net.fugasTerminadas;   // pedidos con datos de prueba que llegaron a completarse (deben ser 0)
  const detectado = !faltan.length && !sobran.length && (CONTROL !== 'fuga' || (net.abortados >= 2 && sale === 0));
  return (detectado ? 'CONTROL ' + CONTROL + ': DETECTADO (falla donde debe)' : 'CONTROL ' + CONTROL + ': NO DETECTADO — faltan: ' + faltan.join(' | ') + ' · inesperadas: ' + sobran.join(' | '))
    + ' · ' + res.filter(r => r[1]).length + '/' + res.length + ' OK (flujo RSVP incluido) · interceptados ' + net.interceptados + ', abortados ' + net.abortados + ', datos de prueba que salieron: ' + sale + '\n' + informe;
  } finally { await page.close(); }
}
