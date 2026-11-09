-- CreateTable
CREATE TABLE "LakeWebsite" (
    "id" TEXT NOT NULL,
    "lakeId" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL DEFAULT 'modern',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "siteName" TEXT,
    "heroTitle" TEXT,
    "heroSubtitle" TEXT,
    "aboutTitle" TEXT,
    "aboutText" TEXT,
    "logoUrl" TEXT,
    "heroImageUrl" TEXT,
    "galleryUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "primaryColor" TEXT NOT NULL DEFAULT '#2563EB',
    "accentColor" TEXT NOT NULL DEFAULT '#0EA5E9',
    "backgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "textColor" TEXT NOT NULL DEFAULT '#0F172A',
    "showAbout" BOOLEAN NOT NULL DEFAULT true,
    "showFish" BOOLEAN NOT NULL DEFAULT true,
    "showGallery" BOOLEAN NOT NULL DEFAULT true,
    "showPriceList" BOOLEAN NOT NULL DEFAULT true,
    "showRules" BOOLEAN NOT NULL DEFAULT true,
    "showContact" BOOLEAN NOT NULL DEFAULT true,
    "showReservations" BOOLEAN NOT NULL DEFAULT false,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "contactWebsite" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LakeWebsite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LakeWebsite_lakeId_key" ON "LakeWebsite"("lakeId");

-- CreateIndex
CREATE UNIQUE INDEX "LakeWebsite_subdomain_key" ON "LakeWebsite"("subdomain");

-- CreateIndex
CREATE INDEX "LakeWebsite_status_idx" ON "LakeWebsite"("status");

-- CreateIndex
CREATE INDEX "LakeWebsite_templateKey_idx" ON "LakeWebsite"("templateKey");

-- CreateIndex
CREATE INDEX "LakeWebsite_publishedAt_idx" ON "LakeWebsite"("publishedAt");

-- CreateIndex
CREATE INDEX "LakeWebsite_status_publishedAt_idx" ON "LakeWebsite"("status", "publishedAt");

-- AddForeignKey
ALTER TABLE "LakeWebsite" ADD CONSTRAINT "LakeWebsite_lakeId_fkey" FOREIGN KEY ("lakeId") REFERENCES "Lake"("id") ON DELETE CASCADE ON UPDATE CASCADE;
