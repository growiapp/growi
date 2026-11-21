/* Growi · sandbox · datos ficticios de Cafetería (semilla reproducible).
   Todo es inventado: negocio, productos y ventas. No hay totales escritos: ventas, caja, stock y promedios se derivan de los tickets.
   stockApertura es el inventario ANTERIOR a los 20 tickets históricos; el stock actual es apertura − unidades vendidas. */
(function (root, datos) {
  if (typeof module === 'object' && module.exports) module.exports = datos;
  else { root.GrowiSandbox = root.GrowiSandbox || {}; root.GrowiSandbox.cafeteriaDatos = datos; }
})(this, {
  negocio: "Café Nogal",
  moneda: "ARS",
  productos: [
    {"id":"FW","nombre":"Flat white","precio":3900,"stock":false},
    {"id":"CP","nombre":"Cappuccino","precio":4200,"stock":false},
    {"id":"CF","nombre":"Café","precio":2800,"stock":false},
    {"id":"ML","nombre":"Medialuna","precio":1700,"stock":true},
    {"id":"TO","nombre":"Tostado J&Q","precio":6500,"stock":true},
    {"id":"TT","nombre":"Porción de torta","precio":4800,"stock":true}
  ],
  medios: ["efectivo","transferencia","mercadopago"],
  stockApertura: {"ML":31,"TO":10,"TT":12},
  stockMinimo: {"ML":12,"TO":4,"TT":3},
  fondoCaja: 20000,
  gastos: [
    {"id":"G1","concepto":"Compra de insumos","monto":6500,"medio":"efectivo"}
  ],
  tickets: [
    {"id":"T01","medio":"efectivo","lineas":[["FW",1],["ML",1]]},
    {"id":"T02","medio":"efectivo","lineas":[["FW",1],["ML",1]]},
    {"id":"T03","medio":"efectivo","lineas":[["FW",2]]},
    {"id":"T04","medio":"efectivo","lineas":[["CF",1],["ML",2]]},
    {"id":"T05","medio":"efectivo","lineas":[["CP",1],["ML",1]]},
    {"id":"T06","medio":"efectivo","lineas":[["TT",1],["CF",1]]},
    {"id":"T07","medio":"efectivo","lineas":[["CF",1]]},
    {"id":"T08","medio":"efectivo","lineas":[["ML",3],["CP",1]]},
    {"id":"T09","medio":"efectivo","lineas":[["TO",1],["FW",1]]},
    {"id":"T10","medio":"transferencia","lineas":[["CP",2],["TT",1]]},
    {"id":"T11","medio":"transferencia","lineas":[["CF",1],["ML",2]]},
    {"id":"T12","medio":"transferencia","lineas":[["FW",2]]},
    {"id":"T13","medio":"transferencia","lineas":[["CF",1],["ML",2]]},
    {"id":"T14","medio":"transferencia","lineas":[["ML",3],["CP",1]]},
    {"id":"T15","medio":"transferencia","lineas":[["FW",1],["ML",1]]},
    {"id":"T16","medio":"mercadopago","lineas":[["TT",1],["CF",1]]},
    {"id":"T17","medio":"mercadopago","lineas":[["TT",1],["CF",1]]},
    {"id":"T18","medio":"mercadopago","lineas":[["CF",1],["ML",2]]},
    {"id":"T19","medio":"mercadopago","lineas":[["FW",1]]},
    {"id":"T20","medio":"mercadopago","lineas":[["TT",1],["CF",1]]}
  ],
  ventaGuia: {"id":"T21","medio":"efectivo","recibido":10000,"lineas":[["FW",2],["ML",1]]}
});
