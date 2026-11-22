# Genera las páginas de revisión de la candidata (diagnóstico, pricing, dirección, comparativa, verificación y el punto de entrada).
import os, html, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _precios as P
OUT = os.path.dirname(os.path.abspath(__file__))
E = html.escape

def page(titulo, cuerpo, nav_cur=""):
    links = [("index.html", "Inicio de la revisión"), ("diagnostico.html", "Diagnóstico"), ("precios.html", "Pricing"), ("direccion.html", "Dirección creativa y motion"), ("comparativa.html", "Comparativa"), ("verificacion.html", "Verificación y crítica")]
    nav = "".join('<a href="%s"%s>%s</a>' % (h, ' aria-current="page"' if h == nav_cur else "", n) for h, n in links)
    return ('<!doctype html>\n<html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow">'
            '<title>%s · Revisión Growi 360°</title><link rel="stylesheet" href="../assets/growi360.css"><link rel="stylesheet" href="rev.css"></head><body>'
            '<a class="sr" href="#c">Saltar al contenido</a><header class="rv-top"><div class="w"><a class="logo" href="../">Growi<i>.</i></a><nav aria-label="Revisión">%s</nav></div></header>'
            '<main id="c" class="w rv">%s</main><footer class="rv-foot w"><p>Candidata local de diseño. No publicada: ningún precio, aviso L1, gate ni producción fue modificado. Las cifras de mercado y de horas se rotulan con su confianza o como supuestos.</p></footer></body></html>\n'
            % (E(titulo), nav, cuerpo))

def tabla(cab, filas, cls=""):
    return '<div class="tw"><table class="%s"><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>' % (cls, "".join("<th scope=\"col\">%s</th>" % c for c in cab), "".join("<tr>%s</tr>" % "".join("<td>%s</td>" % c for c in f) for f in filas))

def usd(n):
    return "—" if n is None else ("USD %s" % ("{:,}".format(n).replace(",", ".")))

def ars(n, fx=P.FX_SITIO):
    return "$%s" % "{:,}".format(int(round(n * fx / 1000) * 1000 if n * fx >= 100000 else round(n * fx / 100) * 100)).replace(",", ".")

def write(name, s):
    with open(os.path.join(OUT, name), "w", encoding="utf-8", newline="\n") as f: f.write(s)
    print(name, len(s) // 1024, "KB")

# =================================================== DIAGNÓSTICO
def diagnostico():
    H = [
     ("Crítico", "D1", "Hecho", "El menú principal muestra 3 de las 5 líneas. Combo e Invitaciones solo aparecen en tarjetas, en el pie y dentro de la página GrowiWeb.", "En las seis páginas el menú es GrowiApp · GrowiWeb · GrowiFlow (verificado en navegador).", "Quien busca «sitio + sistema» o eventos no los descubre desde la navegación: el negocio vende cinco cosas y el menú anuncia tres.", "Menú con las cinco líneas, agrupadas en la home por necesidad (negocio / eventos)."),
     ("Alto", "D2", "Hecho + hipótesis", "La home pide elegir producto antes de que el visitante sepa qué necesita: tres tarjetas iguales, dos franjas, tres rubros y un CTA genérico.", "Hero centrado «Tu negocio, más simple.» sin demostración ni elección guiada; 1 sola imagen en toda la home.", "Hipótesis: la dispersión sube el costo de decidir y baja las consultas bien dirigidas. No hay datos de conversión para medirlo.", "«Armá tu consulta»: elegís lo que necesitás, ves precios «desde» y se arma el mensaje de WhatsApp."),
     ("Alto", "D3", "Hecho", "Páginas largas: 875 a 1.434 palabras y 6.579 a 9.716 px (escritorio); 9.400 a 13.849 px en móvil.", "GrowiWeb: 1.434 palabras, 13 secciones y 13.849 px en móvil.", "Hipótesis: demasiado recorrido entre el interés y la consulta.", "Home −19% de palabras; GrowiApp −45%; GrowiWeb −36% (ver comparativa). No se perdió ninguna condición comercial; se condensaron tablas duplicadas."),
     ("Alto", "D4", "Hecho", "Los mismos precios se repiten dentro de una página: /web/ tiene 18 elementos de precio (tarjetas, tabla comparativa, extras, combo) y /flow/ otros 18.", "Landing: 3 precios en tarjetas y los mismos 3 otra vez en la tabla comparativa.", "Repetir cifras agranda la página y obliga a releer; también multiplica los lugares a actualizar.", "Un único componente de precio (ticket) por plan; GrowiApp 8 y GrowiWeb 11 elementos."),
     ("Alto", "D5", "Hecho", "Invitaciones, una de las cinco líneas, no publica ningún precio ni rango (solo presupuesto). Las otras cuatro sí.", "Página /invitaciones/: 0 elementos de precio.", "El visitante no puede calibrar si le conviene. Hipótesis: baja las consultas de eventos de bajo ticket.", "Ver pricing: tres niveles de referencia propuestos (requieren aprobación). La candidata dice «con presupuesto» sin inventar cifras."),
     ("Alto", "D6", "Hecho + preferencia", "Las cinco páginas usan una misma plantilla: píldora flotante, hero centrado, tres tarjetas blancas iguales, acento verde. Nada distingue visualmente una línea de otra ni a Growi de cualquier SaaS.", "Home y /app/ comparten estructura; el wordmark es el único rasgo propio.", "Parte es objetiva (estructura repetida) y parte es gusto («genérico»).", "Sistema «Presupuesto a la vista»: ticket, tipografía de datos, marcador, filas índice. Ver dirección creativa."),
     ("Medio", "D7", "Hecho", "Prueba de capacidad: un solo caso real (Colo Café), en la home a mitad de página. /app/ y /web/ no vuelven sobre él. /web/ usa demos con contenido ficticio, bien rotuladas.", "Home: el caso aparece después de cuatro secciones.", "Está bien no inventar clientes. Es poco aprovechable un único caso real.", "La candidata mantiene el caso tal cual y no agrega pruebas nuevas."),
     ("Medio", "D8", "Hecho + hipótesis", "Toda conversión termina en WhatsApp: 7 a 18 enlaces por página. Es coherente con L1, pero salvo la «demo de 20 minutos» no hay un paso de menor compromiso.", "Home 7, /app/ 12, /web/ 18, /flow/ 12, /combo/ 9, /invitaciones/ 10.", "Hipótesis: parte de las visitas no quiere chatear antes de entender el precio.", "Precios visibles antes del contacto y mensaje prearmado con lo elegido."),
     ("Medio", "D9", "Hecho", "Contenido repetido: «precio claro», «garantía de 7 días» y los límites de precio (dominio, dólar, terceros) se repiten en 3 a 5 bloques por página; la home trae 8 preguntas que reiteran lo anterior.", "Home: tres bloques de confianza + FAQ de 8.", "Diluye lo importante.", "FAQ de 5 por página y una sola declaración de límites por componente de precio."),
     ("Medio", "D10", "Hecho", "Medición: el sitio ya manda eventos de Plausible por CTA (cta_whatsapp con ubicación, ref dentro del mensaje, cta_interno). Falta saber qué línea atrae antes del clic.", "Solo existe `billing_period_change` como evento de interés previo.", "Sin eso no se puede ordenar el rediseño por datos.", "La candidata agrega `consulta_armada` (con las líneas elegidas). No se activó nada en producción."),
     ("Bajo", "D11", "Hecho", "El tipo de cambio del sitio es 1.535 (2026-09-19); el dólar oficial venta del 2026-11-18 es 1.575 (+2,6%).", "shared.fx.js; dolarapi.com.", "Dentro del umbral de actualización automática del 3%.", "Sin cambios."),
     ("Positivo", "D12", "Hecho", "Sin desborde horizontal en las seis páginas, consola sin errores, botón fijo móvil, menú modal con foco gestionado, saltar al contenido y aria-current.", "Verificado en 1440 y 390 px.", "Base técnica sólida; no hay que reconstruirla.", "La candidata reutiliza shared.js (menú, moneda, medición, botón fijo)."),
    ]
    filas = [[("<span class=\"imp i-%s\">%s</span>" % (h[0].lower().replace("í", "i"), h[0])), h[1], h[2], E(h[3]), E(h[4]), E(h[5]), E(h[6])] for h in H]
    t = tabla(["Impacto", "ID", "Tipo", "Hallazgo", "Evidencia", "Por qué importa", "Qué hace la candidata"], filas, "hall")
    recorrido = [
     ("1. Entra y entiende qué es", "Hoy: «Tu negocio, más simple.» y tres tarjetas. Candidata: «Tu negocio, andando.» más una frase que dice qué se arma y que el precio y la fecha van por escrito antes de empezar."),
     ("2. Reconoce su caso", "Hoy: tarjetas por producto y por rubro. Candidata: «Armá tu consulta»: elige lo que necesita (llevar el negocio, tener un sitio, avisos automáticos, un evento)."),
     ("3. Ve qué incluye y cuánto cuesta", "Hoy: el precio está en la home y dentro de cada página, repetido. Candidata: precio «desde» en cada fila y ticket de presupuesto con lo incluido en cada plan."),
     ("4. Entiende cómo sería empezar", "Tres pasos y la línea «antes de empezar: precio y fecha estimada, por escrito». Es la única diferencia verificable que Growi puede afirmar hoy."),
     ("5. Consulta", "WhatsApp con mensaje prearmado con las líneas elegidas y la referencia del botón (se conserva `(ref: …)` y los eventos del sitio). El aviso L1 sigue en cada bloque de precio y en el pie."),
    ]
    rec = "".join("<li><b>%s</b><span>%s</span></li>" % (a, E(b)) for a, b in recorrido)
    dif = [("Es hecho, no promesa", "Se afirma solo lo que el sitio ya dice: precio y fecha antes de empezar, soporte por WhatsApp (lunes a sábado de 9 a 19 hs), 7 días de garantía en GrowiApp, sin permanencia en GrowiApp, hecho en Argentina."),
           ("Qué falta decir", "Resultados concretos y diferencia frente a otras alternativas: Growi recién empieza y no hay datos propios. Se evita fabricar métricas. Se puede decir qué hace cada solución (cierra la caja sin cuentas, avisa antes de agotar stock), no cuánto mejora."),
           ("¿Cinco líneas dispersan?", "Hipótesis: dispersan si se presentan como cinco productos iguales y ayudan si se organizan por necesidad: tres soluciones para el negocio, un combo que las une y una especialización para eventos. La candidata prueba esa organización; necesita datos de uso para confirmarla.")]
    d = "".join("<li><b>%s</b><span>%s</span></li>" % (a, E(b)) for a, b in dif)
    cuerpo = ('<p class="eyebrow">Fase A y B</p><h1>Diagnóstico integral priorizado</h1>'
              '<p class="lead">Cómo está hoy el sitio, con evidencia. Separo hechos verificables, hipótesis comerciales y preferencias estéticas. Esto no es una auditoría de Lighthouse.</p>'
              '<h2>Método y estado real</h2><ul class="bul"><li>El sitio publicado equivale a <code>origin/main</code> (commit 7a2130c, publicación L1 de las cinco líneas). Las 11 commits de la rama actual son prototipos: no modifican las páginas reales (verificado con <code>git diff</code>).</li>'
              '<li>Inspección en navegador real de las seis páginas (home, GrowiApp, GrowiWeb, GrowiFlow, Combo, Invitaciones) en 1440 y 390 px, con capturas y métricas de estructura. Contrastado con el sitio en línea (growi.ar) para título, menú, precios y aviso L1.</li>'
              '<li>Limitación: no hay acceso a datos de Plausible ni de conversión. Todo lo que dice «hipótesis» necesita medición.</li></ul>'
              '<h2>Hallazgos por impacto</h2>%s'
              '<h2>Recorrido del visitante: hoy y en la candidata</h2><ol class="steps">%s</ol>'
              '<h2>Diferenciación y las cinco líneas</h2><ol class="steps">%s</ol>'
              '<h2>Qué hace bien el sitio actual y no hay que perder</h2><ul class="bul"><li>Condiciones comerciales claras, en pesos y en dólares, con aviso L1 en cada bloque de precio.</li><li>Medición por CTA con ref dentro del mensaje.</li><li>Accesibilidad: saltar al contenido, menú modal con foco, aria-current.</li><li>Honestidad: no hay testimonios ni métricas inventadas, y las demos están rotuladas como ficticias.</li></ul>'
              % (t, rec, d))
    write("diagnostico.html", page("Diagnóstico", cuerpo, "diagnostico.html"))

# =================================================== PRICING
def precios():
    vig = []
    for l, n, v, c, r, p, h0, h1, nota in P.ITEMS: vig.append((l, n, v))
    inv = tabla(["Línea", "Concepto", "Precio vigente (USD)", "ARS al tipo de cambio del sitio (1.535)", "Condición vigente"], [
        ["GrowiApp", "Start · mensual + puesta en marcha", "15 / mes + 49", "$23.000 / mes + $75.200", "Sin permanencia. Anual −15%. Garantía 7 días: devolución del 100% de la puesta en marcha."],
        ["GrowiApp", "Pro · mensual + puesta en marcha", "29 / mes + 149", "$44.500 / mes + $229.000", "Hasta 3 usuarios. Factura electrónica ARCA: próximamente."],
        ["GrowiApp", "Multi · mensual + puesta en marcha", "49 / mes + 249", "$75.200 / mes + $382.000", "Hasta 5 usuarios y 2 sucursales."],
        ["GrowiWeb", "Landing Express / Pro / Performance", "200 / 299 / 449", "$307.000 / $459.000 / $689.000", "Pago único. No incluye dominio ni alojamiento. 7 a 30 días de ajustes."],
        ["GrowiWeb", "Sitio institucional Base / Con turnos", "550 / 729", "$844.000 / $1.119.000", "Pago único. 30 días de soporte."],
        ["GrowiWeb", "Extras", "69 / 59 / 39 / 29 · conexión a cotizar", "$106.000 / $90.600 / $59.900 / $44.500", "Redacción, formulario con planilla, medición, ronda adicional."],
        ["GrowiFlow", "Reportes / Recordatorios / Pedidos y consultas", "89 / 89 / 79", "$137.000 / $137.000 / $121.000", "Pago único. Sesión de ajuste USD 29. A medida desde USD 190."],
        ["GrowiFlow", "Bot de WhatsApp (próximamente)", "25 / mes + 149", "$38.400 / mes + $229.000", "El costo de mensajes de Meta lo paga el cliente."],
        ["Combo", "Sitio −10% + GrowiApp Start", "Landing 180 · Institucional 495 + 15 / mes", "$276.000 · $760.000 + $23.000 / mes", "Puesta en marcha de GrowiApp sin cargo (sola, USD 49). Cliente de GrowiWeb: −10% en un paquete de GrowiFlow. Los descuentos no se acumulan."],
        ["Invitaciones", "Invitaciones digitales a medida", "Sin precio de lista", "—", "Solo presupuesto."]])
    mercado = tabla(["Línea", "Referencia", "Precio (moneda original)", "Qué incluye / condición", "Fuente (consultada 2026-11-18)", "Confianza"], [
        ["Tipo de cambio", "Dólar oficial venta", "ARS 1.575 (compra 1.525)", "—", "dolarapi.com/v1/dolares/oficial", "Alta"],
        ["App", "Tiendanube Esencial / Impulso / Escala", "ARS 27.999 / 79.999 / 244.999 por mes (anual: 20.999 / 59.999 / 183.749)", "Tienda online; sin cobro de implementación", "tiendanube.com/planes-y-precios", "Alta"],
        ["App", "Colppy PyMEs", "ARS 128.500 / 189.500 / 261.500 por mes + IVA", "Gestión contable; prueba de 7 días", "colppy.com/precios", "Media"],
        ["App", "AgendaPro (turnos)", "ARS 990 por mes los primeros 3 meses; recordatorios por WhatsApp desde ARS 5.900 por mes", "Resto de planes sin monto visible", "agendapro.com/ar/planes-int", "Media"],
        ["App", "Square", "Free USD 0 · Plus USD 49 por ubicación", "Precios por rubro no visibles", "squareup.com/us/en/pricing", "Media"],
        ["Web", "GoDaddy LatAm (guía AR, 20/11/2025)", "Landing USD 150–250; sitio corporativo básico USD 150–400; profesional USD 1.500–5.000; a medida USD 5.000–20.000+", "Hosting compartido desde USD 5,99/mes; mantenimiento sin monto", "godaddy.com/resources/latam/crearweb/cuanto-cuesta-crear-pagina-en-argentina", "Media"],
        ["Web", "Tiendanube blog (hacerlo uno mismo)", "ARS 281.000–1.150.000 al año", "Dominio 6.000–70.000; hosting con SSL 25.000–80.000; plantilla premium 250.000–850.000", "tiendanube.com/blog/cuanto-cuesta-crear-una-pagina-web", "Media"],
        ["Web", "Wix / Squarespace / Framer", "USD 14–48 · 10–14 · 10–30 por mes", "Constructores de autoservicio", "Blog de Tiendanube; framer.com/pricing", "Media"],
        ["Flow", "Zapier / n8n Cloud", "USD 19,99–49 por mes · EUR 20–50 por mes", "Automatización de autoservicio", "zapier.com/pricing; n8n.io/pricing", "Media"],
        ["Flow", "Botmaker", "USD 149 / 249 / 499 por mes (3.000 a 10.000 conversaciones); alta única de WhatsApp USD 99", "Bots de WhatsApp", "botmaker.com/prices", "Media"],
        ["Flow", "Tarifa de mensajes de WhatsApp (Meta), Argentina", "≈ USD 0,03 utilidad · ≈ USD 0,07 marketing por mensaje", "Terceros discrepan; desde 1/10/2026 hay cambios en mensajes de servicio", "developers.facebook.com/docs/whatsapp/pricing (vía terceros)", "Baja"],
        ["Invitaciones", "Mercado Libre AR (búsqueda «invitaciones digitales 15 años»)", "ARS 6.000–60.000; web ARS 35.000–60.000", "RSVP y GPS solo en algunos listados", "listado.mercadolibre.com.ar (resumen de búsqueda; acceso directo dio 403)", "Baja"],
        ["Combo", "Paquetes web + sistema", "No se encontraron precios publicados comparables", "—", "—", "—"]])
    nover = "Costo/hora de un desarrollador freelance en Argentina (no se encontró una fuente fiable de 2026); precios de Xubio, Bejerman, Tango, Maxirest, Treinta, Turnito, Booksy, Calendly, Make, Manychat, Treble, Webflow, Hostinger, Workana, Fiverr, Canva y Greetings; precios de agencias argentinas y de combos; y la tarifa oficial de Meta (solo vía terceros)."
    # esfuerzo y tarifa implícita
    fil = []
    for l, n, v, c, r, p, h0, h1, nota in P.ITEMS:
        mid = (h0 + h1) / 2
        m = lambda precio, ch: (precio - mid * ch) / precio * 100
        fil.append([l, E(n), "%d–%d h" % (h0, h1), "%.0f–%.0f" % (P.tarifa(v, h1), P.tarifa(v, h0)), "%.0f–%.0f" % (P.tarifa(r, h1), P.tarifa(r, h0)),
                    "%.0f%% / %.0f%% / %.0f%%" % tuple(m(v, ch) for ch in P.COSTO_HORA), "%.0f%% / %.0f%% / %.0f%%" % tuple(m(r, ch) for ch in P.COSTO_HORA)])
    esf = tabla(["Línea", "Entregable", "Horas supuestas", "USD/h implícitos hoy", "USD/h implícitos (recomendado)", "Margen hoy a USD 10 / 15 / 25 por hora", "Margen recomendado a USD 10 / 15 / 25 por hora"], fil)
    def esc(idx):
        fi = []
        for l, n, v, c, r, p, h0, h1, nota in P.ITEMS:
            sel = (v, c, r, p)[idx + 0] if idx == 0 else (v, c, r, p)[idx]
            fi.append([l, E(n), usd(v), usd(sel), P.fmt_pct(P.dpct(v, sel))])
        for l, n, v, c, r, p in P.MENSUAL:
            sel = (v, c, r, p)[idx]
            fi.append([l, E(n), usd(v), usd(sel), P.fmt_pct(P.dpct(v, sel))])
        l, n, v, c, r, p, h0, h1, nota = P.SETUP_BOT
        fi.append([l, E(n), usd(v), usd((v, c, r, p)[idx]), P.fmt_pct(P.dpct(v, (v, c, r, p)[idx]))])
        for n, v, c, r, p in P.EXTRAS:
            fi.append(["GrowiWeb", "Extra · " + E(n), usd(v), usd((v, c, r, p)[idx]), P.fmt_pct(P.dpct(v, (v, c, r, p)[idx]))])
        for l, n, v, c, r, p in P.NUEVOS:
            sel = (v, c, r, p)[idx]
            if sel is not None: fi.append([l, E(n), usd(v) if v else "no existe / sin precio", usd(sel), "nuevo"])
        return tabla(["Línea", "Concepto", "Hoy", "Escenario", "Δ"], fi)
    ESC = [
      ("Conservador", 1, "Empaquetar antes de subir. No se toca ningún precio de lista vigente; se completan los vacíos (Invitaciones) y se agrega un servicio recurrente opcional para la web.",
       "Quien hoy compra por precio de entrada: negocios chicos sin urgencia; es el escenario que menos riesgo comercial introduce.",
       "Aprovecha que los componentes subvaluados son los que hoy no se cobran: alojamiento gestionado, cambios chicos y las invitaciones. No exige subir lo que el mercado ya compara (Tiendanube desde ARS 21.000 al mes; landing de USD 150–250).",
       "Las horas siguen ajustadas: la tarifa implícita queda en USD 6 a 21 por hora según el ítem. Mejora recién con volumen o con menos horas por entrega.",
       "Bajo. El costo es de oportunidad: se mantienen márgenes finos.", "Sin cambios en precios vigentes; 3 conceptos nuevos."),
      ("Recomendado", 2, "Ajuste selectivo y empaquetado. Sube entre 10% y 21% los ítems con tarifa implícita más baja (puestas en marcha, sitios institucionales, Flow) y mantiene el combo y las condiciones. Publica tres niveles de Invitaciones y dos servicios de cuidado opcionales.",
       "Negocios establecidos con un dueño que valora la entrega hecha y el soporte; consultorios y comercios con turnos.",
       "El ajuste concentra el aumento donde la tarifa implícita es menor (Start: puesta en marcha USD 49 a USD 69; Base y Con turnos +16% y +18%). Se mantiene debajo de los rangos publicados para «profesional» (USD 1.500–5.000) y dentro de «básico» ampliado. Las mensualidades de GrowiApp quedan entre Tiendanube Impulso y Colppy.",
       "Con las horas supuestas, la tarifa implícita sube a USD 7 a 25 por hora. Es indeterminado sin horas reales y sin costos de infraestructura.",
       "Medio-bajo. El aumento es chico y se compensa con el empaquetado; riesgo en GrowiApp Start por la puesta en marcha (+41%).", "Subas de 10% a 41%; 5 conceptos nuevos."),
      ("Premium", 3, "Posicionamiento de servicio dedicado: precios +24% a +82% en puestas en marcha y sitios, y combo con menos descuento. Pensado para un Growi que ya tiene casos y lista de espera.",
       "Clínicas, estudios y comercios que priorizan no tocar nada técnico. Hoy no hay datos que muestren esa demanda.",
       "Cubre una tarifa implícita razonable aun con las horas supuestas más altas, pero queda sobre el rango «básico» publicado por el mercado para landing y sitio corporativo (USD 150–400) y compite con agencias.",
       "Tarifa implícita de USD 10 a 35 por hora con las horas supuestas.",
       "Alto. Sin casos, métricas ni reputación, el precio no se sostiene solo por empaquetado; riesgo de perder consultas.", "Subas de 24% a 82%; 5 conceptos nuevos."),
    ]
    esc_html = ""
    for nombre, idx, que, cliente, just, hs, riesgo, dif in ESC:
        esc_html += ('<section class="esc"><h3>%s</h3><dl class="def"><dt>Qué es</dt><dd>%s</dd><dt>Cliente objetivo</dt><dd>%s</dd><dt>Justificación</dt><dd>%s</dd><dt>Supuestos de costos y horas</dt><dd>%s</dd><dt>Riesgo comercial</dt><dd>%s</dd><dt>Diferencia con el vigente</dt><dd>%s</dd></dl>%s</section>'
                     % (nombre, E(que), E(cliente), E(just), E(hs), E(riesgo), E(dif), esc(idx)))
    cuerpo = ('<p class="eyebrow">Fase C</p><h1>Propuesta de pricing</h1>'
              '<div class="aviso"><b>No se cambió ningún precio publicado ni su sincronización.</b> Esto es una propuesta para decidir. Las horas, los costos por hora y los márgenes son <b>supuestos explícitos</b>, no datos medidos: el margen real es indeterminado hasta tener horas de entrega y costos de infraestructura.</div>'
              '<h2>1. Precios vigentes (inventario)</h2>@@0@@'
              '<h2>2. Mercado: qué se verificó y con qué confianza</h2><p class="lead">Se leyeron páginas oficiales con una herramienta que resume (confianza media en cifras) y se descartó lo que no se pudo verificar. Dólar oficial venta del día: ARS 1.575 (el sitio usa 1.535).</p>@@1@@'
              '<p class="note"><b>No verificado:</b> @@2@@</p>'
              '<h2>3. Qué muestran los datos</h2><ul class="bul">'
              '<li><b>GrowiApp está en el rango de autoservicio, pero entrega más.</b> USD 15 por mes (≈ ARS 23.600 al oficial) queda al nivel de Tiendanube Esencial/Impulso y muy por debajo de Colppy (ARS 128.500 o más). Pero incluye armado, carga de datos y capacitación, con soporte por WhatsApp. La puesta en marcha (USD 49) es el componente que parece más subvaluado.</li>'
              '<li><b>GrowiWeb está bien ubicado en el medio del mercado.</b> Landing USD 200–449 frente a «USD 150–250 básico»; sitio institucional USD 550–729 frente a «USD 150–400 básico» y «USD 1.500–5.000 profesional». El mantenimiento, el dominio y el hosting quedan fuera y casi nadie publica un precio de mantenimiento: es un ingreso recurrente que hoy no existe.</li>'
              '<li><b>GrowiFlow es pago único; el mercado cobra por mes.</b> Zapier, n8n y Botmaker son recurrentes. Un pago único de USD 89 deja a Growi con el mantenimiento y con los cambios de las plataformas sin ingreso. Los costos de mensajes de Meta quedan a cargo del cliente y no están en el precio de puesta en marcha.</li>'
              '<li><b>Invitaciones no tiene precio.</b> El mercado visible (Mercado Libre, confianza baja) va de ARS 6.000 a 60.000, o USD 4 a 38 al oficial. Un precio de referencia propio permitiría calificar consultas.</li>'
              '<li><b>Combo y descuentos.</b> −10% en el sitio y puesta en marcha sin cargo (USD 49 que se regalan) es un incentivo fuerte frente al margen de la puesta en marcha. No hay comparables publicados.</li></ul>'
              '<h2>4. Esfuerzo y tarifa implícita (supuestos)</h2><p class="lead">Horas supuestas por entregable y la tarifa por hora que implica cada precio. El margen se calcula sobre horas medias a tres costos por hora de ejemplo. <b>Datos que permitirían decidir:</b> horas reales de las últimas entregas, costo de infraestructura por cliente de GrowiApp, tiempo de soporte por cliente por mes y el valor que el dueño asigna a su hora.</p>@@3@@'
              '<p class="note">GrowiApp mensual: con 0,5 a 1,5 h de soporte por cliente al mes a USD 10 la hora el costo directo es de USD 5 a 15 antes de infraestructura; sobre USD 15 por mes (Start) el margen es de 0% a 67%. Por eso el escenario recomendado lleva Start a USD 18.</p>'
              '<h2>5. Tres escenarios</h2>@@4@@'
              '<h2>6. Recomendación</h2><p class="lead">Empezar por el escenario <b>Recomendado, en dos tandas</b>: primero lo que no cuesta conversión (publicar precios de Invitaciones, ofrecer el cuidado del sitio, definir qué cubre la puesta en marcha de GrowiApp); después, una suba selectiva medida con las consultas que genere el nuevo recorrido. Ningún cambio de precio sin tu aprobación específica.</p>'
              )
    for i, v in enumerate((inv, mercado, nover, esf, esc_html)):
        cuerpo = cuerpo.replace('@@%d@@' % i, v)
    write("precios.html", page("Pricing", cuerpo, "precios.html"))

if __name__ == "__main__":
    diagnostico(); precios()
