import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
const R = join(dirname(fileURLToPath(import.meta.url)), '..');
const leer = (p) => readFileSync(join(R, p), 'utf8').replace(/\r\n/g, '\n');
const quitar = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

test('F8.7 Invitaciones · navegación y altura: botones pegados abajo con aviso al llegar al selector, altura mínima común y sin recorte', () => {
  const css = leer('assets/invitaciones/inv.css'), js = leer('assets/invitaciones/inv-ui.js');
  assert.ok(/\.ix-pn\{[^}]*position:sticky;bottom:0/.test(css));                                  // Anterior/Siguiente quedan al alcance del pulgar
  assert.ok(/\.ixs:not\(\.ix-pn-on\) \.ix-pn,\.ixs\.ix-escribiendo \.ix-pn\{visibility:hidden;pointer-events:none\}/.test(css));   // y no tapan el comienzo de la página (F8.7C: ni el campo que se está escribiendo)
  assert.ok(/ix-pn-on/.test(js) && /boundingClientRect\.top/.test(js));
  assert.ok(/min-height:600px/.test(css) && !/\.ixs \.ix-scr\{[^}]*[^-]height:6\d\dpx/.test(css));   // mínimo, no altura fija: nada se recorta
  assert.ok(/barra && rb\.bottom|8 - barra/.test(js) || /barra/.test(js));                          // aVista descuenta la barra fija
  assert.ok(/@media \(max-width:430px\)\{\.ix-steps button\{font-size:12\.5px/.test(css) && /@media \(max-width:360px\)\{\.ix-steps button\{white-space:normal/.test(css));
});

test('F8.7 Cumpleaños · la noche empieza a las 21:00 · Brindis y avanza sola a 22:00 y 00:00, con pausa y movimiento reducido', () => {
  const h = leer('invitaciones/index.html'), js = leer('assets/invitaciones/inv-ui.js'), css = leer('assets/invitaciones/inv.css');
  assert.ok(h.includes('data-clock>21:00</p>') && /<h4 data-nt>Brindis<\/h4>/.test(h) && h.includes('id="cumple" data-t="0"'));
  assert.ok(/class="ix-stop on" role="radio" aria-checked="true" tabindex="0" data-idx="0"><em>21:00<\/em>Brindis/.test(h));
  assert.ok(/data-ix-pp hidden aria-label="Pausar el avance de la noche"/.test(h));
  assert.ok(/NOCHE_MS = 5600/.test(js) && /tipo: 'noche', idx: self\.s\.noche \+ 1/.test(js) && /manualNoche/.test(js));
  assert.ok(/function motionOk\(\)/.test(js) && /rl\.contains\('mo'\)/.test(js) && !/localStorage|sessionStorage/.test(js));   // sin almacenamiento: se lee la clase que deja el <head>
  assert.ok(/IntersectionObserver/.test(js) && /visibilitychange/.test(js));                          // solo avanza mientras se ve
  assert.ok(/\.ix-pp\{/.test(css) && /\.ix-pp\[hidden\]\{display:none\}/.test(css));
});

test('F8.7 Empresa · «Ver la jornada completa» tiene destino real y la vista llega hasta él', () => {
  const h = leer('invitaciones/index.html'), js = leer('assets/invitaciones/inv-ui.js');
  assert.ok(h.includes('data-go="jornada">Ver la jornada completa</button>') && h.includes('id="ix-emp-jornada"') && h.includes('id="ix-emp-hj" tabindex="-1"'));
  assert.ok(/this\.flow && a\.tipo === 'ir' && tope > window\.innerHeight \* 0\.6\) dy = tope - req/.test(js));   // el destino más abajo se lleva a la vista
  assert.ok(/user === true && this\.flow && a\.tipo === 'ir'\) this\.aVista\(a\)/.test(js));                  // también cuando el estado no cambia (segundo toque)
});

test('F8.7 Home y Combo · leyendas «Demo», imagen de Centro Ribera entera, demostración animada de Combo con pausa', () => {
  for (const f of ['index.html', 'combo/index.html']) {
    const t = quitar(leer(f));
    assert.equal(/Ejemplo ilustrativo|Datos ficticios|datos ficticios/.test(t.slice(t.indexOf('Demo'))), f === 'index.html' ? false : false, f);
  }
  const home = leer('index.html'), combo = leer('combo/index.html'), css36 = leer('assets/growi36.css'), js36 = leer('assets/growi36.js');
  assert.ok(home.includes('<p class="ha-tag">Demo</p>') && (home.match(/<p class="ej-tag">Demo<\/p>/g) || []).length === 3);   // F8.7C: la fila de GrowiWeb ya se identifica como «Sitio de muestra» (sin segunda etiqueta)
  const web = home.slice(home.indexOf('id="n-web"'), home.indexOf('id="n-flow"'));
  assert.ok(web.includes('Sitio de muestra') && !web.includes('ej-tag'));
  assert.ok(home.includes('ribera-sitio-m.webp" width="375" height="1300"') && /\.ha-site img\{display:block;width:100%;height:auto/.test(leer('assets/home-demo.css')));   // F8.8: capturas completas del sitio de Centro Ribera (escritorio y móvil), sin recorte por proporción
  assert.ok(combo.includes('data-cd') && combo.includes('data-cd-pp') && (combo.match(/data-cd-n="\d"/g) || []).length === 4 && combo.includes('Demo · un mismo negocio, Centro Ribera'));
  assert.ok(/data-cd-s/.test(js36) && /MS = \[3400, 3200, 3600, 4600\]/.test(js36) && /prefers-reduced-motion/.test(js36) && /Pausar animación/.test(js36));
});

test('F8.7 GrowiApp · los tres planes visibles y comparables en la página y en los rubros; vistas previas de las apps iguales a lo que se abre', () => {
  for (const f of ['app/index.html', 'app/cafeterias/index.html', 'app/peluquerias/index.html', 'app/talleres/index.html', 'app/retail/index.html']) {
    const h = leer(f), sec = h.slice(h.search(/id="precios?"/));
    assert.deepEqual([...sec.matchAll(/class="t-title">([^<]+)</g)].map((m) => m[1].replace('GrowiApp ', '')).slice(0, 3), ['Start', 'Pro', 'Multi'], f);
    assert.equal(h.includes('Ver todos los planes'), false, f);
    assert.ok(h.includes('class="pl-res"') && /href="#plan-start"[\s\S]*href="#plan-pro"[\s\S]*href="#plan-multi"/.test(h), f);
    assert.ok(!/class="tickets one"/.test(h), f);
    const precios = [...sec.matchAll(/data-price="(\d+)"/g)].map((m) => +m[1]);
    for (const usd of f === 'app/index.html' ? [15, 49, 29, 149, 49, 249] : [15, 49, 29, 149, 49, 249]) assert.ok(precios.includes(usd), f + ' ' + usd);   // precios aprobados, sin cambios
  }
  const cs = leer('_lineas.py');
  assert.ok(cs.includes('movil=("cafe-nogal-movil.webp", 780, 972)') && cs.includes('movil=("bruma-movil.webp", 780, 1190)'));
  assert.equal(/aspect-ratio:1\/1\.42/.test(cs) || /\.cn-ph::after/.test(cs), false);   // sin recorte forzado ni degradé que oculte datos
});

test('F8.7 GrowiFlow · el bot de WhatsApp figura disponible y no quedan mensajes contradictorios', () => {
  const h = leer('flow/index.html'), t = quitar(h.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, ' '));
  assert.equal((h.match(/<li class="av">/g) || []).length, 2);
  assert.equal((h.match(/<span class="sr-only"> Disponible<\/span>/g) || []).length, 2);
  assert.equal(/<li class="soon">/.test(h.slice(h.indexOf('id="bot"') - 3000, h.indexOf('id="bot"') + 200)), false);
  for (const mal of [/pronto/i, /próximamente/i, /aprobación de Meta/i, /sin fecha/i, /todavía no (está|hay)/i, /aún no está disponible/i, /no tiene garantía definida/i]) assert.equal(mal.test(h.replace(/<style[\s\S]*?<\/style>/g, '')), false, String(mal));
  assert.ok(t.includes('Precio de referencia, a confirmar al consultar. Se evalúa caso por caso. Los envíos por WhatsApp requieren una cuenta habilitada por Meta, y los mensajes los cobra Meta aparte, a cargo del cliente.'));   // F8.7C: requisito ya declarado en el Service y en Reportes/Recordatorios
  assert.ok(h.includes('Actualmente solo se reciben consultas, sin contrataciones ni pagos.'));   // frase aprobada del JSON-LD, intacta
  assert.ok(/data-price="149"/.test(h) && /data-price="25"/.test(h));                              // precios sin cambios
  assert.equal(h.includes('figura como'), false);
});

test('F8.7C Leyendas de demostración · una identificación breve por componente, sin repetirla; las notas al pie con alcance se conservan', () => {
  const app = leer('app/index.html'), cafe = leer('app/cafeterias/index.html'), pelu = leer('app/peluquerias/index.html');
  for (const h of [app, cafe, pelu]) { assert.ok(/<p class="cn-nm"><b>[^<]+<\/b> · [^<]+ · Demo<\/p>/.test(h)); assert.equal(/ejemplo ilustrativo/i.test(quitar(h)), false); }
  for (const h of [app, cafe]) assert.ok(quitar(h).includes('Los datos son ficticios y las funciones y el alcance se definen para cada proyecto.'));   // nota única: conserva alcance y aviso de la foto con IA
  for (const f of ['demos/sandbox/cafeteria/index.html', 'demos/sandbox/peluqueria/index.html']) {
    const h = leer(f);
    assert.ok(/<\/svg>Demo<\/button>/.test(h) && h.includes('Datos de ejemplo. Las funciones y el alcance se definen para cada proyecto.'), f);
    assert.equal(/Ejemplo ilustrativo|Experiencia ilustrativa/.test(h), false, f);
  }
  const inv = leer('invitaciones/index.html');
  assert.ok(inv.includes('Muestra · datos ficticios') && inv.includes('Cuando completás el formulario, el mensaje se arma con lo que pusiste.') && !inv.includes('Son datos ficticios.'));
  assert.equal((inv.match(/Invitación de ejemplo, con datos ficticios\./g) || []).length, 1);   // identificación única de la invitación de ejemplo
  const t = quitar(leer('web/index.html')); assert.ok(t.includes('Sitios de muestra con contenido ficticio y funcionando'));   // GrowiWeb: nota única de los sitios de muestra
  // no se tocan Términos ni privacidad ni los sitios de demostración propios (llevan sus avisos: negocio ficticio, matrículas ficticias, no reemplaza una evaluación profesional)
  assert.ok(leer('demos/web/centro-ribera/index.html').includes('Centro Ribera es un negocio ficticio.'));
});

test('F8.7C Invitaciones · con el teclado móvil abierto la barra Anterior/Siguiente se oculta y vuelve al salir del campo', () => {
  const js = leer('assets/invitaciones/inv-ui.js'), css = leer('assets/invitaciones/inv.css');
  assert.ok(/root\.addEventListener\('focusin'[\s\S]*ix-escribiendo/.test(js) && /root\.addEventListener\('focusout'[\s\S]*remove\('ix-escribiendo'\)/.test(js));
  assert.ok(/\.ixs\.ix-escribiendo \.ix-pn\{visibility:hidden;pointer-events:none\}/.test(css));   // visibility: el flujo de la página no cambia
});

test('F8.7C GrowiFlow · el bot figura disponible: sin «prevista», con el requisito de cuenta de Meta que la página ya declara para los envíos por WhatsApp', () => {
  const h = leer('flow/index.html');
  assert.ok(h.includes('Puesta en marcha de referencia de USD 149, a confirmar al consultar, y mensajes de Meta aparte.') && !/prevista/i.test(h));
  assert.ok(h.includes('Los envíos por WhatsApp requieren una cuenta habilitada por Meta, y los mensajes los cobra Meta aparte, a cargo del cliente.'));
  assert.ok(h.includes('Actualmente solo se reciben consultas, sin contrataciones ni pagos.'));   // frase aprobada intacta
});
