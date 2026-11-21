// Pruebas de la lógica de Cafetería (implementación nueva). Los valores esperados son el contrato validado en F0.
import test from 'node:test';
import assert from 'node:assert/strict';
import cafe from '../assets/sandbox/cafeteria.js';
import DATOS from '../assets/sandbox/cafeteria.data.js';

const S = cafe.sel;
const nuevo = () => cafe.crear();
const add = (st, producto, cantidad) => st.dispatch('agregarProducto', { producto, cantidad });
const ventaGuia = (st, medio = 'efectivo', recibido = 10000) => {
  add(st, 'FW', 2); add(st, 'ML', 1);
  return st.dispatch('cobrar', { ticketId: st.getState().abierto.id, medio, recibido: medio === 'efectivo' ? recibido : undefined });
};

test('datos: 20 tickets, ids únicos y totales reconstruidos de forma independiente', () => {
  const precio = Object.fromEntries(DATOS.productos.map((p) => [p.id, p.precio]));
  assert.equal(DATOS.tickets.length, 20); assert.equal(new Set(DATOS.tickets.map((t) => t.id)).size, 20);
  const total = (t) => t.lineas.reduce((a, [p, q]) => a + precio[p] * q, 0);
  const porMedio = { efectivo: 0, transferencia: 0, mercadopago: 0 }, unid = {};
  for (const t of DATOS.tickets) { porMedio[t.medio] += total(t); for (const [p, q] of t.lineas) unid[p] = (unid[p] || 0) + q; }
  const s = nuevo().getState();
  assert.deepEqual(porMedio, { efectivo: 61200, transferencia: 48300, mercadopago: 32900 });
  assert.deepEqual(unid, { FW: 9, ML: 18, CF: 9, CP: 5, TT: 5, TO: 1 });
  assert.equal(S.ventas(s), 142400); assert.deepEqual(S.porMedio(s), porMedio); assert.deepEqual(S.unidades(s), unid);
});
test('estado inicial: indicadores derivados (contrato F0)', () => {
  const s = nuevo().getState(), r = S.resumen(s);
  assert.equal(r.tickets, 20); assert.equal(r.ventas, 142400); assert.equal(r.ticketPromedio, 7120);
  assert.equal(r.efectivoEsperado, 74700); assert.equal(r.fondoCaja, 20000); assert.equal(r.gastosEfectivo, 6500);
  assert.deepEqual(r.stock, { ML: 13, TO: 9, TT: 7 });                        // apertura 31/10/12 menos lo vendido
  assert.deepEqual(r.alertas, []);
  assert.deepEqual(r.masVendido, { producto: 'ML', nombre: 'Medialuna', unidades: 18 });
  assert.equal(s.abierto.id, 'T21'); assert.deepEqual(s.abierto.lineas, []);
  assert.deepEqual(cafe.invariantes(s), []);
});
test('catálogo: precios y stock solo en productos con control', () => {
  const c = Object.fromEntries(S.catalogo(nuevo().getState()).map((p) => [p.id, p]));
  assert.equal(Object.keys(c).length, 6);
  assert.deepEqual([c.FW.controlaStock, c.ML.controlaStock], [false, true]);
  assert.equal(c.FW.stock, null); assert.equal(c.ML.stock, 13); assert.equal(c.ML.minimo, 12); assert.equal(c.ML.bajoMinimo, false);
  assert.equal(c.TO.precio, 6500);
});

test('ticket: agregar, sumar cantidades, cambiar, quitar y vaciar; importes derivados de los ítems', () => {
  const st = nuevo();
  assert.equal(S.ticketAbierto(st.getState()).vacio, true);
  add(st, 'FW', 1); add(st, 'FW', 1); add(st, 'ML');                         // FW se acumula en una sola línea
  let t = S.ticketAbierto(st.getState());
  assert.equal(t.lineas.length, 2); assert.equal(t.unidades, 3); assert.equal(t.total, 3900 * 2 + 1700);
  assert.deepEqual(t.lineas.map((l) => l.subtotal), [7800, 1700]);
  st.dispatch('cambiarCantidad', { producto: 'ML', cantidad: 4 });
  t = S.ticketAbierto(st.getState()); assert.equal(t.total, 7800 + 6800);
  st.dispatch('quitarProducto', { producto: 'FW' });
  t = S.ticketAbierto(st.getState()); assert.equal(t.lineas.length, 1); assert.equal(t.total, 6800);
  assert.equal(st.dispatch('vaciarTicket').ok, true); assert.equal(S.ticketAbierto(st.getState()).vacio, true);
  assert.deepEqual(S.resumen(st.getState()).ventas, 142400);                  // armar un ticket no mueve ventas, caja ni stock
});
test('venta guía por acciones: antes → después (contrato F0)', () => {
  const st = nuevo(), antes = st.getState();
  const r = ventaGuia(st); assert.equal(r.ok, true);
  assert.deepEqual(r.resultado, { ticketId: 'T21', total: 9500, vuelto: 500 });
  const s = st.getState(), x = S.resumen(s);
  assert.equal(x.tickets, 21); assert.equal(x.ventas, 151900); assert.equal(x.ticketPromedio, 7233);
  assert.equal(x.efectivoEsperado, 84200);
  assert.deepEqual(x.porMedio, { efectivo: 70700, transferencia: 48300, mercadopago: 32900 });
  assert.deepEqual(x.stock, { ML: 12, TO: 9, TT: 7 });
  assert.deepEqual(x.alertas, [{ producto: 'ML', nombre: 'Medialuna', stock: 12, minimo: 12, agotado: false }]);
  assert.deepEqual(x.masVendido, { producto: 'ML', nombre: 'Medialuna', unidades: 19 });
  assert.equal(S.unidades(s).FW, 11);
  assert.equal(s.abierto.id, 'T22'); assert.equal(S.ticketAbierto(s).vacio, true);          // queda un ticket nuevo y vacío
  assert.equal(antes.tickets.length, 20);                                                     // el estado anterior no se tocó
  assert.deepEqual(S.ultimasVentas(s, 1), [{ id: 'T21', medio: 'efectivo', total: 9500, lineas: [{ producto: 'FW', nombre: 'Flat white', cantidad: 2 }, { producto: 'ML', nombre: 'Medialuna', cantidad: 1 }], recibido: 10000, vuelto: 500 }]);
});
test('medio de pago: cada cobro suma solo en su medio y caja de efectivo solo con efectivo', () => {
  for (const [medio, esperado] of [['efectivo', { efectivo: 70700, transferencia: 48300, mercadopago: 32900 }], ['transferencia', { efectivo: 61200, transferencia: 57800, mercadopago: 32900 }], ['mercadopago', { efectivo: 61200, transferencia: 48300, mercadopago: 42400 }]]) {
    const st = nuevo(); assert.equal(ventaGuia(st, medio).ok, true);
    assert.deepEqual(S.porMedio(st.getState()), esperado, medio);
    assert.equal(S.efectivoEsperado(st.getState()), 20000 + esperado.efectivo - 6500, medio);
    assert.equal(S.ventas(st.getState()), 151900);
  }
});
test('ventas modifican únicamente lo que corresponde', () => {
  const st = nuevo(), a = st.getState(); ventaGuia(st); const b = st.getState();
  assert.deepEqual(b.catalogo, a.catalogo); assert.deepEqual(b.config, a.config); assert.deepEqual(b.gastos, a.gastos);
  assert.deepEqual(b.tickets.slice(0, 20), a.tickets);                         // el historial queda intacto
});

test('efectivo: vuelto, insuficiente, importe inválido y recibido con otro medio', () => {
  const armar = () => { const st = nuevo(); add(st, 'FW', 2); add(st, 'ML'); return st; };
  let st = armar(), r = st.dispatch('cobrar', { medio: 'efectivo', recibido: 9500 }); assert.equal(r.resultado.vuelto, 0);
  st = armar(); r = st.dispatch('cobrar', { medio: 'efectivo' }); assert.equal(r.ok, true); assert.equal(r.resultado.vuelto, null);   // sin importe recibido
  st = armar(); r = st.dispatch('cobrar', { medio: 'efectivo', recibido: 9000 }); assert.equal(r.error.code, 'efectivo-insuficiente'); assert.match(r.error.mensaje, /\$9\.500/);
  r = st.dispatch('cobrar', { medio: 'efectivo', recibido: 9500.5 }); assert.equal(r.error.code, 'importe-invalido');
  r = st.dispatch('cobrar', { medio: 'transferencia', recibido: 10000 }); assert.equal(r.error.code, 'recibido-solo-efectivo');
  assert.equal(S.nTickets(st.getState()), 20);                                  // nada se cobró
});
test('stock: no se puede superar lo disponible ni quedar negativo; bebidas sin control', () => {
  const st = nuevo();
  let r = add(st, 'ML', 14); assert.equal(r.error.code, 'sin-stock'); assert.equal(r.error.disponible, 13); assert.match(r.error.mensaje, /quedan 13/);
  assert.equal(add(st, 'ML', 13).ok, true);
  assert.equal(add(st, 'ML', 1).error.code, 'sin-stock');                       // ya hay 13 en el ticket
  assert.equal(st.dispatch('cobrar', { medio: 'transferencia' }).ok, true);
  assert.equal(S.stock(st.getState()).ML, 0);
  assert.deepEqual(S.alertas(st.getState()).map((a) => [a.producto, a.agotado]), [['ML', true]]);
  assert.equal(add(st, 'ML', 1).error.code, 'sin-stock');                       // agotada
  assert.equal(S.catalogo(st.getState()).find((p) => p.id === 'ML').agotado, true);
  assert.equal(add(st, 'FW', 99).ok, true);                                     // las bebidas no descuentan stock
  assert.equal(st.dispatch('cobrar', { medio: 'efectivo' }).ok, true);
  assert.deepEqual(S.stock(st.getState()), { ML: 0, TO: 9, TT: 7 });
});
test('stock: secuencia larga, nunca negativo y suma por medio = ventas', () => {
  const st = nuevo(); const medios = ['efectivo', 'transferencia', 'mercadopago'];
  for (let i = 0; i < 60; i++) {
    add(st, 'ML', 1); add(st, 'TO', 1); add(st, 'FW', 1);
    const r = st.dispatch('cobrar', { medio: medios[i % 3] });
    const s = st.getState();
    assert.ok(Object.values(S.stock(s)).every((x) => x >= 0));
    assert.equal(Object.values(S.porMedio(s)).reduce((a, b) => a + b, 0), S.ventas(s));
    assert.deepEqual(cafe.invariantes(s), []);
    if (!r.ok) st.dispatch('vaciarTicket');
  }
  assert.equal(S.stock(st.getState()).ML, 0);
});

test('cobro duplicado: no se cobra dos veces y el estado queda idéntico', () => {
  const st = nuevo(); add(st, 'FW', 2); add(st, 'ML');
  const id = st.getState().abierto.id;
  assert.equal(st.dispatch('cobrar', { ticketId: id, medio: 'efectivo', recibido: 10000 }).ok, true);
  const despues = st.getState();
  const r = st.dispatch('cobrar', { ticketId: id, medio: 'efectivo', recibido: 10000 });          // doble toque
  assert.equal(r.error.code, 'ya-cobrado'); assert.match(r.error.mensaje, /T21/); assert.equal(st.getState(), despues);
  assert.equal(st.dispatch('cobrar', { medio: 'efectivo' }).error.code, 'ticket-vacio');            // sin id: el ticket nuevo está vacío
  assert.equal(st.dispatch('cobrar', { ticketId: 'T77', medio: 'efectivo' }).error.code, 'ticket-inexistente');
  assert.equal(S.nTickets(despues), 21);
});
test('operaciones inválidas devuelven un error controlado y no cambian nada', () => {
  const st = nuevo(); add(st, 'FW'); const antes = st.getState();
  const casos = [
    ['agregarProducto', { producto: 'XX' }, 'producto-inexistente'], ['agregarProducto', { producto: 'FW', cantidad: 0 }, 'cantidad-invalida'],
    ['agregarProducto', { producto: 'FW', cantidad: 1.5 }, 'cantidad-invalida'], ['agregarProducto', { producto: 'FW', cantidad: '2' }, 'cantidad-invalida'],
    ['agregarProducto', { producto: 'FW', cantidad: 100 }, 'cantidad-maxima'],
    ['cambiarCantidad', { producto: 'CP', cantidad: 2 }, 'no-esta-en-el-ticket'], ['cambiarCantidad', { producto: 'FW', cantidad: 0 }, 'cantidad-invalida'],
    ['quitarProducto', { producto: 'CP' }, 'no-esta-en-el-ticket'], ['cobrar', { medio: 'cheque' }, 'medio-invalido'], ['cobrar', {}, 'medio-invalido'],
    ['inventada', {}, 'accion-desconocida'],
  ];
  for (const [a, p, code] of casos) { const r = st.dispatch(a, p); assert.equal(r.error.code, code, a + ' ' + JSON.stringify(p)); assert.equal(st.getState(), antes); }
  const v = nuevo(); assert.equal(v.dispatch('cobrar', { medio: 'efectivo' }).error.code, 'ticket-vacio'); assert.equal(v.dispatch('vaciarTicket').error.code, 'ticket-vacio');
});

test('reinicio: recupera exactamente el estado inicial; el historial reproduce la sesión', () => {
  const st = nuevo(), ini = JSON.parse(JSON.stringify(st.getState()));
  ventaGuia(st); add(st, 'CP', 2);
  const sesion = st.historial(), antes = st.getState();
  st.reset(); assert.deepEqual(st.getState(), ini); assert.deepEqual(cafe.init(), ini);
  const otro = nuevo(); for (const h of sesion) otro.dispatch(h.accion, h.payload);
  assert.deepEqual(otro.getState(), antes);
});
test('invariantes: un estado manipulado a mano es detectado', () => {
  const s = JSON.parse(JSON.stringify(nuevo().getState()));
  s.tickets[0].lineas = [];                                         assert.ok(cafe.invariantes(s).some((m) => /vacío/.test(m)));
  const s2 = JSON.parse(JSON.stringify(nuevo().getState())); s2.tickets[3].id = 'T01';   assert.ok(cafe.invariantes(s2).some((m) => /repetido/.test(m)));
  const s3 = JSON.parse(JSON.stringify(nuevo().getState())); s3.tickets[0].lineas = [{ p: 'ML', q: 99 }]; assert.ok(cafe.invariantes(s3).some((m) => /negativo/.test(m)));
});
