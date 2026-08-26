# Ide di Luar Web App — yang Tetap Bisa Diproduksi Pabrik Aplikasi
## Ekosistem Gemini Gems + Google Sheets + Apps Script (diperluas)

**Tanggal:** 25 Agustus 2026  
**Pendamping:** `Rencana_Pabrik_Aplikasi_Ekosistem.md`, `10_Ide_Web_App_Pabrik.md`  
**Inti:** Pabrik Anda *bukan* hanya mesin pembuat web app. Intinya adalah:

> **Brief + gambar → Analis → kontrak sistem → Koder → artefak Google yang jalan sendiri**

Web app (`index.html` + deploy) hanyalah **satu bentuk kemasan**. Di bawah ini: bentuk kemasan lain, 24 ide konkret, adaptasi SOP, dan prioritas produksi.

---

## 1. Mindset: dari “Pabrik Web App” ke “Pabrik Solusi Google”

| Kemasan (output) | Runtime utama | Perlu `index.html`? | Deploy Web App? |
|------------------|---------------|---------------------|-----------------|
| A. Web App klasik | HTML Service | Ya | Ya |
| B. **Mesin Sheet** (menu + otomasi) | Bound Apps Script | Tidak / opsional | Tidak |
| C. **Layanan Email / Laporan** | Trigger waktu + MailApp/GmailApp | Tidak | Tidak |
| D. **Generator Dokumen** | Docs + Sheets + Drive | Opsional preview | Opsional |
| E. **Endpoint API mini** | `doGet` / `doPost` JSON | Tidak | Ya (sebagai API) |
| F. **Google Chat / notifikasi bot** | Chat webhook / Chat App sederhana | Tidak | Kadang |
| G. **Pipeline data** | Trigger + Sheet + UrlFetchApp | Tidak | Tidak |
| H. **Form-driven system** | Google Form + script | Tidak | Tidak |
| I. **Sidebar / dialog tool** | HTML Service *dialog* di Sheet/Docs | Ya (UI kecil) | Tidak (container-bound) |
| J. **Hybrid** | Kombinasi B+C+D+E | Bergantung | Bergantung |

**Yang berubah di pabrik:**  
Gem Koder tidak selalu diminta “tiga file web app”, melainkan **paket artefak sesuai kemasan** (lihat §4).

---

## 2. Kapabilitas tersembunyi yang harus dimanfaatkan

Apps Script + Google Workspace bisa memproduksi solusi lewat:

1. **Custom menu & dialog** di Spreadsheet/Docs  
2. **Installable triggers** — time-driven, onEdit, onFormSubmit, onChange  
3. **MailApp / GmailApp** — kirim laporan, approval, reminder  
4. **DocumentApp / SlidesApp** — cetak surat, sertifikat, notulen, proposal  
5. **DriveApp** — folder otomatis, arsip, rename massal  
6. **CalendarApp** — buat event dari baris Sheet  
7. **FormApp** — generate/kelola form programatik  
8. **UrlFetchApp** — panggil API eksternal (payment gateway ringan, Telegram, webhook n8n, Gemini API, dll.)  
9. **HtmlService sebagai UI internal** (sidebar) tanpa “web app publik”  
10. **PropertiesService / CacheService / LockService** — konfigurasi & anti-race ringan  
11. **doPost JSON API** — terima data dari form luar, IoT sederhana, atau app mobile no-code  

Ini membuka produk yang **bukan website**, tapi tetap “aplikasi” bagi pengguna akhir.

---

## 3. 24 Ide Non–Web App (siap masuk pabrik)

Dikelompokkan per jenis kemasan. Tiap ide: masalah, output pabrik, kompleksitas, brief pendek.

### Kelompok B — Mesin di dalam Spreadsheet (tanpa browser app)

---

#### Ide N1 — Panel Admin Sheet “Super Menu”
**Bukan web app:** user hanya buka Spreadsheet; semua aksi lewat menu `🚀 Operasi`.

**Masalah:** staf takut “rusak sheet”; butuh tombol aman untuk proses rutin.  
**Output pabrik:**
- `Code.gs` + optional `Dialog.html`
- Menu: Validasi data, Deduplikasi, Arsip baris, Generate ID, Reset filter view  
**Kompleksitas:** Rendah  
**Brief Analis:**
```text
Rancang "mesin operasi" bound ke Spreadsheet (bukan web app).
Kebutuhan menu: (1) validasi kolom wajib, (2) tandai duplikat, (3) arsipkan baris selesai
ke tab ARSIP, (4) generate kode otomatis, (5) ringkas statistik ke tab DASHBOARD.
Tanpa deploy web app. Sertakan kontrak fungsi dan skema tab.
```

---

#### Ide N2 — Data Quality Guard (Penjaga Mutu Data)
**Produk:** script + aturan yang jalan `onEdit` / menu “Scan Mutu”.

**Masalah:** input asal-asalan (tanggal salah, email invalid, status di luar daftar).  
**Output:** highlight merah, tab `LOG_ERROR`, email mingguan ringkas ke admin.  
**Kompleksitas:** Rendah–menengah  
**Cocok multimodal:** screenshot Excel berantakan sebagai contoh “data jelek”.

---

#### Ide N3 — Approval Workflow di Sheet (Tanpa Web)
**Produk:** alur pengajuan di baris Sheet + kolom status + notifikasi email.

**Alur:** Staf isi baris → status `Menunggu` → atasan buka sheet / terima email → menu **Setujui/Tolak** → email balik ke pemohon.  
**Output:** `Code.gs`, template email, tab `PENGAJUAN`, `LOG_APPROVAL`.  
**Kompleksitas:** Menengah  
**Bedanya dari web app tiket:** UX-nya *spreadsheet-native* (akrab untuk admin TU/keuangan).

---

#### Ide N4 — Import–Transform–Load (ITL) Mini ETL
**Produk:** tombol “Ambil file”, bersihkan, muat ke master.

**Masalah:** tiap minggu terima CSV/Excel beda format dari cabang/vendor.  
**Output:** mapping kolom di tab `CONFIG_MAP`, fungsi transform, log gagal.  
**Kompleksitas:** Menengah  
**Upgrade:** baca file dari folder Drive tertentu otomatis tiap malam.

---

### Kelompok C — Mesin Email, Reminder & Laporan Otomatis

---

#### Ide N5 — Daily/Weekly Digest Reporter
**Bukan web app:** setiap pagi/Senin, email HTML ringkas dari data Sheet.

**Contoh isi email:** jumlah tamu kemarin, tiket open, stok menipis, surat belum disposisi.  
**Output:** trigger time-driven, template HTML email, tab `CONFIG_REPORT`.  
**Kompleksitas:** Rendah  
**Nilai:** “app yang datang ke inbox”, zero training UI.

**Brief:**
```text
Rancang layanan laporan otomatis (bukan web app).
Sumber: beberapa tab Sheet.
Jadwal: setiap hari kerja jam 07.30 timezone Asia/Jakarta.
Isi email HTML: KPI ringkas + tabel 5 baris teratas yang butuh tindakan.
Konfigurasi penerima di tab CONFIG.
```

---

#### Ide N6 — Reminder Jatuh Tempo (Kontrak, Pajak, Servis, Pinjam)
**Produk:** scanner tanggal + email/calendar reminder H-7, H-3, H-0.

**Masalah:** tanggal penting hanya “diingat orang”.  
**Output:** tab `REMINDER_ITEMS`, log terkirim, cegah double-send.  
**Kompleksitas:** Rendah–menengah  
**Hybrid populer:** gabung dengan web app peminjaman *atau* jalan murni dari Sheet.

---

#### Ide N7 — Mail Merge Massal Terarah (Bukan spam buta)
**Produk:** gabungan Sheet kontak + template Docs/Gmail draft.

**Contoh:** undangan kegiatan, tagihan internal non-resmi, pengumuman per segmen.  
**Output:** preview mode, batch kirim bertahap (anti kuota), log status per baris.  
**Kompleksitas:** Menengah  
**Hati-hati:** patuhi kebijakan anti-spam & persetujuan penerima.

---

#### Ide N8 — Escalation Bot Email
**Produk:** jika tiket/status diam > X jam, eskalasi ke atasan + CC.

**Beda dari N5:** event-driven ke jarum jam SLA, bukan ringkasan umum.  
**Kompleksitas:** Menengah  

---

### Kelompok D — Generator Dokumen, Sertifikat, PDF

---

#### Ide N9 — Pabrik Surat Otomatis (Docs dari baris Sheet)
**Bukan web app:** pilih baris → menu **Cetak Surat** → Google Doc / PDF di Drive.

**Contoh surat:** tugas, keterangan, disposisi, SP, undangan, MoU ringkas.  
**Output:**
- Template Docs ber-placeholder `{{NAMA}}`, `{{NOMOR}}`, …
- Script merge + simpan ke folder per tahun/bulan  
**Kompleksitas:** Menengah  
**Multimodal:** foto kop surat / template lama → Analis petakan field.

**Brief:**
```text
Rancang generator surat dari Google Sheet + template Google Docs (bukan web app).
Tab DATA_SURAT berisi field ...
Template Docs memakai placeholder {{FIELD}}.
Fungsi: generate satu baris, generate batch filter status=siap,
simpan PDF ke folder Drive, tulis link balik ke Sheet, update status.
```

---

#### Ide N10 — Sertifikat Kegiatan / Piagam Massal
**Produk:** merge nama peserta → Slides/Docs bersertifikat → export PDF folder zip-like (folder Drive).

**Kompleksitas:** Menengah  
**Sangat laku** untuk diklat, seminar, lomba internal.

---

#### Ide N11 — Generator Notulen & Risalah Rapat
**Produk:** form isi poin rapat di Sheet → satu klik jadi Docs notulen berformat.

**Field:** hadir, agenda, keputusan, action item, due date.  
**Bonus:** action item otomatis masuk tab `TUGAS` (ide hybrid dengan kanban).  
**Kompleksitas:** Menengah  

---

#### Ide N12 — Invoice / Kuitansi Internal Sederhana
**Produk:** nomor urut + item line di Sheet → PDF kuitansi.

**Peringatan batas pabrik:** jangan untuk sistem keuangan kritis/pajak resmi tanpa review.  
**Cocok untuk:** panitia, kas kecil kegiatan, unit usaha internal non-compliance berat.  
**Kompleksitas:** Menengah  

---

### Kelompok E — API Mini & Integrasi (tanpa UI web “app”)

---

#### Ide N13 — JSON API Gateway ke Sheet
**Kemasan:** Web App deploy, tapi **bukan UI** — hanya `doGet`/`doPost` JSON.

**Kegunaan:**  
- Diterima data dari Google Form HTML kustom di tempat lain  
- Ditulis oleh app Android no-code / Flutter sederhana  
- Dipanggil dari `curl`, Power Automate, Make, n8n  

**Output:** API key sederhana di header/query, rate-limit mental, CORS tidak relevan di GAS klasik (klien server-side lebih aman).  
**Kompleksitas:** Menengah  

**Contoh endpoint mental:**
- `POST ?action=createTamu` body JSON  
- `GET ?action=listOpenTickets`  

Ini tetap “produk pabrik”, tapi konsumennya **sistem lain**, bukan manusia di browser.

---

#### Ide N14 — Webhook Penerima (Telegram / Form luar / IoT ringan)
**Produk:** `doPost` menampung webhook, menulis Sheet, membalas OK.

**Contoh:**  
- Bot Telegram “lapor rusak” → baris tiket  
- Tombol Zapier/Make → Sheet  
- Sensor/ESP (jarang, tapi mungkin) kirim status  

**Kompleksitas:** Menengah–tinggi (tergantung platform luar)  
**Catatan pabrik:** Koder harus diajari pola verifikasi secret token.

---

#### Ide N15 — Sinkronisasi Dua Arah Ringan Sheet ↔ API Eksternal
**Produk:** job malam tarik data (mis. kurs, cuaca, status pengiriman, CRM terbatas).

**Kompleksitas:** Menengah–tinggi (tergantung API)  
**Nilai:** Sheet jadi “dashboard hidup” tanpa web app.

---

### Kelompok F — Bot & Notifikasi Interaktif

---

#### Ide N16 — Google Chat Notification Bot (Workspace)
**Produk:** ruang Chat dapat ringkas harian / alert stok / tiket baru.

**Syarat:** Google Workspace + wehook atau Chat app sederhana.  
**Kompleksitas:** Menengah  
**Alternatif personal:** Telegram bot lewat UrlFetchApp (Ide N14).

---

#### Ide N17 — “SMS-like” lewat Email-to-SMS atau API pihak ketiga
**Produk:** notifikasi kritis ke HP (lewat provider).  
**Kompleksitas:** Menengah + biaya provider  
**Hanya jika** email tidak cukup.

---

### Kelompok G — Otomasi Drive, Calendar, Form

---

#### Ide N18 — Penata Folder Drive Otomatis
**Produk:** dari baris proyek/kegiatan → buat pohon folder standar + sharing.

```
Proyek_X/
  01_Kontrak/
  02_Korespondensi/
  03_Deliverable/
  04_Arsip/
```
**Output:** link folder ditulis balik ke Sheet; permission per role email.  
**Kompleksitas:** Rendah–menengah  
**Sangat “non-web”** tapi dampak organisasinya besar.

---

#### Ide N19 — Calendar Factory dari Sheet Jadwal
**Produk:** baris jadwal → event Calendar + update event jika berubah.

**Contoh:** jadwal piket, sidang, pemakaian aula (tanpa UI booking web).  
**Kompleksitas:** Menengah  
**Aturan:** hindari duplikasi event (simpan `event_id` di Sheet).

---

#### Ide N20 — Google Form Factory + Router Jawaban
**Produk:** script membuat Form dari template konfigurasi; onFormSubmit memecah ke tab berbeda / kirim email beda jalur.

**Contoh:** satu gerbang “Layanan Umum” → cabang IT / HU / protokol.  
**Kompleksitas:** Menengah  
**Beda dari web app:** UI input = Google Form (akrab, cepat, ada progres), otak = pabrik script.

---

### Kelompok H — AI di dalam pabrik (meta-otomasi)

---

#### Ide N21 — Klasifikasi & Ringkas Otomatis (Gemini API dari Apps Script)
**Produk:** baris keluhan panjang → kolom `kategori_ai`, `ringkasan_ai`, `prioritas_ai`.

**Alur:** trigger onFormSubmit / menu “Proses AI” → UrlFetch ke Gemini API → tulis hasil.  
**Kompleksitas:** Menengah  
**Meta:** pabrik Anda memakai Gemini *dua lapis* — Gem builder + model runtime di script.

**Syarat:** API key di Script Properties (jangan hardcode di repo/Drive publik).

---

#### Ide N22 — Asisten Draft Balasan (Sheet-side)
**Produk:** pilih baris surat/tiket → generate draft balasan ke kolom / Docs.

**Kompleksitas:** Menengah  
**Manusia tetap approve** sebelum kirim (human-in-the-loop).

---

### Kelompok I — Produk “Mainan Produktif” & Hybrid Unik

---

#### Ide N23 — QR Batch Generator + Label Data
**Produk:** dari master aset/peserta → generate URL/teks QR (lewat API/ liber QR image) → simpan di Drive → link di Sheet.

**Dipakai untuk:** label inventaris, check-in kegiatan (QR mengarah ke web app absensi *atau* Form).  
**Kompleksitas:** Menengah  
**Hybrid sempurna:** N23 (non-UI) + web app absensi (UI).

---

#### Ide N24 — “Paket Operasional Harian” (Hybrid Bundle)
**Bukan satu app — satu produk gabungan** yang pabrik keluarkan sebagai *suite*:

| Modul | Jenis |
|-------|--------|
| Input cepat | Google Form atau web app mini |
| Master data | Sheet + menu super |
| Reminder | Email time-driven |
| Laporan | Digest Senin |
| Arsip surat | Generator Docs |

**Cara jual/internalize:** “Sistem Operasional Unit X”, bukan “satu URL”.  
**Kompleksitas:** Tinggi (tapi disusun bertahap dari N-kecil).

---

## 4. Adaptasi Pabrik: SOP untuk Non–Web App

### 4.1 Ubah kontrak output Gem Koder

Tambah parameter di awal Prompt Eksekusi:

```text
KEMASAN_PRODUK: <salah satu>
- WEB_APP
- SHEET_ENGINE
- EMAIL_REPORT
- DOC_GENERATOR
- JSON_API
- FORM_ROUTER
- DRIVE_AUTOMATION
- CALENDAR_SYNC
- HYBRID_SUITE
```

**Output wajib menyesuaikan kemasan** (contoh):

| Kemasan | Artefak yang diminta Koder |
|---------|----------------------------|
| SHEET_ENGINE | `Code.gs`, opsional `Dialog.html`, instruksi bound script, skema tab, daftar menu |
| EMAIL_REPORT | `Code.gs`, template HTML string, setup trigger, `CONFIG` sheet |
| DOC_GENERATOR | `Code.gs`, spesifikasi placeholder template Docs, struktur folder Drive |
| JSON_API | `Code.gs` (`doGet`/`doPost`), skema request/response, cara set API key, contoh `curl` |
| FORM_ROUTER | `Code.gs`, mapping form item, onFormSubmit, tab tujuan |
| HYBRID_SUITE | beberapa modul + urutan pasang + dependency |

### 4.2 Patch singkat System Instruction Analis (tambahan)

Tambahkan ke Gem Analis:

```text
Jangan selalu berasumsi produk = Web App.
Pertama tentukan KEMASAN_PRODUK yang paling hemat usaha untuk user.
Jika brief user tidak menuntut UI publik, prioritaskan SHEET_ENGINE,
EMAIL_REPORT, atau DOC_GENERATOR.
Sebutkan alasan pemilihan kemasan di bagian Asumsi.
```

### 4.3 Patch singkat System Instruction Koder (tambahan)

```text
Hormati KEMASAN_PRODUK dari prompt eksekusi.
Jika bukan WEB_APP: jangan memaksa index.html + doGet UI.
Selalu sediakan: skema Sheet, langkah pasang, cara trigger (jika ada),
batas kuota yang relevan, dan tes skenario.
Untuk email: sertakan mode dry-run/preview.
Untuk Docs merge: jangan hardcode docId — taruh di CONFIG.
Untuk API: rahasia di PropertiesService.
```

### 4.4 Factory Log — kolom tambahan

| Kolom baru | Contoh |
|------------|--------|
| kemasan | `DOC_GENERATOR` |
| trigger | `time: every day 07:30` |
| template_docs_url | link |
| api_endpoint | URL deployment |
| dependensi_luar | `Telegram Bot API` |

### 4.5 Definition of Done non–web (umum)

- [ ] Skema Sheet + CONFIG ada  
- [ ] Script bound / standalone sesuai desain  
- [ ] Dry-run sukses (email tidak kesasar, doc tidak numpuk)  
- [ ] Trigger terpasang hanya 1 (tidak dobel)  
- [ ] Secret tidak tertulis di sel Sheet publik  
- [ ] Backup kode di folder pabrik  
- [ ] Entry Factory Log  

---

## 5. Matriks pilih kemasan (decision tree cepat)

```
Apakah pengguna WAJIB isi data dari HP di lapangan / publik?
  ├─ YA → Web App atau Google Form (+ router)
  └─ TIDAK
        Apakah output utamanya DOKUMEN/PDF?
        ├─ YA → DOC_GENERATOR / sertifikat
        └─ TIDAK
              Apakah nilai utamanya "ingat & dorong orang"?
              ├─ YA → EMAIL_REPORT / REMINDER / Chat bot
              └─ TIDAK
                    Apakah konsumennya SISTEM lain?
                    ├─ YA → JSON_API / Webhook
                    └─ TIDAK
                          Apakah user sudah hidup di Spreadsheet seharian?
                          ├─ YA → SHEET_ENGINE (menu + onEdit)
                          └─ TIDAK → pertimbangkan Web App mini
```

**Aturan emas:** *kemasan termudah yang tetap menyelesaikan masalah* — jangan paksakan web app.

---

## 6. 10 ide non–web paling worth production dulu

| Prioritas | Ide | Alasan |
|-----------|-----|--------|
| 1 | **N5 Digest Reporter** | Cepat, terasa magis, zero UI training |
| 2 | **N1 Super Menu Sheet** | Fondasi semua mesin data |
| 3 | **N9 Generator Surat** | Pengganti kerja copy-paste Docs berjam-jam |
| 4 | **N6 Reminder Jatuh Tempo** | Cegah rugi/lupa operasional |
| 5 | **N20 Form Router** | Input massal tanpa bangun UI |
| 6 | **N3 Approval di Sheet** | Workflow resmi ringan |
| 7 | **N18 Folder Drive Factory** | Tertib arsip instan |
| 8 | **N10 Sertifikat Massal** | Musiman tapi wow-factor tinggi |
| 9 | **N13 JSON API** | Pintu integrasi masa depan |
| 10 | **N21 Klasifikasi AI** | Diferensiasi “pabrik pintar” |

---

## 7. Contoh paket produk utuh (bukan sekadar fitur)

### Paket A — “Tata Usaha Digital Tanpa Web”
- N20 Form surat masuk  
- N9 Generate lembar disposisi  
- N6 Reminder tindak lanjut  
- N5 Rekap mingguan ke pimpinan  
**Janji:** TU lebih rapi tanpa URL yang harus diingat staf.

### Paket B — “Operasional Aset + Kertas Nol”
- Web app inventaris *(dari daftar web app)*  
- N23 QR label  
- N6 Reminder servis  
- N5 Digest stok/kondisi  

### Paket C — “Panitia Kegiatan 48 Jam”
- N20 Form daftar hadir / N5 absensi hybrid  
- N10 Sertifikat  
- N7 Mail merge ucapan  
- N18 Folder materi kegiatan  

### Paket D — “Helpdesk Tanpa Portal”
- Google Form keluhan  
- N2 Data quality  
- N8 Eskalasi email  
- N21 Ringkas & klasifikasi AI  
- N5 Board Monday morning  

---

## 8. Ide “meta-produk”: yang dijual/dipakai adalah pabriknya sendiri

Di luar solusi domain, Anda bisa memproduksi:

| Meta-produk | Keterangan |
|-------------|------------|
| **Template Gem pack** | Instruction Analis/Koder per industri (sekolah, puskesmas, desa, UMKM) |
| **Starter bound spreadsheet** | File master “kosong + menu + CONFIG” sebagai embrio semua proyek |
| **Library Apps Script internal** | `Utils.gs` berbagi lewat Library ID (tanggal, uuid, mail safe-send) |
| **Katalog solusi** | Sheet gallery: nama, kemasan, link, status — seperti App Store internal |
| **SOP generator** | Ironis tapi berguna: brief → Docs SOP operasional unit |

Ini menaikkan pabrik dari “alat pribadi” jadi **platform kecil**.

---

## 9. Batasan jujur (agar tidak overpromise)

| Jangan paksakan di pabrik ini | Alternatif |
|-------------------------------|------------|
| Chat realtime ribuan user | Firebase / layanan chat khusus |
| Transaksi finansial regulated | Sistem akuntansi resmi |
| Mobile app store (Play/App Store) | Hanya API + klien native terpisah |
| OLAP / bi kompleks | Looker Studio di atas Sheet (masih hybrid!) |
| Workflow enterprise BPMN berat | Tools BPM / ServiceNow dll. |
| Media streaming / file raksasa | Drive manual + kuota sadar |

**Looker Studio** pantas disebut: sering jadi “frontend analitik” tanpa coding web — cukup data Sheet bersih dari pabrik Anda. Itu juga produk non–web app: **dashboard bisnis**.

---

#### Ide N25 (bonus) — Paket Dataset Bersih + Dashboard Looker Studio
**Produk pabrik:** ETL Sheet + konvensi kolom + tautan template dashboard.  
**User akhir:** pimpinan lihat grafik, bukan form CRUD.  
**Kompleksitas:** Rendah jika datanya sudah rapi.

---

## 10. Brief master “mode non-web” (tempel ke Analis)

```text
Saya ingin SOLUSI (bukan otomatis web app) dengan pabrik Google:
Sheets + Apps Script ± Docs/Gmail/Drive/Calendar/Form.

Masalah:
...

Pengguna & kebiasaan mereka sekarang:
... (contoh: "sehari-hari sudah di Sheet", "hanya cek email", "isi Form")

Output yang diinginkan (centang mental):
[ ] Menu di Spreadsheet
[ ] Email otomatis / reminder
[ ] Generate Docs/PDF
[ ] Google Form + routing
[ ] API JSON
[ ] Calendar/Drive automation
[ ] Hybrid (sebutkan)
[ ] Web app hanya jika benar-benar perlu

Constraint:
- Serverless Google only (kecuali API luar yang saya sebut: ...)
- Bahasa Indonesia
- Ada tab CONFIG
- Ada dry-run untuk efek samping (email/doc)
- Timezone Asia/Jakarta

Hasilkan blueprint + KEMASAN_PRODUK + PROMPT EKSEKUSI untuk Koder.
```

---

## 11. Roadmap ekspansi pabrik (non-web)

| Fase | Fokus | Hasil |
|------|--------|-------|
| E1 | Instruction Gem sadar multi-kemasan | Analis tidak memaksa web app |
| E2 | Produksi N5 + N1 | Otomasi & menu sebagai otot dasar |
| E3 | N9 Doc generator + template kop | Produk dokumen pertama |
| E4 | N20 Form router | Jalur input massal |
| E5 | N13 API + 1 integrasi luar | Pabrik terhubung dunia luar |
| E6 | N21 AI classify | Diferensiasi cerdas |
| E7 | Katalog suite A–D | “Produk paket” tinggal clone |

---

## 12. Ringkasan eksekutif

1. **Pabrik = mesin penerjemah masalah → artefak Google yang hidup**, bukan hanya pembuat website.  
2. Minimal **24+1 ide non–web** layak produksi: menu Sheet, guard data, approval, ETL, digest email, reminder, mail merge, eskalasi, surat otomatis, sertifikat, notulen, kuitansi ringan, JSON API, webhook, sync API, Chat/Telegram bot, penata Drive, Calendar factory, Form router, klasifikasi AI, draft balasan AI, QR batch, suite hybrid, dashboard Looker.  
3. Yang perlu diubah tipis: **kontrak KEMASAN_PRODUK** + output artefak + Factory Log.  
4. Mulai dari yang terasa magis tanpa training: **Laporan email harian (N5)** dan **Super menu Sheet (N1)**.  
5. Skala lewat **paket suite** (TU, Aset, Panitia, Helpdesk), bukan satu URL raksasa.

---

## 13. Langkah Anda berikutnya (pilih satu)

| Opsi | Deliverable konkret |
|------|---------------------|
| A | Update system instruction Analis+Koder multi-kemasan (teks final siap tempel) |
| B | Produksi penuh **N5 Digest Reporter** (kode + skema + trigger) |
| C | Produksi penuh **N9 Generator Surat** (script + spek template Docs) |
| D | Desain **Paket Tata Usaha Digital Tanpa Web** end-to-end |
| E | Gabung katalog: 10 web app + 25 non-web jadi satu “menu pabrik” |

---

*Dokumen ini memperluas cakrawala pabrik tanpa meninggalkan stack yang sudah Anda pilih. Web app tetap senjata utama untuk UI lapangan; non–web app adalah senjata untuk otomasi, dokumen, dan integrasi — sering justru lebih sering dipakai sehari-hari.*
