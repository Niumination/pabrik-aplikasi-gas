# Checklist Deploy / Go-Live Umum

## Sebelum
- [ ] KEMASAN_PRODUK sudah tepat  
- [ ] CONFIG tidak pakai sample email/ID palsu di produksi  
- [ ] dry_run / preview sudah diuji  
- [ ] Backup kode  

## Izin
- [ ] Script authorize dengan akun yang benar  
- [ ] Sheet sharing sesuai klasifikasi data  
- [ ] Web app access mode disengaja (bukan default asal Anyone)  

## Sesudah
- [ ] 1 transaksi/uji nyata oleh user kedua  
- [ ] Factory Log  
- [ ] Catat URL / trigger / template id  

## Rollback cepat
- [ ] Simpan salinan Sheet (File → Make a copy) sebelum migrasi besar  
- [ ] Version history Docs template  
- [ ] Jangan hapus trigger lama sebelum yang baru terbukti  
