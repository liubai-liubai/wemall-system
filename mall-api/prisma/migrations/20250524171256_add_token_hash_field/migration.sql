/*
  Warnings:

  - A unique constraint covering the columns `[token_hash]` on the table `refresh_tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token_hash` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `refresh_tokens_token_key` ON `refresh_tokens`;

-- AlterTable
ALTER TABLE `refresh_tokens` ADD COLUMN `token_hash` VARCHAR(64) NOT NULL,
    MODIFY `token` TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `refresh_tokens_token_hash_key` ON `refresh_tokens`(`token_hash`);
