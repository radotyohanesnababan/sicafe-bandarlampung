# Aturan Database

Setiap kali melakukan perubahan struktur tabel (Database Schema) di Laravel, Anda **WAJIB** menggunakan pendekatan *migration "add"* (migration baru yang menambahkan kolom) alih-alih mengedit file migration yang sudah ada sebelumnya.
Hal ini sangat krusial untuk menjaga integritas data di *Production* agar terhindar dari *data loss* atau *error* saat *deployment*.
