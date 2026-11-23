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
CHIP = ''

def _rail(items, local=False):
    a = "data-lin" if local else "data-in"
    return '<ol class="sc-rail">%s</ol>' % "".join('<li %s="%d" class="rl"><i>%d</i>%s</li>' % (a, k + 1, k + 1, t) for k, t in enumerate(items))

def _foot(items, local=False):
    return '<div class="sc-foot">%s%s</div>' % (_rail(items, local), PP)

# ------------------------------------------------------------ GrowiApp: una venta y todo lo que mueve (mismas cifras que Café Nogal)
# Estado de origen: semilla de assets/sandbox/cafeteria.data.js + la venta guía (2 × Flat white + 1 × Medialuna = $9.500, cobrada en efectivo).
#   Efectivo esperado en caja $74.700 → $84.200 · Ventas del turno $142.400 → $151.900 · Medialuna 13 → 12 u. (apertura 31, mínimo 12) · Tostado J&Q 9 u. (apertura 10)
#   Por medio de pago tras la venta: efectivo $70.700, transferencia $48.300, Mercado Pago $32.900.
# pruebas/coherencia-escenas.test.mjs verifica estas cifras contra la sandbox real, leyendo la página generada.
def scene_app(rel):
    pos = ('<div class="ap-pos" data-in="1"><p class="k">Mostrador · nueva venta</p><ul><li data-in="1" style="--d:.15s"><span>2 × Flat white</span><b>$7.800</b></li>'
           '<li data-in="1" style="--d:.45s"><span>1 × Medialuna</span><b>$1.700</b></li></ul>'
           '<div class="tot"><span>Total</span><b>$9.500</b></div><div class="pay"><span>Efectivo</span><span class="paid rl" data-in="2">✓ Cobrado</span></div></div>')
    caja = ('<div class="tile caja"><p class="k">Efectivo esperado en caja</p><b class="big" data-num="74700|84200|ars|2">$74.700</b>'
            '<span class="chip-d" data-in="2" style="--d:.2s">+ $9.500</span></div>')
    stack = ('<div class="ap-st" aria-hidden="true" style="display:flex;gap:2px;height:14px;margin-top:12px;border-radius:7px;overflow:hidden"><i style="flex:70700;background:#43c98a"></i><i style="flex:48300;background:#8f7a66"></i><i style="flex:32900;background:#e0a800"></i></div>'
             '<p style="margin:8px 0 0;font-size:12px;line-height:1.35;opacity:.85">Efectivo $70.700 · Transferencia $48.300 · Mercado Pago $32.900</p>')
    vta = ('<div class="tile vta rl" data-in="3"><p class="k">Ventas del turno</p><b class="big" data-num="142400|151900|ars|3">$142.400</b>%s</div>' % stack)
    stk = ('<div class="tile stk rl" data-in="3"><p class="k">Stock</p>'
           '<div class="r"><span>Medialuna</span><b><span data-num="13|12|n|3">13</span> u.</b><div class="pbar"><i style="--w1:42%;--w2:39%"></i></div></div>'
           '<div class="r"><span>Tostado J&amp;Q</span><b>9 u.</b><div class="pbar"><i style="--w1:90%;--w2:90%"></i></div></div></div>')
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
               '<div class="fx-n n3 rl" data-in="3"><p class="fx-k"><i>3</i>Posible automatización</p><div class="fx-c aut"><p class="fx-gh">%s</p><ul>%s</ul></div></div>'
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

CB_AG_CSS = ('<style>'
    '.cb-ag{background:#f3f6f7;display:flex;flex-direction:column;color:#10242c}'
    '.cb-ag .ag-h{padding:14px 14px 10px;background:#0e2f3b;color:#fff}.cb-ag .ag-h b{display:block;font-size:15px}.cb-ag .ag-h small{opacity:.8;font-size:12px}'
    '.cb-ag .ag-l{list-style:none;margin:0;padding:10px 10px 0;display:grid;gap:7px}'
    '.cb-ag .ag-l li{display:grid;grid-template-columns:44px 1fr auto;align-items:center;gap:8px;padding:8px 10px;border-radius:10px;background:#fff;border:1px solid #dfe6e9}'
    '.cb-ag .ag-l time{font:600 12px var(--mono,monospace);color:#52666e}.cb-ag .ag-l span{display:grid;font-size:11.5px;line-height:1.25;color:#52666e}.cb-ag .ag-l b{font-size:13.5px;color:#10242c}'
    '.cb-ag .ag-l li.nw{border:2px solid #1a6b47;background:#f1f8f4}.cb-ag .ag-l em{font:700 10px var(--epi,sans-serif);font-style:normal;padding:2px 7px;border-radius:999px;background:#1a6b47;color:#fff}'
    '.cb-ag .ag-r{margin:10px;padding:10px 12px;border-radius:12px;background:#fff;border-left:5px solid #e0a800;box-shadow:0 10px 22px -14px rgba(0,0,0,.5)}'
    '.cb-ag .ag-r small{display:block;font:600 10px var(--mono,monospace);letter-spacing:.05em;text-transform:uppercase;color:#52666e}.cb-ag .ag-r b{display:block;margin-top:4px;font-size:13.5px}.cb-ag .ag-r b.px{font-size:18px}'
    '.sc[data-lb="4"] .cb-ag .nw{animation:pop .6s var(--ease) .5s both}.sc[data-lb="4"] .cb-ag .ag-r{animation:pop .6s var(--ease) 1.1s both}'
    '</style>')

def scene_combo(rel):
    steps = "".join('<li class="cb-s%s rl" data-lin="%d"><i>%d</i><div><b>%s</b><span>%s</span></div></li>' % (" hum" if k == 2 else "", k + 1, k + 1, t, d) for k, (t, d) in enumerate(COMBO_PASOS))
    s1 = ('<div class="cb-sc s1 rl" data-lin="1"><img src="%sassets/img/ribera-m.webp" width="390" height="800" alt="Sitio de muestra de Centro Ribera en el celular: el paciente elige la zona que le molesta." loading="lazy">'
          '<span class="cb-act">Pedir turno</span></div>' % rel)
    s2 = ('<div class="cb-sc s2 rl" data-lin="2"><div class="wa-h"><i>CR</i><div><b>Centro Ribera</b><small>WhatsApp</small></div></div><div class="wa-b">'
          '<div class="wa-m out">Hola, quiero turno para el sábado a la mañana.<small>10:42</small></div>'
          '<div class="wa-m in">¡Hola! Te esperamos el sábado a las 11:15.<small>10:51</small></div>'
          '<p class="wa-tag">%s Una persona del centro responde y lo carga</p></div></div>' % _svg('<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-4 3.5-6 7-6s6.2 2 7 6"/>', ""))
    # Agenda de Centro Ribera (kinesiología). Es una ilustración: la persona del centro cargó el turno a mano; no hay conexión automática con el sitio.
    s4 = ('<div class="cb-sc s4 rl cb-ag" data-lin="4" role="img" aria-label="Agenda de Centro Ribera en el celular: el sábado figura Julián a las 11:15, primera consulta, y la consulta inicial de $21.000 queda registrada.">'
          '<div class="ag-h" aria-hidden="true"><b>Centro Ribera</b><small>Agenda · sábado</small></div>'
          '<ul class="ag-l" aria-hidden="true">'
          '<li><time>09:30</time><span><b>Marta</b>Control</span></li>'
          '<li><time>10:15</time><span><b>Hernán</b>Rehabilitación de rodilla</span></li>'
          '<li class="nw"><time>11:15</time><span><b>Julián</b>Primera consulta</span><em>Nuevo</em></li>'
          '<li><time>12:00</time><span><b>Lucía</b>Sesión de espalda</span></li></ul>'
          '<div class="ag-r" aria-hidden="true"><small>Registro administrativo</small><b>Consulta inicial · Julián</b><b class="px">$21.000</b></div></div>')
    return (CB_AG_CSS + '<div class="sc sc-combo" data-sc data-beats="4" data-ms="3000" data-hold="3600" data-static="4"><div class="sc-bg" style="background-image:url(%sassets/img/ribera-sala.webp)"></div>%s'
            '<div class="sc-st"><div class="cb-g"><div class="cb-stage"><div class="cb-ph">%s%s%s</div></div><ol class="cb-steps">%s</ol></div><div class="sc-foot">%s</div></div></div>'
            % (rel, CHIP, s1, s2, s4, steps, PP))


# ------------------------------------------------------------ Combo (F8.1A): del sitio a la caja, en una sola lámina clara (sin tarjetas oscuras anidadas)
# Ilustración con datos ficticios. El paso 3 lo hace una persona del centro: no hay conexión automática entre el sitio y el sistema.
def combo_duo(rel):
    pasos = "".join('<li%s><i>%d</i><div><b>%s</b><span>%s</span></div></li>' % (' class="hum"' if k == 2 else "", k + 1, t, d) for k, (t, d) in enumerate(COMBO_PASOS))
    chat = ('<div class="cd-chat"><p class="cd-who"><b>Centro Ribera</b><span>WhatsApp</span></p>'
            '<div class="cd-m out">Hola, quiero turno para el sábado a la mañana.<small>10:42</small></div>'
            '<div class="cd-m in">¡Hola! Te esperamos el sábado a las 11:15.<small>10:51</small></div>'
            '<p class="cd-tag">%s Una persona del centro responde y lo carga</p></div>' % _svg('<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-4 3.5-6 7-6s6.2 2 7 6"/>', ""))
    agenda = ('<div class="cb-ag cd-ag" role="img" aria-label="Agenda de Centro Ribera en el celular: el sábado figura Julián a las 11:15, primera consulta, y la consulta inicial de $21.000 queda registrada.">'
              '<div class="ag-h" aria-hidden="true"><b>Centro Ribera</b><small>Agenda · sábado</small></div>'
              '<ul class="ag-l" aria-hidden="true"><li><time>09:30</time><span><b>Marta</b>Control</span></li><li><time>10:15</time><span><b>Hernán</b>Rehabilitación de rodilla</span></li>'
              '<li class="nw"><time>11:15</time><span><b>Julián</b>Primera consulta</span><em>Nuevo</em></li><li><time>12:00</time><span><b>Lucía</b>Sesión de espalda</span></li></ul>'
              '<div class="ag-r" aria-hidden="true"><small>Registro administrativo</small><b>Consulta inicial · Julián</b><b class="px">$21.000</b></div></div>')
    return (CB_AG_CSS + '<div class="cd"><p class="cd-k">Ejemplo ilustrativo · un mismo negocio, Centro Ribera (datos ficticios)</p>'
            '<div class="cd-g"><figure class="cd-f cd-site"><div class="cd-i"><img src="%sassets/img/ribera-m.webp" width="390" height="800" alt="Sitio de muestra de Centro Ribera en el celular: el paciente elige la zona que le molesta." loading="lazy"></div>'
            '<figcaption><b>Su sitio</b><span>GrowiWeb</span></figcaption></figure>%s'
            '<figure class="cd-f cd-gest">%s<figcaption><b>Su gestión</b><span>GrowiApp</span></figcaption></figure></div>'
            '<ol class="cd-s">%s</ol></div>' % (rel, chat, agenda, pasos))

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
        '<p class="k">Nos casamos</p><div class="arch"><i class="sun"></i><i class="h1"></i><i class="h2"></i></div><h4 role="presentation">Lucía <em>&amp;</em> Tomás</h4><p class="d">Sábado 20 de marzo de 2027</p><p class="p">Capilla · 17:00</p>',
        "El día", [("17:00", "Ceremonia"), ("19:00", "Cóctel"), ("20:00", "Cena y baile")], "Capilla", "Confirmar asistencia")
    b = _iv_world("b", 3,
        '<i class="ht"></i><i class="bl l1"></i><i class="bl l2"></i><i class="bl l3"></i><p class="k">Estás invitado</p><div class="num"><span>3</span><span>0</span></div><h4 role="presentation">Los 30 de Mica</h4><p class="d">Sábado 14 de agosto · 21:00</p><p class="p">Terraza</p><div class="st">¡Venite!</div>'
        '<div class="tk t1" aria-hidden="true"><span>Los 30 de Mica · 14.08 · Los 30 de Mica · 14.08 · Los 30 de Mica · 14.08</span></div><div class="tk t2" aria-hidden="true"><span>14.08 · Los 30 de Mica · 14.08 · Los 30 de Mica · 14.08 · Los 30 de Mica</span></div>',
        "La noche", [("21:00", "Brindis"), ("22:00", "Cena"), ("00:00", "Torta y baile")], "Terraza", "Confirmar asistencia")
    c = _iv_world("c", 6,
        '<p class="k">Cena anual</p><h4 role="presentation">Fin de año<br>2027</h4><div class="ln"></div><p class="d">Jueves 9 de diciembre · 20:30</p><p class="p">Salón</p>',
        "Programa", [("20:30", "Recepción"), ("21:15", "Palabras de apertura"), ("22:00", "Cena")], "Salón", "Confirmar asistencia")
    bgs = "".join('<div class="iv-bg %s rl" data-in="%d-%d"></div>' % (k, a, a + 2) for k, a in (("w", 1), ("b", 4), ("c", 7)))
    names = [("w", "Casamiento", "Ceremonia, cóctel, cena y baile", 1), ("b", "Cumpleaños", "Brindis, cena, torta y baile", 4), ("c", "Empresa", "Recepción, palabras y cena", 7)]
    idx = "".join('<li class="rl" data-in="%d-%d"><b>%s</b><span>%s</span></li>' % (a, a + 2, n, t) for k, n, t, a in names)
    caps = ('<div class="iv-cp rl" data-lin="1"><b>La portada</b><span>Nombres, fecha y lugar, con el estilo de cada evento.</span></div>'
            '<div class="iv-cp rl" data-lin="2"><b>Programa y ubicación</b><span>Horarios y mapa en una sola página, que se comparte con un enlace.</span></div>'
            '<div class="iv-cp rl" data-lin="3"><b>Confirman por WhatsApp</b><span>Cada invitado toca el botón y avisa si va.</span><p class="iv-wa">Confirmo asistencia, somos 2.<small>Mensaje que llega a tu WhatsApp</small></p></div>')
    return ('<div class="sc sc-inv" data-sc data-beats="9" data-cycle="3" data-ms="2700" data-hold="3800" data-static="3">%s%s'
            '<div class="sc-st"><div class="iv-gr"><ul class="iv-idx">%s</ul><div class="iv-stage"><div class="iv-ph"><i class="iv-notch"></i>%s%s%s</div></div><div class="iv-caps">%s</div></div><div class="sc-foot">%s</div></div></div>'
            % (bgs, CHIP, idx, w, b, c, caps, PP))

# ------------------------------------------------------------ Home: hero «Te encuentran → Te consultan → Lo organizás» (F8.3B)
# Ilustración con datos ficticios. Causalidad real: el sitio lleva a una consulta por WhatsApp, una persona del centro responde y el turno lo anota
# una persona en su agenda con un botón. No hay cobros, caja ni automatizaciones. El estado lo maneja growi36.js (módulo data-hs).
HS_PASOS = [("Te encuentran", "Una persona encuentra tu sitio y toca «Pedir turno»."), ("Te consultan", "Te escribe por WhatsApp con su consulta."),
            ("Lo organizás", "Vos respondés, acordás el horario y lo anotás en tu agenda.")]

def scene_hero(rel):
    pasos = "".join('<li><button type="button" class="hs-st" data-hs-s="%d"%s><span class="hs-n" aria-hidden="true">%d</span>%s</button></li>'
                    % (i + 1, ' aria-current="step"' if i == 0 else "", i + 1, n) for i, (n, _) in enumerate(HS_PASOS))
    sitio = ('<div class="hs-scr hs-site on" data-hs-site><img src="%sassets/img/ribera-m.webp" width="390" height="800" decoding="async" '
             'alt="Sitio de muestra de Centro Ribera: la persona elige la zona que le molesta y está marcada la rodilla.">'
             '<div class="hs-pad"><small>Zona elegida: rodilla</small><button type="button" class="hs-cta" data-hs-cta1>Pedir turno por rodilla</button></div></div>' % rel)
    chat = ('<div class="hs-scr hs-chat" data-hs-chat><div class="hs-wh"><i aria-hidden="true">CR</i><div><b>Centro Ribera</b><small>WhatsApp</small></div></div>'
            '<div class="hs-msgs"><div class="hs-m out">Hola, quiero turno para el sábado a la mañana. Me molesta la rodilla al correr.<small>10:42</small></div>'
            '<div class="hs-m in r"><span class="hs-by">Responde una persona del centro</span>Hola, Julián. Tenemos el sábado a las 11:15. ¿Te lo reservamos?<small>10:48</small></div>'
            '<div class="hs-m out r">Sí, dale.<small>10:49</small></div></div></div>')
    agenda = ('<div class="hs-agp" data-hs-agp><p class="hs-l">Agenda del centro · sábado</p>'
              '<ul class="hs-slots"><li><time>10:30</time><span class="lib">Libre</span></li><li class="me" data-hs-slot><time>11:15</time><span class="lib" data-hs-slotx>Libre</span></li><li><time>12:00</time><span class="lib">Libre</span></li></ul>'
              '<div class="hs-agf"><button type="button" class="hs-cta dark" data-hs-do>Anotar turno de Julián<i class="hs-tap" aria-hidden="true"></i></button><p data-hs-note>Lo anota una persona del centro.</p></div></div>')
    return ('<div class="hs-w"><section class="hs" data-hs aria-label="Cómo llega un turno a tu agenda. Ejemplo ilustrativo de un centro de kinesiología, con datos ficticios.">'
            '<div class="hs-bg" style="background-image:url(%sassets/img/ribera-sala.webp)" aria-hidden="true"></div>'
            '<div class="hs-hd"><p class="hs-tag">Ejemplo ilustrativo · datos ficticios</p>'
            '<button type="button" class="hs-pp" data-hs-pp aria-label="Pausar animación" hidden><svg class="pa" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg><svg class="pl" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg></button></div>'
            '<ol class="hs-steps" aria-label="Pasos del ejemplo">%s</ol><p class="hs-cap" data-hs-cap aria-live="polite">%s</p>'
            '<div class="hs-board" data-hs-board><div class="hs-dev"><p class="hs-l" data-hs-devl>Sitio de Centro Ribera</p>%s%s</div>%s</div></section></div>'
            % (rel, pasos, HS_PASOS[0][1], sitio, chat, agenda))

# ------------------------------------------------------------ GrowiWeb: exhibición de proyectos completos
# y de cada capítulo en la captura de página completa (px de la captura) y alto total, para dirigir la cámara por secciones
SITES = {
 "ribera": dict(n="Centro Ribera", s="Consultorio de kinesiología", bg="#0e2f3b", acc="#ff6a4d", photo="ribera-sala.webp", href="centro-ribera/index.html",
                d=("ex-ribera-d.webp", 1085, 5560, [0, 905, 2854, 4730]), m=("ex-ribera-m.webp", 375, 6606, [0, 1246, 2624, 5373]),
                ch=[("Entrada", "Quien llega elige la zona que le molesta y pide turno."), ("Cómo trabajan", "Cuenta cómo es la consulta antes de pedirla."),
                    ("Servicios", "Lo que hacen, claro y a mano."), ("Cierre", "Invita a elegir un horario que le quede cómodo.")]),
 "barro": dict(n="Barro &amp; Fuego", s="Taller de cerámica", bg="#2b1c14", acc="#e58a5b", photo="ceramica-taller.webp", href="ceramica/index.html",
               d=("ex-barro-d.webp", 1085, 3107, [0, 720, 1250, 1840]), m=("ex-barro-m.webp", 375, 4161, [0, 940, 1770, 2720]),
               ch=[("Entrada", "Una primera pieza, en cuatro clases."), ("Las clases", "Qué se hace en cada una."),
                   ("Qué incluye", "Todo lo que incluye, a la vista."), ("Preguntas", "Responde las dudas antes de consultar.")]),
}

def _ys(h, ys):
    return ";".join("--y%d:%.3f%%" % (i + 1, y * 100.0 / h) for i, y in enumerate(ys))

def ex_panel(rel, key, num="01"):
    d = SITES[key]; di, dw, dh, dy = d["d"]; mi, mw, mh, my = d["m"]
    ch = "".join('<li class="rl" data-lin="%d"><i>%d</i><div><b>%s</b><span>%s</span></div></li>' % (k + 1, k + 1, t, x) for k, (t, x) in enumerate(d["ch"]))
    return ('<article class="sc ex-p" data-sc data-beats="4" data-ms="3300" data-hold="3600" data-static="1" style="--pbg:%s;--pacc:%s"><div class="sc-bg" style="background-image:url(%sassets/img/%s)"></div>%s%s'
            '<div class="ex-in"><div class="ex-copy"><p class="ex-k">Sitio de muestra</p><h3>%s</h3><p class="ex-s">%s</p><ol class="ex-ch">%s</ol>'
            '<a class="ex-open" href="%sdemos/web/%s" target="_blank" rel="noopener">Abrir el sitio completo ↗</a></div>'
            '<div class="ex-art"><div class="ex-d"><div class="bar2" aria-hidden="true"><i></i><i></i><i></i></div><div class="ex-vp"><img src="%sassets/img/%s" width="%d" height="%d" style="%s" alt="Sitio de %s en escritorio, recorrido por secciones." loading="lazy"></div></div>'
            '<div class="ex-m"><div class="ex-vp"><img src="%sassets/img/%s" width="%d" height="%d" style="%s" alt="El mismo sitio en el celular." loading="lazy"></div></div>'
            '<p class="ex-now" aria-hidden="true">%s</p></div></div></article>'
            % (d["bg"], d["acc"], rel, d["photo"], CHIP, PP, d["n"], d["s"], ch, rel, d["href"], rel, di, dw, dh, _ys(dh, dy), d["s"].lower(), rel, mi, mw, mh, _ys(mh, my),
               "".join('<span class="rl" data-lin="%d">%s</span>' % (k + 1, x) for k, (t, x) in enumerate(d["ch"]))))

# ------------------------------------------------------------ bloques de página
def hero36(pg, crumb, h1, sub, ctas, pr, scene, secnav=None):
    return ('<section class="ph36" data-sticky-hide aria-labelledby="h1"><div class="w">%s<div class="ph36-top"><h1 id="h1">%s</h1><div class="ph36-side"><p class="sub">%s</p><div class="cta-row">%s</div>%s</div></div>'
            '<div id="demo" class="ph36-scene">%s</div></div></section>\n' % (crumb, h1, sub, ctas, ('<p class="ph36-pr">%s</p>' % pr) if pr else "", scene))

L1_PRECIOS_36 = ("Precios en USD; el valor en pesos es orientativo y se actualiza con el dólar oficial (venta). "
                 "Dominio, alojamiento y costos de terceros (comisiones de medios de pago, mensajes de WhatsApp) se cotizan aparte cuando correspondan. Lo «desde» y lo a medida se confirman en un presupuesto por escrito antes de empezar.")

def caso4(rel, link):
    return ('<section class="caso4" id="caso" aria-labelledby="h-caso"><div class="w"><div class="caso4-in"><figure class="caso4-logo" style="margin:0"><img src="%sassets/img/colocafe-logo.png" alt="Logo de Colo Café" width="120" height="120" loading="lazy"></figure>'
            '<div><p class="eyebrow">Caso real</p><h2 id="h-caso">Colo Café</h2><p class="l">Sistema de gestión armado para su cafetería: caja, comandas, stock y gastos.</p><a class="tl" href="%s" data-track="caso-colocafe-ver">Ver GrowiApp para cafeterías →</a></div>'
            '<div class="q"><blockquote>«Necesitábamos ordenar ventas, reservas y caja sin depender de planillas. Growi nos ayudó a tener una operación más clara y fácil de seguir.»</blockquote><p class="cite">Rodrigo, dueño de Colo Café</p></div></div></div></section>\n' % (rel, link))
