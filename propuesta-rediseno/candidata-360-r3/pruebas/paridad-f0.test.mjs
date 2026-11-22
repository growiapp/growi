// Paridad con la referencia ejecutable de F0: recorridos aleatorios (semilla fija) aplicados a la implementación NUEVA y a la referencia;
// después de cada paso se comparan errores, estado derivado e indicadores. Se omite si la referencia no está disponible.
//   F0_REF_DIR=<carpeta con core-ref.mjs> node --test pruebas/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import core from '../assets/sandbox/core.js';
import cafe from '../assets/sandbox/cafeteria.js';
import pelu from '../assets/sandbox/peluqueria.js';
import DC from '../assets/sandbox/cafeteria.data.js';
import DP from '../assets/sandbox/peluqueria.data.js';

const REF_DIR = process.env.F0_REF_DIR || 'D:/Documentos/respaldos-growi/f0-especificaciones';
let ref = null;
try { ref = await import(pathToFileURL(path.join(REF_DIR, 'core-ref.mjs')).href); } catch (_) { /* sin referencia */ }
const skip = ref ? false : 'referencia de F0 no disponible (definí F0_REF_DIR)';
const sinNotas = (o) => Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith('_')));

function rng(seed) {                         // mulberry32: determinista
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

test('paridad · los módulos de datos son exactamente los fixtures de F0', { skip }, () => {
  const lee = (f) => JSON.parse(fs.readFileSync(path.join(REF_DIR, f), 'utf8'));
  assert.deepEqual(JSON.parse(JSON.stringify(DC)), sinNotas(lee('cafeteria.fixture.json')));
  assert.deepEqual(JSON.parse(JSON.stringify(DP)), sinNotas(lee('peluqueria.fixture.json')));
});

test('paridad · Cafetería: 4 semillas × 250 ventas aleatorias (incluye sin stock y efectivo insuficiente)', { skip }, (t) => {
  const FC = ref.cargar('cafeteria.fixture.json'), ids = FC.productos.map((p) => p.id);
  let exitos = 0, sinStock = 0, insuf = 0;
  for (const seed of [1, 2, 3, 4]) {
    const r = rng(seed), pick = (a) => a[Math.floor(r() * a.length)];
    const st = cafe.crear(); let e = ref.cafe.estadoInicial(FC);
    for (let i = 0; i < 250; i++) {
      const n = 1 + Math.floor(r() * 3), prods = [...ids].sort(() => r() - 0.5).slice(0, n);
      const lineas = prods.map((p) => [p, p === 'ML' && r() < 0.15 ? 8 + Math.floor(r() * 10) : 1 + Math.floor(r() * 4)]);
      const medio = pick(FC.medios), idAbierto = st.getState().abierto.id;
      const total = lineas.reduce((a, [p, q]) => a + FC.productos.find((x) => x.id === p).precio * q, 0);
      const recibido = medio === 'efectivo' && r() < 0.5 ? Math.max(0, total + (Math.floor(r() * 3) - (r() < 0.3 ? 6 : 0)) * 500) : undefined;
      let nuevoErr = null;
      for (const [p, q] of lineas) { const a = st.dispatch('agregarProducto', { producto: p, cantidad: q }); if (!a.ok) { nuevoErr = a.error.code; break; } }
      if (!nuevoErr) { const c = st.dispatch('cobrar', { ticketId: idAbierto, medio, recibido }); if (!c.ok) nuevoErr = c.error.code; }
      const rr = ref.cafe.cobrar(FC, e, { id: idAbierto, medio, lineas, recibido });
      const refErr = rr.error ? rr.error.split(':')[0] : null;
      assert.equal(nuevoErr, refErr, `seed ${seed} paso ${i}`);
      e = rr.e;                                                      // la referencia devuelve el mismo estado si rechaza
      if (nuevoErr && st.getState().abierto.lineas.length) st.dispatch('vaciarTicket');   // la interfaz descartaría el ticket a medio armar
      if (refErr === 'sin-stock') sinStock++; else if (refErr === 'efectivo-insuficiente') insuf++; else exitos++;
      const s = st.getState(), S = cafe.sel;
      assert.equal(S.ventas(s), ref.cafe.ventas(FC, e)); assert.equal(S.nTickets(s), ref.cafe.nTickets(e)); assert.equal(S.ticketPromedio(s), ref.cafe.promedio(FC, e));
      assert.deepEqual(S.porMedio(s), ref.cafe.porMedio(FC, e)); assert.deepEqual(S.unidades(s), ref.cafe.unidades(e));
      assert.deepEqual(S.stock(s), ref.cafe.stock(FC, e)); assert.deepEqual(S.alertas(s).map((a) => a.producto), ref.cafe.alertas(FC, e));
      assert.equal(S.masVendido(s).producto, ref.cafe.masVendido(FC, e)); assert.equal(S.efectivoEsperado(s), ref.cafe.efectivoEsperado(FC, e));
      assert.deepEqual(cafe.invariantes(s), []);
    }
  }
  t.diagnostic(`ventas aleatorias: ${exitos} cobradas, ${sinStock} rechazadas por stock, ${insuf} por efectivo insuficiente`);
  assert.ok(exitos > 100 && sinStock > 5 && insuf > 5, `la caminata debe ejercitar todos los caminos (éxitos ${exitos}, sin stock ${sinStock}, insuficiente ${insuf})`);
});

test('paridad · Peluquería: 4 semillas × 5 jornadas × 90 acciones aleatorias', { skip }, (t) => {
  const FP = ref.cargar('peluqueria.fixture.json'), P = ref.pelu(FP);
  const servicios = FP.servicios.map((s) => s.id), pros = FP.profesionales.map((p) => p.id), clientes = ['Julia P.', 'Ana C.', 'Lu V.', 'Marta Q.'];
  const J = { a: ref.hm(FP.jornada.apertura), c: ref.hm(FP.jornada.cierre) };
  const cuenta = {};
  const normRef = (e) => e.turnos.map((t) => ({ id: t.id, profesional: t.profesional, inicio: t.inicio, servicios: t.servicios, reserva: t.reserva, atencion: t.atencion, cobro: t.cobro ? { medio: t.cobro.medio } : null }));
  const normNuevo = (s) => s.turnos.map((t) => ({ id: t.id, profesional: t.profesional, inicio: t.inicio, servicios: t.servicios, reserva: t.reserva, atencion: t.atencion, cobro: t.cobro ? { medio: t.cobro.medio } : null }));

  for (const seed of [11, 12, 13, 14]) {
    const r = rng(seed), pick = (a) => a[Math.floor(r() * a.length)], rint = (n) => Math.floor(r() * n);
    const st = pelu.crear(); let e = P.estadoInicial();
    for (let dia = 0; dia < 5; dia++) {
      if (dia > 0) { st.reset(); e = P.estadoInicial(); }
      for (let i = 0; i < 90; i++) {
        const elegible = {
          iniciar: (t) => t.reserva === 'confirmado' && !t.atencion, finalizar: (t) => t.atencion && t.atencion.finReal === null,
          cobrar: (t) => t.atencion && t.atencion.finReal !== null && !t.cobro, mover: (t) => t.reserva === 'confirmado' && !t.atencion,
          cancelar: (t) => t.reserva === 'confirmado' && !t.atencion, marcarAusente: (t) => t.reserva === 'confirmado' && !t.atencion,
          agregarServicio: (t) => t.atencion && t.atencion.finReal === null && !t.cobro,
        };
        const idDe = (k) => { const c = e.turnos.filter(elegible[k]); return c.length && r() < 0.75 ? pick(c).id : pick(e.turnos.map((t) => t.id).concat(['t99'])); };
        const tipo = pick(['agendar', 'agendar', 'agendar', 'mover', 'cancelar', 'marcarAusente', 'iniciar', 'iniciar', 'finalizar', 'cobrar', 'cobrar', 'agregarServicio', 'avanzar', 'avanzar']);
        let a, nuevo, viejo, a_id = null;
        if (tipo === 'agendar') {
          const ss = [...servicios].sort(() => r() - 0.5).slice(0, 1 + rint(2)), inicio = J.a - 30 + 15 * rint(44);
          a = { profesional: pick(pros), servicios: ss, inicio, cliente: pick(clientes) };
          nuevo = st.dispatch('agendar', { ...a, inicio }); viejo = P.acc.agendar(e, a);
        } else if (tipo === 'mover') {
          const id = idDe('mover'), inicio = J.a + 15 * rint(40), prof = r() < 0.3 ? pick(pros) : undefined;
          nuevo = st.dispatch('mover', { turno: id, inicio, profesional: prof }); viejo = P.acc.mover(e, id, inicio, prof);
        } else if (tipo === 'agregarServicio') {
          const id = idDe('agregarServicio'), t = e.turnos.find((x) => x.id === id), cand = servicios.filter((x) => !t || !t.servicios.includes(x)), sid = pick(cand); a_id = id;
          nuevo = st.dispatch('agregarServicio', { turno: id, servicio: sid }); viejo = P.acc.agregarServicio(e, id, sid);
        } else if (tipo === 'cobrar') {
          const id = idDe('cobrar'), medio = r() < 0.1 ? 'cheque' : pick(FP.medios);
          nuevo = st.dispatch('cobrar', { turno: id, medio }); viejo = P.acc.cobrar(e, id, medio);
        } else if (tipo === 'avanzar') {
          const hasta = e.reloj + 15 * (r() < 0.1 ? -1 : 1 + rint(8));
          nuevo = st.dispatch('avanzarReloj', { hasta }); viejo = P.acc.avanzarReloj(e, hasta);
        } else {
          const id = idDe(tipo);
          nuevo = st.dispatch(tipo, { turno: id }); viejo = P.acc[tipo](e, id);
        }
        // Desviación documentada respecto de F0: un turno inexistente es siempre 'turno-inexistente' (F0 lo llamaba 'no-aplicable' solo en agregarServicio).
        const existe = (id) => e.turnos.some((t) => t.id === id);
        const codNuevo = nuevo.ok ? undefined : nuevo.error.code;
        const codViejo = tipo === 'agregarServicio' && viejo.error === 'no-aplicable' && !existe(a_id) ? 'turno-inexistente' : viejo.error;
        assert.equal(codNuevo, codViejo, `seed ${seed} día ${dia} paso ${i} ${tipo}`);
        const clave = tipo + (codViejo ? ':' + codViejo : ':ok'); cuenta[clave] = (cuenta[clave] || 0) + 1;
        e = viejo.e;                                                  // en error la referencia devuelve el mismo estado
        const s = st.getState(), S = pelu.sel;
        assert.equal(s.reloj, e.reloj); assert.deepEqual(normNuevo(s), normRef(e));
        assert.deepEqual(S.caja(s), P.caja(e)); assert.deepEqual(S.ingresosPorProfesional(s), P.ingresosPorProfesional(e));
        for (const p of pros) assert.deepEqual(S.ocupacion(s, p), P.ocupacion(e, p));
        assert.deepEqual(s.turnos.map((t) => S.estadoVisible(s, t)), e.turnos.map((t) => { const v = P.estadoVisible(e, t); return v === 'En atención' ? 'En curso' : v; }));
        const desde = J.a + 15 * rint(40);
        for (const combo of [['corte'], ['corte', 'brushing'], ['balayage'], ['barba', 'corte']]) {
          const n = S.disponibilidad(s, combo, desde), v = P.disponibilidad(e, combo, desde);
          assert.deepEqual(n.map((x) => x.inicios), v.map((x) => x.inicios), `${combo} desde ${desde}`);
        }
        assert.deepEqual(pelu.invariantes(s), []); assert.deepEqual(P.invariantes(e), []);
      }
    }
  }
  t.diagnostic('acciones: ' + JSON.stringify(Object.fromEntries(Object.entries(cuenta).sort())));
  const ok = (k) => cuenta[k] || 0;
  for (const k of ['agendar:ok', 'iniciar:ok', 'finalizar:ok', 'cobrar:ok', 'mover:ok', 'cancelar:ok', 'avanzar:ok', 'agregarServicio:ok'])
    assert.ok(ok(k) >= 3, `la caminata debe ejercitar ${k} (hubo ${ok(k)}); resumen: ${JSON.stringify(cuenta)}`);
  for (const k of ['agendar:solapamiento', 'agendar:competencia', 'iniciar:todavia-no-es-la-hora', 'cobrar:no-finalizada', 'avanzar:reloj-no-retrocede'])
    assert.ok(ok(k) >= 1, `la caminata debe ejercitar el error ${k}; resumen: ${JSON.stringify(cuenta)}`);
});
