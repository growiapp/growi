// USD en data-price es el precio aprobado; shared.fx.js de raíz es la única cotización fuente.
// Solo se modifican las diez páginas públicas vigentes y la candidata R3 actual si existe.
// Simulación offline: node .github/scripts/actualizar-cambio.mjs --root=DIR --venta=1550 --fecha=2026-11-19 --force
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const UMBRAL = 0.03;
const CAND = 'propuesta-rediseno/candidata-360-r3';
const PAGES = [
  'index.html', 'app/index.html', 'app/cafeterias/index.html',
  'app/peluquerias/index.html', 'app/talleres/index.html', 'app/retail/index.html',
  'web/index.html', 'flow/index.html', 'combo/index.html', 'invitaciones/index.html'
];
const arg = name => process.argv.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const root = resolve(arg('root') || '.');
const force = process.argv.includes('--force');

// Igual que shared.js y _lib.py: al millar desde 100.000, a la centena por debajo.
export function ars(usd, venta) {
  const v = usd * venta, paso = v >= 100000 ? 1000 : 100;
  return '$' + (Math.round(v / paso) * paso).toLocaleString('es-AR');
}

if (process.argv.includes('--check')) {
  for (const [usd, venta, esperado] of [
    [15, 1535, '$23.000'], [49, 1535, '$75.200'], [12.75, 1535, '$19.600'],
    [200, 1535, '$307.000'], [495, 1535, '$760.000'],
    [15, 1550, '$23.300'], [49, 1600, '$78.400']
  ]) {
    if (ars(usd, venta) !== esperado) throw new Error(`ars(${usd}, ${venta}) = ${ars(usd, venta)}, esperaba ${esperado}`);
  }
  console.log('redondeo OK');
  process.exit(0);
}

const fxPath = join(root, 'shared.fx.js');
const fx = readFileSync(fxPath, 'utf8');
const found = /venta:\s*([\d.]+)/.exec(fx);
if (!found) throw new Error('shared.fx.js no contiene una cotización válida');
const actual = Number(found[1]);
if (!Number.isFinite(actual) || actual <= 0) throw new Error('Cotización vigente inválida');

const validarVenta = value => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`Cotización inválida: ${value}`);
  return n;
};
const validarFecha = value => {
  const date = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    throw new Error(`Fecha de cotización inválida: ${value}`);
  }
  return date;
};

async function consultar() {
  let ultimo;
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const r = await fetch('https://dolarapi.com/v1/dolares/oficial', { signal: AbortSignal.timeout(15000) });
      if (!r.ok) throw new Error(`dolarapi respondió ${r.status}`);
      const d = await r.json();
      return { venta: validarVenta(d.venta), fecha: validarFecha(d.fechaActualizacion) };
    } catch (e) {
      ultimo = e;
      console.log(`intento ${intento}/3 falló: ${e.message}`);
      if (intento < 3) await new Promise(ok => setTimeout(ok, intento * 20000));
    }
  }
  throw ultimo;
}

let venta, fecha;
try {
  if (arg('venta') !== undefined) {
    venta = validarVenta(arg('venta'));
    fecha = validarFecha(arg('fecha') || new Date().toISOString());
  } else {
    ({ venta, fecha } = await consultar());
  }
} catch (e) {
  console.error(`::error::No se pudo obtener una cotización válida (${e.message}). El sitio conserva ${actual}.`);
  process.exit(1);
}

const variacion = Math.abs(venta - actual) / actual;
if (!force && variacion > 0.4) {
  console.error(`::error::Cotización sospechosa: ${venta} contra ${actual} vigente. Revisar y, si corresponde, usar --force.`);
  process.exit(1);
}
console.log(`vigente ${actual} · nuevo ${venta} · variación ${(variacion * 100).toFixed(2)}%`);
if (!force && variacion <= UMBRAL) {
  console.log('Por debajo del umbral: no se cambia nada.');
} else {
  const writes = new Map();
  const newFx = fx.replace(/window\.GROWI_FX\s*=\s*\{[^}]*\};?/, `window.GROWI_FX = { venta: ${venta}, fecha: "${fecha}" };`);
  if (newFx === fx && venta !== actual) throw new Error('No se pudo actualizar shared.fx.js');
  writes.set('shared.fx.js', newFx);

  const sets = [PAGES];
  if (existsSync(join(root, CAND))) {
    const vendor = join(CAND, 'vendor/shared.fx.js');
    if (!existsSync(join(root, vendor))) throw new Error(`Falta ${vendor}`);
    writes.set(vendor, newFx); // copia de vista previa, nunca fuente independiente
    sets.push(PAGES.map(p => join(CAND, p)));
  }
  const RE = /(<span\b[^>]*\bdata-price="([\d.]+)"[^>]*>)[^<]*(<\/span>)/g;
  const touchedPublic = [];
  for (const paths of sets) {
    for (const file of paths) {
      const full = join(root, file);
      if (!existsSync(full)) throw new Error(`Falta una página prevista: ${file}`);
      const html = readFileSync(full, 'utf8');
      const total = (html.match(/<span\b[^>]*\bdata-price="/g) || []).length;
      let count = 0;
      const out = html.replace(RE, (m, open, usd, close) => {
        count++;
        return open + ars(Number(usd), venta) + (/\bdata-price-short\b/.test(open) ? '' : ' ARS') + close;
      });
      if (count !== total) throw new Error(`Hay precios que no se pueden reescribir en ${file}: ${count}/${total}`);
      if (out !== html) {
        writes.set(file, out);
        if (paths === sets[0]) touchedPublic.push(file);
      }
    }
  }

  const sitemapPath = join(root, 'sitemap.xml');
  let sitemap = readFileSync(sitemapPath, 'utf8');
  for (const file of touchedPublic) {
    const url = 'https://growi.ar/' + file.replace(/\\/g, '/').replace(/index\.html$/, '');
    const pattern = new RegExp('(<loc>' + url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '</loc>\\s*<lastmod>)[^<]*');
    if (!pattern.test(sitemap)) throw new Error(`Falta la ruta en sitemap.xml: ${url}`);
    sitemap = sitemap.replace(pattern, '$1' + fecha);
  }
  if (sitemap !== readFileSync(sitemapPath, 'utf8')) writes.set('sitemap.xml', sitemap);

  // Se valida el conjunto completo antes de escribir; nunca se recorren prototipos ni históricos.
  for (const [file, body] of writes) {
    const full = join(root, file);
    if (body !== readFileSync(full, 'utf8')) {
      writeFileSync(full, body);
      console.log('actualizado', file);
    }
  }
}
