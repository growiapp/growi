// Pruebas de la lógica de Peluquería (implementación nueva). Los valores esperados son el contrato validado en F0.
import test from 'node:test';
import assert from 'node:assert/strict';
import core from '../assets/sandbox/core.js';
import pelu from '../assets/sandbox/peluqueria.js';

const S = pelu.sel, hm = core.hm, fmt = core.fmtHM;
const nuevo = () => pelu.crear();
const ok = (st, accion, payload) => {
  const r = st.dispatch(accion, payload);
  assert.equal(r.ok, true, accion + ' ' + JSON.stringify(payload) + ' → ' + JSON.stringify(r.error));
  assert.deepEqual(pelu.invariantes(st.getState()), []);
  return r;
};
const mal = (st, accion, payload, code) => {
  const antes = st.getState(), r = st.dispatch(accion, payload);
  assert.equal(r.ok, false, accion + ' debía fallar'); assert.equal(r.error.code, code, accion + ' ' + JSON.stringify(payload));
  assert.equal(st.getState(), antes, accion + ': el estado no debe cambiar');
  return r.error;
};
const vista = (st, id) => S.turno(st.getState(), id);
const julia = { profesional: 'camila', servicios: ['corte', 'brushing'], inicio: '11:00', cliente: 'Julia Pereyra' };

test('semilla: invariantes, reloj, caja, ingresos, ocupación y estados derivados', () => {
  const s = nuevo().getState();
  assert.deepEqual(pelu.invariantes(s), []);
  assert.equal(s.reloj, hm('10:30'));
  assert.deepEqual(S.caja(s), { porMedio: { efectivo: 20500, transferencia: 26000, mercadopago: 0 }, total: 46500, atenciones: 3 });
  assert.deepEqual(S.ingresosPorProfesional(s), { camila: 26000, nico: 12000, vero: 8500 });
  assert.deepEqual(S.ocupacion(s, 'camila'), { reservados: 270, disponibles: 600, pct: 45 });
  assert.equal(S.ocupacion(s, 'vero').disponibles, 540);
  assert.equal(s.clientas.length, 6);
  assert.deepEqual(Object.fromEntries(s.turnos.map((t) => [t.id, S.estadoVisible(s, t)])), { t1: 'Cobrado', t2: 'Cobrado', t3: 'Cobrado', t4: 'Programado', t5: 'Programado', t6: 'Programado' });
  assert.equal(S.resumen(s).porCobrar.n, 0);
});
test('consultas: agenda, profesionales, servicios y duración', () => {
  const s = nuevo().getState();
  assert.deepEqual(S.profesionales(s).map((p) => p.id), ['camila', 'nico', 'vero']);
  assert.deepEqual(S.servicios(s).map((x) => [x.id, x.min, x.precio]), [['corte', 45, 12000], ['brushing', 30, 8500], ['colorRaiz', 90, 26000], ['barba', 30, 6000], ['balayage', 180, 52000]]);
  assert.equal(S.duracion(s, ['corte', 'brushing']), 75); assert.equal(S.precio(s, ['corte', 'brushing']), 20500);
  assert.deepEqual(S.compatibles(s, ['corte', 'brushing']), ['camila', 'vero']);          // Nico no hace brushing
  assert.deepEqual(S.compatibles(s, ['barba']), ['nico']);
  const ag = S.agenda(s); assert.deepEqual(ag.map((c) => c.turnos.map((t) => t.id)), [['t1', 't4'], ['t2', 't5'], ['t3', 't6']]);
  assert.deepEqual(ag[2].bloqueos.map((b) => [fmt(b.inicio), fmt(b.fin)]), [['13:30', '14:30']]);
});
test('disponibilidad real según duración: Corte + Brushing (75 min) desde 11:00', () => {
  const d = Object.fromEntries(S.disponibilidad(nuevo().getState(), ['corte', 'brushing'], '11:00').map((x) => [x.profesional, x]));
  assert.equal(d.nico.compatible, false); assert.equal(d.nico.motivo, 'competencia'); assert.deepEqual(d.nico.inicios, []);
  assert.deepEqual(d.camila.inicios.slice(0, 5).map(fmt), ['11:00', '11:15', '11:30', '11:45', '16:00']);   // 12:00 pisaría el Balayage de las 13:00
  assert.equal(fmt(d.vero.inicios[0]), '14:30');
  assert.equal(d.vero.inicios.some((m) => m >= hm('11:00') && m < hm('14:30')), false);
  assert.equal(fmt(d.camila.inicios.at(-1)), '17:45');                                                        // 17:45 + 75 = 19:00, justo al cierre
  // la duración manda: solo Corte (45) entra antes en la agenda de Camila
  const c1 = S.disponibilidad(nuevo().getState(), ['corte'], '11:00').find((x) => x.profesional === 'camila');
  assert.equal(c1.inicios.includes(hm('12:15')), true); assert.equal(c1.inicios.includes(hm('12:30')), false);
  assert.equal(S.disponibilidad(nuevo().getState(), [], '11:00').every((x) => x.motivo === 'servicios-invalidos'), true);
});
test('agendar: validaciones (competencia, bloqueo, jornada, pasado, paso, servicios, cliente, hora)', () => {
  const st = nuevo();
  assert.match(mal(st, 'agendar', { ...julia, profesional: 'nico' }, 'competencia').mensaje, /Nico no hace Brushing/);
  mal(st, 'agendar', { profesional: 'vero', servicios: ['corte'], inicio: '13:45', cliente: 'X' }, 'solapamiento');      // bloqueo 13:30-14:30
  mal(st, 'agendar', { profesional: 'vero', servicios: ['corte'], inicio: '13:15', cliente: 'X' }, 'solapamiento');
  mal(st, 'agendar', { ...julia, inicio: '18:00' }, 'fuera-de-jornada');
  mal(st, 'agendar', { ...julia, inicio: '08:45' }, 'fuera-de-jornada');
  mal(st, 'agendar', { ...julia, inicio: '10:15' }, 'en-el-pasado');
  mal(st, 'agendar', { ...julia, inicio: '11:10' }, 'fuera-de-paso');
  mal(st, 'agendar', { ...julia, inicio: 'mañana' }, 'hora-invalida');
  mal(st, 'agendar', { ...julia, servicios: [] }, 'sin-servicios');
  mal(st, 'agendar', { ...julia, servicios: ['corte', 'corte'] }, 'servicio-repetido');
  mal(st, 'agendar', { ...julia, servicios: ['pedicura'] }, 'servicio-inexistente');
  mal(st, 'agendar', { ...julia, profesional: 'zoe' }, 'profesional-inexistente');
  mal(st, 'agendar', { ...julia, cliente: '  \u0000 ' }, 'falta-cliente');
});
test('solapamiento: mensaje, sugerencia verificada y turnos pegados permitidos', () => {
  const st = nuevo();
  const e = mal(st, 'agendar', { ...julia, inicio: '12:00' }, 'solapamiento');
  assert.equal(e.detalle, 'Camila tiene Balayage a las 13:00'); assert.equal(e.sugerencia, '11:45');
  assert.equal(e.mensaje, 'Camila tiene Balayage a las 13:00. Con Corte + Brushing (75 min) tenés que empezar a las 11:45 o antes.');
  ok(st, 'agendar', { ...julia, inicio: '11:45' });                                      // 11:45 + 75 = 13:00: termina justo cuando empieza el Balayage
  const e2 = mal(st, 'agendar', { profesional: 'camila', servicios: ['corte'], inicio: '12:30', cliente: 'Y' }, 'solapamiento');   // cae dentro de un turno ya existente
  assert.equal(e2.sugerencia, null); assert.match(e2.mensaje, /Elegí otro horario/);
});
test('advertencia (no bloqueo) si la misma persona ya tiene un turno que se superpone', () => {
  const st = nuevo(); ok(st, 'agendar', julia);
  const r = ok(st, 'agendar', { profesional: 'vero', servicios: ['brushing'], inicio: '11:15', cliente: 'Julia Pereyra' });
  assert.deepEqual(r.resultado.advertencias.map((a) => a.code), ['cliente-superpuesto']);
});

test('RECORRIDO GUÍA de punta a punta: una sola operación', () => {
  const st = nuevo();
  // 1-3. solicita corte + brushing → disponibilidad → se agenda con Camila
  const r = ok(st, 'agendar', julia); assert.equal(r.resultado.turno, 't7'); assert.deepEqual(r.resultado.advertencias, []);
  let t = vista(st, 't7');
  assert.equal(t.duracion, 75); assert.equal(t.precio, 20500); assert.equal(fmt(t.fin), '12:15'); assert.equal(t.estado, 'Programado');
  assert.equal(S.ocupacion(st.getState(), 'camila').pct, 58); assert.equal(st.getState().clientas.length, 7);
  assert.equal(S.caja(st.getState()).total, 46500);                                       // agendar no toca la caja
  // 4. el reloj avanza por acción explícita y NO inicia nada
  mal(st, 'iniciar', { turno: 't7' }, 'todavia-no-es-la-hora');
  assert.deepEqual(S.proximosHitos(st.getState()).slice(0, 2).map((h) => [fmt(h.t), h.tipo, h.turno]), [['11:00', 'inicio-turno', 't7'], ['12:00', 'inicio-turno', 't6']]);
  const turnosAntes = st.getState().turnos;
  ok(st, 'avanzarReloj', { hasta: '11:00' });
  assert.equal(st.getState().reloj, hm('11:00')); assert.deepEqual(st.getState().turnos, turnosAntes);   // ningún turno cambió
  assert.equal(vista(st, 't7').estado, 'Esperando inicio'); assert.equal(vista(st, 't7').atencion, null);
  // 5. se inicia (acción explícita): recién ahora «En curso»
  ok(st, 'iniciar', { turno: 't7' }); t = vista(st, 't7');
  assert.equal(t.estado, 'En curso'); assert.equal(t.atencion.inicioReal, hm('11:00')); assert.equal(t.atencion.finReal, null);
  assert.equal(S.resumen(st.getState()).enCurso, 1);
  mal(st, 'cobrar', { turno: 't7', medio: 'efectivo' }, 'no-finalizada');
  mal(st, 'mover', { turno: 't7', inicio: '11:15' }, 'no-movible'); mal(st, 'cancelar', { turno: 't7' }, 'no-cancelable');
  assert.deepEqual(S.proximosHitos(st.getState())[0], { t: hm('12:00'), tipo: 'inicio-turno', turno: 't6' });
  assert.equal(S.proximosHitos(st.getState()).find((h) => h.tipo === 'fin-previsto').t, hm('12:15'));
  // 6. pasan 75 minutos (acción explícita): el turno de Vero espera inicio, NO está en curso; el de Julia sigue en curso hasta finalizar
  ok(st, 'avanzarReloj', { hasta: '12:15' });
  assert.equal(vista(st, 't6').estado, 'Esperando inicio'); assert.equal(vista(st, 't6').atencion, null); assert.equal(vista(st, 't7').estado, 'En curso');
  // 7. se finaliza: «Por cobrar», la caja todavía no cambia
  ok(st, 'finalizar', { turno: 't7' });
  assert.equal(vista(st, 't7').estado, 'Por cobrar'); assert.equal(vista(st, 't7').atencion.finReal, hm('12:15'));
  assert.equal(S.caja(st.getState()).total, 46500); assert.deepEqual(S.resumen(st.getState()).porCobrar, { n: 1, monto: 20500 });
  // 8. se cobra: se actualizan caja, ingresos, actividad e indicadores
  const c = ok(st, 'cobrar', { turno: 't7', medio: 'efectivo' }); assert.deepEqual(c.resultado, { turno: 't7', monto: 20500, medio: 'efectivo' });
  const s = st.getState();
  assert.equal(vista(st, 't7').estado, 'Cobrado');
  assert.deepEqual(S.caja(s), { porMedio: { efectivo: 41000, transferencia: 26000, mercadopago: 0 }, total: 67000, atenciones: 4 });
  assert.deepEqual(S.ingresosPorProfesional(s), { camila: 46500, nico: 12000, vero: 8500 });
  const r2 = S.resumen(s); assert.equal(r2.porCobrar.n, 0); assert.equal(r2.enCurso, 0); assert.equal(r2.clientas, 7); assert.equal(r2.esperandoInicio, 1);
  assert.deepEqual(S.actividad(s).slice(0, 5).map((a) => [a.tipo, a.turno, fmt(a.t)]), [['cobro', 't7', '12:15'], ['fin', 't7', '12:15'], ['inicio', 't7', '11:00'], ['agendado', 't7', '10:30'], ['cobro', 't3', '10:30']]);
  assert.equal(S.actividad(s)[0].monto, 20500);
  // cobro único
  mal(st, 'cobrar', { turno: 't7', medio: 'efectivo' }, 'ya-cobrado');
  // una operación cerrada no se modifica retroactivamente
  mal(st, 'finalizar', { turno: 't7' }, 'ya-finalizada'); mal(st, 'iniciar', { turno: 't7' }, 'ya-iniciada');
  mal(st, 'mover', { turno: 't7', inicio: '14:30' }, 'no-movible'); mal(st, 'cancelar', { turno: 't7' }, 'no-cancelable');
  mal(st, 'agregarServicio', { turno: 't7', servicio: 'barba' }, 'no-aplicable'); mal(st, 'marcarAusente', { turno: 't7' }, 'no-aplicable');
});

test('el reloj solo avanza y no toca ningún turno', () => {
  const st = nuevo(), turnos0 = st.getState().turnos;
  mal(st, 'avanzarReloj', { hasta: '10:30' }, 'reloj-no-retrocede'); mal(st, 'avanzarReloj', { hasta: '09:15' }, 'reloj-no-retrocede');
  mal(st, 'avanzarReloj', { hasta: '19:15' }, 'fuera-de-jornada'); mal(st, 'avanzarReloj', { hasta: '10:50' }, 'fuera-de-paso');
  mal(st, 'avanzarReloj', { hasta: 'pronto' }, 'hora-invalida');
  for (const h of ['10:45', '12:30', '13:15', '19:00']) { ok(st, 'avanzarReloj', { hasta: h }); assert.deepEqual(st.getState().turnos, turnos0); }
  const s = st.getState();
  assert.deepEqual([S.estadoVisible(s, s.turnos[3]), S.estadoVisible(s, s.turnos[4]), S.estadoVisible(s, s.turnos[5])], ['Esperando inicio', 'Esperando inicio', 'Esperando inicio']);
  assert.equal(S.resumen(s).enCurso, 0); assert.equal(S.caja(s).total, 46500);
});
test('transiciones inválidas: iniciar, finalizar, cobrar', () => {
  const st = nuevo(); ok(st, 'avanzarReloj', { hasta: '12:00' });
  mal(st, 'finalizar', { turno: 't6' }, 'no-iniciada'); mal(st, 'cobrar', { turno: 't6', medio: 'efectivo' }, 'no-finalizada');
  mal(st, 'iniciar', { turno: 't4' }, 'todavia-no-es-la-hora');                         // Balayage 13:00, reloj 12:00
  mal(st, 'iniciar', { turno: 't1' }, 'ya-iniciada'); mal(st, 'iniciar', { turno: 't99' }, 'turno-inexistente');
  ok(st, 'iniciar', { turno: 't6' }); mal(st, 'iniciar', { turno: 't6' }, 'ya-iniciada');
  ok(st, 'avanzarReloj', { hasta: '12:30' }); ok(st, 'finalizar', { turno: 't6' }); mal(st, 'finalizar', { turno: 't6' }, 'ya-finalizada');
  mal(st, 'cobrar', { turno: 't6', medio: 'cheque' }, 'medio-invalido');
  ok(st, 'cobrar', { turno: 't6', medio: 'mercadopago' });
  assert.deepEqual(S.caja(st.getState()).porMedio, { efectivo: 20500, transferencia: 26000, mercadopago: 26000 });
});
test('un profesional no puede atender dos turnos a la vez', () => {
  const st = nuevo(); ok(st, 'agendar', { profesional: 'vero', servicios: ['brushing'], inicio: '11:00', cliente: 'Y' });
  ok(st, 'avanzarReloj', { hasta: '12:00' }); ok(st, 'iniciar', { turno: 't7' });
  mal(st, 'iniciar', { turno: 't6' }, 'profesional-en-atencion');
});
test('motivos: la interfaz sabe qué botones habilitar según el estado', () => {
  const st = nuevo();
  assert.deepEqual(S.motivos(st.getState(), 't4'), { mover: null, cancelar: null, marcarAusente: 'todavia-no-es-la-hora', iniciar: 'todavia-no-es-la-hora', finalizar: 'no-iniciada', cobrar: 'no-finalizada', agregarServicio: 'no-aplicable' });
  assert.equal(S.motivos(st.getState(), 't1').cobrar, 'ya-cobrado'); assert.equal(S.motivos(st.getState(), 'zz'), null);
  ok(st, 'avanzarReloj', { hasta: '12:00' }); assert.equal(S.motivos(st.getState(), 't6').iniciar, null);
  ok(st, 'iniciar', { turno: 't6' }); assert.deepEqual([S.motivos(st.getState(), 't6').finalizar, S.motivos(st.getState(), 't6').agregarServicio, S.motivos(st.getState(), 't6').mover], [null, null, 'no-movible']);
});
test('cancelar y mover liberan el hueco; ausente solo desde la hora', () => {
  const st = nuevo(); ok(st, 'agendar', { profesional: 'camila', servicios: ['corte'], inicio: '11:00', cliente: 'Z' });
  const inicios = () => S.disponibilidad(st.getState(), ['corte'], '11:00').find((x) => x.profesional === 'camila').inicios;
  assert.equal(inicios().includes(hm('11:00')), false);
  ok(st, 'mover', { turno: 't7', inicio: '12:00' }); assert.equal(inicios().includes(hm('11:00')), true); assert.equal(inicios().includes(hm('12:00')), false);
  mal(st, 'mover', { turno: 't7', inicio: '12:30' }, 'solapamiento');                    // 12:30-13:15 pisa el Balayage
  mal(st, 'mover', { turno: 't7', inicio: '12:00', profesional: 'nico' }, 'solapamiento');
  ok(st, 'cancelar', { turno: 't7' }); assert.equal(vista(st, 't7').estado, 'Cancelado'); assert.equal(inicios().includes(hm('12:00')), true);
  mal(st, 'iniciar', { turno: 't7' }, 'reserva-no-vigente'); mal(st, 'cancelar', { turno: 't7' }, 'no-cancelable');
  mal(st, 'marcarAusente', { turno: 't6' }, 'todavia-no-es-la-hora');
  ok(st, 'avanzarReloj', { hasta: '12:15' }); ok(st, 'marcarAusente', { turno: 't6' });
  assert.equal(vista(st, 't6').estado, 'No se presentó'); mal(st, 'iniciar', { turno: 't6' }, 'reserva-no-vigente');
  assert.deepEqual(S.actividad(st.getState()).filter((a) => a.tipo === 'cancelado' || a.tipo === 'ausente').map((a) => [a.tipo, a.turno]), [['ausente', 't6'], ['cancelado', 't7']]);
  assert.equal(S.caja(st.getState()).total, 46500);                                      // ni cancelar ni ausencia tocan la caja
});
test('agregar un servicio durante la atención respeta el turno siguiente y la competencia', () => {
  const st = nuevo(); ok(st, 'avanzarReloj', { hasta: '12:30' });
  ok(st, 'agendar', { profesional: 'nico', servicios: ['corte'], inicio: '13:00', cliente: 'W' });       // t7 13:00-13:45
  ok(st, 'iniciar', { turno: 't5' });                                                    // Barba 12:30-13:00
  mal(st, 'agregarServicio', { turno: 't5', servicio: 'corte' }, 'solapamiento');        // la llevaría a 13:15
  mal(st, 'agregarServicio', { turno: 't5', servicio: 'brushing' }, 'competencia');
  mal(st, 'agregarServicio', { turno: 't5', servicio: 'barba' }, 'servicio-repetido');
  mal(st, 'agregarServicio', { turno: 't5', servicio: 'pedicura' }, 'servicio-inexistente');
  // en cambio, un servicio que sí entra suma duración y precio
  const st2 = nuevo(); ok(st2, 'avanzarReloj', { hasta: '12:00' }); ok(st2, 'iniciar', { turno: 't6' });   // Vero, Color raíz 12:00-13:30, bloqueo desde 13:30
  mal(st2, 'agregarServicio', { turno: 't6', servicio: 'brushing' }, 'solapamiento');
  const st3 = nuevo(); ok(st3, 'agendar', { ...julia, inicio: '11:00' }); ok(st3, 'avanzarReloj', { hasta: '11:00' }); ok(st3, 'iniciar', { turno: 't7' });
  mal(st3, 'agregarServicio', { turno: 't7', servicio: 'colorRaiz' }, 'solapamiento');
});
test('reinicio: vuelve exactamente a la semilla y el historial reproduce la sesión', () => {
  const st = nuevo(), ini = JSON.parse(JSON.stringify(st.getState()));
  ok(st, 'agendar', julia); ok(st, 'avanzarReloj', { hasta: '11:00' }); ok(st, 'iniciar', { turno: 't7' }); ok(st, 'avanzarReloj', { hasta: '12:15' }); ok(st, 'finalizar', { turno: 't7' }); ok(st, 'cobrar', { turno: 't7', medio: 'efectivo' });
  const sesion = st.historial(), final = st.getState();
  assert.equal(sesion.length, 6);
  st.reset(); assert.deepEqual(st.getState(), ini); assert.deepEqual(pelu.init(), ini);
  const otro = nuevo(); core.replay(otro, sesion); assert.deepEqual(otro.getState(), final);
});
test('invariantes: un estado manipulado a mano es detectado', () => {
  const base = () => JSON.parse(JSON.stringify(nuevo().getState()));
  let s = base(); s.turnos[3].inicio = hm('10:00');            assert.ok(pelu.invariantes(s).some((m) => /solapamiento camila/.test(m)));   // pisa el Color raíz de las 09:00
  s = base(); s.turnos[3].servicios = ['barba'];               assert.ok(pelu.invariantes(s).some((m) => /competencia/.test(m)));
  s = base(); s.turnos[3].cobro = { medio: 'efectivo', en: 700 }; assert.ok(pelu.invariantes(s).some((m) => /cobro sin finalizar/.test(m)));
  s = base(); s.turnos[3].inicio = hm('15:00'); Object.assign(s.turnos[4], { profesional: 'camila', servicios: ['corte'], inicio: hm('15:30') }); assert.ok(pelu.invariantes(s).some((m) => /solapamiento camila/.test(m)));
  s = base(); s.turnos[5].atencion = { inicioReal: 720, finReal: null }; s.turnos.push({ ...s.turnos[5], id: 'tX', inicio: 840, atencion: { inicioReal: 840, finReal: null } });
  assert.ok(pelu.invariantes(s).some((m) => /dos atenciones abiertas/.test(m)));
});
