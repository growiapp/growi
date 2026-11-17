/* Territorio 3 · Sala: exhibiciones reales (sitios y una invitación) con cartelas de museo, las cinco líneas como cartelas de pared y un catálogo de precios. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var WA = 'https://wa.me/5491170593877?text=';
  var P = function (u) { return '<span data-usd="' + u + '"></span>'; };
  var EX = [
    { id: 'kine', n: 'Consultorio de kinesiología', s: 'GrowiWeb · demo funcional', url: '../../direcciones/demo/index.html', mode: 'd', W: 1280, line: 'GrowiWeb · sitio institucional',
      d: 'Un sitio para que alguien entienda qué se revisa en la primera consulta y pida turno sin llamar. Contenido ficticio: no es un cliente.',
      look: ['El botón «Pedir turno» está en cada pantalla y abre WhatsApp con el mensaje armado.', 'Elegí una zona del cuerpo: muestra motivos de consulta, no diagnósticos.', 'El turnero tacha los horarios ocupados y arma el pedido.'],
      dec: [['Tipografía', 'Serif de sistema en títulos, con cursiva en la palabra clave; sans para el texto'], ['Color', 'Tres tonos: papel #f1eee7, tinta #151a22 y verde azulado #0b6e6e'], ['Acción', '«Pedir turno» fijo en el encabezado y turnero con horarios tachados'], ['Interacción', 'Zonas del cuerpo táctiles de 44 px, cada una con su texto']], price: 'Desde ' + P(550) + '<small>Sitio institucional · pago único · dominio y alojamiento aparte</small>', wa: 'el sitio del consultorio de kinesiología' },
    { id: 'cer', n: 'Taller de cerámica', s: 'GrowiWeb · concepto visual', url: '/web/demos/ceramica/', mode: 'd', W: 1280, line: 'GrowiWeb · landing page',
      d: 'Una página con un solo objetivo: que alguien reserve su lugar en una clase. Es un concepto visual, no un sitio publicado ni un cliente.',
      look: ['Un mensaje claro en el primer pantallazo: «Tu primera pieza, en cuatro clases».', 'Los datos que ayudan a decidir (clases, materiales, horno) antes de pedir nada.', 'Un único botón de reserva por WhatsApp.'],
      dec: [['Tipografía', 'Sans condensada en peso 800, titular de tres líneas'], ['Color', 'Terracota y crema, sin un tercer color'], ['Acción', 'Un solo botón: reservar por WhatsApp'], ['Estructura', 'Tres datos clave (clases, materiales, horno) antes del detalle']], price: 'Desde ' + P(200) + '<small>Landing page · pago único · dominio y alojamiento aparte</small>', wa: 'una landing como la del taller de cerámica' },
    { id: 'inv', n: 'Invitación de casamiento', s: 'Growi Invitaciones · ejemplo', url: 'invitacion/index.html', mode: 'm', fixed: true, W: 390, line: 'Growi Invitaciones',
      d: 'Una invitación que se abre desde un enlace, se recorre en el celular y se responde por WhatsApp. Datos ficticios.',
      look: ['Tocá «Abrir invitación»: la portada se abre en dos.', 'Cada pantalla tiene una sola idea: el día, el lugar, qué tener en cuenta, tu respuesta.', 'La respuesta arma el mensaje para el organizador; en una invitación real abre WhatsApp.'],
      dec: [['Tipografía', 'Instrument Serif a 120 px en los nombres; etiquetas de 12 px con espaciado'], ['Color', 'Azul noche #0f1a2b, marfil #f3efe6 y un filete dorado #c8a76a'], ['Movimiento', 'La portada se abre en dos mitades en 1,1 s; cada pantalla aparece al llegar'], ['Acción', 'Responder arma el mensaje para el organizador']], price: 'A medida<small>Presupuesto y alcance por escrito antes de empezar</small>', wa: 'una invitación digital como la del ejemplo' }
  ];
  var cur = 0, mode = 'd';
  EX.splice(0, 0, { id: 'app', n: 'Sistema de gestión', s: 'GrowiApp · demo por rubros', url: '/app/', jump: 'demo', mode: 'd', W: 1280, line: 'GrowiApp · sistema de gestión', d: 'La demo por rubro del sitio actual: elegí un tipo de negocio y mirá cómo queda su panel. Datos ficticios.', look: ['Cada rubro tiene su propio panel: cafetería, peluquería, taller y comercio.', 'Las mismas funciones (ventas, caja, stock, turnos) se ordenan según cómo trabaja ese negocio.', 'Los datos son de ejemplo y están marcados como tales.'], dec: [['Estructura', 'Un panel por rubro con los mismos módulos'], ['Datos', 'Ficticios, marcados como ejemplo'], ['Acción', 'Consultar por WhatsApp o pedir una demo de 20 minutos']], price: 'Desde ' + P(15) + ' por mes<small>+ ' + P(49) + ' de puesta en marcha, una sola vez</small>', wa: 'GrowiApp' });
  var narrow = function () { return window.matchMedia('(max-width: 700px)').matches; };
  $('[data-rooms]').innerHTML = EX.map(function (e, i) { return '<button role="tab" type="button" id="room-' + i + '" aria-controls="sala-panel" tabindex="' + (i === 0 ? 0 : -1) + '" data-i="' + i + '" aria-selected="' + (i === 0) + '"><b>' + e.n + '</b><span>' + e.s + '</span></button>'; }).join('');
  function fit() {
    var v = $('[data-view]'), f = $('[data-frame]'), e = EX[cur], cw = v.clientWidth, ch = v.clientHeight, m = mode === 'm' || narrow();
    var w = m ? Math.min(390, cw) : e.W, sc = m ? 1 : Math.min(1, cw / e.W);
    f.style.width = w + 'px'; f.style.height = (m ? ch : ch / sc) + 'px'; f.style.transform = 'scale(' + sc + ')'; f.style.left = m ? Math.max(0, (cw - w) / 2) + 'px' : '0';
  }
  function show(i) {
    cur = i; var e = EX[i]; mode = e.mode;
    $$('[data-rooms] button').forEach(function (b, k) { b.setAttribute('aria-selected', k === i); b.tabIndex = k === i ? 0 : -1; });
    var f = $('[data-frame]'); f.title = e.n + ' (ejemplo funcionando)'; f.onload = function () { if (e.jump) { try { f.contentDocument.querySelectorAll('.reveal').forEach(function (x) { x.classList.add('visible'); }); var el = f.contentDocument.getElementById(e.jump); if (el) f.contentWindow.scrollTo(0, el.getBoundingClientRect().top + f.contentWindow.scrollY - 70); } catch (x) {} } }; f.src = e.url; $('.seg').style.display = e.fixed ? 'none' : ''; $('[data-view]').setAttribute('aria-labelledby', 'room-' + i); $('[data-ctitle]').textContent = 'Ejemplo funcional · contenido ficticio'; $('[data-full]').href = e.url;
    $$('[data-w]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.w === mode); });
    $('[data-cartela]').innerHTML = '<h3>' + e.n + '</h3><p class="ln2">' + e.line + '</p><p>' + e.d + '</p><h4>Qué mirar</h4><ul>' + e.look.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul><h4>Decisiones de diseño</h4><dl>' + e.dec.map(function (x) { return '<dt>' + x[0] + '</dt><dd>' + x[1] + '</dd>'; }).join('') + '</dl><div class="pr">' + e.price + '</div><p class="nt">Precio de referencia: todavía no se aceptan contrataciones ni pagos.</p><a class="btn" target="_blank" rel="noopener noreferrer" href="' + WA + encodeURIComponent('Hola Growi, vi ' + e.wa + ' y quiero consultar por algo así.\n\n(ref: territorio-3-sala)') + '">Pedir algo así</a>';
    fit(); if (window.growiP) window.growiP.paint();
  }
  $('[data-rooms]').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) show(+b.dataset.i); });
  $('[data-rooms]').addEventListener('keydown', function (e) { var k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!k) return; e.preventDefault(); var n = (cur + k + EX.length) % EX.length; show(n); $$('[data-rooms] button')[n].focus(); });
  $$('[data-w]').forEach(function (b) { b.addEventListener('click', function () { mode = b.dataset.w; $$('[data-w]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); fit(); }); });
  window.addEventListener('resize', fit);

  /* cartelas de pared */
  var W = [
    ['GrowiApp', 'Sistema de gestión', 'Ventas, caja, stock, turnos y clientes en una sola pantalla, con tus productos ya cargados.', 'Desde ' + P(15) + ' por mes', '#sala', 'Ver la sala ↑'],
    ['GrowiWeb', 'Sitios web', 'Un sitio publicado que explica lo que hacés y manda las consultas a tu WhatsApp.', 'Desde ' + P(200), '#sala', 'Ver las salas ↑'],
    ['GrowiFlow', 'Automatizaciones', 'El aviso del turno sale solo, el resumen te llega armado y los pedidos quedan anotados.', 'Desde ' + P(79), '/flow/', 'Ver los paquetes ↗'],
    ['Combo', 'Sitio + sistema', 'Sitio y GrowiApp armados juntos: 10% menos en el sitio y la puesta en marcha sin cargo.', 'Sitio desde ' + P(180), '/combo/', 'Ver el combo ↗'],
    ['Invitaciones', 'Eventos', 'Una invitación digital para tu evento, que se comparte con un enlace y se confirma por WhatsApp.', 'A medida', '#sala', 'Ver la sala ↑']
  ];
  $('[data-walls]').innerHTML = W.map(function (w) { return '<div class="lbl"><span class="k">' + w[1] + '</span><h3>' + w[0] + '</h3><p>' + w[2] + '</p><span class="pr">' + w[3] + '</span><a href="' + w[4] + '"' + (w[4].charAt(0) === '/' ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + w[5] + '</a></div>'; }).join('');
  $$('.lbl a[href="#sala"]').forEach(function (a, i) { a.addEventListener('click', function () { show([0, 1, 3][i]); }); });

  /* catálogo */
  var C = [
    ['GrowiApp', [['Start', '1 usuario, 1 sucursal · ventas, caja y stock · turnos · clientes · reportes simples', P(15), ' por mes + ' + P(49) + ' de puesta en marcha'], ['Pro', 'Hasta 3 usuarios · todo lo de Start · factura electrónica ARCA: próximamente', P(29), ' por mes + ' + P(149) + ' de puesta en marcha'], ['Multi', 'Hasta 5 usuarios y 2 sucursales · reportes avanzados por sucursal · WhatsApp prioritario', P(49), ' por mes + ' + P(249) + ' de puesta en marcha']]],
    ['GrowiWeb', [['Landing Express', 'Hasta 4 secciones · plantilla adaptada a tu rubro · formulario simple · 1 ronda de revisiones · 7 días de soporte', P(200), ' pago único'], ['Landing Pro', 'Hasta 6 secciones · diseño a tu marca · redacción básica · formulario a medida · 2 rondas', P(299), ' pago único'], ['Landing Performance', 'Hasta 8 secciones · diseño a medida · textos para vender · medición · 3 rondas y revisión final · 30 días de soporte', P(449), ' pago único'], ['Institucional Base', 'Inicio, servicios, contacto y mapa · WhatsApp integrado · 1 ronda · 30 días de soporte', P(550), ' pago único'], ['Institucional con turnos', 'Todo lo del Base · formulario de turno conectado a tu sistema · 3 rondas · soporte prioritario', P(729), ' pago único']]],
    ['GrowiFlow', [['Reportes automáticos', 'Un resumen por WhatsApp o mail, cada semana o cada mes · 7 días de ajustes', P(89), ' pago único'], ['Recordatorios automáticos', 'Aviso de turnos, vencimientos y pagos pendientes · 7 días de ajustes', P(89), ' pago único'], ['Pedidos y consultas en orden', 'Lo que entra por WhatsApp, Instagram o un formulario, anotado en una planilla', P(79), ' pago único'], ['Automatización a medida', 'Alcance cerrado por escrito antes de empezar', P(190), ' «desde»']]],
    ['Combo', [['Combo Landing', 'Sitio Express con 10% menos + GrowiApp Start con la puesta en marcha sin cargo', P(180), ' el sitio + ' + P(15) + ' por mes'], ['Combo Institucional', 'Sitio Base con 10% menos + GrowiApp Start con la puesta en marcha sin cargo', P(495), ' el sitio + ' + P(15) + ' por mes']]],
    ['Invitaciones', [['Invitación a medida', 'Portada, programa, ubicación y confirmación por WhatsApp · dos rondas de ajustes · online hasta 30 días después del evento', 'A medida', ' presupuesto por escrito']]]
  ];
  $('[data-cat]').innerHTML = C.map(function (g) { return '<div class="grp"><h3>' + g[0] + '</h3><div>' + g[1].map(function (r) { return '<div class="it"><b>' + r[0] + '</b><span>' + r[1] + '</span><span class="p">' + r[2] + '<small>' + r[3] + '</small></span></div>'; }).join('') + '</div></div>'; }).join('');
  var mb = $('[data-menu]'); if (mb) mb.addEventListener('click', function () { var o = $('[data-nav]').classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
  $$('[data-nav] a').forEach(function (a) { a.addEventListener('click', function () { $('[data-nav]').classList.remove('open'); if (a.textContent === 'Invitaciones') show(3); else if (a.textContent === 'GrowiWeb') show(1); else if (a.textContent === 'GrowiApp') show(0); }); });
  document.addEventListener('DOMContentLoaded', function () { show(0); });
})();
