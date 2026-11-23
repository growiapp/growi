/* F8.9B · motor de secuencias de las demostraciones (Home e Invitaciones).
   Nar({timeline:[[ms, estado], …], total, init, stable:[estado,…], render(S), pp, nav, autoplay}) → { go(i), toggle(), S }
   - Reproduce la línea de tiempo en bucle mientras se ve, la pestaña está visible y el movimiento está permitido.
   - Tocar un paso = toma el control y muestra el estado ESTABLE de ese paso (mismo estado siempre, sin importar de dónde se venga).
   - Pausa/reanudación conserva la posición. Con movimiento reducido no hay reproducción automática. */
(function () {
  "use strict";
  /* misma regla que el script del <head> del sitio: la preferencia de la persona (cr_motion) manda; si no hay, la del sistema */
  function motionOk() {
    var o = null; try { o = localStorage.getItem("cr_motion"); } catch (e) {}
    var r = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)").matches : false;
    return o === "on" || (o !== "off" && !r);
  }
  window.Nar = function (c) {
    var armed = c.autoplay !== false, S = Object.assign({}, c.init), hs = [], t0 = 0, pos = 0, running = false, manual = false, paused = false, visible = true;
    var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
    var pp = c.pp, nav = c.nav, root = c.root;
    function ok() { return motionOk(); }
    function clear() { hs.forEach(clearTimeout); hs = []; }
    function put(p) { Object.assign(S, p); c.render(S); }
    function play() {
      clear(); if (!armed || manual || paused || !visible || document.hidden || !ok()) { running = false; return; }
      running = true; t0 = Date.now() - pos;
      c.timeline.forEach(function (e) { if (e[0] >= pos) hs.push(setTimeout(function () { put(e[1]); }, e[0] - pos)); });
      if (c.stage) hs.push(setTimeout(function () { c.stage.style.transition = "opacity .4s"; c.stage.style.opacity = "0"; }, Math.max(0, c.total - 450 - pos)));
      hs.push(setTimeout(function () {
        pos = 0; if (c.stage) root.classList.add("nar-nt"); play();
        if (c.stage) setTimeout(function () { root.classList.remove("nar-nt"); c.stage.style.opacity = "1"; }, 120);
      }, Math.max(0, c.total - pos)));
    }
    function halt() { if (running) pos = Date.now() - t0; clear(); running = false; if (c.stage) { c.stage.style.transition = "opacity .2s"; c.stage.style.opacity = "1"; } }
    function ctl() {
      if (!pp) return; pp.hidden = manual || !ok(); pp.classList.toggle("is-p", paused);
      pp.setAttribute("aria-label", paused ? "Reproducir animación" : "Pausar animación");
    }
    function go(i) { manual = true; halt(); ctl(); put(c.stable[i]); }
    if (nav) [].forEach.call(nav.querySelectorAll("[data-i]"), function (b) { b.addEventListener("click", function () { go(+b.getAttribute("data-i")); }); });
    if (pp) pp.addEventListener("click", function () { paused = !paused; if (paused) halt(); else play(); ctl(); });
    if (root && "IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) play(); else halt(); }, { threshold: 0.25 }).observe(root);
    document.addEventListener("visibilitychange", function () { if (document.hidden) halt(); else play(); });
    function mqc() { if (!ok()) { halt(); put(manual ? S : c.stable[0]); } else if (!manual) { pos = 0; play(); } ctl(); }
    if (mq.addEventListener) mq.addEventListener("change", mqc);
    put(c.init); ctl(); play();
    function restart() { armed = true; manual = false; paused = false; halt(); pos = 0; ctl(); play(); }
    return { go: go, S: S, put: put, restart: restart, estado: function () { return { manual: manual, paused: paused, running: running, pos: pos }; } };
  };
  window.Nar.motionOk = motionOk;
})();
