/**
 * N9 Generator Surat — ALL_IN_ONE.gs
 * Kemasan: DOC_GENERATOR | v1.0.0
 *
 * Prasyarat di CONFIG:
 * - template_doc_id  : ID Google Docs template
 * - output_folder_id : ID folder Drive tujuan
 */

var GS = {
  MENU: '📄 Generator Surat',
  TZ: 'Asia/Jakarta',
  TABS: {
    CONFIG: 'CONFIG',
    DATA: 'DATA_SURAT',
    LOG: 'LOG_GENERATE'
  },
  HEADERS: [
    'id', 'nomor_surat', 'tanggal_surat', 'tipe', 'perihal',
    'penerima_nama', 'penerima_jabatan', 'penerima_instansi', 'penerima_alamat',
    'pengirim_nama', 'pengirim_jabatan', 'pengirim_instansi',
    'isi_paragraf_1', 'isi_paragraf_2', 'isi_penutup',
    'tembusan', 'kota', 'status',
    'doc_url', 'pdf_url', 'generated_at', 'catatan',
    'created_at', 'updated_at', 'is_deleted'
  ]
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu(GS.MENU)
    .addItem('1) Setup skema', 'setupGeneratorSurat')
    .addItem('2) Cek konfigurasi template/folder', 'checkConfig')
    .addSeparator()
    .addItem('Generate baris aktif (kursor)', 'generateActiveRow')
    .addItem('Generate batch status = siap', 'generateBatchSiap')
    .addItem('Dry-run batch (tanpa buat file)', 'dryRunBatchSiap')
    .addSeparator()
    .addItem('Isi 1 baris sample', 'seedSampleSurat')
    .addToUi();
}

// ═══════════════════════════════════════
// SETUP
// ═══════════════════════════════════════

function setupGeneratorSurat() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  try { ss.rename('Generator Surat — N9'); } catch (e) {}

  var conf = getOrCreate_(ss, GS.TABS.CONFIG);
  conf.clear();
  setHdr_(conf, ['key', 'value', 'catatan']);
  conf.getRange(2, 1, 12, 3).setValues([
    ['timezone', GS.TZ, ''],
    ['template_doc_id', '', 'WAJIB: ID Doc template (dari URL /d/THIS_ID/edit)'],
    ['output_folder_id', '', 'WAJIB: ID folder Drive output'],
    ['export_pdf', 'TRUE', 'TRUE = simpan PDF selain Docs'],
    ['filename_pattern', '{{nomor_surat}}_{{penerima_nama}}', 'Nama file tanpa ekstensi'],
    ['status_after_generate', 'sudah_generate', 'Status diisi setelah sukses'],
    ['status_ready', 'siap', 'Status yang diambil batch'],
    ['share_with_editor', '', 'Opsional: email yang di-share edit pada file hasil'],
    ['org_name', 'Unit Saya', ''],
    ['dry_run_default', 'FALSE', ''],
    ['replace_missing_with', '-', 'Jika field kosong'],
    ['open_doc_after', 'FALSE', 'TRUE hanya praktis di sesi manual kecil']
  ]);
  conf.setColumnWidth(1, 180);
  conf.setColumnWidth(2, 360);
  conf.setColumnWidth(3, 420);

  var data = getOrCreate_(ss, GS.TABS.DATA);
  if (data.getLastRow() === 0 || String(data.getRange(1, 1).getValue()) !== 'id') {
    data.clear();
    setHdr_(data, GS.HEADERS);
  }

  var log = getOrCreate_(ss, GS.TABS.LOG);
  if (log.getLastRow() === 0) {
    setHdr_(log, ['id', 'waktu', 'data_id', 'nomor_surat', 'mode', 'status', 'doc_url', 'pdf_url', 'error', 'user']);
  }

  var def = ss.getSheetByName('Sheet1');
  if (def && ss.getSheets().length > 1) {
    try { ss.deleteSheet(def); } catch (e) {}
  }

  seedSampleSurat(true);
  ss.toast('Setup N9 selesai. Isi template_doc_id & output_folder_id di CONFIG.', 'N9', 8);
  onOpen();
}

function seedSampleSurat(silent) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(GS.TABS.DATA);
  if (!sh) return;
  if (sh.getLastRow() > 1 && silent) return;

  var tz = cfg_(ss, 'timezone') || GS.TZ;
  var now = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm:ss');
  var today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  var id = Utilities.getUuid();

  // clear sample rows if only header
  if (sh.getLastRow() > 1) {
    // jangan hapus data user saat non-silent tanpa sadar — hanya append bila kosong
  } else {
    // nothing
  }
  if (sh.getLastRow() === 1) {
    sh.appendRow([
      id,
      '001/TU/VIII/2026',
      today,
      'undangan',
      'Undangan Rapat Koordinasi Bulanan',
      'Bapak Rudi Hartono',
      'Kepala Bagian Umum',
      'PT Contoh Sejahtera',
      'Jl. Merdeka No. 10, Kota',
      'Siti Aminah',
      'Sekretaris',
      'Unit Operasional',
      'Dengan hormat, bersama ini kami mengundang Bapak/Ibu untuk hadir dalam rapat koordinasi bulanan.',
      'Rapat diselenggarakan pada hari kerja berikutnya pukul 09.00 di ruang rapat utama.',
      'Demikian undangan ini kami sampaikan, atas perhatian dan kehadirannya diucapkan terima kasih.',
      '1. Kepala Unit\n2. Arsip',
      'Lhokseumawe',
      'siap',
      '', '', '',
      'Sample otomatis',
      now, now, false
    ]);
  }
  if (!silent) ss.toast('Sample siap (status=siap)', 'N9', 4);
}

// ═══════════════════════════════════════
// CONFIG CHECK
// ═══════════════════════════════════════

function checkConfig() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tid = cfg_(ss, 'template_doc_id');
  var fid = cfg_(ss, 'output_folder_id');
  var lines = [];

  if (!tid) lines.push('✗ template_doc_id kosong');
  else {
    try {
      var t = DriveApp.getFileById(tid);
      lines.push('✓ Template: ' + t.getName());
    } catch (e) {
      lines.push('✗ template_doc_id tidak bisa diakses: ' + e.message);
    }
  }

  if (!fid) lines.push('✗ output_folder_id kosong');
  else {
    try {
      var f = DriveApp.getFolderById(fid);
      lines.push('✓ Folder: ' + f.getName());
    } catch (e) {
      lines.push('✗ output_folder_id tidak bisa diakses: ' + e.message);
    }
  }

  SpreadsheetApp.getUi().alert('Cek CONFIG', lines.join('\n'), SpreadsheetApp.getUi().ButtonSet.OK);
}

// ═══════════════════════════════════════
// GENERATE
// ═══════════════════════════════════════

function generateActiveRow() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(GS.TABS.DATA);
  var row = sh.getActiveCell().getRow();
  if (row < 2) {
    alert_('Pilih sel di baris data (bukan header).');
    return;
  }
  var result = generateRow_(ss, row, false);
  alert_(result.ok
    ? ('Sukses.\nDoc: ' + result.docUrl + (result.pdfUrl ? '\nPDF: ' + result.pdfUrl : ''))
    : ('Gagal: ' + result.error));
}

function generateBatchSiap() {
  batchGenerate_(false);
}

function dryRunBatchSiap() {
  batchGenerate_(true);
}

function batchGenerate_(dryRun) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(GS.TABS.DATA);
  var ready = String(cfg_(ss, 'status_ready') || 'siap').toLowerCase();
  var last = sh.getLastRow();
  if (last < 2) {
    alert_('Tidak ada data.');
    return;
  }

  var statusCol = GS.HEADERS.indexOf('status') + 1;
  var statuses = sh.getRange(2, statusCol, last - 1, 1).getValues();
  var ok = 0, fail = 0, skip = 0;
  var errors = [];

  for (var i = 0; i < statuses.length; i++) {
    var st = String(statuses[i][0] || '').toLowerCase();
    var row = i + 2;
    if (st !== ready) {
      skip++;
      continue;
    }
    var res = generateRow_(ss, row, dryRun);
    if (res.ok) ok++;
    else {
      fail++;
      errors.push('Baris ' + row + ': ' + res.error);
    }
  }

  alert_(
    (dryRun ? '[DRY-RUN] ' : '') +
    'Selesai. OK=' + ok + ' Gagal=' + fail + ' Skip=' + skip +
    (errors.length ? '\n\n' + errors.slice(0, 5).join('\n') : '')
  );
}

/**
 * @return {{ok:boolean, docUrl?:string, pdfUrl?:string, error?:string}}
 */
function generateRow_(ss, row, dryRun) {
  var sh = ss.getSheetByName(GS.TABS.DATA);
  var headers = GS.HEADERS;
  var values = sh.getRange(row, 1, 1, headers.length).getValues()[0];
  var data = {};
  headers.forEach(function (h, i) { data[h] = values[i]; });

  if (isTrue_(data.is_deleted)) {
    return logResult_(ss, data, dryRun, false, '', '', 'Baris di-soft-delete');
  }

  var tid = cfg_(ss, 'template_doc_id');
  var fid = cfg_(ss, 'output_folder_id');
  if (!tid || !fid) {
    return logResult_(ss, data, dryRun, false, '', '', 'CONFIG template_doc_id / output_folder_id belum diisi');
  }

  var tz = cfg_(ss, 'timezone') || GS.TZ;
  var missing = cfg_(ss, 'replace_missing_with') || '-';

  // Pastikan id
  if (!data.id) {
    data.id = Utilities.getUuid();
    sh.getRange(row, headers.indexOf('id') + 1).setValue(data.id);
  }

  var map = buildPlaceholderMap_(data, tz, missing);
  var filename = applyPattern_(cfg_(ss, 'filename_pattern') || '{{nomor_surat}}', map);
  filename = sanitizeFilename_(filename) || ('surat_' + data.id.slice(0, 8));

  if (dryRun) {
    return logResult_(ss, data, true, true, '(dry-run)', '', 'Preview file: ' + filename);
  }

  try {
    var folder = DriveApp.getFolderById(fid);
    var templateFile = DriveApp.getFileById(tid);
    var copy = templateFile.makeCopy(filename, folder);
    var copyId = copy.getId();

    var doc = DocumentApp.openById(copyId);
    var body = doc.getBody();
    // juga header/footer
    replaceAllInDoc_(doc, map);
    doc.saveAndClose();

    var docUrl = copy.getUrl();
    var pdfUrl = '';

    if (isTrue_(cfg_(ss, 'export_pdf'))) {
      var pdfBlob = copy.getAs(MimeType.PDF).setName(filename + '.pdf');
      var pdfFile = folder.createFile(pdfBlob);
      pdfUrl = pdfFile.getUrl();
    }

    var share = cfg_(ss, 'share_with_editor');
    if (share) {
      try {
        copy.addEditor(share);
        if (pdfUrl) DriveApp.getFileById(pdfFileIdFromUrl_(pdfUrl) || '').addEditor(share);
      } catch (eShare) {
        // non-fatal
      }
    }

    var now = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm:ss');
    setCol_(sh, row, 'doc_url', docUrl);
    setCol_(sh, row, 'pdf_url', pdfUrl);
    setCol_(sh, row, 'generated_at', now);
    setCol_(sh, row, 'status', cfg_(ss, 'status_after_generate') || 'sudah_generate');
    setCol_(sh, row, 'updated_at', now);

    return logResult_(ss, data, false, true, docUrl, pdfUrl, '');
  } catch (err) {
    return logResult_(ss, data, false, false, '', '', String(err.message || err));
  }
}

function buildPlaceholderMap_(data, tz, missing) {
  var map = {};
  GS.HEADERS.forEach(function (h) {
    var v = data[h];
    if (v === '' || v == null) v = missing;
    else if (Object.prototype.toString.call(v) === '[object Date]') {
      v = Utilities.formatDate(v, tz, 'yyyy-MM-dd');
    } else {
      v = String(v);
    }
    map[h] = v;
    map[h.toUpperCase()] = v;
  });
  // alias ramah template
  map['TANGGAL'] = map['tanggal_surat'];
  map['NOMOR'] = map['nomor_surat'];
  map['PERIHAL'] = map['perihal'];
  map['NAMA'] = map['penerima_nama'];
  map['HARI_INI'] = Utilities.formatDate(new Date(), tz, 'dd MMMM yyyy');
  return map;
}

function replaceAllInDoc_(doc, map) {
  var keys = Object.keys(map).sort(function (a, b) { return b.length - a.length; });
  function repl(el) {
    keys.forEach(function (k) {
      el.replaceText('\\{\\{' + escapeRe_(k) + '\\}\\}', map[k]);
    });
  }
  repl(doc.getBody());
  var n = doc.getNumHeaders ? null : null; // compatibility
  try {
    var header = doc.getHeader();
    if (header) repl(header);
  } catch (e) {}
  try {
    var footer = doc.getFooter();
    if (footer) repl(footer);
  } catch (e2) {}
  // tables in body already covered by body.replaceText in most cases
}

function applyPattern_(pattern, map) {
  var out = String(pattern);
  Object.keys(map).forEach(function (k) {
    out = out.split('{{' + k + '}}').join(map[k]);
  });
  return out;
}

function sanitizeFilename_(name) {
  return String(name)
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 120);
}

function escapeRe_(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function setCol_(sh, row, field, value) {
  var idx = GS.HEADERS.indexOf(field) + 1;
  if (idx > 0) sh.getRange(row, idx).setValue(value);
}

function logResult_(ss, data, dryRun, ok, docUrl, pdfUrl, error) {
  var log = ss.getSheetByName(GS.TABS.LOG);
  var tz = cfg_(ss, 'timezone') || GS.TZ;
  var user = '';
  try { user = Session.getActiveUser().getEmail(); } catch (e) {}
  log.appendRow([
    Utilities.getUuid().slice(0, 8),
    Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm:ss'),
    data.id || '',
    data.nomor_surat || '',
    dryRun ? 'DRY_RUN' : 'GENERATE',
    ok ? 'OK' : 'ERROR',
    docUrl || '',
    pdfUrl || '',
    error || '',
    user
  ]);
  return { ok: ok, docUrl: docUrl, pdfUrl: pdfUrl, error: error };
}

function pdfFileIdFromUrl_(url) {
  var m = String(url).match(/[-\w]{25,}/);
  return m ? m[0] : '';
}

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════

function getOrCreate_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function setHdr_(sh, headers) {
  var r = sh.getRange(1, 1, 1, headers.length);
  r.setValues([headers]);
  r.setFontWeight('bold');
  r.setBackground('#1a73e8');
  r.setFontColor('#ffffff');
  sh.setFrozenRows(1);
}

function cfg_(ss, key) {
  var sh = ss.getSheetByName(GS.TABS.CONFIG);
  if (!sh) return '';
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === key) {
      return String(data[i][1] == null ? '' : data[i][1]).trim();
    }
  }
  return '';
}

function isTrue_(v) {
  if (v === true) return true;
  var s = String(v || '').toLowerCase();
  return s === 'true' || s === '1' || s === 'yes' || s === 'ya';
}

function alert_(msg) {
  SpreadsheetApp.getUi().alert(msg);
}
