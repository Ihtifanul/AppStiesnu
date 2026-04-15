/*
  Warnings:

  - You are about to drop the column `createdAt` on the `berita` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `berita` table. All the data in the column will be lost.
  - You are about to drop the column `deskripsi` on the `berita` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `berita` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `user` table. All the data in the column will be lost.
  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `Enum(EnumId(0))`.
  - You are about to drop the `auditlog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reminder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `schedule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `berita` DROP FOREIGN KEY `Berita_created_by_fkey`;

-- DropForeignKey
ALTER TABLE `reminder` DROP FOREIGN KEY `Reminder_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `schedule` DROP FOREIGN KEY `Schedule_created_by_fkey`;

-- DropIndex
DROP INDEX `User_username_key` ON `user`;

-- AlterTable
ALTER TABLE `berita` DROP COLUMN `createdAt`,
    DROP COLUMN `created_by`,
    DROP COLUMN `deskripsi`,
    DROP COLUMN `updatedAt`,
    MODIFY `gambar` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `is_active`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `username`,
    ADD COLUMN `tanggal_lahir` DATETIME(3) NULL,
    MODIFY `role` ENUM('user', 'admin', 'staff', 'guest') NOT NULL DEFAULT 'user',
    MODIFY `foto_profil` LONGTEXT NULL;

-- DropTable
DROP TABLE `auditlog`;

-- DropTable
DROP TABLE `notification`;

-- DropTable
DROP TABLE `reminder`;

-- DropTable
DROP TABLE `schedule`;

-- CreateTable
CREATE TABLE `Jadwal` (
    `id_jadwal` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_kegiatan` VARCHAR(191) NOT NULL,
    `deskripsi_kegiatan` LONGTEXT NULL,
    `tanggal_kegiatan` DATETIME(3) NOT NULL,
    `waktu_kegiatan` DATETIME(3) NULL,
    `pengulangan` ENUM('sekali', 'harian', 'mingguan', 'bulanan') NOT NULL DEFAULT 'sekali',
    `pengingat` ENUM('tidak_ada', 'lima_menit', 'sepuluh_menit', 'lima_belas_menit', 'tiga_puluh_menit', 'satu_jam', 'empat_jam', 'satu_hari', 'dua_hari', 'tiga_hari', 'satu_minggu') NOT NULL DEFAULT 'tidak_ada',
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
    `pengulangan` ENUM('sekali', 'harian', 'mingguan', 'bulanan') NOT NULL DEFAULT 'sekali',

    PRIMARY KEY (`id_event`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notifikasi` (
    `id_notifikasi` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_notifikasi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Jadwal` ADD CONSTRAINT `Jadwal_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;
