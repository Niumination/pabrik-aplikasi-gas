# BACKLOG — pabrik-aplikasi-gas

Format: `- [STATUS] **Title** — Desc — @project`

---

## Pilot 1: Inventaris Aset TI (`inventaris-ti/`)

- [DONE] **Blueprint selesai** — kontrak skema, enum, fungsi, UI, AC — @pabrik-aplikasi-gas
- [DONE] **Implementasi code.gs** — 7 fungsi kontrak (doGet, setupAset, tambahAset, listAset, ubahAset, hapusAset, getOpsi) — @pabrik-aplikasi-gas
- [DONE] **Implementasi index.html** — mobile-first SPA, dashboard, search, filter, form modal, toast — @pabrik-aplikasi-gas
- [DONE] **Implementasi setup.gs** — idempotent tab ASET+RIWAYAT, menu custom "Pabrik" — @pabrik-aplikasi-gas
- [DONE] **Test harness** — _harness/mock-spreadsheetapp.js + tests/crud.test.js — @pabrik-aplikasi-gas
- [DONE] **Clasp config** — .clasp.json dengan scriptId & parentId — @pabrik-aplikasi-gas
- [DONE] **Local test pass** — `node --check` + `run-tests.js` 0 failed — @pabrik-aplikasi-gas
- [DONE] **Deploy ke Google Apps Script** — clasp push + deploy — @pabrik-aplikasi-gas
- [PENDING] **Uji manual HP** — U1..U5 (catat, serah terima, cari, laporkan, pensiun) — @pabrik-aplikasi-gas
- [DONE] **Isi DEPLOY.md** — URL live, tanggal, versi, spreadsheet ID — @pabrik-aplikasi-gas
- [DONE] **Update FACTORY_LOG.md** (root) + commit — @pabrik-aplikasi-gas

---

## Paket v2 — Aplikasi Siap Deploy (`05_Apps/`)

- [READY] **N5 Digest Reporter** — EMAIL_REPORT, Code.gs + setup.gs — @pabrik-aplikasi-gas
- [READY] **N1 Super Menu Sheet** — SHEET_ENGINE, ALL_IN_ONE.gs — @pabrik-aplikasi-gas
- [READY] **N9 Generator Surat** — DOC_GENERATOR, ALL_IN_ONE.gs (butuh template Docs + folder ID) — @pabrik-aplikasi-gas
- [TODO] **Deploy N5/N1/N9** — clasp push + setup + deploy per app — @pabrik-aplikasi-gas
- [TODO] **Uji N5/N1/N9** — verifikasi recipients, trigger, koneksi data — @pabrik-aplikasi-gas

---

## Web App Ide (dari docs/10_Ide_Web_App_Pabrik.md)

- [BACKLOG] **W2 Buku Tamu Digital** — web app pertama (rendah) — @pabrik-aplikasi-gas
- [BACKLOG] **W8 Direktori Kontak & Vendor** — rendah — @pabrik-aplikasi-gas
- [BACKLOG] **W5 Absensi Kegiatan/Rapat** — rendah — @pabrik-aplikasi-gas
- [BACKLOG] **W1 Inventaris Aset TI** — menengah (sudah dipilotkan) — @pabrik-aplikasi-gas
- [BACKLOG] **W3 Peminjaman Barang** — menengah — @pabrik-aplikasi-gas
- [BACKLOG] **W4 Tiket Keluhan Internal** — menengah — @pabrik-aplikasi-gas
- [BACKLOG] **W7 Stok ATK** — menengah — @pabrik-aplikasi-gas
- [BACKLOG] **W6 Register Surat** — menengah — @pabrik-aplikasi-gas
- [BACKLOG] **W9 Checklist Inspeksi** — menengah — @pabrik-aplikasi-gas
- [BACKLOG] **W10 Pipeline Tugas / Kanban** — menengah — @pabrik-aplikasi-gas

---

## Fondasi Pabrik

- [DONE] **Gem Instructions v1.2** — 01_Gems/system_instruction_analis_v1.2.txt + koder_v1.2.txt — @pabrik-aplikasi-gas
- [DONE] **SOP Produksi** — 00_SOP/SOP_Produksi_Solusi.md + CHECKLIST_Deploy_Umum.md — @pabrik-aplikasi-gas
- [DONE] **Factory Log Template** — 04_Factory_Log/Factory_Log_Template.csv — @pabrik-aplikasi-gas
- [DONE] **Katalog & Roadmap** — docs/KATALOG_PRODUK.md, ROADMAP.md, Rencana_Pabrik_Aplikasi_Ekosistem.md — @pabrik-aplikasi-gas

---

## Infrastructure

- [PENDING] **Clasp CI/CD** — GitHub Actions untuk auto-push/deploy on merge — @pabrik-aplikasi-gas
- [PENDING] **Environment separation** — dev/staging/prod spreadsheet IDs — @pabrik-aplikasi-gas
