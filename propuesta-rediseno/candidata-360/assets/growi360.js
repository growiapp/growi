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
    var checks = $$('input[name="linea"]', ch), webSub = $("[data-websub]", ch);
    var wa = "https://wa.me/5491170593877?text=";
    var render = function (anim) {
      var sel = {}; checks.forEach(function (c) { sel[c.value] = c.checked; });
      var tipo = ($('input[name="webtipo"]:checked', ch) || {}).value || "l";
      if (webSub) webSub.hidden = !sel.web;
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
        var f = sel.web ? 89 * 0.9 : 89;
        labels.push("GrowiFlow");
        once += f; lines.push({ k: "flow" + (sel.web ? "d" : ""), n: "GrowiFlow, un paquete (desde)", v: price(f, true), sub: sel.web ? "−10% por ser cliente de GrowiWeb. Sin descuento: " + price(89, true) : "" });
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

  /* GrowiApp: período anual (15% menos) sobre el precio mensual en USD */
  var per = $$("[data-period]");
  if (per.length) {
    var store = window.growiStore || { get: function () { return null; }, set: function () {} };
    var annual = store.get("growi_billing_period") === "annual";
    var upd = function () {
      $$("[data-plan-price]").forEach(function (e) { e.textContent = price(Number(e.getAttribute("data-usd")) * (annual ? 0.85 : 1), true); });
      $$("[data-period-note]").forEach(function (e) { e.textContent = annual ? "Pagás 12 meses juntos, con 15% de ahorro." : "Pago mensual. Cancelás cuando quieras."; });
      per.forEach(function (b) { var on = (b.getAttribute("data-period") === "annual") === annual; b.classList.toggle("active", on); b.setAttribute("aria-pressed", String(on)); });
    };
    per.forEach(function (b) { b.addEventListener("click", function () { annual = b.getAttribute("data-period") === "annual"; store.set("growi_billing_period", annual ? "annual" : "monthly"); upd(); if (typeof window.plausible === "function") window.plausible("billing_period_change", { props: { period: annual ? "annual" : "monthly" } }); }); });
    document.addEventListener("growi:currency", upd);
    upd();
  }

  /* GrowiWeb: elegir por necesidad (landing o sitio institucional) */
  var tabs = $$('[role="tab"][data-panel]');
  if (tabs.length) {
    var show = function (t) {
      tabs.forEach(function (x) { var on = x === t; x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1; $("#" + x.getAttribute("data-panel")).hidden = !on; });
      $$("#" + t.getAttribute("data-panel") + " .print-in").forEach(function (p) { if (!reduce) { p.classList.remove("printed"); void p.offsetWidth; p.classList.add("printed"); } });
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { show(t); });
      t.addEventListener("keydown", function (e) {
        var k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!k) return;
        var n = tabs[(i + k + tabs.length) % tabs.length]; n.focus(); show(n); e.preventDefault();
      });
    });
  }
})();
