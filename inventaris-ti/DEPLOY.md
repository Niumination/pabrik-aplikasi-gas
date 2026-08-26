# DEPLOY — Inventaris Aset TI

> Isi setelah deploy. Jangan pernah simpan kredensial di file ini.

| Item | Nilai |
|---|---|
| URL Live | https://script.google.com/macros/s/AKfycbwVANuqz-UvfqqCKaRw6S-JVxBPF0bndRt4EqElaf3SIq4y0fCuzgGDAv0SCTic-Ujv/exec |
| Tanggal deploy | 26 Agu 2026 (v3) |
| Mode akses | Anyone (web app), execute as: pemilik |
| Spreadsheet DB | [DB - Inventaris Aset TI v2](https://docs.google.com/spreadsheets/d/1KKuH3ktm-JqYeGcvIWBk_f2XM1nnKi5sIx61lA__t3w/edit) |
| Versi deployment | v3 — fix Date serialization (`clasp deploy` @3) |
| Spreadsheet DB | _(link / ID spreadsheet)_ |

## Langkah cepat (manual)

1. Buat spreadsheet baru di Drive folder pabrik → beri nama `DB - Inventaris Aset TI`
2. Extensions → Apps Script → tempel `setup.gs`, `code.gs`, dan `index.html` (File → New → HTML, nama `index`)
3. Jalankan fungsi `setupAset` sekali → authorize
4. Deploy → New deployment → Web app · Execute as: **Me** · Access: **Anyone with Google account**
5. Uji CRUD dari HP: tambah aset pertama, edit pemegang, nonaktifkan
6. Isi tabel di atas + update baris app di `FACTORY_LOG.md`

## Update versi lanjutan

- Manual: edit kode → Deploy → Manage deployments → ✏️ → Version: New version → Deploy
- Clasp: `clasp push && clasp deploy` (butuh login OAuth sekali di Terminal.app)
