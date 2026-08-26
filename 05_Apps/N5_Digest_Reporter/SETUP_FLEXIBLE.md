# SETUP N5 Digest Reporter (Fleksibel: Bound atau Standalone)

## Opsi A: Bound Script (RECOMMENDED — paling mudah)
1. Buat Google Sheet baru: `[APP] Digest Reporter DB`
2. Extensions → Apps Script → Hapus kode default
3. Copy-paste isi `ALL_IN_ONE.gs` (sudah gabungan setup+code) ke editor
4. Save (Ctrl+S)
5. Run → `setupDigestSystem` → Authorize
6. Refresh Sheet → menu `📬 Digest Reporter` muncul
7. Isi CONFIG (lihat CHECKLIST_PASANG.md)

## Opsi B: Standalone (via clasp, sudah di-push)
Script sudah di-push ke Apps Script standalone:
- Script ID: `1kM-kXweyqEXvcsOU7ErCPFwn5OrV0KpWZmkdpwF-0ZrLWK0JP1BJoev7`

Cara pakai standalone:
1. Buka Sheet target (atau buat baru)
2. Copy URL Sheet → ambil ID (bagian `spreadsheets/d/XXXX/edit`)
3. Buka script standalone → di editor jalankan:
   ```js
   setSpreadsheetId_('XXXX')  // ganti XXXX dengan ID Sheet
   ```
4. Setelah itu `runDigestNow`, `installDailyTrigger`, dll akan jalan karena `getSpreadsheet_()`
   otomatis membuka Sheet via `SPREADSHEET_ID` (disimpan di UserProperties).

## Perbaikan error sebelumnya
- **Akar masalah:** clasp `create --type standalone` → `getActiveSpreadsheet()` null saat Run.
- **Fix:** semua pemanggilan diganti `getSpreadsheet_()` yang fallback ke `openById(SPREADSHEET_ID)`.
- **Trigger:** `installDailyTrigger`/`installWeeklyTrigger` sekarang pakai `getSpreadsheet_()` juga.
