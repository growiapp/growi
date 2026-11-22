/* Territorios creativos: importes compartidos. Mismos valores que producción (USD fijos; ARS = USD × dólar de shared.fx.js,
   redondeado al millar desde $100.000 y a la centena por debajo). Los totales se arman sumando las partes ya redondeadas. */
(function () {
  var fx = (window.GROWI_FX && window.GROWI_FX.venta) || 1535;
  var cur = 'ARS';
  try { cur = localStorage.getItem('growi_currency') === 'USD' ? 'USD' : 'ARS'; } catch (e) {}
  function arsN(usd) { var v = usd * fx, p = v >= 100000 ? 1000 : 100; return Math.round(v / p) * p; }
  function num(usd) { return cur === 'ARS' ? arsN(usd) : Math.round(usd * 100) / 100; }
  function fmt(n) { return cur === 'ARS' ? '$' + n.toLocaleString('es-AR') + ' ARS' : 'USD ' + (Number.isInteger(n) ? n : n.toFixed(2).replace('.', ',')); }
  function paint() {
    document.querySelectorAll('[data-usd]').forEach(function (e) { e.textContent = fmt(num(+e.dataset.usd)); });
    document.querySelectorAll('[data-sum]').forEach(function (e) { e.textContent = fmt(e.dataset.sum.split(',').reduce(function (a, u) { return a + num(+u); }, 0)); });
    document.querySelectorAll('[data-cur]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.cur === cur); });
    document.dispatchEvent(new CustomEvent('growi:precios', { detail: cur }));
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cur]'); if (!b) return; cur = b.dataset.cur;
    try { localStorage.setItem('growi_currency', cur); } catch (x) {}
    paint();
  });
  window.growiP = { num: num, fmt: fmt, cur: function () { return cur; }, paint: paint, ars: arsN };
  document.addEventListener('DOMContentLoaded', paint);
})();
