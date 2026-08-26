# Breakdown & Rencana Lengkap: Pabrik Aplikasi Pribadi
## Ekosistem Web App Builder Serverless (Gemini Gems + Google Sheets + Apps Script)

**Versi:** 1.0  
**Tanggal:** 25 Agustus 2026  
**Dasar:** Transkrip Sesi Ekosistem App (Niu-Prompt / Niu-Bot)  
**Tujuan:** Satu akun Google yang siap memproduksi web app internal kapan saja — dari ide singkat + gambar referensi hingga aplikasi ter-deploy.

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Breakdown Konsep & Arsitektur](#2-breakdown-konsep--arsitektur)
3. [Komponen Pabrik (Apa yang Harus Ada)](#3-komponen-pabrik-apa-yang-harus-ada)
4. [Alur Kerja End-to-End (SOP Produksi)](#4-alur-kerja-end-to-end-sop-produksi)
5. [Rencana Implementasi Bertahap](#5-rencana-implementasi-bertahap)
6. [Spesifikasi Detail Tiap Fase](#6-spesifikasi-detail-tiap-fase)
7. [Blueprint Master Prompt (Isi System Instruction Gems)](#7-blueprint-master-prompt-isi-system-instruction-gems)
8. [Struktur Proyek Aplikasi (Output Standar)](#8-struktur-proyek-aplikasi-output-standar)
9. [Template Infrastruktur Google](#9-template-infrastruktur-google)
10. [Aplikasi Pilot Pertama](#10-aplikasi-pilot-pertama)
11. [Checklist Kesiapan & Acceptance Criteria](#11-checklist-kesiapan--acceptance-criteria)
12. [Roadmap Pematangan (Setelah Pabrik Hidup)](#12-roadmap-pematangan-setelah-pabrik-hidup)
13. [Risiko, Batasan, dan Mitigasi](#13-risiko-batasan-dan-mitigasi)
14. [Metrik Sukses](#14-metrik-sukses)
15. [Lampiran: Glossary & Resource](#15-lampiran-glossary--resource)

---

## 1. Ringkasan Eksekutif

### Apa yang sedang dibangun?
**Pabrik Aplikasi** = sistem berulang di dalam akun Google Anda yang mengubah:

> **Ide singkat + (opsional) gambar referensi**  
> → **Blueprint teknis**  
> → **Kode siap tempel (setup.gs, code.gs, index.html)**  
> → **Database Sheet otomatis**  
> → **Web App live (Deploy as Web App)**

### Mengapa model ini kuat?
| Aspek | Manfaat |
|--------|---------|
| **Biaya** | Hampir Rp0 untuk app internal (kuota Google gratis / Workspace) |
| **Kecepatan** | Prototipe jam, bukan minggu |
| **Serverless** | Tidak kelola VPS, Docker, atau backend terpisah |
| **Terpusat** | Semua di satu Google Account (Gems, Drive, Sheets, Apps Script) |
| **Repeatable** | Gems = “karyawan digital” tetap; SOP sama tiap app baru |

### Tiga mesin pabrik
1. **Mesin Analisis** — Gem *Niu-Prompt* (Sang Arsitek)  
2. **Mesin Eksekusi** — Gem *Niu-Bot* (Sang Koder)  
3. **Mesin Infrastruktur** — Google Sheets + Apps Script + Deploy

```
┌─────────────────────────────────────────────────────────────────┐
│                    PABRIK APLIKASI (1 Google Account)            │
│                                                                  │
│  [Ide + Gambar] ──► GEM ANALIS ──► [Blueprint/Prompt Teknis]     │
│                          │                                       │
│                          ▼                                       │
│                    GEM KODER ──► [setup.gs | code.gs | index.html]│
│                          │                                       │
│                          ▼                                       │
│              SHEETS (DB) + APPS SCRIPT (Runtime) ──► WEB APP LIVE │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Breakdown Konsep & Arsitektur

### 2.1 Prinsip desain
1. **Separation of concerns AI**  
   - Analis *tidak* menulis kode final.  
   - Koder *tidak* merancang ulang requirement.  
   Ini mengurangi “halusinasi campuran” dan membuat output konsisten.
2. **Kontrak output tetap**  
   Setiap app selalu menghasilkan 3 artefak inti: `setup.gs`, `code.gs`, `index.html` (+ opsional `styles` inline / CSS di HTML).
3. **Sheet = database**  
   Satu spreadsheet per app (atau satu spreadsheet multi-sheet untuk suite kecil). Baris = record, kolom = field.
4. **Apps Script = backend + hosting frontend**  
   - `doGet()` melayani HTML  
   - Fungsi `google.script.run` untuk CRUD  
   - Deploy “Execute as: Me”, “Who has access: Anyone” (atau Anyone with Google account, sesuai kebutuhan)
5. **Multimodal sebagai akselerator**  
   Foto form kertas / screenshot app lama = spesifikasi visual yang memotong bolak-balik revisi UI.

### 2.2 Layer arsitektur teknis tiap aplikasi hasil pabrik

```
┌──────────────────────────────────────┐
│  PRESENTATION  │  index.html (HTML/CSS/JS)
│                │  + google.script.run
├──────────────────────────────────────┤
│  APPLICATION   │  code.gs
│  LOGIC         │  CRUD, validasi, auth ringan,
│                │  doGet, API internal
├──────────────────────────────────────┤
│  DATA ACCESS   │  SpreadsheetApp /
│                │  setup.gs (schema + seed)
├──────────────────────────────────────┤
│  DATA STORE    │  Google Sheet (tabs/kolom)
└──────────────────────────────────────┘
         ▲
         │ Deploy Web App
         ▼
   Browser pengguna
```

### 2.3 Pemetaan peran “manusia vs AI vs Google”

| Peran | Dilakukan oleh | Output |
|-------|----------------|--------|
| Product owner | Anda | Ide 3–10 kalimat + gambar (opsional) |
| Business analyst / SA | Gem Analis | Blueprint: entitas, field, alur, UI wireframe teks, acceptance |
| Full-stack coder | Gem Koder | setup.gs, code.gs, index.html |
| DevOps ringan | Anda (klik deploy) | URL Web App |
| Runtime/hosting/DB | Google | Sheet + Apps Script |

### 2.4 Kenapa Gems, bukan chat biasa?
- System instruction **permanen** → tidak copy-paste master prompt tiap sesi.  
- Konsistensi gaya output (format kode, penamaan sheet, pola error handling).  
- Bisa di-share ke akun lain nanti (kolaborasi tim).  
- Cocok jadi “stasiun kerja” tetap di `gemini.google.com`.

---

## 3. Komponen Pabrik (Apa yang Harus Ada)

### 3.1 Inventaris akun Google

| # | Komponen | Lokasi | Status target |
|---|----------|--------|----------------|
| 1 | Google Account (personal/Workspace) | accounts.google.com | Aktif, 2FA ON |
| 2 | Gemini (akses Gems) | gemini.google.com | Paket yang mendukung Gems |
| 3 | Gem **Niu-Prompt / Analis Sistem WebApp** | Gems library | System instruction final |
| 4 | Gem **Niu-Bot / GAS Apps Koder** | Gems library | System instruction final |
| 5 | Folder Drive: `Pabrik_Aplikasi/` | Google Drive | Struktur folder standar |
| 6 | Folder per app: `Apps/<NamaApp>/` | Drive | Kode + sheet + catatan |
| 7 | Spreadsheet template kosong (opsional) | Drive | Clone cepat |
| 8 | Dokumen SOP internal | Drive / Notion | Versi terkontrol |
| 9 | Library gambar referensi | Drive `Referensi_UI/` | Form, mockup, screenshot |
| 10 | Log produksi (Sheet “Factory Log”) | Drive | Catat setiap app yang dibuat |

### 3.2 Struktur folder Drive yang disarankan

```
Pabrik_Aplikasi/
├── 00_SOP/
│   ├── SOP_Produksi_App.md
│   ├── Checklist_Deploy.md
│   └── Changelog_Pabrik.md
├── 01_Gems_Backup/
│   ├── system_instruction_analis.txt
│   └── system_instruction_koder.txt
├── 02_Referensi_UI/
│   ├── form_kertas/
│   ├── screenshot_app_lama/
│   └── moodboard/
├── 03_Template/
│   ├── Spreadsheet_Template_Kosong
│   └── Snippet_Pola_CRUD (doc)
├── 04_Factory_Log/
│   └── Log_Produksi (Google Sheet)
└── 05_Apps/
    ├── App_Pencatatan_TI/
    │   ├── Blueprint.md
    │   ├── setup.gs
    │   ├── code.gs
    │   ├── index.html
    │   └── Sheet (link)
    └── App_.../
```

### 3.3 Dua Gems inti

#### A. Gem Analis — “Niu-Prompt” / Sang Arsitek
**Input:** deskripsi singkat + gambar  
**Output wajib (format kaku):**
1. Ringkasan kebutuhan  
2. Persona & use case  
3. Entitas data + skema kolom Sheet  
4. Aturan bisnis & validasi  
5. Alur layar (screen flow)  
6. Spesifikasi UI (komponen, warna sederhana, layout)  
7. Daftar endpoint/fungsi backend yang dibutuhkan  
8. **Prompt eksekusi siap tempel** untuk Gem Koder  
9. Acceptance criteria checklist  

#### B. Gem Koder — “Niu-Bot” / Sang Builder
**Input:** prompt eksekusi dari Analis + gambar yang sama  
**Output wajib (format kaku):**
1. `setup.gs` — buat sheet, header, data awal, menu custom  
2. `code.gs` — doGet, CRUD, utilitas, keamanan dasar  
3. `index.html` — UI lengkap + client JS  
4. Instruksi tempel & urutan run  
5. Instruksi deploy (klik demi klik)  
6. Catatan troubleshooting umum  

---

## 4. Alur Kerja End-to-End (SOP Produksi)

### 4.1 Diagram SOP (satu siklus app)

```
START
  │
  ▼
[1] Tulis brief 3–10 kalimat + siapkan 1–5 gambar referensi
  │
  ▼
[2] Buka Gem ANALIS → kirim brief + gambar
  │
  ▼
[3] Review Blueprint (koreksi nama field / alur jika perlu)
  │
  ▼
[4] Salin "Prompt Eksekusi" dari Analis
  │
  ▼
[5] Buka Gem KODER → tempel Prompt Eksekusi + unggah gambar yang sama
  │
  ▼
[6] Review kode (sanity check: nama sheet, doGet, CORS/permission tidak relevan di GAS)
  │
  ▼
[7] Buat Spreadsheet baru di folder app
  │
  ▼
[8] Extensions → Apps Script → buat file:
      - setup.gs
      - code.gs
      - index.html  (HTML file type)
  │
  ▼
[9] Run setup (authorize) → sheet terisi header/schema
  │
  ▼
[10] Deploy → New deployment → Web app
       Execute as: Me
       Who has access: Anyone  (atau sesuai kebijakan)
  │
  ▼
[11] Uji CRUD di URL web app
  │
  ▼
[12] Simpan URL + kode ke folder Drive + isi Factory Log
  │
  ▼
END (App v1 live)
```

### 4.2 Aturan emas SOP
1. **Gambar yang sama** dipakai di Analis dan Koder (konsistensi UI).  
2. **Jangan** minta Analis generate full code; **jangan** minta Koder redesign product.  
3. Satu app = satu spreadsheet (kecuali multi-module yang disengaja).  
4. Selalu jalankan `setup` dulu sebelum pakai UI.  
5. Setiap perubahan skema data → update setup + migrasi manual kolom Sheet.  
6. Versi deploy: gunakan “Manage deployments” → New version saat update kode.  
7. Catat di Factory Log: nama app, tanggal, URL, versi Gem instruction.

### 4.3 Waktu siklus ideal (target)

| Tahap | Target waktu |
|-------|----------------|
| Brief + kumpul gambar | 10–20 menit |
| Analis + review blueprint | 15–30 menit |
| Koder + review kode | 15–40 menit |
| Tempel + setup + deploy | 15–25 menit |
| Uji & perbaiki bug kecil | 20–45 menit |
| **Total app sederhana** | **~1.5–3 jam** |

---

## 5. Rencana Implementasi Bertahap

Rencana ini memecah pembangunan **pabrik itu sendiri** (bukan app klien) menjadi fase yang bisa diselesaikan berurutan.

### Fase 0 — Persiapan akun & akses (Hari 1, ~1–2 jam)
**Tujuan:** Semua pintu Google terbuka tanpa hambatan izin.

| No | Aktivitas | Deliverable | Done? |
|----|-----------|-------------|-------|
| 0.1 | Pastikan login Google utama | Akun terpilih | ☐ |
| 0.2 | Aktifkan 2FA | Keamanan dasar | ☐ |
| 0.3 | Buka gemini.google.com, cek fitur **Gem** tersedia | Akses Gems OK | ☐ |
| 0.4 | Buka drive.google.com, buat struktur folder `Pabrik_Aplikasi/` | Folder tree | ☐ |
| 0.5 | Buat Sheet `Factory_Log` dengan kolom standar | Log kosong | ☐ |
| 0.6 | Uji buat Apps Script kosong + authorize dummy | Izin script OK | ☐ |
| 0.7 | Cadangkan password/recovery | Dokumen aman | ☐ |

**Exit criteria Fase 0:** Anda bisa membuat Gem, membuat Sheet, dan membuka editor Apps Script tanpa error izin.

---

### Fase 1 — Bangun Mesin Analisis (Hari 1–2, ~2–4 jam)
**Tujuan:** Gem Analis menghasilkan blueprint + prompt eksekusi yang konsisten.

| No | Aktivitas | Deliverable |
|----|-----------|-------------|
| 1.1 | Tulis system instruction Analis (lihat §7.1) | Teks final |
| 1.2 | Buat Gem baru di Gemini → nama: `Niu-Prompt \| Analis Sistem WebApp` | Gem hidup |
| 1.3 | Set knowledge (opsional): unggah contoh blueprint bagus | Knowledge file |
| 1.4 | Uji 3 brief berbeda (sederhana, menengah, dengan gambar) | 3 sample output |
| 1.5 | Iterasi instruction sampai format output **selalu sama** | v1.0 instruction |
| 1.6 | Simpan backup instruction ke Drive `01_Gems_Backup/` | File .txt |

**Exit criteria Fase 1:** Dari brief 5 kalimat, Analis selalu mengeluarkan bagian “PROMPT UNTUK KODER” yang bisa di-copy utuh.

---

### Fase 2 — Bangun Mesin Eksekusi (Hari 2–3, ~3–5 jam)
**Tujuan:** Gem Koder mengeluarkan 3 file GAS yang langsung tempel-jalan.

| No | Aktivitas | Deliverable |
|----|-----------|-------------|
| 2.1 | Tulis system instruction Koder (lihat §7.2) | Teks final |
| 2.2 | Buat Gem: `Niu-Bot \| GAS WebApp Koder` | Gem hidup |
| 2.3 | Kunci konvensi: nama fungsi CRUD, pola `doGet`, HTML template | Aturan di instruction |
| 2.4 | Uji dengan prompt eksekusi dari Fase 1 | 3 paket kode |
| 2.5 | Tempel manual 1 paket ke Apps Script, run setup, deploy | App “hello factory” |
| 2.6 | Catat error umum → tambahkan ke instruction Koder (self-heal) | Instruction v1.1 |
| 2.7 | Backup instruction | File .txt di Drive |

**Exit criteria Fase 2:** Minimal 1 web app hasil 100% dari Koder berhasil di-deploy dan CRUD jalan.

---

### Fase 3 — Standarisasi Infrastruktur & Template (Hari 3–4, ~2–3 jam)
**Tujuan:** Membuat app baru terasa seperti “jalur perakitan”, bukan eksperimen.

| No | Aktivitas | Deliverable |
|----|-----------|-------------|
| 3.1 | Finalisasi struktur folder per-app | Template folder |
| 3.2 | Buat checklist deploy 1 halaman | `Checklist_Deploy.md` |
| 3.3 | Buat pola naming: `APP_<DOMAIN>_<NAMA>` | Konvensi |
| 3.4 | Isi Factory Log dengan entry pertama | 1 baris log |
| 3.5 | Dokumen SOP 1 halaman “cara bikin app baru” | `SOP_Produksi_App.md` |
| 3.6 | (Opsional) Sheet template dengan script library terikat | Starter spreadsheet |

**Exit criteria Fase 3:** Orang lain (atau Anda 3 bulan kemudian) bisa ikuti SOP tanpa tanya.

---

### Fase 4 — Aplikasi Pilot Nyata (Hari 4–6, ~4–8 jam)
**Tujuan:** Membuktikan pabrik dengan kebutuhan nyata, bukan demo kosong.

**Rekomendasi pilot:** *Pencatatan / Inventaris TI* (sesuai arah sesi sebelumnya)  
atau ganti ke domain Anda: absensi ringan, peminjaman barang, register tamu, dll.

| No | Aktivitas | Deliverable |
|----|-----------|-------------|
| 4.1 | Tulis brief pilot + kumpulkan foto form/screenshot | Paket input |
| 4.2 | Jalankan full SOP §4 tanpa shortcut | Blueprint + kode |
| 4.3 | Deploy internal, uji dengan 5–10 data nyata | App v1 |
| 4.4 | Kumpulkan bug → perbaiki lewat Koder (bukan rewrite manual besar) | App v1.1 |
| 4.5 | Post-mortem: apa yang salah di instruction Gems? | Catatan perbaikan pabrik |
| 4.6 | Update system instruction kedua Gem | v1.2 stabil |

**Exit criteria Fase 4:** App pilot dipakai minimal 3 hari / 10 transaksi tanpa rusak total.

---

### Fase 5 — Hardening Pabrik (Minggu 2, ongoing)
**Tujuan:** Kualitas produksi naik; risiko izin & data turun.

| No | Aktivitas | Prioritas |
|----|-----------|-----------|
| 5.1 | Tambah pola autentikasi sederhana (Session / email whitelist) | Tinggi |
| 5.2 | Standar validasi input & escaped HTML (XSS) | Tinggi |
| 5.3 | Pola soft-delete + timestamp `created_at` / `updated_at` | Sedang |
| 5.4 | Pola export CSV / backup sheet | Sedang |
| 5.5 | Gem ketiga opsional: **QA Reviewer** (review kode sebelum deploy) | Sedang |
| 5.6 | Katalog komponen UI berulang (tabel, modal, toast, form) | Rendah |
| 5.7 | Multi-user roles (Admin/Operator/Viewer) | Sesuai kebutuhan |

**Exit criteria Fase 5:** Ada “definition of done” keamanan dasar sebelum setiap deploy publik.

---

## 6. Spesifikasi Detail Tiap Fase

### 6.1 Cara membuat Gem (langkah UI — generik)
> Label menu Gemini bisa berubah; inti langkahnya sama.

1. Buka [gemini.google.com](https://gemini.google.com)  
2. Masuk ke **Explore Gems** / **Gem manager**  
3. **New Gem**  
4. Isi:
   - **Name:** sesuai §3.3  
   - **Instructions:** tempel system instruction §7  
   - **Knowledge (opsional):** file contoh blueprint / coding standard  
5. **Save**  
6. Pin Gem di sidebar untuk akses cepat  

### 6.2 Konvensi naming global

| Objek | Pola | Contoh |
|-------|------|--------|
| Gem Analis | `Niu-Prompt \| Analis Sistem WebApp` | — |
| Gem Koder | `Niu-Bot \| GAS WebApp Koder` | — |
| Folder app | `App_<NamaPascal>` | `App_InventarisTI` |
| Spreadsheet | `[APP] <Nama> DB` | `[APP] Inventaris TI DB` |
| Web App title | `<Nama> v<major>` | `Inventaris TI v1` |
| Sheet tab master data | `MASTER_<ENTITAS>` | `MASTER_ASET` |
| Sheet log | `LOG_AKTIVITAS` | — |
| Fungsi create | `create<Entitas>` | `createAset` |
| Fungsi read | `get<Entitas>List` / `get<Entitas>ById` | `getAsetList` |
| Fungsi update | `update<Entitas>` | `updateAset` |
| Fungsi delete | `delete<Entitas>` (soft) | `deleteAset` |

### 6.3 Kebijakan izin deploy (pilih satu per app)

| Mode akses | Kapan dipakai | Risiko |
|------------|---------------|--------|
| Only myself | Prototipe pribadi | Rendah |
| Anyone with Google account | Tim internal ber-akun Google | Sedang |
| Anyone (even anonymous) | Form publik / survey ringan | Tinggi — wajib validasi & rate-limit mental |

**Default pabrik untuk app internal:** *Anyone with Google account* + filter email domain di `code.gs` jika perlu.

### 6.4 Urutan file di editor Apps Script
1. Buat project bound ke Spreadsheet (disarankan) agar `SpreadsheetApp.getActive()` sederhana.  
2. File:
   - `setup.gs`  
   - `code.gs`  
   - `index.html` (File → New → HTML)  
3. Di `code.gs`:

```javascript
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('NAMA_APP')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
```

4. Run `setupDatabase` (atau nama setup Anda) → Authorize → izinkan.  
5. Deploy.

### 6.5 Factory Log — skema kolom

| Kolom | Keterangan |
|-------|------------|
| app_id | `APP-001` |
| nama_app | Inventaris TI |
| tanggal_buat | 2026-08-25 |
| pemilik | email Anda |
| folder_drive_url | link |
| spreadsheet_url | link |
| webapp_url | link |
| versi_kode | 1.2.0 |
| versi_gem_analis | 1.0 |
| versi_gem_koder | 1.1 |
| status | draft / live / archived |
| catatan | — |

---

## 7. Blueprint Master Prompt (Isi System Instruction Gems)

> Salin, sesuaikan gaya bahasa, lalu tempel ke Gem. Simpan juga ke Drive backup.

### 7.1 System Instruction — Gem ANALIS (Niu-Prompt)

```text
Anda adalah Niu-Prompt, Analis Sistem & Solution Architect untuk Web App serverless
berbasis Google Sheets + Google Apps Script + HTML Service.

PERAN ANDA:
- Mengubah brief user (teks + gambar) menjadi blueprint teknis yang rapi.
- ANDA TIDAK MENULIS KODE LENGKAP aplikasi.
- Anda MENYIAPKAN "PROMPT EKSEKUSI" yang akan ditembak ke Gem Koder (Niu-Bot).

KONTEKS TEKNOLOGI WAJIB:
- Database: Google Sheets (satu spreadsheet, multi tab bila perlu)
- Backend: Apps Script (code.gs)
- Setup skema: setup.gs
- Frontend: index.html (HTML + CSS + JS), komunikasi via google.script.run
- Deploy: Apps Script Web App

SAAT USER MEMBERI GAMBAR:
- Baca layout, field, label, alur, dan hierarki informasi dari gambar.
- Sebutkan secara eksplisit temuan visual yang memengaruhi skema & UI.

FORMAT OUTPUT WAJIB (urut dan lengkap, gunakan Markdown):

# 1. Ringkasan Kebutuhan
# 2. Asumsi & Batasan
# 3. Persona & Use Case
# 4. Screen Flow
# 5. Skema Database (per tab Sheet)
   - Nama tab
   - Kolom: nama_kolom | tipe | wajib | default | catatan
   - Selalu sertakan: id, created_at, updated_at, is_deleted
# 6. Aturan Bisnis & Validasi
# 7. Spesifikasi UI
   - Layout, komponen, state kosong, state loading, pesan error
   - Mobile-first sederhana
# 8. Daftar Fungsi Backend (kontrak)
   - namaFungsi(param) → return
# 9. Acceptance Criteria
# 10. PROMPT EKSEKUSI UNTUK KODER
   - Blok ini harus SELF-CONTAINED (bisa di-copy tanpa konteks chat lain)
   - Sertakan: ringkasan, skema lengkap, kontrak fungsi, arahan UI, constraint GAS
   - Perintahkan Koder mengeluarkan HANYA: setup.gs, code.gs, index.html,
     plus instruksi pasang & deploy

ATURAN KUALITAS:
- Nama tab & kolom: SNAKE_CASE huruf besar untuk tab, snake_case untuk kolom.
- Hindari fitur di luar GAS/Sheets (tidak ada Node, SQL server, dll) kecuali diminta.
- Jika brief ambigu, buat asumsi rasional dan tuliskan di bagian Asumsi.
- Bahasa output: Bahasa Indonesia, istilah teknis boleh Inggris.
```

### 7.2 System Instruction — Gem KODER (Niu-Bot)

```text
Anda adalah Niu-Bot, Senior Google Apps Script Engineer + Frontend Engineer.
Tugas Anda: mengimplementasikan Web App dari PROMPT EKSEKUSI arsitek.

STACK WAJIB:
- setup.gs  : membuat/reset tab, header, data sample, custom menu
- code.gs   : doGet, include (opsional), seluruh API server-side
- index.html: UI tunggal (boleh multi-section), CSS internal, JS client

ATURAN KODE:
1. Jangan pakai library eksternal yang butuh build (no React/Vue CDN berlebihan
   kecuali diminta; prioritaskan HTML/CSS/JS vanilla yang bersih).
2. Semua CRUD lewat google.script.run dengan withSuccessHandler/withFailureHandler.
3. Soft delete: is_deleted = true; list default menampilkan yang aktif saja.
4. id: gunakan Utilities.getUuid() atau pola timestamp+random yang unik.
5. Timestamp: ISO string atau Utilities.formatDate dengan timezone Asia/Jakarta.
6. Escape output teks ke HTML untuk cegah XSS dasar.
7. Validasi server-side wajib (jangan percaya client saja).
8. setup.gs harus idempotent sejauh mungkin (jangan duplikasi header jika sudah ada,
   atau sediakan mode reset yang eksplisit).
9. Bound script: gunakan SpreadsheetApp.getActiveSpreadsheet().
10. doGet mengembalikan HtmlService createTemplateFromFile('index') atau createHtmlOutputFromFile.
11. UI: rapi, kontras cukup, responsif sederhana, ada feedback loading.
12. Beri komentar singkat di bagian penting, jangan spam komentar.

FORMAT OUTPUT WAJIB:
## A. setup.gs
```javascript
// kode lengkap
```

## B. code.gs
```javascript
// kode lengkap
```

## C. index.html
```html
<!-- kode lengkap -->
```

## D. Instruksi Pemasangan (nomor langkah)
## E. Instruksi Deploy Web App
## F. Uji Coba (daftar skenario test)
## G. Troubleshooting Cepat

Jika ada gambar referensi: cocokkan hierarki informasi & field UI sedekat mungkin.
Jika prompt eksekusi kurang lengkap: lengkapi dengan asumsi minimal dan sebutkan di awal.
JANGAN meminta user menginstal server lain.
Bahasa penjelasan: Bahasa Indonesia.
```

### 7.3 Prompt user singkat (template tiap app baru)

**Ke Analis:**
```text
Buatkan blueprint Web App dengan detail berikut:

Nama aplikasi: ...
Masalah yang diselesaikan: ...
Pengguna utama: ...
Data yang dicatat: ...
Proses bisnis singkat: ...
Kebutuhan khusus: (// filter, export, role, dsb.)
Preferensi UI: (// sederhana / gelap / warna instansi)

[Lampirkan gambar referensi jika ada]
```

**Ke Koder:**
```text
Implementasikan Web App GAS sesuai prompt eksekusi berikut.
Patuhi output setup.gs, code.gs, index.html.

----- PROMPT EKSEKUSI -----
(tempel utuh dari Gem Analis)
----- END -----

[Lampirkan gambar referensi yang sama]
```

---

## 8. Struktur Proyek Aplikasi (Output Standar)

### 8.1 setup.gs — tanggung jawab
- `onOpen()` → custom menu “⚙️ Setup Aplikasi”
- `setupDatabase()` → buat tab + header
- `seedSampleData()` → data contoh (opsional, bisa dipisah)
- `resetDatabase()` → hanya untuk dev, konfirmasi ketat

### 8.2 code.gs — tanggung jawab
- `doGet(e)`
- Helper: `getSheet_(name)`, `sheetToObjects_()`, `requireFields_()`
- CRUD per entitas
- (Opsional) `getCurrentUser()`, whitelist
- (Opsional) `exportData()`

### 8.3 index.html — tanggung jawab
- Struktur: header, nav/section, main, toast/modal
- Form create/edit
- Tabel list + search/filter
- Client API wrapper:

```javascript
function api(fn, ...args) {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)[fn](...args);
  });
}
```

### 8.4 Pola data baris Sheet
Setiap tab transaksi minimal:

| id | field... | created_at | updated_at | created_by | is_deleted |
|----|----------|------------|------------|------------|------------|

---

## 9. Template Infrastruktur Google

### 9.1 Langkah membuat “slot” app baru (15 menit)
1. Drive → `05_Apps` → New folder `App_Nama`  
2. Di dalam folder: New Google Sheet `[APP] Nama DB`  
3. Sheet → Extensions → Apps Script  
4. Rename project: `Nama — WebApp`  
5. Buat file `setup.gs`, `code.gs`, `index.html`  
6. Tempel output Koder  
7. Run setup → Deploy  
8. Simpan URL ke doc `README` di folder + Factory Log  

### 9.2 Checklist Deploy (cetak mental)

```
[ ] Kode sudah di-save di Apps Script
[ ] setupDatabase sudah dijalankan sukses
[ ] Header sheet sesuai skema
[ ] Sample / data uji ada minimal 1 baris
[ ] Deploy → New deployment → Type: Web app
[ ] Description: vX.Y.Z - catatan
[ ] Execute as: Me
[ ] Who has access: <sesuai kebijakan>
[ ] Authorize akses
[ ] Buka URL incognito → uji create
[ ] Uji read list
[ ] Uji update
[ ] Uji delete (soft)
[ ] Mobile smoke test
[ ] Catat URL di Factory Log
[ ] Backup salinan kode ke Drive folder app (.gs/.html text)
```

### 9.3 Update versi (setelah bugfix dari Koder)
1. Edit file di Apps Script  
2. Save  
3. Deploy → Manage deployments → Edit (pensil) → **New version** → Deploy  
4. Hard refresh browser (Ctrl+Shift+R)  
5. Update versi di Factory Log  

---

## 10. Aplikasi Pilot Pertama

### 10.1 Rekomendasi: Inventaris / Pencatatan Aset TI
Cocok sebagai pilot karena:
- Entitas jelas (Aset, Kategori, Lokasi, Riwayat)
- CRUD + status (tersedia/dipinjam/rusak)
- Form kertas sering sudah ada → multimodal berguna
- Nilai langsung terasa di kerja sehari-hari

### 10.2 Brief siap pakai (tempel ke Analis)

```text
Buatkan blueprint Web App "Inventaris Aset TI".

Masalah: pencatatan aset komputer/periferal masih di kertas/Excel berantakan.
Pengguna: staf TI / admin inventaris.
Kebutuhan:
- Catat aset: kode_aset, nama, kategori, merek, serial_number, lokasi,
  kondisi (baik/rusak/hilang), status (tersedia/dipakai/dipinjam),
  pemegang, tanggal_perolehan, keterangan
- Cari & filter by kategori, lokasi, status, kondisi
- Edit & nonaktifkan aset (soft delete)
- Dashboard ringkas: total aset, jumlah per status
- UI sederhana, cepat dipakai di HP

[Opsional: unggah foto form serah terima / Excel lama]
```

### 10.3 Definition of Done pilot
- [ ] Create aset baru dari HP  
- [ ] Filter “status = dipinjam” akurat  
- [ ] Edit pemegang tersimpan  
- [ ] Soft delete hilang dari list, masih ada di Sheet  
- [ ] 2 orang uji tanpa penjelasan panjang (>80% sukses self-serve)  
- [ ] URL dan kode tersimpan di folder pabrik  

---

## 11. Checklist Kesiapan & Acceptance Criteria

### 11.1 Pabrik dianggap “v1 hidup” jika:
| # | Kriteria | Bukti |
|---|----------|-------|
| 1 | 2 Gems aktif dengan instruction final | Screenshot / link Gem |
| 2 | Backup instruction di Drive | File ada |
| 3 | Struktur folder Pabrik_Aplikasi lengkap | Tree Drive |
| 4 | SOP 1 halaman bisa diikuti | Dokumen |
| 5 | Factory Log terisi ≥1 app | Sheet |
| 6 | ≥1 Web App hasil full-cycle SOP | URL live |
| 7 | Siklus app kedua < 3 jam untuk kasus sederhana | Catatan waktu |
| 8 | Multimodal diuji minimal 1x (brief + gambar) | Output lebih selaras UI |

### 11.2 Definition of Done tiap app hasil pabrik
- Skema Sheet = dokumentasi blueprint  
- CRUD utama jalan  
- Deploy URL stabil  
- Backup kode di Drive  
- Entry Factory Log  
- Daftar bug known (jika ada)  

---

## 12. Roadmap Pematangan (Setelah Pabrik Hidup)

### Horizon A — 2 minggu
- Library prompt “add-on”: login sederhana, upload file ke Drive, notifikasi EmailApp  
- Gem QA: review security & edge case sebelum deploy  
- Template UI konsisten (satu desain system mini)

### Horizon B — 1–2 bulan
- Monorepo pola: banyak app share `Utils.gs` lewat library Apps Script  
- App gallery internal (halaman indeks link semua web app)  
- Pengukuran: waktu cycle, jumlah revisi Koder per app  

### Horizon C — skala tim
- Share Gems ke rekan (jika kebijakan Google account mengizinkan)  
- Role Admin pabrik (yang boleh ubah instruction)  
- Klasifikasi data (publik / internal / sensitif) → aturan deploy berbeda  
- Pertimbangan migrasi app kritis ke stack lebih kuat (Cloud Run, dll.) bila kuota/Limits GAS terasa  

---

## 13. Risiko, Batasan, dan Mitigasi

| Risiko / Batasan | Dampak | Mitigasi |
|------------------|--------|----------|
| Kuota Apps Script (runtime, URL Fetch, email) | App gagal saat beban | Desain ringan; batch; hindari loop mahal |
| Sheet bukan DB transactional | Race condition | App concurrency rendah; lock sederhana / append-only log |
| “Anyone” link bocor | Data terekspos | Whitelist email; jangan simpan data sensitif; review sharing |
| AI salah skema | Rework | Kontrak format kaku; human review blueprint 5 menit |
| AI kode usang/bug | Deploy gagal | Gem QA; test checklist; simpan snippet yang sudah proven |
| Batas HTML Service | UI kompleks susah | Tetap sederhana; pecah app besar |
| Ketergantungan 1 akun | Single point of failure | Backup kode rutin; export Sheet berkala |
| Perubahan UI Gemini/Gems | SOP usang | SOP berbasis prinsip, bukan hanya screenshot menu |
| Compliance data (PII) | Risiko hukum/organisasi | Klasifikasi data; hindari NIK/finansial di Sheet publik |

**Batas jujur pabrik ini:**  
Sangat unggul untuk **CRUD internal, form, dashboard ringan, MVP, tools staf**.  
Kurang cocok untuk **transaksi finansial high-risk, real-time kolaborasi masif, workload berat, atau compliance ketat** tanpa arsitektur tambahan.

---

## 14. Metrik Sukses

### Metrik pabrik (proses)
| Metrik | Target awal |
|--------|-------------|
| Waktu brief → URL live (app sederhana) | ≤ 3 jam |
| Jumlah revisi Koder per app v1 | ≤ 3 putaran |
| % app yang lolos checklist deploy pertama kali | ≥ 70% |
| App berhasil per bulan | ≥ 2 |

### Metrik produk (hasil)
| Metrik | Target |
|--------|--------|
| Pengguna aktif mingguan app pilot | ≥ 3 orang |
| Transaksi terekam / minggu | ≥ 20 |
| Bug critical terbuka > 7 hari | 0 |

---

## 15. Lampiran: Glossary & Resource

### Glossary
| Istilah | Arti |
|---------|------|
| **Pabrik Aplikasi** | Ekosistem berulang pembuat web app di akun Google |
| **Gem** | Agen Gemini dengan system instruction permanen |
| **Niu-Prompt** | Gem analis / master prompter |
| **Niu-Bot** | Gem koder Apps Script |
| **Blueprint** | Spesifikasi sistem hasil Analis |
| **Prompt Eksekusi** | Instruksi self-contained untuk Koder |
| **Bound script** | Apps Script yang terikat ke file Sheet |
| **Web App deploy** | Publikasi `doGet` sebagai URL |
| **Soft delete** | Tandai hapus tanpa buang baris |
| **Factory Log** | Register seluruh app produksi |

### Resource resmi (baca saat perlu)
- Google Apps Script HTML Service  
- Spreadsheet service  
- Web app deployment  
- Gemini Gems help (bantuan produk Google)

### Artefak yang harus Anda miliki di akhir eksekusi rencana ini
1. ✅ Gem Analis  
2. ✅ Gem Koder  
3. ✅ Folder Drive pabrik  
4. ✅ SOP + Checklist deploy  
5. ✅ Factory Log  
6. ✅ Backup system instruction  
7. ✅ Minimal 1 app live hasil pabrik  
8. ✅ Post-mortem singkat + instruction v1.2  

---

## Lampiran Operasional: Jadwal 6 Hari (Contoh Eksekusi)

| Hari | Fokus | Output akhir hari |
|------|--------|-------------------|
| **Hari 1** | Fase 0 + mulai Fase 1 | Folder pabrik + draft Gem Analis |
| **Hari 2** | Selesai Gem Analis + mulai Gem Koder | 3 sample blueprint bagus |
| **Hari 3** | Gem Koder stabil + hello-factory deploy | Web app dummy live |
| **Hari 4** | SOP + template + Factory Log | Pabrik “terdokumentasi” |
| **Hari 5** | Pilot app full cycle | Inventaris TI v1 URL |
| **Hari 6** | Uji user + perbaiki instruction | Pabrik v1.2 + pilot v1.1 |

---

## Penutup: Urutan Prioritas Jika Waktu Terbatas

Jika hanya punya **satu hari**, kerjakan urutan ini saja:

1. Buat folder Drive + Factory Log (30 mnt)  
2. Buat Gem Analis dengan instruction §7.1 (45 mnt)  
3. Buat Gem Koder dengan instruction §7.2 (45 mnt)  
4. Jalankan 1 siklus app paling sederhana: **To-Do / Buku Tamu** (2–3 jam)  
5. Tulis SOP setengah halaman dari apa yang baru Anda lakukan (20 mnt)  

Itu sudah cukup untuk menyatakan: **pabrik v0.9 hidup** — lalu perhalus di minggu berikutnya.

---

*Dokumen ini adalah rencana induk (master plan). Eksekusi mengikuti fase; jangan membangun semua fitur Horizon C sebelum Fase 4 selesai.*
