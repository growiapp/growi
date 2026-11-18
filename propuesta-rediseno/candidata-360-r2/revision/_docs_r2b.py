# Comparativa, verificación y hub de la revisión r2. Uso: python _docs_r2b.py (después de _docs_r2.py)
import os, sys, io
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _docs_r2 import page, tabla, write, E

ACT = "../../candidata-360/evidencia/actual/"
CAN = "../../candidata-360/evidencia/"
R2 = "../evidencia/"

def fig(src, cap):
    return '<figure class="fg"><a href="%s"><img src="%s" alt="%s" loading="lazy"></a><figcaption>%s</figcaption></figure>' % (src, src, E(cap), E(cap))

CRITICA = ""
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_critica.html")
if os.path.exists(p):
    CRITICA = io.open(p, encoding="utf-8").read()

def comparativa():
    c = ('<p class="eyebrow">Comparación</p><h1>Home vigente, candidata 17177a1 y refinamiento r2</h1>'
         '<div class="aviso">Las tres versiones se comparan con capturas reales del mismo ancho. Ninguna está publicada: la vigente es la de producción, las otras dos son locales.</div>'
         '<h2>Qué cambia, en una tabla</h2>' +
         tabla(["Criterio", "Sitio vigente", "Candidata 17177a1", "Refinamiento r2"], [
             ["Identidad de la home", "Texto + tarjetas por línea", "El «presupuesto a la vista» (ticket) es el eje", "El producto funcionando es el eje; el ticket pasa a ejemplo secundario"],
             ["Cómo se entiende qué hace Growi", "Descripción y mockups estáticos", "Descripción y ticket", "Explorador con la demo real de GrowiApp, sitios de muestra reales de GrowiWeb, explicación animada de GrowiFlow y combo"],
             ["Navegación", "Tres líneas", "Cinco líneas", "Cinco líneas, con Invitaciones separada como «Para tus eventos»"],
             ["Negocio vs. eventos", "Invitaciones fuera del menú", "Mezcladas en el menú", "Banda propia con capturas reales y separación en el menú"],
             ["Demo interactiva real de GrowiApp", "Sí", "No (se había perdido)", "Sí, reintegrada tal cual (iframe)"],
             ["GrowiFlow «desde»", "—", "USD 89 (había un paquete de USD 79)", "USD 79, con los tres paquetes elegibles"],
             ["«Próximamente» presentado como disponible", "—", "Sí (factura ARCA con ✓, bot de Flow)", "No: marca «pronto», sin tilde"],
             ["Desborde horizontal de la home", "No medido", "84 px entre 1001 y 1180 px; 62 px en 1240; 42 px en 1280; 17 px en 1330", "0 px en 19 anchos (320–1920) y en las cuatro pestañas"],
             ["Precios, descuentos y aviso L1", "Publicados", "Sin cambios", "Sin cambios (verificados: ver verificación)"]]) +
         '<h2>Pantalla inicial en escritorio</h2><div class="trio">' +
         fig(ACT + "home-d-fold.png", "Vigente") + fig(CAN + "c-home-d-fold.png", "Candidata 17177a1") + fig(R2 + "r2-home-d-fold.png", "r2") + '</div>'
         '<h2>Pantalla inicial en móvil (390 px)</h2><div class="trio">' +
         fig(ACT + "home-m-fold.png", "Vigente") + fig(CAN + "c-home-m-fold.png", "Candidata 17177a1") + fig(R2 + "r2-home-m-fold.png", "r2") + '</div>'
         '<h2>Home completa en escritorio</h2><div class="trio">' +
         fig(ACT + "home-d-full.png", "Vigente") + fig(CAN + "c-home-d-full.png", "Candidata 17177a1") + fig(R2 + "r2-home-d-full.png", "r2") + '</div>'
         '<h2>El explorador de producto (r2), una pestaña por línea</h2><div class="duo">' +
         fig(R2 + "r2-tab-app.png", "GrowiApp: demo real") + fig(R2 + "r2-tab-web.png", "GrowiWeb: sitio de muestra real") +
         fig(R2 + "r2-tab-flow.png", "GrowiFlow: ilustración rotulada") + fig(R2 + "r2-tab-combo.png", "Combo: capturas reales") + '</div>'
         '<h2>r2 en móvil</h2><div class="quad">' +
         fig(R2 + "r2-home-m-producto.png", "Explorador") + fig(R2 + "r2-home-m-eventos.png", "Eventos aparte") + fig(R2 + "r2-home-m-consulta.png", "Consulta") + '</div>'
         '<h2>Qué se pierde</h2><ul class="bul"><li>La candidata 17177a1 tenía un hero más corto. r2 pone el explorador casi de inmediato; la home pasa de unos 4.800 a unos 6.200 px.</li>'
         '<li>El ticket dejó de ser el eje. Se conserva solo como ejemplo en «Cómo empezar».</li>'
         '<li>GrowiFlow sigue sin recurso visual real: la animación es ilustrativa y está rotulada como tal.</li></ul>')
    write("comparativa.html", page("Comparativa", c, "comparativa.html"))

def verificacion():
    c = ('<p class="eyebrow">Pruebas</p><h1>Verificación y crítica visual</h1>'
         '<h2>1. Desborde horizontal: antes y después</h2><p class="lead">Se midió <code>scrollWidth − clientWidth</code> con Playwright. La candidata 17177a1 desbordaba por el hero; r2 reemplaza ese diseño. Con las pestañas del explorador abiertas (GrowiApp, GrowiWeb en modo celular, GrowiFlow y Combo) se midió en 19 anchos: 320, 360, 390, 600, 768, 820, 900, 1000, 1001, 1024, 1100, 1180, 1240, 1280, 1330, 1366, 1440, 1600 y 1920 px.</p>' +
         tabla(["Ancho", "17177a1", "r2"], [["1001–1180 px", "84 px", "0 px"], ["1240 px", "62 px", "0 px"], ["1280 px", "42 px", "0 px"], ["1330 px", "17 px", "0 px"], ["Resto de los 19 anchos", "0 px", "0 px"]]) +
         '<p class="note">Un primer barrido, hecho con las pestañas cerradas, no había detectado un desborde en móvil de la vista previa de GrowiWeb (ancho de 1280 px). Se corrigió con <code>minmax(0,1fr)</code>, <code>min-width:0</code> y <code>overflow:hidden</code> y se repitió el barrido con todas las pestañas.</p>'
         '<h2>2. Pruebas funcionales</h2>' +
         tabla(["Prueba", "Resultado"], [
             ["Pestañas por teclado (flechas, Inicio, Fin)", "Pasa"],
             ["Demo real de GrowiApp dentro de la home (cuatro rubros, altura automática)", "Pasa"],
             ["Sitios de muestra de GrowiWeb (consultorio y cerámica; escritorio y celular, con escala)", "Pasa"],
             ["Animación de GrowiFlow (tres escenas, rotulada como ilustrativa)", "Pasa"],
             ["Movimiento reducido: sin animaciones, sin botón de repetir", "Pasa"],
             ["Armador de consulta: 46 combinaciones (ARS y USD) contra un cálculo independiente", "46 de 46 correctas"],
             ["Precios: todos los importes de home, app y web están en el inventario vigente y se convierten bien (FX 1535)", "Sin fuera de inventario ni conversiones erróneas"],
             ["Descuentos: combo −10%, Flow −10% con web, App anual −15%", "Coinciden con los vigentes"],
             ["Aviso L1 textual en home, app y web", "Presente en las tres"],
             ["«Próximamente» sin tilde de disponible (app y home)", "Pasa"],
             ["Errores de consola y de página", "Ninguno"]]) +
         '<h2>3. Alcance y límites</h2><ul class="bul"><li>No se publicó ni se hizo push; no se tocaron importes, gates, el aviso L1 ni producción.</li>'
         '<li>No se usaron créditos pagos ni Codex.</li>'
         '<li>Pruebas con Chromium vía Playwright; no se probó en Safari ni en un dispositivo físico.</li>'
         '<li>Skills de criterio ejecutadas antes (revisión de animaciones, escritura natural, CRO, UX, impeccable critique, find-animation-opportunities) corresponden a la candidata anterior; para r2 no se volvieron a correr y sus comandos manuales se listan en el informe.</li></ul>'
         '<h2>4. Crítica visual independiente</h2>' + (CRITICA or '<p class="note">Pendiente.</p>'))
    write("verificacion.html", page("Verificación", c, "verificacion.html"))

def hub():
    c = ('<p class="eyebrow">Corrección de rumbo</p><h1>Revisión de la candidata r2</h1>'
         '<div class="aviso"><b>Local y no publicada.</b> Refinamiento de la home a partir de la candidata 17177a1. Alcance: solo la home como prueba, más ajustes puntuales en GrowiApp y GrowiWeb. El resto del sitio queda a la espera de la evaluación de esta home.</div>'
         '<div class="cards"><a class="cd" href="comparativa.html"><b>Comparativa</b><span>Vigente, 17177a1 y r2, con capturas de escritorio y móvil.</span></a>'
         '<a class="cd" href="economia.html"><b>Matriz económica</b><span>Precio mínimo viable bajo tres juegos de supuestos, con calculadora editable.</span></a>'
         '<a class="cd" href="verificacion.html"><b>Verificación y crítica</b><span>Desborde antes y después, pruebas funcionales y crítica independiente.</span></a>'
         '<a class="cd" href="../"><b>Abrir la home r2</b><span>Local, con el explorador de producto.</span></a></div>'
         '<h2>Problemas objetivos corregidos</h2><ul class="bul"><li>Desborde horizontal de la home entre 1001 y 1355 px.</li><li>GrowiFlow «desde» USD 79.</li><li>«Próximamente» ya no luce como disponible.</li><li>Demo real de GrowiApp reintegrada.</li><li>Importes, descuentos, conversiones y aviso L1 revalidados.</li></ul>')
    write("index.html", page("Inicio", c, "index.html"))

if __name__ == "__main__":
    comparativa(); verificacion(); hub()
