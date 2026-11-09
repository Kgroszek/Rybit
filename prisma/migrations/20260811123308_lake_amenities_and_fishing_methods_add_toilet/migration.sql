-- AlterTable
ALTER TABLE "Lake" ADD COLUMN     "sanitaryFacilities" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "LakeSubmission" ADD COLUMN     "sanitaryFacilities" BOOLEAN NOT NULL DEFAULT false;
