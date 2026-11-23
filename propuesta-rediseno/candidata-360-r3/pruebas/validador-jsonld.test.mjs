// F8.4R · el validador del release (`_construir.py --validate`) comprueba el JSON-LD de GrowiFlow ESTRUCTURALMENTE.
// Nunca muta la candidata: construye un release en una carpeta temporal (fuera del repositorio) y trabaja sobre copias.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const R = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PY = process.platform === 'win32' ? 'python' : 'python3';
const FRASE = 'Actualmente solo se reciben consultas, sin contrataciones ni pagos.';
const INTEGRACION = 'La integración de WhatsApp e Instagram se evalúa según la cuenta del cliente.';
const base = mkdtempSync(join(tmpdir(), 'growi-f84r-'));
const RELEASE = join(base, 'release');
const py = (...a) => execFileSync(PY, ['-B', '_construir.py', ...a], { cwd: R, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
const validar = dir => { try { return { ok: true, salida: py('--validate', dir) }; } catch (e) { return { ok: false, salida: String(e.stderr || '') + String(e.stdout || '') }; } };
const RE_LD = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
/** copia el release, deja el JSON-LD de flow en `fn(bloques)` (lista de objetos ya parseados) y devuelve la carpeta */
function mutar(nombre, fn, extraHtml = (h) => h) {
  const dir = join(base, nombre); cpSync(RELEASE, dir, { recursive: true });
  const f = join(dir, 'flow', 'index.html'); let h = readFileSync(f, 'utf8');
  const bloques = [...h.matchAll(RE_LD)].map(m => JSON.parse(m[1]));
  const nuevos = fn(bloques);
  let i = 0; h = h.replace(RE_LD, () => '<script type="application/ld+json">' + (typeof nuevos[i] === 'string' ? nuevos[i++] : JSON.stringify(nuevos[i++])) + '</script>');
  writeFileSync(f, extraHtml(h)); return dir;
}
const servicio = bloques => bloques.find(b => b['@type'] === 'Service');

test('F8.4R release de partida: válido y con la frase en el JSON-LD del Servicio', () => {
  py('--release', RELEASE);                                  // construye (y valida) en una carpeta temporal
  const r = validar(RELEASE); assert.ok(r.ok, r.salida);
  const h = readFileSync(join(RELEASE, 'flow', 'index.html'), 'utf8');
  assert.ok(servicio([...h.matchAll(RE_LD)].map(m => JSON.parse(m[1]))).description.includes(FRASE));
});
test('F8.4R la frase solo en un comentario HTML (fuera del JSON-LD) → el validador FALLA', () => {
  const dir = mutar('comentario', b => { const s = servicio(b); s.description = s.description.replace(' ' + FRASE, ''); return b; }, h => h.replace('</head>', '<!-- ' + FRASE + ' -->\n</head>'));
  const h = readFileSync(join(dir, 'flow', 'index.html'), 'utf8');
  assert.ok(h.includes('<!-- ' + FRASE) && !servicio([...h.matchAll(RE_LD)].map(m => JSON.parse(m[1]))).description.includes(FRASE));   // la mutación es la pedida
  const r = validar(dir); assert.equal(r.ok, false); assert.match(r.salida, /estado de contratación y pagos/);
});
test('F8.4R la frase en el texto visible de la página pero no en el JSON-LD → FALLA', () => {
  const dir = mutar('visible', b => { const s = servicio(b); s.description = s.description.replace(' ' + FRASE, ''); return b; }, h => h.replace('</main>', '<p>' + FRASE + '</p></main>'));
  const r = validar(dir); assert.equal(r.ok, false); assert.match(r.salida, /estado de contratación y pagos/);
});
test('F8.4R la frase en otro objeto JSON-LD (no en el Servicio) → FALLA', () => {
  const dir = mutar('otro-objeto', b => { const s = servicio(b); s.description = s.description.replace(' ' + FRASE, ''); const faq = b.find(x => x['@type'] === 'FAQPage'); faq.mainEntity[0].acceptedAnswer.text += ' ' + FRASE; return b; });
  const r = validar(dir); assert.equal(r.ok, false); assert.match(r.salida, /estado de contratación y pagos/);
});
test('F8.4R JSON-LD inválido → FALLA', () => {
  const dir = mutar('invalido', b => b.map(x => x['@type'] === 'Service' ? JSON.stringify(x).slice(0, -3) : x));
  const r = validar(dir); assert.equal(r.ok, false); assert.match(r.salida, /JSON-LD inválido/);
});
test('F8.4R objeto GrowiFlow ausente → FALLA', () => {
  const dir = mutar('ausente', b => { servicio(b).name = 'Otro servicio'; return b; });
  const r = validar(dir); assert.equal(r.ok, false); assert.match(r.salida, /ausente/);
});
test('F8.4R condición de integraciones solo en el texto visible → FALLA', () => {
  const dir = mutar('integraciones', b => { const s = servicio(b); for (const o of s.hasOfferCatalog.itemListElement) o.description = o.description.replace(' ' + INTEGRACION, ''); return b; }, h => h.replace('</main>', '<p>' + INTEGRACION + '</p></main>'));
  const h = readFileSync(join(dir, 'flow', 'index.html'), 'utf8');
  assert.ok(h.includes('<p>' + INTEGRACION + '</p>') && !servicio([...h.matchAll(RE_LD)].map(m => JSON.parse(m[1]))).hasOfferCatalog.itemListElement.some(o => o.description.includes(INTEGRACION)));   // la mutación es la pedida
  const r = validar(dir); assert.equal(r.ok, false); assert.match(r.salida, /condición de integraciones/);
});
test('F8.4R un <script> JSON-LD dentro de un comentario HTML no cuenta como JSON-LD', () => {
  const dir = mutar('script-en-comentario', b => { const s = JSON.stringify(servicio(b)); const sin = servicio(b); sin.name = 'Otro servicio'; return b.map(x => x === sin ? sin : x).concat([]); },
    h => h.replace('</head>', '<!-- <script type="application/ld+json">{"@type":"Service","name":"GrowiFlow","description":"' + FRASE + ' ' + INTEGRACION + '"}</script> -->\n</head>'));
  const r = validar(dir); assert.equal(r.ok, false); assert.match(r.salida, /ausente/);
});
test('F8.4R servicio dentro de @graph con el contenido correcto → PASA', () => {
  const dir = mutar('graph', b => b.map(x => x['@type'] === 'Service' ? { '@context': 'https://schema.org', '@graph': [x, { '@type': 'WebSite', name: 'Growi' }] } : x));
  const r = validar(dir); assert.ok(r.ok, r.salida);
});
test('F8.4R JSON-LD restaurado (copia sin mutaciones) → PASA; y la candidata no se tocó', () => {
  const dir = join(base, 'restaurado'); cpSync(RELEASE, dir, { recursive: true });
  const r = validar(dir); assert.ok(r.ok, r.salida);
  assert.ok(readFileSync(join(R, 'flow', 'index.html'), 'utf8').includes(FRASE));   // la candidata conserva la frase
  rmSync(base, { recursive: true, force: true });
});
