-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "editedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "editedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "EditHistory" (
    "id" SERIAL NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "oldContent" TEXT NOT NULL,
    "editedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EditHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EditHistory_entityType_entityId_idx" ON "EditHistory"("entityType", "entityId");
