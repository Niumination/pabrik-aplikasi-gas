# Checklist — N9 Generator Surat

## Bagian generik (script)
- [ ] Sheet baru `[APP] Generator Surat N9`
- [ ] Apps Script → tempel `ALL_IN_ONE.gs` → Save
- [ ] Run `setupGeneratorSurat` → Authorize  
  Izin: Spreadsheet, Docs, Drive
- [ ] Refresh → menu **📄 Generator Surat**

## Bagian spesifik akun (Anda)
- [ ] Buat template Docs mengikuti `TEMPLATE_DOCS_SPEC.md`
- [ ] Buat folder Drive output
- [ ] CONFIG: isi `template_doc_id`
- [ ] CONFIG: isi `output_folder_id`
- [ ] Menu → **Cek konfigurasi template/folder** → semua ✓

## Uji
- [ ] Pastikan ada baris sample status=`siap`
- [ ] **Dry-run batch** dulu
- [ ] Klik sel baris sample → **Generate baris aktif**
- [ ] Cek folder Drive: muncul Doc (+ PDF)
- [ ] Cek kolom `doc_url`, `pdf_url`, `status` di Sheet
- [ ] Cek `LOG_GENERATE`
- [ ] Baru boleh **Generate batch status=siap**

## Produksi
- [ ] Ganti sample dengan data surat nyata
- [ ] Backup template Docs (Make a copy)
- [ ] Factory Log
