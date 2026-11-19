# Genera la candidata local Growi 360° R3: todo el sitio (home, GrowiApp y sus rubros, GrowiWeb, GrowiFlow, Combo, Invitaciones).
# Uso: python _construir.py            -> candidata local (noindex) en esta carpeta
#      python _construir.py --release DIR -> versión indexable (canonical, analítica, enlaces absolutos) en DIR, solo para verificar
import os, sys, io
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _lib, _demos, _r33
_demos.flow_demo, _demos.combo_journey, _demos.web_showcase = _r33.flow_demo, _r33.combo_journey, _r33.web_showcase  # R3.3: las páginas importan estas demos de _demos
from _home import home
from _lineas import app, rubro, RUB
from _lineas2 import web, flow, combo, invitaciones
import _demo_inv

def paginas():
    out = [("index.html", home), ("app/index.html", app), ("web/index.html", web), ("flow/index.html", flow), ("combo/index.html", combo), ("invitaciones/index.html", invitaciones)]
    out += [("app/%s/index.html" % k, (lambda k=k: rubro(k))) for k in RUB]
    return out

def construir(dest):
    _demo_inv.build()
    n = 0
    for name, fn in paginas():
        p = os.path.join(dest, name); os.makedirs(os.path.dirname(p), exist_ok=True)
        s = fn()
        with io.open(p, "w", encoding="utf-8", newline="\n") as f: f.write(s)
        n += 1; print(name, len(s))
    return n

if __name__ == "__main__":
    if "--release" in sys.argv:
        _lib.CFG["release"] = True
        construir(sys.argv[sys.argv.index("--release") + 1])
    else:
        construir(os.path.dirname(os.path.abspath(__file__)))
