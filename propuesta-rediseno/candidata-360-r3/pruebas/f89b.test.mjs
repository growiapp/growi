// F8.9B · integración de Home A (demostración de Centro Ribera) e Invitaciones A (película + diálogo con el módulo real).
// Reemplaza a las pruebas del hero y del recorrido por actos anteriores (retiradas de f83b/f87); la conducta en navegador se verifica con verificacion/navegador/f89b-*.playwright.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const R = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const leer = f => readFileSync(join(R, f), 'utf8');
const sinTags = s => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const quitaComentarios = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/ \/\/ .*$/gm, '');
const home = leer('index.html'), inv = leer('invitaciones/index.html');
const homeCss = leer('assets/home-demo.css'), homeJs = leer('assets/home-demo.js'), narJs = leer('assets/narrar.js'), narCss = leer('assets/narrar.css');
const pelCss = leer('assets/invitaciones/pelicula.css'), pelJs = leer('assets/invitaciones/pelicula.js');
const css36 = leer('assets/growi36.css'), js36 = leer('assets/growi36.js'), invUi = leer('assets/invitaciones/inv-ui.js'), invCore = leer('assets/invitaciones/inv-core.js');
const escena = (/<div class="ha-w">[\s\S]*?<\/section><\/div>/.exec(home) || [''])[0];
const film = (/<div class="ip-dem" id="recorrido">[\s\S]*?class="ip-fic">[^<]*<\/p><\/div>/.exec(inv) || [''])[0];
const dialogo = (/<div class="ip-o" data-ip-o[\s\S]*?<\/div><\/div><\/div>\n/.exec(inv) || [''])[0];

// ------------------------------------------------------------------------------------------ Home A
test('F8.9B Home · la demostración cuenta Presencia → Contacto → Organización con una causalidad real', () => {
  assert.ok(escena, 'falta la escena');
  const pasos = [...escena.matchAll(/data-i="(\d)"><span class="nar-n">\d<\/span><span class="nar-lb">([^<]+)</g)].map(m => m[1] + ':' + m[2]);
  assert.deepEqual(pasos, ['0:Presencia', '1:Contacto', '2:Organización']);
  const t = sinTags(escena);
  assert.ok(escena.includes('ribera-sitio-m.webp" width="375" height="1300"'));                          // el sitio de Centro Ribera, entero
  assert.ok(t.includes('Hola, quiero turno para el sábado a la mañana. Me molesta la rodilla.'));       // la consulta por WhatsApp
  assert.ok(t.includes('Persona del centro') && t.includes('Hola, Julián. Tenemos el sábado a las 11:15. ¿Te lo reservamos?'));   // una persona responde
  assert.ok(t.includes('Sí, dale.') && t.includes('¡Perfecto, Julián! Tu turno quedó confirmado para el sábado a las 11:15. ¡Te esperamos!'));
  assert.ok(t.includes('Turno confirmado') && t.includes('Lo registró una persona del centro.'));       // lo anota una persona
  assert.ok(escena.includes('<p class="ha-tag">Demo</p>') && !/Ejemplo ilustrativo|datos ficticios/i.test(t));   // leyenda breve «Demo»
});
test('F8.9B Home · orden cronológico del chat: el indicador de escritura final va DESPUÉS de «Sí, dale» y el primero después de la consulta', () => {
  const orden = ['ha-m1 ha-out', 'ha-m2 ha-in ha-dots', 'ha-m3 ha-in', 'ha-m4 ha-out', 'ha-m2b ha-in ha-dots', 'ha-m5 ha-in'].map(c => escena.indexOf('class="ha-m ' + c));
  assert.ok(orden.every(i => i > 0) && orden.every((x, i) => i === 0 || x > orden[i - 1]), orden.join());
  // el CSS muestra cada elemento solo en su momento: el segundo indicador convive únicamente con «Sí, dale» (c=6), nunca con la respuesta final (c=7)
  assert.ok(/\[data-c="3"\] \.ha-m2,\[data-c="6"\] \.ha-m2b\{display:flex/.test(homeCss));
  assert.ok(/\[data-c="7"\] \.ha-m5\{display:block|\[data-c="7"\] \.ha-m5,/.test(homeCss) || /\[data-c="7"\] \.ha-m5\b/.test(homeCss));
  const tl = /\[1700,\{sc:1\}\][\s\S]*?t\+=1100; T\.push\(\[t,\{c:6\}\]\); t\+=1300; T\.push\(\[t,\{c:7\}\]\); t\+=1100; T\.push\(\[t,\{tk:1\}\]\)/.test(homeJs);
  assert.ok(tl, 'secuencia c:5 → c:6 (puntos) → c:7 (respuesta) → ficha');
});
test('F8.9B Home · sin caja, cobros, importes ni automatizaciones inventadas', () => {
  const t = sinTags(escena) + ' ' + quitaComentarios(homeJs);
  assert.equal(/Caja del día|cobr|\$\s?\d|automátic|automatiz|integraci/i.test(t), false, t.match(/Caja del día|cobr\w*|automát\w*|automatiz\w*|integraci\w*/i)?.[0]);
  assert.equal(/Queda registrado/.test(home), false);
  assert.equal(/avisos autom|a medida con GrowiFlow/i.test(escena), false);   // ese alcance corresponde a GrowiFlow, no al hero
});
test('F8.9B Home · móvil: la demostración va después de las cinco líneas de oferta y el CTA principal las precede', () => {
  const i = home.indexOf('class="hero-lines"'), j = home.indexOf('class="ha-w"');
  assert.ok(i > 0 && j > i, 'la escena va después de las cinco líneas de oferta');
  assert.ok(home.indexOf('home-hero-whatsapp') < i);
});
test('F8.9B Home · geometría: teléfono 9:19,5 sin transformaciones, contenedor propio y reglas con prefijo ha-', () => {
  assert.ok(/--pw:calc\(var\(--ph\) \* 9 \/ 19\.5\)/.test(homeCss));
  assert.ok(/\.ha-w\{[^}]*container:ha\/inline-size/.test(homeCss));
  assert.equal(/\.ha-ph\{[^}]*transform/.test(homeCss) || /\.ha-scr\{[^}]*transform/.test(homeCss), false);   // el dispositivo nunca se escala ni se mueve
  const sel = [...homeCss.matchAll(/(^|\})\s*([^{}@]+)\{/g)].map(m => m[2]).join(',');
  assert.equal(/\.(?:hs|stg|ph|scr|wa|wb|wh|wi|dk|nv)\b[^-]/.test(sel.replace(/\.ha-[\w-]+/g, '')), false, 'clases sin prefijo');
  for (const c of ['@keyframes ha-tap', '@keyframes ha-dot', '@keyframes ha-min', '@keyframes ha-car', '@keyframes ha-snd']) assert.ok(homeCss.includes(c), c);
  assert.ok(/\.ha-bg\{[^}]*url\(img\/ribera-sala\.webp\)/.test(homeCss));   // la ruta es relativa al CSS (assets/img)
});
test('F8.9B Home · toda clase que crea el JS existe en el CSS con su prefijo (p. ej. el cursor de tipeo)', () => {
  const creadas = [...quitaComentarios(homeJs).matchAll(/class=\\?"([\w -]+)\\?"/g)].flatMap(m => m[1].split(' '));
  assert.ok(creadas.includes('ha-car'), creadas.join());
  for (const c of creadas) assert.ok(c.startsWith('ha-') && homeCss.includes('.' + c), c);
});
test('F8.9B Home · sin reglas ni código huérfanos del hero anterior', () => {
  assert.equal(/\.hs[-{ .:]/.test(css36) || /@container hs\b/.test(css36), false);
  assert.equal(/data-hs|GrowiHeroStory|hs-ly|hs-b2/.test(js36 + home), false);
  assert.equal(/hs-|data-hs/.test(home), false);
});
test('F8.9B Home · reproducción: movimiento = preferencia del sitio (cr_motion) o del sistema; pausa, vista y pestaña; manual al tocar un paso', () => {
  const n = quitaComentarios(narJs);
  assert.ok(/localStorage\.getItem\("cr_motion"\)/.test(n) && /o === "on" \|\| \(o !== "off" && !r\)/.test(n));   // misma regla que el <head> del sitio
  assert.ok(/IntersectionObserver/.test(n) && /visibilitychange/.test(n) && /isIntersecting/.test(n));       // se detiene fuera de vista y con la pestaña oculta
  assert.ok(/Reproducir animación/.test(n) && /Pausar animación/.test(n));
  assert.ok(/function go\(i\) \{ manual = true; halt\(\)/.test(n));                                          // tocar un paso toma el control: etapa estable, siempre igual
  assert.ok(/mq\.addEventListener\("change", mqc\)/.test(n));                                               // se reevalúa si cambia la preferencia de movimiento
  const m = quitaComentarios(homeJs);
  assert.ok(/stable:\[B,\{a:2,c:2[^\]]*\},\{a:3,c:7[^\]]*tk:1/.test(m));                                  // etapas estables: 1 sitio, 2 consulta, 3 turno confirmado
  assert.ok(/window\.GrowiNar/.test(m));
  assert.ok(/html:not\(\.mo\) \.ha \*\{animation:none!important;transition:none!important\}/.test(homeCss));   // sin movimiento: sin animaciones ni transiciones
  assert.ok(/total:t\+3400/.test(m));                                                                        // ciclo breve y acotado
});
test('F8.9B Home · accesibilidad: el escenario es decorativo (aria-hidden), hay leyenda visible, anuncio sin aria-live ruidoso y controles con nombre', () => {
  assert.ok(/<div class="ha-stg" data-stg aria-hidden="true">/.test(escena));
  assert.ok(/<nav class="nar-nv" data-nav aria-label="Pasos de la demostración">/.test(escena));
  assert.ok(/<p class="nar-sr" data-sr aria-live="off"><\/p>/.test(escena));
  assert.ok(/<section class="ha" data-ha aria-label="Demo:/.test(escena));
  assert.equal((escena.match(/<button/g) || []).length, 4);   // tres pasos + pausa
  assert.ok(/aria-label="Pausar animación"/.test(escena));
  assert.ok(/--ink:#10161a/.test(homeCss) && /var\(--ink,#10161a\)/.test(narCss));   // contraste de los rótulos: no depende de variables del sitio
});

// ------------------------------------------------------------------------------------------ Invitaciones A
test('F8.9B Invitaciones · la película: cuatro etapas, mismo chat de Lucía y Tomás, y un solo teléfono', () => {
  assert.ok(film, 'falta la película');
  const nav = [...film.matchAll(/data-i="(\d)"><span class="nar-n">\d<\/span><span class="nar-lb">([^<]+)</g)].map(m => m[1] + ':' + m[2]);
  assert.deepEqual(nav, ['0:La enviás', '1:La abren', '2:Exploran', '3:Confirman']);
  const desk = /<ol class="ip-stp" data-stp>([\s\S]*?)<\/ol>/.exec(inv);
  assert.ok(desk && [...desk[1].matchAll(/<b>([^<]+)<\/b>/g)].map(m => m[1]).join('|') === 'La enviás|La abren|Exploran|Confirman');
  assert.ok(film.includes('<header><i>L</i><div><b>Lucía y Tomás</b></div></header>'));                    // perspectiva del invitado: la conversación es con quienes invitan
  assert.ok(film.includes('¡Hola! Les compartimos la invitación a nuestro casamiento. Ahí están todos los detalles y cómo confirmar asistencia. ¡Los esperamos!'));
  assert.ok(/<div class="ip-m ip-out ip-rp"><p data-rpt><\/p>/.test(film));                                // la respuesta saliente es del mismo chat (se completa con el núcleo)
  assert.equal((inv.match(/class="ip-scr"/g) || []).length, 1);
  assert.equal(/Borrador|Mensaje preparado|lista para enviar/i.test(film), false);                         // la película no tiene pantalla de borrador
});
test('F8.9B Invitaciones · el texto que «se envía» en la película lo arma el núcleo real; nada se envía desde la película ni desde el diálogo', () => {
  const p = quitaComentarios(pelJs);
  assert.ok(/GrowiInv\.mensaje\("cas", \{ nombre: NAME, respuesta: "si", personas: 2 \}\)/.test(p));
  assert.equal(/Soy Camila|confirmamos que vamos/.test(p + film), false);                                  // ningún texto de respuesta duplicado a mano
  for (const f of [pelJs, invUi, invCore, narJs, homeJs]) assert.equal(/wa\.me|api\.whatsapp|window\.open|location\.(href|assign|replace)|navigator\.sendBeacon|fetch\(|XMLHttpRequest/.test(quitaComentarios(f)), false);
  assert.equal(/<a [^>]*(wa\.me|whatsapp)/.test(film + dialogo), false);
  assert.equal(createHash('sha256').update(readFileSync(join(R, 'assets/invitaciones/inv-core.js'))).digest('hex'), '20b07c3fe2b4393960335e594a6020140770e70588c7a8712994fba89837a8b1');   // las reglas del RSVP no cambiaron
});
test('F8.9B Invitaciones · la película es decorativa: inerte, sin controles enfocables y con identificación de muestra única', () => {
  const stg = /<div class="ip-stg"[^>]*>[\s\S]*?<\/div><p class="ip-cap"/.exec(film)[0];
  assert.ok(/aria-hidden="true"/.test(stg.slice(0, 80)));
  for (const el of stg.match(/<(?:button|input)\b[^>]*>/g)) assert.ok(/tabindex="-1"/.test(el), el);      // nada del teléfono entra en el orden de tabulación
  assert.ok(/stg\.inert = true/.test(pelJs));
  assert.equal((inv.match(/Invitación de ejemplo, con datos ficticios\./g) || []).length, 1);
  assert.ok(film.includes('Hasta que no toca Enviar, no se mandó nada.'));                                 // aclaración de que nada se envía solo
});
test('F8.9B Invitaciones · la muestra funcional solo prepara el mensaje: ningún texto promete abrir ni enviar WhatsApp (decisión F8.9B: alternativa A)', () => {
  const funcional = dialogo + (/<section class="ix-cum"[\s\S]*?<\/section>\n/.exec(inv) || [''])[0] + (/<section class="ix-emp"[\s\S]*?<\/section>\n/.exec(inv) || [''])[0];
  assert.ok(funcional.length > 5000);
  // el botón dice lo que hace en los tres eventos; «Continuar en WhatsApp» es solo de la película aprobada (ilustración)
  assert.equal((funcional.match(/<button type="submit" class="ix-btn">Preparar mi mensaje<\/button>/g) || []).length, 3);
  assert.equal(/Continuar en WhatsApp/.test(funcional), false);
  assert.ok(film.includes('Continuar en WhatsApp</button><p class="ip-nt">Se arma un mensaje para WhatsApp. No se envía solo.</p>'));
  // la nota del borrador aclara que acá no se abre ni se envía nada; la vista previa y el estado «Todavía no se envió» se conservan
  assert.equal((funcional.match(/En una invitación real, se abre WhatsApp con este texto y lo enviás vos\. Acá es una muestra: no se envía nada\./g) || []).length, 3);
  assert.equal(/Se abre WhatsApp con este texto/.test(inv), false);
  assert.equal((funcional.match(/Todavía no se envió\./g) || []).length, 3);
  assert.equal((funcional.match(/Esto es una vista previa: no se envía nada ni se abre una conversación real\./g) || []).length, 3);
  assert.equal((funcional.match(/Se arma un mensaje para WhatsApp\. No se envía solo\./g) || []).length, 3);
  assert.equal((funcional.match(/class="ix-send" disabled/g) || []).length, 3);   // el botón de envío de la vista previa está inhabilitado
});
test('F8.9B Invitaciones · «Probar la invitación completa» abre el módulo REAL en un diálogo modal; solo por acción de la persona', () => {
  assert.ok(dialogo, 'falta el diálogo');
  assert.ok(/role="dialog" aria-modal="true" aria-labelledby="ip-o-t"/.test(dialogo) && /<div class="ip-o" data-ip-o hidden /.test(dialogo));   // oculto al cargar
  assert.equal((inv.match(/data-inv="cas"/g) || []).length, 1);                                            // una sola invitación funcional (el módulo real)
  assert.ok(dialogo.includes('data-inv="cas"') && dialogo.includes('data-ix-reiniciar') && dialogo.includes('data-ip-cerrar'));
  assert.ok(/<button type="button" class="ip-try" data-ip-abrir aria-haspopup="dialog">Probar la invitación completa<\/button>/.test(inv));
  const p = quitaComentarios(pelJs);
  assert.ok(/abrir\.addEventListener\("click", abre\)/.test(p) && !/setTimeout\(abre|abre\(\);\s*\n/.test(p));   // se abre solo con un clic
  assert.ok(/e\.inert = true/.test(p) && /e\.inert = false/.test(p) && /ip-lock/.test(p));                 // fondo inerte y sin scroll de la página
  assert.ok(/document\.addEventListener\("keydown", function \(e\) \{ if \(e\.key === "Escape" && !ov\.hidden && !ov\.querySelector\("\[data-ly=wa\]:not\(\[hidden\]\)"\)\)/.test(p) && /, true\);\s*\n\}\)\(\);/.test(p));   // Esc cierra el diálogo, salvo con la vista previa de WhatsApp (que la cierra el módulo)
  assert.ok(/previo\.focus/.test(p) && /cerrar\.focus\(\)/.test(p));                                       // foco inicial y retorno
  assert.ok(/reg\.reinicio\(\)/.test(p));                                                                  // siempre abre desde el principio
});
test('F8.9B Invitaciones · movimiento: la película usa la regla de movimiento del sitio y deja las etapas estables en su lugar', () => {
  const p = quitaComentarios(pelJs);
  assert.ok(/var reducido = function \(\) \{ return !Nar\.motionOk\(\); \}/.test(p));
  assert.ok(/man: 0 \}, timers/.test(p));                                                                  // con movimiento reducido el paso 4 también deja el hilo en su lugar
  assert.ok(/f > \.3/.test(p) && /bd\.scrollTo\(\{ top: mx, behavior: "smooth" \}\)/.test(p));            // el corte superior cae entre líneas
  assert.ok(/html:not\(\.mo\) \.ip-film \*\{animation:none!important;transition:none!important\}/.test(pelCss) && !/prefers-reduced-motion/.test(pelCss));
  assert.ok(/total: 21200/.test(p));
});
test('F8.9B Invitaciones · disposición: móvil = título → bajada → CTA → película → «Probar…»; sin restos del recorrido por actos', () => {
  const i = (s) => inv.indexOf(s);
  const dom = [i('class="ix-h1"'), i('class="ix-lead"'), i('class="ix-cta"'), i('class="ip-film"'), i('data-ip-abrir')];
  assert.ok(dom.every(x => x > 0) && dom.every((x, k) => k === 0 || x > dom[k - 1]), dom.join());   // el orden de lectura y de tabulación coincide con el visual en móvil
  const ord = c => +new RegExp(c.replace(/[.]/g, '\\.') + '\\{[^}]*?order:(\\d)').exec(pelCss)[1];
  assert.deepEqual([ord('.ipx .ix-h1'), ord('.ipx .ix-lead'), ord('.ipx .ix-cta'), ord('.ipx-r'), ord('.ipx .ip-try')], [1, 2, 3, 4, 5]);
  assert.equal(/data-ix-story|ix-acts|ix-steps|data-ix-pn|ix-stage|data-ix-acto/.test(inv), false);
  assert.ok(inv.includes('id="recorrido"') && inv.includes('href="#recorrido"'));                          // la subnavegación sigue llevando a la experiencia
  assert.ok(/<div class="ipx" id="inicio" data-sticky-hide>/.test(inv));                                    // la barra «Consultar» no tapa la película
});
test('F8.9B Invitaciones · el CSS de la película usa prefijos propios (ip-) y rutas relativas a su carpeta', () => {
  const sel = [...pelCss.matchAll(/(^|\})\s*([^{}@]+)\{/g)].map(m => m[2]).join(',');
  assert.equal(/\.(?:iv|dm|stg|scr|ch|lc|rp|cap|ring)\b(?![-\w])/.test(sel.replace(/\.ip-[\w-]+/g, '')), false);
  assert.ok(!/url\(assets\//.test(pelCss) && /url\(\.\.\/img\/inv-mesa\.webp\)/.test(pelCss));
  for (const k of ['@keyframes ip-rv', '@keyframes ip-rpin', '@keyframes ip-snd']) assert.ok(pelCss.includes(k), k);
  assert.ok(/--pw:calc\(var\(--ph\) \* 9 \/ 19\.5\)/.test(pelCss));                                        // 9:19,5
  assert.equal(/\.ip-stg\{[^}]*transform/.test(pelCss), false);
});
