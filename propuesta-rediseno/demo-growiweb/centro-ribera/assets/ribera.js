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

  /* ---------- Home: el cuerpo es el selector ---------- */
  var sel = $("[data-sel]");
  if (sel) {
    var panels = $$("[data-zona]"), ringEl = $("[data-ring]", sel);
    var show = function (z, anim) {
      panels.forEach(function (p) { p.hidden = p.getAttribute("data-zona") !== z; });
      var r = $('input[value="' + z + '"]', sel), pt = r && r.parentNode;
      if (!pt) return;
      ringEl.setAttribute("style", pt.getAttribute("style"));
      ringEl.classList.toggle("kb", !!kb);
      if (anim && !reduce && !kb) { ringEl.classList.remove("go"); void ringEl.offsetWidth; ringEl.classList.add("go"); }
    };
    /* con teclado (flechas en ráfaga) el aro salta sin animar */
    var kb = false;
    sel.addEventListener("keydown", function () { kb = true; });
    sel.addEventListener("pointerdown", function () { kb = false; });
    sel.addEventListener("change", function (e) {
      if (e.target.name !== "zona") return;
      show(e.target.value, true);
      var hp = $(".hero-p");
      if (hp && window.matchMedia("(max-width:980px)").matches) {
        var y = hp.getBoundingClientRect().top + window.pageYOffset - 76;
        if (hp.getBoundingClientRect().top > window.innerHeight * 0.6) window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
      }
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

  /* primera consulta: cada escena entra cuando llegás a ella; en móvil, indicador del carrusel */
  var seq = $("[data-seq]");
  if (seq) {
    var hs = $$(".hs", seq), dts = $$(".dots i");
    if (seq.scrollWidth > seq.clientWidth + 2) seq.tabIndex = 0;
    var upd = function () {
      var step = hs[1].offsetLeft - hs[0].offsetLeft, i = step > 0 ? Math.round(seq.scrollLeft / step) : 0;
      dts.forEach(function (d, n) { d.classList.toggle("on", n === Math.min(i, hs.length - 1)); });
    };
    seq.addEventListener("scroll", upd, { passive: true }); upd();
    if (!reduce && "IntersectionObserver" in window) {
      seq.classList.add("js-seq");
      var io = new IntersectionObserver(function (en) {
        var k = 0;
        en.forEach(function (x) { if (x.isIntersecting) { x.target.style.setProperty("--d", (k++ * 0.42) + "s"); x.target.classList.add("in"); io.unobserve(x.target); } });
      }, { threshold: 0.3 });
      hs.forEach(function (h, n) { h.style.transitionDelay = ""; io.observe(h); });
    }
  }

  /* barra fija móvil: aparece cuando el selector ya pasó */
  var fb = $(".fixbar[data-late]"), selEl = $("[data-sel]");
  if (fb && selEl && "IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { fb.classList.toggle("off", en[0].isIntersecting); }).observe(selEl);
  }

  /* servicios: el aro marca la zona al entrar en pantalla (una vez) */
  var zs = $$(".zn .rg");
  if (zs.length && !reduce && "IntersectionObserver" in window) {
    $(".zonas").classList.add("js-z");
    var iz = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { iz.unobserve(x.target); x.target.classList.add("go"); } });
    }, { threshold: 0.6 });
    zs.forEach(function (r) { iz.observe(r); });
  }

  /* el centro: un arco anclado al goniómetro de la foto, sin número */
  var scene = $("[data-scene]");
  if (scene) {
    var svg = $("[data-scene-svg]", scene), g = $("[data-g]", scene), img = $("img", scene);
    var NW = 1672, NH = 941;
    var place = function () {
      var W = scene.clientWidth, ph = $("picture", scene).getBoundingClientRect().height || scene.clientHeight, s = Math.max(W / NW, ph / NH);
      g.setAttribute("transform", "translate(" + (W - NW * s) / 2 + " " + (ph - NH * s) + ") scale(" + s + ")");
      svg.setAttribute("viewBox", "0 0 " + W + " " + ph);
      svg.style.height = ph + "px";
    };
    place();
    if (window.ResizeObserver) new ResizeObserver(place).observe(scene); else window.addEventListener("resize", place);
    if (img && !img.complete) img.addEventListener("load", place);
    if (!reduce && "IntersectionObserver" in window) {
      window.__estado(svg, 0);
      var isc = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { isc.disconnect(); medir(svg, { dur: 1300 }); } }, { threshold: 0.45 });
      isc.observe(scene);
    }
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
    var zf = $("[data-zfig]", tw), ph = $("[data-ilu-vacio]", tw);
    if (zf) {
      zf.hidden = !S.zona;
      if (S.zona && zf.__z !== S.zona) {
        var pt = ZN[S.zona].pt, f = $(".zfig", zf), rg = $(".rg", zf);
        f.style.setProperty("--x", pt[0]); f.style.setProperty("--y", pt[1]); f.style.setProperty("--s", pt[2]);
        if (!reduce) { rg.classList.remove("go"); void rg.offsetWidth; rg.classList.add("go"); }
        zf.__z = S.zona;
      }
    }
    if (ph) ph.hidden = !!S.zona;
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
