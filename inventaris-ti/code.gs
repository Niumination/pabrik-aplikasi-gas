// code.gs — Inventaris Aset TI (Pilot Pabrik)
// Kontrak fungsi sesuai Blueprint §7. Validasi server-side wajib (§4).
// Konvensi: id = Utilities.getUuid(); timestamp ISO tz Asia/Jakarta; soft delete.

var TZ = 'Asia/Jakarta';
var KONDISI_ENUM = ['baik', 'rusak', 'hilang'];
var STATUS_ENUM = ['tersedia', 'dipakai', 'dipinjam'];
var KATEGORI_ENUM = ['Laptop', 'PC', 'Printer', 'Periferal', 'Jaringan', 'Lainnya'];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Inventaris Aset TI')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ── Util internal ──────────────────────────────────────────────

function _nowIso() {
  return Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function _asetSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s = ss.getSheetByName('ASET');
  if (!s) {
    // Self-healing: buat struktur otomatis (idempotent) saat pertama dipakai.
    s = ss.insertSheet('ASET');
    if (s.getLastRow() === 0) {
      s.getRange(1, 1, 1, ASET_HEADERS.length).setValues([ASET_HEADERS]);
    }
  }
  return s;
}

function _riwayatSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s = ss.getSheetByName('RIWAYAT');
  if (!s) {
    s = ss.insertSheet('RIWAYAT');
    if (s.getLastRow() === 0) {
      s.getRange(1, 1, 1, RIWAYAT_HEADERS.length).setValues([RIWAYAT_HEADERS]);
    }
  }
  return s;
}

function _headers(sheet) {
  var last = sheet.getLastColumn();
  return sheet.getRange(1, 1, 1, last).getValues()[0];
}

/** Baca semua baris data ASET → array of object (termasuk yang is_deleted). */
function _readAsetRaw() {
  var sheet = _asetSheet();
  var heads = _headers(sheet);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) { return []; }
  var values = sheet.getRange(2, 1, lastRow - 1, heads.length).getValues();
  return values.map(function (row, i) {
    var o = {};
    heads.forEach(function (h, c) { o[h] = row[c]; });
    o.__rowIdx = i + 2; // nomor baris fisik di Sheet
    return o;
  });
}

function _appendRiwayat(asetId, aksi, detail, oleh) {
  _riwayatSheet().appendRow([
    Utilities.getUuid(), asetId, aksi, detail || '', oleh || '', _nowIso()
  ]);
}

/** Validasi & normalisasi payload. Return dict siap tulis. Throw {ok:false,error}. */
function _validate(data, existingId) {
  if (!data || typeof data !== 'object') {
    throw { ok: false, error: 'Data tidak valid.' };
  }
  var kode = String(data.kode_aset || '').trim();
  var nama = String(data.nama || '').trim();
  var kategori = String(data.kategori || '').trim();
  var lokasi = String(data.lokasi || '').trim();

  if (!kode) { throw { ok: false, error: 'Field wajib kosong: kode_aset' }; }
  if (!nama) { throw { ok: false, error: 'Field wajib kosong: nama' }; }
  if (!kategori) { throw { ok: false, error: 'Field wajib kosong: kategori' }; }
  if (!lokasi) { throw { ok: false, error: 'Field wajib kosong: lokasi' } }

  var kondisi = KONDISI_ENUM.indexOf(String(data.kondisi || 'baik')) !== -1
    ? String(data.kondisi || 'baik') : null;
  if (!kondisi) { throw { ok: false, error: 'kondisi harus salah satu dari: ' + KONDISI_ENUM.join(', ') }; }

  var status = STATUS_ENUM.indexOf(String(data.status || 'tersedia')) !== -1
    ? String(data.status || 'tersedia') : null;
  if (!status) { throw { ok: false, error: 'status harus salah satu dari: ' + STATUS_ENUM.join(', ') }; }

  // Kode unik vs baris lain
  var dup = _readAsetRaw().some(function (a) {
    return !a.is_deleted && a.kode_aset === kode && a.id !== existingId;
  });
  if (dup) { throw { ok: false, error: 'kode_aset "' + kode + '" sudah dipakai aset lain.' }; }

  // Konsistensi status ↔ pemegang
  var pemegang = String(data.pemegang || '').trim();
  if (status !== 'tersedia' && !pemegang) {
    throw { ok: false, error: 'status "' + status + '" wajib disertai pemegang.' };
  }
  if (status === 'tersedia') { pemegang = ''; }

  var tgl = data.tanggal_perolehan ? String(data.tanggal_perolehan) : '';
  if (tgl && !/^\d{4}-\d{2}-\d{2}$/.test(tgl)) {
    throw { ok: false, error: 'tanggal_perolehan harus format yyyy-mm-dd.' };
  }

  return {
    kode_aset: kode,
    nama: nama,
    kategori: kategori,
    merek: String(data.merek || '').trim(),
    serial_number: String(data.serial_number || '').trim(),
    lokasi: lokasi,
    kondisi: kondisi,
    status: status,
    pemegang: pemegang,
    tanggal_perolehan: tgl,
    keterangan: String(data.keterangan || '').trim()
  };
}

function _diffDetail(oldO, newO) {
  var parts = [];
  Object.keys(newO).forEach(function (k) {
    var before = String(oldO[k] === null || oldO[k] === undefined ? '' : oldO[k]);
    var after = String(newO[k]);
    if (before !== after && k !== '__rowIdx') {
      parts.push(k + ': ' + before + ' → ' + after);
    }
  });
  return parts.join('; ') || 'tanpa perubahan field';
}

// ── API publik (kontrak blueprint §7) ─────────────────────────

function tambahAset(data) {
  var clean = _validate(data, null);
  var now = _nowIso();
  var row = new Array(15).fill('');
  row[0] = Utilities.getUuid();      // id
  row[1] = clean.kode_aset;
  row[2] = clean.nama;
  row[3] = clean.kategori;
  row[4] = clean.merek;
  row[5] = clean.serial_number;
  row[6] = clean.lokasi;
  row[7] = clean.kondisi;
  row[8] = clean.status;
  row[9] = clean.pemegang;
  row[10] = clean.tanggal_perolehan;
  row[11] = clean.keterangan;
  row[12] = now;                     // created_at
  row[13] = now;                     // updated_at
  row[14] = false;                   // is_deleted
  _asetSheet().appendRow(row);
  _appendRiwayat(row[0], 'tambah', 'aset dibuat: ' + clean.kode_aset, data && data.oleh);
  return { ok: true, id: row[0] };
}

function listAset(filter) {
  filter = filter || {};
  var all = _readAsetRaw().filter(function (a) { return !a.is_deleted; });

  var q = String(filter.q || '').toLowerCase().trim();
  var items = all.filter(function (a) {
    if (filter.kategori && a.kategori !== filter.kategori) { return false; }
    if (filter.lokasi && a.lokasi !== filter.lokasi) { return false; }
    if (filter.status && a.status !== filter.status) { return false; }
    if (filter.kondisi && a.kondisi !== filter.kondisi) { return false; }
    if (q) {
      var hay = [a.kode_aset, a.nama, a.serial_number, a.pemegang]
        .join(' ').toLowerCase();
      if (hay.indexOf(q) === -1) { return false; }
    }
    return true;
  });

  var perStatus = { tersedia: 0, dipakai: 0, dipinjam: 0 };
  all.forEach(function (a) {
    if (perStatus[a.status] !== undefined) { perStatus[a.status]++; }
  });

  items.forEach(function (a) { delete a.__rowIdx; delete a.is_deleted_raw; });
  return {
    items: items.map(function (a) { delete a.__rowIdx; return a; }),
    meta: { total: all.length, perStatus: perStatus }
  };
}

function ubahAset(id, data) {
  var sheet = _asetSheet();
  var heads = _headers(sheet);
  var rows = _readAsetRaw();
  var target = null;
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].id === id && !rows[i].is_deleted) { target = rows[i]; break; }
  }
  if (!target) { throw { ok: false, error: 'Aset tidak ditemukan (id: ' + id + ').' }; }

  // Merge: field kosong/null di payload = tidak diubah
  var merged = {};
  heads.forEach(function (h) {
    if (['id', 'created_at', 'updated_at', 'is_deleted', '__rowIdx'].indexOf(h) !== -1) { return; }
    merged[h] = (data && data[h] !== undefined && data[h] !== null && data[h] !== '')
      ? data[h] : target[h];
  });

  var clean = _validate(merged, id);
  var detail = _diffDetail(target, clean);

  var updated = {};
  heads.forEach(function (h, idx) {
    if (clean[h] !== undefined) { updated[h] = clean[h]; }
  });
  updated.updated_at = _nowIso();

  // Tulis balik ke baris fisik
  var rowValues = heads.map(function (h) {
    if (updated[h] !== undefined) { return updated[h]; }
    return target[h];
  });
  sheet.getRange(target.__rowIdx, 1, 1, heads.length).setValues([rowValues]);

  _appendRiwayat(id, 'ubah', detail, data && data.oleh);
  return { ok: true };
}

function hapusAset(id) {
  var sheet = _asetSheet();
  var heads = _headers(sheet);
  var rows = _readAsetRaw();
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].id === id && !rows[i].is_deleted) {
      var colDeleted = heads.indexOf('is_deleted') + 1;
      var colUpdated = heads.indexOf('updated_at') + 1;
      sheet.getRange(rows[i].__rowIdx, colDeleted).setValue(true);
      sheet.getRange(rows[i].__rowIdx, colUpdated).setValue(_nowIso());
      _appendRiwayat(id, 'nonaktif',
        'soft delete: ' + rows[i].kode_aset, null);
      return { ok: true };
    }
  }
  throw { ok: false, error: 'Aset tidak ditemukan / sudah nonaktif (id: ' + id + ').' };
}

function getOpsi() {
  var lokasi = {};
  var kategori = KATEGORI_ENUM.slice();
  _readAsetRaw().forEach(function (a) {
    if (!a.is_deleted && a.lokasi) { lokasi[a.lokasi] = true; }
  });
  return { kategori: kategori, lokasi: Object.keys(lokasi).sort() };
}

function _diagPing() { return "pong-" + new Date().toISOString(); }
