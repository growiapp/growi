/* Growi 360° R3.6: escenas autónomas. Una secuencia por escena, en bucle, que arranca sola al entrar en pantalla.
   Sin dependencias. Con movimiento reducido (sin clase «mo» en <html>) se muestra el estado final, útil y estático. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var mo = document.documentElement.classList.contains("mo");
  var IO = "IntersectionObserver" in window;
  var PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>', PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg>';

  function fmt(v, kind, dec) {
    var s = (dec ? v.toFixed(dec) : String(Math.round(v))).split(".");
    s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    s = s.join(",");
    return kind === "ars" ? "$" + s : s;
  }
  function count(el, from, to, kind, dec) {
    cancelAnimationFrame(el._r);
    if (!mo) { el.textContent = fmt(to, kind, dec); return; }
    var t0 = null, d = 1100;
    (function step(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(from + (to - from) * e, kind, dec);
      if (k < 1) el._r = requestAnimationFrame(step);
    })(performance.now());
  }

  function scene(c) {
    var n = +c.getAttribute("data-beats") || 0, ms = +c.getAttribute("data-ms") || 1900, hold = +c.getAttribute("data-hold") || 2600;
    var cyc = +c.getAttribute("data-cycle") || 0, fin = +c.getAttribute("data-static") || n;
    var els = $$("[data-in]", c), lin = $$("[data-lin]", c), nums = $$("[data-num]", c), pp = $("[data-sc-pp]", c);
    var i = 0, t = 0, vis = false, paused = false;
    c.classList.add("js");

    function off(e) { var p = e.parentElement, g = p && p.closest("[data-off]"); return g ? +g.getAttribute("data-off") : 0; }
    function run() { c.classList.toggle("run", mo && vis && !paused && !document.hidden); }

    function set(b) {
      i = b; c.setAttribute("data-beat", b);
      var lb = cyc ? ((b - 1) % cyc) + 1 : b; c.setAttribute("data-lb", lb);
      els.forEach(function (e) {
        var p = e.getAttribute("data-in").split("-"), l = b - off(e), a = +p[0], z = p[1] ? +p[1] : 1e9, on = l >= a && l <= z;
        e.classList.toggle("on", on); e.classList.toggle("now", on && l === a);
      });
      lin.forEach(function (e) { var k = +e.getAttribute("data-lin"); e.classList.toggle("on", lb >= k); e.classList.toggle("now", lb === k); });
      nums.forEach(function (e) {
        var a = e.getAttribute("data-num").split("|"), from = +a[0], to = +a[1], at = +a[3] || 1, dec = +a[4] || 0, go = lb >= at;
        if (go) { if (!e._on) { e._on = 1; count(e, from, to, a[2], dec); } }
        else { e._on = 0; cancelAnimationFrame(e._r); e.textContent = fmt(from, a[2], dec); }
      });
    }
    function ui() {
      if (!pp) return;
      pp.setAttribute("data-state", paused ? "play" : "pause"); pp.setAttribute("aria-label", paused ? "Seguir la animación" : "Pausar la animación");
      pp.innerHTML = (paused ? PLAY : PAUSE) + "<span>" + (paused ? "Seguir" : "Pausar") + "</span>";
    }
    function tick() {
      clearTimeout(t); run();
      if (!n || !vis || paused || !mo || document.hidden) return;
      t = setTimeout(function () { set(i >= n ? 1 : i + 1); tick(); }, i >= n ? hold : ms);
    }

    if (n) set(mo ? 1 : fin);
    if (pp) { pp.addEventListener("click", function () { paused = !paused; c.classList.toggle("paused", paused); ui(); tick(); }); ui(); }
    if (!mo && pp) pp.hidden = true;
    var first = true;
    if (IO) new IntersectionObserver(function (en) {
      vis = en[0].isIntersecting;
      if (vis && first && n && mo) { first = false; set(1); }
      tick();
    }, { threshold: 0.3 }).observe(c); else { vis = true; tick(); }
    document.addEventListener("visibilitychange", tick);
  }

  $$("[data-sc]").forEach(scene);

  /* Home: el índice de necesidades es una navegación por anclas; marca la fila que se está viendo */
  var nav = $$("[data-need-nav] a");
  if (nav.length && IO) {
    var rows = nav.map(function (a) { return $(a.getAttribute("href")); });
    var o = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) nav.forEach(function (a, k) { a.classList.toggle("on", rows[k] === x.target); }); });
    }, { rootMargin: "-40% 0px -50% 0px" });
    rows.forEach(function (r) { if (r) o.observe(r); });
  }
})();
