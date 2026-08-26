# Katalog Produk Pabrik Aplikasi
**Update:** 2026-08-26

Legenda status paket di workspace:
- ✅ **Kode siap tempel** — bisa dipasang sekarang  
- 📋 **Ide + brief** — belum dikodekan  
- 🧩 **Butuh bagian user** — template/ID/izin spesifik  

---

## A. Produk sudah dikodekan (siap Anda pasang)

| ID | Nama | Kemasan | Lokasi paket | Bagian Anda |
|----|------|---------|--------------|-------------|
| **N5** | Digest Reporter | EMAIL_REPORT | `05_Apps/N5_Digest_Reporter/` | recipients_to, trigger, sambung data |
| **N1** | Super Menu Sheet | SHEET_ENGINE | `05_Apps/N1_Super_Menu_Sheet/` | sesuaikan kolom/status ke data nyata |
| **N9** | Generator Surat | DOC_GENERATOR | `05_Apps/N9_Generator_Surat/` | 🧩 template Docs + folder Drive + ID |

### Urutan pasang disarankan
1. N5 → 2. N1 → 3. N9 (setelah kop surat siap)

---

## B. Web app (ide + brief siap tempel Analis)

Sumber detail: `/home/user/10_Ide_Web_App_Pabrik.md`

| # | Nama | Kompleksitas | Prioritas awal |
|---|------|--------------|----------------|
| W2 | Buku Tamu Digital | Rendah | ⭐ app web pertama |
| W8 | Direktori Kontak & Vendor | Rendah | ⭐ |
| W5 | Absensi Kegiatan/Rapat | Rendah | |
| W1 | Inventaris Aset TI | Menengah | operasional |
| W3 | Peminjaman Barang | Menengah | |
| W4 | Tiket Keluhan Internal | Menengah | |
| W7 | Stok ATK | Menengah | |
| W6 | Register Surat | Menengah | |
| W9 | Checklist Inspeksi | Menengah | |
| W10 | Pipeline Tugas / Kanban | Menengah | |

---

## C. Non–web (ide, belum semua dikode)

Sumber detail: `/home/user/Ide_Non_WebApp_Pabrik.md`

| ID | Nama | Kemasan | Status |
|----|------|---------|--------|
| N2 | Data Quality Guard | SHEET_ENGINE | 📋 (sebagian overlap N1) |
| N3 | Approval di Sheet | SHEET_ENGINE+EMAIL | 📋 |
| N4 | Mini ETL CSV | SHEET_ENGINE | 📋 |
| N6 | Reminder Jatuh Tempo | EMAIL_REPORT | 📋 (bisa cabang N5) |
| N7 | Mail Merge terarah | EMAIL_REPORT | 📋 |
| N8 | Eskalasi SLA | EMAIL_REPORT | 📋 |
| N10 | Sertifikat massal | DOC_GENERATOR | 📋 (pola = N9) |
| N11 | Notulen otomatis | DOC_GENERATOR | 📋 |
| N12 | Kuitansi internal | DOC_GENERATOR | 📋 |
| N13 | JSON API Sheet | JSON_API | 📋 |
| N14 | Webhook Telegram | JSON_API | 📋 |
| N18 | Folder Drive factory | DRIVE_AUTOMATION | 📋 |
| N19 | Calendar factory | CALENDAR_SYNC | 📋 |
| N20 | Form Router | FORM_ROUTER | 📋 |
| N21 | Klasifikasi AI | HYBRID | 📋 |
| N23 | QR batch | DRIVE_AUTOMATION | 📋 |
| N25 | Dataset + Looker | ETL | 📋 |

---

## D. Fondasi pabrik

| Artefak | Lokasi |
|---------|--------|
| Instruction Analis v1.2 | `01_Gems/system_instruction_analis_v1.2.txt` |
| Instruction Koder v1.2 | `01_Gems/system_instruction_koder_v1.2.txt` |
| SOP produksi | `00_SOP/SOP_Produksi_Solusi.md` |
| Checklist deploy | `00_SOP/CHECKLIST_Deploy_Umum.md` |
| Factory Log CSV | `04_Factory_Log/Factory_Log_Template.csv` |
| Rencana induk | `/home/user/Rencana_Pabrik_Aplikasi_Ekosistem.md` |

---

## E. Suite siap dirakit (paket bisnis)

| Suite | Gabungan | Hasil bagi user |
|-------|----------|-----------------|
| Tata Usaha Digital | N20+N9+N6+N5 | Surat & disposisi tanpa portal |
| Operasional Aset | W1+N23+N6+N5 | Inventaris + reminder + digest |
| Panitia 48 jam | W5/N20+N10+N7+N18 | Hadir, sertifikat, folder, email |
| Helpdesk ringan | W4/N20+N8+N21+N5 | Tiket + eskalasi + ringkas AI |

---

## F. Antrian coding berikutnya (jika minta lagi)

Prioritas teknis setelah N5/N1/N9:
1. **W2 Buku Tamu** (web app penuh setup/code/index)  
2. **N6 Reminder** (extend N5)  
3. **N13 JSON API** boilerplate  
4. **N20 Form Router**  
