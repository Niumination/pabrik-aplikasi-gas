# DEPLOY — Inventaris Aset TI

> Isi setelah deploy. Jangan pernah simpan kredensial di file ini.

| Item | Nilai |
|---|---|
| URL Live | _(tempel di sini)_ |
| Tanggal deploy | — |
| Mode akses | Anyone with Google account (internal) |
| Versi deployment | — |
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
