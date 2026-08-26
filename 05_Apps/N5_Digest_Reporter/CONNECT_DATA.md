# Menyambungkan Digest ke Data Nyata

Tab `SUMBER_*` di N5 adalah **adapter**. Anda tidak harus mengisi manual selamanya.

---

## Pola 1 — Copy-paste / impor berkala (paling sederhana)

1. Dari app sumber (Buku Tamu, Tiket, …) filter & copy baris.  
2. Paste ke tab `SUMBER_*` (header harus sama).  
3. Atau File → Import → Append.

**Cocok jika:** volume kecil, rekap harian manual masih oke.

---

## Pola 2 — Formula `IMPORTRANGE` (hampir real-time)

Di baris 2 tab `SUMBER_TIKET` (contoh):

```
=IMPORTRANGE("SPREADSHEET_ID_SUMBER"; "MASTER_TIKET!A:K")
```

**Catatan:**
- Header N5 harus selaras dengan kolom sumber, **atau** buat tab `RAW_TIKET` + tab `SUMBER_TIKET` yang memetakan lewat `QUERY`/`ARRAYFORMULA`.
- Izinkan akses saat pertama kali IMPORTRANGE.
- Kolom tanggal/status harus sama maknanya (`baru`/`diproses`, dll.).

---

## Pola 3 — Script tarik dari spreadsheet lain

Tambahkan di `Code.gs` (sketsa):

```javascript
function syncTiketFromOtherBook() {
  var SRC_ID = 'ID_SPREADSHEET_TIKET_ANDA';
  var src = SpreadsheetApp.openById(SRC_ID).getSheetByName('MASTER_TIKET');
  var dst = SpreadsheetApp.getActive().getSheetByName('SUMBER_TIKET');
  var values = src.getDataRange().getValues();
  dst.clear();
  dst.getRange(1, 1, values.length, values[0].length).setValues(values);
}
```

Jadwalkan `syncTiketFromOtherBook` 06:50, digest 07:30.

---

## Pola 4 — Satu spreadsheet multi-app (ideal pabrik)

Simpan Buku Tamu + Tiket + Digest di **satu** file Sheet (tab berbeda).  
Ubah collector agar baca nama tab produksi langsung, contoh:

```javascript
// di collectTiket_
var rows = _sheetObjects_(ss, 'MASTER_TIKET'); // ganti dari SUMBER_TIKET
```

Atau set di CONFIG (perlu sedikit kode baca nama tab dinamis).

---

## Mapping kolom wajib

### SUMBER_TAMU
`nama_tamu, instansi, keperluan, bertemu_dengan, waktu_masuk, waktu_keluar, status`  
Status di dalam: `di_dalam`

### SUMBER_TIKET
`kode, pelapor, kategori, prioritas, judul, lokasi, status, petugas, tgl_lapor`  
Open: `baru`, `diproses` (atau `open`, `progress`)  
Prioritas tinggi: `tinggi` / `high` / `urgent`

### SUMBER_STOK
`kode, nama, kategori, satuan, stok_akhir, stok_minimum, lokasi_simpan`  
Menipis: `stok_akhir <= stok_minimum`

### SUMBER_TUGAS
`judul, assignee, prioritas, status, due_date, label`  
Selesai diabaikan: `selesai` / `done` / `closed`  
Perlu aksi: belum selesai & due ≤ today + `tugas_due_soon_days`

---

## Matikan modul yang tidak relevan

Di CONFIG:
```
include_tamu = FALSE
include_tiket = TRUE
include_stok = FALSE
include_tugas = FALSE
```

Email hanya menampilkan modul aktif; kartu KPI tetap 4 slot (nilai 0 jika modul off — opsional rapihkan di v1.1).

---

## v1.1 ideas (setelah N5 live)

- Kartu KPI dinamis hanya untuk modul ON  
- Lampirkan CSV ringkas di email  
- Kirim ke Google Chat webhook selain email  
- Satu CONFIG multi-penerima per modul (IT dapat tiket, logistik dapat stok)  
