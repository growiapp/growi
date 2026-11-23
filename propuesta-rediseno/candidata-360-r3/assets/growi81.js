/* F8.1A · barra fija de WhatsApp. Se oculta: al bajar, cuando un control de la página tiene foco y cuando taparía un título, un precio o un control.
   Reaparece al subir si no hay nada debajo. No toca la lógica de shared.js (que además la oculta en héroes, planes, demos y cierres). */
(function () {
  var s = document.querySelector('.sticky-cta'); if (!s) return;
  var y = window.scrollY, tick = false;
  var SEL = 'main a[href],main button,main summary,main input,main select,main textarea,main [data-price],main h1,main h2,main h3,main .t-total';
  function ocupa() {
    if (s.classList.contains('hid') || !s.classList.contains('show')) { s.classList.remove('occ'); return; }
    var h = s.offsetHeight || 64, top = window.innerHeight - h, hit = false, els = document.querySelectorAll(SEL);
    for (var i = 0; i < els.length && !hit; i++) {
      var b = els[i].getBoundingClientRect();
      if (b.height && b.bottom > top && b.top < window.innerHeight && b.right > 0 && b.left < window.innerWidth) hit = true;
    }
    s.classList.toggle('occ', hit);
  }
  addEventListener('scroll', function () {
    var n = window.scrollY;
    if (Math.abs(n - y) >= 8) { s.classList.toggle('hid', n > y); y = n; }
    if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; ocupa(); }); }
  }, { passive: true });
  new MutationObserver(function () { if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; ocupa(); }); } }).observe(s, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('focusin', function (e) {
    if (e.target.closest && e.target.closest('main') && !e.target.closest('.sticky-cta')) s.classList.add('hid');
  });
})();
