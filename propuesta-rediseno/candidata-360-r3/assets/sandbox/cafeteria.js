/* Growi · sandbox · lógica de Cafetería (ejemplo funcional de una solución a medida).
   Un ticket abierto se arma, se cobra a mano y recién entonces mueve ventas, caja y stock. Nada se guarda: todo se deriva de los tickets.
   Contrato verificado en F0: stock = apertura − unidades vendidas (históricas + nuevas); un ticket se cobra una sola vez; sin stock negativo.
   Sin recetas ni consumo de insumos (fuera de alcance). Navegador: window.GrowiSandbox.cafeteria · Node: module.exports. */
(function (root, factory) {
  var core, datos;
  if (typeof module === 'object' && module.exports) { core = require('./core.js'); datos = require('./cafeteria.data.js'); }
  else { core = root.GrowiSandbox.core; datos = root.GrowiSandbox.cafeteriaDatos; }
  var api = factory(core, datos);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GrowiSandbox.cafeteria = api;
})(this, function (core, DATOS) {
  'use strict';
  var fail = core.fail, MAX_LINEA = 99;

  var MENSAJES = {
    'producto-inexistente': function (e) { return 'Ese producto no está en la carta.'; },
    'cantidad-invalida': function () { return 'La cantidad tiene que ser un número entero de 1 en adelante.'; },
    'cantidad-maxima': function () { return 'Una línea admite hasta ' + MAX_LINEA + ' unidades.'; },
    'sin-stock': function (e) { return 'No alcanza el stock de ' + e.producto + ': quedan ' + e.disponible + '.'; },
    'no-esta-en-el-ticket': function () { return 'Ese producto no está en el ticket.'; },
    'ticket-vacio': function () { return 'Agregá un producto para poder cobrar.'; },
    'medio-invalido': function () { return 'Elegí un medio de pago de la lista.'; },
    'importe-invalido': function () { return 'El importe tiene que ser un número entero de pesos.'; },
    'efectivo-insuficiente': function (e) { return 'Lo recibido no cubre el total de ' + core.pesos(e.total) + '.'; },
    'recibido-solo-efectivo': function () { return 'El importe recibido solo se usa con efectivo.'; },
    'ya-cobrado': function (e) { return 'El ticket ' + e.ticket + ' ya está cobrado.'; },
    'ticket-inexistente': function () { return 'Ese ticket no existe.'; }
  };
  function err(code, datos) { return fail(code, datos, MENSAJES[code] ? MENSAJES[code](datos || {}) : undefined); }
  var idDe = function (n) { return 'T' + (n < 10 ? '0' : '') + n; };

  /* ── estado inicial reproducible ── */
  function init() {
    var d = core.clone(DATOS);
    var tickets = d.tickets.map(function (t) {
      return { id: t.id, medio: t.medio, estado: 'cobrado', lineas: t.lineas.map(function (l) { return { p: l[0], q: l[1] }; }) };
    });
    return {
      negocio: d.negocio,
      catalogo: d.productos,
      config: { medios: d.medios, stockApertura: d.stockApertura, stockMinimo: d.stockMinimo, fondoCaja: d.fondoCaja },
      tickets: tickets,
      gastos: d.gastos,
      abierto: { id: idDe(tickets.length + 1), lineas: [] }
    };
  }

  /* ── selectores: todo se deriva ── */
  function producto(s, id) { for (var i = 0; i < s.catalogo.length; i++) if (s.catalogo[i].id === id) return s.catalogo[i]; return null; }
  function totalLineas(s, lineas) { return lineas.reduce(function (a, l) { return a + producto(s, l.p).precio * l.q; }, 0); }
  function totalTicket(s, t) { return totalLineas(s, t.lineas); }
  function cobrados(s) { return s.tickets.filter(function (t) { return t.estado === 'cobrado'; }); }
  function unidades(s) {
    var o = {};
    cobrados(s).forEach(function (t) { t.lineas.forEach(function (l) { o[l.p] = (o[l.p] || 0) + l.q; }); });
    return o;
  }
  function stock(s) {                       // solo productos con control de stock
    var u = unidades(s), o = {};
    Object.keys(s.config.stockApertura).forEach(function (id) { o[id] = s.config.stockApertura[id] - (u[id] || 0); });
    return o;
  }
  function ventas(s) { return cobrados(s).reduce(function (a, t) { return a + totalTicket(s, t); }, 0); }
  function nTickets(s) { return cobrados(s).length; }
  function ticketPromedio(s) { return core.promedio(ventas(s), nTickets(s)); }
  function porMedio(s) {
    var o = {};
    s.config.medios.forEach(function (m) { o[m] = 0; });
    cobrados(s).forEach(function (t) { o[t.medio] += totalTicket(s, t); });
    return o;
  }
  function gastosEfectivo(s) { return s.gastos.filter(function (g) { return g.medio === 'efectivo'; }).reduce(function (a, g) { return a + g.monto; }, 0); }
  function efectivoEsperado(s) { return s.config.fondoCaja + porMedio(s).efectivo - gastosEfectivo(s); }
  function alertas(s) {
    var st = stock(s);
    return Object.keys(st).filter(function (id) { return st[id] <= s.config.stockMinimo[id]; })
      .map(function (id) { return { producto: id, nombre: producto(s, id).nombre, stock: st[id], minimo: s.config.stockMinimo[id], agotado: st[id] === 0 }; });
  }
  function masVendido(s) {                  // por unidades; desempate por ingreso y luego por id
    var u = unidades(s), ids = Object.keys(u);
    if (!ids.length) return null;
    ids.sort(function (a, b) {
      return u[b] - u[a] || producto(s, b).precio * u[b] - producto(s, a).precio * u[a] || (a < b ? -1 : a > b ? 1 : 0);
    });
    return { producto: ids[0], nombre: producto(s, ids[0]).nombre, unidades: u[ids[0]] };
  }
  function catalogo(s) {
    var st = stock(s);
    return s.catalogo.map(function (p) {
      var c = p.stock;
      return { id: p.id, nombre: p.nombre, precio: p.precio, controlaStock: c, stock: c ? st[p.id] : null,
               minimo: c ? s.config.stockMinimo[p.id] : null, bajoMinimo: c ? st[p.id] <= s.config.stockMinimo[p.id] : false, agotado: c ? st[p.id] === 0 : false };
    });
  }
  function ticketAbierto(s) {
    var st = stock(s);
    var lineas = s.abierto.lineas.map(function (l) {
      var p = producto(s, l.p);
      return { producto: l.p, nombre: p.nombre, precio: p.precio, cantidad: l.q, subtotal: p.precio * l.q,
               controlaStock: p.stock, disponible: p.stock ? st[l.p] : null };
    });
    return { id: s.abierto.id, lineas: lineas, unidades: lineas.reduce(function (a, l) { return a + l.cantidad; }, 0),
             total: lineas.reduce(function (a, l) { return a + l.subtotal; }, 0), vacio: lineas.length === 0 };
  }
  function ultimasVentas(s, n) {
    return cobrados(s).slice(-n).reverse().map(function (t) {
      var total = totalTicket(s, t);
      return { id: t.id, medio: t.medio, total: total, lineas: t.lineas.map(function (l) { return { producto: l.p, nombre: producto(s, l.p).nombre, cantidad: l.q }; }),
               recibido: t.recibido == null ? null : t.recibido, vuelto: t.recibido == null ? null : t.recibido - total };
    });
  }
  function resumen(s) {
    return { tickets: nTickets(s), ventas: ventas(s), ticketPromedio: ticketPromedio(s), masVendido: masVendido(s), porMedio: porMedio(s),
             fondoCaja: s.config.fondoCaja, gastosEfectivo: gastosEfectivo(s), efectivoEsperado: efectivoEsperado(s), alertas: alertas(s), stock: stock(s) };
  }

  /* ── invariantes: nunca llega a la interfaz un estado inconsistente ── */
  function invariantes(s) {
    var e = [], ids = {};
    s.tickets.concat([s.abierto]).forEach(function (t) { if (ids[t.id]) e.push('id repetido ' + t.id); ids[t.id] = 1; });
    var lineasOk = function (t) {
      t.lineas.forEach(function (l) {
        if (!producto(s, l.p)) e.push('producto inexistente ' + l.p + ' en ' + t.id);
        if (!core.esEntero(l.q) || l.q < 1 || l.q > MAX_LINEA) e.push('cantidad inválida en ' + t.id);
      });
    };
    s.tickets.forEach(function (t) {
      lineasOk(t);
      if (!t.lineas.length) e.push('ticket cobrado vacío ' + t.id);
      if (s.config.medios.indexOf(t.medio) < 0) e.push('medio inválido en ' + t.id);
    });
    lineasOk(s.abierto);
    if (s.abierto.id !== idDe(s.tickets.length + 1)) e.push('id del ticket abierto fuera de secuencia');
    if (e.length) return e;                 // los cálculos siguientes suponen datos bien formados
    var st = stock(s);
    Object.keys(st).forEach(function (id) { if (st[id] < 0) e.push('stock negativo de ' + id); });
    s.abierto.lineas.forEach(function (l) { if (st[l.p] != null && l.q > st[l.p]) e.push('el ticket abierto supera el stock de ' + l.p); });
    if (!core.esEntero(s.config.fondoCaja) || s.config.fondoCaja < 0) e.push('fondo de caja inválido');
    s.gastos.forEach(function (g) { if (!core.esEntero(g.monto) || g.monto <= 0) e.push('gasto inválido ' + g.id); });
    return e;
  }

  /* ── acciones: puras, devuelven un estado nuevo o un error; nada queda a medias ── */
  function validarCantidad(s, p, nueva) {
    if (!core.esEntero(nueva) || nueva < 1) return err('cantidad-invalida');
    if (nueva > MAX_LINEA) return err('cantidad-maxima');
    if (p.stock) { var d = stock(s)[p.id]; if (nueva > d) return err('sin-stock', { producto: p.nombre, disponible: d }); }
    return null;
  }
  function lineaDe(abierto, id) { for (var i = 0; i < abierto.lineas.length; i++) if (abierto.lineas[i].p === id) return abierto.lineas[i]; return null; }

  var acciones = {
    agregarProducto: function (s, a) {
      var p = producto(s, a.producto); if (!p) return err('producto-inexistente');
      var cant = a.cantidad === undefined ? 1 : a.cantidad;
      var l0 = lineaDe(s.abierto, p.id), nueva = (l0 ? l0.q : 0) + cant;
      if (!core.esEntero(cant) || cant < 1) return err('cantidad-invalida');
      var e = validarCantidad(s, p, nueva); if (e) return e;
      var n = core.clone(s), l = lineaDe(n.abierto, p.id);
      if (l) l.q = nueva; else n.abierto.lineas.push({ p: p.id, q: nueva });
      return { estado: n };
    },
    cambiarCantidad: function (s, a) {
      var p = producto(s, a.producto); if (!p) return err('producto-inexistente');
      if (!lineaDe(s.abierto, p.id)) return err('no-esta-en-el-ticket');
      var e = validarCantidad(s, p, a.cantidad); if (e) return e;
      var n = core.clone(s); lineaDe(n.abierto, p.id).q = a.cantidad;
      return { estado: n };
    },
    quitarProducto: function (s, a) {
      if (!lineaDe(s.abierto, a.producto)) return err('no-esta-en-el-ticket');
      var n = core.clone(s); n.abierto.lineas = n.abierto.lineas.filter(function (l) { return l.p !== a.producto; });
      return { estado: n };
    },
    vaciarTicket: function (s) {
      if (!s.abierto.lineas.length) return err('ticket-vacio');
      var n = core.clone(s); n.abierto.lineas = [];
      return { estado: n };
    },
    // cobrar es la única acción que mueve ventas, caja y stock, y lo hace una sola vez por ticket.
    cobrar: function (s, a) {
      if (a.ticketId !== undefined && a.ticketId !== s.abierto.id) {
        var previo = s.tickets.some(function (t) { return t.id === a.ticketId; });
        return previo ? err('ya-cobrado', { ticket: a.ticketId }) : err('ticket-inexistente');
      }
      if (!s.abierto.lineas.length) return err('ticket-vacio');
      if (s.config.medios.indexOf(a.medio) < 0) return err('medio-invalido');
      var total = totalLineas(s, s.abierto.lineas), st = stock(s), i, l, p;
      for (i = 0; i < s.abierto.lineas.length; i++) {
        l = s.abierto.lineas[i]; p = producto(s, l.p);
        if (p.stock && l.q > st[l.p]) return err('sin-stock', { producto: p.nombre, disponible: st[l.p] });
      }
      var recibido = a.recibido === undefined || a.recibido === null ? null : a.recibido;
      if (recibido !== null) {
        if (a.medio !== 'efectivo') return err('recibido-solo-efectivo');
        if (!core.esEntero(recibido) || recibido < 0) return err('importe-invalido');
        if (recibido < total) return err('efectivo-insuficiente', { total: total, recibido: recibido });
      }
      var n = core.clone(s), t = { id: s.abierto.id, medio: a.medio, estado: 'cobrado', lineas: core.clone(s.abierto.lineas) };
      if (recibido !== null) t.recibido = recibido;
      n.tickets.push(t);
      n.abierto = { id: idDe(n.tickets.length + 1), lineas: [] };
      return { estado: n, resultado: { ticketId: t.id, total: total, vuelto: recibido === null ? null : recibido - total } };
    }
  };

  function crear() { return core.createStore({ init: init, acciones: acciones, invariantes: invariantes }); }

  return {
    datos: DATOS, init: init, crear: crear, acciones: acciones, invariantes: invariantes, mensajeError: function (e) { return e && e.mensaje || null; },
    sel: { catalogo: catalogo, ticketAbierto: ticketAbierto, totalTicket: totalTicket, ventas: ventas, nTickets: nTickets, ticketPromedio: ticketPromedio,
           porMedio: porMedio, efectivoEsperado: efectivoEsperado, gastosEfectivo: gastosEfectivo, unidades: unidades, stock: stock, alertas: alertas,
           masVendido: masVendido, ultimasVentas: ultimasVentas, resumen: resumen }
  };
});
