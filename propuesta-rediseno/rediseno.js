/* Growi 360° — prototipo local. Sin dependencias. Los importes (USD) son los vigentes del sitio; el ARS se calcula con shared.fx.js. */
(function () {
  var WA = 'https://wa.me/5491170593877?text=';
  var fx = (window.GROWI_FX && window.GROWI_FX.venta) || 1535;
  var cur = 'USD';
  function ars(usd) { return '$' + (Math.round(usd * fx / 100) * 100).toLocaleString('es-AR') + ' ARS'; }
  function money(usd) { return cur === 'USD' ? 'USD ' + usd.toLocaleString('es-AR') : ars(usd); }
  function other(usd) { return cur === 'USD' ? 'ref. ' + ars(usd) : 'USD ' + usd.toLocaleString('es-AR'); }

  /* menú móvil */
  var nav = document.querySelector('.nav'), mb = document.querySelector('.menu-btn');
  if (nav && mb) mb.addEventListener('click', function () { var o = nav.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });

  /* selector de punto de partida (home) */
  var picks = {
    app: { t: 'Empezá por GrowiApp', p: 'Ventas, stock, caja y turnos en una sola pantalla, con tus productos y precios ya cargados.', price: 'Desde USD 15 por mes + USD 49 de puesta en marcha, una sola vez', href: 'app.html', wa: 'GrowiApp' },
    web: { t: 'Empezá por GrowiWeb', p: 'Un sitio publicado que explica lo que hacés y te deja las consultas directo en el WhatsApp.', price: 'Desde USD 200, pago único', href: '#', wa: 'GrowiWeb' },
    flow: { t: 'Empezá por GrowiFlow', p: 'Recordatorios de turnos, resúmenes de ventas y pedidos anotados solos, sin que nadie se acuerde.', price: 'Desde USD 79, pago único', href: '#', wa: 'GrowiFlow' },
    inv: { t: 'Growi Invitaciones', p: 'Una invitación digital a medida, con confirmación de asistencia, para compartir con un enlace.', price: 'A medida, con presupuesto personalizado', href: '#', wa: 'una invitación digital' },
    combo: { t: 'Combo sitio + sistema', p: 'Sitio web y GrowiApp juntos: 10% de descuento en el sitio y la puesta en marcha del sistema sin cargo.', price: 'Por ejemplo, Combo Landing: unos USD 195', href: '#', wa: 'el Combo' }
  };
  var pq = document.querySelector('.picker-q');
  if (pq) {
    var pa = document.querySelector('.picker-a');
    pq.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      pq.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      var d = picks[b.dataset.k];
      pa.querySelector('h3').textContent = d.t; pa.querySelector('.pp').textContent = d.p; pa.querySelector('.price').textContent = d.price;
      pa.querySelector('.go').href = d.href; pa.querySelector('.wa').href = WA + encodeURIComponent('Hola Growi, quiero consultar por ' + d.wa + '.');
      pa.querySelector('.go').style.display = d.href === '#' ? 'none' : '';
    });
  }

  /* tarifario + calculadora (GrowiApp) */
  var tar = document.querySelector('.tariff');
  if (tar) {
    var plans = { Start: [15, 49], Pro: [29, 149], Multi: [49, 249] };
    function paint() {
      tar.querySelectorAll('[data-usd]').forEach(function (el) { var u = +el.dataset.usd; el.querySelector('span').textContent = money(u); el.querySelector('small').textContent = other(u); });
      var p = document.querySelector('.tariff input:checked').value, v = plans[p];
      var set = function (id, a, b) { var n = document.getElementById(id); n.querySelector('b').textContent = a; n.querySelector('em').textContent = b; };
      set('c1', money(v[1] + v[0]), 'Puesta en marcha ' + money(v[1]) + ' + primer mes ' + money(v[0]));
      set('c2', money(v[0]) + ' / mes', 'Desde el segundo mes, sin permanencia');
      set('c3', money(v[1] + v[0] * 12), 'Primer año: puesta en marcha + 12 mensualidades');
      document.getElementById('plan-wa').href = WA + encodeURIComponent('Hola Growi, quiero consultar por el plan ' + p + ' de GrowiApp.');
      document.getElementById('plan-name').textContent = p;
      document.querySelectorAll('.cur button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.c === cur); });
    }
    tar.addEventListener('change', paint);
    document.querySelector('.cur').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; cur = b.dataset.c; paint(); });
    paint();
  }

  /* pestañas del panel de producto */
  document.querySelectorAll('[data-tabs]').forEach(function (box) {
    var tabs = box.querySelectorAll('[role=tab]'), panes = box.querySelectorAll('.pane');
    function sel(i) { tabs.forEach(function (t, j) { t.setAttribute('aria-selected', i === j); t.tabIndex = i === j ? 0 : -1; panes[j].hidden = i !== j; }); }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { sel(i); });
      t.addEventListener('keydown', function (e) { var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (k) { var n = (i + k + tabs.length) % tabs.length; sel(n); tabs[n].focus(); } });
    });
    sel(0);
  });
})();
