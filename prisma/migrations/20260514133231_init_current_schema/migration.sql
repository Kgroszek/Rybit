-- AlterTable
ALTER TABLE "Lake" ADD COLUMN     "cardPayment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "coveredSpots" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gearRental" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "playground" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priceListText" TEXT,
ADD COLUMN     "priceListUrl" TEXT,
ADD COLUMN     "rulesText" TEXT,
ADD COLUMN     "rulesUrl" TEXT,
ADD COLUMN     "shelter" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "LakeImage" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "imagePath" TEXT;

-- AlterTable
ALTER TABLE "LakeSubmission" ADD COLUMN     "cardPayment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "coveredSpots" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gearRental" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "playground" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priceListText" TEXT,
ADD COLUMN     "priceListUrl" TEXT,
ADD COLUMN     "rulesText" TEXT,
ADD COLUMN     "rulesUrl" TEXT,
ADD COLUMN     "shelter" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "LakeSubmissionImage" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LakeSubmissionImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LakeSubmissionImage" ADD CONSTRAINT "LakeSubmissionImage_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "LakeSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
