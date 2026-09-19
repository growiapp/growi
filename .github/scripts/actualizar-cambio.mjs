// Actualiza shared.fx.js con el dólar oficial VENTA y reescribe el texto ARS de cada <span data-price> en los HTML,
// para que el precio que ven Google y los navegadores sin JS sea el mismo que calcula shared.js.
// Uso: node .github/scripts/actualizar-cambio.mjs [--force] [--venta=1535]
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const UMBRAL = 0.03; // solo se actualiza si el dólar se movió más de 3% contra el valor vigente
const FX_FILE = 'shared.fx.js';

// Mismo redondeo que shared.js: al millar desde $100.000, a la centena por debajo.
export function ars(usd, venta) {
  const v = usd * venta, paso = v >= 100000 ? 1000 : 100;
  return '$' + (Math.round(v / paso) * paso).toLocaleString('es-AR');
}

function htmlFiles(dir) {
  return readdirSync(dir).flatMap(f => {
    const p = join(dir, f);
    if (f.startsWith('.') || f === 'node_modules') return [];
    return statSync(p).isDirectory() ? htmlFiles(p) : p.endsWith('.html') ? [p] : [];
  });
}

// Autochequeo del redondeo: node .github/scripts/actualizar-cambio.mjs --check
if (process.argv.includes('--check')) {
  const casos = [[15, '$23.000'], [49, '$75.200'], [12.75, '$19.600'], [200, '$307.000'], [495, '$760.000']];
  for (const [usd, esperado] of casos) if (ars(usd, 1535) !== esperado) throw new Error(`ars(${usd}) = ${ars(usd, 1535)}, esperaba ${esperado}`);
  console.log('redondeo OK'); process.exit(0);
}

const arg = n => (process.argv.find(a => a.startsWith(`--${n}=`)) || '').split('=')[1];
const force = process.argv.includes('--force');

const actual = Number(/venta:\s*([\d.]+)/.exec(readFileSync(FX_FILE, 'utf8'))[1]);
let venta = Number(arg('venta'));
let fecha = new Date().toISOString().slice(0, 10);
if (!venta) {
  const r = await fetch('https://dolarapi.com/v1/dolares/oficial');
  if (!r.ok) throw new Error(`dolarapi respondió ${r.status}`);
  const d = await r.json();
  venta = Number(d.venta);
  fecha = String(d.fechaActualizacion).slice(0, 10);
}
if (!(venta > 0)) throw new Error(`cotización inválida: ${venta}`);

const variacion = Math.abs(venta - actual) / actual;
console.log(`vigente ${actual} · nuevo ${venta} · variación ${(variacion * 100).toFixed(2)}%`);
if (!force && variacion <= UMBRAL) { console.log('Por debajo del umbral: no se cambia nada.'); process.exit(0); }

writeFileSync(FX_FILE, readFileSync(FX_FILE, 'utf8').replace(/window\.GROWI_FX = .*/, `window.GROWI_FX = { venta: ${venta}, fecha: "${fecha}" };`));

const RE = /(<span\b[^>]*\bdata-price="([\d.]+)"[^>]*>)[^<]*(<\/span>)/g;
for (const f of htmlFiles('.')) {
  const html = readFileSync(f, 'utf8');
  const out = html.replace(RE, (m, open, usd, close) => open + ars(Number(usd), venta) + (/\bdata-price-short\b/.test(open) ? '' : ' ARS') + close);
  if (out !== html) { writeFileSync(f, out); console.log('actualizado', f); }
}
