-- CreateTable
CREATE TABLE "ContactRateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactRateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "ContactRateLimit_windowStart_idx" ON "ContactRateLimit"("windowStart");

-- CreateIndex
CREATE INDEX "ContactRateLimit_updatedAt_idx" ON "ContactRateLimit"("updatedAt");
