-- CreateTable
CREATE TABLE "FishingCatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fishName" TEXT NOT NULL,
    "weight" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "method" TEXT NOT NULL,
    "bait" TEXT,
    "caughtAt" TIMESTAMP(3) NOT NULL,
    "lakeId" TEXT,
    "lakeName" TEXT,
    "tripId" TEXT,
    "tripTitle" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FishingCatch_pkey" PRIMARY KEY ("id")
);
