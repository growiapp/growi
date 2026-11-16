/* Invitaciones digitales: demo interactiva y pestañas por grupo. Sin dependencias.
   La demo no envía nada a ningún lado: todo ocurre en la página. */
(function () {
  'use strict';

  // ── Tipos de evento (datos ficticios). Cambian portada, mensaje, agenda e información útil ──
  var EVENTS = {
    casamiento: {
      label: 'Casamiento', hint: 'Incluye la agenda del día, el dress code y datos de regalo opcionales.',
      kicker: 'Nos casamos', n: ['Camila', 'y', 'Tomás'], date: 'Sábado 20 de marzo de 2027', to: 'Para: Familia de ejemplo',
      intro: ['Sábado 20 de marzo de 2027', 'El día', 'Con mucho cariño, te esperamos para celebrar con nosotros.'],
      times: [['12:00', 'Recepción', 'Lugar de ejemplo'], ['12:30', 'Ceremonia civil', 'En el jardín'], ['13:30', 'Almuerzo', 'Salón principal'], ['16:00', 'Fiesta', '¡A bailar!']],
      map: 'Cómo llegar',
      extra: [['Dress code', 'Elegante relajado', 'Arreglados y cómodos para disfrutar y bailar. A la noche refresca: traé un abrigo.']],
      gift: 'Acá van los datos que los novios elijan mostrar. Solo los ve este grupo.',
      rsvp: ['¿Nos acompañás?', 'Contanos si venís.', 'Sí, ahí estaré', 'No puedo']
    },
    cumple: {
      label: 'Cumpleaños', hint: 'Incluye el plan de la noche y el tema del festejo, con un tono más informal.',
      kicker: 'Estás invitado', n: ['Martina', 'cumple', '40'], date: 'Viernes 9 de abril de 2027', to: 'Para: Amigos de Martina',
      intro: ['La fiesta', 'Cuarenta vueltas al sol', 'Vení a celebrarlas con música, buena comida y mucho baile.'],
      times: [['21:00', 'Llegada', 'Terraza de ejemplo'], ['21:30', 'Brindis', 'Con todos'], ['22:00', 'Cena', 'Mesa larga'], ['23:30', 'Baile', 'Hasta que aguantemos']],
      map: 'Cómo llegar',
      extra: [['Tema de la noche', 'Naranja y verde', 'Sumate al color del festejo si querés. Es opcional.']],
      gift: null,
      rsvp: ['¿Venís a brindar?', 'Avisanos así preparamos todo.', 'Voy', 'No llego']
    },
    quince: {
      label: 'Quinceañera', hint: 'Incluye el vals, la cena y el baile, con una portada más ornamental.',
      kicker: 'Mis quince', n: ['Lucía', 'XV', ''], date: 'Sábado 13 de marzo de 2027', to: 'Para: Amigos del colegio',
      intro: ['Sábado 13 de marzo de 2027', 'Mi fiesta', 'Una noche para bailar, reírnos y recordar para siempre.'],
      times: [['20:30', 'Recepción', 'Salón de ejemplo'], ['21:00', 'Vals de honor', 'Pista principal'], ['22:00', 'Cena', 'Mesas del salón'], ['23:30', 'Baile', 'Hasta la madrugada']],
      map: 'Cómo llegar',
      extra: [['Dress code', 'De fiesta', 'Una noche para vestirse lindo. Los zapatos cómodos se agradecen en la pista.']],
      gift: null,
      rsvp: ['¿Me acompañás?', 'Confirmá para que no falte tu lugar.', 'Sí, voy', 'No puedo']
    },
    aniversario: {
      label: 'Aniversario', hint: 'Incluye un recorrido de la tarde y un tono más íntimo.',
      kicker: 'Celebramos', n: ['Marta', 'y', 'Raúl'], date: '6 de junio de 2027', to: 'Para: Familia de ejemplo',
      intro: ['30 años juntos', 'Una tarde para brindar', 'Queremos compartir este día con quienes nos acompañaron en el camino.'],
      times: [['13:00', 'Recibimiento', 'Quinta de ejemplo'], ['14:00', 'Almuerzo', 'Galería'], ['16:00', 'Brindis', 'Con todos'], ['16:30', 'Torta y sobremesa', 'En el jardín']],
      map: 'Cómo llegar',
      extra: [['Dress code', 'Elegante, sin corbata', 'Una tarde de familia y amigos. Venite como te guste.']],
      gift: null,
      rsvp: ['¿Brindás con nosotros?', 'Contanos si venís.', 'Sí, voy', 'No puedo']
    },
    bautismo: {
      label: 'Bautismo', hint: 'Incluye la ceremonia y el festejo en familia, con información para los más chicos.',
      kicker: 'Bautismo', n: ['Benjamín', '', ''], date: 'Sábado 24 de abril de 2027', to: 'Para: Familia de ejemplo',
      intro: ['Sábado 24 de abril de 2027', 'Un día en familia', 'Queremos compartir con vos este momento tan especial.'],
      times: [['11:00', 'Ceremonia', 'Parroquia de ejemplo'], ['12:30', 'Almuerzo en familia', 'Casa de ejemplo'], ['15:00', 'Torta', 'En el jardín']],
      map: 'Cómo llegar',
      extra: [['Para tener en cuenta', 'Ropa cómoda', 'Es una celebración en familia. Pensá en los más chicos y en el jardín.']],
      gift: null,
      rsvp: ['¿Nos acompañás?', 'Avisanos cuántos van a venir.', 'Sí, vamos', 'No podemos']
    },
    empresa: {
      label: 'Evento de empresa', hint: 'Incluye una agenda por bloques, la sede y la información práctica del día.',
      kicker: 'Evento corporativo', n: ['Encuentro', 'anual', '2027'], date: 'Jueves 18 de marzo de 2027', to: 'Para: Equipo comercial',
      intro: ['Agenda', 'Un día para alinear el año', 'Jornada de trabajo con presentaciones, talleres por equipos y un cierre para compartir.'],
      times: [['09:00', 'Acreditación', 'Sede de ejemplo'], ['09:30', 'Apertura', 'Auditorio'], ['11:00', 'Talleres por equipos', 'Salas A y B'], ['12:30', 'Almuerzo', 'Patio'], ['15:00', 'Cierre y brindis', 'Terraza']],
      map: 'Cómo llegar a la sede',
      extra: [['Información útil', 'Casual de oficina', 'Traé algo de abrigo para la sala y tu credencial.']],
      gift: null,
      rsvp: ['Confirmá tu asistencia', 'Así organizamos acreditaciones y catering.', 'Confirmo', 'No puedo asistir']
    }
  };

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }

  // Arma el contenido que se recorre dentro del celular
  function buildScroll(e) {
    var f = document.createDocumentFragment(), sec;
    sec = el('section', 'inv-sec');
    sec.appendChild(el('div', 'inv-to', e.to));
    sec.appendChild(el('div', 'inv-eyebrow', e.intro[0]));
    var h = el('h2', 'inv-h is-lg', e.intro[1]); h.setAttribute('data-inv-first', ''); sec.appendChild(h);
    sec.appendChild(el('p', 'inv-p', e.intro[2]));
    var ul = el('ul', 'inv-time'); ul.style.marginTop = '4cqw';
    e.times.forEach(function (t) {
      var li = el('li'), d = el('div');
      li.appendChild(el('time', '', t[0])); d.appendChild(el('b', '', t[1])); d.appendChild(el('span', '', t[2])); li.appendChild(d); ul.appendChild(li);
    });
    sec.appendChild(ul); f.appendChild(sec);

    sec = el('section', 'inv-sec');
    sec.appendChild(el('div', 'inv-eyebrow', 'El lugar'));
    var map = el('div', 'inv-map'); map.setAttribute('aria-hidden', 'true'); sec.appendChild(map);
    var go = el('button', 'inv-btn', e.map + ' (demo)'); go.type = 'button'; go.disabled = true; sec.appendChild(go); f.appendChild(sec);

    e.extra.forEach(function (x) {
      sec = el('section', 'inv-sec');
      sec.appendChild(el('div', 'inv-eyebrow', x[0])); sec.appendChild(el('h2', 'inv-h', x[1])); sec.appendChild(el('p', 'inv-p', x[2])); f.appendChild(sec);
    });
    if (e.gift) {
      sec = el('section', 'inv-sec'); var g = el('div', 'inv-gift'); g.appendChild(el('b', '', 'Regalos')); g.appendChild(document.createTextNode(e.gift)); sec.appendChild(g); f.appendChild(sec);
    }
    sec = el('section', 'inv-sec');
    sec.appendChild(el('div', 'inv-eyebrow', 'Confirmación'));
    sec.appendChild(el('h2', 'inv-h', e.rsvp[0])); sec.appendChild(el('p', 'inv-p', e.rsvp[1]));
    var pills = el('div', 'inv-pills'); pills.setAttribute('role', 'group'); pills.setAttribute('aria-label', 'Tu respuesta');
    [e.rsvp[2], e.rsvp[3]].forEach(function (t) { var b = el('button', 'inv-pill', t); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); pills.appendChild(b); });
    sec.appendChild(pills);
    var send = el('button', 'inv-btn is-fill', 'Enviar confirmación'); send.type = 'button'; send.setAttribute('data-inv-send', ''); sec.appendChild(send);
    var st = el('p', 'inv-status'); st.setAttribute('role', 'status'); st.setAttribute('aria-live', 'polite'); st.setAttribute('data-inv-status', ''); sec.appendChild(st);
    f.appendChild(sec);
    f.appendChild(el('p', 'inv-note', 'Invitación de ejemplo. Datos ficticios.'));
    return f;
  }

  function applyEvent(inv, key) {
    var e = EVENTS[key]; if (!e) return;
    inv.setAttribute('data-ev', key);
    function set(k, v) { var x = inv.querySelector('[data-slot="' + k + '"]'); if (x) x.textContent = v; }
    set('kicker', e.kicker); set('n1', e.n[0]); set('n2', e.n[1]); set('n3', e.n[2]); set('date', e.date);
    inv.querySelectorAll('[data-slot="n2"], [data-slot="n3"]').forEach(function (x) { x.hidden = !x.textContent; });
    var sc = inv.querySelector('[data-inv-scroll]');
    sc.textContent = ''; sc.appendChild(buildScroll(e));
  }

  // ── Demo de invitación ──
  document.querySelectorAll('[data-inv-demo]').forEach(function (inv) {
    var open = inv.querySelector('[data-inv-open]');
    var scroll = inv.querySelector('[data-inv-scroll]');
    var cover = inv.querySelector('.inv-cover');
    var current = inv.getAttribute('data-ev') || 'casamiento';
    applyEvent(inv, current);

    function setOpen(on) {
      inv.classList.toggle('is-open', on);
      if (on) { scroll.removeAttribute('inert'); scroll.removeAttribute('aria-hidden'); cover.setAttribute('inert', ''); }
      else { scroll.setAttribute('inert', ''); scroll.setAttribute('aria-hidden', 'true'); cover.removeAttribute('inert'); scroll.scrollTop = 0; }
    }
    setOpen(false);

    open.addEventListener('click', function () {
      setOpen(true);
      var heading = inv.querySelector('[data-inv-first]');
      if (heading) { heading.setAttribute('tabindex', '-1'); setTimeout(function () { heading.focus({ preventScroll: true }); }, 700); }
    });

    // Los botones de la confirmación se crean con cada evento: se delega el clic
    scroll.addEventListener('click', function (ev) {
      var p = ev.target.closest('.inv-pill');
      if (p) { p.parentElement.querySelectorAll('.inv-pill').forEach(function (o) { o.setAttribute('aria-pressed', o === p ? 'true' : 'false'); }); return; }
      if (ev.target.closest('[data-inv-send]')) { var s = scroll.querySelector('[data-inv-status]'); if (s) s.textContent = 'Esto es una demo: no se envió nada.'; }
    });

    var reset = document.querySelector('[data-inv-reset]');
    if (reset) reset.addEventListener('click', function () { applyEvent(inv, current); setOpen(false); open.focus(); });

    var picker = document.querySelector('[data-event-picker]');
    var hint = document.querySelector('[data-event-hint]');
    var live = document.querySelector('[data-event-live]');
    function choose(key, anim) {
      current = key;
      if (picker) picker.querySelectorAll('[data-event]').forEach(function (o) { o.setAttribute('aria-pressed', o.getAttribute('data-event') === key ? 'true' : 'false'); });
      applyEvent(inv, key); setOpen(false);
      if (hint) hint.textContent = EVENTS[key].hint;
      if (live) live.textContent = 'Ejemplo de invitación: ' + EVENTS[key].label + '.';
      var wa = document.querySelector('[data-demo-wa]');
      if (wa) wa.href = 'https://wa.me/5491170593877?text=' + encodeURIComponent('Hola Growi, quiero una invitación digital para mi evento.\nTipo de evento: ' + EVENTS[key].label + '\nFecha del evento:\nCiudad:\nCantidad aproximada de invitados:\n\nRef: inv-demo\nProducto: invitaciones');
      if (anim) { var scr = inv.parentElement; scr.classList.remove('is-swap'); void scr.offsetWidth; scr.classList.add('is-swap'); }
    }
    if (picker) picker.querySelectorAll('[data-event]').forEach(function (b) { b.addEventListener('click', function () { choose(b.getAttribute('data-event'), true); }); });
    // Los accesos del hero eligen el evento y llevan a la demo
    document.querySelectorAll('[data-goto-event]').forEach(function (a) {
      a.addEventListener('click', function (ev) {
        choose(a.getAttribute('data-goto-event'), false);
        // En pantallas chicas el celular queda debajo de los botones: se lleva la vista directo a él
        if (window.matchMedia('(max-width: 960px)').matches) {
          ev.preventDefault();
          var st = document.querySelector('.demo-stage');
          if (st) st.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
        }
      });
    });
  });

  // ── Pestañas con flechas, Inicio y Fin (grupos de invitados) ──
  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('[role="tabpanel"]'));
    function select(i, focus) {
      tabs.forEach(function (t, j) { t.setAttribute('aria-selected', j === i ? 'true' : 'false'); t.tabIndex = j === i ? 0 : -1; });
      panels.forEach(function (p, j) { p.hidden = j !== i; });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i, false); });
      t.addEventListener('keydown', function (e) {
        var n = tabs.length, k = e.key;
        if (k === 'ArrowDown' || k === 'ArrowRight') { e.preventDefault(); select((i + 1) % n, true); }
        else if (k === 'ArrowUp' || k === 'ArrowLeft') { e.preventDefault(); select((i - 1 + n) % n, true); }
        else if (k === 'Home') { e.preventDefault(); select(0, true); }
        else if (k === 'End') { e.preventDefault(); select(n - 1, true); }
      });
    });
    select(0, false);
  });
})();
