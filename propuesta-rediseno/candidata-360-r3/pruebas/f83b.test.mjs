// F8.3B · integración de la historia de Home, la arquitectura móvil de Invitaciones y las correcciones de F8.2 (JSON-LD de GrowiFlow).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const R = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const leer = f => readFileSync(join(R, f), 'utf8');
const home = leer('index.html'), inv = leer('invitaciones/index.html'), flow = leer('flow/index.html');
const css36 = leer('assets/growi36.css'), js36 = leer('assets/growi36.js'), css81 = leer('assets/growi81.css'), invCss = leer('assets/invitaciones/inv.css'), invUi = leer('assets/invitaciones/inv-ui.js');
const sinTags = s => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

// ------------------------------------------------------------------------------------------ Home
// ------------------------------------------------------------------------------------------ Invitaciones
test('F8.3B Invitaciones · el núcleo funcional y sus reglas no cambiaron', () => {
  const h = createHash('sha256').update(readFileSync(join(R, 'assets/invitaciones/inv-core.js'))).digest('hex');
  assert.equal(h, '20b07c3fe2b4393960335e594a6020140770e70588c7a8712994fba89837a8b1');
});
test('F8.3B Invitaciones · sticky solo con espacio suficiente y acotado a la sección; sin marco ni desplazamiento interno en móvil', () => {
  assert.ok(/@media \(max-width:959px\) and \(min-height:720px\)\{\.ix-steps\{position:sticky;top:69px/.test(invCss));
  assert.ok(/\.ixs \.ix-scr\{height:auto;min-height:600px/.test(invCss));   // F8.7: altura mínima común a las cuatro etapas
  assert.ok(/\.ix-js \.ixs \.ix-ly\{position:relative;inset:auto;overflow:visible/.test(invCss));
  assert.equal(/dashed|dotted/.test(invCss), false);   // regla aprobada: sin bordes punteados en las invitaciones
});
test('F8.3B Invitaciones · la muestra ficticia y el mensaje con respuestas reales se distinguen con texto y estilo', () => {
  assert.ok(inv.includes('Muestra · datos ficticios') && inv.includes('Con tus respuestas'));
  assert.equal(inv.split('class="ix-bdg ix-bdg-m"').length - 1, 1);
  assert.equal(inv.split('class="ix-bdg ix-bdg-r"').length - 1, 1);   // solo el casamiento; cumpleaños y empresa conservan su composición
  assert.ok(/\.ix-cas \.ix-ej \.ix-dr\{/.test(invCss) && /\.ix-cas \.ix-l-msj:not\(\.ix-ej\) \.ix-dr\{/.test(invCss));
});
test('F8.3B Invitaciones · la vista previa de WhatsApp es un diálogo modal de verdad', () => {
  assert.ok(/role="dialog" aria-modal="true"/.test(inv));
  assert.ok(/function fondoInerte\(/.test(invUi) && /h\.inert = true/.test(invUi) && /fondoInerte\(this\.wa, true\)/.test(invUi) && /fondoInerte\(this\.wa, false\)/.test(invUi));
  assert.ok(/e\.key === 'Escape' && self\.s\.wa/.test(invUi) && /e\.key === 'Tab' && self\.s\.wa/.test(invUi));   // Esc y foco contenido
  assert.ok(/a\.tipo === 'wa'\) t = \$\('\[data-act=cerrar-wa\]'/.test(invUi) && /a\.tipo === 'cerrar-wa'\) t = \$\('\[data-act=wa\]'/.test(invUi));   // foco inicial y retorno
});
test('F8.3B Invitaciones · anterior/siguiente mueven el foco al título y no existe almacenamiento ni red', () => {
  assert.ok(/data-ix-pn/.test(invUi) && /focusSoft\(\$\('\[tabindex="-1"\]', l\)\)/.test(invUi) && /e\.isTrusted/.test(invUi));
  assert.equal(/localStorage|sessionStorage|document\.cookie|XMLHttpRequest|fetch\(|sendBeacon/.test(invUi), false);
});

// ------------------------------------------------------------------------------------------ F8.2
test('F8.3B GrowiFlow · el JSON-LD conserva el estado de contratación y pagos aprobado', () => {
  const ld = JSON.parse(/<script type="application\/ld\+json">(\{"@context": "https:\/\/schema\.org", "@type": "Service"[\s\S]*?)<\/script>/.exec(flow)[1]);
  assert.ok(ld.description.endsWith('Actualmente solo se reciben consultas, sin contrataciones ni pagos.') && !/aún no está disponible|Todavía no disponible|Próximamente/.test(JSON.stringify(ld)));   // F8.7: el bot está disponible
  assert.ok(ld.description.includes('Los envíos por WhatsApp requieren una cuenta habilitada por Meta'));
  const nombres = ld.hasOfferCatalog.itemListElement.map(o => o.name);
  assert.ok(nombres.includes('Bot de WhatsApp para preguntas frecuentes'));
  assert.ok(/Puesta en marcha de referencia de USD 149, a confirmar al consultar, y mensajes de Meta aparte\./.test(ld.hasOfferCatalog.itemListElement.find(o => o.name.startsWith('Bot')).description));   // F8.7C: disponible; precio de referencia, sin «prevista»
  assert.ok(flow.includes('La integración de WhatsApp e Instagram se evalúa según la cuenta del cliente.'));
});

// ------------------------------------------------------------------------------------------ higiene
test('F8.3B · ninguna página conserva enlaces «#» de los prototipos ni referencias a los prototipos', () => {
  const rutas = ['index.html', 'app/index.html', 'web/index.html', 'flow/index.html', 'combo/index.html', 'invitaciones/index.html', 'app/cafeterias/index.html', 'app/peluquerias/index.html', 'app/talleres/index.html', 'app/retail/index.html'];
  for (const r of rutas) { const h = leer(r); assert.equal(/href="#"/.test(h), false, r); assert.equal(/home-hero\.html|invitaciones-movil\.html|PROTOTIPO|f8-3a/i.test(h), false, r); }
  const sb = ['demos/sandbox/cafeteria/index.html', 'demos/sandbox/peluqueria/index.html'];
  for (const r of sb) assert.equal(/href="#"/.test(leer(r)), false, r);
});
