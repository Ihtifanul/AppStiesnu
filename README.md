# Dokumentasi Proyek: Aplikasi Mobile STIESNU Bengkulu

Proyek ini merupakan aplikasi mobile resmi untuk civitas akademika STIESNU Bengkulu. Platform ini memfasilitasi mahasiswa, dosen, dan staf untuk mengakses informasi kampus, melihat jadwal akademik, membaca berita dan pengumuman, serta mengelola agenda kegiatan pribadi mereka secara terpusat. Terdapat panel khusus Administrator untuk mengelola konten (berita, event kampus, dan notifikasi) serta manajemen akun pengguna.

---

## 💻 Teknologi yang Digunakan (Tech Stack)

Proyek ini dibangun menggunakan arsitektur *Client-Server* yang memisahkan antara sistem antarmuka pengguna (Frontend Mobile) dengan sistem logika dan basis data utama (Backend API).

### 1. Frontend (Aplikasi Mobile)
Aplikasi antarmuka dikembangkan menggunakan kerangka React Native dengan dukungan Expo untuk kemudahan *build* dan pengembangan lintas platform.
- **Framework Utama:** React Native dengan Expo SDK (v54)
- **Styling:** NativeWind (implementasi TailwindCSS untuk React Native)
- **Navigasi:** State-based Navigation kustom (`AppNavigator.js`) dengan Bottom Tab Navigation
- **State Management:** React Context API (`AppProvider` / `AppContext`)
- **HTTP Client:** Axios (dengan konfigurasi token JWT otomatis)
- **Storage Lokal:** AsyncStorage (penyimpanan sesi login di perangkat)
- **Komponen Lain:** Expo Image Picker, `@react-native-community/datetimepicker`, Expo Linear Gradient, Expo Vector Icons

### 2. Backend (API Server)
Sistem penyedia API (*Application Programming Interface*) dibangun di atas Next.js dan berjalan sebagai server terpisah.
- **Runtime:** Node.js
- **Framework Utama:** Next.js (v14) dengan `pages/api` router
- **Bahasa:** TypeScript
- **Database ORM:** Prisma Client (v5.6)
- **Autentikasi & Keamanan:** JSON Web Token (JWT), Bcrypt.js (hashing kata sandi), Middleware `withAuth` dan `withRole`
- **Email Service:** Nodemailer (SMTP Gmail — untuk pengiriman OTP dan reset password)
- **Pemrosesan Gambar:** Sharp

### 3. Database
- **Sistem Database:** MySQL
- **Manajemen Skema:** Prisma (dengan fitur migrasi dan seeding)

---

## 🗄️ Struktur Basis Data (Schema)

Terdapat entitas-entitas utama yang saling berelasi di dalam sistem ini:

1. **User (Pengguna):**
   Merepresentasikan akun pengguna dengan peran tertentu (Role: `user`, `admin`, `staff`, `guest`). Data profil mencakup nama, email, tanggal lahir, dan foto profil. Pengguna dengan role *user/staff* dapat membuat Jadwal pribadi.

2. **Berita:**
   Menyimpan data berita dan pengumuman kampus yang dikelola oleh Admin. Setiap entri memiliki judul, URL tautan eksternal (referensi berita asli), dan gambar sampul.

3. **Jadwal (Agenda Pribadi):**
   Tabel agenda milik setiap pengguna secara personal. Mendukung pengaturan pengulangan (sekali, harian, mingguan, bulanan, tahunan) dan fitur pengingat (notifikasi H-5 menit hingga H-1 minggu sebelum kegiatan). Berelasi many-to-one dengan tabel `User` (setiap jadwal dimiliki satu pengguna, dengan aturan *Cascade Delete*).

4. **Kalender (Event Kampus Global):**
   Tabel untuk menyimpan acara atau event resmi kampus yang dikelola oleh Admin. Berbeda dengan *Jadwal* yang bersifat personal, data Kalender bersifat publik dan dapat dilihat oleh seluruh pengguna.

5. **Notifikasi:**
   Menyimpan riwayat pengumuman dan pemberitahuan yang di-*broadcast* oleh Admin kepada seluruh pengguna terdaftar.

6. **EmailOTP:**
   Tabel token keamanan sementara yang menyimpan kode OTP untuk proses verifikasi email saat registrasi dan reset password. Setiap OTP memiliki batas waktu aktif (*expires_at*) selama 10 menit.

---

## 🗺️ Alur Aplikasi & Navigasi (Application Flow)

Aplikasi ini menggunakan *state-based navigation* secara kustom. Tampilan layar yang aktif ditentukan oleh kondisi `user.role` yang tersimpan di dalam `AppContext`. Seluruh halaman (screen) aplikasi terbagi menjadi dua peran utama.

### Halaman Umum (User & Guest)
Halaman-halaman ini dapat diakses oleh pengguna yang sudah login maupun yang masih sebagai tamu (*guest*).
- **Home (`HomeScreen`):** Halaman beranda yang menampilkan ringkasan informasi, event kampus terdekat dari data Kalender, dan menu navigasi cepat.
- **Berita (`BeritaScreen`):** Menampilkan daftar berita dan pengumuman kampus terbaru.
- **Jadwal (`JadwalScreen`):** Menampilkan kalender dan daftar jadwal kegiatan pribadi pengguna. *(Diproteksi — Guest akan dialihkan ke halaman Login).*
- **Tambah Jadwal (`UserAddEventScreen`):** Formulir untuk menambahkan kegiatan pribadi baru ke jadwal. *(Diproteksi — Guest akan dialihkan ke halaman Login).*
- **Notifikasi (`NotifikasiScreen`):** Menampilkan riwayat notifikasi dan pengumuman dari kampus.
- **Menu (`MenuScreen`):** Halaman navigasi lainnya dan pengaturan akun.
- **Edit Profil (`EditProfilScreen`):** Formulir untuk mengubah data diri dan foto profil pengguna.

### Halaman Autentikasi
- **Login (`LoginScreen`):** Formulir masuk dengan email dan password.
- **Registrasi (`RegisterScreen`):** Formulir pendaftaran akun baru yang memerlukan verifikasi OTP via email.
- **Lupa Password (`ForgotPasswordScreen`):** Alur pemulihan kata sandi menggunakan OTP via email.

### Panel Administrator (Role: `admin`)
Admin memiliki tampilan dan bottom navigation tersendiri yang muncul secara otomatis ketika pengguna login sebagai Admin.
- **Admin Home (`AdminHomeScreen`):** Dasbor admin dengan ringkasan dan statistik sistem.
- **Manajemen Berita (`AdminBeritaScreen`, `AdminAddBeritaScreen`, `AdminEditBeritaScreen`):** CRUD penuh untuk konten berita dan pengumuman.
- **Manajemen Event/Jadwal Kampus (`AdminJadwalScreen`, `AdminAddEventScreen`, `AdminEditEventScreen`):** CRUD untuk event global kampus di Kalender yang terlihat oleh semua pengguna.
- **Manajemen Akun (`AdminAkunScreen`, `AdminAddAkunScreen`, `AdminEditAkunScreen`):** Melihat daftar seluruh pengguna, menambah akun staf/admin baru, mengedit peran, atau menghapus pengguna.
- **Kirim Notifikasi (`AdminNotifikasiScreen`):** Membuat dan *broadcast* notifikasi/pengumuman kepada seluruh pengguna.

---

## 🔄 Alur Sistem & Bisnis Proses

### 1. Alur Registrasi Pengguna Baru
1. Pengguna membuka halaman **Registrasi** dan mengisi data diri serta email.
2. Sistem mengirimkan **kode OTP 6 digit** ke email pengguna melalui layanan SMTP Gmail (berlaku 10 menit).
3. Pengguna memasukkan OTP untuk memverifikasi email.
4. Akun berhasil dibuat dan pengguna dapat langsung login.

### 2. Alur Lupa Password
1. Pengguna membuka halaman **Lupa Password** dan memasukkan email terdaftar.
2. Sistem mengirimkan **kode OTP baru** ke email tersebut (berlaku 30 menit).
3. Pengguna memasukkan OTP lalu mengisi kata sandi baru.
4. Password diperbarui setelah verifikasi OTP berhasil.

### 3. Alur Login & Sesi
1. Pengguna memasukkan email dan password.
2. Backend memverifikasi password yang ter-*hash* menggunakan `bcryptjs`.
3. Jika berhasil, Backend mengembalikan **JWT Token** yang berlaku selama **7 hari**.
4. Frontend menyimpan Token dan data profil ke `AsyncStorage` di perangkat.
5. Setiap permintaan API selanjutnya otomatis menyertakan token pada *header* `Authorization: Bearer <token>`.
6. Saat aplikasi dibuka kembali, token yang tersimpan dimuat ulang secara otomatis (**Persistent Login**).

### 4. Alur Akses Berdasarkan Role
- Setelah login, `AppContext` membaca `user.role` dan `AppNavigator` secara otomatis menentukan tampilan yang sesuai.
- Role `admin` → Diarahkan ke `AdminHomeScreen` dengan bottom navigation Admin.
- Role `user` / `staff` → Diarahkan ke `HomeScreen` dengan bottom navigation pengguna.
- Role `guest` (belum login) → Dapat menjelajah Home, Berita, dan Notifikasi, tetapi akan diarahkan ke `LoginScreen` saat mencoba mengakses Jadwal atau Edit Profil.

---

## 🔌 Endpoint API Backend

Backend menyediakan REST API yang berjalan pada port **3001**. Berikut adalah kelompok-kelompok modul endpoint yang tersedia:

| Kelompok       | Path                  | Keterangan                                                            |
|----------------|-----------------------|-----------------------------------------------------------------------|
| **Auth**       | `/api/auth/*`         | Login, Registrasi, Request OTP, Verifikasi OTP, Reset Password, Logout |
| **User**       | `/api/user/*`         | Mendapatkan dan memperbarui data profil pengguna                     |
| **Admin**      | `/api/admin/*`        | Endpoint khusus Admin (diproteksi `withRole(['admin'])`)             |
| **Berita**     | `/api/berita/*`       | CRUD data berita dan pengumuman kampus                                |
| **Jadwal**     | `/api/jadwal/*`       | CRUD jadwal pribadi pengguna (diproteksi dengan `withAuth`)          |
| **Kalender**   | `/api/kalender/*`     | CRUD event kampus global (write diproteksi admin)                    |
| **Notifikasi** | `/api/notifikasi/*`   | Mengambil daftar dan membuat notifikasi baru (broadcast oleh admin)  |
| **Health**     | `/api/health`         | Cek status server API (ping check)                                   |

---

## 🛠️ Panduan Menjalankan Proyek

### Persyaratan Sistem
- **Node.js** v18 atau lebih baru
- **MySQL** (via Laragon, XAMPP, atau server MySQL lainnya)
- **Expo Go** di perangkat Android/iOS (untuk testing)
- **npm** v9 atau lebih baru

### Langkah 1: Mendapatkan IP Address Jaringan Lokal
Agar HP dan PC/Laptop terhubung ke server yang sama dalam satu jaringan WiFi:

**Di Windows (PC):**
1. Buka Command Prompt (CMD).
2. Ketik `ipconfig`.
3. Cari bagian **"Wireless LAN adapter Wi-Fi"** dan catat angka di **"IPv4 Address"** (contoh: `192.168.x.x`).

**Di Android (HP):**
1. Buka Pengaturan > Wi-Fi.
2. Ketuk nama Wi-Fi yang terhubung, lalu cari **"Alamat IP"** di detail koneksi.

### Langkah 2: Konfigurasi File Proyek

**Di Backend (`backend/package.json`):**
Pastikan script `dev` mendengarkan di semua interface (`0.0.0.0`):
```
"dev": "next dev -H 0.0.0.0 -p 3001"
```

**Di Frontend (`src/config/api.js`):**
Ubah `baseURL` menggunakan IP PC Anda:
```
baseURL: 'http://192.168.x.x:3001/api'
```

### Langkah 3: Setup Backend & Database

1. Buat database MySQL baru bernama `stiesnu_db` (via Laragon/XAMPP/phpMyAdmin).
2. Masuk ke folder backend:
   ```bash
   cd backend
   ```
3. Install dependensi:
   ```bash
   npm install
   ```
4. Salin file konfigurasi environment:
   ```bash
   copy .env.example .env
   ```
5. Buka file `.env` dan atur koneksi database serta variabel lain:
   ```
   DATABASE_URL="mysql://root:@localhost:3306/stiesnu_db"
   JWT_SECRET="ganti-dengan-kunci-rahasia-anda"
   ```
6. Jalankan migrasi untuk membuat struktur tabel:
   ```bash
   npx prisma migrate dev
   ```
7. Masukkan data awal (admin default, dll):
   ```bash
   npx prisma db seed
   ```

### Langkah 4: Menjalankan Aplikasi (Dua Terminal Berbeda)

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
Server API akan berjalan di `http://0.0.0.0:3001`.

**Terminal 2 — Frontend (Expo):**
```bash
npx expo start --clear
```
Pindai QR Code yang muncul menggunakan aplikasi **Expo Go** di HP Anda.

### Perintah Berguna Lainnya

| Perintah (dalam folder `backend/`) | Fungsi |
|------------------------------------|--------|
| `npx prisma studio`                | Membuka GUI database Prisma di browser untuk melihat/edit data secara langsung |
| `npx prisma migrate dev`           | Membuat dan menjalankan migrasi skema database baru |
| `npx prisma db seed`               | Menjalankan ulang data awal (seeder) |
| `npx prisma generate`              | Memperbarui Prisma Client setelah perubahan `schema.prisma` |
