-- CreateTable
CREATE TABLE "UserChecklistTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tripType" TEXT NOT NULL DEFAULT 'custom',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserChecklistTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserChecklistTemplateItem" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit" TEXT,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserChecklistTemplateItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserChecklistTemplate_userId_idx" ON "UserChecklistTemplate"("userId");

-- CreateIndex
CREATE INDEX "UserChecklistTemplate_userId_updatedAt_idx" ON "UserChecklistTemplate"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserChecklistTemplate_userId_name_key" ON "UserChecklistTemplate"("userId", "name");

-- CreateIndex
CREATE INDEX "UserChecklistTemplateItem_templateId_idx" ON "UserChecklistTemplateItem"("templateId");

-- CreateIndex
CREATE INDEX "UserChecklistTemplateItem_templateId_position_idx" ON "UserChecklistTemplateItem"("templateId", "position");

-- AddForeignKey
ALTER TABLE "UserChecklistTemplateItem" ADD CONSTRAINT "UserChecklistTemplateItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "UserChecklistTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
