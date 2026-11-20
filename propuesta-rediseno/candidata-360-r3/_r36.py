# R3.6: escenas autónomas (GrowiApp, GrowiFlow, Combo, hero de la home, exhibición de GrowiWeb) y bloques de página.
# Cada escena cuenta una historia sola, en bucle, desde que entra en pantalla; el estado final es la alternativa estática.
from _lib import *

def _svg(d, cls="fx-ic"):
    return '<svg class="%s" viewBox="0 0 24 24" aria-hidden="true">%s</svg>' % (cls, d)
I_PERSON = _svg('<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-4 3.5-6 7-6s6.2 2 7 6"/>')
I_CLOCK = _svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')
I_CHECK_S = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
CK = '<span class="fx-ck">%s</span>' % I_CHECK_S

PP = '<button type="button" class="sc-pp" data-sc-pp aria-label="Pausar la animación"></button>'
CHIP = '<span class="sc-chip">Ejemplo ilustrativo</span>'

def _rail(items, local=False):
    a = "data-lin" if local else "data-in"
    return '<ol class="sc-rail">%s</ol>' % "".join('<li %s="%d" class="rl"><i>%d</i>%s</li>' % (a, k + 1, k + 1, t) for k, t in enumerate(items))

def _foot(items, local=False):
    return '<div class="sc-foot">%s%s</div>' % (_rail(items, local), PP)

# ------------------------------------------------------------ GrowiApp: una venta y todo lo que mueve (cifras coherentes con la demo)
# 2 × Flat white ($3.900) + 1 × Medialuna ($1.700) = $9.500. Caja $147.600 → $157.100; ventas $184.500 → $194.000.
def scene_app(rel):
    pos = ('<div class="ap-pos" data-in="1"><p class="k">Mostrador · nueva venta</p><ul><li data-in="1" style="--d:.15s"><span>2 × Flat white</span><b>$7.800</b></li>'
           '<li data-in="1" style="--d:.45s"><span>1 × Medialuna</span><b>$1.700</b></li></ul>'
           '<div class="tot"><span>Total</span><b>$9.500</b></div><div class="pay"><span>Cobrar</span><span class="paid rl" data-in="2">✓ Cobrado</span></div></div>')
    caja = ('<div class="tile caja"><p class="k">Caja del día</p><b class="big" data-num="147600|157100|ars|2">$147.600</b>'
            '<span class="chip-d" data-in="2" style="--d:.2s">+ $9.500</span></div>')
    vta = ('<div class="tile vta rl" data-in="3"><p class="k">Ventas de hoy</p><b class="big" data-num="184500|194000|ars|3">$184.500</b>'
           '<div class="spark" aria-hidden="true"><i style="--h:34%;--h0:34%"></i><i style="--h:52%;--h0:52%"></i><i style="--h:44%;--h0:44%"></i><i style="--h:70%;--h0:70%"></i><i style="--h:58%;--h0:58%"></i><i style="--h:100%;--h0:78%"></i></div></div>')
    stk = ('<div class="tile stk rl" data-in="3"><p class="k">Stock</p>'
           '<div class="r"><span>Leche entera</span><b><span data-num="18|17.6|n|3|1">18,0</span> L</b><div class="pbar"><i style="--w1:72%;--w2:70%"></i></div></div>'
           '<div class="r"><span>Medialunas</span><b><span data-num="24|23|n|3">24</span> u.</b><div class="pbar"><i style="--w1:60%;--w2:57%"></i></div></div></div>')
    done = '<p class="ap-done" data-in="4" style="grid-column:1/-1"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>Una sola carga y todo queda al día</p>'
    return ('<div class="sc sc-app" data-sc data-beats="4" data-ms="2400" data-hold="3400"><div class="sc-bg" style="background-image:url(%sassets/img/cafeteria-sala.webp)"></div>%s'
            '<div class="sc-st"><div class="ap-b">%s<div class="ap-o">%s%s%s%s</div></div>%s</div></div>'
            % (rel, CHIP, pos, caja, vta, stk, done, _foot(["Se registra la venta", "Se actualiza la caja", "Baja el stock", "Todo al día"])))

# ------------------------------------------------------------ GrowiFlow: tarea manual → disparador → automatización → resultado
FLOW = [
 dict(t="Avisar los turnos", man="Cada día mirás la agenda y avisás uno por uno a quien tiene turno mañana.", trg=("Todos los días, 9:00", "Mañana hay 3 turnos en la agenda"),
      aut=["Lee la agenda de mañana", "Arma un aviso por cada turno", "Lo envía a cada cliente"],
      res='<div class="bub"><b>Hola Julián</b>, te recordamos tu turno de mañana: sábado a las 11:15 en Centro Ribera.</div><p class="sub2">%s 3 avisos enviados</p><p class="nt">Por mail o, con una cuenta habilitada por Meta, por WhatsApp.</p>' % CK),
 dict(t="Ordenar las consultas", man="Te llegan consultas por todos lados y las anotás a mano en una planilla.", trg=("Alguien completa el formulario", "Julián pide turno para el sábado"),
      aut=["Agrega una fila a tu planilla", "Le pone estado «Nueva»", "Te avisa que hay algo para responder"],
      res='<div class="sh"><span class="h">Quién</span><span class="h">Qué</span><span class="h">Estado</span><span>Marta</span><span>Control</span><span>Atendida</span><span class="nw">Julián</span><span class="nw">Turno sábado</span><span class="nw"><i>Nueva</i></span></div><p class="sub2">%s Y un aviso para que no se te pase</p>' % CK),
 dict(t="Armar el resumen", man="Cada viernes sumás ventas y turnos para saber cómo viene el negocio.", trg=("Viernes, 18:00", "Cierra la semana"),
      aut=["Suma las ventas y los turnos", "Compara con la semana anterior", "Marca lo que conviene mirar"],
      res='<p class="sub2" style="font-size:15px">Resumen de la semana</p><ul><li>12 turnos · 1 ausencia</li><li>Lo más pedido: Control</li><li>Bajaron los turnos de los martes</li></ul><p class="nt">Datos inventados para el ejemplo.</p>'),
]

GHOST = ["Lo que hoy hacés a mano", "Un horario o algo que pasa en tu negocio", "Los pasos que se repiten, hechos solos", "Lo que recibe tu cliente o lo que ves vos"]

def scene_flow():
    gs = ""
    for k, s in enumerate(FLOW):
        o = 4 * k
        aut = "".join('<li data-in="3" style="--d:%.2fs">%s<span>%s</span></li>' % (.3 + .55 * j, CK, E(x)) for j, x in enumerate(s["aut"]))
        gs += ('<div class="fx-g" data-in="%d-%d" data-off="%d"><p class="fx-t">Ejemplo · %s</p><div class="fx-row">'
               '<div class="fx-n n1 rl" data-in="1"><p class="fx-k"><i>1</i>Tarea manual</p><div class="fx-c man"><p class="fx-gh">%s</p>%s<p>%s</p></div></div>'
               '<div class="fx-n n2 rl" data-in="2"><p class="fx-k"><i>2</i>Disparador</p><div class="fx-c trg"><p class="fx-gh">%s</p>%s<b>%s</b><small>%s</small></div></div>'
               '<div class="fx-n n3 rl" data-in="3"><p class="fx-k"><i>3</i>Automatización</p><div class="fx-c aut"><p class="fx-gh">%s</p><ul>%s</ul></div></div>'
               '<div class="fx-n n4 rl" data-in="4"><p class="fx-k"><i>4</i>Resultado</p><div class="fx-c res"><p class="fx-gh">%s</p>%s</div></div></div></div>'
               % (o + 1, o + 4, o, E(s["t"]), GHOST[0], I_PERSON, E(s["man"]), GHOST[1], I_CLOCK, E(s["trg"][0]), E(s["trg"][1]), GHOST[2], aut, GHOST[3], s["res"]))
    return ('<div class="sc sc-flow" data-sc data-beats="12" data-cycle="4" data-ms="2300" data-hold="3000" data-static="4">%s<div class="sc-st"><div class="fx-gs">%s</div>%s</div></div>'
            % (CHIP, gs, _foot(["Tarea manual", "Disparador", "Automatización", "Resultado"], True)))

# ------------------------------------------------------------ Combo: un mismo negocio, del sitio a la caja (el paso del medio lo hace una persona)
COMBO_PASOS = [
    ("Encuentra el sitio y pide turno", "Elige la zona que le molesta y toca «Pedir turno»."),
    ("Llega la consulta por WhatsApp", "El mensaje entra al número del centro."),
    ("Una persona lo carga", "Lo lee, confirma el horario y lo carga en la agenda."),
    ("Agenda y caja al día", "El turno queda en la agenda y la consulta, en la caja."),
]

def scene_combo(rel):
    steps = "".join('<li class="cb-s%s rl" data-lin="%d"><i>%d</i><div><b>%s</b><span>%s</span></div></li>' % (" hum" if k == 2 else "", k + 1, k + 1, t, d) for k, (t, d) in enumerate(COMBO_PASOS))
    s1 = ('<div class="cb-sc s1 rl" data-lin="1"><img src="%sassets/img/ribera-m.webp" width="390" height="800" alt="Sitio de muestra de Centro Ribera en el celular: el paciente elige la zona que le molesta." loading="lazy">'
          '<span class="cb-act">Pedir turno</span></div>' % rel)
    s2 = ('<div class="cb-sc s2 rl" data-lin="2"><div class="wa-h"><i>CR</i><div><b>Centro Ribera</b><small>WhatsApp</small></div></div><div class="wa-b">'
          '<div class="wa-m out">Hola, quiero turno para el sábado a la mañana.<small>10:42</small></div>'
          '<div class="wa-m in">¡Hola! Te esperamos el sábado a las 11:15.<small>10:51</small></div>'
          '<p class="wa-tag">%s Una persona del centro responde y lo carga</p></div></div>' % _svg('<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-4 3.5-6 7-6s6.2 2 7 6"/>', ""))
    s4 = ('<div class="cb-sc s4 rl" data-lin="4"><img src="%sassets/img/combo-app-m.webp" width="390" height="688" alt="Panel de GrowiApp en el celular con el negocio de muestra Centro Ribera." loading="lazy">'
          '<div class="cb-chip a"><small>Agenda · sábado 11:15</small><b>Julián · Primera consulta</b></div>'
          '<div class="cb-chip v"><small>Venta registrada</small><b>Consulta inicial · $21.000</b></div></div>' % rel)
    return ('<div class="sc sc-combo" data-sc data-beats="4" data-ms="3000" data-hold="3600" data-static="4"><div class="sc-bg" style="background-image:url(%sassets/img/ribera-sala.webp)"></div>%s'
            '<div class="sc-st"><div class="cb-g"><div class="cb-stage"><div class="cb-ph">%s%s%s</div></div><ol class="cb-steps">%s</ol></div><div class="sc-foot">%s</div></div></div>'
            % (rel, CHIP, s1, s2, s4, steps, PP))


# ------------------------------------------------------------ Invitaciones: tres mundos de evento en un mismo recorrido (portada → programa y lugar → confirmación)
def _iv_prog(items):
    return '<ul class="pr">%s</ul>' % "".join("<li><b>%s</b><span>%s</span></li>" % x for x in items)

def _iv_world(k, off, cov, kicker, prog, place, cta):
    a, z = off + 1, off + 3
    return ('<div class="iv-g %s rl" data-in="%d-%d" data-off="%d"><div class="iv-l2 rl" data-in="2"><div class="iv-l3 rl" data-in="3">'
            '<section class="iv-cov">%s</section>'
            '<section class="iv-prog"><p class="k">%s</p>%s<div class="iv-map" aria-hidden="true"><i></i><b>%s</b></div></section>'
            '<section class="iv-rsvp"><p class="q">¿Nos acompañás?</p><span class="iv-btn rl" data-in="3">%s</span></section>'
            '</div></div></div>' % (k, a, z, off, cov, kicker, _iv_prog(prog), place, cta))

def scene_inv(rel):
    w = _iv_world("w", 0,
        '<p class="k">Nos casamos</p><div class="arch"><i class="sun"></i><i class="h1"></i><i class="h2"></i></div><h4>Lucía <em>&amp;</em> Tomás</h4><p class="d">Sábado 20 de marzo de 2027</p><p class="p">Capilla de ejemplo · 17:00</p>',
        "El día", [("17:00", "Ceremonia"), ("19:00", "Cóctel"), ("20:00", "Cena y baile")], "Capilla de ejemplo", "Confirmar asistencia")
    b = _iv_world("b", 3,
        '<i class="cf c1"></i><i class="cf c2"></i><i class="cf c3"></i><i class="cf c4"></i><i class="cf c5"></i><p class="k">Estás invitado</p><div class="num">30</div><h4>Los 30 de Mica</h4><p class="d">Sábado 14 de agosto · 21:00</p><p class="p">Terraza de ejemplo</p>',
        "La noche", [("21:00", "Brindis"), ("22:00", "Cena"), ("00:00", "Torta y baile")], "Terraza de ejemplo", "Confirmar asistencia")
    c = _iv_world("c", 6,
        '<p class="k">Cena anual</p><h4>Fin de año<br>2027</h4><div class="ln"></div><p class="d">Jueves 9 de diciembre · 20:30</p><p class="p">Salón de ejemplo</p>',
        "Programa", [("20:30", "Recepción"), ("21:15", "Palabras de apertura"), ("22:00", "Cena")], "Salón de ejemplo", "Confirmar asistencia")
    bgs = "".join('<div class="iv-bg %s rl" data-in="%d-%d"></div>' % (k, a, a + 2) for k, a in (("w", 1), ("b", 4), ("c", 7)))
    names = [("w", "Casamiento", "Cálido y elegante", 1), ("b", "Cumpleaños", "Color y energía", 4), ("c", "Empresa", "Sobrio y claro", 7)]
    idx = "".join('<li class="rl" data-in="%d-%d"><b>%s</b><span>%s</span></li>' % (a, a + 2, n, t) for k, n, t, a in names)
    caps = ('<div class="iv-cp rl" data-lin="1"><b>La portada</b><span>Nombres, fecha y lugar, con el estilo de cada evento.</span></div>'
            '<div class="iv-cp rl" data-lin="2"><b>Programa y ubicación</b><span>Horarios y mapa en una sola página, que se comparte con un enlace.</span></div>'
            '<div class="iv-cp rl" data-lin="3"><b>Confirman por WhatsApp</b><span>Cada invitado toca el botón y avisa si va.</span><p class="iv-wa">Confirmo asistencia, somos 2.<small>Mensaje que llega a tu WhatsApp</small></p></div>')
    return ('<div class="sc sc-inv" data-sc data-beats="9" data-cycle="3" data-ms="2700" data-hold="3800" data-static="3">%s%s'
            '<div class="sc-st"><div class="iv-gr"><ul class="iv-idx">%s</ul><div class="iv-stage"><div class="iv-ph"><i class="iv-notch"></i>%s%s%s</div></div><div class="iv-caps">%s</div></div><div class="sc-foot">%s</div></div></div>'
            % (bgs, CHIP, idx, w, b, c, caps, PP))

# ------------------------------------------------------------ Home: hero de producto
def scene_hero(rel):
    wa = '<div class="hr-wa" data-in="2"><div class="cb-wa"><small>Consulta · WhatsApp</small>Hola, quiero turno para el sábado a la mañana.</div></div>'
    ap = ('<div class="hr-ap" data-in="3"><p class="k">Caja del día</p><b class="big" data-num="147600|168600|ars|3">$147.600</b><div class="row"><span>Consulta inicial</span><b>+ $21.000</b></div></div>')
    cap = '<div class="hr-cap"><span class="rl" data-in="1">Te encuentran</span><span class="rl" data-in="2">Te consultan</span><span class="rl" data-in="3">Queda registrado</span></div>'
    return ('<div class="sc sc-hero" data-sc data-beats="3" data-ms="2800" data-hold="4200"><div class="sc-bg" style="background-image:url(%sassets/img/ribera-sala.webp)"></div>%s%s'
            '<div class="sc-st"><div class="hr-ph"><img src="%sassets/img/ex-ribera-m.webp" width="375" height="6701" alt="Sitio de muestra de un consultorio recorrido en el celular." fetchpriority="high"></div>%s%s%s</div></div>'
            % (rel, CHIP, PP, rel, wa, ap, cap))

# ------------------------------------------------------------ GrowiWeb: exhibición de proyectos completos
# y de cada capítulo en la captura de página completa (px de la captura) y alto total, para dirigir la cámara por secciones
SITES = {
 "ribera": dict(n="Centro Ribera", s="Consultorio de kinesiología", bg="#0e2f3b", acc="#ff6a4d", photo="ribera-sala.webp", href="centro-ribera/index.html",
                d=("ex-ribera-d.webp", 1085, 5676, [0, 992, 2947, 4700]), m=("ex-ribera-m.webp", 375, 6701, [0, 1320, 2699, 5448]),
                ch=[("Entrada", "Quien llega elige la zona que le molesta y pide turno."), ("Cómo trabajan", "Cuenta cómo es la consulta antes de pedirla."),
                    ("Servicios", "Lo que hacen, claro y a mano."), ("Cierre", "Invita a elegir un horario que le quede cómodo.")]),
 "barro": dict(n="Barro &amp; Fuego", s="Taller de cerámica", bg="#2b1c14", acc="#e58a5b", photo="ceramica-taller.webp", href="ceramica/index.html",
               d=("ex-barro-d.webp", 1085, 2589, [0, 685, 1143, 1447]), m=("ex-barro-m.webp", 375, 3726, [0, 924, 1901, 2368]),
               ch=[("Entrada", "Una primera pieza, en cuatro clases."), ("Las clases", "Qué se hace en cada una."),
                   ("Qué incluye", "Todo lo que incluye, a la vista."), ("Preguntas", "Responde las dudas antes de consultar.")]),
}

def _ys(h, ys):
    return ";".join("--y%d:%.3f%%" % (i + 1, y * 100.0 / h) for i, y in enumerate(ys))

def ex_panel(rel, key, num="01"):
    d = SITES[key]; di, dw, dh, dy = d["d"]; mi, mw, mh, my = d["m"]
    ch = "".join('<li class="rl" data-lin="%d"><i>%d</i><div><b>%s</b><span>%s</span></div></li>' % (k + 1, k + 1, t, x) for k, (t, x) in enumerate(d["ch"]))
    return ('<article class="sc ex-p" data-sc data-beats="4" data-ms="3300" data-hold="3600" data-static="1" style="--pbg:%s;--pacc:%s"><div class="sc-bg" style="background-image:url(%sassets/img/%s)"></div>%s%s'
            '<div class="ex-in"><div class="ex-copy"><p class="ex-k">Proyecto de muestra · %s</p><h3>%s</h3><p class="ex-s">%s</p><ol class="ex-ch">%s</ol>'
            '<a class="ex-open" href="%sdemos/web/%s" target="_blank" rel="noopener">Abrir el sitio completo ↗</a></div>'
            '<div class="ex-art"><div class="ex-d"><div class="bar2" aria-hidden="true"><i></i><i></i><i></i></div><div class="ex-vp"><img src="%sassets/img/%s" width="%d" height="%d" style="%s" alt="Sitio de %s en escritorio, recorrido por secciones." loading="lazy"></div></div>'
            '<div class="ex-m"><div class="ex-vp"><img src="%sassets/img/%s" width="%d" height="%d" style="%s" alt="El mismo sitio en el celular." loading="lazy"></div></div>'
            '<p class="ex-now" aria-hidden="true">%s</p></div></div></article>'
            % (d["bg"], d["acc"], rel, d["photo"], CHIP, PP, num, d["n"], d["s"], ch, rel, d["href"], rel, di, dw, dh, _ys(dh, dy), d["s"].lower(), rel, mi, mw, mh, _ys(mh, my),
               "".join('<span class="rl" data-lin="%d">%s</span>' % (k + 1, x) for k, (t, x) in enumerate(d["ch"]))))

# ------------------------------------------------------------ bloques de página
def hero36(pg, crumb, h1, sub, ctas, pr, scene, secnav=None):
    return ('<section class="ph36" data-sticky-hide aria-labelledby="h1"><div class="w">%s<div class="ph36-top"><h1 id="h1">%s</h1><div class="ph36-side"><p class="sub">%s</p><div class="cta-row">%s</div>%s</div></div>'
            '<div id="demo" class="ph36-scene">%s</div></div></section>\n' % (crumb, h1, sub, ctas, ('<p class="ph36-pr">%s</p>' % pr) if pr else "", scene))

L1_PRECIOS_36 = ("Planes y precios previstos: todavía no se aceptan contrataciones ni pagos. Precios en USD; el valor en pesos es orientativo y se actualiza con el dólar oficial (venta). "
                 "Dominio, alojamiento y costos de terceros (comisiones de medios de pago, mensajes de WhatsApp) se cotizan aparte cuando correspondan. Lo «desde» y lo a medida se confirman en un presupuesto por escrito antes de empezar.")

def caso4(rel, link):
    return ('<section class="caso4" id="caso" aria-labelledby="h-caso"><div class="w"><div class="caso4-in"><figure class="caso4-logo" style="margin:0"><img src="%sassets/img/colocafe-logo.png" alt="Logo de Colo Café" width="120" height="120" loading="lazy"></figure>'
            '<div><p class="eyebrow">Caso real</p><h2 id="h-caso">Colo Café</h2><p class="l">Sistema de gestión armado para su cafetería: caja, comandas, stock y gastos.</p><a class="tl" href="%s" data-track="caso-colocafe-ver">Ver GrowiApp para cafeterías →</a></div>'
            '<div class="q"><blockquote>«Necesitábamos ordenar ventas, reservas y caja sin depender de planillas. Growi nos ayudó a tener una operación más clara y fácil de seguir.»</blockquote><p class="cite">Rodrigo, dueño de Colo Café</p></div></div></div></section>\n' % (rel, link))
