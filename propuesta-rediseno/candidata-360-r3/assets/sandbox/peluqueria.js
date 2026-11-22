/* Growi · sandbox · lógica de Peluquería (ejemplo funcional de una solución a medida).
   Un turno separa cinco cosas: hora programada, estado de reserva, inicio real, finalización y cobro.
   El reloj simulado solo avanza cuando el usuario lo pide y NUNCA inicia, finaliza ni cobra nada por sí solo.
   Estado visible (Programado, Esperando inicio, En curso, Por cobrar, Cobrado…) = derivado de esos campos y del reloj; no se guarda.
   Navegador: window.GrowiSandbox.peluqueria · Node: module.exports. Horas = minutos desde las 00:00; acepta «HH:MM» en las acciones. */
(function (root, factory) {
  var core, datos;
  if (typeof module === 'object' && module.exports) { core = require('./core.js'); datos = require('./peluqueria.data.js'); }
  else { core = root.GrowiSandbox.core; datos = root.GrowiSandbox.peluqueriaDatos; }
  var api = factory(core, datos);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GrowiSandbox.peluqueria = api;
})(this, function (core, DATOS) {
  'use strict';
  var fail = core.fail, hm = core.hm, fmt = core.fmtHM;
  function hora(x) { try { return core.aMinutos(x); } catch (_) { return NaN; } }   // una hora mal escrita es un error controlado, no una excepción

  /* ── estado inicial reproducible ── */
  function init() {
    var d = core.clone(DATOS);
    return {
      negocio: d.negocio,
      reloj: hm(d.reloj),
      jornada: { apertura: hm(d.jornada.apertura), cierre: hm(d.jornada.cierre), paso: d.jornada.paso },
      servicios: d.servicios, profesionales: d.profesionales, medios: d.medios, clientas: d.clientas,
      bloqueos: d.bloqueos.map(function (b) { return { id: b.id, profesional: b.profesional, inicio: hm(b.inicio), fin: hm(b.fin), motivo: b.motivo }; }),
      turnos: d.turnos.map(function (t) {
        var fin = t.atencion && t.atencion.finReal ? hm(t.atencion.finReal) : null;
        return { id: t.id, profesional: t.profesional, inicio: hm(t.inicio), servicios: t.servicios, cliente: t.cliente, reserva: t.reserva,
                 atencion: t.atencion ? { inicioReal: hm(t.atencion.inicioReal), finReal: fin } : null,
                 cobro: t.cobro ? { medio: t.cobro.medio, en: fin } : null };       // los cobros históricos se registran al terminar la atención
      }),
      siguiente: d.turnos.length + 1
    };
  }

  /* ── selectores básicos ── */
  function por(lista, id) { for (var i = 0; i < lista.length; i++) if (lista[i].id === id) return lista[i]; return null; }
  function serv(s, id) { return por(s.servicios, id); }
  function prof(s, id) { return por(s.profesionales, id); }
  function turno(s, id) { return por(s.turnos, id); }
  function duracion(s, ids) { return ids.reduce(function (a, i) { return a + serv(s, i).min; }, 0); }
  function precio(s, ids) { return ids.reduce(function (a, i) { return a + serv(s, i).precio; }, 0); }
  function fin(s, t) { return t.inicio + duracion(s, t.servicios); }
  function nombres(s, ids) { return ids.map(function (i) { return serv(s, i).nombre; }).join(' + '); }
  function vivos(s, pid) { return s.turnos.filter(function (t) { return t.profesional === pid && t.reserva === 'confirmado'; }); }
  function hace(p, ids) { return ids.every(function (i) { return p.hace.indexOf(i) >= 0; }); }

  function estadoVisible(s, t) {
    if (t.reserva === 'cancelado') return 'Cancelado';
    if (t.reserva === 'ausente') return 'No se presentó';
    if (t.cobro) return 'Cobrado';
    if (t.atencion && t.atencion.finReal !== null) return 'Por cobrar';
    if (t.atencion) return 'En curso';
    return s.reloj >= t.inicio ? 'Esperando inicio' : 'Programado';
  }

  function conflicto(s, pid, inicio, dur, ignorarId) {
    var f = inicio + dur, i, t, b, v = vivos(s, pid);
    for (i = 0; i < v.length; i++) { t = v[i]; if (t.id !== ignorarId && inicio < fin(s, t) && t.inicio < f) return { tipo: 'turno', con: t }; }
    for (i = 0; i < s.bloqueos.length; i++) { b = s.bloqueos[i]; if (b.profesional === pid && inicio < b.fin && b.inicio < f) return { tipo: 'bloqueo', con: b }; }
    return null;
  }

  /* ── errores controlados, con mensaje listo para mostrar ── */
  function err(code, datos, mensaje) { return fail(code, datos, mensaje); }
  var FIJOS = {
    'turno-inexistente': 'Ese turno no existe.',
    'profesional-inexistente': 'Esa profesional no existe.',
    'sin-servicios': 'Elegí al menos un servicio.',
    'servicio-inexistente': 'Ese servicio no existe.',
    'servicio-repetido': 'Ese servicio ya está en el turno.',
    'falta-cliente': 'Falta el nombre de la clienta o del cliente.',
    'no-movible': 'Solo se puede mover un turno confirmado que todavía no empezó.',
    'no-cancelable': 'Solo se puede cancelar un turno confirmado que todavía no empezó.',
    'no-aplicable': 'Esa acción no se puede hacer con este turno ahora.',
    'reloj-no-retrocede': 'El reloj solo avanza.',
    'reserva-no-vigente': 'Ese turno ya no está confirmado.',
    'ya-iniciada': 'La atención ya empezó.',
    'no-iniciada': 'La atención todavía no empezó.',
    'ya-finalizada': 'La atención ya terminó.',
    'no-finalizada': 'Primero hay que finalizar la atención.',
    'ya-cobrado': 'Este turno ya está cobrado.',
    'medio-invalido': 'Elegí un medio de pago de la lista.',
    'hora-invalida': 'Esa hora no es válida.'
  };
  function e(code, datos) { return err(code, datos, FIJOS[code]); }

  /* Valida un turno posible. Devuelve {ok, duracion} o {error}. */
  function validarTurno(s, o) {
    var p = prof(s, o.profesional); if (!p) return e('profesional-inexistente');
    var ids = o.servicios;
    if (!Array.isArray(ids) || !ids.length) return e('sin-servicios');
    var i, vistos = {};
    for (i = 0; i < ids.length; i++) {
      if (!serv(s, ids[i])) return e('servicio-inexistente');
      if (vistos[ids[i]]) return e('servicio-repetido');
      vistos[ids[i]] = 1;
    }
    for (i = 0; i < ids.length; i++) if (p.hace.indexOf(ids[i]) < 0) return err('competencia', { profesional: p.nombre, servicio: serv(s, ids[i]).nombre }, p.nombre + ' no hace ' + serv(s, ids[i]).nombre + '.');
    var J = s.jornada, d = duracion(s, ids), ini = o.inicio;
    if (!core.esEntero(ini) || (ini % J.paso)) return err('fuera-de-paso', null, 'Los horarios van de a ' + J.paso + ' minutos.');
    if (ini < J.apertura || ini + d > J.cierre) return err('fuera-de-jornada', null, 'El turno no entra en el horario del salón (' + fmt(J.apertura) + ' a ' + fmt(J.cierre) + ').');
    if (ini < s.reloj) return err('en-el-pasado', null, 'Ese horario ya pasó. Ahora son las ' + fmt(s.reloj) + '.');
    var c = conflicto(s, o.profesional, ini, d, o.ignorarId);
    if (c) {
      var desde = c.tipo === 'turno' ? c.con.inicio : c.con.inicio, hasta = c.tipo === 'turno' ? fin(s, c.con) : c.con.fin;
      var que = c.tipo === 'turno' ? nombres(s, c.con.servicios) : c.con.motivo;
      var sug = null;
      if (ini < desde) {                                  // el turno nuevo empieza antes: se propone terminar justo cuando empieza el otro
        var cand = Math.floor((desde - d) / J.paso) * J.paso;
        if (cand >= s.reloj && cand >= J.apertura && !conflicto(s, o.profesional, cand, d, o.ignorarId)) sug = fmt(cand);
      }
      var detalle = ini < desde ? p.nombre + ' tiene ' + que + ' a las ' + fmt(desde) : p.nombre + ' tiene ' + que + ' de ' + fmt(desde) + ' a ' + fmt(hasta);
      var msg = detalle + '.' + (sug ? ' Con ' + nombres(s, ids) + ' (' + d + ' min) tenés que empezar a las ' + sug + ' o antes.' : ' Elegí otro horario.');
      return err('solapamiento', { con: c.con.id, detalle: detalle, sugerencia: sug }, msg);
    }
    return { ok: true, duracion: d };
  }

  /* ── precondiciones de cada acción: las comparten las acciones y la interfaz (para habilitar o no un botón) ── */
  function sinAtender(t) { return t.reserva === 'confirmado' && !t.atencion; }
  var chequeos = {
    mover: function (s, t) { return sinAtender(t) ? null : e('no-movible'); },
    cancelar: function (s, t) { return sinAtender(t) ? null : e('no-cancelable'); },
    marcarAusente: function (s, t) {
      if (!sinAtender(t)) return e('no-aplicable');
      return s.reloj < t.inicio ? err('todavia-no-es-la-hora', { desde: t.inicio }, 'Todavía no es la hora del turno (' + fmt(t.inicio) + ').') : null;
    },
    iniciar: function (s, t) {
      if (t.reserva !== 'confirmado') return e('reserva-no-vigente');
      if (t.atencion) return e('ya-iniciada');
      if (s.reloj < t.inicio) return err('todavia-no-es-la-hora', { desde: t.inicio }, 'Todavía no es la hora del turno (' + fmt(t.inicio) + ').');
      var ocupado = s.turnos.some(function (x) { return x.profesional === t.profesional && x.atencion && x.atencion.finReal === null; });
      return ocupado ? err('profesional-en-atencion', null, prof(s, t.profesional).nombre + ' ya está atendiendo otro turno.') : null;
    },
    finalizar: function (s, t) { return !t.atencion ? e('no-iniciada') : t.atencion.finReal !== null ? e('ya-finalizada') : null; },
    cobrar: function (s, t) { return t.cobro ? e('ya-cobrado') : (!t.atencion || t.atencion.finReal === null) ? e('no-finalizada') : null; },
    agregarServicio: function (s, t) { return (t.atencion && t.atencion.finReal === null && !t.cobro) ? null : e('no-aplicable'); }
  };
  // Qué puede hacerse con un turno ahora: {accion: null (se puede) | código de error}. La interfaz lo usa para habilitar botones.
  function motivos(s, id) {
    var t = turno(s, id); if (!t) return null;
    var o = {};
    Object.keys(chequeos).forEach(function (k) { var r = chequeos[k](s, t); o[k] = r ? r.error.code : null; });
    return o;
  }

  /* ── acciones ── */
  function mut(s, f) { var n = core.clone(s); var r = f(n); return { estado: n, resultado: r || null }; }
  function conTurno(s, a, f) { var t = turno(s, a.turno); return t ? f(t) : e('turno-inexistente'); }

  var acciones = {
    agendar: function (s, a) {
      var cliente = core.limpiar(a.cliente, 60); if (!cliente) return e('falta-cliente');
      var inicio = hora(a.inicio); if (!core.esEntero(inicio)) return e('hora-invalida');
      var v = validarTurno(s, { profesional: a.profesional, servicios: a.servicios, inicio: inicio }); if (v.error) return v;
      var fn = inicio + v.duracion;
      var adv = s.turnos.filter(function (t) { return t.reserva === 'confirmado' && t.cliente === cliente && inicio < fin(s, t) && t.inicio < fn; })
                         .map(function (t) { return { code: 'cliente-superpuesto', turno: t.id, mensaje: cliente + ' ya tiene el turno ' + t.id + ' en ese horario.' }; });
      return mut(s, function (n) {
        var id = 't' + n.siguiente; n.siguiente += 1;
        if (n.clientas.indexOf(cliente) < 0) n.clientas.push(cliente);
        n.turnos.push({ id: id, profesional: a.profesional, inicio: inicio, servicios: a.servicios.slice(), cliente: cliente, reserva: 'confirmado', atencion: null, cobro: null, creadoEn: n.reloj });
        return { turno: id, advertencias: adv };
      });
    },
    mover: function (s, a) {
      return conTurno(s, a, function (t) {
        var c = chequeos.mover(s, t); if (c) return c;
        var pid = a.profesional || t.profesional, ini = hora(a.inicio); if (!core.esEntero(ini)) return e('hora-invalida');
        var v = validarTurno(s, { profesional: pid, servicios: t.servicios, inicio: ini, ignorarId: t.id }); if (v.error) return v;
        return mut(s, function (n) { var x = turno(n, t.id); x.inicio = ini; x.profesional = pid; });
      });
    },
    cancelar: function (s, a) {
      return conTurno(s, a, function (t) {
        var c = chequeos.cancelar(s, t); if (c) return c;
        return mut(s, function (n) { var x = turno(n, t.id); x.reserva = 'cancelado'; x.cierreEn = n.reloj; });
      });
    },
    marcarAusente: function (s, a) {
      return conTurno(s, a, function (t) {
        var c = chequeos.marcarAusente(s, t); if (c) return c;
        return mut(s, function (n) { var x = turno(n, t.id); x.reserva = 'ausente'; x.cierreEn = n.reloj; });
      });
    },
    // El reloj es lo único que cambia: ningún turno se inicia, finaliza ni cobra por pasar el tiempo.
    avanzarReloj: function (s, a) {
      var h = hora(a.hasta);
      if (!core.esEntero(h)) return e('hora-invalida');
      if (h <= s.reloj) return e('reloj-no-retrocede');
      if (h > s.jornada.cierre) return err('fuera-de-jornada', null, 'El salón cierra a las ' + fmt(s.jornada.cierre) + '.');
      if (h % s.jornada.paso) return err('fuera-de-paso', null, 'El reloj avanza de a ' + s.jornada.paso + ' minutos.');
      return mut(s, function (n) { n.reloj = h; });
    },
    iniciar: function (s, a) {
      return conTurno(s, a, function (t) {
        var c = chequeos.iniciar(s, t); if (c) return c;
        return mut(s, function (n) { turno(n, t.id).atencion = { inicioReal: n.reloj, finReal: null }; });
      });
    },
    agregarServicio: function (s, a) {
      return conTurno(s, a, function (t) {
        var c = chequeos.agregarServicio(s, t); if (c) return c;
        if (!serv(s, a.servicio)) return e('servicio-inexistente');
        if (t.servicios.indexOf(a.servicio) >= 0) return e('servicio-repetido');
        var p = prof(s, t.profesional);
        if (p.hace.indexOf(a.servicio) < 0) return err('competencia', { profesional: p.nombre, servicio: serv(s, a.servicio).nombre }, p.nombre + ' no hace ' + serv(s, a.servicio).nombre + '.');
        var d = duracion(s, t.servicios) + serv(s, a.servicio).min;
        var cf = conflicto(s, t.profesional, t.inicio, d, t.id);
        if (cf) return err('solapamiento', { con: cf.con.id }, 'Sumar ' + serv(s, a.servicio).nombre + ' pisaría el siguiente turno de ' + p.nombre + '.');
        if (t.inicio + d > s.jornada.cierre) return err('fuera-de-jornada', null, 'El turno no entra en el horario del salón.');
        return mut(s, function (n) { turno(n, t.id).servicios.push(a.servicio); });
      });
    },
    finalizar: function (s, a) {
      return conTurno(s, a, function (t) {
        var c = chequeos.finalizar(s, t); if (c) return c;
        return mut(s, function (n) { turno(n, t.id).atencion.finReal = n.reloj; });
      });
    },
    cobrar: function (s, a) {
      return conTurno(s, a, function (t) {
        var c = chequeos.cobrar(s, t); if (c) return c;
        if (s.medios.indexOf(a.medio) < 0) return e('medio-invalido');
        var monto = precio(s, t.servicios);
        return mut(s, function (n) { turno(n, t.id).cobro = { medio: a.medio, en: n.reloj }; return { turno: t.id, monto: monto, medio: a.medio }; });
      });
    }
  };

  /* ── indicadores derivados ── */
  function disponibilidad(s, ids, desde) {
    var J = s.jornada, dd = hora(desde), base = Math.max(core.esEntero(dd) ? dd : 0, s.reloj, J.apertura);
    var arranque = Math.ceil(base / J.paso) * J.paso;
    var ok = Array.isArray(ids) && ids.length && ids.every(function (i) { return serv(s, i); }) && new Set(ids).size === ids.length;
    return s.profesionales.map(function (p) {
      var o = { profesional: p.id, nombre: p.nombre, compatible: !!ok && hace(p, ids), inicios: [] };
      if (!ok) { o.motivo = 'servicios-invalidos'; return o; }
      if (!o.compatible) { o.motivo = 'competencia'; return o; }
      var d = duracion(s, ids);
      for (var t = arranque; t + d <= J.cierre; t += J.paso) if (!conflicto(s, p.id, t, d)) o.inicios.push(t);
      return o;
    });
  }
  function cobrados(s) { return s.turnos.filter(function (t) { return t.cobro; }); }
  function caja(s) {
    var o = {}, total = 0;
    s.medios.forEach(function (m) { o[m] = 0; });
    cobrados(s).forEach(function (t) { var m = precio(s, t.servicios); o[t.cobro.medio] += m; total += m; });
    return { porMedio: o, total: total, atenciones: cobrados(s).length };
  }
  function ingresosPorProfesional(s) {
    var o = {}; s.profesionales.forEach(function (p) { o[p.id] = 0; });
    cobrados(s).forEach(function (t) { o[t.profesional] += precio(s, t.servicios); });
    return o;
  }
  function ocupacion(s, pid) {
    var bl = s.bloqueos.filter(function (b) { return b.profesional === pid; }).reduce(function (a, b) { return a + b.fin - b.inicio; }, 0);
    var disp = s.jornada.cierre - s.jornada.apertura - bl;
    var res = vivos(s, pid).reduce(function (a, t) { return a + duracion(s, t.servicios); }, 0);
    return { reservados: res, disponibles: disp, pct: core.porcentaje(res, disp) };
  }
  function vistaTurno(s, t) {
    var d = duracion(s, t.servicios);
    return { id: t.id, profesional: t.profesional, cliente: t.cliente, inicio: t.inicio, fin: t.inicio + d, duracion: d, precio: precio(s, t.servicios),
             servicios: t.servicios.map(function (i) { var x = serv(s, i); return { id: x.id, nombre: x.nombre, min: x.min, precio: x.precio }; }),
             reserva: t.reserva, estado: estadoVisible(s, t), atencion: t.atencion, cobro: t.cobro, acciones: motivos(s, t.id) };
  }
  function agenda(s) {
    return s.profesionales.map(function (p) {
      var ts = s.turnos.filter(function (t) { return t.profesional === p.id; }).sort(function (x, y) { return x.inicio - y.inicio; }).map(function (t) { return vistaTurno(s, t); });
      return { profesional: p.id, nombre: p.nombre, hace: p.hace.slice(), turnos: ts, bloqueos: s.bloqueos.filter(function (b) { return b.profesional === p.id; }),
               ocupacion: ocupacion(s, p.id) };
    });
  }
  function resumen(s) {
    var c = caja(s), v = s.turnos.map(function (t) { return estadoVisible(s, t); });
    var cuenta = function (x) { return v.filter(function (y) { return y === x; }).length; };
    var porCobrar = s.turnos.filter(function (t) { return !t.cobro && t.atencion && t.atencion.finReal !== null; });
    return { reloj: s.reloj, caja: c, ingresos: ingresosPorProfesional(s), clientas: s.clientas.length,
             enCurso: cuenta('En curso'), esperandoInicio: cuenta('Esperando inicio'), programados: cuenta('Programado'),
             porCobrar: { n: porCobrar.length, monto: porCobrar.reduce(function (a, t) { return a + precio(s, t.servicios); }, 0) },
             cancelados: cuenta('Cancelado'), ausentes: cuenta('No se presentó') };
  }
  // Actividad: línea de tiempo derivada de los propios turnos (nada se duplica ni se guarda aparte).
  var RANGO = { agendado: 0, inicio: 1, fin: 2, cobro: 3, cancelado: 4, ausente: 4 };
  function actividad(s) {
    var ev = [];
    s.turnos.forEach(function (t) {
      var base = { turno: t.id, profesional: t.profesional, cliente: t.cliente, servicios: nombres(s, t.servicios), vivo: t.creadoEn !== undefined };   // vivo = creado durante la sesión (la semilla es historia)
      var add = function (tipo, hora, extra) { ev.push(Object.assign({ tipo: tipo, t: hora }, base, extra || {})); };
      if (t.creadoEn !== undefined) add('agendado', t.creadoEn, { programadoPara: t.inicio });
      if (t.atencion) { add('inicio', t.atencion.inicioReal); if (t.atencion.finReal !== null) add('fin', t.atencion.finReal); }
      if (t.cobro) add('cobro', t.cobro.en, { monto: precio(s, t.servicios), medio: t.cobro.medio });
      if (t.reserva === 'cancelado') add('cancelado', t.cierreEn);
      if (t.reserva === 'ausente') add('ausente', t.cierreEn);
    });
    return ev.sort(function (a, b) { return b.t - a.t || (b.vivo - a.vivo) || RANGO[b.tipo] - RANGO[a.tipo] || (a.turno < b.turno ? 1 : a.turno > b.turno ? -1 : 0); });   // lo más nuevo primero
  }
  // Próximos momentos útiles para adelantar el reloj: inicio de turnos pendientes y fin previsto de los que están en curso.
  function proximosHitos(s) {
    var h = [];
    s.turnos.forEach(function (t) {
      if (sinAtender(t) && t.inicio > s.reloj) h.push({ t: t.inicio, tipo: 'inicio-turno', turno: t.id });
      if (t.atencion && t.atencion.finReal === null && fin(s, t) > s.reloj) h.push({ t: fin(s, t), tipo: 'fin-previsto', turno: t.id });
    });
    return h.sort(function (a, b) { return a.t - b.t; });
  }

  /* ── invariantes ── */
  function invariantes(s) {
    var errs = [], ids = {};
    s.turnos.forEach(function (t) { if (ids[t.id]) errs.push('id repetido ' + t.id); ids[t.id] = 1; });
    s.turnos.forEach(function (t) {
      var p = prof(s, t.profesional);
      if (!p) { errs.push('profesional inexistente en ' + t.id); return; }
      if (!t.servicios.length || !t.servicios.every(function (i) { return serv(s, i); })) { errs.push('servicios inválidos en ' + t.id); return; }
      if (!hace(p, t.servicios)) errs.push('competencia ' + t.id);
      if (t.reserva !== 'confirmado' && t.reserva !== 'cancelado' && t.reserva !== 'ausente') errs.push('reserva inválida ' + t.id);
      if (t.cobro && !(t.atencion && t.atencion.finReal !== null)) errs.push('cobro sin finalizar ' + t.id);
      if (t.atencion && t.atencion.finReal !== null && t.atencion.finReal < t.atencion.inicioReal) errs.push('fin anterior al inicio ' + t.id);
      if (t.reserva !== 'confirmado' && (t.atencion || t.cobro)) errs.push('atención o cobro en reserva no vigente ' + t.id);
      if (t.cobro && s.medios.indexOf(t.cobro.medio) < 0) errs.push('medio inválido en ' + t.id);
      if (t.cobro && t.atencion && t.cobro.en !== null && t.cobro.en < t.atencion.finReal) errs.push('cobro anterior a la finalización ' + t.id);
    });
    if (errs.length) return errs;
    s.profesionales.forEach(function (p) {
      var it = vivos(s, p.id).map(function (t) { return [t.inicio, fin(s, t), t.id]; })
        .concat(s.bloqueos.filter(function (b) { return b.profesional === p.id; }).map(function (b) { return [b.inicio, b.fin, b.id]; }))
        .sort(function (a, b) { return a[0] - b[0]; });
      for (var i = 1; i < it.length; i++) if (it[i][0] < it[i - 1][1]) errs.push('solapamiento ' + p.id + ': ' + it[i - 1][2] + '/' + it[i][2]);
      if (s.turnos.filter(function (t) { return t.profesional === p.id && t.atencion && t.atencion.finReal === null; }).length > 1) errs.push('dos atenciones abiertas de ' + p.id);
    });
    var suma = 0, ing = ingresosPorProfesional(s); Object.keys(ing).forEach(function (k) { suma += ing[k]; });
    if (caja(s).total !== suma) errs.push('la caja no coincide con los ingresos por profesional');
    if (s.reloj < s.jornada.apertura || s.reloj > s.jornada.cierre) errs.push('reloj fuera de la jornada');
    return errs;
  }

  function crear() { return core.createStore({ init: init, acciones: acciones, invariantes: invariantes }); }

  return {
    datos: DATOS, init: init, crear: crear, acciones: acciones, invariantes: invariantes,
    sel: { agenda: agenda, turno: function (s, id) { var t = turno(s, id); return t ? vistaTurno(s, t) : null; }, motivos: motivos,
           profesionales: function (s) { return s.profesionales.map(function (p) { return { id: p.id, nombre: p.nombre, hace: p.hace.slice() }; }); },
           servicios: function (s) { return s.servicios.map(function (x) { return { id: x.id, nombre: x.nombre, min: x.min, precio: x.precio }; }); },
           duracion: duracion, precio: precio, compatibles: function (s, ids) { return s.profesionales.filter(function (p) { return hace(p, ids); }).map(function (p) { return p.id; }); },
           disponibilidad: disponibilidad, validarTurno: validarTurno, estadoVisible: estadoVisible, caja: caja, ingresosPorProfesional: ingresosPorProfesional,
           ocupacion: ocupacion, resumen: resumen, actividad: actividad, proximosHitos: proximosHitos }
  };
});
