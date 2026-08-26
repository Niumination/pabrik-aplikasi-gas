# Pabrik Aplikasi — Workspace Induk
**Update:** 2026-08-26  

Ekosistem produksi solusi Google (Gemini Gems + Sheets + Apps Script ± Docs/Gmail/Drive).

---

## Mulai di sini

| Dokumen | Fungsi |
|---------|--------|
| **[Roadmap_Pabrik_Aplikasi.html](./Roadmap_Pabrik_Aplikasi.html)** | **Roadmap visual interaktif** (timeline, peta produk, decision tree, checklist) |
| **[ROADMAP.md](./ROADMAP.md)** | Ringkasan roadmap teks |
| **[USER_BAGIAN_SAYA.md](./USER_BAGIAN_SAYA.md)** | Checklist eksekusi di akun Google Anda |

| Urutan | Anda kerjakan | Sudah disiapkan di sini |
|--------|---------------|-------------------------|
| 1 | Buat 2 Gems di gemini.google.com | Tempel instruction dari `01_Gems/` |
| 2 | Buat folder Drive mirror struktur ini | Struktur + SOP + katalog |
| 3 | Pasang **N5** Digest di Sheet Anda | Kode lengkap `05_Apps/N5_Digest_Reporter/` |
| 4 | Pasang **N1** Super Menu | Kode `05_Apps/N1_Super_Menu_Sheet/` |
| 5 | Buat kop surat template Docs | Spek + script **N9** |
| 6 | Isi Factory Log | Template CSV |
| 7 | Produksi web app pertama (Buku Tamu) | Brief di katalog / file 10 ide |

---

## Struktur folder

```
Pabrik_Aplikasi/
├── README.md                 ← Anda di sini
├── KATALOG_PRODUK.md         ← menu semua produk & status
├── 00_SOP/
│   ├── SOP_Produksi_Solusi.md
│   └── CHECKLIST_Deploy_Umum.md
├── 01_Gems/
│   ├── system_instruction_analis_v1.2.txt
│   └── system_instruction_koder_v1.2.txt
├── 04_Factory_Log/
│   └── Factory_Log_Template.csv
└── 05_Apps/
    ├── N1_Super_Menu_Sheet/
    └── N9_Generator_Surat/
```

Paket N5: `05_Apps/N5_Digest_Reporter/` (salinan juga ada di `/home/user/N5_Digest_Reporter/`)  
Rencana & ide:  
- `Rencana_Pabrik_Aplikasi_Ekosistem.md`  
- `10_Ide_Web_App_Pabrik.md`  
- `Ide_Non_WebApp_Pabrik.md`  

---

## Pembagian kerja yang bersih

### Sudah dikerjakan agen (generik, bisa ditiru)
- Rencana pabrik + breakdown  
- 10 ide web + 25 ide non-web  
- System instruction multi-kemasan v1.2  
- SOP + checklist  
- Kode **N5, N1, N9**  
- Katalog & factory log template  

### Khusus Anda (tidak bisa diganti agen)
- Login / authorize Google  
- Buat Gems & tempel instruction  
- Isi email penerima, sharing, jam trigger  
- Desain kop surat & logo (N9)  
- Doc ID, Folder ID, API key  
- Data produksi & kebijakan akses  
- Uji dengan user nyata unit Anda  

---

## Tiga perintah pasang cepat

### N5 Digest
1. Sheet baru → Apps Script → tempel `05_Apps/N5_Digest_Reporter/ALL_IN_ONE.gs`  
2. Run `setupDigestSystem`  
3. Dry-run → set recipients → kirim → trigger  

### N1 Super Menu
1. Sheet baru → tempel `05_Apps/N1_Super_Menu_Sheet/ALL_IN_ONE.gs`  
2. Run `setupSuperMenu`  
3. Coba Validasi / Duplikat / Arsip  

### N9 Surat
1. Sheet baru → tempel `05_Apps/N9_Generator_Surat/ALL_IN_ONE.gs`  
2. Run `setupGeneratorSurat`  
3. Buat template Docs (lihat TEMPLATE_DOCS_SPEC) → isi ID di CONFIG → Generate  

---

## Bantuan lanjutan
Jika Anda sudah memasang dan menabrak error, kirim:  
nama produk + screenshot/pesan error + potongan LOG — nanti bisa di-debug berdasar log itu.  

Untuk request coding berikutnya yang paling natural: **W2 Buku Tamu Web App** (setup.gs + code.gs + index.html).
