// F6.3 · Licencias de fuentes: cada copia distribuida de un binario lleva su OFL al lado, y los textos oficiales de Epilogue y Syne no se alteran.
// No es un dictamen jurídico: comprueba presencia y literalidad. La procedencia está en assets/fonts/PROCEDENCIA.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const RAIZ_R3 = new URL('../', import.meta.url);
const RAIZ_REPO = new URL('../../../', import.meta.url);
const ruta = (base, r) => path.normalize(new URL(r, base).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
// carpetas con binarios que el release publica
const DIRS = [
  ruta(RAIZ_REPO, 'fonts'),
  ruta(RAIZ_R3, 'assets/fonts'),
  ruta(RAIZ_R3, 'vendor/fonts'),
  ruta(RAIZ_R3, 'demos/web/centro-ribera/assets/fonts'),
];
// prefijo del archivo binario -> nombre del archivo de licencia
const FAMILIAS = [
  [/^epilogue/i, 'OFL-Epilogue.txt'], [/^syne/i, 'OFL-Syne.txt'], [/^fraunces/i, 'OFL-Fraunces.txt'],
  [/^schibsted/i, 'OFL-SchibstedGrotesk.txt'], [/^instrument-serif/i, 'OFL-InstrumentSerif.txt'],
  [/^IBMPlexMono/i, 'OFL-IBMPlexMono.txt'], [/^FamiljenGrotesk/i, 'OFL-FamiljenGrotesk.txt'], [/^HankenGrotesk/i, 'OFL-HankenGrotesk.txt'],
];
const lf = (b) => Buffer.from(b.toString('latin1').replace(/\r\n/g, '\n'), 'latin1');
const sha = (b) => crypto.createHash('sha256').update(lf(b)).digest('hex');
// SHA-256 de los textos OFL oficiales (google/fonts, idénticos a los repositorios upstream), con fin de línea LF
const OFICIAL = {
  'OFL-Epilogue.txt': '95ebd6a2e4035b8398c83928fb85297b48441f27f405398c29b59aae899fc747',
  'OFL-Syne.txt': 'cc43cdce6f91c57989af8459341c276655e34224e954fa69c2ad700831a742d8',
};

test('licencias: cada binario .woff2 distribuido tiene su OFL en la misma carpeta', () => {
  let n = 0;
  for (const d of DIRS) {
    for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.woff2'))) {
      const fam = FAMILIAS.find(([re]) => re.test(f));
      assert.ok(fam, 'familia sin regla de licencia: ' + f);
      assert.ok(fs.existsSync(path.join(d, fam[1])), 'falta ' + fam[1] + ' junto a ' + path.join(d, f));
      n++;
    }
  }
  assert.equal(n, 15, 'se esperaban 15 binarios (los del release), hay ' + n);
});

test('licencias: Epilogue y Syne son los textos oficiales sin cambios en las tres copias', () => {
  for (const d of DIRS.slice(0, 3)) {
    for (const [nombre, h] of Object.entries(OFICIAL)) assert.equal(sha(fs.readFileSync(path.join(d, nombre))), h, nombre + ' alterado en ' + d);
  }
});

test('licencias: todo OFL-*.txt es la licencia OFL 1.1 y abre con su aviso de copyright', () => {
  for (const d of DIRS) {
    for (const f of fs.readdirSync(d).filter((x) => /^OFL-.*\.txt$/.test(x))) {
      const t = fs.readFileSync(path.join(d, f), 'utf8');
      assert.match(t, /^(﻿)?Copyright/, f + ' no abre con el aviso de copyright');
      assert.match(t, /SIL OPEN FONT LICENSE Version 1\.1/, f + ' no contiene la OFL 1.1');
    }
  }
});

test('licencias: el aviso embebido de Epilogue y Syne coincide con la familia (sin tocar el binario)', () => {
  // la tabla name del binario no se lee aquí (sin dependencias): se comprueba la línea 1 oficial y el nombre del proyecto
  const e = fs.readFileSync(path.join(DIRS[1], 'OFL-Epilogue.txt'), 'utf8').split('\n')[0];
  const s = fs.readFileSync(path.join(DIRS[1], 'OFL-Syne.txt'), 'utf8').split('\n')[0];
  assert.match(e, /The Epilogue Project Authors/);
  assert.match(s, /The Syne Project Authors/);
});
