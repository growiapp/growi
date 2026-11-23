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
const escena = (/<div class="hs-w">[\s\S]*?<\/section><\/div>/.exec(home) || [''])[0];
const sinTags = s => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

// ------------------------------------------------------------------------------------------ Home
test('F8.3B Home · la escena cuenta Te encuentran → Te consultan → Lo organizás con una causalidad real', () => {
  assert.ok(escena, 'falta la escena');
  const pasos = [...escena.matchAll(/data-hs-s="(\d)"[^>]*>(?:<span[^>]*>\d<\/span>)?([^<]+)</g)].map(m => m[1] + ':' + m[2]);
  assert.deepEqual(pasos, ['1:Te encuentran', '2:Te consultan', '3:Lo organizás']);
  const t = sinTags(escena);
  assert.ok(t.includes('Pedir turno por rodilla') && t.includes('Hola, quiero turno para el sábado a la mañana'));   // el sitio lleva a la consulta por WhatsApp
  assert.ok(t.includes('Responde una persona del centro'));                                                          // una persona responde
  assert.ok(t.includes('Anotar turno de Julián') && /data-hs-do/.test(escena));                                      // el turno lo anota una persona con un botón
  assert.ok(t.includes('Lo anota una persona del centro.'));
  assert.ok(t.includes('Ejemplo ilustrativo · datos ficticios'));
});
test('F8.3B Home · sin caja, cobros, importes ni automatizaciones inventadas, y sin las píldoras amarillas ni la escena anterior', () => {
  const t = sinTags(escena) + sinTags(js36.slice(js36.indexOf('data-hs')).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''));   // sin comentarios del código
  assert.equal(/Caja del día|cobr|\$\s?\d|automátic|automatiz|integraci/i.test(t), false, t.match(/Caja del día|cobr\w*|automát\w*|automatiz\w*|integraci\w*/i)?.[0]);
  assert.equal(/hr-cap|hr-ap|hr-wa|hr-ph|sc-hero|data-num/.test(escena + css36 + home.split('</main>')[0].split('class="hero36"')[1].split('id="necesidad"')[0]), false);
  assert.equal(/Queda registrado/.test(home), false);
  assert.equal(/avisos autom|a medida con GrowiFlow/i.test(escena), false);   // ese alcance corresponde a GrowiFlow, no al hero
});
test('F8.3B Home · la agenda es una interfaz independiente del chat (no está dentro del celular)', () => {
  const dev = /<div class="hs-dev">([\s\S]*?)<\/div><div class="hs-agp"/.exec(escena);
  assert.ok(dev, 'estructura hs-dev / hs-agp');
  assert.equal(/hs-agp|Agenda del centro/.test(dev[1]), false);
  assert.ok(/<div class="hs-agp" data-hs-agp><p class="hs-l">Agenda del centro · sábado<\/p>/.test(escena));
});
test('F8.3B Home · móvil: la escena queda después de las ofertas y ya no se oculta', () => {
  assert.equal(/\.h2-art36\{display:none\}/.test(css81), false);
  const i = home.indexOf('class="hero-lines"'), j = home.indexOf('class="hs-w"');
  assert.ok(i > 0 && j > i, 'la escena va después de las cinco líneas de oferta');
  assert.ok(home.indexOf('home-hero-whatsapp') < i);   // el CTA principal precede a las ofertas
});
test('F8.3B Home · escritorio: reproducción corta con pausa; móvil y movimiento reducido: manual', () => {
  const m = js36.slice(js36.indexOf('Home · hero «Te encuentran'));
  assert.ok(/var debe = !manual && motionOk\(\) && wide\(\);/.test(m));                                         // reproducción = escritorio ∧ movimiento permitido ∧ no manual
  assert.equal(+/var MIN = (\d+);/.exec(m)[1], +/@container hs \(min-width:(\d+)px\)/.exec(css36)[1]);        // el umbral de JavaScript es el MISMO que el del CSS
  assert.ok(/new ResizeObserver\(sync\)/.test(m) && /mq\.addEventListener\("change", sync\)/.test(m));       // se reevalúa al cambiar el tamaño y la preferencia de movimiento reducido
  assert.equal(/var motion = document\.documentElement\.classList\.contains\("mo"\)/.test(m), false);         // ya no se decide solo con el estado inicial
  assert.ok(/IntersectionObserver/.test(m) && /visibilitychange/.test(m) && /isIntersecting/.test(m));       // se detiene fuera de vista y con la pestaña oculta
  assert.ok(/data-hs-pp/.test(m) && /Reproducir animación/.test(m) && /Pausar animación/.test(m));
  assert.ok(/function manualStop\(\)/.test(m) && /doBtn\.addEventListener\("click"/.test(m));                    // cualquier toque del usuario toma el control (no vuelve a reproducirse sola)
  assert.ok(/press/.test(m) && /\[3, 0, 1, 900\]/.test(m));                                                    // el momento de pulsar «Anotar turno» es un estado visible
  const ms = [...m.matchAll(/\[\d, [01], [01], (\d+)\]/g)].reduce((a, x) => a + +x[1], 0);
  assert.ok(ms <= 12500, 'ciclo de ' + ms + ' ms');
  assert.ok(/@media\(prefers-reduced-motion:reduce\)\{\.hs \*\{animation:none!important;transition:none!important\}\}/.test(css36));
  assert.ok(/agp\.inert = S !== 3/.test(m));   // fuera del paso 3 la agenda no recibe foco
});
test('F8.3B Home · el CSS del hero usa solo contenedores propios y no deja reglas huérfanas de la escena anterior', () => {
  assert.ok(/\.hs-w\{container:hs\/inline-size\}/.test(css36));
  assert.equal(/@container sc \(max-width:520px\)\{\s*\.sc-hero/.test(css36), false);
  assert.equal(/@keyframes exs/.test(css36), false);
});

// ------------------------------------------------------------------------------------------ Invitaciones
test('F8.3B Invitaciones · el núcleo funcional y sus reglas no cambiaron', () => {
  const h = createHash('sha256').update(readFileSync(join(R, 'assets/invitaciones/inv-core.js'))).digest('hex');
  assert.equal(h, '20b07c3fe2b4393960335e594a6020140770e70588c7a8712994fba89837a8b1');
});
test('F8.3B Invitaciones · el selector tiene cuatro capítulos compactos y los títulos completos viven en los capítulos', () => {
  const steps = /<ol class="ix-steps" aria-label="Capítulos de la invitación">([\s\S]*?)<\/ol>/.exec(inv);
  assert.ok(steps);
  assert.deepEqual([...steps[1].matchAll(/data-ix-acto="\d"[^>]*>([^<]+)</g)].map(m => m[1]), ['Recibís', 'Explorás', 'Confirmás', 'Revisás']);
  for (const t of ['Llega por WhatsApp.', 'El día, en una página.', 'Confirmar lleva un minuto.', 'El mensaje sale de tu WhatsApp.']) assert.ok(inv.includes(t), t);
  assert.equal(inv.includes('Llega y se abre'), false);
  assert.ok(/\.ix-steps button\{[^}]*white-space:nowrap/.test(invCss) && !/\.ix-steps button\{[^}]*overflow-wrap:anywhere/.test(invCss));   // una palabra nunca se parte en dos líneas
  assert.ok(/@media \(max-width:340px\)\{\.ix-steps button\{font-size:12\.5px/.test(invCss));
});
test('F8.3B Invitaciones · orden móvil: selector → título y explicación → pantalla → anterior/siguiente', () => {
  const bloque = invCss.split('@media (max-width:959px){')[2];
  const ord = n => +new RegExp('\\' + n + '\\{[^}]*order:(\\d+)').exec(bloque)[1];
  const orden = [ord('.ix-steps'), ord('.ix-actl'), ord('.ixs .ix-dev'), ord('.ix-pn')];
  assert.deepEqual(orden, [...orden].sort((a, b) => a - b));
  assert.equal(new Set(orden).size, 4);
  assert.ok(/data-ix-pn="-1"/.test(inv) && /data-ix-pn="1"/.test(inv));
  assert.ok(/\.ix-steps,\.ix-pn\{display:none\}/.test(invCss));   // en escritorio no existen ni el selector ni los botones
});
test('F8.3B Invitaciones · sticky solo con espacio suficiente y acotado a la sección; sin marco ni desplazamiento interno en móvil', () => {
  assert.ok(/@media \(max-width:959px\) and \(min-height:720px\)\{\.ix-steps\{position:sticky;top:69px/.test(invCss));
  assert.ok(/\.ixs \.ix-scr\{height:auto;min-height:520px/.test(invCss));
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
  assert.ok(ld.description.endsWith('El bot de WhatsApp aún no está disponible. Actualmente solo se reciben consultas, sin contrataciones ni pagos.'));
  assert.ok(ld.description.includes('Los envíos por WhatsApp requieren una cuenta habilitada por Meta'));
  const nombres = ld.hasOfferCatalog.itemListElement.map(o => o.name);
  assert.ok(nombres.includes('Bot de WhatsApp para preguntas frecuentes'));
  assert.ok(/Todavía no disponible/.test(ld.hasOfferCatalog.itemListElement.find(o => o.name.startsWith('Bot')).description));
  assert.ok(flow.includes('La integración de WhatsApp e Instagram se evalúa según la cuenta del cliente.'));
});

// ------------------------------------------------------------------------------------------ higiene
test('F8.3B · ninguna página conserva enlaces «#» de los prototipos ni referencias a los prototipos', () => {
  const rutas = ['index.html', 'app/index.html', 'web/index.html', 'flow/index.html', 'combo/index.html', 'invitaciones/index.html', 'app/cafeterias/index.html', 'app/peluquerias/index.html', 'app/talleres/index.html', 'app/retail/index.html'];
  for (const r of rutas) { const h = leer(r); assert.equal(/href="#"/.test(h), false, r); assert.equal(/home-hero\.html|invitaciones-movil\.html|PROTOTIPO|f8-3a/i.test(h), false, r); }
  const sb = ['demos/sandbox/cafeteria/index.html', 'demos/sandbox/peluqueria/index.html'];
  for (const r of sb) assert.equal(/href="#"/.test(leer(r)), false, r);
});
