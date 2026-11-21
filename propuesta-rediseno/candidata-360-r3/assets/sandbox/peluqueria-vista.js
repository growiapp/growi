/* Growi · sandbox de Peluquería · modelo de vista (puro, sin DOM).
   Traduce el estado de peluqueria.js a lo que la interfaz necesita: pasos de cada turno, «antes → ahora», recorrido guiado y textos.
   No tiene reglas de negocio: valida, calcula y decide siempre peluqueria.js.
   Navegador: window.GrowiSandbox.peluqueriaVista · Node: module.exports. */
(function (root, factory) {
  var core, pelu;
  if (typeof module === 'object' && module.exports) { core = require('./core.js'); pelu = require('./peluqueria.js'); }
  else { core = root.GrowiSandbox.core; pelu = root.GrowiSandbox.peluqueria; }
  var api = factory(core, pelu);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GrowiSandbox.peluqueriaVista = api;
})(this, function (core, pelu) {
  'use strict';
  var S = pelu.sel, fmt = core.fmtHM;

  var MEDIOS = { efectivo: 'Efectivo', transferencia: 'Transferencia', mercadopago: 'Mercado Pago' };
  // clave de estilo por estado visible
  var CLASE = { 'Programado': 'prog', 'Esperando inicio': 'espera', 'En curso': 'curso', 'Por cobrar': 'cobrar', 'Cobrado': 'cobrado', 'Cancelado': 'cancel', 'No se presentó': 'ausente' };
  function clase(estado) { return CLASE[estado] || 'prog'; }

  function minutos(n) { return n >= 60 ? Math.floor(n / 60) + ' h' + (n % 60 ? ' ' + (n % 60) + ' min' : '') : n + ' min'; }

  /* Qué le toca al turno ahora: el panel muestra solo lo que corresponde al paso en que está.
     avanzarA: hora a la que habría que llevar el reloj (acción explícita de la persona) para poder seguir. */
  function pasoTurno(s, id) {
    var t = S.turno(s, id); if (!t) return null;
    var base = { turno: t, estado: t.estado, clase: clase(t.estado), acciones: t.acciones, texto: '', avanzarA: null, progreso: null };
    var J = s.jornada;
    switch (t.estado) {
      case 'Programado':
        base.texto = 'Empieza a las ' + fmt(t.inicio) + '. Faltan ' + minutos(t.inicio - s.reloj) + '.';
        base.avanzarA = t.inicio;
        break;
      case 'Esperando inicio':
        if (t.acciones.iniciar === 'profesional-en-atencion') base.texto = 'Está por empezar, pero la profesional todavía atiende a otra clienta.';
        else base.texto = 'Ya es la hora. La atención empieza cuando la inicies.';
        break;
      case 'En curso': {
        var prev = t.atencion.inicioReal + t.duracion;
        base.progreso = { desde: t.atencion.inicioReal, hasta: prev, pct: Math.max(0, Math.min(100, core.porcentaje(s.reloj - t.atencion.inicioReal, t.duracion))) };
        base.texto = prev > s.reloj ? 'Fin previsto a las ' + fmt(prev) + '.' : 'Pasó el fin previsto (' + fmt(prev) + '). Finalizala cuando termine.';
        if (prev > s.reloj && prev <= J.cierre) base.avanzarA = prev;
        break;
      }
      case 'Por cobrar': base.texto = 'Terminó a las ' + fmt(t.atencion.finReal) + '. Falta registrar el cobro.'; break;
      case 'Cobrado': base.texto = 'Cobrado con ' + MEDIOS[t.cobro.medio] + '.'; break;
      default: base.texto = '';
    }
    return base;
  }

  /* Lo que va a pasar si se agenda esto: valida con la misma función de F1, sin agendar. */
  function previa(s, o) {
    if (!o.servicios || !o.servicios.length) return { ok: false, motivo: 'servicios', mensaje: 'Elegí al menos un servicio.' };
    if (!o.profesional || o.inicio == null) return { ok: false, motivo: 'horario', mensaje: 'Elegí un horario.' };
    var v = S.validarTurno(s, { profesional: o.profesional, servicios: o.servicios, inicio: o.inicio });
    if (v.error) return { ok: false, motivo: v.error.code, mensaje: v.error.mensaje, sugerencia: v.error.sugerencia || null };
    return { ok: true, duracion: v.duracion, fin: o.inicio + v.duracion, precio: S.precio(s, o.servicios) };
  }

  /* «Antes → ahora» de un cobro (o de cualquier cambio): sale de comparar dos estados reales. */
  function cambio(antes, despues) {
    var a = S.resumen(antes), b = S.resumen(despues), ia = S.ingresosPorProfesional(antes), ib = S.ingresosPorProfesional(despues);
    var prof = Object.keys(ib).map(function (id) { return { id: id, nombre: S.profesionales(despues).filter(function (p) { return p.id === id; })[0].nombre, antes: ia[id], ahora: ib[id], delta: ib[id] - ia[id] }; }).filter(function (x) { return x.delta !== 0; });
    var medios = Object.keys(b.caja.porMedio).map(function (m) { return { medio: m, antes: a.caja.porMedio[m], ahora: b.caja.porMedio[m], delta: b.caja.porMedio[m] - a.caja.porMedio[m] }; }).filter(function (x) { return x.delta !== 0; });
    var estados = despues.turnos.map(function (t) { var e = S.estadoVisible(despues, t), pt = antes.turnos.filter(function (x) { return x.id === t.id; })[0]; return { id: t.id, antes: pt ? S.estadoVisible(antes, pt) : null, ahora: e }; })
      .filter(function (x) { return x.antes !== x.ahora; });
    return {
      hayCambio: b.caja.total !== a.caja.total,
      caja: { antes: a.caja.total, ahora: b.caja.total, delta: b.caja.total - a.caja.total },
      atenciones: { antes: a.caja.atenciones, ahora: b.caja.atenciones, delta: b.caja.atenciones - a.caja.atenciones },
      porCobrar: { antes: a.porCobrar, ahora: b.porCobrar },
      profesionales: prof, medios: medios, estados: estados
    };
  }

  /* Recorrido opcional: «Julia → Camila 11:00 → reloj → iniciar → finalizar → cobrar → mirar caja». El progreso se deriva del estado. */
  var GUIA = { cliente: 'Julia Pereyra', servicios: ['corte', 'brushing'], profesional: 'camila', inicio: '11:00' };
  function progresoGuia(o) {
    var nuevos = o.actual.turnos.slice(o.inicio.turnos.length);
    var t = nuevos.filter(function (x) { return x.servicios.indexOf('corte') >= 0 && x.servicios.indexOf('brushing') >= 0; })[0] || nuevos[0] || null;
    var pasos = [
      { id: 'agendar', texto: 'Agendá un corte y brushing con Camila a las 11:00', hecho: !!t },
      { id: 'iniciar', texto: 'Llevá el reloj a las 11:00 e iniciá la atención', hecho: !!(t && t.atencion) },
      { id: 'finalizar', texto: 'Avanzá el reloj y finalizá la atención', hecho: !!(t && t.atencion && t.atencion.finReal !== null) },
      { id: 'cobrar', texto: 'Cobrá el turno', hecho: !!(t && t.cobro) },
      { id: 'caja', texto: 'Mirá cómo cambió la caja', hecho: !!(t && t.cobro && o.vistoImpacto) }
    ];
    var actual = -1; for (var i = 0; i < pasos.length; i++) if (!pasos[i].hecho) { actual = i; break; }
    return { pasos: pasos, actual: actual, completa: actual === -1, turno: t ? t.id : null };
  }

  /* Textos de error: el núcleo ya trae mensaje en español claro; esto solo cubre lo que no lo trae. */
  function mensajeError(err) {
    if (!err) return '';
    return err.mensaje || 'No pudimos hacer eso. Probá de nuevo.';
  }

  /* Franjas del día para la grilla: [{h:'09:00', min:540}, …] por hora entera dentro de la jornada. */
  function horas(s) {
    var o = [], J = s.jornada;
    for (var m = Math.ceil(J.apertura / 60) * 60; m <= J.cierre; m += 60) o.push({ min: m, etiqueta: fmt(m) });
    return o;
  }

  /* Horarios para mostrar por profesional: los de disponibilidad(), agrupados en tandas (mañana, mediodía, tarde). */
  function tandas(inicios) {
    var g = [['Mañana', 0, 12 * 60], ['Tarde', 12 * 60, 24 * 60]];
    return g.map(function (x) { return { nombre: x[0], inicios: inicios.filter(function (m) { return m >= x[1] && m < x[2]; }) }; }).filter(function (x) { return x.inicios.length; });
  }

  return { MEDIOS: MEDIOS, GUIA: GUIA, clase: clase, minutos: minutos, pasoTurno: pasoTurno, previa: previa, cambio: cambio, progresoGuia: progresoGuia, mensajeError: mensajeError, horas: horas, tandas: tandas };
});
