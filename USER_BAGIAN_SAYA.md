# Bagian Anda — Checklist Eksekusi
Lakukan berurutan. Centang di salinan Drive Anda.

Perkiraan total: **2–4 jam** untuk fondasi hidup (tanpa web app domain).

---

## Blok A — Fondasi akun (30–45 mnt)

- [ ] A1. Login Google utama + 2FA
- [ ] A2. Buka [gemini.google.com](https://gemini.google.com) → pastikan **Gems** ada
- [ ] A3. **Gem baru: Niu-Prompt | Analis Sistem**  
      Instructions ← isi file `01_Gems/system_instruction_analis_v1.2.txt`
- [ ] A4. **Gem baru: Niu-Bot | GAS Koder**  
      Instructions ← isi file `01_Gems/system_instruction_koder_v1.2.txt`
- [ ] A5. Drive: buat folder `Pabrik_Aplikasi/` mirror README
- [ ] A6. Buat Sheet `Factory_Log` — impor header dari `04_Factory_Log/Factory_Log_Template.csv`
- [ ] A7. Simpan backup instruction Gems (copy teks) ke Drive `01_Gems_Backup/`

---

## Blok B — N5 Digest Reporter (25–40 mnt)

Paket: `Pabrik_Aplikasi/05_Apps/N5_Digest_Reporter/`

- [ ] B1. Sheet `[APP] Digest Reporter`
- [ ] B2. Apps Script ← `ALL_IN_ONE.gs`
- [ ] B3. Run `setupDigestSystem` → Allow
- [ ] B4. CONFIG: `recipients_to` = email Anda
- [ ] B5. Menu → Dry-run → cek `LOG_KIRIM`
- [ ] B6. `dry_run=FALSE` → Kirim sekarang → cek inbox
- [ ] B7. Pasang trigger harian **atau** tunda dulu (manual OK)
- [ ] B8. Factory Log baris N5
- [ ] B9. *(Opsional nanti)* sambung data nyata — `CONNECT_DATA.md`

---

## Blok C — N1 Super Menu (15–25 mnt)

Paket: `05_Apps/N1_Super_Menu_Sheet/`

- [ ] C1. Sheet `[APP] Super Menu N1`
- [ ] C2. Tempel `ALL_IN_ONE.gs` → `setupSuperMenu`
- [ ] C3. Uji: Validasi, Duplikat, Generate ID, Arsip, Dashboard
- [ ] C4. Ubah CONFIG `required_fields` / `status_whitelist` ke istilah unit Anda
- [ ] C5. Factory Log baris N1

---

## Blok D — N9 Generator Surat (30–60 mnt, ada desain)

Paket: `05_Apps/N9_Generator_Surat/`

- [ ] D1. Sheet `[APP] Generator Surat N9` → script → `setupGeneratorSurat`
- [ ] D2. Buat **Google Doc template** + kop/logo unit (`TEMPLATE_DOCS_SPEC.md`)
- [ ] D3. Folder Drive `Surat_Generated/`
- [ ] D4. CONFIG: `template_doc_id` + `output_folder_id`
- [ ] D5. Menu → Cek konfigurasi → semua centang hijau
- [ ] D6. Dry-run batch → Generate 1 baris sample
- [ ] D7. Verifikasi Doc+PDF di folder + link di Sheet
- [ ] D8. Factory Log baris N9

---

## Blok E — Web app pertama (opsional hari yang sama / berikutnya)

- [ ] E1. Pilih **Buku Tamu (W2)** dari `10_Ide_Web_App_Pabrik.md`
- [ ] E2. Brief → Gem Analis → review blueprint
- [ ] E3. Prompt eksekusi → Gem Koder
- [ ] E4. Sheet + tempel 3 file → setup → Deploy Web App
- [ ] E5. Uji HP + Factory Log

*(Jika Anda ingin agen yang menyiapkan kode W2 tanpa lewat Gem, minta saja “lanjut W2”.)*

---

## Saat macet — kirim info ini

1. Produk (N5/N1/N9/…)  
2. Langkah terakhir yang sukses  
3. Pesan error persis / screenshot  
4. Isi baris terakhir LOG_*  

---

## Definition of “pabrik hidup” di akun Anda

- [ ] 2 Gems aktif v1.2  
- [ ] N5 berhasil kirim 1 email nyata  
- [ ] N1 menu jalan  
- [ ] SOP tersimpan di Drive  
- [ ] Factory Log ≥ 2 baris  
- [ ] *(Bonus)* N9 1 surat PDF jadi  

Setelah itu pabrik siap produksi berulang — bagian generik dari sisi agen sudah cukup.
