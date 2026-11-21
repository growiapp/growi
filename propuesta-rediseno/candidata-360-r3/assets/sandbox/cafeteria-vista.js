/* Growi · sandbox de Cafetería · modelo de vista (puro, sin DOM).
   Traduce el estado de cafeteria.js a lo que la interfaz necesita mostrar: categorías, búsqueda, importes rápidos, «antes → ahora»,
   progreso de la guía y textos de error. NO contiene reglas de negocio: valida, calcula y decide siempre cafeteria.js.
   Navegador: window.GrowiSandbox.cafeteriaVista · Node: module.exports. */
(function (root, factory) {
  var core, cafe;
  if (typeof module === 'object' && module.exports) { core = require('./core.js'); cafe = require('./cafeteria.js'); }
  else { core = root.GrowiSandbox.core; cafe = root.GrowiSandbox.cafeteria; }
  var api = factory(core, cafe);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GrowiSandbox.cafeteriaVista = api;
})(this, function (core, cafe) {
  'use strict';
  var S = cafe.sel;

  /* La agrupación en categorías es presentación (cómo se ordena el mostrador), no una regla del negocio. */
  var CATEGORIAS = [{ id: 'todo', nombre: 'Todo' }, { id: 'cafe', nombre: 'Cafés' }, { id: 'panaderia', nombre: 'Panadería' }, { id: 'salado', nombre: 'Salados' }];
  var CATEGORIA_DE = { FW: 'cafe', CP: 'cafe', CF: 'cafe', ML: 'panaderia', TT: 'panaderia', TO: 'salado' };
  var MEDIOS = { efectivo: 'Efectivo', transferencia: 'Transferencia', mercadopago: 'Mercado Pago' };

  function norm(t) { return String(t == null ? '' : t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); }
  function categoriaDe(id) { return CATEGORIA_DE[id] || 'todo'; }

  function productos(estado, categoria, busqueda) {
    var q = norm(busqueda);
    return S.catalogo(estado).filter(function (p) {
      return (!categoria || categoria === 'todo' || categoriaDe(p.id) === categoria) && (!q || norm(p.nombre).indexOf(q) >= 0);
    });
  }

  // Atajos para el importe recibido: lo justo y los billetes más probables por encima del total.
  function importesRapidos(total) {
    var c = [total];
    [1000, 5000, 10000, 20000].forEach(function (u) { c.push(Math.ceil(total / u) * u); });
    var vistos = {}, out = [];
    c.sort(function (a, b) { return a - b; }).forEach(function (x) { if (!vistos[x] && x >= total) { vistos[x] = 1; out.push(x); } });
    return out.slice(0, 3);
  }

  function estadoStock(item) { return item.agotado ? 'agotado' : item.bajoMinimo ? 'minimo' : 'ok'; }

  /* ── «antes → ahora»: se calcula siempre desde dos estados reales ── */
  function par(a, b) { return { antes: a, ahora: b, delta: b - a }; }
  function cambio(antes, despues) {
    var a = S.resumen(antes), b = S.resumen(despues);
    var nuevos = despues.tickets.slice(antes.tickets.length).map(function (t) {
      return { id: t.id, medio: t.medio, total: S.totalTicket(despues, t), recibido: t.recibido == null ? null : t.recibido,
               lineas: t.lineas.map(function (l) { return { producto: l.p, nombre: S.catalogo(despues).filter(function (p) { return p.id === l.p; })[0].nombre, cantidad: l.q }; }) };
    });
    var medios = {}; Object.keys(b.porMedio).forEach(function (m) { medios[m] = par(a.porMedio[m], b.porMedio[m]); });
    var stock = Object.keys(b.stock).filter(function (id) { return b.stock[id] !== a.stock[id]; }).map(function (id) {
      var min = despues.config.stockMinimo[id], it = S.catalogo(despues).filter(function (p) { return p.id === id; })[0];
      return { producto: id, nombre: it.nombre, antes: a.stock[id], ahora: b.stock[id], delta: b.stock[id] - a.stock[id], minimo: min,
               cruzoMinimo: a.stock[id] > min && b.stock[id] <= min, agotado: b.stock[id] === 0 };
    });
    var antesAl = a.alertas.map(function (x) { return x.producto; });
    return {
      hayVenta: nuevos.length > 0, tickets: nuevos,
      ventas: par(a.ventas, b.ventas), nTickets: par(a.tickets, b.tickets), promedio: par(a.ticketPromedio, b.ticketPromedio),
      efectivoEsperado: par(a.efectivoEsperado, b.efectivoEsperado), porMedio: medios, stock: stock,
      alertasNuevas: b.alertas.filter(function (x) { return antesAl.indexOf(x.producto) < 0; }),
      masVendido: { antes: a.masVendido, ahora: b.masVendido }
    };
  }

  /* ── guía opcional: «dos flat white + una medialuna → cobrar → mirar qué cambió». El progreso se deriva del estado, no se guarda. ── */
  function unidadesEn(lineas, id) { return lineas.filter(function (l) { return l.p === id; }).reduce(function (a, l) { return a + l.q; }, 0); }
  function progresoGuia(o) {
    var sesion = o.actual.tickets.slice(o.inicio.tickets.length), ab = o.actual.abierto.lineas;
    var tiene = function (id, n) { return unidadesEn(ab, id) >= n || sesion.some(function (t) { return unidadesEn(t.lineas, id) >= n; }); };
    var cobrada = sesion.length > 0;
    var pasos = [
      { id: 'flat', texto: 'Agregá dos flat white', hecho: tiene('FW', 2) },
      { id: 'medialuna', texto: 'Sumá una medialuna', hecho: tiene('ML', 1) },
      { id: 'cobro', texto: 'Cobrá la venta', hecho: cobrada },
      { id: 'cambio', texto: 'Mirá qué cambió', hecho: cobrada && !!o.vistoImpacto }
    ];
    var actual = -1; for (var i = 0; i < pasos.length; i++) if (!pasos[i].hecho) { actual = i; break; }
    return { pasos: pasos, actual: actual, completa: actual === -1 };
  }

  function ranking(estado, n) {
    var u = S.unidades(estado), cat = S.catalogo(estado), max = 0;
    var filas = Object.keys(u).map(function (id) {
      var p = cat.filter(function (x) { return x.id === id; })[0];
      return { id: id, nombre: p.nombre, unidades: u[id], ingreso: p.precio * u[id] };
    }).sort(function (x, y) { return y.unidades - x.unidades || y.ingreso - x.ingreso || (x.id < y.id ? -1 : 1); }).slice(0, n);
    filas.forEach(function (f) { if (f.unidades > max) max = f.unidades; });
    return filas.map(function (f) { return { id: f.id, nombre: f.nombre, unidades: f.unidades, pct: core.porcentaje(f.unidades, max) }; });
  }

  // Textos de error con la voz Growi: qué pasó y qué hacer. Los códigos y los datos los define cafeteria.js.
  /* ctx.enTicket: unidades de ese producto que ya están en el ticket (para explicar el tope de stock). */
  function mensajeError(err, ctx) {
    if (!err) return '';
    switch (err.code) {
      case 'sin-stock':
        if (ctx && ctx.enTicket >= err.disponible) return 'Ya cargaste todo el stock de ' + err.producto + ' (' + err.disponible + '). Podés cobrar o quitar alguna.';
        return 'Solo quedan ' + err.disponible + ' de ' + err.producto + '. Bajá la cantidad a ' + err.disponible + ' o menos.';
      case 'efectivo-insuficiente':
        if (err.total != null && err.recibido != null) return 'Faltan ' + core.pesos(err.total - err.recibido) + ' para cubrir el total. Ingresá al menos ' + core.pesos(err.total) + ' o dejá el importe vacío.';
        return 'Lo recibido no cubre el total. Ingresá un importe mayor o dejalo vacío.';
      case 'importe-invalido': return 'Ese importe no sirve. Escribí solo números, en pesos enteros.';
      case 'ticket-vacio': return 'El ticket está vacío. Agregá un producto para poder cobrar.';
      case 'ya-cobrado': return 'Ese ticket ya estaba cobrado. No se cobró de nuevo.';
      case 'cantidad-maxima': return 'Una línea admite hasta 99 unidades.';
      case 'cantidad-invalida': return 'La cantidad tiene que ser un número entero de 1 en adelante.';
      case 'medio-invalido': return 'Elegí cómo cobrar: efectivo, transferencia o Mercado Pago.';
      case 'recibido-solo-efectivo': return 'El importe recibido solo se usa con efectivo.';
      default: return err.mensaje || 'No pudimos hacer eso. Probá de nuevo.';
    }
  }

  /* ¿Este producto ya tiene en el ticket todo el stock que queda? (solo productos con control de stock) */
  function alLimite(p, enTicket) { return !!p.controlaStock && enTicket >= p.stock; }
  /* ¿Se puede cobrar el ticket abierto? Prueba en seco con la misma acción de F1 (no cambia nada). */
  function cobrable(estado) {
    var t = S.ticketAbierto(estado), r = cafe.acciones.cobrar(estado, { ticketId: t.id, medio: 'transferencia' });
    return r.error ? { ok: false, error: r.error } : { ok: true };
  }

  return { CATEGORIAS: CATEGORIAS, MEDIOS: MEDIOS, categoriaDe: categoriaDe, norm: norm, productos: productos, importesRapidos: importesRapidos,
           estadoStock: estadoStock, cambio: cambio, progresoGuia: progresoGuia, ranking: ranking, mensajeError: mensajeError, alLimite: alLimite, cobrable: cobrable };
});
