/*
  Warnings:

  - A unique constraint covering the columns `[shareToken]` on the table `FishingTrip` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FishingTrip" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "endsAt" TIMESTAMP(3),
ADD COLUMN     "isSummaryPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "peopleCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "shareToken" TEXT,
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "summaryRating" INTEGER,
ADD COLUMN     "weatherSummary" TEXT;

-- CreateTable
CREATE TABLE "TripMember" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT,
    "role" TEXT NOT NULL DEFAULT 'editor',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "invitedByUserId" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "lastViewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripNote" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "authorName" TEXT,
    "type" TEXT NOT NULL DEFAULT 'general',
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripCost" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PLN',
    "paidByUserId" TEXT NOT NULL,
    "paidByName" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripGearItem" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "gearId" TEXT,
    "addedByUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit" TEXT,
    "note" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isPacked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripGearItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripReminder" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'custom',
    "title" TEXT NOT NULL,
    "remindAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripActivity" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "actorName" TEXT,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripMedia" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT,
    "url" TEXT NOT NULL,
    "imagePath" TEXT,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TripMember_tripId_idx" ON "TripMember"("tripId");

-- CreateIndex
CREATE INDEX "TripMember_userId_idx" ON "TripMember"("userId");

-- CreateIndex
CREATE INDEX "TripMember_status_idx" ON "TripMember"("status");

-- CreateIndex
CREATE INDEX "TripMember_createdAt_idx" ON "TripMember"("createdAt");

-- CreateIndex
CREATE INDEX "TripMember_userId_status_idx" ON "TripMember"("userId", "status");

-- CreateIndex
CREATE INDEX "TripMember_tripId_status_idx" ON "TripMember"("tripId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TripMember_tripId_userId_key" ON "TripMember"("tripId", "userId");

-- CreateIndex
CREATE INDEX "TripNote_tripId_idx" ON "TripNote"("tripId");

-- CreateIndex
CREATE INDEX "TripNote_authorUserId_idx" ON "TripNote"("authorUserId");

-- CreateIndex
CREATE INDEX "TripNote_type_idx" ON "TripNote"("type");

-- CreateIndex
CREATE INDEX "TripNote_createdAt_idx" ON "TripNote"("createdAt");

-- CreateIndex
CREATE INDEX "TripNote_tripId_createdAt_idx" ON "TripNote"("tripId", "createdAt");

-- CreateIndex
CREATE INDEX "TripCost_tripId_idx" ON "TripCost"("tripId");

-- CreateIndex
CREATE INDEX "TripCost_category_idx" ON "TripCost"("category");

-- CreateIndex
CREATE INDEX "TripCost_paidByUserId_idx" ON "TripCost"("paidByUserId");

-- CreateIndex
CREATE INDEX "TripCost_createdAt_idx" ON "TripCost"("createdAt");

-- CreateIndex
CREATE INDEX "TripCost_tripId_category_idx" ON "TripCost"("tripId", "category");

-- CreateIndex
CREATE INDEX "TripGearItem_tripId_idx" ON "TripGearItem"("tripId");

-- CreateIndex
CREATE INDEX "TripGearItem_gearId_idx" ON "TripGearItem"("gearId");

-- CreateIndex
CREATE INDEX "TripGearItem_addedByUserId_idx" ON "TripGearItem"("addedByUserId");

-- CreateIndex
CREATE INDEX "TripGearItem_category_idx" ON "TripGearItem"("category");

-- CreateIndex
CREATE INDEX "TripGearItem_isPacked_idx" ON "TripGearItem"("isPacked");

-- CreateIndex
CREATE INDEX "TripGearItem_tripId_category_idx" ON "TripGearItem"("tripId", "category");

-- CreateIndex
CREATE INDEX "TripReminder_tripId_idx" ON "TripReminder"("tripId");

-- CreateIndex
CREATE INDEX "TripReminder_userId_idx" ON "TripReminder"("userId");

-- CreateIndex
CREATE INDEX "TripReminder_status_idx" ON "TripReminder"("status");

-- CreateIndex
CREATE INDEX "TripReminder_remindAt_idx" ON "TripReminder"("remindAt");

-- CreateIndex
CREATE INDEX "TripReminder_userId_status_idx" ON "TripReminder"("userId", "status");

-- CreateIndex
CREATE INDEX "TripReminder_status_remindAt_idx" ON "TripReminder"("status", "remindAt");

-- CreateIndex
CREATE INDEX "TripActivity_tripId_idx" ON "TripActivity"("tripId");

-- CreateIndex
CREATE INDEX "TripActivity_actorUserId_idx" ON "TripActivity"("actorUserId");

-- CreateIndex
CREATE INDEX "TripActivity_action_idx" ON "TripActivity"("action");

-- CreateIndex
CREATE INDEX "TripActivity_createdAt_idx" ON "TripActivity"("createdAt");

-- CreateIndex
CREATE INDEX "TripActivity_tripId_createdAt_idx" ON "TripActivity"("tripId", "createdAt");

-- CreateIndex
CREATE INDEX "TripMedia_tripId_idx" ON "TripMedia"("tripId");

-- CreateIndex
CREATE INDEX "TripMedia_userId_idx" ON "TripMedia"("userId");

-- CreateIndex
CREATE INDEX "TripMedia_imagePath_idx" ON "TripMedia"("imagePath");

-- CreateIndex
CREATE INDEX "TripMedia_createdAt_idx" ON "TripMedia"("createdAt");

-- CreateIndex
CREATE INDEX "TripMedia_tripId_createdAt_idx" ON "TripMedia"("tripId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FishingTrip_shareToken_key" ON "FishingTrip"("shareToken");

-- CreateIndex
CREATE INDEX "FishingTrip_checklistId_idx" ON "FishingTrip"("checklistId");

-- CreateIndex
CREATE INDEX "FishingTrip_endsAt_idx" ON "FishingTrip"("endsAt");

-- AddForeignKey
ALTER TABLE "FishingTrip" ADD CONSTRAINT "FishingTrip_lakeId_fkey" FOREIGN KEY ("lakeId") REFERENCES "Lake"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FishingTrip" ADD CONSTRAINT "FishingTrip_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "TripChecklist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripMember" ADD CONSTRAINT "TripMember_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "FishingTrip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripNote" ADD CONSTRAINT "TripNote_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "FishingTrip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripCost" ADD CONSTRAINT "TripCost_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "FishingTrip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripGearItem" ADD CONSTRAINT "TripGearItem_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "FishingTrip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripGearItem" ADD CONSTRAINT "TripGearItem_gearId_fkey" FOREIGN KEY ("gearId") REFERENCES "FishingGear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripReminder" ADD CONSTRAINT "TripReminder_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "FishingTrip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripActivity" ADD CONSTRAINT "TripActivity_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "FishingTrip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripMedia" ADD CONSTRAINT "TripMedia_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "FishingTrip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FishingCatch" ADD CONSTRAINT "FishingCatch_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "FishingTrip"("id") ON DELETE SET NULL ON UPDATE CASCADE;
