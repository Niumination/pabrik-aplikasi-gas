# SOP Produksi Solusi — Pabrik Aplikasi
**Versi:** 1.1 · **Tanggal:** 2026-08-26  
**Berlaku untuk:** Web App & non–Web App (multi-kemasan)

---

## 1. Prinsip
1. Satu masalah → satu kemasan primer yang paling hemat.  
2. Analis tidak coding; Koder tidak redesign product.  
3. Gambar referensi yang sama dipakai di Analis & Koder (jika ada).  
4. CONFIG di Sheet untuk hal yang sering berubah.  
5. Dry-run untuk efek samping (email, buat file, hapus baris).  
6. Setiap produk masuk Factory Log.  
7. Backup instruction Gems & kode ke Drive.

---

## 2. Pra-syarat pabrik (sekali)
- [ ] Akun Google + 2FA  
- [ ] Gemini Gems tersedia  
- [ ] Gem **Niu-Prompt** (Analis) dengan `01_Gems/system_instruction_analis_v1.2.txt`  
- [ ] Gem **Niu-Bot** (Koder) dengan `01_Gems/system_instruction_koder_v1.2.txt`  
- [ ] Folder Drive `Pabrik_Aplikasi/` (struktur di README pabrik)  
- [ ] Sheet `Factory_Log`  

---

## 3. SOP satu siklus (generik)

### L0 — Pilih dari katalog atau brief bebas
Tulis 5–10 kalimat: masalah, pengguna, output yang diinginkan, batasan.

### L1 — Tentukan kemasan (sendiri atau biar Analis)
`WEB_APP | SHEET_ENGINE | EMAIL_REPORT | DOC_GENERATOR | JSON_API | FORM_ROUTER | …`

### L2 — Analis
1. Buka Gem Niu-Prompt  
2. Tempel brief (+ gambar)  
3. Review blueprint 5–10 menit (nama field, status, izin)  
4. Salin **PROMPT EKSEKUSI** utuh  

### L3 — Koder
1. Buka Gem Niu-Bot  
2. Tempel prompt eksekusi (+ gambar sama)  
3. Terima artefak sesuai kemasan  
4. Sanity check: nama tab, CONFIG keys, dry-run, secret  

### L4 — Infrastruktur
1. Folder `05_Apps/App_<Nama>/`  
2. Sheet + Apps Script (bound)  
3. Tempel kode → Run setup → Authorize  
4. Isi CONFIG spesifik akun (email, doc id, folder id, …)  
5. Uji dry-run / sample  
6. Deploy web app **atau** pasang trigger **atau** uji menu  

### L5 — Serah terima
1. Backup `.gs` / `.html` ke folder app  
2. Factory Log  
3. 3–5 bullet “cara pakai” untuk user akhir  

---

## 4. Checklist per kemasan (ringkas)

### WEB_APP
- [ ] setup + seed  
- [ ] CRUD jalan di URL  
- [ ] Deploy: Execute as Me; Who has access sesuai kebijakan  
- [ ] New version saat update  

### SHEET_ENGINE
- [ ] Menu onOpen  
- [ ] Operasi destruktif ada konfirmasi  
- [ ] LOG_OPS terisi  

### EMAIL_REPORT
- [ ] dry_run dulu  
- [ ] 1 email uji ke diri sendiri  
- [ ] anti-dobel / log  
- [ ] trigger 1 saja  

### DOC_GENERATOR
- [ ] template placeholder valid  
- [ ] folder output  
- [ ] dry-run batch  
- [ ] 1 file nyata + link balik Sheet  

### JSON_API
- [ ] API key di PropertiesService  
- [ ] contoh curl sukses  
- [ ] jangan “Anyone” tanpa key  

---

## 5. Definition of Done
- Masalah user terselesaikan di jalur bahagia  
- Skema & CONFIG terdokumentasi  
- Jejak log ada  
- Backup kode  
- Factory Log  
- Known issues dicatat (jika ada)  

---

## 6. Urutan kerja yang disarankan untuk user baru
1. Tempel instruction Gems v1.2  
2. Pasang **N5 Digest** (email — terasa magis)  
3. Pasang **N1 Super Menu** (otot data)  
4. Pasang **N9 Generator Surat** (butuh template Anda)  
5. Baru web app domain (Buku Tamu / Inventaris)  

---

## 7. Apa yang selalu “bagian user”
- Authorize & pilih akun Google  
- Isi email penerima, Doc ID, Folder ID, logo/kop  
- Sharing permission nyata  
- Data produksi & kebijakan akses  
- Trigger jam yang cocok dengan operasional  
