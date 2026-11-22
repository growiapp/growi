# Inventario de GrowiFlow y conciliacion del copy. Uso: python _docs_r2c.py
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _docs_r2 import page, tabla, write

def auditoria():
    inv = [
        ["Sincronizar GrowiApp con una planilla de Google (ventas, turnos, clientes, reservas, gastos)",
         "<b>Implementada</b> (código real, rubro cafetería, versión 7)",
         "<code>Código AppsScript.txt</code> dentro de <code>Sitema de gestión Cafetería.zip</code> (carpeta Growi de Documentos). Leído completo (405 líneas); no ejecutado.",
         "Pedidos HTTP de la app con la acción (<code>addVentas</code>, <code>updateClientes</code>…)", "Filas en 9 hojas: Ventas, Menu, Turnos, Clientes, Reservas, Gastos, Operadores, MesasActivas, TurnoActivo",
         "Google Sheets y Apps Script del cliente", "No envía mails, reportes, recordatorios ni WhatsApp. El acceso es «Cualquiera»: la URL es el único secreto, sin autenticación propia",
         "«Tus ventas y turnos quedan también en una planilla tuya», a medida"],
        ["Enlace de WhatsApp con el mensaje armado",
         "<b>Demo funcional</b> con prueba automática",
         "<code>invitaciones/enlaces.js</code> y <code>prototipos/pruebas/confirmacion-whatsapp/prueba-unitaria.js</code>: 8 pruebas, todas pasan (ejecutadas hoy, local, datos sintéticos)",
         "Teléfono y datos del evento", "URL <code>wa.me</code> bien codificada, con rechazo de entradas inválidas", "Ninguna (abre WhatsApp)",
         "Es un enlace que toca la persona: no envía ni lee mensajes", "«Botón que abre WhatsApp con el mensaje listo»"],
        ["Actualización programada con aviso si falla (tipo de cambio del sitio)",
         "<b>Implementada</b> (workflow definido); sin ejecución en este clon",
         "<code>.github/workflows/tipo-de-cambio.yml</code> y <code>.github/scripts/actualizar-cambio.mjs</code>. No se ejecutó: consulta un servicio externo y hace push",
         "API pública del dólar oficial", "Precios recalculados y un issue si falla", "GitHub Actions; servicio de cotización",
         "Es interna del sitio, no un paquete de cliente", "No se vende; muestra criterio en automatización programada con alertas"],
        ["Pedidos y consultas en una planilla (formulario → planilla)",
         "<b>Pendiente de evidencia</b>. El propietario la declara «en vivo, sobre Apps Script» (propuesta interna, 19/09/2026)",
         "Sin artefacto específico en el workspace. La técnica sí está probada en la primera fila", "Formulario del cliente", "Fila nueva en una planilla", "Apps Script / Google Sheets",
         "Sin evidencia de aviso por mail ni de captura desde WhatsApp o Instagram", "<b>A medida:</b> «lo que entra por tu formulario queda anotado en una planilla»"],
        ["Recordatorios automáticos",
         "<b>Pendiente de evidencia</b>. Declarado «en vivo» y sin depender de Meta",
         "Sin artefacto en el workspace", "Planilla o calendario con fecha y contacto", "Aviso al cliente", "Por mail: Apps Script. Por WhatsApp: API de Meta",
         "No consta el canal ni la fuente de datos", "<b>A medida</b> por mail; <b>condicionado</b> si es por WhatsApp"],
        ["Reportes automáticos con IA",
         "<b>Pendiente de evidencia</b>. Declarado «en vivo»",
         "Sin artefacto en el workspace", "Planilla; datos de GrowiApp", "Resumen periódico", "Proveedor de IA (costo de uso aparte); mail o WhatsApp",
         "Que lea solo los datos de GrowiApp no está demostrado: hoy solo consta la sincronización a planilla", "<b>A medida</b> a partir de una planilla"],
        ["WhatsApp o Instagram entrante anotado en una planilla", "<b>No demostrada</b>",
         "Sin artefacto", "Mensajes entrantes", "Fila en una planilla", "API de WhatsApp Business o de mensajería de Instagram (permisos y revisión de Meta)", "Sin integración operativa",
         "<b>Condicionada</b>: «según los permisos de Meta»"],
        ["Bot de WhatsApp para preguntas frecuentes", "<b>Pendiente</b> (aprobación de Meta, sin fecha)", "El sitio vigente ya lo marca «Próximamente»", "—", "—", "Meta", "No disponible", "No se promete"]]
    con = [
        ["«Pedidos y consultas del formulario quedan anotados solos en una planilla» (candidata); L1: «lo que llega por WhatsApp, Instagram o un formulario se anota solo»", "Ofrecible a medida (formulario). WhatsApp e Instagram: condicionada", "Candidata corregida. L1: parche"],
        ["«Recordatorios de turno que salen solos, por mail o WhatsApp»", "Ofrecible a medida (mail); condicionada (WhatsApp)", "Candidata: se aclara «según los permisos de Meta» en el paso del ejemplo. L1: parche"],
        ["«Un resumen de tus ventas, armado y enviado cada semana»", "Ofrecible a medida", "Candidata corregida. L1: «se activa directo» pasa a «lo armamos a partir de ellos»"],
        ["«Ningún pedido se te pierde en el chat», «Queda andando solo», «Ves qué contestaste» (L1)", "No demostrada (absolutos; implica leer respuestas del chat)", "Solo L1: parche"],
        ["Ilustración de GrowiFlow en la home", "Ilustrativa: se rotula como ejemplo con datos ficticios, hecho a medida", "Candidata: sin la frase «no es funcionalidad verificada», que hacía parecer que Growi no sabe hacerlo"],
        ["Combo: «El sitio y el sistema no se conectan solos: el puente es el WhatsApp»", "Demostrada como descripción honesta", "Sin cambio"],
        ["«Cierre de caja automático» (GrowiApp)", "Demostrada en la demo de GrowiApp", "Sin cambio"],
        ["Caso y cita de Colo Café", "No demostrada la autorización (ver más abajo)", "Candidata: retirado. L1: parche lo retira"]]
    c = ('<p class="eyebrow">GrowiFlow</p><h1>Qué está comprobado y qué se ofrece</h1>'
         '<div class="aviso"><b>Criterio.</b> El propietario confirmó que GrowiFlow tiene automatizaciones o demos técnicas comprobadas. Acá se registra solo lo que tiene evidencia verificable en el workspace; el resto queda <b>pendiente de evidencia</b>, sin inventarla y sin darlo por inexistente. Nada de esto autoriza contratar ni cobrar: el aviso L1 sigue vigente.</div>'
         '<h2>1. Inventario</h2>' + tabla(["Capacidad", "Estado", "Evidencia", "Entradas", "Salidas", "Dependencias", "Límites", "Oferta honesta"], inv, "mx") +
         '<h2>2. Conciliación del copy</h2><p class="lead">Clases: <b>demostrada</b>, <b>ofrecible a medida</b>, <b>condicionada</b> (permisos o proveedores) y <b>no demostrada</b>.</p>' +
         tabla(["Afirmación", "Clase", "Tratamiento"], con, "mx") +
         '<p class="note">El parche para el sitio vigente está en <code>revision/parche-L1-NO-APLICADO.patch</code> (14 bloques, 4 archivos). Verificado con <code>git apply --check</code>; <b>no está aplicado</b>.</p>'
         '<h2>3. Colo Café</h2><p class="lead">La cita atribuida a «Rodrigo, dueño de Colo Café» entró al sitio el 19/09/2026 (commit <code>4b9192b</code>). El workspace confirma una relación técnica real (existe el proyecto <code>colocafe</code> con la aplicación y su base de datos), pero <b>no hay autorización escrita para citar textualmente ni para usar el nombre y el logo</b>. Una relación comercial no equivale a esa autorización. Se retiró la cita, el nombre y el logo de la candidata y el parche de L1 los retira hasta contar con ese permiso.</p>'
         '<h2>4. Consulta única para el propietario</h2><div class="aviso">(1) Para Pedidos, Recordatorios y Reportes: ¿dónde están los artefactos (script, exportación del flujo o demo grabada) y se usaron con un cliente real o con datos de prueba? (2) ¿Por qué canal salen hoy los recordatorios y los reportes: mail, enlace de WhatsApp o la API de Meta? (3) ¿Hay autorización escrita de Colo Café para citar el texto, el nombre y el logo? Con eso se confirma o se ajusta el copy.</div>'
         '<p class="note">Fuentes técnicas externas: <a href="https://developers.facebook.com/documentation/business-messaging/instagram-messaging/app-review">Meta: revisión de app para mensajería de Instagram</a> y <a href="https://developers.facebook.com/documentation/business-messaging/messenger-platform/overview">Meta: Messenger Platform</a>.</p>')
    write("auditoria-flow.html", page("GrowiFlow: capacidades y copy", c, "auditoria-flow.html"))

if __name__ == "__main__":
    auditoria()
