# Invitaciones F4.2: marcado de las tres experiencias (casamiento, cumpleaños, empresa) y de las secciones de la página.
# El HTML es estático y legible sin JavaScript (las capas se apilan en una columna); assets/invitaciones/inv-ui.js lo vuelve interactivo.
# Cada experiencia tiene composición propia: los atributos de datos son el contrato con inv-ui.js, el aspecto vive en inv.css.
import html as _html

def _e(s): return _html.escape(s, quote=True)

def _mk(): return '<span class="ix-mk" role="img" aria-label="a medida"></span>'

# ---------------------------------------------------------------- formulario, borrador y vista previa (mismo contrato; cada experiencia lo viste distinto)
FORMS = {
    "cas": dict(h="¿Nos <i>acompañás?</i>", leg="¿Venís?", sr=False, si="Sí, voy", no="No puedo ir", pers=True, dest="Lucía y Tomás", nombre_wa="Lucía y Tomás"),
    "cum": dict(h="¿Venís <i>a los 30?</i>", leg="¿Venís a los 30?", sr=True, si="Voy", no="No llego", pers=True, dest="Mica", nombre_wa="Mica"),
    "emp": dict(h="¿Asistís al <b>Encuentro anual?</b>", leg="¿Asistís?", sr=False, si="Sí, asisto", no="No puedo asistir", pers=False, dest="el organizador", nombre_wa="Organizador del encuentro"),
}

def _fields(ev):
    c = FORMS[ev]
    pers = ('<div class="ix-fld ix-pers" hidden><span class="ix-fl" id="ix-%(ev)s-pl">¿Cuántos van? <small>hasta 5</small></span>'
            '<div class="ix-step" role="group" aria-labelledby="ix-%(ev)s-pl"><button type="button" data-act="menos" aria-label="Una persona menos">−</button>'
            '<output id="ix-%(ev)s-cant" data-cant>1</output><button type="button" data-act="mas" aria-label="Una persona más">+</button></div>'
            '<p class="ix-err" id="ix-%(ev)s-e-personas" data-err="personas" hidden></p></div>' % {"ev": ev}) if c["pers"] else ""
    return ('<form class="ix-form" novalidate data-form>'
            '<div class="ix-fld"><label class="ix-fl" for="ix-%(ev)s-nombre">Tu nombre</label><input class="ix-inp" id="ix-%(ev)s-nombre" name="nombre" type="text" autocomplete="off" autocapitalize="words" placeholder="Nombre y apellido" aria-describedby="ix-%(ev)s-e-nombre">'
            '<p class="ix-err" id="ix-%(ev)s-e-nombre" data-err="nombre" hidden></p></div>'
            '<fieldset class="ix-fld ix-resp"><legend class="ix-fl%(srl)s">%(leg)s</legend><div class="ix-opts">'
            '<label class="ix-opt"><input type="radio" name="ix-%(ev)s-resp" value="si"><span>%(si)s</span></label>'
            '<label class="ix-opt"><input type="radio" name="ix-%(ev)s-resp" value="no"><span>%(no)s</span></label></div>'
            '<p class="ix-err" id="ix-%(ev)s-e-respuesta" data-err="respuesta" hidden></p></fieldset>%(pers)s'
            '<button type="submit" class="ix-btn">Preparar mi mensaje</button>'
            '<p class="ix-note">Se arma un mensaje para WhatsApp. No se envía solo.</p></form>'
            % dict(ev=ev, leg=c["leg"], srl=" ix-sr" if c["sr"] else "", si=c["si"], no=c["no"], pers=pers))

def _draft(ev):
    c = FORMS[ev]
    return ('<div class="ix-dh"><p class="ix-k">Revisá</p><h3 class="ix-h" id="ix-%(ev)s-hm" tabindex="-1">Tu mensaje, <i>listo para enviar</i></h3></div><div class="ix-db">'
            '%(bdg)s<div class="ix-dr"><p class="ix-drh"><span>Para %(dest)s</span><span>Borrador</span></p><p class="ix-resum" data-resum></p><p class="ix-drb" data-msg></p>'
            '<p class="ix-drs"><i class="ix-clk" aria-hidden="true"></i><span>Todavía no se envió.</span></p></div>'
            '<p class="ix-note">Se abre WhatsApp con este texto. Lo revisás y lo enviás vos.</p>'
            '<button type="button" class="ix-btn" data-act="wa">Ver cómo se abre WhatsApp</button>'
            '<button type="button" class="ix-lk ix-lk-c" data-act="editar">Cambiar mi respuesta</button></div>' % dict(ev=ev, dest=c["dest"], bdg='<p class="ix-bdg ix-bdg-r">Con tus respuestas</p>' if ev == "cas" else ""))

def _wa(ev, extra=""):
    c = FORMS[ev]
    return ('<div class="ix-wa" data-ly="wa" hidden role="dialog" aria-modal="true" aria-labelledby="ix-%(ev)s-wt"%(x)s><div class="ix-wa-in"><div class="ix-wh">'
            '<button type="button" class="ix-back" data-act="cerrar-wa"><span aria-hidden="true">‹</span> Volver</button><i class="ix-wav" aria-hidden="true">%(ini)s</i>'
            '<div><b id="ix-%(ev)s-wt">%(nom)s</b></div></div>'
            '<div class="ix-wb"><p class="ix-sys">Esto es una vista previa: no se envía nada ni se abre una conversación real.</p></div>'
            '<div class="ix-wf"><p class="ix-win" data-msg aria-label="Mensaje preparado"></p>'
            '<button type="button" class="ix-send" disabled aria-label="Enviar (no disponible en la vista previa)"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M3 20l18-8L3 4v6l11 2-11 2z" fill="currentColor"/></svg></button></div>'
            '</div></div>' % dict(ev=ev, ini=c["nombre_wa"][0], nom=c["nombre_wa"], x=extra))

# ---------------------------------------------------------------- casamiento · Lucía y Tomás
MOMENTOS = [
    ("17:00", "Ceremonia", "Capilla del jardín", "Las puertas abren a las 16:30. La ceremonia dura cerca de una hora; hasta el cóctel, el jardín queda abierto."),
    ("19:00", "Cóctel", "Jardín de la capilla", "Bebidas y bocados al aire libre. Es un buen momento para las fotos."),
    ("20:00", "Cena", "Salón principal", "El micro sale de la capilla a las 19:45 y llega al salón a tiempo para la cena."),
    ("22:30", "Baile", "Salón principal", "La música sigue hasta las 3."),
]
LUGAR = [("Vestimenta", "Elegante"), ("Estacionamiento", "Sobre la calle"), ("Traslado", "Micro de la capilla al salón: 19:45"), ("Regalos", "Datos para quien quiera")]

MAPA = ('<svg class="ix-mapa" viewBox="0 0 306 210" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><rect width="306" height="210" fill="#e9dfcc"/>'
        '<path d="M0 150 C60 138 110 160 170 146 S270 128 306 140 V210 H0Z" fill="#cfd8b4" opacity=".85"/>'
        '<g fill="#f3ecdc"><rect x="14" y="16" width="70" height="46" rx="3"/><rect x="100" y="16" width="62" height="46" rx="3"/><rect x="182" y="16" width="52" height="46" rx="3"/><rect x="250" y="16" width="52" height="46" rx="3"/>'
        '<rect x="14" y="80" width="70" height="42" rx="3"/><rect x="182" y="80" width="52" height="42" rx="3"/><rect x="250" y="80" width="52" height="42" rx="3"/></g>'
        '<g stroke="#fffaf0" stroke-width="8" fill="none" stroke-linecap="round"><path d="M-10 70 H320"/><path d="M92 -10 V220"/><path d="M172 -10 V220"/><path d="M-10 132 C80 124 150 140 320 118"/></g>'
        '<path d="M92 132 C112 110 140 104 172 96 S212 74 226 58" stroke="#8b5a44" stroke-width="2.4" fill="none" stroke-dasharray="1 6" stroke-linecap="round"/>'
        '<g transform="translate(226 58)"><path d="M0 0 C-12 -16 -14 -30 0 -38 C14 -30 12 -16 0 0Z" fill="#8b4a30"/><circle cx="0" cy="-26" r="5" fill="#f6f0e4"/></g></svg>')

def _cas_portada():
    return ('<section class="ix-ly ix-l-cover on" data-ly="portada" id="ix-cas-portada" aria-labelledby="ix-cas-hn"><div class="ix-cv-photo" aria-hidden="true"></div>'
            '<div class="ix-cv-body"><p class="ix-cv-k">Nos casamos</p><h3 class="ix-cv-n" id="ix-cas-hn" tabindex="-1">Lucía<span> &amp; Tomás</span></h3>'
            '<p class="ix-cv-d"><b>Sábado 20 de marzo de 2027</b><br>Capilla del jardín · 17:00</p>'
            '<div class="ix-cv-act"><button type="button" class="ix-btn" data-go="confirmar">Confirmar asistencia</button><button type="button" class="ix-lk" data-go="programa">Ver el programa</button></div></div></section>')

def _cas_chat():
    return ('<section class="ix-ly ix-l-chat" data-ly="chat" id="ix-cas-chat" aria-label="Mensaje recibido de Lucía" hidden><div class="ix-ch-h"><i class="ix-ch-av" aria-hidden="true">L</i><div><b>Lucía</b><small>en línea</small></div></div>'
            '<div class="ix-ch-b"><p class="ix-ch-day">Hoy</p><div class="ix-ch-m"><p>¡Hola! Les compartimos la invitación a nuestro casamiento. Ahí están todos los detalles y cómo confirmar asistencia. ¡Los esperamos!</p>'
            '<button type="button" class="ix-ch-lk" data-act="abrir"><span class="ix-ch-img" aria-hidden="true"><b>Lucía &amp; Tomás</b></span>'
            '<span class="ix-ch-t"><b>Lucía &amp; Tomás se casan</b><span>Sábado 20 de marzo de 2027 · Capilla del jardín</span><em>luciaytomas.growi.ar</em></span></button><time>18:42</time></div>'
            '<p class="ix-ch-hint">Tocá el enlace para abrirla.</p></div></section>')

def _cas_dia():
    lis = "".join(
        '<li class="ix-tli%s"><button type="button" class="ix-tlb" aria-expanded="%s" aria-controls="ix-cas-m%d"><span class="ix-tl-h">%s</span><span class="ix-tl-n"><b>%s</b><small>%s</small></span></button>'
        '<div class="ix-tld" id="ix-cas-m%d"><p>%s</p></div></li>' % (" on" if i == 0 else "", "true" if i == 0 else "false", i, h, n, l, i, d)
        for i, (h, n, l, d) in enumerate(MOMENTOS))
    return ('<section class="ix-ly ix-l-dia" data-ly="programa" id="ix-cas-programa" aria-labelledby="ix-cas-hp"><p class="ix-k">El día %s</p><h3 class="ix-h" id="ix-cas-hp" tabindex="-1">Del sí<br><i>a la pista</i></h3>'
            '<ul class="ix-tl">%s</ul><button type="button" class="ix-row" data-go="lugar"><span class="ix-k">Lugar</span><span>Capilla del jardín</span><i aria-hidden="true">→</i></button></section>' % (_mk(), lis))

def _cas_lugar():
    return ('<section class="ix-ly ix-l-lugar" data-ly="lugar" id="ix-cas-lugar" aria-labelledby="ix-cas-hl">%s<div class="ix-lg-b"><p class="ix-k">El lugar</p><h3 class="ix-h" id="ix-cas-hl" tabindex="-1">Capilla <i>del jardín</i></h3>'
            '<button type="button" class="ix-btn ix-btn-o" data-act="mapa">Cómo llegar</button><p class="ix-note" data-mapa-nota hidden>En esta muestra no se abre el mapa.</p>'
            '<p class="ix-k ix-k2">Para invitados %s</p><dl class="ix-dl">%s</dl>'
            '<button type="button" class="ix-lk ix-lk-c" data-go="confirmar">Confirmar asistencia</button><button type="button" class="ix-lk ix-lk-c" data-go="programa">Volver al programa</button></div></section>'
            % (MAPA, _mk(), "".join("<div><dt>%s</dt><dd>%s</dd></div>" % x for x in LUGAR)))

def _cas_form():
    return ('<section class="ix-ly ix-l-conf" data-ly="confirmar" id="ix-cas-confirmar" aria-labelledby="ix-cas-hc"><p class="ix-k">Tu respuesta</p><h3 class="ix-h" id="ix-cas-hc" tabindex="-1">%s</h3>%s</section>' % (FORMS["cas"]["h"], _fields("cas")))

def _cas_msg():
    return '<section class="ix-ly ix-l-msj" data-ly="mensaje" id="ix-cas-mensaje" aria-labelledby="ix-cas-hm" hidden>%s</section>' % _draft("cas")

def _cas_ejemplo():
    c = FORMS["cas"]
    return ('<section class="ix-ly ix-l-msj ix-ej" data-ly="ejemplo" id="ix-cas-ejemplo" aria-labelledby="ix-cas-he" hidden><p class="ix-k">Así se vería</p><h3 class="ix-h" id="ix-cas-he" tabindex="-1">Tu mensaje, <i>con tu respuesta</i></h3>'
            '<p class="ix-bdg ix-bdg-m">Muestra · datos ficticios</p><div class="ix-dr"><p class="ix-drh"><span>Para %s</span><span>Muestra</span></p><p class="ix-resum">Camila Rossi · %s · 2 personas</p><p class="ix-drb" data-msg-ej></p></div>'
            '<p class="ix-note">Cuando completás el formulario, el mensaje se arma con lo que pusiste.</p>'
            '<button type="button" class="ix-btn" data-go="confirmar">Completar mi respuesta</button></section>' % (c["dest"], c["si"]))

def _scr(ev, label, inner, cls="", paso="portada"):
    return ('<div class="ix-dev"><div class="ix-scr %s" data-inv="%s" data-paso="%s" role="group" aria-label="%s"><i class="ix-isl" aria-hidden="true"></i>%s</div></div>'
            % (cls, ev, paso, _e(label), inner))

def casamiento():
    inner = _cas_portada() + _cas_chat() + _cas_dia() + _cas_lugar() + _cas_form() + _cas_ejemplo() + _cas_msg() + _wa("cas")
    return _scr("cas", "Invitación de Lucía y Tomás", inner, "ix-cas")

# ---------------------------------------------------------------- cumpleaños · Los 30 de Mica
NOCHE = [("21:00", "Brindis", "El brindis es a las 21:00: llegá unos minutos antes."),
         ("22:00", "Cena", "Mesa larga en la terraza, sin lugares marcados. Cada uno se sienta donde quiera."),
         ("00:00", "Torta y baile", "Se apaga la luz, se canta y se abre la pista. La música sigue hasta las 2.")]
INFO_CUM = [("Vestimenta", "Cómoda: hay pista."), ("Cómo llegar", "Terraza, 4.º piso. Subís por el ascensor del frente."), ("Regalos", "Datos para quien quiera.")]

def cumpleanos():
    stops = "".join('<button type="button" class="ix-stop%s" role="radio" aria-checked="%s" tabindex="%d" data-idx="%d"><em>%s</em>%s</button>'
                    % (" on" if i == 0 else "", "true" if i == 0 else "false", 0 if i == 0 else -1, i, h, n) for i, (h, n, _) in enumerate(NOCHE))
    portada = ('<section class="ix-ly ix-cl-cover on" data-ly="portada" id="ix-cum-portada" aria-labelledby="ix-cum-hn"><p class="ix-ck">Cumpleaños</p><p class="ix-c30" aria-hidden="true">30</p><p class="ix-csk">Hasta las 2</p>'
               '<h3 class="ix-ct" id="ix-cum-hn" tabindex="-1">Los 30<br><i>de Mica</i></h3><p class="ix-cd">Sábado 14 de agosto<br>21:00 a 02:00 · Terraza</p>'
               '<p class="ix-cgo"><button type="button" class="ix-btn" data-go="noche">Ver cómo es la noche</button></p></section>')
    noche = ('<section class="ix-ly ix-cl-noche" data-ly="noche" id="ix-cum-noche" aria-labelledby="ix-cum-hno"><p class="ix-ck">La noche de Mica %s</p><h3 class="ix-sr" id="ix-cum-hno" tabindex="-1">La noche de Mica</h3>'
             '<button type="button" class="ix-pp" data-ix-pp hidden aria-label="Pausar el avance de la noche"><svg class="pa" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg><svg class="pl" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg></button>'
             '<p class="ix-clock" aria-hidden="true" data-clock>21:00</p>'
             '<div class="ix-arcw" aria-hidden="true"><svg viewBox="0 0 272 132" focusable="false"><path d="M8 122 A128 100 0 0 1 264 122" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="1 6" stroke-linecap="round"/></svg><i class="ix-orb"></i></div>'
             '<div class="ix-stops" role="radiogroup" aria-label="Hora de la noche">%s</div>'
             '<div class="ix-now" aria-live="polite"><h4 data-nt>Brindis</h4><p data-nd>%s</p></div>'
             '<div class="ix-nlk"><button type="button" class="ix-lk" data-go="info">Lo que conviene saber</button><button type="button" class="ix-lk ix-lk-b" data-go="confirmar">Confirmar asistencia <span aria-hidden="true">→</span></button></div></section>' % (_mk(), stops, NOCHE[0][2]))
    info = ('<section class="ix-ly ix-cl-info" data-ly="info" id="ix-cum-info" aria-labelledby="ix-cum-hi"><p class="ix-ck">Para tener en cuenta %s</p><h3 class="ix-ct2" id="ix-cum-hi" tabindex="-1">Lo que conviene <i>saber</i></h3>'
            '<dl class="ix-dl">%s</dl><p class="ix-cgo"><button type="button" class="ix-btn" data-go="confirmar">Confirmar asistencia</button></p><button type="button" class="ix-lk ix-lk-c" data-go="noche">Volver a la noche</button></section>'
            % (_mk(), "".join("<div><dt>%s</dt><dd>%s</dd></div>" % x for x in INFO_CUM)))
    conf = ('<section class="ix-ly ix-cl-conf" data-ly="confirmar" id="ix-cum-confirmar" aria-labelledby="ix-cum-hc"><p class="ix-ck">Tu respuesta</p><h3 class="ix-ct2" id="ix-cum-hc" tabindex="-1">%s</h3>%s</section>' % (FORMS["cum"]["h"], _fields("cum")))
    msg = '<section class="ix-ly ix-cl-msj" data-ly="mensaje" id="ix-cum-mensaje" aria-labelledby="ix-cum-hm" hidden>%s</section>' % _draft("cum")
    sky = '<div class="ix-sky" aria-hidden="true"><i class="ix-star"></i></div>'
    return _scr("cum", "Invitación de los 30 de Mica", sky + portada + noche + info + conf + msg + _wa("cum"), "ix-cum-scr")

# ---------------------------------------------------------------- empresa · Encuentro anual 2027 (sin dispositivo: composición editorial)
BLOQUES = [  # (inicio h, inicio m, minutos, nombre, sala, detalle)
    (8, 30, 60, "Acreditación", "Hall de entrada", "Retirá tu credencial con el DNI."),
    (9, 30, 45, "Apertura", "Auditorio · Sala 1", "Palabras de bienvenida y panorama del año."),
    (10, 30, 120, "Mesas de trabajo", "Salas 2 y 3", "Trabajo por equipos. Las salas se informan en la acreditación."),
    (12, 30, 60, "Almuerzo", "Comedor", "Almuerzo para todos los asistentes."),
    (13, 30, 60, "Resultados", "Auditorio · Sala 1", "Cada mesa presenta lo que trabajó."),
    (14, 30, 60, "Cierre y brindis", "Auditorio · Sala 1", "Cierre del encuentro y brindis."),
]

def _hm(h, m): return "%02d:%02d" % (h, m)

def _dur(d):
    return "%d h" % (d // 60) if d % 60 == 0 and d >= 60 else ("%d h %d min" % (d // 60, d % 60) if d > 60 else "%d min" % d)

def empresa():
    filas = ""
    for i, (h, m, d, n, s, t) in enumerate(BLOQUES):
        fin = h * 60 + m + d
        rango = "%s a %s" % (_hm(h, m), _hm(fin // 60, fin % 60))
        filas += ('<li class="ix-b%s"><button type="button" aria-expanded="false" aria-controls="ix-emp-d%d" data-bloque="%d"><span class="ix-bt">%s</span><span class="ix-bn">%s</span><span class="ix-br">%s</span></button>'
                  '<div class="ix-bd" id="ix-emp-d%d"><p>%s</p><p class="ix-bm">%s · %s</p></div></li>'
                  % (" ix-alt" if n == "Almuerzo" else "", i, i, _hm(h, m), _e(n), _e(s), i, _e(t), rango, _dur(d)))
    acc = [("Jueves", "09:30 a 15:30"), ("Lugar", "Auditorio · Sala 1"), ("Acreditación", "08:30 a 09:30"), ("Llevá", "DNI"), ("Estacionamiento", "Subsuelo, sujeto a cupo"), ("Plazo", "Confirmá hasta el jueves 4 de marzo")]
    portada = ('<div class="ix-emp-cover" data-ly="portada" id="ix-emp-portada"><p class="ix-ey">Evento de empresa · Encuentro anual 2027</p><h2 class="ix-eh" id="ix-emp-hn" tabindex="-1">Del acceso<br>al brindis.</h2>'
               '<p class="ix-edate"><b aria-hidden="true">18</b><span>Jueves 18 de marzo<br>de 2027</span></p>'
               '<dl class="ix-edl">%s</dl>'
               '<p class="ix-eact"><button type="button" class="ix-ebtn" data-go="confirmar">Confirmar asistencia</button><button type="button" class="ix-lk" data-go="jornada">Ver la jornada completa</button></p></div>'
               % "".join("<div><dt>%s</dt><dd>%s</dd></div>" % x for x in acc))
    jornada = ('<div class="ix-emp-jor" data-ly="jornada" id="ix-emp-jornada" role="group" aria-labelledby="ix-emp-hj"><p class="ix-ey" id="ix-emp-hj" tabindex="-1">La jornada %s</p><ol class="ix-jr">%s</ol></div>' % (_mk(), filas))
    conf = ('<section class="ix-emp-conf" data-ly="confirmar" id="ix-emp-confirmar" aria-labelledby="ix-emp-hc"><div class="ix-econf-h"><p class="ix-ey">Confirmación</p><h3 class="ix-eh2" id="ix-emp-hc" tabindex="-1">%s</h3></div>%s</section>'
            % (FORMS["emp"]["h"], _fields("emp")))
    msg = ('<section class="ix-emp-conf ix-emp-msg" data-ly="mensaje" id="ix-emp-mensaje" aria-labelledby="ix-emp-hm" hidden>%s</section>' % _draft("emp"))
    return ('<div class="ix-emp-in" data-main><div class="ix-emp-top">%s%s</div>%s%s</div>%s' % (portada, jornada, conf, msg, _wa("emp")))

# ---------------------------------------------------------------- secciones de la página
ACTOS = [("La enviás por WhatsApp.", "Compartís un enlace con vista previa propia. Un toque y tus invitados abren la invitación.", "La enviás", True, "Probalo: tocá el enlace del chat."),
         ("El día, en una página.", "Tus invitados ven el programa, el lugar y lo que conviene saber, sin preguntarte por el chat.", "La abren", True, "Probalo: abrí cualquier momento del programa."),
         ("Confirmar lleva un minuto.", "Cada invitado pone su nombre, si viene y cuántos son. Si falta algo, el aviso aparece al lado del campo.", "Confirman", False, "Probalo: tocá «Preparar mi mensaje» sin completar nada."),
         ("Te responden por WhatsApp.", "Cada invitado revisa su mensaje y lo envía desde su propio WhatsApp. Hasta que no toca Enviar, no se mandó nada.", "Te responden", False, "Probalo: completá una respuesta y mirá cómo se arma el mensaje.")]

def historia(hero_html):
    # Hero + recorrido: un único dispositivo protagonista; los cuatro actos acompañan a la pantalla (en escritorio quedan fijos junto a ella).
    items = "".join(
        '<li class="ix-act%s" data-n="%d"><h2 class="ix-act-h"><button type="button" class="ix-act-b" data-ix-acto="%d"%s><span class="ix-act-n">0%d</span><span class="ix-act-t">%s%s</span></button></h2>'
        '<div class="ix-act-d"><div><p>%s</p><p class="ix-try">%s</p></div></div></li>' % (" on" if i == 0 else "", i + 1, i + 1, ' aria-current="step"' if i == 0 else "", i + 1, a[0], (" " + _mk()) if a[3] and i == 0 else "", a[1], a[4])
        for i, a in enumerate(ACTOS))
    sent = "".join('<i class="ix-sent" data-n="%d" aria-hidden="true"></i>' % (i + 1) for i in range(4))
    steps = "".join('<li><button type="button" data-ix-acto="%d"%s>%s</button></li>' % (i + 1, ' aria-current="step"' if i == 0 else "", a[2]) for i, a in enumerate(ACTOS))
    return ('<div class="ixs" id="inicio" data-ix-story data-sticky-hide>'
            '<div class="ixs-l">%s'
            '<section class="ix-acts" id="recorrido" data-sticky-hide aria-label="Recorrido de la invitación"><div class="ix-acts-track">%s<div class="ix-acts-pin"><ol class="ix-actl" data-ix-acts>%s</ol>'
            '<p class="ix-fic">Invitación de ejemplo, con datos ficticios.</p></div></div></section></div>'
            '<div class="ixs-r"><div class="ix-stage"><div class="ix-stage-bg" aria-hidden="true"></div>%s'
            '<ol class="ix-steps" aria-label="Capítulos de la invitación">%s</ol>'
            '<div class="ix-pn" role="group" aria-label="Cambiar de capítulo"><button type="button" class="ix-pn-b" data-ix-pn="-1"><span aria-hidden="true">←</span> Anterior</button><button type="button" class="ix-pn-b ix-pn-n" data-ix-pn="1">Siguiente <span aria-hidden="true">→</span></button></div>'
            '<button type="button" class="ix-reset" data-ix-reiniciar hidden>Empezar de nuevo</button></div></div></div>\n'
            % (hero_html, sent, items, casamiento(), steps))

def cumple_seccion():
    return ('<section class="ix-cum" id="cumple" data-t="0" data-sticky-hide aria-labelledby="h-cum"><div class="ix-cum-in"><div class="ix-cum-copy"><p class="ix-ey">Cumpleaños · Los 30 de Mica</p>'
            '<h2 id="h-cum">La noche cambia.<br><i>La invitación también.</i></h2>'
            '<p class="ix-cum-p">Mica no manda un cartel: manda una noche. Cada parada cambia el cielo, la hora y lo que pasa, y todo lo que hay que saber queda en el mismo lugar.</p>'
            '<button type="button" class="ix-reset" data-ix-reiniciar-ev="cum" data-ix-slot data-off>Empezar de nuevo</button></div><div class="ix-cum-dev">%s</div></div></section>\n' % cumpleanos())

def empresa_seccion():
    return ('<section class="ix-emp" id="empresa" data-inv="emp" data-paso="portada" data-sticky-hide aria-labelledby="ix-emp-hn">%s'
            '<div class="ix-emp-foot"><button type="button" class="ix-reset" data-ix-reiniciar-ev="emp" hidden>Empezar de nuevo</button></div></section>\n' % empresa())

def otros():
    return '<div id="otros">%s%s</div>\n' % (cumple_seccion(), empresa_seccion())

INCLUYE = [("Portada con los datos del evento", "Nombres, fecha y lugar, con el estilo de tu evento."), ("Programa y horarios", "Qué pasa y a qué hora, en orden."), ("Ubicación con enlace a mapas", ""),
           ("Botón «Confirmar asistencia» por WhatsApp", "Nombre, respuesta y cantidad de personas en un mensaje listo. Las respuestas te llegan a tu WhatsApp."), ("Enlace para compartir", "Online hasta 30 días después del evento.")]
A_MEDIDA = [("Apertura animada con tus fotos", ""), ("Información para invitados", "Vestimenta, traslado, alojamiento, regalos."), ("Programa interactivo", "Como «La noche» o «La jornada»."), ("Galería de fotos, música o cuenta regresiva", ""),
            ("Agregar al calendario", ""), ("Registro de asistentes, control de acompañantes o confirmación por grupo", "Hoy las respuestas llegan a tu WhatsApp."), ("Contenido distinto para cada grupo de invitados", "")]

def alcance():
    li = lambda L, mk: "".join("<li>%s<span>%s%s</span></li>" % (_mk() if mk else "", _e(a), ("<small>%s</small>" % _e(b)) if b else "") for a, b in L)
    return ('<section class="ix-al" id="alcance" aria-labelledby="h-al"><div class="ix-al-in"><p class="ix-ey">Qué incluye</p><h2 id="h-al">Una base clara, y todo lo demás a tu medida.</h2>'
            '<div class="ix-alg"><div><h3>Incluye</h3><ul class="ix-all">%s</ul></div><div><h3>Se diseña a medida y se presupuesta por escrito</h3><ul class="ix-all ix-allm">%s</ul></div></div>'
            '<p class="ix-nota"><span class="ix-mk" aria-hidden="true"></span><span>Lo marcado con este círculo no viene en la base. Las respuestas te llegan a tu WhatsApp y las administrás vos; Growi no las registra. El presupuesto y el alcance se confirman por escrito antes de empezar.</span></p></div></section>\n' % (li(INCLUYE, False), li(A_MEDIDA, True)))

PASOS = [("01", "Nos contás tu evento", "Por WhatsApp: qué celebrás, la fecha y cuántos invitados son."), ("02", "Definimos qué incluye", "Te pasamos el presupuesto y el alcance por escrito."),
         ("03", "Ves el borrador", "Lo mirás en tu celular y pedís correcciones de contenido."), ("04", "La publicamos y la compartís", "Con el saldo abonado, publicamos la invitación definitiva y te pasamos el enlace.")]

def pedido(boton):
    return ('<section class="ix-pd" id="pedido" aria-labelledby="h-co"><div class="ix-pd-in"><p class="ix-ey">Cómo se pide</p><h2 id="h-co">De tu idea al enlace para compartir.</h2><ol class="ix-st">%s</ol>'
            '<p class="ix-cnd">Cotización personalizada por WhatsApp, con presupuesto y alcance por escrito antes de empezar. Incluye dos rondas de correcciones de contenido; los ajustes adicionales se presupuestan por separado. Al contratar, se abona un anticipo del 50%% imputable al precio total y el saldo del 50%% antes de publicar la invitación definitiva.</p>'
            '<p class="ix-pdc">%s</p></div></section>\n' % ("".join('<li><span>%s</span><b>%s</b><p>%s</p></li>' % p for p in PASOS), boton))

# ---------------------------------------------------------------- teaser del Home: tres portadas con la voz de cada evento
def teaser():
    return ('<div class="ix-tz" aria-hidden="true"><div class="ix-tz-c ix-tz-cas"><p class="ix-tz-l">Nos casamos</p><p class="ix-tz-n">Lucía<span>&amp; Tomás</span></p><p class="ix-tz-d">Sábado 20 de marzo<br>Capilla del jardín</p></div>'
            '<div class="ix-tz-c ix-tz-cum"><p class="ix-tz-30">30</p><p class="ix-tz-t">Los 30<br><i>de Mica</i></p><p class="ix-tz-d2">Sábado 14 de agosto · Terraza</p></div>'
            '<div class="ix-tz-c ix-tz-emp"><p class="ix-tz-l2">Encuentro anual 2027</p><p class="ix-tz-n2"><b>18</b><span>marzo</span></p><p class="ix-tz-t2">Del acceso al brindis.</p></div></div>')
