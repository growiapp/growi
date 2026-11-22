# Cálculos de la propuesta de pricing. Todo en USD (fuente de verdad del sitio). Las horas son SUPUESTOS, no datos medidos.
FX_SITIO = 1535      # shared.fx.js (2026-09-19)
FX_HOY = 1575        # dolarapi.com oficial venta, consultado 2026-11-18

# item: (línea, nombre, vigente, conservador, recomendado, premium, horas_min, horas_max, nota)
ITEMS = [
 ("GrowiApp", "Start · puesta en marcha", 49, 49, 69, 89, 4, 8, "Armado + carga de datos + 1 h de capacitación"),
 ("GrowiApp", "Pro · puesta en marcha", 149, 149, 179, 229, 8, 14, ""),
 ("GrowiApp", "Multi · puesta en marcha", 249, 249, 299, 399, 12, 20, ""),
 ("GrowiWeb", "Landing Express", 200, 200, 220, 249, 12, 20, "Plantilla adaptada, hasta 4 secciones"),
 ("GrowiWeb", "Landing Pro", 299, 299, 340, 399, 20, 30, ""),
 ("GrowiWeb", "Landing Performance", 449, 449, 520, 649, 35, 50, ""),
 ("GrowiWeb", "Sitio institucional Base", 550, 550, 640, 790, 45, 70, ""),
 ("GrowiWeb", "Sitio institucional Con turnos", 729, 729, 860, 1090, 70, 100, "Incluye conexión a medida con el sistema de turnos"),
 ("GrowiFlow", "Reportes automáticos", 89, 89, 99, 129, 6, 12, "Pago único"),
 ("GrowiFlow", "Recordatorios automáticos", 89, 89, 99, 129, 6, 12, "Pago único"),
 ("GrowiFlow", "Pedidos y consultas en orden", 79, 79, 89, 109, 5, 10, "Pago único"),
 ("GrowiFlow", "Sesión de ajuste", 29, 29, 35, 45, 1, 2, "Por sesión"),
 ("GrowiFlow", "Automatización a medida (desde)", 190, 190, 220, 290, 15, 30, "Precio «desde»"),
]
MENSUAL = [
 ("GrowiApp", "Start · por mes", 15, 15, 18, 22),
 ("GrowiApp", "Pro · por mes", 29, 29, 35, 42),
 ("GrowiApp", "Multi · por mes", 49, 49, 59, 69),
 ("GrowiFlow", "Bot de WhatsApp (próximamente) · por mes", 25, 25, 29, 39),
]
SETUP_BOT = ("GrowiFlow", "Bot de WhatsApp · puesta en marcha", 149, 149, 179, 249, 8, 16, "Los mensajes de WhatsApp los paga el cliente (Meta)")
EXTRAS = [("Redacción completa desde cero", 69, 69, 75, 85), ("Formulario que guarda cada consulta en una planilla", 59, 59, 65, 75),
          ("Medición de visitas y anuncios (Google y Meta)", 39, 39, 45, 55), ("Ronda adicional de revisiones", 29, 29, 35, 39)]
NUEVOS = [  # componentes que hoy no tienen precio o no existen
 ("GrowiWeb", "Cuidado del sitio (dominio, alojamiento gestionado y cambios chicos) · por mes", None, 9, 12, 15),
 ("GrowiFlow", "Cuidado de la automatización · por mes (opcional)", None, None, 12, 15),
 ("Invitaciones", "Invitación Esencial (una página con datos y mapa)", None, 45, 59, 79),
 ("Invitaciones", "Invitación con confirmación de asistencia (RSVP)", None, None, 89, 119),
 ("Invitaciones", "Invitación a medida (desde)", None, None, 149, 199),
]
COSTO_HORA = (10, 15, 25)  # USD/h supuestos para sensibilidad de margen (NO medidos)

def dpct(a, b):
    return None if a in (None, 0) or b is None else (b - a) / a * 100

def fmt_pct(x):
    if x is None: return "nuevo"
    if abs(x) < 0.05: return "0%"
    return ("+%.0f%%" % x)

def tarifa(precio, h):
    return precio / h

if __name__ == "__main__":
    for l, n, v, c, r, p, h0, h1, nota in ITEMS:
        print("%-10s %-34s vig %4d  rec %4d (%s)  prem %4d (%s)  | USD/h vig %.1f-%.1f  rec %.1f-%.1f" % (l, n, v, r, fmt_pct(dpct(v, r)), p, fmt_pct(dpct(v, p)), tarifa(v, h1), tarifa(v, h0), tarifa(r, h1), tarifa(r, h0)))
