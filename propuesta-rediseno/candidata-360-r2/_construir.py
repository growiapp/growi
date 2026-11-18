# Genera la candidata local Growi 360° (home, GrowiApp, GrowiWeb). Uso: python _construir.py
# Contenido comercial, precios (data-price en USD) y aviso L1 conservan los textos vigentes del sitio; cambia la experiencia.
import os, html, json
from urllib.parse import quote
OUT = os.path.dirname(os.path.abspath(__file__))
E = html.escape
WA = "https://wa.me/5491170593877?text="

def btn(texto_wa, track, label, cls=""):
    return '<a class="btn%s" href="%s%s" target="_blank" rel="noopener noreferrer" data-track="%s">%s</a>' % ((" " + cls) if cls else "", WA, quote(texto_wa), track, label)

L1_PIE = ("Growi se encuentra en etapa de lanzamiento y actualmente recibe consultas sobre sus servicios, sin aceptar contrataciones ni pagos. "
          "Los planes y precios publicados describen las propuestas previstas. Para conocer disponibilidad, alcance y condiciones, contactanos por WhatsApp o correo.")
L1_PRECIOS = ("Planes y precios previstos: todavía no se aceptan contrataciones ni pagos. Cada plan tiene un precio cerrado; los precios «desde» y lo a medida se confirman en un presupuesto por escrito antes de empezar. "
              "No incluyen dominio, alojamiento ni costos de terceros (por ejemplo, comisiones de medios de pago o mensajes de WhatsApp). "
              "Están fijados en dólares: el valor en pesos es una referencia que se actualiza con el dólar oficial (venta).")

FAQ = {
 "junto": ("¿Tengo que contratar todo junto?", "No. GrowiApp, GrowiWeb y GrowiFlow se contratan por separado. Si querés sitio y sistema, el combo suma 10% de descuento en el sitio y la puesta en marcha sin cargo."),
 "tarda": ("¿Cuánto tarda?", "En GrowiApp, antes de comenzar te confirmamos por escrito una fecha estimada de entrega. En GrowiWeb, la fecha estimada va en el presupuesto, antes de iniciar el proyecto. En GrowiFlow, el plazo se define al confirmar."),
 "perm": ("¿Hay permanencia?", "GrowiApp tiene abono mensual sin permanencia: seguís solo si te sirve, y tus datos son tuyos. GrowiWeb y GrowiFlow se pagan una sola vez."),
 "precios": ("¿Qué incluyen los precios? ¿En qué moneda están?", "Cada plan tiene un precio cerrado; los precios «desde» y lo a medida se confirman en un presupuesto por escrito antes de empezar. No incluyen dominio, alojamiento ni costos de terceros. Están fijados en dólares: el valor en pesos es una referencia que se actualiza con el dólar oficial (venta)."),
 "conv": ("¿Qué pasa si no me convence?", "Hay 7 días de garantía, contados desde la entrega o activación. En GrowiApp te devolvemos el 100% de la puesta en marcha si no funciona como prometimos; en GrowiWeb y en los paquetes de pago único de GrowiFlow hacemos ajustes sin cargo. Los detalles están en los Términos."),
 "fact": ("¿Emite factura electrónica?", "GrowiApp todavía no. Está en desarrollo y va a ser parte del plan Pro; no prometemos fecha. Si es imprescindible para vos, escribinos y lo conversamos."),
 "net": ("¿Y si se corta internet?", "En GrowiApp podés seguir cargando: los datos se sincronizan cuando vuelve la conexión."),
 "tec": ("¿Necesito saber de tecnología?", "No. Lo armamos nosotros, te enseñamos a usarlo y el soporte es por WhatsApp."),
}

FAQS = json.load(open(os.path.join(OUT, "_faqs.json"), encoding="utf-8"))  # preguntas y respuestas textuales de las páginas vigentes
ICO = {
 "app": '<svg class="l-ico" viewBox="0 0 48 48" aria-hidden="true"><path d="M10 6h28v36l-5-3-5 3-4-3-4 3-5-3-5 3z"/><path class="a" d="M17 16h14M17 23h14M17 30h8"/></svg>',
 "web": '<svg class="l-ico" viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="9" width="38" height="30" rx="3"/><path d="M5 17h38"/><path class="a" d="M12 26h14M12 32h9"/></svg>',
 "flow": '<svg class="l-ico" viewBox="0 0 48 48" aria-hidden="true"><path d="M8 18h26l-6-6M40 30H14l6 6"/><path class="a" d="M34 18l-6 6M14 30l6-6"/></svg>',
 "combo": '<svg class="l-ico" viewBox="0 0 48 48" aria-hidden="true"><rect x="6" y="10" width="24" height="24" rx="3"/><rect class="a" x="18" y="16" width="24" height="24" rx="3"/></svg>',
 "inv": '<svg class="l-ico" viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="11" width="38" height="26" rx="3"/><path class="a" d="M6 14l18 13 18-13"/></svg>',
}

def head(titulo, desc, rel):
    return ('<!doctype html>\n<html lang="es-AR">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n'
            '<meta name="robots" content="noindex, nofollow">\n<title>%s</title>\n<meta name="description" content="%s">\n<meta name="theme-color" content="#f6f6f4">\n'
            '<link rel="preload" href="%sassets/fonts/epilogue-latin.woff2" as="font" type="font/woff2" crossorigin>\n'
            '<script>var d=document.documentElement,o=null;try{o=localStorage.getItem("cr_motion")}catch(e){}try{var r=matchMedia("(prefers-reduced-motion: reduce)").matches;if(o==="on"||(!r&&o!=="off"))d.classList.add("mo")}catch(e){}</script>\n'
            '<link rel="stylesheet" href="%sassets/growi360.css">\n</head>\n<body>\n<a class="sr" href="#contenido">Saltar al contenido</a>\n' % (E(titulo), E(desc), rel, rel))

def header(cur, rel, sroot):
    # Home, GrowiApp y GrowiWeb son la candidata; el resto apunta a las páginas vigentes del sitio (ver revision/)
    items = [("app", "GrowiApp", rel + "app/", True), ("web", "GrowiWeb", rel + "web/", True), ("flow", "GrowiFlow", sroot + "flow/", False),
             ("combo", "Combo", sroot + "combo/", False), ("inv", "Invitaciones", sroot + "invitaciones/", False)]
    nav = ""
    for k, n, h, cand in items:
        if k == "inv": nav += '<span class="sep" aria-hidden="true"></span>'
        cur_attr = ' aria-current="page"' if cur == k else ""
        t = "" if cand else ' title="Página vigente del sitio, todavía no rediseñada en esta candidata"'
        nav += '<a href="%s"%s%s>%s</a>' % (h, cur_attr, t, n)
    mob = "".join(('<span class="mm-g">Para tus eventos</span>' if k == "inv" else "") + '<a href="%s"%s>%s<span aria-hidden="true">→</span></a>' % (h, ' aria-current="page"' if cur == k else "", n) for k, n, h, c in items)
    consulta = btn("Hola Growi, quiero conocer más sobre sus soluciones.", "nav-whatsapp", "Consultar", "sm")
    return ('<header class="top" id="mainNav"><div class="w"><a class="logo" href="%s" aria-label="Growi, inicio">Growi<i>.</i></a>'
            '<nav class="nav" aria-label="Principal">%s</nav>%s'
            '<button class="menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="mobileMenu" aria-label="Abrir menú">Menú</button></div></header>\n'
            '<div class="mobile-menu" id="mobileMenu" aria-hidden="true"><div class="mobile-menu-card"><a href="%s">Inicio<span aria-hidden="true">→</span></a>%s%s</div></div>\n'
            % (rel or "./", nav, consulta, rel or "./", mob, btn("Hola Growi, quiero conocer más sobre sus soluciones.", "mobile-menu-whatsapp", "Hablar por WhatsApp", "wide")))

def footer(rel, sroot, sticky_msg, track):
    prod = "".join('<li><a href="%s">%s</a></li>' % (h, n) for n, h in [("GrowiApp", rel + "app/"), ("GrowiWeb", rel + "web/"), ("GrowiFlow", sroot + "flow/"), ("Combo sistema + web", sroot + "combo/"), ("Invitaciones digitales", sroot + "invitaciones/")])
    rub = "".join('<li><a href="%s">%s</a></li>' % (sroot + h, n) for n, h in [("Cafeterías", "app/cafeterias/"), ("Peluquerías y estética", "app/peluquerias/"), ("Talleres y servicios", "app/talleres/"), ("Kioscos y comercios", "app/retail/")])
    return ('<footer class="foot"><div class="w"><div class="cols"><div><a class="logo" href="%s" aria-label="Growi, inicio">Growi<i>.</i></a><p style="margin-top:14px;max-width:30ch">Crecé con tu negocio.</p></div>'
            '<div><h2>Soluciones</h2><ul>%s</ul></div><div><h2>Por rubro</h2><ul>%s</ul></div>'
            '<div><h2>Contacto</h2><ul><li><a href="%s%s" target="_blank" rel="noopener noreferrer" data-track="%s-footer-whatsapp">WhatsApp</a></li><li><a href="mailto:hola@growi.ar">hola@growi.ar</a></li>'
            '<li><a href="%sprivacidad/">Privacidad</a></li><li><a href="%sterminos/">Términos</a></li></ul></div></div>'
            '<p class="l1">%s</p><p class="l1" style="margin-top:14px;border:0;padding:0" data-motion>© 2026 Growi · Candidata de diseño, solo local (no publicada).</p></div></footer>\n'
            '<div class="sticky-cta">%s</div>\n'
            '<script src="%sshared.fx.js"></script>\n<script src="%sshared.js"></script>\n<script src="%sassets/growi360.js" defer></script>\n</body>\n</html>\n'
            % (rel or "./", prod, rub, WA, quote("Hola Growi, quiero conocer más sobre sus soluciones."), track, sroot, sroot, L1_PIE,
               btn(sticky_msg, track + "-floating-whatsapp", "Consultar por WhatsApp", "wide"), sroot, sroot, rel))

def faq(keys):
    return '<div class="faq">%s</div>' % "".join("<details><summary>%s</summary><p>%s</p></details>" % (E(FAQ[k][0]), E(FAQ[k][1])) for k in keys)


def faq_lista(pares):
    return '<div class="faq">%s</div>' % "".join("<details><summary>%s</summary><p>%s</p></details>" % (E(q), E(a)) for q, a in pares)

def ticket(codigo, titulo, sub, lineas, total_html, fine, cta, ribbon="", extra_attr=""):
    ls = "".join(('<li class="soon"><span>%s</span><span class="f"></span><span class="v">pronto</span></li>' % E(l[1:])) if l.startswith("~") else ('<li><span>%s</span><span class="f"></span><span class="v ok">✓</span></li>' % E(l)) for l in lineas)
    rb = '<span class="ribbon">%s</span>' % E(ribbon) if ribbon else ""
    return ('<article class="ticket print-in" %s>%s<header class="t-head"><div><span class="t-code">%s</span><h3 class="t-title">%s</h3></div></header>'
            '<p class="t-sub">%s</p><ul class="t-lines">%s</ul><div class="t-total"><span class="t-lbl">%s</span>%s</div><p class="t-fine">%s</p>%s</article>'
            % (extra_attr, rb, E(codigo), E(titulo), E(sub), ls, total_html[0], total_html[1], fine, cta))

def money(usd, suf="", plan=False):
    a = ' data-plan-price data-usd="%s"' % usd if plan else ""
    return '<strong class="t-num"><span data-price="%s"%s>$</span>%s</strong>' % (usd, a, (" <small>%s</small>" % suf) if suf else "")

# ------------------------------------------------------------------ HOME (r2): producto primero
def tab(i, cod, nom, sub, activo):
    return ('<button type="button" role="tab" id="t-%s" aria-controls="p-%s" aria-selected="%s" tabindex="%s" data-xp="%s"><span class="cod">%s</span><b>%s</b><small>%s</small></button>'
            % (i, i, "true" if activo else "false", "0" if activo else "-1", i, cod, nom, sub))

def panel(i, activo, h, bullets, empezas, precio, ctas, stage, nota=""):
    bl = "".join("<li>%s</li>" % b for b in bullets)
    em = "".join("<li>%s</li>" % e for e in empezas)
    return ('<div class="xp-pan" role="tabpanel" id="p-%s" aria-labelledby="t-%s"%s><div class="xp-txt"><h3 class="xp-h">%s</h3>'
            '<p class="xp-k">Qué hace</p><ul class="xp-l">%s</ul><p class="xp-k">Cómo empezás</p><ul class="xp-l">%s</ul>%s'
            '<p class="xp-pr">%s</p><div class="xp-cta">%s</div></div><div class="xp-stage">%s</div></div>'
            % (i, i, "" if activo else " hidden", h, bl, em, nota, precio, ctas, stage))

def seq_top(pasos):
    bs = "".join('<li><button type="button" data-n="%d" aria-pressed="false"><b>%d</b><span>%s</span></button></li>' % (i + 1, i + 1, t) for i, t in enumerate(pasos))
    return '<div class="seq-top"><span class="stamp">Ilustrativo · datos ficticios</span><ol class="seq-steps" role="group" aria-label="Pasos del proceso">%s</ol></div>' % bs

def seq_cap(textos, nota):
    return ('<div class="seq-cap" aria-live="off">%s</div><div class="seq-foot"><p class="cap">%s</p><button type="button" class="again" data-replay>Ver de nuevo</button></div>'
            % ("".join('<p data-n="%d">%s</p>' % (i + 1, t) for i, t in enumerate(textos)), nota))

def flow_stage():
    pasos = ["Llega la consulta", "Se anota", "Vos confirmás", "Sale el recordatorio", "Resumen semanal"]
    wa = ('<div class="wa sq-wa" aria-hidden="true"><p class="wa-h">Mensajes del negocio</p>'
          '<div class="msg sq" data-from="1"><span class="mt">Hola, ¿tienen turno el sábado a la mañana?</span><small>Julián · formulario del sitio · lunes 9:12</small></div>'
          '<div class="msg out sq" data-from="3"><span class="mt">Julián, te esperamos el sábado a las 11:15.</span><small>Lo respondés vos · lunes 9:30</small></div>'
          '<div class="msg out auto sq" data-from="4"><span class="mt">Hola Julián, te recordamos tu turno de mañana a las 11:15.</span><small>Automático · por mail o WhatsApp · viernes 9:00</small></div>'
          '<div class="msg out auto sq" data-from="5"><span class="mt"><b>Resumen de la semana</b><br>12 turnos · 1 ausencia · lo más pedido: Control</span><small>Automático · por mail o WhatsApp · viernes 18:00</small></div></div>')
    sheet = ('<div class="sheet" aria-hidden="true"><p class="ag-t">Planilla de turnos <small>(datos ficticios)</small></p>'
             '<div class="sheet-h"><span>Quién</span><span>Qué</span><span>Estado</span></div>'
             '<div class="sheet-r"><span>Marta</span><span>Control</span><span>Atendida</span></div>'
             '<div class="sheet-r sq" data-from="2"><span>Julián</span><span>Turno sábado</span><span class="st"><i data-at="2">Nueva</i><i data-at="3">Confirmada 11:15</i><i data-at="4">Recordada ✓</i></span></div>'
             '<div class="sheet-r"><span>Lucía</span><span>Control</span><span>Confirmada</span></div></div>')
    caps = ["Un cliente envía una consulta desde el formulario de tu sitio.",
            "La consulta queda anotada en tu planilla, sin copiarla a mano. Con un formulario se arma con herramientas estándar.",
            "Vos respondés y confirmás el turno, como siempre. En el ejemplo, la planilla lo refleja.",
            "El día anterior sale el recordatorio. Por mail se arma con la planilla; por WhatsApp requiere una cuenta aprobada por Meta y su costo de mensajes.",
            "Cada semana te llega un resumen por mail o WhatsApp (mismas condiciones): lo que pasó, sin armarlo vos."]
    return ('<div class="seqx" data-seq>' + seq_top(pasos) + '<div class="seq-body">' + wa + '<div class="sq-arrow" aria-hidden="true">→</div>' + sheet + '</div>'
            + seq_cap(caps, "Ilustración de un proceso posible, con datos ficticios: no es una captura de un cliente ni una funcionalidad ya verificada. Si la consulta llega por WhatsApp o Instagram, anotarla sola depende de cuentas y aprobaciones de Meta: se evalúa y se confirma por escrito antes de empezar.") + '</div>')

def combo_stage():
    pasos = ["Entra al sitio", "Te escribe", "Lo agendás", "Se atiende y se registra"]
    sitio = ('<div class="cmb-scene sq" data-on="1"><div class="frame"><div class="bar"><i></i><i></i><i></i><span>Centro Ribera · su sitio en GrowiWeb (captura de la demo)</span></div>'
             '<div class="cmb-img"><img src="assets/img/ribera-d.webp" width="1000" height="625" alt="Sitio de muestra de Centro Ribera, un centro de kinesiología, con el botón Pedir turno." loading="lazy"><span class="ring" aria-hidden="true"></span></div></div></div>')
    wapp = ('<div class="cmb-scene sq" data-on="2"><div class="cmb-wa"><p class="wa-h">WhatsApp del negocio</p><div class="msg"><span class="mt">Hola, quiero turno para el sábado a la mañana.</span><small>Un cliente que vio tu sitio</small></div></div></div>')
    app = ('<div class="cmb-scene sq" data-on="3 4"><div class="frame"><div class="bar"><i></i><i></i><i></i><span>Centro Ribera · su gestión en GrowiApp (captura de la demo)</span></div>'
           '<div class="cmb-img"><img src="assets/img/combo-app.webp" width="1000" height="567" alt="Panel de GrowiApp con el negocio de muestra Centro Ribera." loading="lazy">'
           '<div class="cmb-card c3 sq" data-from="3"><small>Agenda · sábado 11:15</small><b>Julián · Primera consulta</b></div>'
           '<div class="cmb-card c4 sq" data-from="4"><small>Venta registrada en GrowiApp</small><b>Consulta inicial · $21.000</b><small>El cierre de caja se arma solo</small></div></div></div></div>')
    caps = ["Un paciente de Centro Ribera encuentra el sitio y toca «Pedir turno».",
            "La consulta le llega al centro por WhatsApp, como hoy: es el puente entre el sitio y la gestión.",
            "El centro la carga en la agenda de GrowiApp. Este paso es manual. Anotarla sola es otro servicio (GrowiFlow) y se define aparte.",
            "Se atiende y el centro registra la venta en GrowiApp: el cierre de caja se arma solo."]
    return ('<div class="seqx combo-seq" data-seq>' + seq_top(pasos) + '<div class="cmb-body">' + sitio + wapp + app + '</div>'
            + seq_cap(caps, "Recorrido ilustrativo de un mismo negocio de muestra (Centro Ribera), armado con capturas de las demos y datos ficticios. El sitio y el sistema no se conectan solos: el puente es el WhatsApp.") + '</div>')

def web_stage(rel):
    return ('<div class="wprev" data-wprev><div class="wp-tools"><div class="seg" role="group" aria-label="Sitio de muestra"><button type="button" class="active" data-demo="centro-ribera" aria-pressed="true">Centro Ribera · consultorio</button><button type="button" data-demo="ceramica" aria-pressed="false">Taller de cerámica</button></div>'
            '<div class="seg" role="group" aria-label="Dispositivo"><button type="button" class="active" data-dev="d" aria-pressed="true">Escritorio</button><button type="button" data-dev="m" aria-pressed="false">Celular</button></div>'
            '<a class="btn k sm wp-open" data-open href="%sdemos/web/centro-ribera/index.html" target="_blank" rel="noopener">Abrir la demo completa ↗</a></div>'
            '<div class="wp-view"><div class="wp-scale"><iframe title="Sitio de muestra de Growi (contenido ficticio)" data-base="%sdemos/web/" data-src="%sdemos/web/centro-ribera/index.html" width="1280" height="820"></iframe></div></div>'
            '<p class="cap">Sitio de muestra de Growi con contenido ficticio: no es un cliente. Elegí una zona del cuerpo, pedí un turno y recorré las secciones.</p></div>' % (rel, rel, rel))


def home():
    rel, sroot = "", "../../"
    hero = ('<section class="hero2" data-sticky-hide aria-labelledby="h1"><div class="w hero2-g"><div><p class="eyebrow">Sistema, sitio web y automatizaciones para negocios de Argentina</p>'
            '<h1 id="h1">Tu negocio, <mark class="sweep">andando</mark>.</h1></div><div><p class="sub">Armamos y dejamos funcionando tu sistema de gestión, tu sitio web y tus automatizaciones. Precio y fecha estimada de entrega, por escrito, antes de empezar.</p>'
            '<div class="cta-row">%s<a class="btn o" href="#producto">Ver cómo funciona ↓</a></div></div></div></section>\n'
            % btn("Hola Growi, quiero conocer más sobre sus soluciones.", "home-hero-whatsapp", "Contanos tu negocio"))
    tabs = tab("app", "01", "GrowiApp", "Llevar el negocio", True) + tab("web", "02", "GrowiWeb", "Que te encuentren", False) + tab("flow", "03", "GrowiFlow", "Tareas repetitivas, a medida", False) + tab("combo", "04", "Combo", "Sitio y sistema juntos", False)
    d = lambda usd, extra="": '<span data-price="%s">$</span>%s' % (usd, extra)
    p_app = panel("app", True, "Ventas, caja, stock y turnos en una sola pantalla, desde el celular.",
                  ["Cierre de caja automático: el número está solo", "Control de stock con alertas, antes de quedarte sin nada", "Agenda de turnos y reservas: reemplazás el cuaderno"],
                  ["Lo armamos con los datos de tu negocio", "1 hora de capacitación en vivo", "7 días de garantía y sin permanencia"],
                  "desde %s/mes + %s de puesta en marcha" % (d(15), d(49)),
                  '<a class="btn k sm" href="app/" data-track="home-xp-app">Ver GrowiApp →</a><a class="btn o sm" href="%sapp/#demo" data-track="home-xp-app-demo">Probar la demo completa</a>' % sroot,
                  '<div class="appwrap"><iframe class="appdemo" src="demos/app.html" title="Demo interactiva de GrowiApp: elegí tu rubro y mirá el panel" height="760" loading="lazy"></iframe></div>'
                  '<p class="cap">GrowiApp: demo real, con datos ilustrativos. Elegí un rubro y los datos cambian.</p>', '<div class="caso-in"><img src="assets/img/colocafe-logo.png" alt="Logo de Colo Café" width="48" height="48" loading="lazy"><div><p class="proof-k">Caso real · Colo Café</p><blockquote>«Necesitábamos ordenar ventas, reservas y caja sin depender de planillas. Growi nos ayudó a tener una operación más clara y fácil de seguir.»</blockquote><cite>Rodrigo, dueño de Colo Café</cite></div></div>')
    p_web = panel("web", False, "Un sitio que presenta tu negocio y facilita las consultas.",
                  ["Un sitio que muestra lo que hacés y deja pedir turno o consultar", "Lo dejamos publicado: vos no tocás nada técnico", "Plantilla adaptada a tu rubro o diseño a medida"],
                  ["Precio y alcance por escrito, antes de empezar", "Revisiones incluidas según el plan", "7 días de ajustes sin cargo desde la entrega"],
                  "desde %s, pago único · dominio y alojamiento aparte" % d(200),
                  '<a class="btn k sm" href="web/" data-track="home-xp-web">Ver GrowiWeb →</a>', web_stage(""))
    p_flow = panel("flow", False, "Menos tareas repetitivas, armadas a medida.",
                   ["Las consultas de un formulario se anotan en una planilla; WhatsApp e Instagram se definen caso por caso", "El aviso del turno sale solo, por mail o por WhatsApp (este último con requisitos de Meta)", "Un resumen de tus ventas por mail o WhatsApp"],
                   ["Lo armamos nosotros y lo dejamos andando", "No hace falta tener GrowiApp ni GrowiWeb", "7 días de ajustes sin cargo desde la entrega"],
                   "pago único · pedidos y consultas desde %s, reportes y recordatorios %s" % (d(79), d(89)),
                   '<a class="btn k sm" href="%sflow/" data-track="home-xp-flow">Ver GrowiFlow →</a>' % sroot, flow_stage(),
                   '<p class="soon-n"><span class="pill">Próximamente</span> Bot de WhatsApp para preguntas frecuentes. Todavía no está disponible.</p>')
    p_combo = panel("combo", False, "Del sitio a la caja, armado por el mismo equipo.",
                    ["El sitio sale 10% menos", "La puesta en marcha de GrowiApp va sin cargo", "La charla inicial sirve para las dos cosas"],
                    ["Un solo equipo, un solo presupuesto por escrito", "Elegís landing o sitio institucional", "El sistema, mes a mes y sin permanencia"],
                    "desde %s el sitio + %s/mes del sistema" % (d(180), d(15)),
                    '<a class="btn k sm" href="%scombo/" data-track="home-combo-link">Ver el combo →</a>' % sroot, combo_stage())
    producto = ('<section class="xp" id="producto" aria-labelledby="h-xp"><div class="w"><h2 class="sr-only" id="h-xp">Cómo funciona cada solución</h2><div class="xp-tabs" role="tablist" aria-label="Soluciones para tu negocio">%s</div>%s%s%s%s</div></section>\n'
                % (tabs, p_app, p_web, p_flow, p_combo))
    # lo que se paga (el ticket queda como recurso secundario de transparencia)
    ej = ticket("Ejemplo de presupuesto", "GrowiApp Start", "Así se ve por escrito lo que incluye un precio.",
                ["Configuración inicial hecha por nuestro equipo", "Carga de los datos de tu negocio", "1 hora de capacitación en vivo", "Soporte por WhatsApp", "7 días de garantía"],
                ("Puesta en marcha", money(49, "una sola vez")), 'Más %s al mes, sin permanencia. Precio y fecha estimada de entrega, por escrito, antes de empezar.' % d(15),
                btn("Hola Growi, quiero consultar por GrowiApp.\n\nMi rubro:\nCuántas personas lo usarían:", "home-ejemplo-whatsapp", "Consultar por GrowiApp", "wide"))
    pasos = [("01", "Nos contás tu negocio", "Por WhatsApp, con tus palabras: qué vendés y qué querés resolver."),
             ("02", "Te decimos qué te conviene", "Te recomendamos una solución y te pasamos precio y fecha estimada de entrega, antes de que decidas nada."),
             ("03", "Lo armamos y te acompañamos", "Lo armamos nosotros, te enseñamos a usarlo y seguimos del otro lado del WhatsApp.")]
    como = ('<section class="sec dark" id="como-empezar" aria-labelledby="h-como"><div class="w como-g"><div><p class="eyebrow">Qué obtenés</p><h2 id="h-como">Lo armamos nosotros. Vos atendés tu negocio.</h2>'
            '<ol class="pasos1">%s</ol></div><div class="ejemplo">%s<p class="cap" style="color:#d4d4cf">Todos los planes incluyen la configuración inicial hecha por nuestro equipo y 1 hora de capacitación en vivo.</p></div></div></section>\n'
            % ("".join('<li><span class="no">PASO %s</span><div><h3>%s</h3><p>%s</p></div></li>' % p for p in pasos), ej))
    # eventos, separado del negocio
    evt = ('<section class="evt" aria-labelledby="h-evt"><div class="w evt-g"><div><p class="eyebrow">Para tus celebraciones · aparte del negocio</p><h2 id="h-evt">Invitaciones digitales para tu evento.</h2>'
           '<p class="lead">Invitaciones a medida para casamientos, cumpleaños, quinceañeras y eventos de empresa. Se comparten con un enlace y cada experiencia se recorre distinto.</p>'
           '<p class="xp-pr" style="margin-top:20px">Con presupuesto · sin precio de lista</p>'
           '<div class="xp-cta" style="margin-top:20px"><a class="btn k" href="%sinvitaciones/" data-track="home-invitaciones-link">Probar las invitaciones de muestra →</a>%s</div></div>'
           '<figure><img src="assets/img/invitaciones-fan.webp" width="952" height="1040" alt="Tres invitaciones digitales de muestra en teléfonos: un casamiento, un cumpleaños y un evento de empresa." loading="lazy"><figcaption class="cap">Invitaciones de muestra reales de Growi, con datos ficticios.</figcaption></figure></div></section>\n'
           % (sroot, btn("Hola Growi, quiero pedir un presupuesto para una invitación digital.\n\nTipo de evento:\nFecha:", "home-invitaciones-whatsapp", "Pedir presupuesto", "o")))
    chooser = ('<div class="ticket chooser" data-chooser><form onsubmit="return false"><fieldset><legend>Armá tu consulta</legend>'
               '<p class="hint">Marcá lo que necesitás y armamos el mensaje con precios «desde».</p>'
               '<label class="opt"><input type="checkbox" name="linea" value="app"><span class="box"><span class="tick" aria-hidden="true">✓</span><span><span class="n">Llevar mi negocio</span><span class="d">GrowiApp · ventas, caja, stock y turnos</span></span><span class="p">desde <span data-price="15" data-price-short>$</span>/mes</span></span></label>'
               '<label class="opt"><input type="checkbox" name="linea" value="web"><span class="box"><span class="tick" aria-hidden="true">✓</span><span><span class="n">Tener un sitio web</span><span class="d">GrowiWeb · te encuentran y te consultan</span></span><span class="p">desde <span data-price="200" data-price-short>$</span></span></span></label>'
               '<div class="sub-opt" data-websub hidden role="group" aria-label="Tipo de sitio"><label><input type="radio" name="webtipo" value="l" checked><span>Una página (landing)</span></label><label><input type="radio" name="webtipo" value="i"><span>Sitio con varias secciones</span></label></div>'
               '<label class="opt"><input type="checkbox" name="linea" value="flow"><span class="box"><span class="tick" aria-hidden="true">✓</span><span><span class="n">Tareas repetitivas, a medida</span><span class="d">GrowiFlow · pedidos, reportes y recordatorios</span></span><span class="p">desde <span data-price="79" data-price-short>$</span></span></span></label>'
               '<div class="sub-opt" data-flowsub hidden role="group" aria-label="Paquete de GrowiFlow"><label><input type="radio" name="flowtipo" value="p" checked><span>Pedidos y consultas</span></label><label><input type="radio" name="flowtipo" value="r"><span>Reportes</span></label><label><input type="radio" name="flowtipo" value="a"><span>Recordatorios</span></label></div>'
               '<label class="opt"><input type="checkbox" name="linea" value="inv"><span class="box"><span class="tick" aria-hidden="true">✓</span><span><span class="n">Invitar a un evento</span><span class="d">Invitaciones digitales a medida</span></span><span class="p">con presupuesto</span></span></label>'
               '</fieldset></form><div class="print" data-print aria-live="off"></div>'
               '<div class="tk-tools" style="margin-top:16px"><div class="cur" role="group" aria-label="Moneda"><button type="button" id="btnARS" class="active" aria-pressed="true">ARS</button><button type="button" id="btnUSD" aria-pressed="false">USD</button></div></div>'
               + btn("Hola Growi, quiero conocer más sobre sus soluciones.", "home-consulta-whatsapp", "O escribinos directo por WhatsApp", "wide").replace('<a class="btn wide"', '<a data-cta class="btn o wide"') + '</div>')
    consulta = ('<section class="sec" id="consulta" aria-labelledby="h-cons"><div class="w faq-g"><div><p class="eyebrow">Contanos qué necesitás</p><h2 id="h-cons">Armá tu consulta.</h2>'
                '<p class="lead">Marcá lo que necesitás y se arma el mensaje de WhatsApp. Es una referencia: en el sitio todavía no se contrata ni se paga.</p></div>%s</div></section>\n' % chooser)
    pre = ('<section class="sec tint" id="preguntas" aria-labelledby="h-faq"><div class="w faq-g"><div><p class="eyebrow">Antes de escribirnos</p><h2 id="h-faq">Lo que se pregunta primero.</h2></div>%s</div></section>\n'
           % faq(["junto", "tarda", "perm", "precios", "fact", "conv"]))
    cierre = ('<section class="cierre" data-sticky-hide aria-labelledby="h-cierre"><div class="w"><h2 id="h-cierre">Contanos qué negocio tenés.</h2><div>'
              '<p>Te recomendamos una solución y te pasamos precio y fecha estimada de entrega por WhatsApp, de lunes a sábado de 9 a 19 hs.</p>%s</div></div></section>\n'
              % btn("Hola Growi, quiero que me recomienden qué me conviene.\n\nMi rubro:\nQué quiero resolver:", "home-final-whatsapp", "Contanos tu negocio"))
    return (head("Growi: tu negocio, andando (candidata r2)", "Sistema de gestión, sitio web y automatizaciones para negocios de Argentina. Mirá cómo funcionan y pedí precio y fecha por escrito.", rel)
            + header("", rel, sroot) + '<main id="contenido">\n' + hero + producto + como + evt + consulta + pre + cierre + '</main>\n'
            + footer(rel, sroot, "Hola Growi, quiero conocer más sobre sus soluciones.", "home"))


# ------------------------------------------------------------------ GROWIAPP
def app():
    rel, sroot = "../", "../../../"
    msg_demo = "Hola Growi, quiero conocer GrowiApp y coordinar una demo de 20 minutos.\n\nMi rubro:\nDías y horarios que me vienen bien:"
    hero = ('<section class="ph" data-sticky-hide aria-labelledby="h1"><div class="w ph-g"><div><p class="crumb"><a href="../">Growi</a> / <span>GrowiApp</span></p>'
            '<h1 id="h1">Tu sistema de gestión, <mark class="sweep">listo para trabajar</mark>.</h1>'
            '<p class="sub">Registrás ventas, controlás el stock, llevás los turnos y cerrás la caja desde el celular. Lo armamos con los datos de tu negocio y te confirmamos una fecha estimada de entrega antes de empezar.</p>'
            '<div class="cta-row" style="display:flex;flex-wrap:wrap;gap:12px;margin-top:30px">%s<a class="btn o" href="#precios">Ver precios ↓</a></div>'
            '<ul class="proof"><li><span>Desde <span data-price="15">$</span> por mes + <span data-price="49">$</span> de puesta en marcha, una sola vez</span></li><li><span>Garantía de 7 días · Sin permanencia</span></li></ul></div>'
            '<div><div class="frame"><div class="bar"><i></i><i></i><i></i><span style="margin-left:8px">GrowiApp · demo con datos ilustrativos</span></div><img src="../assets/img/demo-app-escritorio.webp" width="1400" height="752" alt="Panel de GrowiApp de una cafetería de ejemplo: ventas de hoy, transacciones, reservas y productos más vendidos."></div>'
            '<p style="margin-top:16px"><a class="btn k sm" href="../../../app/#demo" data-track="app-hero-demo-abrir">Probar la demo interactiva →</a></p><p class="cap">Captura de la demo real de la página actual (datos ilustrativos): elegís tu rubro y los datos cambian.</p></div></div></section>\n'
            % btn(msg_demo, "app-hero-demo-whatsapp", "Solicitar una demo de 20 minutos"))
    items = [("Cada venta registrada al momento", "para saber cuánto ganaste, por producto y por hora"), ("Cierre de caja automático", "sin hacer cuentas al final del día: el número está solo"),
             ("Control de stock con alertas", "te avisa cuando un producto está por agotarse, antes de quedarte sin nada"), ("Agenda de turnos y reservas", "reemplazás el cuaderno por una agenda digital que nunca se pierde"),
             ("Ficha de clientes", "historial, preferencias y frecuencia de visita de cada cliente"), ("Reportes por día, producto y canal de pago", "ves qué funciona y qué no, sin necesitar un contador"),
             ("Todos los medios de pago", "efectivo, Mercado Pago y transferencias en un mismo registro"), ("Acceso desde cualquier dispositivo", "celular, tablet o computadora, donde estés")]
    inc = ('<section class="sec" aria-labelledby="h-inc"><div class="w"><p class="eyebrow">Qué incluye</p><h2 id="h-inc">Todo lo que necesitás. Nada que no uses.</h2>'
           '<ul class="feat">%s</ul>'
           '<p class="grp" style="padding-top:44px">Para tu rubro</p><div class="rubros" style="margin-top:0">%s</div></div></section>\n'
           % ("".join("<li><div><b>%s</b><span>%s</span></div></li>" % (E(a), E(b)) for a, b in items),
              "".join('<a href="%s%s" data-track="app-rubro-%s">%s<span aria-hidden="true">→</span></a>' % (sroot, h, t, n) for n, h, t in [("Cafeterías", "app/cafeterias/", "cafeterias"), ("Peluquerías y estética", "app/peluquerias/", "peluquerias"), ("Talleres y servicios", "app/talleres/", "talleres"), ("Kioscos y comercios", "app/retail/", "retail")])))
    def cta(plan):
        return btn("Hola Growi, quiero consultar por GrowiApp, plan %s.\n\nMi rubro:\nCuántas personas lo usarían:" % plan, "app-pricing-whatsapp", "Consultar por el plan %s" % plan, "wide")
    t1 = ticket("Plan 01", "Start", "Para empezar con una persona y una sucursal.", ["1 usuario", "1 sucursal", "Ventas, caja y stock", "Turnos y reservas", "Ficha de clientes", "Reportes simples", "Soporte por WhatsApp"],
                ("Por mes", money(15, "/mes", True)), '+ <span data-price="49">$</span> de puesta en marcha, una sola vez<br><span data-period-note>Pago mensual. Cancelás cuando quieras.</span>', cta("Start"))
    t2 = ticket("Plan 02", "Pro", "Para equipos que cargan ventas o turnos a la vez.", ["Hasta 3 usuarios, cada uno con su acceso", "1 sucursal", "Todo lo de Start", "~Factura electrónica ARCA: próximamente, todavía no disponible"],
                ("Por mes", money(29, "/mes", True)), '+ <span data-price="149">$</span> de puesta en marcha, una sola vez<br><span data-period-note>Pago mensual. Cancelás cuando quieras.</span>', cta("Pro"), "Recomendado si son varios")
    t3 = ticket("Plan 03", "Multi", "Para más de una sucursal.", ["Hasta 5 usuarios", "Hasta 2 sucursales", "Todo lo de Pro", "Reportes avanzados por sucursal", "WhatsApp prioritario"],
                ("Por mes", money(49, "/mes", True)), '+ <span data-price="249">$</span> de puesta en marcha, una sola vez<br><span data-period-note>Pago mensual. Cancelás cuando quieras.</span>', cta("Multi"))
    precios = ('<section class="sec tint" id="precios" aria-labelledby="h-pre"><div class="w"><p class="eyebrow">Precios</p><h2 id="h-pre">Un pago de puesta en marcha y un abono mensual fijo.</h2>'
               '<p class="lead">Lo armamos, cargamos tus datos y te enseñamos a usarlo. Lo que te decimos es lo que pagás.</p>'
               '<div class="tk-tools"><div class="cur" role="group" aria-label="Moneda"><button type="button" id="btnARS" class="active" aria-pressed="true">ARS</button><button type="button" id="btnUSD" aria-pressed="false">USD</button></div>'
               '<div class="seg" role="group" aria-label="Período de pago"><button type="button" data-period="monthly" class="active" aria-pressed="true">Mensual</button><button type="button" data-period="annual" aria-pressed="false">Anual −15%%</button></div></div>'
               '<div class="tickets">%s%s%s</div>'
               '<p class="note" style="max-width:86ch;margin-top:34px">Todos los planes incluyen la configuración inicial hecha por nuestro equipo y 1 hora de capacitación en vivo. Planes y precios previstos: todavía no se aceptan contrataciones ni pagos. El precio de cada plan es el informado: abono mensual y puesta en marcha, una sola vez. No incluye costos de terceros, como las comisiones de los medios de pago. Están fijados en dólares: el valor en pesos es una referencia que se actualiza con el dólar oficial (venta). Garantía de 7 días desde que GrowiApp queda andando. Los descuentos no se acumulan: si te corresponde más de uno, se aplica el mejor.</p></div></section>\n'
               % (t1, t2, t3))
    gar = ('<section class="sec" aria-labelledby="h-gar"><div class="w"><div class="band"><div><h3 id="h-gar">Garantía de 7 días</h3><p style="margin-top:8px;max-width:60ch">Si en los 7 días desde que GrowiApp queda andando no funciona como te prometimos, te devolvemos el 100%% de la puesta en marcha. Sin formularios, sin esperas.</p></div></div>'
           '<div style="margin-top:72px" class="faq-g"><div><p class="eyebrow">Preguntas</p><h2>Lo que todos preguntan antes de empezar.</h2></div>%s</div></div></section>\n'
           % faq_lista(FAQS["app"]))
    cierre = ('<section class="cierre" data-sticky-hide aria-labelledby="h-cierre"><div class="w"><h2 id="h-cierre">¿Querés ver cómo quedaría para tu negocio?</h2><div><p>Pedí una demo de 20 minutos armada con tu rubro. Coordinamos día y horario según disponibilidad.</p>%s</div></div></section>\n'
              % btn(msg_demo, "app-final-demo-whatsapp", "Solicitar una demo de 20 minutos"))
    return (head("GrowiApp: sistema de gestión para comercios (candidata)", "Ventas, caja, stock, turnos y clientes en una sola pantalla, desde el celular. Desde USD 15 por mes.", rel)
            + header("app", rel, sroot) + '<main id="contenido">\n' + hero + inc + precios + gar + cierre + '</main>\n'
            + footer(rel, sroot, "Hola Growi, quiero consultar por GrowiApp.\n\nMi rubro:\nCuántas personas lo usarían:", "app"))

# ------------------------------------------------------------------ GROWIWEB
def web():
    rel, sroot = "../", "../../../"
    msg = "Hola Growi, quiero un presupuesto para un sitio web.\n\nMi rubro:\nQué quiero que haga quien entra (llamar, reservar, comprar):"
    hero = ('<section class="ph" data-sticky-hide aria-labelledby="h1"><div class="w ph-g"><div><p class="crumb"><a href="../">Growi</a> / <span>GrowiWeb</span></p>'
            '<h1 id="h1">Un sitio que presenta tu negocio y <mark class="sweep">facilita las consultas</mark>.</h1>'
            '<p class="sub">Diseñamos y desarrollamos landing pages y sitios institucionales. Los dejamos publicados: vos no tocás nada técnico, y sabés cuánto sale antes de empezar.</p>'
            '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:30px">%s<a class="btn o" href="#ejemplos">Ver ejemplos ↓</a></div>'
            '<ul class="proof"><li><span>Precio y alcance por escrito antes de empezar</span></li><li><span>Dominio y alojamiento los pagás vos, aparte</span></li></ul></div>'
            '<div>%s</div></div></section>\n'
            % (btn(msg, "web-hero-whatsapp", "Pedir presupuesto"), web_stage('../')))
    def cta(plan):
        return btn("Hola Growi, quiero un presupuesto para el plan %s de GrowiWeb.\n\nMi rubro:" % plan, "web-pricing-whatsapp", "Consultar por el plan %s" % plan, "wide")
    def tk(code, name, sub, lines, usd, fine, ribbon=""):
        return ticket(code, name, sub, lines, ("Pago único", money(usd)), fine, cta(name), ribbon)
    ent = "Entrega: fecha estimada en el presupuesto. Dominio y alojamiento no incluidos."
    lp = ('<div class="tickets" id="p-landing" role="tabpanel">%s%s%s</div>' % (
        tk("Landing 01", "Express", "Una sola página para conseguir consultas, reservas o ventas.", ["Hasta 4 secciones", "Plantilla adaptada a tu rubro", "Vos escribís los textos, nosotros armamos el sitio", "Formulario simple (llega por email)", "Preparado para aparecer en Google", "1 ronda de revisiones", "7 días de soporte después de la entrega"], 200, ent),
        tk("Landing 02", "Pro", "Diseño adaptado a tu marca.", ["Hasta 6 secciones", "Diseño adaptado a tu marca", "Redacción básica incluida", "Formulario a medida", "Preparado para Google y para verse bien al compartirlo", "2 rondas de revisiones", "7 días de soporte después de la entrega"], 299, ent, "El más completo para empezar"),
        tk("Landing 03", "Performance", "Diseño 100% a medida, pensado para vender.", ["Hasta 8 secciones", "Diseño 100% a medida", "Textos pensados para vender", "Formulario completo: cada consulta queda guardada en una planilla", "Trabajo completo para Google + medición de visitas y de tus anuncios", "3 rondas + una revisión final antes de publicar", "30 días de soporte después de la entrega"], 449, ent)))
    ins = ('<div class="tickets two" id="p-inst" role="tabpanel" hidden>%s%s</div>' % (
        tk("Sitio 01", "Base", "Un sitio completo, con navegación, mapa y contacto.", ["Home · servicios · contacto · mapa", "WhatsApp integrado", "Diseño a medida, adaptado a tu marca", "Preparado para aparecer en Google", "1 ronda de revisiones", "30 días de soporte después de la entrega"], 550, ent),
        tk("Sitio 02", "Con turnos", "Todo lo del plan Base, conectado con tu sistema de turnos.", ["Todo lo del plan Base", "Formulario de solicitud de turno", "Conectado con tu sistema de turnos", "Trabajo completo para Google + medición de visitas y de tus anuncios", "3 rondas + una revisión final antes de publicar", "30 días de soporte prioritario"], 729, ent, "Recomendado para consultorios")))
    planes = ('<section class="sec tint" id="planes" aria-labelledby="h-pl"><div class="w"><p class="eyebrow">Planes y precios</p><h2 id="h-pl">¿Qué necesitás?</h2>'
              '<div class="pick" role="tablist" aria-label="Tipo de sitio"><button type="button" role="tab" data-panel="p-landing" aria-selected="true"><b>Una página para que te contacten</b><span>Landing page · desde <span data-price="200">$</span></span></button>'
              '<button type="button" role="tab" data-panel="p-inst" aria-selected="false" tabindex="-1"><b>Un sitio completo con varias secciones</b><span>Sitio institucional · desde <span data-price="550">$</span></span></button></div>'
              '<div class="tk-tools"><div class="cur" role="group" aria-label="Moneda"><button type="button" id="btnARS" class="active" aria-pressed="true">ARS</button><button type="button" id="btnUSD" aria-pressed="false">USD</button></div></div>'
              '%s%s'
              '<p class="note" style="max-width:86ch;margin-top:34px">Tu web, con tiempos claros desde el inicio. El plazo de entrega se define según el plan, el alcance y los materiales necesarios. Te confirmamos una fecha estimada en el presupuesto, antes de iniciar el proyecto. El dominio y el alojamiento del sitio no están incluidos: los contratás y pagás vos, aparte. Te recomendamos cuáles y lo dejamos publicado ahí. Todos los planes tienen 7 días de ajustes sin cargo desde la entrega si algo no quedó como esperabas. %s El plan Con turnos incluye una conexión a medida con tu sistema de turnos, que se considera en la fecha estimada.</p></div></section>\n'
              % (lp, ins, E(L1_PRECIOS)))
    ex = [("Redacción completa desde cero", 69), ("Formulario que guarda cada consulta en una planilla", 59), ("Medición de visitas y de anuncios (Google y Meta) configurada", 39), ("Ronda adicional de revisiones", 29)]
    extras = ('<section class="sec" aria-labelledby="h-ex"><div class="w"><div class="faq-g"><div><p class="eyebrow">Extras</p><h2 id="h-ex">Sumá lo que tu proyecto necesita.</h2></div>'
              '<div><table class="extras"><caption class="sr-only">Extras de GrowiWeb y su precio</caption><thead><tr><th scope="col">Extra</th><th scope="col">Precio</th></tr></thead><tbody>%s<tr><td>Conexión con tu sistema de clientes</td><td>A cotizar</td></tr></tbody></table></div></div>'
              '<div class="band" style="margin-top:56px"><div><h3>¿Querés ordenar también ventas, caja y turnos?</h3><p style="margin-top:8px;max-width:60ch">Con el combo cualquiera de estos planes sale 10%% menos y la puesta en marcha de GrowiApp va sin cargo.</p></div><a class="btn o" href="%scombo/" data-track="web-bundle-link">Ver el combo →</a></div></div></section>\n'
              % ("".join('<tr><td>%s</td><td><span data-price="%s">$</span></td></tr>' % (E(a), b) for a, b in ex), sroot))
    ejem = ('<section class="sec dark" id="ejemplos" aria-labelledby="h-ej"><div class="w"><p class="eyebrow">Ejemplos</p><h2 id="h-ej">Dos sitios de muestra.</h2>'
            '<p class="lead">Son demos de Growi con contenido ficticio: no son clientes.</p>'
            '<div class="cmb"><div><div class="frame"><img src="../assets/img/ribera-d.webp" width="1000" height="625" alt="Centro Ribera, sitio de muestra de un centro de kinesiología." loading="lazy"></div><p class="cap" style="color:#d4d4cf">Un consultorio de kinesiología · sitio institucional con turnos.</p><p style="margin-top:12px"><a class="btn sm" href="%sweb/demos/centro-ribera/index.html" data-track="web-trabajo-institucional-abrir">Abrir la demo →</a></p></div>'
            '<div><div class="frame"><img src="../assets/img/demo-web-ceramica-d.webp" width="1280" height="800" alt="Demo de una landing page para un taller de cerámica." loading="lazy"></div><p class="cap" style="color:#d4d4cf">Un taller de cerámica · landing page.</p><p style="margin-top:12px"><a class="btn sm" href="%sweb/demos/ceramica/" data-track="web-trabajo-landing-abrir">Abrir la demo →</a></p></div></div></div></section>\n' % (sroot, sroot))
    pasos = [("01", "Nos escribís por WhatsApp", "Nos contás qué vendés y qué querés que haga quien entra: llamar, reservar o comprar. Te dejamos un mensaje para completar."), ("02", "Te pasamos el precio", "Antes de empezar sabés cuánto sale y qué incluye, por escrito."),
             ("03", "Lo armamos con vos", "Armamos el sitio y lo ajustamos en las rondas de revisión de tu plan."), ("04", "Lo publicamos", "Lo dejamos online y tenés 7 días de ajustes sin cargo desde la entrega.")]
    proc = ('<section class="sec" aria-labelledby="h-pr"><div class="w"><p class="eyebrow">Cómo contratás</p><h2 id="h-pr">Cuatro pasos, con el precio primero.</h2>'
            '<ol class="feat" style="grid-template-columns:repeat(2,minmax(0,1fr));list-style:none">%s</ol>'
            '<div class="band" style="margin-top:56px"><div><h3>¿Para un evento?</h3><p style="margin-top:8px;max-width:60ch">Hacemos invitaciones digitales a medida para casamientos, cumpleaños, quinceañeras y eventos de empresa.</p></div><a class="btn o" href="%sinvitaciones/" data-track="web-invitaciones-ver">Ver las invitaciones →</a></div></div></section>\n'
            % ("".join('<li><div><b>%s · %s</b><span>%s</span></div></li>' % (a, E(b), E(c)) for a, b, c in pasos), sroot))
    fq = ('<section class="sec tint" aria-labelledby="h-fq"><div class="w faq-g"><div><p class="eyebrow">Preguntas</p><h2 id="h-fq">Lo que conviene saber antes de arrancar.</h2></div>%s</div></section>\n'
          % ("<div>" + faq_lista(FAQS["web"]) + faq(["tarda", "precios"]) + "</div>"))
    cierre = ('<section class="cierre" data-sticky-hide aria-labelledby="h-cierre"><div class="w"><h2 id="h-cierre">¿Ya sabés qué querés? Escribinos.</h2><div><p>Te pasamos un precio por escrito, con el alcance y la fecha estimada, antes de empezar.</p>%s</div></div></section>\n'
              % btn(msg, "web-final-whatsapp", "Pedir presupuesto"))
    return (head("GrowiWeb: sitios web para negocios (candidata)", "Landing pages y sitios institucionales con precio y alcance por escrito antes de empezar.", rel)
            + header("web", rel, sroot) + '<main id="contenido">\n' + hero + planes + extras + ejem + proc + fq + cierre + '</main>\n'
            + footer(rel, sroot, msg, "web"))


SITE = "https://growi.ar/"
def localizar(html_s, rel, sroot):
    for f in ("shared.css", "shared.fx.js", "shared.js"):
        html_s = html_s.replace(sroot + f, rel + "vendor/" + f)
    html_s = html_s.replace(sroot + "web/demos/", rel + "demos/web/")
    return html_s.replace('"' + sroot, '"' + SITE)

if __name__ == "__main__":
    for name, fn, rel, sroot in (("index.html", home, "", "../../"), ("app/index.html", app, "../", "../../../"), ("web/index.html", web, "../", "../../../")):
        p = os.path.join(OUT, name); os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w", encoding="utf-8", newline="\n") as f: f.write(localizar(fn(), rel, sroot))
        print(name, os.path.getsize(p))
