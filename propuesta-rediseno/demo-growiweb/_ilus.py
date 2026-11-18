# Generador de las ilustraciones de Centro Ribera ("Movimiento medido").
# Cada figura se calcula por cinemática: segmentos de largo fijo y ángulos explícitos,
# así las articulaciones son coherentes. El arco coral mide el ángulo del movimiento.
import math

W, H = 320, 300
G = 272  # suelo
L_SHANK, L_THIGH, L_TORSO, L_UARM, L_FARM, L_NECK, R_HEAD = 58, 62, 66, 42, 38, 26, 13


def up(b, n):  # b: grados desde la vertical hacia adelante (+x); y hacia abajo
    r = math.radians(b)
    return (n * math.sin(r), -n * math.cos(r))


def dn(a, n):  # a: grados desde "abajo" hacia adelante (+x)
    r = math.radians(a)
    return (n * math.sin(r), n * math.cos(r))


def add(p, v):
    return (p[0] + v[0], p[1] + v[1])


def f(x):
    return ("%.1f" % x).rstrip("0").rstrip(".")


def pt(p):
    return f(p[0]) + " " + f(p[1])


def seg(a, b, cls, w):
    return '<path class="%s" stroke-width="%s" d="M%s L%s"/>' % (cls, w, pt(a), pt(b))


def _far(p, pts):
    return min(math.hypot(p[0] - q[0], p[1] - q[1]) for q in pts)


def arc(J, ref, mov, R=48, label_extra=20, avoid=()):
    """Arco medido en la articulación J entre la dirección ref y la dirección mov."""
    a1 = math.atan2(ref[1], ref[0])
    a2 = math.atan2(mov[1], mov[0])
    d = (a2 - a1 + math.pi) % (2 * math.pi) - math.pi  # diferencia con signo, camino corto
    deg = abs(math.degrees(d))
    sweep = 1 if d > 0 else 0
    p1 = (J[0] + R * math.cos(a1), J[1] + R * math.sin(a1))
    p2 = (J[0] + R * math.cos(a2), J[1] + R * math.sin(a2))
    out = []
    # eje de referencia (continuación del segmento proximal o vertical)
    out.append('<path class="ref" d="M%s L%s"/>' % (pt(J), pt((J[0] + (R + 24) * math.cos(a1), J[1] + (R + 24) * math.sin(a1)))))
    # marcas de goniómetro cada 10 grados dentro del arco
    n = int(deg // 10)
    for i in range(1, n + 1):
        t = a1 + math.copysign(math.radians(10 * i), d)
        r0, r1 = R - 5, R + (7 if i % 3 == 0 else 3)
        out.append('<path class="tick" d="M%s L%s"/>' % (
            pt((J[0] + r0 * math.cos(t), J[1] + r0 * math.sin(t))),
            pt((J[0] + r1 * math.cos(t), J[1] + r1 * math.sin(t)))))
    out.append('<path class="arc" pathLength="1" d="M%s A%s %s 0 %d %d %s"/>' % (pt(p1), f(R), f(R), 1 if deg > 180 else 0, sweep, pt(p2)))
    mid = a1 + d / 2
    best, lp = -1, None
    for rr in (R + 16, R + 24, R + 32):
        for da in (0, -0.25, 0.25, -0.5, 0.5):
            t = mid + da
            c = (J[0] + rr * math.cos(t), J[1] + rr * math.sin(t))
            sc = _far(c, list(avoid) + [J]) if avoid else rr
            if sc > best:
                best, lp = sc, (c[0], c[1] + 5)
    out.append('<text class="lbl" x="%s" y="%s" text-anchor="middle">%d°</text>' % (f(lp[0]), f(lp[1]), round(deg)))
    out.append('<circle class="joint" cx="%s" cy="%s" r="7.5"/>' % (f(J[0]), f(J[1])))
    return "".join(out), round(deg), lp


def head(S, bto, tilt=0):
    n = add(S, up(bto, 14))
    c = add(S, up(bto + tilt, L_NECK))
    return '<path class="body" stroke-width="7" d="M%s L%s"/><circle class="solid" cx="%s" cy="%s" r="%d"/>' % (pt(S), pt(n), f(c[0]), f(c[1]), R_HEAD)


def figure(ax, bs, bt, bto, ua, fa, foot_pt=None, extra_back="", extra_front="", head_tilt=0, far_leg=None, far_arm=None, legs=True):
    A = (ax, G - 14)
    K = add(A, up(bs, L_SHANK))
    Hh = add(K, up(bt, L_THIGH))
    S = add(Hh, up(bto, L_TORSO))
    E = add(S, dn(ua, L_UARM))
    Wr = add(E, dn(fa, L_FARM))
    toe = (ax + 26, G - 6)
    heel = (ax - 8, G - 6)
    parts = [extra_back]
    if legs:
        parts.append('<path class="ground" d="M-300 %d H700"/>' % G)
    if far_leg and legs:
        fbs, fbt, dx = far_leg
        A2 = (ax + dx, G - 14)
        K2 = add(A2, up(fbs, L_SHANK))
        H2 = add(K2, up(fbt, L_THIGH))
        parts.append(seg((A2[0] - 8, G - 6), (A2[0] + 26, G - 6), "far", 9))
        parts.append(seg(A2, K2, "far", 12))
        parts.append(seg(K2, H2, "far", 14))
    if far_arm:
        fua, ffa = far_arm
        E2 = add(S, dn(fua, L_UARM))
        W2 = add(E2, dn(ffa, L_FARM))
        parts.append(seg(S, E2, "far", 10))
        parts.append(seg(E2, W2, "far", 9))
    if legs:
        parts.append(seg(heel, toe, "body", 9))
        parts.append(seg(A, K, "body", 12))
        parts.append(seg(K, Hh, "body", 14))
    parts.append(seg(Hh, S, "body", 22))
    parts.append(seg(S, E, "body", 10))
    parts.append(seg(E, Wr, "body", 9))
    parts.append(head(S, bto, head_tilt))
    parts.append(extra_front)
    return dict(A=A, K=K, H=Hh, S=S, E=E, W=Wr, toe=toe, heel=heel, HEAD=add(S, up(bto + head_tilt, L_NECK))), "".join(parts)


def skel(P):
    return [P[k] for k in ("A", "K", "H", "S", "E", "W", "toe", "heel", "HEAD")]


def up_pts(P):
    return [P[k] for k in ("H", "S", "E", "W", "HEAD")]


def fit(inner, pts, m=30, ground=True):
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts] + ([G] if ground else [])
    x0, x1, y0, y1 = min(xs) - 16, max(xs) + 16, min(ys) - 16, max(ys) + 4
    sc = min((W - 2 * m) / (x1 - x0), (H - 2 * m) / (y1 - y0), 1.05 if ground else 1.75)
    tx = (W - sc * (x1 + x0)) / 2
    ty = (H - sc * (y1 + y0)) / 2 if not ground else (H - m + 6 - sc * y1 if (y1 - y0) * sc > (H - 2 * m) * 0.8 else (H - sc * (y1 + y0)) / 2)
    return '<g transform="translate(%s %s) scale(%s)">%s</g>' % (f(tx), f(ty), f(sc), inner)


def svg(inner, label):
    return ('<svg class="ilu" viewBox="0 0 %d %d" role="img" aria-label="%s" focusable="false">%s</svg>' % (W, H, label, inner))


def norm(v):
    n = math.hypot(*v)
    return (v[0] / n, v[1] / n)


def sub(a, b):
    return (a[0] - b[0], a[1] - b[1])


ILUS = {}
INFO = {}

# 1. Hombro: elevación del brazo
P, body = figure(150, 0, 0, 0, 150, 150, far_arm=(150, 150), legs=False)
ar, deg, lp = arc(P["S"], sub(P["H"], P["S"]), sub(P["E"], P["S"]), R=54, avoid=up_pts(P))
ILUS["hombro"] = svg(fit(body + ar, up_pts(P) + [lp, (P["S"][0] + 75, P["S"][1])], ground=False), "Figura de perfil con el brazo elevado y un arco que mide 150 grados en el hombro")
INFO["hombro"] = ("Hombro", "Elevación del brazo", deg)

# 2. Espalda: flexión del tronco
P, body = figure(120, 0, 0, 55, 12, 12, head_tilt=8, far_leg=(0, 0, -14), far_arm=(20, 20))
ar, deg, lp = arc(P["H"], (0, -1), sub(P["S"], P["H"]), R=56, avoid=skel(P))
ILUS["espalda"] = svg(fit(body + ar, skel(P) + [lp, (P["H"][0] - 70, P["H"][1])]), "Figura de perfil con el tronco inclinado y un arco que mide 55 grados en la cadera")
INFO["espalda"] = ("Espalda", "Flexión del tronco", deg)

# 3. Cadera: sentadilla
P, body = figure(165, 32, -76, 36, 85, 85, far_arm=(80, 80))
ar, deg, lp = arc(P["H"], sub(P["H"], P["S"]), sub(P["K"], P["H"]), R=40, avoid=skel(P))
ILUS["cadera"] = svg(fit(body + ar, skel(P) + [lp, (P["H"][0] - 70, P["H"][1] + 40)]), "Figura de perfil en sentadilla con un arco que mide la flexión de cadera")
INFO["cadera"] = ("Cadera", "Flexión en sentadilla", deg)

# 4. Rodilla: extensión sentado (banco)
Hh = (130, 168)
K = add(Hh, dn(90, L_THIGH))
Ank = add(K, dn(35, L_SHANK))
S = add(Hh, up(-4, L_TORSO))
E = add(S, dn(18, L_UARM))
Wr = add(E, dn(60, L_FARM))
K2 = add(Hh, dn(90, L_THIGH - 6))
Ank2 = add(K2, dn(8, L_SHANK))
bench = '<path class="ground" d="M70 %d H%s"/><path class="ground" d="M82 %d V%d M%s %d V%d"/>' % (
    Hh[1] + 15, f(K[0] + 12), Hh[1] + 15, G, f(K[0] - 6), Hh[1] + 15, G)
toe = add(Ank, up(120, 24))
toe2 = add(Ank2, up(100, 22))
parts = [bench, '<path class="ground" d="M-300 %d H700"/>' % G,
         seg(K2, Ank2, "far", 12), seg(Ank2, toe2, "far", 9), seg(Hh, K2, "far", 14),
         seg(Hh, K, "body", 14), seg(K, Ank, "body", 12), seg(Ank, toe, "body", 9),
         seg(Hh, S, "body", 22), seg(S, E, "body", 10), seg(E, Wr, "body", 9), head(S, -4)]
sk = [Hh, K, Ank, S, E, Wr, toe, add(S, up(-4, L_NECK))]
ar, deg, lp = arc(K, sub(K, Hh), sub(Ank, K), R=46, avoid=sk)
ILUS["rodilla"] = svg(fit("".join(parts) + ar, sk + [lp, (70, Hh[1] + 15), (K[0] + 60, K[1])]), "Figura sentada extendiendo la rodilla con un arco que mide la flexión")
INFO["rodilla"] = ("Rodilla", "Extensión sentado", deg)

# 5. Tobillo: dorsiflexión contra la pared
ax = 118
P, _x = figure(ax, 38, -22, 12, 80, 80)
wall = '<path class="ground" d="M%s %s V%d"/>' % (f(P["W"][0] + 10), f(P["S"][1] - 20), G)
P, body = figure(ax, 38, -22, 12, 80, 80, extra_back=wall, far_leg=(30, -20, -22))
sh = norm(sub(P["K"], P["A"]))
neutral = (-sh[1], sh[0])
ar, deg, lp = arc(P["A"], neutral, (1, 0), R=44, avoid=skel(P))
ILUS["tobillo"] = svg(fit(body + ar, skel(P) + [lp, (P["W"][0] + 10, P["S"][1]), (P["A"][0] + 60, P["A"][1] + 30)]), "Figura apoyada en una pared con la rodilla adelantada y un arco que mide la flexión del tobillo")
INFO["tobillo"] = ("Tobillo y pie", "Flexión dorsal contra la pared", deg)

# 6. Codo: flexión
P, body = figure(150, 0, 0, 0, 4, 140, far_arm=(10, 12), legs=False)
ar, deg, lp = arc(P["E"], sub(P["E"], P["S"]), sub(P["W"], P["E"]), R=40, avoid=up_pts(P))
ILUS["codo"] = svg(fit(body + ar, up_pts(P) + [lp, (P["E"][0] + 70, P["E"][1])], ground=False), "Figura de pie con el codo flexionado y un arco que mide la flexión")
INFO["codo"] = ("Codo y mano", "Flexión del codo", deg)

# Mapa corporal (frente) para elegir la zona. Los puntos son botones HTML superpuestos.
MAP_PTS = {"hombro": (116, 66), "codo": (128, 112), "espalda": (80, 98), "cadera": (94, 152), "rodilla": (95, 214), "tobillo": (97, 264)}
mp = []
mp.append('<path class="mapb" stroke-width="30" d="M80 70 L80 150"/>')
mp.append('<path class="mapb" stroke-width="12" d="M80 52 V68"/><circle class="mapf" cx="80" cy="34" r="17"/>')
mp.append('<path class="mapb" stroke-width="13" d="M46 68 L34 112 L30 154"/><path class="mapb" stroke-width="13" d="M114 68 L126 112 L130 154"/>')
mp.append('<path class="mapb" stroke-width="20" d="M68 152 L65 214 L63 266"/><path class="mapb" stroke-width="20" d="M92 152 L95 214 L97 266"/>')
mp.append('<path class="mapb" stroke-width="10" d="M63 270 H50 M97 270 H110"/>')
mp.append('<path class="ground" d="M20 280 H140"/>')
MAPA = '<svg class="mapa" viewBox="0 0 160 300" aria-hidden="true" focusable="false">%s</svg>' % "".join(mp)

if __name__ == "__main__":
    for k, v in INFO.items():
        print(k, v)
    # vista previa para inspección visual
    css = (".ilu,.mapa{width:100%;height:auto}.far{stroke:#8da6af;fill:none;stroke-linecap:round}.body{stroke:#0e2f3b;fill:none;stroke-linecap:round}.solid{fill:#0e2f3b}"
           ".ground{stroke:#b8c8ce;stroke-width:3;fill:none;stroke-linecap:round}.ref{stroke:#587480;stroke-width:2;stroke-dasharray:4 5;fill:none;stroke-linecap:round}"
           ".tick{stroke:#b8c8ce;stroke-width:2;stroke-linecap:round}.arc{stroke:#ff6a4d;stroke-width:4;fill:none;stroke-linecap:round}"
           ".lbl{font:700 17px 'Hanken Grotesk',sans-serif;fill:#0e2f3b;paint-order:stroke;stroke:#fff;stroke-width:5px;stroke-linejoin:round}"
           ".joint{fill:#fff;stroke:#ff6a4d;stroke-width:3.5}.mapb{stroke:#d3dde1;fill:none;stroke-linecap:round}.mapf{fill:#d3dde1}"
           "body{margin:0;background:#f3f7f8;font-family:sans-serif}.g{display:grid;grid-template-columns:repeat(4,300px);gap:12px;padding:12px}.g div{background:#fff;border:1px solid #d3dde1;padding:8px}")
    html = "<style>%s</style><div class=g>%s<div style='width:140px'>%s</div></div>" % (css, "".join("<div>%s</div>" % v for v in ILUS.values()), MAPA)
    open("_prev_ilus.html", "w", encoding="utf-8").write(html)
