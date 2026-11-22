// Pruebas del modelo de vista de Peluquería: pasos del turno, «antes → ahora», previa de agenda y recorrido guiado salen del estado real de F1.
import test from 'node:test';
import assert from 'node:assert/strict';
import core from '../assets/sandbox/core.js';
import pelu from '../assets/sandbox/peluqueria.js';
import V from '../assets/sandbox/peluqueria-vista.js';

const nuevo = () => pelu.crear(), hm = core.hm;
const go = (st, a, p) => { const r = st.dispatch(a, p); assert.equal(r.ok, true, a + ' ' + JSON.stringify(r.error)); return r; };
const julia = { profesional: 'camila', servicios: ['corte', 'brushing'], inicio: '11:00', cliente: 'Julia Pereyra' };

test('paso del turno: cada estado ofrece lo que corresponde y nunca avanza solo', () => {
  const st = nuevo(); go(st, 'agendar', julia);
  let p = V.pasoTurno(st.getState(), 't7');
  assert.equal(p.estado, 'Programado'); assert.equal(p.avanzarA, hm('11:00')); assert.match(p.texto, /Empieza a las 11:00\. Faltan 30 min/);
  go(st, 'avanzarReloj', { hasta: '11:00' });                                       // el reloj llegó: sigue sin iniciarse
  p = V.pasoTurno(st.getState(), 't7'); assert.equal(p.estado, 'Esperando inicio'); assert.equal(p.acciones.iniciar, null);
  go(st, 'iniciar', { turno: 't7' });
  p = V.pasoTurno(st.getState(), 't7'); assert.equal(p.estado, 'En curso'); assert.equal(p.avanzarA, hm('12:15')); assert.equal(p.progreso.pct, 0);
  go(st, 'avanzarReloj', { hasta: '11:45' }); p = V.pasoTurno(st.getState(), 't7'); assert.equal(p.estado, 'En curso'); assert.equal(p.progreso.pct, 60);
  go(st, 'avanzarReloj', { hasta: '12:15' }); p = V.pasoTurno(st.getState(), 't7'); assert.equal(p.estado, 'En curso');   // pasar el tiempo no finaliza
  go(st, 'finalizar', { turno: 't7' });
  p = V.pasoTurno(st.getState(), 't7'); assert.equal(p.estado, 'Por cobrar'); assert.equal(p.acciones.cobrar, null);
  go(st, 'cobrar', { turno: 't7', medio: 'efectivo' });
  p = V.pasoTurno(st.getState(), 't7'); assert.equal(p.estado, 'Cobrado'); assert.match(p.texto, /Efectivo/);
  assert.equal(V.pasoTurno(st.getState(), 'zz'), null);
});
test('una profesional ocupada no puede iniciar otro turno: el motivo llega al panel', () => {
  const st = nuevo(); go(st, 'agendar', julia); go(st, 'agendar', { profesional: 'camila', servicios: ['corte'], inicio: '12:15', cliente: 'Lucía' });
  go(st, 'avanzarReloj', { hasta: '12:15' }); go(st, 'iniciar', { turno: 't8' });             // t8 en curso desde 12:15 (t7 de 11:00 sigue sin iniciar)
  const p = V.pasoTurno(st.getState(), 't7'); assert.equal(p.acciones.iniciar, 'profesional-en-atencion'); assert.match(p.texto, /todavía atiende/);
});
test('previa: valida con F1 sin agendar y propone horario ante un solapamiento', () => {
  const st = nuevo(), s = st.getState();
  const ok = V.previa(s, { profesional: 'camila', servicios: ['corte', 'brushing'], inicio: hm('11:00') });
  assert.deepEqual(ok, { ok: true, duracion: 75, fin: hm('12:15'), precio: 20500 });
  const mal = V.previa(s, { profesional: 'camila', servicios: ['corte', 'brushing'], inicio: hm('12:00') });
  assert.equal(mal.ok, false); assert.equal(mal.motivo, 'solapamiento'); assert.equal(mal.sugerencia, '11:45'); assert.match(mal.mensaje, /Camila tiene Balayage a las 13:00/);
  assert.equal(V.previa(s, { profesional: 'nico', servicios: ['brushing'], inicio: hm('11:00') }).motivo, 'competencia');
  assert.equal(V.previa(s, { profesional: 'camila', servicios: [], inicio: hm('11:00') }).motivo, 'servicios');
  assert.equal(V.previa(s, { profesional: 'camila', servicios: ['corte'], inicio: hm('10:00') }).motivo, 'en-el-pasado');
  assert.equal(s.turnos.length, 6);                                                              // no agendó nada
});
test('«antes → ahora» del cobro guía: sale del estado real (caja 46.500 → 67.000)', () => {
  const st = nuevo(); go(st, 'agendar', julia); go(st, 'avanzarReloj', { hasta: '11:00' }); go(st, 'iniciar', { turno: 't7' }); go(st, 'avanzarReloj', { hasta: '12:15' }); go(st, 'finalizar', { turno: 't7' });
  const antes = st.getState(); assert.equal(V.cambio(nuevo().getState(), antes).hayCambio, false);
  go(st, 'cobrar', { turno: 't7', medio: 'efectivo' });
  const c = V.cambio(antes, st.getState());
  assert.deepEqual(c.caja, { antes: 46500, ahora: 67000, delta: 20500 });
  assert.deepEqual(c.atenciones, { antes: 3, ahora: 4, delta: 1 });
  assert.deepEqual(c.profesionales, [{ id: 'camila', nombre: 'Camila', antes: 26000, ahora: 46500, delta: 20500 }]);
  assert.deepEqual(c.medios, [{ medio: 'efectivo', antes: 20500, ahora: 41000, delta: 20500 }]);
  assert.deepEqual(c.porCobrar.antes, { n: 1, monto: 20500 }); assert.deepEqual(c.porCobrar.ahora, { n: 0, monto: 0 });
  assert.deepEqual(c.estados, [{ id: 't7', antes: 'Por cobrar', ahora: 'Cobrado' }]);
});
test('recorrido guiado: progreso derivado, no bloquea (se puede agendar otra cosa)', () => {
  const st = nuevo(), inicio = st.getState(), g = (v) => V.progresoGuia({ inicio, actual: st.getState(), vistoImpacto: v });
  assert.deepEqual([g().actual, g().pasos.length], [0, 5]);
  go(st, 'agendar', julia); assert.equal(g().actual, 1);
  go(st, 'avanzarReloj', { hasta: '11:00' }); go(st, 'iniciar', { turno: 't7' }); assert.equal(g().actual, 2);
  go(st, 'avanzarReloj', { hasta: '12:15' }); go(st, 'finalizar', { turno: 't7' }); assert.equal(g().actual, 3);
  go(st, 'cobrar', { turno: 't7', medio: 'efectivo' }); assert.deepEqual([g(false).actual, g(false).completa], [4, false]); assert.deepEqual([g(true).actual, g(true).completa], [-1, true]);
  const st2 = nuevo(), i2 = st2.getState(); go(st2, 'agendar', { profesional: 'nico', servicios: ['barba'], inicio: '11:00', cliente: 'Otro' });
  assert.equal(V.progresoGuia({ inicio: i2, actual: st2.getState(), vistoImpacto: false }).actual, 1);   // un turno distinto también cuenta como agendado
});
test('utilidades: horas de la grilla, tandas y duraciones', () => {
  const s = nuevo().getState(), h = V.horas(s);
  assert.deepEqual([h[0].etiqueta, h.at(-1).etiqueta, h.length], ['09:00', '19:00', 11]);
  assert.deepEqual(V.tandas([hm('11:00'), hm('16:00')]).map((x) => [x.nombre, x.inicios.length]), [['Mañana', 1], ['Tarde', 1]]);
  assert.equal(V.minutos(75), '1 h 15 min'); assert.equal(V.minutos(45), '45 min'); assert.equal(V.minutos(180), '3 h');
  assert.equal(V.mensajeError({ code: 'x', mensaje: 'Texto' }), 'Texto'); assert.match(V.mensajeError({ code: 'x' }), /Probá de nuevo/); assert.equal(V.mensajeError(null), '');
});
