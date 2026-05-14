-- CreateTable
CREATE TABLE "FishingTrip" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "lakeId" TEXT,
    "lakeName" TEXT,
    "tripType" TEXT NOT NULL DEFAULT 'custom',
    "status" TEXT NOT NULL DEFAULT 'planned',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "checklistId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FishingTrip_pkey" PRIMARY KEY ("id")
);
