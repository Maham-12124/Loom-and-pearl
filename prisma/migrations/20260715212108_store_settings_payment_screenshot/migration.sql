-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentScreenshotUrl" TEXT;

-- CreateTable
CREATE TABLE "StoreSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "jazzcashAccountNumber" TEXT,
    "jazzcashAccountName" TEXT,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);
