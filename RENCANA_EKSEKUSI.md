# RENCANA EKSEKUSI — Pabrik Aplikasi (breakdown dari Roadmap v1.0)

**Sumber:** `docs/ROADMAP.md` + `docs/Roadmap_Pabrik_Aplikasi.html`
**Tanggal rencana:** 2026-08-26
**Target:** Pabrik "hidup" (2 Gems + N5 email nyata + N1 menu + SOP + Factory Log) dalam 6 hari intensif / 6 minggu santai.

---

## Prinsip eksekusi
1. **Agen (Hermes/JCode) = persiapan & kode.** Anda = otorisasi akun Google & data produksi.
2. **Setiap fase punya exit-gate.** Jangan lanjut sebelum gate hijau.
3. **Satu app = satu spreadsheet.** Soft-delete, bukan hard-delete.
4. **Backup kode `.gs` ke Drive** tiap deploy.
5. **Clasp untuk app WEB_APP** (Inventaris TI sudah jalan). App SHEET_ENGINE/EMAIL_REPORT/DOC_GENERATOR di-setup manual di Sheet + Apps Script (tidak butuh clasp kecuali mau).

---

## FASE 0 — Persiapan akun & akses  [OWNER: ANDA]
**Exit-gate:** Bisa buat Gem, Sheet, dan buka editor Apps Script tanpa error izin.

| # | Task | Deliverable | Status |
|---|------|-------------|:------:|
| 0.1 | Pastikan login Google utama + 2FA ON | Akun terpilih | ☐ |
| 0.2 | Buka gemini.google.com, cek fitur Gem aktif | Akses Gems OK | ☐ |
| 0.3 | Buat folder Drive `Pabrik_Aplikasi/` (struktur: 00_SOP, 01_Gems, 02_Referensi_UI, 03_Template, 04_Factory_Log, 05_Apps) | Folder tree | ☐ |
| 0.4 | Buat Sheet `Factory_Log` dari `04_Factory_Log/Factory_Log_Template.csv` | Log kosong | ☐ |
| 0.5 | Uji buat Apps Script kosong + authorize dummy | Izin OK | ☐ |

**Agen bantu:** `USER_BAGIAN_SAYA.md` sudah ada sebagai panduan langkah Anda.

---

## FASE 1 — Mesin Analis (Gem Niu-Prompt)  [OWNER: ANDA + AGEN]
**Exit-gate:** Brief 5 kalimat selalu menghasilkan blok "PROMPT UNTUK KODER" utuh.

| # | Task | Deliverable | Owner |
|---|------|-------------|:-----:|
| 1.1 | Tempel `01_Gems/system_instruction_analis_v1.2.txt` ke Gem baru "Niu-Prompt \| Analis Sistem WebApp" | Gem hidup | Anda |
| 1.2 | Uji 1 brief sederhana → review blueprint konsisten | Sample output | Anda |
| 1.3 | Backup instruction ke `01_Gems/` di Drive | File .txt | Anda |

**Agen bantu:** Instruction sudah ditulis (`01_Gems/`). Tidak perlu kode.

---

## FASE 2 — Mesin Eksekusi (Gem Niu-Bot) + produk contoh  [OWNER: ANDA + AGEN]
**Exit-gate:** Minimal 1 produk (N5 atau N1) benar-benar jalan di akun Anda.

| # | Task | Deliverable | Owner | Cara |
|---|------|-------------|:-----:|------|
| 2.1 | Tempel `01_Gems/system_instruction_koder_v1.2.txt` ke Gem "Niu-Bot \| GAS WebApp Koder" | Gem hidup | Anda | Manual |
| 2.2 | **Pasang N5 Digest** sampai 1 email HTML masuk inbox | Email nyata | Anda | `05_Apps/N5_Digest_Reporter/ALL_IN_ONE.gs` → tempel ke Sheet → `setupDigestSystem` → dry-run → kirim |
| 2.3 | **Pasang N1 Super Menu** & uji validasi/arsip | Menu jalan | Anda | `05_Apps/N1_Super_Menu_Sheet/ALL_IN_ONE.gs` → tempel → `setupSuperMenu` |
| 2.4 | (Opsional) N9 Generator Surat — butuh template Docs + Folder ID | 1 PDF | Anda | `05_Apps/N9_Generator_Surat/ALL_IN_ONE.gs` + `TEMPLATE_DOCS_SPEC.md` |

**Agen bantu:** Kode N5/N1/N9 sudah siap (`05_Apps/`). Agen bisa deploy via clasp JIKA Anda authorize (`clasp login` butuh browser OAuth).

---

## FASE 3 — Standarisasi Infrastruktur  [OWNER: ANDA + AGEN]
**Exit-gate:** Anda 3 bulan lagi masih bisa ikuti SOP tanpa nebak.

| # | Task | Deliverable | Owner |
|---|------|-------------|:-----:|
| 3.1 | Mirror folder `Pabrik_Aplikasi/` ke Drive (dari repo ini) | Tree di Drive | Anda |
| 3.2 | Salin `00_SOP/SOP_Produksi_Solusi.md` + `CHECKLIST_Deploy_Umum.md` ke Drive | SOP | Anda |
| 3.3 | Isi ≥2 baris Factory Log (N5, N1) | Log terisi | Anda |
| 3.4 | Tetapkan konvensi naming `APP_<DOMAIN>_<NAMA>` | Konvensi | Ag+Anda |

**Agen bantu:** Template & SOP sudah ada di repo (`00_SOP/`, `04_Factory_Log/`).

---

## FASE 4 — Pilot Domain Nyata  [OWNER: ANDA + AGEN]
**Exit-gate:** Produk dipakai ≥3 hari / ≥10 transaksi tanpa rusak total.

| # | Task | Deliverable | Owner | Cara |
|---|------|-------------|:-----:|------|
| 4.1 | **N9 live** (jika kop surat siap) — 1 PDF surat dari baris Sheet | PDF | Anda | Manual Sheet |
| 4.2 | **Web app pertama** — Buku Tamu (W2) atau Inventaris TI (sudah deploy!) | Live URL | Ag+Anda | `inventaris-ti/` sudah LIVE via clasp — uji HP |
| 4.3 | Uji dengan ≥1 user lain (rekan kerja) | Feedback | Anda | Manual |
| 4.4 | Catat bug → update catatan pabrik | Post-mortem | Ag+Anda | Edit `docs/` |

**Status saat ini:**
- ✅ **Inventaris TI (W1)** sudah LIVE: https://script.google.com/macros/s/AKfycbwVANuqz-UvfqqCKaRw6S-JVxBPF0bndRt4EqElaf3SIq4y0fCuzgGDAv0SCTic-Ujv/exec
- ⏳ **Buku Tamu (W2)** butuh coding (minta agen atau lewat Gem Analis→Koder).

---

## FASE 5 — Hardening (Minggu 2+)  [OWNER: AGEN + ANDA]
**Exit-gate:** Definition-of-done keamanan dasar sebelum deploy publik.

| # | Task | Deliverable | Owner |
|---|------|-------------|:-----:|
| 5.1 | Standar auth/whitelist email domain di `code.gs` | Pola aman | Ag+Anda |
| 5.2 | Escape HTML output (anti-XSS) | Pola aman | Ag |
| 5.3 | Gem QA opsional untuk review kode sebelum deploy | Gem ke-3 | Anda |
| 5.4 | Rakit 1 suite (TU / Aset / Panitia) | Suite jalan | Ag+Anda |

---

## FASE 6 — Skala Platform Kecil (1–2 bulan)  [OWNER: ANDA]
| # | Task | Deliverable |
|---|------|-------------|
| 6.1 | Katalog internal link semua produk live | Gallery |
| 6.2 | Library `Utils.gs` berbagi utilitas (validasi, escape, timestamp) | Shared lib |
| 6.3 | Share Gems ke tim (kolaborasi) | Gems tim |
| 6.4 | Kebijakan data publik/internal/sensitif | Policy |

---

## JADWAL REFERENSI

### Sprint 6 hari (intensif)
- **H1:** Fase 0 + Fase 1 (Gems) + folder Drive + N5 setup
- **H2:** N5 email live + N1 pasang
- **H3:** Fase 3 (SOP Drive + Factory Log)
- **H4–5:** N9 template + 1 PDF surat
- **H6:** Web app Buku Tamu v1 (atau uji Inventaris TI di HP)

### Mode hemat (1 hari)
Gems + N5 sampai inbox + SOP singkat. Tunda N9 & web app ke weekend.

### 6 minggu santai
M1 fondasi → M2 N5/N1 → M3 N9 → M4–5 web domain → M5–6 hardening/suite.

---

## METRIK TARGET
| Metrik | Target |
|--------|:------:|
| Brief → live (sederhana) | ≤ 3 jam |
| Revisi Koder / app v1 | ≤ 3 |
| Lolos deploy pertama | ≥ 70% |
| Produk baru / bulan | ≥ 2 |

---

## CHECKLIST "PABRIK HIDUP" (master)
- [ ] 2 Gems v1.2 aktif (Analis + Koder)
- [ ] N5: 1 email nyata diterima
- [ ] N1: menu validasi & arsip jalan
- [ ] SOP + Factory Log di Drive
- [ ] (Bonus) N9: 1 PDF surat
- [ ] (Bonus besar) ≥1 Web App domain live
- [ ] ≥1 trigger produksi stabil 3 hari
- [ ] Backup kode `.gs` tiap app live ke Drive

---

## PEMBAGIAN KERJA (agen vs Anda)
**Agen (sudah/bs dilakukan):** Rencana & arsitektur · ide web/non-web · instruction Gems v1.2 · SOP/checklist/katalog · kode N5/N1/N9 · roadmap HTML · coding lanjutan (W2, N6, API) bila diminta · deploy clasp (setelah Anda login).

**Anda (akun Google):** Buat Gems & tempel instruction · authorize Apps Script/Drive/Docs/Gmail · email penerima & jam trigger · kop surat/logo/template Docs/Folder ID · data produksi & kebijakan akses · uji user nyata · keputusan domain app.

---

*Rencana ini mendampingi, bukan menggantikan, `docs/ROADMAP.md` & `docs/Roadmap_Pabrik_Aplikasi.html`.*
