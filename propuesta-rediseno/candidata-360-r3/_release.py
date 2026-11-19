"""Ensamblado explícito y validación local del sitio público R3/L1."""
import re
import json
import shutil
import subprocess
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]

ROOT_FILES = (
    "CNAME", "404.html", "manifest.json", "robots.txt", "sitemap.xml",
    "favicon.ico", "shared.css", "shared.js", "shared.fx.js",
    "privacidad/index.html", "terminos/index.html",
    "invitaciones/enlaces.js", "invitaciones/invitaciones.js",
)
ROOT_DIRS = ("favicon", "fonts", "png", "web/demos")
CANDIDATE_DIRS = ("assets", "demos", "vendor")
SUFFIXES = {".html", ".css", ".js", ".json", ".xml", ".ico", ".png",
            ".jpg", ".jpeg", ".webp", ".avif", ".svg", ".woff2", ".mp4", ".txt"}
DEMOS = (
    "demos/app.html", "demos/invitaciones.html", "demos/web/ceramica/index.html",
    "demos/web/centro-ribera/index.html", "demos/web/centro-ribera/servicios.html",
    "demos/web/centro-ribera/turnos.html", "web/demos/ceramica/index.html",
    "web/demos/kinesiologia/index.html",
)


def _copy_file(src, dst):
    if not src.is_file() or src.is_symlink():
        raise FileNotFoundError("Falta un archivo público o es un enlace simbólico: %s" % src)
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dst)


def _copy_tree(base, rel, dest):
    source = base / rel
    if not source.is_dir() or source.is_symlink():
        raise FileNotFoundError("Falta un directorio público: %s" % source)
    for p in sorted(source.rglob("*")):
        if p.is_symlink():
            raise ValueError("Enlace simbólico no permitido: %s" % p)
        if not p.is_file():
            continue
        path = p.relative_to(base)
        if p.suffix.lower() == ".txt" and not p.name.startswith("OFL-"):
            continue
        if p.suffix.lower() not in SUFFIXES:
            continue  # Docs, fuentes de trabajo, ZIP y evidencias no son públicos.
        if path.as_posix() in ("demos/invitaciones.html", "vendor/shared.fx.js", "vendor/shared.js"):
            continue  # La demo se genera; el paquete usa shared.fx.js y shared.js de raíz.
        _copy_file(p, dest / path)


def _git_date(rel):
    try:
        result = subprocess.run(["git", "log", "-1", "--format=%cs", "--", rel],
                                cwd=ROOT, capture_output=True, text=True, check=True)
    except (OSError, subprocess.CalledProcessError) as exc:
        raise RuntimeError("No se pudo determinar lastmod desde Git: %s" % rel) from exc
    date = result.stdout.strip()
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date):
        raise ValueError("Sin fecha de cambio comprobable para %s" % rel)
    return date


def _sitemap_release(dest, paginas):
    path = dest / "sitemap.xml"
    tree = ET.parse(path)
    ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    ET.register_namespace("", "http://www.sitemaps.org/schemas/sitemap/0.9")
    entries = {u.findtext(ns + "loc"): u for u in tree.getroot().findall(ns + "url")}
    for route, _ in paginas():
        url = "https://growi.ar/" + route.removesuffix("index.html")
        if url not in entries:
            raise ValueError("Sitemap sin página R3 publicable: %s" % url)
        date = _git_date((HERE / route).relative_to(ROOT).as_posix())
        lastmod = entries[url].find(ns + "lastmod")
        if lastmod is None:
            raise ValueError("Sitemap sin lastmod: %s" % url)
        lastmod.text = max(lastmod.text or "", date)
    for route in ("privacidad/", "terminos/"):
        if "https://growi.ar/" + route not in entries:
            raise ValueError("Sitemap sin página L1: %s" % route)
    tree.write(path, encoding="utf-8", xml_declaration=True)


class _Refs(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        for key in ("href", "src", "poster"):
            if key in d:
                self.urls.append(d[key])
        for item in d.get("srcset", "").split(","):
            if item.strip():
                self.urls.append(item.strip().split()[0])
        for match in re.finditer(r"url\(([^)]+)\)", d.get("style", "")):
            self.urls.append(match.group(1).strip("'\" "))


def _target(dest, file, value):
    if not value or value.startswith(("#", "data:", "mailto:", "tel:", "javascript:")):
        return None
    if value.startswith("file:") or re.match(r"^[A-Za-z]:[/\\]", value):
        raise ValueError("Ruta local absoluta en %s: %s" % (file, value))
    u = urlsplit(value)
    if u.scheme in ("http", "https"):
        if u.hostname in ("localhost", "127.0.0.1"):
            raise ValueError("Referencia al entorno local en %s: %s" % (file, value))
        if u.hostname not in ("growi.ar", "www.growi.ar"):
            return None
        path = u.path
    elif u.scheme or u.netloc:
        return None
    else:
        path = u.path
    if not path:
        return None
    target = ((dest / path.lstrip("/")) if path.startswith("/") else (file.parent / unquote(path))).resolve()
    if not target.is_relative_to(dest):
        raise ValueError("Referencia fuera del paquete en %s: %s" % (file, value))
    if path.endswith("/") or target.is_dir():
        target /= "index.html"
    return target


def validar(folder, paginas):
    dest = Path(folder).resolve()
    if not dest.is_dir():
        raise FileNotFoundError("No existe el paquete: %s" % dest)
    required = set(ROOT_FILES) | set(DEMOS) | {x for x, _ in paginas()} | {".nojekyll"}
    missing = [x for x in sorted(required) if not (dest / x).is_file()]
    if missing:
        raise FileNotFoundError("Faltan archivos públicos: %s" % ", ".join(missing))
    errors = []
    checked = 0
    public_tops = {"app", "web", "flow", "combo", "invitaciones", "privacidad",
                   "terminos", "assets", "demos", "vendor", "favicon", "fonts", "png"}
    for p in dest.rglob("*"):
        if not p.is_file():
            continue
        rel = p.relative_to(dest).as_posix()
        if "/" in rel and rel.split("/", 1)[0] not in public_tops:
            errors.append("Directorio fuera de la selección pública: " + rel)
        if rel.startswith(("propuesta-rediseno/", ".github/", "revision/", "evidencia/")) or p.suffix.lower() in (".py", ".pyc", ".zip", ".md"):
            errors.append("Archivo interno: " + rel)
        if p.suffix.lower() not in SUFFIXES and rel not in ("CNAME", ".nojekyll"):
            errors.append("Extensión no aprobada: " + rel)
        if p.suffix.lower() in (".json", ".xml", ".txt") and rel not in ("manifest.json", "sitemap.xml", "robots.txt") and not (p.suffix.lower() == ".txt" and p.name.startswith("OFL-")):
            errors.append("Documento no previsto en el paquete: " + rel)
        if p.suffix.lower() not in (".html", ".css"):
            continue
        checked += 1
        content = p.read_text(encoding="utf-8")
        refs = _Refs()
        if p.suffix.lower() == ".html":
            refs.feed(content)
        else:
            refs.urls += [m.group(1).strip("'\" ") for m in re.finditer(r"url\(([^)]+)\)", content)]
        for ref in refs.urls:
            try:
                target = _target(dest, p, ref)
            except ValueError as exc:
                errors.append(str(exc))
                continue
            if target is not None and not target.is_file():
                errors.append("Recurso faltante: %s -> %s" % (rel, ref))
    for route, _ in paginas():
        content = (dest / route).read_text(encoding="utf-8")
        if any(x not in content for x in ('<meta name="robots" content="index, follow">',
                                          'rel="canonical"', 'name="description"',
                                          'property="og:image"', '<title>')):
            errors.append("Metadatos de release incompletos: " + route)
        for script in re.findall(r'<script type="application/ld\+json">(.*?)</script>', content, re.S):
            try:
                json.loads(script)
            except json.JSONDecodeError as exc:
                errors.append("JSON-LD inválido en %s: %s" % (route, exc))
    flow = (dest / "flow/index.html").read_text(encoding="utf-8")
    if 'La integración de WhatsApp e Instagram se evalúa según la cuenta del cliente.' not in flow:
        errors.append("JSON-LD de GrowiFlow sin la condición de integraciones")
    try:
        manifest = json.loads((dest / "manifest.json").read_text(encoding="utf-8"))
        for icon in manifest.get("icons", []):
            target = _target(dest, dest / "manifest.json", icon["src"])
            if target is not None and not target.is_file():
                errors.append("Icono de manifest faltante: " + icon["src"])
    except (ValueError, KeyError) as exc:
        errors.append("Manifest inválido: %s" % exc)
    if (dest / "vendor/shared.fx.js").exists():
        errors.append("Copia de cotización innecesaria en el paquete")
    if errors:
        raise ValueError("Paquete inválido:\n" + "\n".join(errors[:40]))
    print("Paquete válido: %d archivos, %d documentos HTML/CSS revisados" %
          (sum(p.is_file() for p in dest.rglob("*")), checked))


def release(folder, paginas, construir, lib):
    dest = Path(folder).resolve()
    if dest == ROOT or dest == HERE or dest.is_relative_to(HERE) or ROOT.is_relative_to(dest):
        raise ValueError("El destino debe estar separado del repositorio fuente y de la candidata")
    if dest.exists() and any(dest.iterdir()):
        raise FileExistsError("El destino de release debe ser nuevo o estar vacío: %s" % dest)
    dest.mkdir(parents=True, exist_ok=True)
    for route in ROOT_FILES:
        _copy_file(ROOT / route, dest / route)
    for route in ROOT_DIRS:
        _copy_tree(ROOT, route, dest)
    for route in CANDIDATE_DIRS:
        _copy_tree(HERE, route, dest)
    # La demo de GrowiApp usa el FX y el comportamiento compartido publicados.
    app_demo = dest / "demos/app.html"
    app_demo.write_text(app_demo.read_text(encoding="utf-8")
                        .replace("../vendor/shared.fx.js", "../shared.fx.js")
                        .replace("../vendor/shared.js", "../shared.js"), encoding="utf-8")
    (dest / ".nojekyll").write_text("", encoding="utf-8")
    lib.CFG["release"] = True
    construir(dest)
    _sitemap_release(dest, paginas)
    validar(dest, paginas)
    print("Release local:", dest)
