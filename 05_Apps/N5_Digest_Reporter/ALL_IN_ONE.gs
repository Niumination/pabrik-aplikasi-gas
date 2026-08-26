/**
 * N5 Digest Reporter — ALL_IN_ONE.gs
 * Tempel seluruh file ini ke satu Code.gs di Apps Script (opsional, ganti dua file terpisah).
 * Versi 1.0.0 | Kemasan EMAIL_REPORT
 */

/**
 * N5 Digest Reporter — setup.gs
 * Membuat tab, header, CONFIG default, data sample, dan custom menu.
 * Jalankan: setupDigestSystem
 */

var DIGEST_SETUP = {
  MENU_NAME: '📬 Digest Reporter',
  TZ: 'Asia/Jakarta',
  TABS: {
    CONFIG: 'CONFIG',
    TAMU: 'SUMBER_TAMU',
    TIKET: 'SUMBER_TIKET',
    STOK: 'SUMBER_STOK',
    TUGAS: 'SUMBER_TUGAS',
    LOG: 'LOG_KIRIM'
  }
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu(DIGEST_SETUP.MENU_NAME)
    .addItem('1) Setup / perbaiki skema', 'setupDigestSystem')
    .addItem('2) Dry-run (preview → LOG saja)', 'runDigestDryRun')
    .addItem('3) Kirim sekarang', 'runDigestNow')
    .addItem('4) Kirim paksa (abaikan cek dobel)', 'runDigestNowForce')
    .addSeparator()
    .addItem('Isi ulang data sample', 'seedDigestSampleData')
    .addItem('Tampilkan info trigger', 'showTriggerInfo')
    .addItem('Pasang trigger harian 07:30', 'installDailyTrigger')
    .addItem('Pasang trigger mingguan (Senin 07:30)', 'installWeeklyTrigger')
    .addItem('Hapus trigger Digest saja', 'removeDigestTriggers')
    .addToUi();
}

/**
 * Entry setup utama — idempotent untuk header CONFIG & struktur tab.
 */
function setupDigestSystem() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.rename('Digest Reporter — N5');

  _ensureConfig_(ss);
  _ensureTamu_(ss);
  _ensureTiket_(ss);
  _ensureStok_(ss);
  _ensureTugas_(ss);
  _ensureLog_(ss);

  seedDigestSampleData(true);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    'Setup selesai. Cek tab CONFIG, lalu jalankan Dry-run.',
    'N5 Digest',
    8
  );
  onOpen();
}

function _ensureSheet_(ss, name) {
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}

function _setHeader_(sh, headers) {
  var range = sh.getRange(1, 1, 1, headers.length);
  range.setValues([headers]);
  range.setFontWeight('bold');
  range.setBackground('#1a73e8');
  range.setFontColor('#ffffff');
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, headers.length);
}

function _ensureConfig_(ss) {
  var sh = _ensureSheet_(ss, DIGEST_SETUP.TABS.CONFIG);
  sh.clear();
  _setHeader_(sh, ['key', 'value', 'catatan']);

  var rows = [
    ['system_active', 'TRUE', 'FALSE = matikan semua kirim otomatis & manual'],
    ['dry_run', 'TRUE', 'TRUE = tidak kirim email, hanya tulis LOG_KIRIM'],
    ['timezone', 'Asia/Jakarta', 'Timezone format & jadwal'],
    ['mode', 'daily', 'daily | weekly'],
    ['weekly_day', '1', '1=Senin … 7=Minggu (hanya jika mode=weekly)'],
    ['subject_prefix', '[Digest N5]', 'Awalan subjek email'],
    ['subject_title', 'Ringkasan Operasional', 'Judul subjek'],
    ['from_name', 'Pabrik Aplikasi — Digest', 'Nama pengirim tampilan (via opsi mail)'],
    ['recipients_to', Session.getActiveUser().getEmail() || 'email.anda@gmail.com', 'Pisahkan koma untuk banyak penerima'],
    ['recipients_cc', '', 'Opsional, pisahkan koma'],
    ['reply_to', '', 'Opsional'],
    ['sheet_public_url', '', 'Link Sheet untuk tombol "Buka data" di email (Share → Copy link)'],
    ['max_table_rows', '8', 'Batas baris per tabel di email'],
    ['include_tamu', 'TRUE', 'Modul Buku Tamu'],
    ['include_tiket', 'TRUE', 'Modul Tiket open'],
    ['include_stok', 'TRUE', 'Modul Stok menipis'],
    ['include_tugas', 'TRUE', 'Modul Tugas overdue/due soon'],
    ['tugas_due_soon_days', '3', 'Tugas jatuh tempo dalam N hari ke depan ikut digabung'],
    ['stok_only_below_min', 'TRUE', 'TRUE = hanya item stok_akhir <= stok_minimum'],
    ['last_sent_date', '', 'Otomatis diisi (yyyy-MM-dd). Jangan diedit manual kecuali reset'],
    ['last_sent_status', '', 'Otomatis'],
    ['brand_color', '#1a73e8', 'Warna aksen HTML'],
    ['org_name', 'Unit Saya', 'Nama organisasi di header email'],
    ['footer_note', 'Email otomatis dari N5 Digest Reporter. Jangan balas kecuali perlu.', 'Footer']
  ];

  sh.getRange(2, 1, rows.length, 3).setValues(rows);
  sh.setColumnWidth(1, 180);
  sh.setColumnWidth(2, 320);
  sh.setColumnWidth(3, 420);
}

function _ensureTamu_(ss) {
  var sh = _ensureSheet_(ss, DIGEST_SETUP.TABS.TAMU);
  if (sh.getLastRow() === 0) {
    _setHeader_(sh, [
      'id', 'nama_tamu', 'instansi', 'keperluan', 'bertemu_dengan',
      'waktu_masuk', 'waktu_keluar', 'status', 'catatan'
    ]);
  }
}

function _ensureTiket_(ss) {
  var sh = _ensureSheet_(ss, DIGEST_SETUP.TABS.TIKET);
  if (sh.getLastRow() === 0) {
    _setHeader_(sh, [
      'id', 'kode', 'pelapor', 'kategori', 'prioritas', 'judul',
      'lokasi', 'status', 'petugas', 'tgl_lapor', 'tgl_update'
    ]);
  }
}

function _ensureStok_(ss) {
  var sh = _ensureSheet_(ss, DIGEST_SETUP.TABS.STOK);
  if (sh.getLastRow() === 0) {
    _setHeader_(sh, [
      'id', 'kode', 'nama', 'kategori', 'satuan',
      'stok_akhir', 'stok_minimum', 'lokasi_simpan'
    ]);
  }
}

function _ensureTugas_(ss) {
  var sh = _ensureSheet_(ss, DIGEST_SETUP.TABS.TUGAS);
  if (sh.getLastRow() === 0) {
    _setHeader_(sh, [
      'id', 'judul', 'assignee', 'prioritas', 'status',
      'due_date', 'label', 'catatan'
    ]);
  }
}

function _ensureLog_(ss) {
  var sh = _ensureSheet_(ss, DIGEST_SETUP.TABS.LOG);
  if (sh.getLastRow() === 0) {
    _setHeader_(sh, [
      'id', 'waktu', 'mode', 'dry_run', 'force', 'recipients',
      'subject', 'kpi_json', 'status', 'error_message', 'duration_ms'
    ]);
  }
}

/**
 * @param {boolean} [silent] — true saat dipanggil dari setup
 */
function seedDigestSampleData(silent) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tz = _cfg_(ss, 'timezone') || DIGEST_SETUP.TZ;
  var now = new Date();
  var today = Utilities.formatDate(now, tz, 'yyyy-MM-dd');
  var yesterday = Utilities.formatDate(
    new Date(now.getTime() - 24 * 60 * 60 * 1000),
    tz,
    'yyyy-MM-dd'
  );

  // TAMU
  var tamu = ss.getSheetByName(DIGEST_SETUP.TABS.TAMU);
  _clearDataRows_(tamu);
  tamu.getRange(2, 1, 4, 9).setValues([
    ['t1', 'Budi Santoso', 'PT Maju', 'Koordinasi proyek', 'Ibu Rina',
      yesterday + ' 09:15', yesterday + ' 10:00', 'sudah_keluar', ''],
    ['t2', 'Siti Aminah', 'Dinas Kominfo', 'Audiensi', 'Kepala Unit',
      today + ' 08:40', '', 'di_dalam', ''],
    ['t3', 'Andi Wijaya', 'Vendor AC', 'Servis berkala', 'Umum',
      today + ' 10:05', '', 'di_dalam', ''],
    ['t4', 'Lina Marlina', 'Mahasiswa', 'Penelitian', 'Pak Dedi',
      yesterday + ' 13:20', yesterday + ' 15:00', 'sudah_keluar', '']
  ]);

  // TIKET
  var tiket = ss.getSheetByName(DIGEST_SETUP.TABS.TIKET);
  _clearDataRows_(tiket);
  tiket.getRange(2, 1, 5, 11).setValues([
    ['k1', 'TK-001', 'Rina', 'IT', 'tinggi', 'Wi-Fi lantai 2 putus',
      'Lt.2', 'baru', '', today, today],
    ['k2', 'TK-002', 'Dedi', 'fasilitas', 'sedang', 'AC ruang rapat bocor',
      'R. Rapat', 'diproses', 'Teknisi A', yesterday, today],
    ['k3', 'TK-003', 'Sari', 'IT', 'rendah', 'Install aplikasi absensi',
      'Lt.1', 'selesai', 'TI', yesterday, yesterday],
    ['k4', 'TK-004', 'Budi', 'umum', 'tinggi', 'Kebocoran toilet',
      'Lt.3', 'baru', '', today, today],
    ['k5', 'TK-005', 'Eka', 'IT', 'sedang', 'Printer error kertas',
      'TU', 'diproses', 'TI', yesterday, today]
  ]);

  // STOK
  var stok = ss.getSheetByName(DIGEST_SETUP.TABS.STOK);
  _clearDataRows_(stok);
  stok.getRange(2, 1, 5, 8).setValues([
    ['s1', 'ATK-01', 'Kertas A4', 'ATK', 'rim', 2, 5, 'Gudang'],
    ['s2', 'ATK-02', 'Tinta Printer Hitam', 'ATK', 'buah', 1, 3, 'TU'],
    ['s3', 'ATK-03', 'Bolpen biru', 'ATK', 'box', 12, 4, 'Gudang'],
    ['s4', 'ATK-04', 'Map snellhecter', 'ATK', 'pack', 3, 3, 'Gudang'],
    ['s5', 'ATK-05', 'Spidol whiteboard', 'ATK', 'pcs', 8, 6, 'R. Rapat']
  ]);

  // TUGAS
  var tugas = ss.getSheetByName(DIGEST_SETUP.TABS.TUGAS);
  _clearDataRows_(tugas);
  var dMinus1 = yesterday;
  var dPlus1 = Utilities.formatDate(
    new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), tz, 'yyyy-MM-dd'
  );
  var dPlus2 = Utilities.formatDate(
    new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), tz, 'yyyy-MM-dd'
  );
  var dPlus10 = Utilities.formatDate(
    new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), tz, 'yyyy-MM-dd'
  );
  tugas.getRange(2, 1, 5, 8).setValues([
    ['u1', 'Kirim laporan bulanan', 'Rina', 'high', 'dikerjakan', dMinus1, 'ops', 'Terlambat'],
    ['u2', 'Review draft SOP', 'Dedi', 'med', 'backlog', dPlus1, 'sop', ''],
    ['u3', 'Order tinta printer', 'Sari', 'high', 'dikerjakan', dPlus2, 'atk', ''],
    ['u4', 'Update inventaris Q3', 'Budi', 'low', 'backlog', dPlus10, 'it', ''],
    ['u5', 'Tutup tiket Wi-Fi', 'TI', 'high', 'review', today, 'it', '']
  ]);

  // Hapus sheet default "Sheet1" jika masih ada dan kosong
  var def = ss.getSheetByName('Sheet1');
  if (def && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(def);
    } catch (e) {
      // ignore
    }
  }

  if (!silent) {
    SpreadsheetApp.getActiveSpreadsheet().toast('Data sample diisi ulang.', 'N5 Digest', 5);
  }
}

function _clearDataRows_(sh) {
  var last = sh.getLastRow();
  if (last > 1) {
    sh.getRange(2, 1, last - 1, sh.getLastColumn()).clearContent();
  }
}

/** Baca CONFIG — dipakai setup seed; implementasi penuh di Code.gs jika digabung. */
function _cfg_(ss, key) {
  var sh = ss.getSheetByName(DIGEST_SETUP.TABS.CONFIG);
  if (!sh) return '';
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === key) return String(data[i][1]).trim();
  }
  return '';
}

// ===== CODE.GS =====

// ENTRY POINTS (MENU / TRIGGER)
// =========================

/** Dry-run paksa: tidak mengirim email, tetap log. */
function runDigestDryRun() {
  _executeDigest_({ forceDryRun: true, forceSend: false, origin: 'manual_dry_run' });
}

/** Kirim sesuai CONFIG (hormati dry_run & last_sent_date). */
function runDigestNow() {
  _executeDigest_({ forceDryRun: false, forceSend: false, origin: 'manual' });
}

/** Kirim paksa: abaikan last_sent_date; tetap hormati system_active; hormati dry_run kecuali di-set false. */
function runDigestNowForce() {
  _executeDigest_({ forceDryRun: false, forceSend: true, origin: 'manual_force' });
}

/** Dipanggil trigger harian. */
function triggerDailyDigest() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var mode = String(cfgGet_(ss, 'mode') || 'daily').toLowerCase();
  if (mode !== 'daily') {
    _logOnly_(ss, {
      mode: 'daily_trigger_skip',
      status: 'SKIPPED',
      error: 'CONFIG.mode bukan daily',
      dryRun: true,
      force: false,
      recipients: '',
      subject: '',
      kpi: {},
      ms: 0
    });
    return;
  }
  _executeDigest_({ forceDryRun: false, forceSend: false, origin: 'trigger_daily' });
}

/** Dipanggil trigger mingguan — cek hari. */
function triggerWeeklyDigest() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var mode = String(cfgGet_(ss, 'mode') || 'daily').toLowerCase();
  var tz = cfgGet_(ss, 'timezone') || DIGEST_SETUP.TZ;
  var want = parseInt(cfgGet_(ss, 'weekly_day') || '1', 10); // 1=Mon .. 7=Sun
  var isoDow = _isoDayOfWeek_(new Date(), tz); // 1=Mon .. 7=Sun

  if (mode !== 'weekly') {
    _logOnly_(ss, {
      mode: 'weekly_trigger_skip',
      status: 'SKIPPED',
      error: 'CONFIG.mode bukan weekly',
      dryRun: true,
      force: false,
      recipients: '',
      subject: '',
      kpi: {},
      ms: 0
    });
    return;
  }
  if (isoDow !== want) {
    _logOnly_(ss, {
      mode: 'weekly_trigger_skip',
      status: 'SKIPPED',
      error: 'Hari ini ISO=' + isoDow + ', CONFIG.weekly_day=' + want,
      dryRun: true,
      force: false,
      recipients: '',
      subject: '',
      kpi: {},
      ms: 0
    });
    return;
  }
  _executeDigest_({ forceDryRun: false, forceSend: false, origin: 'trigger_weekly' });
}

// =========================
// CORE PIPELINE
// =========================

/**
 * @param {{forceDryRun:boolean, forceSend:boolean, origin:string}} opts
 */
function _executeDigest_(opts) {
  var t0 = Date.now();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tz = cfgGet_(ss, 'timezone') || DIGEST_SETUP.TZ;
  var today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');

  try {
    if (!_isTrue_(cfgGet_(ss, 'system_active'))) {
      _finish_(ss, {
        origin: opts.origin,
        dryRun: true,
        force: opts.forceSend,
        status: 'DISABLED',
        error: 'system_active=FALSE',
        recipients: '',
        subject: '',
        kpi: {},
        ms: Date.now() - t0
      });
      _uiAlert_('Sistem nonaktif', 'Set CONFIG system_active = TRUE untuk mengaktifkan.');
      return;
    }

    var dryRun = opts.forceDryRun || _isTrue_(cfgGet_(ss, 'dry_run'));

    // Cegah dobel kirim nyata di hari yang sama
    var lastSent = cfgGet_(ss, 'last_sent_date');
    if (!dryRun && !opts.forceSend && lastSent === today) {
      _finish_(ss, {
        origin: opts.origin,
        dryRun: dryRun,
        force: false,
        status: 'SKIPPED_DUP',
        error: 'Sudah terkirim hari ini (' + lastSent + '). Gunakan "Kirim paksa" jika perlu.',
        recipients: cfgGet_(ss, 'recipients_to'),
        subject: '',
        kpi: {},
        ms: Date.now() - t0
      });
      _uiAlert_('Dilewati', 'Digest hari ini sudah pernah dikirim. Pakai menu "Kirim paksa" untuk override.');
      return;
    }

    var payload = buildDigestPayload_(ss, tz, today);
    var subject = buildSubject_(ss, tz, today, payload);
    var html = renderDigestHtml_(ss, payload, tz, today);
    var recipients = _parseEmails_(cfgGet_(ss, 'recipients_to'));
    var cc = _parseEmails_(cfgGet_(ss, 'recipients_cc'));

    if (!recipients.length) {
      throw new Error('CONFIG.recipients_to kosong atau tidak valid.');
    }

    if (!dryRun) {
      sendDigestEmail_(ss, recipients, cc, subject, html);
      cfgSet_(ss, 'last_sent_date', today);
      cfgSet_(ss, 'last_sent_status', 'SENT');
    } else {
      cfgSet_(ss, 'last_sent_status', 'DRY_RUN');
    }

    _finish_(ss, {
      origin: opts.origin,
      dryRun: dryRun,
      force: opts.forceSend,
      status: dryRun ? 'DRY_RUN_OK' : 'SENT',
      error: '',
      recipients: recipients.concat(cc).join(', '),
      subject: subject,
      kpi: payload.kpi,
      ms: Date.now() - t0
    });

    // Simpan preview HTML di DocumentProperties? Lebih aman: toast + log
    if (dryRun) {
      _uiAlert_(
        'Dry-run OK',
        'Email TIDAK dikirim.\nSubject: ' + subject +
        '\nKPI: ' + JSON.stringify(payload.kpi) +
        '\nCek LOG_KIRIM untuk jejak.\nMatikan dry_run di CONFIG untuk kirim nyata.'
      );
    } else {
      _uiAlert_('Terkirim', 'Digest dikirim ke: ' + recipients.join(', '));
    }
  } catch (err) {
    _finish_(ss, {
      origin: opts.origin || 'unknown',
      dryRun: !!opts.forceDryRun,
      force: !!opts.forceSend,
      status: 'ERROR',
      error: String(err && err.message ? err.message : err),
      recipients: cfgGet_(ss, 'recipients_to'),
      subject: '',
      kpi: {},
      ms: Date.now() - t0
    });
    cfgSet_(ss, 'last_sent_status', 'ERROR');
    _uiAlert_('Gagal', String(err && err.message ? err.message : err));
    throw err;
  }
}

// =========================
// COLLECTORS
// =========================

function buildDigestPayload_(ss, tz, today) {
  var sections = [];
  var kpi = {
    date: today,
    tamu_hari_ini: 0,
    tamu_masih_di_dalam: 0,
    tiket_open: 0,
    tiket_tinggi_open: 0,
    stok_menipis: 0,
    tugas_perlu_aksi: 0
  };
  var actionNeeded = 0;

  if (_isTrue_(cfgGet_(ss, 'include_tamu'))) {
    var tamu = collectTamu_(ss, tz, today);
    kpi.tamu_hari_ini = tamu.kpi.hari_ini;
    kpi.tamu_masih_di_dalam = tamu.kpi.di_dalam;
    actionNeeded += tamu.kpi.di_dalam;
    sections.push(tamu.section);
  }

  if (_isTrue_(cfgGet_(ss, 'include_tiket'))) {
    var tiket = collectTiket_(ss);
    kpi.tiket_open = tiket.kpi.open;
    kpi.tiket_tinggi_open = tiket.kpi.tinggi;
    actionNeeded += tiket.kpi.open;
    sections.push(tiket.section);
  }

  if (_isTrue_(cfgGet_(ss, 'include_stok'))) {
    var stok = collectStok_(ss);
    kpi.stok_menipis = stok.kpi.menipis;
    actionNeeded += stok.kpi.menipis;
    sections.push(stok.section);
  }

  if (_isTrue_(cfgGet_(ss, 'include_tugas'))) {
    var tugas = collectTugas_(ss, tz, today);
    kpi.tugas_perlu_aksi = tugas.kpi.perlu_aksi;
    actionNeeded += tugas.kpi.perlu_aksi;
    sections.push(tugas.section);
  }

  kpi.action_needed_total = actionNeeded;

  return {
    kpi: kpi,
    sections: sections,
    org: cfgGet_(ss, 'org_name') || 'Organisasi',
    footer: cfgGet_(ss, 'footer_note') || '',
    sheetUrl: cfgGet_(ss, 'sheet_public_url') || ss.getUrl(),
    brand: cfgGet_(ss, 'brand_color') || '#1a73e8'
  };
}

function collectTamu_(ss, tz, today) {
  var rows = _sheetObjects_(ss, DIGEST_SETUP.TABS.TAMU);
  var hariIni = [];
  var diDalam = [];

  rows.forEach(function (r) {
    var masuk = String(r.waktu_masuk || '');
    var tgl = masuk.length >= 10 ? masuk.substring(0, 10) : '';
    var status = String(r.status || '').toLowerCase();
    if (tgl === today) hariIni.push(r);
    if (status === 'di_dalam' || status === 'inside' || status === 'in') diDalam.push(r);
  });

  var max = _maxRows_(ss);
  var show = diDalam.length ? diDalam : hariIni;
  show = show.slice(0, max);

  var headers = ['Nama', 'Instansi', 'Keperluan', 'Bertemu', 'Masuk', 'Status'];
  var body = show.map(function (r) {
    return [
      r.nama_tamu, r.instansi, r.keperluan, r.bertemu_dengan,
      r.waktu_masuk, r.status
    ];
  });

  return {
    kpi: { hari_ini: hariIni.length, di_dalam: diDalam.length },
    section: {
      id: 'tamu',
      title: 'Buku Tamu',
      subtitle: hariIni.length + ' tamu hari ini · ' + diDalam.length + ' masih di dalam',
      tone: diDalam.length ? 'warn' : 'ok',
      headers: headers,
      rows: body,
      emptyText: 'Tidak ada tamu yang perlu diperhatikan.'
    }
  };
}

function collectTiket_(ss) {
  var rows = _sheetObjects_(ss, DIGEST_SETUP.TABS.TIKET);
  var openStatuses = { baru: 1, diproses: 1, open: 1, progress: 1, 'in_progress': 1 };
  var open = rows.filter(function (r) {
    return openStatuses[String(r.status || '').toLowerCase()];
  });
  // prioritas: tinggi dulu
  open.sort(function (a, b) {
    return _prioWeight_(b.prioritas) - _prioWeight_(a.prioritas);
  });
  var tinggi = open.filter(function (r) {
    var p = String(r.prioritas || '').toLowerCase();
    return p === 'tinggi' || p === 'high' || p === 'urgent';
  });

  var max = _maxRows_(ss);
  var show = open.slice(0, max);
  var headers = ['Kode', 'Judul', 'Kategori', 'Prioritas', 'Status', 'Pelapor', 'Tgl'];
  var body = show.map(function (r) {
    return [r.kode, r.judul, r.kategori, r.prioritas, r.status, r.pelapor, r.tgl_lapor];
  });

  return {
    kpi: { open: open.length, tinggi: tinggi.length },
    section: {
      id: 'tiket',
      title: 'Tiket Keluhan (Open)',
      subtitle: open.length + ' open · ' + tinggi.length + ' prioritas tinggi',
      tone: tinggi.length ? 'danger' : open.length ? 'warn' : 'ok',
      headers: headers,
      rows: body,
      emptyText: 'Tidak ada tiket open. Bagus!'
    }
  };
}

function collectStok_(ss) {
  var rows = _sheetObjects_(ss, DIGEST_SETUP.TABS.STOK);
  var onlyBelow = _isTrue_(cfgGet_(ss, 'stok_only_below_min'));
  var list = rows.filter(function (r) {
    var akhir = _toNum_(r.stok_akhir);
    var min = _toNum_(r.stok_minimum);
    if (onlyBelow) return akhir <= min;
    return true;
  });
  list.sort(function (a, b) {
    return _toNum_(a.stok_akhir) - _toNum_(b.stok_akhir);
  });

  var menipis = rows.filter(function (r) {
    return _toNum_(r.stok_akhir) <= _toNum_(r.stok_minimum);
  }).length;

  var max = _maxRows_(ss);
  var show = (onlyBelow ? list : rows.filter(function (r) {
    return _toNum_(r.stok_akhir) <= _toNum_(r.stok_minimum);
  })).slice(0, max);

  var headers = ['Kode', 'Nama', 'Stok', 'Minimum', 'Satuan', 'Lokasi'];
  var body = show.map(function (r) {
    return [r.kode, r.nama, r.stok_akhir, r.stok_minimum, r.satuan, r.lokasi_simpan];
  });

  return {
    kpi: { menipis: menipis },
    section: {
      id: 'stok',
      title: 'Stok Menipis',
      subtitle: menipis + ' item di bawah / sama dengan minimum',
      tone: menipis ? 'danger' : 'ok',
      headers: headers,
      rows: body,
      emptyText: 'Semua stok di atas minimum.'
    }
  };
}

function collectTugas_(ss, tz, today) {
  var rows = _sheetObjects_(ss, DIGEST_SETUP.TABS.TUGAS);
  var soonDays = parseInt(cfgGet_(ss, 'tugas_due_soon_days') || '3', 10);
  var todayDate = _parseYmd_(today);
  var doneStatuses = { selesai: 1, done: 1, closed: 1, complete: 1, completed: 1 };

  var need = rows.filter(function (r) {
    var st = String(r.status || '').toLowerCase();
    if (doneStatuses[st]) return false;
    var dueStr = _asYmd_(r.due_date, tz);
    if (!dueStr) return false;
    var due = _parseYmd_(dueStr);
    var diff = Math.floor((due - todayDate) / (24 * 60 * 60 * 1000));
    // overdue atau due soon
    return diff <= soonDays;
  });

  need.sort(function (a, b) {
    return String(_asYmd_(a.due_date, tz)).localeCompare(String(_asYmd_(b.due_date, tz)));
  });

  var max = _maxRows_(ss);
  var show = need.slice(0, max);
  var headers = ['Judul', 'Assignee', 'Prioritas', 'Status', 'Due', 'Label'];
  var body = show.map(function (r) {
    return [r.judul, r.assignee, r.prioritas, r.status, _asYmd_(r.due_date, tz), r.label];
  });

  return {
    kpi: { perlu_aksi: need.length },
    section: {
      id: 'tugas',
      title: 'Tugas Overdue / Jatuh Tempo Dekat',
      subtitle: need.length + ' tugas perlu perhatian (≤ ' + soonDays + ' hari)',
      tone: need.length ? 'warn' : 'ok',
      headers: headers,
      rows: body,
      emptyText: 'Tidak ada tugas jatuh tempo dalam window.'
    }
  };
}

// =========================
// HTML EMAIL
// =========================

function buildSubject_(ss, tz, today, payload) {
  var prefix = cfgGet_(ss, 'subject_prefix') || '[Digest]';
  var title = cfgGet_(ss, 'subject_title') || 'Ringkasan Operasional';
  var n = payload.kpi.action_needed_total || 0;
  return prefix + ' ' + title + ' · ' + today + ' · ' + n + ' item perlu tindakan';
}

function renderDigestHtml_(ss, payload, tz, today) {
  var brand = payload.brand || '#1a73e8';
  var kpi = payload.kpi;
  var cards = [
    { label: 'Tamu hari ini', value: kpi.tamu_hari_ini, hint: (kpi.tamu_masih_di_dalam || 0) + ' di dalam' },
    { label: 'Tiket open', value: kpi.tiket_open, hint: (kpi.tiket_tinggi_open || 0) + ' tinggi' },
    { label: 'Stok menipis', value: kpi.stok_menipis, hint: '≤ minimum' },
    { label: 'Tugas perlu aksi', value: kpi.tugas_perlu_aksi, hint: 'overdue/soon' }
  ];

  var cardsHtml = cards.map(function (c) {
    return (
      '<td style="width:25%;padding:8px;">' +
      '<div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:12px 10px;text-align:center;">' +
      '<div style="font-size:11px;color:#5f6368;text-transform:uppercase;letter-spacing:.3px;">' + _esc_(c.label) + '</div>' +
      '<div style="font-size:26px;font-weight:700;color:#202124;margin:6px 0 2px;">' + _esc_(String(c.value)) + '</div>' +
      '<div style="font-size:11px;color:#80868b;">' + _esc_(c.hint) + '</div>' +
      '</div></td>'
    );
  }).join('');

  var sectionsHtml = payload.sections.map(function (sec) {
    return _renderSection_(sec, brand);
  }).join('');

  var btn = payload.sheetUrl
    ? '<a href="' + _escAttr_(payload.sheetUrl) + '" style="display:inline-block;background:' +
      _escAttr_(brand) + ';color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600;font-size:14px;">Buka Spreadsheet</a>'
    : '';

  return (
    '<!DOCTYPE html><html><head><meta charset="utf-8"/>' +
    '<meta name="viewport" content="width=device-width,initial-scale=1"/>' +
    '<title>Digest</title></head>' +
    '<body style="margin:0;padding:0;background:#f1f3f4;font-family:Arial,Helvetica,sans-serif;color:#202124;">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f3f4;padding:24px 12px;">' +
    '<tr><td align="center">' +
    '<table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8eaed;">' +
    // header
    '<tr><td style="background:' + _escAttr_(brand) + ';padding:20px 24px;">' +
    '<div style="color:#fff;font-size:13px;opacity:.9;">' + _esc_(payload.org) + '</div>' +
    '<div style="color:#fff;font-size:22px;font-weight:700;margin-top:4px;">Ringkasan Operasional</div>' +
    '<div style="color:#e8f0fe;font-size:13px;margin-top:6px;">' + _esc_(today) + ' · ' + _esc_(tz) +
    ' · ' + _esc_(String(kpi.action_needed_total || 0)) + ' item perlu tindakan</div>' +
    '</td></tr>' +
    // kpi
    '<tr><td style="padding:16px 12px 8px;background:#fafafa;">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>' + cardsHtml + '</tr></table>' +
    '</td></tr>' +
    // sections
    '<tr><td style="padding:8px 20px 20px;">' + sectionsHtml + '</td></tr>' +
    // cta
    '<tr><td style="padding:0 24px 24px;text-align:center;">' + btn + '</td></tr>' +
    // footer
    '<tr><td style="padding:16px 24px;background:#f8f9fa;border-top:1px solid #e8eaed;font-size:12px;color:#5f6368;line-height:1.5;">' +
    _esc_(payload.footer) +
    '<br/><span style="color:#9aa0a6;">Generated by N5 Digest Reporter · Pabrik Aplikasi</span>' +
    '</td></tr>' +
    '</table></td></tr></table></body></html>'
  );
}

function _renderSection_(sec, brand) {
  var bar =
    sec.tone === 'danger' ? '#d93025' :
    sec.tone === 'warn' ? '#f9ab00' : '#1e8e3e';

  var table;
  if (!sec.rows || !sec.rows.length) {
    table = '<div style="padding:12px 14px;color:#5f6368;font-size:13px;background:#f8f9fa;border-radius:8px;">' +
      _esc_(sec.emptyText || 'Tidak ada data.') + '</div>';
  } else {
    var th = sec.headers.map(function (h) {
      return '<th style="text-align:left;padding:8px 10px;font-size:11px;color:#5f6368;border-bottom:2px solid #e8eaed;text-transform:uppercase;">' +
        _esc_(h) + '</th>';
    }).join('');
    var trs = sec.rows.map(function (row, idx) {
      var bg = idx % 2 === 0 ? '#ffffff' : '#fafafa';
      var tds = row.map(function (cell) {
        return '<td style="padding:8px 10px;font-size:13px;border-bottom:1px solid #f0f0f0;vertical-align:top;">' +
          _esc_(cell == null ? '' : String(cell)) + '</td>';
      }).join('');
      return '<tr style="background:' + bg + ';">' + tds + '</tr>';
    }).join('');
    table = '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e8eaed;border-radius:8px;overflow:hidden;">' +
      '<tr style="background:#f8f9fa;">' + th + '</tr>' + trs + '</table>';
  }

  return (
    '<div style="margin-top:18px;">' +
    '<div style="border-left:4px solid ' + bar + ';padding-left:12px;margin-bottom:10px;">' +
    '<div style="font-size:16px;font-weight:700;color:#202124;">' + _esc_(sec.title) + '</div>' +
    '<div style="font-size:12px;color:#5f6368;margin-top:2px;">' + _esc_(sec.subtitle || '') + '</div>' +
    '</div>' + table + '</div>'
  );
}

function sendDigestEmail_(ss, recipients, cc, subject, html) {
  var options = {
    htmlBody: html,
    name: cfgGet_(ss, 'from_name') || 'Digest Reporter'
  };
  var reply = cfgGet_(ss, 'reply_to');
  if (reply) options.replyTo = reply;
  if (cc && cc.length) options.cc = cc.join(',');

  // MailApp lebih sederhana untuk bound script; kuota harian perlu diingat
  MailApp.sendEmail(recipients.join(','), subject, _stripHtml_(html), options);
}

// =========================
// TRIGGERS
// =========================

function installDailyTrigger() {
  removeDigestTriggers(true);
  ScriptApp.newTrigger('triggerDailyDigest')
    .timeBased()
    .everyDays(1)
    .atHour(7)
    .nearMinute(30)
    .inTimezone(cfgGet_(SpreadsheetApp.getActiveSpreadsheet(), 'timezone') || DIGEST_SETUP.TZ)
    .create();
  _uiAlert_('Trigger harian', 'Dipasang: triggerDailyDigest sekitar jam 07:30 timezone CONFIG.\nPastikan mode=daily & dry_run=FALSE saat produksi.');
}

function installWeeklyTrigger() {
  removeDigestTriggers(true);
  // Apps Script weekly: Monday=... gunakan everyWeeks + cek hari di handler
  // Lebih andal: daily trigger yang memanggil weekly handler, ATAU everyWeeks on Monday
  var tz = cfgGet_(SpreadsheetApp.getActiveSpreadsheet(), 'timezone') || DIGEST_SETUP.TZ;
  ScriptApp.newTrigger('triggerWeeklyDigest')
    .timeBased()
    .everyDays(1)
    .atHour(7)
    .nearMinute(30)
    .inTimezone(tz)
    .create();
  // Handler sudah filter weekly_day
  cfgSet_(SpreadsheetApp.getActiveSpreadsheet(), 'mode', 'weekly');
  _uiAlert_('Trigger mingguan', 'Dipasang pemeriksaan harian jam ~07:30; email hanya terkirim saat ISO day = CONFIG.weekly_day.\nmode di-set ke weekly.');
}

/**
 * @param {boolean} [silent]
 */
function removeDigestTriggers(silent) {
  var keep = {
    triggerDailyDigest: 1,
    triggerWeeklyDigest: 1
  };
  var triggers = ScriptApp.getProjectTriggers();
  var removed = 0;
  triggers.forEach(function (t) {
    if (keep[t.getHandlerFunction()]) {
      ScriptApp.deleteTrigger(t);
      removed++;
    }
  });
  if (!silent) {
    _uiAlert_('Trigger', 'Dihapus ' + removed + ' trigger Digest.');
  }
}

function showTriggerInfo() {
  var triggers = ScriptApp.getProjectTriggers();
  var lines = triggers.map(function (t) {
    return '- ' + t.getHandlerFunction() + ' (' + t.getEventType() + ')';
  });
  if (!lines.length) lines = ['(tidak ada trigger)'];
  _uiAlert_('Trigger terpasang', lines.join('\n'));
}

// =========================
// CONFIG + LOG + UTILS
// =========================

function cfgGet_(ss, key) {
  var sh = ss.getSheetByName(DIGEST_SETUP.TABS.CONFIG);
  if (!sh) throw new Error('Tab CONFIG tidak ada. Jalankan setupDigestSystem.');
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === key) {
      var v = data[i][1];
      if (Object.prototype.toString.call(v) === '[object Date]') {
        return Utilities.formatDate(v, cfgGetTimezoneSafe_(data), 'yyyy-MM-dd');
      }
      return String(v == null ? '' : v).trim();
    }
  }
  return '';
}

function cfgGetTimezoneSafe_(data) {
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === 'timezone') return String(data[i][1] || DIGEST_SETUP.TZ);
  }
  return DIGEST_SETUP.TZ;
}

function cfgSet_(ss, key, value) {
  var sh = ss.getSheetByName(DIGEST_SETUP.TABS.CONFIG);
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === key) {
      sh.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  sh.appendRow([key, value, 'auto-added']);
}

function _finish_(ss, info) {
  _logOnly_(ss, {
    mode: info.origin,
    dryRun: info.dryRun,
    force: info.force,
    recipients: info.recipients,
    subject: info.subject,
    kpi: info.kpi,
    status: info.status,
    error: info.error,
    ms: info.ms
  });
}

function _logOnly_(ss, info) {
  var sh = ss.getSheetByName(DIGEST_SETUP.TABS.LOG);
  if (!sh) return;
  var tz = DIGEST_SETUP.TZ;
  try {
    tz = cfgGet_(ss, 'timezone') || tz;
  } catch (e) {}
  var id = Utilities.getUuid().slice(0, 8);
  var waktu = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm:ss');
  sh.appendRow([
    id,
    waktu,
    info.mode || '',
    info.dryRun ? 'TRUE' : 'FALSE',
    info.force ? 'TRUE' : 'FALSE',
    info.recipients || '',
    info.subject || '',
    JSON.stringify(info.kpi || {}),
    info.status || '',
    info.error || '',
    info.ms || 0
  ]);
}

function _sheetObjects_(ss, name) {
  var sh = ss.getSheetByName(name);
  if (!sh) return [];
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0].map(function (h) {
    return String(h || '').trim();
  });
  var out = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    // skip empty id/first col fully empty
    var empty = true;
    for (var c = 0; c < row.length; c++) {
      if (row[c] !== '' && row[c] != null) {
        empty = false;
        break;
      }
    }
    if (empty) continue;
    var obj = {};
    for (var i = 0; i < headers.length; i++) {
      var key = headers[i];
      if (!key) continue;
      var val = row[i];
      if (Object.prototype.toString.call(val) === '[object Date]') {
        val = Utilities.formatDate(val, cfgGet_(ss, 'timezone') || DIGEST_SETUP.TZ, 'yyyy-MM-dd HH:mm:ss');
      }
      obj[key] = val;
    }
    out.push(obj);
  }
  return out;
}

function _maxRows_(ss) {
  var n = parseInt(cfgGet_(ss, 'max_table_rows') || '8', 10);
  if (isNaN(n) || n < 1) n = 8;
  if (n > 30) n = 30;
  return n;
}

function _isTrue_(v) {
  var s = String(v || '').trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'yes' || s === 'y' || s === 'ya';
}

function _parseEmails_(raw) {
  return String(raw || '')
    .split(/[,;]+/)
    .map(function (e) { return e.trim(); })
    .filter(function (e) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    });
}

function _toNum_(v) {
  if (typeof v === 'number') return v;
  var n = parseFloat(String(v || '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

function _prioWeight_(p) {
  var s = String(p || '').toLowerCase();
  if (s === 'tinggi' || s === 'high' || s === 'urgent') return 3;
  if (s === 'sedang' || s === 'med' || s === 'medium') return 2;
  return 1;
}

function _parseYmd_(ymd) {
  var p = String(ymd).split('-');
  return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
}

function _asYmd_(val, tz) {
  if (val == null || val === '') return '';
  if (Object.prototype.toString.call(val) === '[object Date]') {
    return Utilities.formatDate(val, tz, 'yyyy-MM-dd');
  }
  var s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);
  // coba parse lain
  var d = new Date(s);
  if (!isNaN(d.getTime())) return Utilities.formatDate(d, tz, 'yyyy-MM-dd');
  return '';
}

/** ISO day: 1=Monday ... 7=Sunday */
function _isoDayOfWeek_(date, tz) {
  // gunakan format 'u' jika didukung — di Apps Script format pattern mirip Java
  try {
    var u = Utilities.formatDate(date, tz, 'u'); // 1-7
    var n = parseInt(u, 10);
    if (n >= 1 && n <= 7) return n;
  } catch (e) {}
  // fallback
  var day = parseInt(Utilities.formatDate(date, tz, 'c'), 10); // 1=Sunday di beberapa locale
  // gunakan getDay via string ymd
  var ymd = Utilities.formatDate(date, tz, 'yyyy-MM-dd');
  var d = _parseYmd_(ymd);
  var js = d.getDay(); // 0=Sun
  return js === 0 ? 7 : js;
}

function _esc_(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function _escAttr_(s) {
  return _esc_(s).replace(/'/g, '&#39;');
}

function _stripHtml_(html) {
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 500);
}

function _uiAlert_(title, msg) {
  try {
    SpreadsheetApp.getUi().alert(title, msg, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    // dipanggil dari trigger: tidak ada UI
    Logger.log(title + ': ' + msg);
  }
}
