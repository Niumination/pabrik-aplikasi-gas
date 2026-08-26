// NiuSheetMock — mock SpreadsheetApp untuk harness test pabrik-aplikasi-gas.
// Menyimulasi Sheet berbasis objek JS: baris = record, kolom = field.
//
// Pemakaian di test:
//   const { NiuSheetMock, loadGasModule } = require('../_harness/mock-spreadsheetapp.js');
//   const env = new NiuSheetMock({ Aset: [] });           // sheet + header otomatis
//   const code = loadGasModule('inventaris-ti/code.gs', { SpreadsheetApp: env.spreadsheetApp() });
//   code.tambahAset({ kode:'AST-001', nama:'Laptop', ... });

class MockRange {
  constructor(sheet) { this.sheet = sheet; }
  setValues(rows) { this.sheet._rows = rows.map(r => [...r]); return this; }
  getValues() { return this.sheet._rows.map(r => [...r]); }
  getLastRow() { return this.sheet._rows.length; }
}

class MockSheet {
  constructor(name, headers = []) {
    this.name = name;
    this._headers = headers;
    this._rows = []; // array of array (tanpa header)
  }
  getName() { return this.name; }
  // Semantik GAS asli: header = baris 1 → getLastRow = data + 1
  getLastRow() { return this._rows.length + (this._headers.length ? 1 : 0); }
  getLastColumn() { return Math.max(this._headers.length, 1); }
  getRange(row, col, numRows = 1, numCols = this.getLastColumn()) {
    // Dukungan minimal: getRange(...).getValues() & .setValues() pada area data/header
    const sheet = this;
    return {
      setValues(vals) {
        if (row === 1 && numRows === 1) { sheet._headers = vals[0].slice(); }
        else {
          vals.forEach((r, i) => {
            const idx = row - 1 + i - 1; // baris fisik tanpa header
            sheet._rows[idx] = r.slice();
          });
        }
        return this;
      },
      getValues() {
        if (row === 1 && numRows === 1 && col === 1) { return [sheet._headers.slice()]; }
        const out = [];
        for (let i = 0; i < numRows; i++) {
          out.push(sheet._rows[row + i - 2] || []);
        }
        return out;
      },
      setValue(v) {
        if (row >= 2) {
          const rIdx = row - 2;
          while (sheet._rows.length <= rIdx) { sheet._rows.push([]); }
          sheet._rows[rIdx][col - 1] = v;
        } else if (row === 1) { sheet._headers[col - 1] = v; }
        return this;
      },
      getValue() {
        if (row >= 2) { return (sheet._rows[row - 2] || [])[col - 1]; }
        return sheet._headers[col - 1];
      },
    };
  }
  getDataRange() {
    // GAS convention: range termasuk baris header
    return new MockRange(this); // _rows dianggap data murni; header dikelola terpisah oleh mock
  }
  appendRow(row) { this._rows.push([...row]); return this; }
  getRowAsObject(idx) { // idx 1-based ke record object
    const row = this._rows[idx - 1] || [];
    const o = {};
    this._headers.forEach((h, i) => { o[h] = row[i]; });
    return o;
  }
  getAllObjects() { return this._rows.map((_, i) => this.getRowAsObject(i + 1)); }
  findIndexBy(field, value) {
    const col = this._headers.indexOf(field);
    if (col === -1) return -1;
    return this._rows.findIndex(r => r[col] === value); // -1 jika tak ketemu
  }
  updateRow(idx, patch) {
    const o = this.getRowAsObject(idx);
    Object.assign(o, patch);
    this._rows[idx - 1] = this._headers.map(h => o[h]);
    return this;
  }
  deleteRow(idx) { this._rows.splice(idx - 1, 1); return this; }
}

class MockSpreadsheet {
  constructor(sheets = {}) {
    this._sheets = new Map();
    for (const [name, headers] of Object.entries(sheets)) {
      this._sheets.set(name, new MockSheet(name, headers));
    }
  }
  getSheetByName(name) { return this._sheets.get(name) || null; }
  insertSheet(name) {
    const s = new MockSheet(name);
    this._sheets.set(name, s);
    return s;
  }
}

class NiuSheetMock {
  /**
   * @param {Object<string, string[]>} sheets — map nama sheet → daftar header kolom
   */
  constructor(sheets) { this._ss = new MockSpreadsheet(sheets); }
  spreadsheetApp() {
    const self = this;
    return {
      getActiveSpreadsheet: () => self._ss,
      newMock: () => self._ss,
    };
  }
  ss() { return this._ss; }
}

/**
 * Load file .gs sebagai CommonJS module dengan globals yang disuntikkan.
 * File .gs harus punya pola: fungsi2 global; loader membungkus isi file
 * dalam function(globals){...} dan mengevaluasi via new Function,
 * lalu mengembalikan objek berisi semua fungsi top-level yang didefinisikan.
 */
function loadGasModule(relPath, injectedGlobals = {}) {
  const fs = require('fs');
  const path = require('path');
  const abs = path.resolve(__dirname, '..', relPath);
  const src = fs.readFileSync(abs, 'utf8');

  // Kumpulkan nama fungsi top-level "function nama(...)"
  const fnNames = [];
  const re = /(?:^|\n)\s*function\s+([A-Za-z_$][\w$]*)\s*\(/g;
  let m;
  while ((m = re.exec(src)) !== null) fnNames.push(m[1]);

  const factory = new Function(
    ...Object.keys(injectedGlobals),
    `"use strict";\n${src}\nreturn {${fnNames.join(',')}};`
  );
  return factory(...Object.values(injectedGlobals));
}

module.exports = { NiuSheetMock, loadGasModule };
