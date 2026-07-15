-- Add payment method fields to Order
ALTER TABLE "Order" ADD COLUMN "paymentMethod" TEXT NOT NULL DEFAULT 'COD';
ALTER TABLE "Order" ADD COLUMN "paymentReference" TEXT;
