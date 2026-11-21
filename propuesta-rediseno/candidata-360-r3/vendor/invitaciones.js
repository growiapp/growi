/* Invitaciones digitales: explorador de tres experiencias y demo de personalización por perfiles.
   Sin dependencias. Todo es contenido ficticio y nada se envía: la «confirmación» de las demos solo muestra un aviso.
   Las interacciones de cada experiencia (capítulos, tarjetas, filtro de agenda) son parte de la demostración, no funciones de un plan. */
(function () {
  'use strict';

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
  function reduced() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function behavior() { return reduced() ? 'auto' : 'smooth'; }
  function btn(text, cls, disabled) { var b = el('button', cls || 'inv-btn', text); b.type = 'button'; if (disabled) b.disabled = true; return b; }

  // ── Experiencias (datos ficticios) ──
  var EXP = {
    casamiento: {
      evento: 'Casamiento de Camila y Tomás', label: 'casamiento', live: 'Casamiento: recorrido por capítulos.',
      kicker: 'Nos casamos', n: ['Camila', 'y', 'Tomás'], date: 'Sábado 20 de marzo de 2027', to: 'Para: Familia de ejemplo'
    },
    cumple: {
      evento: 'Cumpleaños de Martina', label: 'cumpleaños', live: 'Cumpleaños: tarjetas que se deslizan.',
      kicker: 'Estás invitado', n: ['Martina', 'cumple', '40'], date: 'Viernes 9 de abril de 2027', to: 'Para: Amigos de Martina'
    },
    empresa: {
      evento: 'Encuentro anual 2027', label: 'evento de empresa', live: 'Evento de empresa: agenda por bloques.',
      kicker: 'Evento corporativo', n: ['Encuentro', 'anual', '2027'], date: 'Jueves 18 de marzo de 2027', to: 'Para: Equipo comercial'
    }
  };

  // ── Piezas compartidas ──
  function agenda(rows) {
    var ul = el('ul', 'inv-time');
    rows.forEach(function (t) {
      var li = el('li'), d = el('div');
      li.appendChild(el('time', '', t[0])); d.appendChild(el('b', '', t[1])); d.appendChild(el('span', '', t[2])); li.appendChild(d);
      if (t[3]) li.setAttribute('data-part', t[3]);
      ul.appendChild(li);
    });
    return ul;
  }
  function mapBlock(go) {
    var f = document.createDocumentFragment();
    var m = el('div', 'inv-map'); m.setAttribute('aria-hidden', 'true'); f.appendChild(m);
    f.appendChild(btn(go + ' (demo)', 'inv-btn', true));
    return f;
  }
  // Confirmación simple: un botón que, en una invitación real, abre WhatsApp con quien organiza el evento y un mensaje
  // listo para revisar y enviar. En esta demo solo se muestra el mensaje: no se abre ningún chat ni se envía nada.
  function rsvp(title, text, e) {
    var f = document.createDocumentFragment();
    f.appendChild(el('h2', 'inv-h', title)); f.appendChild(el('p', 'inv-p', text));
    if (!window.GrowiEnlaces) return f;
    var b = btn('Confirmar asistencia', 'inv-btn is-fill'); b.setAttribute('data-inv-confirm', ''); b.setAttribute('aria-expanded', 'false'); f.appendChild(b);
    var w = el('div', 'inv-wa'); w.hidden = true; w.setAttribute('data-inv-wa', ''); w.setAttribute('role', 'status'); w.setAttribute('aria-live', 'polite');
    w.appendChild(el('p', 'inv-wa-title', 'Así se abre WhatsApp'));
    w.appendChild(el('p', 'inv-wa-bubble', window.GrowiEnlaces.mensajeConfirmacion({ evento: e.evento, fecha: e.date })));
    w.appendChild(el('p', 'inv-wa-note', 'Va dirigido a quien organiza el evento. Lo revisás, lo completás y lo enviás vos. Esta demo no envía nada.'));
    f.appendChild(w);
    return f;
  }
  function section(eyebrow, titleEl) { var s = el('section', 'inv-sec'); if (eyebrow) s.appendChild(el('div', 'inv-eyebrow', eyebrow)); if (titleEl) s.appendChild(titleEl); return s; }
  function first(h) { h.setAttribute('data-inv-first', ''); return h; }

  // ── Casamiento: recorrido editorial por capítulos ──
  function renderCasamiento(inv, scroll, e) {
    var chapters = ['El día', 'El lugar', 'Cómo venir', 'Tu respuesta'];
    var nav = el('nav', 'inv-chapters'); nav.setAttribute('aria-label', 'Capítulos de la invitación');
    var secs = [];
    chapters.forEach(function (c, i) { var b = el('button', '', c); b.type = 'button'; b.addEventListener('click', function () { scroll.scrollTo({ top: Math.max(0, secs[i].offsetTop - nav.offsetHeight), behavior: behavior() }); }); nav.appendChild(b); });
    scroll.appendChild(nav);

    var s1 = section('Capítulo 1 · ' + e.date, first(el('h2', 'inv-h is-lg', 'El día')));
    s1.insertBefore(el('div', 'inv-to', e.to), s1.firstChild);
    s1.appendChild(el('p', 'inv-p', 'Con mucho cariño, te esperamos para celebrar con nosotros.'));
    var ul = agenda([['17:00', 'Ceremonia', 'Capilla de ejemplo'], ['20:00', 'Cena', 'Salón de ejemplo'], ['22:30', 'Fiesta', '¡A bailar!']]); ul.style.marginTop = '4cqw'; s1.appendChild(ul);

    var s2 = section('Capítulo 2 · El lugar', el('h2', 'inv-h', 'Dos lugares, un mismo día'));
    s2.appendChild(el('p', 'inv-p', 'La ceremonia es en la capilla y la celebración sigue en el salón.'));
    s2.appendChild(mapBlock('Cómo llegar'));

    var s3 = section('Capítulo 3 · Cómo venir', el('h2', 'inv-h', 'Elegante relajado'));
    s3.appendChild(el('p', 'inv-p', 'Arreglados y cómodos para disfrutar y bailar. A la noche refresca: traé un abrigo.'));

    var s4 = section('Capítulo 4 · Tu respuesta'); s4.appendChild(rsvp('¿Nos acompañás?', 'Avisanos por WhatsApp si venís.', e));
    secs = [s1, s2, s3, s4]; secs.forEach(function (s) { scroll.appendChild(s); });
    scroll.appendChild(el('p', 'inv-note', 'Invitación de ejemplo. Datos ficticios.'));

    var btns = nav.querySelectorAll('button'), ticking = false;
    function mark() {
      var y = scroll.scrollTop + nav.offsetHeight + 12, cur = 0;
      secs.forEach(function (s, i) { if (s.offsetTop <= y) cur = i; });
      if (scroll.scrollTop + scroll.clientHeight >= scroll.scrollHeight - 4) cur = secs.length - 1;
      btns.forEach(function (b, i) { if (i === cur) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      ticking = false;
    }
    scroll.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(mark); } });
    mark();
  }

  // ── Cumpleaños: tarjetas, una idea por pantalla ──
  function renderCumple(inv, scroll, e) {
    scroll.classList.add('is-deck');
    var cards = [];
    function card(label, build) { var c = el('section', 'inv-card'); c.setAttribute('role', 'group'); c.setAttribute('aria-roledescription', 'tarjeta'); c.setAttribute('aria-label', label); build(c); cards.push(c); scroll.appendChild(c); }
    card('Cuándo', function (c) {
      c.appendChild(el('div', 'inv-to', e.to)); c.appendChild(el('div', 'inv-eyebrow', 'La fiesta'));
      c.appendChild(first(el('h2', 'inv-h is-lg inv-big', 'Viernes 9 de abril'))); c.appendChild(el('p', 'inv-p inv-time-big', 'a las 21:00'));
      c.appendChild(el('p', 'inv-p', 'Cuarenta vueltas al sol. Vení a celebrarlas con música, buena comida y mucho baile.'));
    });
    card('Dónde', function (c) { c.appendChild(el('div', 'inv-eyebrow', 'El lugar')); c.appendChild(el('h2', 'inv-h', 'Terraza de ejemplo')); c.appendChild(el('p', 'inv-p', 'Calle de Ejemplo 800, Ciudad de Ejemplo')); c.appendChild(mapBlock('Cómo llegar')); });
    card('El plan', function (c) { c.appendChild(el('div', 'inv-eyebrow', 'El plan')); c.appendChild(el('h2', 'inv-h', 'La noche')); c.appendChild(agenda([['21:00', 'Llegada', 'Terraza'], ['21:30', 'Brindis', 'Con todos'], ['22:00', 'Cena', 'Mesa larga'], ['23:30', 'Baile', 'Hasta que aguantemos']])); });
    card('El tema', function (c) { c.appendChild(el('div', 'inv-eyebrow', 'Tema de la noche')); c.appendChild(el('h2', 'inv-h', 'Naranja y verde')); c.appendChild(el('p', 'inv-p', 'Sumate al color del festejo si querés. Es opcional.')); });
    card('Tu respuesta', function (c) { c.appendChild(el('div', 'inv-eyebrow', 'Respuesta')); c.appendChild(rsvp('¿Venís a brindar?', 'Avisanos por WhatsApp así preparamos todo.', e)); });

    var ctr = el('div', 'inv-controls');
    var prev = el('button', 'inv-nav', '‹'); prev.type = 'button'; prev.setAttribute('aria-label', 'Tarjeta anterior');
    var next = el('button', 'inv-nav', '›'); next.type = 'button'; next.setAttribute('aria-label', 'Tarjeta siguiente');
    var count = el('span', 'inv-count'); count.setAttribute('role', 'status'); count.setAttribute('aria-live', 'polite');
    ctr.appendChild(prev); ctr.appendChild(count); ctr.appendChild(next); inv.appendChild(ctr);
    function idx() { return Math.round(scroll.scrollLeft / Math.max(1, scroll.clientWidth)); }
    function upd() { var i = idx(); count.textContent = (i + 1) + ' de ' + cards.length; prev.disabled = i === 0; next.disabled = i === cards.length - 1; }
    function go(d) { scroll.scrollTo({ left: (idx() + d) * scroll.clientWidth, behavior: behavior() }); }
    prev.addEventListener('click', function () { go(-1); }); next.addEventListener('click', function () { go(1); });
    var t; scroll.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(upd, 60); });
    upd();
  }

  // ── Evento de empresa: agenda por bloques, con filtro por franja ──
  function renderEmpresa(inv, scroll, e) {
    var s1 = section('Agenda', first(el('h2', 'inv-h is-lg', 'Un día para alinear el año')));
    s1.insertBefore(el('div', 'inv-to', e.to), s1.firstChild);
    s1.appendChild(el('p', 'inv-p', 'Jornada de trabajo con presentaciones, talleres por equipos y un cierre para compartir.'));
    var f = el('div', 'inv-filter'); f.setAttribute('role', 'group'); f.setAttribute('aria-label', 'Filtrar la agenda');
    var ul = agenda([['09:00', 'Acreditación', 'Hall de entrada', 'm'], ['09:30', 'Apertura', 'Auditorio', 'm'], ['11:00', 'Talleres por equipos', 'Salas A y B', 'm'], ['12:30', 'Almuerzo', 'Patio', 'm'], ['14:30', 'Mesa de trabajo', 'Salas A y B', 't'], ['16:30', 'Cierre y brindis', 'Terraza', 't']]);
    [['Todo el día', ''], ['Mañana', 'm'], ['Tarde', 't']].forEach(function (o, i) {
      var b = el('button', '', o[0]); b.type = 'button'; b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      b.addEventListener('click', function () {
        f.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        ul.querySelectorAll('li').forEach(function (li) { li.hidden = !!o[1] && li.getAttribute('data-part') !== o[1]; });
      });
      f.appendChild(b);
    });
    s1.appendChild(f); s1.appendChild(ul); scroll.appendChild(s1);

    var s2 = section('La sede', el('h2', 'inv-h', 'Centro de eventos de ejemplo'));
    s2.appendChild(el('p', 'inv-p', 'Av. de Ejemplo 1500, Ciudad de Ejemplo')); s2.appendChild(mapBlock('Cómo llegar a la sede')); scroll.appendChild(s2);

    var s3 = section('Antes de venir', el('h2', 'inv-h', 'Información práctica'));
    s3.appendChild(el('p', 'inv-p', 'Llevá tu credencial y algo de abrigo para la sala. Hay estacionamiento en la sede.')); scroll.appendChild(s3);

    var s4 = section('Confirmación'); s4.appendChild(rsvp('Confirmá tu asistencia', 'Así organizamos acreditaciones y catering.', e)); scroll.appendChild(s4);
    scroll.appendChild(el('p', 'inv-note', 'Invitación de ejemplo. Datos ficticios.'));
  }

  var RENDER = { casamiento: renderCasamiento, cumple: renderCumple, empresa: renderEmpresa };

  function applyExperience(inv, key) {
    var e = EXP[key]; if (!e) return;
    var scroll = inv.querySelector('[data-inv-scroll]');
    inv.setAttribute('data-ev', key);
    function set(k, v) { var x = inv.querySelector('[data-slot="' + k + '"]'); if (x) x.textContent = v; }
    set('kicker', e.kicker); set('n1', e.n[0]); set('n2', e.n[1]); set('n3', e.n[2]); set('date', e.date);
    inv.querySelectorAll('[data-slot="n2"], [data-slot="n3"]').forEach(function (x) { x.hidden = !x.textContent; });
    var old = inv.querySelector('.inv-controls'); if (old) old.parentNode.removeChild(old);
    scroll.className = 'inv-scroll'; scroll.scrollLeft = 0; scroll.scrollTop = 0; scroll.textContent = '';
    RENDER[key](inv, scroll, e);
  }

  // ── Explorador ──
  document.querySelectorAll('[data-inv-demo]').forEach(function (inv) {
    var open = inv.querySelector('[data-inv-open]');
    var scroll = inv.querySelector('[data-inv-scroll]');
    var cover = inv.querySelector('.inv-cover');
    var current = inv.getAttribute('data-ev') || 'casamiento';
    applyExperience(inv, current);

    function setOpen(on) {
      inv.classList.toggle('is-open', on);
      if (on) { scroll.removeAttribute('inert'); scroll.removeAttribute('aria-hidden'); cover.setAttribute('inert', ''); }
      else { scroll.setAttribute('inert', ''); scroll.setAttribute('aria-hidden', 'true'); cover.removeAttribute('inert'); scroll.scrollTop = 0; scroll.scrollLeft = 0; }
      var c = inv.querySelector('.inv-controls'); if (c) { if (on) c.removeAttribute('inert'); else c.setAttribute('inert', ''); c.hidden = !on; }
    }
    setOpen(false);

    open.addEventListener('click', function (ev) {
      setOpen(true);
      var heading = inv.querySelector('[data-inv-first]');
      if (heading && ev.isTrusted) { heading.setAttribute('tabindex', '-1'); setTimeout(function () { heading.focus({ preventScroll: true }); }, 700); }
    });

    // El botón de confirmación se crea con cada experiencia: se delega el clic. Muestra u oculta la vista previa del mensaje.
    inv.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-inv-confirm]'); if (!b) return;
      var w = b.parentElement.querySelector('[data-inv-wa]'); if (!w) return;
      w.hidden = !w.hidden; b.setAttribute('aria-expanded', w.hidden ? 'false' : 'true');
      if (!w.hidden) setTimeout(function () { w.scrollIntoView({ block: 'nearest', behavior: behavior() }); }, 50);
    });

    var reset = document.querySelector('[data-inv-reset]');
    if (reset) reset.addEventListener('click', function () { applyExperience(inv, current); setOpen(false); open.focus(); });

    var picker = document.querySelector('[data-event-picker]');
    var live = document.querySelector('[data-event-live]');
    function choose(key) {
      current = key;
      if (picker) picker.querySelectorAll('[data-event]').forEach(function (o) { o.setAttribute('aria-pressed', o.getAttribute('data-event') === key ? 'true' : 'false'); });
      applyExperience(inv, key); setOpen(false);
      if (live) live.textContent = EXP[key].live;
      // El enlace de presupuesto de la demo lleva el contexto de lo que se vio, en palabras naturales
      var wa = document.querySelector('[data-demo-wa]');
      if (wa) wa.href = 'https://wa.me/5491170593877?text=' + encodeURIComponent('Hola Growi, vi la demo de invitación de ' + EXP[key].label + ' y quiero consultar por una para mi evento.\n\nFecha del evento:\nCiudad:');
      var scr = inv.parentElement; scr.classList.remove('is-swap'); void scr.offsetWidth; scr.classList.add('is-swap');
    }
    if (picker) picker.querySelectorAll('[data-event]').forEach(function (b) { b.addEventListener('click', function () { choose(b.getAttribute('data-event')); }); });
  });

  // ── Personalización: una invitación, tres perfiles ficticios ──
  var PROFILES = {
    cercana: {
      label: 'Familia cercana', title: 'Ceremonia, cena y fiesta',
      intro: 'Los esperamos desde la ceremonia hasta el último baile.',
      agenda: [['17:00', 'Ceremonia', 'Capilla de ejemplo'], ['20:00', 'Cena', 'Salón de ejemplo'], ['22:30', 'Fiesta', 'Salón de ejemplo']],
      places: [['Capilla de ejemplo', 'Calle de Ejemplo 100'], ['Salón de ejemplo', 'Av. de Ejemplo 500']],
      info: 'Dress code elegante. Si querés hacernos un regalo, acá van los datos.',
      how: 'Llegá 20 minutos antes de la ceremonia. Hay lugar para estacionar sobre Calle de Ejemplo.'
    },
    amigos: {
      label: 'Amigos de la pareja', title: 'Cena y fiesta',
      intro: 'Nos encantaría compartir la noche con ustedes.',
      agenda: [['20:00', 'Cena', 'Salón de ejemplo'], ['22:30', 'Fiesta', 'Salón de ejemplo']],
      places: [['Salón de ejemplo', 'Av. de Ejemplo 500']],
      info: 'Dress code elegante relajado. Hay un micro que sale del centro a las 19:15, desde un punto de encuentro de ejemplo.',
      how: 'El salón tiene estacionamiento propio, con acceso por la avenida.'
    },
    fiesta: {
      label: 'Invitados solo a la fiesta', title: 'La fiesta',
      intro: 'Vení a bailar con nosotros.',
      agenda: [['22:30', 'Fiesta', 'Salón de ejemplo']],
      places: [['Salón de ejemplo, entrada lateral', 'Av. de Ejemplo 500']],
      info: 'Ropa cómoda para bailar. El brindis es a las 23:00.',
      how: 'Ingresás por el portón lateral, sobre Calle Muestra. No hace falta pasar por el salón principal.'
    }
  };
  document.querySelectorAll('[data-profiles]').forEach(function (root) {
    var scroll = root.querySelector('[data-profile-scroll]');
    var live = root.querySelector('[data-profile-live]');
    var last = null;
    function block(k, label) { var d = el('div', 'inv-block'); d.setAttribute('data-k', k); d.appendChild(el('h3', 'inv-mini', label)); return d; }
    function render(key, announce) {
      var pr = PROFILES[key], cur = {}, f = document.createDocumentFragment();
      var head = el('section', 'inv-sec');
      head.appendChild(el('div', 'inv-to', 'Vista de: ' + pr.label)); head.appendChild(el('h2', 'inv-h', pr.title)); head.appendChild(el('p', 'inv-p', pr.intro));
      var a = block('agenda', 'Agenda'); a.appendChild(agenda(pr.agenda)); cur.agenda = a;
      var pl = block('lugares', pr.places.length > 1 ? 'Lugares' : 'Lugar');
      pr.places.forEach(function (p) { var d = el('div', 'inv-place'); d.appendChild(el('b', '', p[0])); d.appendChild(el('span', '', p[1])); pl.appendChild(d); });
      var m = el('div', 'inv-map'); m.setAttribute('aria-hidden', 'true'); pl.appendChild(m); cur.lugares = pl;
      var inf = block('info', 'Para tener en cuenta'); inf.appendChild(el('p', 'inv-p', pr.info)); cur.info = inf;
      var how = block('como', 'Cómo llegar'); how.appendChild(el('p', 'inv-p', pr.how)); cur.como = how;
      var names = { agenda: 'la agenda', lugares: 'los lugares', info: 'la información', como: 'cómo llegar' }, changed = [];
      ['agenda', 'lugares', 'info', 'como'].forEach(function (k) {
        if (last && last[k] !== cur[k].textContent) { cur[k].classList.add('is-changed'); changed.push(names[k]); }
        head.appendChild(cur[k]);
      });
      f.appendChild(head); f.appendChild(el('p', 'inv-note', 'Perfil ficticio de ejemplo.'));
      scroll.textContent = ''; scroll.appendChild(f); scroll.scrollTop = 0;
      last = {}; Object.keys(cur).forEach(function (k) { last[k] = cur[k].textContent; });
      if (announce && live) live.textContent = 'Vista de: ' + pr.label + (changed.length ? '. Cambió ' + changed.join(', ') + '.' : '.');
    }
    render('cercana', false);
    root.querySelectorAll('[data-profile]').forEach(function (b) {
      b.addEventListener('click', function () {
        root.querySelectorAll('[data-profile]').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
        render(b.getAttribute('data-profile'), true);
      });
    });
  });
})();
