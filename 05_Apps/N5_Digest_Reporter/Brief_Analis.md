# Brief & Blueprint — N5 Digest Reporter

## Brief ke Gem Analis (referensi)

```text
Saya ingin SOLUSI EMAIL_REPORT (bukan web app) dengan Sheets + Apps Script.

Masalah:
Data operasional (tamu, tiket, stok, tugas) tersebar di Sheet dan pimpinan
tidak sempat buka file setiap hari. Butuh ringkasan otomatis ke email.

Pengguna:
- Admin sistem (set CONFIG, uji kirim)
- Penerima (pimpinan/staf) hanya baca email

KEMASAN_PRODUK: EMAIL_REPORT

Kebutuhan:
1. Tab CONFIG untuk: aktif/nonaktif, mode daily/weekly, jam, penerima,
   reply-to, subject prefix, timezone, dry_run, batas baris tabel.
2. Multi-sumber data (modular): Buku Tamu, Tiket Open, Stok Menipis, Tugas Overdue.
3. Email HTML ringkas: KPI cards + tabel max N baris + link buka Sheet.
4. LOG_KIRIM setiap run (waktu, mode, jumlah penerima, status, cuplikan error).
5. Menu: Setup, Dry-run, Kirim sekarang, Pasang/hapus trigger info.
6. Cegah kirim dobel di hari yang sama (flag last_sent_date) kecuali force.
7. Timezone Asia/Jakarta.
8. Tanpa library eksternal.

Constraint:
- Bound script ke Spreadsheet
- Secret tidak perlu (email via akun owner script)
- Dry-run default ON di sample
```

---

## Blueprint ringkas

### Kemasan
`EMAIL_REPORT` — time-driven + menu manual, tanpa `index.html`.

### Tab
| Tab | Fungsi |
|-----|--------|
| CONFIG | Key-value pengaturan |
| SUMBER_TAMU | Sample / data tamu |
| SUMBER_TIKET | Sample tiket |
| SUMBER_STOK | Sample stok |
| SUMBER_TUGAS | Sample tugas |
| LOG_KIRIM | Audit pengiriman |

### Fungsi inti
- `setupDigestSystem()`
- `runDigestDryRun()`
- `runDigestNow()` / `runDigestNowForce()`
- `triggerDailyDigest()` / `triggerWeeklyDigest()`
- `buildDigestPayload_()` → `renderDigestHtml_()` → `sendDigest_()`
- Modul per sumber: `collectTamu_()`, `collectTiket_()`, `collectStok_()`, `collectTugas_()`

### Acceptance
- [ ] Setup membuat semua tab + sample
- [ ] Dry-run menulis LOG tanpa email (atau email hanya ke tester jika di-set)
- [ ] Kirim nyata masuk inbox HTML
- [ ] Double-send terblokir di hari sama
- [ ] Weekly hanya jalan di hari yang dikonfigurasi
