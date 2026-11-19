# R3.3: demostraciones autónomas (nivel principal) con exploración funcional como nivel secundario.
# GrowiFlow y Combo como historias; GrowiApp y GrowiWeb como recorridos sobre la interfaz y los sitios reales.
from _lib import *

def _ic(d, cls="mg-ic"):
    return '<svg class="%s" viewBox="0 0 24 24" aria-hidden="true">%s</svg>' % (cls, d)
I_PERSON = _ic('<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-4 3.5-6 7-6s6.2 2 7 6"/>')
I_BOLT = _ic('<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>')
I_CHECK = _ic('<path d="M5 12.5l4.5 4.5L19 7.5"/>')
I_CLOCK = _ic('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')
I_CHAT = _ic('<path d="M4 5h16v11H9l-5 4z"/>')

def _controls(dots):
    ds = "".join('<button type="button" data-dot="%d" aria-label="Ir al paso %d"><i></i></button>' % (i + 1, i + 1) for i in range(dots))
    return ('<div class="mg-ctl" data-mg-ctl><div class="mg-dots">%s</div><button type="button" class="mg-pp" data-mg-pp data-state="pause" aria-label="Pausar"></button></div>' % ds)

# ------------------------------------------------------------ GrowiFlow: de la tarea al resultado, en cuatro tiempos
FLOW_HUM = {"turnos": "Si un cliente responde, lo atendés vos.", "pedidos": "Cada consulta la respondés vos.", "reportes": "Qué hacer con los datos lo decidís vos."}
FLOW_CAPS = ["Hoy, una persona lo hace a mano.", "GrowiFlow detecta cuándo corresponde y arranca solo.", "Ejecuta los pasos que nadie tiene que repetir.", "El negocio recibe el resultado. Las decisiones siguen siendo tuyas."]

def _flow_res(kind):
    from _demos import _res
    return _res(kind)

def flow_demo(compact=False):
    from _demos import FLOW_SC
    nm = "fdsc" + ("c" if compact else "")
    pick = "".join('<label class="mg-chip"><input type="radio" name="%s" value="%s"%s><span>%s</span></label>' % (nm, k, " checked" if i == 0 else "", v["n"]) for i, (k, v) in enumerate(FLOW_SC.items()))
    scs = ""
    for i, (k, v) in enumerate(FLOW_SC.items()):
        pasos = "".join('<li>%s%s</li>' % (I_CHECK, E(t)) for t in v["pasos"])
        scs += ('<div class="mg-sc fl-row" data-sc="%s"%s>'
                '<div class="fl-c fl-1" data-b="1"><p class="fl-h"><span class="fl-n">1</span>Hoy, a mano</p><div class="fl-card fl-task">%s<p>%s</p></div></div>'
                '<div class="fl-ar" data-b="2" aria-hidden="true"><i></i></div>'
                '<div class="fl-c fl-2" data-b="2"><p class="fl-h"><span class="fl-n">2</span>Se dispara solo</p><div class="fl-card fl-trig">%s<b>%s</b><span>%s</span></div></div>'
                '<div class="fl-ar" data-b="3" aria-hidden="true"><i></i></div>'
                '<div class="fl-c fl-3" data-b="3"><p class="fl-h"><span class="fl-n">3</span>Lo que ejecuta</p><div class="fl-card fl-proc"><ol>%s</ol></div></div>'
                '<div class="fl-ar" data-b="4" aria-hidden="true"><i></i></div>'
                '<div class="fl-c fl-4" data-b="4"><p class="fl-h"><span class="fl-n">4</span>Lo que recibe el negocio</p>%s</div>'
                '<div class="fl-end" data-b="4"><p class="fl-hum">%s%s</p><p class="fl-benef">%s</p></div></div>'
                % (k, "" if i == 0 else " hidden", I_PERSON, E(v["tarea"]), I_BOLT, E(v["disp"][0]), E(v["disp"][1]), pasos, _flow_res(v["res"]), I_PERSON, E(FLOW_HUM[k]), E(v["benef"])))
    caps = "".join('<p data-cap-b="%d">%s</p>' % (i + 1, E(c)) for i, c in enumerate(FLOW_CAPS))
    alt = "".join("<li>%s</li>" % E(c) for c in FLOW_CAPS)
    return ('<div class="mg fl3%s" data-mg data-beats="4" data-ms="2700"><div class="mg-top"><span class="mg-tag">Simulación · datos ficticios</span><div class="mg-pick" data-mg-pick role="radiogroup" aria-label="Ejemplo a mostrar"><span>Otros ejemplos</span>%s</div></div>'
            '<div class="mg-scenes">%s</div><div class="mg-bar"><div class="mg-caps" aria-live="off">%s</div>%s<span class="mg-prog" aria-hidden="true"><i data-mg-bar></i></span></div>'
            '<ol class="mg-steps">%s</ol></div>'
            % (" is-compact" if compact else "", pick, scs, caps, _controls(4), alt))

# ------------------------------------------------------------ Combo: del sitio a la gestión, con la intervención humana a la vista
CJ_CAPS = ["Un paciente entra al sitio, elige la zona que le molesta y pide turno.", "La consulta llega por WhatsApp, como hoy.",
           "Una persona del centro la lee, confirma el horario y lo carga: este paso es humano.", "El turno queda en la agenda de GrowiApp.", "Se atiende, se registra la venta y la caja se arma sola."]

def combo_journey(rel):
    caps = "".join('<p data-cap-b="%d">%s</p>' % (i + 1, E(c)) for i, c in enumerate(CJ_CAPS))
    alt = "".join("<li>%s</li>" % E(c) for c in CJ_CAPS)
    return ('<div class="mg cj3" data-mg data-beats="5" data-ms="2700" style="--bg:url(%sassets/img/ribera-sala.webp)"><div class="mg-top"><span class="mg-tag">Demostración · datos ficticios</span><span class="cj3-biz">Un mismo negocio: <b>Centro Ribera</b>, kinesiología</span></div>'
            '<div class="mg-scenes cj3-stage">'
            '<figure class="cj3-s cj3-web" data-b="1"><p class="cj3-tag">1 · Su sitio · GrowiWeb</p><div class="cj3-phone"><img src="%sassets/img/ribera-m.webp" width="390" height="800" alt="Sitio de muestra de Centro Ribera en el celular: el paciente elige la zona que le molesta." loading="lazy"></div></figure>'
            '<div class="fl-ar cj3-ar" data-b="2" aria-hidden="true"><i></i></div>'
            '<div class="cj3-mid"><div class="cj3-wa" data-b="2"><p class="cj3-tag">2 · Llega por WhatsApp</p><div class="cj3-msg"><span>Paciente</span>Hola, quiero turno para el sábado a la mañana.</div></div>'
            '<div class="cj3-hum" data-b="3"><p class="cj3-tag">3 · Interviene una persona</p><div class="cj3-card">%s<p><b>Alguien del centro</b> lee la consulta, confirma el horario y lo carga.</p></div></div></div>'
            '<div class="fl-ar cj3-ar" data-b="4" aria-hidden="true"><i></i></div>'
            '<figure class="cj3-s cj3-app" data-b="4" data-bn="4 5"><p class="cj3-tag">4 · Su gestión · GrowiApp</p><div class="cj3-phone"><img src="%sassets/img/combo-app-m.webp" width="390" height="688" alt="Panel de GrowiApp en el celular con el negocio de muestra Centro Ribera." loading="lazy"></div>'
            '<div class="cj3-chips"><div class="cj3-chip" data-b="4"><small>Agenda · sábado 11:15</small><b>Julián · Primera consulta</b></div><div class="cj3-chip" data-b="5"><small>Venta registrada</small><b>Consulta inicial · $21.000</b></div></div></figure>'
            '</div><div class="mg-bar"><div class="mg-caps" aria-live="off">%s</div>%s<span class="mg-prog" aria-hidden="true"><i data-mg-bar></i></span></div><ol class="mg-steps">%s</ol></div>'
            % (rel, rel, I_PERSON, rel, caps, _controls(5), alt))

# ------------------------------------------------------------ GrowiApp: causa y efecto de una venta (simulación con datos de ejemplo, cifras consistentes)
# Venta: 2 flat white x $3.900 + 1 medialuna x $1.700 = $9.500. Caja y reportes parten de las cifras de la demo real (ingresos $184.500, saldo $147.600, 47 operaciones).
AP_CAPS = ["Se registra una venta en el mostrador.", "El dinero entra a la caja del día.", "Baja el stock de lo que se vendió.", "Los reportes se actualizan.", "Una sola carga y todo queda al día."]

def _ap(a, b):
    return '<span class="ap-v"><s>%s</s><em>%s</em></span>' % (a, b)

def app_sim(rel="", compact=False):
    def fila(k, v): return '<div class="ap-r"><span>%s</span>%s</div>' % (k, v)
    venta = ('<div class="fl-card ap-card"><div class="ap-r"><span>2 × Flat white</span><b>$7.800</b></div><div class="ap-r"><span>1 × Medialuna</span><b>$1.700</b></div>'
             '<div class="ap-r ap-tot"><span>Total</span><b>$9.500</b></div></div>')
    caja = '<div class="fl-card ap-card">%s%s</div>' % (fila("Ingresos de hoy", _ap("$184.500", "$194.000")), fila("Saldo estimado", _ap("$147.600", "$157.100")))
    stock = '<div class="fl-card ap-card">%s%s</div>' % (fila("Leche entera", _ap("18,0 L", "17,6 L")), fila("Medialunas", _ap("24 u.", "23 u.")))
    rep = '<div class="fl-card ap-card">%s%s</div>' % (fila("Operaciones de hoy", _ap("47", "48")), fila("Flat white vendidos", _ap("31", "33")))
    cols = [("1", "Venta", venta), ("2", "Caja", caja), ("3", "Stock", stock), ("4", "Reportes", rep)]
    row = ""
    for i, (n, t, c) in enumerate(cols):
        if i: row += '<div class="fl-ar" data-b="%d" aria-hidden="true"><i></i></div>' % (i + 1)
        row += '<div class="fl-c" data-b="%d"><p class="fl-h"><span class="fl-n">%s</span>%s</p>%s</div>' % (i + 1, n, t, c)
    row += '<div class="fl-end" data-b="5"><p class="fl-hum">%sVos solo registrás la venta.</p><p class="fl-benef">El cierre de caja deja de ser cuentas al final del día.</p></div>' % I_PERSON
    caps = "".join('<p data-cap-b="%d">%s</p>' % (i + 1, E(c)) for i, c in enumerate(AP_CAPS))
    alt = "".join("<li>%s</li>" % E(c) for c in AP_CAPS)
    return ('<div class="mg ap3%s" data-mg data-beats="5" data-ms="2600"><div class="mg-top"><span class="mg-tag">Simulación · datos de ejemplo</span></div>'
            '<div class="mg-scenes"><div class="fl-row ap-row">%s</div></div><div class="mg-bar"><div class="mg-caps" aria-live="off">%s</div>%s<span class="mg-prog" aria-hidden="true"><i data-mg-bar></i></span></div>'
            '<p class="ap-note">Cómo se conectan las ventas, el stock y la caja se define al armar el sistema.</p><ol class="mg-steps">%s</ol></div>'
            % (" is-compact" if compact else "", row, caps, _controls(5), alt))

# ------------------------------------------------------------ GrowiApp: recorrido de la interfaz real + exploración como modo secundario
APP_RUB = [("cafeteria", "Cafetería"), ("peluqueria", "Peluquería"), ("taller", "Taller"), ("consultorio", "Consultorio")]

def app_tour(rel, rubro="cafeteria", lazy=False):
    src = "%sdemos/app.html%s" % (rel, "" if rubro == "cafeteria" else "?rubro=" + rubro)
    if rubro == "cafeteria": src += "?rubro=cafeteria"
    pr = {"peluqueria": " pr-peluqueria", "taller": " pr-taller"}.get(rubro, "")
    pills = "".join('<button type="button" data-at-rubro="%s" class="%s" aria-pressed="%s">%s</button>' % (k, "on" if k == rubro else "", "true" if k == rubro else "false", n) for k, n in APP_RUB)
    return ('<div class="at" data-apptour><span class="mg-tag at-tag">Demo · datos de ejemplo</span><div class="at-win appwrap%s"><iframe class="appdemo" src="%s" title="Demo de GrowiApp con datos de un negocio de ejemplo" height="640"%s tabindex="-1"></iframe></div>'
            '<div class="at-bar"><p class="at-cap" data-at-cap aria-live="off"></p>'
            '<div class="at-ctl" data-mg-ctl><div class="at-dots mg-dots" data-at-dots></div><button type="button" class="mg-pp" data-mg-pp data-state="pause" aria-label="Pausar"></button></div>'
            '<div class="at-act"><button type="button" class="btn k sm" data-at-explore>Probarla vos mismo</button><button type="button" class="btn k sm at-back" data-at-back>Volver al recorrido</button>'
            '<a class="at-open" href="%s" target="_blank" rel="noopener">Abrir en pantalla completa ↗</a></div>'
            '<div class="at-rub" role="group" aria-label="Rubro de ejemplo"><span>Ver con otro rubro</span>%s</div></div></div>'
            % (pr, src, ' loading="lazy"' if lazy else "", src, pills))

# ------------------------------------------------------------ Invitaciones: la demostración real, con una galería de estilos (casamiento, cumpleaños, empresa) que se recorre sola
def inv_gallery(rel, titulo, alto):
    return ('<div class="ig" data-invg><div class="invf"><iframe class="invdemo" src="%sdemos/invitaciones.html?v=exp" title="%s" height="%s" loading="lazy" data-inv-h></iframe></div>'
            '<div class="ig-pick" data-ig-pick role="group" aria-label="Estilo de invitación"></div>'
            '<div class="ig-ctl" data-mg-ctl><button type="button" class="mg-pp" data-mg-pp data-state="pause" aria-label="Pausar"></button></div></div>' % (rel, E(titulo), alto))

# ------------------------------------------------------------ GrowiWeb: sitios de muestra en composición editorial
WT_SITES = [("centro-ribera", "Centro Ribera", "Consultorio de kinesiología", "demo-web-kinesiologia-d.webp",
             "Sitio de muestra de un consultorio: quien entra elige la zona del cuerpo que le molesta y pide turno."),
            ("ceramica", "Barro &amp; Fuego", "Taller de cerámica", "demo-web-ceramica-d.webp",
             "Sitio de muestra de un taller: muestra las clases, qué incluye y responde las dudas antes de consultar.")]

def web_showcase(rel):
    base = rel + "demos/web/"
    pick = "".join('<button type="button" data-wt-demo="%s" data-desc="%s" class="%s" aria-pressed="%s"><img src="%sassets/img/%s" alt="" width="96" height="60" loading="lazy"><span><b>%s</b><small>%s</small></span></button>'
                   % (k, E(d), "on" if i == 0 else "", "true" if i == 0 else "false", rel, im, n, s) for i, (k, n, s, im, d) in enumerate(WT_SITES))
    def vista(cls, w, h, poster):
        return ('<div class="wt-view %s" data-w="%d" data-h="%d"><img class="poster" src="%sassets/img/%s" alt="" width="%d" height="%d"><iframe title="Sitio de muestra de Growi: contenido ficticio" data-src="%scentro-ribera/index.html" tabindex="-1"></iframe></div>' % (cls, w, h, rel, poster, w, h, base))
    return ('<div class="wt" data-wt data-site="centro-ribera" data-base="%s" style="--bg:url(%sassets/img/ribera-sala.webp);--bgc:url(%sassets/img/ceramica-taller.webp);--bgcm:url(%sassets/img/ceramica-taller-m.webp)"><div class="wt-pick" role="group" aria-label="Sitio de muestra">%s</div>'
            '<div class="wt-stage"><div class="wt-desk">%s</div><div class="wt-phone">%s</div><p class="wt-sec" data-wt-sec aria-hidden="true"></p></div>'
            '<div class="wt-bar"><p class="wt-cap" data-wt-cap>%s</p><div class="wt-act"><div data-mg-ctl><button type="button" class="mg-pp" data-mg-pp data-state="pause" aria-label="Pausar"></button></div>'
            '<button type="button" class="wt-link" data-wt-explore>Recorrerlo vos mismo</button><button type="button" class="wt-link at-back" data-wt-back>Volver al recorrido</button>'
            '<a class="wt-link wt-open" data-wt-open href="%scentro-ribera/index.html" target="_blank" rel="noopener">Abrir el sitio completo ↗</a></div></div>'
            '<p class="cap">Sitios de muestra con contenido ficticio y funcionando. Son una muestra del nivel de diseño que buscamos. Fotografías de ambientación ilustrativas, generadas con IA.</p></div>'
            % (base, rel, rel, rel, pick, vista("d", 1100, 690, "ribera-d.webp"), vista("m", 390, 780, "ribera-m.webp"), E(WT_SITES[0][4]), base))
