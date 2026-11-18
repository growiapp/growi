/* Centro Ribera (negocio ficticio) · demo GrowiWeb. Sin dependencias ni pedidos de red.
   Home: selector de zona. Turnos: recorrido simulado, no se reserva ni se envía nada. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var sysReduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reduce = !document.documentElement.classList.contains("mo");
  var store = function (v) { try { v === null ? localStorage.removeItem("cr_motion") : localStorage.setItem("cr_motion", v); } catch (e) {} };
  (function () {
    var p = $(".fict p"); if (!p) return;
    var b = document.createElement("button"); b.type = "button"; b.className = "mot-toggle";
    b.textContent = reduce ? "Activar animaciones" : (sysReduce ? "Reducir animaciones" : "");
    if (!b.textContent) return;
    b.addEventListener("click", function () { store(reduce ? "on" : "off"); location.reload(); });
    p.appendChild(b);
  })();

  /* ---------- Home: selector de zona ---------- */
  var sel = $("[data-sel]");
  if (sel) {
    var panels = $$("[data-zona]");
    var dots = $$(".dot");
    var show = function (z, animate) {
      panels.forEach(function (p) {
        var on = p.getAttribute("data-zona") === z;
        p.hidden = !on;
        if (on && animate) setTimeout(function () { window.__medir && window.__medir($("svg.ilu", p)); }, 0);
      });
      dots.forEach(function (d) { d.classList.toggle("on", d.getAttribute("data-z") === z); });
    };
    sel.addEventListener("change", function (e) { if (e.target.name === "zona") show(e.target.value, true); });
    dots.forEach(function (d) {
      d.addEventListener("click", function () {
        var z = d.getAttribute("data-z");
        var r = $('input[name="zona"][value="' + z + '"]', sel);
        if (r) { r.checked = true; show(z, true); }
      });
    });
    var first = $('input[name="zona"]:checked', sel);
    show(first ? first.value : "rodilla", false);
  }


  /* ---------- Movimiento con significado ----------
     1) Medir: el miembro recorre el rango mientras el arco se dibuja y el número cuenta.
     2) Orientar: marcadores sobre la foto abren el servicio de cada lugar.
     3) Narrar: los arcos de la primera consulta se dibujan en orden.
     Con "reducir movimiento" todo se muestra en su estado final, sin animar. */
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function tween(dur, fn, done) {
    var t0 = null, id;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var t = Math.min(1, (ts - t0) / dur);
      fn(ease(t));
      if (t < 1) id = requestAnimationFrame(step); else if (done) done();
    }
    id = requestAnimationFrame(step);
    return function () { cancelAnimationFrame(id); };
  }
  /* estado de la medición para un progreso e (0 a 1): miembro, arco y número */
  function preparar(root, opts) {
    opts = opts || {};
    var mvs = $$(".mv", root).map(function (m) { return { el: m, rot: parseFloat(m.getAttribute("data-rot")), piv: m.getAttribute("data-pivot") }; });
    var arc = $(".arc", root), lbl = opts.label || $(".lbl", root);
    if (!arc) return null;
    var deg = lbl ? parseFloat(lbl.getAttribute("data-deg") || lbl.textContent) : 0;
    if (lbl && !lbl.hasAttribute("data-deg")) lbl.setAttribute("data-deg", deg);
    return {
      set: function (e) {
        mvs.forEach(function (m) { m.el.setAttribute("transform", "rotate(" + (m.rot * (1 - e)) + " " + m.piv + ")"); });
        arc.style.strokeDasharray = "1"; arc.style.strokeDashoffset = String(1 - e);
        if (lbl) { var b = lbl.querySelector("b"); (b || lbl).textContent = Math.round(deg * e) + "\u00b0"; }
      },
      fin: function () {
        mvs.forEach(function (m) { m.el.removeAttribute("transform"); });
        arc.style.strokeDasharray = ""; arc.style.strokeDashoffset = "";
        if (lbl) { var b = lbl.querySelector("b"); (b || lbl).textContent = deg + "\u00b0"; }
      }
    };
  }
  function medir(root, opts) {
    opts = opts || {};
    if (!root) return;
    var st = preparar(root, opts);
    if (!st) return;
    if (root.__stop) root.__stop();
    if (reduce) { st.fin(); return; }
    root.__stop = tween(opts.dur || 900, st.set, function () { st.fin(); root.__stop = null; });
  }
  window.__estado = function (root, e, opts) { var st = preparar(root, opts); if (!st) return; if (root.__stop) root.__stop(); e >= 1 ? st.fin() : st.set(e); };
  window.__medir = medir;

  /* selector de la home: la figura visible mide su movimiento */
  var playFig = function (panel) { medir($("svg.ilu", panel)); };
  if (reduce) { $$("[data-replay]").forEach(function (b) { b.hidden = true; }); }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-replay]");
    if (b) playFig(b.closest("[data-zona]"));
  });

  /* primera consulta: "Medimos" mide y "Armamos el plan" suma la meta acordada */
  var seq = $("[data-seq]");
  if (seq && !reduce && "IntersectionObserver" in window) {
    var gs = $$("svg.glyph", seq), gm = gs[1], gp = gs[2];
    var goal = gp ? $$(".goal,.goal-t", gp) : [];
    if (gm) window.__estado(gm, 0);
    goal.forEach(function (g) { g.style.opacity = "0"; });
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      if (gm) medir(gm, { dur: 900 });
      setTimeout(function () { goal.forEach(function (g) { g.style.transition = "opacity .6s"; g.style.opacity = "1"; }); }, 1200);
    }, { threshold: 0.4 });
    io.observe(seq);
  }

  /* barra fija móvil: aparece cuando el selector ya pasó */
  var fb = $(".fixbar[data-late]"), selEl = $("[data-sel]");
  if (fb && selEl && "IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { fb.classList.toggle("off", en[0].isIntersecting); }).observe(selEl);
  }

  /* servicios: cada zona mide su rango al entrar en pantalla (una vez) */
  var zn = $$(".zn svg.ilu");
  if (zn.length && !reduce && "IntersectionObserver" in window) {
    var iz = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { iz.unobserve(x.target); medir(x.target); } });
    }, { threshold: 0.6 });
    zn.forEach(function (s) { window.__estado(s, 0); iz.observe(s); });
  }

  /* escena del hero */
  var scene = $("[data-scene]");
  if (scene) {
    var svg = $("[data-scene-svg]", scene), g = $("[data-g]", scene), img = $("img", scene);
    var pins = $$(".pin", scene), cards = $$(".pincard", scene), lblS = $("[data-lbl]", scene);
    var NW = 1672, NH = 941, map = { s: 1, ox: 0, oy: 0 };
    var place = function () {
      var W = scene.clientWidth, H = scene.clientHeight, im = $("picture", scene).getBoundingClientRect();
      var ph = im.height || H, s = Math.max(W / NW, ph / NH);
      map = { s: s, ox: (W - NW * s) / 2, oy: ph - NH * s };
      g.setAttribute("transform", "translate(" + map.ox + " " + map.oy + ") scale(" + map.s + ")");
      svg.setAttribute("viewBox", "0 0 " + W + " " + ph);
      svg.style.height = ph + "px";
      var at = function (el) { el.style.left = (map.ox + parseFloat(el.getAttribute("data-x")) * map.s) + "px"; el.style.top = (map.oy + parseFloat(el.getAttribute("data-y")) * map.s) + "px"; };
      pins.forEach(at); at(lblS);
      cards.forEach(function (c) { if (!c.hidden) openCard(c.getAttribute("data-card"), true); });
    };
    var openCard = function (k, keep) {
      cards.forEach(function (c) { var on = c.getAttribute("data-card") === k; c.hidden = !on; });
      pins.forEach(function (p) { p.setAttribute("aria-expanded", p.getAttribute("data-pin") === k ? "true" : "false"); });
      var p = $('.pin[data-pin="' + k + '"]', scene), c = $('[data-card="' + k + '"]', scene);
      if (!p || !c) return;
      if (window.matchMedia("(max-width:720px)").matches) { c.style.left = ""; c.style.top = ""; return; }
      var W = scene.clientWidth, H = $("picture", scene).clientHeight, x = parseFloat(p.style.left), y = parseFloat(p.style.top), cw = c.offsetWidth, ch = c.offsetHeight;
      var onLeft = p.getAttribute("data-side") === "l";
      var left = onLeft ? x - 26 - cw : x + 26; if (left + cw > W - 12) left = x - 26 - cw; if (left < 12) left = x + 26; if (left + cw > W - 12 || left < 12) left = Math.max(12, Math.min(W - cw - 12, x - cw / 2));
      var top = y - ch / 2; top = Math.max(12, Math.min(H - ch - 12, top));
      c.style.left = left + "px"; c.style.top = top + "px";
    };
    var closeCards = function () { cards.forEach(function (c) { c.hidden = true; }); pins.forEach(function (p) { p.setAttribute("aria-expanded", "false"); }); };
    pins.forEach(function (p) {
      p.addEventListener("click", function (e) {
        e.stopPropagation();
        var k = p.getAttribute("data-pin"), open = p.getAttribute("aria-expanded") === "true";
        if (open) closeCards(); else openCard(k);
        if (k === "eval" && !open) medir(svg, { label: lblS });
      });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeCards(); });
    document.addEventListener("click", function (e) { if (!e.target.closest(".pincard")) closeCards(); });
    place();
    if (window.ResizeObserver) new ResizeObserver(place).observe(scene); else window.addEventListener("resize", place);
    var go = function () { medir(svg, { label: lblS, dur: 1100 }); };
    if (img && !img.complete) img.addEventListener("load", function () { place(); go(); }); else go();
  }

  /* ---------- Turnos: recorrido simulado ---------- */
  var tw = $("[data-turnos]");
  if (!tw) return;
  var D = JSON.parse($("#datos").textContent);
  var S = { zona: "", motivo: "", prof: "0", fecha: "", hora: "", nombre: "", tel: "", cob: "", nota: "" };
  var steps = $$("[data-step]", tw), prog = $$(".prog li", tw), cur = 0;
  var ZN = D.zonas, PR = D.profesionales;
  var hasZ = function (z) { return !!z && Object.prototype.hasOwnProperty.call(ZN, z); };

  function hash(str) { var h = 7; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function dias() {
    var out = [], d = new Date();
    d.setHours(12, 0, 0, 0);
    while (out.length < 5) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) out.push(new Date(d));
    }
    return out;
  }
  var HORAS = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
  function libre(fecha, hora, prof) {
    if (prof === "0") return [1, 2, 3].some(function (p) { return libre(fecha, hora, String(p)); });
    return hash(fecha + "|" + prof + "|" + hora) % 100 < 58;
  }
  function fechaLarga(f) {
    var p = f.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2], 12);
    var t = new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long" }).format(d);
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  function fechaCorta(f) {
    var p = f.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2], 12);
    var t = new Intl.DateTimeFormat("es-AR", { weekday: "short", day: "numeric", month: "short" }).format(d).replace(/\./g, "").replace(",", "");
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  /* paso 1 */
  function renderMotivos() {
    var box = $("[data-motivos]", tw);
    box.innerHTML = "";
    if (!S.zona) { box.hidden = true; return; }
    box.hidden = false;
    var lg = el("p", "hint", "Motivos de consulta frecuentes en <b>" + esc(ZN[S.zona].nombre) + "</b>. Son orientativos, no un diagnóstico.");
    box.appendChild(lg);
    var g = el("div", "opt");
    ZN[S.zona].motivos.concat(["Otro motivo (lo contás en la consulta)"]).forEach(function (m, i) {
      var l = el("label", "row");
      l.innerHTML = '<input type="radio" name="motivo" value="' + i + '"' + (String(i) === S.motivo ? " checked" : "") + '><span>' + esc(m) + "</span>";
      g.appendChild(l);
    });
    box.appendChild(g);
  }
  function motivoTxt() { return S.zona && S.motivo !== "" ? (ZN[S.zona].motivos.concat(["Otro motivo"])[+S.motivo] || "") : ""; }

  /* paso 3 */
  function renderDias() {
    var box = $("[data-dias]", tw); box.innerHTML = "";
    dias().forEach(function (d) {
      var f = iso(d), l = el("label", "row dia");
      var w = new Intl.DateTimeFormat("es-AR", { weekday: "short" }).format(d).replace(".", "");
      var m = new Intl.DateTimeFormat("es-AR", { month: "short" }).format(d).replace(".", "");
      l.innerHTML = '<input type="radio" name="fecha" value="' + f + '"' + (f === S.fecha ? " checked" : "") + '><span><small>' + w + "</small><b>" + d.getDate() + "</b><small>" + m + "</small></span>";
      box.appendChild(l);
    });
    renderSlots();
  }
  function renderSlots() {
    var box = $("[data-slots]", tw); box.innerHTML = "";
    if (!S.fecha) { box.appendChild(el("p", "hint", "Elegí un día para ver los horarios.")); return; }
    [["Mañana", HORAS.filter(function (h) { return h < "12:00"; })], ["Tarde", HORAS.filter(function (h) { return h >= "12:00"; })]].forEach(function (g) {
      box.appendChild(el("p", "grp", g[0]));
      var grid = el("div", "slots");
      g[1].forEach(function (h) {
        var ok = libre(S.fecha, h, S.prof), l = el("label", "row slot" + (ok ? "" : " off"));
        if (!ok && S.hora === h) S.hora = "";
        l.innerHTML = '<input type="radio" name="hora" value="' + h + '"' + (ok ? "" : " disabled") + (h === S.hora ? " checked" : "") + "><span>" + h + (ok ? "" : '<small class="sr">no disponible</small>') + "</span>";
        grid.appendChild(l);
      });
      box.appendChild(grid);
    });
  }

  /* resumen lateral */
  var prevR = {};
  function resumen() {
    var set = function (k, v) {
      var e = $('[data-r="' + k + '"]', tw);
      e.innerHTML = v ? esc(v) : '<span class="vac">Sin elegir</span>';
      if (prevR[k] !== undefined && prevR[k] !== v && v && !reduce) { e.classList.remove("flash"); void e.offsetWidth; e.classList.add("flash"); setTimeout(function () { e.classList.remove("flash"); }, 1100); }
      prevR[k] = v;
    };
    set("zona", S.zona ? ZN[S.zona].nombre : "");
    set("motivo", motivoTxt());
    set("prof", S.prof === "0" ? "Sin preferencia" : PR[+S.prof - 1].nombre);
    set("cuando", S.fecha && S.hora ? fechaCorta(S.fecha) + ", " + S.hora : "");
    $$("[data-ilu]", tw).forEach(function (f) {
      var on = f.getAttribute("data-ilu") === S.zona, was = !f.hidden;
      f.hidden = !on;
      if (on && !was) window.__medir($("svg.ilu", f));
    });
    var ph = $("[data-ilu-vacio]", tw); if (ph) ph.hidden = !!S.zona;
  }

  function go(n, focus) {
    cur = n;
    steps.forEach(function (s, i) { s.hidden = i !== n; });
    prog.forEach(function (p, i) {
      p.classList.toggle("ok", i < n);
      if (i === n) p.setAttribute("aria-current", "step"); else p.removeAttribute("aria-current");
    });
    if (n === 2) renderDias();
    resumen();
    if (focus !== false) { var lg = $("legend", steps[n]); if (lg) { lg.tabIndex = -1; lg.focus({ preventScroll: true }); } var top = $(".prog", tw); if (top) top.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }
  }
  function err(step, msg) { var e = $("[data-err]", steps[step]); if (e) { e.textContent = msg; } }

  tw.addEventListener("change", function (e) {
    var t = e.target;
    if (t.name === "zona") { S.zona = t.value; S.motivo = ""; renderMotivos(); err(0, ""); }
    else if (t.name === "motivo") { S.motivo = t.value; err(0, ""); }
    else if (t.name === "prof") { S.prof = t.value; }
    else if (t.name === "fecha") { S.fecha = t.value; S.hora = ""; renderSlots(); err(2, ""); }
    else if (t.name === "hora") { S.hora = t.value; err(2, ""); }
    resumen();
  });

  function validarDatos() {
    var ok = true, f = $("[data-form]", tw);
    var nombre = f.elements.nombre.value.trim(), tel = f.elements.tel.value.replace(/\D/g, "");
    var bad = function (name, msg) { var fl = f.elements[name].closest(".fld"); fl.classList.add("bad"); $(".err", fl).textContent = msg; f.elements[name].setAttribute("aria-invalid", "true"); ok = false; return f.elements[name]; };
    $$(".fld", f).forEach(function (x) { x.classList.remove("bad"); var e = $(".err", x); if (e) e.textContent = ""; });
    $$("[aria-invalid]", f).forEach(function (x) { x.removeAttribute("aria-invalid"); });
    var first = null, c;
    if (nombre.length < 3) { c = bad("nombre", "Escribí tu nombre y apellido."); first = first || c; }
    if (tel.length < 8 || tel.length > 13) { c = bad("tel", "Escribí un número de WhatsApp con entre 8 y 13 dígitos."); first = first || c; }
    if (!ok) { first.focus(); return false; }
    S.nombre = nombre; S.tel = f.elements.tel.value.trim(); S.cob = f.elements.cob.value.trim(); S.nota = f.elements.nota.value.trim();
    return true;
  }

  function mensaje() {
    var l = ["Hola Centro Ribera, quiero pedir un turno.", "",
      "Zona: " + ZN[S.zona].nombre, "Motivo: " + motivoTxt(),
      "Profesional: " + (S.prof === "0" ? "sin preferencia" : PR[+S.prof - 1].nombre),
      "Día y hora: " + fechaLarga(S.fecha) + ", " + S.hora + " h",
      "Nombre: " + S.nombre, "WhatsApp: " + S.tel];
    if (S.cob) l.push("Cobertura: " + S.cob);
    if (S.nota) l.push("Comentario: " + S.nota);
    l.push("", "(Mensaje de demostración: no se envió a nadie)");
    return l.join("\n");
  }

  tw.addEventListener("click", function (e) {
    var b = e.target.closest("[data-a]"); if (!b) return;
    var a = b.getAttribute("data-a");
    if (a === "back") { go(Math.max(0, cur - 1)); return; }
    if (a === "next") {
      if (cur === 0) { if (!S.zona) return err(0, "Elegí la zona que te molesta."), $("[data-err]", steps[0]).focus(); if (S.motivo === "") return err(0, "Elegí un motivo de consulta."), $("[data-err]", steps[0]).focus(); }
      if (cur === 2) { if (!S.fecha || !S.hora) return err(2, "Elegí un día y un horario disponible."), $("[data-err]", steps[2]).focus(); }
      go(cur + 1);
    }
    if (a === "copy") {
      var ta = $("[data-msg]", tw), live = $("[data-live]", tw);
      var done = function () { live.textContent = "Mensaje copiado."; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(done, function () { ta.select(); live.textContent = "Seleccioná el texto y copialo."; });
      else { ta.select(); live.textContent = "Seleccioná el texto y copialo."; }
    }
    if (a === "reset") { location.href = "turnos.html"; }
  });
  $("[data-form]", tw).addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validarDatos()) return;
    steps.forEach(function (s) { s.hidden = true; });
    $(".prog", tw).hidden = true;
    var d = $("[data-done]", tw); d.hidden = false;
    $("[data-msg]", d).value = mensaje();
    var h = $("h2", d); h.tabIndex = -1; h.focus();
    resumen();
  });

  /* parámetros de la home: ?zona=rodilla&m=1 */
  var q = new URLSearchParams(location.search), z = q.get("zona"), m = q.get("m");
  if (hasZ(z)) {
    S.zona = z;
    var r = $('input[name="zona"][value="' + z + '"]', tw); if (r) r.checked = true;
    renderMotivos();
    if (m !== null && ZN[z].motivos.length >= +m && /^\d+$/.test(m)) {
      S.motivo = m;
      var rm = $('input[name="motivo"][value="' + m + '"]', tw); if (rm) rm.checked = true;
      go(1, false);
      return;
    }
  }
  go(0, false);
})();
