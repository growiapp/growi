// F6.4 · Publicación y recuperación: la publicación es solo manual, la recuperación sale de main con un commit fijo y verificado,
// y el tipo de cambio no publica sin una variable expresa. Texto plano (sin dependencias): comprueba la estructura de los workflows.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const RAIZ = path.normalize(new URL('../../../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const leer = (r) => fs.readFileSync(path.join(RAIZ, r), 'utf8').replace(/\r\n/g, '\n');
const PRE_R3 = '7a2130cdb8bab5df1aa9a0a24cd1b2bf90443600'; // main publicado antes de R3 (fusión del PR #2, 2026-11-17)
const static_ = leer('.github/workflows/static.yml');
const fx = leer('.github/workflows/tipo-de-cambio.yml');

// claves de nivel 2 bajo `on:`
const disparadores = (t) => {
  const m = /^on:\n((?: {2,}.*\n|\n)+)/m.exec(t);
  assert.ok(m, 'sin bloque on:');
  return [...m[1].matchAll(/^ {2}([a-z_]+):/gm)].map((x) => x[1]);
};

test('publicación: static.yml solo se dispara a mano (ni push, ni pull_request, ni schedule)', () => {
  assert.deepEqual(disparadores(static_), ['workflow_dispatch']);
});

test('publicación: static.yml ofrece release (por defecto) y respaldo-pre-r3, y solo uno de los dos arma el paquete', () => {
  assert.match(static_, /fuente:\n {8}description: .*\n {8}type: choice\n {8}options:\n {10}- release\n {10}- respaldo-pre-r3\n {8}default: release/);
  assert.match(static_, /name: Ensamblar y validar el sitio público\n {8}if: inputs\.fuente != 'respaldo-pre-r3'/);
  assert.match(static_, /name: Ensamblar el paquete de recuperación .*\n {8}if: inputs\.fuente == 'respaldo-pre-r3'/);
  assert.equal((static_.match(/_construir\.py --release _site/g) || []).length, 1);
  assert.match(static_, /path: '_site'/);
  assert.match(static_, /name: github-pages/);
  assert.match(static_, /fetch-depth: 0/); // el commit de respaldo y el lastmod del sitemap salen del historial
});

test('recuperación: el commit de respaldo está fijado por SHA completo en el workflow y es el mismo que el de esta prueba', () => {
  const usos = [...static_.matchAll(/empaquetar-respaldo\.sh ([0-9a-f]{40}) _site/g)].map((m) => m[1]);
  assert.deepEqual(usos, [PRE_R3]);
});

test('recuperación: el script existe, falla cerrado y verifica contra el manifiesto', () => {
  const s = leer('.github/scripts/empaquetar-respaldo.sh');
  assert.match(s, /^#!\/usr\/bin\/env bash/);
  assert.match(s, /set -euo pipefail/);
  assert.match(s, /merge-base --is-ancestor/);
  assert.match(s, /sha256sum --quiet -c/);
  assert.match(s, /cat-file blob/);
  assert.equal(s.includes('\r'), false);
});

test('recuperación: el manifiesto del paquete anterior es exacto, sin rutas ocultas, e incluye index.html', () => {
  const lineas = leer('.github/recuperacion/pre-r3.sha256').trim().split('\n');
  assert.equal(lineas.length, 66);
  const rutas = lineas.map((l) => {
    const m = /^([0-9a-f]{64}) {2}(\S.*)$/.exec(l);
    assert.ok(m, 'línea mal formada: ' + l);
    return m[2];
  });
  assert.equal(new Set(rutas).size, rutas.length);
  assert.deepEqual([...rutas].sort(), rutas.slice().sort());
  assert.ok(rutas.includes('index.html') && rutas.includes('CNAME'));
  assert.equal(rutas.some((r) => r.split('/').some((c) => c.startsWith('.'))), false);
});

test('recuperación: cada hash del manifiesto coincide con el blob del commit fijado (si el historial lo tiene)', (t) => {
  const g = spawnSync('git', ['cat-file', '-e', PRE_R3 + '^{commit}'], { cwd: RAIZ });
  if (g.status !== 0) return t.skip('el clon no tiene el commit ' + PRE_R3.slice(0, 7) + ' (clon superficial)');
  for (const l of leer('.github/recuperacion/pre-r3.sha256').trim().split('\n')) {
    const [h, p] = [l.slice(0, 64), l.slice(66)];
    const b = spawnSync('git', ['cat-file', 'blob', PRE_R3 + ':' + p], { cwd: RAIZ, maxBuffer: 64 * 1024 * 1024 });
    assert.equal(b.status, 0, 'no existe ' + p + ' en ' + PRE_R3.slice(0, 7));
    assert.equal(crypto.createHash('sha256').update(b.stdout).digest('hex'), h, 'hash distinto: ' + p);
  }
  const lista = spawnSync('git', ['ls-tree', '-r', '--name-only', PRE_R3], { cwd: RAIZ, encoding: 'utf8' }).stdout.trim().split('\n').filter((p) => !p.split('/').some((c) => c.startsWith('.')));
  assert.equal(lista.length, 66);
});

test('tipo de cambio: no despacha publicación sin GROWI_AUTO_FX_DEPLOY=true y no se dispara por push', () => {
  assert.deepEqual(disparadores(fx).sort(), ['schedule', 'workflow_dispatch']);
  assert.match(fx, /if: steps\.commit\.outputs\.changed == 'true' && vars\.GROWI_AUTO_FX_DEPLOY == 'true'/);
  assert.match(fx, /gh workflow run static\.yml --ref main/); // sin input: usa el valor por defecto (release)
});
