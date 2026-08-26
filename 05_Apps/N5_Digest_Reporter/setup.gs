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
