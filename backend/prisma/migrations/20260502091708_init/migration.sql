-- CreateTable
CREATE TABLE `User` (
    `id_user` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `tanggal_lahir` DATETIME(3) NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('user', 'admin', 'staff', 'guest') NOT NULL DEFAULT 'user',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `foto_profil` LONGTEXT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Berita` (
    `id_berita` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(191) NOT NULL,
    `link_url` VARCHAR(191) NOT NULL,
    `gambar` LONGTEXT NULL,

    PRIMARY KEY (`id_berita`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Jadwal` (
    `id_jadwal` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_kegiatan` VARCHAR(191) NOT NULL,
    `deskripsi_kegiatan` LONGTEXT NULL,
    `tanggal_kegiatan` DATETIME(3) NOT NULL,
    `waktu_kegiatan` DATETIME(3) NULL,
    `pengulangan` ENUM('sekali', 'harian', 'mingguan', 'bulanan', 'tahunan') NOT NULL DEFAULT 'sekali',
    `pengingat` ENUM('tidak_ada', 'lima_menit', 'sepuluh_menit', 'lima_belas_menit', 'tiga_puluh_menit', 'satu_jam', 'empat_jam', 'satu_hari', 'dua_hari', 'tiga_hari', 'satu_minggu') NOT NULL DEFAULT 'tidak_ada',
    `warna_kegiatan` VARCHAR(191) NULL DEFAULT '#059669',
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`id_jadwal`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kalender` (
    `id_event` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_event` VARCHAR(191) NOT NULL,
    `waktu_event` DATETIME(3) NOT NULL,
    `deskripsi_event` LONGTEXT NULL,
    `warna_event` VARCHAR(191) NULL DEFAULT '#4ADE80',
    `pengulangan` ENUM('sekali', 'harian', 'mingguan', 'bulanan', 'tahunan') NOT NULL DEFAULT 'sekali',

    PRIMARY KEY (`id_event`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notifikasi` (
    `id_notifikasi` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_notifikasi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailOTP` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `otp` VARCHAR(191) NOT NULL,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `expires_at` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `EmailOTP_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Jadwal` ADD CONSTRAINT `Jadwal_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;
