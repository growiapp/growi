/* Territorio 2 · Hilo: recorrido de un turno por las cinco líneas (escenas reales y un sitio real embebido) y el armado del recorrido con precios. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var WA = 'https://wa.me/5491170593877?text=';
  var DEMO = '../../direcciones/demo/index.html', SHOT = '../../v3/demos/kinesiologia/captura-escritorio.webp';
  var narrow = function () { return window.matchMedia('(max-width: 900px)').matches; };

  var STEPS = [
    { tag: 'GrowiWeb', t: 'Te encuentran', p: 'Un sitio con horarios, equipo y un botón que abre tu WhatsApp. Se ve igual de bien en el celular.',
      sc: function (m) { return m ? '<div class="fr fm"><iframe src="' + DEMO + '" title="Sitio de ejemplo de un consultorio, funcionando" loading="lazy"></iframe></div>' : '<div class="fr" data-fr data-w="1280" data-h="470"><iframe src="' + DEMO + '" title="Sitio de ejemplo de un consultorio, funcionando" loading="lazy" width="1280" height="620"></iframe></div>'; },
      cap: 'Un sitio real, funcionando (contenido ficticio). Probalo: elegí una zona o un turno.' },
    { tag: 'GrowiWeb → WhatsApp', t: 'Piden turno', p: 'La persona elige tipo de consulta, día y horario. Se abre WhatsApp con el mensaje ya escrito, sin formularios.',
      sc: function () { return '<dl class="kv"><dt>Consulta</dt><dd>Primera consulta</dd><dt>Profesional</dt><dd>Cualquiera disponible</dd><dt>Cuándo</dt><dd>miércoles 18 de noviembre, 8:00</dd></dl><div class="chat"><div class="chat-h"><span class="av">AK</span><div><b>Alameda Kinesiología</b><small>en línea</small></div></div><div class="chat-b"><div class="bb me">Hola, quiero pedir un turno.<br>Consulta: Primera consulta<br>Profesional: cualquiera disponible<br>Cuándo: miércoles 18 de noviembre, 8:00<small>7:48 ✓✓</small></div></div></div>'; },
      cap: 'El botón del sitio arma el mensaje. El consultorio recibe el pedido con todo lo que necesita.' },
    { tag: 'GrowiApp', t: 'Queda anotado', p: 'El turno entra a la agenda del sistema, junto con las demás reservas y la ficha de la persona.',
      sc: function () { return '<div class="ag"><div class="ag-h"><b>Agenda · miércoles 18</b><span class="mono">Sucursal Centro</span></div><ul><li><span class="h">8:00</span><span><b>M. Pérez</b> · Primera consulta</span><span class="org">NUEVO · vino del sitio</span></li><li><span class="h">9:00</span><span>L. Gómez · Seguimiento</span><span></span></li><li><span class="h">10:00</span><span class="free">Libre</span><span></span></li><li><span class="h">11:00</span><span>R. Díaz · Posoperatorio</span><span></span></li><li><span class="h">12:00</span><span class="free">Libre</span><span></span></li></ul></div>'; },
      cap: 'Nadie lo copia a mano: el pedido de WhatsApp queda en la agenda.' },
    { tag: 'GrowiFlow', t: 'Le avisan solos', p: 'El día anterior sale el recordatorio por WhatsApp, sin que nadie se acuerde de mandarlo. Así no se pierden turnos por olvido.',
      sc: function () { return '<div class="flowrow" data-flow><span class="pkt"></span>' +
        [['Todos los días 18:00', 'Mirar la agenda', 'Cada tarde revisa los turnos del día siguiente. <i>Ejemplo: encuentra 6 turnos de mañana.</i>'], ['Filtro', 'Turnos de mañana', 'Se queda solo con los que tienen horario y teléfono. <i>Ejemplo: 5 cumplen; 1 no tiene teléfono y queda marcado para avisar a mano.</i>'], ['Mensaje', 'Armar el aviso', 'Completa nombre, día y hora en el texto que elegiste. <i>Ejemplo: «Hola Lucía, te recordamos tu turno de mañana a las 8:00».</i>'], ['Salida', 'Enviar por WhatsApp', 'Lo manda al cliente y deja anotado que se avisó. <i>Ejemplo: 5 enviados, 5 registrados en la agenda.</i>']]
          .map(function (n, i) { return '<button type="button" class="node" data-n="' + i + '" aria-pressed="' + (i === 2) + '" data-d="' + n[2] + '"><span class="k">' + n[0] + '</span><b>' + n[1] + '</b></button>'; }).join('') + '</div><div class="nd-t" data-nd><b>Armar el aviso.</b> Completa nombre, día y hora en el texto que elegiste.</div><div class="chat" style="margin-top:14px"><div class="chat-b" style="min-height:0"><div class="bb">Hola Lucía, te recordamos tu turno de mañana, miércoles, a las 8:00. ¿Nos confirmás?<small>Aviso automático · ayer 18:00</small></div></div></div>'; },
      cap: 'Así funciona una automatización por dentro: cada caja es un paso que podés abrir y entender.' },
    { tag: 'GrowiApp', t: 'Se cobra y queda en caja', p: 'La sesión se cobra desde el mismo sistema y suma a la caja del día, separada por medio de pago.',
      sc: function () { return '<div class="cb"><div class="rw"><span>Primera consulta</span><b class="mono" style="color:var(--ink)">$18.000</b></div><div class="py" role="group" aria-label="Medio de pago"><button type="button" aria-pressed="true" data-py>Efectivo</button><button type="button" aria-pressed="false" data-py>Mercado Pago</button><button type="button" aria-pressed="false" data-py>Tarjeta</button></div><button type="button" class="btn p wide" data-cobro>Cobrar $18.000</button><div class="rw" style="margin-top:14px;border:0"><span>Caja del día</span><span class="big" data-caja2>$20.000</span></div><p class="mono" data-cobrado>Todavía no se cobró nada hoy. Apertura: $20.000.</p></div>'; },
      cap: 'Datos de ejemplo. Probá cobrar: la caja suma, sin planillas.' },
    { tag: 'GrowiFlow', t: 'Cada lunes, el resumen', p: 'Un resumen armado con los datos de la semana te llega por WhatsApp o mail, sin sentarte a sacar cuentas.',
      sc: function () { return '<div class="chat"><div class="chat-h"><span class="av">G</span><div><b>Resumen de la semana</b><small>lunes 9:00 · ejemplo</small></div></div><div class="chat-b" style="min-height:0"><div class="bb">Semana del 10 al 16:<br>· 34 turnos atendidos, 3 ausencias<br>· Ingresos: $612.400 (+8% vs. la semana anterior)<br>· Lo más pedido: primera consulta<br>· Para mirar: el jueves por la tarde tuvo 5 horarios libres<small>Armado con IA · datos ficticios</small></div></div></div>'; },
      cap: 'Ejemplo con datos ficticios. Los reportes se arman con lo que ya cargaste en GrowiApp o en tu planilla.' },
    { tag: 'Combo', t: 'Todo junto, con una sola charla', p: 'El Combo arma sitio y sistema a la vez; GrowiFlow se suma cuando lo necesitás. Las Invitaciones son otra historia: eventos.',
      sc: function () { return '<div class="map"><div class="on"><b>GrowiWeb</b><span>te encuentran</span></div><div class="on"><b>GrowiApp</b><span>queda anotado y en caja</span></div><div class="on"><b>GrowiFlow</b><span>avisos y resúmenes</span></div><div class="on"><b>Combo</b><span>sitio + sistema, 10% menos en el sitio</span></div><div><b>Invitaciones</b><span>eventos, a medida</span></div><div><b>WhatsApp</b><span>el canal de todo el recorrido</span></div></div>'; },
      cap: 'Mismo equipo, un solo WhatsApp, un precio por escrito antes de empezar.' }
  ];
  var caja = 20000, cobros = 0, cur = 0, list = $('[data-steps]');
  list.innerHTML = '<span class="fill" data-fill></span>' + STEPS.map(function (s, i) { return '<li class="step" data-i="' + i + '"><span class="nd"></span><span class="tg">' + s.tag + '</span><h3><button type="button" class="sb" aria-label="Paso ' + (i + 1) + ': ' + s.t + '">' + s.t + '</button></h3><p>' + s.p + '</p><div class="sm">' + s.sc(true) + '<p class="cap">' + s.cap + '</p></div></li>'; }).join('');
  var items = $$('.step', list);
  function bind(root) {
    var f = $('[data-fr]', root); if (f) { var fit = function () { var sc = f.clientWidth / +f.dataset.w; f.style.height = (+f.dataset.h * sc) + 'px'; var i = $('iframe', f); i.style.transform = 'scale(' + sc + ')'; i.style.width = f.dataset.w + 'px'; i.style.height = f.dataset.h + 'px'; }; fit(); requestAnimationFrame(fit); window.addEventListener('resize', fit); }
    $$('.node', root).forEach(function (n) { n.addEventListener('click', function () { $$('.node', root).forEach(function (x) { x.setAttribute('aria-pressed', x === n); }); $('[data-nd]', root).innerHTML = '<b>' + $('b', n).textContent + '.</b> ' + n.dataset.d; }); });
        $$('[data-py]', root).forEach(function (b) { b.addEventListener('click', function () { $$('[data-py]', root).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); }); });
    var c = $('[data-cobro]', root); if (c) { var paint2 = function (msg) { $('[data-caja2]', root).textContent = '$' + caja.toLocaleString('es-AR'); if (msg) $('[data-cobrado]', root).textContent = msg; }; if (cobros) paint2(cobros + (cobros === 1 ? ' sesión cobrada hoy.' : ' sesiones cobradas hoy.')); c.addEventListener('click', function () { caja += 18000; cobros++; paint2('Cobrado con ' + $('[data-py][aria-pressed=true]', root).textContent + '. ' + cobros + (cobros === 1 ? ' sesión cobrada hoy.' : ' sesiones cobradas hoy.')); }); }
  }
  var lockT = 0;
  function show(i, byUser) {
    if (byUser) lockT = Date.now(); cur = i; items.forEach(function (li, k) { li.classList.toggle('on', k === i); li.classList.toggle('done', k < i); });
    $('[data-fill]').style.height = (i === 0 ? 0 : (items[i].offsetTop - items[0].offsetTop)) + 'px';
    if (narrow()) return;
    var s = STEPS[i]; $('[data-stag]').textContent = s.tag; $('[data-scount]').textContent = 'Paso ' + (i + 1) + ' de ' + STEPS.length;
    var b = $('[data-sbody]'); b.innerHTML = '<div class="scn">' + s.sc(false) + '<p class="cap">' + s.cap + '</p></div>'; bind(b);
    $('[data-prev]').disabled = i === 0; $('[data-next]').disabled = i === STEPS.length - 1;
  }
  items.forEach(function (li, k) { li.addEventListener('click', function (e) { if (!e.target.closest('.sm')) show(k, true); }); });
  $('[data-prev]').addEventListener('click', function () { show(Math.max(0, cur - 1), true); }); $('[data-next]').addEventListener('click', function () { show(Math.min(STEPS.length - 1, cur + 1), true); });
  items.forEach(function (li) { bind(li); });
  /* activación por scroll en escritorio */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !narrow() && Date.now() - lockT > 1200) show(+e.target.dataset.i); }); }, { rootMargin: '-40% 0px -50% 0px' });
    items.forEach(function (li) { io.observe(li); });
  }
  show(0);
  window.addEventListener('resize', function () { show(cur); });

  /* ---------- armar el recorrido ---------- */
  var arm = $('[data-arm]'), APP = { Start: [15, 49], Pro: [29, 149], Multi: [49, 249] }, WEBN = { 200: 'Landing Express', 299: 'Landing Pro', 449: 'Landing Performance', 550: 'Institucional Base' };
  function render() {
    if (!window.growiP) return; var g = window.growiP, F = g.fmt;
    var web = +$('input[name=web]:checked', arm).value, app = $('input[name=app]:checked', arm).value, fl = $('input[name=flow]:checked', arm).value;
    var combo = web > 0 && app !== '0', lines = [], total = 0, save = 0;
    if (web) { var wN = g.num(web), wC = combo ? g.num(web * 0.9) : wN; lines.push([WEBN[web] + (combo ? ' (10% menos por Combo)' : ''), wC, false]); total += wC; if (combo) save += wN - wC; }
    if (app !== '0') { var m = APP[app][0], s = APP[app][1], sN = g.num(s), mN = g.num(m); if (combo && app === 'Start') { lines.push(['Puesta en marcha de GrowiApp ' + app, 0, true]); save += sN; } else { lines.push(['Puesta en marcha de GrowiApp ' + app, sN, false]); total += sN; } lines.push(['Primer mes de GrowiApp ' + app, mN, false]); total += mN; }
    if (fl !== '0') { var pr = fl.split('|'), fN = g.num(+pr[0]); lines.push(['GrowiFlow · ' + pr[1], fN, false]); total += fN; }
    var invAt = $('input[name=inv]:checked', arm).value === '1'; if (invAt) lines.push(['Invitación digital: presupuesto a medida por escrito', 0, 'med']);
    $('[data-lines]').innerHTML = lines.length ? lines.map(function (l) { return '<li class="' + (l[2] ? 'dis' : '') + '"><span>' + l[0] + '</span><span>' + (l[2] === 'med' ? 'a medida' : l[2] ? 'sin cargo' : F(l[1])) + '</span></li>'; }).join('') : '<li class="empty">Elegí al menos una parte.</li>';
    $('[data-total]').textContent = F(total);
    $('[data-monthly]').textContent = app !== '0' ? 'Después: ' + F(g.num(APP[app][0])) + ' por mes por GrowiApp, sin permanencia.' : (lines.length ? 'Pago único: no hay mensualidad.' : '');
    var sv = $('[data-save]'); sv.hidden = !combo; if (combo) sv.textContent = 'Ahorrás ' + F(save) + ' por armarlo junto.' + (app !== 'Start' ? ' La puesta en marcha sin cargo está publicada para GrowiApp Start: en Pro y Multi se consulta.' : '');
    var desc = lines.map(function (l) { return l[0]; }).join('; ');
    $('[data-wa]').href = WA + encodeURIComponent('Hola Growi, quiero consultar por este recorrido: ' + (desc || 'todavía no sé cuál') + '.\n\n(ref: territorio-2-armar)');
  }
  arm.addEventListener('change', render); document.addEventListener('growi:precios', render);
  var mb = $('[data-menu]'); if (mb) mb.addEventListener('click', function () { var o = $('[data-nav]').classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
  $$('[data-nav] a').forEach(function (a) { a.addEventListener('click', function () { $('[data-nav]').classList.remove('open'); }); });
})();
