-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN');

-- CreateEnum
CREATE TYPE "BeadSize" AS ENUM ('MM6', 'MM8', 'MM10');

-- CreateEnum
CREATE TYPE "BeadFinish" AS ENUM ('PEARLESCENT', 'GLOSSY_CANDY', 'MATTE', 'METALLIC', 'WOOD', 'GEMSTONE');

-- CreateEnum
CREATE TYPE "PackagingType" AS ENUM ('VELVET_POUCH', 'LUXURY_BOX', 'GIFT_CARD_NOTE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Bead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hexCode" TEXT,
    "textureUrl" TEXT,
    "finish" "BeadFinish" NOT NULL DEFAULT 'MATTE',
    "size" "BeadSize" NOT NULL DEFAULT 'MM8',
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Charm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Charm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackagingOption" (
    "id" TEXT NOT NULL,
    "type" "PackagingType" NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackagingOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "heroImageUrl" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wristSize" TEXT NOT NULL DEFAULT 'MEDIUM',
    "beadConfig" JSONB NOT NULL,
    "charmId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "packagingTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "shippingName" TEXT NOT NULL,
    "shippingAddress" TEXT NOT NULL,
    "shippingCity" TEXT NOT NULL,
    "shippingPostal" TEXT NOT NULL,
    "shippingCountry" TEXT NOT NULL,
    "giftNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "designSnapshot" JSONB NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "lineTotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FriendProfile" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "wristInches" DOUBLE PRECISION,
    "wristSize" TEXT NOT NULL DEFAULT 'MEDIUM',
    "preferences" TEXT,
    "savedDesign" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FriendProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Bead_size_idx" ON "Bead"("size");

-- CreateIndex
CREATE INDEX "Bead_isActive_idx" ON "Bead"("isActive");

-- CreateIndex
CREATE INDEX "Charm_isActive_idx" ON "Charm"("isActive");

-- CreateIndex
CREATE INDEX "PackagingOption_isActive_idx" ON "PackagingOption"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");

-- CreateIndex
CREATE INDEX "FriendProfile_ownerId_idx" ON "FriendProfile"("ownerId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_charmId_fkey" FOREIGN KEY ("charmId") REFERENCES "Charm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendProfile" ADD CONSTRAINT "FriendProfile_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
