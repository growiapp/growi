# Genera demos/invitaciones.html con las demos reales del L1 (explorador de tres experiencias y personalización por perfil).
# No se reescribe ni se simula nada: se extrae el HTML vigente y se usan invitaciones.js / enlaces.js tal cual.
import io, os, re, re
OUT = os.path.dirname(os.path.abspath(__file__))
L1 = os.path.normpath(os.path.join(OUT, "..", "..", "invitaciones", "index.html"))

def build():
    s = io.open(L1, encoding="utf-8").read()
    def sec(i):
        a = s.index('id="%s"' % i); a = s.rfind("<section", 0, a); b = s.index("</section>", a) + len("</section>")
        return s[a:b]
    demo, perf = sec("demo"), sec("personalizacion")
    m = re.search(r"<svg[^>]*>\s*<defs>.*?</defs>\s*</svg>", s, flags=re.S)
    sprite = m.group(0) if m else ""
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
            '[data-v=exp] .phone.is-lg{width:300px}.phone.is-lg{width:310px}.profile-list,.exp-list{max-width:520px}.profiles-grid{grid-template-columns:minmax(0,440px) 330px;justify-content:center;gap:0 64px}@media(max-width:700px){.profiles-grid{grid-template-columns:1fr}}</style></head><body>\n' + sprite + demo + "\n" + perf +
            '\n<script src="../vendor/enlaces.js"></script><script src="../vendor/invitaciones.js"></script>\n'
            '<script>(function(){function h(){try{parent.postMessage({growiDemo:"inv",v:document.documentElement.getAttribute("data-v"),h:Math.ceil(document.body.scrollHeight)},"*")}catch(e){}}'
            'window.addEventListener("load",h);window.addEventListener("resize",h);if(window.ResizeObserver)new ResizeObserver(h).observe(document.body);setTimeout(h,400)})()</script>\n</body></html>\n')
    os.makedirs(os.path.join(OUT, "demos"), exist_ok=True)
    io.open(os.path.join(OUT, "demos", "invitaciones.html"), "w", encoding="utf-8", newline="\n").write(html)
    return len(html)

if __name__ == "__main__":
    print(build())
