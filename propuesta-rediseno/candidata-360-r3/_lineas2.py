# GrowiWeb, GrowiFlow, Combo e Invitaciones (R3).
from _lib import *
from _demos import *
from _lineas import l1_faq, ph

# ================================================================== GROWIWEB
def web():
    pg = Pg("web/"); rel = pg.rel
    msg = "Hola Growi, quiero un presupuesto para un sitio web.\n\nMi rubro:\nQué quiero que haga quien entra (llamar, reservar, comprar):"
    hero = ('<section class="ph ph-wide" data-sticky-hide aria-labelledby="h1"><div class="w"><div class="ph-top"><div>%s<h1 id="h1">Un sitio que presenta tu negocio y <mark class="sweep">facilita las consultas</mark>.</h1></div>'
            '<div><p class="sub">Landing pages y sitios institucionales, publicados por nosotros. Vos no tocás nada técnico y sabés cuánto sale antes de empezar.</p>'
            '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:22px">%s<a class="btn o" href="#planes">Ver planes ↓</a></div>'
            '<ul class="proof"><li><span>Landing desde %s · sitio institucional desde %s, pago único · precios previstos: hoy solo consultas</span></li><li><span>Dominio y alojamiento los pagás vos, aparte</span></li></ul></div></div>'
            '<div id="demo" class="demo-wide">%s</div></div></section>\n'
            % (ph(pg, "GrowiWeb"), btn(msg, "web-hero-whatsapp", "Pedir presupuesto"), P(200, True), P(550, True), web_showcase(rel)))
    def cta(plan): return btn("Hola Growi, quiero un presupuesto para el plan %s de GrowiWeb.\n\nMi rubro:" % plan, "web-pricing-whatsapp", "Consultar por el plan %s" % plan, "wide")
    def tk(code, name, sub, lines, usd, fine, ribbon=""): return ticket(code, name, sub, lines, ("Pago único", money(usd)), fine, cta(name), ribbon)
    ent = "Entrega: fecha estimada en el presupuesto. Dominio y alojamiento no incluidos."
    lp = ('<div class="tickets" id="p-landing" role="tabpanel">%s%s%s</div>' % (
        tk("Landing 01", "Express", "Una sola página para conseguir consultas, reservas o ventas.", ["Hasta 4 secciones", "Plantilla adaptada a tu rubro", "Vos escribís los textos, nosotros armamos el sitio", "Formulario simple (llega por email)", "Preparado para aparecer en Google", "1 ronda de revisiones", "7 días de soporte después de la entrega"], 200, ent),
        tk("Landing 02", "Pro", "Diseño adaptado a tu marca.", ["Hasta 6 secciones", "Diseño adaptado a tu marca", "Redacción básica incluida", "Formulario a medida", "Preparado para Google y para verse bien al compartirlo", "2 rondas de revisiones", "7 días de soporte después de la entrega"], 299, ent, "El más completo para empezar"),
        tk("Landing 03", "Performance", "Diseño 100% a medida, pensado para vender.", ["Hasta 8 secciones", "Diseño 100% a medida", "Textos pensados para vender", "Formulario completo: cada consulta queda guardada en una planilla", "Trabajo completo para Google + medición de visitas y de tus anuncios", "3 rondas + una revisión final antes de publicar", "30 días de soporte después de la entrega"], 449, ent)))
    ins = ('<div class="tickets two" id="p-inst" role="tabpanel" hidden>%s%s</div>' % (
        tk("Sitio 01", "Base", "Un sitio completo, con navegación, mapa y contacto.", ["Home · servicios · contacto · mapa", "WhatsApp integrado", "Diseño a medida, adaptado a tu marca", "Preparado para aparecer en Google", "1 ronda de revisiones", "30 días de soporte después de la entrega"], 550, ent),
        tk("Sitio 02", "Con turnos", "Todo lo del plan Base, conectado con tu sistema de turnos.", ["Todo lo del plan Base", "Formulario de solicitud de turno", "Conectado con tu sistema de turnos", "Trabajo completo para Google + medición de visitas y de tus anuncios", "3 rondas + una revisión final antes de publicar", "30 días de soporte prioritario"], 729, ent, "Recomendado para consultorios")))
    planes = ('<section class="sec tint" id="planes" aria-labelledby="h-pl"><div class="w"><p class="eyebrow">Planes y precios</p><h2 id="h-pl">¿Qué necesitás?</h2><p class="l1n">Hoy solo recibimos consultas: todavía no se contrata ni se paga.</p>'
              '<div class="pick" role="tablist" aria-label="Tipo de sitio"><button type="button" role="tab" data-panel="p-landing" aria-selected="true"><b>Una página para que te contacten</b><span>Landing page · desde %s</span></button>'
              '<button type="button" role="tab" data-panel="p-inst" aria-selected="false" tabindex="-1"><b>Un sitio completo con varias secciones</b><span>Sitio institucional · desde %s</span></button></div>'
              '<div class="tk-tools">%s</div>%s%s'
              '<p class="note" style="max-width:86ch;margin-top:34px">El plazo de entrega se define según el plan, el alcance y los materiales necesarios; te confirmamos una fecha estimada en el presupuesto, antes de iniciar el proyecto. El dominio y el alojamiento no están incluidos: los contratás y pagás vos, aparte, y te recomendamos cuáles. Está previsto que todos los planes tengan 7 días de ajustes sin cargo desde la entrega si algo no quedó como esperabas. %s</p></div></section>\n'
              % (P(200, True), P(550, True), cur_toggle(), lp, ins, E(L1_PRECIOS)))
    ex = [("Redacción completa desde cero", 69), ("Formulario que guarda cada consulta en una planilla", 59), ("Medición de visitas y de anuncios (Google y Meta) configurada", 39), ("Ronda adicional de revisiones", 29)]
    extras = ('<section class="sec" aria-labelledby="h-ex"><div class="w"><div class="faq-g"><div><p class="eyebrow">Extras</p><h2 id="h-ex">Sumá lo que tu proyecto necesita.</h2></div>'
              '<div><table class="extras"><caption class="sr-only">Extras de GrowiWeb y su precio</caption><thead><tr><th scope="col">Extra</th><th scope="col">Precio</th></tr></thead><tbody>%s<tr><td>Conexión con tu sistema de clientes</td><td>A cotizar</td></tr></tbody></table></div></div></div></section>\n'
              % "".join("<tr><td>%s</td><td>%s</td></tr>" % (E(a), P(b, True)) for a, b in ex))
    pasos = [("01", "Nos escribís por WhatsApp", "Nos contás qué vendés y qué querés que haga quien entra: llamar, reservar o comprar."), ("02", "Te pasamos el precio", "Antes de empezar sabés cuánto sale y qué incluye, por escrito."),
             ("03", "Lo armamos con vos", "Armamos el sitio y lo ajustamos en las rondas de revisión de tu plan."), ("04", "Lo publicamos", "Lo dejamos online y tenés 7 días de ajustes sin cargo desde la entrega.")]
    proc = ('<section class="sec tint" id="como" aria-labelledby="h-pr"><div class="w"><p class="eyebrow">Cómo se hace</p><h2 id="h-pr">Cuatro pasos, con el precio primero.</h2><ol class="feat" style="grid-template-columns:repeat(2,minmax(0,1fr));list-style:none">%s</ol></div></section>\n'
            % "".join('<li><div><b>%s · %s</b><span>%s</span></div></li>' % p for p in pasos))
    faqp = l1_faq("web", [0, 1, 2, 3, 4, 5])
    pre = ('<section class="sec" id="preguntas" aria-labelledby="h-faq"><div class="w faq-g"><div><p class="eyebrow">Preguntas</p><h2 id="h-faq">Antes de pedir el presupuesto.</h2></div>%s</div></section>\n' % faq(faqp))
    band = ('<section class="sec tint" aria-labelledby="h-b"><div class="w"><div class="band"><div><h3 id="h-b">¿Querés ordenar también ventas, caja y turnos?</h3><p style="margin-top:8px;max-width:60ch">Con el combo cualquiera de estos planes sale 10%% menos y la puesta en marcha de GrowiApp va sin cargo.</p></div><a class="btn o" href="%s" data-track="web-bundle-link">Ver el combo →</a></div></div></section>\n' % pg.u("combo/"))
    cie = cierre("Contanos qué sitio necesitás.", "Te pasamos el precio y el alcance por escrito, de lunes a sábado de 9 a 19 hs.", btn(msg, "web-final-whatsapp", "Pedir presupuesto"))
    return (head(pg, "GrowiWeb: sitios web para negocios | Growi", "Landing pages y sitios institucionales para negocios de Argentina, publicados por nosotros. Desde USD 200, con precio y alcance por escrito.", "og-web.png", l1ld="web", faqs=faqp)
            + header(pg, "web") + subnav([("demo", "Demo"), ("planes", "Planes"), ("como", "Cómo se hace"), ("preguntas", "Preguntas")], "web")
            + '<main id="contenido">\n' + hero + planes + extras + proc + pre + band + cie + otras(pg, "web") + '</main>\n' + footer(pg, msg, "web"))

# ================================================================== GROWIFLOW
def flow():
    pg = Pg("flow/"); rel = pg.rel
    msg = "Hola Growi, quiero consultar por una automatización para mi negocio.\n\nQué tarea repito todos los días:"
    hero = ('<section class="ph ph-wide" data-sticky-hide aria-labelledby="h1"><div class="w"><div class="ph-top"><div>%s<h1 id="h1">Las tareas que repetís todos los días, <mark class="sweep">armadas a medida</mark>.</h1></div>'
            '<div><p class="sub">Avisos de turno, resúmenes de ventas y consultas en orden: lo armamos a medida de tu negocio y lo probamos con vos antes de dejarlo andando.</p>'
            '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:24px">%s<a class="btn o" href="#paquetes">Ver paquetes ↓</a></div>'
            '<ul class="proof"><li><span>Desde %s, pago único · precios previstos: hoy solo consultas</span></li></ul></div></div>'
            '<div id="demo" class="demo-wide">%s</div></div></section>\n'
            % (ph(pg, "GrowiFlow"), btn(msg, "flow-hero-whatsapp", "Contanos qué querés automatizar"), P(79, True), flow_demo(False)))
    def cta(txt, track, label): return btn(txt, track, label, "wide")
    m = "Hola Growi, quiero consultar por %s de GrowiFlow."
    ven = "Sin mensualidad."
    t_rep = ticket("Paquete 01", "Reportes", "Un resumen de tu negocio, ya armado.", ["Cada semana o cada mes, por mail o, con una cuenta habilitada por Meta, por WhatsApp", "Lo importante marcado: qué se vendió más, qué bajó, qué mirar", "Armado con inteligencia artificial", "Se arma a partir de tu planilla o de tus datos de GrowiApp", "7 días de ajustes sin cargo"],
                   ("Pago único", money(89)), ven, cta(m % "los Reportes", "flow-pricing-whatsapp", "Consultar por los reportes"), "", 'id="reportes"')
    t_rec = ticket("Paquete 02", "Recordatorios", "Avisos que salen solos.", ["Turnos, vencimientos o pagos pendientes", "Por mail o, con una cuenta habilitada por Meta, por WhatsApp", "Toma los datos de la planilla que ya usás", "Sin que nadie tenga que acordarse", "7 días de ajustes sin cargo"],
                   ("Pago único", money(89)), ven, cta(m % "los Recordatorios", "flow-pricing-whatsapp", "Consultar por los recordatorios"), "", 'id="recordatorios"')
    t_ped = ticket("Paquete 03", "Pedidos y consultas", "Todo lo que te llega, en un solo lugar.", ["Lo que entra por tu formulario se anota solo en una planilla", "Te avisa por mail cuando entra algo nuevo", "Marcás qué contestaste y ves de un vistazo qué falta", "WhatsApp e Instagram: lo vemos según tu cuenta", "7 días de ajustes sin cargo"],
                   ("Pago único", money(79)), ven, cta(m % "Pedidos y consultas", "flow-pricing-whatsapp", "Consultar por pedidos y consultas"), "", 'id="pedidos"')
    t_med = ticket("A medida", "Automatización a medida", "Para esa tarea que es solo de tu negocio.", ["Conectamos las herramientas que ya usás: planillas, mail, WhatsApp, formularios o tu sistema", "Nos contás cómo lo hacés hoy y te decimos si se puede y cuánto sale"],
                   ("Desde", money(190)), "Es un «desde»: precio de referencia, no cerrado. Te pasamos el precio final antes de empezar.", cta("Hola Growi, quiero consultar por una automatización a medida.", "flow-pricing-whatsapp", "Contanos qué querés automatizar"), "", 'id="a-medida"')
    t_bot = ticket("Próximamente", "Bot de WhatsApp", "Para las preguntas de siempre.", ["~Responde horarios, dirección y las preguntas frecuentes", "~Lo que no sabe, te lo pasa a vos"],
                   ("Puesta en marcha", '<strong class="t-num">%s <small>+ %s/mes</small></strong>' % (P(149), P(25, True))),
                   "Todavía no está disponible: depende de una aprobación de Meta y no hay fecha. Los mensajes los cobra Meta aparte, a cargo del cliente.", '<p class="soon-n"><a class="tl" href="%s%s" target="_blank" rel="noopener noreferrer" data-track="flow-bot-aviso-whatsapp">Avisame cuando esté disponible</a></p>' % (WA, quote("Hola Growi, avisenme cuando esté disponible el bot de WhatsApp de GrowiFlow.")), "", 'id="bot"')
    paq = ('<section class="sec tint" id="paquetes" aria-labelledby="h-pq"><div class="w"><p class="eyebrow">Paquetes</p><h2 id="h-pq">Elegí qué querés dejar de hacer a mano.</h2><p class="lead">Cada paquete es independiente y tiene precio cerrado: lo armamos, lo probamos con vos y te enseñamos a usarlo. Quien ya sea cliente de GrowiApp o GrowiWeb tendrá 10%% de descuento en cualquier paquete cuando se abra la contratación.</p><p class="l1n">Hoy solo recibimos consultas: todavía no se contrata ni se paga.</p>'
           '<div class="tk-tools">%s</div><div class="tickets">%s%s%s</div><div class="tickets two" style="margin-top:34px">%s%s</div>'
           '<p class="note" style="max-width:86ch;margin-top:34px">Planes y precios previstos: todavía no se aceptan contrataciones ni pagos. Las automatizaciones a medida se confirman en un presupuesto por escrito antes de empezar. No incluye el costo de los mensajes de WhatsApp, que cobra Meta, ni el de la inteligencia artificial, donde aplique: se pagan aparte. Están fijados en dólares: el valor en pesos es una referencia que se actualiza con el dólar oficial (venta). Un ajuste posterior, en cualquier paquete, sale __AJ__ por sesión.</p></div></section>\n'
           % (cur_toggle(), t_rep, t_rec, t_ped, t_med, t_bot))
    paq = paq.replace('__AJ__', P(29))
    pasos = [("01", "Nos contás cómo lo hacés hoy", "Por WhatsApp, sin formularios. Qué tarea te come tiempo, con qué la hacés y cada cuánto."), ("02", "Lo armamos y lo probamos con vos", "Vos no tocás nada técnico. Antes de dejarlo andando lo vemos juntos con tus datos reales."), ("03", "Queda funcionando", "Y si algo falla o querés cambiarlo, hablás por WhatsApp con el mismo equipo que lo armó.")]
    como = ('<section class="sec" id="como" aria-labelledby="h-co"><div class="w"><p class="eyebrow">Cómo lo armamos</p><h2 id="h-co">Tres pasos, sin nada técnico de tu lado.</h2><ol class="feat" style="grid-template-columns:repeat(3,minmax(0,1fr));list-style:none">%s</ol></div></section>\n'
            % "".join('<li><div><b>%s · %s</b><span>%s</span></div></li>' % p for p in pasos))
    faqp = l1_faq("flow", [0, 1, 6, 7, 8, 9]) + [("¿Qué necesito para los Reportes?", "Los datos tienen que estar en algún lado: en GrowiApp o en una planilla donde ya lleves tus ventas o turnos. Cómo se conectan se define al armarlo, antes de empezar.")]
    pre = ('<section class="sec tint" id="preguntas" aria-labelledby="h-faq"><div class="w faq-g"><div><p class="eyebrow">Preguntas</p><h2 id="h-faq">Antes de escribirnos.</h2></div>%s</div></section>\n' % faq(faqp))
    cie = cierre("Contanos qué tarea querés sacarte de encima.", "Te decimos si se puede automatizar y cuánto sale, por escrito, antes de empezar. De lunes a sábado, de 9 a 19 hs.", btn(msg, "flow-final-whatsapp", "Contanos qué querés automatizar"))
    return (head(pg, "GrowiFlow: automatizaciones para tu negocio | Growi", "Avisos de turno, reportes y consultas en orden, armados a medida de tu negocio. Desde USD 79, pago único. Mirá cómo funciona.", "og-flow.png", l1ld="flow", faqs=faqp)
            + header(pg, "flow") + subnav([("demo", "Cómo funciona"), ("paquetes", "Paquetes"), ("como", "Cómo lo armamos"), ("preguntas", "Preguntas")], "flow")
            + '<main id="contenido">\n' + hero + paq + como + pre + cie + otras(pg, "flow") + '</main>\n' + footer(pg, msg, "flow"))

# ================================================================== COMBO
def combo():
    pg = Pg("combo/"); rel = pg.rel
    msg = "Hola Growi, quiero consultar por el combo de sitio web y sistema.\n\nMi rubro:"
    hero = ('<section class="ph ph-wide" data-sticky-hide aria-labelledby="h1"><div class="w"><div class="ph-top"><div>%s<h1 id="h1">Tu negocio, en internet y ordenado, <mark class="sweep">con un solo equipo</mark>.</h1></div>'
            '<div><p class="sub">Te armamos el sitio web y el sistema para llevar ventas, caja, stock y turnos, todo junto. Lo arma el mismo equipo y, por hacerlo junto, el sitio sale 10%% menos.</p>'
            '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:24px">%s<a class="btn o" href="#precios">Ver precios ↓</a></div>'
            '<ul class="proof"><li><span>Sitio desde %s, pago único + %s por mes del sistema · precios previstos: hoy solo consultas</span></li><li><span>10%% de descuento en el sitio · Puesta en marcha del sistema sin cargo</span></li></ul></div></div>'
            '<div id="demo" class="demo-wide">%s</div></div></section>\n'
            % (ph(pg, "Combo"), btn(msg, "combo-hero-whatsapp", "Consultar por el combo"), P(180, True), P(15, True), combo_journey(rel)))
    por = [("Un solo relevamiento", "En una charla contás tu negocio una vez, y con eso armamos el sitio y el sistema. No le explicás lo mismo a dos equipos."), ("Un solo arranque", "Una sola espera y una sola puesta en marcha. La del sistema va sin cargo cuando lo contratás junto con el sitio."), ("El mismo WhatsApp para todo", "Si algo falla, hablás con el mismo equipo que armó todo, sin que te deriven de un lado a otro.")]
    pq = ('<section class="sec" id="juntos" aria-labelledby="h-j"><div class="w"><p class="eyebrow">Por qué juntos</p><h2 id="h-j">Sitio y sistema: una charla, un arranque, un equipo.</h2><ul class="feat">%s</ul></div></section>\n'
          % "".join("<li><div><b>%s</b><span>%s</span></div></li>" % (E(a), E(b)) for a, b in por))
    def tc(code, name, sub, lines, usd, suelto, pre):
        return ticket(code, name, sub, lines, ("Sitio, pago único", money(usd)), "Suelto el sitio sale %s. Más %s por mes del sistema (GrowiApp Start). Puesta en marcha del sistema sin cargo (sola sale %s). %s" % (P(suelto), P(15), P(49), "El dominio y el alojamiento los pagás vos, aparte."),
                      btn("Hola Growi, quiero consultar por el %s." % name, "combo-pricing-whatsapp", "Consultar por el %s" % name, "wide"))
    t1 = tc("Combo 01", "Combo Landing", "Una página, más tu sistema.", ["Sitio de una sola página, con botón a WhatsApp o formulario", "GrowiApp Start: ventas, caja, stock, turnos y clientes", "Puesta en marcha del sistema sin cargo", "La charla inicial sirve para las dos cosas"], 180, 200, "")
    t2 = tc("Combo 02", "Combo Institucional", "Un sitio completo, más tu sistema.", ["Sitio completo con varias secciones: quiénes son, servicios, contacto y mapa", "GrowiApp Start: ventas, caja, stock, turnos y clientes", "Puesta en marcha del sistema sin cargo", "La charla inicial sirve para las dos cosas"], 495, 550, "")
    precios = ('<section class="sec tint" id="precios" aria-labelledby="h-pr"><div class="w"><p class="eyebrow">Dos ejemplos de combo</p><h2 id="h-pr">Con el plan de entrada de cada línea.</h2><p class="lead">El 10%% de descuento se aplica a cualquier plan de GrowiWeb que combines con GrowiApp. <a class="tl" href="%s">Ver todos los planes de GrowiWeb</a></p><p class="l1n">Hoy solo recibimos consultas: todavía no se contrata ni se paga.</p>'
               '<div class="tk-tools">%s</div><div class="tickets two">%s%s</div>'
               '<p class="note" style="max-width:86ch;margin-top:34px">%s El abono mensual de GrowiApp es el mismo que si lo contratás solo, sin permanencia. La fecha estimada de entrega del sitio va en el presupuesto y la del sistema se confirma por escrito antes de empezar. Garantía prevista de 7 días: si en los 7 días desde que te entregamos el sitio no funciona como te prometimos, te devolveríamos el 100%% del pago único del sitio (el precio del combo, ya con el 10%% de descuento).</p></div></section>\n'
               % (pg.u("web/") + "#planes", cur_toggle(), t1, t2, E(L1_PRECIOS)))
    faqp = l1_faq("combo", [0, 1, 2, 3, 4, 5])
    pre = ('<section class="sec" id="preguntas" aria-labelledby="h-faq"><div class="w faq-g"><div><p class="eyebrow">Preguntas</p><h2 id="h-faq">Dudas sobre el combo.</h2></div>%s</div></section>\n' % faq(faqp))
    cie = cierre("Arrancá con el sitio y el sistema juntos.", "Contanos qué negocio tenés y te pasamos el precio de las dos cosas. De lunes a sábado, de 9 a 19 hs.", btn(msg, "combo-final-whatsapp", "Consultar por el combo"))
    return (head(pg, "Combo: sitio web + sistema de gestión | Growi", "Sitio web y sistema de gestión para tu negocio, armados por el mismo equipo. El sitio sale 10% menos y la puesta en marcha del sistema va sin cargo.", "og-combo.png", l1ld="combo", faqs=faqp)
            + header(pg, "combo") + subnav([("demo", "El recorrido"), ("juntos", "Por qué juntos"), ("precios", "Precios"), ("preguntas", "Preguntas")], "combo")
            + '<main id="contenido">\n' + hero + pq + precios + pre + cie + otras(pg, "combo") + '</main>\n' + footer(pg, msg, "combo"))

# ================================================================== INVITACIONES
def invitaciones():
    pg = Pg("invitaciones/"); rel = pg.rel
    msg = "Hola Growi, quiero consultar por una invitación digital para mi evento.\n\nTipo de evento:\nFecha:"
    hero = ('<section class="ph invh" data-sticky-hide aria-labelledby="h1"><div class="w ph-g"><div><p class="crumb"><a href="%s">Growi</a> / <span>Invitaciones digitales</span></p><p class="eyebrow">Invitaciones digitales · para tus eventos</p>'
            '<h1 id="h1">La invitación de tu evento, <mark class="sweep">diseñada a medida</mark>.</h1>'
            '<p class="sub">Para casamientos, cumpleaños, quinceañeras y eventos de empresa. Se comparte con un enlace y tus invitados confirman por WhatsApp.</p>'
            '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:26px">%s<a class="btn o" href="#perfiles">Ver cómo se personaliza ↓</a></div>'
            '<ul class="proof"><li><span>Con presupuesto y alcance por escrito, sin precio de lista · hoy solo consultas</span></li><li><span>Una página propia, online hasta 30 días después del evento</span></li></ul></div>'
            '<div id="demo">%s<p class="cap">Invitaciones de muestra con datos ficticios. Abrilas y recorrelas: cada una se cuenta de otra manera (capítulos, tarjetas o agenda por bloques).</p></div></div></section>\n'
            % (pg.u(""), btn(msg, "inv-hero-whatsapp", "Pedir presupuesto"), inv_frame(rel, "exp", "Invitaciones de muestra: elegí un casamiento, un cumpleaños o un evento de empresa", 700)))
    perf = ('<section class="sec invs" id="perfiles" aria-labelledby="h-pf"><div class="w"><p class="eyebrow">Personalización avanzada, a medida</p><h2 id="h-pf">Cuando tus invitados no viven el día de la misma manera.</h2>'
            '<p class="lead">Elegí un invitado y mirá cómo cambia la misma invitación: la agenda, los lugares y la información que recibe. Son perfiles ficticios. Se diseña a medida y se presupuesta según el evento: no todo es posible en todos los casos, lo evaluamos con vos.</p>%s</div></section>\n'
            % inv_frame(rel, "perf", "Una misma invitación vista por tres perfiles de invitados", 720))
    inc = ('<section class="sec" id="alcance" aria-labelledby="h-al"><div class="w"><p class="eyebrow">Qué recibís</p><h2 id="h-al">Una página propia para tu evento.</h2><p class="l1n">Hoy solo recibimos consultas: todavía no se contrata ni se paga. Lo de la seña y el pago describe cómo sería.</p><div class="inv2">'
           '<div><h3>Incluye</h3><ul class="chk"><li>Una invitación diseñada para tu evento, que se ve bien en celular y computadora</li><li>Portada con los datos del evento</li><li>Programa y horarios</li><li>Ubicación con enlace a mapas</li><li>Botón «Confirmar asistencia» por WhatsApp</li><li>Publicación en un enlace para compartir, online hasta 30 días después del evento</li></ul>'
           '<p class="note">Así confirma tu invitado: toca «Confirmar asistencia» y se abre WhatsApp con un mensaje listo. Las respuestas te llegan a tu WhatsApp y las administrás vos; Growi no las registra.</p></div>'
           '<div><h3>Se evalúa por proyecto</h3><ul class="chk plus"><li>Apertura animada con tus fotos</li><li>Agregar al calendario</li><li>Contenido distinto para cada grupo de invitados</li><li>Lista de invitados, control de acompañantes o confirmación por familia o grupo</li><li>Información adicional, como datos de regalo o traslado y alojamiento</li><li>Música u otros detalles especiales</li></ul>'
           '<p class="note">Cotización personalizada por WhatsApp, con presupuesto y alcance por escrito antes de empezar. Incluye dos rondas de ajustes de diseño. Se paga 50% al comenzar y 50% antes de publicar.</p></div></div></div></section>\n')
    pasos = [("01", "Nos contás tu evento", "Por WhatsApp: qué celebrás, la fecha y cuántos invitados son."), ("02", "Definimos qué incluye", "Te pasamos el presupuesto y el alcance por escrito, y empezamos con la seña del 50%."), ("03", "Te mostramos el borrador", "La ves en tu celular, pedís los ajustes (hay dos rondas incluidas) y aprobás la versión final."), ("04", "La publicamos y la compartís", "Con el pago completo, la publicamos y te pasamos el enlace para mandar por WhatsApp.")]
    como = ('<section class="sec invs" id="como" aria-labelledby="h-co"><div class="w"><p class="eyebrow">Cómo se pide</p><h2 id="h-co">Cuatro pasos hasta el enlace para compartir.</h2><ol class="feat" style="list-style:none">%s</ol></div></section>\n'
            % "".join('<li><div><b>%s · %s</b><span>%s</span></div></li>' % p for p in pasos))
    faqp = l1_faq("invitaciones", [0, 1, 2, 3, 4, 8])
    pre = ('<section class="sec" id="preguntas" aria-labelledby="h-faq"><div class="w faq-g"><div><p class="eyebrow">Preguntas</p><h2 id="h-faq">Lo que suelen preguntar.</h2></div>%s</div></section>\n' % faq(faqp))
    neg = ('<section class="sec tint" aria-labelledby="h-n"><div class="w"><div class="band"><div><h3 id="h-n">¿Necesitás también un sitio para tu negocio?</h3><p style="margin-top:8px;max-width:60ch">El mismo equipo arma landing pages y sitios institucionales, con precio fijo y publicados por nosotros.</p></div><a class="btn o" href="%s" data-track="inv-web-link">Ver GrowiWeb →</a></div></div></section>\n' % pg.u("web/"))
    cie = cierre("Contanos qué celebrás.", "Te respondemos con el presupuesto y el alcance, por WhatsApp, de lunes a sábado de 9 a 19 hs.", btn(msg, "inv-final-whatsapp", "Pedir presupuesto"))
    return (head(pg, "Invitaciones digitales para eventos | Growi", "Invitaciones digitales a medida para casamientos, cumpleaños, quinceañeras y eventos de empresa. Probá las demos y pedí presupuesto por WhatsApp.", "growi-og-1200x630.png", l1ld="invitaciones", faqs=faqp, cls="inv-page")
            + header(pg, "inv") + subnav([("demo", "Las invitaciones"), ("perfiles", "Personalización"), ("alcance", "Qué recibís"), ("como", "Cómo se pide"), ("preguntas", "Preguntas")], "inv")
            + '<main id="contenido">\n' + hero + perf + inc + como + pre + neg + cie + '</main>\n' + footer(pg, msg, "inv"))
