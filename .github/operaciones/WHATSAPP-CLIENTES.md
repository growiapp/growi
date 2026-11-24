# WhatsApp real para clientes: alcance pendiente (no implementado)

Registro de alcance. **No se implementa en esta fase.**

## Lo que existe hoy: demo narrativa
- La experiencia de Invitaciones (`/invitaciones/`) es una **muestra con datos ficticios** (casamiento de «Lucía y Tomás», cumpleaños de «Mica», jornada de empresa).
- El módulo (`assets/invitaciones/inv-core.js`) solo **prepara** el mensaje: valida el nombre y la respuesta, arma el texto y lo muestra en una vista previa. Sin DOM, sin red, sin almacenamiento. El botón «Enviar» está deshabilitado («no disponible en la vista previa») y la pantalla dice «no se envía nada».
- No hay número de teléfono de ningún cliente en el código, ni enlaces `wa.me` en la invitación, ni backend. Las pruebas (66/66 de privacidad) comprueban 0 pedidos a WhatsApp y 0 datos del RSVP en la red.
- El único WhatsApp real del sitio es el contacto comercial de Growi (botón «Consultar» / enlaces `wa.me` hacia el número de Growi). No es el flujo de invitados.

## Lo que sería el funcionamiento comercial (pendiente)
Invitación a medida de un cliente real, donde el invitado confirma y la respuesta llega al organizador. Hay que definir y construir:
1. **Datos por evento:** número del organizador (formato internacional), nombres, fecha, lugar, programa, textos, tratamiento (vos / ustedes). Hoy son constantes del módulo de muestra.
2. **Mecanismo de envío (decisión comercial y de costos):**
   - **A. Enlace `wa.me` con el texto armado:** el invitado toca «Enviar» y WhatsApp se abre en su teléfono con el mensaje listo; lo envía él. No requiere backend ni cuenta de empresa; no hay confirmación de entrega ni registro central.
   - **B. WhatsApp Business API:** envío y recepción automatizados, panel de respuestas. Requiere cuenta verificada, plantillas aprobadas por Meta, costos por conversación, consentimiento (opt-in) y un backend. Es un cambio de arquitectura.
3. **Privacidad y datos:** con A, el nombre y la respuesta viajan solo cuando la persona decide enviar el mensaje; con B pasan por un servidor y requieren política de datos, retención y consentimiento. Habrá que revisar `/privacidad/` (no se auditó en esta fase) antes de operar con datos de invitados reales.
4. **Estados reales:** cantidad de personas, cambio de respuesta, mensaje no enviado, enlace caducado; y qué ve el organizador.
5. **Pruebas nuevas:** el control negativo actual («0 pedidos a WhatsApp») cambia de significado; hay que reescribirlo para permitir solo la apertura explícita de `wa.me` por acción del usuario y solo hacia el número del evento.
6. **Operación y precio:** alta de cada cliente, cuánto cuesta cada opción y qué incluye el servicio. Es una decisión comercial: no se modifica ningún precio ni texto comercial en este registro.

## Qué no cambia
La demo narrativa (películas, tiempos, geometría del teléfono, RSVP de muestra) queda como está aprobada. Cualquier paso al funcionamiento real arranca con la decisión A/B del punto 2.
