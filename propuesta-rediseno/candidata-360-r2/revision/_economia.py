# Modelo económico de Growi (r2). TODOS los parámetros son supuestos explícitos, no datos medidos: reemplazarlos por datos reales.
# costo = c * (H * (1 + r) + S) + T          precio mínimo viable = costo / (1 - m)
# horas máximas que sostiene un precio P  =  ((P * (1 - m) - T) / c - S) / (1 + r)
import math

FX = 1575  # dólar oficial venta, dolarapi.com, 2026-11-18

# Juegos de supuestos: (costo/hora USD, contingencia de alcance, margen objetivo, índice de horas 0=mín 1=medio 2=máx, infra por cliente y mes USD)
SUPUESTOS = {
    "Optimista": dict(c=8, r=0.00, m=0.00, ih=0, infra=2),
    "Base": dict(c=15, r=0.15, m=0.20, ih=1, infra=5),
    "Exigente": dict(c=25, r=0.30, m=0.35, ih=2, infra=10),
}

# ancla: (mínimo, máximo, fuente, confianza) en USD; None = sin comparable publicado
# id, línea, nombre, vigente, horas (mín, medio, máx), soporte posterior (mín, medio, máx), terceros USD, ancla, horas estandarizadas objetivo H*, soporte S*
UNICOS = [
    ("app_start", "GrowiApp", "Start · puesta en marcha", 49, (4, 6, 8), (0.5, 1, 1.5), 0, (0, 99, "Botmaker: alta única USD 99 (único cargo inicial publicado); Tiendanube y Colppy no cobran implementación", "baja"), 3, 0.5),
    ("app_pro", "GrowiApp", "Pro · puesta en marcha", 149, (8, 11, 14), (0.5, 1, 2), 0, None, 6, 1),
    ("app_multi", "GrowiApp", "Multi · puesta en marcha", 249, (12, 16, 20), (1, 2, 3), 0, None, 9, 1.5),
    ("web_express", "GrowiWeb", "Landing Express", 200, (12, 16, 20), (1, 1.5, 2), 0, (150, 250, "GoDaddy LatAm: landing USD 150–250", "media"), 10, 1),
    ("web_pro", "GrowiWeb", "Landing Pro", 299, (20, 25, 30), (1, 1.5, 2), 0, (150, 400, "GoDaddy LatAm: sitio corporativo básico USD 150–400", "media"), 16, 1),
    ("web_perf", "GrowiWeb", "Landing Performance", 449, (35, 42, 50), (3, 4, 5), 0, None, 26, 3),
    ("web_base", "GrowiWeb", "Sitio institucional Base", 550, (45, 57, 70), (3, 4, 5), 0, (150, 400, "Básico USD 150–400 y profesional USD 1.500–5.000 (GoDaddy): hay un vacío en el medio", "media"), 30, 3),
    ("web_turnos", "GrowiWeb", "Sitio institucional Con turnos", 729, (70, 85, 100), (4, 5, 6), 0, (150, 400, "Ídem: la conexión con el sistema de turnos no tiene comparable publicado", "media"), 45, 4),
    ("flow_rep", "GrowiFlow", "Reportes automáticos", 89, (6, 9, 12), (1, 1.5, 2), 0, None, 4, 1),
    ("flow_rec", "GrowiFlow", "Recordatorios automáticos", 89, (6, 9, 12), (1, 1.5, 2), 0, None, 4, 1),
    ("flow_ped", "GrowiFlow", "Pedidos y consultas en orden", 79, (5, 7.5, 10), (1, 1.5, 2), 0, None, 3.5, 1),
    ("flow_aj", "GrowiFlow", "Sesión de ajuste", 29, (1, 1.5, 2), (0, 0, 0), 0, None, 1, 0),
    ("flow_bot", "GrowiFlow", "Bot de WhatsApp (próximamente) · puesta en marcha", 149, (8, 12, 16), (1, 2, 3), 0, (99, 99, "Botmaker: alta única de WhatsApp USD 99; los mensajes de Meta los paga el cliente", "media"), 8, 1.5),
    ("inv_ese", "Invitaciones", "Invitación Esencial (propuesta nueva, hoy sin precio)", None, (3, 5, 8), (0.5, 0.5, 1), 0, (4, 38, "Mercado Libre AR: invitaciones web ARS 6.000–60.000 (resumen de búsqueda)", "baja"), 2, 0.5),
]
# recurrentes por cliente y mes: id, línea, nombre, vigente, horas de soporte al mes (mín, medio, máx), ancla, soporte objetivo
MENSUALES = [
    ("app_start_m", "GrowiApp", "Start · mensual", 15, (0.5, 1, 1.5), (13, 18, "Tiendanube Esencial/Impulso ARS 20.999–27.999 al mes", "alta"), 0.5),
    ("app_pro_m", "GrowiApp", "Pro · mensual", 29, (0.75, 1.25, 2), (29, 49, "Square Plus USD 49 por ubicación; AgendaPro desde ARS 990 promocional", "media"), 1.25),
    ("app_multi_m", "GrowiApp", "Multi · mensual", 49, (1, 1.75, 2.5), (49, 82, "Square Plus USD 49; Colppy desde ARS 128.500 (≈ USD 82)", "media"), 1.75),
    ("flow_bot_m", "GrowiFlow", "Bot de WhatsApp · mensual", 25, (1, 1.5, 2), (20, 149, "Zapier USD 20–49; Botmaker USD 149+", "media"), 1),
]

def costo(c, r, H, S, T=0): return c * (H * (1 + r) + S) + T
def minimo(c, r, m, H, S, T=0): return costo(c, r, H, S, T) / (1 - m)
def horas_max(P, c, r, m, S, T=0): return ((P * (1 - m) - T) / c - S) / (1 + r)
def r5(x): return int(math.ceil(x / 5.0) * 5)

def evaluar_unico(it, s):
    _id, lin, nom, vig, h, so, T, anc, Hs, Ss = it
    H, S = h[s["ih"]], so[s["ih"]]
    mn = minimo(s["c"], s["r"], s["m"], H, S, T)
    return mn

def juego(it, nombre):
    s = SUPUESTOS[nombre]
    return evaluar_unico(it, s)

def veredicto(it):
    _id, lin, nom, vig, h, so, T, anc, Hs, Ss = it
    b = SUPUESTOS["Base"]; mb = minimo(b["c"], b["r"], b["m"], h[1], so[1], T)
    if vig is None: return "Sin precio hoy: ver propuesta"
    if vig >= mb: return "Viable al precio vigente"
    if anc and mb <= anc[1]: return "Viable subiendo, dentro del mercado"
    return "No rentable a precio competitivo: cambiar alcance, estandarizar o replantear el cobro"

def escenarios_unico(it):
    _id, lin, nom, vig, h, so, T, anc, Hs, Ss = it
    b, e = SUPUESTOS["Base"], SUPUESTOS["Exigente"]
    cons = vig                                                  # Conservador: mantiene la lista y estandariza la entrega
    rec = r5(minimo(b["c"], b["r"], b["m"], Hs, Ss, T))         # Recomendado: mínimo viable Base con la entrega estandarizada
    prem = r5(minimo(e["c"], e["r"], e["m"], Hs, Ss, T))        # Premium: mínimo viable Exigente con la entrega estandarizada
    if vig:                                                     # nunca se baja un precio vigente: el modelo solo propone subir o mantener
        rec = max(rec, vig); prem = max(prem, rec)
    return cons, rec, prem

def margen(P, c, r, H, S, T=0):
    return (P - costo(c, r, H, S, T)) / P * 100 if P else None

if __name__ == "__main__":
    for it in UNICOS:
        _id, lin, nom, vig, h, so, T, anc, Hs, Ss = it
        mo = [round(juego(it, k)) for k in SUPUESTOS]
        b = SUPUESTOS["Base"]
        hm = horas_max(vig, b["c"], b["r"], b["m"], so[1], T) if vig else None
        print("%-12s %-46s vig %-5s mín viable %s  hmax %s  %s" % (lin, nom[:46], vig, mo, "%.1f" % hm if hm is not None else "-", veredicto(it)))
        print("      escenarios (cons/rec/prem):", escenarios_unico(it))
