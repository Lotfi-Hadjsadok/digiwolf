/*
  Warnings:

  - Changed the type of `category` on the `leads` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BusinessCategory" AS ENUM ('REAL_ESTATE', 'ELECTROMENAGER', 'SALES', 'MEUBLES', 'ELECTRONICS', 'ALIMENTATION', 'SPORTS', 'OTHER');

-- AlterTable
ALTER TABLE "leads" DROP COLUMN "category",
ADD COLUMN     "category" "BusinessCategory" NOT NULL;
