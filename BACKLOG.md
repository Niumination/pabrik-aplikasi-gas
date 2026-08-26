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
- [PENDING] **Local test pass** — `node --check` + `run-tests.js` 0 failed — @pabrik-aplikasi-gas
- [PENDING] **Deploy ke Google Apps Script** — clasp push + deploy — @pabrik-aplikasi-gas
- [PENDING] **Uji manual HP** — U1..U5 (catat, serah terima, cari, laporkan, pensiun) — @pabrik-aplikasi-gas
- [PENDING] **Isi DEPLOY.md** — URL live, tanggal, versi, spreadsheet ID — @pabrik-aplikasi-gas
- [PENDING] **Update FACTORY_LOG.md** (root) + commit — @pabrik-aplikasi-gas

---

## Future Pilots (dari Rencana_Pabrik_Aplikasi_Ekosistem.md)

- [BACKLOG] **Pilot 2: Surat Masuk/Keluar** — tracking disposisi, SLA, reminder — @pabrik-aplikasi-gas
- [BACKLOG] **Pilot 3: Cuti & Izin** — pengajuan, approval, saldo cuti, kalender — @pabrik-aplikasi-gas
- [BACKLOG] **Pilot 4: Aset Ruangan** — inventaris meja, kursi, AC, proyektor — @pabrik-aplikasi-gas
- [BACKLOG] **Pilot 5: Pengaduan Masuk** — tiket, kategori, prioritas, SLA — @pabrik-aplikasi-gas

---

## Infrastructure

- [PENDING] **Clasp CI/CD** — GitHub Actions untuk auto-push/deploy on merge — @pabrik-aplikasi-gas
- [PENDING] **Environment separation** — dev/staging/prod spreadsheet IDs — @pabrik-aplikasi-gas
