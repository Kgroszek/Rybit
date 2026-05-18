-- CreateTable
CREATE TABLE "FishingCatchReport" (
    "id" TEXT NOT NULL,
    "catchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FishingCatchReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FishingCatchReport_catchId_idx" ON "FishingCatchReport"("catchId");

-- CreateIndex
CREATE INDEX "FishingCatchReport_userId_idx" ON "FishingCatchReport"("userId");

-- CreateIndex
CREATE INDEX "FishingCatchReport_status_idx" ON "FishingCatchReport"("status");

-- CreateIndex
CREATE UNIQUE INDEX "FishingCatchReport_catchId_userId_key" ON "FishingCatchReport"("catchId", "userId");

-- AddForeignKey
ALTER TABLE "FishingCatchReport" ADD CONSTRAINT "FishingCatchReport_catchId_fkey" FOREIGN KEY ("catchId") REFERENCES "FishingCatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
