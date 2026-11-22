/* Demos de GrowiWeb. Las acciones de la demo (pedir turno, reservar) no completan ninguna operación:
   llevan al bloque «Sobre esta demo», que explica qué pasaría en un sitio real y ofrece la consulta a Growi.
   Sin JavaScript, el enlace salta igualmente a ese bloque. */
(function () {
  'use strict';
  // La cabecera del sitio de ejemplo se pega justo debajo de la barra de Growi, sea cual sea su alto
  var bar = document.querySelector('.demo-top');
  function setH() { if (bar) document.documentElement.style.setProperty('--demo-h', bar.offsetHeight + 'px'); }
  setH(); window.addEventListener('resize', setH);
  var note = document.getElementById('sobre-la-demo');
  var h = note && note.querySelector('h2');
  document.querySelectorAll('a[href="#sobre-la-demo"]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (!note) return;
      if (h) { h.setAttribute('tabindex', '-1'); setTimeout(function () { h.focus({ preventScroll: true }); }, 350); }
      note.classList.remove('is-hit'); void note.offsetWidth; note.classList.add('is-hit');
    });
  });
  // Mismo evento que el resto del sitio, solo para los enlaces de WhatsApp de la demo
  document.addEventListener('click', function (e) {
    var l = e.target.closest && e.target.closest('a[href*="wa.me/"]');
    if (l && typeof window.plausible === 'function') window.plausible('cta_whatsapp', { props: { location: l.getAttribute('data-track') || 'whatsapp' } });
  });
})();
