// F8.1B · toda ancla interna apunta a un id existente, todo enlace interno a un archivo existente y todo enlace a WhatsApp lleva mensaje y rel seguro.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const R = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RUTAS = ['index.html', 'app/index.html', 'app/cafeterias/index.html', 'app/peluquerias/index.html', 'app/retail/index.html', 'app/talleres/index.html', 'web/index.html', 'flow/index.html', 'combo/index.html', 'invitaciones/index.html', 'demos/sandbox/cafeteria/index.html', 'demos/sandbox/peluqueria/index.html'];
for (const ruta of RUTAS) {
  test('F8.1B acciones · ' + ruta, () => {
    const h = readFileSync(join(R, ruta), 'utf8'), dir = dirname(join(R, ruta));
    const ids = new Set([...h.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
    for (const m of h.matchAll(/<a\s[^>]*href="([^"]*)"[^>]*>/g)) {
      const href = m[1], tag = m[0];
      if (href.startsWith('#')) { if (href.length > 1) assert.ok(ids.has(href.slice(1)), 'ancla sin destino ' + href); continue; }
      if (/^https:\/\/wa\.me\//.test(href)) { assert.ok(/^https:\/\/wa\.me\/549\d{10}\?text=\S+/.test(href), 'WhatsApp sin mensaje ' + href); assert.ok(/target="_blank"/.test(tag) && /noopener/.test(tag), 'WhatsApp sin _blank/noopener'); continue; }
      if (/^(https?:|mailto:|tel:)/.test(href)) continue;
      const [p, hash] = href.split('#'), f = join(dir, p);
      const dest = p === '' ? join(R, ruta) : (/\.[a-z0-9]+$/.test(f) ? f : join(f, 'index.html'));
      assert.ok(existsSync(dest), 'destino inexistente ' + href);
      if (hash && /index\.html$/.test(dest)) assert.ok(readFileSync(dest, 'utf8').includes(' id="' + hash + '"'), 'ancla remota inexistente ' + href);
    }
  });
}
