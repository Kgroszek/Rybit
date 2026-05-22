/*
  Warnings:

  - You are about to drop the column `pzwDistrict` on the `Lake` table. All the data in the column will be lost.
  - You are about to drop the column `pzwDistrict` on the `LakeSubmission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lake" DROP COLUMN "pzwDistrict";

-- AlterTable
ALTER TABLE "LakeSubmission" DROP COLUMN "pzwDistrict";

-- CreateIndex
CREATE INDEX "Favourite_lakeId_idx" ON "Favourite"("lakeId");

-- CreateIndex
CREATE INDEX "Favourite_createdAt_idx" ON "Favourite"("createdAt");

-- CreateIndex
CREATE INDEX "FishSpecies_lakeId_idx" ON "FishSpecies"("lakeId");

-- CreateIndex
CREATE INDEX "FishSpecies_name_idx" ON "FishSpecies"("name");

-- CreateIndex
CREATE INDEX "FishingCatch_tripId_idx" ON "FishingCatch"("tripId");

-- CreateIndex
CREATE INDEX "FishingCatch_fishName_idx" ON "FishingCatch"("fishName");

-- CreateIndex
CREATE INDEX "FishingCatch_caughtAt_idx" ON "FishingCatch"("caughtAt");

-- CreateIndex
CREATE INDEX "FishingCatch_createdAt_idx" ON "FishingCatch"("createdAt");

-- CreateIndex
CREATE INDEX "FishingCatch_userId_caughtAt_idx" ON "FishingCatch"("userId", "caughtAt");

-- CreateIndex
CREATE INDEX "FishingCatch_lakeId_caughtAt_idx" ON "FishingCatch"("lakeId", "caughtAt");

-- CreateIndex
CREATE INDEX "FishingCatch_isPublic_rankingStatus_idx" ON "FishingCatch"("isPublic", "rankingStatus");

-- CreateIndex
CREATE INDEX "FishingCatch_isPublic_rankingStatus_weight_idx" ON "FishingCatch"("isPublic", "rankingStatus", "weight");

-- CreateIndex
CREATE INDEX "FishingCatch_isPublic_rankingStatus_length_idx" ON "FishingCatch"("isPublic", "rankingStatus", "length");

-- CreateIndex
CREATE INDEX "FishingCatchReport_createdAt_idx" ON "FishingCatchReport"("createdAt");

-- CreateIndex
CREATE INDEX "FishingCatchReport_status_createdAt_idx" ON "FishingCatchReport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "FishingGear_userId_idx" ON "FishingGear"("userId");

-- CreateIndex
CREATE INDEX "FishingGear_category_idx" ON "FishingGear"("category");

-- CreateIndex
CREATE INDEX "FishingGear_status_idx" ON "FishingGear"("status");

-- CreateIndex
CREATE INDEX "FishingGear_createdAt_idx" ON "FishingGear"("createdAt");

-- CreateIndex
CREATE INDEX "FishingGear_userId_category_idx" ON "FishingGear"("userId", "category");

-- CreateIndex
CREATE INDEX "FishingGear_userId_status_idx" ON "FishingGear"("userId", "status");

-- CreateIndex
CREATE INDEX "FishingTrip_userId_idx" ON "FishingTrip"("userId");

-- CreateIndex
CREATE INDEX "FishingTrip_lakeId_idx" ON "FishingTrip"("lakeId");

-- CreateIndex
CREATE INDEX "FishingTrip_status_idx" ON "FishingTrip"("status");

-- CreateIndex
CREATE INDEX "FishingTrip_startsAt_idx" ON "FishingTrip"("startsAt");

-- CreateIndex
CREATE INDEX "FishingTrip_createdAt_idx" ON "FishingTrip"("createdAt");

-- CreateIndex
CREATE INDEX "FishingTrip_userId_status_idx" ON "FishingTrip"("userId", "status");

-- CreateIndex
CREATE INDEX "FishingTrip_userId_startsAt_idx" ON "FishingTrip"("userId", "startsAt");

-- CreateIndex
CREATE INDEX "FishingTrip_userId_status_startsAt_idx" ON "FishingTrip"("userId", "status", "startsAt");

-- CreateIndex
CREATE INDEX "Lake_voivodeship_idx" ON "Lake"("voivodeship");

-- CreateIndex
CREATE INDEX "Lake_city_idx" ON "Lake"("city");

-- CreateIndex
CREATE INDEX "Lake_ownerType_idx" ON "Lake"("ownerType");

-- CreateIndex
CREATE INDEX "Lake_fishingType_idx" ON "Lake"("fishingType");

-- CreateIndex
CREATE INDEX "Lake_createdAt_idx" ON "Lake"("createdAt");

-- CreateIndex
CREATE INDEX "Lake_ownerType_fishingType_idx" ON "Lake"("ownerType", "fishingType");

-- CreateIndex
CREATE INDEX "Lake_voivodeship_ownerType_idx" ON "Lake"("voivodeship", "ownerType");

-- CreateIndex
CREATE INDEX "Lake_voivodeship_fishingType_idx" ON "Lake"("voivodeship", "fishingType");

-- CreateIndex
CREATE INDEX "LakeCorrectionReport_lakeId_idx" ON "LakeCorrectionReport"("lakeId");

-- CreateIndex
CREATE INDEX "LakeCorrectionReport_userId_idx" ON "LakeCorrectionReport"("userId");

-- CreateIndex
CREATE INDEX "LakeCorrectionReport_status_idx" ON "LakeCorrectionReport"("status");

-- CreateIndex
CREATE INDEX "LakeCorrectionReport_createdAt_idx" ON "LakeCorrectionReport"("createdAt");

-- CreateIndex
CREATE INDEX "LakeCorrectionReport_status_createdAt_idx" ON "LakeCorrectionReport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "LakeImage_lakeId_idx" ON "LakeImage"("lakeId");

-- CreateIndex
CREATE INDEX "LakeImage_createdAt_idx" ON "LakeImage"("createdAt");

-- CreateIndex
CREATE INDEX "LakeSubmission_userId_idx" ON "LakeSubmission"("userId");

-- CreateIndex
CREATE INDEX "LakeSubmission_status_idx" ON "LakeSubmission"("status");

-- CreateIndex
CREATE INDEX "LakeSubmission_createdAt_idx" ON "LakeSubmission"("createdAt");

-- CreateIndex
CREATE INDEX "LakeSubmission_status_createdAt_idx" ON "LakeSubmission"("status", "createdAt");

-- CreateIndex
CREATE INDEX "LakeSubmission_voivodeship_idx" ON "LakeSubmission"("voivodeship");

-- CreateIndex
CREATE INDEX "LakeSubmissionImage_submissionId_idx" ON "LakeSubmissionImage"("submissionId");

-- CreateIndex
CREATE INDEX "LakeSubmissionImage_createdAt_idx" ON "LakeSubmissionImage"("createdAt");

-- CreateIndex
CREATE INDEX "PriceItem_lakeId_idx" ON "PriceItem"("lakeId");

-- CreateIndex
CREATE INDEX "Rating_lakeId_idx" ON "Rating"("lakeId");

-- CreateIndex
CREATE INDEX "Rating_createdAt_idx" ON "Rating"("createdAt");

-- CreateIndex
CREATE INDEX "Rule_lakeId_idx" ON "Rule"("lakeId");

-- CreateIndex
CREATE INDEX "TripChecklist_userId_idx" ON "TripChecklist"("userId");

-- CreateIndex
CREATE INDEX "TripChecklist_status_idx" ON "TripChecklist"("status");

-- CreateIndex
CREATE INDEX "TripChecklist_createdAt_idx" ON "TripChecklist"("createdAt");

-- CreateIndex
CREATE INDEX "TripChecklist_userId_status_idx" ON "TripChecklist"("userId", "status");

-- CreateIndex
CREATE INDEX "TripChecklistItem_checklistId_idx" ON "TripChecklistItem"("checklistId");

-- CreateIndex
CREATE INDEX "TripChecklistItem_category_idx" ON "TripChecklistItem"("category");

-- CreateIndex
CREATE INDEX "TripChecklistItem_isPacked_idx" ON "TripChecklistItem"("isPacked");

-- CreateIndex
CREATE INDEX "TripChecklistItem_gearId_idx" ON "TripChecklistItem"("gearId");

-- CreateIndex
CREATE INDEX "UserNotification_userId_idx" ON "UserNotification"("userId");

-- CreateIndex
CREATE INDEX "UserNotification_isRead_idx" ON "UserNotification"("isRead");

-- CreateIndex
CREATE INDEX "UserNotification_createdAt_idx" ON "UserNotification"("createdAt");

-- CreateIndex
CREATE INDEX "UserNotification_userId_isRead_idx" ON "UserNotification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "UserNotification_userId_createdAt_idx" ON "UserNotification"("userId", "createdAt");
