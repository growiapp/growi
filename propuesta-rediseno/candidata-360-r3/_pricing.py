# Recomendación ejecutiva de pricing (NO aplicada). Usa el modelo de R2: todos los parámetros son supuestos explícitos.
import os, sys, io, html
OUT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.normpath(os.path.join(OUT, "..", "candidata-360-r2", "revision")))
import _economia as EC
E = html.escape
B, X = EC.SUPUESTOS["Base"], EC.SUPUESTOS["Exigente"]

def usd(n): return "—" if n is None else "USD " + "{:,}".format(int(round(n))).replace(",", ".")
def r5(n): return EC.r5(n)

def fila_unico(it):
    _id, lin, nom, vig, h, so, T, anc, Hs, Ss = it
    mnA = EC.minimo(B["c"], B["r"], B["m"], h[1], so[1], T)       # Base, horas actuales supuestas (medias)
    mnB = EC.minimo(B["c"], B["r"], B["m"], Hs, Ss, T)            # Base, horas estandarizadas propuestas
    xB = EC.minimo(X["c"], X["r"], X["m"], Hs, Ss, T)             # Exigente, horas estandarizadas
    ancla = ("%s–%s" % (usd(anc[0]), usd(anc[1]))) if anc else "sin comparable"
    if vig is None:
        rec = "Rango %s–%s" % (usd(r5(mnB)), usd(r5(xB)))
        riesgo = "No hay precio hoy"; conf = "Baja"
    elif vig >= mnA:
        rec = "Mantener"; riesgo = "Bajo"; conf = "Media"
    elif vig >= mnB:
        rec = "Mantener solo si se estandariza la entrega; si no, no menos de %s" % usd(r5(mnA)); riesgo = "Medio"; conf = "Baja"
    else:
        piso = r5(mnB); dentro = bool(anc) and piso <= anc[1]
        rec = "Subir a %s–%s (piso–premium)%s" % (usd(piso), usd(r5(xB)), "; el piso está dentro del comparable" if dentro else "; supera o no tiene comparable: acotar alcance o cobrar por etapas")
        riesgo = "Alto"; conf = "Media" if dentro else "Baja"
    return [E(nom), usd(vig), usd(mnA), usd(mnB), E(ancla), riesgo, rec, conf]

def fila_mensual(it):
    _id, lin, nom, vig, sh, anc, so_obj = it
    mnA = (B["c"] * sh[1] + B["infra"]) / (1 - B["m"]); mnB = (B["c"] * so_obj + B["infra"]) / (1 - B["m"])
    ancla = "%s–%s" % (usd(anc[0]), usd(anc[1]))
    if vig >= mnA: rec, riesgo, conf = "Mantener", "Bajo", "Media"
    elif vig >= mnB: rec, riesgo, conf = "Mantener si el soporte baja a las horas estandarizadas; si no, ≥ %s" % usd(r5(mnA)), "Medio", "Baja"
    else:
        rec = "Subir a ≥ %s por mes (dentro del comparable)" % usd(r5(mnB)) if r5(mnB) <= anc[1] else "≥ %s por mes (sobre el comparable)" % usd(r5(mnB)); riesgo, conf = "Alto", "Media"
    return [E(nom), usd(vig) + "/mes", usd(mnA) + "/mes", usd(mnB) + "/mes", ancla, riesgo, rec, conf]

def tabla(filas):
    cab = ["Concepto", "Precio vigente", "Mínimo viable · horas actuales supuestas", "Mínimo viable · horas estandarizadas", "Comparable de mercado", "Riesgo de subvaloración", "Recomendación provisional", "Confianza"]
    return '<div class="tw"><table class="mx"><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>' % ("".join("<th scope=\"col\">%s</th>" % c for c in cab), "".join("<tr>%s</tr>" % "".join("<td>%s</td>" % c for c in f) for f in filas))

def pagina():
    U = {i[0]: i for i in EC.UNICOS}; M = {i[0]: i for i in EC.MENSUALES}
    grupos = [
        ("GrowiApp", [fila_unico(U[k]) for k in ("app_start", "app_pro", "app_multi")] + [fila_mensual(M[k]) for k in ("app_start_m", "app_pro_m", "app_multi_m")]),
        ("GrowiWeb", [fila_unico(U[k]) for k in ("web_express", "web_pro", "web_perf", "web_base", "web_turnos")]),
        ("GrowiFlow", [fila_unico(U[k]) for k in ("flow_rep", "flow_rec", "flow_ped", "flow_aj", "flow_bot")] + [fila_mensual(M["flow_bot_m"])]),
    ]
    # Combo: el sitio sale 10% menos y la puesta en marcha de GrowiApp va sin cargo
    web, app = U["web_express"], U["app_start"]
    costoB = EC.costo(B["c"], B["r"], web[8], web[9]) + EC.costo(B["c"], B["r"], app[8], app[9])
    costoA = EC.costo(B["c"], B["r"], web[4][1], web[5][1]) + EC.costo(B["c"], B["r"], app[4][1], app[5][1])
    ing = 180
    combo = [["Combo Landing (sitio 180 + puesta en marcha sin cargo)", usd(ing), usd(costoA / (1 - B["m"])), usd(costoB / (1 - B["m"])), "sin comparable", "Alto" if ing < costoB / (1 - B["m"]) else "Medio",
              "Mantener el descuento solo si se estandariza la entrega; el descuento del 10 por ciento y la puesta en marcha gratis suman USD " + str(int(web[3] * 0.1 + app[3])) + " de concesión sobre la lista", "Baja"],
             ["Combo Institucional (sitio 495 + puesta en marcha sin cargo)", usd(495), "—", "—", "sin comparable", "Alto", "Hereda el riesgo de Sitio Base (ver GrowiWeb); evaluar descuento menor o puesta en marcha con cargo reducido", "Baja"]]
    inv = [fila_unico(U["inv_ese"])]
    secs = "".join('<h2>%s</h2>%s' % (n, tabla(f)) for n, f in grupos) + '<h2>Combo</h2>' + tabla(combo) + '<h2>Invitaciones</h2>' + tabla(inv)
    return ('<!doctype html>\n<html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Recomendación de pricing (no aplicada) · Growi 360° R3.1</title>'
            '<link rel="stylesheet" href="../assets/growi360.css"><link rel="stylesheet" href="rev.css"></head><body><a class="sr" href="#c">Saltar al contenido</a>'
            '<header class="rv-top"><div class="w"><a class="logo" href="../">Growi<i>.</i></a><nav aria-label="Revisión"><a href="index.html">Revisión</a><a href="../">Abrir la candidata</a></nav></div></header>'
            '<main id="c" class="w rv"><p class="eyebrow">Recomendación ejecutiva · no aplicada</p><h1>Pricing: dónde hay riesgo de subvaloración</h1>'
            '<div class="aviso"><b>Los importes publicados no se tocaron.</b> Esta tabla es una recomendación provisional para decidir, no una lista nueva. Se calcula con la matriz económica de R2 y <b>no exige registrar nuevas entregas</b>: usa supuestos explícitos que se reemplazan por horas reales cuando existan.</div>'
            '<h2>Supuestos (explícitos, no medidos)</h2><ul class="bul"><li>Costo de una hora de trabajo: <b>USD %s</b>. Contingencia de alcance: <b>%d%%</b>. Margen objetivo: <b>%d%%</b>. Infraestructura mensual por cliente: <b>USD %s</b>.</li>'
            '<li><b>Mínimo viable = costo ÷ (1 − margen).</b> «Horas actuales supuestas»: las horas medias que hoy se asumen para entregar cada paquete. «Horas estandarizadas»: una meta que exige plantillas y rondas acotadas; <b>no está demostrada</b>.</li>'
            '<li>Escenario premium: costo de USD %s la hora, %d%% de contingencia y %d%% de margen (el «piso–premium» de la recomendación).</li>'
            '<li>Los comparables de mercado (ancla) son resúmenes públicos, de confianza baja a media; ver la fuente de cada uno en <code>../../candidata-360-r2/revision/economia.html</code>.</li></ul>'
            '<h2>Lectura rápida</h2><ul class="bul"><li><b>Mayor riesgo:</b> GrowiWeb (Performance, Sitio Base y Con turnos), GrowiApp Start mensual y la sesión de ajuste. Con las horas actuales supuestas, ni siquiera cubren el margen objetivo.</li>'
            '<li><b>Riesgo medio:</b> los paquetes de GrowiFlow cubren el costo pero no el margen; la estandarización de la entrega es lo que los volvería rentables.</li>'
            '<li><b>El Combo regala dos cosas a la vez</b> (10%% del sitio y la puesta en marcha de GrowiApp): es donde más se concede.</li>'
            '<li><b>Invitaciones</b> cotiza por proyecto: conviene un precio base de entrada («Esencial») para no cotizar siempre desde cero.</li>'
            '<li><b>Cómo usarla:</b> los importes vigentes siguen mientras Growi esté en L1. Una propuesta provisional puede cotizar fuera de lista dentro de estos rangos y alcance acotado, sin esperar nuevas entregas.</li></ul>'
            '%s<p class="note">Todos los valores son supuestos del modelo, en USD, con el dólar oficial como referencia solo para el ARS. No se publicó ni se aplicó ningún importe. Confianza global: baja a media.</p></main>'
            '<footer class="rv-foot w"><p>Candidata R3.1 local, solo para revisión. No publicada.</p></footer></body></html>\n'
            % (B["c"], int(B["r"] * 100), int(B["m"] * 100), B["infra"], X["c"], int(X["r"] * 100), int(X["m"] * 100), secs))

if __name__ == "__main__":
    os.makedirs(os.path.join(OUT, "revision"), exist_ok=True)
    io.open(os.path.join(OUT, "revision", "pricing.html"), "w", encoding="utf-8", newline="\n").write(pagina())
    print("ok")
