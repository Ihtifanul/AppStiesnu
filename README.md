# Panduan Menjalankan Aplikasi STIESNU Setelah Clone/Pull dari Git Hub

## 1. Mengetahui IP Address (WiFi/Hotspot)
IP address ini diperlukan agar HP dan PC/Laptop terhubung ke server yang sama.

**Cara mencari IP dari PC (Windows):**
1. Buka Command Prompt (CMD).
2. Ketik `ipconfig`.
3. Cari bagian "Wireless LAN adapter Wi-Fi" dan ambil angka di "IPv4 Address" (contoh: 192.168.x.x).

**Cara mencari IP dari HP (Android):**
1. Buka Pengaturan > Wi-Fi.
2. Klik nama Wi-Fi yang terhubung, lalu cari detail rincian "Alamat IP".

## 2. Konfigurasi IP Address di Kode
Ubah IP address di dua file berikut sesuai dengan IP yang Anda peroleh:

**Di Backend (`backend/package.json`):**
Ubah bagian `"dev"` dan masukkan IP Anda:
`"dev": "next dev -H 192.168.x.x -p 3001"`

**Di Frontend (`src/config/api.js`):**
Ubah `baseURL` menggunakan IP yang sama:
`baseURL: 'http://192.168.x.x:3001/api'`

## 3. Konfigurasi dan Pembuatan Database
1. Buka aplikasi manajemen database Anda (Laragon/XAMPP/phpMyAdmin) dan buat database bernama `stiesnu_db`.
2. Buka terminal baru dan masuk ke folder proyek backend:
   `cd backend`
3. Download dependensi backend jika belum (opsional jika pertama kali clone):
   `npm install`
4. Sesuaikan file `.env` (salin dari `.env.example`). Atur koneksi database:
   `DATABASE_URL="mysql://root:@localhost:3306/stiesnu_db"`
5. Buat struktur tabel database (migration):
   `npx prisma migrate dev`
6. Masukkan data awal seperti daftar admin default (seeding):
   `npx prisma db seed`

## 4. Menjalankan Aplikasi (Dua Terminal Berbeda)
Aplikasi harus berjalan di dua terminal terpisah. Buka 2 tab atau jendela terminal/Powershell yang berbeda atau pada terminal pilih split terminal atau buka dua terminal terpisah di aplikai pengkodingan.

**Terminal 1 (Untuk Backend):**
1. Pastikan posisi direktori sudah berada di dalam `backend`.
2. Jalankan perintah: 
   `npm run dev`

**Terminal 2 (Untuk Frontend/Expo):**
1. Pastikan posisi direktori berada di folder utama `STIESNU-App` (jangan masuk ke backend).
2. Bersihkan cache dan jalankan expo: 
   `npx expo start --clear`
3. Pindai kode QR yang muncul (QR code) menggunakan aplikasi Expo Go di HP Anda.
