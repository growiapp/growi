/* Growi 360° — V3 (prototipo local). Se apoya en shared.js (window.growiPrice, evento growi:currency). */
(function () {
  var WA = 'https://wa.me/5491170593877?text=';
  var base = '/propuesta-rediseno/v3/';
  var cur = function () { return document.documentElement.dataset.currency === 'USD' ? 'USD' : 'ARS'; };
  var P = function (usd) { return window.growiPrice ? window.growiPrice(usd, cur()) : 'USD ' + usd; };

  /* enlace activo en la navegación (shared.js solo conoce las rutas de producción) */
  var here = location.pathname.replace(base, '').split('/')[0];
  document.querySelectorAll('.nav-links a, .mobile-menu-card a').forEach(function (a) {
    var h = (a.getAttribute('href') || '').replace(base, '').split('/')[0];
    if (here && h === here) { a.classList.add('active'); a.setAttribute('aria-current', 'page'); }
  });

  /* orientación de la home: qué me molesta hoy */
  var q = document.querySelector('.v3-picker-q');
  if (q) {
    var d = {
      app: { t: 'GrowiApp', p: 'Ventas, caja, stock y turnos en una sola pantalla, con tus productos y precios ya cargados.', usd: [15, 49], href: 'app/', wa: 'GrowiApp' },
      web: { t: 'GrowiWeb', p: 'Un sitio publicado que explica lo que hacés y manda las consultas a tu WhatsApp.', usd: [200], href: 'web/', wa: 'GrowiWeb' },
      flow: { t: 'GrowiFlow', p: 'El aviso del turno sale solo, el resumen de ventas te llega armado y los pedidos quedan anotados.', usd: [79], href: 'flow/', wa: 'GrowiFlow' },
      combo: { t: 'Combo sitio + sistema', p: 'Sitio y GrowiApp juntos: 10% menos en el sitio y la puesta en marcha del sistema sin cargo.', usd: [180, 15], href: 'combo/', wa: 'el Combo' },
      inv: { t: 'Invitaciones digitales', p: 'Una invitación para tu evento, que se comparte con un enlace y se confirma por WhatsApp.', usd: [], href: 'invitaciones/', wa: 'una invitación digital' }
    };
    var a = document.querySelector('.v3-picker-a');
    var pick = function (k) {
      var x = d[k];
      a.querySelector('h3').textContent = x.t;
      a.querySelector('.pp').textContent = x.p;
      var pr = '';
      if (k === 'app') pr = 'Desde ' + P(15) + ' por mes + ' + P(49) + ' de puesta en marcha, una sola vez';
      else if (k === 'web') pr = 'Desde ' + P(200) + ', pago único';
      else if (k === 'flow') pr = 'Desde ' + P(79) + ', pago único';
      else if (k === 'combo') pr = 'Sitio desde ' + P(180) + ' (pago único) + ' + P(15) + ' por mes del sistema';
      else pr = 'A medida, con presupuesto por escrito antes de empezar';
      a.querySelector('.price').textContent = pr;
      a.querySelector('.go').href = base + x.href;
      a.querySelector('.wa').href = WA + encodeURIComponent('Hola Growi, quiero consultar por ' + x.wa + '.\n\n(ref: home-orientacion)');
      q.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.k === k); });
      a.dataset.k = k;
    };
    q.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) pick(b.dataset.k); });
    document.addEventListener('growi:currency', function () { pick(a.dataset.k || 'app'); });
    pick('app');
  }

  /* calculadora de GrowiApp: cuánto pago al empezar */
  var calc = document.querySelector('.v3-calc');
  if (calc) {
    var plans = { Start: [15, 49], Pro: [29, 149], Multi: [49, 249] };
    var annual = function () { var b = document.getElementById('btnAnnual'); return b && b.getAttribute('aria-pressed') === 'true'; };
    var set = function (i, a, b) { var n = calc.querySelector('#v3c' + i); n.querySelector('b').textContent = a; n.querySelector('em').textContent = b; };
    var paint = function () {
      var k = calc.querySelector('input:checked').value, m = plans[k][0], s = plans[k][1], an = annual();
      if (!an) {
        set(1, P(s + m), 'Puesta en marcha ' + P(s) + ' + un mes de abono ' + P(m));
        set(2, P(m) + ' por mes', 'Desde el segundo mes. Sin permanencia.');
        set(3, P(s + m * 12), 'Primer año: puesta en marcha + 12 meses');
      } else {
        var y = m * 12 * 0.85;
        set(1, P(s + y), 'Puesta en marcha ' + P(s) + ' + 12 meses juntos ' + P(y));
        set(2, P(y) + ' por año', 'Se paga por año. El plan anual no tiene devolución.');
        set(3, P(m * 12 * 0.15), 'Lo que ahorrás en el año frente al pago mensual');
      }
      calc.querySelector('.wa').href = WA + encodeURIComponent('Hola Growi, quiero consultar por el plan ' + k + ' de GrowiApp' + (an ? ' con pago anual' : '') + '.\n\n(ref: app-calculadora)');
      calc.querySelector('.pn').textContent = k;
      calc.querySelector('#v3c3 small').textContent = an ? 'Ahorro con pago anual' : 'Primer año';
    };
    calc.addEventListener('change', paint);
    document.addEventListener('growi:currency', paint);
    document.addEventListener('click', function (e) { if (e.target.closest('#btnMonthly,#btnAnnual')) setTimeout(paint, 0); });
    paint();
  }
})();
