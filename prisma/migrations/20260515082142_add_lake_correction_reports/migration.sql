-- CreateTable
CREATE TABLE "LakeCorrectionReport" (
    "id" TEXT NOT NULL,
    "lakeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LakeCorrectionReport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LakeCorrectionReport" ADD CONSTRAINT "LakeCorrectionReport_lakeId_fkey" FOREIGN KEY ("lakeId") REFERENCES "Lake"("id") ON DELETE CASCADE ON UPDATE CASCADE;
