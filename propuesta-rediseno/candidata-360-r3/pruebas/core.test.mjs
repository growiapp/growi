// Pruebas del núcleo compartido.   node --test pruebas/     (Node >= 20, sin dependencias)
import test from 'node:test';
import assert from 'node:assert/strict';
import core from '../assets/sandbox/core.js';

test('dinero: formato en pesos y rechazo de importes no enteros', () => {
  assert.equal(core.pesos(0), '$0');
  assert.equal(core.pesos(950), '$950');
  assert.equal(core.pesos(9500), '$9.500');
  assert.equal(core.pesos(142400), '$142.400');
  assert.equal(core.pesos(1234567), '$1.234.567');
  assert.equal(core.pesos(-500), '-$500');
  assert.throws(() => core.pesos(10.5), TypeError);
  assert.throws(() => core.pesos(NaN), TypeError);
});
test('porcentaje y promedio: aritmética entera, mitad hacia arriba (sin 57,4999…)', () => {
  assert.equal(345 / 600 * 100, 57.49999999999999);          // la trampa de la coma flotante
  assert.equal(Math.round(345 / 600 * 100), 57);             // lo que mostraría un cálculo ingenuo
  assert.equal(core.porcentaje(345, 600), 58);
  assert.equal(core.porcentaje(270, 600), 45);
  assert.equal(core.porcentaje(0, 600), 0);
  assert.equal(core.porcentaje(5, 0), 0);
  assert.equal(core.promedio(142400, 20), 7120);
  assert.equal(core.promedio(151900, 21), 7233);
  assert.equal(core.promedio(3, 2), 2);                      // 1,5 → 2
  assert.equal(core.promedio(0, 0), 0);
});
test('tiempo: HH:MM ⇄ minutos y rechazo de horas inválidas', () => {
  assert.equal(core.hm('10:30'), 630); assert.equal(core.hm('9:05'), 545); assert.equal(core.hm('00:00'), 0);
  assert.equal(core.fmtHM(630), '10:30'); assert.equal(core.fmtHM(545), '09:05');
  for (const mal of ['24:00', '10:60', '1030', 'abc', '', '10:5']) assert.throws(() => core.hm(mal), RangeError, mal);
  assert.throws(() => core.fmtHM(-1), RangeError); assert.throws(() => core.fmtHM(1.5), RangeError);
  assert.equal(core.aMinutos('11:00'), 660); assert.equal(core.aMinutos(660), 660);
});
test('limpiar: sin caracteres de control ni invisibles, espacios colapsados, largo acotado', () => {
  assert.equal(core.limpiar('  Ana\u0000​   Pérez\n'), 'Ana Pérez');
  assert.equal(core.limpiar(null), '');
  assert.equal(core.limpiar('x'.repeat(200), 60).length, 60);
});

// ── store ──
function spec() {
  return {
    init: () => ({ n: 0, log: [] }),
    acciones: {
      sumar: (s, a) => ({ estado: { n: s.n + a.x, log: [...s.log, a.x] }, resultado: { nuevo: s.n + a.x } }),
      falla: () => ({ error: { code: 'no', mensaje: 'No.' } }),
      explota: () => { throw new Error('boom'); },
      rompeInvariante: (s) => ({ estado: { n: -1, log: s.log } }),
      sinEstado: () => ({}),
    },
    invariantes: (s) => (s.n < 0 ? ['n negativo'] : []),
  };
}
test('store: acción válida cambia el estado, avisa y devuelve resultado', () => {
  const st = core.createStore(spec()); const visto = [];
  st.subscribe((s) => visto.push(s.n));
  const r = st.dispatch('sumar', { x: 2 });
  assert.equal(r.ok, true); assert.deepEqual(r.resultado, { nuevo: 2 }); assert.equal(st.getState().n, 2); assert.deepEqual(visto, [2]);
});
test('store: acción rechazada, que explota, que viola invariantes o inexistente NO deja estado parcial', () => {
  const st = core.createStore(spec()); st.dispatch('sumar', { x: 5 });
  const antes = st.getState(), avisos = []; st.subscribe(() => avisos.push(1));
  const casos = [['falla', {}, 'no'], ['explota', {}, 'error-interno'], ['rompeInvariante', {}, 'invariante-violado'], ['noExiste', {}, 'accion-desconocida'], ['sinEstado', {}, 'error-interno']];
  for (const [n, p, code] of casos) {
    const r = st.dispatch(n, p);
    assert.equal(r.ok, false, n); assert.equal(r.error.code, code, n);
    assert.equal(st.getState(), antes, n + ': el estado debe ser el mismo objeto');
  }
  assert.deepEqual(avisos, []);                                  // y nadie fue notificado
  assert.equal(st.historial().length, 1);                        // solo quedó la acción aceptada
});
test('store: el estado es inmutable (congelado a fondo)', () => {
  const st = core.createStore(spec()); st.dispatch('sumar', { x: 1 });
  assert.throws(() => { st.getState().n = 99; }, TypeError);
  assert.throws(() => { st.getState().log.push(7); }, TypeError);
  assert.equal(st.getState().n, 1);
});
test('store: el payload se copia, mutarlo después no afecta al estado ni al historial', () => {
  const st = core.createStore(spec()); const p = { x: 3 };
  st.dispatch('sumar', p); p.x = 1000;
  assert.equal(st.getState().n, 3); assert.deepEqual(st.historial(), [{ accion: 'sumar', payload: { x: 3 } }]);
});
test('store: reiniciar vuelve al estado inicial exacto; un oyente roto no corrompe nada', () => {
  const st = core.createStore(spec()); const ini = core.clone(st.getState());
  st.subscribe(() => { throw new Error('oyente roto'); });
  assert.equal(st.dispatch('sumar', { x: 4 }).ok, true); assert.equal(st.getState().n, 4);
  st.reset(); assert.deepEqual(st.getState(), ini); assert.deepEqual(st.historial(), []);
});
test('store: reproducir el historial reconstruye el mismo estado', () => {
  const a = core.createStore(spec()); a.dispatch('sumar', { x: 1 }); a.dispatch('falla'); a.dispatch('sumar', { x: 2 });
  const b = core.createStore(spec()); core.replay(b, a.historial());
  assert.deepEqual(b.getState(), a.getState());
});
test('store: un estado inicial inconsistente falla de inmediato', () => {
  assert.throws(() => core.createStore({ init: () => ({ n: -5, log: [] }), acciones: {}, invariantes: (s) => (s.n < 0 ? ['n negativo'] : []) }), /inconsistente/);
});
