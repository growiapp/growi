"""IBM Plex Mono declara «Reserved Font Name "Plex"» (SIL OFL 1.1). Los binarios distribuidos son subconjuntos WOFF2 (versión de fuente 2.3), es decir
una versión modificada: no pueden llevar el nombre reservado. Este script cambia SOLO la tabla `name` (familia, nombre completo y PostScript) y comprueba que
las demás tablas (contornos, anchos, kerning, tablas OpenType) quedan idénticas byte a byte; el aviso de copyright (id 0) se conserva.
La etiqueta CSS font-family "IBM Plex Mono" no cambia: es un rótulo de la hoja de estilos, no el nombre del binario.

Uso:  python -B renombrar-ibm-plex-mono.py ENTRADA.woff2 SALIDA.woff2     (escribe y verifica)
      python -B renombrar-ibm-plex-mono.py --comprobar ARCHIVO.woff2 ...   (falla si algún nombre del binario contiene «Plex»)
"""
import glob
import sys
from fontTools.ttLib import TTFont

NUEVO = {  # id de nombre -> función(valor_original)
    1: lambda v: v.replace('IBM Plex Mono', 'Growi Mono'),
    3: lambda v: v.replace('IBMPlexMono', 'GrowiMono'),
    4: lambda v: v.replace('IBM Plex Mono', 'Growi Mono'),
    6: lambda v: v.replace('IBMPlexMono', 'GrowiMono'),
}


def con_plex(t):
    return [(r.nameID, str(r)) for r in t['name'].names if 'plex' in str(r).lower()]


def renombrar(entrada, salida):
    orig = TTFont(entrada)
    t = TTFont(entrada, recalcTimestamp=False)  # no tocar head.modified
    for r in t['name'].names:
        if r.nameID in NUEVO:
            r.string = NUEVO[r.nameID](str(r))
    assert not con_plex(t), con_plex(t)
    t.flavor = 'woff2'
    t.save(salida)
    # verificación: todas las tablas salvo `name` idénticas (contenido ya descomprimido y recompilado)
    a, b = TTFont(entrada), TTFont(salida)
    assert sorted(a.keys()) == sorted(b.keys()), (sorted(a.keys()), sorted(b.keys()))
    for tag in a.keys():
        if tag in ('name', 'GlyphOrder'):  # GlyphOrder es un pseudo-tabla de fontTools, no existe en el archivo
            continue
        da, db = a.getTableData(tag), b.getTableData(tag)
        if tag == 'head':  # checkSumAdjustment (bytes 8-12) depende de todo el archivo y cambia al cambiar `name`
            da, db = da[:8] + da[12:], db[:8] + db[12:]
        assert da == db, 'tabla distinta: ' + tag
    assert str(b['name'].getName(0, 3, 1, 1033)) == str(a['name'].getName(0, 3, 1, 1033)), 'copyright alterado'
    print('OK', entrada, '->', salida, '| familia:', b['name'].getDebugName(1), '| tablas idénticas:', len([k for k in a.keys() if k not in ('name', 'GlyphOrder')]))


if __name__ == '__main__':
    if sys.argv[1] == '--comprobar':
        malos = [(p, con_plex(TTFont(p))) for a in sys.argv[2:] for p in sorted(glob.glob(a))]
        malos = [m for m in malos if m[1]]
        print('con nombre reservado:', malos or 'ninguno')
        sys.exit(1 if malos else 0)
    renombrar(sys.argv[1], sys.argv[2])
