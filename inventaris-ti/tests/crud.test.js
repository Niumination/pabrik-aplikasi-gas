// crud.test.js — test CRUD inventaris-ti via NiuSheetMock harness.
// Dijalankan otomatis oleh: node _harness/run-tests.js
// (file ini dieksekusi langsung oleh node → assert & exit code di sini.)

const path = require('path');
const { NiuSheetMock, loadGasModule } = require(path.join(
  __dirname, '..', '..', '_harness', 'mock-spreadsheetapp.js'));

const ASET_HEADERS = [
  'id', 'kode_aset', 'nama', 'kategori', 'merek', 'serial_number',
  'lokasi', 'kondisi', 'status', 'pemegang', 'tanggal_perolehan',
  'keterangan', 'created_at', 'updated_at', 'is_deleted'
];
const RIWAYAT_HEADERS = ['id', 'aset_id', 'aksi', 'detail', 'oleh', 'created_at'];

function buatEnv() {
  const env = new NiuSheetMock({ ASET: ASET_HEADERS, RIWAYAT: RIWAYAT_HEADERS });
  let n = 0;
  const Utilities = {
    getUuid: () => 'uuid-' + (++n) + '-' + Math.random().toString(36).slice(2, 8),
    formatDate: () => '2026-08-26T10:00:00+07:00',
  };
  const code = loadGasModule('inventaris-ti/code.gs', {
    SpreadsheetApp: env.spreadsheetApp(),
    Utilities,
  });
  return { env, code };
}

const ASET_OK = {
  kode_aset: 'TI-LAP-001', nama: 'ThinkPad T14', kategori: 'Laptop',
  lokasi: 'Kantor Diskominfo', kondisi: 'baik', status: 'tersedia',
};

// ── mini framework ─────────────────────────────────────────────
let pass = 0, fail = 0;
function test(nama, fn) {
  const a = {
    ok(cond, msg) {
      if (!cond) { throw new Error('assert gagal: ' + msg); }
    },
    eq(actual, expected, msg) {
      if (actual !== expected) {
        throw new Error(msg + ' — harap ' + JSON.stringify(expected) +
          ', dapat ' + JSON.stringify(actual));
      }
    },
  };
  try {
    fn(a);
    pass++;
    console.log('  ✓ ' + nama);
  } catch (e) {
    fail++;
    console.error('  ✗ ' + nama + '\n    ' + e.message);
  }
}
function catchErr(fn) {
  try { fn(); return null; } catch (e) { return e; }
}

// ── tests ──────────────────────────────────────────────────────

test('setup idempotent — 2x setupAset, header tetap tunggal & persis skema', (a) => {
  const env = new NiuSheetMock({});
  const setupMod = loadGasModule('inventaris-ti/setup.gs', {
    SpreadsheetApp: env.spreadsheetApp(),
  });
  setupMod.setupAset();
  setupMod.setupAset();
  const aset = env.ss().getSheetByName('ASET');
  a.eq(JSON.stringify(aset._headers), JSON.stringify(ASET_HEADERS), 'header ASET');
  a.eq(aset._rows.length, 0, 'tidak ada baris data liar');
});

test('tambah → muncul di list + meta benar', (a) => {
  const { code } = buatEnv();
  const r = code.tambahAset(Object.assign({}, ASET_OK));
  a.ok(r.ok === true && !!r.id, 'return {ok,id}');
  const list = code.listAset({});
  a.eq(list.items.length, 1, 'list berisi 1');
  a.eq(list.items[0].kode_aset, 'TI-LAP-001', 'kode sesuai');
  a.eq(list.meta.total, 1, 'total=1');
  a.eq(list.meta.perStatus.tersedia, 1, 'tersedia=1');
});

test('duplikat kode_aset ditolak', (a) => {
  const { code } = buatEnv();
  code.tambahAset(Object.assign({}, ASET_OK));
  const e = catchErr(() => code.tambahAset(Object.assign({}, ASET_OK)));
  a.ok(e && /sudah dipakai/.test(e.error), 'throw error duplikat');
});

test('field wajib kosong ditolak satu per satu', (a) => {
  const { code } = buatEnv();
  const kasus = [
    { nama: 'x' },                                             // tanpa kode
    { kode_aset: 'K' },                                        // tanpa nama
    { kode_aset: 'K2', nama: 'n' },                            // tanpa kategori+lokasi
    { kode_aset: 'K3', nama: 'n', kategori: 'Laptop' },        // tanpa lokasi
  ];
  kasus.forEach((bad, i) => {
    const e = catchErr(() => code.tambahAset(bad));
    a.ok(e && /wajib kosong/.test(e.error), 'payload-' + i + ' ditolak');
  });
});

test('ubah pemegang tersimpan + status ikut berubah', (a) => {
  const { code } = buatEnv();
  const { id } = code.tambahAset(Object.assign({}, ASET_OK));
  const r = code.ubahAset(id, Object.assign({}, ASET_OK, {
    status: 'dipinjam', pemegang: 'Budi (Sekretariat)',
  }));
  a.ok(r.ok === true, 'ubah sukses');
  const item = code.listAset({}).items[0];
  a.eq(item.status, 'dipinjam', 'status baru');
  a.eq(item.pemegang, 'Budi (Sekretariat)', 'pemegang baru');
});

test('hapus → list kosong tapi baris fisik masih ada is_deleted TRUE', (a) => {
  const { code, env } = buatEnv();
  const { id } = code.tambahAset(Object.assign({}, ASET_OK));
  const r = code.hapusAset(id);
  a.ok(r.ok === true, 'hapus sukses');
  a.eq(code.listAset({}).items.length, 0, 'list kosong');
  const raw = env.ss().getSheetByName('ASET').getAllObjects();
  a.eq(raw.length, 1, 'baris fisik masih ada');
  a.ok(raw[0].is_deleted === true || String(raw[0].is_deleted).toUpperCase() === 'TRUE',
    'is_deleted TRUE');
});

test('filter status=dipinjam akurat', (a) => {
  const { code } = buatEnv();
  code.tambahAset(Object.assign({}, ASET_OK));
  code.tambahAset(Object.assign({}, ASET_OK, {
    kode_aset: 'TI-PRN-002', nama: 'Epson L3210', kategori: 'Printer',
    status: 'dipinjam', pemegang: 'Cici',
  }));
  const dipinjam = code.listAset({ status: 'dipinjam' });
  a.eq(dipinjam.items.length, 1, 'hanya 1 dipinjam');
  a.eq(dipinjam.items[0].kode_aset, 'TI-PRN-002', 'yang tepat');
  const semua = code.listAset({});
  a.eq(semua.meta.total, 2, 'total 2');
  a.eq(semua.meta.perStatus.dipinjam, 1, 'perStatus.dipinjam=1');
});

test('status≠tersedia tanpa pemegang ditolak', (a) => {
  const { code } = buatEnv();
  const e = catchErr(() => code.tambahAset(Object.assign({}, ASET_OK, {
    status: 'dipakai', pemegang: '',
  })));
  a.ok(e && /pemegang/.test(e.error), 'ditolak tanpa pemegang');
});

test('search q mencocokkan SN dan pemegang', (a) => {
  const { code } = buatEnv();
  code.tambahAset(Object.assign({}, ASET_OK, { serial_number: 'SNXYZ99' }));
  code.tambahAset(Object.assign({}, ASET_OK, {
    kode_aset: 'TI-PC-003', nama: 'OptiPlex', kategori: 'PC',
    status: 'dipakai', pemegang: 'Dewi Lina',
  }));
  a.eq(code.listAset({ q: 'snxyz' }).items.length, 1, 'cari SN (case-insensitive)');
  a.eq(code.listAset({ q: 'dewi' }).items.length, 1, 'cari pemegang');
});

// ── ringkasan & exit code ──────────────────────────────────────
console.log(`crud.test.js: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
