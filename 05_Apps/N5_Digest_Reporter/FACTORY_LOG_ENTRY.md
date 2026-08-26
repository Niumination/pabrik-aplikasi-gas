# Factory Log — Entry N5 Digest Reporter

Salin baris ini ke Sheet **Factory_Log** pabrik Anda.

| kolom | nilai |
|-------|--------|
| app_id | APP-N5-001 |
| nama_app | Digest Reporter (N5) |
| kemasan | EMAIL_REPORT |
| tanggal_buat | 2026-08-25 |
| pemilik | *(email Anda)* |
| folder_drive_url | *(link folder App_DigestReporter)* |
| spreadsheet_url | *(link Sheet)* |
| webapp_url | — (bukan web app) |
| trigger | time: daily ~07:30 Asia/Jakarta → triggerDailyDigest |
| template_docs_url | — |
| api_endpoint | — |
| versi_kode | 1.0.0 |
| versi_gem_analis | n/a (produksi manual dari rencana pabrik) |
| versi_gem_koder | n/a |
| status | draft → live setelah trigger ON & dry_run FALSE |
| catatan | Multi-sumber: tamu, tiket, stok, tugas. Dry-run default. |

## Post-install notes

- Ubah `recipients_to` ke grup pimpinan setelah uji stabil 3 hari.  
- Hubungkan tab SUMBER_* ke data app lain (impor / formula / script sync) sebelum mengandalkan KPI.  
- Review kuota MailApp jika penerima > 10 atau frekuensi > 1×/hari.  
