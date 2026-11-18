# Páginas de línea R3. Los precios (USD) y las condiciones comerciales son los vigentes; cambia la experiencia y se recorta la repetición.
from _lib import *
from _demos import *
import re, io, json

def l1_faq(path, idx):
    s = io.open(os.path.join(L1ROOT, path, "index.html"), encoding="utf-8").read()
    pares = re.findall(r"<summary>(.*?)<i[^>]*>.*?</summary>\s*<div class=\"faq-body\">(.*?)</div>", s, flags=re.S)
    def t(x): return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", x))).strip().replace(" ,", ",").replace(" .", ".")
    return [(t(pares[i][0]), t(pares[i][1])) for i in idx]

def ph(pg, cur_label, parent=None):
    crumb = '<a href="%s">Growi</a> / ' % pg.u("")
    if parent: crumb += '<a href="%s">%s</a> / ' % (pg.u(parent[1]), parent[0])
    return '<p class="crumb">%s<span>%s</span></p>' % (crumb, cur_label)

# ================================================================== GROWIAPP
def app():
    pg = Pg("app/"); rel = pg.rel
    msg_demo = "Hola Growi, quiero conocer GrowiApp y coordinar una demo de 20 minutos.\n\nMi rubro:\nDías y horarios que me vienen bien:"
    hero = ('<section class="ph" data-sticky-hide aria-labelledby="h1"><div class="w ph-g"><div>%s'
            '<h1 id="h1">Tu sistema de gestión, <mark class="sweep">listo para trabajar</mark>.</h1>'
            '<p class="sub">Registrás ventas, controlás el stock, llevás los turnos y cerrás la caja desde el celular. Lo armamos con los datos de tu negocio y te confirmamos una fecha estimada de entrega antes de empezar.</p>'
            '<div class="cta-row" style="display:flex;flex-wrap:wrap;gap:12px;margin-top:30px">%s<a class="btn o" href="#precios">Ver precios ↓</a></div>'
            '<ul class="proof"><li><span>Desde %s por mes + %s de puesta en marcha, una sola vez</span></li><li><span>Garantía de 7 días · Sin permanencia</span></li></ul></div>'
            '<div id="demo"><div class="appwrap"><iframe class="appdemo" src="%sdemos/app.html" title="Demo interactiva de GrowiApp: elegí tu rubro y mirá el panel" height="760"></iframe></div>'
            '<p class="cap">Demo real de GrowiApp con datos ilustrativos. Elegí un rubro y los datos cambian.</p></div></div></section>\n'
            % (ph(pg, "GrowiApp"), btn(msg_demo, "app-hero-demo-whatsapp", "Solicitar una demo de 20 minutos"), P(15, True), P(49, True), rel))
    items = [("Cada venta registrada al momento", "para saber cuánto ganaste, por producto y por hora"), ("Cierre de caja automático", "sin hacer cuentas al final del día: el número está solo"),
             ("Control de stock con alertas", "te avisa cuando un producto está por agotarse, antes de quedarte sin nada"), ("Agenda de turnos y reservas", "reemplazás el cuaderno por una agenda digital que nunca se pierde"),
             ("Ficha de clientes", "historial, preferencias y frecuencia de visita de cada cliente"), ("Reportes y todos los medios de pago", "efectivo, Mercado Pago y transferencias en un mismo registro, con reportes por día y producto")]
    inc = ('<section class="sec" id="incluye" aria-labelledby="h-inc"><div class="w"><p class="eyebrow">Qué incluye</p><h2 id="h-inc">Todo lo que necesitás. Nada que no uses.</h2><ul class="feat">%s</ul></div></section>\n'
           % "".join("<li><div><b>%s</b><span>%s</span></div></li>" % (E(a), E(b)) for a, b in items))
    rub_desc = {"cafeterias": "Mesas, comandas, stock y caja", "peluquerias": "Agenda, fichas de clientes y cobros", "talleres": "Historial de cada trabajo y entregas", "retail": "Ventas, stock y caja del mostrador"}
    rub = ('<section class="sec tint" id="rubros" aria-labelledby="h-rub"><div class="w"><p class="eyebrow">GrowiApp por rubro</p><h2 id="h-rub">Mirá cómo queda en tu tipo de negocio.</h2><div class="rubros2">%s</div></div></section>\n'
           % "".join('<a href="%s" data-track="app-rubro-%s"><b>%s</b><span>%s</span><i aria-hidden="true">→</i></a>' % (pg.u(r), t, n, rub_desc[t]) for n, r, t in RUBROS))
    def cta(plan): return btn("Hola Growi, quiero consultar por GrowiApp, plan %s.\n\nMi rubro:\nCuántas personas lo usarían:" % plan, "app-pricing-whatsapp", "Consultar por el plan %s" % plan, "wide")
    per = '<br><span data-period-note>Pago mensual. Cancelás cuando quieras.</span>'
    t1 = ticket("Plan 01", "Start", "Para empezar con una persona y una sucursal.", ["1 usuario", "1 sucursal", "Ventas, caja y stock", "Turnos y reservas", "Ficha de clientes", "Reportes simples", "Soporte por WhatsApp"],
                ("Por mes", money(15, "/mes", True)), "+ %s de puesta en marcha, una sola vez%s" % (P(49), per), cta("Start"))
    t2 = ticket("Plan 02", "Pro", "Para equipos que cargan ventas o turnos a la vez.", ["Hasta 3 usuarios, cada uno con su acceso", "1 sucursal", "Todo lo de Start", "~Factura electrónica ARCA: próximamente, todavía no disponible"],
                ("Por mes", money(29, "/mes", True)), "+ %s de puesta en marcha, una sola vez%s" % (P(149), per), cta("Pro"), "Recomendado si son varios")
    t3 = ticket("Plan 03", "Multi", "Para más de una sucursal.", ["Hasta 5 usuarios", "Hasta 2 sucursales", "Todo lo de Pro", "Reportes avanzados por sucursal", "WhatsApp prioritario"],
                ("Por mes", money(49, "/mes", True)), "+ %s de puesta en marcha, una sola vez%s" % (P(249), per), cta("Multi"))
    precios = ('<section class="sec" id="precios" aria-labelledby="h-pre"><div class="w"><p class="eyebrow">Precios</p><h2 id="h-pre">Un pago de puesta en marcha y un abono mensual fijo.</h2>'
               '<p class="lead">Lo armamos, cargamos tus datos y te enseñamos a usarlo. Lo que te decimos es lo que pagás.</p><p class="l1n">Hoy solo recibimos consultas: todavía no se contrata ni se paga.</p>'
               '<div class="tk-tools">%s<div class="seg" role="group" aria-label="Período de pago"><button type="button" data-period="monthly" class="active" aria-pressed="true">Mensual</button><button type="button" data-period="annual" aria-pressed="false">Anual −15%%</button></div></div>'
               '<div class="tickets">%s%s%s</div>'
               '<p class="note" style="max-width:86ch;margin-top:34px">Todos los planes incluyen la configuración inicial hecha por nuestro equipo y 1 hora de capacitación en vivo. Garantía de 7 días desde que GrowiApp queda andando: si no funciona como prometimos, te devolvemos el 100%% de la puesta en marcha. Los descuentos no se acumulan: si te corresponde más de uno, se aplica el mejor. %s</p></div></section>\n'
               % (cur_toggle(), t1, t2, t3, E(L1_PRECIOS)))
    flow = ('<section class="sec tint" aria-labelledby="h-fl"><div class="w"><div class="band"><div><h3 id="h-fl">¿Querés recibir un resumen de tus ventas sin armarlo vos?</h3><p style="margin-top:8px;max-width:62ch">Los Reportes de GrowiFlow arman un resumen periódico con lo importante marcado. Se arman a medida a partir de los datos que ya cargás. Sale %s, pago único, y por ser cliente de GrowiApp tenés 10%% de descuento.</p></div>'
            '<a class="btn o" href="%s" data-track="app-flow-reportes">Ver los reportes →</a></div></div></section>\n' % (P(89), pg.u("flow/") + "#reportes"))
    faqp = l1_faq("app", [0, 1, 3, 4, 7, 9])
    pre = ('<section class="sec" id="preguntas" aria-labelledby="h-faq"><div class="w faq-g"><div><p class="eyebrow">Preguntas</p><h2 id="h-faq">Lo que todos preguntan antes de empezar.</h2></div>%s</div></section>\n' % faq(faqp))
    cie = cierre("¿Querés ver cómo quedaría para tu negocio?", "Pedí una demo de 20 minutos armada con tu rubro. Coordinamos día y horario según disponibilidad.", btn(msg_demo, "app-final-demo-whatsapp", "Solicitar una demo de 20 minutos"))
    return (head(pg, "GrowiApp: sistema de gestión para comercios | Growi", "Ventas, caja, stock, turnos y clientes en una sola pantalla, desde el celular. Desde USD 15 por mes. Probá la demo con tu rubro.", "og-app.png", l1ld="app", faqs=faqp)
            + header(pg, "app") + subnav([("demo", "Demo"), ("incluye", "Qué incluye"), ("rubros", "Por rubro"), ("precios", "Precios"), ("preguntas", "Preguntas")], "app")
            + '<main id="contenido">\n' + hero + inc + rub + caso_cafe(rel, pg.u("app/cafeterias/")) + precios + flow + pre + cie + otras(pg, "app") + '</main>\n'
            + footer(pg, "Hola Growi, quiero consultar por GrowiApp.\n\nMi rubro:\nCuántas personas lo usarían:", "app"))

# ================================================================== RUBROS DE GROWIAPP
RUB = {
 "cafeterias": dict(demo="cafeteria", nombre="cafetería", og="og-cafeterias.png", l1="app/cafeterias", tit="GrowiApp para cafeterías y bares",
   h1="Manejá tu cafetería <mark class=\"sweep\">sin perder ni una venta</mark> en una libreta.", cta="Quiero ordenar mi cafetería",
   lead="Ventas, caja, stock y reservas en una sola pantalla. Sin planillas ni papelitos sueltos. Te lo dejamos con tu carta y tus precios ya cargados y, antes de empezar, te confirmamos una fecha estimada de entrega.",
   intro="No es que no sepas llevar tu negocio. Es que tu cafetería creció más rápido que tus herramientas.",
   pains=[("El cuaderno de reservas", "Alguien anota una mesa a mano, otro no se entera, y terminás con dos reservas pisadas el sábado a la noche."), ("El stock que «se sabe de memoria»", "Te enterás de que faltan medialunas cuando el cliente ya las pidió, no antes de abrir."),
          ("La caja del fin de mes", "Cerrás caja a ojo y a fin de mes nadie sabe bien cuánto se vendió de qué."), ("El empleado que se va", "Y se lleva puesto el único método que funcionaba, porque estaba todo en su cabeza.")],
   feats=[("Caja y ventas en un toque", "Cargás la venta desde el celular o la tablet del mostrador, en el momento.", "Sabés cuánto vendiste hoy sin esperar al cierre."), ("Stock que te avisa antes de que falte", "Cargás lo que tenés y GrowiApp te muestra qué se está por terminar.", "Nunca más «hoy no hay» a media mañana."),
          ("Reservas de mesa ordenadas", "Cada reserva queda anotada en un solo lugar, no en el cuaderno ni en la cabeza de alguien.", "Se terminan las mesas pisadas un sábado a la noche."), ("Reportes simples de qué se mueve", "Un vistazo rápido a qué se vendió más y en qué horario.", "Sabés a qué hora reforzar el mostrador.")],
   faq=[0, 1, 3, 4]),
 "peluquerias": dict(demo="peluqueria", nombre="peluquería", og="og-peluquerias.png", l1="app/peluquerias", tit="GrowiApp para peluquerías y centros de estética",
   h1="Turnos ordenados, <mark class=\"sweep\">sin depender de mensajes sueltos</mark>.", cta="Quiero ordenar mi salón",
   lead="Agenda, ficha de cada cliente y caja en una sola pantalla. Se acabaron los turnos duplicados por WhatsApp y las fichas perdidas en cuadernos. Te lo dejamos con tus servicios y horarios ya cargados y, antes de empezar, te confirmamos una fecha estimada de entrega.",
   intro="Atender bien ya sabés. Lo que falla es la agenda, que vive repartida entre WhatsApp, una libreta y la memoria de quien atiende el mostrador.",
   pains=[("El turno duplicado", "Dos clientas a la misma hora porque una lo pidió por WhatsApp y otra por Instagram, y nadie las cruzó."), ("La ficha que no aparece", "No te acordás qué color de tinte usó la última vez, o qué tratamiento no le funcionó a ese cliente."),
          ("El WhatsApp que no para", "Confirmás, reprogramás y cancelás turnos a mano, uno por uno, todo el día."), ("El profesional que se toma franco", "Y su agenda queda en su celular personal, no en ningún lado que el resto del equipo pueda ver.")],
   feats=[("Todos los turnos en una sola agenda", "Cada turno queda en un solo lugar, desde el celular. Si son varios atendiendo a la vez, con el plan Pro cada uno tiene su propio acceso.", "Se terminan los turnos duplicados o pisados."), ("Ficha de cada cliente", "El historial de servicios, las preferencias y las notas quedan guardados y a mano en cada turno.", "Atendés mejor sin depender de la memoria."),
          ("Caja y cobros en el momento", "Cargás el cobro del servicio al cerrar el turno, sin planilla aparte.", "Sabés cuánto facturaste hoy, sin esperar al cierre."), ("Reportes simples", "Un vistazo rápido a qué servicios se hacen más y cuánto entró.", "Decidís horarios y precios con datos reales.")],
   faq=[0, 1, 3, 4]),
 "talleres": dict(demo="taller", nombre="taller", og="og-talleres.png", l1="app/talleres", tit="GrowiApp para talleres y servicios técnicos",
   h1="El historial de cada trabajo, <mark class=\"sweep\">a un toque de distancia</mark>.", cta="Quiero ordenar mi taller",
   lead="Turnos, ficha de cada cliente y el historial completo de reparaciones o servicios, en una sola pantalla. Nada de fichas de papel perdidas ni «¿qué le hicimos la última vez?». Antes de empezar, te confirmamos una fecha estimada de entrega.",
   intro="El trabajo lo hacés bien. Lo que se pierde es el historial de cada cliente, que vive en tu cabeza, en un cuaderno o repartido entre chats de WhatsApp.",
   pains=[("«¿Qué le hicimos la última vez?»", "El cliente vuelve por el mismo auto o electrodoméstico y nadie se acuerda qué se le reparó antes."), ("El trabajo que nadie sabe en qué quedó", "El cliente llama para saber si ya está listo y hay que salir a preguntar quién lo agarró."),
          ("La agenda de entregas a mano", "Anotás en una libreta cuándo entregás cada trabajo y se te mezclan las fechas."), ("La plata que no sabés bien de dónde salió", "Cobrás en efectivo, transferencia y a veces «después te pago», y a fin de mes no cierra la cuenta.")],
   feats=[("Historial completo por cliente", "Cada trabajo queda guardado en la ficha del cliente, a mano para la próxima vez.", "Nunca más «¿qué le hicimos la última vez?»."), ("Turnos y entregas en una agenda", "Sabés qué trabajo entra, cuándo se entrega y quién lo está esperando.", "Se terminan las fechas mezcladas en la libreta."),
          ("Cobros ordenados por trabajo", "Cargás el cobro al entregar y queda asociado al cliente y al trabajo, no perdido en un chat.", "Sabés qué cobraste y por qué trabajo."), ("Reportes simples de lo que entra", "Un vistazo rápido a cuánto entró en el mes y de qué tipo de trabajo.", "Sabés qué tipo de trabajo te deja más.")],
   faq=[0, 1, 3, 4]),
 "retail": dict(demo="cafeteria", nombre="comercio", og="og-retail.png", l1="app/retail", tit="GrowiApp para kioscos y comercios de barrio",
   h1="Sabé qué se vende, <mark class=\"sweep\">qué falta y dónde ajustar</mark>.", cta="Quiero ordenar mi comercio",
   lead="Ventas, stock y caja en una sola pantalla. Dejá de enterarte de que falta mercadería cuando el cliente ya la pidió, o de cerrar caja a ojo. Te lo dejamos con tus productos y precios ya cargados y, antes de empezar, te confirmamos una fecha estimada de entrega.",
   intro="Tu negocio lo conocés. Lo que pasa es que el control vive repartido entre la caja, tu cabeza y a veces una planilla que nadie actualiza.",
   pains=[("El producto que «se sabe que hay»", "Te enterás de que no queda stock cuando el cliente ya lo pidió en el mostrador."), ("La caja que no cierra", "A fin de día contás la plata y no coincide con lo que «debería haber entrado»."),
          ("No sabés qué se vende más", "Comprás mercadería a ojo, sin saber realmente qué sale rápido y qué se queda pegado en la góndola."), ("El empleado que atiende «a su manera»", "Cada uno anota las ventas distinto, y armar un número real del día es un trabajo aparte.")],
   feats=[("Ventas y caja en un toque", "Cargás cada venta desde el mostrador, en el momento en que pasa.", "Sabés cuánto vendiste hoy, sin esperar al cierre."), ("Stock que te avisa antes de que falte", "Cargás lo que tenés y GrowiApp te muestra qué se está por terminar.", "Nunca más un «no hay» en pleno mostrador."),
          ("Fichas de clientes frecuentes", "Guardás los datos de los clientes que vuelven y qué suelen llevar.", "Atendés mejor sin depender de la memoria."), ("Reportes simples de qué se mueve", "Un vistazo rápido a qué productos salen más y cuáles conviene dejar de reponer.", "Dejás de reponer lo que no sale.")],
   faq=[0, 1, 3, 4]),
}
RUB_PRE = {"cafeterias": 0, "peluquerias": 0, "talleres": 0, "retail": 0}

def rubro(k):
    d = RUB[k]; pg = Pg("app/%s/" % k); rel = pg.rel
    msg = "Hola Growi, quiero consultar por GrowiApp para mi %s.\n\nMi negocio:\nCuántas personas lo usarían:" % d["nombre"]
    faqp = l1_faq(d["l1"], d["faq"])
    nota_demo = "Demo real de GrowiApp con datos ilustrativos." + (" Se muestra con datos de ejemplo de una cafetería." if k == "retail" else "")
    hero = ('<section class="ph" data-sticky-hide aria-labelledby="h1"><div class="w ph-g"><div>%s<h1 id="h1">%s</h1><p class="sub">%s</p>'
            '<div class="cta-row" style="display:flex;flex-wrap:wrap;gap:12px;margin-top:30px">%s<a class="btn o" href="#precio">Ver cuánto sale ↓</a></div>'
            '<ul class="proof"><li><span>Desde %s por mes + %s de puesta en marcha, una sola vez</span></li><li><span>Garantía de 7 días · Sin permanencia</span></li></ul></div>'
            '<div id="demo"><div class="appwrap"><iframe class="appdemo" src="%sdemos/app.html?rubro=%s" title="Demo interactiva de GrowiApp con datos de un negocio de ejemplo" height="760"></iframe></div><p class="cap">%s</p></div></div></section>\n'
            % (ph(pg, d["tit"].replace("GrowiApp para ", "").capitalize(), ("GrowiApp", "app/")), d["h1"], E(d["lead"]), btn(msg, "app-%s-hero-whatsapp" % k, d["cta"]), P(15, True), P(49, True), rel, d["demo"], nota_demo))
    pains = ('<section class="sec" id="te-suena" aria-labelledby="h-d"><div class="w"><p class="eyebrow">¿Te suena?</p><h2 id="h-d">%s</h2><ul class="feat">%s</ul></div></section>\n'
             % (E(d["intro"]), "".join("<li><div><b>%s</b><span>%s</span></div></li>" % (E(a), E(b)) for a, b in d["pains"])))
    feats = ('<section class="sec tint" id="que-hace" aria-labelledby="h-f"><div class="w"><p class="eyebrow">Lo que hace por tu %s</p><h2 id="h-f">De la libreta al control real, sin cambiar cómo atendés.</h2><ul class="ben">%s</ul></div></section>\n'
             % (d["nombre"], "".join("<li><b>%s</b><span>%s</span><em>%s</em></li>" % (E(a), E(b), E(c)) for a, b, c in d["feats"])))
    t1 = ticket("Plan Start", "GrowiApp Start", "Lo armamos, cargamos tus datos y te enseñamos a usarlo.", ["Ventas, caja y stock", "Turnos y reservas", "Ficha de clientes", "Reportes simples", "1 usuario (con varios cargando a la vez, el plan Pro trae hasta 3)", "Soporte por WhatsApp", "Sin permanencia: cancelás cuando quieras"],
                ("Por mes", money(15, "/mes")), "+ %s de puesta en marcha, una sola vez. Garantía de 7 días desde que queda andando." % P(49), btn("Hola Growi, quiero consultar por GrowiApp, plan Start.\n\nMi negocio: %s" % d["nombre"], "app-%s-pricing-whatsapp" % k, "Consultar por GrowiApp", "wide"))
    precio = ('<section class="sec" id="precio" aria-labelledby="h-p"><div class="w precio-g"><div><p class="eyebrow">Cuánto sale</p><h2 id="h-p">Un pago único de puesta en marcha y un abono mensual fijo.</h2><p class="lead">Lo que te decimos es lo que pagás. <a href="%s#precios" class="tl">Ver todos los planes</a></p><p class="l1n">Hoy solo recibimos consultas: todavía no se contrata ni se paga.</p><div class="tk-tools">%s</div></div>'
              '<div class="tickets one">%s</div></div><div class="w"><p class="note" style="max-width:86ch;margin-top:26px">%s</p></div></section>\n' % (pg.u("app/"), cur_toggle(), t1, E(L1_PRECIOS)))
    caso = caso_cafe(rel, pg.u("app/")) if k == "cafeterias" else ""
    pre = ('<section class="sec tint" id="preguntas" aria-labelledby="h-faq"><div class="w faq-g"><div><p class="eyebrow">Antes de que preguntes</p><h2 id="h-faq">Lo que se pregunta primero.</h2></div>%s</div></section>\n' % faq(faqp))
    otros = "".join('<a href="%s">%s<i aria-hidden="true">→</i></a>' % (pg.u(r), n) for n, r, t in RUBROS if t != k)
    mas = ('<section class="sec" aria-labelledby="h-o"><div class="w"><h2 id="h-o" class="h-sm">¿Tenés otro tipo de negocio? GrowiApp también se arma para:</h2><div class="rubros2 small">%s<a href="%s">Sistema + sitio web<i aria-hidden="true">→</i></a></div></div></section>\n' % (otros, pg.u("combo/")))
    cie = cierre("Tu %s, lista para empezar a trabajar." % d["nombre"], "Contanos cómo trabajás hoy y lo armamos con tus datos. Sin vueltas, sin letra chica. Te respondemos por WhatsApp de lunes a sábado, de 9 a 19 hs.", btn(msg, "app-%s-final-whatsapp" % k, d["cta"]))
    return (head(pg, d["tit"] + " | Growi", d["lead"][:155], d["og"], l1ld=d["l1"], faqs=faqp)
            + header(pg, "app") + subnav([("demo", "Demo"), ("te-suena", "¿Te suena?"), ("que-hace", "Qué hace"), ("precio", "Precio"), ("preguntas", "Preguntas")], "app")
            + '<main id="contenido">\n' + hero + pains + feats + caso + precio + pre + mas + cie + '</main>\n'
            + footer(pg, msg, "app-" + k))
