/* Growi 360° — prototipo local. Sin dependencias. Los importes (USD) son los vigentes del sitio; el ARS se calcula con shared.fx.js. */
(function () {
  var WA = 'https://wa.me/5491170593877?text=';
  var fx = (window.GROWI_FX && window.GROWI_FX.venta) || 1535;
  var cur = 'ARS', per = 'm';
  function ars(usd) { var v = usd * fx, paso = v >= 100000 ? 1000 : 100; /* mismo criterio que shared.js: al millar desde $100.000, a la centena por debajo */ return '$' + (Math.round(v / paso) * paso).toLocaleString('es-AR') + ' ARS'; }
  function money(usd) { var r = Math.round(usd * 100) / 100; return cur === 'USD' ? 'USD ' + r.toLocaleString('es-AR', { minimumFractionDigits: r % 1 ? 2 : 0, maximumFractionDigits: 2 }) : ars(usd); }
  function other(usd) { var r = Math.round(usd * 100) / 100; return cur === 'USD' ? 'ref. ' + ars(usd) : 'USD ' + r.toLocaleString('es-AR', { minimumFractionDigits: r % 1 ? 2 : 0, maximumFractionDigits: 2 }); }

  /* importes de la home: ARS principal, USD fijo al lado */
  document.querySelectorAll('[data-ars]').forEach(function (el) { var u = +el.dataset.ars; el.textContent = ars(u); el.insertAdjacentHTML('afterend', ' <span class="usd">(USD ' + u + ')</span>'); });

  /* menú móvil */
  var nav = document.querySelector('.nav'), mb = document.querySelector('.menu-btn');
  if (nav && mb) mb.addEventListener('click', function () { var o = nav.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });

  /* selector de punto de partida (home) */
  var picks = {
    app: { t: 'Empezá por GrowiApp', p: 'Ventas, stock, caja y turnos en una sola pantalla, con tus productos y precios ya cargados.', price: 'Desde ' + ars(15) + ' por mes + ' + ars(49) + ' de puesta en marcha, una sola vez (USD 15 y USD 49)', href: 'app.html', wa: 'GrowiApp' },
    web: { t: 'Empezá por GrowiWeb', p: 'Un sitio publicado que explica lo que hacés y te deja las consultas directo en el WhatsApp.', price: 'Desde ' + ars(200) + ', pago único (USD 200)', href: '#', wa: 'GrowiWeb' },
    flow: { t: 'Empezá por GrowiFlow', p: 'Recordatorios de turnos, resúmenes de ventas y pedidos anotados solos, sin que nadie se acuerde.', price: 'Desde ' + ars(79) + ', pago único (USD 79)', href: '#', wa: 'GrowiFlow' },
    inv: { t: 'Growi Invitaciones', p: 'Una invitación digital a medida, con confirmación de asistencia, para compartir con un enlace.', price: 'A medida, con presupuesto personalizado', href: '#', wa: 'una invitación digital' },
    combo: { t: 'Combo sitio + sistema', p: 'Sitio web y GrowiApp juntos: 10% de descuento en el sitio y la puesta en marcha del sistema sin cargo.', price: 'Por ejemplo, Combo Landing: unos ' + ars(195) + ' (USD 195)', href: '#', wa: 'el Combo' }
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
      var f = per === 'a' ? 0.85 : 1;
      tar.querySelectorAll('[data-usd]').forEach(function (el) { var u = +el.dataset.usd, v = el.classList.contains('m') ? u * f : u; el.querySelector('span').textContent = money(v); el.querySelector('small').textContent = other(v); });
      var p = document.querySelector('.tariff input:checked').value, v = plans[p], m = v[0], s = v[1];
      var set = function (id, a, b) { var n = document.getElementById(id); n.querySelector('b').textContent = a; n.querySelector('em').textContent = b; };
      if (per === 'm') {
        set('c1', money(s + m), 'Puesta en marcha ' + money(s) + ' + primer mes ' + money(m));
        set('c2', money(m) + ' / mes', 'Desde el segundo mes, sin permanencia');
        set('c3', money(s + m * 12), 'Primer año: puesta en marcha + 12 mensualidades');
      } else {
        set('c1', money(s + m * 12 * f), 'Puesta en marcha ' + money(s) + ' + 12 meses juntos ' + money(m * 12 * f));
        set('c2', money(m * 12 * f) + ' / año', 'Renovación anual (' + money(m * f) + ' por mes). El plan anual no tiene devolución');
        set('c3', money(s + m * 12 * f), 'Primer año; ahorrás ' + money(m * 12 * 0.15) + ' frente al pago mensual');
      }
      document.getElementById('l1').textContent = per === 'm' ? 'Primer mes' : 'Primer pago';
      document.getElementById('l2').textContent = per === 'm' ? 'Desde el segundo mes' : 'Después';
      document.getElementById('plan-wa').href = WA + encodeURIComponent('Hola Growi, quiero consultar por el plan ' + p + ' de GrowiApp' + (per === 'a' ? ' con pago anual' : '') + '.');
      document.getElementById('plan-name').textContent = p;
      document.querySelectorAll('.cur button[data-c]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.c === cur); });
      document.querySelectorAll('.cur button[data-p]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.p === per); });
    }
    tar.addEventListener('change', paint);
    document.querySelectorAll('.cur').forEach(function (g) { g.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; if (b.dataset.c) cur = b.dataset.c; if (b.dataset.p) per = b.dataset.p; paint(); }); });
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
