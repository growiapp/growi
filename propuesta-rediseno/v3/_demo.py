#!/usr/bin/env python3
"""V3 de la demo de kinesiología: parte de la V2 y la refina (identidad tipográfica propia sin fuentes externas, credibilidad sectorial,
   preguntas del paciente, enlace de vuelta a GrowiWeb V3). Uso: python propuesta-rediseno/v3/_demo.py"""
import os, re, shutil
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
src = os.path.join(R, 'demo-kinesiologia'); dst = os.path.join(R, 'v3', 'demos', 'kinesiologia')
os.makedirs(dst, exist_ok=True)
for f in ('index.html', 'kine.css', 'kine.js'): shutil.copy(os.path.join(src, f), os.path.join(dst, f))

# ---------- HTML
p = os.path.join(dst, 'index.html'); h = open(p, encoding='utf-8').read()
h = re.sub(r'<link rel="preconnect"[^>]*>\s*<link rel="preconnect"[^>]*>\s*<link href="https://fonts[^>]*>\s*', '', h)   # sin pedidos a terceros
h = h.replace('<a href="../index.html">← Volver a Growi</a>', '<a href="/propuesta-rediseno/v3/web/#trabajos">← Volver a GrowiWeb</a>')
h = h.replace('href="../index.html"', 'href="/propuesta-rediseno/v3/web/"')
h = h.replace('<span>Traumatología</span>', '<span>Rehabilitación traumatológica</span>')
h = h.replace('<head>', '<head>\n<meta name="robots" content="noindex, nofollow">', 1) if 'noindex' not in h else h
faq = '''<section class="sec" id="preguntas">
  <div class="w">
    <h2 class="t">Antes de venir.</h2>
    <p class="sub">Lo que más se pregunta, respondido acá y no por teléfono.</p>
    <div class="qa">
      <details><summary>¿Necesito orden médica?</summary><p>Para la primera consulta no. Si venís de una operación o con indicación médica, traela: nos ayuda a armar el plan.</p></details>
      <details><summary>¿Trabajan con obras sociales?</summary><p>Atendemos algunas coberturas y también particulares. Escribinos con tu obra social y te decimos cómo se coordina.</p></details>
      <details><summary>¿Cuánto dura una sesión?</summary><p>La primera consulta lleva alrededor de 50 minutos porque incluye la evaluación. Las siguientes, entre 40 y 45.</p></details>
      <details><summary>¿Puedo cambiar o cancelar el turno?</summary><p>Sí, avisando por WhatsApp hasta el día anterior, así el horario le sirve a otro paciente.</p></details>
    </div>
    <p class="fake">Contenido de ejemplo: no son las condiciones de ningún consultorio real.</p>
  </div>
</section>
'''
h = h.replace('<section class="sec" id="equipo">', faq + '<section class="sec" id="equipo">', 1)
h = h.replace('<a href="#equipo">Equipo</a>', '<a href="#equipo">Equipo</a>', 1)
h = h.replace('<a href="#turno">Turnos</a><a href="#equipo">Equipo</a>', '<a href="#turno">Turnos</a><a href="#preguntas">Preguntas</a><a href="#equipo">Equipo</a>')
open(p, 'w', encoding='utf-8', newline='\n').write(h)

# ---------- CSS: serif propia, sin fuente externa
p = os.path.join(dst, 'kine.css'); c = open(p, encoding='utf-8').read()
c = c.replace("--f: 'Archivo', system-ui, 'Segoe UI', Roboto, sans-serif;",
              "--f: system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; --fd: 'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif;")
c = c.replace(".brand { font: 800 22px/1 var(--f); font-stretch: 112%; letter-spacing: -.01em; text-transform: uppercase;", ".brand { font: 700 23px/1 var(--fd); letter-spacing: -.005em;")
c = re.sub(r"h1 \{[^}]*\}", "h1 { margin: 16px 0 18px; font: 600 clamp(46px, 7.4vw, 96px)/.98 var(--fd); letter-spacing: -.02em; }", c, count=1)
c = c.replace("h1 span { color: var(--sig); }", "h1 span { color: var(--sig); font-style: italic; }")
c += '''
/* V3 */
.sec h2.t, h2, .t, .info h2 { font-family: var(--fd); font-weight: 600; letter-spacing: -.01em; text-transform: none; font-stretch: 100%; }
.sec h2.t { font-size: clamp(30px, 4.2vw, 50px); line-height: 1.06; }
.steps b, .book-sum h3 { font-family: var(--fd); font-weight: 600; text-transform: none; }
.qa { display: grid; gap: 0; max-width: 820px; border-top: 1.5px solid var(--ink); }
.qa details { border-bottom: 1px solid var(--line); }
.qa summary { cursor: pointer; padding: 16px 4px; font: 700 17px var(--f); list-style: none; display: flex; justify-content: space-between; gap: 16px; min-height: 52px; align-items: center; }
.qa summary::-webkit-details-marker { display: none; }
.qa summary::after { content: "+"; font-size: 22px; color: var(--sig-d); }
.qa details[open] summary::after { content: "−"; }
.qa p { margin: 0 4px 18px; max-width: 62ch; color: #3b434e; }
.fake { margin-top: 14px; font-size: 13px; color: #5b636e; }
@media (max-width: 960px) { .top nav { gap: 14px; font-size: 14px; } }
'''
open(p, 'w', encoding='utf-8', newline='\n').write(c)
print('ok', dst)

open(os.path.join(dst, 'kine.css'), 'a', encoding='utf-8').write('''
.hot { width: 44px; height: 44px; margin: -22px 0 0 -22px; }
.opts span, .opts label span { min-height: 44px; display: inline-flex; align-items: center; }
.fig-tools button { min-height: 44px; padding: 6px 14px; }
''')
