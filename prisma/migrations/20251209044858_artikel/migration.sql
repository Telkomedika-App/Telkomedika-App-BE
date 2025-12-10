-- CreateTable
CREATE TABLE `artikel` (
    `id` VARCHAR(191) NOT NULL,
    `judul` VARCHAR(191) NOT NULL,
    `konten` VARCHAR(191) NOT NULL,
    `excerpt` VARCHAR(191) NULL,
    `gambar_url` VARCHAR(191) NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `tags` JSON NOT NULL,
    `penulis` VARCHAR(191) NOT NULL,
    `penulis_role` VARCHAR(191) NOT NULL,
    `is_published` BOOLEAN NOT NULL DEFAULT true,
    `created_by` VARCHAR(191) NOT NULL,
    `updated_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
