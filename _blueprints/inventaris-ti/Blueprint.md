# Blueprint — Inventaris Aset TI (Pilot Pabrik)

App ID: `inventaris-ti` · v1 · Sumber: dokumen pabrik §10.2 + §10.3

## 1. Ringkasan Kebutuhan

Pencatatan aset TI (laptop, PC, printer, periferal) yang sekarang tersebar di kertas/Excel berantakan → satu sumber kebenaran berbasis Google Sheets dengan Web App GAS:

- CRUD aset lengkap: kode_aset, nama, kategori, merek, serial_number, lokasi, kondisi, status, pemegang, tanggal_perolehan, keterangan
- Cari & filter: kategori, lokasi, status, kondisi (+ pencarian teks bebas)
- Edit & **nonaktifkan** aset (soft delete — hilang dari list, tetap ada di Sheet)
- Dashboard ringkas: total aset aktif + jumlah per status

## 2. Persona & Use Case

| Persona | Kebutuhan utama |
|---|---|
| Staf TI / admin inventaris | Tambah aset baru saat unboxing, update pemegang saat serah terima |
| Pimpinan/peminta laporan | Lihat ringkasan berapa unit tersedia/dipinjam/rusak |

Use case inti: (U1) catat aset baru dari HP ≤30 detik · (U2) serah terima → ubah status+pemegang · (U3) cari aset by lokasi/kategori · (U4) laporkan rusak/hilang → kondisi+status berubah · (U5) aset pensiun → soft delete.

## 3. Entitas Data + Skema Kolom Sheet

Spreadsheet tunggal, 2 tab (kontrak Rail 2 — JANGAN ubah nama/kolom):

### Tab `ASET`

| kolom | tipe | wajib | contoh |
|---|---|---|---|
| id | string (uuid) | ✅ | `a1b2c3d4-...` (Utilities.getUuid) |
| kode_aset | string unique | ✅ | `TI-LAP-001` |
| nama | string | ✅ | `Lenovo ThinkPad T14` |
| kategori | string | ✅ | `Laptop` / `PC` / `Printer` / `Periferal` / `Jaringan` / `Lainnya` |
| merek | string | — | `Lenovo` |
| serial_number | string | — | `PF3AB12C` |
| lokasi | string | ✅ | `Kantor Diskominfo` |
| kondisi | string | ✅ | `baik` / `rusak` / `hilang` (default `baik`) |
| status | string | ✅ | `tersedia` / `dipakai` / `dipinjam` (default `tersedia`) |
| pemegang | string | — | `Budi (Sekretariat)` |
| tanggal_perolehan | date (yyyy-mm-dd) | — | `2026-08-26` |
| keterangan | string | — | `Bawaan charger lengkap` |
| created_at | ISO timestamp | ✅ | auto server |
| updated_at | ISO timestamp | ✅ | auto server |
| is_deleted | boolean | ✅ | default FALSE |

### Tab `RIWAYAT` (log mutasi, append-only)

| kolom | tipe | wajib | contoh |
|---|---|---|---|
| id | string (uuid) | ✅ | uuid |
| aset_id | string | ✅ | FK → ASET.id |
| aksi | string | ✅ | `tambah` / `ubah` / `nonaktif` |
| detail | string | — | `pemegang: "" → Budi; status: tersedia → dipinjam` |
| oleh | string | — | nama user web app (input bebas, opsional) |
| created_at | ISO timestamp | ✅ | auto server |

## 4. Aturan Bisnis & Validasi

1. **kode_aset unik** — validasi server-side saat tambah/ubah; duplikat → error jelas.
2. **Field wajib**: kode_aset, nama, kategori, lokasi. Kosong → tolak dengan pesan per-field.
3. **Enum tertutup**: kondisi ∈ {baik,rusak,hilang}; status ∈ {tersedia,dipakai,dipinjam}. Nilai lain → tolak.
4. **Transisi konsisten**: status ≠ `tersedia` ⇒ pemegang wajib diisi; status = `tersedia` ⇒ pemegang dikosongkan otomatis.
5. **Soft delete**: hapusAset hanya set `is_deleted=TRUE` + catat riwayat `nonaktif`. List & dashboard & filter default hanya menampilkan `is_deleted=FALSE`.
6. **Setiap tulis** (tambah/ubah/nonaktif) WAJIB append baris RIWAYAT.
7. **Timestamp server-side**, timezone Asia/Jakarta; client tidak boleh set id/timestamp.
8. **Validasi server-side wajib** — client-side hanya UX.

## 5. Alur Layar (Screen Flow)

```
┌─ LAYAR UTAMA ──────────────┐
│ [Dashboard ringkas]        │     ┌─ FORM ASET (tambah/edit) ─┐
│ total aktif · per status   │     │ modal/section full        │
│ [Cari ▭] [Filter 4 dropdown]│───►│ field sesuai §3           │
│ [Daftar aset (kartu/tabel)]│◄────│ simpan → validasi server  │
│   tiap kartu: [Edit][Hapus]│     └───────────────────────────┘
└────────────────────────────┘
        │ klik Hapus → dialog konfirmasi → nonaktif
        ▼
   toast sukses/gagal
```

Satu halaman tunggal (SPA sederhana): dashboard+list di atas, form muncul sebagai section/modal. Tidak ada navigasi multi-halaman.

## 6. Spesifikasi UI per Layar

**Umum**: mobile-first, satu kolom; font sistem; tombol besar (min 44px); kontras AA.

| Elemen | Spec |
|---|---|
| Header app | Judul "Inventaris Aset TI" + badge jumlah aset aktif |
| Kartu ringkasan | 4 chip: Total · Tersedia · Dipakai/Dipinjam · Rusak/Hilang — angka update setelah tiap mutasi |
| Search bar | teks bebas, match kode_aset/nama/SN/pemegang, debounce 300ms |
| Filter | 4 dropdown: Kategori, Lokasi (isi dari data unik), Status, Kondisi + tombol "Reset" |
| Daftar | kartu per aset: kode (bold), nama, kategori·lokasi·kondisi·status (chip warna: hijau/kuning/merah), pemegang; aksi Edit & Nonaktifkan |
| Form | input sesuai skema; kategori/status/kondisi = select; tanggal = date picker; field wajib bertanda * |
| Konfirmasi hapus | dialog: "Nonaktifkan TI-LAP-001? Aset hilang dari daftar tapi tetap tersimpan." |
| State kosong | ilustrasi teks: "Belum ada aset. + Tambah pertama Anda" |
| Loading | spinner kecil di tombol saat simpan; skeleton/sablon "Memuat…" di list |
| Error | toast merah dengan pesan server (mis. "kode_aset sudah dipakai") |

**Animasi dekoratif: NONE** — Mac user REDUCE-MOTION ON; hanya transisi opacity singkat yang aman dan hormati `prefers-reduced-motion`.

## 7. Daftar Fungsi Backend (kontrak code.gs)

Konvensi penamaan pabrik (`<X>`=Aset):

| Fungsi | Param → Return |
|---|---|
| `doGet()` | → HtmlService template `index` |
| `setupAset()` | idempotent: buat tab ASET+RIWAYAT+header jika belum ada; menu custom "Pabrik" (Setup / Reset demo) |
| `tambahAset(data)` | dict field tanpa id/timestamp → `{ok:true,id}` atau throw `{ok:false,error}`; validasi §4; append RIWAYAT aksi `tambah` |
| `listAset(filter)` | filter {q,kategori,lokasi,status,kondisi} semua opsional → array dict aset aktif saja + meta {total,perStatus} |
| `ubahAset(id,data)` | → `{ok:true}` ; cek kode unik vs baris lain; diff field → detail riwayat `ubah`; konsistensi status↔pemegang otomatis |
| `hapusAset(id)` | → `{ok:true}` ; set is_deleted=TRUE, riwayat `nonaktif` |
| `getOpsi()` | → {kategori:[], lokasi:[], } untuk isi dropdown filter/form (dari nilai unik Sheet) |

## 8. PROMPT EKSEKUSI UNTUK KODER (Rail 2)

> Tempel blok ini apa adanya ke subagent Koder. Self-contained.

```text
Anda Niu-Bot, Senior GAS Engineer. Implementasikan Web App "Inventaris Aset TI".
Output HANYA 4 file di apps/pabrik-aplikasi-gas/inventaris-ti/: setup.gs, code.gs,
index.html, tests/crud.test.js — plus DEPLOY.md template kosong.

STACK: Google Sheets DB (2 tab: ASET, RIWAYAT) + Apps Script bound + HTML Service.
Komunikasi client→server WAJIB google.script.run + withSuccessHandler/withFailureHandler.

SKEMA ASET (header persis): id, kode_aset, nama, kategori, merek, serial_number,
lokasi, kondisi, status, pemegang, tanggal_perolehan, keterangan, created_at,
updated_at, is_deleted
SKEMA RIWAYAT: id, aset_id, aksi, detail, oleh, created_at
Enum: kondisi=baik|rusak|hilang; status=tersedia|dipakai|dipinjam.

KONTRAK FUNGSI code.gs:
- doGet() → HtmlService.createTemplateFromFile('index')
- setupAset() → idempotent buat tab+header+menu "Pabrik"; SpreadsheetApp.getActiveSpreadsheet()
- tambahAset(data) → {ok,id} | throw {ok:false,error}
- listAset(filter{q,kategori,lokasi,status,kondisi}) → {items:[],meta:{total,perStatus}} — hanya is_deleted=FALSE
- ubahAset(id,data) → {ok:true}; kode unik vs baris lain; auto konsisten status↔pemegang
- hapusAset(id) → soft delete is_deleted=TRUE + riwayat "nonaktif"
- getOpsi() → {kategori:[],lokasi:[]}
ATURAN: id=Utilities.getUuid(); timestamp ISO tz Asia/Jakarta server-side;
validasi server wajib (field wajib: kode_aset,nama,kategori,lokasi; enum tertutup;
kode_aset unik); setiap mutasi append RIWAYAT (aksi=tambah|ubah|nonaktif, detail diff).

UI index.html (mobile-first, satu kolom): header+jumlah aktif; 4 chip ringkasan
(Total/Tersedia/Dipakai·Dipinjam/Rusak·Hilang); search debounce 300ms (kode/nama/SN/
pemegang); filter dropdown Kategori/Lokasi/Status/Kondisi + Reset; daftar kartu aset
(kode bold, nama, chip warna kondisi/status, pemegang, tombol Edit & Nonaktifkan);
form modal (select utk enum, date picker, tanda * wajib); dialog konfirmasi nonaktif;
state kosong & loading & toast error/sukses. TANPA animasi dekoratif; hormati
prefers-reduced-motion. Escape semua output teks (anti-XSS dasar). CSS internal rapi.

TESTS tests/crud.test.js (Node, pakai _harness): loadGasModule mock-spreadsheetapp;
uji setup idempotent 2x; tambah→list muncul; duplikat kode ditolak; field wajib kosong
ditolak; ubah pemegang tersimpan + riwayat bertambah; hapus→list kosong tapi Sheet
masih berisi baris (is_deleted TRUE); filter status=dipinjam akurat.
VERIFIKASI LOKAL WAJIB SEBELUM SERAH: node --check *.gs && node _harness/run-tests.js
→ semua passed 0 failed.
DEPLOY.md: template heading kosong (URL Live / Tanggal / Mode izin / Versi).
```

## 9. Acceptance Criteria (DoD pilot §10.3)

- [ ] `node --check` lulus untuk setup.gs & code.gs; `run-tests.js` N passed 0 failed
- [ ] Create aset baru dari HP berhasil (U1)
- [ ] Filter status = dipinjam akurat (cocok Sheet)
- [ ] Edit pemegang tersimpan + entri RIWAYAT `ubah`
- [ ] Soft delete: hilang dari list, baris tetap ada di Sheet dengan is_deleted=TRUE
- [ ] Duplikat kode_aset ditolak dengan pesan jelas
- [ ] Dashboard ringkas angkanya benar vs Sheet
- [ ] 2 orang uji tanpa penjelasan panjang — >80% selesai self-serve
- [ ] URL live + versi tercatat di DEPLOY.md; FACTORY_LOG.md diupdate; kode di-commit

---
*Blueprint dibuat Hermes (Rail 1 substitusi manual setelah subagent timeout) — 26 Agu 2026. Sumber: docs/references/pabrik-aplikasi/Rencana_Pabrik_Aplikasi_Ekosistem.md §7.1, §10.*
