/* Invitaciones · película «La enviás · La abren · Exploran · Confirman» (F8.9B; Invitaciones A aprobado en F8.9A) y diálogo «Probar la invitación completa».
   La película es una ILUSTRACIÓN con datos ficticios: nada de lo que muestra se envía ni se guarda. Usa el motor Nar (narrar.js) y arma el texto de la
   respuesta con el mismo núcleo que la invitación real (GrowiInv.mensaje, inv-core.js), para que nunca difiera. La invitación funcional es el módulo real
   (inv-ui.js): aquí solo se abre en un diálogo, por acción explícita de la persona. */
(function () {
  "use strict";
  var dm = document.querySelector("[data-ip]");
  if (!dm || !window.Nar || !window.GrowiInv) return;
  var stg = dm.querySelector("[data-stg]"), cap = dm.querySelector("[data-cap]"), nav = dm.querySelector("[data-nav]"), ring = dm.querySelector("[data-ring]"), scr = dm.querySelector(".ip-scr");
  var host = dm.querySelector("[data-host]"), NAME = "Camila Ríos";
  var CAP = ["La enviás por WhatsApp, con enlace y vista previa.", "Tus invitados la abren desde el enlace.", "Exploran el programa, el lugar y la información práctica.", "Confirman su asistencia y responden en el mismo chat de WhatsApp."];
  stg.inert = true;   // la película es solo para mirar: nada dentro de ella recibe foco ni lo anuncian los lectores de pantalla
  dm.querySelector("[data-rpt]").textContent = GrowiInv.mensaje("cas", { nombre: NAME, respuesta: "si", personas: 2 });
  var reducido = function () { return !Nar.motionOk(); };

  /* ---- las pantallas de la invitación dentro del teléfono (vista activa y formulario) ---- */
  var views = [].slice.call(host.querySelectorAll(".ip-v")), inp = host.querySelector("[name=nombre]"), cantO = host.querySelector("[data-cant]"), pers = host.querySelector("[data-pers]"), radios = [].slice.call(host.querySelectorAll("[type=radio]"));
  function go(v) { views.forEach(function (e) { var on = e.getAttribute("data-v") === v; e.classList.toggle("on", on); if (on) e.scrollTop = 0; }); }
  function fill(d) { inp.value = d.nombre; cantO.textContent = d.cant; pers.hidden = d.resp !== "si"; radios.forEach(function (r) { r.checked = r.value === d.resp; }); }

  function pos(el) { var a = el.getBoundingClientRect(), b = scr.getBoundingClientRect(); return [a.left - b.left + a.width / 2, a.top - b.top + a.height / 2]; }
  function toca(el) { var p = pos(el); ring.style.left = p[0] + "px"; ring.style.top = p[1] + "px"; ring.getAnimations().forEach(function (x) { x.cancel(); }); ring.animate([{ opacity: 0, transform: "scale(.3)" }, { opacity: 1, offset: .35 }, { opacity: 0, transform: "scale(1.6)" }], { duration: 900, easing: "cubic-bezier(.16,1,.3,1)" }); }
  var cv = null, ct = "", cf = "";
  /* aplica el estado M: vista, formulario, chat y toque; solo actúa sobre lo que cambió */
  function mod(M) {
    if (M.reset) { fill({ nombre: "", resp: "", cant: 1 }); go("portada"); cv = null; cf = ""; }
    stg.dataset.ch = M.ch ? 1 : 0; stg.dataset.snd = M.snd || 0;
    var bd = dm.querySelector(".ip-ch .ip-bd");
    if (!M.snd) { bd.style.paddingBottom = ""; bd.scrollTop = 0; }
    else if (M.snd === 1 || (M.snd === 4 && M.man)) {
      /* el hilo se desplaza hasta que lo último queda completo y el corte superior cae justo entre dos líneas (nunca texto cortado a la mitad) */
      bd.style.paddingBottom = ""; var p = bd.querySelector(".ip-m:not(.ip-out) p"), lh = parseFloat(getComputedStyle(p).lineHeight), y = p.offsetTop - bd.offsetTop, mx = bd.scrollHeight - bd.clientHeight, f = ((mx - y) % lh + lh) % lh;
      if (mx > y && f > .3) { bd.style.paddingBottom = (7 + lh - f) + "px"; mx = bd.scrollHeight - bd.clientHeight; }
      if (M.snd === 1 && !reducido()) bd.scrollTo({ top: mx, behavior: "smooth" }); else bd.scrollTop = mx;
    }
    if (M.view !== cv) {
      cv = M.view;
      if (cv === "confirmar") fill({ nombre: "", resp: "", cant: 1 });
      go(cv);
      var v = host.querySelector('[data-v="' + cv + '"]'); v.classList.remove("ip-rev"); void v.offsetWidth; if (cv === "programa" || cv === "lugar") v.classList.add("ip-rev");
    }
    if (cv === "confirmar") { var k = M.name + "|" + M.resp + "|" + M.cant; if (k !== cf) { cf = k; fill({ nombre: NAME.slice(0, M.name), resp: M.resp, cant: M.cant }); } }
    if (M.tap !== ct) { ct = M.tap; if (ct) toca(ct === "link" ? dm.querySelector("[data-link]") : ct === "conf" ? host.querySelector("[data-v=portada] [data-go=confirmar]") : host.querySelector("[data-v=confirmar] [type=submit]")); }
  }
  /* escenas 3 y 4: la misma lista de pasos [ms, cambios] sirve para la reproducción automática (con desfase) y para elegir la etapa a mano */
  function e3(t) { return [[t, { view: "programa", ch: 0, snd: 0 }], [t + 2500, { view: "lugar" }]]; }
  function e4(t) {
    var L = [[t, { view: "confirmar", name: 0, resp: "", cant: 1, tap: "", ch: 0, snd: 0 }]], u = t + 700, i;
    for (i = 1; i <= NAME.length; i++) { u += 75 + (i === 6 ? 90 : 0); L.push([u, { name: i }]); }
    u += 500; L.push([u, { resp: "si" }]); u += 650; L.push([u, { cant: 2 }]); u += 750; L.push([u, { tap: "send" }]); u += 650; L.push([u, { ch: 1, tap: "" }]);
    u += 700; L.push([u, { snd: 1 }]); u += 750; L.push([u, { snd: 2 }]); u += 450; L.push([u, { snd: 3 }]); u += 550; L.push([u, { snd: 4 }]);
    return L;
  }
  var pa = -9, M = { view: "portada", name: 0, resp: "", cant: 1, tap: "", reset: 1, ch: 0, snd: 0, man: 0 }, timers = [];   // man: con movimiento reducido las etapas estables también deben dejar el hilo en su lugar
  function limpia() { timers.forEach(clearTimeout); timers = []; }
  function render(S) {
    stg.dataset.a = S.a; dm.dataset.a = S.a; scr.dataset.tick = S.tick; dm.dataset.tick = S.tick; stg.dataset.tick = S.tick;
    [].forEach.call(document.querySelectorAll("[data-ip] [data-i],[data-stp] [data-i]"), function (b) { if (+b.getAttribute("data-i") === S.a - 1) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
    cap.textContent = CAP[S.a - 1];
    var man = S.man || 0;
    if (man !== pa) { pa = man; limpia(); }
    if (man && !reducido()) {
      limpia();
      /* elegida a mano con movimiento permitido: se reproduce la escena completa una vez, siempre igual */
      var L = man === 3 ? e3(0) : e4(0), est = Object.assign({}, M, { reset: 1 }); mod(est);
      L.forEach(function (p) { timers.push(setTimeout(function () { Object.keys(p[1]).forEach(function (k) { est[k] = p[1][k]; }); est.reset = 0; mod(est); }, p[0])); });
    } else { Object.keys(M).forEach(function (k) { if (S[k] !== undefined) M[k] = S[k]; }); mod(M); M.reset = 0; }
  }
  var B0 = { a: 1, tick: 0, view: "portada", name: 0, resp: "", cant: 1, tap: "", reset: 1, man: 0, ch: 0, snd: 0 };
  var T = [[0, B0], [1000, { tick: 1, reset: 0 }], [2800, { tap: "link" }], [3500, { a: 2, tap: "", view: "portada" }], [5900, { a: 3 }]].concat(e3(5900), [[11200, { a: 4 }]], e4(11200));
  var ES = function (a, v, x) { return Object.assign({ a: a, tick: 1, view: v, name: 0, resp: "", cant: 1, tap: "", reset: 1, man: 0, ch: 0, snd: 0 }, x || {}); };
  var nar = Nar({ root: dm, stage: stg, nav: nav, pp: dm.querySelector("[data-pp]"), render: render, init: B0, timeline: T, total: 21200,
    stable: [ES(1, "portada"), ES(2, "portada"), ES(3, "lugar", { man: 3 }), ES(4, "confirmar", { name: NAME.length, resp: "si", cant: 2, ch: 1, snd: 4, man: 4 })] });
  [].forEach.call(document.querySelectorAll("[data-stp] [data-i]"), function (b) { b.addEventListener("click", function () { nar.go(+b.getAttribute("data-i")); }); });
  (window.GrowiNar = window.GrowiNar || {}).inv = nar;   // solo para pruebas

  /* ---- «Probar la invitación completa»: el módulo real, en un diálogo. Se abre y se cierra solo por acción de la persona. ---- */
  var ov = document.querySelector("[data-ip-o]"), abrir = document.querySelector("[data-ip-abrir]"), cerrar = ov && ov.querySelector("[data-ip-cerrar]"), previo = null, fondo = [];
  if (!ov || !abrir) return;
  function abre() {
    previo = abrir; ov.hidden = false;   /* el botón que abrió el diálogo, aunque no haya recibido foco al hacer clic (Safari, iOS) */ document.documentElement.classList.add("ip-lock");
    fondo = [].filter.call(document.body.children, function (e) { return e !== ov && e.tagName !== "SCRIPT" && e.tagName !== "STYLE" && !e.inert; });
    fondo.forEach(function (e) { e.inert = true; });
    var reg = window.GrowiInvUI && GrowiInvUI.cas; if (reg && reg.reinicio) reg.reinicio();   // siempre arranca desde el principio, con la portada abierta
    cerrar.focus();
  }
  function cierra() {
    ov.hidden = true; document.documentElement.classList.remove("ip-lock"); fondo.forEach(function (e) { e.inert = false; }); fondo = [];
    if (previo) { try { previo.focus({ preventScroll: true }); } catch (e) { previo.focus(); } }
  }
  abrir.addEventListener("click", abre); cerrar.addEventListener("click", cierra);
  ov.addEventListener("click", function (e) { if (e.target === ov) cierra(); });
  /* Escape: con la vista previa de WhatsApp abierta la cierra el módulo; si no, se cierra el diálogo (a nivel documento: el foco puede haber quedado fuera si un botón se ocultó) */
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !ov.hidden && !ov.querySelector("[data-ly=wa]:not([hidden])")) { e.stopPropagation(); cierra(); } }, true);
})();
