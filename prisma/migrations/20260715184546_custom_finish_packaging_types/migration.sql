-- Convert Bead.finish from enum to free text (preserving existing values)
ALTER TABLE "Bead" ALTER COLUMN "finish" DROP DEFAULT;
ALTER TABLE "Bead" ALTER COLUMN "finish" TYPE TEXT USING "finish"::TEXT;
ALTER TABLE "Bead" ALTER COLUMN "finish" SET DEFAULT 'MATTE';

-- Convert PackagingOption.type from enum to free text (preserving existing values)
ALTER TABLE "PackagingOption" ALTER COLUMN "type" TYPE TEXT USING "type"::TEXT;

-- Drop the now-unused enums
DROP TYPE "BeadFinish";
DROP TYPE "PackagingType";

-- Add optional image support to packaging options
ALTER TABLE "PackagingOption" ADD COLUMN "imageUrl" TEXT;

-- CreateTable
CREATE TABLE "FinishType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinishType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackagingType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackagingType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinishType_name_key" ON "FinishType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PackagingType_name_key" ON "PackagingType"("name");
