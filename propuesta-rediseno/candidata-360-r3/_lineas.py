# Páginas de línea R3. Los precios (USD) y las condiciones comerciales son los vigentes; cambia la experiencia y se recorta la repetición.
from _lib import *
from _demos import *
from _r33 import app_tour, app_sim
from _r36 import scene_app, hero36
import re, io, json

# F3.3: dos respuestas heredadas prometían sin condiciones el uso sin conexión y la exportación a Excel; ahora dependen del presupuesto del proyecto.
FAQ_F33 = (
    ("Tus datos te los llevás en Excel.", "Tus datos son tuyos; la exportación a Excel se acuerda en el presupuesto de tu proyecto."),
    ("Sí, podés seguir trabajando. Si se corta internet, seguís cargando ventas y turnos como siempre: quedan guardados en el dispositivo. Cuando vuelve la conexión, se sincronizan solos con el resto del sistema. Para el día a día, con los datos del celular alcanza.",
     "Puede, según el alcance de tu proyecto. El funcionamiento sin conexión y la sincronización posterior se incluyen cuando figuran en el presupuesto; antes de empezar te confirmamos por escrito si tu caso los contempla."),
)
FAQ_F33 += (("Sí. Podés pedir una demo de 20 minutos por WhatsApp. Coordinamos día y horario según disponibilidad.",
             "Podés explorar los dos ejemplos de esta página. Si querés, coordinamos una charla de 20 minutos por WhatsApp: nos contás cómo trabajás y evaluamos una propuesta para tu negocio. Coordinamos día y horario según disponibilidad."),)  # F3.4: el CTA ya no ofrece una demo preparada
def _faq_f33(txt):
    for a, b in FAQ_F33: txt = txt.replace(a, b)
    return txt

def l1_faq(path, idx):
    s = io.open(os.path.join(L1ROOT, path, "index.html"), encoding="utf-8").read()
    # F3.4: un par es un <details> completo; antes la regex podía unir el <summary> de "Compará los planes" con la respuesta de otra sección.
    pares = re.findall(r"<details[^>]*>\s*<summary>((?:(?!</summary>).)*?)<i[^>]*>(?:(?!</summary>).)*</summary>\s*<div class=\"faq-body\">((?:(?!</details>).)*?)</div>\s*</details>", s, flags=re.S)
    assert len(pares) == s.count('class="faq-body"'), (path, len(pares))
    def t(x): return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", x))).strip().replace(" ,", ",").replace(" .", ".")
    return [(t(pares[i][0]), _faq_f33(t(pares[i][1]))) for i in idx]

def ph(pg, cur_label, parent=None):
    crumb = '<a href="%s">Growi</a> / ' % pg.u("")
    if parent: crumb += '<a href="%s">%s</a> / ' % (pg.u(parent[1]), parent[0])
    return '<p class="crumb">%s<span>%s</span></p>' % (crumb, cur_label)

# ================================================================== GROWIAPP
def app():
    pg = Pg("app/"); rel = pg.rel
    msg_demo = "Hola Growi, quiero coordinar una charla de 20 minutos para contarles sobre mi negocio y conocer qué podemos hacer con GrowiApp. ¿Qué disponibilidad tienen?"
    hero = hero36(pg, ph(pg, "GrowiApp"), 'Tu sistema de gestión, <mark class="sweep">listo para trabajar</mark>.',
                  "Registrás ventas, controlás el stock, llevás los turnos y cerrás la caja desde el celular. Lo armamos con los datos de tu negocio y te confirmamos una fecha estimada de entrega antes de empezar.",
                  btn(msg_demo, "app-hero-demo-whatsapp", "Coordinar una charla de 20 minutos") + '<a class="btn o" href="#precios">Ver precios ↓</a>',
                  "Desde %s por mes + %s de puesta en marcha, una sola vez · Garantía prevista de 7 días · Sin permanencia" % (P(15, True), P(49, True)), scene_app(rel))
    real = ('<section class="sec real" id="interfaz" aria-labelledby="h-real"><div class="w"><p class="eyebrow">Dos ejemplos funcionando</p><h2 id="h-real">Registrá una venta o agendá un turno. Después mirá qué cambia.</h2>'
            '<style>.cn2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px;margin-top:8px}@media(max-width:860px){.cn2{grid-template-columns:minmax(0,1fr)}}</style>'
            '<div class="cn2">%s%s</div>%s</div></section>\n'
            % (sbx_hero("cafeterias", pg, rel, True, False), sbx_hero("peluquerias", pg, rel, False, False), '<p class="cap">Los datos son ficticios y las funciones y el alcance se definen para cada proyecto. Fotografía de ambientación generada con IA.</p>'))
    items =[("Cada venta registrada al momento", "para saber cuánto ganaste, por producto y por hora"), ("Cierre de caja sin cuentas", "sin hacer cuentas al final del día: el sistema suma lo que cargaste"),
             ("Control de stock con alertas", "te avisa cuando un producto está por agotarse, antes de quedarte sin nada"), ("Agenda de turnos y reservas", "reemplazás el cuaderno por una agenda digital"),
             ("Ficha de clientes", "datos, preferencias y frecuencia de visita de cada cliente, según lo que definamos para tu negocio"), ("Reportes y todos los medios de pago", "efectivo, Mercado Pago y transferencias en un mismo registro, con reportes por día y producto")]
    inc = ('<section class="sec" id="incluye" aria-labelledby="h-inc"><div class="w"><p class="eyebrow">Qué incluye</p><h2 id="h-inc">Todo lo que necesitás. Nada que no uses.</h2><p class="lead">Estas son las capacidades habituales. En cada proyecto definimos cuáles necesitás y cómo se adaptan a tu negocio.</p><ul class="feat">%s</ul></div></section>\n'
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
    precios = ('<section class="sec" id="precios" aria-labelledby="h-pre"><div class="w"><p class="eyebrow">Precios</p><h2 id="h-pre">Puesta en marcha y abono mensual.</h2>'
               '<p class="lead">Un punto de partida para tu negocio. Los planes te ayudan a conocer la inversión y las funcionalidades habituales. Definimos con vos el alcance final, las adaptaciones y el presupuesto por escrito antes de empezar.</p>'
               '<div class="tk-tools">%s<div class="seg" role="group" aria-label="Período de pago"><button type="button" data-period="monthly" class="active" aria-pressed="true">Mensual</button><button type="button" data-period="annual" aria-pressed="false">Anual −15%%</button></div></div>'
               '<div class="tickets">%s%s%s</div>'
               '<p class="note" style="max-width:86ch;margin-top:34px">Todos los planes incluyen la configuración inicial hecha por nuestro equipo y 1 hora de capacitación en vivo. Garantía prevista de 7 días desde que GrowiApp queda andando: si no funciona como prometimos, te devolveríamos el 100%% de la puesta en marcha. Los descuentos no se acumulan: si te corresponde más de uno, se aplica el mejor. %s</p></div></section>\n'
               % (cur_toggle(), t1, t2, t3, E(L1_PRECIOS)))
    flow = ('<section class="sec tint" aria-labelledby="h-fl"><div class="w"><div class="band"><div><h3 id="h-fl">¿Querés recibir un resumen de tus ventas sin armarlo vos?</h3><p style="margin-top:8px;max-width:62ch">Los Reportes de GrowiFlow arman un resumen periódico con lo importante marcado. Se arman a medida a partir de los datos que ya cargás. Sale %s, pago único, y quien ya es cliente de GrowiApp tendrá 10%% de descuento cuando se abra la contratación.</p></div>'
            '<a class="btn o" href="%s" data-track="app-flow-reportes">Ver los reportes →</a></div></div></section>\n' % (P(89), pg.u("flow/") + "#reportes"))
    faqp = l1_faq("app", [0, 1, 3, 4, 7, 9])
    pre = ('<section class="sec" id="preguntas" aria-labelledby="h-faq"><div class="w faq-g"><div><p class="eyebrow">Preguntas</p><h2 id="h-faq">Lo que todos preguntan antes de empezar.</h2></div>%s</div></section>\n' % faq(faqp))
    cie = cierre("¿Querés contarnos cómo trabajás?", "Conversá 20 minutos con una persona del equipo: nos contás cómo funciona tu negocio y evaluamos qué propuesta tiene sentido para vos. Coordinamos día y horario según disponibilidad.", btn(msg_demo, "app-final-demo-whatsapp", "Coordinar una charla de 20 minutos"))
    return (head(pg, "GrowiApp: sistema de gestión para comercios | Growi", "Ventas, caja, stock, turnos y clientes en una sola pantalla, desde el celular. Desde USD 15 por mes. Mirá dos ejemplos funcionando.", "og-app.png", l1ld="app", faqs=faqp)
            + header(pg, "app") + subnav([("demo", "Cómo funciona"), ("interfaz", "Ejemplos"), ("incluye", "Qué incluye"), ("rubros", "Por rubro"), ("precios", "Precios"), ("preguntas", "Preguntas")], "app")
            + '<main id="contenido">\n' + hero + real + inc + rub + caso_cafe(rel, pg.u("app/cafeterias/")) + precios + flow + pre + cie + otras(pg, "app") + '</main>\n'
            + footer(pg, "Hola Growi, quiero consultar por GrowiApp.\n\nMi rubro:\nCuántas personas lo usarían:", "app"))

# ================================================================== RUBROS DE GROWIAPP
RUB = {
 "cafeterias": dict(demo="cafeteria", nombre="cafetería", og="og-cafeterias.png", l1="app/cafeterias", tit="GrowiApp para cafeterías y bares",
   h1="Manejá tu cafetería <mark class=\"sweep\">sin depender de la libreta</mark>.", cta="Quiero ordenar mi cafetería",
   lead="Ventas, caja, stock y reservas en una sola pantalla. Sin planillas ni papelitos sueltos. Te lo dejamos con tu carta y tus precios ya cargados y, antes de empezar, te confirmamos una fecha estimada de entrega.",
   intro="No es que no sepas llevar tu negocio. Es que tu cafetería creció más rápido que tus herramientas.",
   pains=[("El cuaderno de reservas", "Alguien anota una mesa a mano, otro no se entera, y terminás con dos reservas pisadas el sábado a la noche."), ("El stock que «se sabe de memoria»", "Te enterás de que faltan medialunas cuando el cliente ya las pidió, no antes de abrir."),
          ("La caja del fin de mes", "Cerrás caja a ojo y a fin de mes nadie sabe bien cuánto se vendió de qué."), ("El empleado que se va", "Y se lleva puesto el único método que funcionaba, porque estaba todo en su cabeza.")],
   feats=[("Caja y ventas en un toque", "Cargás la venta desde el celular o la tablet del mostrador, en el momento.", "Sabés cuánto vendiste hoy sin esperar al cierre."), ("Stock que te avisa antes de que falte", "Cargás lo que tenés y GrowiApp te muestra qué se está por terminar.", "Menos «hoy no hay» a media mañana."),
          ("Reservas de mesa ordenadas", "Cada reserva queda anotada en un solo lugar, no en el cuaderno ni en la cabeza de alguien.", "Menos mesas pisadas un sábado a la noche."), ("Reportes simples de qué se mueve", "Un vistazo rápido a qué se vendió más y en qué horario.", "Sabés a qué hora reforzar el mostrador.")],
   faq=[0, 1, 3, 4]),
 "peluquerias": dict(demo="peluqueria", nombre="peluquería", og="og-peluquerias.png", l1="app/peluquerias", tit="GrowiApp para peluquerías y centros de estética",
   h1="Turnos ordenados, <mark class=\"sweep\">sin depender de mensajes sueltos</mark>.", cta="Quiero ordenar mi salón",
   lead="Agenda, ficha de cada cliente y caja en una sola pantalla. Ordená los turnos en un solo lugar y dejá de depender de WhatsApp y de las fichas en cuadernos. Te lo dejamos con tus servicios y horarios ya cargados y, antes de empezar, te confirmamos una fecha estimada de entrega.",
   intro="Atender bien ya sabés. Lo que falla es la agenda, que vive repartida entre WhatsApp, una libreta y la memoria de quien atiende el mostrador.",
   pains=[("El turno duplicado", "Dos clientas a la misma hora porque una lo pidió por WhatsApp y otra por Instagram, y nadie las cruzó."), ("La ficha que no aparece", "No te acordás qué color de tinte usó la última vez, o qué tratamiento no le funcionó a ese cliente."),
          ("El WhatsApp que no para", "Confirmás, reprogramás y cancelás turnos a mano, uno por uno, todo el día."), ("El profesional que se toma franco", "Y su agenda queda en su celular personal, no en ningún lado que el resto del equipo pueda ver.")],
   feats=[("Todos los turnos en una sola agenda", "Cada turno queda en un solo lugar, desde el celular. Si son varios atendiendo a la vez, con el plan Pro cada uno tiene su propio acceso.", "Menos turnos duplicados o pisados."), ("Ficha de cada cliente", "El historial de servicios, las preferencias y las notas quedan guardados y a mano en cada turno.", "Atendés mejor sin depender de la memoria."),
          ("Caja y cobros en el momento", "Cargás el cobro del servicio al cerrar el turno, sin planilla aparte.", "Sabés cuánto facturaste hoy, sin esperar al cierre."), ("Reportes simples", "Un vistazo rápido a qué servicios se hacen más y cuánto entró.", "Decidís horarios y precios con datos reales.")],
   faq=[0, 1, 3, 4]),
 "talleres": dict(demo="taller", nombre="taller", og="og-talleres.png", l1="app/talleres", tit="GrowiApp para talleres y servicios técnicos",
   h1="El historial de cada trabajo, <mark class=\"sweep\">a un toque de distancia</mark>.", cta="Quiero ordenar mi taller",
   lead="Turnos, fichas de clientes y el historial de reparaciones o servicios que definamos juntos, en una sola pantalla. Nada de fichas de papel perdidas ni «¿qué le hicimos la última vez?». Antes de empezar, te confirmamos una fecha estimada de entrega.",
   intro="El trabajo lo hacés bien. Lo que se pierde es el historial de cada cliente, que vive en tu cabeza, en un cuaderno o repartido entre chats de WhatsApp.",
   pains=[("«¿Qué le hicimos la última vez?»", "El cliente vuelve por el mismo auto o electrodoméstico y nadie se acuerda qué se le reparó antes."), ("El trabajo que nadie sabe en qué quedó", "El cliente llama para saber si ya está listo y hay que salir a preguntar quién lo agarró."),
          ("La agenda de entregas a mano", "Anotás en una libreta cuándo entregás cada trabajo y se te mezclan las fechas."), ("La plata que no sabés bien de dónde salió", "Cobrás en efectivo, transferencia y a veces «después te pago», y a fin de mes no cierra la cuenta.")],
   feats=[("Historial por cliente", "Cada trabajo puede quedar guardado en la ficha del cliente, a mano para la próxima vez.", "Menos «¿qué le hicimos la última vez?»."), ("Turnos y entregas en una agenda", "Sabés qué trabajo entra, cuándo se entrega y quién lo está esperando.", "Menos fechas mezcladas en la libreta."),
          ("Cobros ordenados por trabajo", "Cargás el cobro al entregar y queda asociado al cliente y al trabajo, no perdido en un chat.", "Sabés qué cobraste y por qué trabajo."), ("Reportes simples de lo que entra", "Un vistazo rápido a cuánto entró en el mes y de qué tipo de trabajo.", "Sabés qué tipo de trabajo te deja más.")],
   faq=[0, 1, 3, 4]),
 "retail": dict(demo="cafeteria", nombre="comercio", og="og-retail.png", l1="app/retail", tit="GrowiApp para kioscos y comercios de barrio",
   h1="Sabé qué se vende, <mark class=\"sweep\">qué falta y dónde ajustar</mark>.", cta="Quiero ordenar mi comercio",
   lead="Ventas, stock y caja en una sola pantalla. Dejá de enterarte de que falta mercadería cuando el cliente ya la pidió, o de cerrar caja a ojo. Te lo dejamos con tus productos y precios ya cargados y, antes de empezar, te confirmamos una fecha estimada de entrega.",
   intro="Tu negocio lo conocés. Lo que pasa es que el control vive repartido entre la caja, tu cabeza y a veces una planilla que nadie actualiza.",
   pains=[("El producto que «se sabe que hay»", "Te enterás de que no queda stock cuando el cliente ya lo pidió en el mostrador."), ("La caja que no cierra", "A fin de día contás la plata y no coincide con lo que «debería haber entrado»."),
          ("No sabés qué se vende más", "Comprás mercadería a ojo, sin saber realmente qué sale rápido y qué se queda pegado en la góndola."), ("El empleado que atiende «a su manera»", "Cada uno anota las ventas distinto, y armar un número real del día es un trabajo aparte.")],
   feats=[("Ventas y caja en un toque", "Cargás cada venta desde el mostrador, en el momento en que pasa.", "Sabés cuánto vendiste hoy, sin esperar al cierre."), ("Stock que te avisa antes de que falte", "Cargás lo que tenés y GrowiApp te muestra qué se está por terminar.", "Menos «no hay» en pleno mostrador."),
          ("Clientes frecuentes", "Si lo sumamos a tu proyecto, guardás los datos de los clientes que vuelven y qué suelen llevar.", "Atendés mejor sin depender de la memoria."), ("Reportes simples de qué se mueve", "Un vistazo rápido a qué productos salen más y cuáles conviene dejar de reponer.", "Dejás de reponer lo que no sale.")],
   faq=[0, 1, 3, 4]),
}
RUB_PRE = {"cafeterias": 0, "peluquerias": 0, "talleres": 0, "retail": 0}

# ------------------------------------------------------------ Entrada a una sandbox funcional (Cafetería, Peluquería)
# Estilos propios de la sección (clases cn-*) en un <style> de la propia página: no se toca CSS compartido. Las capturas son reales (Playwright sobre la sandbox).
SBX_CSS = ('<style>'
    '.cn-stage{position:relative;isolation:isolate;overflow:hidden;border-radius:26px;background:#d9c9a8 var(--bg) center/cover;padding:clamp(16px,2.8vw,30px) clamp(14px,2.4vw,26px) clamp(18px,3.2vw,34px)}'
    '.cn-stage::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(24,18,10,.42),rgba(24,18,10,.64))}'
    '.cn-tab{display:block}.cn-dev{display:block;position:relative;padding:clamp(6px,1.1vw,11px);border-radius:clamp(14px,2.2vw,24px);background:linear-gradient(150deg,#323236 0%,#18181a 34%,#101012 62%,#2a2a2e 100%);'
    'box-shadow:inset 0 0 0 1px #55555b,0 0 0 1px #000,0 40px 60px -26px rgba(0,0,0,.8),0 14px 26px -12px rgba(0,0,0,.55)}'
    '.cn-dev img{display:block;width:100%;height:auto;border-radius:clamp(6px,.9vw,9px)}'
    '.cn-dev::before{content:"";position:absolute;top:clamp(2px,.45vw,4px);left:50%;width:4px;height:4px;margin-left:-2px;border-radius:50%;background:#0a0d12}'
    '.cn-ph{display:none}'
    '.cn-ph .cn-dev{padding:clamp(3px,.6vw,5px);border-radius:clamp(12px,2vw,20px)}.cn-ph .cn-dev img{border-radius:clamp(9px,1.5vw,15px)}.cn-ph .cn-dev::before{display:none}'
    '.cn-txt{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px 24px;margin-top:20px}'
    '.cn-txt p{margin:0;flex:1 1 240px;max-width:36ch;font-size:clamp(1.05rem,1.5vw,1.2rem);line-height:1.35;font-weight:600}'
    '@media(max-width:720px){.cn-tab{display:none}.cn-ph{display:block;width:min(260px,82%);margin:0 auto}.cn-stage{padding-bottom:clamp(18px,5vw,28px)}.cn-txt .btn{width:100%;justify-content:center}}'
    '</style>')
SBX = {
    "cafeterias": dict(ruta="demos/sandbox/cafeteria/", bg="url(%sassets/img/cafeteria-sala.webp)", tablet=("cafe-nogal-tablet.webp", 1400, 958), movil=("cafe-nogal-movil.webp", 780, 1580),
                       frase="Registrá una venta y mirá cómo se actualizan la caja, el stock y el resumen.", cta="Explorar Café Nogal", track="app-cafeterias-sandbox",
                       nota="Los datos son ficticios y las funciones y el alcance se definen para cada proyecto. Fotografía de ambientación generada con IA."),
    "peluquerias": dict(ruta="demos/sandbox/peluqueria/", bg="linear-gradient(135deg,#3a2159 0%,#5b2f8a 55%,#8a3d62 100%)", tablet=("bruma-tablet.webp", 1500, 1027), movil=("bruma-movil.webp", 782, 1580),
                        frase="Agendá un turno, atendelo y cobralo: mirá cómo se actualizan la agenda y la caja.", cta="Explorar Estudio Bruma", track="app-peluquerias-sandbox",
                        nota="Los datos son ficticios y las funciones y el alcance se definen para cada proyecto."),
}
def sbx_hero(k, pg, rel, css=True, nota=True):
    c = SBX[k]; u = pg.u(c["ruta"]); t, m = c["tablet"], c["movil"]
    bg = c["bg"] % rel if "%s" in c["bg"] else c["bg"]
    return ((SBX_CSS if css else '') + '<div class="cn"><div class="cn-stage" style="--bg:%s">'
            '<a class="cn-tab" href="%s" tabindex="-1" aria-hidden="true"><span class="cn-dev"><img src="%sassets/img/%s" width="%d" height="%d" alt=""></span></a>'
            '<a class="cn-ph" href="%s" tabindex="-1" aria-hidden="true"><span class="cn-dev"><img src="%sassets/img/%s" width="%d" height="%d" alt="" loading="lazy"></span></a></div>'
            '<div class="cn-txt"><p>%s</p><a class="btn k" href="%s" data-track="%s">%s</a></div>'
            '%s</div>'
            % (bg, u, rel, t[0], t[1], t[2], u, rel, m[0], m[1], m[2], c["frase"], u, c["track"], c["cta"], ('<p class="cap">%s</p>' % c["nota"]) if nota else ''))


# ------------------------------------------------------------ Escenas conceptuales por rubro (rubros que todavía no tienen sandbox funcional)
# Son ilustraciones estáticas con datos ficticios: no simulan una aplicación operable ni ofrecen «probarla». Cada una cuenta algo propio del rubro.
ESC_CSS = ('<style>'
    '.es{padding:clamp(18px,3vw,28px);border-radius:26px;background:linear-gradient(160deg,#fbf9f4,#ece7dc);border:1px solid rgba(12,12,12,.08);box-shadow:0 30px 70px -40px rgba(12,12,12,.45)}'
    '.es-eyebrow{margin:0 0 6px;font:600 12px/1.2 var(--mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:#5d5a52}'
    '.es h3{margin:0;font-size:clamp(1.3rem,2.2vw,1.7rem);line-height:1.15}.es-sub{margin:4px 0 0;color:#4d4a44}'
    '.es-tl{list-style:none;margin:20px 0 0;padding:0 0 0 22px;position:relative;display:grid;gap:12px}.es-tl::before{content:"";position:absolute;left:5px;top:8px;bottom:8px;width:2px;background:#cfc8b8}'
    '.es-tl li{position:relative;display:grid;grid-template-columns:62px 1fr;gap:2px 12px;padding:12px 14px;border-radius:14px;background:#fff;border:1px solid #e4ded0}'
    '.es-tl li::before{content:"";position:absolute;left:-22px;top:18px;width:12px;height:12px;border-radius:50%;background:#cfc8b8;box-shadow:0 0 0 3px #f5f1e8}'
    '.es-tl time{grid-row:1/3;font:600 13px var(--mono,monospace);color:#5d5a52;padding-top:2px}.es-tl b{font-size:16px}.es-tl span{font-size:14px;color:#4d4a44}'
    '.es-tl li.now{border:2px solid #b8860b;background:#fffaf0}.es-tl li.now::before{background:#b8860b}'
    '.es-pill.wait{background:#fdf0d2;color:#5e3d00;box-shadow:inset 0 0 0 1.5px #d9a93d}'
    '.es-foot{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin-top:16px;font-size:15px}.es-pill{padding:5px 12px;border-radius:999px;background:#1a6b47;color:#fff;font-weight:700;font-size:14px}'
    '.es-st{list-style:none;margin:18px 0 0;padding:0;display:grid;gap:10px}'
    '.es-st li{display:grid;grid-template-columns:1fr auto;gap:6px 12px;align-items:center;padding:12px 14px;border-radius:14px;background:#fff;border:1px solid #e4ded0}'
    '.es-st b{font-size:16px}.es-st span{font-size:14px;color:#4d4a44}.es-st .tag{padding:3px 10px;border-radius:999px;background:#fbe4df;color:#8c2616;font-weight:700;font-size:13px}.es-st .tag.ok{background:#e2efe7;color:#0f4a31}'
    '.es-bar{grid-column:1/-1;position:relative;height:8px;border-radius:4px;background:#eee8da;overflow:hidden}.es-bar i{display:block;height:100%;border-radius:4px;background:#c98512}.es-bar i.ok{background:#1a6b47}'
    '.es-rk{margin-top:18px;padding-top:14px;border-top:1px dashed #cfc8b8}.es-rk p{margin:0 0 8px;font-weight:700}.es-rk div{display:grid;grid-template-columns:130px 1fr 52px;gap:10px;align-items:center;margin:6px 0;font-size:14px}'
    '.es-rk i{display:block;height:10px;border-radius:5px;background:#1a6b47}'
    '</style>')
def escena_taller():
    return (ESC_CSS + '<div class="es"><p class="es-eyebrow">Historial de un vehículo</p><h3>Ford Ranger · AC 123 BD</h3><p class="es-sub">Cliente: Ricardo Domínguez</p>'
            '<ol class="es-tl"><li><time>14 mar</time><b>Service completo</b><span>Aceite y filtros · 82.400 km</span></li>'
            '<li><time>02 ago</time><b>Frenos delanteros</b><span>Pastillas y discos</span></li>'
            '<li class="now"><time>Hoy</time><b>Embrague</b><span>Presupuesto enviado al cliente</span></li></ol>'
            '<div class="es-foot"><span class="es-pill wait">Esperando aprobación</span><span>La fecha de entrega se confirma cuando se apruebe el presupuesto.</span></div></div>'
            '<p class="cap">Ilustración con datos ficticios. Las funciones y el alcance se definen para cada proyecto.</p>')
def escena_retail():
    items = [("Yerba 1 kg", "Quedan 3 · mínimo 6", 50, False), ("Gaseosa 2,25 L", "Quedan 5 · mínimo 8", 62, False), ("Galletitas surtidas", "Quedan 12 · mínimo 10", 100, True), ("Alfajor triple", "Quedan 30 · mínimo 12", 100, True)]
    li = "".join('<li><div><b>%s</b><br><span>%s</span></div><span class="tag%s">%s</span><div class="es-bar"><i class="%s" style="width:%d%%"></i></div></li>' % (n, d, " ok" if ok else "", "En orden" if ok else "Reponer", "ok" if ok else "", w) for n, d, w, ok in items)
    rk = "".join('<div><span>%s</span><i style="width:%d%%"></i><b>%d u.</b></div>' % (n, w, u) for n, w, u in [("Gaseosa 2,25 L", 100, 42), ("Yerba 1 kg", 74, 31), ("Alfajor triple", 64, 27)])
    return (ESC_CSS + '<div class="es"><p class="es-eyebrow">Stock de la semana</p><h3>Esto conviene reponer</h3>'
            '<ul class="es-st">%s</ul><div class="es-rk"><p>Lo que más salió</p>%s</div></div>'
            '<p class="cap">Ilustración con datos ficticios. Las funciones y el alcance se definen para cada proyecto.</p>' % (li, rk))

def rubro(k):
    d = RUB[k]; pg = Pg("app/%s/" % k); rel = pg.rel
    msg = "Hola Growi, quiero consultar por GrowiApp para mi %s.\n\nMi negocio:\nCuántas personas lo usarían:" % d["nombre"]
    faqp = l1_faq(d["l1"], d["faq"])
    nota_demo = "Demo interactiva de GrowiApp." + (" Se muestra con datos de ejemplo de una cafetería." if k == "retail" else "")
    # Rubros con sandbox funcional propia: la demostración genérica se reemplaza por UNA invitación con capturas reales de esa sandbox (los demás rubros siguen igual).
    if k in SBX:
        demo_blk = sbx_hero(k, pg, rel)
    elif k == "talleres":
        demo_blk = escena_taller()
    elif k == "retail":
        demo_blk = escena_retail()
    else:
        demo_blk = '%s<p class="cap">%s</p>' % (app_tour(rel, d["demo"]), nota_demo)
    hero = ('<section class="ph" data-sticky-hide aria-labelledby="h1"><div class="w ph-g"><div>%s<h1 id="h1">%s</h1><p class="sub">%s</p>'
            '<div class="cta-row" style="display:flex;flex-wrap:wrap;gap:12px;margin-top:30px">%s<a class="btn o" href="#precio">Ver cuánto sale ↓</a></div>'
            '<ul class="proof"><li><span>Desde %s por mes + %s de puesta en marcha, una sola vez</span></li><li><span>Garantía prevista de 7 días · Sin permanencia</span></li></ul></div>'
            '<div id="demo">%s</div></div></section>\n'
            % (ph(pg, d["tit"].replace("GrowiApp para ", "").capitalize(), ("GrowiApp", "app/")), d["h1"], E(d["lead"]), btn(msg, "app-%s-hero-whatsapp" % k, d["cta"]), P(15, True), P(49, True), demo_blk))
    pains = ('<section class="sec" id="te-suena" aria-labelledby="h-d"><div class="w"><p class="eyebrow">¿Te suena?</p><h2 id="h-d">%s</h2><ul class="feat">%s</ul></div></section>\n'
             % (E(d["intro"]), "".join("<li><div><b>%s</b><span>%s</span></div></li>" % (E(a), E(b)) for a, b in d["pains"])))
    feats = ('<section class="sec tint" id="que-hace" aria-labelledby="h-f"><div class="w"><p class="eyebrow">Lo que hace por tu %s</p><h2 id="h-f">De la libreta al control real, sin cambiar cómo atendés.</h2><p class="lead">Lo que sigue son las posibilidades habituales en tu rubro; en tu proyecto armamos las que necesitás.</p><ul class="ben">%s</ul></div></section>\n'
             % (d["nombre"], "".join("<li><b>%s</b><span>%s</span><em>%s</em></li>" % (E(a), E(b), E(c)) for a, b, c in d["feats"])))
    t1 = ticket("Plan Start", "GrowiApp Start", "Lo armamos, cargamos tus datos y te enseñamos a usarlo.", ["Ventas, caja y stock", "Turnos y reservas", "Ficha de clientes", "Reportes simples", "1 usuario (con varios cargando a la vez, el plan Pro trae hasta 3)", "Soporte por WhatsApp", "Sin permanencia: cancelás cuando quieras"],
                ("Por mes", money(15, "/mes")), "+ %s de puesta en marcha, una sola vez. Garantía prevista de 7 días desde que queda andando." % P(49), btn("Hola Growi, quiero consultar por GrowiApp, plan Start.\n\nMi negocio: %s" % d["nombre"], "app-%s-pricing-whatsapp" % k, "Consultar por GrowiApp", "wide"))
    precio = ('<section class="sec" id="precio" aria-labelledby="h-p"><div class="w precio-g"><div><p class="eyebrow">Cuánto sale</p><h2 id="h-p">Puesta en marcha y abono mensual.</h2><p class="lead">Un punto de partida: el alcance final y el presupuesto los definimos con vos, por escrito, antes de empezar. <a href="%s#precios" class="tl">Ver todos los planes</a></p><div class="tk-tools">%s</div></div>'
              '<div class="tickets one">%s</div></div><div class="w"><p class="note" style="max-width:86ch;margin-top:26px">%s</p></div></section>\n' % (pg.u("app/"), cur_toggle(), t1, E(L1_PRECIOS)))
    caso = caso_cafe(rel, pg.u("app/")) if k == "cafeterias" else ""
    pre = ('<section class="sec tint" id="preguntas" aria-labelledby="h-faq"><div class="w faq-g"><div><p class="eyebrow">Antes de que preguntes</p><h2 id="h-faq">Lo que se pregunta primero.</h2></div>%s</div></section>\n' % faq(faqp))
    otros = "".join('<a href="%s">%s<i aria-hidden="true">→</i></a>' % (pg.u(r), n) for n, r, t in RUBROS if t != k)
    mas = ('<section class="sec" aria-labelledby="h-o"><div class="w"><h2 id="h-o" class="h-sm">¿Tenés otro tipo de negocio? GrowiApp también se arma para:</h2><div class="rubros2 small">%s<a href="%s">Sistema + sitio web<i aria-hidden="true">→</i></a></div></div></section>\n' % (otros, pg.u("combo/")))
    cie = cierre("Tu %s, lista para empezar a trabajar." % d["nombre"], "Contanos cómo trabajás hoy y lo armamos con tus datos. Sin vueltas, sin letra chica. Te respondemos por WhatsApp de lunes a sábado, de 9 a 19 hs.", btn(msg, "app-%s-final-whatsapp" % k, d["cta"]))
    return (head(pg, d["tit"] + " | Growi", d["lead"][:155], d["og"], l1ld=d["l1"], faqs=faqp)
            + header(pg, "app") + subnav([("demo", {"cafeterias": "Café Nogal", "peluquerias": "Estudio Bruma", "talleres": "Cómo se ve", "retail": "Cómo se ve"}.get(k, "Demo")), ("te-suena", "¿Te suena?"), ("que-hace", "Qué hace"), ("precio", "Precio"), ("preguntas", "Preguntas")], "app")
            + '<main id="contenido">\n' + hero + pains + feats + caso + precio + pre + mas + cie + '</main>\n'
            + footer(pg, msg, "app-" + k))
