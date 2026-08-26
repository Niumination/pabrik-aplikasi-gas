# Spek Template Google Docs — N9 Generator Surat

Bagian ini **spesifik unit Anda**: kop surat, logo, font, pejabat penandatangan.

Script hanya mengganti token `{{nama_field}}` di body (dan header/footer bila ada).

---

## Cara buat template (sekali)

1. Drive → **New → Google Docs**  
2. Nama: `TEMPLATE_Surat_Resmi_Unit`  
3. Desain kop + badan surat memakai placeholder di bawah  
4. File → Share: akun yang menjalankan script harus **Editor**  
5. Dari URL:
   ```
   https://docs.google.com/document/d/>>>>>>>>>>>>>>>>ID<<<<<<<<<<<<<<<</edit
   ```
   Salin **ID** → tempel ke CONFIG `template_doc_id`  
6. Buat folder `Surat_Generated_2026` → salin **Folder ID** dari URL folder → CONFIG `output_folder_id`

---

## Placeholder yang dikenali script

Samakan dengan kolom `DATA_SURAT` (huruf kecil di dalam `{{ }}`):

| Placeholder | Isi dari kolom |
|-------------|----------------|
| `{{nomor_surat}}` | nomor_surat |
| `{{tanggal_surat}}` | tanggal_surat |
| `{{tipe}}` | tipe |
| `{{perihal}}` | perihal |
| `{{penerima_nama}}` | penerima_nama |
| `{{penerima_jabatan}}` | penerima_jabatan |
| `{{penerima_instansi}}` | penerima_instansi |
| `{{penerima_alamat}}` | penerima_alamat |
| `{{pengirim_nama}}` | pengirim_nama |
| `{{pengirim_jabatan}}` | pengirim_jabatan |
| `{{pengirim_instansi}}` | pengirim_instansi |
| `{{isi_paragraf_1}}` | isi_paragraf_1 |
| `{{isi_paragraf_2}}` | isi_paragraf_2 |
| `{{isi_penutup}}` | isi_penutup |
| `{{tembusan}}` | tembusan |
| `{{kota}}` | kota |
| `{{id}}` | id internal |

**Alias** (boleh dipakai juga):

| Alias | = |
|-------|---|
| `{{NOMOR}}` | nomor_surat |
| `{{TANGGAL}}` | tanggal_surat |
| `{{PERIHAL}}` | perihal |
| `{{NAMA}}` | penerima_nama |
| `{{HARI_INI}}` | tanggal hari generate (format panjang) |

Field kosong diganti nilai CONFIG `replace_missing_with` (default `-`).

---

## Contoh kerangka body (tempel ke Docs)

```
{{kota}}, {{tanggal_surat}}

Nomor   : {{nomor_surat}}
Sifat   : Biasa
Lampiran: -
Perihal : {{perihal}}

Kepada Yth.
{{penerima_nama}}
{{penerima_jabatan}}
{{penerima_instansi}}
{{penerima_alamat}}

Dengan hormat,

{{isi_paragraf_1}}

{{isi_paragraf_2}}

{{isi_penutup}}

Hormat kami,
{{pengirim_instansi}}

{{pengirim_nama}}
{{pengirim_jabatan}}

Tembusan:
{{tembusan}}
```

Logo/kop: taruh di **header** Docs sebagai gambar — tidak perlu placeholder.

---

## Tips merge

- Jangan pecah placeholder dengan formatting di tengah token  
  (hindari `{{peri` bold lalu `hal}}`).  
- Untuk tembusan multi-baris, isi sel Sheet dengan baris baru (Ctrl+Enter).  
- Uji 1 baris sample dulu sebelum batch.  
- Setelah template final, **File → Make a copy** sebagai backup `TEMPLATE_..._v1`.  

---

## Izin

Akun yang authorize script harus bisa:
- Membaca template  
- Menulis ke folder output  
- (Opsional) share file hasil ke email `share_with_editor`  
