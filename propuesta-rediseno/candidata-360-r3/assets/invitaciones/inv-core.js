/* Invitaciones · núcleo funcional (F4.1).
   Funciones puras, sin DOM, sin red, sin almacenamiento. Contiene: los eventos de muestra, la validación y el armado del mensaje de WhatsApp (contrato de F0)
   y la máquina de estados de cada recorrido. Nada de esto envía, guarda ni registra nada: el mensaje solo se prepara. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GrowiInv = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------- eventos de muestra (datos ficticios). La preposición vive en el dato del evento para no generar «a el».
  var EVENTOS = {
    cas: { id: 'cas', destino: 'Lucía y Tomás', saludo: 'Hola, Lucía y Tomás.', personas: true, tratamiento: 'ustedes', pasos: ['chat', 'sellada', 'portada', 'programa', 'lugar', 'confirmar', 'mensaje'],
           ocasion: 'a su casamiento del sábado 20 de marzo', cierre: 'Les mando un abrazo.', errRespuesta: 'Elegí si podés ir o no.' },
    cum: { id: 'cum', destino: 'Mica', saludo: 'Hola, Mica.', personas: true, tratamiento: 'vos', pasos: ['portada', 'noche', 'info', 'confirmar', 'mensaje'],
           ocasion: 'a tus 30 el sábado 14 de agosto', cierre: 'Te mando un abrazo.', errRespuesta: 'Elegí si podés ir o no.' },
    emp: { id: 'emp', destino: 'el organizador', saludo: 'Hola,', personas: false, tratamiento: 'neutro', pasos: ['portada', 'jornada', 'confirmar', 'mensaje'],
           ocasion: 'al Encuentro anual 2027 del jueves 18 de marzo', errRespuesta: 'Elegí si asistís o no.' }
  };
  var MAX_PERSONAS = 5, MAX_NOMBRE = 60;

  // ---------- validación (F0): nombre sin caracteres de control ni invisibles, espacios colapsados, máximo 60; personas enteras de 1 a 5 solo si el evento lo habilita.
  var INVISIBLES = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u00AD\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/;
  function normalizarNombre(n) { return String(n == null ? '' : n).replace(/[\t\n\r\u00A0\u2000-\u200A\u2028\u2029\u202F\u205F\u3000 ]+/g, ' ').trim(); }

  function entero(p) {
    if (typeof p === 'number') return isFinite(p) && Math.floor(p) === p ? p : NaN;
    if (typeof p === 'string' && /^\s*\d+\s*$/.test(p)) return parseInt(p, 10);
    return NaN;
  }

  function validar(evId, datos) {
    var ev = EVENTOS[evId], d = datos || {}, errores = {};
    var crudo = String(d.nombre == null ? '' : d.nombre);
    if (INVISIBLES.test(crudo)) errores.nombre = 'Probá con letras y números, sin símbolos raros.';
    else {
      var n = normalizarNombre(crudo);
      if (!n) errores.nombre = 'Escribí tu nombre para armar el mensaje.';
      else if (n.length > MAX_NOMBRE) errores.nombre = 'Usá hasta ' + MAX_NOMBRE + ' caracteres.';
    }
    if (d.respuesta !== 'si' && d.respuesta !== 'no') errores.respuesta = ev.errRespuesta;
    if (ev.personas && d.respuesta === 'si') {
      var p = entero(d.personas);
      if (isNaN(p)) errores.personas = 'Indicá un número entero, de 1 a ' + MAX_PERSONAS + '.';
      else if (p < 1 || p > MAX_PERSONAS) errores.personas = 'Indicá entre 1 y ' + MAX_PERSONAS + ' personas.';
    }
    var ok = !errores.nombre && !errores.respuesta && !errores.personas;
    return { ok: ok, errores: errores };
  }

  // ---------- mensaje (textos exactos: cinco de F0 y tres de cumpleaños aprobados en F4.1)
  function mensaje(evId, datos) {
    var v = validar(evId, datos);
    if (!v.ok) return null;
    var ev = EVENTOS[evId], n = normalizarNombre(datos.nombre), si = datos.respuesta === 'si';
    if (evId === 'emp') return si
      ? 'Hola, soy ' + n + '. Confirmo que asisto ' + ev.ocasion + '.'
      : 'Hola, soy ' + n + '. No voy a poder asistir ' + ev.ocasion + '. Gracias por avisarme.';
    if (!si) return ev.saludo + ' Soy ' + n + '. Me hubiera encantado, pero no voy a poder ir ' + ev.ocasion + '. ' + ev.cierre;
    var cant = entero(datos.personas);
    if (cant === 1) return ev.saludo + ' Soy ' + n + ' y confirmo que voy ' + ev.ocasion + '. Gracias por invitarme.';
    return ev.saludo + ' Soy ' + n + ' y confirmamos que vamos ' + ev.ocasion + '. Somos ' + cant + '. Gracias por invitarnos.';
  }

  // ---------- recorridos
  var ACTOS = { chat: 1, sellada: 1, portada: 1, programa: 2, lugar: 2, confirmar: 3, mensaje: 4 };
  var PRIMER_PASO_DE_ACTO = { 1: 'chat', 2: 'programa', 3: 'confirmar', 4: 'mensaje' };
  function acto(paso) { return ACTOS[paso] || 0; }

  function inicial(evId) {
    var ev = EVENTOS[evId];
    return { ev: evId, paso: ev.pasos[0], abierta: evId !== 'cas', datos: { nombre: '', respuesta: null, personas: 1 }, errores: {}, mensaje: null, wa: false, detalle: null, noche: 1 };
  }
  function copiar(s, c) { var o = {}, k; for (k in s) o[k] = s[k]; for (k in c) o[k] = c[k]; return o; }
  function permitido(s, paso) { return EVENTOS[s.ev].pasos.indexOf(paso) >= 0; }

  // Reductor: devuelve un estado nuevo; no muta. Acciones: ver-sellada, abrir, ir, visto, acto, siguiente, anterior, datos, preparar, editar, wa, cerrar-wa, detalle, cerrar-detalle, noche, reiniciar.
  function reducir(s, a) {
    var ev = EVENTOS[s.ev], t = a.tipo, paso;
    switch (t) {
      case 'ver-sellada': return s.ev === 'cas' && s.paso === 'chat' ? copiar(s, { paso: 'sellada' }) : s;
      case 'abrir': return s.ev === 'cas' && (s.paso === 'sellada' || s.paso === 'chat') ? copiar(s, { paso: 'portada', abierta: true }) : s;
      case 'ir': case 'visto':
        paso = a.paso;
        if (!permitido(s, paso) || (paso === 'mensaje' && !s.mensaje)) return s;
        if (s.ev === 'cas' && (paso === 'chat' || paso === 'sellada')) return t === 'ir' ? copiar(s, { paso: paso, abierta: false, wa: false, detalle: null }) : s;
        if (t === 'visto' && (s.wa || s.paso === 'mensaje' || (s.ev === 'cas' && !s.abierta))) return s;
        return copiar(s, { paso: paso, abierta: true, wa: false });
      case 'acto': {
        if (s.ev !== 'cas') return s;
        var n = a.n; if (n < 1 || n > 4) return s;
        if (n === 4) return reducir(s, { tipo: 'preparar' });
        paso = n === 1 && s.abierta ? 'portada' : PRIMER_PASO_DE_ACTO[n];
        return reducir(copiar(s, { wa: false }), { tipo: 'ir', paso: paso });
      }
      case 'siguiente': { var ac = acto(s.paso); return ac >= 4 ? s : reducir(s, { tipo: 'acto', n: ac + 1 }); }
      case 'anterior': { var an = acto(s.paso); return an <= 1 ? s : reducir(s, { tipo: 'acto', n: an - 1 }); }
      case 'datos': {
        var d = copiar(s.datos, {}); d[a.campo] = a.valor;
        var e = copiar(s.errores, {}); delete e[a.campo];
        if (a.campo === 'respuesta') delete e.personas;
        return copiar(s, { datos: d, errores: e, mensaje: null });
      }
      case 'preparar': {
        var v = validar(s.ev, s.datos);
        if (!v.ok) return copiar(s, { paso: 'confirmar', abierta: true, errores: v.errores, mensaje: null, wa: false });
        return copiar(s, { paso: 'mensaje', abierta: true, errores: {}, mensaje: mensaje(s.ev, s.datos), wa: false });
      }
      case 'editar': return s.paso === 'mensaje' ? copiar(s, { paso: 'confirmar', mensaje: null, wa: false }) : s;
      case 'wa': return s.paso === 'mensaje' && s.mensaje ? copiar(s, { wa: true }) : s;
      case 'cerrar-wa': return s.wa ? copiar(s, { wa: false }) : s;
      case 'detalle': return s.ev === 'emp' && !s.wa && s.paso !== 'mensaje' ? copiar(s, { detalle: a.id }) : s;
      case 'cerrar-detalle': return s.detalle ? copiar(s, { detalle: null }) : s;
      case 'noche': return s.ev === 'cum' && (a.idx === 0 || a.idx === 1 || a.idx === 2) ? copiar(s, { noche: a.idx }) : s;
      case 'reiniciar': return inicial(s.ev);
      default: return s;
    }
  }

  return { EVENTOS: EVENTOS, MAX_PERSONAS: MAX_PERSONAS, MAX_NOMBRE: MAX_NOMBRE, normalizarNombre: normalizarNombre, validar: validar, mensaje: mensaje, acto: acto, inicial: inicial, reducir: reducir };
});
