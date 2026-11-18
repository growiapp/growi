# Genera revision/index.html (una sola página). Uso: python _revision.py
import os, io, html
OUT = os.path.dirname(os.path.abspath(__file__))
E = html.escape

def tabla(cab, filas):
    return '<div class="tw"><table><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>' % ("".join("<th scope=\"col\">%s</th>" % c for c in cab), "".join("<tr>%s</tr>" % "".join("<td>%s</td>" % c for c in f) for f in filas))

def fig(src, cap): return '<figure class="fg"><a href="%s"><img src="%s" alt="%s" loading="lazy"></a><figcaption>%s</figcaption></figure>' % (src, src, E(cap), E(cap))

def pares(dev):
    nombres = [("home", "Home"), ("app", "GrowiApp"), ("web", "GrowiWeb"), ("flow", "GrowiFlow"), ("combo", "Combo"), ("inv", "Invitaciones")]
    out = ""
    for k, n in nombres:
        out += '<h3>%s</h3><div class="duo">%s%s</div>' % (n, fig("../evidencia/antes-%s-%s.png" % (k, dev), "Antes · sitio vigente"), fig("../evidencia/despues-%s-%s.png" % (k, dev), "Después · R3"))
    return out

def pagina():
    cuerpo = ('<p class="eyebrow">Candidata R3 · local y no publicada</p><h1>Una experiencia integrada, lista para evaluar</h1>'
      '<div class="aviso"><b>Cómo abrirla:</b> <code>servir.bat</code> (o <code>python -m http.server 8800</code> en la carpeta) y abrir <a href="../">el inicio</a>. Growi sigue en L1: solo consultas, sin contratación ni pagos. No se publicó nada, no se cambió ningún importe ni gate.</div>'
      '<h2>1. Cambios comerciales relevantes</h2>' + tabla(["Tema", "Antes", "Ahora"], [
        ["Navegación", "Menú con las soluciones repetidas en un selector de producto", "Cinco funciones separadas: <b>global</b> por audiencia («Para tu negocio» desplegable con una línea de «para qué» + «Invitaciones» aparte), <b>descubrimiento</b> por necesidad en la home, <b>exploración</b> en cada línea con su demo, <b>contextual</b> (anclas de la página y «También para tu negocio» al cierre) y <b>conversión</b> (un WhatsApp por sección y botón fijo)"],
        ["Home", "Selector con los nombres de producto, sección repetida de precios y de caso", "«¿Qué necesitás resolver?» (cuatro necesidades con demo real), caso Colo Café en el primer pantallazo, Invitaciones como banda propia con su demo, un solo armador de consulta y 5 preguntas"],
        ["GrowiFlow", "Cinco pasos comprimidos con chat y planilla", "Demostración con causalidad: <b>la tarea manual → qué la dispara → lo que hace sola → lo que recibe el cliente → lo que ganás</b>. Tres tareas a elegir, con datos coherentes. La tarea manual se tacha cuando entra la automatización"],
        ["Combo", "Dos capturas lado a lado", "Un solo negocio (Centro Ribera) del sitio al WhatsApp y a la caja; el WhatsApp aparece como puente, no como conexión automática"],
        ["Invitaciones", "Tres teléfonos superpuestos y texto", "Línea propia: paleta cálida, serif de acento, demos reales de las invitaciones en marcos (tres experiencias y personalización por invitado), qué incluye y qué se evalúa por proyecto, cómo se pide"],
        ["GrowiApp", "Una página larga y cuatro landings por rubro separadas del resto", "Demo real arriba, cuatro rubros enlazados con la demo preseleccionada, caso Colo Café, tres planes y 6 preguntas. Cada rubro: dolores, qué hace, un precio y 4 preguntas"],
        ["Colo Café", "Retirado por falta de autorización documentada", "Recuperado dentro de lo autorizado: nombre, logo y cita textual acordada. Sin métricas ni resultados nuevos"],
        ["Copy de GrowiFlow", "Promesas de captura automática de WhatsApp e Instagram", "Formulario → planilla y avisos por mail como servicio a medida; WhatsApp «con una cuenta habilitada por Meta»; ninguna conexión automática entre productos; las demos se rotulan como simulación con datos ficticios"],
        ["Precios", "Importes repetidos en bloques sueltos", "Importes <b>sin cambios</b>. Cada línea muestra el «desde» en el primer pantallazo y el plan junto a lo que incluye; el aviso «hoy solo recibimos consultas» junto a cada bloque de precios; el ARS estático se calcula igual que el workflow del tipo de cambio"],
      ]) +
      '<h3>Presentación de precios: lectura sin cambiar importes</h3><ul class="bul"><li>La matriz económica de R2 (con supuestos, no con horas verificadas) indica que varios paquetes quedan debajo del margen objetivo aun en el escenario de horas estandarizadas: GrowiApp Start mensual, GrowiWeb Performance, Base y Con turnos, y la sesión de ajuste. Los demás cubren el costo pero no el margen. Ver <code>../candidata-360-r2/revision/economia.html</code>.</li>'
      '<li>Riesgo de subvaloración: real, pero no demostrado. La decisión sensata no es subir importes hoy sino registrar las horas reales de las primeras entregas (el escenario «verificado») y recién ahí decidir. La alternativa sustentada en costos son los mínimos viables de esa matriz; <b>no se aplicó</b>.</li>'
      '<li>Invitaciones sigue sin precio de lista (cotización con seña del 50%); no se inventó un precio.</li></ul>'
      '<h2>2. Antes y después</h2><p class="lead">Capturas reales de la misma altura de pantalla: el sitio vigente (antes) y R3 (después).</p><h3 style="margin-top:28px">Escritorio (1280 px)</h3>' + pares("d") + '<h3 style="margin-top:36px">Móvil (390 px)</h3>' + pares("m") +
      '<p class="note">Capturas de página completa con las imágenes diferidas cargadas, en 390 y 1280 px: carpeta <code>evidencia/completas/</code> (home, GrowiApp, cuatro rubros, GrowiWeb, GrowiFlow, Combo e Invitaciones).</p>'
      '<h2>3. Motion implementado</h2><p class="lead">Solo lo que explica. Transiciones de <code>opacity</code> y <code>transform</code>, una reproducción por visita, interrumpible, y estado final inmediato con movimiento reducido.</p>' + tabla(["Dónde", "Qué explica", "Control"], [
        ["GrowiFlow (página y panel de la home)", "El orden causa-efecto: la tarea manual, el disparador, el trabajo que hace sola, lo que recibe el cliente y el beneficio. La tarea manual se atenúa y se tacha al entrar la automatización", "Se reproduce al llegar a la pantalla; «Reiniciar» y «Ver de nuevo»; cambiar de tarea reinicia; con movimiento reducido se ve el estado final y no hay botón"],
        ["Combo", "El recorrido de un mismo negocio: sitio → WhatsApp (puente) → agenda → venta registrada. Un aro marca el botón «Pedir turno»", "Igual que GrowiFlow"],
        ["Invitaciones", "Cada invitación se abre y se recorre (capítulos, tarjetas, agenda): son las demos reales del sitio vigente", "Manual, en el marco"],
        ["Menú «Para tu negocio»", "Ninguna animación: se abre al instante (se usa a diario)", "Teclado: Enter, flechas y Escape"]]) +
      '<div class="duo">' + fig("../evidencia/motion-flow.gif", "GrowiFlow: secuencia completa (GIF)") + fig("../evidencia/motion-combo.gif", "Combo: recorrido completo (GIF)") + '</div><div class="duo">' + fig("../evidencia/motion-flow-cuadros.png", "GrowiFlow: seis cuadros clave") + fig("../evidencia/motion-combo-cuadros.png", "Combo: seis cuadros clave") + '</div>'
      '<h2>4. Pruebas ejecutadas</h2>' + tabla(["Prueba", "Resultado"], [
        ["Desborde, recortes y texto menor a 12 px: 10 páginas (la home con sus 4 pestañas) × 9 anchos (320, 339, 360, 375, 390, 768, 1024, 1280 y 1440 px)", "0 en todos"],
        ["Hero de Invitaciones en 11 anchos (320 a 1440 px): titular y demo dentro de la pantalla", "Pasa (era un defecto alto en móvil; corregido)"],
        ["Imágenes diferidas forzadas a cargar antes de las capturas completas (390 y 1280 px)", "Ninguna rota"],
        ["Consola y recursos: errores de página, respuestas 4xx/5xx en todo el recorrido", "Ninguno"],
        ["Referencias relativas de todas las páginas (474)", "Ninguna falta"],
        ["Importes: todos los <code>data-price</code> están en el sitio vigente y el ARS estático coincide con el cálculo del workflow del tipo de cambio (FX 1535)", "Sin diferencias"],
        ["Aviso L1 textual en las 10 páginas", "Presente en todas"],
        ["Versión indexable (<code>--release</code>): robots, canonical, analítica, enlaces absolutos y datos estructurados válidos en las 10 páginas", "Pasa"],
        ["Workflow del tipo de cambio sobre la versión indexable (simulación local con <code>--force --venta=1600</code>)", "Actualiza los precios de las páginas sin errores"],
        ["Teclado: menú desplegable (Enter, flechas, Escape y foco), pestañas (flechas, Inicio, Fin), botón de reproducción de las demos", "Pasa"],
        ["Movimiento reducido: GrowiFlow y Combo muestran el estado final, sin botón de reproducción, sin animaciones activas y sin desplazamiento suave", "Pasa"],
        ["Demos: Centro Ribera (zona → turnero), taller de cerámica, GrowiApp (rubros), cada rubro con su demo, Invitaciones (abrir, cambiar de experiencia, cambiar de perfil)", "Funcionan"],
        ["Seguridad básica: nada se envía solo; los formularios de las demos son simulaciones; no se reutilizó ningún endpoint (el Apps Script histórico, sin autenticación, no forma parte de R3)", "Verificado por lectura del código"]]) +
      '<h3>No ejecutado</h3><ul class="bul"><li>Teléfono físico, Safari/iOS y lector de pantalla: <b>pendientes</b>.</li><li>Rendimiento con red real: solo se midió en servidor local.</li></ul>'
      '<h2>5. Skills y herramientas</h2>' + tabla(["Capacidad", "Estado"], [
        ["Playwright (Chromium), herramientas del repositorio (<code>node --check</code>, <code>git apply --check</code>, script del tipo de cambio), subagente nativo independiente", "<b>Ejecutadas</b>"],
        ["<code>natural-writing</code>", "<b>Ejecutada</b> como revisión final de redacción: un ajuste (la condición de Meta en Reportes)"],
        ["<code>ux-ui-strategy</code>, <code>landing-page-builder</code>, <code>design-taste-frontend</code>, <code>impeccable</code>", "<b>Aplicadas como referencia</b> (se ejecutaron antes en esta sesión sobre el sitio vigente; no se volvieron a ejecutar para este brief)"],
        ["<code>find-animation-opportunities</code>, <code>animate</code>, <code>review-animations</code> (y <code>improve-animations</code>)", "<b>No disponibles para el modelo:</b> están bloqueadas para invocación automática. No se simularon. El motion se diseñó con criterio propio y lo revisó el crítico independiente. Comandos para vos: <code>/anthropic-skills:find-animation-opportunities</code>, <code>/anthropic-skills:animate</code>, <code>/anthropic-skills:review-animations</code>"],
        ["UI UX Pro Max", "No se invocó (consulta manual, no autorizada en esta sesión)"]]) +
      '<h2>6. Crítica independiente</h2><p class="lead">Un subagente nativo (no Codex) recorrió el sitio renderizado en 8 anchos, sin recibir las conclusiones del autor. Dictamen original: <b>avanzada y evaluable, pero no aprobable sin una ronda corta de trabajo material</b>. Defectos y estado:</p>' + tabla(["Gravedad", "Hallazgo", "Estado"], [
        ["Alto", "Hero de Invitaciones roto en móvil (2 columnas, titular y teléfono recortados)", "<b>Corregido</b> y medido en 11 anchos"],
        ["Medio", "«%%» literal en el copy de Invitaciones", "<b>Corregido</b>"],
        ["Medio", "La aclaración «sin contratación ni pago» quedaba lejos de las frases de contratar, garantía y seña", "<b>Corregido</b>: aviso corto junto a cada bloque de precios"],
        ["Medio", "Menú móvil sin la línea de «para qué» de cada solución", "<b>Corregido</b>"],
        ["Medio", "Marco de la demo de GrowiApp muy alto, con scroll anidado", "<b>Mitigado</b>: alto máximo = pantalla menos 150 px. Sin prueba táctil real"],
        ["Medio", "Los marcos tardan en cargar (hasta 3 s en el servidor local)", "Abierto: son demos reales sin precarga"],
        ["Bajo", "Personalización de Invitaciones desalineada en escritorio", "<b>Corregido</b>"],
        ["Bajo", "El encabezado fijo tapa el título al saltar por ancla", "<b>Corregido</b>"],
        ["Bajo", "Resaltado amarillo irregular en títulos de varias líneas", "Abierto, cosmético"],
        ["Diseño", "El primer pantallazo de la home no muestra prueba", "<b>Mitigado</b>: caso Colo Café en el primer pantallazo y título del selector menos pesado"],
        ["Diseño", "Las imágenes del Combo se ven en miniatura", "Abierto"],
        ["Diseño", "La navegación todavía repite funciones", "<b>Parcial</b>: contextual oculta en móvil; el menú explica cada solución; se conserva «También para tu negocio» al cierre"]]) +
      '<p class="note"><b>Salvedad:</b> las correcciones se aplicaron después de esa crítica y las verifiqué con mediciones propias, no se volvió a someter la versión corregida a una segunda crítica. Dos defectos más aparecieron en mis propias pruebas y se corrigieron: un choque de nombre de clase que ocultaba el párrafo del hero en móvil y una regresión de columnas en el Combo.</p>'
      '<h2>7. Estado Git y alcance exacto</h2><ul class="bul"><li>Rama <code>propuesta-rediseno-v3</code>, creada desde <code>a65491c</code> (R2 final, intacto en <code>propuesta-rediseno-v2</code>). Commit local; sin push, merge ni deploy.</li>'
      '<li>Todo el cambio está en <code>propuesta-rediseno/candidata-360-r3/</code>. No se modificó ningún archivo del sitio vigente, del workflow ni de producción.</li>'
      '<li>Qué reemplazaría R3 al publicarse: <code>/</code>, <code>/app/</code>, <code>/app/cafeterias|peluquerias|talleres|retail/</code>, <code>/web/</code>, <code>/flow/</code>, <code>/combo/</code> y <code>/invitaciones/</code>, más <code>assets/</code>, <code>demos/</code> (GrowiApp, Centro Ribera, cerámica e Invitaciones) y los recursos de <code>vendor/</code> usados por las demos. Quedan como están: <code>/terminos/</code>, <code>/privacidad/</code>, <code>/solicitudes/</code>, <code>/404</code>, <code>sitemap.xml</code>, <code>robots.txt</code> y los compartidos de la raíz.</li>'
      '<li>Preparación para publicar: versión indexable con canonical, Open Graph, datos estructurados (los del sitio vigente más preguntas frecuentes generadas desde las visibles) y analítica; compatible con el workflow del tipo de cambio. Antes de publicar falta actualizar <code>sitemap.xml</code> y decidir si las demos de GrowiWeb se publican en <code>/demos/web/</code> o en <code>/web/demos/</code>.</li>'
      '<li>El parche de R2 contra el sitio vigente (<code>candidata-360-r2/revision/parche-L1-NO-APLICADO.patch</code>) quedó desactualizado: retiraba el caso de Colo Café, que ya está autorizado.</li></ul>'
      '<h2>8. Recomendación</h2><div class="aviso"><b>Calidad alcanzada:</b> la experiencia es integral y funcional, con una arquitectura de navegación distinta, una demostración de GrowiFlow que explica causa y efecto, un Combo coherente de un solo negocio y una línea de Invitaciones con identidad propia. Está lista para que la evalúes en escritorio y móvil. <b>Para publicar</b> conviene, en este orden: (1) probar en un teléfono real y en Safari/iOS; (2) pasar una segunda crítica independiente sobre esta versión corregida; (3) resolver los pendientes menores (carga de los marcos, resaltado, imágenes del Combo); (4) confirmar con quien opera qué se entrega hoy de GrowiFlow, para sostener los avisos por mail y la planilla; (5) actualizar el sitemap y regenerar el parche. Preparar para publicar no es publicar: nada de esto se publicó.</div>')
    return ('<!doctype html>\n<html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Revisión de la candidata R3 · Growi 360°</title>'
            '<link rel="stylesheet" href="../assets/growi360.css"><link rel="stylesheet" href="rev.css"></head><body><a class="sr" href="#c">Saltar al contenido</a>'
            '<header class="rv-top"><div class="w"><a class="logo" href="../">Growi<i>.</i></a><nav aria-label="Revisión"><a href="../">Abrir la candidata</a></nav></div></header>'
            '<main id="c" class="w rv">%s</main><footer class="rv-foot w"><p>Candidata R3 local, solo para revisión. No publicada: ningún precio, aviso L1, gate ni producción fue modificado.</p></footer></body></html>\n' % cuerpo)

if __name__ == "__main__":
    os.makedirs(os.path.join(OUT, "revision"), exist_ok=True)
    io.open(os.path.join(OUT, "revision", "index.html"), "w", encoding="utf-8", newline="\n").write(pagina())
    print("ok")
