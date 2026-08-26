# pabrik-aplikasi-gas — DOX

**Lokasi:** `apps/pabrik-aplikasi-gas/` (local mirror) · `github.com/Niumination/pabrik-aplikasi-gas` (source of truth)

**Stack:** Google Apps Script (GAS) bound to Google Sheets · Clasp CLI · Node test harness

---

## Proyek Pilot: Inventaris Aset TI (`inventaris-ti/`)

Web App GAS untuk inventaris aset TI (laptop, PC, printer, periferal) — CRUD, search, filter, soft delete, dashboard ringkas, riwayat mutasi.

### Blueprint & Specs
- `_blueprints/inventaris-ti/Blueprint.md` — kontrak lengkap (skema, enum, fungsi, UI, AC)
- `inventaris-ti/DEPLOY.md` — template deploy (URL live, versi, mode akses)

### Fungsi Utama (`code.gs`)
| Fungsi | Deskripsi |
|--------|-----------|
| `doGet()` | Entry point HTML Service |
| `setupAset()` | Idempotent: buat tab ASET + RIWAYAT + menu "Pabrik" |
| `tambahAset(data)` | Validasi server-side, append RIWAYAT `tambah` |
| `listAset(filter)` | Return aset aktif (is_deleted=FALSE) + meta |
| `ubahAset(id,data)` | Cek kode unik, konsistensi status↔pemegang, append RIWAYAT `ubah` |
| `hapusAset(id)` | Soft delete `is_deleted=TRUE`, append RIWAYAT `nonaktif` |
| `getOpsi()` | Dropdown options kategori/lokasi dari data unik |

### Enum Tertutup
- `kondisi`: `baik` | `rusak` | `hilang` (default `baik`)
- `status`: `tersedia` | `dipakai` | `dipinjam` (default `tersedia`)

### Validasi Wajib
1. kode_aset unik (server-side)
2. Field wajib: kode_aset, nama, kategori, lokasi
3. Enum tertutup — nilai lain ditolak
4. Status ≠ tersedia ⇒ pemegang wajib; status = tersedia ⇒ pemegang dikosongkan otomatis
5. Setiap mutasi append RIWAYAT
6. Timestamp server-side (Asia/Jakarta)

---

## Commands

### Local Test (Node harness)
```bash
cd inventaris-ti
node --check setup.gs code.gs
node _harness/run-tests.js
# → semua passed, 0 failed
```

### Deploy (Clasp)
```bash
cd inventaris-ti
clasp login        # sekali saja
clasp push         # push ke Apps Script
clasp deploy       # deploy web app
```

### Deploy Manual
1. Buka Apps Script → tempel `setup.gs`, `code.gs`, `index.html`
2. Jalankan `setupAset` sekali (authorize)
3. Deploy → New deployment → Web app · Execute as: Me · Access: Anyone with Google account

---

## Acceptance Criteria (DoD)
- [ ] `node --check` lulus untuk setup.gs & code.gs
- [ ] `run-tests.js` N passed, 0 failed
- [ ] Create aset dari HP ≤30 detik (U1)
- [ ] Filter status=dipinjam akurat vs Sheet
- [ ] Edit pemegang tersimpan + riwayat `ubah`
- [ ] Soft delete: hilang dari list, baris tetap di Sheet (is_deleted=TRUE)
- [ ] Duplikat kode_aset ditolak dgn pesan jelas
- [ ] Dashboard angka benar vs Sheet
- [ ] URL live + versi tercatat di DEPLOY.md; FACTORY_LOG.md diupdate

---

## Related Files
- `docs/references/pabrik-aplikasi/Rencana_Pabrik_Aplikasi_Ekosistem.md` §7.1, §10
- Root `FACTORY_LOG.md` (diupdate tiap deploy pilot)

---

## Notes
- Animasi dekoratif: NONE (REDUCE-MOTION ON)
- Escape output teks (anti-XSS dasar)
- Timezone server: Asia/Jakarta
