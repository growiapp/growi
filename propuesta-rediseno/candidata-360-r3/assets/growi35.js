/* Growi 360° R3.5: hero de GrowiApp sobre la interfaz real (las cifras del Resumen cambian como simulación rotulada). Sin dependencias. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var K = { "Ventas hoy": ["$184.500", "$194.000"], "Transacciones": ["47", "48"], "Caja estimada": ["$147.600", "$157.100"] };

  /* Invitaciones, personalización: los tres perfiles se recorren solos (se detienen apenas la persona elige uno) */
  var reduce = !document.documentElement.classList.contains("mo");
  $$(".invs .invf iframe").forEach(function (f) {
    var btns = [], i = 0, timer = 0, vis = false, stopped = false;
    var tick = function () { clearTimeout(timer); if (!vis || stopped || reduce || btns.length < 2) return; timer = setTimeout(function () { i = (i + 1) % btns.length; btns[i].click(); tick(); }, 5200); };
    var build = function () {
      var d; try { d = f.contentDocument; } catch (e) { return; } if (!d) return;
      btns = $$("[data-profiles] .exp", d); if (btns.length < 2) return;
      btns.forEach(function (b, j) { b.addEventListener("click", function (ev) { if (ev.isTrusted) stopped = true; i = j; }); });
      tick();
    };
    f.addEventListener("load", build);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; if (vis) tick(); else clearTimeout(timer); }, { threshold: 0.3 }).observe(f); else vis = true;
  });

  $$("[data-ah]").forEach(function (c) {
    var box = $("[data-ah-fr]", c), f = $("iframe", box), lvl = 1;
    var D = function () { try { return f.contentDocument; } catch (e) { return null; } };
    var hl = (getComputedStyle(document.documentElement).getPropertyValue("--marcador") || "#f2c94c").trim();
    var fit = function () { /* el marco escala la interfaz real: ancho de escritorio si hay lugar, ancho de celular si no */
      var cw = box.clientWidth; if (!cw) return;
      var wide = cw >= 560, dw = wide ? 1000 : 390, dh = wide ? 680 : 430, s = cw / dw;
      f.style.width = dw + "px"; f.style.height = dh + "px"; f.style.transform = "scale(" + s + ")"; box.style.aspectRatio = "auto"; box.style.height = Math.round(dh * s) + "px";
    };
    var apply = function () {
      var d = D(), sc = d && $('[data-screen="resumen"]', d); if (!sc) return;
      $$(".kpi-card", sc).forEach(function (k) {
        var lab = ($(".kpi-label", k) || {}).textContent, v = $(".kpi-val", k); if (!v || !K[lab]) return;
        v.textContent = K[lab][lvl >= 2 ? 1 : 0]; k.classList.toggle("ah-hl", lvl === 2);
      });
    };
    var prep = function () {
      var d = D(); if (!d || !d.head) return;
      if (!$("#ah-style", d)) { var st = d.createElement("style"); st.id = "ah-style"; st.textContent = ".demo-industry-selector,.mockup-bar{display:none!important}html,body{overflow:hidden!important;background:#fff!important}.section-off{padding:0!important;background:transparent!important}.container{max-width:none!important;padding:0!important}.hero-mockup{margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important}.reveal{opacity:1!important;transform:none!important}.ah-hl{outline:4px solid " + hl + ";outline-offset:-4px;transition:outline-color .3s}"; d.head.appendChild(st); }
      var nav = $$('[data-target="resumen"]', d).filter(function (b) { return b.offsetParent; })[0]; if (nav) nav.click(); /* fija el Resumen y frena la rotación propia de la demo */
      try { f.contentWindow.scrollTo(0, 0); } catch (e) {}
      lvl = +c.getAttribute("data-beat") || 1; apply(); fit(); c.classList.add("ready");
    };
    c.addEventListener("mgbeat", function (e) { lvl = e.detail; apply(); });
    f.addEventListener("load", prep);
    try { if (f.contentDocument && f.contentDocument.readyState === "complete" && f.contentWindow.location.href !== "about:blank") prep(); } catch (e) {}
    fit(); if (window.ResizeObserver) new ResizeObserver(fit).observe(box); else window.addEventListener("resize", fit);
  });
})();
