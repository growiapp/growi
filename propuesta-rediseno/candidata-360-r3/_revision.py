# Genera revision/index.html (R3.1, una sola página). Uso: python _revision.py
import os, io, html
OUT = os.path.dirname(os.path.abspath(__file__))
E = html.escape

def tabla(cab, filas):
    return '<div class="tw"><table><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>' % ("".join("<th scope=\"col\">%s</th>" % c for c in cab), "".join("<tr>%s</tr>" % "".join("<td>%s</td>" % c for c in f) for f in filas))

def fig(src, cap): return '<figure class="fg"><a href="%s"><img src="%s" alt="%s" loading="lazy"></a><figcaption>%s</figcaption></figure>' % (src, src, E(cap), E(cap))

def par(k, dev, titulo):
    return '<h3>%s</h3><div class="duo">%s%s</div>' % (titulo, fig("../evidencia/r31/antes-%s-%s.png" % (k, dev), "Antes · R3"), fig("../evidencia/r31/despues-%s-%s.png" % (k, dev), "Después · R3.1"))

# Se completan con el resultado de la crítica independiente posterior a las correcciones
CRITICA = io.open(os.path.join(OUT, "revision", "_critica31.html"), encoding="utf-8").read() if os.path.exists(os.path.join(OUT, "revision", "_critica31.html")) else '<p class="note">Pendiente.</p>'
DICTAMEN = io.open(os.path.join(OUT, "revision", "_dictamen31.html"), encoding="utf-8").read() if os.path.exists(os.path.join(OUT, "revision", "_dictamen31.html")) else ''

def pagina():
    cuerpo = ('<p class="eyebrow">Candidata R3.1 · local y no publicada</p><h1>Cierre de calidad visual y comercial</h1>'
      '<div class="aviso"><b>Cómo abrirla:</b> <code>servir.bat</code> (o <code>python -m http.server 8800</code> en la carpeta) y abrir <a href="../">el inicio</a>. Growi sigue en L1: solo consultas, sin contratación ni pagos. No se publicó nada ni se cambió ningún importe o gate. <b>Pricing:</b> <a href="pricing.html">recomendación separada, no aplicada</a>.</div>'
      + DICTAMEN +
      '<h2>1. Mejoras implementadas</h2>' + tabla(["Diagnóstico", "Qué se hizo"], [
        ["Producto tardío en móvil", "Migas, segundo botón y lista de garantías salen del primer pantallazo; titular más corto; una línea de precio orientativo; la demo entra antes del pliegue. <b>La prueba pasó de 700–900 px de scroll a 443–511 px</b> en las cinco líneas"],
        ["GrowiWeb sin una demostración contundente", "Escaparate con el sitio de muestra real funcionando: navegador de escritorio y teléfono a la vez (solo teléfono en tablet y móvil), cambio al taller de cerámica y demo completa"],
        ["Combo con recursos pequeños", "Tres teléfonos grandes y legibles (sitio, WhatsApp como puente, gestión) con el mismo negocio de punta a punta, en lugar de dos capturas de escritorio reducidas"],
        ["Repetición visual", "El subrayado amarillo queda solo en la home; en las líneas el énfasis es de color. Titulares y títulos de sección más chicos; el titular de la home ya no compite con el selector"],
        ["Carga de las demos", "Póster liviano de la misma demo (15 KB) hasta que carga la real, que lo reemplaza; el escaparate reserva su espacio por CSS. <b>CLS de /web/: de 1,3 a 0 (móvil) y 0,03 (escritorio)</b>. Nada se sustituyó por una imagen: la demo funcional sigue siendo la real"],
        ["Exactitud comercial", "Se bajaron los absolutos («nunca más», «se terminan», «sin perder ni una venta») y la generalización «sale más caro y más lento»; el escaparate dice «una muestra del nivel de diseño que buscamos». Se conservan el aviso «hoy solo recibimos consultas» junto a cada bloque de precios y el caso autorizado de Colo Café"],
        ["Pricing", "Recomendación ejecutiva separada con la matriz de R2, supuestos explícitos, escenarios de margen y confianza. No se aplicó ningún importe"]]) +
      '<h2>2. Antes y después</h2>' + tabla(["Línea (móvil 390 × 844)", "Antes: la demo empieza en", "Después"], [
        ["GrowiApp", "788 px", "455 px"], ["GrowiApp · cafeterías", "896 px", "478 px"], ["GrowiWeb", "818 px", "443 px"], ["GrowiFlow", "702 px", "476 px"], ["Combo", "816 px", "443 px"], ["Invitaciones", "866 px", "511 px"]]) +
      par("web", "d", "GrowiWeb · escritorio") + par("web", "m", "GrowiWeb · móvil") + par("combo", "d", "Combo · escritorio") + par("combo", "m", "Combo · móvil") + par("app", "m", "GrowiApp · móvil") + par("flow", "m", "GrowiFlow · móvil") +
      '<p class="note">Capturas de página completa con las imágenes diferidas cargadas (390 y 1280 px): <code>evidencia/r31/completas/</code>.</p>'
      '<h2>3. Pruebas ejecutadas (sobre la versión final)</h2>' + tabla(["Prueba", "Resultado"], [
        ["Desborde, recortes y texto menor a 12 px: 10 páginas (la home con sus 4 pestañas) × 10 anchos (320, 360, 390, 430, 600, 768, 820, 1024, 1280 y 1440 px, con tablet)", "0 en todos"],
        ["Imágenes diferidas forzadas a cargar (390 y 1280 px); consola; respuestas 4xx/5xx", "Ninguna rota · 0 errores · 0 fallidas"],
        ["Estabilidad y peso de carga en móvil, tablet y escritorio, 10 páginas", "Sin ningún desplazamiento de layout mayor a 0,005 (listando cada <code>layout-shift</code>); 160–267 KB por página. /web/ pasó de CLS 1,3 a 0 al reservar el espacio del escaparate. Una primera medición dio valores altos por apilar observadores: era un artefacto de la prueba"],
        ["Escaparate de GrowiWeb: se carga, retira el póster, cambia a cerámica, vuelve a Ribera y actualiza el enlace de demo completa; el iframe de escritorio no se descarga en móvil ni tablet", "Pasa"],
        ["Pestañas de planes de /web/ con mouse, flechas, Inicio y Fin (se descubrió y corrigió que no cambiaban de panel)", "Pasan"],
        ["Demos: Centro Ribera, GrowiApp con cada rubro, Invitaciones, GrowiFlow y Combo (reproducir, interrumpir, reiniciar, cambiar de tarea)", "Funcionan"],
        ["Teclado (menú «Para tu negocio», pestañas, botones de las demos) y movimiento reducido", "Pasan"],
        ["Importes (todos están en el sitio vigente y el ARS estático coincide con el workflow) y aviso L1 en las 10 páginas", "Sin diferencias · presente en todas"],
        ["Versión indexable <code>--release</code>, datos estructurados y simulación del workflow del tipo de cambio", "Pasan (ver el punto 6)"]]) +
      '<h3>No ejecutado</h3><ul class="bul"><li>Teléfono físico, Safari/iOS y lector de pantalla: <b>pendientes</b>. Rendimiento con red real: solo medido en servidor local.</li></ul>'
      '<h2>4. Skills y herramientas</h2>' + tabla(["Capacidad", "Estado"], [
        ["<code>landing-page-builder</code> (modo asesor)", "<b>Ejecutada</b>: criterio de orden del primer pantallazo móvil, aplicado a las cinco líneas"],
        ["<code>natural-writing</code>", "<b>Ejecutada</b> en la ronda anterior (revisión de redacción); en R3.1 la precisión de copy se hizo a mano"],
        ["<code>ux-ui-strategy</code>, <code>design-taste-frontend</code>, <code>impeccable</code>", "<b>Referencia</b>: no se volvieron a ejecutar en esta iteración"],
        ["<code>find-animation-opportunities</code>, <code>animate</code>, <code>review-animations</code>", "<b>No disponibles</b>: están bloqueadas para el modelo y no se simularon. En R3.1 no se agregó motion nuevo. Comandos para vos: <code>/anthropic-skills:find-animation-opportunities</code>, <code>/anthropic-skills:animate</code>, <code>/anthropic-skills:review-animations</code>"],
        ["Playwright, subagente nativo independiente, herramientas del repositorio", "<b>Ejecutadas</b>"],
        ["<code>tools.md</code>", "Solo existen copias de respaldo (<code>~/.claude/backups</code>); se usó la más reciente como referencia"]]) +
      '<h2>5. Crítica independiente posterior a las correcciones</h2>' + CRITICA +
      '<p class="note">El pricing está en <a href="pricing.html">pricing.html</a>, separado y sin aplicar.</p>')
    return ('<!doctype html>\n<html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Revisión de la candidata R3.1 · Growi 360°</title>'
            '<link rel="stylesheet" href="../assets/growi360.css"><link rel="stylesheet" href="rev.css"></head><body><a class="sr" href="#c">Saltar al contenido</a>'
            '<header class="rv-top"><div class="w"><a class="logo" href="../">Growi<i>.</i></a><nav aria-label="Revisión"><a href="pricing.html">Pricing</a><a href="../">Abrir la candidata</a></nav></div></header>'
            '<main id="c" class="w rv">%s</main><footer class="rv-foot w"><p>Candidata R3.1 local, solo para revisión. No publicada: ningún precio, aviso L1, gate ni producción fue modificado.</p></footer></body></html>\n' % cuerpo)

if __name__ == "__main__":
    os.makedirs(os.path.join(OUT, "revision"), exist_ok=True)
    io.open(os.path.join(OUT, "revision", "index.html"), "w", encoding="utf-8", newline="\n").write(pagina())
    print("ok")
