/*
  Warnings:

  - The primary key for the `Batch` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `batchId` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the column `isRecalled` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the column `soldAt` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `distributorName` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `parentUid` on the `Unit` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Unit` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[invoiceNo]` on the table `Transfer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `currentStock` to the `Batch` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Batch` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `pricePerStrip` to the `Batch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalStrips` to the `Batch` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `mfgDate` on the `Batch` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `expDate` on the `Batch` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `costPrice` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profit` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_batchId_fkey";

-- DropForeignKey
ALTER TABLE "Unit" DROP CONSTRAINT "Unit_batchId_fkey";

-- DropForeignKey
ALTER TABLE "Unit" DROP CONSTRAINT "Unit_parentUid_fkey";

-- AlterTable
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_pkey",
DROP COLUMN "batchId",
DROP COLUMN "isRecalled",
ADD COLUMN     "currentStock" INTEGER NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "mrp" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "pricePerStrip" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "totalStrips" INTEGER NOT NULL,
DROP COLUMN "mfgDate",
ADD COLUMN     "mfgDate" TIMESTAMP(3) NOT NULL,
DROP COLUMN "expDate",
ADD COLUMN     "expDate" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Batch_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "soldAt",
ADD COLUMN     "costPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "profit" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Transfer" DROP COLUMN "distributorName",
ADD COLUMN     "invoiceNo" TEXT,
ADD COLUMN     "receivedDate" TIMESTAMP(3),
ADD COLUMN     "shipmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "medicineName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Unit" DROP COLUMN "parentUid",
DROP COLUMN "type",
ADD COLUMN     "history" JSONB NOT NULL DEFAULT '[]',
ALTER COLUMN "status" SET DEFAULT 'IN_MANUFACTURER';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "customId" TEXT NOT NULL,
ADD COLUMN     "fullAddress" TEXT,
ADD COLUMN     "gstNo" TEXT,
ADD COLUMN     "licenseNo" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "distributorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_TRANSIT',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipmentItem" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ShipmentItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transfer_invoiceNo_key" ON "Transfer"("invoiceNo");

-- CreateIndex
CREATE UNIQUE INDEX "User_customId_key" ON "User"("customId");

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_toId_fkey" FOREIGN KEY ("toId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_unitUid_fkey" FOREIGN KEY ("unitUid") REFERENCES "Unit"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentItem" ADD CONSTRAINT "ShipmentItem_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentItem" ADD CONSTRAINT "ShipmentItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
