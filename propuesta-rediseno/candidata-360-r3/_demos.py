# Demostraciones reutilizables: GrowiFlow (causalidad), Combo (recorrido de un mismo negocio), GrowiWeb (sitio de muestra), caso Colo Café.
from _lib import *

# ------------------------------------------------------------ GrowiFlow: de la tarea al beneficio
FLOW_SC = {
 "turnos": dict(n="Avisar los turnos", tarea="Cada día mirás la agenda y avisás uno por uno a quien tiene turno mañana.",
                disp=("Todos los días, 9:00", "Mañana hay 3 turnos en la agenda"),
                pasos=["Lee la agenda de mañana", "Arma un aviso por cada turno", "Lo envía a cada cliente"],
                res="msg", benef="Menos turnos perdidos por olvido, y vos atendiendo en lugar de escribir."),
 "pedidos": dict(n="Ordenar las consultas", tarea="Te llegan consultas por todos lados y las anotás a mano en una planilla.",
                 disp=("Cuando alguien completa el formulario", "Julián pide turno para el sábado"),
                 pasos=["Agrega una fila a tu planilla", "Le pone estado «Nueva»", "Te avisa que hay algo para responder"],
                 res="sheet", benef="Las consultas del formulario quedan en un solo lugar, listas para responder."),
 "reportes": dict(n="Armar el resumen", tarea="Cada viernes sumás ventas y turnos para saber cómo viene el negocio.",
                  disp=("Viernes, 18:00", "Cierra la semana"),
                  pasos=["Suma las ventas y los turnos", "Compara con la semana anterior", "Marca lo que conviene mirar"],
                  res="resumen", benef="Sabés cómo viene el negocio sin sentarte a sacar cuentas."),
}
_CLOCK = '<svg class="fd-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
_BOLT = '<svg class="fd-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 3L5 14h6l-1 7 8-11h-6z"/></svg>'

def _res(kind):
    if kind == "msg":
        return ('<div class="fd-card fd-phone"><p class="fd-k">Lo que recibe tu cliente</p><div class="fd-bub"><b>Hola Julián</b>, te recordamos tu turno de mañana: sábado a las 11:15 en Centro Ribera.</div>'
                '<p class="fd-note">El canal (mail o WhatsApp) se define al armarlo.</p></div>')
    if kind == "sheet":
        return ('<div class="fd-card"><p class="fd-k">Lo que ves en tu planilla</p><div class="fd-sheet"><span class="h">Quién</span><span class="h">Qué</span><span class="h">Estado</span>'
                '<span>Marta</span><span>Control</span><span>Atendida</span><span class="new">Julián</span><span class="new">Turno sábado</span><span class="new"><i>Nueva</i></span></div>'
                '<p class="fd-note">Y un aviso para que no se te pase.</p></div>')
    return ('<div class="fd-card"><p class="fd-k">Lo que te llega</p><div class="fd-sum"><b>Resumen de la semana</b><ul><li>12 turnos · 1 ausencia</li><li>Lo más pedido: <mark>Control</mark></li><li>Bajaron los turnos de los martes</li></ul></div>'
            '<p class="fd-note">Datos de ejemplo.</p></div>')

def flow_demo(compact=False):
    pick = "".join('<label class="fd-chip"><input type="radio" name="fdsc%s" value="%s"%s><span>%s</span></label>' % ("c" if compact else "", k, " checked" if i == 0 else "", v["n"]) for i, (k, v) in enumerate(FLOW_SC.items()))
    scs = ""
    for i, (k, v) in enumerate(FLOW_SC.items()):
        pasos = "".join('<li data-p="%d">%s</li>' % (j + 1, E(t)) for j, t in enumerate(v["pasos"]))
        scs += ('<div class="fd-sc" data-sc="%s"%s><div class="fd-stage">'
                '<div class="fd-col fd-1" data-b="1" data-dim="3"><p class="fd-h">%s Hoy lo hacés a mano</p><div class="fd-card fd-task"><p>%s</p></div></div>'
                '<div class="fd-link" data-b="2" aria-hidden="true"><i></i></div>'
                '<div class="fd-col fd-2" data-b="2"><p class="fd-h">%s Se dispara solo</p><div class="fd-card fd-trig"><b>%s</b><span>%s</span></div>'
                '<div class="fd-card fd-proc" data-b="3"><p class="fd-k">Y GrowiFlow lo hace sin que intervengas</p><ol>%s</ol></div></div>'
                '<div class="fd-link" data-b="4" aria-hidden="true"><i></i></div>'
                '<div class="fd-col fd-3" data-b="4">%s</div></div>'
                '<p class="fd-benef" data-b="5"><b>Lo que ganás</b>%s</p></div>'
                % (k, "" if i == 0 else " hidden", _CLOCK, E(v["tarea"]), _BOLT, E(v["disp"][0]), E(v["disp"][1]), pasos, _res(v["res"]), E(v["benef"])))
    return ('<div class="fd%s" data-fd data-beats="5" data-ms="1900"><div class="fd-top"><div class="fd-pick" role="radiogroup" aria-label="Tarea a automatizar">%s</div>'
            '<span class="fd-sim">Simulación · datos ficticios</span></div>%s'
            '<div class="fd-ctl"><button type="button" class="btn k sm" data-play>Ver cómo funciona</button><p class="fd-beat" aria-live="off" data-beat-label></p></div></div>'
            % (" is-compact" if compact else "", pick, scs))

# ------------------------------------------------------------ Combo: un mismo negocio, del sitio a la caja
def combo_journey(rel):
    return ('<div class="cj" data-fd data-beats="4" data-ms="2100"><div class="fd-top"><p class="cj-biz">Un mismo negocio: <b>Centro Ribera</b>, un centro de kinesiología</p><span class="fd-sim">Demostración · datos ficticios</span></div>'
            '<div class="cj-stage">'
            '<figure class="cj-s" data-b="1"><div class="cj-win"><i></i><i></i><i></i><span>Su sitio · GrowiWeb</span></div><div class="cj-img"><img src="%sassets/img/ribera-d.webp" width="1000" height="625" alt="Sitio de muestra de Centro Ribera con el botón Pedir turno." loading="lazy"><span class="ring" aria-hidden="true"></span></div><figcaption><b>1.</b> Un paciente encuentra el sitio y toca «Pedir turno».</figcaption></figure>'
            '<div class="cj-bridge" data-b="2"><span class="cj-pill">WhatsApp</span><div class="cj-msg">Hola, quiero turno para el sábado a la mañana.</div><p><b>2.</b> La consulta llega por WhatsApp, como hoy. Es el puente entre el sitio y la gestión.</p></div>'
            '<figure class="cj-s" data-b="3"><div class="cj-win"><i></i><i></i><i></i><span>Su gestión · GrowiApp</span></div><div class="cj-img"><img src="%sassets/img/combo-app.webp" width="1000" height="567" alt="Panel de GrowiApp con el negocio de muestra Centro Ribera." loading="lazy">'
            '<div class="cj-card c3" data-b="3"><small>Agenda · sábado 11:15</small><b>Julián · Primera consulta</b></div><div class="cj-card c4" data-b="4"><small>Venta registrada</small><b>Consulta inicial · %s</b></div></div>'
            '<figcaption><b>3.</b> El centro la carga en la agenda. <b data-b="4">4.</b> <span data-b="4">Se atiende, registra la venta y el cierre de caja se arma solo.</span></figcaption></figure></div>'
            '<div class="fd-ctl"><button type="button" class="btn k sm" data-play>Ver el recorrido</button><p class="fd-beat" aria-live="off" data-beat-label></p></div></div>'
            % (rel, rel, "$21.000"))

# ------------------------------------------------------------ GrowiWeb: sitio de muestra
def web_stage(rel):
    return ('<div class="wprev" data-wprev><div class="wp-tools"><div class="seg" role="group" aria-label="Sitio de muestra"><button type="button" class="active" data-demo="centro-ribera" aria-pressed="true">Centro Ribera · consultorio</button><button type="button" data-demo="ceramica" aria-pressed="false">Taller de cerámica</button></div>'
            '<div class="seg" role="group" aria-label="Dispositivo"><button type="button" class="active" data-dev="d" aria-pressed="true">Escritorio</button><button type="button" data-dev="m" aria-pressed="false">Celular</button></div>'
            '<a class="btn k sm wp-open" data-open href="%sdemos/web/centro-ribera/index.html" target="_blank" rel="noopener">Abrir la demo completa ↗</a></div>'
            '<div class="wp-view"><div class="wp-scale"><iframe title="Sitio de muestra de Growi (contenido ficticio)" data-base="%sdemos/web/" data-src="%sdemos/web/centro-ribera/index.html" width="1280" height="820"></iframe></div></div>'
            '<p class="cap">Sitio de muestra con contenido ficticio. Elegí una zona del cuerpo, pedí un turno y recorré las secciones.</p></div>' % (rel, rel, rel))

# ------------------------------------------------------------ Invitaciones: demos en marco propio (iframe con los recursos reales)
def inv_frame(rel, vista, titulo, alto):
    return ('<div class="invf"><iframe class="invdemo" src="%sdemos/invitaciones.html?v=%s" title="%s" height="%s" loading="lazy" data-inv-h></iframe></div>' % (rel, vista, E(titulo), alto))

# ------------------------------------------------------------ Caso real autorizado: Colo Café
def caso_cafe(rel, link):
    return ('<section class="sec caso3" id="caso" aria-labelledby="h-caso"><div class="w caso3-g"><figure class="caso3-logo"><img src="%sassets/img/colocafe-logo.png" alt="Logo de Colo Café" width="120" height="120" loading="lazy"></figure>'
            '<div><p class="eyebrow">Caso real</p><h2 id="h-caso">Colo Café</h2><p class="lead">Sistema de gestión armado para su cafetería: caja, comandas, stock y gastos.</p>'
            '<div class="chips" aria-label="Qué se armó"><span>Caja</span><span>Comandas</span><span>Stock</span><span>Gastos</span></div><blockquote>«Necesitábamos ordenar ventas, reservas y caja sin depender de planillas. Growi nos ayudó a tener una operación más clara y fácil de seguir.»</blockquote><p class="cite">Rodrigo, dueño de Colo Café</p>'
            '<p style="margin-top:22px"><a class="btn k sm" href="%s" data-track="caso-colocafe-ver">Ver GrowiApp para cafeterías →</a></p></div></div></section>\n' % (rel, link))
