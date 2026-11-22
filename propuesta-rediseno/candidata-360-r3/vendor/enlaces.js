/* Enlaces de una invitación digital Growi: confirmación simple por WhatsApp y enlace a mapas.
   Funciones puras, sin dependencias, sin red y sin almacenamiento: solo construyen texto y direcciones.
   Nada se envía ni se registra: la persona decide abrir WhatsApp, revisa el mensaje y lo envía por su cuenta.
   El mismo archivo lo usa el navegador (window.GrowiEnlaces) y las pruebas de Node (module.exports). */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; else root.GrowiEnlaces = api;
})(this, function () {
  'use strict';

  // Quita caracteres de control o invisibles, junta espacios y limita el largo
  function limpiar(t, max) {
    return String(t == null ? '' : t).replace(/[\u0000-\u001f\u007f​-‏‪-‮⁦-⁩﻿]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max || 120);
  }

  // Número de WhatsApp en formato internacional sin «+» (10 a 15 dígitos). Si no es válido, no hay destinatario.
  function telefono(raw) {
    var d = String(raw == null ? '' : raw).replace(/[\s().+-]/g, '');
    return /^\d{10,15}$/.test(d) ? d : null;
  }

  // Mensaje que el invitado revisa, completa y envía. El evento va entre comillas para no depender de artículos ni géneros.
  function mensajeConfirmacion(o) {
    var evento = limpiar(o && o.evento, 100), fecha = limpiar(o && o.fecha, 60);
    return 'Hola! Te escribo por la invitación a «' + evento + '»' + (fecha ? ' (' + fecha + ')' : '') + '.\n\n' +
      'Mi respuesta (borrá lo que no corresponda): voy / no puedo ir\n' +
      'Nombre y apellido:\n' +
      'Cantidad de personas:';
  }

  // Enlace a WhatsApp dirigido al organizador, con el mensaje precargado. Sin destinatario válido no se arma ningún enlace.
  function whatsappConfirmacion(o) {
    var tel = telefono(o && o.telefono);
    if (!tel) return { ok: false, motivo: 'sin-destinatario' };
    if (!limpiar(o && o.evento, 100)) return { ok: false, motivo: 'sin-evento' };
    var msg = mensajeConfirmacion(o);
    try { return { ok: true, url: 'https://wa.me/' + tel + '?text=' + encodeURIComponent(msg), mensaje: msg, telefono: tel }; }
    catch (e) { return { ok: false, motivo: 'texto-invalido' }; }   // p. ej. un carácter suelto que no se puede codificar
  }

  // Enlace de búsqueda en Google Maps para una dirección. No usa geolocalización ni navegación integrada.
  function mapa(o) {
    var q = limpiar(o && o.direccion, 200);
    if (!q) return { ok: false, motivo: 'sin-direccion' };
    try { return { ok: true, url: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q) }; }
    catch (e) { return { ok: false, motivo: 'texto-invalido' }; }
  }

  return { telefono: telefono, mensajeConfirmacion: mensajeConfirmacion, whatsappConfirmacion: whatsappConfirmacion, mapa: mapa };
});
