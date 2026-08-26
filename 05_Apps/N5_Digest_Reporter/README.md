# N5 — Daily/Weekly Digest Reporter
## Produk pabrik: laporan otomatis ke inbox (bukan web app)

**Versi:** 1.0  
**Tanggal:** 25 Agustus 2026  
**Kemasan:** `EMAIL_REPORT`  
**Stack:** Google Sheets + Apps Script (bound) + time-driven trigger  
**Timezone default:** Asia/Jakarta  

---

## Apa ini?

Script yang membaca data operasional dari tab Sheet, merangkum KPI + baris yang butuh tindakan, lalu mengirim **email HTML** ke daftar penerima — harian atau mingguan — dengan mode **dry-run** agar aman diuji.

Cocok digandeng app pabrik lain (Buku Tamu, Tiket, Inventaris, Stok) **atau** jalan sendiri dengan data manual/impor.

---

## Isi paket folder ini

| File | Fungsi |
|------|--------|
| `README.md` | Panduan ini |
| `Brief_Analis.md` | Brief + blueprint (dokumentasi pabrik) |
| `setup.gs` | Buat tab, header, sample, menu |
| `Code.gs` | Mesin digest, email, trigger helper, utilitas |
| `ALL_IN_ONE.gs` | **Gabungan setup+code** — tempel ke satu file jika ingin simpel |
| `CHECKLIST_PASANG.md` | Langkah pasang 15–25 menit |
| `CONNECT_DATA.md` | Sambungkan ke data app lain (IMPORTRANGE, sync, dll.) |
| `FACTORY_LOG_ENTRY.md` | Template isi Factory Log |

---

## Hasil yang Anda dapat

1. Tab **CONFIG** — pengaturan tanpa edit kode  
2. Tab **SUMBER_*** — 4 sumber contoh (tamu, tiket, stok, tugas)  
3. Tab **LOG_KIRIM** — jejak setiap percobaan kirim  
4. Menu spreadsheet **📬 Digest Reporter**  
5. Fungsi siap trigger: `triggerDailyDigest`, `triggerWeeklyDigest`  
6. Email HTML: 4 kartu KPI + tabel tindakan + tombol buka Sheet  

---

## Mulai cepat (rekomendasi)

1. Buat Google Sheet baru: `[APP] Digest Reporter`  
2. Extensions → Apps Script  
3. **Opsi A (paling mudah):** hapus kode default → tempel seluruh **`ALL_IN_ONE.gs`**  
   **Opsi B:** tempel `setup.gs` + `Code.gs` sebagai 2 file  
4. Jalankan `setupDigestSystem` → Authorize  
5. Di Sheet: menu **📬 Digest Reporter → Dry-run**  
6. Cek `LOG_KIRIM` → lalu set `dry_run=FALSE` → **Kirim sekarang**  
7. Menu → **Pasang trigger harian 07:30**  

Detail: **CHECKLIST_PASANG.md** · Data nyata: **CONNECT_DATA.md**
