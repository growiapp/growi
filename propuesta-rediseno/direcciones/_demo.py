#!/usr/bin/env python3
"""Demo de kinesiología para las direcciones: parte de la de V3 y corrige el lenguaje clínico.
   Qué cambia: los chips son MOTIVOS DE CONSULTA en lenguaje llano (no diagnósticos ni promesas de resultado), se aclara que la evaluación
   la hace un profesional matriculado, el titular deja de prometer un resultado, y el enlace de vuelta apunta a la comparativa.
   Uso: python propuesta-rediseno/direcciones/_demo.py"""
import os, re, shutil
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
src = os.path.join(R, 'v3', 'demos', 'kinesiologia'); dst = os.path.join(os.path.dirname(__file__), 'demo')
os.makedirs(dst, exist_ok=True)
for f in ('index.html', 'kine.css', 'kine.js'): shutil.copy(os.path.join(src, f), os.path.join(dst, f))
rd = lambda p: open(os.path.join(dst, p), encoding='utf-8').read()
wr = lambda p, s: open(os.path.join(dst, p), 'w', encoding='utf-8', newline='\n').write(s)

js = rd('kine.js')
reg = '''  var regions = {
    front: [
      { k: 'cuello', n: 'Cuello', x: 50, y: 15.6, c: ['Molestias al girar la cabeza', 'Tensión después de muchas horas sentado'], p: 'En la evaluación se revisa la movilidad del cuello y la postura de trabajo.' },
      { k: 'hombro', n: 'Hombro', x: 70, y: 21.5, c: ['Molestias al levantar el brazo', 'Volver al gimnasio con indicación'], p: 'En la evaluación se mide el rango de movimiento de ambos hombros.' },
      { k: 'cadera', n: 'Cadera', x: 59, y: 45, c: ['Molestias al caminar o correr', 'Rehabilitación indicada por tu médico'], p: 'En la evaluación se observa cómo apoyás y cómo se mueve la cadera.' },
      { k: 'rodilla', n: 'Rodilla', x: 61, y: 68.5, c: ['Consulta después de una torcedura', 'Rehabilitación indicada por tu médico', 'Molestias al subir escaleras'], p: 'En la evaluación se revisa el recorrido de la articulación y cómo la usás.' },
      { k: 'tobillo', n: 'Tobillo y pie', x: 62.5, y: 90.5, c: ['Consulta después de una torcedura', 'Volver a correr con indicación'], p: 'En la evaluación se prueba el equilibrio y la movilidad del tobillo.' }
    ],
    back: [
      { k: 'cuello', n: 'Cuello', x: 50, y: 15.6, c: ['Molestias al girar la cabeza', 'Tensión después de muchas horas sentado'], p: 'En la evaluación se revisa la movilidad del cuello y la postura de trabajo.' },
      { k: 'espalda alta', n: 'Espalda alta', x: 50, y: 26, c: ['Molestias entre los omóplatos', 'Postura de trabajo'], p: 'En la evaluación se observa la postura y cómo se mueven los omóplatos.' },
      { k: 'zona lumbar', n: 'Zona lumbar', x: 50, y: 38.5, c: ['Molestias en la espalda baja', 'Molestias al estar mucho tiempo sentado'], p: 'En la evaluación se mira el movimiento de la zona lumbar.' },
      { k: 'parte trasera del muslo', n: 'Parte trasera del muslo', x: 60, y: 55, c: ['Molestias después de correr', 'Consulta para volver al deporte'], p: 'En la evaluación se revisa la movilidad de la parte trasera del muslo.' }
    ]
  };'''
js2 = re.sub(r"  var regions = \{[\s\S]*?\n  \};", lambda m: reg, js, count=1)
assert js2 != js; wr('kine.js', js2)

h = rd('index.html')
h = h.replace('<h1>Volvé a <span>moverte.</span></h1>', '<h1>Pedí tu turno de <span>kinesiología.</span></h1>')
h = h.replace('Marcá dónde te duele y te mostramos con qué consultan en esa zona. Después elegís día y horario para tu primera consulta.',
              'Elegí la zona de tu consulta para ver qué se revisa en la primera evaluación. Después elegís día y horario.')
h = h.replace('<small>Zona elegida</small>', '<small>Motivos de consulta frecuentes · zona elegida</small>')
h = h.replace('Información ilustrativa del demo: no reemplaza una consulta.', 'Son motivos de consulta, no un diagnóstico. La evaluación la hace un profesional matriculado.')
h = h.replace('<a href="/propuesta-rediseno/v3/web/#trabajos">← Volver a GrowiWeb</a>', '<a href="../" onclick="if(history.length>1){history.back();return false}">← Volver</a>')
h = h.replace('Revisamos movilidad, fuerza y dolor para entender tu caso.', 'Un profesional matriculado revisa movilidad y fuerza y habla con vos sobre lo que te pasa.')
h = h.replace('Te proponemos las sesiones y los ejercicios que van con tu situación.', 'Te proponemos cuántas sesiones y qué ejercicios, según lo que se evaluó.')
h = h.replace('La primera consulta es una evaluación, no una sesión a ciegas.', 'La primera consulta es una evaluación.')
assert 'Pedí tu turno de' in h; wr('index.html', h)
wr('kine.css', rd('kine.css') + chr(10) + 'h1 { font-size: clamp(40px, 5.4vw, 72px); }' + chr(10))
# revisión adversarial: WhatsApp en pestaña nueva (dentro del marco no debe navegar la demo), sin «← Volver» ambiguo, sin rótulo clínico suelto
h = rd('index.html')
h = re.sub(r'<a ([^>]*href="https://wa\.me[^"]*"[^>]*?)>', lambda m: '<a ' + m.group(1) + ('' if 'target=' in m.group(1) else ' target="_blank" rel="noopener noreferrer"') + '>', h)
i = h.find(' · <a href="../" onclick')
if i >= 0:
    j = h.index('← Volver</a>', i) + len('← Volver</a>'); h = h[:i] + h[j:]
wr('index.html', h.replace('0–135°', ''))
print('ok', dst)
