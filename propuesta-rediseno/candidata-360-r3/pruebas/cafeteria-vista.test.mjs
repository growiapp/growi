// Pruebas del modelo de vista de Cafetería. Confirman que «antes → ahora», guía y rankings se derivan del estado real de F1.
import test from 'node:test';
import assert from 'node:assert/strict';
import cafe from '../assets/sandbox/cafeteria.js';
import V from '../assets/sandbox/cafeteria-vista.js';

const nuevo = () => cafe.crear();
const add = (st, p, c) => st.dispatch('agregarProducto', { producto: p, cantidad: c });
const venta = (st, lineas, medio = 'efectivo', recibido) => { lineas.forEach(([p, c]) => add(st, p, c)); return st.dispatch('cobrar', { ticketId: st.getState().abierto.id, medio, recibido }); };

test('categorías: todo producto del catálogo pertenece a una categoría y la búsqueda ignora tildes y mayúsculas', () => {
  const s = nuevo().getState();
  const todos = V.productos(s, 'todo', '');
  assert.equal(todos.length, 6);
  for (const p of todos) assert.notEqual(V.categoriaDe(p.id), 'todo', p.id + ' sin categoría');
  assert.deepEqual(V.productos(s, 'cafe', '').map((p) => p.id), ['FW', 'CP', 'CF']);
  assert.deepEqual(V.productos(s, 'panaderia', '').map((p) => p.id), ['ML', 'TT']);
  assert.deepEqual(V.productos(s, 'salado', '').map((p) => p.id), ['TO']);
  assert.deepEqual(V.productos(s, 'todo', 'CAFÉ').map((p) => p.id), ['CF']);               // «Café» (tilde) también encuentra con «CAFÉ»
  assert.deepEqual(V.productos(s, 'todo', 'cafe').map((p) => p.id), ['CF']);
  assert.deepEqual(V.productos(s, 'todo', 'porcion').map((p) => p.id), ['TT']);            // «Porción de torta» sin tilde
  assert.deepEqual(V.productos(s, 'cafe', 'medialuna'), []);                                 // filtros combinados
  assert.deepEqual(V.productos(s, 'todo', 'zzz'), []);
});
test('importes rápidos: lo justo y billetes por encima, sin repetir y nunca por debajo del total', () => {
  assert.deepEqual(V.importesRapidos(9500), [9500, 10000, 20000]);
  assert.deepEqual(V.importesRapidos(10000), [10000, 20000]);
  assert.deepEqual(V.importesRapidos(3900), [3900, 4000, 5000]);
  assert.deepEqual(V.importesRapidos(23700), [23700, 24000, 25000]);
  for (const t of [1700, 4800, 9500, 12345, 99999]) assert.ok(V.importesRapidos(t).every((x) => x >= t), String(t));
});
test('estado de stock: ok, mínimo y agotado', () => {
  const st = nuevo();
  const e = () => Object.fromEntries(cafe.sel.catalogo(st.getState()).filter((p) => p.controlaStock).map((p) => [p.id, V.estadoStock(p)]));
  assert.deepEqual(e(), { ML: 'ok', TO: 'ok', TT: 'ok' });
  venta(st, [['ML', 1]], 'transferencia'); assert.equal(e().ML, 'minimo');
  venta(st, [['ML', 12]], 'transferencia'); assert.equal(e().ML, 'agotado');
});

test('«antes → ahora» de la venta guía: sale del estado real y coincide con el contrato de F0', () => {
  const st = nuevo(), antes = st.getState();
  assert.equal(V.cambio(antes, antes).hayVenta, false);
  assert.equal(venta(st, [['FW', 2], ['ML', 1]], 'efectivo', 10000).ok, true);
  const c = V.cambio(antes, st.getState());
  assert.equal(c.hayVenta, true);
  assert.deepEqual(c.tickets, [{ id: 'T21', medio: 'efectivo', total: 9500, recibido: 10000, lineas: [{ producto: 'FW', nombre: 'Flat white', cantidad: 2 }, { producto: 'ML', nombre: 'Medialuna', cantidad: 1 }] }]);
  assert.deepEqual(c.ventas, { antes: 142400, ahora: 151900, delta: 9500 });
  assert.deepEqual(c.nTickets, { antes: 20, ahora: 21, delta: 1 });
  assert.deepEqual(c.promedio, { antes: 7120, ahora: 7233, delta: 113 });
  assert.deepEqual(c.efectivoEsperado, { antes: 74700, ahora: 84200, delta: 9500 });
  assert.deepEqual(c.porMedio.efectivo, { antes: 61200, ahora: 70700, delta: 9500 }); assert.equal(c.porMedio.transferencia.delta, 0);
  assert.deepEqual(c.stock, [{ producto: 'ML', nombre: 'Medialuna', antes: 13, ahora: 12, delta: -1, minimo: 12, cruzoMinimo: true, agotado: false }]);
  assert.deepEqual(c.alertasNuevas.map((a) => a.producto), ['ML']);
  assert.deepEqual([c.masVendido.antes.unidades, c.masVendido.ahora.unidades], [18, 19]);
});
test('una venta distinta de la guía muestra SUS resultados, no los de la guía', () => {
  const st = nuevo(), antes = st.getState();
  venta(st, [['CP', 1], ['TT', 2]], 'mercadopago');                                 // 4.200 + 9.600 = 13.800
  const c = V.cambio(antes, st.getState());
  assert.equal(c.tickets[0].total, 13800); assert.equal(c.tickets[0].medio, 'mercadopago');
  assert.deepEqual(c.ventas, { antes: 142400, ahora: 156200, delta: 13800 });
  assert.equal(c.efectivoEsperado.delta, 0);                                           // no tocó el efectivo
  assert.deepEqual(c.porMedio.mercadopago, { antes: 32900, ahora: 46700, delta: 13800 });
  assert.deepEqual(c.stock.map((x) => [x.producto, x.antes, x.ahora, x.cruzoMinimo]), [['TT', 7, 5, false]]);
  assert.deepEqual(c.alertasNuevas, []);
});
test('cambio entre varias ventas acumula todas', () => {
  const st = nuevo(), antes = st.getState();
  venta(st, [['FW', 1]]); venta(st, [['ML', 2]], 'transferencia');
  const c = V.cambio(antes, st.getState());
  assert.equal(c.tickets.length, 2); assert.equal(c.ventas.delta, 3900 + 3400); assert.equal(c.nTickets.ahora, 22);
});

test('guía: el progreso se deriva del estado y no bloquea (venta libre)', () => {
  const st = nuevo(), inicio = st.getState();
  const g = (vistoImpacto) => V.progresoGuia({ inicio, actual: st.getState(), vistoImpacto });
  assert.deepEqual([g().actual, g().pasos.map((p) => p.hecho)], [0, [false, false, false, false]]);
  add(st, 'FW', 1); assert.equal(g().actual, 0);
  add(st, 'FW', 1); assert.deepEqual([g().actual, g().pasos[0].hecho], [1, true]);
  add(st, 'ML', 1); assert.equal(g().actual, 2);
  st.dispatch('cobrar', { medio: 'efectivo' });
  assert.deepEqual([g(false).actual, g(false).completa], [3, false]);
  assert.deepEqual([g(true).actual, g(true).completa], [-1, true]);
  assert.equal(g(true).pasos.every((p) => p.hecho), true);
});
test('guía: una venta distinta no marca los pasos de la guía, pero sí el cobro', () => {
  const st = nuevo(), inicio = st.getState(); venta(st, [['CP', 1]]);
  const g = V.progresoGuia({ inicio, actual: st.getState(), vistoImpacto: false });
  assert.deepEqual(g.pasos.map((p) => p.hecho), [false, false, true, false]); assert.equal(g.actual, 0);
});

test('ranking de productos: por unidades, con porcentaje relativo al más vendido', () => {
  const r = V.ranking(nuevo().getState(), 5);
  assert.deepEqual(r.map((x) => [x.id, x.unidades]), [['ML', 18], ['FW', 9], ['CF', 9], ['TT', 5], ['CP', 5]]);   // empates: gana el de mayor ingreso (FW 35.100 > CF 25.200; TT 24.000 > CP 21.000)
  assert.equal(r[0].pct, 100); assert.equal(r[1].pct, 50);
});
test('mensajes de error: voz Growi con qué pasó y qué hacer', () => {
  // efectivo: dice cuánto falta y qué hacer (el campo es opcional, se puede dejar vacío)
  assert.equal(V.mensajeError({ code: 'efectivo-insuficiente', total: 9500, recibido: 5000 }), 'Faltan $4.500 para cubrir el total. Ingresá al menos $9.500 o dejá el importe vacío.');
  // stock: si el ticket ya tiene todo lo que queda, no pide «bajar la cantidad» (el ticket está bien)
  assert.equal(V.mensajeError({ code: 'sin-stock', producto: 'Medialuna', disponible: 13 }, { enTicket: 13 }), 'Ya cargaste todo el stock de Medialuna (13). Podés cobrar o quitar alguna.');
  assert.equal(V.mensajeError({ code: 'sin-stock', producto: 'Medialuna', disponible: 13 }, { enTicket: 2 }), 'Solo quedan 13 de Medialuna. Bajá la cantidad a 13 o menos.');
  assert.match(V.mensajeError({ code: 'ya-cobrado', ticket: 'T21' }), /ya estaba cobrado/);
  assert.equal(V.mensajeError({ code: 'otro', mensaje: 'Texto del núcleo' }), 'Texto del núcleo');
  assert.match(V.mensajeError({ code: 'desconocido' }), /Probá de nuevo/);
  assert.equal(V.mensajeError(null), '');
  // todo código de error que puede emitir cafeteria.js tiene texto propio (no cae en el genérico)
  const st = nuevo(); add(st, 'FW', 1);
  const casos = [st.dispatch('agregarProducto', { producto: 'ML', cantidad: 14 }), st.dispatch('cobrar', { medio: 'efectivo', recibido: 1 }), st.dispatch('cobrar', { medio: 'efectivo', recibido: 1.5 }), nuevo().dispatch('cobrar', { medio: 'efectivo' }), st.dispatch('agregarProducto', { producto: 'FW', cantidad: 100 })];
  for (const r of casos) assert.ok(!/Probá de nuevo/.test(V.mensajeError(r.error)), r.error.code);
});
test('tope de stock: el producto se marca no disponible justo al llegar a lo que queda, y el ticket sigue siendo cobrable', () => {
  const st = nuevo(); const ml = () => cafe.sel.catalogo(st.getState()).find((p) => p.id === 'ML');
  assert.equal(V.alLimite(ml(), 12), false); assert.equal(V.alLimite(ml(), 13), true);
  assert.equal(V.alLimite(cafe.sel.catalogo(st.getState()).find((p) => p.id === 'FW'), 99), false);      // las bebidas no tienen tope
  add(st, 'ML', 13);
  const r = st.dispatch('agregarProducto', { producto: 'ML' });                                        // el núcleo rechaza el 14.º aunque la interfaz lo intente
  assert.equal(r.ok, false); assert.equal(r.error.code, 'sin-stock');
  assert.equal(cafe.sel.ticketAbierto(st.getState()).lineas[0].cantidad, 13);
  assert.equal(V.cobrable(st.getState()).ok, true);
});
test('cobrable: se puede cobrar un ticket con productos y no uno vacío; no modifica nada', () => {
  const st = nuevo(); const antes = st.getState();
  const v = V.cobrable(antes); assert.equal(v.ok, false); assert.equal(v.error.code, 'ticket-vacio');
  add(st, 'FW', 1); const s1 = st.getState(); assert.equal(V.cobrable(s1).ok, true); assert.equal(st.getState(), s1);
  assert.equal(cafe.sel.ticketAbierto(st.getState()).total, 3900);
});
