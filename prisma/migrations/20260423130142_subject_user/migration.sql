-- AlterTable: add user ownership + visibility to Subject
ALTER TABLE "Subject" ADD COLUMN "userId" TEXT;
ALTER TABLE "Subject" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Subject_themeId_isPublic_idx" ON "Subject"("themeId", "isPublic");
