# Comparativa, verificación y hub de la revisión r2 (cierre de dirección). Uso: python _docs_r2.py && python _docs_r2b.py
import os, sys, io
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _docs_r2 import page, tabla, write, E

PRE = "../evidencia/previas/"
EV = "../evidencia/"

def fig(src, cap):
    return '<figure class="fg"><a href="%s"><img src="%s" alt="%s" loading="lazy"></a><figcaption>%s</figcaption></figure>' % (src, src, E(cap), E(cap))

def leer(n):
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), n)
    return io.open(p, encoding="utf-8").read() if os.path.exists(p) else ""

def comparativa():
    c = ('<p class="eyebrow">Comparación</p><h1>Vigente, 17177a1, r2 y r2 con el cierre de dirección</h1>'
         '<div class="aviso">Capturas reales del mismo ancho. Ninguna versión está publicada: la vigente es la de producción; las otras son locales.</div>'
         '<h2>Qué cambió con el cierre</h2>' +
         tabla(["Pieza", "r2 (ronda anterior)", "r2 con el cierre"], [
             ["GrowiWeb", "Sitio de muestra de un consultorio con la plantilla actual", "Centro Ribera: demo de calidad portfolio (zona del cuerpo, ilustraciones, turnero en cuatro pasos), navegable en escritorio y celular, junto al taller de cerámica"],
             ["GrowiFlow", "Tres escenas sueltas, con poco peso visual", "Un proceso completo en cinco pasos: llega la consulta, se anota sola, la confirmás vos, sale el recordatorio, llega el resumen semanal. La planilla cambia de estado y el resultado se ve"],
             ["Combo", "Dos capturas chicas lado a lado", "Una secuencia de cuatro pasos con capturas reales grandes: el sitio, el WhatsApp, la agenda y la caja de GrowiApp. Aclara que el puente es el WhatsApp y que el paso de la agenda es manual"],
             ["Home en móvil", "Pestañas en desplazamiento horizontal; el producto aparecía recién al final de la primera pantalla", "Pestañas en cuadrícula 2×2 sin desplazamiento; el titular y el párrafo son más chicos y la demo asoma en la primera pantalla"],
             ["Prueba social", "Sección aparte de Colo Café, lejos de GrowiApp", "Caso real dentro de la pestaña GrowiApp, junto a la demo"],
             ["Contenido redundante", "Caso, garantía en ticket y 8 preguntas frecuentes", "Se quitó la sección aparte del caso y el ticket de garantía; 6 preguntas frecuentes"],
             ["Páginas /web/ y /app/", "Mostraban una demo distinta de la home y la lista del hero se rompió por un choque de clases que introduje", "Unificadas en Centro Ribera; defecto corregido (lo detectó la crítica independiente)"],
             ["Paquete de revisión", "Dependía de la raíz del repositorio (<code>/fonts</code>, <code>shared.js</code>, demos de GrowiWeb) y de otra carpeta de evidencia", "Autocontenido: <code>vendor/</code>, demos propias y evidencia dentro de la carpeta. Se sirve desde la propia carpeta sin errores 404"]]) +
         '<h2>Correcciones finales: lo que se ve ahora</h2><div class="duo">' + fig(EV + "c2-home-web-d.png", "Home, GrowiWeb: Centro Ribera en vista de celular, con «Abrir la demo completa»") + fig(EV + "c2-web-hero-d.png", "/web/: la misma presentación en el encabezado") + fig(EV + "c2-flow-4-d.png", "GrowiFlow: entrada por formulario y condiciones de Meta") + fig(EV + "c2-combo-4-d.png", "Combo: Centro Ribera de punta a punta") + fig(EV + "c2-flow-2-m.png", "GrowiFlow en móvil, paso 2") + fig(EV + "c2-combo-3-m.png", "Combo en móvil, paso 3") + '</div>'
         '<h2>Pantalla inicial en escritorio</h2><div class="trio">' + fig(PRE + "vigente-home-d-fold.png", "Vigente") + fig(PRE + "17177a1-home-d-fold.png", "Candidata 17177a1") + fig(EV + "cierre-home-d-fold.png", "r2 con el cierre") + '</div>'
         '<h2>Pantalla inicial en móvil (390 px)</h2><div class="trio">' + fig(PRE + "vigente-home-m-fold.png", "Vigente") + fig(PRE + "17177a1-home-m-fold.png", "17177a1") + fig(EV + "cierre-home-m-fold.png", "r2 con el cierre") + '</div>'
         '<h2>Home completa en escritorio</h2><div class="trio">' + fig(PRE + "vigente-home-d-full.png", "Vigente") + fig(PRE + "17177a1-home-d-full.png", "17177a1") + fig(EV + "cierre-home-d-full.png", "r2 con el cierre") + '</div>'
         '<h2>Las tres demostraciones, antes y después</h2><div class="duo">' +
         fig(EV + "r2-tab-web.png", "GrowiWeb · r2 anterior") + fig(EV + "cierre-tab-web.png", "GrowiWeb · cierre (Centro Ribera)") +
         fig(EV + "r2-tab-flow.png", "GrowiFlow · r2 anterior") + fig(EV + "cierre-flow-3.png", "GrowiFlow · cierre, paso 3 de 5") +
         fig(EV + "r2-tab-combo.png", "Combo · r2 anterior") + fig(EV + "cierre-combo-4.png", "Combo · cierre, paso 4 de 4") + '</div>'
         '<h2>Motion explicativo: cuadros del recorrido real</h2><p class="lead">Se capturó la secuencia sin tocar nada: la animación avanza sola un paso cada 2,6 segundos, una sola vez, y se puede recorrer con los botones numerados o repetir.</p>'
         '<div class="duo">' + fig(EV + "cierre-motion-flow.png", "GrowiFlow: cinco cuadros del autoplay") + fig(EV + "cierre-motion-combo.png", "Combo: cuatro cuadros del autoplay") + '</div>'
         '<h2>Móvil: las cuatro pestañas</h2><div class="quad">' + fig(EV + "cierre-m-app.png", "GrowiApp con caso real") + fig(EV + "cierre-m-web.png", "GrowiWeb") + fig(EV + "cierre-m-flow.png", "GrowiFlow") + fig(EV + "cierre-m-combo.png", "Combo") + '</div>')
    write("comparativa.html", page("Comparativa", c, "comparativa.html"))

def verificacion():
    c = ('<p class="eyebrow">Pruebas</p><h1>Verificación y crítica independiente</h1>'
         '<h2>1. Funcionamiento</h2>' +
         tabla(["Prueba", "Resultado"], [
             ["Desborde horizontal: 12 anchos (320 a 1920 px) × 4 pestañas (GrowiWeb en celular) + páginas de app y web", "0 px en todos"],
             ["Navegación por teclado: pestañas con flechas, Inicio y Fin; pasos de Flow y Combo con Enter sobre botones reales", "Pasa"],
             ["Secuencia de GrowiFlow: avanza sola por los 5 pasos, se detiene al interactuar y «Ver de nuevo» reinicia", "Pasa"],
             ["Secuencia de Combo: escenas 1, 2 y 3-4 según el paso", "Pasa"],
             ["Centro Ribera dentro de la home: elegir zona y llegar al turnero (navegación real dentro del marco); taller de cerámica", "Pasa"],
             ["Movimiento reducido: sin transiciones ni anillo pulsante, sin avance automático y sin botón «Ver de nuevo»; queda el estado final y los botones numerados", "Pasa"],
             ["Estabilidad visual (CLS) en una visita completa de escritorio", "0,001 (bueno: menos de 0,1)"],
             ["Carga de la home en móvil: 10 recursos, 143 KB transferidos, evento <code>load</code> a 230 ms en local", "Medido en servidor local, sin red real"],
             ["Armador de consulta: 46 combinaciones (ARS y USD) contra un cálculo independiente", "46 de 46 correctas"],
             ["Importes: todos los de home, app y web están en el inventario vigente y se convierten bien (FX 1535); Flow «desde» USD 79", "Sin fuera de inventario ni conversiones erróneas"],
             ["Aviso L1 textual en home, app y web", "Presente en las tres"],
             ["Paquete servido solo desde su carpeta: peticiones con error 404 o fallidas (salvo WhatsApp y analítica)", "Ninguna"],
             ["Enlaces locales de home, app, web y revisión (53)", "Ninguno roto"],
             ["Errores de consola y de página", "Ninguno"]]) +
         '<h2>1b. Correcciones finales (resultado renderizado)</h2>' +
         tabla(["Prueba", "Resultado"], [
             ["Desborde horizontal: 7 anchos (320 a 1920 px) × 4 pestañas de la home, /web/ y /app/", "0 px en todos (se encontró y corrigió un desborde en /web/ a 390 px y menos)"],
             ["Texto menor a 12 px en home, /web/ y /app/", "Ninguno: rótulos, sellos y leyendas subidos a 12 px"],
             ["Teclado: flechas, Inicio y Fin en las pestañas; Enter en los pasos de GrowiFlow", "Pasa"],
             ["Movimiento reducido: sin botón «Ver de nuevo», sin animación; queda el último paso", "Pasa"],
             ["Centro Ribera dentro de la home (celular y escritorio): elegir zona y llegar al turnero; demo completa; taller de cerámica; mismo marco en /web/", "Pasa (el turnero aclara que es una simulación)"],
             ["Importes de home, app y web contra la versión anterior", "Idénticos"],
             ["Aviso L1 textual en home, app y web", "Presente en las tres"],
             ["Peticiones con error 404 y errores de consola en el recorrido", "Ninguno"]]) +
         '<h2>2. Paquete reproducible</h2><ul class="bul"><li>Ya no depende de la raíz del repositorio: los compartidos (<code>shared.js</code>, <code>shared.fx.js</code>, <code>shared.css</code> y las tipografías) están en <code>vendor/</code>, y las demos de GrowiWeb (Centro Ribera y cerámica) en <code>demos/web/</code>.</li>'
         '<li>Se quitó la analítica (Plausible) de las demos incluidas, para que el paquete no emita eventos al evaluarse.</li>'
         '<li>Los enlaces a las otras líneas (GrowiFlow, Combo, Invitaciones) y a términos y privacidad apuntan al sitio publicado (<code>https://growi.ar/…</code>); sin conexión esos enlaces no abren, pero nada del recorrido depende de ellos.</li>'
         '<li>Cómo abrirlo: ver <code>LEEME.md</code> (servidor local con un comando, o el <code>.bat</code> incluido). Abrir <code>index.html</code> con doble clic no alcanza para los marcos de demo en todos los navegadores.</li></ul>'
         '<h2>3. Skills de criterio y motion</h2><p class="lead">No se invocaron las skills de activación manual. Para el motion se aplicaron sus criterios a mano: solo se anima lo que explica un proceso (aparición de cada mensaje y fila al avanzar el paso, anillo sobre el botón «Pedir turno»); solo <code>opacity</code> y <code>transform</code>; transiciones de 350 ms con curva de salida, interrumpibles (los botones numerados cambian de estado en cualquier momento); sin animación con teclado en la navegación entre pestañas; movimiento reducido respetado. Comandos manuales sugeridos, sin ejecutar: <code>/anthropic-skills:find-animation-opportunities</code>, <code>/anthropic-skills:animate</code>, <code>/anthropic-skills:review-animations</code>.</p>'
         '<h2>4. Crítica independiente sobre lo renderizado</h2><p class="note"><b>Es la crítica de la ronda anterior, hecha antes de las correcciones finales.</b> Estas no pasaron por una evaluación externa: queda pendiente.</p>' + (leer("_critica.html") or '<p class="note">Pendiente.</p>') +
         '<h2>5. Ronda anterior de crítica (r2 sin el cierre)</h2>' + leer("_critica_anterior.html"))
    write("verificacion.html", page("Verificación", c, "verificacion.html"))

def hub():
    c = ('<p class="eyebrow">Correcciones finales</p><h1>Revisión de la candidata r2</h1>'
         '<div class="aviso"><b>Local y no publicada.</b> Correcciones finales sobre r2: GrowiFlow ya no promete capturar solas las consultas de WhatsApp e Instagram (<a href="auditoria-flow.html">auditoría</a>), Centro Ribera se presenta igual en la home y en /web/, el Combo sigue a un único negocio y se corrigieron defectos de legibilidad y de navegación móvil. No se hizo otra ronda de crítica externa: queda pendiente.</div>'
         '<div class="cards"><a class="cd" href="../"><b>Abrir la home</b><span>Recorrido navegable: GrowiApp, GrowiWeb, GrowiFlow y Combo.</span></a>'
         '<a class="cd" href="comparativa.html"><b>Comparativa</b><span>Vigente, 17177a1, r2 y r2 con el cierre, en escritorio y móvil, con el motion en cuadros.</span></a>'
         '<a class="cd" href="auditoria-flow.html"><b>Auditoría de GrowiFlow</b><span>Qué se afirma sobre capturar consultas solas, qué hay implementado y qué depende de Meta.</span></a>'
         '<a class="cd" href="verificacion.html"><b>Verificación y crítica</b><span>Pruebas, paquete reproducible y crítica independiente.</span></a>'
         '<a class="cd" href="economia.html"><b>Matriz económica</b><span>Tres escenarios de horas: actuales supuestas, estandarizadas propuestas y verificadas (sin datos).</span></a></div>')
    write("index.html", page("Inicio", c, "index.html"))

if __name__ == "__main__":
    comparativa(); verificacion(); hub()
