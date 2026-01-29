/*
  Warnings:

  - Made the column `sellingPrice` on table `Inventory` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Inventory" ALTER COLUMN "sellingPrice" SET NOT NULL,
ALTER COLUMN "sellingPrice" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "SalesRecord" ADD COLUMN     "unitType" TEXT NOT NULL DEFAULT 'STRIP';
