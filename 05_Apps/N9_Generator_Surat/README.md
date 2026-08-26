# N9 — Generator Surat Otomatis
## Sheet → Google Docs (merge) → PDF di Drive

**Versi:** 1.0.0  
**Kemasan:** `DOC_GENERATOR`  
**Waktu pasang:** ~25–40 menit (termasuk buat template Docs sekali)

### Alur
1. Isi baris di tab `DATA_SURAT`  
2. Menu **📄 Generator Surat → Generate baris aktif** (atau batch status=siap)  
3. Script copy template Docs → ganti `{{PLACEHOLDER}}` → simpan Doc + PDF ke folder  
4. Link ditulis balik ke baris Sheet  

### File paket
| File | Ket |
|------|-----|
| `ALL_IN_ONE.gs` | Script lengkap |
| `TEMPLATE_DOCS_SPEC.md` | Cara buat template + daftar placeholder |
| `CHECKLIST_PASANG.md` | Pasang berurutan |
| `FACTORY_LOG_ENTRY.md` | Log pabrik |

### Yang perlu Anda siapkan (bagian spesifik akun)
1. Google Doc template ber-placeholder (ikuti `TEMPLATE_DOCS_SPEC.md`)  
2. Folder Drive output (mis. `Surat_Generated/`)  
3. Tempel **Template Doc ID** & **Folder ID** ke tab CONFIG  

Script **tidak** mengarang isi kop surat Anda — itu bagian spesifik unit.
