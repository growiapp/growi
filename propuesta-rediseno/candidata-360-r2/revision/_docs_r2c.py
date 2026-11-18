# Auditoría de exactitud comercial de GrowiFlow. Uso: python _docs_r2c.py
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _docs_r2 import page, tabla, write

A = "<b>1 · Implementada y comprobada</b>"
B = "<b>2 · Entregable por configuración o desarrollo</b> (pendiente de confirmar)"
C = "<b>3 · Depende de permisos de terceros</b>"
D = "<b>4 · Conceptual o no disponible</b>"

def auditoria():
    cap = [
        ["Formulario web → planilla", B, "Patrón estándar; no es imposible por no estar en el repositorio (el sitio es estático y las entregas viven fuera). No hay prueba de una entrega real.", "Cuenta de planilla del cliente"],
        ["Aviso por mail al entrar una consulta", B, "Estándar a partir de una planilla o formulario.", "Mail del cliente"],
        ["Recordatorios por mail desde una planilla", B, "Estándar. Con calendario como fuente, depende de cuál.", "Mail; planilla o calendario del cliente"],
        ["Reportes armados con IA a partir de una planilla", B, "Entregable. El costo de uso de la IA ya se informa aparte.", "Proveedor de IA"],
        ["Automatización a medida", B, "Ya se presenta como «te decimos si se puede y cuánto sale». Es honesto.", "Según el caso"],
        ["Recordatorios y reportes <b>por WhatsApp</b>", C, "Requieren la API de WhatsApp Business: plantillas aprobadas por Meta y costo por mensaje (ya aclarado en el sitio).", "Meta; número habilitado; posible proveedor"],
        ["WhatsApp <b>entrante</b> anotado en una planilla", C, "Posible con la API y webhooks, incluso conviviendo con la app de WhatsApp Business (fuente de terceros). Requiere onboarding de Meta, que el propio sitio dice no tener aún para el bot.", "Meta; número habilitado; proveedor"],
        ["Instagram <b>entrante</b> anotado en una planilla", C, "Requiere cuenta profesional vinculada a una página de Facebook y app de Meta; para cuentas de terceros, revisión de la app y verificación del negocio.", "Meta (revisión de app)"],
        ["Reportes que leen solos los datos de GrowiApp («se activa directo»)", D, "No hay conexión documentada. Hasta confirmarla, es conceptual.", "Acceso a los datos de GrowiApp"],
        ["Bot de WhatsApp para preguntas frecuentes", D, "El sitio ya lo marca «Próximamente», sin fecha. Correcto.", "Meta"],
        ["GrowiFlow conectado automáticamente con GrowiApp o GrowiWeb (Combo)", D, "No hay conexión documentada entre productos. La candidata ya no la insinúa.", "Desarrollo propio"],
        ["Ninguna capacidad de GrowiFlow", A, "Nada de GrowiFlow está comprobado en el repositorio. Si hay entregas hechas, no figuran acá.", "—"]]
    rutas = [
        ["flow/index.html:13-14, :23-24, :286", "«Lo que hacés a mano todos los días, que se haga solo»", "Promesa general de automatización total", "«Las tareas que repetís todos los días, armadas a medida»"],
        ["flow/index.html:87 (descripción estructurada), :389", "«Lo que llega por WhatsApp, Instagram o un formulario se anota solo en una planilla, con aviso al entrar algo nuevo»", "Presenta como disponible (3) y (4) la captura de WhatsApp e Instagram", "«Las consultas de un formulario se anotan en una planilla, con aviso por mail. WhatsApp e Instagram se evalúan caso por caso»"],
        ["flow/index.html:287, :371, :373", "«El aviso le llega solo al cliente» · «Sale por WhatsApp o por mail, sin que nadie tenga que acordarse»", "WhatsApp sin la condición de Meta en la promesa (la aclaración está solo en el pie de la sección)", "«Sale por mail o, con una cuenta habilitada por Meta, por WhatsApp»"],
        ["flow/index.html:374", "«Toma los datos de la planilla o el calendario que ya usás»", "Calendario sin confirmar", "«…de la planilla que ya usás (el calendario, según lo que se confirme en el presupuesto)»"],
        ["flow/index.html:388, :391", "«Ningún pedido se te pierde en el chat» · «Ves de un vistazo qué contestaste y qué falta»", "Absoluto, e implica leer las respuestas del chat", "«Tus pedidos y consultas quedan anotados en una planilla» · «Marcás en la planilla qué contestaste y ves qué falta»"],
        ["flow/index.html:390", "«Te avisa apenas entra algo nuevo»", "Sin canal", "«Te avisa por mail apenas entra una consulta nueva»"],
        ["flow/index.html:453", "«Queda andando solo»", "Absoluto", "«Queda funcionando»"],
        ["flow/index.html:490, :514; app/index.html:896", "«Se activa directo» con los datos de GrowiApp", "Conexión no documentada", "«Lo preparamos con los datos que ya cargaste» (si no se confirma la lectura automática: «a partir de un export o una planilla»)"],
        ["index.html:337", "«Los avisos a tus clientes salen solos… Los pedidos que entran por WhatsApp quedan anotados»", "Presenta como disponible la captura de WhatsApp", "«Avisos a tus clientes por mail o WhatsApp y un resumen de ventas, a medida de tu negocio. Los pedidos de un formulario quedan anotados en una planilla»"],
        ["app/index.html:736", "«…que los avisos de turno salgan solos»", "Leve: remite a Recordatorios", "Sin cambio si se corrige Recordatorios"]]
    c = ('<p class="eyebrow">Exactitud comercial</p><h1>Auditoría de las promesas de GrowiFlow</h1>'
         '<div class="aviso"><b>Conclusión.</b> Que algo no esté en el repositorio estático no prueba que sea imposible ni que no exista: solo prueba que acá no hay evidencia. Se clasificó cada capacidad en cuatro clases. Lo que depende de Meta (WhatsApp, Instagram) no puede presentarse como disponible; lo que es estándar (formulario a planilla, avisos por mail) puede ofrecerse como servicio una vez que quien opera lo confirme. No se modificó el sitio publicado.</div>'
         '<h2>1. Clasificación de capacidades</h2>' + tabla(["Capacidad", "Clase", "Fundamento", "Dependencias"], cap, "mx") +
         '<h2>2. Afirmaciones del L1 publicado que exceden lo comprobado, y texto propuesto</h2><p class="lead">Son cambios de copy preparados, <b>no aplicados</b> en producción. No tocan precios, avisos legales ni condiciones.</p>' +
         tabla(["Ruta (L1)", "Texto actual", "Problema", "Texto propuesto"], rutas, "mx") +
         '<h2>3. En la candidata</h2><ul class="bul">'
         '<li>Ya corregido: el panel y la ilustración de GrowiFlow parten del formulario, ponen la condición de Meta junto a «WhatsApp» y se declaran ilustrativos y no verificados; el Combo dice que el paso de agenda es manual.</li>'
         '<li>Corregido en esta ronda: la pestaña «Que los avisos salgan solos» pasó a «Tareas repetitivas, a medida», y el título del panel a «Menos tareas repetitivas, armadas a medida».</li>'
         '<li>Pendiente de confirmación: las frases del panel que describen avisos por mail o WhatsApp como parte del servicio (siguen sujetas a la consulta de abajo).</li></ul>'
         '<h2>4. Una sola consulta para quien opera</h2><div class="aviso"><b>¿Cuáles de estas capacidades entregás hoy, y con qué herramienta?</b> Respondé sí o no, y la herramienta, para cada una: '
         '(a) formulario web → planilla; (b) aviso por mail al entrar una consulta; (c) recordatorios por mail desde una planilla; (d) recordatorios por calendario; (e) recordatorios y reportes por WhatsApp (¿con la API oficial de Meta?, ¿a nombre de quién?); '
         '(f) WhatsApp entrante anotado en una planilla; (g) Instagram entrante anotado en una planilla; (h) reportes que leen solos los datos de GrowiApp; (i) alguna entrega real y verificada de GrowiFlow que se pueda citar. '
         'Con esa lista se confirma el texto propuesto o se ajusta.</div>'
         '<p class="note">Fuentes consultadas: <a href="https://developers.facebook.com/documentation/business-messaging/instagram-messaging/app-review">Meta: revisión de app para mensajería de Instagram</a>, '
         '<a href="https://developers.facebook.com/documentation/business-messaging/messenger-platform/overview">Meta: Messenger Platform</a> y '
         '<a href="https://docs.360dialog.com/partner/waba-management/whatsapp-coexistence">documentación de un proveedor sobre la coexistencia de WhatsApp Business y la API</a> (fuente de terceros).</p>')
    write("auditoria-flow.html", page("Auditoría de GrowiFlow", c, "auditoria-flow.html"))

if __name__ == "__main__":
    auditoria()
