-- CreateTable
CREATE TABLE "LakeComment" (
    "id" TEXT NOT NULL,
    "lakeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'visible',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LakeComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LakeCommentReport" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LakeCommentReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LakeComment_lakeId_idx" ON "LakeComment"("lakeId");

-- CreateIndex
CREATE INDEX "LakeComment_userId_idx" ON "LakeComment"("userId");

-- CreateIndex
CREATE INDEX "LakeComment_status_idx" ON "LakeComment"("status");

-- CreateIndex
CREATE INDEX "LakeComment_createdAt_idx" ON "LakeComment"("createdAt");

-- CreateIndex
CREATE INDEX "LakeComment_lakeId_status_createdAt_idx" ON "LakeComment"("lakeId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "LakeCommentReport_commentId_idx" ON "LakeCommentReport"("commentId");

-- CreateIndex
CREATE INDEX "LakeCommentReport_userId_idx" ON "LakeCommentReport"("userId");

-- CreateIndex
CREATE INDEX "LakeCommentReport_status_idx" ON "LakeCommentReport"("status");

-- CreateIndex
CREATE INDEX "LakeCommentReport_createdAt_idx" ON "LakeCommentReport"("createdAt");

-- CreateIndex
CREATE INDEX "LakeCommentReport_status_createdAt_idx" ON "LakeCommentReport"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LakeCommentReport_commentId_userId_key" ON "LakeCommentReport"("commentId", "userId");

-- AddForeignKey
ALTER TABLE "LakeComment" ADD CONSTRAINT "LakeComment_lakeId_fkey" FOREIGN KEY ("lakeId") REFERENCES "Lake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LakeCommentReport" ADD CONSTRAINT "LakeCommentReport_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "LakeComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
