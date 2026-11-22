# Páginas de revisión: dirección creativa, comparativa, verificación y punto de entrada. Uso: python _docs.py && python _docs2.py
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _docs import page, tabla, write, E

def lin(c):
    c /= 255
    return c / 12.92 if c <= .03928 else ((c + .055) / 1.055) ** 2.4
def lum(h):
    h = h.lstrip("#"); r, g, b = [int(h[i:i + 2], 16) for i in (0, 2, 4)]
    return .2126 * lin(r) + .7152 * lin(g) + .0722 * lin(b)
def cr(a, b):
    la, lb = lum(a), lum(b)
    if la < lb: la, lb = lb, la
    return (la + .05) / (lb + .05)

# =================================================== DIRECCIÓN CREATIVA
def direccion():
    pal = [("Tinta", "#0C0C0C", "Texto, bordes, botón secundario, bloques oscuros.", "#F6F6F4"),
           ("Papel", "#F6F6F4", "Fondo general de página.", "#0C0C0C"),
           ("Térmico", "#FFFEFA", "Superficie del ticket y del pie: lo que se «imprime».", "#0C0C0C"),
           ("Verde Growi", "#1A6B47", "Acción y estado «andando»: CTAs, checks, eyebrows.", "#FFFFFF"),
           ("Verde claro", "#E3EFE8", "Fondo de las secciones de precios y preguntas.", "#0C0C0C"),
           ("Marcador", "#F4D03F", "Único énfasis: la palabra clave del H1 y la etiqueta «recomendado». Nunca texto.", "#0C0C0C"),
           ("Gris texto", "#3F3F3A", "Condiciones, notas y texto secundario.", "#F6F6F4")]
    sw = "".join('<div class="sw"><i style="background:%s"></i><b>%s</b><code>%s</code><span>%s</span><em>Contraste con %s: %.1f:1</em></div>' % (h, n, h, E(f), c, cr(h, c)) for n, h, f, c in pal)
    comp = [("Ticket de presupuesto", "Plan, qué incluye, precio y condiciones en una pieza con borde dentado, líneas punteadas y precio en mono. Es la forma de la promesa «precio y fecha por escrito». Se usa donde hay un presupuesto real; no se aplica a todo."),
            ("Fila índice de solución", "Número, nombre grande, una frase y precio «desde». Reemplaza a las tres tarjetas iguales: se escanea de arriba abajo y admite cinco líneas."),
            ("Armador de consulta", "Marcás lo que necesitás y se imprime una referencia con precios «desde» y el mensaje de WhatsApp. Es un estimador de consulta, rotulado «Referencia» y con el aviso «esto no es una compra»."),
            ("Banda «antes de empezar»", "Bloque oscuro con tres pasos y el sello «Antes de empezar: precio y fecha estimada, por escrito»."),
            ("Marco de demo", "Las capturas reales de las demos del sitio dentro de un marco de navegador. No se dibujan interfaces."),
            ("Pie con aviso L1", "El aviso de lanzamiento (sin contrataciones ni pagos) en Epilogue legible, no en letra mínima.")]
    cm = "".join("<li><b>%s</b><span>%s</span></li>" % (a, E(b)) for a, b in comp)
    cuerpo = ('<p class="eyebrow">Fase D</p><h1>Una dirección creativa: «Presupuesto a la vista»</h1>'
              '<p class="lead">Una sola dirección, fundada en lo más verificable que Growi dice hoy: <b>el precio y la fecha estimada van por escrito antes de empezar</b>. El sistema visual convierte esa promesa en forma: el ticket. No es un tema intercambiable: sale de la propuesta comercial.</p>'
              '<h2>Principios</h2><ol class="steps">'
              '<li><b>El presupuesto se ve.</b><span>Precio, alcance y condiciones están siempre legibles, como en un ticket. Nada escondido en letra mínima.</span></li>'
              '<li><b>Mostrador, no oficina.</b><span>Para el negocio de barrio: papel térmico, números, tinta. Tono cercano y concreto; nada de promesas de ganar dinero.</span></li>'
              '<li><b>Una decisión por pantalla.</b><span>Cada sección tiene una tarea. Se elige por necesidad antes que por producto.</span></li>'
              '<li><b>El verde significa «andando».</b><span>Acción y estado, con moderación. El amarillo marca una sola cosa por pieza.</span></li>'
              '<li><b>El movimiento explica.</b><span>Imprime un presupuesto, marca una palabra, ordena una elección. Si no explica, no se anima.</span></li></ol>'
              '<h2>Tipografía</h2><div class="spec"><p class="s1">Tu negocio, andando.</p><p class="s2">Titulares en Epilogue 800, tracking −.05em, interlineado .92 a 1. Texto en Epilogue 400 a 700, 16,5 a 17 px.</p><p class="s3 mono">$23.000 /mes · PLAN 01 · 7 días</p><p class="s2">IBM Plex Mono (SIL OFL 1.1, alojada, 29 KB) solo para datos: precios, códigos, etiquetas y números. Las condiciones y notas largas van en Epilogue para que se lean. Syne 800 queda solo para el wordmark «Growi.».</p></div>'
              '<h2>Paleta y función</h2><div class="swg">%s</div>'
              '<h2>Composición</h2><ul class="bul"><li>Columnas asimétricas (1,15 / 0,85), alineación a la izquierda, titulares grandes. Se abandona el hero centrado y las tres tarjetas iguales.</li><li>Ritmo: papel, papel, oscuro, verde claro, verde. Una sola banda oscura por página.</li><li>Líneas finas y punteadas como estructura; esquinas casi rectas (6 px): el papel no se redondea.</li></ul>'
              '<h2>Bloques comerciales y componentes compartidos</h2><ul class="steps">%s</ul>'
              '<h2>Ilustración, fotografía e identidad gráfica</h2><ul class="bul">'
              '<li><b>Ilustración:</b> objetos del comercio (ticket, agenda, cartel, sobre) en trazo de 2 px, verde y tinta. Hoy hay cinco íconos de línea, uno por solución. Sin personas ni mascotas.</li>'
              '<li><b>Fotografía:</b> solo negocios reales, con consentimiento y luz natural. Nada de bancos de imágenes. Mientras no haya material propio, la prueba visual son las capturas reales del producto y de las demos. No se generó ninguna imagen nueva con IA en esta etapa.</li>'
              '<li><b>Identidad:</b> se conservan el wordmark, el verde #1A6B47 y el off-white del sitio.</li></ul>'
              '<h2>Cómo se distinguen las cinco líneas sin fragmentar la marca</h2><ul class="bul"><li>Mismo ticket y misma tipografía; cada línea tiene un código (01 a 05), un ícono propio y una frase de «para qué sirve». No hay un color por línea: eso fragmentaría.</li><li>Combo se lee como suma (ticket compartido) e Invitaciones se separa como «Para tus eventos».</li><li>Límite actual: Flow, Combo e Invitaciones todavía tienen el diseño vigente; al entrar desde el menú, la marca cambia de estilo.</li></ul>'
              '<h2>Reglas de motion y dónde se aplicaron</h2><ul class="bul"><li><b>Reglas:</b> movimiento solo si explica; UI bajo 300 ms y explicativo hasta unos 700 ms; solo transform, opacity y clip-path; con «reducir movimiento» todo queda en su estado final; nada animado por acciones de teclado repetidas; hover con movimiento solo en puntero fino.</li>'
              '<li><b>1. El ticket que se imprime</b> (planes de GrowiApp y GrowiWeb): cada línea entra en orden (55 ms de escalonado). Explica «qué incluye» como un presupuesto que sale de la impresora. El precio y el botón se ven desde el primer cuadro. Evidencia: <a href="../evidencia/motion-ticket.gif">motion-ticket.gif</a> y <a href="../evidencia/motion-ticket.png">fotogramas con tiempos</a>.</li>'
              '<li><b>2. El armador de consulta</b> (home): al marcar una necesidad se imprime su línea con el precio «desde» y se recalcula la referencia. Orienta una elección. Evidencia: <a href="../evidencia/motion-armador.gif">motion-armador.gif</a> y <a href="../evidencia/motion-armador.png">fotogramas</a>.</li>'
              '<li><b>3. El marcador del titular</b> (una vez, 0,7 s): identidad, nivel de «raro».</li></ul>'
              '<div class="aviso"><b>Capacidades manuales no ejecutadas.</b> <code>design-taste-frontend</code>, <code>impeccable</code>, <code>find-animation-opportunities</code>, <code>animation-vocabulary</code>, <code>animate</code> y <code>review-animations</code> son de invocación manual y no se ejecutaron en esta etapa; los criterios de motion de arriba son criterio propio, no el resultado de esas skills. Comandos (el prefijo se verificó solo en las que ya se usaron antes): <code>/anthropic-skills:design-taste-frontend</code>, <code>/anthropic-skills:impeccable critique</code>, <code>/anthropic-skills:find-animation-opportunities</code>, <code>/anthropic-skills:animate</code>, <code>/anthropic-skills:review-animations</code>. UI UX Pro Max (uso manual) tampoco se usó. Se ejecutaron <code>ux-ui-strategy</code>, <code>landing-page-builder</code> (como criterio de revisión) y <code>natural-writing</code> (auditoría de textos).</div>'
              % (sw, cm))
    write("direccion.html", page("Dirección creativa y motion", cuerpo, "direccion.html"))

# =================================================== COMPARATIVA
def comparativa():
    met = tabla(["Página", "Palabras", "Alto escritorio (px)", "Alto móvil (px)", "Enlaces a WhatsApp", "Elementos de precio"], [
        ["Home", "875 → 741 (−15%)", "6.579 → 5.437 (−17%)", "9.400 → 8.291 (−12%)", "7 → 7", "8 → 9"],
        ["GrowiApp", "1.402 → 820 (−42%)", "8.605 → 5.474 (−36%)", "13.320 → 7.370 (−45%)", "12 → 9", "9 → 8"],
        ["GrowiWeb", "1.434 → 949 (−34%)", "9.716 → 6.737 (−31%)", "13.849 → 8.885 (−36%)", "18 → 11", "18 → 11"]])
    def par(titulo, a, b):
        return ('<h3>%s</h3><div class="pair"><figure><img src="../evidencia/actual/%s" alt="Sitio vigente: %s" loading="lazy"><figcaption>Vigente</figcaption></figure>'
                '<figure><img src="../evidencia/%s" alt="Candidata: %s" loading="lazy"><figcaption>Candidata</figcaption></figure></div>' % (E(titulo), a, E(titulo), b, E(titulo)))
    cuerpo = ('<p class="eyebrow">Comparativa</p><h1>Sitio vigente frente a la candidata</h1>'
              '<p class="lead">Capturas reales en 1440 y 390 px. Páginas completas: <a href="../evidencia/actual/home-d-full.png">vigente</a> y <a href="../evidencia/c-home-d-full.png">candidata</a> (home); <a href="../evidencia/actual/app-d-full.png">vigente</a> y <a href="../evidencia/c-app-d-full.png">candidata</a> (GrowiApp); <a href="../evidencia/actual/web-d-full.png">vigente</a> y <a href="../evidencia/c-web-d-full.png">candidata</a> (GrowiWeb).</p>'
              '<h2>Métricas de estructura</h2>%s'
              '<p class="note">Palabras: texto renderizado, sin contenido cerrado en acordeones. En GrowiWeb de la candidata, los planes del sitio institucional están en una pestaña y no se cuentan hasta abrirla. Qué se condensó: tablas comparativas que repetían precios, bloques de confianza repetidos, y la demo interactiva de GrowiApp, que pasó a captura con acceso a la demo vigente. Las condiciones comerciales y el aviso L1 se conservan textuales.</p>'
              '<h2>Escritorio</h2>%s%s%s<h2>Móvil</h2>%s%s%s'
              % (met, par("Home · primera pantalla", "home-d-fold.png", "c-home-d-fold.png"), par("GrowiApp · primera pantalla", "app-d-fold.png", "c-app-d-fold.png"), par("GrowiWeb · primera pantalla", "web-d-fold.png", "c-web-d-fold.png"),
                 par("Home · móvil", "home-m-fold.png", "c-home-m-fold.png"), par("GrowiApp · móvil", "app-m-fold.png", "c-app-m-fold.png"), par("GrowiWeb · móvil", "web-m-fold.png", "c-web-m-fold.png")))
    write("comparativa.html", page("Comparativa", cuerpo, "comparativa.html"))

# =================================================== VERIFICACIÓN
def verificacion():
    ver = tabla(["Verificación", "Cómo", "Resultado"], [
        ["Estructura del repositorio", "git: origin/main frente a la rama", "El sitio publicado es 7a2130c. Ninguna página real fue modificada: la candidata vive en propuesta-rediseno/candidata-360/."],
        ["Escritorio 1440, móvil 390", "Playwright, capturas completas", "Sin desborde horizontal en home, GrowiApp y GrowiWeb. Carrusel de planes en móvil, con scroll interno."],
        ["Armador de consulta", "Playwright, 8 combinaciones", "Combo landing $276.000, combo institucional $760.000, GrowiFlow −10% como cliente web $123.000: coinciden con las condiciones vigentes. Cada descuento muestra el antes y el después."],
        ["Precios y moneda", "Comparación con el sitio vigente", "Valores en pesos idénticos a los vigentes (mismo tipo de cambio de shared.fx.js); anual de GrowiApp −15% con la misma función."],
        ["Teclado", "Tab y espacio sobre el armador; flechas en las pestañas de GrowiWeb", "Funciona. El foco es visible (3 px verde)."],
        ["Reducir movimiento", "Emulación prefers-reduced-motion", "Sin clase de movimiento: el ticket, el marcador y el armador quedan en su estado final, sin animar."],
        ["Consola", "Playwright, pageerror y console", "Sin errores ni advertencias en las tres páginas."],
        ["Accesibilidad y buenas prácticas", "Lighthouse (home y GrowiApp en móvil, GrowiWeb en escritorio)", "100 y 100. SEO 66 solo por el noindex intencional. <b>No se usa como criterio de diseño.</b>"],
        ["Rendimiento", "Chrome DevTools, móvil emulado (CPU 4x, 4G rápida), home", "LCP 740 ms, CLS 0,00. El LCP es texto; las imágenes pesadas están bajo el pliegue y son lazy."],
        ["Contraste de condiciones", "Colores medidos", "Texto secundario #3F3F3A sobre papel y térmico: ≥ 9:1. Las notas pasaron de mono 12 px a Epilogue 14 px."],
        ["Medición", "Revisión de shared.js", "Se reutilizan los eventos del sitio y el ref dentro del mensaje. Evento nuevo solo en la candidata: consulta_armada (con las líneas elegidas). No se activó nada en producción."],
        ["Textos", "natural-writing en modo auditoría", "Se unificó la promesa «fecha estimada», se quitó la repetición de «antes de empezar», se unificaron rótulos de CTA y se evitó la repetición de «necesit-» en titulares."]])
    crit = tabla(["#", "Hallazgo de la crítica independiente", "Tipo", "Estado"], [
        ["1", "El armador y el CTA verde compiten en el primer pantallazo", "Riesgo comercial", "Corregido: en reposo hay un solo CTA verde; el del armador pasa a contorno hasta que se marca algo; en móvil se oculta el secundario."],
        ["2", "El armador con marcas parece un carrito de compras", "Riesgo comercial", "Corregido: bloque rotulado «Referencia · una vez / por mes», aviso permanente «Esto no es una compra», sin marcador amarillo en el total. Sigue siendo la mayor tensión del diseño: requiere decisión del propietario."],
        ["3", "Descuentos sin contexto leen como contradicciones de precio", "Error de consistencia", "Corregido: cada línea muestra «antes» y «después» y la causa."],
        ["4", "Notas y condiciones en mono pequeño y gris", "Riesgo comercial", "Corregido: Epilogue 14 px y color más oscuro; el mono queda para datos."],
        ["5", "La banda oscura pesa más que el caso real", "Riesgo comercial", "Corregido: el caso real sube antes de «Empezar es escribirnos»."],
        ["6", "Se pierde la demo interactiva de GrowiApp", "Riesgo comercial", "Mitigado: botón visible «Probar la demo interactiva» hacia la demo vigente. La demo no se reconstruyó dentro de la candidata."],
        ["7", "Tickets de alturas desiguales", "Error", "Ya alineados con flex (el reproductor de la crítica los vio en una captura anterior); el precio y el botón se ven desde el primer cuadro."],
        ["8", "El marcador amarillo se repite demasiado", "Preferencia", "Corregido: queda en el H1 y en «recomendado»; se quitó de total, pestañas y sello."],
        ["—", "Se pierden rubros, FAQ y «Hecho en Argentina»", "Pérdida de contenido", "Restaurado: FAQ completo textual (home 8, GrowiApp 11, GrowiWeb 7+2), fila de rubros y un check «Hecho en Argentina…». No se rehízo el bloque «Para tu tipo de negocio» ni el cruce con GrowiFlow en GrowiApp."],
        ["—", "El H1 no dice qué es Growi", "Riesgo comercial", "Mitigado: el eyebrow dice «Sistema, sitio web y automatizaciones para negocios de Argentina». Hipótesis: «Tu negocio, andando.» necesita prueba A/B."]])
    pend = ("<li><b>Alto, bloqueante para publicar:</b> Flow, Combo e Invitaciones conservan el diseño vigente; al navegar desde el menú la marca cambia de estilo. Esta etapa no los rediseñó, según el alcance.</li>"
            "<li><b>Alto, decisión del propietario:</b> el armador funciona como estimador, pero un ticket con total puede leerse como carrito en un sitio sin cobro. Alternativa: dejarlo como selector sin importes.</li>"
            "<li><b>Medio:</b> la demo interactiva de GrowiApp y el bloque de rubros ampliado no están en la candidata; la vista de teléfonos de Invitaciones tampoco.</li>"
            "<li><b>Medio:</b> el paquete Epilogue pesada + mono + marcador amarillo es distintivo frente a la competencia local de pymes, pero es una estética que ya circula; hay que confirmarlo con casos propios.</li>"
            "<li><b>Medio:</b> sin pruebas en teléfono real, Safari, Firefox ni lector de pantalla. La fluidez de las animaciones se verificó con fotogramas con tiempos, no con fps.</li>"
            "<li><b>Bajo:</b> los rótulos de CTA varían según el contexto (Consultar, Pedir presupuesto, Solicitar una demo); es el texto vigente.</li>"
            "<li><b>Sin datos:</b> no hay datos de conversión. Todo lo comercial es hipótesis hasta medir. No se inventó ningún cliente, testimonio ni métrica; el único caso es el real ya publicado.</li>")
    reco = ("<p class=\"lead\"><b>Recomendación:</b> la dirección merece seguir. Mejora la claridad de «cómo empezar» y la honestidad del precio, acorta las páginas entre 15% y 45% sin quitar condiciones y tiene una identidad propia. No está lista para publicarse: falta el sistema de las otras tres líneas, decidir el destino del armador y reponer la demo interactiva. El siguiente punto de decisión es si extender el sistema al resto del sitio y qué escenario de precios evaluar.</p>")
    cuerpo = ('<p class="eyebrow">Fase F</p><h1>Verificación, crítica independiente y recomendación</h1>'
              '<h2>Verificaciones</h2>%s<h2>Crítica independiente y qué se hizo</h2><p class="lead">Una revisión visual independiente sobre las capturas renderizadas (agente nativo, sin pasarle mi conclusión). Se corrigieron los críticos y altos; lo demás queda explícito.</p>%s'
              '<h2>Defectos pendientes</h2><ul class="bul">%s</ul><h2>Recomendación</h2>%s' % (ver, crit, pend, reco))
    write("verificacion.html", page("Verificación y crítica", cuerpo, "verificacion.html"))

# =================================================== INICIO
def inicio():
    cards = [("1", "Diagnóstico integral priorizado", "Qué está mal hoy, con evidencia y por impacto. Hechos, hipótesis y preferencias separados.", "diagnostico.html"),
             ("2", "Prototipo navegable", "Home, GrowiApp y GrowiWeb con el sistema nuevo. Flow, Combo e Invitaciones quedan contempladas en la navegación.", "../index.html"),
             ("3", "Comparativa visual", "Vigente frente a candidata en escritorio y móvil, con métricas.", "comparativa.html"),
             ("4", "Propuesta de pricing", "Inventario, mercado con fuentes, tres escenarios y supuestos. No cambia ningún precio publicado.", "precios.html"),
             ("5", "Dirección creativa y motion", "Sistema «Presupuesto a la vista» y evidencia de las dos aplicaciones de motion.", "direccion.html"),
             ("6", "Verificaciones, crítica y recomendación", "Pruebas en navegador, crítica independiente, defectos pendientes y recomendación.", "verificacion.html")]
    cd = "".join('<a class="lk" href="%s"><span class="mono">%s</span><b>%s</b><span>%s</span></a>' % (h, n, E(t), E(d)) for n, t, d, h in cards)
    cuerpo = ('<p class="eyebrow">Growi 360° · candidata local</p><h1>Revisión de la propuesta</h1>'
              '<p class="lead">Un único punto de entrada para evaluar el trabajo. <b>Todo es local: nada se publicó, ningún precio vigente cambió y el aviso L1, los gates y la producción quedaron intactos.</b></p>'
              '<div class="lks">%s</div>'
              '<h2>Abrir el prototipo</h2><p><a class="btn" href="../index.html">Home</a> <a class="btn o" href="../app/">GrowiApp</a> <a class="btn o" href="../web/">GrowiWeb</a></p>'
              '<p class="note">Servidor local: desde la raíz del repo, <code>python -m http.server 8801</code>, y abrir <code>http://localhost:8801/propuesta-rediseno/candidata-360/revision/</code>. Si tu sistema tiene «reducir animaciones», el pie de cada página trae «Activar animaciones».</p>'
              '<h2>Qué decidir ahora</h2><ol class="steps"><li><b>¿Sigue la dirección «Presupuesto a la vista»?</b><span>Si sí, el siguiente paso es extender el sistema a Flow, Combo e Invitaciones antes de publicar nada.</span></li>'
              '<li><b>¿El armador se queda como estimador o pasa a selector sin importes?</b><span>Es la mayor tensión: ayuda a decidir, pero puede leerse como carrito.</span></li>'
              '<li><b>¿Qué escenario de pricing evaluar?</b><span>Conservador, Recomendado o Premium, con los datos que faltan (horas reales y costos) para decidir.</span></li></ol>' % cd)
    write("index.html", page("Inicio", cuerpo, "index.html"))

if __name__ == "__main__":
    direccion(); comparativa(); verificacion(); inicio()
