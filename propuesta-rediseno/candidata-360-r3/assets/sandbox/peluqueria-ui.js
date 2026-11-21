/* Growi · sandbox de Peluquería · interfaz.
   Solo arma DOM y responde a eventos. Reglas, validaciones, disponibilidad, cálculos y mensajes vienen de peluqueria.js (F1) y peluqueria-vista.js.
   El reloj solo avanza cuando la persona lo pide: ningún turno se inicia, finaliza ni cobra por pasar el tiempo.
   Nada se guarda en el navegador ni se envía a ningún lado. */
(function () {
  'use strict';
  var G = window.GrowiSandbox, core = G.core, pelu = G.peluqueria, V = G.peluqueriaVista, S = pelu.sel;
  var pesos = core.pesos, fmt = core.fmtHM, store = pelu.crear(), ui, PPM = 1.47;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* ───────── íconos (trazo 1,75 px) ───────── */
  var IC = {
    agenda: '<rect x="3.500" y="5" width="17" height="15.500" rx="2.500"/><path d="M3.500 10h17M8 3v4M16 3v4"/>',
    caja: '<rect x="3" y="6.500" width="18" height="11" rx="2"/><circle cx="12" cy="12" r="2.500"/><path d="M6.500 9.500v5M17.500 9.500v5"/>',
    equipo: '<circle cx="9" cy="8.500" r="3.200"/><path d="M3.500 19c.500-3.300 2.700-5 5.500-5s5 1.700 5.500 5"/><circle cx="17" cy="9.500" r="2.500"/><path d="M16.500 14.200c2.200.200 3.700 1.700 4 4.300"/>',
    reloj: '<circle cx="12" cy="12" r="8.500"/><path d="M12 7.500V12l3 2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', close: '<path d="M6 6l12 12M18 6L6 18"/>', check: '<path d="M5 12.500l4.500 4.500L19 7.500"/>',
    chev: '<path d="M9 5l7 7-7 7"/>', alert: '<path d="M12 4l9 16H3L12 4z"/><path d="M12 10v4.500M12 17.300v.01"/>',
    reset: '<path d="M4.500 12a7.500 7.500 0 102.300-5.400"/><path d="M4.500 4.500v4.800h4.800"/>', route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6.500a3 3 0 000-6h-5a3 3 0 010-6H16"/>',
    play: '<path d="M8 5.500v13l10.500-6.500L8 5.500z"/>', stop: '<rect x="6.500" y="6.500" width="11" height="11" rx="2"/>', user: '<circle cx="12" cy="8.500" r="3.500"/><path d="M5 20c.600-4 3.300-6 7-6s6.400 2 7 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.500M12 7.800v.01"/>'
  };
  function ico(n, c) { return '<svg class="ico' + (c ? ' ' + c : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IC[n] + '</svg>'; }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function signo(n) { return (n > 0 ? '+' : n < 0 ? '−' : '') + pesos(Math.abs(n)); }
  function rango(a, b) { return fmt(a) + '–' + fmt(b); }

  function nuevoNuevo() { return { cliente: '', servicios: [], prof: null, inicio: null }; }
  function nuevoUI() {
    return { vista: 'agenda', sel: null, modo: null, nuevo: nuevoNuevo(), medio: 'efectivo', guia: true, guiaMax: false, inicio: store.getState(), ultima: null, vistoImpacto: false,
             visto: { caja: true, equipo: true }, tab: 'camila', relojAbierto: false, msg: '', flash: null, sheet: false, scrollear: true };
  }
  ui = nuevoUI();

  var liveT;
  function anunciar(t) { var l = $('#live'); l.textContent = ''; clearTimeout(liveT); liveT = setTimeout(function () { l.textContent = t; }, 40); }
  function prof(s, id) { return S.profesionales(s).filter(function (p) { return p.id === id; })[0]; }
  function inicial(n) { return n.charAt(0); }
  function nombreServ(s, ids) { var cat = S.servicios(s); return ids.map(function (i) { return cat.filter(function (x) { return x.id === i; })[0].nombre; }).join(' + '); }

  /* ───────── encabezado y navegación ───────── */
  var VISTAS = [['agenda', 'Agenda'], ['caja', 'Caja'], ['equipo', 'Equipo']];
  function tabsHTML(cls) {
    return VISTAS.map(function (v) {
      var nuevo = v[0] !== 'agenda' && !ui.visto[v[0]];
      return '<button type="button" class="tab' + (ui.vista === v[0] ? ' on' : '') + '" data-act="ir" data-v="' + v[0] + '" data-k="' + cls + '-' + v[0] + '"' + (ui.vista === v[0] ? ' aria-current="page"' : '') + '>' + ico(v[0]) + '<span>' + v[1] + '</span>' +
        (nuevo ? '<i class="dot" aria-hidden="true"></i><span class="sr-only"> (actualizada)</span>' : '') + '</button>';
    }).join('');
  }
  function topHTML(s) {
    var hitos = S.proximosHitos(s).slice(0, 4), pasos = [15, 30, 60], J = s.jornada;
    var pop = '';
    if (ui.relojAbierto) {
      pop = '<div class="reloj-pop" role="group" aria-label="Avanzar el reloj"><p class="rp-t">Avanzar el reloj</p><p class="rp-n">Pasar el tiempo no inicia, finaliza ni cobra ningún turno: eso lo hacés vos.</p>' +
        (hitos.length ? '<ul class="rp-h">' + hitos.map(function (h) {
          var t = S.turno(s, h.turno);
          return '<li><button type="button" class="rp-b" data-act="avanzar" data-h="' + h.t + '" data-k="rp-h-' + h.t + '-' + h.turno + '"><b>' + fmt(h.t) + '</b><span>' + (h.tipo === 'inicio-turno' ? 'Empieza ' + esc(t.cliente) : 'Termina ' + esc(t.cliente)) + '</span></button></li>';
        }).join('') + '</ul>' : '') +
        '<div class="rp-q">' + pasos.map(function (p) {
          var h = s.reloj + p, off = h > J.cierre;
          return '<button type="button" class="btn-sec sm" data-act="avanzar" data-h="' + h + '" data-k="rp-q-' + p + '"' + (off ? ' aria-disabled="true"' : '') + '>+' + (p === 60 ? '1 h' : p + ' min') + '</button>';
        }).join('') + '</div></div>';
    }
    return '<div class="brand"><span class="brand-g">' + inicial(s.negocio.replace('Estudio ', '')) + '</span><div><b>' + esc(s.negocio) + '</b><small>Agenda de hoy</small></div></div>' +
      '<nav class="tabs" aria-label="Secciones">' + tabsHTML('tab') + '</nav>' +
      '<div class="top-act"><div class="reloj-w"><button type="button" class="reloj" data-act="reloj" data-k="reloj" aria-expanded="' + !!ui.relojAbierto + '" aria-label="' + fmt(s.reloj) + ' Avanzar el reloj del salón">' + ico('reloj') + ' <b>' + fmt(s.reloj) + '</b> <span>Avanzar</span></button>' + pop + '</div>' +
      '<button type="button" class="btn-sec sm" data-act="reiniciar" data-k="reiniciar" aria-label="Reiniciar el ejemplo: vuelve a los datos originales">' + ico('reset') + '<span>Reiniciar</span></button></div>';
  }

  /* ───────── recorrido guiado ───────── */
  function guiaHTML() {
    var g = V.progresoGuia({ inicio: ui.inicio, actual: store.getState(), vistoImpacto: ui.vistoImpacto });
    var li = g.pasos.map(function (p, i) { return '<li class="' + (p.hecho ? 'done' : i === g.actual ? 'now' : '') + '"' + (i === g.actual ? ' aria-current="step"' : '') + '><span class="g-n">' + (p.hecho ? ico('check') : i + 1) + '</span><span>' + esc(p.texto) + (p.hecho ? '<span class="sr-only"> (hecho)</span>' : '') + '</span></li>'; }).join('');
    var paso = g.completa ? 'Recorrido completo' : 'Paso ' + (g.actual + 1) + ' de ' + g.pasos.length, cur = g.completa ? 'Probá otro turno o reiniciá el ejemplo' : g.pasos[g.actual].texto;
    return '<section class="guia' + (ui.guiaMax ? ' open' : '') + '" aria-label="Recorrido guiado"><button type="button" class="g-toggle" data-act="guia-pasos" data-k="guia-pasos" aria-expanded="' + !!ui.guiaMax + '" aria-controls="g-lista">' + ico('route') +
      '<span class="g-cur"><b>' + paso + '</b><span>' + esc(cur) + '</span></span>' + ico('chev', 'g-chev') + '</button>' +
      '<button type="button" class="icon-btn" data-act="guia-cerrar" data-k="guia-x" aria-label="Ocultar el recorrido">' + ico('close') + '</button><ol class="g-steps" id="g-lista">' + li + '</ol></section>';
  }

  /* ───────── agenda ───────── */
  function agendaHTML(s) {
    var J = s.jornada, ag = S.agenda(s), horas = V.horas(s), alto = (J.cierre - J.apertura) * PPM;
    var res = S.resumen(s), np = V.previa(s, { profesional: ui.nuevo.prof, servicios: ui.nuevo.servicios, inicio: ui.nuevo.inicio });
    var heads = ag.map(function (c) {
      return '<div class="ag-ph k-' + c.profesional + '"><span class="av">' + inicial(c.nombre) + '</span><span class="ag-pn"><b>' + esc(c.nombre) + '</b><small>' + c.ocupacion.pct + ' % reservado</small></span></div>';
    }).join('');
    var tabs = ag.map(function (c) { return '<button type="button" class="ph-tab k-' + c.profesional + (ui.tab === c.profesional ? ' on' : '') + '" data-act="tab" data-p="' + c.profesional + '" data-k="ptab-' + c.profesional + '" aria-pressed="' + (ui.tab === c.profesional) + '"><span class="av">' + inicial(c.nombre) + '</span>' + esc(c.nombre) + '</button>'; }).join('');
    var gut = horas.map(function (h) { return '<span class="hr" style="top:calc(' + (h.min - J.apertura) + ' * var(--ppm) * 1px)">' + h.etiqueta + '</span>'; }).join('');
    var lineas = horas.map(function (h) { return '<i class="hl" style="top:calc(' + (h.min - J.apertura) + ' * var(--ppm) * 1px)"></i>'; }).join('');
    var cols = ag.map(function (c) {
      var bl = c.bloqueos.map(function (b) { return '<div class="blq" style="top:calc(' + (b.inicio - J.apertura) + ' * var(--ppm) * 1px);height:calc(' + (b.fin - b.inicio) + ' * var(--ppm) * 1px)" aria-label="' + esc(b.motivo) + ' de ' + fmt(b.inicio) + ' a ' + fmt(b.fin) + '"><span>' + esc(b.motivo) + '</span></div>'; }).join('');
      var ts = c.turnos.filter(function (t) { return t.reserva === 'confirmado'; }).map(function (t) {
        var cl = V.clase(t.estado), sel = ui.sel === t.id, flash = ui.flash === t.id, corto = t.duracion <= 30;
        return '<button type="button" class="blk st-' + cl + (sel ? ' sel' : '') + (flash ? ' flash' : '') + (corto ? ' corto' : '') + '" data-act="turno" data-id="' + t.id + '" data-k="b-' + t.id + '" style="top:calc(' + (t.inicio - J.apertura) + ' * var(--ppm) * 1px);height:calc(' + t.duracion + ' * var(--ppm) * 1px)"' +
          ' aria-label="' + esc(t.cliente) + ' ' + (corto ? '' : t.estado + ' ') + esc(t.servicios.map(function (x) { return x.nombre; }).join(' + ')) + (corto ? ', con ' + esc(c.nombre) + ', de ' + fmt(t.inicio) + ' a ' + fmt(t.fin) + '. ' + t.estado : ' · ' + fmt(t.inicio) + '–' + fmt(t.fin) + ', con ' + esc(c.nombre)) + '"' + (sel ? ' aria-pressed="true"' : '') + '>' +
          '<span class="b-h"><b>' + esc(t.cliente) + '</b> <span class="b-e">' + (cl === 'cobrado' ? ico('check') : '') + t.estado + '</span></span> ' +
          '<span class="b-s">' + esc(t.servicios.map(function (x) { return x.nombre; }).join(' + ')) + (corto ? '' : ' · ' + fmt(t.inicio) + '–' + fmt(t.fin)) + '</span></button>';
      }).join('');
      var gh = '';
      if (ui.modo === 'nuevo' && ui.nuevo.prof === c.profesional && ui.nuevo.inicio != null) {
        var d = np.ok ? np.duracion : (ui.nuevo.servicios.length ? S.duracion(s, ui.nuevo.servicios) : 30);
        gh = '<div class="ghost ' + (np.ok ? 'ok' : 'bad') + '" aria-hidden="true" style="top:calc(' + (ui.nuevo.inicio - J.apertura) + ' * var(--ppm) * 1px);height:calc(' + d + ' * var(--ppm) * 1px)"><span>' + fmt(ui.nuevo.inicio) + '</span></div>';
      }
      return '<div class="ag-col k-' + c.profesional + (ui.tab === c.profesional ? ' tab-on' : '') + '" data-col="' + c.profesional + '">' + lineas + bl + ts + gh + '</div>';
    }).join('');
    var ahora = '<div class="ahora" style="top:calc(' + (s.reloj - J.apertura) + ' * var(--ppm) * 1px)" aria-hidden="true"><span>' + fmt(s.reloj) + '</span></div>';
    var chips = [];
    if (res.enCurso) chips.push('<span class="chip c-curso">' + res.enCurso + ' en curso</span>');
    if (res.esperandoInicio) chips.push('<span class="chip c-espera">' + res.esperandoInicio + ' por iniciar</span>');
    if (res.porCobrar.n) chips.push('<span class="chip c-cobrar">' + res.porCobrar.n + ' por cobrar · ' + pesos(res.porCobrar.monto) + '</span>');
    if (res.programados) chips.push('<span class="chip">' + res.programados + ' programados</span>');
    return '<h1 class="v-title sr-only" id="vista-titulo">Agenda</h1>' +
      '<div class="ag-bar"><div class="ag-sum"><b>Hoy</b>' + chips.join('') + '</div><button type="button" class="btn-primary" data-act="nuevo" data-k="nuevo">' + ico('plus') + 'Nuevo turno</button></div>' +
      (ui.guia ? guiaHTML() : '') +
      '<div class="ph-tabs" role="group" aria-label="Profesional">' + tabs + '</div>' +
      '<div class="ag-scroll" id="ag-scroll" tabindex="-1"><div class="ag"><div class="ag-head"><span class="ag-corner"></span>' + heads + '</div>' +
      '<div class="ag-body" style="height:calc(' + (J.cierre - J.apertura) + ' * var(--ppm) * 1px)"><div class="ag-gut" aria-hidden="true">' + gut + '</div>' + cols + ahora + '</div></div></div>';
  }

  /* ───────── panel: nuevo turno / detalle del turno ───────── */
  function msgHTML() { return ui.msg ? '<p class="msg" role="status">' + ico('alert') + '<span>' + esc(ui.msg) + '</span></p>' : ''; }
  /* Por qué todavía no se puede agendar (vacío = se puede). Misma validación de F1 que usa el botón. */
  function razonAgendar(s) {
    var n = ui.nuevo, cli = core.limpiar(n.cliente, 60), np = V.previa(s, { profesional: n.prof, servicios: n.servicios, inicio: n.inicio });
    return !cli ? 'Falta el nombre de la clienta.' : !n.servicios.length ? 'Elegí al menos un servicio.' : (!n.prof || n.inicio == null) ? 'Elegí un horario.' : !np.ok ? np.mensaje : '';
  }
  /* El texto bajo el botón solo cuando falta un dato; si el horario no es válido, ya lo explica la vista previa de arriba (sin repetirlo). */
  function razonVisible(s) {
    var n = ui.nuevo, completo = core.limpiar(n.cliente, 60) && n.servicios.length && n.prof && n.inicio != null;
    return completo ? '' : razonAgendar(s);
  }
  function nuevoHTML(s, pre) {
    var n = ui.nuevo, cat = S.servicios(s), disp = n.servicios.length ? S.disponibilidad(s, n.servicios, fmt(s.reloj)) : null, np = V.previa(s, { profesional: n.prof, servicios: n.servicios, inicio: n.inicio });
    var g = V.progresoGuia({ inicio: ui.inicio, actual: s, vistoImpacto: ui.vistoImpacto });
    var caso = ui.guia && g.actual === 0 ? '<button type="button" class="caso" data-act="caso" data-k="' + pre + '-caso">' + ico('route') + '<span><b>Usar el caso del recorrido</b>Julia Pereyra · corte y brushing · Camila, 11:00</span></button>' : '';
    var servs = cat.map(function (x) {
      var on = n.servicios.indexOf(x.id) >= 0;
      return '<button type="button" class="srv' + (on ? ' on' : '') + '" data-act="serv" data-s="' + x.id + '" data-k="' + pre + '-srv-' + x.id + '" aria-pressed="' + on + '"><b>' + esc(x.nombre) + '</b><span>' + V.minutos(x.min) + ' · ' + pesos(x.precio) + '</span></button>';
    }).join('');
    var tot = n.servicios.length ? '<p class="tot"><span>' + V.minutos(S.duracion(s, n.servicios)) + '</span><b>' + pesos(S.precio(s, n.servicios)) + '</b></p>' : '';
    var filas = !disp ? '<p class="hint">Elegí un servicio para ver los horarios libres.</p>' : disp.map(function (d) {
      var cl = 'k-' + d.profesional;
      if (!d.compatible) {
        var falta = n.servicios.filter(function (x) { return S.compatibles(s, [x]).indexOf(d.profesional) < 0; });
        return '<div class="pf off ' + cl + '"><div class="pf-h"><span class="av">' + inicial(d.nombre) + '</span><b>' + esc(d.nombre) + '</b></div><p class="pf-n">No hace ' + esc(nombreServ(s, falta).toLowerCase()) + '.</p></div>';
      }
      var ch = d.inicios.length ? d.inicios.map(function (m) {
        var on = n.prof === d.profesional && n.inicio === m;
        return '<button type="button" class="slot' + (on ? ' on' : '') + '" data-act="slot" data-p="' + d.profesional + '" data-m="' + m + '" data-k="' + pre + '-slot-' + d.profesional + '-' + m + '" aria-pressed="' + on + '">' + fmt(m) + '</button>';
      }).join('') : '<p class="pf-n">Sin horarios libres hoy para esta duración.</p>';
      return '<div class="pf ' + cl + '"><div class="pf-h"><span class="av">' + inicial(d.nombre) + '</span><b>' + esc(d.nombre) + '</b><small>' + d.inicios.length + ' libres</small></div><div class="slots" role="group" aria-label="Horarios libres de ' + esc(d.nombre) + '">' + ch + '</div></div>';
    }).join('');
    var previa = '';
    if (n.prof && n.inicio != null && n.servicios.length) {
      previa = np.ok ? '<p class="previa ok">' + ico('check') + '<span><b>' + esc(prof(s, n.prof).nombre) + ' · ' + rango(n.inicio, np.fin) + '</b>' + V.minutos(np.duracion) + ' · ' + pesos(np.precio) + '</span></p>'
        : '<p class="previa bad">' + ico('alert') + '<span>' + esc(np.mensaje) + (np.sugerencia ? ' <button type="button" class="link in" data-act="sug" data-m="' + core.hm(np.sugerencia) + '" data-k="' + pre + '-sug">Usar ' + np.sugerencia + '</button>' : '') + '</span></p>';
    }
    var cli = core.limpiar(n.cliente, 60), puede = np.ok && !!cli;
    var frecuentes = s.clientas.slice(0, 4).map(function (c) { return '<button type="button" class="chip-b' + (n.cliente === c ? ' on' : '') + '" data-act="cli" data-c="' + esc(c) + '" data-k="' + pre + '-cli-' + esc(c).replace(/\W/g, '') + '">' + esc(c) + '</button>'; }).join('');
    var razon = razonAgendar(s);
    return '<div class="pn-h"><h2 id="pn-t-' + pre + '" tabindex="-1">Nuevo turno</h2><button type="button" class="icon-btn" data-act="cerrar-panel" data-k="' + pre + '-x" aria-label="Cerrar sin agendar">' + ico('close') + '</button></div>' + caso +
      '<div class="fld"><label for="' + pre + '-cli"><i class="nn">1</i>Clienta o cliente</label><input id="' + pre + '-cli" class="inp" data-f="cliente" maxlength="60" autocomplete="off" placeholder="Nombre y apellido" value="' + esc(n.cliente) + '"><div class="chips-b" role="group" aria-label="Clientas frecuentes">' + frecuentes + '</div></div>' +
      '<fieldset class="fld"><legend><i class="nn">2</i>Servicios</legend><div class="srvs">' + servs + '</div>' + tot + '</fieldset>' +
      '<fieldset class="fld"><legend><i class="nn">3</i>Horario libre <small>(desde las ' + fmt(s.reloj) + ')</small></legend>' + filas + '</fieldset>' +
      '<div class="pn-foot">' + msgHTML() + previa + '<button type="button" class="btn-primary xl" data-act="agendar" data-k="' + pre + '-agendar"' + (puede ? '' : ' aria-disabled="true"') + '>Agendar turno</button>' + (razonVisible(s) ? '<p class="razon">' + esc(razonVisible(s)) + '</p>' : '') + '</div>';
  }

  function lineaTiempo(s, t) {
    var a = t.atencion, pasos = [['Reserva', fmt(t.inicio), true], ['Inicio', a ? fmt(a.inicioReal) : '—', !!a], ['Fin', a && a.finReal !== null ? fmt(a.finReal) : '—', !!(a && a.finReal !== null)], ['Cobro', t.cobro ? fmt(t.cobro.en) : '—', !!t.cobro]];
    return '<ol class="lt">' + pasos.map(function (p) { return '<li class="' + (p[2] ? 'ok' : '') + '"><span>' + p[0] + '</span><b>' + p[1] + '</b></li>'; }).join('') + '</ol>';
  }
  function cambiosHTML(c, pre) {
    var f = [];
    f.push(['caja', 'Caja del día', pesos(c.caja.antes) + ' → ' + pesos(c.caja.ahora), signo(c.caja.delta), c.atenciones.ahora + ' atenciones cobradas']);
    c.profesionales.forEach(function (p) { f.push(['equipo', 'Ingresos de ' + p.nombre, pesos(p.antes) + ' → ' + pesos(p.ahora), signo(p.delta), '']); });
    return '<ul class="cambios">' + f.map(function (x, i) {
      return '<li style="--i:' + i + '"><button type="button" class="cb-row" data-act="ir" data-v="' + x[0] + '" data-k="' + pre + '-cb' + i + '"><span><small>' + x[1] + '</small><b>' + x[2] + '</b>' + (x[4] ? '<em>' + x[4] + '</em>' : '') + '</span><i class="dl">' + x[3] + '</i>' + ico('chev') + '</button></li>';
    }).join('') + '</ul>';
  }
  function turnoHTML(s, pre) {
    var p = V.pasoTurno(s, ui.sel); if (!p) return vacioHTML(s, pre);
    var t = p.turno, a = p.acciones, pr = prof(s, t.profesional), cl = p.clase;
    var cab = '<div class="pn-h"><div class="pn-st st-' + cl + '">' + (cl === 'cobrado' ? ico('check') : '') + t.estado + '</div><button type="button" class="icon-btn" data-act="cerrar-panel" data-k="' + pre + '-x" aria-label="Cerrar el detalle">' + ico('close') + '</button></div>';
    var info = '<h2 id="pn-t-' + pre + '" tabindex="-1" class="cli">' + esc(t.cliente) + '</h2><p class="pn-s">' + esc(t.servicios.map(function (x) { return x.nombre; }).join(' + ')) + '</p>' +
      '<dl class="pn-d"><div><dt>Profesional</dt><dd><span class="av k-' + t.profesional + '">' + inicial(pr.nombre) + '</span>' + esc(pr.nombre) + '</dd></div><div><dt>Horario</dt><dd>' + rango(t.inicio, t.fin) + ' · ' + V.minutos(t.duracion) + '</dd></div><div><dt>Importe</dt><dd>' + pesos(t.precio) + '</dd></div></dl>' + lineaTiempo(s, t);
    var acc = '', txt = '<p class="pn-x">' + esc(p.texto) + '</p>';
    var avanzar = function (h, rot) { return h ? '<button type="button" class="btn-sec" data-act="avanzar" data-h="' + h + '" data-k="' + pre + '-av">' + ico('reloj') + rot + ' ' + fmt(h) + '</button>' : ''; };
    if (t.estado === 'Programado') acc = avanzar(p.avanzarA, 'Llevar el reloj a las') + '<button type="button" class="link dng" data-act="cancelar" data-id="' + t.id + '" data-k="' + pre + '-cancelar">Cancelar turno</button>';
    else if (t.estado === 'Esperando inicio') acc = '<button type="button" class="btn-primary xl" data-act="iniciar" data-id="' + t.id + '" data-k="' + pre + '-iniciar"' + (a.iniciar ? ' aria-disabled="true"' : '') + '>' + ico('play') + 'Iniciar atención</button>' +
      '<div class="sec-acts"><button type="button" class="link" data-act="ausente" data-id="' + t.id + '" data-k="' + pre + '-ausente">No se presentó</button><button type="button" class="link dng" data-act="cancelar" data-id="' + t.id + '" data-k="' + pre + '-cancelar">Cancelar turno</button></div>';
    else if (t.estado === 'En curso') acc = '<div class="prog" role="img" aria-label="' + p.progreso.pct + ' % del tiempo previsto"><i style="width:' + p.progreso.pct + '%"></i></div><p class="prog-t"><span>Inició ' + fmt(p.progreso.desde) + '</span><span>Previsto ' + fmt(p.progreso.hasta) + '</span></p>' +
      '<button type="button" class="btn-primary xl" data-act="finalizar" data-id="' + t.id + '" data-k="' + pre + '-finalizar">' + ico('stop') + 'Finalizar atención</button>' + avanzar(p.avanzarA, 'Llevar el reloj a las');
    else if (t.estado === 'Por cobrar') {
      var medios = Object.keys(V.MEDIOS).map(function (m) { return '<label class="medio"><input type="radio" name="medio-' + pre + '" value="' + m + '"' + (ui.medio === m ? ' checked' : '') + ' data-k="' + pre + '-m-' + m + '"><span>' + V.MEDIOS[m] + '</span></label>'; }).join('');
      acc = '<fieldset class="fld"><legend>Medio de pago</legend><div class="medios">' + medios + '</div></fieldset><button type="button" class="btn-primary xl" data-act="cobrar" data-id="' + t.id + '" data-k="' + pre + '-cobrar">Cobrar ' + pesos(t.precio) + '</button>';
    } else if (t.estado === 'Cobrado' && ui.ultima && ui.ultima.turno === t.id) acc = '<h3 class="rc-h">Lo que cambió</h3>' + cambiosHTML(ui.ultima.cambio, pre);
    return cab + msgHTML() + info + txt + '<div class="acc">' + acc + '</div>';
  }
  function vacioHTML(s, pre) {
    var r = S.resumen(s);
    return '<div class="pn-h"><h2 id="pn-t-' + pre + '" tabindex="-1">Tu agenda de hoy</h2></div>' + msgHTML() +
      '<p class="pn-x">Tocá un turno para ver qué sigue, o un horario libre de una profesional para agendar.</p>' +
      '<dl class="pn-d"><div><dt>Caja del día</dt><dd>' + pesos(r.caja.total) + '</dd></div><div><dt>Atenciones cobradas</dt><dd>' + r.caja.atenciones + '</dd></div><div><dt>Por cobrar</dt><dd>' + r.porCobrar.n + (r.porCobrar.n ? ' · ' + pesos(r.porCobrar.monto) : '') + '</dd></div></dl>' +
      '<p class="pn-x">Para empezar un turno desde cero, usá «Nuevo turno», arriba a la izquierda.</p>';
  }
  function panelHTML(s, pre) { return ui.modo === 'nuevo' ? nuevoHTML(s, pre) : ui.sel ? turnoHTML(s, pre) : vacioHTML(s, pre); }

  /* ───────── Caja ───────── */
  function evTexto(e) {
    var q = esc(e.cliente) + ' · ' + esc(e.servicios), p = esc(prof(store.getState(), e.profesional).nombre);
    switch (e.tipo) {
      case 'agendado': return ['Turno agendado', q + ' con ' + p + ' para las ' + fmt(e.programadoPara)];
      case 'inicio': return ['Atención iniciada', q + ' con ' + p];
      case 'fin': return ['Atención finalizada', q + ' con ' + p];
      case 'cobro': return ['Cobro registrado · ' + pesos(e.monto), q + ' · ' + V.MEDIOS[e.medio]];
      case 'cancelado': return ['Turno cancelado', q];
      default: return ['No se presentó', q];
    }
  }
  function cajaHTML(s) {
    var r = S.resumen(s), c = r.caja, ult = ui.ultima && ui.ultima.cambio, medios = Object.keys(c.porMedio).map(function (m) {
      var pct = core.porcentaje(c.porMedio[m], c.total), d = ult && ult.medios.filter(function (x) { return x.medio === m; })[0];
      return '<li><div class="md-top"><span>' + V.MEDIOS[m] + '</span><b>' + pesos(c.porMedio[m]) + '</b>' + (d ? '<i class="dl">' + signo(d.delta) + '</i>' : '') + '</div><div class="bar" role="img" aria-label="' + pct + ' % de lo cobrado"><i style="width:' + pct + '%"></i></div></li>';
    }).join('');
    var act = S.actividad(s).slice(0, 9).map(function (e) { var t = evTexto(e); return '<li class="ev-' + e.tipo + (e.vivo ? ' vivo' : '') + '"><time>' + fmt(e.t) + '</time><span><b>' + t[0] + '</b>' + t[1] + '</span></li>'; }).join('');
    return '<h1 class="v-title" id="vista-titulo">Caja del día</h1>' +
      '<div class="cj-top"><section class="cj-main"><p class="eyebrow">Cobrado hoy</p><p class="cj-big">' + pesos(c.total) + (ult && ult.hayCambio ? '<i class="dl">' + signo(ult.caja.delta) + '</i>' : '') + '</p><p class="cj-sub">' + c.atenciones + ' atenciones cobradas</p></section>' +
      '<section class="cj-pc ' + (r.porCobrar.n ? 'hay' : '') + '"><p class="eyebrow">Atendidas, sin cobrar</p><p class="cj-n">' + (r.porCobrar.n ? pesos(r.porCobrar.monto) : '—') + '</p><p class="cj-sub">' + (r.porCobrar.n ? r.porCobrar.n + (r.porCobrar.n === 1 ? ' turno espera el cobro' : ' turnos esperan el cobro') : 'No hay atenciones pendientes de cobro') + '</p></section></div>' +
      '<div class="cj-cols"><section><h2 class="h2">Por medio de pago</h2><ul class="medios-l">' + medios + '</ul></section><section><h2 class="h2">Actividad</h2><ul class="act">' + act + '</ul></section></div>';
  }

  /* ───────── Equipo ───────── */
  function equipoHTML(s) {
    var ag = S.agenda(s), ing = S.ingresosPorProfesional(s), ult = ui.ultima && ui.ultima.cambio;
    var cards = ag.map(function (c) {
      var pend = c.turnos.filter(function (t) { return t.reserva === 'confirmado' && t.estado !== 'Cobrado'; }), sig = pend[0];
      var cobr = c.turnos.filter(function (t) { return t.estado === 'Cobrado'; }).length, d = ult && ult.profesionales.filter(function (x) { return x.id === c.profesional; })[0];
      return '<article class="eq k-' + c.profesional + '"><header><span class="av lg">' + inicial(c.nombre) + '</span><div><h3>' + esc(c.nombre) + '</h3><p>' + esc(c.hace.map(function (i) { return nombreServ(s, [i]); }).join(', ')) + '</p></div></header>' +
        '<div class="eq-n"><div><small>Ingresos de hoy</small><b>' + pesos(ing[c.profesional]) + (d ? '<i class="dl">' + signo(d.delta) + '</i>' : '') + '</b></div><div><small>Atenciones cobradas</small><b>' + cobr + '</b></div></div>' +
        '<div class="eq-o"><div class="eq-ot"><span>Jornada reservada</span><b>' + c.ocupacion.pct + ' %</b></div><div class="bar" role="img" aria-label="' + c.ocupacion.pct + ' % de la jornada reservada"><i style="width:' + c.ocupacion.pct + '%"></i></div><small>' + V.minutos(c.ocupacion.reservados) + ' reservados de ' + V.minutos(c.ocupacion.disponibles) + '</small></div>' +
        '<p class="eq-s">' + (sig ? '<b>Sigue:</b> ' + esc(sig.cliente) + ' · ' + esc(sig.servicios.map(function (x) { return x.nombre; }).join(' + ')) + ' · ' + fmt(sig.inicio) + ' (' + sig.estado.toLowerCase() + ')' : 'Sin más turnos para hoy.') + '</p></article>';
    }).join('');
    return '<h1 class="v-title" id="vista-titulo">Equipo</h1><p class="v-sub">Cada profesional con lo que hace, cuánto lleva cobrado y cuánto de su jornada tiene reservada.</p><div class="eqs">' + cards + '</div>';
  }

  /* ───────── render ───────── */
  var cache = {};
  function region(el, clave, html) { if (cache[clave] !== html) { el.innerHTML = html; cache[clave] = html; return true; } return false; }
  function vistaHTML(s) { return ({ agenda: agendaHTML, caja: cajaHTML, equipo: equipoHTML })[ui.vista](s); }

  function render(o) {
    o = o || {};
    var s = store.getState(), act = document.activeElement, key = act && act.getAttribute ? act.getAttribute('data-k') : null, v = $('#vista'), ps = $('#ag-scroll'), top = ps ? ps.scrollTop : 0, ptop = $('#panel').scrollTop;
    $('#app').setAttribute('data-vista', ui.vista);
    region($('#top'), 'top', topHTML(s));
    region($('#bar'), 'bar', tabsHTML('bt'));
    if (o.vistaNueva) cache.vista = null;
    var cambio = region(v, 'vista', vistaHTML(s));
    var nuevoScroll = $('#ag-scroll');
    if (cambio && nuevoScroll) {
      if (ui.scrollear) { nuevoScroll.scrollTop = Math.max(0, (s.reloj - s.jornada.apertura - 120) * PPM); ui.scrollear = false; } else nuevoScroll.scrollTop = top;
      if (o.verTurno) { var b = $('[data-id="' + o.verTurno + '"]', nuevoScroll); if (b) { var bt = b.offsetTop, bh = b.offsetHeight; if (bt < nuevoScroll.scrollTop + 8 || bt + bh > nuevoScroll.scrollTop + nuevoScroll.clientHeight - 8) nuevoScroll.scrollTop = Math.max(0, bt - 60); } }
    } else if (cambio) v.scrollTop = o.vistaNueva ? 0 : v.scrollTop;
    if (o.vistaNueva) { v.classList.remove('enter'); void v.offsetWidth; v.classList.add('enter'); }
    if (region($('#panel'), 'panel', panelHTML(s, 'p'))) $('#panel').scrollTop = o.panelNuevo ? 0 : ptop;
    if (ui.sheet) { var sb = $('#dlg-panel .sh-body'); if (sb) { var st = sb.scrollTop; if (region(sb, 'sheet', panelHTML(s, 's'))) sb.scrollTop = o.panelNuevo ? 0 : st; } }
    if (key && !o.sinFoco) { var n = document.querySelector('[data-k="' + key + '"]'); if (n && n !== document.activeElement) n.focus({ preventScroll: true }); }
    if (o.foco) { var f = $(o.foco); if (f) f.focus({ preventScroll: true }); }
    ui.flash = null;
  }

  function armarMarco() {
    $('#app').innerHTML = '<header class="topbar" id="top"></header><main class="view" id="vista" tabindex="-1" aria-labelledby="vista-titulo"></main><aside class="panel" id="panel" aria-label="Detalle del turno"></aside><nav class="botnav" id="bar" aria-label="Secciones"></nav>';
  }

  /* ───────── acciones ───────── */
  var panelVisible = function () { return getComputedStyle($('#panel')).display !== 'none'; };
  function error(r) { ui.msg = V.mensajeError(r.error); anunciar(ui.msg); }
  function hacer(accion, payload) { var r = store.dispatch(accion, payload); if (!r.ok) { error(r); return r; } ui.msg = ''; return r; }
  function open(d) { if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', ''); }
  function cerrar(d) { if (typeof d.close === 'function') d.close(); else d.removeAttribute('open'); }
  function abrirPanel(foco) {
    if (panelVisible()) { render({ panelNuevo: true, sinFoco: true, foco: foco || '#pn-t-p' }); return; }
    var d = $('#dlg-panel'); ui.sheet = true; cache.sheet = null; d.innerHTML = '<div class="sh-h"><span class="sh-grip" aria-hidden="true"></span></div><div class="sh-body"></div>'; open(d); render({ panelNuevo: true, sinFoco: true }); var t = $('#pn-t-s'); if (t) t.focus({ preventScroll: true });
  }
  function cerrarPanel() { ui.modo = null; ui.sel = null; ui.msg = ''; if (ui.sheet) { ui.sheet = false; cerrar($('#dlg-panel')); } render({ sinFoco: true }); }
  function seleccionar(id) { ui.sel = id; ui.modo = null; ui.msg = ''; ui.medio = 'efectivo'; abrirPanel(); anunciar('Turno de ' + store.getState().turnos.filter(function (t) { return t.id === id; })[0].cliente + ' seleccionado'); }
  function nuevoTurno(prefill) { ui.modo = 'nuevo'; ui.sel = null; ui.msg = ''; if (prefill) Object.assign(ui.nuevo, prefill); abrirPanel('#' + ($('#dlg-panel').open ? 'dlg-panel' : 'panel') + ' .inp'); }
  function ir(v, desdeTab) {
    ui.vista = v; if (v !== 'agenda') { ui.visto[v] = true; if (ui.ultima) ui.vistoImpacto = true; }
    if (ui.sheet) { ui.sheet = false; cerrar($('#dlg-panel')); }
    ui.relojAbierto = false; if (v === 'agenda') ui.scrollear = true;
    var tit = VISTAS.filter(function (x) { return x[0] === v; })[0][1];
    render({ vistaNueva: true, foco: desdeTab ? null : '#vista', sinFoco: !desdeTab }); anunciar(tit);
  }
  function avanzar(h) {
    var r = hacer('avanzarReloj', { hasta: h }); ui.relojAbierto = false;
    if (r.ok) anunciar('El reloj marca las ' + fmt(h) + '. Ningún turno cambió de estado por sí solo.');
    render({ foco: '[data-k="reloj"]' });
  }

  function onClick(ev) {
    var col = ev.target.closest('.ag-col');
    var b = ev.target.closest('[data-act]');
    if (!b && col && ev.target === col) {       // clic en un hueco libre de la columna → arma un turno ahí (para teclado está «Nuevo turno»)
      var J = store.getState().jornada, y = ev.clientY - col.getBoundingClientRect().top, m = J.apertura + Math.floor(y / PPM / J.paso) * J.paso;
      ui.nuevo.prof = col.getAttribute('data-col'); ui.nuevo.inicio = m; nuevoTurno(); return;
    }
    if (ui.relojAbierto && !ev.target.closest('.reloj-w')) { ui.relojAbierto = false; render({ sinFoco: true }); }
    if (!b) return;
    var a = b.getAttribute('data-act'), id = b.getAttribute('data-id'), s = store.getState(), r;
    if (b.getAttribute('aria-disabled') === 'true' && a !== 'agendar' && a !== 'iniciar' && a !== 'avanzar') return;
    switch (a) {
      case 'ir': ir(b.getAttribute('data-v'), !!b.closest('.tabs, .botnav')); break;
      case 'tab': ui.tab = b.getAttribute('data-p'); render(); break;
      case 'reloj': ui.relojAbierto = !ui.relojAbierto; render({ sinFoco: true, foco: ui.relojAbierto ? '.rp-b, .rp-q .btn-sec' : '[data-k="reloj"]' }); break;
      case 'avanzar': if (b.getAttribute('aria-disabled') === 'true') { ui.msg = 'El salón cierra a las ' + fmt(s.jornada.cierre) + '.'; render(); break; } avanzar(+b.getAttribute('data-h')); break;
      case 'turno': seleccionar(id); render({ sinFoco: true }); break;
      case 'nuevo': nuevoTurno(); break;
      case 'cerrar-panel': cerrarPanel(); break;
      case 'caso': Object.assign(ui.nuevo, { cliente: V.GUIA.cliente, servicios: V.GUIA.servicios.slice(), prof: V.GUIA.profesional, inicio: core.hm(V.GUIA.inicio) }); render({ panelNuevo: true }); break;
      case 'cli': ui.nuevo.cliente = b.getAttribute('data-c'); render(); break;
      case 'serv': var x = b.getAttribute('data-s'), i = ui.nuevo.servicios.indexOf(x); if (i >= 0) ui.nuevo.servicios.splice(i, 1); else ui.nuevo.servicios.push(x);
        if (ui.nuevo.prof && ui.nuevo.inicio != null && !V.previa(s, { profesional: ui.nuevo.prof, servicios: ui.nuevo.servicios, inicio: ui.nuevo.inicio }).ok && ui.nuevo.servicios.length) { /* queda el mensaje de la previa */ }
        ui.msg = ''; render(); break;
      case 'slot': ui.nuevo.prof = b.getAttribute('data-p'); ui.nuevo.inicio = +b.getAttribute('data-m'); ui.msg = ''; render({ verTurno: null }); break;
      case 'sug': ui.nuevo.inicio = +b.getAttribute('data-m'); render(); break;
      case 'agendar':
        r = store.dispatch('agendar', { cliente: ui.nuevo.cliente, profesional: ui.nuevo.prof, servicios: ui.nuevo.servicios, inicio: ui.nuevo.inicio });
        if (!r.ok) { error(r); render(); break; }
        ui.msg = ''; var nid = r.resultado.turno, nn = ui.nuevo; ui.nuevo = nuevoNuevo(); ui.sel = nid; ui.modo = null; ui.flash = nid; ui.vista = 'agenda';
        render({ verTurno: nid, sinFoco: true, foco: ui.sheet ? '#pn-t-s' : '#pn-t-p' }); anunciar('Turno agendado: ' + nn.cliente + ' con ' + prof(r.state, nn.prof).nombre + ' a las ' + fmt(nn.inicio) + '.'); break;
      case 'iniciar': r = hacer('iniciar', { turno: id }); if (r.ok) anunciar('Atención iniciada.'); render({ foco: '[data-k$="-finalizar"]', sinFoco: r.ok }); break;
      case 'finalizar': r = hacer('finalizar', { turno: id }); if (r.ok) anunciar('Atención finalizada. Queda por cobrar.'); render({ foco: '[data-k$="-cobrar"]', sinFoco: r.ok }); break;
      case 'cancelar': r = hacer('cancelar', { turno: id }); if (r.ok) { ui.sel = null; anunciar('Turno cancelado. El horario quedó libre.'); if (ui.sheet) { ui.sheet = false; cerrar($('#dlg-panel')); } } render({ sinFoco: true }); break;
      case 'ausente': r = hacer('marcarAusente', { turno: id }); if (r.ok) { ui.sel = null; anunciar('Marcado como ausente. El horario quedó libre.'); if (ui.sheet) { ui.sheet = false; cerrar($('#dlg-panel')); } } render({ sinFoco: true }); break;
      case 'cobrar':
        r = store.dispatch('cobrar', { turno: id, medio: ui.medio });
        if (!r.ok) { error(r); render(); break; }
        ui.msg = ''; ui.ultima = { turno: id, cambio: V.cambio(s, r.state) }; ui.vistoImpacto = false; ui.visto = { caja: false, equipo: false };
        render({ sinFoco: true, foco: ui.sheet ? '#pn-t-s' : '#pn-t-p' }); anunciar('Cobro registrado: ' + pesos(r.resultado.monto) + ' con ' + V.MEDIOS[r.resultado.medio] + '. La caja y los ingresos se actualizaron.'); break;
      case 'guia-pasos': ui.guiaMax = !ui.guiaMax; render(); break;
      case 'guia-cerrar': ui.guia = false; render({ sinFoco: true, foco: '[data-k="nuevo"]' }); anunciar('Recorrido oculto.'); break;
      case 'reiniciar': store.reset(); ui = nuevoUI(); cache = {}; cerrar($('#dlg-panel')); render({ vistaNueva: true }); anunciar('Reiniciado. Volvimos a los datos originales.'); break;
    }
  }
  document.addEventListener('click', onClick);
  document.addEventListener('input', function (ev) {
    var t = ev.target; if (!t.getAttribute || t.getAttribute('data-f') !== 'cliente') return;
    ui.nuevo.cliente = t.value;
    var raiz = t.closest('.panel, .sh-body'), btn = $('[data-act="agendar"]', raiz), r = razonVisible(store.getState()), p = $('.razon', raiz), bloq = razonAgendar(store.getState());
    if (btn) btn.setAttribute('aria-disabled', String(!!bloq));
    if (r && !p && btn) { p = document.createElement('p'); p.className = 'razon'; btn.insertAdjacentElement('afterend', p); }
    if (p) { if (r) p.textContent = r; else p.remove(); }
    cache.panel = null; cache.sheet = null;
  });
  document.addEventListener('change', function (ev) { if (ev.target.name && ev.target.name.indexOf('medio-') === 0) ui.medio = ev.target.value; });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && ui.relojAbierto) { ui.relojAbierto = false; render({ sinFoco: true, foco: '[data-k="reloj"]' }); } });
  $('#dlg-panel').addEventListener('close', function () { if (ui.sheet) { ui.sheet = false; ui.modo = null; ui.sel = null; ui.msg = ''; render({ sinFoco: true }); } });
  window.addEventListener('resize', function () { if (ui.sheet && panelVisible()) { ui.sheet = false; cerrar($('#dlg-panel')); render({ sinFoco: true }); } });

  /* Aclaración: con marco queda al pie; sin marco se abre desde «Ejemplo ilustrativo». */
  (function () {
    var b = $('#sbx-info'), av = $('#sbx-aviso');
    function set(v) { av.classList.toggle('open', v); b.setAttribute('aria-expanded', String(v)); }
    b.addEventListener('click', function () { set(!av.classList.contains('open')); });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && av.classList.contains('open')) { set(false); b.focus(); } });
    document.addEventListener('click', function (ev) { if (av.classList.contains('open') && !ev.target.closest('#sbx-info, #sbx-aviso')) set(false); });
  })();

  armarMarco(); render({ sinFoco: true });
})();
