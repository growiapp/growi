# Componentes compartidos de la candidata Growi 360° R3.
# Precios: USD es la fuente de verdad (data-price). El texto ARS estático se calcula como el workflow del tipo de cambio.
import os, html, json, re, io, math
from urllib.parse import quote
OUT = os.path.dirname(os.path.abspath(__file__))
L1ROOT = os.path.normpath(os.path.join(OUT, "..", ".."))
E = html.escape
WA = "https://wa.me/5491170593877?text="
def _fx_vigente():
    """La cotización publicada vive únicamente en shared.fx.js de la raíz."""
    path = os.path.join(L1ROOT, "shared.fx.js")
    match = re.search(r"venta:\s*([\d.]+)", io.open(path, encoding="utf-8").read())
    if not match or float(match.group(1)) <= 0 or not math.isfinite(float(match.group(1))):
        raise ValueError("Cotización inválida en %s" % path)
    return float(match.group(1))


FX = _fx_vigente()
CFG = {"release": False}          # release=True: indexable, con analítica, enlaces absolutos y recursos compartidos de la raíz

L1_PIE = ("Precios en USD; el valor en pesos es orientativo y se actualiza con el dólar oficial (venta). "
          "Cada proyecto se confirma con un presupuesto por escrito antes de empezar. Para consultar disponibilidad, alcance y condiciones, escribinos por WhatsApp o correo.")
L1_PRECIOS = ("Precios en USD; el valor en pesos es orientativo y se actualiza con el dólar oficial (venta). "
              "Dominio, alojamiento y costos de terceros (comisiones de medios de pago, mensajes de WhatsApp) se cotizan aparte cuando correspondan. Lo «desde» y lo a medida se confirman en un presupuesto por escrito antes de empezar.")

# ---------------------------------------------------------------- precios
def ars(usd):
    v = usd * FX; paso = 1000 if v >= 100000 else 100
    # Math.round de JavaScript para importes no negativos, incluidos los .5.
    n = int(math.floor(v / paso + 0.5) * paso)
    return "$" + "{:,}".format(n).replace(",", ".")

def P(usd, short=False, extra=""):
    t = ars(usd) + ("" if short else " ARS")
    return '<span data-price="%s"%s%s>%s</span>' % (usd, " data-price-short" if short else "", extra, t)

def money(usd, suf="", plan=False):
    a = ' data-plan-price data-usd="%s"' % usd if plan else ""
    return '<strong class="t-num">%s%s</strong>' % (P(usd, False, a), (" <small>%s</small>" % suf) if suf else "")

# ---------------------------------------------------------------- enlaces
class Pg:
    """Contexto de una página: ruta publicada (p. ej. 'app/cafeterias/') y utilidades de enlace."""
    def __init__(self, path):
        self.path = path
        self.depth = len([x for x in path.split("/") if x])
        self.rel = "../" * self.depth
    def u(self, target):
        if CFG["release"]:
            return "/" + target if target else "/"
        return (self.rel + target) if (self.rel + target) else "./"
    def asset(self, name):
        return self.rel + name
    def shared(self, name):
        return ("/" + name) if CFG["release"] else self.rel + "vendor/" + name
    def legal(self, name):
        return ("/" + name + "/") if CFG["release"] else "https://growi.ar/" + name + "/"

def btn(texto_wa, track, label, cls=""):
    return '<a class="btn%s" href="%s%s" target="_blank" rel="noopener noreferrer" data-track="%s">%s</a>' % ((" " + cls) if cls else "", WA, quote(texto_wa), track, label)

ICO = {
 "app": '<svg class="l-ico" viewBox="0 0 48 48" aria-hidden="true"><path d="M10 6h28v36l-5-3-5 3-4-3-4 3-5-3-5 3z"/><path class="a" d="M17 16h14M17 23h14M17 30h8"/></svg>',
 "web": '<svg class="l-ico" viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="9" width="38" height="30" rx="3"/><path d="M5 17h38"/><path class="a" d="M12 26h14M12 32h9"/></svg>',
 "flow": '<svg class="l-ico" viewBox="0 0 48 48" aria-hidden="true"><path d="M8 18h26l-6-6M40 30H14l6 6"/><path class="a" d="M34 18l-6 6M14 30l6-6"/></svg>',
 "combo": '<svg class="l-ico" viewBox="0 0 48 48" aria-hidden="true"><rect x="6" y="10" width="24" height="24" rx="3"/><rect class="a" x="18" y="16" width="24" height="24" rx="3"/></svg>',
 "inv": '<svg class="l-ico" viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="11" width="38" height="26" rx="3"/><path class="a" d="M6 14l18 13 18-13"/></svg>',
}
# Soluciones para el negocio: clave, nombre, ruta, una línea «para qué»
SOL = [("app", "GrowiApp", "app/", "Ordená ventas, caja, stock y turnos"),
       ("web", "GrowiWeb", "web/", "Que te encuentren y te consulten"),
       ("flow", "GrowiFlow", "flow/", "Dejá de hacer tareas repetitivas a mano"),
       ("combo", "Combo", "combo/", "Sitio y sistema, con un solo equipo")]
RUBROS = [("Cafeterías y bares", "app/cafeterias/", "cafeterias"), ("Peluquerías y estética", "app/peluquerias/", "peluquerias"),
          ("Talleres y servicios", "app/talleres/", "talleres"), ("Kioscos y comercios", "app/retail/", "retail")]

# ---------------------------------------------------------------- SEO
def _ld_l1(l1path):
    f = os.path.join(L1ROOT, l1path, "index.html")
    if not os.path.exists(f): return []
    s = io.open(f, encoding="utf-8").read(); out = []
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', s, flags=re.S):
        try: d = json.loads(m.group(1))
        except Exception: continue
        def limpio(x):
            if isinstance(x, dict) and x.get("@type") == "FAQPage": return None
            if isinstance(x, dict) and "@graph" in x:
                x = dict(x); x["@graph"] = [g for g in x["@graph"] if not (isinstance(g, dict) and g.get("@type") == "FAQPage")]
                return x if x["@graph"] else None
            return x
        d = limpio(d)
        if d: out.append(json.dumps(d, ensure_ascii=False).replace("Precio fijo, fecha estimada de entrega en el presupuesto, sin sorpresas", "Precio de referencia, y alcance, importe y fecha estimada de entrega confirmados por escrito antes de empezar"))  # F3.4: modelo comercial único
    return out

def faq_ld(pares):
    if not pares: return ""
    d = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in pares]}
    return '<script type="application/ld+json">%s</script>\n' % json.dumps(d, ensure_ascii=False)

def head(pg, titulo, desc, og="growi-og-1200x630.png", l1ld=None, faqs=None, cls="", ld_override=None):
    rel = pg.rel; url = "https://growi.ar/" + pg.path
    robots = '<meta name="robots" content="index, follow">' if CFG["release"] else '<meta name="robots" content="noindex, nofollow">'
    lds = "".join('<script type="application/ld+json">%s</script>\n' % b for b in (ld_override if ld_override is not None else _ld_l1(l1ld))) if l1ld is not None or ld_override is not None else ""
    lds += faq_ld(faqs)
    ogimg = "https://growi.ar/png/" + og
    pla = '<script defer data-domain="growi.ar" src="https://plausible.io/js/script.js"></script>\n' if CFG["release"] else ""
    return ('<!doctype html>\n<html lang="es-AR">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n%s\n'
            '<title>%s</title>\n<meta name="description" content="%s">\n<link rel="canonical" href="%s">\n<meta name="theme-color" content="#f6f6f4">\n'
            '<meta property="og:type" content="website"><meta property="og:locale" content="es_AR"><meta property="og:site_name" content="Growi">'
            '<meta property="og:title" content="%s"><meta property="og:description" content="%s"><meta property="og:url" content="%s"><meta property="og:image" content="%s">\n'
            '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="%s"><meta name="twitter:description" content="%s"><meta name="twitter:image" content="%s">\n'
            '<link rel="icon" href="%sfavicon/favicon-32x32.png" type="image/png">\n'
            '<link rel="preload" href="%sassets/fonts/epilogue-latin.woff2" as="font" type="font/woff2" crossorigin>\n'
            '<script>var d=document.documentElement,o=null;try{o=localStorage.getItem("cr_motion")}catch(e){}try{var r=matchMedia("(prefers-reduced-motion: reduce)").matches;if(o==="on"||(!r&&o!=="off"))d.classList.add("mo")}catch(e){}</script>\n'
            '%s<link rel="stylesheet" href="%sassets/growi360.css"><link rel="stylesheet" href="%sassets/growi33.css"><link rel="stylesheet" href="%sassets/growi35.css"><link rel="stylesheet" href="%sassets/growi36.css"><link rel="stylesheet" href="%sassets/growi81.css">\n%s</head>\n<body%s>\n<a class="sr" href="#contenido">Saltar al contenido</a>\n'
            % (robots, E(titulo), E(desc), url, E(titulo), E(desc), url, ogimg, E(titulo), E(desc), ogimg, "/" if CFG["release"] else rel, rel, pla, rel, rel, rel, rel, rel, lds, (' class="%s"' % cls) if cls else ""))

# ---------------------------------------------------------------- navegación
def _cur(pg, cur, k, r):
    """aria-current correcto: «page» solo en la página exacta; «true» (sección) en subpáginas de esa línea, p. ej. los rubros de GrowiApp."""
    if cur != k: return ""
    return ' aria-current="page"' if pg.path == r else ' aria-current="true"'

def header(pg, cur):
    # Navegación global = por audiencia: «Para tu negocio» (menú con las cuatro soluciones), «Invitaciones» (eventos) y Consultar.
    prod = "".join('<a href="%s"%s><b>%s</b><span>%s</span></a>' % (pg.u(r), _cur(pg, cur, k, r), n, d) for k, n, r, d in SOL)
    en_neg = cur in [k for k, *_ in SOL]
    menu = ('<div class="nav-g"><button type="button" class="nav-btn%s" id="navNeg" aria-expanded="false" aria-controls="navNegPanel">Para tu negocio<i aria-hidden="true"></i></button>'
            '<div class="nav-panel" id="navNegPanel" hidden>%s</div></div>' % (" is-cur" if en_neg else "", prod))
    inv = '<a class="nav-ev" href="%s"%s>Invitaciones</a>' % (pg.u("invitaciones/"), _cur(pg, cur, "inv", "invitaciones/"))
    mob = ('<span class="mm-g">Para tu negocio</span>' + "".join('<a href="%s"%s><span>%s<small>%s</small></span><span aria-hidden="true">→</span></a>' % (pg.u(r), _cur(pg, cur, k, r), n, d) for k, n, r, d in SOL)
           + '<span class="mm-g">Para tus eventos</span><a href="%s"%s>Invitaciones digitales<span aria-hidden="true">→</span></a>' % (pg.u("invitaciones/"), _cur(pg, cur, "inv", "invitaciones/")))
    return ('<header class="top" id="mainNav"><div class="w"><a class="logo" href="%s">Growi<i>.</i></a>'
            '<nav class="nav" aria-label="Principal">%s%s</nav>%s'
            '<button class="menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="mobileMenu" aria-label="Abrir menú">Menú</button></div></header>\n'
            '<div class="mobile-menu" id="mobileMenu" aria-hidden="true"><div class="mobile-menu-card"><a href="%s"%s>Inicio<span aria-hidden="true">→</span></a>%s%s</div></div>\n'
            % (pg.u(""), menu, inv, btn("Hola Growi, quiero conocer más sobre sus soluciones.", "nav-whatsapp", "Consultar", "sm"), pg.u(""), ' aria-current="page"' if pg.path == "" else "", mob,
               btn("Hola Growi, quiero conocer más sobre sus soluciones.", "mobile-menu-whatsapp", "Hablar por WhatsApp", "wide")))

def subnav(items, cur_line):
    """Navegación contextual de la página: anclas internas."""
    return '<nav class="ctx" aria-label="En esta página"><div class="w">%s</div></nav>\n' % "".join('<a href="#%s">%s</a>' % (a, n) for a, n in items)

def otras(pg, excluir, rubro_msg=None):
    """Navegación contextual de cierre: las otras soluciones (sin repetir el menú: con el «para qué» de cada una)."""
    tarjetas = "".join('<a class="otra" href="%s" data-track="otras-%s">%s<b>%s</b><span>%s</span></a>' % (pg.u(r), k, ICO[k], n, d) for k, n, r, d in SOL if k != excluir)
    return ('<section class="sec otras-s" aria-labelledby="h-otras"><div class="w"><h2 id="h-otras">También para tu negocio</h2><div class="otras">%s</div>'
            '<p class="ev-link">¿Buscás una invitación para un evento? <a href="%s" data-track="otras-invitaciones">Mirá las invitaciones digitales →</a></p></div></section>\n'
            % (tarjetas, pg.u("invitaciones/")))

def footer(pg, sticky_msg, track):
    prod = "".join('<li><a href="%s">%s</a></li>' % (pg.u(r), n) for k, n, r, d in SOL)
    rub = "".join('<li><a href="%s">%s</a></li>' % (pg.u(r), n) for n, r, t in RUBROS)
    pie = "" if CFG["release"] else '<p class="l1" style="margin-top:14px;border:0;padding:0" data-motion>© 2026 Growi · Candidata R3.8, solo local (no publicada).</p>'
    if CFG["release"]: pie = '<p class="l1" style="margin-top:14px;border:0;padding:0">© 2026 Growi</p>'
    return ('<footer class="foot"><div class="w"><div class="cols"><div><a class="logo" href="%s">Growi<i>.</i></a><p style="margin-top:14px;max-width:30ch">Crecé con tu negocio.</p></div>'
            '<div><p class="fh">Para tu negocio</p><ul>%s</ul></div><div><p class="fh">GrowiApp por rubro</p><ul>%s</ul></div>'
            '<div><p class="fh">Eventos y contacto</p><ul><li><a href="%s">Invitaciones digitales</a></li><li><a href="%s%s" target="_blank" rel="noopener noreferrer" data-track="%s-footer-whatsapp">WhatsApp</a></li><li><a href="mailto:hola@growi.ar">hola@growi.ar</a></li>'
            '<li><a href="%s">Privacidad</a></li><li><a href="%s">Términos</a></li></ul></div></div>'
            '<p class="l1">%s</p>%s</div></footer>\n<div class="sticky-cta">%s</div>\n'
            '<script src="%s"></script>\n<script src="%s"></script>\n<script src="%sassets/growi360.js" defer></script>\n<script src="%sassets/growi33.js" defer></script>\n<script src="%sassets/growi35.js" defer></script>\n<script src="%sassets/growi36.js" defer></script>\n<script src="%sassets/growi81.js" defer></script>\n</body>\n</html>\n'
            % (pg.u(""), prod, rub, pg.u("invitaciones/"), WA, quote("Hola Growi, quiero conocer más sobre sus soluciones."), track, pg.legal("privacidad"), pg.legal("terminos"),
               L1_PIE, pie, btn(sticky_msg, track + "-floating-whatsapp", "Consultar por WhatsApp", "wide"), pg.shared("shared.fx.js"), pg.shared("shared.js"), pg.rel, pg.rel, pg.rel, pg.rel, pg.rel))

# ---------------------------------------------------------------- bloques
def faq(pares):
    return '<div class="faq">%s</div>' % "".join("<details><summary>%s</summary><p>%s</p></details>" % (E(q), E(a)) for q, a in pares)

def ticket(codigo, titulo, sub, lineas, total_html, fine, cta, ribbon="", extra_attr=""):
    ls = "".join(('<li class="soon"><span>%s</span><span class="f"></span><span class="v">pronto</span></li>' % E(l[1:])) if l.startswith("~") else ('<li><span>%s</span><span class="f"></span><span class="v ok">✓</span></li>' % E(l)) for l in lineas)
    rb = '<span class="ribbon">%s</span>' % E(ribbon) if ribbon else ""
    return ('<article class="ticket print-in" %s>%s<header class="t-head"><div><span class="t-code">%s</span><h3 class="t-title">%s</h3></div></header>'
            '<p class="t-sub">%s</p><ul class="t-lines">%s</ul><div class="t-total"><span class="t-lbl">%s</span>%s</div><p class="t-fine">%s</p>%s</article>'
            % (extra_attr, rb, E(codigo), E(titulo), E(sub), ls, total_html[0], total_html[1], fine, cta))


def cur_toggle():
    return '<div class="cur" role="group" aria-label="Moneda"><button type="button" id="btnARS" class="active" aria-pressed="true">ARS</button><button type="button" id="btnUSD" aria-pressed="false">USD</button></div>'

def cierre(h, p, boton, idn="h-cierre"):
    return ('<section class="cierre" data-sticky-hide aria-labelledby="%s"><div class="w"><h2 id="%s">%s</h2><div><p>%s</p>%s</div></div></section>\n' % (idn, idn, h, p, boton))
