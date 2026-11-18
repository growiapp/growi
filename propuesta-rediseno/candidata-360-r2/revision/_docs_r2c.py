# Auditoría de exactitud comercial de GrowiFlow. Uso: python _docs_r2c.py
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _docs_r2 import page, tabla, write

def auditoria():
    filas = [
        ["Consulta de un <b>formulario web</b> anotada en una planilla",
         "flow/index.html:87 (descripción estructurada) y :389; web/index.html:462, :481, :551 (formulario que guarda cada consulta en una planilla)",
         "Ninguna. El sitio es estático: no hay servidor, scripts de captura ni integración en el repositorio.",
         "Patrón estándar (formulario que escribe en una planilla). No hay en el repositorio una entrega verificada de un cliente.",
         "Cuenta de planilla del cliente y un servicio de formularios o de automatización.",
         "<b>Ofrecible como servicio a medida</b>, una vez que quien opera confirme que lo entrega así.",
         "Mantener, nombrando el canal: «las consultas de un formulario se anotan en una planilla»."],
        ["Mensaje de <b>WhatsApp</b> entrante anotado solo",
         "flow/index.html:87, :389, :391; index.html:337 («los pedidos que entran por WhatsApp quedan anotados»)",
         "Ninguna.",
         "Exige la API de WhatsApp Business (Meta), con webhooks y alta del número por Meta. El propio sitio dice que el bot de WhatsApp espera una aprobación de Meta «que todavía no tenemos» (flow/index.html:197).",
         "Meta, número verificado, posible proveedor intermediario y costos de mensajes.",
         "<b>Propuesta, no verificada.</b> No ofrecerla como capacidad.",
         "«Si la consulta llega por WhatsApp, se evalúa caso por caso: depende de Meta y se confirma por escrito antes de empezar»."],
        ["Mensaje directo de <b>Instagram</b> anotado solo",
         "flow/index.html:87, :389",
         "Ninguna.",
         "Exige cuenta profesional de Instagram vinculada a una página de Facebook y una app de Meta. Para cuentas de terceros hace falta acceso avanzado, con revisión de la app y verificación del negocio.",
         "Meta (revisión de app) y cuenta profesional del cliente.",
         "<b>Propuesta, no verificada.</b>",
         "Igual que WhatsApp: caso por caso, sin prometerlo."],
        ["«Te avisa apenas entra algo nuevo»",
         "flow/index.html:390",
         "Ninguna.",
         "Por mail desde una planilla es estándar. Por WhatsApp vale lo dicho arriba.",
         "Mail del cliente; para WhatsApp, Meta.",
         "Por mail: ofrecible a confirmar. Por WhatsApp: propuesta.",
         "«Te avisa por mail apenas entra algo nuevo»."],
        ["<b>Recordatorios</b> por WhatsApp o mail «solos»",
         "flow/index.html:371, :373; app/index.html:736; index.html:337",
         "Ninguna.",
         "El envío iniciado por el negocio por WhatsApp requiere plantillas aprobadas por Meta y se cobra por mensaje (el sitio ya aclara el costo en flow/index.html:430). Por mail es estándar.",
         "Meta (WhatsApp); mail del cliente.",
         "Por mail: ofrecible a confirmar. Por WhatsApp: depende de Meta.",
         "Agregar junto a «por WhatsApp» la condición: «con una cuenta aprobada por Meta»."],
        ["<b>Reportes</b> «armados con inteligencia artificial» desde GrowiApp",
         "flow/index.html:354; app/index.html:896 («se activa directo»)",
         "Ninguna. No hay en el repositorio una conexión documentada entre GrowiApp y los reportes.",
         "La IA tiene un costo de uso aparte, ya informado en el sitio. Que los datos de GrowiApp se lean solos no está demostrado.",
         "Proveedor de IA; acceso a los datos de GrowiApp.",
         "<b>A confirmar</b> con quien opera, antes de mostrar «se activa directo».",
         "Sin cambio hasta confirmar; si no se confirma, «a partir de una planilla o de un export»."]]
    c = ('<p class="eyebrow">Exactitud comercial</p><h1>Auditoría de las promesas de GrowiFlow</h1>'
         '<div class="aviso"><b>Conclusión.</b> En el repositorio no existe ninguna implementación de captura automática: solo hay promesas de texto. La captura desde formularios y los avisos por mail son técnicamente estándar y se pueden ofrecer como servicio a medida si se confirman. La captura desde <b>WhatsApp e Instagram</b> depende de Meta y no está verificada, y el sitio vigente ya reconoce que todavía no tiene la aprobación de Meta para el bot de WhatsApp. No se cambió nada del sitio publicado: abajo van las rutas y la corrección propuesta.</div>'
         + tabla(["Capacidad", "Dónde se afirma (sitio vigente)", "Implementación real", "Evidencia técnica", "Dependencias y terceros", "Qué se puede ofrecer hoy", "Corrección propuesta"], filas, "mx") +
         '<h2>Qué cambió en la candidata</h2><ul class="bul">'
         '<li>El panel de GrowiFlow en la home ya no dice que lo de WhatsApp e Instagram «se anota solo»: dice que las consultas de un formulario se anotan en una planilla y que WhatsApp e Instagram se definen caso por caso.</li>'
         '<li>La ilustración de GrowiFlow arranca con una consulta que entra por el formulario del sitio. Los recordatorios y el resumen dicen «por mail o WhatsApp», con la condición de Meta en el pie de cada paso.</li>'
         '<li>El pie de la ilustración aclara que no es una captura de un cliente ni una funcionalidad verificada.</li>'
         '<li>El Combo ya no insinúa que GrowiFlow anota solo la consulta: dice que ese paso es manual y que anotarla sola es otro servicio, que se define aparte.</li></ul>'
         '<h2>Rutas de producción con la promesa (sin modificar)</h2><ul class="bul">'
         '<li><code>flow/index.html</code>: líneas 87, 389, 390 y 373.</li><li><code>index.html</code>: línea 337.</li><li><code>app/index.html</code>: líneas 736 y 896.</li></ul>'
         '<p class="note">Antes de publicar cualquier corrección hay que confirmar con quien opera qué se entrega hoy y con qué herramientas. Fuentes consultadas: '
         '<a href="https://developers.facebook.com/documentation/business-messaging/instagram-messaging/app-review">Meta: revisión de app para mensajería de Instagram</a>, '
         '<a href="https://developers.facebook.com/documentation/business-messaging/messenger-platform/overview">Meta: Messenger Platform</a> y '
         '<a href="https://docs.360dialog.com/partner/waba-management/whatsapp-coexistence">documentación de un proveedor sobre la coexistencia de WhatsApp Business y la API</a> (fuente de terceros).</p>')
    write("auditoria-flow.html", page("Auditoría de GrowiFlow", c, "auditoria-flow.html"))

if __name__ == "__main__":
    auditoria()
