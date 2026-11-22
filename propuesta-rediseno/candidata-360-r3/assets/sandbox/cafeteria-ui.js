/* Growi · sandbox de Cafetería · interfaz.
   Solo arma DOM y responde a eventos. Las reglas, los cálculos y los textos de error vienen de cafeteria.js (F1) y cafeteria-vista.js:
   acá no hay ningún total, stock ni validación propia. Nada se guarda en el navegador ni se envía a ningún lado. */
(function () {
  'use strict';
  var G = window.GrowiSandbox, core = G.core, cafe = G.cafeteria, V = G.cafeteriaVista, S = cafe.sel;
  var pesos = core.pesos, store = cafe.crear(), ui;
  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* ───────── íconos (trazo de 1,75 px, 24×24) ───────── */
  var IC = {
    cup: '<path d="M4.5 9h11v4.5a5 5 0 01-5 5h-1a5 5 0 01-5-5V9z"/><path d="M15.5 10.2h1.4a2.4 2.4 0 010 4.8h-1.4"/><path d="M8 3.8c0 1 .9 1.3.9 2.3M12 3.8c0 1 .9 1.3.9 2.3"/>',
    cupfoam: '<path d="M6 9h9.500l-1 8.500a2.200 2.200 0 01-2.200 1.900H9.200a2.200 2.200 0 01-2.200-1.900L6 9z"/><path d="M5.500 9C6 6.800 7.600 5.500 10.800 5.500S15.600 6.800 16 9"/><path d="M15.200 11h1.300a2.300 2.300 0 010 4.600h-1.700"/>',
    espresso: '<path d="M6 11h9v3a4 4 0 01-4 4h-1a4 4 0 01-4-4v-3z"/><path d="M15 12h1.2a2 2 0 010 4H15"/><path d="M4 20.5h13"/><path d="M9.5 5.5c0 .9.8 1.1.8 2"/>',
    croissant: '<path d="M3 15.500C3.500 10 7.500 6.500 12 6.500s8.500 3.500 9 9c-1.800.200-3-1-3.800-2.400-.900 1.600-2.300 2.400-3.800 2.400-.800 0-1.500-.400-2.400-.400s-1.600.400-2.400.400c-1.500 0-2.900-.800-3.800-2.400C6 14.500 4.800 15.700 3 15.500z"/><path d="M8.600 8.400l.9 5M12 7.300v5.700M15.400 8.400l-.9 5"/>',
    toast: '<path d="M5 9.500A3 3 0 016.500 7a3.700 3.700 0 015.500-1.700A3.700 3.700 0 0117.500 7 3 3 0 0119 9.500V18a1.500 1.500 0 01-1.500 1.500h-11A1.500 1.500 0 015 18V9.500z"/><path d="M9 13.500h6"/>',
    cake: '<path d="M3 18.500v-6.800l18-4.200v11H3z"/><path d="M3 11.700l18-4.200"/><path d="M9.500 10.300l.01 8.200"/><circle cx="16.500" cy="5" r="1.200"/>',
    mostrador: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9.500 8h5M9.500 12h5"/>',
    caja: '<rect x="3" y="6.500" width="18" height="11" rx="2"/><circle cx="12" cy="12" r="2.500"/><path d="M6.500 9.500v5M17.500 9.500v5"/>',
    stock: '<path d="M12 3l8 4v10l-8 4-8-4V7l8-4z"/><path d="M4 7l8 4 8-4M12 11v10"/>',
    resumen: '<path d="M5 20V11M12 20V4M19 20v-6.500"/>',
    reset: '<path d="M4.500 12a7.500 7.500 0 102.300-5.400"/><path d="M4.500 4.500v4.800h4.800"/>',
    search: '<circle cx="11" cy="11" r="6.500"/><path d="M16 16l4.500 4.500"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M5 7h14M10 7V4.500h4V7M7 7l.8 12.500h8.400L17 7"/>',
    check: '<path d="M5 12.500l4.500 4.500L19 7.500"/>',
    alert: '<path d="M12 4l9 16H3L12 4z"/><path d="M12 10v4.500M12 17.300v.01"/>',
    route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6.500a3 3 0 000-6h-5a3 3 0 010-6H16"/>',
    transfer: '<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
    mp: '<rect x="6.500" y="3" width="11" height="18" rx="2.800"/><path d="M10 17.500h4"/>',
    chev: '<path d="M9 5l7 7-7 7"/>',
    sparkle: '<path d="M12 4l1.600 4.400L18 10l-4.400 1.600L12 16l-1.600-4.400L6 10l4.400-1.600L12 4z"/>'
  };
  function ico(n, c) { return '<svg class="ico' + (c ? ' ' + c : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IC[n] + '</svg>'; }
  var PICO = { FW: 'cup', CP: 'cupfoam', CF: 'espresso', ML: 'croissant', TO: 'toast', TT: 'cake' };
  var MICO = { efectivo: 'caja', transferencia: 'transfer', mercadopago: 'mp' };

  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function signo(n) { return (n > 0 ? '+' : n < 0 ? '−' : '') + pesos(Math.abs(n)); }
  function miles(d) { return String(d).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function unid(n) { return n === 1 ? '1 unidad' : n + ' unidades'; }

  function nuevoUI() {
    return { vista: 'mostrador', cat: 'todo', q: '', guia: true, inicio: store.getState(), ultima: null, recibo: false, visto: { caja: true, stock: true, resumen: true },
             vistoImpacto: false, guiaMax: false, buscar: false, msg: '', flash: null, animarStock: false, sheet: false, cobro: null, fresh: false };
  }
  ui = nuevoUI();

  /* ───────── anuncios ───────── */
  var liveT;
  function anunciar(t) { var l = $('#live'); l.textContent = ''; clearTimeout(liveT); liveT = setTimeout(function () { l.textContent = t; }, 40); }

  /* ───────── piezas ───────── */
  var VISTAS = [['mostrador', 'Mostrador'], ['caja', 'Caja'], ['stock', 'Stock'], ['resumen', 'Resumen']];
  function railHTML() {
    return VISTAS.map(function (v) {
      var nuevo = v[0] !== 'mostrador' && !ui.visto[v[0]];
      return '<button type="button" class="nav' + (ui.vista === v[0] ? ' on' : '') + '" data-act="ir" data-v="' + v[0] + '" data-k="nav-' + v[0] + '"' + (ui.vista === v[0] ? ' aria-current="page"' : '') + '>' +
        ico(v[0]) + '<span>' + v[1] + '</span>' + (nuevo ? '<i class="dot" aria-hidden="true"></i><span class="sr-only"> (actualizada)</span>' : '') + '</button>';
    }).join('');
  }

  function guiaHTML() {
    var g = V.progresoGuia({ inicio: ui.inicio, actual: store.getState(), vistoImpacto: ui.vistoImpacto });
    var li = g.pasos.map(function (p, i) {
      return '<li class="' + (p.hecho ? 'done' : i === g.actual ? 'now' : '') + '"' + (i === g.actual ? ' aria-current="step"' : '') + '><span class="g-n">' + (p.hecho ? ico('check') : (i + 1)) + '</span><span class="g-x">' + esc(p.texto) +
        (p.hecho ? '<span class="sr-only"> (hecho)</span>' : '') + '</span></li>';
    }).join('');
    var paso = g.completa ? 'Recorrido completo' : 'Paso ' + (g.actual + 1) + ' de ' + g.pasos.length, cur = g.completa ? 'Probá otra venta o reiniciá el ejemplo' : g.pasos[g.actual].texto;
    return '<section class="guia' + (ui.guiaMax ? ' open' : '') + '" aria-label="Recorrido guiado"><div class="g-head"><span class="g-t">' + ico('route') + 'Probá una venta</span><span class="g-s">' +
      (g.completa ? 'Listo. Probá otra venta o reiniciá el ejemplo.' : 'Cuatro pasos, a tu ritmo. También podés vender lo que quieras.') + '</span>' +
      '<button type="button" class="g-toggle" data-act="guia-pasos" data-k="guia-pasos" aria-expanded="' + !!ui.guiaMax + '" aria-controls="g-lista">' + ico('route') + '<span class="g-cur"><b>' + paso + '</b><span>' + esc(cur) + '</span></span>' + ico('chev', 'g-chev') + '</button>' +
      '<button type="button" class="icon-btn sm" data-act="guia-cerrar" data-k="guia-x" aria-label="Ocultar el recorrido">' + ico('close') + '</button></div><ol class="g-steps" id="g-lista">' + li + '</ol></section>';
  }

  function tileHTML(p, ticket) {
    var enT = ticket.lineas.filter(function (l) { return l.producto === p.id; })[0], q = enT ? enT.cantidad : 0, st = V.estadoStock(p);
    var stTxt = p.controlaStock ? (st === 'agotado' ? 'Agotado' : V.alLimite(p, q) ? 'Todo el stock en el ticket' : st === 'minimo' ? 'Quedan ' + p.stock + ' · reponer' : 'Quedan ' + p.stock) : '';
    var stock = p.controlaStock ? '<span class="tile-stock s-' + st + '">' + stTxt + '</span>' : '';
    var f = ui.flash && ui.flash.p === p.id, lim = V.alLimite(p, q);
    return '<button type="button" class="tile' + (q ? ' en' : '') + (st === 'agotado' ? ' agot' : '') + (lim && st !== 'agotado' ? ' lim' : '') + (f ? ' pulse' : '') + '"' + (lim ? ' aria-disabled="true"' : '') + ' data-act="add" data-p="' + p.id + '" data-k="tile-' + p.id + '" aria-label="' + (q ? q + ' ' : '') +
      esc(p.nombre) + ' ' + pesos(p.precio) + (stTxt ? ' ' + stTxt : '') + (q ? '. Agregar otro al ticket' : '. Agregar al ticket') + (lim ? '. No se pueden agregar más: ya está todo el stock en el ticket' : '') + '">' +
      '<span class="tile-ico">' + ico(PICO[p.id] || 'cup') + '</span>' + (q ? '<span class="qty' + (f ? ' pop' : '') + '" aria-hidden="true">' + q + '</span> ' : '') +
      '<span class="tile-name">' + esc(p.nombre) + '</span> <span class="tile-price">' + pesos(p.precio) + '</span> ' + stock + '</button>';
  }

  function mostradorHTML(s) {
    var ticket = S.ticketAbierto(s), ps = V.productos(s, ui.cat, ui.q);
    var cats = V.CATEGORIAS.map(function (c) {
      return '<button type="button" class="chip' + (ui.cat === c.id ? ' on' : '') + '" data-act="cat" data-c="' + c.id + '" data-k="cat-' + c.id + '" aria-pressed="' + (ui.cat === c.id) + '">' + c.nombre + '</button>';
    }).join('');
    var grid = ps.length ? '<div class="grid">' + ps.map(function (p) { return tileHTML(p, ticket); }).join('') + '</div>' :
      '<div class="vacio">' + ico('search') + '<p><b>No encontramos «' + esc(ui.q) + '»</b>Probá con otro nombre o mirá todas las categorías.</p><button type="button" class="btn-sec" data-act="limpiar" data-k="limpiar">Ver todo</button></div>';
    return '<h1 class="v-title sr-only" id="vista-titulo">Mostrador</h1>' + (ui.guia ? guiaHTML() : '') +
      '<div class="cats" role="group" aria-label="Categorías">' + cats + '</div>' + grid;
  }

  function limiteLinea(s, l) { var p = S.catalogo(s).filter(function (x) { return x.id === l.producto; })[0]; return V.alLimite(p, l.cantidad); }
  function btnCobrar(s, t, k, cls) {
    var cb = V.cobrable(s), txt = t.vacio ? 'Cobrar' : 'Cobrar ' + pesos(t.total);
    return '<button type="button" class="btn-primary' + cls + '" data-act="cobrar" data-k="' + k + '"' + (t.vacio ? ' disabled' : !cb.ok ? ' aria-disabled="true"' : '') + '>' + txt + '</button>';
  }
  function ticketHTML(s, pre) {
    pre = pre || 't';
    if (ui.recibo && ui.ultima) return reciboHTML(pre);
    var t = S.ticketAbierto(s), lineas = t.lineas.map(function (l) {
      var flash = ui.flash && ui.flash.p === l.producto;
      return '<li class="tk-line' + (flash ? ' pulse' : '') + '"><div class="tk-r1"><b>' + esc(l.nombre) + '</b><span class="tk-sub">' + pesos(l.subtotal) + '</span></div>' +
        '<div class="tk-r2"><span class="tk-unit">' + pesos(l.precio) + ' c/u</span><div class="stepper" role="group" aria-label="Cantidad de ' + esc(l.nombre) + '">' +
        '<button type="button" class="st-b" data-act="menos" data-p="' + l.producto + '" data-k="' + pre + '-menos-' + l.producto + '" aria-label="' + (l.cantidad === 1 ? 'Quitar ' : 'Restar una unidad de ') + esc(l.nombre) + '">' + ico('minus') + '</button>' +
        '<output class="st-n" aria-label="' + l.cantidad + ' unidades">' + l.cantidad + '</output>' +
        '<button type="button" class="st-b" data-act="mas" data-p="' + l.producto + '" data-k="' + pre + '-mas-' + l.producto + '"' + (limiteLinea(s, l) ? ' aria-disabled="true"' : '') + ' aria-label="' + (limiteLinea(s, l) ? 'No hay más stock de ' : 'Sumar una unidad de ') + esc(l.nombre) + '">' + ico('plus') + '</button></div>' +
        '<button type="button" class="icon-btn" data-act="quitar" data-p="' + l.producto + '" data-k="' + pre + '-quitar-' + l.producto + '" aria-label="Quitar ' + esc(l.nombre) + ' del ticket">' + ico('trash') + '</button></div></li>';
    }).join('');
    var cuerpo = t.vacio ? '<div class="tk-vacio">' + ico('mostrador') + '<p><b>El ticket está vacío</b>Tocá un producto para empezar la venta.</p></div>' : '<ul class="tk-lines">' + lineas + '</ul>';
    return '<div class="tk-head"><h2>Ticket</h2><span class="tk-id">' + esc(t.id) + '</span></div>' + cuerpo +
      '<div class="tk-foot"><div class="tk-total"><span>Total</span><strong class="' + (ui.flash && ui.flash.total ? 'flash' : '') + '">' + pesos(t.total) + '</strong></div>' +
      '<p class="tk-msg' + (ui.msgAviso ? ' aviso' : '') + '">' + (ui.msg ? ico('alert') + esc(ui.msg) : '') + '</p>' + btnCobrar(s, t, pre + '-cobrar', ' xl') +
      (t.vacio ? '' : '<button type="button" class="link" data-act="vaciar" data-k="' + pre + '-vaciar">Vaciar ticket</button>') + '</div>';
  }

  /* «Lo que cambió»: sale de comparar dos estados reales, no de textos fijos. En el recibo cada fila lleva a su pantalla. */
  function cambiosHTML(c, pre) {
    var t = c.tickets[c.tickets.length - 1], filas = [], medio = V.MEDIOS[t.medio];
    if (t.medio === 'efectivo') filas.push(['caja', 'Caja', 'Efectivo esperado', pesos(c.efectivoEsperado.antes) + ' → ' + pesos(c.efectivoEsperado.ahora), '', signo(c.efectivoEsperado.delta), '']);
    else filas.push(['caja', 'Caja', medio, pesos(c.porMedio[t.medio].antes) + ' → ' + pesos(c.porMedio[t.medio].ahora), '', signo(c.porMedio[t.medio].delta), '']);
    c.stock.forEach(function (x) {
      filas.push(['stock', 'Stock', x.nombre, x.antes + ' → ' + x.ahora + ' u.', '', x.agotado ? 'agotado' : x.cruzoMinimo ? 'en el mínimo' : '', x.agotado || x.cruzoMinimo ? 'warn' : '']);
    });
    filas.push(['resumen', 'Resumen', 'Ventas del turno', pesos(c.ventas.antes) + ' → ' + pesos(c.ventas.ahora), 'Tickets ' + c.nTickets.antes + ' → ' + c.nTickets.ahora, signo(c.ventas.delta), '']);
    return '<ul class="cambios">' + filas.map(function (f, i) {
      var cuerpo = '<span class="cb-d"><span class="cb-top"><span class="cb-k k-' + f[0] + '">' + f[1] + '</span><span class="cb-t">' + esc(f[2]) + '</span></span><b>' + f[3] + '</b>' + (f[4] ? '<small>' + f[4] + '</small>' : '') + '</span>' +
        (f[5] ? '<em class="' + f[6] + '">' + f[5] + '</em>' : '<span></span>');
      return '<li style="--i:' + i + '">' + (pre ? '<button type="button" class="cb-row" data-act="ir" data-v="' + f[0] + '" data-k="' + pre + '-v' + i + '" aria-label="Ver ' + f[0] + ': ' + esc(f[2]) + ' ' + f[3] + '">' + cuerpo + ico('chev') + '</button>' : '<div class="cb-row">' + cuerpo + '</div>') + '</li>';
    }).join('') + '</ul>';
  }
  function reciboHTML(pre) {
    var u = ui.ultima, c = u.cambio, t = c.tickets[c.tickets.length - 1];
    var sub = [t.id, pesos(t.total), V.MEDIOS[t.medio]].concat(t.recibido != null ? ['vuelto ' + pesos(t.recibido - t.total)] : []).join(' · ');
    return '<div class="rc' + (ui.fresh ? ' fresh' : '') + '"><div class="rc-head"><div class="rc-check"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22"/><path d="M14 25l7 7 13-15"/></svg></div>' +
      '<div><h2 class="rc-title" id="rc-title-' + pre + '" tabindex="-1">Venta registrada</h2><p class="rc-sub">' + esc(sub) + '</p></div></div>' +
      '<h3 class="rc-h">Lo que cambió</h3>' + cambiosHTML(c, pre) +
      '<button type="button" class="btn-primary xl" data-act="nueva" data-k="' + pre + '-nueva">Nueva venta</button></div>';
  }
  function barraHTML(s) {
    var t = S.ticketAbierto(s);
    if (ui.recibo && ui.ultima) return '<button type="button" class="tb-main" data-act="sheet" data-k="tb-sheet"><span class="tb-ok">' + ico('check') + '</span><span><b>Venta registrada</b><small>Ver qué cambió</small></span></button>';
    if (t.vacio) return '<p class="tb-vacio">' + ico('mostrador') + 'Tocá un producto para empezar la venta.</p>';
    return (ui.msg ? '<p class="tb-msg' + (ui.msgAviso ? ' aviso' : '') + '">' + ico('alert') + esc(ui.msg) + '</p>' : '') + '<button type="button" class="tb-main" data-act="sheet" data-k="tb-sheet" aria-label="' + t.unidades + ' Ver ticket ' + pesos(t.total) + ', ' + (t.unidades === 1 ? 'producto' : 'productos') + ' en la venta"><span class="tb-n">' + t.unidades + '</span><span><b>Ver ticket</b><small>' + pesos(t.total) + '</small></span></button>' +
      btnCobrar(s, t, 'tb-cobrar', '');
  }

  /* ── Caja ── */
  function delta(d, etiqueta) { return d ? '<em class="dl' + (d < 0 ? ' neg' : '') + '">' + signo(d) + (etiqueta ? ' <small>' + etiqueta + '</small>' : '') + '</em>' : ''; }
  function cajaHTML(s) {
    var r = S.resumen(s), c = ui.ultima && ui.ultima.cambio, ult = S.ultimasVentas(s, 6);
    var sesion = s.tickets.length - ui.inicio.tickets.length;
    var medios = Object.keys(r.porMedio).map(function (m) {
      var pct = core.porcentaje(r.porMedio[m], r.ventas);
      return '<li><div class="md-top"><span class="md-n">' + ico(MICO[m]) + V.MEDIOS[m] + '</span><b>' + pesos(r.porMedio[m]) + '</b>' + (c ? delta(c.porMedio[m].delta) : '') + '</div>' +
        '<div class="bar" role="img" aria-label="' + pct + ' % de las ventas"><i style="width:' + pct + '%"></i></div><small>' + pct + ' % de las ventas</small></li>';
    }).join('');
    var movs = ult.map(function (u, i) {
      var nueva = i < sesion;
      return '<li class="' + (nueva ? 'nueva' : '') + '"><span class="mv-id">' + u.id + '</span><span class="mv-d">' + u.lineas.map(function (l) { return l.cantidad + ' × ' + esc(l.nombre); }).join(', ') + '<small>' + V.MEDIOS[u.medio] + '</small></span>' +
        (nueva ? '<span class="tag">Nueva</span>' : '') + '<b>' + pesos(u.total) + '</b></li>';
    }).join('');
    return '<h1 class="v-title" id="vista-titulo">Caja</h1>' +
      '<section class="cj-hero"><div><p class="eyebrow">Efectivo esperado en caja</p><p class="cj-big">' + pesos(r.efectivoEsperado) + (c ? delta(c.efectivoEsperado.delta, 'por la última venta') : '') + '</p></div>' +
      '<dl class="ledger"><div><dt>Fondo inicial</dt><dd>' + pesos(r.fondoCaja) + '</dd></div><div><dt><span class="op">+</span> Cobros en efectivo</dt><dd>' + pesos(r.porMedio.efectivo) + '</dd></div>' +
      '<div><dt><span class="op">−</span> Gastos en efectivo</dt><dd>' + pesos(r.gastosEfectivo) + '</dd></div><div class="sum"><dt>Efectivo esperado</dt><dd>' + pesos(r.efectivoEsperado) + '</dd></div></dl></section>' +
      '<div class="cj-cols"><section><h2 class="h2">Ventas por medio de pago <span class="h2-t">' + pesos(r.ventas) + (c ? delta(c.ventas.delta) : '') + '</span></h2><ul class="medios">' + medios + '</ul></section>' +
      '<section><h2 class="h2">Últimos movimientos</h2><ul class="movs">' + movs + '</ul></section></div>';
  }

  /* ── Stock ── */
  function stockHTML(s) {
    var cat = S.catalogo(s).filter(function (p) { return p.controlaStock; }), c = ui.ultima && ui.ultima.cambio, al = S.alertas(s);
    var avisos = al.map(function (a) {
      return '<div class="aviso-st' + (a.agotado ? ' agot' : '') + '">' + ico('alert') + '<p><b>' + esc(a.nombre) + (a.agotado ? ' se agotó' : ' llegó al mínimo') + '</b>' + (a.agotado ? 'No quedan unidades. Conviene reponer.' : 'Quedan ' + a.stock + ' (mínimo ' + a.minimo + '). Conviene reponer.') + '</p></div>';
    }).join('');
    var items = cat.map(function (p) {
      var ap = s.config.stockApertura[p.id], pct = core.porcentaje(p.stock, ap), pm = core.porcentaje(p.minimo, ap), st = V.estadoStock(p);
      var ch = c && c.stock.filter(function (x) { return x.producto === p.id; })[0];
      var desde = ch ? core.porcentaje(ch.antes, ap) : pct;
      return '<article class="st-item s-' + st + '"><div class="st-id"><h3>' + esc(p.nombre) + '</h3><p class="st-meta">Abrió el turno con ' + ap + ' · mínimo ' + p.minimo + '</p></div>' +
        '<div class="st-q"><strong>' + p.stock + '</strong><span>' + (p.stock === 1 ? 'unidad' : 'unidades') + '</span>' + (ch ? '<em class="dl neg">' + ch.delta + ' <small>última venta</small></em>' : '') + '</div>' +
        '<div class="gauge" role="img" aria-label="Quedan ' + p.stock + ' de ' + ap + ' al abrir. Mínimo ' + p.minimo + '."><i class="g-fill" style="--w:' + (ui.animarStock && ch ? desde : pct) + '%" data-to="' + pct + '"></i><b class="g-min" style="left:' + pm + '%" aria-hidden="true"></b></div>' +
        '<span class="st-chip s-' + st + '">' + (st === 'agotado' ? 'Agotado' : st === 'minimo' ? 'En el mínimo' : 'En orden') + '</span></article>';
    }).join('');
    return '<h1 class="v-title" id="vista-titulo">Stock</h1><p class="v-sub">Cada venta cobrada descuenta lo que se vendió. Al llegar al mínimo, el producto queda marcado para reponer.</p>' + avisos +
      '<div class="st-list">' + items + '</div><p class="nota">Las bebidas se preparan al momento y no descuentan stock.</p>';
  }

  /* ── Resumen ── */
  function resumenHTML(s) {
    var r = S.resumen(s), c = ui.ultima && ui.ultima.cambio, rk = V.ranking(s, 5), tot = r.ventas || 1;
    var rank = rk.map(function (x, i) { return '<li><span class="rk-n">' + (i + 1) + '</span><span class="rk-d">' + esc(x.nombre) + '</span><span class="rk-bar"><i style="width:' + x.pct + '%"></i></span><b>' + unid(x.unidades) + '</b></li>'; }).join('');
    var seg = Object.keys(r.porMedio).map(function (m) { return '<i class="m-' + m + '" style="flex-grow:' + r.porMedio[m] + '" title="' + V.MEDIOS[m] + '"></i>'; }).join('');
    var leyenda = Object.keys(r.porMedio).map(function (m) { return '<li><i class="m-' + m + '"></i>' + V.MEDIOS[m] + ' <b>' + pesos(r.porMedio[m]) + '</b></li>'; }).join('');
    var al = r.alertas.length ? '<ul class="al-list">' + r.alertas.map(function (a) { return '<li>' + ico('alert') + '<span><b>' + esc(a.nombre) + '</b> ' + (a.agotado ? 'se agotó' : 'está en el mínimo: quedan ' + a.stock) + '</span></li>'; }).join('') + '</ul>' +
      '<button type="button" class="link" data-act="ir" data-v="stock" data-k="rs-vs">Ver stock</button>' : '<p class="muted">Sin alertas de stock.</p>';
    var ult = c && c.hayVenta ? '<section class="rs-ult"><h2 class="h2">Última venta registrada</h2><p class="muted">' + esc(c.tickets[c.tickets.length - 1].id) + ' · ' + pesos(c.tickets[c.tickets.length - 1].total) + ' · ' + V.MEDIOS[c.tickets[c.tickets.length - 1].medio] + '</p>' + cambiosHTML(c, null) + '</section>' :
      '<section class="rs-ult"><h2 class="h2">Última venta registrada</h2><p class="muted">Todavía no registraste ninguna. Cuando lo hagas, acá vas a ver qué cambió.</p></section>';
    return '<h1 class="v-title" id="vista-titulo">Resumen del turno</h1>' +
      '<div class="rs-top"><section class="rs-main"><p class="eyebrow">Ventas del turno</p><p class="rs-big">' + pesos(r.ventas) + (c ? delta(c.ventas.delta) : '') + '</p></section>' +
      '<section class="rs-kpi"><p class="eyebrow">Tickets</p><p class="rs-n">' + r.tickets + (c ? delta2(c.nTickets.delta) : '') + '</p></section>' +
      '<section class="rs-kpi"><p class="eyebrow">Ticket promedio</p><p class="rs-n">' + pesos(r.ticketPromedio) + (c ? delta(c.promedio.delta) : '') + '</p></section></div>' +
      '<div class="rs-cols"><section><h2 class="h2">Lo más vendido</h2><ol class="rank">' + rank + '</ol></section>' +
      '<section><h2 class="h2">Medios de pago</h2><div class="stack" role="img" aria-label="Ventas por medio de pago">' + seg + '</div><ul class="leyenda">' + leyenda + '</ul>' +
      '<h2 class="h2 sp">Alertas de stock</h2>' + al + '</section></div>' + ult;
  }
  function delta2(d) { return d ? '<em class="dl">+' + d + '</em>' : ''; }

  /* ───────── render ───────── */
  function vistaHTML(s) { return ({ mostrador: mostradorHTML, caja: cajaHTML, stock: stockHTML, resumen: resumenHTML })[ui.vista](s); }

  var cache = {};
  function region(el, clave, html) { if (cache[clave] !== html) { el.innerHTML = html; cache[clave] = html; return true; } return false; }

  function render(o) {
    o = o || {};
    var s = store.getState(), act = document.activeElement, key = act && act.getAttribute ? act.getAttribute('data-k') : null;
    var v = $('#vista'), tk = $('#ticket'), top = v.scrollTop, tkTop = $('.tk-lines', tk) ? $('.tk-lines', tk).scrollTop : 0;
    $('#app').setAttribute('data-vista', ui.vista);
    region($('#rail'), 'rail', railHTML());
    if (o.vistaNueva) cache.vista = null;
    if (region(v, 'vista', vistaHTML(s))) v.scrollTop = o.vistaNueva ? 0 : top;
    if (o.vistaNueva) { v.classList.remove('enter'); void v.offsetWidth; v.classList.add('enter'); }
    if (region(tk, 'ticket', ticketHTML(s, 't')) && $('.tk-lines', tk)) $('.tk-lines', tk).scrollTop = tkTop;
    region($('#ticketbar'), 'barra', barraHTML(s));
    $('#btn-guia').hidden = ui.guia || ui.vista !== 'mostrador';
    $('#buscador').hidden = ui.vista !== 'mostrador'; $('#buscador').classList.toggle('abierta', !!(ui.buscar || ui.q));
    $('#btn-buscar').hidden = ui.vista !== 'mostrador'; $('#btn-buscar').setAttribute('aria-expanded', String(!!(ui.buscar || ui.q)));
    if (ui.sheet) { var sb = $('#dlg-ticket .sh-body'); if (sb) sb.innerHTML = ticketHTML(s, 's'); }
    if (key && !o.sinFoco) { var n = document.querySelector('[data-k="' + key + '"]'); if (n && n !== document.activeElement) n.focus({ preventScroll: true }); }
    if (o.foco) { var f = $(o.foco); if (f) f.focus({ preventScroll: true }); }
    if (ui.animarStock) { ui.animarStock = false; requestAnimationFrame(function () { requestAnimationFrame(function () { document.querySelectorAll('.g-fill[data-to]').forEach(function (g) { g.style.setProperty('--w', g.getAttribute('data-to') + '%'); }); }); }); }
    ui.flash = null; ui.fresh = false;
  }

  function armarMarco() {
    $('#app').innerHTML =
      '<header class="topbar"><div class="brand"><span class="brand-g">' + ico('cup') + '</span><div><b>Café Nogal</b><small><i class="on" aria-hidden="true"></i>Turno abierto</small></div></div>' +
      '<form class="buscador" id="buscador" role="search" onsubmit="return false"><label class="sr-only" for="q">Buscar un producto</label>' + ico('search') + '<input id="q" type="search" placeholder="Buscar producto" autocomplete="off" enterkeyhint="search"></form>' +
      '<div class="top-act"><button type="button" class="btn-sec sm btn-buscar" id="btn-buscar" data-act="buscar" data-k="buscar" aria-expanded="false" aria-label="Buscar un producto">' + ico('search') + '</button>' +
      '<button type="button" class="btn-sec sm" id="btn-guia" data-act="guia-abrir" data-k="guia-abrir" aria-label="Mostrar el recorrido guiado" hidden>' + ico('route') + '<span>Recorrido</span></button>' +
      '<button type="button" class="btn-sec sm" data-act="reiniciar" data-k="reiniciar" aria-label="Reiniciar el ejemplo: vuelve a los datos originales">' + ico('reset') + '<span>Reiniciar</span></button></div></header>' +
      '<nav class="rail" id="rail" aria-label="Secciones"></nav><main class="view" id="vista" tabindex="-1" aria-labelledby="vista-titulo"></main>' +
      '<aside class="ticket" id="ticket" aria-label="Ticket de la venta"></aside><div class="ticketbar" id="ticketbar"></div>';
  }

  /* ───────── acciones ───────── */
  function error(r, ctx) { var m = V.mensajeError(r.error, ctx); ui.msg = m; ui.msgAviso = r.error.code === 'sin-stock' && !!ctx && ctx.enTicket >= r.error.disponible; anunciar(m); }
  function hacer(accion, payload, okMsg) {
    var r = store.dispatch(accion, payload);
    if (!r.ok) { error(r, { enTicket: payload && payload.producto ? enTicket(store.getState(), payload.producto) : 0 }); return r; }
    ui.msg = ''; ui.recibo = false; if (okMsg) anunciar(okMsg(r.state)); return r;
  }
  function nombreDe(p) { return S.catalogo(store.getState()).filter(function (x) { return x.id === p; })[0].nombre; }
  function enTicket(s, p) { var l = S.ticketAbierto(s).lineas.filter(function (x) { return x.producto === p; })[0]; return l ? l.cantidad : 0; }
  function resumenTicket(s) { return 'Total ' + pesos(S.ticketAbierto(s).total) + '.'; }

  function ir(v, desdeRail) {
    ui.vista = v; if (v !== 'mostrador') { ui.visto[v] = true; if (ui.ultima) ui.vistoImpacto = true; }
    ui.sheet = false; if ($('#dlg-ticket').open) $('#dlg-ticket').close();
    var tit = VISTAS.filter(function (x) { return x[0] === v; })[0][1];
    render({ vistaNueva: true, foco: desdeRail ? null : '#vista', sinFoco: !desdeRail }); anunciar(tit);
    if (ui.animarStock === false && v === 'stock') { /* las barras ya salieron con su valor final */ }
  }

  function abrirCobro() {
    var s = store.getState(), t = S.ticketAbierto(s);
    var cb = V.cobrable(s); if (!cb.ok) { error({ error: cb.error }); render(); return; }
    ui.cobro = { medio: 'efectivo', recibido: '' };
    var d = $('#dlg-cobro'); d.innerHTML = cobroHTML(s, t); open(d); simular();
  }
  function open(d) { if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', ''); }
  function cerrar(d) { if (typeof d.close === 'function') d.close(); else d.removeAttribute('open'); }

  function cobroHTML(s, t) {
    var rapidos = V.importesRapidos(t.total);
    var medios = ['efectivo', 'transferencia', 'mercadopago'].map(function (m) {
      return '<label class="medio"><input type="radio" name="medio" value="' + m + '"' + (m === ui.cobro.medio ? ' checked autofocus' : '') + '><span class="medio-in">' + ico(MICO[m]) + '<b>' + V.MEDIOS[m] + '</b></span></label>';
    }).join('');
    return '<form id="f-cobro" novalidate><header class="dl-h"><h2 id="cobro-titulo">Cobrar ticket ' + esc(t.id) + '</h2><button type="button" class="icon-btn" data-act="cerrar-cobro" aria-label="Cerrar sin cobrar">' + ico('close') + '</button></header>' +
      '<p class="cb-res">' + t.lineas.map(function (l) { return l.cantidad + ' × ' + esc(l.nombre); }).join(' · ') + '</p>' +
      '<div class="cb-total"><span>Total a cobrar</span><strong>' + pesos(t.total) + '</strong></div>' +
      '<fieldset class="cb-medios"><legend>Medio de pago</legend><div class="medios-g">' + medios + '</div></fieldset>' +
      '<div class="cb-efe" id="cb-efe"><label for="recibido">Recibido en efectivo <small>(opcional)</small></label>' +
      '<div class="money-in"><span aria-hidden="true">$</span><input id="recibido" inputmode="numeric" autocomplete="off" maxlength="11" placeholder="0" aria-describedby="cb-estado"></div>' +
      '<div class="chips" role="group" aria-label="Importes sugeridos">' + rapidos.map(function (x, i) { return '<button type="button" class="chip" data-act="sug" data-v="' + x + '">' + (i === 0 ? 'Justo ' : '') + pesos(x) + '</button>'; }).join('') + '</div></div>' +
      '<p class="cb-estado" id="cb-estado" role="status" aria-live="polite"></p>' +
      '<footer class="dl-f"><button type="button" class="btn-sec" data-act="cerrar-cobro">Cancelar</button><button type="submit" class="btn-primary" id="confirmar">Confirmar ' + pesos(t.total) + '</button></footer></form>';
  }
  // Valida SIN cobrar, con la misma acción de F1 (dry-run): la interfaz no repite ninguna regla.
  function simular() {
    var c = ui.cobro, s = store.getState(), t = S.ticketAbierto(s), e = $('#cb-estado'), efe = $('#cb-efe');
    if (!e) return null;
    efe.hidden = c.medio !== 'efectivo';
    var p = { ticketId: t.id, medio: c.medio }; if (c.medio === 'efectivo' && c.recibido !== '') p.recibido = Number(c.recibido);
    var r = cafe.acciones.cobrar(s, p);
    var malo = !!(r.error && (c.medio !== 'efectivo' || c.recibido !== '' || r.error.code !== 'efectivo-insuficiente')), bt = $('#confirmar'), inp = $('#recibido');
    bt.setAttribute('aria-disabled', String(malo)); if (inp) inp.setAttribute('aria-invalid', String(!!(r.error && c.recibido !== '' && c.medio === 'efectivo')));
    if (c.medio !== 'efectivo') { e.className = 'cb-estado'; e.textContent = 'Se registra el cobro en ' + V.MEDIOS[c.medio] + '. No se procesa ningún pago real.'; }
    else if (c.recibido === '') { e.className = 'cb-estado'; e.textContent = 'Anotá lo recibido y te calculamos el vuelto.'; }
    else if (r.error) { e.className = 'cb-estado err'; e.textContent = V.mensajeError(r.error); }
    else { e.className = 'cb-estado ok'; e.textContent = r.resultado.vuelto === 0 ? 'Justo, sin vuelto.' : 'Vuelto ' + pesos(r.resultado.vuelto); }
    return r;
  }
  function confirmarCobro() {
    var chk = simular(); if (chk && chk.error) { if ($('#recibido') && !$('#cb-efe').hidden) $('#recibido').focus(); return; }   // inválido: no se ejecuta; queda el mensaje que explica qué corregir
    var c = ui.cobro, antes = store.getState(), t = S.ticketAbierto(antes);
    var p = { ticketId: t.id, medio: c.medio }; if (c.medio === 'efectivo' && c.recibido !== '') p.recibido = Number(c.recibido);
    var r = store.dispatch('cobrar', p);
    if (!r.ok) { var e = $('#cb-estado'); e.className = 'cb-estado err'; e.textContent = V.mensajeError(r.error); if ($('#recibido')) $('#recibido').focus(); return; }
    var cambio = V.cambio(antes, r.state);
    ui.ultima = { antes: antes, ahora: r.state, resultado: r.resultado, cambio: cambio }; ui.recibo = true; ui.msg = ''; ui.vistoImpacto = false;
    ui.visto = { caja: false, stock: cambio.stock.length === 0, resumen: false }; ui.animarStock = true; ui.flash = { total: false }; ui.fresh = true; cache.ticket = null;
    cerrar($('#dlg-cobro')); if ($('#dlg-ticket').open) { ui.sheet = true; }
    var panel = getComputedStyle($('#ticket')).display !== 'none' && ui.vista === 'mostrador';
    render({ sinFoco: true, foco: panel ? '#rc-title-t' : '[data-k="tb-sheet"]' });
    var ult = cambio.tickets[cambio.tickets.length - 1];
    anunciar('Venta ' + ult.id + ' registrada por ' + pesos(ult.total) + '. Caja, stock y resumen actualizados.');
  }

  function onClick(ev) {
    var b = ev.target.closest('[data-act]'); if (!b) return;
    var a = b.getAttribute('data-act'), p = b.getAttribute('data-p'), s;
    switch (a) {
      case 'ir': ir(b.getAttribute('data-v'), !!b.closest('#rail')); break;
      case 'cat': ui.cat = b.getAttribute('data-c'); render(); break;
      case 'limpiar': ui.q = ''; ui.cat = 'todo'; $('#q').value = ''; render(); break;
      case 'add':
        if (hacer('agregarProducto', { producto: p }, function (st) { return nombreDe(p) + ' agregado. En el ticket: ' + enTicket(st, p) + '. ' + resumenTicket(st); }).ok) { ui.flash = { p: p, total: true }; }
        render(); break;
      case 'mas':
        if (hacer('agregarProducto', { producto: p }, function (st) { return nombreDe(p) + ': ' + enTicket(st, p) + '. ' + resumenTicket(st); }).ok) ui.flash = { p: p, total: true };
        render(); break;
      case 'menos':
        s = store.getState(); var q = enTicket(s, p);
        hacer(q > 1 ? 'cambiarCantidad' : 'quitarProducto', q > 1 ? { producto: p, cantidad: q - 1 } : { producto: p }, function (st) { return nombreDe(p) + (q > 1 ? ': ' + (q - 1) + '. ' : ' quitado. ') + resumenTicket(st); });
        ui.flash = { total: true }; render(); break;
      case 'quitar': hacer('quitarProducto', { producto: p }, function (st) { return nombreDe(p) + ' quitado. ' + resumenTicket(st); }); ui.flash = { total: true }; render(); break;
      case 'vaciar': hacer('vaciarTicket', {}, function () { return 'Ticket vaciado.'; }); render(); break;
      case 'cobrar': if ($('#dlg-ticket').open) { ui.sheet = false; cerrar($('#dlg-ticket')); } abrirCobro(); break;
      case 'nueva': ui.recibo = false; ui.msg = ''; render({ sinFoco: true, foco: '[data-k="t-vaciar"], .tile' }); anunciar('Nueva venta. Ticket vacío.'); break;
      case 'sheet': ui.sheet = true; var d = $('#dlg-ticket'); d.innerHTML = '<div class="sh-h"><span class="sh-grip" aria-hidden="true"></span><button type="button" class="icon-btn" data-act="cerrar-sheet" aria-label="Cerrar el ticket">' + ico('close') + '</button></div><div class="sh-body"></div>'; open(d); render(); break;
      case 'cerrar-sheet': ui.sheet = false; cerrar($('#dlg-ticket')); break;
      case 'cerrar-cobro': cerrar($('#dlg-cobro')); break;
      case 'sug': ui.cobro.recibido = b.getAttribute('data-v'); $('#recibido').value = miles(ui.cobro.recibido); simular(); break;
      case 'buscar': ui.buscar = !ui.buscar; render({ sinFoco: true }); if (ui.buscar) $('#q').focus(); break;
      case 'guia-pasos': ui.guiaMax = !ui.guiaMax; render(); break;
      case 'guia-cerrar': ui.guia = false; render({ sinFoco: true, foco: '#btn-guia' }); anunciar('Recorrido oculto. Podés volver a mostrarlo con el botón Recorrido.'); break;
      case 'guia-abrir': ui.guia = true; ui.guiaMax = true; render({ sinFoco: true, foco: '[data-k="guia-x"]' }); break;
      case 'reiniciar':
        store.reset(); ui = nuevoUI(); cache = {}; $('#q').value = ''; cerrar($('#dlg-cobro')); cerrar($('#dlg-ticket')); render({ vistaNueva: true });
        anunciar('Reiniciado. Volvimos a los datos originales.'); break;
    }
  }

  document.addEventListener('click', onClick);
  document.addEventListener('input', function (ev) {
    var t = ev.target;
    if (t.id === 'q') { ui.q = t.value; var s = store.getState(), top = $('#vista').scrollTop; region($('#vista'), 'vista', vistaHTML(s)); $('#vista').scrollTop = top; }
    else if (t.id === 'recibido') { var d = t.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 8); ui.cobro.recibido = d; t.value = d ? miles(d) : ''; simular(); }
  });
  document.addEventListener('change', function (ev) {
    if (ev.target.name === 'medio') { ui.cobro.medio = ev.target.value; if (ui.cobro.medio !== 'efectivo') ui.cobro.recibido = ''; if ($('#recibido')) $('#recibido').value = ''; simular(); }
  });
  document.addEventListener('submit', function (ev) { if (ev.target.id === 'f-cobro') { ev.preventDefault(); confirmarCobro(); } });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' && ev.target.name === 'medio') ev.preventDefault(); });   // Enter en el medio de pago no debe confirmar el cobro
  $('#dlg-cobro').addEventListener('close', function () { ui.cobro = null; });
  $('#dlg-ticket').addEventListener('close', function () { ui.sheet = false; });
  window.addEventListener('resize', function () { var d = $('#dlg-ticket'); if (d.open && getComputedStyle($('#ticketbar')).display === 'none') { ui.sheet = false; cerrar(d); } });

  /* Aclaración sobre el ejemplo: con marco queda al pie; sin marco se abre desde «Ejemplo ilustrativo» y se cierra con Esc o tocando afuera. */
  (function () {
    var b = $('#sbx-info'), av = $('#sbx-aviso');
    function set(v) { av.classList.toggle('open', v); b.setAttribute('aria-expanded', String(v)); }
    b.addEventListener('click', function () { set(!av.classList.contains('open')); });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && av.classList.contains('open')) { set(false); b.focus(); } });
    document.addEventListener('click', function (ev) { if (av.classList.contains('open') && !ev.target.closest('#sbx-info, #sbx-aviso')) set(false); });
  })();

  armarMarco(); render({ sinFoco: true });
})();
