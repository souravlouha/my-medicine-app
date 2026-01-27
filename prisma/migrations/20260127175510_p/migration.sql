/*
  Warnings:

  - You are about to drop the column `currentStock` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the column `medicineName` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerStrip` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the column `totalStrips` on the `Batch` table. All the data in the column will be lost.
  - The `status` column on the `Shipment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Unit` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `currentHolderId` on the `Unit` table. All the data in the column will be lost.
  - You are about to drop the column `history` on the `Unit` table. All the data in the column will be lost.
  - The `status` column on the `Unit` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `customId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fullAddress` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Sale` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transfer` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[batchNumber]` on the table `Batch` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shipmentId]` on the table `Shipment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `Unit` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publicId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `batchNumber` to the `Batch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `Batch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalQuantity` to the `Batch` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Unit` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `type` to the `Unit` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MANUFACTURER', 'DISTRIBUTOR', 'RETAILER', 'ADMIN', 'CONSUMER', 'OPERATOR');

-- CreateEnum
CREATE TYPE "MedicineType" AS ENUM ('TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'CREAM', 'DROPS');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('CARTON', 'BOX', 'STRIP');

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('CREATED', 'IN_TRANSIT', 'RECEIVED', 'SOLD', 'RECALLED', 'EXPIRED', 'RETURNED', 'DAMAGED');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'APPROVED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotifType" AS ENUM ('INFO', 'WARNING', 'ALERT');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'INVESTIGATING', 'RESOLVED', 'FALSE_REPORT');

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_retailerId_fkey";

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_unitUid_fkey";

-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_batchId_fkey";

-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_fromId_fkey";

-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_toId_fkey";

-- DropForeignKey
ALTER TABLE "Unit" DROP CONSTRAINT "Unit_currentHolderId_fkey";

-- DropIndex
DROP INDEX "User_customId_key";

-- AlterTable
ALTER TABLE "Batch" DROP COLUMN "currentStock",
DROP COLUMN "medicineName",
DROP COLUMN "pricePerStrip",
DROP COLUMN "status",
DROP COLUMN "totalStrips",
ADD COLUMN     "batchNumber" TEXT NOT NULL,
ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "totalQuantity" INTEGER NOT NULL,
ALTER COLUMN "mrp" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "driverPhone" TEXT,
ADD COLUMN     "expectedDelivery" TIMESTAMP(3),
ADD COLUMN     "receivedAt" TIMESTAMP(3),
ADD COLUMN     "shipmentId" TEXT,
ADD COLUMN     "vehicleNo" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "ShipmentStatus" NOT NULL DEFAULT 'IN_TRANSIT';

-- AlterTable
ALTER TABLE "Unit" DROP CONSTRAINT "Unit_pkey",
DROP COLUMN "currentHolderId",
DROP COLUMN "history",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currentHandlerId" TEXT,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "type" "UnitType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "UnitStatus" NOT NULL DEFAULT 'CREATED',
ADD CONSTRAINT "Unit_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "customId",
DROP COLUMN "fullAddress",
DROP COLUMN "location",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "geoLat" DOUBLE PRECISION,
ADD COLUMN     "geoLng" DOUBLE PRECISION,
ADD COLUMN     "licenseExp" TIMESTAMP(3),
ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "publicId" TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'MANUFACTURER';

-- DropTable
DROP TABLE "Sale";

-- DropTable
DROP TABLE "Transfer";

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION,
    "name" TEXT NOT NULL,
    "genericName" TEXT,
    "strength" TEXT,
    "type" "MedicineType" NOT NULL,
    "storageTemp" TEXT,
    "isNarcotic" BOOLEAN NOT NULL DEFAULT false,
    "manufacturerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "currentStock" INTEGER NOT NULL,
    "sellingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesRecord" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "buyerType" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotifType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recall" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "issuedBy" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "actionType" TEXT NOT NULL DEFAULT 'RETURN',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Return" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Return_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanHistory" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "location" TEXT,
    "device" TEXT,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isSuspicious" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ScanHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchMovement" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT,
    "senderName" TEXT NOT NULL,
    "receiverName" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DELIVERED',
    "location" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BatchMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrintJob" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "operatorId" TEXT,
    "machineName" TEXT,
    "targetQuantity" INTEGER NOT NULL,
    "printedQuantity" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "accessCode" TEXT,
    "accessExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrintJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "medicineName" TEXT NOT NULL,
    "batchNo" TEXT,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_productCode_key" ON "Product"("productCode");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_userId_batchId_key" ON "Inventory"("userId", "batchId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");

-- CreateIndex
CREATE INDEX "SalesRecord_sellerId_date_idx" ON "SalesRecord"("sellerId", "date");

-- CreateIndex
CREATE INDEX "BatchMovement_batchId_idx" ON "BatchMovement"("batchId");

-- CreateIndex
CREATE INDEX "BatchMovement_parentId_idx" ON "BatchMovement"("parentId");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PrintJob_jobId_key" ON "PrintJob"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "PrintJob_accessCode_key" ON "PrintJob"("accessCode");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_batchNumber_key" ON "Batch"("batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_shipmentId_key" ON "Shipment"("shipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_uid_key" ON "Unit"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "User_publicId_key" ON "User"("publicId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesRecord" ADD CONSTRAINT "SalesRecord_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesRecord" ADD CONSTRAINT "SalesRecord_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recall" ADD CONSTRAINT "Recall_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanHistory" ADD CONSTRAINT "ScanHistory_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchMovement" ADD CONSTRAINT "BatchMovement_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchMovement" ADD CONSTRAINT "BatchMovement_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "BatchMovement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
