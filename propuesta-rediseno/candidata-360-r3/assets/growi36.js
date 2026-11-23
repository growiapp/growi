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

/* R3.8 Invitaciones: explorador de capacidades (pestañas con teclado; sin autoavance) */
(function () {
  var w = document.querySelector("[data-ic]"); if (!w) return;
  var tabs = [].slice.call(w.querySelectorAll('[role="tab"]')), pans = [].slice.call(w.querySelectorAll('[role="tabpanel"]')), desc = w.querySelector(".ic-desc");
  w.classList.add("ic-js");
  function sel(i, focus) {
    tabs.forEach(function (t, j) { var on = j === i; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; pans[j].classList.toggle("on", on); });
    if (desc) desc.textContent = tabs[i].getAttribute("data-d") || "";
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { sel(i); });
    t.addEventListener("keydown", function (e) {
      var k = e.key, d = (k === "ArrowDown" || k === "ArrowRight") ? 1 : (k === "ArrowUp" || k === "ArrowLeft") ? -1 : 0;
      if (k === "Home") { e.preventDefault(); sel(0, true); } else if (k === "End") { e.preventDefault(); sel(tabs.length - 1, true); }
      else if (d) { e.preventDefault(); sel((i + d + tabs.length) % tabs.length, true); }
    });
  });
  var r = w.querySelector("button.ic-go"); if (r) r.addEventListener("click", function () { r.closest(".ic-p").classList.toggle("sent"); });
})();

/* Home · hero «Te encuentran → Te consultan → Lo organizás» (F8.3B, F8.4R).
   Un estado, tres pasos. La reproducción automática existe solo si la escena tiene DISPOSICIÓN DE ESCRITORIO (ancho de la escena ≥ 520 px: el mismo umbral que
   `@container hs (min-width:520px)` en growi36.css), el movimiento está permitido y la persona no tomó el control. Se vuelve a evaluar al cambiar el tamaño
   de la escena (ResizeObserver) y al cambiar la preferencia de movimiento reducido: no depende del ancho inicial.
   Decisiones de la persona: tocar un paso o un botón de la escena = manual para siempre (no vuelve a reproducirse sola); pausar se respeta al volver a escritorio.
   El turno solo se anota con el botón «Anotar turno». */
(function () {
  "use strict";
  var root = document.querySelector("[data-hs]");
  if (!root) return;
  var $ = function (s) { return root.querySelector(s); };
  var steps = [].slice.call(root.querySelectorAll("[data-hs-s]"));
  var board = $("[data-hs-board]"), cap = $("[data-hs-cap]"), pp = $("[data-hs-pp]"), doBtn = $("[data-hs-do]"), slot = $("[data-hs-slot]"), slotx = $("[data-hs-slotx]"), note = $("[data-hs-note]");
  var site = $("[data-hs-site]"), chat = $("[data-hs-chat]"), devl = $("[data-hs-devl]"), agp = $("[data-hs-agp]");
  var CAP = ["Una persona encuentra tu sitio y toca «Pedir turno».", "Te escribe por WhatsApp con su consulta.", "Vos respondés, acordás el horario y lo anotás en tu agenda."];
  var MIN = 520;   // px de la escena: debe coincidir con @container hs (min-width:520px)
  var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  var S = 1, done = false, press = false, timer = null, auto = false, paused = false, manual = false, visible = true, q = 0;
  var SEQ = [[1, 0, 0, 2200], [2, 0, 0, 2600], [3, 0, 0, 2600], [3, 0, 1, 900], [3, 1, 0, 3600]];   // paso, anotado, pulsando, ms
  // misma regla que el script del <head> (cr_motion manda; si no, la preferencia del sistema), pero evaluada en el momento
  function motionOk() { var o = null; try { o = localStorage.getItem("cr_motion"); } catch (e) {} return o === "on" || (o !== "off" && !mq.matches); }
  function wide() { return root.getBoundingClientRect().width >= MIN; }
  function render() {
    site.classList.toggle("on", S === 1); chat.classList.toggle("on", S >= 2);
    devl.textContent = S === 1 ? "Sitio de Centro Ribera" : "WhatsApp de Centro Ribera";
    board.classList.toggle("hs-b3", S === 3); root.classList.toggle("hs-press", press);
    steps.forEach(function (b) { if (+b.getAttribute("data-hs-s") === S) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
    cap.textContent = S === 3 && done ? "Listo: el turno quedó anotado en tu agenda." : CAP[S - 1];
    slot.classList.toggle("ok", done); slotx.className = done ? "" : "lib"; slotx.innerHTML = done ? "<b>Julián</b><small>Primera consulta · rodilla</small>" : "Libre";
    doBtn.setAttribute("aria-disabled", done ? "true" : "false"); doBtn.firstChild.nodeValue = done ? "Turno anotado" : "Anotar turno de Julián";
    note.textContent = done ? "Anotado por el centro, a mano." : "Lo anota una persona del centro.";
    agp.inert = S !== 3;   // fuera del paso 3 la agenda es solo contexto: no recibe foco ni toques
  }
  function go(n, d) { S = n; done = !!d; press = false; render(); }
  function clearTimer() { clearTimeout(timer); timer = null; }
  function tick() {
    var e = SEQ[q]; S = e[0]; done = !!e[1]; press = !!e[2]; render();
    timer = setTimeout(function () { timer = null; q = (q + 1) % SEQ.length; tick(); }, e[3]);
  }
  // programa (o detiene) el temporizador según el estado actual; es idempotente: no reinicia un paso que ya está corriendo
  function run() { if (!auto || paused || !visible || document.hidden) { clearTimer(); return; } if (timer === null) tick(); }
  // el control de pausa y el anuncio de la leyenda siguen al modo; si el control tenía el foco y se oculta, el foco pasa al paso actual (nunca se pierde)
  function ctl() {
    if (!auto && document.activeElement === pp) { var cur = $("[data-hs-s][aria-current]"); if (cur) cur.focus({ preventScroll: true }); }
    pp.hidden = !auto; cap.setAttribute("aria-live", auto ? "off" : "polite");
    pp.classList.toggle("is-paused", paused); pp.setAttribute("aria-label", paused ? "Reproducir animación" : "Pausar animación");
  }
  // Fuente única de verdad: la reproducción automática es (escritorio ∧ movimiento permitido ∧ no manual). Se llama al cargar y en cada cambio relevante.
  function sync() {
    var debe = !manual && motionOk() && wide();
    if (debe && !auto) { auto = true; q = 0; }                                         // vuelve a escritorio: ciclo nuevo; una pausa del usuario se conserva
    else if (!debe && auto) { auto = false; clearTimer(); press = false; render(); }   // pasa a móvil o a movimiento reducido: se detiene y queda un estado válido
    ctl(); run();
  }
  function manualStop() { manual = true; auto = false; clearTimer(); press = false; ctl(); }   // la persona toma el control
  steps.forEach(function (b) { b.addEventListener("click", function () { manualStop(); go(+b.getAttribute("data-hs-s"), false); }); });
  $("[data-hs-cta1]").addEventListener("click", function () { manualStop(); go(2, false); });
  doBtn.addEventListener("click", function () { if (done) return; manualStop(); done = true; press = false; render(); });
  pp.addEventListener("click", function () { if (!auto) return; paused = !paused; ctl(); run(); });
  render();
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; run(); }, { threshold: 0.2 }).observe(root);
  document.addEventListener("visibilitychange", run);
  if ("ResizeObserver" in window) new ResizeObserver(sync).observe(root); else window.addEventListener("resize", sync);   // la disposición manda, no el ancho inicial
  if (mq.addEventListener) mq.addEventListener("change", sync); else if (mq.addListener) mq.addListener(sync);
  sync();
  window.GrowiHeroStory = { go: go, stop: manualStop, estado: function () { return { auto: auto, pausado: paused, manual: manual, temporizador: timer !== null, escritorio: wide(), movimiento: motionOk() }; } };   // solo para pruebas
})();
