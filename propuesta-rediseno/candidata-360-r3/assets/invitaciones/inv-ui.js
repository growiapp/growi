/* Invitaciones · interacción (F4.2). Une el marcado estático con el núcleo (inv-core.js).
   Reglas: nada avanza solo; el foco solo se mueve por una acción real del usuario (isTrusted); el desplazamiento de la página nunca enfoca;
   sin almacenamiento, sin red, sin cookies; movimiento reducido respetado. */
(function () {
  'use strict';
  var G = window.GrowiInv;
  if (!G) return;
  document.documentElement.classList.add('ix-js');
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var wide = window.matchMedia ? window.matchMedia('(min-width: 960px)') : { matches: true };
  var coarse = window.matchMedia ? window.matchMedia('(pointer: coarse)') : { matches: false };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var behavior = function () { return mq.matches ? 'auto' : 'smooth'; };
  var HEADER = 69;   // alto de la cabecera fija del sitio
  function setInert(el, v) { if (!el) return; if ('inert' in el) el.inert = !!v; if (v) el.setAttribute('aria-hidden', 'true'); else el.removeAttribute('aria-hidden'); }
  // Modal real: todo lo que no es el diálogo ni uno de sus ancestros queda inerte (teclado, toques y lectores de pantalla) mientras está abierto.
  function fondoInerte(dlg, on) {
    if (!dlg || !('inert' in dlg)) return;
    if (on) {
      if (dlg._fondo) return;
      var lista = [], n = dlg;
      while (n && n !== document.documentElement) {
        var p = n.parentNode;
        if (p && p.children) Array.prototype.forEach.call(p.children, function (h) { if (h !== n && !h.inert && h.tagName !== 'SCRIPT' && h.tagName !== 'STYLE' && h.tagName !== 'LINK') { h.inert = true; lista.push(h); } });
        n = p;
      }
      dlg._fondo = lista;
    } else if (dlg._fondo) { dlg._fondo.forEach(function (h) { h.inert = false; }); dlg._fondo = null; }
  }
  function focusSoft(el) { if (el) { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } } }

  var NOCHE = [['21:00', 'Brindis', 'El brindis es a las 21:00: llegá unos minutos antes.'], ['22:00', 'Cena', 'Mesa larga en la terraza, sin lugares marcados. Cada uno se sienta donde quiera.'], ['00:00', 'Torta y baile', 'Se apaga la luz, se canta y se abre la pista. La música sigue hasta las 2.']];
  var MUESTRA = { nombre: 'Camila Rossi', respuesta: 'si', personas: 2 };   // solo para la vista de muestra; nunca se copia al formulario ni al estado
  var registro = {};

  function Exp(root) {
    this.root = root; this.ev = root.getAttribute('data-inv'); this.flow = this.ev === 'emp';
    this.s = G.inicial(this.ev);
    if (this.ev === 'cas') this.s = G.reducir(this.s, { tipo: 'abrir' });   // la página nace con la portada abierta; «chat» es el acto 1 del recorrido
    this.ilus = false; this.ini = this.s; this.cur = null; this.trigger = null; this.timer = null;
    this.layers = $$('[data-ly]', root).filter(function (l) { return l.getAttribute('data-ly') !== 'wa'; });
    this.wa = $('[data-ly=wa]', root); this.form = $('[data-form]', root);
    this.main = $('[data-main]', root); this.sky = this.ev === 'cum' ? root.closest('.ix-cum') : null;
    this.reiniciar = this.ev === 'cas' ? $('[data-ix-reiniciar]') : document.querySelector('[data-ix-reiniciar-ev="' + this.ev + '"]');
    var self = this; $$('[data-msg-ej]', root).forEach(function (e) { e.textContent = G.mensaje(self.ev, MUESTRA) || ''; });   // texto de la muestra: sale del mismo núcleo, con datos ficticios
    this.bind();
    this.render(null, null, false);
    if (this.ev === 'cas') this.abriendo($('[data-ly=portada]', root));
  }
  Exp.prototype.layer = function (n) { return this.layers.filter(function (l) { return l.getAttribute('data-ly') === n; })[0]; };
  Exp.prototype.abriendo = function (el) {
    if (!el || mq.matches) return;
    el.classList.remove('ix-opening'); void el.offsetWidth; el.classList.add('ix-opening');
    setTimeout(function () { el.classList.remove('ix-opening'); }, 1700);
  };

  Exp.prototype.dispatch = function (a, user) {
    var prev = this.s, era = this.ilus; this.ilus = false;   // cualquier acción real deja la muestra
    this.s = G.reducir(prev, a);
    if (this.s === prev) { if (a.tipo === 'preparar' || era) this.render(prev, a, user); return; }
    this.render(prev, a, user);
  };

  Exp.prototype.render = function (prev, a, user) {
    var s = this.s, self = this;
    this.root.setAttribute('data-paso', s.paso);
    if (this.flow) this.renderFlow(); else this.renderLayers(prev);
    // la vista previa de WhatsApp es un diálogo: todo lo demás queda inerte mientras está abierta
    if (this.wa) { if (!s.wa) fondoInerte(this.wa, false); this.wa.hidden = !s.wa; setInert(this.wa, !s.wa); if (s.wa) fondoInerte(this.wa, true); }
    if (this.flow) setInert(this.main, !!s.wa);
    else this.layers.forEach(function (l) { setInert(l, l !== self.layer(self.vis()) || !!s.wa); });
    this.renderForm();
    var rs = this.resumen();
    $$('[data-msg]', this.root).forEach(function (e) { e.textContent = s.mensaje || ''; });
    $$('[data-resum]', this.root).forEach(function (e) { e.textContent = rs; });
    if (this.ev === 'cum') this.renderNoche();
    if (this.flow) this.renderDetalle();
    if (a && user === true) { this.foco(prev, a); this.aVista(a); }
    if (this.ev === 'cas') this.renderPanel();
    this.mostrarReinicio(this.tocada());
  };
  // En cumpleaños el botón conserva su lugar (solo se oculta a la vista) para que el bloque editorial no se mueva al cambiar de momento
  Exp.prototype.mostrarReinicio = function (on) {
    var b = this.reiniciar; if (!b) return;
    if (b.hasAttribute('data-ix-slot')) { if (on) b.removeAttribute('data-off'); else b.setAttribute('data-off', ''); } else b.hidden = !on;
  };
  Exp.prototype.vis = function () { return this.ilus && this.s.paso === 'confirmar' ? 'ejemplo' : (this.s.paso === 'sellada' ? 'chat' : this.s.paso); };
  // vista de muestra del mensaje (solo presentación): no toca las respuestas ni el estado del formulario
  Exp.prototype.muestra = function () { if (this.ilus || this.s.paso !== 'confirmar') return; this.ilus = true; this.render(this.s, null, false); };
  Exp.prototype.tocada = function () {
    var s = this.s, i = this.ini;
    return JSON.stringify(s.datos) !== JSON.stringify(i.datos) || s.mensaje !== null || s.noche !== i.noche || s.detalle !== null || s.wa;
  };

  Exp.prototype.renderLayers = function (prev) {
    var v = this.vis(), next = this.layer(v), old = this.cur ? this.layer(this.cur) : null, self = this;
    if (v === this.cur || !next) return;
    var vieneDeChat = this.cur === 'chat';
    this.cur = v; clearTimeout(this.timer);
    this.layers.forEach(function (l) { l.classList.remove('ix-out', 'ix-in'); if (l !== next && l !== old) l.classList.remove('on'); });
    next.hidden = false; next.classList.add('on'); next.scrollTop = 0;
    if (!old) return;
    if (mq.matches) { old.classList.remove('on'); return; }
    old.classList.remove('on'); old.classList.add('ix-out'); next.classList.add('ix-in');
    if (this.ev === 'cas' && v === 'portada' && vieneDeChat) this.abriendo(next);
    this.timer = setTimeout(function () { old.classList.remove('ix-out'); next.classList.remove('ix-in'); }, 820);
  };

  Exp.prototype.renderFlow = function () {
    var s = this.s, men = s.paso === 'mensaje', conf = this.layer('confirmar'), msg = this.layer('mensaje');
    if (conf) conf.hidden = men; if (msg) msg.hidden = !men;
  };

  Exp.prototype.resumen = function () {
    var s = this.s, ev = G.EVENTOS[this.ev], op = $('input[value=' + (s.datos.respuesta === 'no' ? 'no' : 'si') + ']', this.root), sp = op && op.nextElementSibling;
    if (!s.mensaje) return '';
    var t = G.normalizarNombre(s.datos.nombre) + ' · ' + (sp ? sp.textContent : '');
    if (ev.personas && s.datos.respuesta === 'si') t += ' · ' + (Number(s.datos.personas) === 1 ? '1 persona' : s.datos.personas + ' personas');
    return t;
  };

  Exp.prototype.foco = function (prev, a) {
    var s = this.s, root = this.root, ev = this.ev, t = null;
    if (a.tipo === 'preparar') {
      if (s.paso === 'mensaje') { this.trigger = $('[type=submit]', root); t = $('#ix-' + ev + '-hm', root); }
      else t = s.errores.nombre ? $('[name=nombre]', root) : (s.errores.respuesta ? $('input[type=radio]', root) : $('[data-act=mas]', root));
    } else if (a.tipo === 'editar') t = $('[name=nombre]', root);
    else if (a.tipo === 'wa') t = $('[data-act=cerrar-wa]', root);
    else if (a.tipo === 'cerrar-wa') t = $('[data-act=wa]', root);
    else if (a.tipo === 'abrir') t = $('#ix-cas-hn', root);
    else if (a.tipo === 'ir' || a.tipo === 'acto' || a.tipo === 'siguiente' || a.tipo === 'anterior') {
      var l = this.layer(this.vis());
      if (this.flow) t = s.paso === 'confirmar' ? $('[name=nombre]', root) : (l ? $('[tabindex="-1"]', l) : null);
      else t = l ? $('[tabindex="-1"]', l) : null;
    }
    focusSoft(t);
  };

  // en pantallas chicas el contenido nuevo debe quedar a la vista tras una acción del usuario: la cabecera fija NUNCA tapa el selector de capítulos ni el título.
  // Se mide con los límites reales (cabecera, selector, título); solo se desplaza si algo quedó oculto; jamás mientras la persona escribe en un campo.
  Exp.prototype.aVista = function (a) {
    if (wide.matches && !this.flow) return;
    var tipo = a.tipo; if (!(tipo === 'ir' || tipo === 'acto' || tipo === 'siguiente' || tipo === 'anterior' || tipo === 'abrir' || tipo === 'preparar' || tipo === 'editar')) return;
    var foco = document.activeElement;
    if (foco && this.root.contains(foco) && foco.matches && foco.matches('input[type=text],input:not([type]),textarea')) return;   // no se mueve la página mientras se escribe
    var box = this.flow ? this.layer(this.vis()) : this.root; if (!box) return;
    var cab = $('header.top'), req = (cab ? cab.getBoundingClientRect().bottom : HEADER) + 8, dy = 0, rb = box.getBoundingClientRect(), tope = rb.top;
    if (this.ev === 'cas') {
      var sel = $('.ix-steps'), tit = $('.ix-act.on');
      if (sel && tit && tit.offsetParent) {
        var sr = sel.getBoundingClientRect(), fijo = window.getComputedStyle(sel).position === 'sticky';
        if (fijo) { tope = tit.getBoundingClientRect().top; req += sr.height; }   // el selector queda pegado bajo la cabecera: el título debe quedar debajo de él
        else tope = sr.top;                                                        // el selector se desplaza con la página: él es lo primero que debe verse (el título va justo debajo)
      }
    }
    if (tope < req) dy = tope - req;                                                                                    // algo quedó bajo la cabecera: subir lo mínimo
    else if (!this.flow && !a.tab && rb.bottom > window.innerHeight - 8) dy = Math.min(tope - req, rb.bottom - window.innerHeight + 16);   // lo mínimo para ver la pantalla entera sin ocultar lo de arriba
    if (dy) window.scrollBy({ top: dy, behavior: behavior() });
  };

  Exp.prototype.renderForm = function () {
    var s = this.s, ev = G.EVENTOS[this.ev], root = this.root;
    var nombre = $('[name=nombre]', root);
    if (nombre && nombre.value !== s.datos.nombre && document.activeElement !== nombre) nombre.value = s.datos.nombre;
    $$('input[type=radio]', root).forEach(function (r) { r.checked = s.datos.respuesta === r.value; r.parentNode.classList.toggle('on', r.checked); });
    var pers = $('.ix-pers', root);
    if (pers) {
      pers.hidden = !(ev.personas && s.datos.respuesta === 'si');
      var out = $('[data-cant]', root); if (out) out.textContent = String(s.datos.personas);
      var mas = $('[data-act=mas]', root), menos = $('[data-act=menos]', root);
      if (mas) mas.disabled = s.datos.personas >= G.MAX_PERSONAS; if (menos) menos.disabled = s.datos.personas <= 1;
    }
    $$('[data-err]', root).forEach(function (p) { var m = s.errores[p.getAttribute('data-err')]; p.hidden = !m; p.textContent = m || ''; });
    if (nombre) { if (s.errores.nombre) nombre.setAttribute('aria-invalid', 'true'); else nombre.removeAttribute('aria-invalid'); }
    var fs = $('fieldset', root); if (fs) { if (s.errores.respuesta) fs.setAttribute('data-invalid', 'true'); else fs.removeAttribute('data-invalid'); }
  };

  Exp.prototype.renderNoche = function () {
    var s = this.s, root = this.root, n = NOCHE[s.noche];
    if (this.sky) this.sky.setAttribute('data-t', String(s.noche));
    $('[data-clock]', root).textContent = n[0]; $('[data-nt]', root).textContent = n[1]; $('[data-nd]', root).textContent = n[2];
    $$('.ix-stop', root).forEach(function (b) { var on = Number(b.getAttribute('data-idx')) === s.noche; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
  };

  Exp.prototype.renderDetalle = function () {
    var s = this.s;
    $$('.ix-b', this.root).forEach(function (li) { var b = $('[data-bloque]', li), on = String(s.detalle) === b.getAttribute('data-bloque'); li.classList.toggle('on', on); b.setAttribute('aria-expanded', String(on)); });
  };

  Exp.prototype.renderPanel = function () {
    var act = this.ilus ? 4 : Math.max(1, G.acto(this.s.paso));
    var st = $('[data-ix-story]'); if (st) st.setAttribute('data-act', String(act));
    $$('.ix-act').forEach(function (li) { li.classList.toggle('on', Number(li.getAttribute('data-n')) === act); });
    $$('[data-ix-acto]').forEach(function (b) { if (Number(b.getAttribute('data-ix-acto')) === act) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    $$('[data-ix-pn]').forEach(function (b) { var d = Number(b.getAttribute('data-ix-pn')); b.disabled = (d < 0 && act <= 1) || (d > 0 && act >= 4); });
  };

  Exp.prototype.bind = function () {
    var self = this, root = this.root;
    root.addEventListener('click', function (e) {
      var tg = e.target.closest('[data-act],[data-go],[data-bloque],.ix-stop,.ix-tlb'); if (!tg || !root.contains(tg)) return;
      var u = e.isTrusted, act = tg.getAttribute('data-act');
      if (tg.hasAttribute('data-go')) { self.dispatch({ tipo: 'ir', paso: tg.getAttribute('data-go') }, u); return; }
      if (tg.hasAttribute('data-bloque')) { self.trigger = tg; var id = tg.getAttribute('data-bloque'); self.dispatch(String(self.s.detalle) === id ? { tipo: 'cerrar-detalle' } : { tipo: 'detalle', id: id }, false); return; }
      if (tg.classList.contains('ix-stop')) { self.dispatch({ tipo: 'noche', idx: Number(tg.getAttribute('data-idx')) }, false); return; }
      if (tg.classList.contains('ix-tlb')) { self.toggleMomento(tg); return; }
      if (act === 'abrir') { self.dispatch({ tipo: 'abrir' }, u); return; }
      if (act === 'wa' || act === 'editar' || act === 'cerrar-wa') { self.dispatch({ tipo: act }, u); return; }
      if (act === 'mapa') { var n = $('[data-mapa-nota]', root); if (n) n.hidden = false; return; }
      if (act === 'mas' || act === 'menos') { var p = Math.min(G.MAX_PERSONAS, Math.max(1, Number(self.s.datos.personas) + (act === 'mas' ? 1 : -1))); self.dispatch({ tipo: 'datos', campo: 'personas', valor: p }, false); }
    });
    if (this.form) {
      this.form.addEventListener('focusin', function (e) {
        if (e.target.type === 'radio') e.target.parentNode.classList.toggle('foco', e.target.matches(':focus-visible'));
        // con el teclado virtual abierto, el campo enfocado queda en el centro de lo visible
        if (coarse.matches && e.target.matches('input[type=text]')) setTimeout(function () { try { e.target.scrollIntoView({ block: 'center', behavior: 'auto' }); } catch (x) {} }, 320);
      });
      this.form.addEventListener('focusout', function (e) { if (e.target.type === 'radio') e.target.parentNode.classList.remove('foco'); });
      this.form.addEventListener('input', function (e) { if (e.target.name === 'nombre') self.dispatch({ tipo: 'datos', campo: 'nombre', valor: e.target.value }, false); });
      this.form.addEventListener('change', function (e) { if (e.target.type === 'radio') self.dispatch({ tipo: 'datos', campo: 'respuesta', valor: e.target.value }, false); });
      this.form.addEventListener('submit', function (e) { e.preventDefault(); self.dispatch({ tipo: 'preparar' }, e.isTrusted !== false); });
    }
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && self.s.wa) { e.preventDefault(); self.dispatch({ tipo: 'cerrar-wa' }, e.isTrusted); return; }
      if (e.key === 'Tab' && self.s.wa && self.wa) {   // el diálogo retiene el foco
        var f = $$('button:not(:disabled)', self.wa), a = f[0], z = f[f.length - 1];
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
      var st = e.target.closest && e.target.closest('.ix-stop');
      if (st) {   // grupo de radios: flechas, Inicio y Fin
        var k = e.key, i = self.s.noche, n = null;
        if (k === 'ArrowLeft' || k === 'ArrowUp') n = i - 1; else if (k === 'ArrowRight' || k === 'ArrowDown') n = i + 1; else if (k === 'Home') n = 0; else if (k === 'End') n = 2;
        if (n === null) return; e.preventDefault(); n = Math.min(2, Math.max(0, n));
        self.dispatch({ tipo: 'noche', idx: n }, e.isTrusted); $$('.ix-stop', root)[n].focus();
      }
    });
    if (this.reiniciar) this.reiniciar.addEventListener('click', function () { self.reinicio(); });
    $$('.ix-tli', root).forEach(function (li, i) { li.classList.toggle('on', i === 0); });
  };

  Exp.prototype.toggleMomento = function (btn) {
    var abierto = btn.getAttribute('aria-expanded') === 'true';
    $$('.ix-tlb', this.root).forEach(function (b) { b.setAttribute('aria-expanded', 'false'); b.parentNode.classList.remove('on'); });
    if (!abierto) { btn.setAttribute('aria-expanded', 'true'); btn.parentNode.classList.add('on'); }
  };

  Exp.prototype.reinicio = function () {
    var self = this;
    this.ilus = false; this.s = G.inicial(this.ev); if (this.ev === 'cas') this.s = G.reducir(this.s, { tipo: 'abrir' });
    if (this.form) this.form.reset();
    $$('.ix-tlb', this.root).forEach(function (b, i) { b.setAttribute('aria-expanded', String(i === 0)); b.parentNode.classList.toggle('on', i === 0); });
    var n = $('[data-mapa-nota]', this.root); if (n) n.hidden = true;
    this.render(null, null, false);
    if (this.ev === 'cas') this.abriendo(this.layer('portada'));
    this.mostrarReinicio(false);
  };

  // ---------------------------------------------------------------- recorrido de la página (casamiento)
  function Historia(cas) {
    var self = this, root = $('[data-ix-story]');
    if (!root) return;
    this.cas = cas; this.root = root;
    var sents = $$('.ix-sent', root), hero = $('.ix-hero', root), titulos = $$('.ix-act-b', root);
    // en pantallas chicas el título del capítulo es solo un título (los pasos de arriba son los controles)
    var sync = function () { titulos.forEach(function (b) { b.disabled = !wide.matches; }); };
    sync(); if (wide.addEventListener) wide.addEventListener('change', sync);
    $$('[data-ix-acto]', root).forEach(function (b) {
      b.addEventListener('click', function (e) {
        var n = Number(b.getAttribute('data-ix-acto'));
        if (wide.matches) { var s = sents[n - 1]; if (s) s.scrollIntoView({ block: 'center', behavior: behavior() }); }
        self.ir(n);
        if (!wide.matches) cas.aVista({ tipo: 'ir', tab: !b.hasAttribute('data-ix-pn') && !b.classList.contains('ix-act-b') });   // con las pestañas solo se corrige un título que quedó oculto: el selector no se mueve
      });
    });
    // Anterior / Siguiente (solo en pantallas angostas): cambian de capítulo y llevan el foco al título del capítulo nuevo
    $$('[data-ix-pn]', root).forEach(function (b) {
      b.addEventListener('click', function (e) {
        var act = Number(root.getAttribute('data-act')) || 1, n = Math.min(4, Math.max(1, act + Number(b.getAttribute('data-ix-pn'))));
        if (n === act) return;
        self.ir(n);
        var l = cas.layer(cas.vis()); if (e.isTrusted && l) focusSoft($('[tabindex="-1"]', l));
        cas.aVista({ tipo: 'ir' });
      });
    });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting && wide.matches) self.ir(e.target === hero ? 0 : Number(e.target.getAttribute('data-n'))); });
      }, { rootMargin: '-45% 0px -45% 0px' });
      sents.forEach(function (s) { io.observe(s); });
      if (hero) io.observe(hero);
    }
  }
  // lo que muestra la pantalla en cada acto. El desplazamiento solo cambia la pantalla: nunca mueve el foco ni pisa lo que la persona está escribiendo.
  // Decisión pura: qué hace el recorrido en cada capítulo según el estado y si la persona está escribiendo.
  // Nunca devuelve una acción 'datos': el desplazamiento y los capítulos no escriben respuestas. 'muestra' es solo presentación.
  function accionesDeActo(s, n, escribiendo) {
    if (s.wa) return [];
    if (escribiendo && n !== 3) return [];   // un campo de texto en uso no se pisa
    if (n === 0) return s.paso !== 'portada' ? [{ tipo: 'ir', paso: 'portada' }] : [];
    if (n === 1) return [{ tipo: 'ir', paso: 'chat' }];
    if (n === 2) return [{ tipo: 'ir', paso: s.paso === 'lugar' ? 'lugar' : 'programa' }];
    if (n === 3) return [{ tipo: 'ir', paso: 'confirmar' }];
    if (s.paso === 'mensaje') return [];
    if (G.validar('cas', s.datos).ok) return [{ tipo: 'preparar' }];   // con respuestas válidas, el mensaje sale de ellas
    return (s.paso !== 'confirmar' ? [{ tipo: 'ir', paso: 'confirmar' }] : []).concat([{ tipo: 'muestra' }]);   // sin ellas, una muestra aparte
  }
  Historia.prototype.ir = function (n) {
    var c = this.cas, a = document.activeElement;
    var escribiendo = !!(a && c.root.contains(a) && (a.tagName === 'TEXTAREA' || (a.tagName === 'INPUT' && a.type === 'text')));
    accionesDeActo(c.s, n, escribiendo).forEach(function (x) { if (x.tipo === 'muestra') c.muestra(); else c.dispatch(x, false); });
  };

  function montar() {
    $$('[data-inv]').forEach(function (r) { registro[r.getAttribute('data-inv')] = new Exp(r); });
    if (registro.cas) new Historia(registro.cas);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar); else montar();
  Object.defineProperty(registro, 'accionesDeActo', { value: accionesDeActo });   // solo para pruebas
  window.GrowiInvUI = registro;
})();
