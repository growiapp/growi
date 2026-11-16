/* Pestañas de planes de GrowiWeb: landing page o sitio institucional, una vista a la vez (sin JS se ven las dos). */
(function () {
  'use strict';

  // ── Planes: landing page o sitio institucional (una vista a la vez; sin JS se ven las dos) ──
  document.querySelectorAll('[data-plan-tabs]').forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('data-panel')); });
    function select(i, focus, anim) {
      tabs.forEach(function (t, j) { t.setAttribute('aria-selected', j === i ? 'true' : 'false'); t.tabIndex = j === i ? 0 : -1; });
      panels.forEach(function (p, j) { p.hidden = j !== i; });
      if (anim) { panels[i].classList.remove('is-in'); void panels[i].offsetWidth; panels[i].classList.add('is-in'); }
      if (focus) tabs[i].focus();
    }
    function fromHash() { var i = panels.findIndex(function (p) { return '#' + p.id === location.hash; }); if (i >= 0) { select(i, false, true); panels[i].scrollIntoView(); } }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i, false, true); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = tabs.length;
        if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); select((i + 1) % n, true, true); }
        else if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); select((i - 1 + n) % n, true, true); }
        else if (k === 'Home') { e.preventDefault(); select(0, true, true); }
        else if (k === 'End') { e.preventDefault(); select(n - 1, true, true); }
      });
    });
    select(0, false); fromHash();
    window.addEventListener('hashchange', fromHash);
  });
})();
