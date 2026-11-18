/* Growi 360° · candidata local. Se apoya en shared.js del sitio (menú, moneda, medición, botón fijo) y shared.fx.js (tipo de cambio).
   Aporta: armador de consulta, ticket que se imprime, marcador, período anual, pestañas. Sin dependencias. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduce = !root.classList.contains("mo");
  var sysReduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var IO = "IntersectionObserver" in window;
  var cur = function () { return root.dataset.currency === "USD" ? "USD" : "ARS"; };
  var price = function (usd, short) { return typeof window.growiPrice === "function" ? window.growiPrice(usd, cur(), !!short) : "USD " + usd; };

  /* control de movimiento: respeta el sistema; el botón permite activarlo (los navegadores de prueba lo reportan reducido) */
  (function () {
    var host = $("[data-motion]"); if (!host) return;
    var b = document.createElement("button"); b.type = "button"; b.className = "mot-toggle";
    b.textContent = reduce ? "Activar animaciones" : (sysReduce ? "Reducir animaciones" : "");
    if (!b.textContent) return;
    b.addEventListener("click", function () { try { localStorage.setItem("cr_motion", reduce ? "on" : "off"); } catch (e) {} location.reload(); });
    host.appendChild(b);
  })();

  /* marcador: barre una vez, como un resaltador */
  $$("mark.sweep").forEach(function (m) {
    if (reduce || !IO) return;
    var o = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { o.disconnect(); m.classList.add("go"); } }, { threshold: 0.6 });
    o.observe(m);
  });

  /* ticket que se imprime: cada línea del presupuesto entra en orden al llegar a la pantalla */
  $$(".print-in").forEach(function (t) {
    $$(".t-lines li", t).forEach(function (li, i) { li.style.setProperty("--i", i); });
    if (reduce || !IO) return;
    t.classList.add("arm");
    var o = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { o.disconnect(); t.classList.add("printed"); } }, { threshold: 0.35 });
    o.observe(t);
  });

  /* armador de consulta (home): sin envío ni pago; arma el mensaje de WhatsApp con lo elegido */
  var ch = $("[data-chooser]");
  if (ch) {
    var print = $("[data-print]", ch), cta = $("[data-cta]", ch), prev = {};
    var checks = $$('input[name="linea"]', ch), webSub = $("[data-websub]", ch), flowSub = $("[data-flowsub]", ch);
    var wa = "https://wa.me/5491170593877?text=";
    var render = function (anim) {
      var sel = {}; checks.forEach(function (c) { sel[c.value] = c.checked; });
      var tipo = ($('input[name="webtipo"]:checked', ch) || {}).value || "l";
      if (webSub) webSub.hidden = !sel.web;
      if (flowSub) flowSub.hidden = !sel.flow;
      var lines = [], once = 0, month = 0, labels = [];
      if (sel.app) {
        labels.push("GrowiApp");
        month += 15; lines.push({ k: "app", n: "GrowiApp Start", v: price(15, true) + "/mes" });
        if (sel.web) lines.push({ k: "setup", n: "Puesta en marcha", v: "sin cargo", neg: 1, sub: "Con el combo. Sola: " + price(49, true) });
        else { once += 49; lines.push({ k: "setup", n: "Puesta en marcha", v: price(49, true) }); }
      }
      if (sel.web) {
        var base = tipo === "i" ? 550 : 200, w = sel.app ? base * 0.9 : base;
        labels.push("GrowiWeb " + (tipo === "i" ? "(sitio institucional)" : "(landing page)"));
        once += w; lines.push({ k: "web" + tipo + (sel.app ? "c" : ""), n: (tipo === "i" ? "Sitio institucional" : "Landing Express") + " (desde)", v: price(w, true), sub: sel.app ? "Combo −10%. Sin combo: " + price(base, true) : "" });
      }
      if (sel.flow) {
        var ft = ($('input[name="flowtipo"]:checked', ch) || {}).value || "p", NF = { p: "Pedidos y consultas", r: "Reportes", a: "Recordatorios" };
        var fb = ft === "p" ? 79 : 89, f = sel.web ? fb * 0.9 : fb;
        labels.push("GrowiFlow (" + NF[ft].toLowerCase() + ")");
        once += f; lines.push({ k: "flow" + ft + (sel.web ? "d" : ""), n: "GrowiFlow · " + NF[ft], v: price(f, true), sub: sel.web ? "−10% por ser cliente de GrowiWeb. Sin descuento: " + price(fb, true) : "" });
      }
      if (sel.inv) { labels.push("Invitaciones digitales"); lines.push({ k: "inv", n: "Invitaciones digitales", v: "con presupuesto" }); }
      var html = lines.length ? "<ul class=\"t-lines\">" + lines.map(function (l) {
        var isNew = anim && !reduce && !prev[l.k];
        return "<li" + (isNew ? " class=\"newline\"" : "") + "><span>" + l.n + "</span><span class=\"f\"></span><span class=\"v" + (l.neg ? " neg" : "") + "\">" + l.v + "</span></li>" + (l.sub ? "<li class=\"sub" + (isNew ? " newline" : "") + "\"><span>" + l.sub + "</span></li>" : "");
      }).join("") + "</ul>" : "<p class=\"t-empty\">Todavía no marcaste nada. Sin compromiso: en el sitio no se contrata ni se paga.</p>";
      var sum = "";
      if (lines.length) {
        sum = "<div class=\"sum\" role=\"status\" aria-live=\"polite\">" +
          (once > 0 ? "<div class=\"row\"><span class=\"t-lbl\">Referencia · una vez</span><span class=\"t-num\">" + price(once, true) + "</span></div>" : "") +
          (month > 0 ? "<div class=\"row\"><span class=\"t-lbl\">Referencia · por mes</span><span class=\"t-num\">" + price(month, true) + "</span></div>" : "") +
          "</div><p class=\"note\"><b>Esto no es una compra:</b> todavía no se contrata ni se paga en el sitio. Son valores «desde», en " + (cur() === "USD" ? "dólares" : "pesos (referencia, al dólar oficial venta)") + ": el precio final y la fecha de entrega van por escrito antes de empezar.</p>";
      }
      print.innerHTML = html + sum;
      prev = {}; lines.forEach(function (l) { prev[l.k] = 1; });
      var msg = labels.length ? "Hola Growi, quiero consultar por: " + labels.join(", ") + ".\n\nMi rubro:\nQué quiero resolver:" : "Hola Growi, quiero conocer más sobre sus soluciones.\n\nMi rubro:\nQué quiero resolver:";
      cta.href = wa + encodeURIComponent(msg);
      cta.setAttribute("data-lineas", labels.join("+"));
      cta.textContent = labels.length ? "Enviar esta consulta por WhatsApp" : "O escribinos directo por WhatsApp";
      cta.classList.toggle("o", !labels.length);
    };
    ch.addEventListener("change", function () { render(true); });
    document.addEventListener("growi:currency", function () { render(false); });
    cta.addEventListener("click", function () { if (typeof window.plausible === "function") window.plausible("consulta_armada", { props: { lineas: cta.getAttribute("data-lineas") || "ninguna" } }); });
    render(false);
  }

  /* móvil: los planes son un carrusel; si hay uno recomendado, arranca ahí */
  $$(".tickets").forEach(function (g) {
    if (window.matchMedia("(max-width:720px)").matches) {
      g.setAttribute("tabindex", "0"); g.setAttribute("role", "group"); g.setAttribute("aria-label", "Planes, deslizá para ver los demás");
      var r = $(".ribbon", g); if (r && g.offsetParent) { var t = r.closest(".ticket"); g.scrollLeft = t.offsetLeft - (g.clientWidth - t.offsetWidth) / 2; }
    }
  });


  /* menú global por audiencia: «Para tu negocio» abre las cuatro soluciones. Teclado: Enter/Espacio abre, Esc cierra y devuelve el foco. */
  (function () {
    var b = $("#navNeg"), p = $("#navNegPanel"); if (!b || !p) return;
    var open = function (v, foc) {
      b.setAttribute("aria-expanded", String(v)); p.hidden = !v;
      if (v && foc) { var a = $("a", p); if (a) a.focus(); }
    };
    b.addEventListener("click", function () { open(p.hidden, true); });
    b.addEventListener("keydown", function (e) { if (e.key === "ArrowDown") { open(true, true); e.preventDefault(); } });
    p.addEventListener("keydown", function (e) {
      var l = $$("a", p), i = l.indexOf(document.activeElement);
      if (e.key === "Escape") { open(false); b.focus(); }
      else if (e.key === "ArrowDown") { l[(i + 1) % l.length].focus(); e.preventDefault(); }
      else if (e.key === "ArrowUp") { l[(i - 1 + l.length) % l.length].focus(); e.preventDefault(); }
    });
    document.addEventListener("click", function (e) { if (!p.hidden && !b.parentNode.contains(e.target)) open(false); });
    b.parentNode.addEventListener("focusout", function (e) { if (!p.hidden && e.relatedTarget && !b.parentNode.contains(e.relatedTarget)) open(false); });
  })();

  /* demostraciones con causalidad (GrowiFlow y Combo): una secuencia que se reproduce una vez, se puede repetir y se muestra completa con movimiento reducido */
  function fdInit(c) {
    if (!c || c.__i) return; c.__i = 1;
    var beats = +c.getAttribute("data-beats"), ms = +c.getAttribute("data-ms") || 1900, step = 0, timer = 0;
    var play = $("[data-play]", c), label = $("[data-beat-label]", c);
    var L = c.classList.contains("cj") ? ["Un paciente entra al sitio", "Escribe por WhatsApp", "Se agenda en GrowiApp", "Se atiende y se registra la venta"] : ["Hoy lo hacés a mano", "Se dispara solo", "GrowiFlow lo hace por vos", "Lo que recibe", "Lo que ganás"];
    c.classList.add("js-fd");
    var show = function (k) {
      step = k;
      $$("[data-b]", c).forEach(function (e) { var b = +e.getAttribute("data-b"); e.classList.toggle("on", b <= k); e.classList.toggle("now", b === k); });
      $$("[data-dim]", c).forEach(function (e) { e.classList.toggle("dim", k >= +e.getAttribute("data-dim")); });
      if (label) label.textContent = k ? k + " de " + beats + " · " + L[k - 1] : "";
      c.classList.toggle("is-done", k >= beats);
    };
    var stop = function () { clearTimeout(timer); timer = 0; };
    var run = function () {
      stop(); show(0); var k = 0;
      var next = function () { k++; show(k); if (k < beats) timer = setTimeout(next, ms); else if (play) play.textContent = "Ver de nuevo"; };
      timer = setTimeout(next, 250);
      if (play) play.textContent = "Reiniciar";
    };
    if (reduce) { show(beats); if (play) play.hidden = true; }
    else {
      show(1); /* antes de reproducir se ve la tarea de partida, no un bloque vacío */
      if (play) play.addEventListener("click", run);
      if (IO) { var o = new IntersectionObserver(function (en) { if (en[0].isIntersecting && c.offsetParent && !c.__played) { c.__played = 1; o.disconnect(); run(); } }, { threshold: 0, rootMargin: "0px 0px -30% 0px" }); o.observe(c); } /* dispara cuando el borde superior entra en el 70 % superior: no depende de la altura del bloque */
      else show(beats);
    }
    $$('input[type="radio"]', c).forEach(function (r) {
      r.addEventListener("change", function () {
        $$(".fd-sc", c).forEach(function (s) { s.hidden = s.getAttribute("data-sc") !== r.value; });
        c.__played = 1; if (reduce) show(beats); else run();
      });
    });
    c.__run = function () { if (!reduce && !c.__played && c.offsetParent) { c.__played = 1; run(); } };
  }
  $$("[data-fd]").forEach(function (c) { if (!c.closest("[hidden]")) fdInit(c); });

  /* explorador por necesidad (home): pestañas accesibles; cada panel inicia su demostración al mostrarse */
  var xt = $$('[role="tab"][data-xp]');
  if (xt.length) {
    var showXp = function (t, foc) {
      xt.forEach(function (x) { var on = x === t; x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1; $("#p-" + x.getAttribute("data-xp")).hidden = !on; });
      var id = t.getAttribute("data-xp"), pan = $("#p-" + id);
      if (id === "web") webInit();
      var f = $("[data-fd]", pan); if (f) { fdInit(f); if (f.__run) setTimeout(f.__run, 120); }
      if (foc) t.focus();
      if (typeof window.plausible === "function") window.plausible("producto_visto", { props: { linea: id } });
    };
    xt.forEach(function (t, i) {
      t.addEventListener("click", function () { showXp(t); });
      t.addEventListener("keydown", function (e) {
        var k = { ArrowRight: 1, ArrowLeft: -1 }[e.key], n;
        if (k) n = xt[(i + k + xt.length) % xt.length]; else if (e.key === "Home") n = xt[0]; else if (e.key === "End") n = xt[xt.length - 1]; else return;
        showXp(n, true); e.preventDefault();
      });
    });
  }

  /* acceso directo a la demo completa de GrowiApp (misma demo, pantalla propia) */
  $$("iframe.appdemo").forEach(function (f) {
    var w = f.closest(".appwrap"); if (!w || !w.parentNode || w.previousElementSibling && w.previousElementSibling.classList.contains("app-open")) return;
    var p = document.createElement("p"); p.className = "app-open";
    p.innerHTML = '<a class="btn k sm" target="_blank" rel="noopener">Abrir la demo completa ↗</a>';
    p.firstChild.href = f.getAttribute("src"); w.parentNode.insertBefore(p, w);
  });

  /* marcos de demostración: GrowiApp e Invitaciones avisan su alto (sin scroll anidado) */
  window.addEventListener("message", function (e) {
    var d = e.data; if (!d || !d.growiDemo) return;
    if (d.growiDemo === "app") {
      $$("iframe.appdemo").forEach(function (f) {
        if (f.contentWindow !== e.source) return;
        /* alto controlado: nunca más alto que la pantalla, así queda margen para seguir desplazando la página */
        /* en móvil el marco toma todo su alto: un solo scroll (el de la página), sin desplazamiento anidado */
        var narrow = window.matchMedia("(max-width:720px)").matches;
        var cap = narrow ? d.h : Math.max(520, Math.min(780, window.innerHeight - 150)), h = Math.min(d.h, cap);
        f.setAttribute("scrolling", d.h > h + 6 ? "yes" : "no");
        if (Math.abs(h - (parseInt(f.style.height, 10) || 0)) > 6) f.style.height = h + "px";
      });
    }
    if (d.growiDemo === "inv") { $$("iframe.invdemo").forEach(function (f) { if (f.contentWindow === e.source) { f.setAttribute("scrolling", "no"); if (Math.abs(d.h - (parseInt(f.style.height, 10) || 0)) > 6) f.style.height = d.h + "px"; } }); }
  });

  function webInit() {
    var w = $("[data-wprev]"); if (!w || w.__i) return; w.__i = 1;
    var fr = $("iframe", w), view = $(".wp-view", w), sc = $(".wp-scale", w), dev = "d";
    var DW = 860, DH = 600; /* ancho de diseño de la vista de escritorio */
    var fit = function () {
      var W = view.clientWidth, s;
      if (dev === "d") { fr.style.height = ""; s = W / DW; sc.style.transform = "scale(" + s + ")"; sc.style.left = "0"; sc.style.top = "0"; view.style.height = Math.round(DH * s) + "px"; }
      else { var H = Math.min(780, Math.max(480, window.innerHeight - 170)); fr.style.height = H + "px"; s = Math.min(1, (W - 24) / 390); sc.style.transform = "scale(" + s + ")"; sc.style.left = Math.round((W - 390 * s) / 2) + "px"; sc.style.top = "12px"; view.style.height = Math.round(H * s + 24) + "px"; }
    };
    fr.src = fr.getAttribute("data-src"); fit();
    var mb = $("[data-dev=m]", w), wide = window.matchMedia("(min-width:1001px)").matches;
    if (mb && !wide) setTimeout(function () { mb.click(); }, 0);
    var op = $("[data-open]", w);
    if (window.ResizeObserver) new ResizeObserver(fit).observe(view); else window.addEventListener("resize", fit);
    $$("[data-demo]", w).forEach(function (b) { b.addEventListener("click", function () { fr.src = fr.getAttribute("data-base") + b.getAttribute("data-demo") + "/index.html"; if (op) op.href = fr.src; $$("[data-demo]", w).forEach(function (x) { x.classList.toggle("active", x === b); x.setAttribute("aria-pressed", String(x === b)); }); }); });
    $$("[data-dev]", w).forEach(function (b) { b.addEventListener("click", function () { dev = b.getAttribute("data-dev"); view.classList.toggle("m", dev === "m"); fit(); $$("[data-dev]", w).forEach(function (x) { x.classList.toggle("active", x === b); x.setAttribute("aria-pressed", String(x === b)); }); }); });
  }
  /* pestañas de planes (GrowiWeb): flechas, Inicio y Fin, como pide el patrón de pestañas */
  $$('.pick[role="tablist"]').forEach(function (tl) {
    var tabs = $$('[role="tab"]', tl);
    var select = function (n) {
      tabs.forEach(function (x) {
        var on = x === n; x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1;
        var p = document.getElementById(x.getAttribute("data-panel")); if (p) { p.hidden = !on; if (on) p.dispatchEvent(new Event("growi:panel")); }
      });
      /* los carruseles de planes arrancan en el recomendado al mostrarse */
      var g = document.getElementById(n.getAttribute("data-panel")), r = g && $(".ribbon", g);
      if (g && r && window.matchMedia("(max-width:720px)").matches) { var t = r.closest(".ticket"); g.scrollLeft = t.offsetLeft - (g.clientWidth - t.offsetWidth) / 2; }
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t); });
      t.addEventListener("keydown", function (e) {
        var k = { ArrowRight: 1, ArrowLeft: -1 }[e.key], n;
        if (k) n = tabs[(i + k + tabs.length) % tabs.length]; else if (e.key === "Home") n = tabs[0]; else if (e.key === "End") n = tabs[tabs.length - 1]; else return;
        select(n); n.focus(); e.preventDefault();
      });
    });
  });

  /* demo de GrowiApp: el póster del rubro se retira cuando la demo real termina de cargar */
  $$(".appwrap").forEach(function (w) {
    var f = $("iframe", w); if (!f) return;
    var m = /rubro=([a-z]+)/.exec(f.getAttribute("src") || ""); if (m && m[1] !== "cafeteria") w.classList.add("pr-" + m[1]);
    f.addEventListener("load", function () { w.classList.add("ready"); });
    try { if (f.contentDocument.readyState === "complete" && f.contentWindow.location.href !== "about:blank") w.classList.add("ready"); } catch (e) {}
  });

  /* escaparate de GrowiWeb: dos vistas del mismo sitio real; el póster liviano se retira apenas carga la demo */
  $$("[data-wsc]").forEach(function (w) {
    var views = $$(".wsc-view", w), base = w.getAttribute("data-base"), op = $("[data-wopen]", w);
    var fit = function () {
      views.forEach(function (v) {
        var dw = +v.getAttribute("data-w"), dh = +v.getAttribute("data-h"), s = v.clientWidth / dw, f = $("iframe", v);
        f.style.width = dw + "px"; f.style.height = dh + "px"; f.style.transform = "scale(" + s + ")"; v.style.height = Math.round(dh * s) + "px";
      });
    };
    views.forEach(function (v) { var f = $("iframe", v); f.addEventListener("load", function () { v.classList.add("ready"); }); });
    var started = false;
    /* solo se carga lo que se ve: la vista de escritorio no se descarga en pantallas chicas */
    var start = function () { started = true; views.forEach(function (v) { var f = $("iframe", v); if (v.offsetParent && !f.src) f.src = f.getAttribute("data-src"); }); };
    var fit0 = fit; fit = function () { fit0(); if (started) start(); };
    fit(); if (window.ResizeObserver) new ResizeObserver(fit).observe(w); else window.addEventListener("resize", fit);
    if (IO) { var o = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { o.disconnect(); start(); } }, { rootMargin: "300px" }); o.observe(w); } else start();
    $$("[data-wdemo]", w).forEach(function (b) {
      b.addEventListener("click", function () {
        var d = b.getAttribute("data-wdemo"), ribera = d === "centro-ribera";
        views.forEach(function (v) { var f = $("iframe", v); v.classList.toggle("nop", !ribera); v.classList.remove("ready"); f.src = base + d + "/index.html"; });
        if (op) op.href = base + d + "/index.html";
        var cp = $("[data-wcap]", w); if (cp) cp.textContent = cp.getAttribute("data-c-" + d) || cp.textContent;
        $$("[data-wdemo]", w).forEach(function (x) { x.classList.toggle("active", x === b); x.setAttribute("aria-pressed", String(x === b)); });
      });
    });
  });
  if ($("[data-wprev]") && !xt.length) webInit(); /* páginas de línea: vista previa activa al cargar */
})();
