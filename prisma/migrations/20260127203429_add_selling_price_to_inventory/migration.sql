-- AlterTable
ALTER TABLE "ActivityLog" ALTER COLUMN "details" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Inventory" ALTER COLUMN "sellingPrice" DROP NOT NULL,
ALTER COLUMN "sellingPrice" DROP DEFAULT;
