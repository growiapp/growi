#!/usr/bin/env python3
"""Genera la V3 (prototipo local) a partir de las páginas publicadas. No toca ningún archivo fuera de propuesta-rediseno/v3/.
   Uso (desde la raíz del repo):  python propuesta-rediseno/v3/_construir.py
   Cada página de producción se copia y se edita por reglas explícitas (abajo), así se ve qué cambia y qué se preserva."""
import re, sys, os, io
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'propuesta-rediseno', 'v3')
B = '/propuesta-rediseno/v3/'
WA = 'https://wa.me/5491170593877?text='
NL = chr(10)

def rd(p): return open(os.path.join(ROOT, p), encoding='utf-8-sig').read()

def top_sections(h):
    pat = re.compile(r'<(/?)(section|header)\b[^>]*>'); depth = 0; st = None; out = []
    for m in pat.finditer(h):
        if not m.group(1):
            if depth == 0: st = m.start()
            depth += 1
        else:
            depth -= 1
            if depth == 0: out.append((st, m.end()))
    return out

def find(h, needle):
    """(a,b) de la sección de primer nivel que contiene `needle` en su apertura o su texto"""
    for a, b in top_sections(h):
        if needle in h[a:b]: return a, b
    raise KeyError(needle)

def replace(h, needle, new):
    a, b = find(h, needle); return h[:a] + new + h[b:]
def drop(h, needle):
    a, b = find(h, needle); return h[:a] + h[b:].lstrip('\n')
def faq_drop(h, prefixes):
    def f(m):
        s = re.sub(r'<[^>]+>', '', m.group(1)).strip()
        return '' if any(s.startswith(p) for p in prefixes) else m.group(0)
    new = re.sub(r'<details>\s*<summary>([\s\S]*?)</summary>[\s\S]*?</details>\s*', f, h)
    return new

def wa(txt, ref): return WA + re.sub(r'%0A', '%0A', __import__('urllib.parse').parse.quote(txt + '\n\n(ref: ' + ref + ')'))

# ---------------------------------------------------------------- común a todas las páginas
def comun(h, depth):
    # prototipo: fuera del índice, sin datos estructurados ni metadatos sociales de producción
    h = re.sub(r'<link rel="canonical"[^>]*>\s*', '', h)
    h = re.sub(r'<meta (?:property="og:|name="twitter:)[^>]*>\s*', '', h)
    h = re.sub(r'<script type="application/ld\+json">[\s\S]*?</script>\s*', '', h)
    h = re.sub(r'<meta name="robots"[^>]*>', '<meta name="robots" content="noindex, nofollow">', h)
    # vínculos internos entre las cinco líneas y la home → V3; el resto (rubros, legales) sigue apuntando a producción
    def lk(m):
        path, frag = m.group(1), m.group(2) or ''
        return 'href="' + B + path.lstrip('/') + frag + '"'
    h = re.sub(r'href="(/(?:(?:app|web|flow|combo|invitaciones)/)?)(#[^"]*)?"', lk, h)
    h = h.replace('href="' + B + 'web/demos/', 'href="' + B + 'demos/')
    h = h.replace('href="/web/demos/kinesiologia/"', 'href="' + B + 'demos/kinesiologia/"')
    # navegación: cinco líneas
    h = h.replace('<li><a href="' + B + 'flow/">GrowiFlow</a></li>',
                  '<li><a href="' + B + 'flow/">GrowiFlow</a></li>\n      <li><a href="' + B + 'combo/">Combo</a></li>\n      <li><a href="' + B + 'invitaciones/">Invitaciones</a></li>')
    h = h.replace('<a href="' + B + 'flow/">GrowiFlow</a>\n    <a href="https://wa.me',
                  '<a href="' + B + 'flow/">GrowiFlow</a>\n    <a href="' + B + 'combo/">Combo</a>\n    <a href="' + B + 'invitaciones/">Invitaciones</a>\n    <a href="https://wa.me')
    # capa V3
    h = h.replace('web/#invitaciones', 'web/')
    h = h.replace('</head>', '<link rel="stylesheet" href="' + B + 'v3.css">\n</head>', 1)
    h = h.replace('</body>', '<div class="proto-tag" aria-hidden="true">V3 · prototipo local · no publicado</div>\n<script src="' + B + 'v3.js" defer></script>\n</body>', 1)
    return h

# ---------------------------------------------------------------- HOME
def home(h):
    w1 = wa('Hola Growi, quiero que me recomienden qué me conviene.' + NL + NL + 'Mi rubro:' + NL + 'Qué quiero resolver:', 'home-hero')
    h = replace(h, 'id="top"', f'''<section class="hero" id="top">
  <div class="container">
    <h1 class="h1-stack"><span class="eyebrow">Para comercios y servicios de Argentina</span> <span class="h1-title">Ordená tu negocio,<br><span class="accent">mostralo y automatizalo.</span></span></h1>
    <p class="hero-sub">Sistema de gestión, sitio web y avisos automáticos. Los armamos con vos, los dejamos andando y seguimos del otro lado del WhatsApp.</p>
    <div class="hero-actions">
      <a href="{w1}" class="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer" data-track="home-hero-whatsapp">Hablar por WhatsApp</a>
      <a href="#lineas" class="btn btn-outline btn-lg">Ver las cinco líneas ↓</a>
    </div>
    <p class="v3-hero-note">Cada línea tiene su precio abajo, y el alcance por escrito antes de empezar.</p>
  </div>
</section>

<section class="section" id="orientacion" style="padding-top:24px">
  <div class="container">
    <div class="section-header center">
      <h2 class="section-title reveal">¿Qué te quita más tiempo hoy?</h2>
      <p class="section-lead">Elegí la que más se parezca y te mostramos por dónde empezar.</p>
    </div>
    <div class="v3-picker reveal">
      <div class="v3-picker-q" role="group" aria-label="Qué te quita más tiempo">
        <button type="button" data-k="app" aria-pressed="true">No sé cuánto vendí ni qué stock me queda</button>
        <button type="button" data-k="web" aria-pressed="false">Quien me busca en internet no me encuentra</button>
        <button type="button" data-k="flow" aria-pressed="false">Me olvido de avisar turnos o de contestar pedidos</button>
        <button type="button" data-k="combo" aria-pressed="false">Quiero el sitio y el sistema, todo junto</button>
        <button type="button" data-k="inv" aria-pressed="false">Tengo un evento y quiero una invitación digital</button>
      </div>
      <div class="v3-picker-a" aria-live="polite">
        <h3>GrowiApp</h3>
        <p class="pp"></p>
        <p class="price"></p>
        <div class="acts"><a class="btn btn-primary go" href="#">Ver la línea →</a><a class="btn btn-outline wa" href="#" target="_blank" rel="noopener noreferrer" data-track="home-orientacion-whatsapp">Consultar por WhatsApp</a></div>
      </div>
    </div>
  </div>
</section>''')
    # índice de líneas (reemplaza las tres tarjetas + las dos tiras)
    a, b = find(h, 'id="soluciones"')
    sec = h[a:b]
    nota = re.search(r'<p class="plan-note">[\s\S]*?</p>', sec).group(0)
    toggle = re.search(r'<div class="currency-toggle[\s\S]*?</div>', sec).group(0)
    def row(href, tag, name, d, em, p, sm, go, tr):
        return f'''      <a class="v3-row reveal" href="{href}" data-track="{tr}">
        <span class="n"><small>{tag}</small>{name}</span>
        <span class="d">{d}<em>{em}</em></span>
        <span class="p">{p}<small>{sm}</small></span>
        <span class="go">{go} →</span>
      </a>
'''
    idx = f'''<section class="section section-off" id="lineas">
  <div class="container">
    <div class="section-header center">
      <h2 class="section-title reveal">Cinco líneas, cada una con su precio.</h2>
      {toggle.replace('style="margin:28px auto 0"', '')}
    </div>
    <div class="v3-index">
{row(B+'app/', 'Sistema de gestión', 'GrowiApp', 'Ventas, caja, stock y turnos en una sola pantalla, con tus productos ya cargados.', 'Para cafeterías, peluquerías, talleres y comercios.', 'Desde <span data-price="15">$23.000 ARS</span> por mes', '+ <span data-price="49">$75.200 ARS</span> de puesta en marcha, una sola vez', 'Ver GrowiApp', 'home-linea-app')}
{row(B+'web/', 'Presencia digital', 'GrowiWeb', 'Un sitio publicado que explica lo que hacés y manda las consultas a tu WhatsApp.', 'Para consultorios, estudios y comercios que quieren que los encuentren.', 'Desde <span data-price="200">$307.000 ARS</span>', 'Pago único. Dominio y alojamiento aparte.', 'Ver GrowiWeb', 'home-linea-web')}
{row(B+'flow/', 'Automatizaciones', 'GrowiFlow', 'El aviso del turno sale solo, el resumen de ventas te llega armado y los pedidos quedan anotados.', 'Se contrata solo: no hace falta tener GrowiApp ni sitio.', 'Desde <span data-price="79">$121.000 ARS</span>', 'Pago único, sin mensualidad.', 'Ver GrowiFlow', 'home-linea-flow')}
{row(B+'combo/', 'Sitio + sistema', 'Combo', 'Sitio web y GrowiApp armados juntos, en una sola conversación.', '10% menos en el sitio y la puesta en marcha del sistema sin cargo.', 'Sitio desde <span data-price="180">$276.000 ARS</span>', '+ <span data-price="15">$23.000 ARS</span> por mes del sistema', 'Ver el combo', 'home-linea-combo')}
{row(B+'invitaciones/', 'Eventos', 'Invitaciones', 'Una invitación digital para tu evento: se comparte con un enlace y se confirma por WhatsApp.', 'Casamientos, cumpleaños, quinceañeras y eventos de empresa.', 'A medida', 'Presupuesto y alcance por escrito antes de empezar.', 'Ver invitaciones', 'home-linea-invitaciones')}
    </div>
    {nota}
  </div>
</section>'''
    h = h[:a] + idx + h[b:]
    # «Hecho en Argentina»: tres tarjetas repetían lo que dicen la FAQ y los pasos → tres hechos concretos en una franja
    h = replace(h, 'Hecho en Argentina', '''<section class="section">
  <div class="container">
    <div class="v3-facts reveal">
      <div><b>Atención directa</b><p>Hablás con quienes arman tu sistema o tu sitio, por WhatsApp, de lunes a sábado de 9 a 19.</p></div>
      <div><b>Precio por escrito</b><p>Antes de empezar te pasamos el precio y una fecha estimada de entrega. Lo que es «desde» o a medida se confirma por escrito.</p></div>
      <div><b>Sin permanencia en GrowiApp</b><p>Abono mensual: seguís solo si te sirve y tus datos son tuyos. GrowiWeb y GrowiFlow se pagan una sola vez.</p></div>
    </div>
  </div>
</section>''')
    return h

# ---------------------------------------------------------------- GROWIAPP: producción + calculadora
def app(h):
    calc = f'''    <div class="v3-calc reveal">
      <h3>¿Cuánto pago para empezar?</h3>
      <p>Elegí un plan. Los importes siguen la moneda y el período que marcaste arriba.</p>
      <div class="pick" role="radiogroup" aria-label="Plan">
        <label><input type="radio" name="v3p" value="Start" checked><span>Start</span></label>
        <label><input type="radio" name="v3p" value="Pro"><span>Pro</span></label>
        <label><input type="radio" name="v3p" value="Multi"><span>Multi</span></label>
      </div>
      <div class="out" aria-live="polite">
        <div id="v3c1"><small>Para empezar</small><b></b><em></em></div>
        <div id="v3c2"><small>Después</small><b></b><em></em></div>
        <div id="v3c3"><small>Primer año</small><b></b><em></em></div>
      </div>
      <p style="margin:18px 0 0"><a class="btn btn-primary wa" href="#" target="_blank" rel="noopener noreferrer" data-track="app-calculadora-whatsapp">Consultar por el plan <span class="pn">Start</span></a></p>
    </div>
'''
    assert '<details class="plans-compare' in h
    h = h.replace('<details class="plans-compare', calc + '    <details class="plans-compare', 1)
    return h

# ---------------------------------------------------------------- GROWIWEB
def web(h):
    h = drop(h, 'id="soluciones"')          # repetía la elección landing/institucional que ya hacen los planes
    h = drop(h, 'id="invitaciones"')        # las invitaciones ya tienen su línea en la navegación
    h = h.replace('<a href="#invitaciones" class="text-link">', '<a href="' + B + 'invitaciones/" class="text-link">')
    h = replace(h, 'Qué está incluido y qué no', '''<section class="section">
  <div class="container">
    <div class="section-header center">
      <h2 class="section-title reveal">Qué está incluido y qué no.</h2>
      <p class="section-lead">Lo definimos antes de empezar, por escrito, para que sepas qué pagás.</p>
    </div>
    <div class="v3-who reveal">
      <div><h3 class="t">Incluido en el precio</h3><ul>
        <li>El diseño y el armado del sitio según tu plan</li>
        <li>Las rondas de revisión de tu plan</li>
        <li>La publicación: lo dejamos online</li>
        <li>Ajustes sin cargo después de la entrega: 7 o 30 días según el plan</li></ul></div>
      <div><h3>Lo ponés vos</h3><ul>
        <li>El dominio (tunegocio.com.ar): lo registrás y pagás vos, te ayudamos a elegirlo. Growi no lo incluye ni lo revende</li>
        <li>El alojamiento: lo contratás vos, te recomendamos una opción y lo dejamos publicado ahí. Growi no lo incluye ni lo revende</li>
        <li>Fotos y textos propios (si no tenés, te orientamos)</li>
        <li>La publicidad paga en Google o Meta</li></ul></div>
      <div><h3>Se cotiza aparte</h3><ul>
        <li>Redacción completa, formulario con planilla y medición de visitas: están en la tabla de extras</li>
        <li>Cambios de contenido posteriores a la entrega: por hora o proyecto cerrado</li>
        <li>Fotografía profesional</li>
        <li>Conexión con tu sistema de clientes</li></ul></div>
    </div>
  </div>
</section>''')
    # el demo de kinesiología es el V3: las capturas del hero y de «Ejemplos» salen de él
    d = B + 'demos/kinesiologia/'
    h = h.replace('/web/demos/kinesiologia/captura-escritorio.webp" width="1100" height="602"', d + 'captura-escritorio.webp" width="1100" height="602"')
    h = h.replace('/web/demos/kinesiologia/captura-movil.webp" width="560" height="1212"', d + 'captura-movil.webp" width="390" height="844"')
    h = faq_drop(h, ['¿Hacen invitaciones digitales', '¿El precio incluye el dominio'])
    return h

# ---------------------------------------------------------------- GROWIFLOW
def flow(h):
    h = drop(h, '¿Te suena alguna de estas?')   # los tres dolores pasan a cada paquete
    pains = {'reportes': 'Tenés las ventas anotadas, pero sentarte a sacar cuentas queda para «cuando tenga un rato».',
             'recordatorios': 'El cliente no vino porque nadie le avisó el día antes, y esa hora ya no la recuperás.',
             'pedidos': 'Entró por WhatsApp, otro por Instagram, y a la tarde no sabés cuál contestaste.'}
    a, b = find(h, 'id="paquetes"'); sec = h[a:b]
    for k, t in pains.items():
        i = sec.index('id="' + k + '"')
        j = sec.index('<p class="plan-alt">', i)
        e = sec.index('</p>', j) + 4
        assert sec[j:e].find('Lo pagás una vez') > 0, k
        sec = sec[:j] + '<p class="v3-pain">' + t + '</p>' + sec[e:]
    n0 = sec.count('7 días de ajustes')
    sec = re.sub(r'\s*<li class="plan-feat"><span class="pfd"></span><span>7 días de ajustes sin cargo[\s\S]*?</li>', '', sec)
    sec = re.sub(r'\s*<li class="plan-feat"><span class="pfd"></span><span>¿Necesitás un ajuste más adelante\?[\s\S]*?</li>', '', sec)
    todos = '''    <div class="v3-all reveal">
      <h3>Los tres paquetes de pago único incluyen</h3>
      <p><b>Un solo pago.</b> Queda tuyo, andando, sin mensualidad.</p>
      <p><b>7 días de ajustes sin cargo</b> desde la entrega, si algo no quedó como esperabas.</p>
      <p><b>Cambios chicos después:</b> una sesión de ajuste sale <span data-price="29">$44.500 ARS</span>.</p>
      <p><b>Se pagan aparte, si aplican:</b> los mensajes de WhatsApp, que cobra Meta, y el uso de la inteligencia artificial en los reportes. Te lo decimos antes de empezar.</p>
    </div>
'''
    k = sec.index('<p class="plan-note')
    sec = sec[:k] + todos + '    ' + sec[k:]
    h = h[:a] + sec + h[b:]
    h = faq_drop(h, ['¿Qué es el costo de mensajes de Meta', '¿Por qué Reportes, Recordatorios y Pedidos no tienen mensualidad', '¿Necesito tener GrowiApp para contratar Reportes'])
    return h, n0

# ---------------------------------------------------------------- COMBO
def combo(h):
    h = replace(h, 'Armar todo de a partes sale más caro', '''<section class="section section-off" id="ahorro">
  <div class="container">
    <div class="section-header center">
      <h2 class="section-title reveal">Lo que ahorrás por armarlo junto.</h2>
      <p class="section-lead">Armar el sitio en un lado y el sistema en otro cuesta dos puestas en marcha y dos esperas. Así cambia el primer pago.</p>
    </div>
    <div class="v3-cmp reveal">
      <table>
        <caption class="sr-only">Primer pago por separado y en combo</caption>
        <thead><tr><th scope="col"></th><th scope="col">Por separado</th><th scope="col">En combo</th></tr></thead>
        <tbody>
          <tr><th scope="row" colspan="3" style="background:var(--off)">Combo Landing: sitio de una página + GrowiApp Start</th></tr>
          <tr><td>Sitio (Express)</td><td><span data-price="200">$307.000 ARS</span></td><td><span data-price="180">$276.000 ARS</span> <span class="save">(10% menos)</span></td></tr>
          <tr><td>Puesta en marcha de GrowiApp</td><td><span data-price="49">$75.200 ARS</span></td><td>Sin cargo</td></tr>
          <tr><td>Primer mes de GrowiApp Start</td><td><span data-price="15">$23.000 ARS</span></td><td><span data-price="15">$23.000 ARS</span></td></tr>
          <tr class="tot"><th scope="row">Para empezar</th><td><span data-price="264">$405.000 ARS</span></td><td><span data-price="195">$299.000 ARS</span> <span class="save">· ahorrás <span data-price="69">$106.000 ARS</span> (26%)</span></td></tr>
          <tr><th scope="row" colspan="3" style="background:var(--off)">Combo Institucional: sitio completo + GrowiApp Start</th></tr>
          <tr><td>Sitio (Base)</td><td><span data-price="550">$844.000 ARS</span></td><td><span data-price="495">$760.000 ARS</span> <span class="save">(10% menos)</span></td></tr>
          <tr><td>Puesta en marcha de GrowiApp</td><td><span data-price="49">$75.200 ARS</span></td><td>Sin cargo</td></tr>
          <tr><td>Primer mes de GrowiApp Start</td><td><span data-price="15">$23.000 ARS</span></td><td><span data-price="15">$23.000 ARS</span></td></tr>
          <tr class="tot"><th scope="row">Para empezar</th><td><span data-price="614">$942.000 ARS</span></td><td><span data-price="510">$783.000 ARS</span> <span class="save">· ahorrás <span data-price="104">$160.000 ARS</span> (17%)</span></td></tr>
        </tbody>
      </table>
    </div>
    <p class="v3-note">El abono mensual de GrowiApp es el mismo que si lo contratás solo. El descuento y la puesta en marcha sin cargo valen cuando se contratan juntos desde el inicio. No incluye dominio ni alojamiento.</p>
  </div>
</section>''')
    h = re.sub(r'<div class="bridge reveal">[\s\S]*?</div>\s*</div>\s*', '', h, count=1)   # el «puente» decorativo repite lo que ahora dice la tabla
    h = h.replace('section-header center section-header-next">' + NL + '      <h2 class="section-title reveal">Qué incluye', 'section-header center">' + NL + '      <h2 class="section-title reveal">Qué incluye')
    return h

# ---------------------------------------------------------------- INVITACIONES
def inv(h):
    return faq_drop(h, ['¿Puedo ver una invitación real', '¿Por qué las invitaciones tienen su propia página', '¿Puedo poner música', '¿Sirve para cualquier tipo de evento'])

# ---------------------------------------------------------------- main
PAGES = [('index.html', home), ('app/index.html', app), ('web/index.html', web), ('flow/index.html', flow), ('combo/index.html', combo), ('invitaciones/index.html', inv)]
if __name__ == '__main__':
    for src, fn in PAGES:
        h = rd(src); r = fn(h)
        if isinstance(r, tuple): r = r[0]
        r = comun(r, src.count('/'))
        dst = os.path.join(OUT, src); os.makedirs(os.path.dirname(dst), exist_ok=True)
        open(dst, 'w', encoding='utf-8', newline='\n').write(r)
        print('ok', src, len(h), '->', len(r))
