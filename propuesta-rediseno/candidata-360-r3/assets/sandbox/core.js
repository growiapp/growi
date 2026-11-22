/* Growi · sandbox · núcleo compartido.
   Estado inmutable, acciones puras, dinero entero, hora simulada. Sin dependencias, sin red, sin almacenamiento, sin reloj del sistema.
   Lo usan por igual el navegador (window.GrowiSandbox.core) y las pruebas de Node (module.exports), como vendor/enlaces.js.
   Regla central: ningún total se guarda; todo indicador se deriva del estado con selectores. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.GrowiSandbox = root.GrowiSandbox || {}; root.GrowiSandbox.core = api; }
})(this, function () {
  'use strict';

  /* ── utilidades ── */
  function esEntero(n) { return typeof n === 'number' && isFinite(n) && Math.floor(n) === n; }
  function clone(x) { return x === undefined ? undefined : JSON.parse(JSON.stringify(x)); }
  function deepFreeze(o) {
    if (o && typeof o === 'object' && !Object.isFrozen(o)) {
      Object.freeze(o);
      Object.keys(o).forEach(function (k) { deepFreeze(o[k]); });
    }
    return o;
  }
  // Mismo criterio que limpiar() de vendor/enlaces.js: sin caracteres de control ni invisibles, espacios colapsados.
  var CONTROL = /[\u0000-\u001f\u007f​-‏‪-‮⁦-⁩﻿]/g;
  function limpiar(t, max) { return String(t == null ? '' : t).replace(CONTROL, ' ').replace(/\s+/g, ' ').trim().slice(0, max || 120); }

  /* ── dinero: pesos enteros, sin coma flotante ── */
  function pesos(n) {                       // 9500 → «$9.500»
    if (!esEntero(n)) throw new TypeError('Importe no entero: ' + n);
    return (n < 0 ? '-' : '') + '$' + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  // Redondeo entero, mitad hacia arriba. Evita 345/600*100 = 57,4999… (se mostraría 57 en vez de 58).
  function porcentaje(parte, total) { return total > 0 ? Math.floor((parte * 200 + total) / (2 * total)) : 0; }
  function promedio(total, n) { return n > 0 ? Math.floor((total * 2 + n) / (2 * n)) : 0; }

  /* ── tiempo simulado: minutos desde las 00:00 ── */
  function hm(s) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(String(s));
    if (!m || +m[1] > 23 || +m[2] > 59) throw new RangeError('Hora inválida: ' + s);
    return +m[1] * 60 + +m[2];
  }
  function fmtHM(n) {
    if (!esEntero(n) || n < 0) throw new RangeError('Minutos inválidos: ' + n);
    var h = Math.floor(n / 60), m = n % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }
  function aMinutos(x) { return typeof x === 'string' ? hm(x) : x; }   // acepta «11:00» o 660

  /* ── resultados controlados ── */
  function fail(code, datos, mensaje) {
    var e = { code: code };
    if (datos) Object.keys(datos).forEach(function (k) { e[k] = datos[k]; });
    if (mensaje) e.mensaje = mensaje;
    return { error: e };
  }

  /* ── store ──
     spec = { init(), acciones: { nombre(estado, payload) → {estado, resultado?} | {error} }, invariantes?(estado) → [texto] }
     Una acción que falla, lanza o deja el estado inconsistente NO cambia nada: no hay estados parciales. */
  function createStore(spec) {
    var inv = spec.invariantes || function () { return []; };
    var estado = deepFreeze(spec.init());
    var malos = inv(estado);
    if (malos.length) throw new Error('Estado inicial inconsistente: ' + malos.join('; '));
    var oyentes = [], aceptadas = [];

    function avisar() {
      oyentes.slice().forEach(function (fn) { try { fn(estado); } catch (e) { /* un oyente roto no corrompe el estado */ } });
    }
    return {
      getState: function () { return estado; },
      dispatch: function (nombre, payload) {
        var fn = spec.acciones[nombre];
        if (!fn) return { ok: false, error: { code: 'accion-desconocida', accion: nombre }, state: estado };
        var r;
        try { r = fn(estado, clone(payload === undefined ? {} : payload)); }
        catch (e) { return { ok: false, error: { code: 'error-interno', detalle: String(e && e.message || e) }, state: estado }; }
        if (!r || r.error || !r.estado) return { ok: false, error: (r && r.error) || { code: 'error-interno' }, state: estado };
        var rotos = inv(r.estado);
        if (rotos.length) return { ok: false, error: { code: 'invariante-violado', detalle: rotos }, state: estado };
        estado = deepFreeze(r.estado);
        aceptadas.push({ accion: nombre, payload: clone(payload === undefined ? {} : payload) });
        avisar();
        return { ok: true, state: estado, resultado: r.resultado || null };
      },
      reset: function () { estado = deepFreeze(spec.init()); aceptadas = []; avisar(); return estado; },
      subscribe: function (fn) { oyentes.push(fn); return function () { oyentes = oyentes.filter(function (x) { return x !== fn; }); }; },
      historial: function () { return clone(aceptadas); }     // solo las acciones aceptadas: reproducen el estado desde cero
    };
  }
  function replay(store, historial) {
    historial.forEach(function (h) { store.dispatch(h.accion, h.payload); });
    return store.getState();
  }

  return { esEntero: esEntero, clone: clone, deepFreeze: deepFreeze, limpiar: limpiar, pesos: pesos, porcentaje: porcentaje, promedio: promedio,
           hm: hm, fmtHM: fmtHM, aMinutos: aMinutos, fail: fail, createStore: createStore, replay: replay };
});
