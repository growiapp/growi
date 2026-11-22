// F4.1/F4.2 · Invitaciones: contrato de RSVP (F0), máquina de estados de los recorridos y coherencia comercial de la página generada.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import G from '../assets/invitaciones/inv-core.js';

const leer = (r) => fs.readFileSync(new URL('../' + r, import.meta.url), 'utf8');
const ok = (ev, d) => ({ nombre: 'Camila Ríos', respuesta: 'si', personas: 1, ...d });

// ---------------------------------------------------------------- mensajes (cinco de F0; los de cumpleaños los aprobó el propietario en las decisiones de F4.0)
test('RSVP: los cinco mensajes de F0 salen carácter por carácter', () => {
  assert.equal(G.mensaje('cas', ok('cas', { personas: 1 })), 'Hola, Lucía y Tomás. Soy Camila Ríos y confirmo que voy a su casamiento del sábado 20 de marzo. Gracias por invitarme.');
  assert.equal(G.mensaje('cas', ok('cas', { personas: 2 })), 'Hola, Lucía y Tomás. Soy Camila Ríos y confirmamos que vamos a su casamiento del sábado 20 de marzo. Somos 2. Gracias por invitarnos.');
  assert.equal(G.mensaje('cas', ok('cas', { respuesta: 'no' })), 'Hola, Lucía y Tomás. Soy Camila Ríos. Me hubiera encantado, pero no voy a poder ir a su casamiento del sábado 20 de marzo. Les mando un abrazo.');
  assert.equal(G.mensaje('emp', { nombre: 'Diego Sosa', respuesta: 'si' }), 'Hola, soy Diego Sosa. Confirmo que asisto al Encuentro anual 2027 del jueves 18 de marzo.');
  assert.equal(G.mensaje('emp', { nombre: 'Diego Sosa', respuesta: 'no' }), 'Hola, soy Diego Sosa. No voy a poder asistir al Encuentro anual 2027 del jueves 18 de marzo. Gracias por avisarme.');
});
test('RSVP: los tres mensajes de cumpleaños aprobados', () => {
  assert.equal(G.mensaje('cum', ok('cum', { personas: 1 })), 'Hola, Mica. Soy Camila Ríos y confirmo que voy a tus 30 el sábado 14 de agosto. Gracias por invitarme.');
  assert.equal(G.mensaje('cum', ok('cum', { personas: 2 })), 'Hola, Mica. Soy Camila Ríos y confirmamos que vamos a tus 30 el sábado 14 de agosto. Somos 2. Gracias por invitarnos.');
  assert.equal(G.mensaje('cum', ok('cum', { respuesta: 'no' })), 'Hola, Mica. Soy Camila Ríos. Me hubiera encantado, pero no voy a poder ir a tus 30 el sábado 14 de agosto. Te mando un abrazo.');
});
test('RSVP: el mensaje se arma desde las respuestas, no es un texto fijo; sin emojis ni plantillas', () => {
  const a = G.mensaje('cas', ok('cas', { nombre: 'Ana  Pérez ', personas: 3 })), b = G.mensaje('cas', ok('cas', { nombre: 'Luis Gómez', personas: 4 }));
  assert.ok(a.includes('Soy Ana Pérez ') && a.includes('Somos 3.')); assert.ok(b.includes('Soy Luis Gómez ') && b.includes('Somos 4.')); assert.notEqual(a, b);
  for (const m of [a, b]) assert.equal(/\p{Extended_Pictographic}|\[|\]|\{|\}|borrá/iu.test(m), false);
  assert.equal(G.mensaje('emp', { nombre: 'Ana', respuesta: 'si', personas: 7 }), 'Hola, soy Ana. Confirmo que asisto al Encuentro anual 2027 del jueves 18 de marzo.');   // empresa ignora la cantidad
});

// ---------------------------------------------------------------- validación
test('RSVP: validaciones de nombre, respuesta y cantidad', () => {
  const e = (ev, d) => G.validar(ev, d).errores;
  assert.equal(e('cas', ok('cas', { nombre: '   ' })).nombre, 'Escribí tu nombre para armar el mensaje.');
  assert.equal(e('cas', ok('cas', { nombre: 'a'.repeat(61) })).nombre, 'Usá hasta 60 caracteres.');
  assert.equal(G.validar('cas', ok('cas', { nombre: 'a'.repeat(60) })).ok, true);
  assert.equal(e('cas', ok('cas', { nombre: 'Ana​Pérez' })).nombre, 'Probá con letras y números, sin símbolos raros.');
  assert.equal(e('cas', ok('cas', { nombre: 'Ana\u0007' })).nombre, 'Probá con letras y números, sin símbolos raros.');
  assert.equal(e('cas', ok('cas', { respuesta: null })).respuesta, 'Elegí si podés ir o no.');
  assert.equal(e('emp', { nombre: 'Ana', respuesta: null }).respuesta, 'Elegí si asistís o no.');
  for (const p of [0, 6, -1]) assert.equal(e('cas', ok('cas', { personas: p })).personas, 'Indicá entre 1 y 5 personas.');
  for (const p of [1.5, 'dos', NaN, null, undefined]) assert.equal(e('cas', ok('cas', { personas: p })).personas, 'Indicá un número entero, de 1 a 5.');
  assert.equal(G.validar('cas', ok('cas', { respuesta: 'no', personas: 99 })).ok, true);   // con «No» la cantidad no se pide
  assert.equal(G.validar('emp', { nombre: 'Ana', respuesta: 'si', personas: 99 }).ok, true);   // empresa no admite acompañantes
  assert.equal(G.mensaje('cas', ok('cas', { nombre: '' })), null);   // no se arma un mensaje inválido ni se corrige en silencio
});

// ---------------------------------------------------------------- recorridos
const paso = (s, ...acciones) => acciones.reduce((x, a) => G.reducir(x, typeof a === 'string' ? { tipo: a } : a), s);
test('Casamiento: siete estados, apertura explícita y cuatro actos', () => {
  let s = G.inicial('cas');
  assert.equal(s.paso, 'chat'); assert.equal(s.abierta, false); assert.equal(G.acto(s.paso), 1);
  s = paso(s, 'ver-sellada'); assert.equal(s.paso, 'sellada'); assert.equal(s.abierta, false);
  s = paso(s, 'abrir'); assert.equal(s.paso, 'portada'); assert.equal(s.abierta, true);
  const orden = ['programa', 'lugar', 'confirmar'];
  for (const p of orden) { s = paso(s, { tipo: 'ir', paso: p }); assert.equal(s.paso, p); }
  assert.deepEqual([G.acto('chat'), G.acto('sellada'), G.acto('portada'), G.acto('programa'), G.acto('lugar'), G.acto('confirmar'), G.acto('mensaje')], [1, 1, 1, 2, 2, 3, 4]);
  assert.equal(paso(G.inicial('cas'), { tipo: 'ir', paso: 'mensaje' }).paso, 'chat');   // no se salta al mensaje sin haberlo preparado
});
test('Casamiento: navegar por actos, saltar a confirmar y que el acto 4 solo exista con datos válidos', () => {
  let s = G.inicial('cas');
  s = paso(s, { tipo: 'acto', n: 3 }); assert.equal(s.paso, 'confirmar'); assert.equal(s.abierta, true);   // saltar a confirmar abre la invitación por acción explícita
  s = paso(s, 'siguiente'); assert.equal(s.paso, 'confirmar'); assert.ok(s.errores.nombre && s.errores.respuesta); assert.equal(s.mensaje, null);   // valida y no avanza
  s = paso(s, { tipo: 'datos', campo: 'nombre', valor: 'Camila Ríos' }, { tipo: 'datos', campo: 'respuesta', valor: 'si' }, { tipo: 'datos', campo: 'personas', valor: 2 });
  assert.equal(s.errores.nombre, undefined);   // corregir un campo limpia su error
  s = paso(s, 'siguiente'); assert.equal(s.paso, 'mensaje'); assert.ok(s.mensaje.includes('Somos 2.'));
  s = paso(s, 'anterior'); assert.equal(s.paso, 'confirmar'); assert.equal(s.datos.nombre, 'Camila Ríos');   // volver conserva lo cargado
  assert.equal(paso(G.inicial('cas'), 'anterior').paso, 'chat');
});
test('RSVP: corregir no pierde datos; la vista previa de WhatsApp solo existe con un mensaje preparado y nunca se marca como enviada', () => {
  let s = paso(G.inicial('cum'), { tipo: 'datos', campo: 'nombre', valor: 'Camila Ríos' }, { tipo: 'datos', campo: 'respuesta', valor: 'no' });
  assert.equal(paso(s, 'wa').wa, false);   // sin mensaje preparado no hay vista previa
  s = paso(s, 'preparar'); assert.equal(s.paso, 'mensaje'); assert.ok(s.mensaje.includes('no voy a poder ir'));
  s = paso(s, 'wa'); assert.equal(s.wa, true);
  s = paso(s, 'cerrar-wa'); assert.equal(s.wa, false); assert.equal(s.paso, 'mensaje');
  s = paso(s, 'editar'); assert.equal(s.paso, 'confirmar'); assert.equal(s.datos.nombre, 'Camila Ríos'); assert.equal(s.datos.respuesta, 'no'); assert.equal(s.mensaje, null);
  s = paso(s, { tipo: 'datos', campo: 'respuesta', valor: 'si' }, 'preparar'); assert.ok(s.mensaje.includes('confirmo que voy'));   // el mensaje sigue a las respuestas
  for (const k of Object.keys(s)) assert.equal(/envi|registr|confirmad/i.test(k), false, 'clave sospechosa: ' + k);
});
test('Cumpleaños y empresa: pasos y acciones propias (La noche, La jornada) y plazo informativo', () => {
  let c = G.inicial('cum'); assert.equal(c.abierta, true); assert.equal(c.noche, 1);
  c = paso(c, { tipo: 'noche', idx: 2 }); assert.equal(c.noche, 2); assert.equal(paso(c, { tipo: 'noche', idx: 3 }).noche, 2);
  assert.equal(paso(c, 'reiniciar').noche, 1);
  let e = G.inicial('emp'); assert.equal(paso(e, { tipo: 'noche', idx: 0 }).noche, 1);   // la noche solo existe en cumpleaños
  e = paso(e, { tipo: 'detalle', id: '2' }); assert.equal(e.detalle, '2'); e = paso(e, 'cerrar-detalle'); assert.equal(e.detalle, null);
  assert.equal(G.EVENTOS.emp.personas, false); assert.deepEqual(G.EVENTOS.emp.pasos, ['portada', 'jornada', 'confirmar', 'mensaje']);
  // el plazo de confirmación es informativo: no hay estado ni acción de cierre
  assert.equal(e.hasOwnProperty('cerrado'), false); assert.equal(paso(e, { tipo: 'cerrar-plazo' }), e);
});
test('Reductor: inmutable y reiniciar vuelve exactamente al inicio', () => {
  const s0 = G.inicial('cas'), copia = JSON.stringify(s0);
  const s1 = paso(s0, 'ver-sellada', 'abrir', { tipo: 'datos', campo: 'nombre', valor: 'Ana' }); assert.equal(JSON.stringify(s0), copia);
  assert.deepEqual(paso(s1, 'reiniciar'), s0);
});

// ---------------------------------------------------------------- página generada (F4.2)
const pagina = () => leer('invitaciones/index.html');
const cuenta = (h, t) => h.split(t).length - 1;
const region = (h, ini, fin) => { const a = h.indexOf(ini); assert.ok(a >= 0, ini); const b = fin ? h.indexOf(fin, a + 1) : h.length; return h.slice(a, b < 0 ? h.length : b); };
test('Invitaciones: titular, bajada y modelo comercial aprobados', () => {
  const h = pagina();
  assert.ok(h.includes('Tu evento empieza <em>cuando abren</em> la invitación.'));
  assert.ok(h.includes('Diseñamos una invitación con la identidad de tu evento. Tus invitados la abren desde un enlace, encuentran toda la información y pueden confirmar por WhatsApp.'));
  for (const t of ['no sobre una plantilla', 'Ver qué es a medida', 'demo de 20', 'precio fijo', 'precio cerrado', 'Lista de invitados', 'Probá las demos']) assert.equal(h.includes(t), false, t);
  assert.ok(h.includes('Una base clara, y todo lo demás a tu medida.'));
  assert.ok(h.includes('Programa interactivo') && h.includes('Apertura animada con tus fotos'));
  assert.ok(h.includes('Al contratar, se abona un anticipo del 50% imputable al precio total y el saldo del 50% antes de publicar la invitación definitiva.'));
  assert.equal(cuenta(h, 'Al contratar, se abona un anticipo del 50% imputable al precio total y el saldo del 50% antes de publicar la invitación definitiva.'), 1);
});
test('Invitaciones: la muestra no tiene enlaces ni números de WhatsApp dentro de las experiencias y no afirma envío ni registro', () => {
  const h = pagina();
  const cas = region(h, '<div class="ix-dev"><div class="ix-scr ix-cas"', '<section class="ix-cum"');
  const cum = region(h, '<section class="ix-cum"', '<section class="ix-emp"');
  const emp = region(h, '<section class="ix-emp"', '<section class="ix-al"');
  for (const [n, x] of [['cas', cas], ['cum', cum], ['emp', emp]]) {
    assert.ok(x.length > 3000, n);
    assert.equal(/href=/.test(x), false, 'enlace dentro de ' + n);
    assert.equal(/wa\.me|api\.whatsapp|\d{10,}/.test(x), false, n);
    assert.equal(cuenta(x, 'Todavía no se envió.'), 1, n);
    assert.equal(cuenta(x, 'Esto es una vista previa: no se envía nada ni se abre una conversación real.'), 1, n);   // una única explicación
    for (const viejo of ['En esta muestra no se abre ningún número.', 'el botón está inhabilitado', 'Todavía no hay mensajes enviados', 'ix-strip', 'ix-wnote']) assert.equal(x.includes(viejo), false, viejo + ' ' + n);
    assert.ok(x.includes('role="dialog" aria-modal="true"') && x.includes('disabled aria-label="Enviar (no disponible en la vista previa)"'), n);
  }
  for (const t of ['Mensaje enviado', 'Confirmado', 'Registrado', 'Respuesta registrada', 'Gracias por confirmar', 'Listo ✓', 'leído']) assert.equal(h.includes(t), false, t);
  for (const m of h.matchAll(/wa\.me\/(\d+)/g)) assert.equal(m[1], '5491170593877');   // solo consultas a Growi
});
test('Invitaciones: tres experiencias con estructura propia; el dispositivo existe donde corresponde', () => {
  const h = pagina();
  assert.equal(cuenta(h, 'class="ix-dev"'), 2);   // casamiento (protagonista) y cumpleaños (recortado); la empresa no tiene dispositivo
  const emp = region(h, '<section class="ix-emp"', '<section class="ix-al"');
  assert.equal(/ix-dev|ix-scr|ix-isl/.test(emp), false);
  for (const id of ['ix-cas-portada', 'ix-cas-chat', 'ix-cas-programa', 'ix-cas-lugar', 'ix-cas-confirmar', 'ix-cas-mensaje', 'ix-cum-portada', 'ix-cum-noche', 'ix-cum-info', 'ix-cum-confirmar', 'ix-cum-mensaje', 'ix-emp-portada', 'ix-emp-jornada', 'ix-emp-confirmar', 'ix-emp-mensaje']) assert.ok(h.includes('id="' + id + '"'), id);
  assert.ok(h.includes('role="radiogroup" aria-label="Hora de la noche"') && h.includes('role="radio"'));   // La noche: grupo de radios, no deslizador
  assert.equal(h.includes('role="slider"'), false);
  assert.ok(h.includes('id="ix-cas-cant"') && h.includes('id="ix-cum-cant"') && !h.includes('id="ix-emp-cant"'));
  assert.equal(cuenta(h, 'data-bloque="'), 6);   // seis bloques de la jornada, expansión en línea (sin diálogo de detalle)
  assert.equal(h.includes('data-layer="detalle"') || h.includes('ix-sheet'), false);
  assert.equal(/role="switch"|data-ix-marcas|type="checkbox"/.test(h), false);
});
test('Invitaciones: aclaraciones comerciales sin repetición y lo opcional marcado con discreción', () => {
  const h = pagina(), css = leer('assets/invitaciones/inv.css');
  assert.equal(cuenta(h, 'Con presupuesto y alcance por escrito, sin precio de lista.'), 1);   // la aclaración general, una vez
  assert.equal(cuenta(h, 'Invitación de ejemplo, con datos ficticios.'), 1);
  for (const t of ['Borde punteado', 'La línea punteada', 'Datos ficticios', 'Ejemplo ilustrativo', '>Demo<', '>Prueba<']) assert.equal(h.includes(t), false, t);
  assert.ok(cuenta(h, 'class="ix-mk"') >= 6 && cuenta(h, 'role="img" aria-label="a medida"') >= 3);   // marcas «a medida» con nombre accesible
  assert.equal(/dashed|dotted/.test(css), false);   // ningún borde punteado sobre las invitaciones
  assert.ok(h.includes('Lo marcado con este círculo no viene en la base.'));
});
test('Invitaciones: cada experiencia declara su propia tipografía y las fuentes tienen licencia y peso acotado', () => {
  const base = leer('assets/invitaciones/inv-base.css'), css = leer('assets/invitaciones/inv.css');
  for (const f of ['Instrument Serif', 'Fraunces', 'Schibsted Grotesk']) assert.ok(base.includes('font-family:"' + f + '"'), f);
  assert.ok(/\.ix-cas \.ix-h\{font:[^}]*var\(--ix-serif\)/.test(css) && /\.ix-cum h2\{font:[^}]*var\(--ix-fra\)/.test(css) && /\.ix-eh\{font:[^}]*var\(--ix-sch\)/.test(css));
  for (const f of ['instrument-serif-latin.woff2', 'instrument-serif-italic-latin.woff2', 'fraunces-ix.woff2', 'fraunces-italic-ix.woff2', 'schibsted-grotesk-ix.woff2', 'OFL-InstrumentSerif.txt', 'OFL-Fraunces.txt', 'OFL-SchibstedGrotesk.txt']) assert.ok(fs.existsSync(new URL('../assets/fonts/' + f, import.meta.url)), f);
  for (const f of ['fraunces-ix.woff2', 'fraunces-italic-ix.woff2', 'schibsted-grotesk-ix.woff2']) assert.ok(fs.statSync(new URL('../assets/fonts/' + f, import.meta.url)).size < 45000, f);
  for (const l of ['OFL-Fraunces.txt', 'OFL-SchibstedGrotesk.txt']) assert.ok(leer('assets/fonts/' + l).includes('SIL OPEN FONT LICENSE Version 1.1'), l);
  const todo = leer('assets/invitaciones/inv-ui.js') + leer('assets/invitaciones/inv-core.js') + base + css;
  assert.equal(/https?:\/\/|localStorage|sessionStorage|document\.cookie|XMLHttpRequest|fetch\(|navigator\.sendBeacon|import\(/.test(todo.replace(/https?:\/\/scripts\.sil\.org/g, '')), false);
});
test('Invitaciones: el foco solo se mueve por una acción real, el desplazamiento nunca enfoca y no hay animaciones permanentes', () => {
  const ui = leer('assets/invitaciones/inv-ui.js'), css = leer('assets/invitaciones/inv.css') + leer('assets/invitaciones/inv-base.css');
  assert.ok(/user === true/.test(ui) && /isTrusted/.test(ui));
  assert.equal(/setInterval|autoplay/.test(ui), false);
  assert.equal(/animation[^;{}]*infinite/.test(css), false);
  assert.ok(/prefers-reduced-motion:\s*reduce/.test(css) && /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/.test(ui));
});
// Se ejecuta el código real de inv-ui.js en un entorno mínimo y se aplican sus decisiones sobre el reductor real.
function cargarUI() {
  const win = { GrowiInv: G, matchMedia: () => ({ matches: false }) };
  const doc = { readyState: 'loading', documentElement: { classList: { add() {} } }, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [] };
  vm.runInNewContext(leer('assets/invitaciones/inv-ui.js'), { window: win, document: doc, setTimeout, clearTimeout });
  const f = win.GrowiInvUI.accionesDeActo;
  return (...a) => JSON.parse(JSON.stringify(f(...a)));   // sale del contexto aislado como datos planos
}
const aplicar = (s, acciones) => acciones.reduce((e, a) => (a.tipo === 'muestra' ? e : G.reducir(e, a)), s);
const nuevoCas = () => G.reducir(G.inicial('cas'), { tipo: 'abrir' });
const conDatos = (s, d) => Object.entries(d).reduce((e, [campo, valor]) => G.reducir(e, { tipo: 'datos', campo, valor }), s);
test('Invitaciones F4.2.2: navegar o desplazarse por los capítulos nunca modifica las respuestas', () => {
  const acciones = cargarUI();
  for (const datos of [{}, { nombre: 'Ana Gómez' }, { nombre: 'Ana Gómez', respuesta: 'si', personas: 3 }, { nombre: 'Ana Gómez', respuesta: 'no' }]) {
    let s = conDatos(nuevoCas(), datos); const antes = JSON.stringify(s.datos);
    for (const n of [4, 3, 2, 1, 0, 4, 2, 3, 4, 1, 3]) {
      const a = acciones(s, n, false);
      assert.equal(a.some(x => x.tipo === 'datos'), false, 'el capítulo ' + n + ' despachó datos');
      s = aplicar(s, a);
      assert.equal(JSON.stringify(s.datos), antes, 'las respuestas cambiaron en el capítulo ' + n + ' con ' + antes);
    }
  }
});
test('Invitaciones F4.2.2: el capítulo «Tu mensaje» usa las respuestas reales o una muestra aparte, nunca datos propios', () => {
  const acciones = cargarUI();
  const vacio = nuevoCas();
  assert.deepEqual(acciones(vacio, 4, false), [{ tipo: 'ir', paso: 'confirmar' }, { tipo: 'muestra' }]);   // sin datos: muestra
  assert.equal(aplicar(vacio, acciones(vacio, 4, false)).mensaje, null);   // y no se arma ningún mensaje
  const incompleto = conDatos(vacio, { nombre: 'Ana Gómez' });
  assert.equal(acciones(incompleto, 4, false).some(x => x.tipo === 'muestra'), true);
  const valido = conDatos(vacio, { nombre: 'Ana Gómez', respuesta: 'si', personas: 2 });
  const r = aplicar(valido, acciones(valido, 4, false));
  assert.equal(r.paso, 'mensaje'); assert.equal(r.mensaje, G.mensaje('cas', valido.datos));   // el mensaje sale de lo cargado
  assert.match(r.mensaje, /Soy Ana Gómez/); assert.equal(/Rossi/.test(r.mensaje), false);
  assert.deepEqual(acciones(r, 4, false), []);   // ya estaba preparado: no se repite
  const vuelta = aplicar(r, acciones(r, 3, false));
  assert.equal(vuelta.paso, 'confirmar'); assert.deepEqual(vuelta.datos, valido.datos);   // volver conserva lo cargado
});
test('Invitaciones F4.2.2: un campo de texto en uso y la vista previa de WhatsApp frenan el recorrido (salvo volver al formulario)', () => {
  const acciones = cargarUI();
  const s = conDatos(nuevoCas(), { nombre: 'Ana Gó' });
  for (const n of [0, 1, 2, 4]) assert.deepEqual(acciones(s, n, true), [], 'escribiendo, capítulo ' + n);
  assert.deepEqual(acciones(s, 3, true), [{ tipo: 'ir', paso: 'confirmar' }]);
  const wa = { ...conDatos(nuevoCas(), { nombre: 'Ana', respuesta: 'si', personas: 1 }), wa: true };
  for (const n of [0, 1, 2, 3, 4]) assert.deepEqual(acciones(wa, n, false), [], 'WhatsApp abierto, capítulo ' + n);
});
test('Invitaciones F4.2.2: el desplazamiento no mueve el foco (solo las acciones de la persona lo hacen)', () => {
  const ui = leer('assets/invitaciones/inv-ui.js');
  const historia = ui.slice(ui.indexOf('Historia.prototype.ir'), ui.indexOf('function montar'));
  assert.equal(/dispatch\([^)]*\},\s*true\)/.test(historia), false);   // el recorrido despacha siempre con user=false
  assert.ok(/user === true/.test(ui) && /e\.isTrusted|isTrusted/.test(ui));   // y el foco exige una acción de confianza
});
test('Invitaciones: accesibilidad estática (ids únicos, capas con nombre, estados anunciados, sin JavaScript se lee completa)', () => {
  const h = pagina();
  const ids = [...h.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]); const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  assert.deepEqual(dup, []);
  for (const m of h.matchAll(/aria-labelledby="([^"]+)"/g)) for (const i of m[1].split(' ')) assert.ok(ids.includes(i), 'aria-labelledby sin destino: ' + i);
  for (const m of h.matchAll(/aria-controls="([^"]+)"/g)) assert.ok(ids.includes(m[1]), 'aria-controls sin destino: ' + m[1]);
  assert.ok(cuenta(h, 'aria-live="polite"') >= 1);   // «La noche» anuncia su cambio
  assert.ok(h.includes('role="group" aria-label="Invitación de Lucía y Tomás"') && h.includes('role="group" aria-label="Invitación de los 30 de Mica"'));
  // sin JavaScript solo nacen ocultas las capas que dependen de una acción (chat, borrador, vista previa)
  for (const id of ['ix-cas-programa', 'ix-cas-lugar', 'ix-cas-confirmar', 'ix-cum-noche', 'ix-cum-info', 'ix-cum-confirmar', 'ix-emp-confirmar']) assert.equal(new RegExp('id="' + id + '"[^>]*\\shidden').test(h), false, id);
  assert.ok(/id="ix-cas-chat"[^>]*\shidden/.test(h) && /id="ix-cas-mensaje"[^>]*\shidden/.test(h));
  assert.ok(h.includes('document.documentElement.classList.add("ix-js")'));
});
test('Invitaciones: la barra «Consultar» no tapa las experiencias (data-sticky-hide en recorrido, cumpleaños y empresa)', () => {
  const h = pagina(), css = leer('assets/invitaciones/inv.css');
  assert.ok(h.includes('<div class="ixs" id="inicio" data-ix-story data-sticky-hide>') && h.includes('id="cumple" data-t="1" data-sticky-hide') && h.includes('data-inv="emp" data-paso="portada" data-sticky-hide'));
  assert.ok(/html\{scroll-padding-top:\d+px\}/.test(css) && /max-width:720px\)\{html\{scroll-padding-bottom:\d+px\}\}/.test(css));
});
test('Home: el teaser de Invitaciones refleja la nueva experiencia y enlaza a la página', () => {
  const h = leer('index.html');
  assert.ok(h.includes('class="ix-tz"') && h.includes('Una invitación con la identidad de tu evento'));
  assert.ok(h.includes('inv-base.css') && h.includes('href="invitaciones/"'));
  assert.equal(h.includes('inv-gallery') || h.includes('Invitaciones digitales de muestra'), false);
  assert.ok(h.includes('ix-tz-cas') && h.includes('ix-tz-cum') && h.includes('ix-tz-emp'));
});

test('Invitaciones F4.2.1: la muestra del mensaje es una capa aparte del formulario', () => {
  // el comportamiento del recorrido se prueba arriba (F4.2.2) sobre el código real; acá, solo el marcado de la muestra
  const h = pagina();
  assert.equal(cuenta(h, 'data-ly="ejemplo"'), 1);
  assert.ok(h.includes('data-msg-ej') && h.includes('data-go="confirmar">Completar mi respuesta'));
});
test('Invitaciones F4.2.1: las filas de la ficha de Empresa no pueden superponer etiqueta y valor en móvil', () => {
  const css = fs.readFileSync(new URL('../assets/invitaciones/inv.css', import.meta.url), 'utf8');
  assert.ok(/@media \(max-width:560px\)\{\.ix-edl>div\{grid-template-columns:1fr/.test(css));
  assert.ok(/\.ix-edl>div\{display:grid;grid-template-columns:152px 1fr/.test(css));
});
test('Invitaciones F4.2.1: una pantalla sale antes de que entre la otra (sin superposición legible) y «Empezar de nuevo» es un control con estilo', () => {
  const css = fs.readFileSync(new URL('../assets/invitaciones/inv.css', import.meta.url), 'utf8');
  assert.ok(css.includes('.ix-ly.ix-out{z-index:1;pointer-events:none;animation:ix-leave .14s') && css.includes('.ix-ly.ix-in{z-index:3;animation:ix-fade .3s var(--ix-ease) .14s'));
  assert.ok(/\.ix-reset\{display:inline-flex[^}]*border:1\.5px solid currentColor/.test(css));
  const h = pagina();
  assert.equal(cuenta(h, 'class="ix-reset"'), 3);
  assert.equal(/class="ix-lk"[^>]*data-ix-reiniciar/.test(h), false);
});

test('Invitaciones F4.2.3: las direcciones de ejemplo usan subdominio propio, son texto (no enlaces) y están en la lista aprobada', () => {
  const h = pagina();
  const permitidas = new Set(['luciaytomas.growi.ar', 'los30demica.growi.ar', 'encuentro2027.growi.ar']);
  const exp = region(h, '<div class="ixs"', '<section class="ix-al"');
  const vistas = [...exp.matchAll(/(?:^|[>\s"'(])((?:[a-z0-9-]+\.)growi\.ar)(?![a-z0-9.-])/g)].map(m => m[1]);
  assert.ok(vistas.length >= 1 && vistas.every(v => permitidas.has(v)), 'subdominios: ' + vistas.join(','));
  assert.equal(/growi\.ar\/[a-z0-9-]+-[a-z0-9-]+/.test(exp), false);   // nada del estilo growi.ar/lucia-y-tomas
  assert.equal(/<a [^>]*growi\.ar/.test(exp) || /href="[^"]*[a-z0-9-]+\.growi\.ar/.test(exp), false);   // la dirección ilustrativa no es un enlace
  assert.ok(exp.includes('<em>luciaytomas.growi.ar</em>'));
});

test('Invitaciones F4.2.3: «Empezar de nuevo» de cumpleaños conserva su lugar (el bloque editorial no se mueve al cambiar de momento)', () => {
  const h = pagina(), css = leer('assets/invitaciones/inv.css'), ui = leer('assets/invitaciones/inv-ui.js');
  assert.ok(h.includes('data-ix-reiniciar-ev="cum" data-ix-slot data-off>') && !/data-ix-reiniciar-ev="cum" hidden/.test(h));
  assert.ok(css.includes('.ix-cum-copy .ix-reset[data-off]{visibility:hidden}'));   // oculto a la vista y al teclado, pero ocupa su espacio
  assert.ok(/mostrarReinicio = function \(on\)/.test(ui) && ui.includes("hasAttribute('data-ix-slot')"));
  assert.equal(/\.ix-cum-copy[^{]*\{[^}]*(top|translate|margin-top):\s*-?\d/.test(css), false);   // sin desplazamientos arbitrarios por momento
});

test('Invitaciones F4.2.3: la píldora de la portada de cumpleaños dice «Hasta las 2» (texto aprobado por el propietario)', () => {
  const h = pagina();
  assert.ok(h.includes('<p class="ix-csk">Hasta las 2</p>'));
  assert.equal(h.includes('Traé ganas'), false);
  assert.equal(/\.ix-csk\{[^}]*text-transform/.test(leer('assets/invitaciones/inv.css')), false);   // capitalización inicial, sin versales
});

test('F6.1: el Home (teaser de Invitaciones) pasa a una columna por debajo de 360 px para no desbordar a 320 px', () => {
  const base = leer('assets/invitaciones/inv-base.css');
  assert.ok(base.includes('@media (max-width:359px){.ix-tz{grid-template-columns:minmax(0,1fr)}.ix-tz-cas{grid-column:auto;'));
  // la grilla de dos columnas del teaser sigue por encima de 360 px y no se oculta nada con overflow global
  assert.ok(/@media \(max-width:860px\)\{[^}]*\.ix-tz\{grid-template-columns:1fr 1fr/.test(base));
  assert.equal(/overflow-x:\s*hidden/.test(base), false);
});
