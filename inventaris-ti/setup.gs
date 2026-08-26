// setup.gs — Inventaris Aset TI (Pilot Pabrik)
// Idempotent: buat tab ASET & RIWAYAT + header jika belum ada.
// Menu custom "Pabrik" → setup manual dari UI spreadsheet.

var ASET_SHEET = 'ASET';
var RIWAYAT_SHEET = 'RIWAYAT';

var ASET_HEADERS = [
  'id', 'kode_aset', 'nama', 'kategori', 'merek', 'serial_number',
  'lokasi', 'kondisi', 'status', 'pemegang', 'tanggal_perolehan',
  'keterangan', 'created_at', 'updated_at', 'is_deleted'
];

var RIWAYAT_HEADERS = ['id', 'aset_id', 'aksi', 'detail', 'oleh', 'created_at'];

function setupAset() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  _ensureSheet(ss, ASET_SHEET, ASET_HEADERS);
  _ensureSheet(ss, RIWAYAT_SHEET, RIWAYAT_HEADERS);
}

function _ensureSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  // Header hanya ditulis bila baris pertama kosong (idempotent).
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return sheet;
}

/** Reset penuh untuk demo/dev: hapus kedua tab lalu buat ulang. */
function resetDemo() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  [ASET_SHEET, RIWAYAT_SHEET].forEach(function (name) {
    var s = ss.getSheetByName(name);
    if (s) { ss.deleteSheet(s); }
  });
  setupAset();
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Pabrik')
    .addItem('Setup Inventaris TI', 'setupAset')
    .addSeparator()
    .addItem('Reset demo (hapus semua data)', 'resetDemo')
    .addToUi();
}
