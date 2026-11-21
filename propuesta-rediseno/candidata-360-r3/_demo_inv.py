# Genera demos/invitaciones.html con las demos reales del L1 (explorador de tres experiencias y personalización por perfil).
# No se reescribe ni se simula nada: se extrae el HTML vigente y se usan invitaciones.js / enlaces.js tal cual.
import io, os, re, re
OUT = os.path.dirname(os.path.abspath(__file__))
L1 = os.path.normpath(os.path.join(OUT, "..", "..", "invitaciones", "index.html"))

def build(dest=OUT):
    s = io.open(L1, encoding="utf-8").read()
    def sec(i):
        a = s.index('id="%s"' % i); a = s.rfind("<section", 0, a); b = s.index("</section>", a) + len("</section>")
        return s[a:b]
    demo, perf = sec("demo"), ""  # R3.8: la personalización por perfiles de invitados ya no forma parte de la experiencia comercial
    m = re.search(r"<svg[^>]*>\s*<defs>.*?</defs>\s*</svg>", s, flags=re.S)
    sprite = m.group(0) if m else ""
    # R3.5: portada con más oficio (halo, anillos finos, dunas suaves y ramas de olivo en línea); sigue las variables de color de cada tipo de evento
    def hojas(sx):
        o = ""
        for i, y in enumerate(range(300, 205, -15)):
            x = 27 + (300 - y) * 0.07
            o += '<ellipse cx="%.1f" cy="%d" rx="9" ry="3.3" transform="rotate(-38 %.1f %d)"/><ellipse cx="%.1f" cy="%d" rx="9" ry="3.3" transform="rotate(-142 %.1f %d)"/>' % (x + 8, y, x + 8, y, x - 8, y - 7, x - 8, y - 7)
        return o
    rama = ('<path d="M27 324 C25 282 38 246 31 202" fill="none" style="stroke:var(--tree)" stroke-width="1.3" stroke-linecap="round"/><g style="fill:var(--tree)" opacity=".92">%s</g>' % hojas(0))
    brillos = "".join('<circle cx="%d" cy="%d" r="%.1f" fill="#fff" opacity="%.2f"/>' % c for c in [(52, 40, .9, .8), (188, 52, 1.1, .7), (30, 98, .7, .6), (214, 108, .8, .65), (96, 24, .7, .6), (150, 22, .9, .55), (200, 150, .7, .5), (40, 150, .8, .5)])
    escena = ('<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><symbol id="inv-scene2" viewBox="0 0 240 320" preserveAspectRatio="xMidYMid slice">'
              '<rect width="240" height="320" style="fill:var(--sk2)"/><rect y="70" width="240" height="250" style="fill:var(--sk1)" opacity=".3"/><rect y="120" width="240" height="200" style="fill:var(--sk1)" opacity=".35"/><rect y="170" width="240" height="150" style="fill:var(--sk1)" opacity=".4"/>'
              '<circle cx="120" cy="130" r="104" style="fill:var(--sun)" opacity=".12"/><circle cx="120" cy="130" r="86" style="fill:var(--sun)" opacity=".16"/><circle cx="120" cy="130" r="66" style="fill:var(--sun)" opacity=".24"/>' + brillos +
              '<circle cx="120" cy="130" r="44" style="fill:var(--sun)" opacity=".92"/><circle cx="120" cy="130" r="57" fill="none" style="stroke:var(--clay)" stroke-width=".7" opacity=".55"/><circle cx="120" cy="130" r="70" fill="none" style="stroke:var(--clay)" stroke-width=".45" opacity=".38"/>'
              '<path d="M0 212 C50 188 96 204 140 194 C184 184 214 194 240 202 V320 H0Z" style="fill:var(--h1)"/><path d="M0 242 C60 220 110 244 160 230 C200 220 224 228 240 232 V320 H0Z" style="fill:var(--h2)"/>'
              '<path d="M0 274 C70 256 140 280 240 260 V320 H0Z" style="fill:var(--h3)"/><path d="M0 302 C80 292 160 308 240 296 V320 H0Z" style="fill:var(--h4)"/>'
              + rama + '<g transform="translate(240 0) scale(-1 1)">' + rama + '</g></symbol></defs></svg>')
    sprite = sprite + escena
    demo = demo.replace('href="#inv-scene"', 'href="#inv-scene2"'); perf = perf.replace('href="#inv-scene"', 'href="#inv-scene2"')
    # los enlaces de las demos van al WhatsApp de Growi y se abren fuera del marco
    html = ('<!doctype html>\n<html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">'
            '<title>Demos de invitaciones digitales (datos ficticios)</title>\n<base target="_blank">'
            '<link rel="stylesheet" href="../vendor/shared.css"><link rel="stylesheet" href="../vendor/web.css">\n'
            '<script>document.documentElement.classList.add("js");var v=(new URLSearchParams(location.search).get("v")||"exp");document.documentElement.setAttribute("data-v",v)</script>\n'
            '<style>html,body{background:transparent!important}body{margin:0;min-height:0}.reveal{opacity:1!important;transform:none!important}'
            '.section{padding:0!important;background:transparent!important}.section>.container{max-width:none;padding:0}'
            '.demo-head,.demo-steps,.exp-aviso,.nojs-note,.section-header{display:none!important}'
            '[data-v=exp] #personalizacion,[data-v=perf] #demo{display:none}'
            '.demo-grid{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"picker stage";gap:0 40px;align-items:center;padding:6px 4px}.demo-picker{grid-area:picker}.demo-grid .demo-stage{grid-area:stage;align-self:center}'
            '.profiles-grid{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:0 40px;align-items:center;margin-top:0!important;padding:6px 4px}'
            '@media(max-width:640px){.demo-grid,.profiles-grid{grid-template-columns:1fr;grid-template-areas:"stage" "picker";gap:22px}.demo-grid .demo-stage{order:-1}.profiles-grid .demo-stage{order:-1}}'
            '[data-v=exp] .demo-grid{grid-template-columns:1fr;grid-template-areas:"stage" "picker";justify-items:center;gap:14px}[data-v=exp] .exp-list{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}'
            '[data-v=exp] .exp{padding:10px 16px;min-height:44px;border-radius:99px}[data-v=exp] .exp span,[data-v=exp] .exp-other,[data-v=exp] .demo-caption,[data-v=exp] .demo-cta,[data-v=exp] .picker-label{display:none}[data-v=exp] .demo-picker{display:block}'
            '[data-v=exp] .phone.is-lg{width:300px}.phone.is-lg{width:310px}.profile-list,.exp-list{max-width:520px}.profiles-grid{grid-template-columns:minmax(0,440px) 330px;justify-content:center;gap:0 64px}@media(max-width:700px){.profiles-grid{grid-template-columns:1fr}}[data-v=perf] .profile-list .exp span,[data-v=perf] .picker-label,[data-v=perf] .demo-caption{display:none}'
            '.inv-cover::before{content:"";position:absolute;inset:3cqw;border:.3cqw solid var(--clay);opacity:.4;border-radius:2cqw;pointer-events:none}.inv-kicker{letter-spacing:.34em}.inv-arch{box-shadow:0 0 0 1.2cqw var(--paper),0 0 0 1.55cqw var(--clay)}'
            '[data-v=perf] .profile-list{display:grid;gap:10px}[data-v=perf] .profile-list .exp{background:rgba(255,255,255,.94);border:1.5px solid transparent;border-radius:16px;padding:16px 20px;min-height:56px;box-shadow:0 12px 26px -18px rgba(0,0,0,.45)}'
            '[data-v=perf] .prof-note{display:none}[data-v=perf] .profiles-grid .btn{margin-top:16px;box-shadow:0 12px 26px -16px rgba(0,0,0,.5)}'
            '[data-v=perf] .profile-list .exp strong{font-size:1.04rem}[data-v=perf] .profile-list .exp[aria-pressed=true]{background:#fff;border-color:#141414;box-shadow:0 0 0 2px #141414,0 16px 30px -18px rgba(0,0,0,.5)}</style></head><body>\n' + sprite + demo + "\n" + perf +
            '\n<script src="../vendor/enlaces.js"></script><script src="../vendor/invitaciones.js"></script>\n'
            '<script>(function(){function h(){try{parent.postMessage({growiDemo:"inv",v:document.documentElement.getAttribute("data-v"),h:Math.ceil(document.body.scrollHeight)},"*")}catch(e){}}'
            'window.addEventListener("load",h);window.addEventListener("resize",h);if(window.ResizeObserver)new ResizeObserver(h).observe(document.body);setTimeout(h,400)})()</script>\n</body></html>\n')
    os.makedirs(os.path.join(dest, "demos"), exist_ok=True)
    io.open(os.path.join(dest, "demos", "invitaciones.html"), "w", encoding="utf-8", newline="\n").write(html)
    return len(html)

if __name__ == "__main__":
    print(build())
