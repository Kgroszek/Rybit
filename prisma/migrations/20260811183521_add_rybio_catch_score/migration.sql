-- AlterTable
ALTER TABLE "FishingCatch" ADD COLUMN     "catchScore" INTEGER,
ADD COLUMN     "catchScoreSource" TEXT,
ADD COLUMN     "catchScoreTier" TEXT,
ADD COLUMN     "catchScoreVersion" INTEGER NOT NULL DEFAULT 1;
