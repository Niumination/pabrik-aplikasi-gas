# Checklist Pasang — N5 Digest Reporter

**Waktu:** 15–25 menit  
**Prasyarat:** Akun Google, boleh kirim email lewat akun tersebut  

---

## A. Buat wadah

- [ ] Drive → folder `Pabrik_Aplikasi/05_Apps/App_DigestReporter/`
- [ ] Buat Google Sheet: `[APP] Digest Reporter DB`
- [ ] Opsional: letakkan Sheet di folder di atas

## B. Pasang script

- [ ] Sheet → **Extensions** → **Apps Script**
- [ ] Hapus kode default `function myFunction...`
- [ ] File → New → Script → namakan `setup` → tempel isi **`setup.gs`**
- [ ] File default `Code.gs` → tempel isi **`Code.gs`**
- [ ] **Save** (Ctrl/Cmd+S)
- [ ] Project name: `N5 Digest Reporter`

## C. Setup skema

- [ ] Di editor Apps Script: pilih fungsi `setupDigestSystem` → **Run**
- [ ] **Authorize** / Review permissions → pilih akun → Advanced → Go to project → Allow  
  Izin yang muncul wajar: lihat spreadsheet, kirim email
- [ ] Kembali ke Sheet → refresh browser
- [ ] Pastikan tab ada: `CONFIG`, `SUMBER_TAMU`, `SUMBER_TIKET`, `SUMBER_STOK`, `SUMBER_TUGAS`, `LOG_KIRIM`
- [ ] Menu atas: **📬 Digest Reporter** terlihat (jika belum: refresh / jalankan `onOpen`)

## D. Konfigurasi wajib di tab CONFIG

| key | isi yang disarankan pertama kali |
|-----|-----------------------------------|
| `system_active` | `TRUE` |
| `dry_run` | `TRUE` (uji dulu) |
| `recipients_to` | email Anda sendiri |
| `timezone` | `Asia/Jakarta` |
| `mode` | `daily` |
| `org_name` | nama unit Anda |
| `sheet_public_url` | Share Sheet → Copy link (boleh terbatas) |

- [ ] Simpan / biarkan autosave Sheet

## E. Uji dry-run

- [ ] Menu **📬 Digest Reporter → 2) Dry-run**
- [ ] Harus muncul dialog **Dry-run OK**
- [ ] Tab `LOG_KIRIM` bertambah 1 baris, `status = DRY_RUN_OK`
- [ ] Inbox **tidak** menerima email

## F. Uji kirim nyata

- [ ] CONFIG: `dry_run` = `FALSE`
- [ ] Menu → **3) Kirim sekarang**
- [ ] Cek inbox (dan spam) — email HTML dengan KPI + tabel
- [ ] `LOG_KIRIM` status `SENT`
- [ ] `CONFIG.last_sent_date` terisi hari ini
- [ ] Jalankan **Kirim sekarang** lagi → harus **SKIPPED_DUP**
- [ ] Uji **Kirim paksa** → boleh kirim lagi

## G. Trigger produksi

- [ ] Pastikan `dry_run = FALSE`, `system_active = TRUE`, `recipients_to` benar
- [ ] Menu → **Pasang trigger harian 07:30**  
  *atau* di editor: Triggers (jam) → Add trigger manual:
  - Function: `triggerDailyDigest`
  - Event: Time-driven → Day timer → 7am–8am
- [ ] Menu → **Tampilkan info trigger** → pastikan ada
- [ ] Opsional: tunggu besok / ubah sementara jam untuk uji

## H. Sambungkan data nyata (pilih salah satu)

**Opsi 1 — Edit tab SUMBER_***  
Isi manual / paste dari sistem lain.

**Opsi 2 — Ganti collector ke Sheet app lain**  
Di `Code.gs`, ubah nama tab di `DIGEST_SETUP.TABS` atau hardcode ID spreadsheet lain dengan `SpreadsheetApp.openById` (butuh izin).

**Opsi 3 — Matikan modul**  
CONFIG: `include_tamu/tiket/stok/tugas` = `FALSE` untuk yang tidak dipakai.

## I. Factory & backup

- [ ] Salin `setup.gs` + `Code.gs` ke folder Drive app (backup teks)
- [ ] Isi Factory Log (`FACTORY_LOG_ENTRY.md`)
- [ ] Catat: siapa boleh ubah CONFIG

---

## Troubleshooting

| Gejala | Cek |
|--------|-----|
| Menu tidak muncul | Refresh Sheet; run `onOpen` |
| Authorization error | Run ulang dari editor; pastikan akun yang sama |
| Email tidak sampai | `dry_run`? Spam? Kuota MailApp? `recipients_to` valid? |
| SKIPPED_DUP | Wajar; pakai Kirim paksa atau kosongkan `last_sent_date` |
| Trigger diam | `system_active`? `mode` cocok? Cek Executions di Apps Script |
| Angka KPI 0 | Header kolom harus exact (`status`, `stok_akhir`, …); cek sample |
| Weekly tidak kirim | `mode=weekly` + `weekly_day` = ISO hari (1=Senin) |
| Error CONFIG tidak ada | Run `setupDigestSystem` |

### Kuota (ingat)
- **MailApp**: kuota harian per akun (berubah sesuai jenis akun Google).  
- Jangan blast ratusan penerima dari satu digest; pecah atau pakai grup Google.

### Keamanan
- Jangan set sharing Sheet ke **Anyone with link** jika ada data sensitif.  
- Link di email (`sheet_public_url`) mengikuti permission Sheet.  
- Penerima email melihat cuplikan data — filter modul & `max_table_rows`.

---

## Selesai bila

1. Dry-run OK  
2. Satu email nyata diterima dengan 4 kartu KPI  
3. LOG terisi  
4. Trigger terpasang **atau** sadar pakai manual dulu  
5. Factory Log terisi  
