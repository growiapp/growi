# GrowiWeb, GrowiFlow, Combo e Invitaciones (R3).
from _lib import *
from _demos import *
from _r33 import inv_gallery
from _r36 import scene_flow, scene_combo, scene_inv, ex_panel, hero36
from _lineas import l1_faq, ph


def flow_ld():
    """Oferta de R3.5: los canales condicionados no se heredan del L1."""
    def oferta(nombre, usd, descripcion):
        d = {"@type": "Offer", "name": nombre, "price": str(usd),
             "priceCurrency": "USD", "description": descripcion}
        return d

    servicio = {
        "@context": "https://schema.org", "@type": "Service", "name": "GrowiFlow",
        "serviceType": "Automatizaciones para negocios", "url": "https://growi.ar/flow/",
        "description": "Reportes, recordatorios y organización de pedidos y consultas configurados a medida. Los envíos por WhatsApp requieren una cuenta habilitada por Meta; las integraciones con WhatsApp e Instagram se evalúan según la cuenta del cliente. El bot de WhatsApp aún no está disponible. Actualmente solo se reciben consultas, sin contrataciones ni pagos.",
        "areaServed": {"@type": "Country", "name": "Argentina"},
        "provider": {"@type": "Organization", "name": "Growi", "url": "https://growi.ar/"},
        "hasOfferCatalog": {"@type": "OfferCatalog", "name": "Paquetes GrowiFlow", "itemListElement": [
            oferta("Reportes", 89, "Resumen semanal o mensual armado a partir de una planilla o datos de GrowiApp, con inteligencia artificial. Se envía por correo o, con una cuenta habilitada por Meta, por WhatsApp. Costo de inteligencia artificial aparte cuando aplique."),
            oferta("Recordatorios", 89, "Avisos de turnos, vencimientos o pagos pendientes a partir de una planilla. Se envían por correo o, con una cuenta habilitada por Meta, por WhatsApp."),
            oferta("Pedidos y consultas", 79, "Las consultas de un formulario se registran en una planilla y generan un aviso por correo. La integración de WhatsApp e Instagram se evalúa según la cuenta del cliente."),
            oferta("Automatización a medida", 190, "Precio desde USD 190; factibilidad, alcance y precio final se confirman por escrito antes de empezar."),
            oferta("Sesión de ajuste", 29, "Ajuste posterior a la entrega de una automatización existente."),
            oferta("Bot de WhatsApp para preguntas frecuentes", 25, "Próximamente, sin fecha: requiere aprobación de Meta. Puesta en marcha prevista de USD 149 y mensajes de Meta aparte. Todavía no disponible."),
        ]},
    }
    migas = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Growi", "item": "https://growi.ar/"},
        {"@type": "ListItem", "position": 2, "name": "GrowiFlow", "item": "https://growi.ar/flow/"},
    ]}
    return [json.dumps(d, ensure_ascii=False) for d in (servicio, migas)]

# ================================================================== GROWIWEB
def web():
    pg = Pg("web/"); rel = pg.rel
    msg = "Hola Growi, quiero un presupuesto para un sitio web.\n\nMi rubro:\nQué quiero que haga quien entra (llamar, reservar, comprar):"
    hero = hero36(pg, ph(pg, "GrowiWeb"), 'Un sitio que presenta tu negocio y <mark class="sweep">facilita las consultas</mark>.',
                  "Landing pages y sitios institucionales, publicados por nosotros. Vos no tocás nada técnico y sabés cuánto sale antes de empezar.",
                  btn(msg, "web-hero-whatsapp", "Pedir presupuesto") + '<a class="btn o" href="#planes">Ver planes ↓</a>',
                  "Landing desde %s · sitio institucional desde %s, pago único · dominio y alojamiento aparte" % (P(200, True), P(550, True)), ex_panel(rel, "ribera", "01"))
    proj2 = ('<section class="sec" id="proyectos" aria-labelledby="h-pj"><div class="w"><p class="eyebrow">Otro proyecto</p><h2 id="h-pj" class="sr-only">Otro sitio de muestra: un taller de cerámica</h2>%s'
             '<p class="cap" style="margin-top:14px">Sitios de muestra con contenido ficticio y funcionando; las fotografías de ambientación son ilustrativas, generadas con IA.</p></div></section>\n' % ex_panel(rel, "barro", "02"))
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
    planes = ('<section class="sec tint" id="planes" aria-labelledby="h-pl"><div class="w"><p class="eyebrow">Planes y precios</p><h2 id="h-pl">¿Qué necesitás?</h2><p class="lead">Los precios son una referencia de la inversión y los planes, un punto de partida. Cada sitio puede sumar secciones o funciones, y el alcance final y el presupuesto se confirman por escrito antes de empezar.</p>'
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
            + header(pg, "web") + subnav([("demo", "Proyectos"), ("planes", "Planes"), ("como", "Cómo se hace"), ("preguntas", "Preguntas")], "web")
            + '<main id="contenido">\n' + hero + proj2 + planes + extras + proc + pre + band + cie + otras(pg, "web") + '</main>\n' + footer(pg, msg, "web"))

# ================================================================== GROWIFLOW
def flow():
    pg = Pg("flow/"); rel = pg.rel
    msg = "Hola Growi, quiero consultar por una automatización para mi negocio.\n\nQué tarea repito todos los días:"
    BOTMSG = "Hola Growi, quiero consultar por un bot de WhatsApp para mi negocio.\n\nMi rubro:\nQué preguntas me hacen siempre:"
    hero = hero36(pg, ph(pg, "GrowiFlow"), 'Las tareas que repetís todos los días, <mark class="sweep">armadas a medida</mark>.',
                  "Avisos de turno, resúmenes de ventas y consultas en orden: lo armamos a medida de tu negocio y lo probamos con vos antes de dejarlo andando.",
                  btn(msg, "flow-hero-whatsapp", "Contanos qué querés automatizar") + '<a class="btn o" href="#paquetes">Ver paquetes ↓</a>',
                  'Desde %s, pago único · <a class="tl" href="%s%s" target="_blank" rel="noopener noreferrer" data-track="flow-hero-bot-whatsapp">Consultar por un bot de WhatsApp</a>' % (P(79, True), WA, quote(BOTMSG)), scene_flow())
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
                   ("Desde", money(190)), "Precio de referencia: el importe final y el alcance se confirman por escrito antes de empezar.", cta("Hola Growi, quiero consultar por una automatización a medida.", "flow-pricing-whatsapp", "Contanos qué querés automatizar"), "", 'id="a-medida"')
    t_bot = ticket("Bajo consulta", "Bot de WhatsApp", "Para las preguntas de siempre.", ["~Responde horarios, dirección y las preguntas frecuentes", "~Lo que no sabe, te lo pasa a vos"],
                   ("Puesta en marcha", '<strong class="t-num">%s <small>+ %s/mes</small></strong>' % (P(149), P(25, True))),
                   "Precio de referencia, a confirmar al consultar. Se evalúa caso por caso: depende de una aprobación de Meta y todavía no hay fecha de disponibilidad. Los mensajes los cobra Meta aparte, a cargo del cliente.", btn(BOTMSG, "flow-bot-whatsapp", "Consultar por un bot de WhatsApp", "wide"), "", 'id="bot"')
    paq = ('<section class="sec tint" id="paquetes" aria-labelledby="h-pq"><div class="w"><p class="eyebrow">Paquetes</p><h2 id="h-pq">Elegí qué querés dejar de hacer a mano.</h2><p class="lead">Cada paquete es independiente y parte de un precio de referencia: lo armamos, lo probamos con vos y te enseñamos a usarlo. El alcance final y el importe se confirman por escrito antes de empezar. Quien ya sea cliente de GrowiApp o GrowiWeb tendrá 10%% de descuento en cualquier paquete cuando se abra la contratación.</p>'
           '<div class="tk-tools">%s</div><div class="tickets">%s%s%s</div><div class="tickets two" style="margin-top:34px">%s%s</div>'
           '<p class="note" style="max-width:86ch;margin-top:34px">Las automatizaciones a medida se confirman en un presupuesto por escrito antes de empezar. No incluye el costo de los mensajes de WhatsApp, que cobra Meta, ni el de la inteligencia artificial, donde aplique: se pagan aparte. Están fijados en dólares: el valor en pesos es una referencia que se actualiza con el dólar oficial (venta). Un ajuste posterior, en cualquier paquete, sale __AJ__ por sesión.</p></div></section>\n'
           % (cur_toggle(), t_rep, t_rec, t_ped, t_med, t_bot))
    paq = paq.replace('__AJ__', P(29))
    pasos = [("01", "Nos contás cómo lo hacés hoy", "Por WhatsApp, sin formularios. Qué tarea te come tiempo, con qué la hacés y cada cuánto."), ("02", "Lo armamos y lo probamos con vos", "Vos no tocás nada técnico. Antes de dejarlo andando lo vemos juntos con tus datos reales."), ("03", "Queda funcionando", "Y si algo falla o querés cambiarlo, hablás por WhatsApp con el mismo equipo que lo armó.")]
    como = ('<section class="sec" id="como" aria-labelledby="h-co"><div class="w"><p class="eyebrow">Cómo lo armamos</p><h2 id="h-co">Tres pasos, sin nada técnico de tu lado.</h2><ol class="feat" style="grid-template-columns:repeat(3,minmax(0,1fr));list-style:none">%s</ol></div></section>\n'
            % "".join('<li><div><b>%s · %s</b><span>%s</span></div></li>' % p for p in pasos))
    faqp = l1_faq("flow", [0, 1, 3, 4, 5, 6, 7, 8, 9]) + [("¿Qué necesito para los Reportes?", "Los datos tienen que estar en algún lado: en GrowiApp o en una planilla donde ya lleves tus ventas o turnos. Cómo se conectan se define al armarlo, antes de empezar.")]
    pre = ('<section class="sec tint" id="preguntas" aria-labelledby="h-faq"><div class="w faq-g"><div><p class="eyebrow">Preguntas</p><h2 id="h-faq">Antes de escribirnos.</h2></div>%s</div></section>\n' % faq(faqp))
    cie = cierre("Contanos qué tarea querés sacarte de encima.", "Te decimos si se puede automatizar y cuánto sale, por escrito, antes de empezar. De lunes a sábado, de 9 a 19 hs.", btn(msg, "flow-final-whatsapp", "Contanos qué querés automatizar"))
    return (head(pg, "GrowiFlow: automatizaciones para tu negocio | Growi", "Avisos de turno, reportes y consultas en orden, armados a medida de tu negocio. Desde USD 79, pago único. Mirá cómo funciona.", "og-flow.png", faqs=faqp, ld_override=flow_ld())
            + header(pg, "flow") + subnav([("demo", "Cómo funciona"), ("paquetes", "Paquetes"), ("como", "Cómo lo armamos"), ("preguntas", "Preguntas")], "flow")
            + '<main id="contenido">\n' + hero + paq + como + pre + cie + otras(pg, "flow") + '</main>\n' + footer(pg, msg, "flow"))

# ================================================================== COMBO
def combo():
    pg = Pg("combo/"); rel = pg.rel
    msg = "Hola Growi, quiero consultar por el combo de sitio web y sistema.\n\nMi rubro:"
    hero = hero36(pg, ph(pg, "Combo"), 'Tu negocio, en internet y ordenado, <mark class="sweep">con un solo equipo</mark>.',
                  "Te armamos el sitio web y el sistema para llevar ventas, caja, stock y turnos, todo junto. Lo arma el mismo equipo y, por hacerlo junto, el sitio sale 10% menos.",
                  btn(msg, "combo-hero-whatsapp", "Consultar por el combo") + '<a class="btn o" href="#precios">Ver precios ↓</a>',
                  "Sitio desde %s, pago único + %s por mes del sistema · Puesta en marcha del sistema sin cargo" % (P(180, True), P(15, True)), scene_combo(rel))
    por = [("Un solo relevamiento", "En una charla contás tu negocio una vez, y con eso armamos el sitio y el sistema. No le explicás lo mismo a dos equipos."), ("Un solo arranque", "Una sola espera y una sola puesta en marcha. La del sistema va sin cargo cuando lo contratás junto con el sitio."), ("El mismo WhatsApp para todo", "Si algo falla, hablás con el mismo equipo que armó todo, sin que te deriven de un lado a otro.")]
    pq = ('<section class="sec" id="juntos" aria-labelledby="h-j"><div class="w"><p class="eyebrow">Por qué juntos</p><h2 id="h-j">Sitio y sistema: una charla, un arranque, un equipo.</h2><ul class="feat">%s</ul></div></section>\n'
          % "".join("<li><div><b>%s</b><span>%s</span></div></li>" % (E(a), E(b)) for a, b in por))
    def tc(code, name, sub, lines, usd, suelto, pre):
        return ticket(code, name, sub, lines, ("Sitio, pago único", money(usd)), "Suelto el sitio sale %s. Más %s por mes del sistema (GrowiApp Start). Puesta en marcha del sistema sin cargo (sola sale %s). %s" % (P(suelto), P(15), P(49), "El dominio y el alojamiento los pagás vos, aparte."),
                      btn("Hola Growi, quiero consultar por el %s." % name, "combo-pricing-whatsapp", "Consultar por el %s" % name, "wide"))
    t1 = tc("Combo 01", "Combo Landing", "Una página, más tu sistema.", ["Sitio de una sola página, con botón a WhatsApp o formulario", "GrowiApp Start: ventas, caja, stock, turnos y clientes", "Puesta en marcha del sistema sin cargo", "La charla inicial sirve para las dos cosas"], 180, 200, "")
    t2 = tc("Combo 02", "Combo Institucional", "Un sitio completo, más tu sistema.", ["Sitio completo con varias secciones: quiénes son, servicios, contacto y mapa", "GrowiApp Start: ventas, caja, stock, turnos y clientes", "Puesta en marcha del sistema sin cargo", "La charla inicial sirve para las dos cosas"], 495, 550, "")
    precios = ('<section class="sec tint" id="precios" aria-labelledby="h-pr"><div class="w"><p class="eyebrow">Dos ejemplos de combo</p><h2 id="h-pr">Con el plan de entrada de cada línea.</h2><p class="lead">El 10%% de descuento se aplica a cualquier plan de GrowiWeb que combines con GrowiApp. Los planes son un punto de partida: el sistema puede sumar adaptaciones a medida, y definimos con vos el alcance final y el presupuesto por escrito antes de empezar. <a class="tl" href="%s">Ver todos los planes de GrowiWeb</a></p>'
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

# R3.8: explorador de capacidades de la invitación (reemplaza galerías y selector de grupos de invitados)
IC_TABS = [
    ("Confirmación por WhatsApp", "Confirmación", "Tu invitado toca un botón y se abre WhatsApp con el mensaje listo. Las respuestas te llegan a vos.", ""),
    ("Ubicación y mapa", "Ubicación", "El lugar con enlace a mapas, para que nadie llegue perdido.", ""),
    ("Cronograma", "Programa", "Qué pasa y a qué hora, en orden y a la vista.", ""),
    ("Información para invitados", "Info útil", "Dress code, estacionamiento, traslado, datos de regalo: se redacta y se diseña según tu evento.", "A medida"),
    ("Fotos, música y más", "Multimedia", "Galería, música o cuenta regresiva. Se desarrollan por proyecto y se presupuestan por escrito; hoy no vienen incluidas.", "A presupuestar"),
]
IC_PANELS = [
    ('rsvp', '<p class="k">Tu respuesta</p><h3>¿Nos acompañás?</h3><p class="d">Avisanos si venís y con cuántas personas.</p><div class="who"><span>Camila Ríos</span><b>2 personas</b></div>'
             '<button type="button" class="ob ic-go"><span class="a">Confirmar asistencia</span><span class="c">Mensaje listo ✓</span></button><p class="hint">Tocá el botón para ver el mensaje</p>'
             '<div class="wa"><p>Hola, confirmo mi asistencia. Somos 2.</p><small>Así llega a tu WhatsApp</small></div>'),
    ('map', '<div class="map" aria-hidden="true"><i class="rd r1"></i><i class="rd r2"></i><i class="rd r3"></i><i class="pin"></i></div>'
            '<div class="sheet"><p class="k">El lugar</p><h3>Salón</h3><p class="d">Dirección completa y enlace a mapas</p><span class="ob">Cómo llegar</span></div>'),
    ('prog', '<p class="k">El día</p><h3>Ceremonia, cena y fiesta</h3><ol class="tl"><li><b>17:00</b><span>Ceremonia<small>Capilla</small></span></li><li><b>19:00</b><span>Cóctel<small>Jardín</small></span></li><li><b>20:00</b><span>Cena<small>Salón</small></span></li><li><b>22:30</b><span>Fiesta<small>Salón</small></span></li></ol>'),
    ('info', '<p class="k">Para tener en cuenta</p><h3>Lo que tus invitados necesitan saber</h3><ul class="cd"><li><b>Dress code</b><span>Elegante</span></li><li><b>Estacionamiento</b><span>Sobre la calle</span></li><li><b>Traslado</b><span>Micro 19:15</span></li><li><b>Regalos</b><span>Datos para quien quiera</span></li></ul>'),
    ('mm', '<p class="tagc">Idea a presupuestar</p><h3>Fotos, música y cuenta regresiva</h3><div class="gal" aria-hidden="true"><i></i><i></i><i></i><i></i></div>'
           '<div class="mus" aria-hidden="true"><i class="pl"></i><span><b>Nuestra canción</b><em></em></span></div><div class="cdn" aria-hidden="true"><span><b>42</b>días</span><span><b>06</b>horas</span></div>'),
]

def inv_caps():
    tabs = "".join('<button type="button" role="tab" id="ic-t%d" aria-controls="ic-p%d" aria-selected="%s" tabindex="%d" data-d="%s"><span class="ic-tx"><b><span class="f">%s</span><span class="s">%s</span></b><small>%s</small></span>%s</button>'
                   % (i, i, "true" if i == 0 else "false", 0 if i == 0 else -1, d, t, sh, d, ('<em class="ic-tg">%s</em>' % tg) if tg else "") for i, (t, sh, d, tg) in enumerate(IC_TABS))
    pans = "".join('<div class="ic-p ic-%s%s" role="tabpanel" id="ic-p%d" aria-labelledby="ic-t%d">%s</div>' % (c, " on" if i == 0 else "", i, i, h) for i, (c, h) in enumerate(IC_PANELS))
    return ('<div class="ic" data-ic><div class="ic-side"><div class="ic-tabs" role="tablist" aria-label="Qué puede tener tu invitación">%s</div><p class="ic-desc" aria-hidden="true">%s</p></div>'
            '<div class="ic-stage"><div class="ic-ph"><i class="ic-notch"></i><div class="ic-scr">%s</div></div></div></div>'
            '<p class="ic-lg">Viene en cada invitación: confirmación, ubicación y cronograma. Lo demás se diseña o se desarrolla a medida, con presupuesto por escrito antes de empezar.</p>' % (tabs, IC_TABS[0][2], pans))

def invitaciones():
    # F4.1: página de Invitaciones con tres experiencias interactivas (marcado en _inv.py; comportamiento en assets/invitaciones/).
    import _inv
    pg = Pg("invitaciones/"); rel = pg.rel
    msg = "Hola Growi, quiero consultar por una invitación digital para mi evento.\n\nTipo de evento:\nFecha:"
    hero = ('<section class="ix-hero" data-sticky-hide aria-labelledby="h-inv"><h1 class="ix-h1" id="h-inv">Tu evento empieza <em>cuando abren</em> la invitación.</h1>'
            '<p class="ix-lead">Diseñamos una invitación con la identidad de tu evento. Tus invitados la abren desde un enlace, encuentran toda la información y pueden confirmar por WhatsApp.</p>'
            '<p class="ix-cta">%s<a class="ix-ln2" href="#recorrido">Ver el recorrido completo <span aria-hidden="true">↓</span></a></p>'
            '<p class="ix-cond">Con presupuesto y alcance por escrito, sin precio de lista. Online hasta 30 días después del evento.</p>'
            '<p class="ix-nota"><span class="ix-mk" aria-hidden="true"></span><span><b>A medida.</b> Lo que lleva este círculo, como la apertura animada o el programa interactivo, se diseña con vos y se presupuesta por escrito.</span></p></section>'
            % btn(msg, "inv-hero-whatsapp", "Pedir presupuesto"))
    boton = btn(msg, "inv-cta-whatsapp", "Pedir presupuesto")
    faqp = l1_faq("invitaciones", [0, 1, 2, 3, 4, 8])
    pre = ('<section class="sec" id="preguntas" aria-labelledby="h-faq"><div class="w faq-g"><div><p class="eyebrow">Preguntas</p><h2 id="h-faq">Lo que suelen preguntar.</h2></div>%s</div></section>\n' % faq(faqp))
    neg = ('<section class="sec tint" aria-labelledby="h-n"><div class="w"><div class="band"><div><h3 id="h-n">¿Necesitás también un sitio para tu negocio?</h3><p style="margin-top:8px;max-width:60ch">El mismo equipo arma landing pages y sitios institucionales, con precio de referencia, presupuesto por escrito y publicados por nosotros.</p></div><a class="btn o" href="%s" data-track="inv-web-link">Ver GrowiWeb →</a></div></div></section>\n' % pg.u("web/"))
    cie = cierre("Contanos qué celebrás.", "Te respondemos con el presupuesto y el alcance, por WhatsApp, de lunes a sábado de 9 a 19 hs.", btn(msg, "inv-final-whatsapp", "Pedir presupuesto"))
    pagina = (head(pg, "Invitaciones digitales para eventos | Growi", "Invitaciones digitales a medida para casamientos, cumpleaños, quinceañeras y eventos de empresa. Pedí presupuesto por WhatsApp.", "growi-og-1200x630.png", l1ld="invitaciones", faqs=faqp, cls="inv-page")
              + header(pg, "inv") + subnav([("recorrido", "La experiencia"), ("otros", "Otros eventos"), ("alcance", "Qué incluye"), ("pedido", "Cómo se pide"), ("preguntas", "Preguntas")], "inv")
              + '<main id="contenido">\n' + _inv.historia(hero) + _inv.otros() + _inv.alcance() + _inv.pedido(boton) + pre + neg + cie + '</main>\n' + footer(pg, msg, "inv"))
    pagina = pagina.replace("</head>", '<script>document.documentElement.classList.add("ix-js")</script><link rel="preload" href="%sassets/fonts/syne-800-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="%sassets/fonts/instrument-serif-italic-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="%sassets/invitaciones/inv-base.css"><link rel="stylesheet" href="%sassets/invitaciones/inv.css">\n</head>' % (rel, rel, rel, rel), 1)
    return pagina.replace("</body>", '<script src="%sassets/invitaciones/inv-core.js"></script>\n<script src="%sassets/invitaciones/inv-ui.js"></script>\n</body>' % (rel, rel), 1)
