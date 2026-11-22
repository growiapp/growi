/* Growi · sandbox · datos ficticios de Peluquería (semilla reproducible).
   Todo es inventado: salón, profesionales, clientas y turnos. Horas en HH:MM; el reloj simulado arranca a las 10:30.
   El monto de un cobro no se guarda: se deriva de los servicios del turno. */
(function (root, datos) {
  if (typeof module === 'object' && module.exports) module.exports = datos;
  else { root.GrowiSandbox = root.GrowiSandbox || {}; root.GrowiSandbox.peluqueriaDatos = datos; }
})(this, {
  negocio: "Estudio Bruma",
  reloj: "10:30",
  jornada: {"apertura":"09:00","cierre":"19:00","paso":15},
  servicios: [
    {"id":"corte","nombre":"Corte","min":45,"precio":12000},
    {"id":"brushing","nombre":"Brushing","min":30,"precio":8500},
    {"id":"colorRaiz","nombre":"Color raíz","min":90,"precio":26000},
    {"id":"barba","nombre":"Barba","min":30,"precio":6000},
    {"id":"balayage","nombre":"Balayage","min":180,"precio":52000}
  ],
  profesionales: [
    {"id":"camila","nombre":"Camila","hace":["corte","colorRaiz","balayage","brushing"]},
    {"id":"nico","nombre":"Nico","hace":["corte","barba"]},
    {"id":"vero","nombre":"Vero","hace":["brushing","colorRaiz","corte"]}
  ],
  medios: ["efectivo","transferencia","mercadopago"],
  clientas: ["Paula R.","Martín G.","Ana C.","Romina S.","Esteban L.","Sofía T."],
  bloqueos: [
    {"id":"B1","profesional":"vero","inicio":"13:30","fin":"14:30","motivo":"Almuerzo"}
  ],
  turnos: [
    {"id":"t1","profesional":"camila","inicio":"09:00","servicios":["colorRaiz"],"cliente":"Paula R.","reserva":"confirmado","atencion":{"inicioReal":"09:00","finReal":"10:30"},"cobro":{"medio":"transferencia"}},
    {"id":"t2","profesional":"nico","inicio":"09:30","servicios":["corte"],"cliente":"Martín G.","reserva":"confirmado","atencion":{"inicioReal":"09:30","finReal":"10:15"},"cobro":{"medio":"efectivo"}},
    {"id":"t3","profesional":"vero","inicio":"10:00","servicios":["brushing"],"cliente":"Ana C.","reserva":"confirmado","atencion":{"inicioReal":"10:00","finReal":"10:30"},"cobro":{"medio":"efectivo"}},
    {"id":"t4","profesional":"camila","inicio":"13:00","servicios":["balayage"],"cliente":"Romina S.","reserva":"confirmado","atencion":null,"cobro":null},
    {"id":"t5","profesional":"nico","inicio":"12:30","servicios":["barba"],"cliente":"Esteban L.","reserva":"confirmado","atencion":null,"cobro":null},
    {"id":"t6","profesional":"vero","inicio":"12:00","servicios":["colorRaiz"],"cliente":"Sofía T.","reserva":"confirmado","atencion":null,"cobro":null}
  ],
  operacionGuia: {"cliente":"Julia Pereyra","servicios":["corte","brushing"],"desde":"11:00","profesional":"camila","inicio":"11:00","medio":"efectivo"}
});
