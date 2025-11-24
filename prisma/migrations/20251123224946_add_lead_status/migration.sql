/*
  Warnings:

  - You are about to drop the column `impersonatedBy` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `banExpires` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `banReason` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `banned` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'ABANDONED');

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "status" "LeadStatus" NOT NULL DEFAULT 'NEW';

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "impersonatedBy";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "banExpires",
DROP COLUMN "banReason",
DROP COLUMN "banned",
DROP COLUMN "role";
