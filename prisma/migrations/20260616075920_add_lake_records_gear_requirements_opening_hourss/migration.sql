/*
  Warnings:

  - You are about to drop the column `equipmentRequirements` on the `LakeSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `recordFish` on the `LakeSubmission` table. All the data in the column will be lost.
  - You are about to drop the `LakeEquipmentRequirement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LakeRecordFish` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LakeEquipmentRequirement" DROP CONSTRAINT "LakeEquipmentRequirement_lakeId_fkey";

-- DropForeignKey
ALTER TABLE "LakeRecordFish" DROP CONSTRAINT "LakeRecordFish_lakeId_fkey";

-- AlterTable
ALTER TABLE "Lake" ADD COLUMN     "isOpenAllDay" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "LakeSubmission" DROP COLUMN "equipmentRequirements",
DROP COLUMN "recordFish",
ADD COLUMN     "isOpenAllDay" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "LakeEquipmentRequirement";

-- DropTable
DROP TABLE "LakeRecordFish";

-- CreateTable
CREATE TABLE "LakeFishRecord" (
    "id" TEXT NOT NULL,
    "fishName" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "lakeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LakeFishRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LakeGearRequirement" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "lakeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LakeGearRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LakeSubmissionFishRecord" (
    "id" TEXT NOT NULL,
    "fishName" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "submissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LakeSubmissionFishRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LakeSubmissionGearRequirement" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LakeSubmissionGearRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LakeFishRecord_lakeId_idx" ON "LakeFishRecord"("lakeId");

-- CreateIndex
CREATE INDEX "LakeFishRecord_fishName_idx" ON "LakeFishRecord"("fishName");

-- CreateIndex
CREATE INDEX "LakeFishRecord_weightKg_idx" ON "LakeFishRecord"("weightKg");

-- CreateIndex
CREATE INDEX "LakeGearRequirement_lakeId_idx" ON "LakeGearRequirement"("lakeId");

-- CreateIndex
CREATE INDEX "LakeSubmissionFishRecord_submissionId_idx" ON "LakeSubmissionFishRecord"("submissionId");

-- CreateIndex
CREATE INDEX "LakeSubmissionFishRecord_fishName_idx" ON "LakeSubmissionFishRecord"("fishName");

-- CreateIndex
CREATE INDEX "LakeSubmissionFishRecord_weightKg_idx" ON "LakeSubmissionFishRecord"("weightKg");

-- CreateIndex
CREATE INDEX "LakeSubmissionGearRequirement_submissionId_idx" ON "LakeSubmissionGearRequirement"("submissionId");

-- AddForeignKey
ALTER TABLE "LakeFishRecord" ADD CONSTRAINT "LakeFishRecord_lakeId_fkey" FOREIGN KEY ("lakeId") REFERENCES "Lake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LakeGearRequirement" ADD CONSTRAINT "LakeGearRequirement_lakeId_fkey" FOREIGN KEY ("lakeId") REFERENCES "Lake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LakeSubmissionFishRecord" ADD CONSTRAINT "LakeSubmissionFishRecord_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "LakeSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LakeSubmissionGearRequirement" ADD CONSTRAINT "LakeSubmissionGearRequirement_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "LakeSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
