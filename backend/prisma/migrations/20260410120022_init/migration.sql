-- CreateTable
CREATE TABLE `User` (
    `id_user` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'STAFF', 'USER', 'GUEST') NOT NULL DEFAULT 'USER',
    `foto_profil` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Berita` (
    `id_berita` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(191) NOT NULL,
    `link_url` VARCHAR(191) NOT NULL,
    `gambar` VARCHAR(191) NULL,
    `deskripsi` LONGTEXT NULL,
    `created_by` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Berita_created_by_idx`(`created_by`),
    PRIMARY KEY (`id_berita`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Schedule` (
    `id_schedule` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_kegiatan` VARCHAR(191) NOT NULL,
    `deskripsi_kegiatan` LONGTEXT NULL,
    `tanggal_kegiatan` DATETIME(3) NOT NULL,
    `waktu_kegiatan` DATETIME(3) NULL,
    `pengulangan` ENUM('ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY') NULL DEFAULT 'ONCE',
    `pengingat` ENUM('NONE', 'FIVE_MIN', 'TEN_MIN', 'FIFTEEN_MIN', 'THIRTY_MIN', 'ONE_HOUR', 'FOUR_HOURS', 'ONE_DAY', 'TWO_DAYS', 'THREE_DAYS', 'ONE_WEEK') NULL DEFAULT 'NONE',
    `warna_event` VARCHAR(191) NULL DEFAULT '#4ADE80',
    `created_by` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Schedule_created_by_idx`(`created_by`),
    INDEX `Schedule_tanggal_kegiatan_idx`(`tanggal_kegiatan`),
    PRIMARY KEY (`id_schedule`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reminder` (
    `id_reminder` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(191) NOT NULL,
    `deskripsi` LONGTEXT NULL,
    `waktu_mulai` DATETIME(3) NOT NULL,
    `waktu_akhir` DATETIME(3) NULL,
    `pengulangan` ENUM('ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY') NULL DEFAULT 'ONCE',
    `tipe_pengingat` ENUM('NONE', 'FIVE_MIN', 'TEN_MIN', 'FIFTEEN_MIN', 'THIRTY_MIN', 'ONE_HOUR', 'FOUR_HOURS', 'ONE_DAY', 'TWO_DAYS', 'THREE_DAYS', 'ONE_WEEK') NULL DEFAULT 'NONE',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `user_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Reminder_user_id_idx`(`user_id`),
    INDEX `Reminder_waktu_mulai_idx`(`waktu_mulai`),
    PRIMARY KEY (`id_reminder`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id_notifikasi` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(191) NOT NULL,
    `deskripsi` LONGTEXT NULL,
    `tipe` ENUM('BERITA_BARU', 'JADWAL_MENDATANG', 'REMINDER', 'SISTEM') NOT NULL,
    `terkait_dengan` INTEGER NULL,
    `tipe_konten` VARCHAR(191) NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_createdAt_idx`(`createdAt`),
    INDEX `Notification_is_read_idx`(`is_read`),
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

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `action` VARCHAR(191) NOT NULL,
    `resource_type` VARCHAR(191) NOT NULL,
    `resource_id` INTEGER NULL,
    `changes` LONGTEXT NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_user_id_idx`(`user_id`),
    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Berita` ADD CONSTRAINT `Berita_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `User`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `User`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reminder` ADD CONSTRAINT `Reminder_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;
