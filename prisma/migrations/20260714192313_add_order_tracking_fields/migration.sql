-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "carrier" TEXT,
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "shippedAt" TIMESTAMP(3),
ADD COLUMN     "trackingNumber" TEXT;
