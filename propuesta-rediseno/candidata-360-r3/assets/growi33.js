/* Growi 360° R3.3: demostraciones autónomas (historias), recorrido real de GrowiApp y GrowiWeb. Sin dependencias. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var reduce = !document.documentElement.classList.contains("mo"); /* sin movimiento: se muestra el estado final */
  var IO = "IntersectionObserver" in window;
  var PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>', PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg>', AGAIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v4.5h4.5"/></svg>';

  /* controles comunes: un botón que pausa, sigue o repite */
  function setPP(pp, st) {
    if (!pp) return;
    var t = { pause: ["Pausar", PAUSE], play: ["Seguir", PLAY], replay: ["Ver de nuevo", AGAIN] }[st];
    pp.setAttribute("data-state", st); pp.setAttribute("aria-label", t[0]); pp.innerHTML = t[1] + "<span>" + t[0] + "</span>";
  }

  /* ---------- historias (GrowiFlow, Combo): una secuencia con principio, desarrollo y cierre ---------- */
  function story(c) {
    if (c.__mg) return c.__mg;
    var n = +c.getAttribute("data-beats"), ms = +c.getAttribute("data-ms") || 2300, k = 1, timer = 0, vis = false, paused = false, done = false, started = false;
    var pp = $("[data-mg-pp]", c), dots = $$("[data-dot]", c), bar = $("[data-mg-bar]", c);
    c.classList.add("js-mg");
    var show = function (i) {
      k = i;
      $$("[data-b]", c).forEach(function (e) { var b = +e.getAttribute("data-b"); var bn = e.getAttribute("data-bn"); e.classList.toggle("on", b <= i); e.classList.toggle("now", b === i || (bn && (" " + bn + " ").indexOf(" " + i + " ") > -1)); });
      $$("[data-cap-b]", c).forEach(function (e) { e.classList.toggle("now", +e.getAttribute("data-cap-b") === i); });
      dots.forEach(function (d) { var b = +d.getAttribute("data-dot"); d.classList.toggle("on", b <= i); if (b === i) d.setAttribute("aria-current", "step"); else d.removeAttribute("aria-current"); });
      if (bar) bar.style.transform = "scaleX(" + (i / n) + ")";
      c.setAttribute("data-beat", i);
    };
    var ui = function () { setPP(pp, done ? "replay" : paused ? "play" : "pause"); };
    var tick = function () {
      clearTimeout(timer); timer = 0;
      if (!vis || paused || done || reduce) return;
      timer = setTimeout(function () { show(k + 1); if (k >= n) { done = true; ui(); } else tick(); }, ms);
    };
    var restart = function () { done = false; paused = false; show(1); ui(); tick(); };
    var s = {
      kick: function () { if (reduce) return; vis = true; if (!started) { started = true; restart(); } else tick(); },
      restart: function () { started = true; if (reduce) show(n); else restart(); }
    };
    c.__mg = s;
    if (reduce) { show(n); done = true; $$("[data-mg-ctl]", c).forEach(function (e) { e.hidden = true; }); }
    else {
      show(1); ui();
      if (pp) pp.addEventListener("click", function () {
        if (done) restart(); else if (paused) { paused = false; ui(); tick(); } else { paused = true; clearTimeout(timer); ui(); }
      });
      dots.forEach(function (d) { d.addEventListener("click", function () { var i = +d.getAttribute("data-dot"); started = true; paused = true; done = false; clearTimeout(timer); show(i); ui(); }); });
      $$("[data-mg-pick] input", c).forEach(function (r) {
        r.addEventListener("change", function () { $$(".mg-sc", c).forEach(function (e) { e.hidden = e.getAttribute("data-sc") !== r.value; }); started = true; restart(); });
      });
      if (IO) {
        var o = new IntersectionObserver(function (en) { var v = en[0].isIntersecting && c.offsetParent !== null; if (v) s.kick(); else { vis = false; clearTimeout(timer); } }, { threshold: 0, rootMargin: "0px 0px -25% 0px" });
        o.observe(c);
      } else s.kick();
    }
    $$("[data-mg-pick] input", c).forEach(function (r) {
      if (reduce) r.addEventListener("change", function () { $$(".mg-sc", c).forEach(function (e) { e.hidden = e.getAttribute("data-sc") !== r.value; }); });
    });
    return s;
  }
  window.mgStart = function (c) { return story(c).kick(); };
  $$("[data-mg]").forEach(story);

  /* ---------- helpers de recorrido sobre sitios/demos reales (mismo origen) ---------- */
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  /* ---------- GrowiApp: recorrido automático de la interfaz real; la exploración libre queda como modo secundario ---------- */
  $$("[data-apptour]").forEach(function (w) {
    var f = $("iframe", w), cap = $("[data-at-cap]", w), pp = $("[data-mg-pp]", w), dotsBox = $("[data-at-dots]", w), explore = $("[data-at-explore]", w), back = $("[data-at-back]", w);
    var steps = ["resumen", "ventas", "reservas", "caja", "reportes"], i = 0, timer = 0, vis = false, paused = false, done = false, started = false, ready = false, mode = "tour";
    var dots = steps.map(function (s, j) { var b = document.createElement("button"); b.type = "button"; b.setAttribute("data-dot", j + 1); b.setAttribute("aria-label", "Paso " + (j + 1)); b.innerHTML = "<i></i>"; dotsBox.appendChild(b); return b; });
    var doc = function () { try { return f.contentDocument; } catch (e) { return null; } };
    var hideSel = function (on) {
      var d = doc(); if (!d || !d.body) return; var st = d.getElementById("at-style");
      if (on && !st) { st = d.createElement("style"); st.id = "at-style"; st.textContent = ".demo-industry-selector{display:none!important}html,body{overflow:hidden!important}"; d.head.appendChild(st); }
      if (!on && st) st.remove();
    };
    var go = function (j) {
      i = j; var d = doc(), t = steps[j], b = null;
      if (d) { var all = $$('[data-target="' + t + '"]', d); for (var q = 0; q < all.length; q++) if (all[q].offsetParent) { b = all[q]; break; } if (b) b.click(); }
      var sc = d && $('[data-screen="' + t + '"]', d), h = sc && $(".dash-title", sc), p = h && h.nextElementSibling;
      if (cap) cap.innerHTML = "<b>" + (j + 1) + " de " + steps.length + " · " + (h ? h.textContent.trim() : t) + "</b> " + (p ? p.textContent.trim() : "");
      dots.forEach(function (x, y) { x.classList.toggle("on", y <= j); if (y === j) x.setAttribute("aria-current", "step"); else x.removeAttribute("aria-current"); });
      try { f.contentWindow.scrollTo(0, 0); } catch (e) {}
    };
    var ui = function () { setPP(pp, done ? "replay" : paused ? "play" : "pause"); };
    var tick = function () {
      clearTimeout(timer);
      if (!vis || paused || done || reduce || mode !== "tour" || !ready) return;
      timer = setTimeout(function () { if (i + 1 >= steps.length) { done = true; ui(); } else { go(i + 1); tick(); } }, 3300);
    };
    var restart = function () { done = false; paused = false; go(0); ui(); tick(); };
    var setMode = function (m) {
      mode = m; w.classList.toggle("is-explore", m === "explore");
      if (m === "explore") { clearTimeout(timer); hideSel(false); f.setAttribute("scrolling", "no"); if (f.__h) f.style.height = f.__h + "px"; }
      else { f.style.height = ""; hideSel(true); restart(); }
    };
    f.addEventListener("load", function () { ready = true; w.classList.add("ready"); hideSel(mode === "tour"); if (reduce) go(0); else if (started || vis) { started = true; restart(); } });
    try { if (f.contentDocument && f.contentDocument.readyState === "complete" && f.contentWindow.location.href !== "about:blank") { ready = true; w.classList.add("ready"); hideSel(true); } } catch (e) {}
    if (pp) pp.addEventListener("click", function () { if (done) restart(); else if (paused) { paused = false; ui(); tick(); } else { paused = true; clearTimeout(timer); ui(); } });
    dots.forEach(function (d, j) { d.addEventListener("click", function () { started = true; paused = true; done = false; clearTimeout(timer); go(j); ui(); }); });
    if (explore) explore.addEventListener("click", function () { setMode("explore"); });
    if (back) back.addEventListener("click", function () { setMode("tour"); });
    $$("[data-at-rubro]", w).forEach(function (b) {
      b.addEventListener("click", function () {
        var d = doc(), r = b.getAttribute("data-at-rubro"), t = d && $('[data-rubro="' + r + '"]', d); if (t) t.click();
        $$("[data-at-rubro]", w).forEach(function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", String(x === b)); });
        if (mode === "tour") { started = true; restart(); }
      });
    });
    ui();
    if (IO && !reduce) {
      new IntersectionObserver(function (en) { var v = en[0].isIntersecting; vis = v; if (v) { if (!started && ready) { started = true; restart(); } else if (!started) started = true; else tick(); } else clearTimeout(timer); }, { threshold: 0, rootMargin: "0px 0px -20% 0px" }).observe(w);
    }
    if (reduce) { w.classList.add("is-static"); }
  });

  /* ---------- Invitaciones: galería de estilos sobre la demo real; se recorre sola y se puede elegir ---------- */
  $$("[data-invg]").forEach(function (w) {
    var f = $("iframe", w), box = $("[data-ig-pick]", w), pp = $("[data-mg-pp]", w), timer = 0, vis = false, paused = false, cur = 0, btns = [], inner = [], built = false;
    var D = function () { try { return f.contentDocument; } catch (e) { return null; } };
    var ui = function () { setPP(pp, paused ? "play" : "pause"); };
    var opener = 0;
    var sel = function (i, auto) {
      cur = i; if (inner[i]) inner[i].click(); clearTimeout(opener);
      if (auto && !reduce) opener = setTimeout(function () { var d = D(), o = d && $("[data-inv-open]", d); if (o && !paused) o.click(); }, 2600); /* la apertura animada de cada invitación */
      btns.forEach(function (x, j) { x.classList.toggle("on", j === i); x.setAttribute("aria-pressed", String(j === i)); }); };
    var tick = function () { clearTimeout(timer); if (!vis || paused || reduce || !built) return; timer = setTimeout(function () { sel((cur + 1) % inner.length, true); tick(); }, 11000); };
    var build = function () {
      var d = D(); if (!d || built || !d.body) return; inner = $$("[data-event-picker] .exp", d); if (!inner.length) return; built = true;
      var st = d.createElement("style"); st.textContent = ".demo-picker{display:none!important}.demo-reset{background:none!important;border:0!important;box-shadow:none!important;text-decoration:underline;font-size:13px!important;min-height:44px;padding:0 8px!important}"; d.head.appendChild(st);
      inner.forEach(function (b, i) {
        var c = document.createElement("button"); c.type = "button"; c.className = "ig-card"; c.setAttribute("aria-pressed", "false");
        var t = document.createElement("b"); t.textContent = $("strong", b).textContent; var s = document.createElement("small"); s.textContent = $("span", b).textContent.replace(/^En este ejemplo:\s*/, ""); s.textContent = s.textContent.charAt(0).toUpperCase() + s.textContent.slice(1);
        c.appendChild(t); c.appendChild(s); c.addEventListener("click", function () { paused = true; clearTimeout(timer); ui(); sel(i); }); box.appendChild(c); btns.push(c);
      });
      sel(0, true); w.classList.add("ready"); tick();
    };
    f.addEventListener("load", build); try { if (f.contentDocument && f.contentDocument.readyState === "complete" && f.contentWindow.location.href !== "about:blank") build(); } catch (e) {}
    if (pp) pp.addEventListener("click", function () { paused = !paused; ui(); if (!paused) tick(); else clearTimeout(timer); });
    ui(); if (reduce) $$("[data-mg-ctl]", w).forEach(function (e) { e.hidden = true; });
    if (IO) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; if (vis) tick(); else clearTimeout(timer); }, { threshold: 0.2 }).observe(w); else vis = true;
  });

  /* ---------- GrowiWeb: sitios de muestra en composición editorial, con recorrido automático (desplazamiento real de cada sitio) ---------- */
  $$("[data-wt]").forEach(function (w) {
    var views = $$(".wt-view", w), base = w.getAttribute("data-base"), op = $("[data-wt-open]", w), pp = $("[data-mg-pp]", w), cap = $("[data-wt-cap]", w), sec = $("[data-wt-sec]", w);
    var explore = $("[data-wt-explore]", w), back = $("[data-wt-back]", w);
    var vis = false, paused = false, mode = "tour", raf = 0, started = false;
    var fit = function () {
      views.forEach(function (v) {
        var dw = +v.getAttribute("data-w"), dh = +v.getAttribute("data-h"), s = v.clientWidth / dw, f = $("iframe", v);
        f.style.width = dw + "px"; f.style.height = dh + "px"; f.style.transform = "scale(" + s + ")"; v.style.height = Math.round(dh * s) + "px";
      });
    };
    var loadVisible = function () { views.forEach(function (v) { var f = $("iframe", v); if (v.offsetParent && !f.getAttribute("src")) f.src = f.getAttribute("data-src"); }); };
    var fitAll = fit; fit = function () { fitAll(); if (started) loadVisible(); };
    fit(); if (window.ResizeObserver) new ResizeObserver(fit).observe(w); else window.addEventListener("resize", fit);
    var doc = function (v) { try { return $("iframe", v).contentDocument; } catch (e) { return null; } };
    /* mediciones en cache por sitio: se rehacen solo si el contenido del iframe cambia de tamaño (carga, imágenes, tipografías) */
    var measure = function (v) {
      if (v.__m) return v.__m;
      var f = $("iframe", v), d = doc(v), win = f.contentWindow; if (!d || !d.documentElement) return null;
      var heads = [];
      $$("main h2, h2", d).forEach(function (h) { var tx = h.textContent.trim(); if (tx) heads.push({ y: h.getBoundingClientRect().top + win.scrollY, t: tx }); });
      return (v.__m = { max: Math.max(0, d.documentElement.scrollHeight - (+v.getAttribute("data-h"))), heads: heads });
    };
    views.forEach(function (v) {
      var f = $("iframe", v);
      f.addEventListener("load", function () {
        v.classList.add("ready"); v.__m = null;
        try { var win = f.contentWindow; if (win.ResizeObserver) new win.ResizeObserver(function () { v.__m = null; }).observe(win.document.documentElement); } catch (e) {}
      });
    });
    var run = function () {
      cancelAnimationFrame(raf); if (!vis || paused || mode !== "tour" || reduce) return;
      var t0 = 0, cycle = 16000, lastSec = -1e9;
      var step = function (ts) {
        if (!vis || paused || mode !== "tour") return;
        if (!t0) t0 = ts; var t = ((ts - t0) % cycle) / cycle; /* 0..1: baja 0-.7, espera .7-.8, vuelve .8-1 */
        var p = t < 0.7 ? ease(t / 0.7) : t < 0.8 ? 1 : 1 - ease((t - 0.8) / 0.2);
        var upd = ts - lastSec >= 250; if (upd) lastSec = ts; /* el rótulo de sección se actualiza a ~4 Hz */
        views.forEach(function (v, vi) {
          if (!v.offsetParent) return; var m = measure(v); if (!m) return;
          var q = vi ? Math.min(1, Math.max(0, p * 1.1 - 0.05)) : p, y = Math.round(m.max * q);
          try { $("iframe", v).contentWindow.scrollTo(0, y); } catch (e) {}
          if (!vi && sec && upd) { var cur = "", yy = m.max * q + 220; m.heads.forEach(function (h) { if (h.y <= yy) cur = h.t; }); if (cur && sec.textContent !== cur) sec.textContent = cur; }
        });
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    var ui = function () { setPP(pp, paused ? "play" : "pause"); };
    var setMode = function (m) {
      mode = m; w.classList.toggle("is-explore", m === "explore"); cancelAnimationFrame(raf);
      views.forEach(function (v) { var f = $("iframe", v); f.tabIndex = m === "explore" ? 0 : -1; if (m === "tour") { try { f.contentWindow.scrollTo(0, 0); } catch (e) {} } });
      if (m === "tour") run();
    };
    var start = function () { started = true; loadVisible(); setTimeout(run, 900); };
    if (IO) new IntersectionObserver(function (en) { var v = en[0].isIntersecting; vis = v; if (v) { if (!started) start(); else run(); } else cancelAnimationFrame(raf); }, { rootMargin: "0px 0px -15% 0px" }).observe(w); else { vis = true; start(); }
    if (pp) pp.addEventListener("click", function () { paused = !paused; ui(); if (!paused) run(); else cancelAnimationFrame(raf); });
    if (explore) explore.addEventListener("click", function () { setMode("explore"); });
    if (back) back.addEventListener("click", function () { setMode("tour"); });
    $$("[data-wt-demo]", w).forEach(function (b) {
      b.addEventListener("click", function () {
        var d = b.getAttribute("data-wt-demo"), ribera = d === "centro-ribera";
        cancelAnimationFrame(raf);
        views.forEach(function (v) { var f = $("iframe", v); v.classList.toggle("nop", !ribera); v.classList.remove("ready"); f.src = base + d + "/index.html"; });
        w.setAttribute("data-site", d); if (op) op.href = base + d + "/index.html";
        $$("[data-wt-demo]", w).forEach(function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", String(x === b)); });
        if (cap) cap.textContent = b.getAttribute("data-desc") || "";
        if (sec) sec.textContent = "";
        setTimeout(run, 1400);
      });
    });
    ui(); if (reduce) { w.classList.add("is-static"); $$("[data-mg-ctl]", w).forEach(function (e) { e.hidden = true; }); }
  });
})();
