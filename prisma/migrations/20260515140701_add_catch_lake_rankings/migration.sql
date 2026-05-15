-- AlterTable
ALTER TABLE "FishingCatch" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rankingStatus" TEXT NOT NULL DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "FishingCatch_lakeId_idx" ON "FishingCatch"("lakeId");

-- CreateIndex
CREATE INDEX "FishingCatch_userId_idx" ON "FishingCatch"("userId");

-- CreateIndex
CREATE INDEX "FishingCatch_rankingStatus_idx" ON "FishingCatch"("rankingStatus");

-- CreateIndex
CREATE INDEX "FishingCatch_isPublic_idx" ON "FishingCatch"("isPublic");

-- AddForeignKey
ALTER TABLE "FishingCatch" ADD CONSTRAINT "FishingCatch_lakeId_fkey" FOREIGN KEY ("lakeId") REFERENCES "Lake"("id") ON DELETE SET NULL ON UPDATE CASCADE;
