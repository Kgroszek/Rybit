-- CreateTable
CREATE TABLE "LakeSpot" (
    "id" TEXT NOT NULL,
    "lakeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "description" TEXT,
    "maxPeople" INTEGER NOT NULL DEFAULT 2,
    "pricePerDay" DOUBLE PRECISION,
    "pricePerNight" DOUBLE PRECISION,
    "pricePer24h" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isReservableOnline" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LakeSpot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LakeReservation" (
    "id" TEXT NOT NULL,
    "lakeId" TEXT NOT NULL,
    "spotId" TEXT,
    "scope" TEXT NOT NULL DEFAULT 'spot',
    "type" TEXT NOT NULL DEFAULT 'reservation',
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "title" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "organizerName" TEXT,
    "organizerPhone" TEXT,
    "organizerEmail" TEXT,
    "peopleCount" INTEGER NOT NULL DEFAULT 1,
    "totalPrice" DOUBLE PRECISION,
    "depositAmount" DOUBLE PRECISION,
    "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
    "note" TEXT,
    "internalNote" TEXT,
    "isPublicEvent" BOOLEAN NOT NULL DEFAULT false,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LakeReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LakeBookingSettings" (
    "id" TEXT NOT NULL,
    "lakeId" TEXT NOT NULL,
    "isBookingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isOnlineBookingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "requiresOwnerConfirmation" BOOLEAN NOT NULL DEFAULT true,
    "defaultStartTime" TEXT NOT NULL DEFAULT '12:00',
    "defaultEndTime" TEXT NOT NULL DEFAULT '10:00',
    "minReservationHours" INTEGER,
    "maxReservationDays" INTEGER,
    "requiresDeposit" BOOLEAN NOT NULL DEFAULT false,
    "depositAmount" DOUBLE PRECISION,
    "bookingPhone" TEXT,
    "bookingEmail" TEXT,
    "bookingRules" TEXT,
    "confirmationMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LakeBookingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LakeSpot_lakeId_idx" ON "LakeSpot"("lakeId");

-- CreateIndex
CREATE INDEX "LakeSpot_slug_idx" ON "LakeSpot"("slug");

-- CreateIndex
CREATE INDEX "LakeSpot_isActive_idx" ON "LakeSpot"("isActive");

-- CreateIndex
CREATE INDEX "LakeSpot_sortOrder_idx" ON "LakeSpot"("sortOrder");

-- CreateIndex
CREATE INDEX "LakeSpot_lakeId_isActive_idx" ON "LakeSpot"("lakeId", "isActive");

-- CreateIndex
CREATE INDEX "LakeSpot_lakeId_sortOrder_idx" ON "LakeSpot"("lakeId", "sortOrder");

-- CreateIndex
CREATE INDEX "LakeReservation_lakeId_idx" ON "LakeReservation"("lakeId");

-- CreateIndex
CREATE INDEX "LakeReservation_spotId_idx" ON "LakeReservation"("spotId");

-- CreateIndex
CREATE INDEX "LakeReservation_scope_idx" ON "LakeReservation"("scope");

-- CreateIndex
CREATE INDEX "LakeReservation_type_idx" ON "LakeReservation"("type");

-- CreateIndex
CREATE INDEX "LakeReservation_status_idx" ON "LakeReservation"("status");

-- CreateIndex
CREATE INDEX "LakeReservation_startsAt_idx" ON "LakeReservation"("startsAt");

-- CreateIndex
CREATE INDEX "LakeReservation_endsAt_idx" ON "LakeReservation"("endsAt");

-- CreateIndex
CREATE INDEX "LakeReservation_createdAt_idx" ON "LakeReservation"("createdAt");

-- CreateIndex
CREATE INDEX "LakeReservation_lakeId_startsAt_idx" ON "LakeReservation"("lakeId", "startsAt");

-- CreateIndex
CREATE INDEX "LakeReservation_lakeId_endsAt_idx" ON "LakeReservation"("lakeId", "endsAt");

-- CreateIndex
CREATE INDEX "LakeReservation_lakeId_status_idx" ON "LakeReservation"("lakeId", "status");

-- CreateIndex
CREATE INDEX "LakeReservation_lakeId_scope_idx" ON "LakeReservation"("lakeId", "scope");

-- CreateIndex
CREATE INDEX "LakeReservation_lakeId_type_idx" ON "LakeReservation"("lakeId", "type");

-- CreateIndex
CREATE INDEX "LakeReservation_spotId_startsAt_endsAt_idx" ON "LakeReservation"("spotId", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "LakeReservation_lakeId_scope_startsAt_endsAt_idx" ON "LakeReservation"("lakeId", "scope", "startsAt", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "LakeBookingSettings_lakeId_key" ON "LakeBookingSettings"("lakeId");

-- CreateIndex
CREATE INDEX "LakeBookingSettings_isBookingEnabled_idx" ON "LakeBookingSettings"("isBookingEnabled");

-- CreateIndex
CREATE INDEX "LakeBookingSettings_isOnlineBookingEnabled_idx" ON "LakeBookingSettings"("isOnlineBookingEnabled");

-- AddForeignKey
ALTER TABLE "LakeSpot" ADD CONSTRAINT "LakeSpot_lakeId_fkey" FOREIGN KEY ("lakeId") REFERENCES "Lake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LakeReservation" ADD CONSTRAINT "LakeReservation_lakeId_fkey" FOREIGN KEY ("lakeId") REFERENCES "Lake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LakeReservation" ADD CONSTRAINT "LakeReservation_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "LakeSpot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LakeBookingSettings" ADD CONSTRAINT "LakeBookingSettings_lakeId_fkey" FOREIGN KEY ("lakeId") REFERENCES "Lake"("id") ON DELETE CASCADE ON UPDATE CASCADE;
