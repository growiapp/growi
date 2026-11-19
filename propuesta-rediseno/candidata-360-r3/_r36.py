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
    caja = ('<div class="tile caja" data-in="2"><p class="k">Caja del día</p><b class="big" data-num="147600|157100|ars|2">$147.600</b>'
            '<span class="chip-d" data-in="2" style="--d:.2s">+ $9.500</span></div>')
    vta = ('<div class="tile vta" data-in="3"><p class="k">Ventas de hoy</p><b class="big" data-num="184500|194000|ars|3">$184.500</b>'
           '<div class="spark" aria-hidden="true"><i style="--h:34%;--h0:34%"></i><i style="--h:52%;--h0:52%"></i><i style="--h:44%;--h0:44%"></i><i style="--h:70%;--h0:70%"></i><i style="--h:58%;--h0:58%"></i><i style="--h:100%;--h0:78%"></i></div></div>')
    stk = ('<div class="tile stk" data-in="3"><p class="k">Stock</p>'
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

def scene_flow():
    gs = ""
    for k, s in enumerate(FLOW):
        o = 4 * k
        aut = "".join('<li data-in="3" style="--d:%.2fs">%s<span>%s</span></li>' % (.3 + .55 * j, CK, E(x)) for j, x in enumerate(s["aut"]))
        gs += ('<div class="fx-g" data-in="%d-%d" data-off="%d"><p class="fx-t">Ejemplo · %s</p><div class="fx-row">'
               '<div class="fx-n n1" data-in="1"><p class="fx-k"><i>1</i>Tarea manual</p><div class="fx-c man">%s<p>%s</p></div></div>'
               '<div class="fx-n n2" data-in="2"><p class="fx-k"><i>2</i>Disparador</p><div class="fx-c trg">%s<b>%s</b><small>%s</small></div></div>'
               '<div class="fx-n n3" data-in="3"><p class="fx-k"><i>3</i>Automatización</p><div class="fx-c aut"><ul>%s</ul></div></div>'
               '<div class="fx-n n4" data-in="4"><p class="fx-k"><i>4</i>Resultado</p><div class="fx-c res">%s</div></div></div></div>'
               % (o + 1, o + 4, o, E(s["t"]), I_PERSON, E(s["man"]), I_CLOCK, E(s["trg"][0]), E(s["trg"][1]), aut, s["res"]))
    return ('<div class="sc sc-flow" data-sc data-beats="12" data-cycle="4" data-ms="2300" data-hold="3000" data-static="4">%s<div class="sc-st"><div class="fx-gs">%s</div>%s</div></div>'
            % (CHIP, gs, _foot(["Tarea manual", "Disparador", "Automatización", "Resultado"], True)))

# ------------------------------------------------------------ Combo: un mismo negocio, del sitio a la caja (el paso del medio lo hace una persona)
def scene_combo(rel):
    a = ('<div class="cb-a" data-in="1"><figure class="cb-ph" style="margin:0"><img src="%sassets/img/ribera-m.webp" width="390" height="800" alt="Sitio de muestra de Centro Ribera en el celular: el paciente elige la zona que le molesta." loading="lazy">'
         '<span class="cb-act" data-in="1" style="--d:.9s">Pedir turno</span></figure></div>' % rel)
    mid = ('<div class="cb-mid"><div class="cb-b1" data-in="2"><div class="cb-wa"><small>Paciente · WhatsApp</small>Hola, quiero turno para el sábado a la mañana.</div></div>'
           '<div class="cb-b2" data-in="3"><div class="cb-pe">%s<div><p>Una persona del centro lo lee, confirma el horario y lo carga.</p><small>Este paso es humano</small></div></div></div></div>' % _svg('<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-4 3.5-6 7-6s6.2 2 7 6"/>', ""))
    c = ('<div class="cb-c" data-in="3"><figure class="cb-ph" style="margin:0"><img src="%sassets/img/combo-app-m.webp" width="390" height="688" alt="Panel de GrowiApp en el celular con el negocio de muestra Centro Ribera." loading="lazy">'
         '<div class="cb-chip a" data-in="3" style="--d:.5s"><small>Agenda · sábado 11:15</small><b>Julián · Primera consulta</b></div>'
         '<div class="cb-chip v" data-in="4"><small>Venta registrada</small><b>Consulta inicial · $21.000</b></div></figure></div>' % rel)
    return ('<div class="sc sc-combo" data-sc data-beats="4" data-ms="2700" data-hold="3400"><div class="sc-bg" style="background-image:url(%sassets/img/ribera-sala.webp)"></div>%s'
            '<div class="sc-st"><div class="cb-g">%s%s%s</div>%s</div></div>'
            % (rel, CHIP, a, mid, c, _foot(["Encuentra el sitio y pide turno", "Llega por WhatsApp", "Una persona lo carga", "Agenda y caja al día"])))

# ------------------------------------------------------------ Home: hero de producto
def scene_hero(rel):
    wa = '<div class="hr-wa" data-in="2"><div class="cb-wa"><small>Consulta · WhatsApp</small>Hola, quiero turno para el sábado a la mañana.</div></div>'
    ap = ('<div class="hr-ap" data-in="3"><p class="k">Caja del día</p><b class="big" data-num="147600|168600|ars|3">$147.600</b><div class="row"><span>Consulta inicial</span><b>+ $21.000</b></div></div>')
    cap = '<div class="hr-cap"><span class="rl" data-in="1">Te encuentran</span><span class="rl" data-in="2">Te consultan</span><span class="rl" data-in="3">Queda registrado</span></div>'
    return ('<div class="sc sc-hero" data-sc data-beats="3" data-ms="2800" data-hold="4200"><div class="sc-bg" style="background-image:url(%sassets/img/ribera-sala.webp)"></div>%s%s'
            '<div class="sc-st"><div class="hr-ph"><img src="%sassets/img/ex-ribera-m.webp" width="390" height="6954" alt="Sitio de muestra de un consultorio recorrido en el celular." fetchpriority="high"></div>%s%s%s</div></div>'
            % (rel, CHIP, PP, rel, wa, ap, cap))

# ------------------------------------------------------------ GrowiWeb: exhibición de proyectos completos
SITES = {
 "ribera": dict(n="Centro Ribera", s="Consultorio de kinesiología", bg="#0e2f3b", acc="#ff6a4d", photo="ribera-sala.webp", img=("ex-ribera-d.webp", 1100, 4833, "ex-ribera-m.webp", 390, 6954), href="centro-ribera/index.html",
                b=["Quien entra elige la zona que le molesta y pide turno", "Servicios, turnos y contacto en un recorrido corto", "Igual de claro en el celular"]),
 "barro": dict(n="Barro &amp; Fuego", s="Taller de cerámica", bg="#2b1c14", acc="#e58a5b", photo="ceramica-taller.webp", img=("ex-barro-d.webp", 1100, 2272, "ex-barro-m.webp", 390, 3875), href="ceramica/index.html",
               b=["Muestra las clases, qué incluye y responde las dudas", "Fotografía y tipografía propias del taller", "Igual de cuidado en el celular"]),
}

def ex_panel(rel, key, num="01"):
    d = SITES[key]; di, dw, dh, mi, mw, mh = d["img"]
    bl = "".join("<li>%s</li>" % b for b in d["b"])
    return ('<article class="sc ex-p" data-sc style="--pbg:%s;--pacc:%s"><div class="sc-bg" style="background-image:url(%sassets/img/%s)"></div>%s%s'
            '<div class="ex-in"><div class="ex-copy"><p class="ex-k">Proyecto de muestra · %s</p><h3>%s</h3><p class="ex-s">%s</p><ul>%s</ul>'
            '<a class="ex-open" href="%sdemos/web/%s" target="_blank" rel="noopener">Abrir el sitio completo ↗</a></div>'
            '<div class="ex-art"><div class="ex-d"><div class="bar2" aria-hidden="true"><i></i><i></i><i></i></div><div class="ex-vp"><img src="%sassets/img/%s" width="%d" height="%d" alt="Sitio de %s en escritorio, recorrido de arriba hacia abajo." loading="lazy"></div></div>'
            '<div class="ex-m"><div class="ex-vp"><img src="%sassets/img/%s" width="%d" height="%d" alt="El mismo sitio en el celular." loading="lazy"></div></div></div></div></article>'
            % (d["bg"], d["acc"], rel, d["photo"], CHIP, PP, num, d["n"], d["s"], bl, rel, d["href"], rel, di, dw, dh, d["s"].lower(), rel, mi, mw, mh))

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
