-- AlterTable
ALTER TABLE "LakeImage" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "LakeImage_sortOrder_idx" ON "LakeImage"("sortOrder");

-- CreateIndex
CREATE INDEX "LakeImage_lakeId_sortOrder_idx" ON "LakeImage"("lakeId", "sortOrder");
