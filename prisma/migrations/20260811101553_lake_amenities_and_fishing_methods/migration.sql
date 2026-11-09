-- AlterTable
ALTER TABLE "Lake" ADD COLUMN     "camperCaravan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "electricityHookup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fishingMethods" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "LakeSubmission" ADD COLUMN     "camperCaravan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "electricityHookup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fishingMethods" TEXT[] DEFAULT ARRAY[]::TEXT[];
