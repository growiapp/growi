# Home R3: orientación por necesidad (no por nombre de producto), prueba, eventos aparte y armador de consulta.
from _lib import *
from _demos import *
from _r33 import app_tour, app_sim, inv_gallery
import _inv
from _r36 import scene_app, scene_flow, combo_duo, scene_hero, ex_panel, caso4

HOME_FAQ = [
 ("¿Tengo que contratar todo junto?", "No. GrowiApp, GrowiWeb y GrowiFlow se contratan por separado. Si querés sitio y sistema, el combo suma 10% de descuento en el sitio y la puesta en marcha sin cargo."),
 ("¿Cuánto tarda?", "En GrowiApp, antes de comenzar te confirmamos por escrito una fecha estimada de entrega. En GrowiWeb, la fecha estimada va en el presupuesto, antes de iniciar el proyecto. En GrowiFlow, el plazo se define al confirmar."),
 ("¿Qué incluyen los precios? ¿En qué moneda están?", "Los importes de cada plan son una referencia de la inversión; el alcance final, las adaptaciones y el presupuesto de tu proyecto se definen con vos y se confirman por escrito antes de empezar. No incluyen dominio, alojamiento ni costos de terceros. Están fijados en dólares: el valor en pesos es una referencia que se actualiza con el dólar oficial (venta)."),
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

def hero_lines(pg):
    """F8.1A: en móvil, qué ofrece Growi se ve en el primer pantallazo (la escena de Centro Ribera queda más abajo, en GrowiWeb y Combo)."""
    it = [("app/", "GrowiApp", "Ordená ventas, caja, stock y turnos", ""), ("web/", "GrowiWeb", "Que te encuentren y te consulten", ""),
          ("flow/", "GrowiFlow", "Dejá de hacer tareas repetitivas a mano", ""), ("combo/", "Combo", "Sitio y sistema, con un solo equipo", ""),
          ("invitaciones/", "Invitaciones digitales", "Para tus eventos: se abren desde un enlace", ' class="ev"')]
    return '<nav class="hero-lines" aria-label="Qué ofrece Growi">%s</nav>' % "".join('<a href="%s"%s data-track="home-hero-%s"><b>%s</b><span>%s</span><i aria-hidden="true">→</i></a>' % (pg.u(r), c, r.strip("/"), n, d) for r, n, d, c in it)

def home():
    pg = Pg(""); rel = pg.rel
    hero = ('<section class="hero36" data-sticky-hide aria-labelledby="h1"><div class="w hero36-g"><div class="h2-copy"><p class="eyebrow">Sistema, sitio web y automatizaciones para negocios de Argentina</p>'
            '<h1 id="h1">Tu negocio, <mark class="sweep">andando</mark>.</h1><p class="sub">Armamos y dejamos funcionando lo que tu negocio necesita: ordenar las ventas, que te encuentren o dejar de hacer tareas a mano. Precio y fecha estimada, por escrito, antes de empezar.</p>'
            '<div class="cta-row">%s<a class="btn o" href="#necesidad">Ver qué podemos armar ↓</a></div>'
            '<a class="hero-proof2" href="#caso"><img src="assets/img/colocafe-logo.png" alt="" width="34" height="34"><span><b>Caso real: Colo Café</b> · sistema de gestión para su cafetería</span></a>%s</div>'
            '<div class="h2-art36">%s</div></div></section>\n'
            % (btn("Hola Growi, quiero conocer más sobre sus soluciones.", "home-hero-whatsapp", "Contanos tu negocio"), hero_lines(pg), scene_hero(rel)))
    def nrow(k, kick, h, lead, bullets, precio, cta, scene, tag="Demo"):
        bl = "".join("<li>%s</li>" % b for b in bullets)
        return ('<div class="nrow" id="n-%s"><div class="nrow-t"><p class="eyebrow">%s</p><h3>%s</h3><p>%s</p><ul>%s</ul><p class="nrow-pr">%s</p>%s</div><div class="nrow-s">%s%s</div></div>\n'
                % (k, kick, h, lead, bl, precio, cta, ('<p class="ej-tag">%s</p>' % tag) if tag else "", scene))
    rows = (nrow("app", "GrowiApp", "Ordená tu negocio.", "Ventas, caja, stock y turnos en una sola pantalla, desde el celular.",
                 ["Cada venta registrada al momento y el cierre de caja sin cuentas a mano", "Stock con alertas, antes de quedarte sin nada", "Agenda de turnos y reservas: reemplazás el cuaderno"],
                 "desde %s/mes + %s de puesta en marcha" % (P(15, True), P(49, True)), '<a class="btn k" href="%s" data-track="home-xp-app">Ver GrowiApp →</a>' % pg.u("app/"), scene_app(rel))
            + nrow("web", "GrowiWeb", "Que te encuentren y te consulten.", "Un sitio que presenta tu negocio y facilita las consultas.",
                   ["Muestra lo que hacés y deja pedir turno o consultar", "Lo dejamos publicado: vos no tocás nada técnico", "Plantilla adaptada a tu rubro o diseño a medida"],
                   "desde %s, pago único · dominio y alojamiento aparte" % P(200, True), '<a class="btn k" href="%s" data-track="home-xp-web">Ver GrowiWeb →</a>' % pg.u("web/"), ex_panel(rel, "ribera"), tag="")   # el panel ya se identifica como «Sitio de muestra»
            + nrow("flow", "GrowiFlow", "Dejá de hacerlo a mano.", "Menos tareas repetitivas, armadas a medida.",
                   ["Avisos de turno, resúmenes y consultas en orden, sin que lo hagas vos", "Lo armamos a medida de tu negocio y lo probamos con vos", "Si algo no se puede automatizar, te lo decimos antes de empezar"],
                   "pago único · pedidos y consultas desde %s, reportes y recordatorios %s" % (P(79, True), P(89, True)), '<a class="btn k" href="%s" data-track="home-xp-flow">Ver GrowiFlow →</a>' % pg.u("flow/"), scene_flow())
            + nrow("combo", "Combo", "Sitio y sistema, con un solo equipo.", "Del sitio a la caja, armado por el mismo equipo.",
                   ["El sitio sale 10% menos", "La puesta en marcha de GrowiApp va sin cargo", "La charla inicial sirve para las dos cosas"],
                   "desde %s el sitio + %s/mes del sistema" % (P(180, True), P(15, True)), '<a class="btn k" href="%s" data-track="home-combo-link">Ver el combo →</a>' % pg.u("combo/"), combo_duo(rel)))
    necesidad = ('<section class="need" id="necesidad" aria-labelledby="h-xp"><div class="w"><p class="eyebrow">Qué podemos armar</p><h2 id="h-xp" class="xp-title">¿Qué necesitás resolver?</h2><p class="need-lead">De lo que hacés a mano, a lo que queda andando. Cada solución se contrata por separado y se arma a la medida de tu negocio; lo que sigue son ejemplos de cómo podrían verse.</p>'
                 '<nav class="need-nav" data-need-nav aria-label="Qué necesitás resolver"><a href="#n-app">Ordenar mi negocio</a><a href="#n-web">Que me encuentren</a><a href="#n-flow">Dejar de hacerlo a mano</a><a href="#n-combo">Las dos cosas juntas</a></nav>%s</div></section>\n' % rows)
    caso = caso4(rel, pg.u("app/cafeterias/"))
    eventos = ('<section class="ev3" aria-labelledby="h-evt"><div class="w ev3-g"><div><p class="eyebrow">Para tus celebraciones</p><h2 id="h-evt">Invitaciones digitales para tus eventos.</h2>'
               '<p class="lead">Una invitación con la identidad de tu evento: se abre desde un enlace, reúne programa, lugar e información, y tus invitados confirman por WhatsApp.</p>'
               '<p class="xp-pr" style="margin-top:20px">Con presupuesto · sin precio de lista</p>'
               '<div class="xp-cta" style="margin-top:20px"><a class="btn k" href="%s" data-track="home-invitaciones-link">Ver las invitaciones →</a>%s</div></div>%s</div></section>\n'
               % (pg.u("invitaciones/"), btn("Hola Growi, quiero pedir un presupuesto para una invitación digital.\n\nTipo de evento:\nFecha:", "home-invitaciones-whatsapp", "Pedir presupuesto", "o"),
                  _inv.teaser()))
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
    empezar = ('<section class="sec dark" id="consulta" data-sticky-hide aria-labelledby="h-como"><div class="w como-g"><div><p class="eyebrow">Cómo empezás</p><h2 id="h-como">Lo armamos nosotros. Vos atendés tu negocio.</h2>'
               '<ol class="pasos1">%s</ol></div>%s</div></section>\n'
               % ("".join('<li><span class="no">PASO %s</span><div><h3>%s</h3><p>%s</p></div></li>' % p for p in pasos), chooser))
    pre = ('<section class="sec tint" id="preguntas" aria-labelledby="h-faq"><div class="w faq-g"><div><p class="eyebrow">Antes de escribirnos</p><h2 id="h-faq">Lo que se pregunta primero.</h2></div>%s</div></section>\n' % faq(HOME_FAQ))
    cie = cierre("Contanos qué negocio tenés.", "Te recomendamos una solución y te pasamos precio y fecha estimada de entrega por WhatsApp, de lunes a sábado de 9 a 19 hs.",
                 btn("Hola Growi, quiero que me recomienden qué me conviene.\n\nMi rubro:\nQué quiero resolver:", "home-final-whatsapp", "Contanos tu negocio"))
    return (head(pg, "Growi: gestión, sitio web y automatizaciones para negocios", "Ordená tu negocio, conseguí que te encuentren y dejá de hacer tareas a mano. Mirá ejemplos y pedí precio y fecha estimada de entrega por escrito.", l1ld="", faqs=HOME_FAQ)
            + header(pg, "") + '<main id="contenido">\n' + hero + necesidad + caso + eventos + empezar + pre + cie + '</main>\n'
            + footer(pg, "Hola Growi, quiero conocer más sobre sus soluciones.", "home")).replace("</head>", '<link rel="stylesheet" href="%sassets/invitaciones/inv-base.css">\n</head>' % rel, 1)
