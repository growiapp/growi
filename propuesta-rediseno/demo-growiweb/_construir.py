# Genera las tres páginas de la demo Centro Ribera (negocio ficticio) a partir de las ilustraciones.
# Uso: python _construir.py   (escribe centro-ribera/*.html)
import json, math, os, html
from urllib.parse import quote
import _ilus as I

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "centro-ribera")
E = html.escape

ZN = {
    "hombro": ("Cuello y hombro", ["Dolor al levantar el brazo", "Rigidez de cuello al terminar la jornada", "Molestia al nadar o al lanzar"]),
    "espalda": ("Espalda", ["Dolor lumbar después de estar mucho tiempo sentado", "Molestia al agacharte o al levantar peso", "Rigidez al levantarte a la mañana"]),
    "cadera": ("Cadera", ["Dolor en la cadera o la ingle al correr", "Molestia al hacer sentadillas", "Dificultad para subir escaleras"]),
    "rodilla": ("Rodilla", ["Dolor al correr o al saltar", "Molestia al bajar escaleras", "Volver al deporte después de una lesión"]),
    "tobillo": ("Tobillo y pie", ["Torcedura de tobillo reciente o que se repite", "Dolor en el talón o en la planta al correr", "Inestabilidad al apoyar"]),
    "codo": ("Codo y mano", ["Dolor en el codo al cargar o al jugar al pádel", "Molestia en la muñeca al usar el teclado", "Recuperar fuerza después de una inmovilización"]),
}
ORDEN = ["hombro", "espalda", "cadera", "rodilla", "tobillo", "codo"]
PROF = [
    ("Lic. Marina Altamirano", "Kinesióloga deportiva", "MA"),
    ("Lic. Joaquín Benavídez", "Kinesiología traumatológica y posquirúrgica", "JB"),
    ("Lic. Sol Ferreyra", "Readaptación deportiva y ejercicio terapéutico", "SF"),
]
SERV = [
    ("evaluacion", "Evaluación de movimiento", "Tu primera consulta: charlamos, medimos y armamos el plan.",
     "Charlamos sobre qué te pasa y qué querés volver a hacer. Medimos el rango de movimiento y la fuerza de la zona, y te explicamos qué vemos y cómo seguimos.",
     "Primera vez, o una molestia nueva", "60 minutos"),
    ("traumatologica", "Kinesiología traumatológica", "Tratamiento de lesiones de músculos, tendones y articulaciones.",
     "Trabajamos sobre la zona que te molesta con ejercicio, terapia manual y educación para que entiendas qué hacer entre sesiones.",
     "Torceduras, sobrecargas y dolor que no se va", "45 minutos"),
    ("posquirurgica", "Rehabilitación posquirúrgica", "Seguimiento después de una operación, con la indicación de tu médico.",
     "Seguimos el protocolo que indique tu cirujano o cirujana y lo adaptamos a cómo respondés en cada etapa.",
     "Después de una cirugía, con indicación médica", "45 minutos"),
    ("readaptacion", "Readaptación deportiva", "Volver al deporte con criterios claros de fuerza, movilidad y gesto.",
     "Definimos con vos qué necesitás para volver: pruebas de fuerza, de movimiento y de gesto deportivo, y un plan progresivo.",
     "Corredores y jugadores de fútbol, pádel o rugby", "60 minutos"),
    ("grupos", "Ejercicio terapéutico en grupos reducidos", "Clases de hasta seis personas, con un plan individual.",
     "Cada persona hace su propia rutina dentro del grupo, con supervisión profesional y ajustes en el momento.",
     "Quienes ya tienen un plan y quieren sostenerlo", "50 minutos"),
]
FAQ = [
    ("¿Necesito orden médica?", "Para la primera consulta no. Si tu cobertura la pide para el reintegro, te avisamos antes de que vengas."),
    ("¿Cuánto dura la primera consulta?", "Alrededor de una hora: charla, mediciones y explicación del plan."),
    ("¿Qué tengo que llevar?", "Ropa cómoda para moverte, los estudios o informes que tengas y, si te operaron, la indicación de tu médico."),
    ("¿Atienden con obra social o prepaga?", "Con reintegro: te damos el comprobante para que lo presentes en tu cobertura. Consultanos antes de venir."),
    ("¿Cuántas sesiones voy a necesitar?", "Depende de cada caso. Lo definimos con vos después de la evaluación y no prometemos plazos."),
    ("¿Cómo cambio o cancelo un turno?", "Avisanos por WhatsApp con 24 horas de anticipación y te ofrecemos otro horario."),
]
AVISO_IA = "La fotografía del encabezado de la página de inicio es una imagen ilustrativa generada con IA. " if os.environ.get("HERO", "B") == "B" else ""
GROWI = "https://wa.me/5491170593877?text=" + quote("Hola Growi, vi la demo de Centro Ribera y quiero un sitio así.\n\n(ref: demo-centro-ribera)")

MARK = ('<svg viewBox="0 0 34 34" aria-hidden="true" focusable="false"><path class="arc" d="M5 28 A23 23 0 0 1 28 5"/>'
        '<path class="body" stroke-width="3.5" d="M5 28 H27"/><circle cx="5" cy="28" r="4" fill="#0e2f3b"/></svg>')


def glyph(kind):
    """inicio: punto de partida. medir: el arco mide (se anima). plan: lo medido y la meta acordada (línea punteada)."""
    r, cx, cy, th = 90, 60, 112, 75
    P = lambda a, rr: (cx + rr * math.cos(math.radians(a)), cy - rr * math.sin(math.radians(a)))
    head_ = '<svg class="glyph" viewBox="0 0 210 128" aria-hidden="true" focusable="false">'
    base = '<path class="ref" d="M%d 112 H200"/>' % cx
    joint = '<circle class="joint" cx="%d" cy="112" r="8"/>' % cx
    if kind == "inicio":
        return head_ + base + joint + "</svg>"
    ticks = "".join('<path class="tick" d="M%.1f %.1f L%.1f %.1f"/>' % (*P(t, r - 6), *P(t, r + (9 if t % 30 == 0 else 4))) for t in range(10, th, 10))
    ex, ey = P(th, r)
    arc_ = '<path class="arc" pathLength="1" d="M%d 112 A%d %d 0 0 0 %.1f %.1f"/>' % (cx + r, r, r, ex, ey)
    if kind == "medir":
        ax, ay = P(th, r + 22)
        lx, ly = P(th / 2, r + 40)
        return (head_ + base + ticks + arc_ + '<g class="mv" data-pivot="%d 112" data-rot="%d"><path class="armv" d="M%d 112 L%.1f %.1f"/></g>' % (cx, th, cx, ax, ay)
                + '<text class="lbl" data-deg="%d" x="%.0f" y="%.0f" text-anchor="middle">%d°</text><text class="lbl-s" x="%.0f" y="%.0f" text-anchor="middle">ejemplo</text>' % (th, lx, ly, th, lx, ly + 15)
                + joint + "</svg>")
    gx, gy = P(115, r)
    goal = '<path class="goal" d="M%.1f %.1f A%d %d 0 0 0 %.1f %.1f"/><text class="lbl-s goal-t" x="6" y="18">objetivo</text>' % (ex, ey, r, r, gx, gy)
    return head_ + base + ticks + arc_ + goal + joint + "</svg>"


def head(title, desc):
    return ('<!doctype html>\n<html lang="es-AR">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n'
            '<meta name="robots" content="noindex, nofollow">\n<title>%s</title>\n<meta name="description" content="%s">\n<meta name="theme-color" content="#0e2f3b">\n'
            '<link rel="preload" href="assets/fonts/FamiljenGrotesk-latin.woff2" as="font" type="font/woff2" crossorigin>\n'
            '<link rel="preload" href="assets/fonts/HankenGrotesk-latin.woff2" as="font" type="font/woff2" crossorigin>\n'
            '<script>var d=document.documentElement,o=null;try{o=localStorage.getItem("cr_motion")}catch(e){}try{var r=matchMedia("(prefers-reduced-motion: reduce)").matches;if(o==="on"||(!r&&o!=="off"))d.classList.add("mo")}catch(e){}</script>\n<noscript><style>.sel,.pin,.scene-hint,.replay,.scene,.scene-lbl{display:none!important}.fig-wrap [data-zona][hidden]{display:grid!important}</style></noscript>\n<link rel="stylesheet" href="assets/ribera.css">\n</head>\n<body>\n<a class="sr" href="#contenido">Saltar al contenido</a>\n' % (E(title), E(desc)))


def top(cur):
    def a(href, txt, key):
        return '<a href="%s"%s>%s</a>' % (href, ' aria-current="page"' if cur == key else "", txt)
    return ('<div class="fict"><div class="w"><p>Sitio de ejemplo con contenido ficticio. '
            '<a href="%s" target="_blank" rel="noopener noreferrer">Quiero un sitio así</a></p></div></div>\n'
            '<header class="top"><div class="w"><a class="brand" href="index.html" aria-label="Centro Ribera Kinesiología y rehabilitación deportiva, inicio">%s<span>Centro Ribera <small>Kinesiología y rehabilitación deportiva</small></span></a>'
            '<nav class="nav" aria-label="Principal">%s<a class="btn" href="turnos.html"%s>Pedir turno</a></nav></div></header>\n'
            % (GROWI, MARK, a("servicios.html", "Servicios", "servicios"), ' aria-current="page"' if cur == "turnos" else ""))


def foot(fix=True):
    s = ('<footer><div class="w"><div class="cols"><div><a class="brand" href="index.html" aria-label="Centro Ribera, inicio">%s<span>Centro Ribera</span></a>'
         '<p style="margin-top:12px;max-width:34ch">Kinesiología y rehabilitación deportiva. Negocio ficticio creado para mostrar un sitio GrowiWeb.</p></div>'
         '<div><h2>Contacto (de ejemplo)</h2><p>Av. Ejemplo 1234, Buenos Aires<br>Lunes a viernes, de 8 a 20 h<br>WhatsApp 11 5555-0123</p></div>'
         '<div><h2>Páginas</h2><p><a href="index.html">Inicio</a><br><a href="servicios.html">Servicios</a><br><a href="turnos.html">Pedir turno</a></p></div></div>'
         '<p class="aviso">Centro Ribera es un negocio ficticio. Los profesionales, matrículas, teléfonos, direcciones y horarios son de ejemplo. '
         'Los motivos de consulta que ves en el sitio son orientativos y no reemplazan una evaluación profesional. '
         '%sSitio hecho con GrowiWeb. <a href="%s" target="_blank" rel="noopener noreferrer">Quiero un sitio así</a>.</p></div></footer>\n' % (MARK, AVISO_IA, GROWI))
    if fix:
        s += '<div class="fixbar" data-late><a class="btn wide" href="turnos.html">Pedir turno</a></div>\n'
    return s + '<script src="assets/ribera.js" defer></script>\n</body>\n</html>\n'


def motivos(z, links=True):
    items = []
    for i, m in enumerate(ZN[z][1]):
        items.append('<li><a href="turnos.html?zona=%s&amp;m=%d"><span>%s</span><span aria-hidden="true">→</span></a></li>' % (z, i, E(m)) if links else "<li>%s</li>" % E(m))
    return '<ul class="mot">%s</ul>' % "".join(items)


def caption(z):
    nom, mov, deg = I.INFO[z]
    return '<p class="cap"><b>%s</b>, %s. El arco coral marca el ángulo que medimos; los grados son de ejemplo.</p>' % (E(ZN[z][0]), E(mov.lower()))


# ---------------- Home ----------------
H1 = "¿Qué te molesta? Empecemos por ahí."
SUB = "Elegí la zona y mirá los motivos de consulta más frecuentes. Después pedís turno en cuatro pasos."
FOTO_ALT = "Sala de kinesiología con camilla azul, espaldera de madera, bandas elásticas de colores y un goniómetro sobre el escritorio. Imagen ilustrativa generada con IA."


def foto():
    return ('<picture><source type="image/avif" srcset="assets/img/sala-900.avif 900w, assets/img/sala-1672.avif 1672w" sizes="100vw">'
            '<source type="image/webp" srcset="assets/img/sala-900.webp 900w, assets/img/sala-1672.webp 1672w" sizes="100vw">'
            '<img src="assets/img/sala-1672.webp" width="1672" height="941" alt="%s" fetchpriority="high" decoding="async"></picture>' % E(FOTO_ALT))


PINS = [
    ("eval", 457, 822, "Evaluación de movimiento", "Medimos el rango de cada articulación antes de armar el plan.", "servicios.html#evaluacion"),
    ("esp", 1000, 412, "Readaptación deportiva", "Fuerza, movilidad y gesto para volver al deporte con criterios claros.", "servicios.html#readaptacion"),
    ("cam", 1190, 566, "Kinesiología traumatológica", "Tratamiento de lesiones de músculos, tendones y articulaciones.", "servicios.html#traumatologica"),
]


def escena():
    px, py, a0, rot, R, L = 457, 822, 2, 55, 120, 215
    P = lambda a, r: (px + r * math.cos(math.radians(a)), py + r * math.sin(math.radians(a)))
    a1 = a0 - rot
    p1, p2, e = P(a0, R), P(a1, R), P(a1, L)
    ref_end = P(a0, 360)
    ticks = "".join('<path class="tick s" d="M%.1f %.1f L%.1f %.1f"/>' % (*P(a0 - t, R - 7), *P(a0 - t, R + (10 if t % 15 == 0 else 4))) for t in range(5, rot, 5))
    svg = ('<svg class="scene" data-scene-svg aria-hidden="true" focusable="false"><g data-g>'
           '<path class="ref s" d="M%.1f %.1f L%.1f %.1f"/>%s<path class="arc s" pathLength="1" d="M%.1f %.1f A%d %d 0 0 0 %.1f %.1f"/>'
           '<g class="mv" data-pivot="%d %d" data-rot="%d"><path class="armv s" d="M%d %d L%.1f %.1f"/></g></g></svg>'
           % (px, py, *ref_end, ticks, *p1, R, R, *p2, px, py, rot, px, py, *e))
    lx, ly = P(a0 - rot / 2, R + 38)
    lbl = '<span class="scene-lbl" data-lbl data-deg="%d" data-x="%.0f" data-y="%.0f"><b>%d°</b><small>ejemplo</small></span>' % (rot, lx, ly, rot)
    pins = "".join('<button type="button" class="pin" data-pin="%s" data-x="%d" data-y="%d" aria-expanded="false" aria-controls="card-%s" aria-label="%s: ver qué hacemos acá" data-side="%s"><span class="pin-t">%s</span></button>' % (k, x, y, k, E(t), "l" if k == "eval" else "r", E(t)) for k, x, y, t, d, h in PINS)
    cards = "".join('<div class="pincard" id="card-%s" data-card="%s" hidden><b>%s</b><p>%s</p><a href="%s">Ver servicio</a></div>' % (k, k, E(t), E(d), h) for k, x, y, t, d, h in PINS)
    return svg + lbl + pins + cards + '<p class="scene-hint">Elegí un círculo para ver qué hacemos en cada lugar.</p>'


def hero_html(hero, chips, dots, panels):
    tool = ('<fieldset class="sel" data-sel><legend>Zona que te molesta</legend><p class="selhint">Elegí un botón o tocá un punto del cuerpo.</p><div class="sel-g"><div class="mapw">%s%s</div><div class="chips">%s</div></div></fieldset>'
            % (I.MAPA, "".join(dots), "".join(chips)))
    plates = '<div class="fig-wrap" aria-live="polite">%s</div>' % "".join(panels)
    if hero == "B":
        return ('<section class="hero hero-b" aria-labelledby="h1"><div class="heroimg" data-scene>%s%s<div class="w heroin"><div class="ht"><h1 id="h1">%s</h1><p class="sub">%s</p></div></div></div>'
                '<div class="w herotool"><div>%s</div>%s</div></section>\n' % (foto(), escena(), H1, SUB, tool, plates))
    return ('<section class="hero" aria-labelledby="h1"><div class="w"><div><h1 id="h1">%s</h1><p class="sub">%s</p>%s</div>%s</div></section>\n' % (H1, SUB, tool, plates))


def home(hero="A"):
    chips, panels, dots = [], [], []
    for z in ORDEN:
        chk = " checked" if z == "rodilla" else ""
        chips.append('<label class="chip"><input type="radio" name="zona" value="%s"%s><span>%s</span></label>' % (z, chk, E(ZN[z][0])))
        x, y = I.MAP_PTS[z]
        dots.append('<span class="dot" data-z="%s" style="left:%.1f%%;top:%.1f%%"></span>' % (z, x / 160 * 100, y / 300 * 100))
        panels.append('<div class="plate" data-zona="%s"%s><div><div class="fig">%s</div>%s<button type="button" class="replay" data-replay>Repetir el movimiento</button></div><div><h2>Motivos de consulta frecuentes</h2>%s'
                      '<a class="btn wide" href="turnos.html?zona=%s">Pedir turno</a></div></div>'
                      % (z, "" if z == "rodilla" else " hidden", I.ILUS[z], caption(z), motivos(z), z))
    pasos = [("Charlamos", "Nos contás qué te pasa, desde cuándo y qué querés volver a hacer.", "inicio"),
             ("Medimos", "Registramos cuánto se mueve cada articulación y cuánta fuerza tiene la zona.", "medir"),
             ("Armamos el plan", "Te explicamos qué vemos, qué ejercicios proponemos y cuántas sesiones estimamos, y lo acordamos con vos.", "plan")]
    srv = "".join('<a href="servicios.html#%s"><h3>%s</h3><p>%s</p><span class="go" aria-hidden="true">→</span></a>' % (k, E(n), E(b)) for k, n, b, *_ in SERV[:4])
    eq = "".join('<li><span class="mono" aria-hidden="true">%s</span><div><h3>%s</h3><p>%s</p><small>Matrícula ficticia 00.00%d</small></div></li>' % (ini, E(n), E(esp), i + 1) for i, (n, esp, ini) in enumerate(PROF))
    faq = "".join("<details><summary>%s</summary><p>%s</p></details>" % (E(q), E(a)) for q, a in FAQ)
    body = (head("Centro Ribera (ejemplo) | Kinesiología y rehabilitación deportiva", "Sitio de ejemplo de GrowiWeb para un centro de kinesiología ficticio. Elegí la zona que te molesta y pedí turno.")
            + top("home") + '<main id="contenido">\n'
            + hero_html(hero, chips, dots, panels)
            + '<section class="sec" aria-labelledby="h-pasos"><div class="w"><h2 id="h-pasos">Así es la primera consulta.</h2>'
              '<p class="lead">Una hora para entender qué te pasa, medirlo y decidir juntos cómo seguir.</p><div class="pasos" data-seq>%s</div></div></section>\n'
              % "".join('<div class="paso">%s<h3>%s</h3><p>%s</p></div>' % (glyph(t), n, b) for n, b, t in pasos)
            + '<section class="sec alt" aria-labelledby="h-srv"><div class="w"><h2 id="h-srv">Lo que hacemos.</h2><div class="srv">%s</div>'
              '<p style="margin-top:22px"><a class="btn ghost" href="servicios.html">Ver todos los servicios</a></p></div></section>\n' % srv
            + '<section class="sec" aria-labelledby="h-eq"><div class="w eq"><div><h2 id="h-eq">Quiénes te atienden.</h2>'
              '<p class="lead">Un equipo chico, con una persona de referencia en todo tu tratamiento.</p></div><ul>%s</ul></div></section>\n' % eq
            + '<section class="sec alt" aria-labelledby="h-cob"><div class="w"><h2 id="h-cob">Cobertura y pagos.</h2><div class="cob">'
              '<div><h3>Con tu cobertura</h3><p>Te damos el comprobante para que presentes el reintegro en tu obra social o prepaga. Antes de tu primera visita te contamos cómo hacerlo.</p></div>'
              '<div><h3>Sin cobertura</h3><p>Pagás cada sesión al terminarla. Los valores te los pasamos por WhatsApp cuando pedís turno.</p></div></div></div></section>\n'
            + '<section class="sec" aria-labelledby="h-faq"><div class="w"><h2 id="h-faq">Preguntas frecuentes.</h2><div class="faq">%s</div></div></section>\n' % faq
            + '<section class="cierre" aria-labelledby="h-cierre"><div class="w"><div><h2 id="h-cierre">Elegí un horario que te quede cómodo.</h2>'
              '<p>Son cuatro pasos. Después podés cambiar el turno avisando con 24 horas de anticipación.</p></div><a class="btn" href="turnos.html">Pedir turno</a></div></section>\n</main>\n' + foot())
    return body


# ---------------- Servicios ----------------
def servicios():
    nav = "".join('<a href="#%s">%s</a>' % (k, E(n)) for k, n, *_ in SERV)
    blocks = "".join('<article class="sv" id="%s"><h2>%s</h2><p class="lead">%s</p><dl><dt>Para quién</dt><dd>%s</dd><dt>Duración</dt><dd>%s</dd></dl></article>' % (k, E(n), E(d), E(p), E(t)) for k, n, b, d, p, t in SERV)
    zon = "".join('<article class="zn"><div class="fig">%s</div><h3>%s</h3>%s%s</article>' % (I.ILUS[z], E(ZN[z][0]), caption(z), motivos(z)) for z in ORDEN)
    return (head("Servicios | Centro Ribera (ejemplo)", "Servicios de kinesiología y rehabilitación deportiva de Centro Ribera, un negocio ficticio de ejemplo.")
            + top("servicios") + '<main id="contenido">\n<section class="ph"><div class="w"><h1>Lo que hacemos, y para quién.</h1>'
              '<p class="lead">Cinco servicios. Si no sabés cuál te corresponde, empezá por la evaluación de movimiento.</p></div></section>\n'
              '<section class="sec"><div class="w svc"><nav aria-label="Servicios">%s</nav><div>%s</div></div></section>\n' % (nav, blocks)
            + '<section class="sec alt" aria-labelledby="h-zonas"><div class="w"><h2 id="h-zonas">Qué medimos en cada zona.</h2>'
              '<p class="lead">Elegí un motivo de consulta y pedí turno con la zona ya cargada.</p><div class="zonas">%s</div></div></section>\n' % zon
            + '<section class="cierre"><div class="w"><div><h2>¿Empezamos por la evaluación?</h2><p>Medimos, te explicamos qué vemos y acordamos el plan en una hora.</p></div>'
              '<a class="btn" href="turnos.html">Pedir turno</a></div></section>\n</main>\n' + foot())


# ---------------- Turnos ----------------
def turnos():
    datos = {"zonas": {z: {"nombre": ZN[z][0], "motivos": ZN[z][1]} for z in ORDEN},
             "profesionales": [{"nombre": n, "esp": e} for n, e, _ in PROF]}
    zrows = "".join('<label class="row"><input type="radio" name="zona" value="%s"><span>%s</span></label>' % (z, E(ZN[z][0])) for z in ORDEN)
    prows = '<label class="row"><input type="radio" name="prof" value="0" checked><span>Sin preferencia<small>Te damos el primer horario libre.</small></span></label>'
    prows += "".join('<label class="row"><input type="radio" name="prof" value="%d"><span>%s<small>%s</small></span></label>' % (i + 1, E(n), E(e)) for i, (n, e, _) in enumerate(PROF))
    ilus = "".join('<div data-ilu="%s" hidden>%s</div>' % (z, I.ILUS[z]) for z in ORDEN)

    def nav(back, nxt):
        return '<div class="nav2">%s%s</div>' % ('<button type="button" class="btn ghost" data-a="back">Atrás</button>' if back else "", nxt)
    err = lambda: '<p class="err" data-err role="alert" tabindex="-1"></p>'
    s0 = ('<fieldset class="stp" data-step><legend>¿Qué te trae?</legend><p class="hint">Elegí la zona que te molesta.</p><div class="opt two">%s</div>'
          '<div data-motivos hidden style="margin-top:20px"></div>%s%s</fieldset>' % (zrows, err(), nav(False, '<button type="button" class="btn" data-a="next">Siguiente</button>')))
    s1 = ('<fieldset class="stp" data-step hidden><legend>¿Con quién?</legend><p class="hint">Podés elegir profesional o dejar que te asignemos uno.</p><div class="opt">%s</div>%s</fieldset>'
          % (prows, nav(True, '<button type="button" class="btn" data-a="next">Siguiente</button>')))
    s2 = ('<fieldset class="stp" data-step hidden><legend>¿Cuándo?</legend><p class="hint">Estos horarios son de ejemplo.</p><div class="dias" data-dias></div><div data-slots></div>%s%s</fieldset>'
          % (err(), nav(True, '<button type="button" class="btn" data-a="next">Siguiente</button>')))
    s3 = ('<form data-form novalidate><fieldset class="stp" data-step hidden><legend>Tus datos</legend><p class="hint">Lo que escribas acá no sale de tu navegador.</p>'
          '<div class="fld"><label for="nombre">Nombre y apellido</label><input id="nombre" name="nombre" autocomplete="name" aria-describedby="e-nombre"><p class="err" id="e-nombre"></p></div>'
          '<div class="fld"><label for="tel">WhatsApp</label><input id="tel" name="tel" type="tel" inputmode="tel" autocomplete="tel" aria-describedby="h-tel e-tel"><p class="help" id="h-tel">Con código de área, por ejemplo 11 5555 0123.</p><p class="err" id="e-tel"></p></div>'
          '<div class="fld"><label for="cob">Cobertura <i>(opcional)</i></label><input id="cob" name="cob" autocomplete="off"></div>'
          '<div class="fld"><label for="nota">Algo que quieras contarnos <i>(opcional)</i></label><textarea id="nota" name="nota" maxlength="240"></textarea></div>%s</fieldset></form>'
          % nav(True, '<button type="submit" class="btn">Confirmar turno</button>'))
    s3 = s3.replace('<div class="nav2">', '<div class="nav2">', 1)
    done = ('<section class="ok-box" data-done hidden><h2 tabindex="-1">Así quedaría tu pedido</h2><p>Revisá el mensaje. En un sitio real, se enviaría por WhatsApp al centro con estos datos.</p>'
            '<p class="demo-n">Demo: no se reservó ningún turno ni se envió ningún dato.</p><label for="msg" style="display:block;margin-top:16px;font-weight:700">Mensaje de WhatsApp de ejemplo</label>'
            '<textarea id="msg" class="msg" readonly data-msg></textarea><div class="nav2"><button type="button" class="btn" data-a="copy">Copiar mensaje</button>'
            '<button type="button" class="btn ghost" data-a="reset">Empezar de nuevo</button></div><p class="live" data-live role="status"></p></section>')
    prog = '<ol class="prog" aria-label="Pasos">%s</ol>' % "".join("<li>%s</li>" % n for n in ["Motivo", "Profesional", "Horario", "Datos"])
    aside = ('<aside class="aside" aria-label="Resumen de tu turno"><h2>Tu turno</h2><div class="fig"><p data-ilu-vacio class="hint" style="padding:36px 18px;text-align:center;color:#34505b">Elegí una zona para ver el movimiento que medimos.</p>%s</div>'
             '<dl><dt>Zona</dt><dd data-r="zona"></dd><dt>Motivo</dt><dd data-r="motivo"></dd><dt>Profesional</dt><dd data-r="prof"></dd><dt>Día y hora</dt><dd data-r="cuando"></dd></dl></aside>' % ilus)
    return (head("Pedir turno | Centro Ribera (ejemplo)", "Recorrido de turnos simulado de Centro Ribera, un negocio ficticio. No se reserva ningún turno real.")
            + top("turnos") + '<main id="contenido">\n<section class="ph"><div class="w"><h1>Pedí tu turno.</h1>'
              '<p class="lead">Cuatro pasos. Es una simulación: no se reserva ningún turno real ni se envía ningún dato.</p><noscript><p class="demo-n">Esta simulación necesita JavaScript para funcionar.</p></noscript></div></section>\n'
              '<div class="w tw" data-turnos><div>%s%s%s%s%s%s</div>%s</div>\n' % (prog, s0, s1, s2, s3, done, aside)
            + '<script type="application/json" id="datos">%s</script>\n</main>\n' % json.dumps(datos, ensure_ascii=False) + foot(fix=False))


if __name__ == "__main__":
    import sys
    hero = os.environ.get("HERO", "B")
    for name, fn in (("index.html", lambda: home(hero)), ("servicios.html", servicios), ("turnos.html", turnos)) + ((("index-a.html", lambda: home("A")), ("index-b.html", lambda: home("B"))) if os.environ.get("VARIANTES") else ()):
        with open(os.path.join(OUT, name), "w", encoding="utf-8", newline="\n") as f:
            f.write(fn())
        print(name, os.path.getsize(os.path.join(OUT, name)))
