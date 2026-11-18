# Genera las tres páginas de la demo Centro Ribera (negocio ficticio) a partir de las ilustraciones.
# Uso: python _construir.py   (escribe centro-ribera/*.html)
import json, math, os, html
from urllib.parse import quote

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
AVISO_IA = "Las imágenes de la página de inicio (fotografía del centro e ilustraciones) son ilustrativas y generadas con IA. "
GROWI = "https://wa.me/5491170593877?text=" + quote("Hola Growi, vi la demo de Centro Ribera y quiero un sitio así.\n\n(ref: demo-centro-ribera)")

MARK = ('<svg viewBox="0 0 34 34" aria-hidden="true" focusable="false"><path class="arc" d="M5 28 A23 23 0 0 1 28 5"/>'
        '<path class="body" stroke-width="3.5" d="M5 28 H27"/><circle cx="5" cy="28" r="4" fill="#0e2f3b"/></svg>')


def head(title, desc):
    return ('<!doctype html>\n<html lang="es-AR">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n'
            '<meta name="robots" content="noindex, nofollow">\n<title>%s</title>\n<meta name="description" content="%s">\n<meta name="theme-color" content="#0e2f3b">\n'
            '<link rel="preload" href="assets/fonts/FamiljenGrotesk-latin.woff2" as="font" type="font/woff2" crossorigin>\n'
            '<link rel="preload" href="assets/fonts/HankenGrotesk-latin.woff2" as="font" type="font/woff2" crossorigin>\n'
            '<script>var d=document.documentElement,o=null;try{o=localStorage.getItem("cr_motion")}catch(e){}try{var r=matchMedia("(prefers-reduced-motion: reduce)").matches;if(o==="on"||(!r&&o!=="off"))d.classList.add("mo")}catch(e){}</script>\n<noscript><style>.sel,.scene{display:none!important}.zp[hidden]{display:block!important}.hero-p{display:grid;gap:16px}.hero-g{grid-template-areas:"t" "p"!important;grid-template-columns:1fr!important}</style></noscript>\n<link rel="stylesheet" href="assets/ribera.css">\n</head>\n<body>\n<a class="sr" href="#contenido">Saltar al contenido</a>\n' % (E(title), E(desc)))


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


# ---------------- Piezas compartidas ----------------
# Puntos de cada zona sobre cuerpo.png (fracciones del ancho y del alto) + lado del rótulo + zoom del recorte.
ZPT = {
    "hombro": (0.64, 0.20, "r", 1.7),
    "espalda": (0.56, 0.335, "r", 1.5),
    "cadera": (0.585, 0.47, "r", 1.7),
    "rodilla": (0.60, 0.69, "r", 1.8),
    "tobillo": (0.31, 0.87, "l", 1.6),
    "codo": (0.27, 0.40, "l", 1.7),
}
CORTO = {"hombro": "Hombro", "espalda": "Espalda", "cadera": "Cadera", "rodilla": "Rodilla", "tobillo": "Tobillo", "codo": "Codo"}
QUE = {
    "hombro": "Medimos cuánto levantás el brazo y la fuerza al empujar y al tirar.",
    "espalda": "Medimos cuánto te flexionás y rotás, y cómo se sostiene el tronco.",
    "cadera": "Medimos la movilidad de la cadera y la fuerza de glúteos y piernas.",
    "rodilla": "Medimos cuánto flexiona y extiende la rodilla, y la fuerza del muslo.",
    "tobillo": "Medimos la movilidad del tobillo y el equilibrio al apoyar.",
    "codo": "Medimos la movilidad de codo y muñeca, y la fuerza de agarre.",
}


def ring():
    """Indicador de zona: marcador de ángulo (referencia, rayo y arco entre ambos) que sale del punto hacia el rótulo."""
    P = lambda ang, r: (r * math.cos(math.radians(ang)), r * math.sin(math.radians(ang)))
    r0, r1, a = 9, 44, -38
    ref = "M%.1f 0 L%.1f 0" % (r0, r1)
    rx0, ry0 = P(a, r0); rx1, ry1 = P(a, r1)
    ray = "M%.1f %.1f L%.1f %.1f" % (rx0, ry0, rx1, ry1)
    ax, ay = P(a, 27)
    arc = "M27 0 A27 27 0 0 0 %.1f %.1f" % (ax, ay)
    return ('<svg viewBox="-56 -56 112 112" aria-hidden="true" focusable="false">'
            '<g class="ring-h"><path d="%s"/><path d="%s"/><path d="%s"/></g>'
            '<path class="ring-r" d="%s"/><path class="ring-a" d="%s"/><path class="ring-a" d="%s"/>'
            '<circle class="ring-dh" r="7"/><circle class="ring-d" r="4.2"/></svg>' % (ref, ray, arc, ref, ray, arc))


def cuerpo(cls=""):
    return ('<picture><source type="image/avif" srcset="assets/img/cuerpo-700.avif"><source type="image/webp" srcset="assets/img/cuerpo-700.webp">'
            '<img %ssrc="assets/img/cuerpo-700.webp" width="700" height="1050" alt="" decoding="async"></picture>' % ('class="%s" ' % cls if cls else ""))


def zfig(z):
    x, y, _, s = ZPT[z]
    return '<div class="zfig" style="--x:%s;--y:%s;--s:%s">%s<i class="rg" data-s="%s">%s</i></div>' % (x, y, s, cuerpo(), ZPT[z][2], ring())


def motivos(z, links=True):
    items = []
    for i, m in enumerate(ZN[z][1]):
        items.append('<li><a href="turnos.html?zona=%s&amp;m=%d"><span>%s</span><span aria-hidden="true">→</span></a></li>' % (z, i, E(m)) if links else "<li>%s</li>" % E(m))
    return '<ul class="mot">%s</ul>' % "".join(items)


# ---------------- Home ----------------
H1 = "¿Qué te molesta?"
H1B = "Empecemos por ahí."
SUB = "Tocá la zona en el cuerpo y mirá por qué consultan. Después pedís turno en cuatro pasos."
FOTO_ALT = "Sala de kinesiología con camilla azul, espaldera de madera, bandas elásticas de colores y un goniómetro sobre el escritorio. Imagen ilustrativa generada con IA."


def foto():
    return ('<picture><source type="image/avif" srcset="assets/img/sala-900.avif 900w, assets/img/sala-1672.avif 1672w" sizes="100vw">'
            '<source type="image/webp" srcset="assets/img/sala-900.webp 900w, assets/img/sala-1672.webp 1672w" sizes="100vw">'
            '<img src="assets/img/sala-1672.webp" width="1672" height="941" alt="%s" loading="lazy" decoding="async"></picture>' % E(FOTO_ALT))


def escena():
    """Un solo arco, anclado al goniómetro de la foto: dibuja el rango sin inventar un número."""
    px, py, a0, rot, R, L = 457, 822, 2, 55, 120, 215
    P = lambda a, r: (px + r * math.cos(math.radians(a)), py + r * math.sin(math.radians(a)))
    a1 = a0 - rot
    p1, p2, e = P(a0, R), P(a1, R), P(a1, L)
    ref_end = P(a0, 360)
    ticks = "".join('<path class="tick s" d="M%.1f %.1f L%.1f %.1f"/>' % (*P(a0 - t, R - 7), *P(a0 - t, R + (10 if t % 15 == 0 else 4))) for t in range(5, rot, 5))
    return ('<svg class="scene" data-scene-svg aria-hidden="true" focusable="false"><g data-g>'
            '<path class="ref s" d="M%.1f %.1f L%.1f %.1f"/>%s<path class="arc s" pathLength="1" d="M%.1f %.1f A%d %d 0 0 0 %.1f %.1f"/>'
            '<g class="mv" data-pivot="%d %d" data-rot="%d"><path class="armv s" d="M%d %d L%.1f %.1f"/></g></g></svg>'
            % (px, py, *ref_end, ticks, *p1, R, R, *p2, px, py, rot, px, py, *e))


def sel_html():
    pts = ""
    for z in ORDEN:
        x, y, side, _ = ZPT[z]
        pts += ('<label class="pt" data-side="%s" style="--x:%s;--y:%s"><input type="radio" name="zona" value="%s"%s><i class="pd"></i><span class="pl"><span class="pc-l">%s</span><span class="pc-c">%s</span></span></label>'
                % (side, x, y, z, " checked" if z == "rodilla" else "", E(ZN[z][0]), E(CORTO[z])))
    return ('<fieldset class="sel" data-sel><legend>Zona que te molesta</legend><div class="bodyw">%s<i class="rg" data-ring data-s="%s" style="--x:%s;--y:%s">%s</i>%s</div></fieldset>' % (cuerpo("bodyimg"), ZPT["rodilla"][2], ZPT["rodilla"][0], ZPT["rodilla"][1], ring(), pts))


def home():
    z0 = "rodilla"
    panels = "".join('<div class="zp" data-zona="%s"%s><p class="eyebrow">Zona elegida</p><h2>%s</h2><p class="que">%s</p><h3>Motivos de consulta frecuentes</h3>%s<a class="btn wide" href="turnos.html?zona=%s">Pedir turno por %s</a></div>'
                     % (z, "" if z == z0 else " hidden", E(ZN[z][0]), E(QUE[z]), motivos(z), z, E(ZN[z][0].lower())) for z in ORDEN)
    hero = ('<section class="hero" aria-labelledby="h1"><div class="w hero-g"><div class="hero-t"><p class="eyebrow">Kinesiología y rehabilitación deportiva</p>'
            '<h1 id="h1">%s <span>%s</span></h1><p class="sub">%s</p></div>%s<div class="hero-p" aria-live="polite">%s</div></div></section>\n' % (H1, H1B, E(SUB), sel_html(), panels))
    sala = ('<section class="sala" aria-labelledby="h-sala"><div class="salaimg" data-scene>%s%s<div class="w salain"><div class="salat"><p class="eyebrow">El centro</p>'
            '<h2 id="h-sala">Medimos antes de decidir.</h2><p>Tu plan sale de cómo te movés vos, no de una receta general.</p></div></div></div></section>\n' % (foto(), escena()))
    pasos = [("charlamos", "Charlamos", "Nos contás qué te pasa, desde cuándo y qué querés volver a hacer.", "Un motivo de consulta claro"),
             ("medimos", "Medimos", "Registramos cuánto se mueve cada articulación y cuánta fuerza tiene la zona.", "Datos de tu movimiento y tu fuerza"),
             ("plan", "Armamos el plan", "Te explicamos qué vemos, qué ejercicios proponemos y cuántas sesiones estimamos, y lo acordamos con vos.", "Un plan acordado con vos")]
    hist = "".join('<li class="hs"><span class="n" aria-hidden="true">0%d</span><figure><picture><source type="image/avif" srcset="assets/img/%s.avif"><source type="image/webp" srcset="assets/img/%s.webp">'
                   '<img src="assets/img/%s.webp" width="900" height="675" alt="%s" decoding="async"></picture></figure><h3>%s</h3><p>%s</p><p class="te"><span>Te llevás</span>%s</p></li>'
                   % (i + 1, k, k, k, E(ALT_PASOS[k]), E(n), E(b), E(t)) for i, (k, n, b, t) in enumerate(pasos))
    consulta = ('<section class="sec dark consulta" aria-labelledby="h-pasos"><div class="w"><p class="eyebrow">Tu primera visita</p><h2 id="h-pasos">Una hora para entender qué te pasa.</h2>'
                '<p class="lead">Charlamos, medimos y decidimos juntos cómo seguir. Esto es lo que va a pasar.</p></div>'
                '<div class="w"><ol class="hist" data-seq aria-label="Pasos de la primera consulta">%s</ol><div class="dots" aria-hidden="true"><i></i><i></i><i></i></div></div></section>\n' % hist)
    big = SERV[0]
    srv = '<a class="sv-big" href="servicios.html#%s"><span class="tag">Empezá por acá</span><h3>%s</h3><p>%s</p><span class="go">Ver el servicio <b aria-hidden="true">→</b></span></a>' % (big[0], E(big[1]), E(big[2]))
    srv += "".join('<a class="sv-c" href="servicios.html#%s"><h3>%s</h3><p>%s</p><span class="go" aria-hidden="true">→</span></a>' % (k, E(n), E(b)) for k, n, b, *_ in SERV[1:4])
    servicios_s = ('<section class="sec" aria-labelledby="h-srv"><div class="w"><div class="sh"><h2 id="h-srv">Lo que hacemos.</h2><a class="btn ghost" href="servicios.html">Ver todos los servicios</a></div><div class="bento">%s</div></div></section>\n' % srv)
    eq = "".join('<li><span class="mono" aria-hidden="true">%s</span><h3>%s</h3><p>%s</p><small>Matrícula ficticia 00.00%d</small></li>' % (ini, E(n), E(esp), i + 1) for i, (n, esp, ini) in enumerate(PROF))
    equipo = ('<section class="sec tint" aria-labelledby="h-eq"><div class="w"><div class="sh"><h2 id="h-eq">Quiénes te atienden.</h2><p class="lead">Un equipo chico, con una persona de referencia en todo tu tratamiento.</p></div><ul class="eqg">%s</ul></div></section>\n' % eq)
    faq = "".join("<details><summary>%s</summary><p>%s</p></details>" % (E(q), E(a)) for q, a in FAQ)
    antes = ('<section class="sec" aria-labelledby="h-faq"><div class="w antes"><div class="cob"><h2 id="h-faq">Antes de venir.</h2>'
             '<div><h3>Con tu cobertura</h3><p>Te damos el comprobante para que presentes el reintegro en tu obra social o prepaga. Antes de tu primera visita te contamos cómo hacerlo.</p></div>'
             '<div><h3>Sin cobertura</h3><p>Pagás cada sesión al terminarla. Los valores te los pasamos por WhatsApp cuando pedís turno.</p></div></div>'
             '<div class="faq">%s</div></div></section>\n' % faq)
    cierre = ('<section class="cierre" aria-labelledby="h-cierre"><div class="w"><h2 id="h-cierre">Elegí un horario que te quede cómodo.</h2>'
              '<div><p>Son cuatro pasos. Después podés cambiar el turno avisando con 24 horas de anticipación.</p><a class="btn dk" href="turnos.html">Pedir turno</a></div></div></section>\n')
    return (head("Centro Ribera (ejemplo) | Kinesiología y rehabilitación deportiva", "Sitio de ejemplo de GrowiWeb para un centro de kinesiología ficticio. Tocá la zona que te molesta y pedí turno.")
            + top("home") + '<main id="contenido">\n' + hero + sala + consulta + servicios_s + equipo + antes + cierre + '</main>\n' + foot())


ALT_PASOS = {
    "charlamos": "Ilustración: una kinesióloga y una persona conversan sentadas en el consultorio.",
    "medimos": "Ilustración: una kinesióloga mide con un goniómetro la rodilla de una persona sentada en la camilla.",
    "plan": "Ilustración: la kinesióloga y la persona miran juntas el plan de ejercicios.",
}


# ---------------- Servicios ----------------
def servicios():
    nav = "".join('<a href="#%s">%s</a>' % (k, E(n)) for k, n, *_ in SERV)
    blocks = "".join('<article class="sv" id="%s"><h2>%s</h2><p class="lead">%s</p><dl><dt>Para quién</dt><dd>%s</dd><dt>Duración</dt><dd>%s</dd></dl></article>' % (k, E(n), E(d), E(p), E(t)) for k, n, b, d, p, t in SERV)
    zon = "".join('<article class="zn">%s<h3>%s</h3><p class="cap">%s</p>%s</article>' % (zfig(z), E(ZN[z][0]), E(QUE[z]), motivos(z)) for z in ORDEN)
    return (head("Servicios | Centro Ribera (ejemplo)", "Servicios de kinesiología y rehabilitación deportiva de Centro Ribera, un negocio ficticio de ejemplo.")
            + top("servicios") + '<main id="contenido">\n<section class="ph"><div class="w"><h1>Lo que hacemos, y para quién.</h1>'
              '<p class="lead">Cinco servicios. Si no sabés cuál te corresponde, empezá por la evaluación de movimiento.</p></div></section>\n'
              '<section class="sec"><div class="w svc"><nav aria-label="Servicios">%s</nav><div>%s</div></div></section>\n' % (nav, blocks)
            + '<section class="sec tint" aria-labelledby="h-zonas"><div class="w"><h2 id="h-zonas">Qué medimos en cada zona.</h2>'
              '<p class="lead">Elegí un motivo de consulta y pedí turno con la zona ya cargada.</p><div class="zonas">%s</div></div></section>\n' % zon
            + '<section class="cierre"><div class="w"><h2>¿Empezamos por la evaluación?</h2><div><p>Medimos, te explicamos qué vemos y acordamos el plan en una hora.</p>'
              '<a class="btn dk" href="turnos.html">Pedir turno</a></div></div></section>\n</main>\n' + foot())


# ---------------- Turnos ----------------
def turnos():
    datos = {"zonas": {z: {"nombre": ZN[z][0], "motivos": ZN[z][1], "pt": [ZPT[z][0], ZPT[z][1], ZPT[z][3], ZPT[z][2]]} for z in ORDEN},
             "profesionales": [{"nombre": n, "esp": e} for n, e, _ in PROF]}
    zrows = "".join('<label class="row"><input type="radio" name="zona" value="%s"><span>%s</span></label>' % (z, E(ZN[z][0])) for z in ORDEN)
    prows = '<label class="row"><input type="radio" name="prof" value="0" checked><span>Sin preferencia<small>Te damos el primer horario libre.</small></span></label>'
    prows += "".join('<label class="row"><input type="radio" name="prof" value="%d"><span>%s<small>%s</small></span></label>' % (i + 1, E(n), E(e)) for i, (n, e, _) in enumerate(PROF))

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
    aside = ('<aside class="aside" aria-label="Resumen de tu turno"><h2>Tu turno</h2><div class="afig"><p data-ilu-vacio class="hint">Elegí una zona para verla en el cuerpo.</p><div data-zfig hidden>%s</div></div>'
             '<dl><dt>Zona</dt><dd data-r="zona"></dd><dt>Motivo</dt><dd data-r="motivo"></dd><dt>Profesional</dt><dd data-r="prof"></dd><dt>Día y hora</dt><dd data-r="cuando"></dd></dl></aside>' % zfig("rodilla"))
    return (head("Pedir turno | Centro Ribera (ejemplo)", "Recorrido de turnos simulado de Centro Ribera, un negocio ficticio. No se reserva ningún turno real.")
            + top("turnos") + '<main id="contenido">\n<section class="ph"><div class="w"><h1>Pedí tu turno.</h1>'
              '<p class="lead">Cuatro pasos. Es una simulación: no se reserva ningún turno real ni se envía ningún dato.</p><noscript><p class="demo-n">Esta simulación necesita JavaScript para funcionar.</p></noscript></div></section>\n'
              '<div class="w tw" data-turnos><div>%s%s%s%s%s%s</div>%s</div>\n' % (prog, s0, s1, s2, s3, done, aside)
            + '<script type="application/json" id="datos">%s</script>\n</main>\n' % json.dumps(datos, ensure_ascii=False) + foot(fix=False))


if __name__ == "__main__":
    for name, fn in (("index.html", home), ("servicios.html", servicios), ("turnos.html", turnos)):
        with open(os.path.join(OUT, name), "w", encoding="utf-8", newline="\n") as f:
            f.write(fn())
        print(name, os.path.getsize(os.path.join(OUT, name)))
