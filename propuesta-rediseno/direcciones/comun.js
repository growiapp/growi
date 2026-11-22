/* Direcciones creativas: comportamiento compartido (el diseño de cada una vive en su propio CSS/HTML).
   Depende de shared.fx.js (tipo de cambio) y shared.js (selector de moneda #btnARS/#btnUSD, evento growi:currency). */
(function () {
  var WA = 'https://wa.me/5491170593877?text=';
  var fx = (window.GROWI_FX && window.GROWI_FX.venta) || 1535;
  var cur = function () { return document.documentElement.dataset.currency === 'USD' ? 'USD' : 'ARS'; };

  /* ---- importes: los mismos que producción (USD fijo; ARS = USD × dólar, al millar desde $100.000 y a la centena por debajo).
          Todo total se arma SUMANDO las partes ya redondeadas que ve la persona, así nunca difiere de la cuenta que hace con el ojo. ---- */
  function arsN(usd) { var v = usd * fx, paso = v >= 100000 ? 1000 : 100; return Math.round(v / paso) * paso; }
  function num(usd) { return cur() === 'ARS' ? arsN(usd) : Math.round(usd * 100) / 100; }
  function fmt(n) {
    if (cur() === 'ARS') return '$' + n.toLocaleString('es-AR') + ' ARS';
    return 'USD ' + (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
  }
  window.growiDir = { num: num, fmt: fmt };

  /* ---- calculadora de GrowiApp: [data-calc] ---- */
  document.querySelectorAll('[data-calc]').forEach(function (root) {
    var plans = { Start: [15, 49], Pro: [29, 149], Multi: [49, 249] };
    var per = 'm';
    var out = function (k, a, b, label) { var n = root.querySelector('[data-out="' + k + '"]'); n.querySelector('[data-v]').textContent = a; n.querySelector('[data-d]').textContent = b; if (label) n.querySelector('[data-l]').textContent = label; };
    function paint() {
      var p = root.querySelector('[data-plan]'); var k = p.value, m = plans[k][0], s = plans[k][1];
      var sN = num(s), mN = num(m);
      if (per === 'm') {
        out('1', fmt(sN + mN), 'Puesta en marcha ' + fmt(sN) + ' + un mes de abono ' + fmt(mN), 'Para empezar');
        out('2', fmt(mN) + ' por mes', 'Desde el segundo mes. Sin permanencia.', 'Después');
        out('3', fmt(sN + mN * 12), 'Primer año: ' + fmt(sN) + ' + 12 meses de ' + fmt(mN), 'Primer año');
      } else {
        var yN = num(m * 12 * 0.85), save = mN * 12 - yN;
        out('1', fmt(sN + yN), 'Puesta en marcha ' + fmt(sN) + ' + el año completo ' + fmt(yN), 'Para empezar');
        out('2', fmt(yN) + ' por año', 'Se paga por año. El plan anual no tiene devolución.', 'Cada año');
        out('3', fmt(save), 'Lo que ahorrás en el año frente a 12 pagos mensuales de ' + fmt(mN), 'Ahorro con pago anual');
      }
      var a = root.querySelector('[data-wa]');
      a.href = WA + encodeURIComponent('Hola Growi, quiero consultar por el plan ' + k + ' de GrowiApp' + (per === 'a' ? ' con pago anual' : '') + '.\n\n(ref: direccion-calculadora)');
      root.querySelectorAll('[data-per]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.per === per); });
      root.querySelectorAll('[data-mirror]').forEach(function (e) { e.textContent = root.querySelector('[data-out="' + e.dataset.mirror + '"] [data-d]').textContent; });
    }
    root.addEventListener('change', paint);
    root.addEventListener('click', function (e) { var b = e.target.closest('[data-per]'); if (b) { per = b.dataset.per; paint(); } });
    document.addEventListener('growi:currency', paint);
    paint();
  });

  /* ---- importes sueltos [data-usd] (se pintan con la misma regla) ---- */
  function paintAll() { document.querySelectorAll('[data-usd]').forEach(function (e) { e.textContent = fmt(num(+e.dataset.usd)); }); }
  document.addEventListener('growi:currency', paintAll); paintAll();

  /* ---- marco con la demo real: [data-frame] escala el iframe de escritorio al ancho disponible; [data-w] cambia entre escritorio y celular ---- */
  document.querySelectorAll('[data-frame]').forEach(function (box) {
    var f = box.querySelector('iframe'), W = +box.dataset.vw || 1280, H = +box.dataset.h || 760, mode = 'd';
    function fit() {
      var cw = box.clientWidth, narrow = cw < 700, mm = mode === 'm' || narrow, w = mm ? Math.min(390, cw) : W, sc = mm ? 1 : Math.min(1, cw / W);
      f.style.width = w + 'px'; f.style.height = (mm ? H : H / sc) + 'px';
      f.style.transform = 'scale(' + sc + ')'; f.style.transformOrigin = mm ? 'top center' : 'top left';
      f.style.marginLeft = mm ? Math.max(0, (cw - w) / 2) + 'px' : '0';
      box.style.height = H + 'px';
    }
    window.addEventListener('resize', fit); fit();
    var ctl = box.closest('.w').querySelectorAll('[data-w]');
    ctl.forEach(function (b) { b.addEventListener('click', function () { mode = b.dataset.w; ctl.forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); fit(); }); });
    var go = box.closest('.w').querySelectorAll('[data-go]');
    /* se desplaza SOLO el documento del marco: un #ancla en el src haría saltar también la página que lo contiene */
    function jump(id) { try { var el = f.contentDocument.getElementById(id); if (el) f.contentWindow.scrollTo(0, el.getBoundingClientRect().top + f.contentWindow.scrollY - 70); } catch (e) {} }
    f.addEventListener('load', function () { if (box.dataset.start) jump(box.dataset.start); });
    go.forEach(function (b) { b.addEventListener('click', function () { jump(b.dataset.go); go.forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); }); });
  });

  /* ---- menú móvil mínimo ---- */
  var mb = document.querySelector('[data-menu-btn]'), nav = document.querySelector('[data-nav]');
  if (mb && nav) { mb.addEventListener('click', function () { var o = nav.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) { nav.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); } }); }
})();
