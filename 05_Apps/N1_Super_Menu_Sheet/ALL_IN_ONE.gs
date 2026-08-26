/**
 * N1 Super Menu Sheet — ALL_IN_ONE.gs

// =========================
// HELPER: getSpreadsheet_ — works for both bound & standalone
// =========================
function getSpreadsheet_() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) return ss;
  } catch (e) {}
  var id = PropertiesService.getUserProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID belum di-set. Bound script ke Sheet, atau panggil setSpreadsheetId_(<ID>).');
  return SpreadsheetApp.openById(id);
}
function setSpreadsheetId_(id) {
  PropertiesService.getUserProperties().setProperty('SPREADSHEET_ID', id);
}

 * Kemasan: SHEET_ENGINE | v1.0.0
 * Bound ke Spreadsheet aktif.
 */

var SM = {
  MENU: '🚀 Super Menu',
  TZ: 'Asia/Jakarta',
  TABS: {
    CONFIG: 'CONFIG',
    DATA: 'DATA',
    ARSIP: 'ARSIP',
    LOG: 'LOG_OPS',
    DASH: 'DASHBOARD'
  },
  // Kolom DATA (index 0-based setelah header)
  HEADERS: [
    'id', 'kode', 'nama', 'email', 'status', 'kategori',
    'tanggal', 'jumlah', 'catatan', 'created_at', 'updated_at', 'is_deleted'
  ],
  REQUIRED: ['nama', 'status'],
  STATUS_OK: ['baru', 'proses', 'selesai', 'batal'],
  KEY_DUP: 'kode', // kolom kunci deteksi duplikat
  COLOR_ERR: '#fad2cf',
  COLOR_DUP: '#fef0c7',
  COLOR_OK_HDR: '#1a73e8'
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu(SM.MENU)
    .addItem('1) Setup / perbaiki skema', 'setupSuperMenu')
    .addSeparator()
    .addItem('Validasi baris aktif', 'opValidate')
    .addItem('Tandai duplikat (kolom kunci)', 'opMarkDuplicates')
    .addItem('Generate ID untuk baris kosong', 'opGenerateIds')
    .addItem('Arsipkan status = selesai', 'opArchiveDone')
    .addItem('Rebuild dashboard', 'opRebuildDashboard')
    .addSeparator()
    .addItem('Bersihkan highlight DATA', 'opClearHighlights')
    .addItem('Isi data sample', 'seedSampleData')
    .addToUi();
}

// ═══════════════════════════════════════
// SETUP
// ═══════════════════════════════════════

function setupSuperMenu() {
  var ss = getSpreadsheet_();
  try {
    ss.rename('Super Menu Sheet — N1');
  } catch (e) {}

  ensureConfig_(ss);
  ensureDataSheet_(ss, SM.TABS.DATA);
  ensureDataSheet_(ss, SM.TABS.ARSIP);
  ensureLog_(ss);
  ensureDash_(ss);
  seedSampleData(true);

  var def = ss.getSheetByName('Sheet1');
  if (def && ss.getSheets().length > 1) {
    try { ss.deleteSheet(def); } catch (e) {}
  }

  logOps_(ss, 'setup', 'OK', 'Skema siap');
  ss.toast('Setup Super Menu selesai', 'N1', 5);
  onOpen();
}

function ensureConfig_(ss) {
  var sh = getOrCreate_(ss, SM.TABS.CONFIG);
  sh.clear();
  setHeader_(sh, ['key', 'value', 'catatan']);
  var rows = [
    ['timezone', SM.TZ, ''],
    ['required_fields', SM.REQUIRED.join(','), 'Pisahkan koma'],
    ['status_whitelist', SM.STATUS_OK.join(','), 'Status valid'],
    ['duplicate_key', SM.KEY_DUP, 'Kolom unik untuk cek duplikat'],
    ['archive_status', 'selesai', 'Status yang dipindah ke ARSIP'],
    ['email_validate', 'TRUE', 'Validasi format email jika terisi'],
    ['org_name', 'Unit Saya', '']
  ];
  sh.getRange(2, 1, rows.length, 3).setValues(rows);
  sh.setColumnWidth(1, 160);
  sh.setColumnWidth(2, 280);
  sh.setColumnWidth(3, 320);
}

function ensureDataSheet_(ss, name) {
  var sh = getOrCreate_(ss, name);
  if (sh.getLastRow() === 0 || String(sh.getRange(1, 1).getValue()) !== 'id') {
    sh.clear();
    setHeader_(sh, SM.HEADERS);
  }
}

function ensureLog_(ss) {
  var sh = getOrCreate_(ss, SM.TABS.LOG);
  if (sh.getLastRow() === 0) {
    setHeader_(sh, ['id', 'waktu', 'operasi', 'status', 'detail', 'user']);
  }
}

function ensureDash_(ss) {
  var sh = getOrCreate_(ss, SM.TABS.DASH);
  sh.clear();
  setHeader_(sh, ['metrik', 'nilai', 'updated_at']);
}

function seedSampleData(silent) {
  var ss = getSpreadsheet_();
  var sh = ss.getSheetByName(SM.TABS.DATA);
  if (!sh) return;
  if (sh.getLastRow() > 1 && silent) return;

  clearData_(sh);
  var tz = cfg_(ss, 'timezone') || SM.TZ;
  var now = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm:ss');
  var today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');

  var rows = [
    [Utilities.getUuid(), 'TRX-001', 'Budi Santoso', 'budi@example.com', 'baru', 'umum', today, 2, 'Contoh', now, now, false],
    [Utilities.getUuid(), 'TRX-002', 'Siti Aminah', 'siti-salah', 'proses', 'it', today, 1, 'Email invalid sample', now, now, false],
    ['', 'TRX-003', 'Andi', 'andi@example.com', 'selesai', 'umum', today, 5, 'Siap arsip', now, now, false],
    [Utilities.getUuid(), 'TRX-002', 'Duplikat Kode', 'x@y.com', 'baru', 'umum', today, 1, 'Sengaja duplikat kode', now, now, false],
    [Utilities.getUuid(), '', '', '', 'aneh', '', today, 0, 'Invalid banyak', now, now, false]
  ];
  sh.getRange(2, 1, rows.length, SM.HEADERS.length).setValues(rows);
  if (!silent) ss.toast('Sample diisi', 'N1', 4);
}

// ═══════════════════════════════════════
// OPERATIONS
// ═══════════════════════════════════════

function opValidate() {
  var ss = getSpreadsheet_();
  var sh = ss.getSheetByName(SM.TABS.DATA);
  opClearHighlights(true);

  var data = _objects_(sh);
  var required = (cfg_(ss, 'required_fields') || 'nama,status').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  var statuses = (cfg_(ss, 'status_whitelist') || '').split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
  var checkEmail = isTrue_(cfg_(ss, 'email_validate'));

  var errors = 0;
  data.forEach(function (row) {
    if (isTrue_(row.is_deleted)) return;
    var badCols = [];

    required.forEach(function (f) {
      if (row[f] === '' || row[f] == null) badCols.push(f);
    });

    if (row.status !== '' && statuses.length && statuses.indexOf(String(row.status).toLowerCase()) === -1) {
      badCols.push('status');
    }

    if (checkEmail && row.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(row.email).trim())) {
        badCols.push('email');
      }
    }

    if (badCols.length) {
      errors++;
      badCols.forEach(function (f) {
        var col = SM.HEADERS.indexOf(f) + 1;
        if (col > 0) sh.getRange(row.__row, col).setBackground(SM.COLOR_ERR);
      });
    }
  });

  logOps_(ss, 'validate', errors ? 'WARN' : 'OK', errors + ' baris bermasalah (di-highlight)');
  ui_(ss, 'Validasi', errors ? (errors + ' baris punya masalah. Sel merah = field bermasalah.') : 'Semua baris aktif lolos validasi.');
}

function opMarkDuplicates() {
  var ss = getSpreadsheet_();
  var sh = ss.getSheetByName(SM.TABS.DATA);
  var key = cfg_(ss, 'duplicate_key') || SM.KEY_DUP;
  var col = SM.HEADERS.indexOf(key) + 1;
  if (col < 1) {
    ui_(ss, 'Error', 'Kolom kunci tidak ada: ' + key);
    return;
  }

  var data = _objects_(sh);
  var map = {};
  data.forEach(function (row) {
    if (isTrue_(row.is_deleted)) return;
    var v = String(row[key] == null ? '' : row[key]).trim();
    if (!v) return;
    if (!map[v]) map[v] = [];
    map[v].push(row.__row);
  });

  var dupCount = 0;
  Object.keys(map).forEach(function (k) {
    if (map[k].length > 1) {
      map[k].forEach(function (r) {
        sh.getRange(r, col).setBackground(SM.COLOR_DUP);
        dupCount++;
      });
    }
  });

  logOps_(ss, 'duplicates', dupCount ? 'WARN' : 'OK', 'Highlight duplikat pada kolom ' + key + ': ' + dupCount + ' sel');
  ui_(ss, 'Duplikat', dupCount ? (dupCount + ' sel ditandai (kuning) pada kolom "' + key + '".') : 'Tidak ada duplikat.');
}

function opGenerateIds() {
  var ss = getSpreadsheet_();
  var sh = ss.getSheetByName(SM.TABS.DATA);
  var tz = cfg_(ss, 'timezone') || SM.TZ;
  var now = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm:ss');
  var last = sh.getLastRow();
  if (last < 2) {
    ui_(ss, 'ID', 'Tidak ada data.');
    return;
  }
  var vals = sh.getRange(2, 1, last - 1, 1).getValues();
  var n = 0;
  for (var i = 0; i < vals.length; i++) {
    if (!vals[i][0]) {
      sh.getRange(i + 2, 1).setValue(Utilities.getUuid());
      var updCol = SM.HEADERS.indexOf('updated_at') + 1;
      if (updCol > 0) sh.getRange(i + 2, updCol).setValue(now);
      n++;
    }
  }
  logOps_(ss, 'generate_id', 'OK', n + ' id dibuat');
  ui_(ss, 'Generate ID', n + ' baris mendapat ID baru.');
}

function opArchiveDone() {
  var ss = getSpreadsheet_();
  var ui = SpreadsheetApp.getUi();
  var conf = ui.alert(
    'Arsipkan?',
    'Pindahkan semua baris DATA dengan status arsip ke tab ARSIP?',
    ui.ButtonSet.YES_NO
  );
  if (conf !== ui.Button.YES) return;

  var sh = ss.getSheetByName(SM.TABS.DATA);
  var ar = ss.getSheetByName(SM.TABS.ARSIP);
  var want = String(cfg_(ss, 'archive_status') || 'selesai').toLowerCase();
  var data = _objects_(sh);
  var moved = 0;

  // proses dari bawah agar delete row aman
  data.sort(function (a, b) { return b.__row - a.__row; });

  data.forEach(function (row) {
    if (isTrue_(row.is_deleted)) return;
    if (String(row.status || '').toLowerCase() !== want) return;
    var values = SM.HEADERS.map(function (h) { return row[h]; });
    ar.appendRow(values);
    sh.deleteRow(row.__row);
    moved++;
  });

  logOps_(ss, 'archive', 'OK', moved + ' baris diarsipkan (status=' + want + ')');
  opRebuildDashboard(true);
  ui_(ss, 'Arsip', moved + ' baris dipindah ke ARSIP.');
}

function opRebuildDashboard(silent) {
  var ss = getSpreadsheet_();
  var sh = ss.getSheetByName(SM.TABS.DATA);
  var dash = ss.getSheetByName(SM.TABS.DASH);
  var tz = cfg_(ss, 'timezone') || SM.TZ;
  var now = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm:ss');
  var data = _objects_(sh).filter(function (r) { return !isTrue_(r.is_deleted); });

  var byStatus = {};
  var totalJumlah = 0;
  data.forEach(function (r) {
    var st = String(r.status || '(kosong)');
    byStatus[st] = (byStatus[st] || 0) + 1;
    totalJumlah += toNum_(r.jumlah);
  });

  dash.clear();
  setHeader_(dash, ['metrik', 'nilai', 'updated_at']);
  var out = [
    ['total_baris_aktif', data.length, now],
    ['total_jumlah', totalJumlah, now]
  ];
  Object.keys(byStatus).sort().forEach(function (k) {
    out.push(['status:' + k, byStatus[k], now]);
  });
  var ar = ss.getSheetByName(SM.TABS.ARSIP);
  out.push(['total_arsip', Math.max(0, ar.getLastRow() - 1), now]);

  if (out.length) dash.getRange(2, 1, out.length, 3).setValues(out);

  logOps_(ss, 'dashboard', 'OK', 'Rebuild ' + out.length + ' metrik');
  if (!silent) ui_(ss, 'Dashboard', 'DASHBOARD diperbarui (' + out.length + ' metrik).');
}

function opClearHighlights(silent) {
  var ss = getSpreadsheet_();
  var sh = ss.getSheetByName(SM.TABS.DATA);
  var last = sh.getLastRow();
  var cols = sh.getLastColumn();
  if (last >= 2 && cols >= 1) {
    sh.getRange(2, 1, last - 1, cols).setBackground(null);
  }
  if (!silent) {
    logOps_(ss, 'clear_highlight', 'OK', '');
    ss.toast('Highlight dibersihkan', 'N1', 3);
  }
}

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════

function getOrCreate_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function setHeader_(sh, headers) {
  var r = sh.getRange(1, 1, 1, headers.length);
  r.setValues([headers]);
  r.setFontWeight('bold');
  r.setBackground(SM.COLOR_OK_HDR);
  r.setFontColor('#ffffff');
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, Math.min(headers.length, 8));
}

function clearData_(sh) {
  var last = sh.getLastRow();
  if (last > 1) sh.getRange(2, 1, last - 1, sh.getLastColumn()).clearContent();
}

function cfg_(ss, key) {
  var sh = ss.getSheetByName(SM.TABS.CONFIG);
  if (!sh) return '';
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === key) return String(data[i][1] == null ? '' : data[i][1]).trim();
  }
  return '';
}

function _objects_(sh) {
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0].map(function (h) { return String(h || '').trim(); });
  var out = [];
  for (var r = 1; r < values.length; r++) {
    var empty = true;
    for (var c = 0; c < values[r].length; c++) {
      if (values[r][c] !== '' && values[r][c] != null) { empty = false; break; }
    }
    if (empty) continue;
    var obj = { __row: r + 1 };
    headers.forEach(function (h, i) {
      if (!h) return;
      obj[h] = values[r][i];
    });
    out.push(obj);
  }
  return out;
}

function logOps_(ss, op, status, detail) {
  var sh = ss.getSheetByName(SM.TABS.LOG);
  if (!sh) return;
  var tz = cfg_(ss, 'timezone') || SM.TZ;
  var user = '';
  try { user = Session.getActiveUser().getEmail(); } catch (e) {}
  sh.appendRow([
    Utilities.getUuid().slice(0, 8),
    Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm:ss'),
    op,
    status,
    detail,
    user
  ]);
}

function isTrue_(v) {
  if (v === true) return true;
  var s = String(v || '').toLowerCase();
  return s === 'true' || s === '1' || s === 'yes' || s === 'ya';
}

function toNum_(v) {
  if (typeof v === 'number') return v;
  var n = parseFloat(String(v || '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

function ui_(ss, title, msg) {
  try {
    SpreadsheetApp.getUi().alert(title, msg, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    ss.toast(msg, title, 8);
  }
}
