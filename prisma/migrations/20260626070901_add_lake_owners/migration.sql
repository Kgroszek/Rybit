-- CreateTable
CREATE TABLE "LakeOwner" (
    "id" TEXT NOT NULL,
    "lakeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT,
    "role" TEXT NOT NULL DEFAULT 'owner',
    "canEditLake" BOOLEAN NOT NULL DEFAULT true,
    "canManageReservations" BOOLEAN NOT NULL DEFAULT true,
    "canManageSpots" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LakeOwner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LakeOwnerClaim" (
    "id" TEXT NOT NULL,
    "lakeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT,
    "claimantName" TEXT,
    "claimantPhone" TEXT,
    "claimantRole" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LakeOwnerClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LakeOwner_lakeId_idx" ON "LakeOwner"("lakeId");

-- CreateIndex
CREATE INDEX "LakeOwner_userId_idx" ON "LakeOwner"("userId");

-- CreateIndex
CREATE INDEX "LakeOwner_isActive_idx" ON "LakeOwner"("isActive");

-- CreateIndex
CREATE INDEX "LakeOwner_lakeId_isActive_idx" ON "LakeOwner"("lakeId", "isActive");

-- CreateIndex
CREATE INDEX "LakeOwner_userId_isActive_idx" ON "LakeOwner"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "LakeOwner_lakeId_userId_key" ON "LakeOwner"("lakeId", "userId");

-- CreateIndex
CREATE INDEX "LakeOwnerClaim_lakeId_idx" ON "LakeOwnerClaim"("lakeId");

-- CreateIndex
CREATE INDEX "LakeOwnerClaim_userId_idx" ON "LakeOwnerClaim"("userId");

-- CreateIndex
CREATE INDEX "LakeOwnerClaim_status_idx" ON "LakeOwnerClaim"("status");

-- CreateIndex
CREATE INDEX "LakeOwnerClaim_createdAt_idx" ON "LakeOwnerClaim"("createdAt");

-- CreateIndex
CREATE INDEX "LakeOwnerClaim_status_createdAt_idx" ON "LakeOwnerClaim"("status", "createdAt");

-- CreateIndex
CREATE INDEX "LakeOwnerClaim_lakeId_status_idx" ON "LakeOwnerClaim"("lakeId", "status");

-- CreateIndex
CREATE INDEX "LakeOwnerClaim_userId_status_idx" ON "LakeOwnerClaim"("userId", "status");

-- AddForeignKey
ALTER TABLE "LakeOwner" ADD CONSTRAINT "LakeOwner_lakeId_fkey" FOREIGN KEY ("lakeId") REFERENCES "Lake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LakeOwnerClaim" ADD CONSTRAINT "LakeOwnerClaim_lakeId_fkey" FOREIGN KEY ("lakeId") REFERENCES "Lake"("id") ON DELETE CASCADE ON UPDATE CASCADE;
