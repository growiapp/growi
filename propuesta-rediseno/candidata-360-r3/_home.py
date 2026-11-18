# Home R3: orientación por necesidad (no por nombre de producto), prueba, eventos aparte y armador de consulta.
from _lib import *
from _demos import *

HOME_FAQ = [
 ("¿Tengo que contratar todo junto?", "No. GrowiApp, GrowiWeb y GrowiFlow se contratan por separado. Si querés sitio y sistema, el combo suma 10% de descuento en el sitio y la puesta en marcha sin cargo."),
 ("¿Cuánto tarda?", "En GrowiApp, antes de comenzar te confirmamos por escrito una fecha estimada de entrega. En GrowiWeb, la fecha estimada va en el presupuesto, antes de iniciar el proyecto. En GrowiFlow, el plazo se define al confirmar."),
 ("¿Qué incluyen los precios? ¿En qué moneda están?", "Cada plan tiene un precio cerrado; los precios «desde» y lo a medida se confirman en un presupuesto por escrito antes de empezar. No incluyen dominio, alojamiento ni costos de terceros. Están fijados en dólares: el valor en pesos es una referencia que se actualiza con el dólar oficial (venta)."),
 ("¿Qué pasa si no me convence?", "Hay 7 días de garantía, contados desde la entrega o activación. En GrowiApp te devolvemos el 100% de la puesta en marcha si no funciona como prometimos; en GrowiWeb y en los paquetes de pago único de GrowiFlow hacemos ajustes sin cargo. Los detalles están en los Términos."),
 ("¿Necesito saber de tecnología?", "No. Lo armamos nosotros, te enseñamos a usarlo y el soporte es por WhatsApp."),
]

def tab(i, cod, nom, sub, activo):
    return ('<button type="button" role="tab" id="t-%s" aria-controls="p-%s" aria-selected="%s" tabindex="%s" data-xp="%s"><span class="cod">%s</span><b>%s</b><small>%s</small></button>'
            % (i, i, "true" if activo else "false", "0" if activo else "-1", i, cod, nom, sub))

def panel(i, activo, kick, h, bullets, empezas, precio, ctas, stage):
    bl = "".join("<li>%s</li>" % b for b in bullets); em = "".join("<li>%s</li>" % e for e in empezas)
    return ('<div class="xp-pan" role="tabpanel" id="p-%s" aria-labelledby="t-%s"%s><div class="xp-txt"><p class="xp-prod">%s</p><h3 class="xp-h">%s</h3>'
            '<p class="xp-k">Qué resuelve</p><ul class="xp-l">%s</ul><p class="xp-k">Cómo empezás</p><ul class="xp-l">%s</ul>'
            '<p class="xp-pr">%s</p><div class="xp-cta">%s</div></div><div class="xp-stage">%s</div></div>'
            % (i, i, "" if activo else " hidden", kick, h, bl, em, precio, ctas, stage))

def home():
    pg = Pg(""); rel = pg.rel
    hero = ('<section class="hero2" data-sticky-hide aria-labelledby="h1"><div class="w hero2-g"><div><p class="eyebrow">Sistema, sitio web y automatizaciones para negocios de Argentina</p>'
            '<h1 id="h1">Tu negocio, <mark class="sweep">andando</mark>.</h1></div><div><p class="sub">Armamos y dejamos funcionando lo que tu negocio necesita: ordenar las ventas, que te encuentren o dejar de hacer tareas a mano. Precio y fecha estimada de entrega, por escrito, antes de empezar.</p>'
            '<div class="cta-row">%s<a class="btn o" href="#necesidad">¿Qué necesitás resolver? ↓</a></div>'
            '<p class="hero-l1">Hoy solo recibimos consultas por WhatsApp: todavía no se contrata ni se paga.</p><a class="hero-proof" href="#caso"><img src="assets/img/colocafe-logo.png" alt="" width="44" height="44"><span><b>Caso real · Colo Café</b>Sistema de gestión armado para su cafetería.</span></a></div></div></section>\n'
            % btn("Hola Growi, quiero conocer más sobre sus soluciones.", "home-hero-whatsapp", "Contanos tu negocio"))
    tabs = (tab("app", "01", "Ordenar mi negocio", "Ventas, caja, stock y turnos", True) + tab("web", "02", "Que me encuentren", "Un sitio que trae consultas", False)
            + tab("flow", "03", "Dejar de hacerlo a mano", "Avisos, reportes y pedidos", False) + tab("combo", "04", "Las dos cosas juntas", "Sitio y sistema", False))
    p_app = panel("app", True, "GrowiApp", "Ventas, caja, stock y turnos en una sola pantalla, desde el celular.",
                  ["Cada venta registrada al momento y el cierre de caja armado solo", "Stock con alertas, antes de quedarte sin nada", "Agenda de turnos y reservas: reemplazás el cuaderno"],
                  ["Lo armamos con los datos de tu negocio", "1 hora de capacitación en vivo", "Garantía prevista de 7 días y sin permanencia"],
                  "desde %s/mes + %s de puesta en marcha" % (P(15, True), P(49, True)),
                  '<a class="btn k sm" href="%s" data-track="home-xp-app">Ver GrowiApp →</a>' % pg.u("app/"),
                  '<div class="appwrap"><iframe class="appdemo" src="%sdemos/app.html" title="Demo interactiva de GrowiApp: elegí tu rubro y mirá el panel" height="760" loading="lazy"></iframe></div>'
                  '<p class="cap">Demo interactiva de GrowiApp, con datos ilustrativos. Elegí un rubro y los datos cambian.</p>' % rel)
    p_web = panel("web", False, "GrowiWeb", "Un sitio que presenta tu negocio y facilita las consultas.",
                  ["Muestra lo que hacés y deja pedir turno o consultar", "Lo dejamos publicado: vos no tocás nada técnico", "Plantilla adaptada a tu rubro o diseño a medida"],
                  ["Precio y alcance por escrito, antes de empezar", "Revisiones incluidas según el plan", "7 días de ajustes sin cargo desde la entrega"],
                  "desde %s, pago único · dominio y alojamiento aparte" % P(200, True),
                  '<a class="btn k sm" href="%s" data-track="home-xp-web">Ver GrowiWeb →</a>' % pg.u("web/"), web_stage(rel))
    p_flow = panel("flow", False, "GrowiFlow", "Menos tareas repetitivas, armadas a medida.",
                   ["Avisos de turno, resúmenes y consultas en orden, sin que lo hagas vos", "Lo armamos a medida de tu negocio y lo probamos con vos", "Si algo no se puede automatizar, te lo decimos antes de empezar"],
                   ["Nos contás qué tarea te come tiempo", "No hace falta tener GrowiApp ni GrowiWeb", "7 días de ajustes sin cargo desde la entrega"],
                   "pago único · pedidos y consultas desde %s, reportes y recordatorios %s" % (P(79, True), P(89, True)),
                   '<a class="btn k sm" href="%s" data-track="home-xp-flow">Ver GrowiFlow →</a>' % pg.u("flow/"), flow_demo(True))
    p_combo = panel("combo", False, "Combo", "Del sitio a la caja, armado por el mismo equipo.",
                    ["El sitio sale 10% menos", "La puesta en marcha de GrowiApp va sin cargo", "La charla inicial sirve para las dos cosas"],
                    ["Un solo equipo, un solo presupuesto por escrito", "Elegís landing o sitio institucional", "El sistema, mes a mes y sin permanencia"],
                    "desde %s el sitio + %s/mes del sistema" % (P(180, True), P(15, True)),
                    '<a class="btn k sm" href="%s" data-track="home-combo-link">Ver el combo →</a>' % pg.u("combo/"), combo_journey(rel))
    necesidad = ('<section class="xp" id="necesidad" aria-labelledby="h-xp"><div class="w"><p class="eyebrow">Elegí lo que más se parece a tu caso</p><h2 id="h-xp" class="xp-title">¿Qué necesitás resolver?</h2>'
                 '<div class="xp-tabs" role="tablist" aria-label="Qué necesitás resolver">%s</div>%s%s%s%s</div></section>\n' % (tabs, p_app, p_web, p_flow, p_combo))
    caso = caso_cafe(rel, pg.u("app/cafeterias/"))
    eventos = ('<section class="ev3" aria-labelledby="h-evt"><div class="w ev3-g"><div><p class="eyebrow">Para tus celebraciones · aparte del negocio</p><h2 id="h-evt">Invitaciones digitales que se abren como un regalo.</h2>'
               '<p class="lead">Casamientos, cumpleaños, quinceañeras y eventos de empresa: una invitación a medida que se comparte con un enlace y que cada invitado recorre a su manera.</p>'
               '<p class="xp-pr" style="margin-top:20px">Con presupuesto · sin precio de lista</p>'
               '<div class="xp-cta" style="margin-top:20px"><a class="btn k" href="%s" data-track="home-invitaciones-link">Ver las invitaciones →</a>%s</div></div>%s</div></section>\n'
               % (pg.u("invitaciones/"), btn("Hola Growi, quiero pedir un presupuesto para una invitación digital.\n\nTipo de evento:\nFecha:", "home-invitaciones-whatsapp", "Pedir presupuesto", "o"),
                  inv_frame(rel, "exp", "Invitaciones digitales de muestra: elegí un casamiento, un cumpleaños o un evento de empresa", 690)))
    pasos = [("01", "Nos contás tu negocio", "Por WhatsApp, con tus palabras: qué vendés y qué querés resolver."),
             ("02", "Te decimos qué te conviene", "Te recomendamos una solución y te pasamos precio y fecha estimada de entrega, antes de que decidas nada."),
             ("03", "Lo armamos y te acompañamos", "Lo armamos nosotros, te enseñamos a usarlo y seguimos del otro lado del WhatsApp.")]
    chooser = ('<div class="ticket chooser" data-chooser><form onsubmit="return false"><fieldset><legend>Armá tu consulta</legend>'
               '<p class="hint">Marcá lo que necesitás y armamos el mensaje con precios «desde».</p>'
               '<label class="opt"><input type="checkbox" name="linea" value="app"><span class="box"><span class="tick" aria-hidden="true">✓</span><span><span class="n">Ordenar mi negocio</span><span class="d">GrowiApp · ventas, caja, stock y turnos</span></span><span class="p">desde %s/mes</span></span></label>'
               '<label class="opt"><input type="checkbox" name="linea" value="web"><span class="box"><span class="tick" aria-hidden="true">✓</span><span><span class="n">Tener un sitio web</span><span class="d">GrowiWeb · te encuentran y te consultan</span></span><span class="p">desde %s</span></span></label>'
               '<div class="sub-opt" data-websub hidden role="group" aria-label="Tipo de sitio"><label><input type="radio" name="webtipo" value="l" checked><span>Una página (landing)</span></label><label><input type="radio" name="webtipo" value="i"><span>Sitio con varias secciones</span></label></div>'
               '<label class="opt"><input type="checkbox" name="linea" value="flow"><span class="box"><span class="tick" aria-hidden="true">✓</span><span><span class="n">Tareas repetitivas, a medida</span><span class="d">GrowiFlow · pedidos, reportes y recordatorios</span></span><span class="p">desde %s</span></span></label>'
               '<div class="sub-opt" data-flowsub hidden role="group" aria-label="Paquete de GrowiFlow"><label><input type="radio" name="flowtipo" value="p" checked><span>Pedidos y consultas</span></label><label><input type="radio" name="flowtipo" value="r"><span>Reportes</span></label><label><input type="radio" name="flowtipo" value="a"><span>Recordatorios</span></label></div>'
               '<label class="opt"><input type="checkbox" name="linea" value="inv"><span class="box"><span class="tick" aria-hidden="true">✓</span><span><span class="n">Invitar a un evento</span><span class="d">Invitaciones digitales a medida</span></span><span class="p">con presupuesto</span></span></label>'
               '</fieldset></form><div class="print" data-print aria-live="off"></div>'
               '<div class="tk-tools" style="margin-top:16px">%s</div>%s</div>'
               % (P(15, True), P(200, True), P(79, True), cur_toggle(),
                  btn("Hola Growi, quiero conocer más sobre sus soluciones.", "home-consulta-whatsapp", "O escribinos directo por WhatsApp", "wide").replace('<a class="btn wide"', '<a data-cta class="btn o wide"')))
    empezar = ('<section class="sec dark" id="consulta" aria-labelledby="h-como"><div class="w como-g"><div><p class="eyebrow">Cómo empezás</p><h2 id="h-como">Lo armamos nosotros. Vos atendés tu negocio.</h2>'
               '<ol class="pasos1">%s</ol></div>%s</div></section>\n'
               % ("".join('<li><span class="no">PASO %s</span><div><h3>%s</h3><p>%s</p></div></li>' % p for p in pasos), chooser))
    pre = ('<section class="sec tint" id="preguntas" aria-labelledby="h-faq"><div class="w faq-g"><div><p class="eyebrow">Antes de escribirnos</p><h2 id="h-faq">Lo que se pregunta primero.</h2></div>%s</div></section>\n' % faq(HOME_FAQ))
    cie = cierre("Contanos qué negocio tenés.", "Te recomendamos una solución y te pasamos precio y fecha estimada de entrega por WhatsApp, de lunes a sábado de 9 a 19 hs.",
                 btn("Hola Growi, quiero que me recomienden qué me conviene.\n\nMi rubro:\nQué quiero resolver:", "home-final-whatsapp", "Contanos tu negocio"))
    return (head(pg, "Growi: sistema, sitio web y automatizaciones para negocios de Argentina", "Ordená tu negocio, conseguí que te encuentren y dejá de hacer tareas a mano. Mirá cómo funciona y pedí precio y fecha por escrito.", l1ld="", faqs=HOME_FAQ)
            + header(pg, "") + '<main id="contenido">\n' + hero + necesidad + caso + eventos + empezar + pre + cie + '</main>\n'
            + footer(pg, "Hola Growi, quiero conocer más sobre sus soluciones.", "home"))
