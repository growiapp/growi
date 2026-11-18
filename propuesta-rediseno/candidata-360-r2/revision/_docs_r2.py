# Páginas de revisión de la candidata r2. Uso: python _docs_r2.py
import os, sys, html, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _economia as EC
OUT = os.path.dirname(os.path.abspath(__file__))
E = html.escape

def page(titulo, cuerpo, cur=""):
    links = [("index.html", "Inicio"), ("comparativa.html", "Comparativa"), ("economia.html", "Matriz económica"), ("verificacion.html", "Verificación y crítica")]
    nav = "".join('<a href="%s"%s>%s</a>' % (h, ' aria-current="page"' if h == cur else "", n) for h, n in links)
    return ('<!doctype html>\n<html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow">'
            '<title>%s · Revisión Growi 360° r2</title><link rel="stylesheet" href="../assets/growi360.css"><link rel="stylesheet" href="rev.css"></head><body>'
            '<a class="sr" href="#c">Saltar al contenido</a><header class="rv-top"><div class="w"><a class="logo" href="../">Growi<i>.</i></a><nav aria-label="Revisión">%s</nav>'
            '</div></header>'
            '<main id="c" class="w rv">%s</main><footer class="rv-foot w"><p>Candidata local r2, solo para revisión. No publicada: ningún precio, aviso L1, gate ni producción fue modificado. Todo número económico es un supuesto explícito, no un dato medido.</p></footer></body></html>\n'
            % (E(titulo), nav, cuerpo))

def tabla(cab, filas, cls=""):
    return '<div class="tw"><table class="%s"><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>' % (cls, "".join('<th scope="col">%s</th>' % c for c in cab), "".join("<tr>%s</tr>" % "".join("<td>%s</td>" % c for c in f) for f in filas))

def usd(n):
    return "—" if n is None else "USD %s" % "{:,}".format(int(round(n))).replace(",", ".")
def pct(x):
    return "—" if x is None else ("%+.0f%%" % x)
def write(name, s):
    with open(os.path.join(OUT, name), "w", encoding="utf-8", newline="\n") as f: f.write(s)
    print(name, len(s) // 1024, "KB")

# ============================================================ MATRIZ ECONÓMICA
def economia():
    B, O, X = EC.SUPUESTOS["Base"], EC.SUPUESTOS["Optimista"], EC.SUPUESTOS["Exigente"]
    sup = tabla(["Juego de supuestos", "Costo por hora", "Contingencia de alcance", "Margen objetivo", "Horas usadas", "Infra y terceros por cliente y mes"],
                [["Optimista", usd(O["c"]), "0%", "0% (solo cubrir el costo)", "mínimas", usd(O["infra"])],
                 ["<b>Base</b>", usd(B["c"]), "15%", "20%", "medias", usd(B["infra"])],
                 ["Exigente", usd(X["c"]), "30%", "35%", "máximas", usd(X["infra"])]])
    # matriz de precio mínimo viable
    fil = []
    for it in EC.UNICOS:
        _id, lin, nom, vig, h, so, T, anc, Hs, Ss = it
        mins = [EC.minimo(s["c"], s["r"], s["m"], h[s["ih"]], so[s["ih"]], T) for s in (O, B, X)]
        hmax = EC.horas_max(vig, B["c"], B["r"], B["m"], so[1], T) if vig else None
        ancla = ("%s–%s · %s (confianza %s)" % (usd(anc[0]), usd(anc[1]), E(anc[2]), anc[3])) if anc else "Sin comparable publicado"
        fil.append([lin, E(nom), usd(vig) if vig else "sin precio", usd(mins[0]), "<b>%s</b>" % usd(mins[1]), usd(mins[2]),
                    ("%.0f h" % hmax) if hmax is not None else "—", ancla, E(EC.veredicto(it))])
    mat = tabla(["Línea", "Concepto", "Vigente", "Mínimo viable Optimista", "Mínimo viable Base", "Mínimo viable Exigente", "Horas máx. que sostiene el vigente (Base)", "Ancla de mercado", "Veredicto con supuestos Base"], fil, "mx")
    # recurrentes
    fm = []
    for _id, lin, nom, vig, sh, anc, so_obj in EC.MENSUALES:
        row = [lin, E(nom), usd(vig)]
        for s in (O, B, X):
            row.append(usd(EC.minimo(s["c"], s["r"], s["m"], 0, 0, 0) + 0) if False else usd((s["c"] * sh[s["ih"]] + s["infra"]) / (1 - s["m"])))
        cb = (B["c"] * so_obj + B["infra"]) / (1 - B["m"])
        row.append(usd(cb)); row.append("%s–%s · %s (%s)" % (usd(anc[0]), usd(anc[1]), E(anc[2]), anc[3]))
        fm.append(row)
    men = tabla(["Línea", "Concepto", "Vigente por mes", "Mínimo viable Optimista", "Mínimo viable Base", "Mínimo viable Exigente", "Base con soporte objetivo", "Ancla de mercado"], fm, "mx")
    # reestructura: horas objetivo y precio mínimo viable estandarizado
    fr = []
    palancas = {
        "app_start": "Onboarding estándar: importación de productos por planilla, capacitación grabada y una sola sesión en vivo. Lo que excede la carga inicial se cobra por bloque.",
        "app_pro": "Misma plantilla de carga con alta de usuarios en lote; la sesión en vivo cubre a todo el equipo.",
        "app_multi": "Plantilla por sucursal; la segunda sucursal se configura por copia.",
        "web_express": "Biblioteca de plantillas por rubro, contenido provisto por el cliente en un formulario y una sola ronda de ajustes. Sin diseño propio.",
        "web_pro": "Plantilla personalizable (colores, tipografía, imágenes del cliente) en vez de diseño desde cero; redacción básica con guía estructurada.",
        "web_perf": "Reencuadrar como «landing de captación»: textos y medición con checklist fijo; las rondas adicionales se cobran como extra.",
        "web_base": "Sitio institucional modular (5 bloques fijos). Más páginas o bloques propios se cotizan por hora.",
        "web_turnos": "Separar la conexión con el sistema de turnos como adicional a medida (por hora, con alcance escrito) y dejar el plan como Base + formulario de turnos.",
        "flow_rep": "Plantilla única de reporte por rubro; la personalización va en la sesión de ajuste.",
        "flow_rec": "Plantilla única de recordatorio con campos configurables; sin lógica a medida.",
        "flow_ped": "Un solo flujo estándar con planilla predefinida.",
        "flow_aj": "Ya está estandarizada: se mantiene.",
        "flow_bot": "Respuestas frecuentes desde una base de preguntas estándar; el costo de mensajes de Meta lo paga el cliente (ya está aclarado).",
        "inv_ese": "Plantilla de invitación con generador: datos del evento cargados en un formulario; sin diseño a medida.",
    }
    for it in EC.UNICOS:
        _id, lin, nom, vig, h, so, T, anc, Hs, Ss = it
        cons, rec, prem = EC.escenarios_unico(it)
        mb = EC.minimo(B["c"], B["r"], B["m"], Hs, Ss, T)
        red = (1 - Hs / h[1]) * 100
        fr.append([lin, E(nom), "%.1f → <b>%s h</b> (−%.0f%%)" % (h[1], ("%g" % Hs), red), usd(mb), usd(vig) if vig else "—", E(palancas.get(_id, ""))])
    rees = tabla(["Línea", "Concepto", "Horas medias supuestas → horas objetivo", "Mínimo viable Base con esas horas", "Vigente", "Qué hay que cambiar en la entrega"], fr)
    # escenarios
    def mg(P, h, so, T=0):
        return EC.margen(P, B["c"], B["r"], h, so, T)
    def celda(P, h, so, T=0):
        mn = EC.minimo(B["c"], B["r"], B["m"], h, so, T)
        m = mg(P, h, so, T)
        return "%s h + %s h soporte<br>mín. viable <b>%s</b><br><small>margen al vigente %s</small>" % (("%g" % h).replace(".", ","), ("%g" % so).replace(".", ","), usd(mn), ("%.0f%%" % m) if m is not None else "—")
    fe = []
    for it in EC.UNICOS:
        _id, lin, nom, vig, h, so, T, anc, Hs, Ss = it
        if vig is None:
            lec = "Sin precio hoy: no se evalúa hasta tener horas verificadas."
        else:
            ma, mb = mg(vig, h[1], so[1], T), mg(vig, Hs, Ss, T)
            if mb >= 20: lec = "Cierra con margen solo si se logra B. <b>No demostrado.</b>"
            elif mb >= 0: lec = "Cubre el costo pero no el margen objetivo ni siquiera con B."
            else: lec = "No cierra ni con B: hay que cambiar alcance o cobro."
        fe.append([lin, E(nom), usd(vig) if vig else "sin precio", celda(vig or 0, h[1], so[1], T) if vig else "—", celda(vig or 0, Hs, Ss, T) if vig else "—", "Sin datos medidos", lec])
    esc = tabla(["Línea", "Concepto", "Vigente", "A · Horas actuales supuestas", "B · Horas estandarizadas propuestas", "C · Horas verificadas", "Lectura"], fe, "mx")
    fm = []
    for _id, lin, nom, vig, sh, anc, so_obj in EC.MENSUALES:
        ca = B["c"] * sh[1] + B["infra"]; cb = B["c"] * so_obj + B["infra"]
        fm.append([E(nom), usd(vig), "%g h/mes · costo %s · margen %.0f%%" % (sh[1], usd(ca), (vig - ca) / vig * 100), "%g h/mes · costo %s · margen %.0f%%" % (so_obj, usd(cb), (vig - cb) / vig * 100), "Sin datos medidos"])
    cm = tabla(["Concepto", "Vigente por mes", "A · Soporte actual supuesto", "B · Soporte estandarizado propuesto", "C · Verificado"], fm, "mx")
    eco = json.dumps({"unicos": [dict(id=i[0], linea=i[1], nombre=i[2], vigente=i[3], h=i[4], s=i[5], t=i[6]) for i in EC.UNICOS if i[3]],
                      "mensuales": [dict(id=m[0], nombre=m[2], vigente=m[3], sh=m[4]) for m in EC.MENSUALES]}, ensure_ascii=False)
    calc = ('<div class="calc" id="calc"><div class="calc-in"><label>Costo por hora (USD)<input id="c-c" type="number" step="1" min="0" value="15"></label>'
            '<label>Contingencia de alcance (%%)<input id="c-r" type="number" step="5" min="0" value="15"></label>'
            '<label>Margen objetivo (%%)<input id="c-m" type="number" step="5" min="0" max="90" value="20"></label>'
            '<label>Infra y terceros por cliente y mes (USD)<input id="c-i" type="number" step="1" min="0" value="5"></label>'
            '<button type="button" class="btn o sm" id="c-reset">Volver a los supuestos Base</button></div>'
            '<div class="tw"><table class="mx" id="c-t"><thead><tr><th>Concepto</th><th>Vigente (USD)</th><th>Horas de entrega</th><th>Horas de soporte posterior</th><th>Costo (USD)</th><th>Mínimo viable (USD)</th><th>Horas máx. que sostiene el vigente</th><th>Margen al vigente</th></tr></thead><tbody></tbody></table></div>'
            '<p class="note">Las horas de cada fila se pueden editar: con horas reales de las últimas entregas, esta tabla deja de ser un supuesto y pasa a ser una decisión.</p></div>')
    js = ("<script>(function(){var D=%s;var $=function(s){return document.querySelector(s)};var tb=$('#c-t tbody');" % eco +
          "function f(n){return n==null||!isFinite(n)?'—':Math.round(n).toLocaleString('es-AR')}"
          "function rows(){var c=+$('#c-c').value,r=+$('#c-r').value/100,m=+$('#c-m').value/100,I=+$('#c-i').value,h=''; "
          "D.unicos.forEach(function(u,i){var H=u._h!=null?u._h:u.h[1],S=u._s!=null?u._s:u.s[1];var cost=c*(H*(1+r)+S)+u.t,min=cost/(1-m),hm=((u.vigente*(1-m)-u.t)/c-S)/(1+r),mg=(u.vigente-cost)/u.vigente*100;"
          "h+='<tr><td>'+u.linea+' · '+u.nombre+'</td><td>'+f(u.vigente)+'</td><td><input type=number step=0.5 min=0 value='+H+' data-k=h data-i='+i+' aria-label=\"Horas de entrega de '+u.nombre+'\"></td><td><input type=number step=0.5 min=0 value='+S+' data-k=s data-i='+i+' aria-label=\"Horas de soporte de '+u.nombre+'\"></td><td>'+f(cost)+'</td><td><b>'+f(min)+'</b></td><td>'+(isFinite(hm)?hm.toFixed(1):'—')+' h</td><td class=\"'+(mg<0?'neg':'pos')+'\">'+mg.toFixed(0)+'%%</td></tr>'});"
          "D.mensuales.forEach(function(u,i){var sh=u._h!=null?u._h:u.sh[1];var cost=c*sh+I,min=cost/(1-m),mg=(u.vigente-cost)/u.vigente*100;"
          "h+='<tr><td>'+u.nombre+'</td><td>'+f(u.vigente)+'</td><td colspan=2><input type=number step=0.25 min=0 value='+sh+' data-k=m data-i='+i+' aria-label=\"Horas de soporte al mes de '+u.nombre+'\"> h de soporte al mes</td><td>'+f(cost)+'</td><td><b>'+f(min)+'</b></td><td>—</td><td class=\"'+(mg<0?'neg':'pos')+'\">'+mg.toFixed(0)+'%%</td></tr>'});"
          "tb.innerHTML=h}"
          "function go(){rows()}['c-c','c-r','c-m','c-i'].forEach(function(i){$('#'+i).addEventListener('input',go)});"
          "tb.addEventListener('input',function(e){var t=e.target;if(!t.dataset.k)return;var i=+t.dataset.i,v=+t.value;if(t.dataset.k==='h')D.unicos[i]._h=v;else if(t.dataset.k==='s')D.unicos[i]._s=v;else D.mensuales[i]._h=v;var p=t.dataset.k+t.dataset.i;var c=$('#c-c').value,r=$('#c-r').value,m=$('#c-m').value,I=$('#c-i').value;rows();var n=tb.querySelector('[data-k='+t.dataset.k+'][data-i=\"'+i+'\"]');if(n){n.focus();n.setSelectionRange&&0}});"
          "$('#c-reset').addEventListener('click',function(){$('#c-c').value=15;$('#c-r').value=15;$('#c-m').value=20;$('#c-i').value=5;D.unicos.forEach(function(u){delete u._h;delete u._s});D.mensuales.forEach(function(u){delete u._h});rows()});rows()})();</script>")
    cuerpo = ('<p class="eyebrow">Pricing · Fase C revisada</p><h1>Matriz económica revisada</h1>'
              '<div class="aviso"><b>No se cambió ningún precio publicado ni su sincronización.</b> Todos los números de horas, costo por hora, infraestructura y margen son <b>supuestos explícitos</b>: no hay datos reales de costos en el repositorio y no se inventaron. El valor de esta matriz es mostrar <b>qué tendría que ser cierto</b> para que cada paquete sea rentable y qué dato real lo decide.</div>'
              '<h2>1. Qué estaba mal en la matriz anterior</h2><ul class="bul">'
              '<li>Los márgenes negativos del escenario «Recomendado» no eran una conclusión sobre el negocio: eran un síntoma del modelo. Comparaba el precio contra <code>horas × costo/hora</code> con horas supuestas que ningún precio de mercado puede cubrir, y omitía el riesgo de cambios de alcance, el soporte posterior, la infraestructura y los servicios de terceros.</li>'
              '<li>Tampoco distinguía la palanca correcta: cuando el mercado fija un techo de precio (landing de USD 150–250; mensualidades de USD 13–18 en autoservicio), la variable que se puede mover es <b>cuántas horas insume entregar</b>, no solo el precio de lista.</li></ul>'
              '<h2>2. Modelo y supuestos</h2><p class="lead"><code>costo = costo/hora × (horas × (1 + contingencia) + soporte posterior) + terceros</code> · <code>precio mínimo viable = costo ÷ (1 − margen)</code> · <code>horas máximas que sostiene un precio = ((precio × (1 − margen) − terceros) ÷ costo/hora − soporte) ÷ (1 + contingencia)</code>. Se calcula con tres juegos de supuestos.</p>%s'
              '<h2>3. Matriz: precio mínimo económicamente viable</h2><p class="lead">Por concepto y bajo los tres juegos de supuestos. «Horas máx. que sostiene el vigente» responde: ¿cuántas horas puede insumir esta entrega para que el precio actual cubra el costo con margen del 20%%? Si la entrega real excede esa cifra, el paquete pierde plata.</p>%s'
              '<p class="note"><b>Lectura honesta:</b> con horas medias, ningún precio vigente cierra. Eso se resuelve de tres maneras, no solo subiendo la lista: (1) estandarizar la entrega para que insuma menos horas; (2) cambiar el alcance; (3) cambiar el modelo de cobro (recurrente, por hora o por bloque). Si las horas reales ya son las de la columna «horas máx.», los precios vigentes son correctos.</p>'
              '<h2>4. Recurrentes (mensuales por cliente)</h2>%s'
              '<h2>5. Horas estandarizadas propuestas (B): qué habría que cambiar en la entrega</h2><p class="lead">Las horas objetivo son <b>metas operativas supuestas</b>, no mediciones: exigen estandarizar la entrega (plantillas, formularios de contenido, rondas acotadas). El mínimo viable se recalcula con esas horas.</p>%s'
              '<h2>6. Tres escenarios de horas</h2><p class="lead"><b>A</b> son las horas que hoy se suponen para entregar cada paquete. <b>B</b> son horas estandarizadas que se proponen como meta, y exigen cambios de entrega (plantillas, formularios de contenido, rondas acotadas). <b>C</b> son horas realmente medidas en entregas hechas: hoy no existen. Los precios vigentes no se tocan.</p><div class="aviso"><b>Ningún paquete puede declararse rentable todavía.</b> Todo resultado positivo de la columna B depende de reducciones de esfuerzo que no están demostradas. Hasta cargar horas verificadas (columna C), la decisión de precios queda abierta.</div>%s<h3>Recurrentes</h3>%s'
              '<h2>7. Calculadora (editable)</h2><p class="lead">Cambiá los supuestos o las horas de cada fila con tus datos reales y se recalcula el mínimo viable.</p>%s%s'
              '<h2>8. Datos que faltan para decidir</h2><ol class="steps"><li><b>Horas reales de entrega</b><span>De las últimas entregas de cada tipo: cuántas horas insumieron la puesta en marcha, cada plan web y cada paquete de Flow. Es el dato que más mueve la matriz.</span></li>'
              '<li><b>Costo de infraestructura por cliente de GrowiApp</b><span>Alojamiento, base de datos y servicios de terceros por cliente y por mes, y el costo fijo mensual a repartir.</span></li>'
              '<li><b>Soporte real por cliente</b><span>Horas de WhatsApp por cliente al mes en los primeros 3 meses y después.</span></li>'
              '<li><b>Valor de tu hora</b><span>El costo/hora imputado (lo que cobrarías por tu tiempo en otro trabajo). Sin ese número, el margen es indeterminado.</span></li>'
              '<li><b>Frecuencia de cambios de alcance</b><span>Qué porcentaje de proyectos pidió más de lo escrito, para calibrar la contingencia.</span></li></ol>'
              '<h2>9. Referencias de mercado y límites</h2><p class="note">Los anclas provienen de la investigación de la etapa anterior (consultada el 2026-11-18, con confianza marcada). Dólar oficial venta: ARS %s. No se verificaron los precios de agencias argentinas, el costo/hora de un freelance en Argentina ni la tarifa oficial de Meta. Detalle de fuentes: la investigación de pricing de la etapa anterior (en el repositorio, <code>propuesta-rediseno/candidata-360/revision/precios.html</code>).</p>'
              % (sup, mat, men, rees, esc, cm, calc, js, "{:,}".format(EC.FX).replace(",", "."))).replace("%%", "%")
    cuerpo = cuerpo.replace("%s" , "%s") if False else cuerpo
    write("economia.html", page("Matriz económica", cuerpo, "economia.html"))

if __name__ == "__main__":
    EC.dpct = lambda a, b: None if a in (None, 0) or b is None else (b - a) / a * 100
    economia()
