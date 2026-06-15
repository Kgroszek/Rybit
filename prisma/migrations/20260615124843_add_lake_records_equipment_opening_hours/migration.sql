-- AlterTable
ALTER TABLE "Lake" ADD COLUMN     "openingHours" TEXT;

-- CreateTable
CREATE TABLE "LakeRecordFish" (
    "id" TEXT NOT NULL,
    "fishName" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "lakeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LakeRecordFish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LakeEquipmentRequirement" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "lakeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LakeEquipmentRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LakeRecordFish_lakeId_idx" ON "LakeRecordFish"("lakeId");

-- CreateIndex
CREATE INDEX "LakeRecordFish_fishName_idx" ON "LakeRecordFish"("fishName");

-- CreateIndex
CREATE INDEX "LakeRecordFish_weightKg_idx" ON "LakeRecordFish"("weightKg");

-- CreateIndex
CREATE INDEX "LakeEquipmentRequirement_lakeId_idx" ON "LakeEquipmentRequirement"("lakeId");

-- AddForeignKey
ALTER TABLE "LakeRecordFish" ADD CONSTRAINT "LakeRecordFish_lakeId_fkey" FOREIGN KEY ("lakeId") REFERENCES "Lake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LakeEquipmentRequirement" ADD CONSTRAINT "LakeEquipmentRequirement_lakeId_fkey" FOREIGN KEY ("lakeId") REFERENCES "Lake"("id") ON DELETE CASCADE ON UPDATE CASCADE;
