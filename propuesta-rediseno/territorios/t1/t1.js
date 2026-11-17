/* Territorio 1 · Mostrador: un GrowiApp de ejemplo que funciona (caja, reservas, stock), el panel de líneas y la calculadora. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var peso = function (n) { return '$' + Math.round(n).toLocaleString('es-AR'); };
  var WA = 'https://wa.me/5491170593877?text=';

  /* ---------- datos de ejemplo del café ---------- */
  var CATS = ['Cafetería', 'Pastelería', 'Almuerzo'];
  var BASE = [
    { id: 1, c: 0, n: 'Café cortado', p: 2800, s: 40 }, { id: 2, c: 0, n: 'Café con leche', p: 3400, s: 40 }, { id: 3, c: 0, n: 'Flat white', p: 3900, s: 30 },
    { id: 4, c: 0, n: 'Té en hebras', p: 2600, s: 25 }, { id: 5, c: 0, n: 'Jugo exprimido', p: 4500, s: 14 }, { id: 6, c: 0, n: 'Agua mineral', p: 1800, s: 36 },
    { id: 7, c: 1, n: 'Medialuna', p: 1500, s: 30 }, { id: 8, c: 1, n: 'Budín de limón', p: 3800, s: 12 }, { id: 9, c: 1, n: 'Cheesecake', p: 5200, s: 9 }, { id: 10, c: 1, n: 'Alfajor de maicena', p: 2100, s: 24 },
    { id: 11, c: 2, n: 'Tostado de jamón y queso', p: 6200, s: 18 }, { id: 12, c: 2, n: 'Sándwich de milanesa', p: 9800, s: 10 }, { id: 13, c: 2, n: 'Ensalada de la casa', p: 8900, s: 11 }
  ];
  var HORAS = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
  var S;
  function fresh() { S = { stock: {}, cart: {}, cat: 0, pay: 'Efectivo', ventas: [], res: { '13:00': 'Mesa de 4 · Paula' }, nroVenta: 0 }; BASE.forEach(function (p) { S.stock[p.id] = p.s; }); }
  fresh();
  var prod = function (id) { return BASE.filter(function (p) { return p.id === id; })[0]; };
  var toastT; function toast(m) { var t = $('[data-toast]'); t.textContent = m; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 2400); }

  /* ---------- caja ---------- */
  function renderCats() {
    $('[data-cats]').innerHTML = CATS.map(function (c, i) { return '<button type="button" data-cat="' + i + '" aria-pressed="' + (i === S.cat) + '">' + c + '</button>'; }).join('');
  }
  function renderGrid() {
    $('[data-grid]').innerHTML = BASE.filter(function (p) { return p.c === S.cat; }).map(function (p) {
      var st = S.stock[p.id], low = st < 8;
      return '<button type="button" class="tile" data-add="' + p.id + '"' + (st <= 0 ? ' disabled' : '') + '><span class="nm">' + p.n + '</span><span class="pr"><span>' + peso(p.p) + '</span><span class="st' + (low ? ' low' : '') + '">' + (st <= 0 ? 'sin stock' : st + ' u.') + '</span></span></button>';
    }).join('');
  }
  var total = function () { return Object.keys(S.cart).reduce(function (a, id) { return a + prod(+id).p * S.cart[id]; }, 0); };
  function renderTicket() {
    var ids = Object.keys(S.cart);
    $('[data-lines]').innerHTML = ids.length ? ids.map(function (id) {
      var p = prod(+id), q = S.cart[id];
      return '<li><span>' + p.n + '</span><span class="qty"><button type="button" data-dec="' + id + '" aria-label="Quitar uno de ' + p.n + '">−</button><span>' + q + '</span><button type="button" data-inc="' + id + '" aria-label="Agregar uno de ' + p.n + '">+</button></span><span class="lp">' + peso(p.p * q) + '</span></li>';
    }).join('') : '<li class="empty">Tocá un producto para empezar.</li>';
    $('[data-total]').textContent = peso(total());
    $('[data-cobrar]').disabled = !ids.length;
    $('[data-cobrar]').textContent = ids.length ? 'Cobrar ' + peso(total()) : 'Cobrar';
    $$('[data-pay]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.pay === S.pay); });
  }
  function renderDay() {
    var sum = S.ventas.reduce(function (a, v) { return a + v.t; }, 0);
    $('[data-caja]').textContent = peso(sum);
    $('[data-nventas]').textContent = S.ventas.length + (S.ventas.length === 1 ? ' venta' : ' ventas');
    var by = { 'Efectivo': 0, 'Mercado Pago': 0, 'Tarjeta': 0 }; S.ventas.forEach(function (v) { by[v.m] += v.t; });
    $('[data-efe]').textContent = 'Efectivo en caja: ' + peso(20000 + by['Efectivo']) + ' (incluye $20.000 de apertura)';
    $('[data-meth]').innerHTML = Object.keys(by).map(function (k) { var pct = sum ? by[k] / sum * 100 : 0; return '<li><span>' + k + '</span><span class="bar"><i style="width:' + pct + '%"></i></span><span class="v">' + peso(by[k]) + '</span></li>'; }).join('');
  }
  function renderStock() {
    var low = 0;
    $('[data-stock]').innerHTML = BASE.map(function (p) {
      var st = S.stock[p.id], l = st < 8; if (l) low++;
      return '<li class="' + (l ? 'low' : '') + '"><span>' + p.n + '</span><span class="bar"><i style="width:' + Math.min(100, st / p.s * 100) + '%"></i></span><span class="num">' + st + ' u.' + (l ? ' · bajo' : '') + '</span><button type="button" data-rep="' + p.id + '">Reponer +10</button></li>';
    }).join('');
    $('[data-lowdot]').hidden = !low;
  }
  function renderSlots() {
    var n = Object.keys(S.res).length;
    $('[data-nres]').textContent = n + (n === 1 ? ' reserva' : ' reservas');
    $('[data-slots]').innerHTML = HORAS.map(function (h) {
      var w = S.res[h];
      return '<li>' + (w ? '<div class="slot busy"><span class="h">' + h + '</span><span class="who">' + w + '</span></div>' : '<button type="button" class="slot" data-slot="' + h + '"><span class="h">' + h + '</span><span class="who">Libre</span></button>') + '</li>';
    }).join('');
  }
  function all() { renderCats(); renderGrid(); renderTicket(); renderDay(); renderStock(); renderSlots(); }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return;
    if (t.dataset.cat) { S.cat = +t.dataset.cat; renderCats(); renderGrid(); }
    else if (t.dataset.add) { var id = +t.dataset.add; if ((S.cart[id] || 0) < S.stock[id]) { S.cart[id] = (S.cart[id] || 0) + 1; renderTicket(); if (window.matchMedia('(max-width: 900px)').matches) toast('Agregado: ' + prod(id).n + ' · ' + peso(total()) + ' en la venta'); } else toast('No queda más stock de ' + prod(id).n); }
    else if (t.dataset.inc) { var i = +t.dataset.inc; if (S.cart[i] < S.stock[i]) S.cart[i]++; renderTicket(); }
    else if (t.dataset.dec) { var d = +t.dataset.dec; if (--S.cart[d] <= 0) delete S.cart[d]; renderTicket(); }
    else if (t.dataset.pay) { S.pay = t.dataset.pay; renderTicket(); }
    else if ('clear' in t.dataset) { S.cart = {}; renderTicket(); }
    else if ('cobrar' in t.dataset) {
      var tt = total(); Object.keys(S.cart).forEach(function (id) { S.stock[id] -= S.cart[id]; });
      S.ventas.push({ t: tt, m: S.pay }); S.nroVenta++; S.cart = {}; toast('Venta N.º ' + String(S.nroVenta).padStart(4, '0') + ' cobrada: ' + peso(tt) + ' · ' + S.pay); all();
    }
    else if (t.dataset.rep) { S.stock[t.dataset.rep] += 10; renderStock(); renderGrid(); toast('Stock repuesto: ' + prod(+t.dataset.rep).n); }
    else if (t.dataset.slot) {
      var h = t.dataset.slot, li = t.parentElement;
      li.innerHTML = '<form class="slot" data-form="' + h + '"><span class="h">' + h + '</span><label class="sr" for="nm-' + h.replace(':', '') + '">Nombre</label><div style="display:grid;grid-template-columns:1fr 64px auto;gap:6px"><input id="nm-' + h.replace(':', '') + '" name="n" placeholder="Nombre" required maxlength="24" autocomplete="off"><input name="q" type="number" min="1" max="12" value="2" aria-label="Personas"><button>Anotar</button></div></form>';
      li.querySelector('input').focus();
    }
    else if ('reset' in t.dataset) { fresh(); all(); toast('Demo reiniciada'); }
  });
  document.addEventListener('submit', function (e) {
    var f = e.target.closest('[data-form]'); if (!f) return; e.preventDefault();
    S.res[f.dataset.form] = 'Mesa de ' + f.q.value + ' · ' + f.n.value; renderSlots(); toast('Reserva anotada a las ' + f.dataset.form);
  });
  /* pestañas con teclado */
  var tabs = $$('.ws-tabs [role=tab]');
  function sel(v) { tabs.forEach(function (b) { var on = b.dataset.view === v; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; $('#v-' + b.dataset.view).hidden = !on; }); }
  tabs.forEach(function (b, i) { b.addEventListener('click', function () { sel(b.dataset.view); }); b.addEventListener('keydown', function (e) { var k = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 1, ArrowUp: -1 }[e.key]; if (k) { e.preventDefault(); var n = tabs[(i + k + tabs.length) % tabs.length]; n.focus(); sel(n.dataset.view); } }); });
  try { $('[data-fecha]').textContent = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }); } catch (e) {}
  all();

  /* ---------- panel de líneas ---------- */
  function P(u) { return '<b data-usd="' + u + '"></b>'; }
  var wa = function (t, r) { return WA + encodeURIComponent('Hola Growi, quiero consultar por ' + t + '.\n\n(ref: territorio-1-' + r + ')'); };
  var MOD = {
    app: { t: 'GrowiApp', p: 'Ventas, caja, stock, turnos y clientes en una sola pantalla, con tus productos ya cargados. Abono mensual, sin permanencia.', pri: 'Desde ' + P(15) + ' por mes<small>+ ' + P(49) + ' de puesta en marcha, una sola vez</small>', a: '<a class="btn p" href="#sistema">Probar el sistema</a><a class="btn" target="_blank" rel="noopener noreferrer" href="' + wa('GrowiApp', 'app') + '">Consultar</a>',
      art: '<ul class="chk"><li>Ventas y medios de pago</li><li>Caja del día</li><li>Stock con alertas</li><li>Turnos y reservas</li><li>Ficha de clientes</li><li>Reportes</li></ul><p class="sm2">Para cafeterías, peluquerías, talleres, kioscos y comercios.</p>' },
    web: { t: 'GrowiWeb', p: 'Un sitio publicado que explica lo que hacés y manda las consultas a tu WhatsApp. Lo diseñamos y lo dejamos online: vos no tocás nada técnico.', pri: 'Desde ' + P(200) + '<small>Pago único. Dominio y alojamiento aparte.</small>', a: '<a class="btn p" target="_blank" rel="noopener noreferrer" href="../../direcciones/demo/index.html">Abrir el sitio de ejemplo</a><a class="btn" target="_blank" rel="noopener noreferrer" href="' + wa('GrowiWeb', 'web') + '">Pedir presupuesto</a>',
      art: '<div class="site-th"><div class="u">Demo · consultorio de kinesiología (contenido ficticio)</div><img src="../../v3/demos/kinesiologia/captura-escritorio.webp" alt="Inicio de un sitio de ejemplo para un consultorio de kinesiología" loading="lazy"></div>' },
    flow: { t: 'GrowiFlow', p: 'El aviso del turno sale solo, el resumen de ventas te llega armado y los pedidos quedan anotados. Se contrata solo, sin necesidad de tener lo demás.', pri: 'Desde ' + P(79) + '<small>Pago único, sin mensualidad.</small>', a: '<a class="btn p" target="_blank" rel="noopener noreferrer" href="' + wa('GrowiFlow', 'flow') + '">Consultar</a>',
      art: '<div class="wa-b">Hola Lucía, te recordamos tu turno de mañana, miércoles, a las 8:00. ¿Nos confirmás?<small>Aviso automático · ayer 18:00</small></div><div class="wa-b me">Confirmo, gracias.<small>18:12</small></div><p class="sm2">Recordatorios, reportes y pedidos: tres paquetes, cada uno con precio cerrado.</p>' },
    combo: { t: 'Combo', p: 'Sitio y GrowiApp armados juntos, en una sola conversación: 10% menos en el sitio y la puesta en marcha del sistema sin cargo.', pri: 'Sitio desde ' + P(180) + '<small>+ ' + P(15) + ' por mes del sistema</small>', a: '<a class="btn p" target="_blank" rel="noopener noreferrer" href="' + wa('el Combo', 'combo') + '">Consultar</a>',
      art: '<div class="cmp"><div class="h"><span>Primer pago</span><span>Por separado</span><span>Combo</span></div><div><span>Sitio de una página</span><b data-usd="200"></b><b data-usd="180"></b></div><div><span>Puesta en marcha</span><b data-usd="49"></b><b>Sin cargo</b></div><div><span>Primer mes del sistema</span><b data-usd="15"></b><b data-usd="15"></b></div><div class="t"><span>Para empezar</span><span data-sum="200,49,15"></span><span data-sum="180,15"></span></div></div>' },
    inv: { t: 'Invitaciones', p: 'Una invitación digital para tu evento: se comparte con un enlace y se confirma por WhatsApp. Casamientos, cumpleaños, quinceañeras y eventos de empresa.', pri: 'A medida<small>Presupuesto y alcance por escrito antes de empezar.</small>', a: '<a class="btn p" target="_blank" rel="noopener noreferrer" href="/invitaciones/#demo">Probar los ejemplos</a><a class="btn" target="_blank" rel="noopener noreferrer" href="' + wa('una invitación digital', 'inv') + '">Pedir presupuesto</a>',
      art: '<div class="invc"><small>Nos casamos</small><b>Camila y Tomás</b><span>Sábado 20 de marzo de 2027</span></div><p class="sm2">Ejemplo con datos ficticios.</p>' }
  };
  function showMod(k) {
    var m = MOD[k]; $$('[data-mlist] button').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.m === k); });
    $('[data-mpanel]').innerHTML = '<div><h3>' + m.t + '</h3><p>' + m.p + '</p><p class="pri">' + m.pri + '</p><div class="acts">' + m.a + '</div></div><div class="art">' + m.art + '</div>';
    if (window.growiP) window.growiP.paint();
  }
  $('[data-mlist]').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) showMod(b.dataset.m); });
  $$('[data-nav] a').forEach(function (a) { a.addEventListener('click', function () { showMod(a.dataset.m); var n = $('[data-nav]'); n.classList.remove('open'); }); });
  var mb = $('[data-menu]'); if (mb) mb.addEventListener('click', function () { var o = $('[data-nav]').classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
  document.addEventListener('DOMContentLoaded', function () { showMod('app'); });

  /* ---------- calculadora de planes ---------- */
  var root = $('[data-calc]'), PL = { Start: [15, 49], Pro: [29, 149], Multi: [49, 249] }, per = 'm';
  function calc() {
    if (!window.growiP) return; var g = window.growiP, k = $('input[name=plan]:checked', root).value, m = PL[k][0], s = PL[k][1], sN = g.num(s), mN = g.num(m);
    var set = function (i, v, d, l) { $('[data-v' + i + ']').textContent = v; $('[data-d' + i + ']').textContent = d; if (l) $('[data-l' + i + ']').textContent = l; };
    if (per === 'm') { set(1, g.fmt(sN + mN), 'Puesta en marcha ' + g.fmt(sN) + ' + un mes de abono ' + g.fmt(mN), 'Para empezar'); set(2, g.fmt(mN) + ' por mes', 'Desde el segundo mes. Sin permanencia.', 'Después'); set(3, g.fmt(sN + mN * 12), 'Primer año: ' + g.fmt(sN) + ' + 12 meses de ' + g.fmt(mN), 'Primer año'); }
    else { var y = g.num(m * 12 * 0.85); set(1, g.fmt(sN + y), 'Puesta en marcha ' + g.fmt(sN) + ' + el año completo ' + g.fmt(y), 'Para empezar'); set(2, g.fmt(y) + ' por año', 'Se paga por año. El plan anual no tiene devolución.', 'Cada año'); set(3, g.fmt(mN * 12 - y), 'Lo que ahorrás en el año frente a 12 pagos mensuales de ' + g.fmt(mN), 'Ahorro con pago anual'); }
    $('[data-wa]', root).href = WA + encodeURIComponent('Hola Growi, quiero consultar por el plan ' + k + ' de GrowiApp' + (per === 'a' ? ' con pago anual' : '') + '.\n\n(ref: territorio-1-planes)');
    $$('[data-per]', root).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.per === per); });
  }
  root.addEventListener('change', calc); root.addEventListener('click', function (e) { var b = e.target.closest('[data-per]'); if (b) { per = b.dataset.per; calc(); } });
  document.addEventListener('growi:precios', calc);
})();
