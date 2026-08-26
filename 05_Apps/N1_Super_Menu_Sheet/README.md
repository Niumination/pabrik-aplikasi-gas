# N1 — Super Menu Sheet (Sheet Engine)
## Mesin operasi data di dalam Spreadsheet — tanpa web app

**Versi:** 1.0.0  
**Kemasan:** `SHEET_ENGINE`  
**Waktu pasang:** ~15 menit  

### Fitur menu `🚀 Super Menu`
1. **Setup skema** — tab DATA, ARSIP, LOG_OPS, CONFIG  
2. **Validasi baris** — cek kolom wajib, email, status whitelist  
3. **Tandai duplikat** — highlight berdasarkan kolom kunci  
4. **Generate ID kosong** — isi id UUID untuk baris baru  
5. **Arsipkan baris selesai** — pindah status=selesai → ARSIP  
6. **Rebuild dashboard** — hitung KPI ke tab DASHBOARD  
7. **Bersihkan highlight** — reset warna validasi  

### File
| File | Ket |
|------|-----|
| `ALL_IN_ONE.gs` | Tempel ke Apps Script |
| `CHECKLIST_PASANG.md` | Langkah pasang |
| `FACTORY_LOG_ENTRY.md` | Log pabrik |

### Mulai
1. Sheet baru → Apps Script → tempel `ALL_IN_ONE.gs`  
2. Run `setupSuperMenu` → Authorize  
3. Refresh Sheet → menu **🚀 Super Menu**  
